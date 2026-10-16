from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator

from app.schemas.category import CategoryRead

Difficulty = Literal["Легко", "Средне", "Сложно"]
Title = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
NonEmpty = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class IngredientIn(BaseModel):
    """Ингредиент в рецепте: название (создаётся в справочнике автоматически) и количество."""
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
    quantity: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50)]


class IngredientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ingredient_id: int
    name: str
    quantity: str


def _check_ingredients(items):
    if items is not None:
        names = [i.name.lower() for i in items]
        if len(names) != len(set(names)):
            raise ValueError("Ингредиенты в рецепте не должны повторяться")
    return items


def _check_steps(items):
    if items is not None and any(not s.strip() for s in items):
        raise ValueError("Шаги приготовления не могут быть пустыми")
    return [s.strip() for s in items] if items is not None else None


class RecipeCreate(BaseModel):
    title: Title
    description: NonEmpty
    emoji: Annotated[str, StringConstraints(min_length=1, max_length=16)] = "🍽️"
    cooking_time_minutes: int = Field(gt=0, le=10000)
    difficulty: Difficulty = "Легко"
    calories: int | None = Field(default=None, ge=0, le=100000)
    category_id: int
    ingredients: list[IngredientIn] = []
    steps: list[str] = []

    @field_validator("ingredients")
    @classmethod
    def no_duplicate_ingredients(cls, value):
        return _check_ingredients(value)

    @field_validator("steps")
    @classmethod
    def steps_not_blank(cls, value):
        return _check_steps(value)


class RecipeUpdate(BaseModel):
    """Все поля необязательны. ingredients и steps, если переданы, заменяются целиком."""
    title: Title | None = None
    description: NonEmpty | None = None
    emoji: Annotated[str, StringConstraints(min_length=1, max_length=16)] | None = None
    cooking_time_minutes: int | None = Field(default=None, gt=0, le=10000)
    difficulty: Difficulty | None = None
    calories: int | None = Field(default=None, ge=0, le=100000)
    category_id: int | None = None
    ingredients: list[IngredientIn] | None = None
    steps: list[str] | None = None

    @field_validator("ingredients")
    @classmethod
    def no_duplicate_ingredients(cls, value):
        return _check_ingredients(value)

    @field_validator("steps")
    @classmethod
    def steps_not_blank(cls, value):
        return _check_steps(value)


class RecipeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    emoji: str
    cooking_time_minutes: int
    difficulty: str
    calories: int | None = None
    created_at: datetime
    category: CategoryRead
    ingredients: list[IngredientOut] = []
    steps: list[str] = []

    @field_validator("steps", mode="before")
    @classmethod
    def steps_to_text(cls, value):
        return [s.text if hasattr(s, "text") else s for s in value]
