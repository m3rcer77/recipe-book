from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import ensure_self
from app.crud import user as crud
from app.db.session import get_db
from app.models import User
from app.schemas import RecipeRead, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["Пользователи и избранное"])
# Все маршруты приватные: пользователь работает только со своими данными (ensure_self → 401 / 403).


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, user: User = Depends(ensure_self), db: Session = Depends(get_db)):
    return crud.get_user(db, user_id)


@router.patch("/{user_id}", response_model=UserRead)
def update_user(user_id: int, data: UserUpdate, user: User = Depends(ensure_self), db: Session = Depends(get_db)):
    return crud.update_user(db, user_id, data)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, user: User = Depends(ensure_self), db: Session = Depends(get_db)):
    crud.delete_user(db, user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{user_id}/favorites", response_model=list[RecipeRead])
def list_favorites(user_id: int, user: User = Depends(ensure_self), db: Session = Depends(get_db)):
    return crud.list_favorites(db, user_id)


@router.put("/{user_id}/favorites/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def add_favorite(user_id: int, recipe_id: int, user: User = Depends(ensure_self), db: Session = Depends(get_db)):
    crud.add_favorite(db, user_id, recipe_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/{user_id}/favorites/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(user_id: int, recipe_id: int, user: User = Depends(ensure_self), db: Session = Depends(get_db)):
    crud.remove_favorite(db, user_id, recipe_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
