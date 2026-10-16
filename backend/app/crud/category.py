from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import BadRequestError, ConflictError, NotFoundError
from app.models import Category, Recipe
from app.schemas import CategoryCreate, CategoryUpdate


def list_categories(db: Session) -> list[Category]:
    return list(db.scalars(select(Category).order_by(Category.id)))


def get_category(db: Session, category_id: int) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise NotFoundError(f"Категория с id={category_id} не найдена")
    return category


def _ensure_name_free(db: Session, name: str, exclude_id: int | None = None) -> None:
    stmt = select(Category.id).where(func.lower(Category.name) == func.lower(name))
    if exclude_id is not None:
        stmt = stmt.where(Category.id != exclude_id)
    if db.scalar(stmt) is not None:
        raise ConflictError(f"Категория «{name}» уже существует")


def create_category(db: Session, data: CategoryCreate) -> Category:
    _ensure_name_free(db, data.name)
    category = Category(**data.model_dump())
    db.add(category)
    db.commit()
    return category


def update_category(db: Session, category_id: int, data: CategoryUpdate) -> Category:
    category = get_category(db, category_id)
    changes = data.model_dump(exclude_unset=True)
    if "name" in changes:
        if changes["name"] is None:
            raise BadRequestError("Название категории не может быть null")
        _ensure_name_free(db, changes["name"], exclude_id=category_id)
    for field, value in changes.items():
        setattr(category, field, value)
    db.commit()
    return category


def delete_category(db: Session, category_id: int) -> None:
    category = get_category(db, category_id)
    used = db.scalar(select(func.count()).select_from(Recipe).where(Recipe.category_id == category_id))
    if used:
        raise ConflictError(f"Нельзя удалить категорию: в ней {used} рецепт(ов)")
    db.delete(category)
    db.commit()
