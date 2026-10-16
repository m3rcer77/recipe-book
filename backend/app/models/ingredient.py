from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Ingredient(Base):
    """Справочник ингредиентов (Томаты, Мука, ...)."""
    __tablename__ = "ingredients"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)

    recipe_links: Mapped[list["RecipeIngredient"]] = relationship(back_populates="ingredient")  # noqa: F821
