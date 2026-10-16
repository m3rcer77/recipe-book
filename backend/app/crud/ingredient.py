from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Ingredient


def list_ingredients(db: Session, search: str | None = None) -> list[Ingredient]:
    stmt = select(Ingredient).order_by(Ingredient.name)
    if search:
        stmt = stmt.where(Ingredient.name.ilike(f"%{search}%"))
    return list(db.scalars(stmt))


def get_or_create(db: Session, name: str) -> Ingredient:
    """Найти ингредиент по названию (без учёта регистра) или создать новый."""
    ingredient = db.scalar(select(Ingredient).where(func.lower(Ingredient.name) == func.lower(name)))
    if ingredient is None:
        ingredient = Ingredient(name=name)
        db.add(ingredient)
        db.flush()
    return ingredient
