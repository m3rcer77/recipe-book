from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.crud import ingredient as crud
from app.db.session import get_db
from app.schemas import IngredientRead

router = APIRouter(prefix="/ingredients", tags=["Ингредиенты"])


@router.get("", response_model=list[IngredientRead])
def list_ingredients(search: str | None = Query(None, description="Поиск по названию"),
                     db: Session = Depends(get_db)):
    """Справочник ингредиентов. Новые ингредиенты создаются автоматически при создании рецепта."""
    return crud.list_ingredients(db, search)
