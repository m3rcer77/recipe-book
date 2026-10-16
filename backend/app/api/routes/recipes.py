from typing import Literal

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.crud import recipe as crud
from app.db.session import get_db
from app.schemas import RecipeCreate, RecipeRead, RecipeUpdate

router = APIRouter(prefix="/recipes", tags=["Рецепты"])


@router.get("", response_model=list[RecipeRead])
def list_recipes(
    category_id: int | None = Query(None, description="Фильтр по категории"),
    difficulty: Literal["Легко", "Средне", "Сложно"] | None = Query(None, description="Фильтр по сложности"),
    search: str | None = Query(None, description="Поиск по названию и описанию"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return crud.list_recipes(db, category_id, search, difficulty, skip, limit)


@router.post("", response_model=RecipeRead, status_code=status.HTTP_201_CREATED)
def create_recipe(data: RecipeCreate, db: Session = Depends(get_db)):
    return crud.create_recipe(db, data)


@router.get("/{recipe_id}", response_model=RecipeRead)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    return crud.get_recipe(db, recipe_id)


@router.patch("/{recipe_id}", response_model=RecipeRead)
def update_recipe(recipe_id: int, data: RecipeUpdate, db: Session = Depends(get_db)):
    return crud.update_recipe(db, recipe_id, data)


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    crud.delete_recipe(db, recipe_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
