from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.exceptions import BadRequestError, NotFoundError
from app.crud import ingredient as ingredient_crud
from app.models import Category, Recipe, RecipeIngredient, RecipeStep
from app.schemas import RecipeCreate, RecipeUpdate
from app.schemas.recipe import IngredientIn

LOAD_OPTIONS = (
    joinedload(Recipe.category),
    selectinload(Recipe.ingredients).joinedload(RecipeIngredient.ingredient),
    selectinload(Recipe.steps),
)


def list_recipes(
    db: Session,
    category_id: int | None = None,
    search: str | None = None,
    difficulty: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[Recipe]:
    stmt = select(Recipe).options(*LOAD_OPTIONS).order_by(Recipe.id).offset(skip).limit(limit)
    if category_id is not None:
        stmt = stmt.where(Recipe.category_id == category_id)
    if difficulty:
        stmt = stmt.where(Recipe.difficulty == difficulty)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(or_(Recipe.title.ilike(pattern), Recipe.description.ilike(pattern)))
    return list(db.scalars(stmt).unique())


def get_recipe(db: Session, recipe_id: int) -> Recipe:
    recipe = db.scalars(select(Recipe).options(*LOAD_OPTIONS).where(Recipe.id == recipe_id)).unique().first()
    if recipe is None:
        raise NotFoundError(f"Рецепт с id={recipe_id} не найден")
    return recipe


def _check_category(db: Session, category_id: int) -> None:
    if db.get(Category, category_id) is None:
        raise BadRequestError(f"Категория с id={category_id} не существует")


def _build_ingredients(db: Session, items: list[IngredientIn]) -> list[RecipeIngredient]:
    # сначала находим/создаём все ингредиенты (с flush), и только потом создаём связи
    found = [ingredient_crud.get_or_create(db, i.name) for i in items]
    return [RecipeIngredient(ingredient=ing, quantity=i.quantity) for ing, i in zip(found, items)]


def _build_steps(steps: list[str]) -> list[RecipeStep]:
    return [RecipeStep(position=n, text=text) for n, text in enumerate(steps, start=1)]


def create_recipe(db: Session, data: RecipeCreate) -> Recipe:
    _check_category(db, data.category_id)
    recipe = Recipe(**data.model_dump(exclude={"ingredients", "steps"}))
    recipe.ingredients = _build_ingredients(db, data.ingredients)
    recipe.steps = _build_steps(data.steps)
    db.add(recipe)
    db.commit()
    db.expire_all()
    return get_recipe(db, recipe.id)


def update_recipe(db: Session, recipe_id: int, data: RecipeUpdate) -> Recipe:
    recipe = get_recipe(db, recipe_id)
    changes = data.model_dump(exclude_unset=True, exclude={"ingredients", "steps"})

    for required in ("title", "description", "emoji", "cooking_time_minutes", "difficulty", "category_id"):
        if required in changes and changes[required] is None:
            raise BadRequestError(f"Поле «{required}» не может быть null")
    if "category_id" in changes:
        _check_category(db, changes["category_id"])

    if "ingredients" in data.model_fields_set:
        if data.ingredients is None:
            raise BadRequestError("Поле «ingredients» не может быть null")
        recipe.ingredients.clear()
        db.flush()  # удалить старые связи до вставки новых
        recipe.ingredients = _build_ingredients(db, data.ingredients)
    if "steps" in data.model_fields_set:
        if data.steps is None:
            raise BadRequestError("Поле «steps» не может быть null")
        recipe.steps.clear()
        db.flush()
        recipe.steps = _build_steps(data.steps)

    for field, value in changes.items():
        setattr(recipe, field, value)
    db.commit()
    db.expire_all()
    return get_recipe(db, recipe_id)


def delete_recipe(db: Session, recipe_id: int) -> None:
    recipe = get_recipe(db, recipe_id)
    db.delete(recipe)  # ингредиенты, шаги и записи избранного удаляются каскадом
    db.commit()
