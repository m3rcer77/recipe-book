from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.crud import user as crud
from app.db.session import get_db
from app.schemas import RecipeRead, UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["Пользователи и избранное"])


@router.get("", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)):
    return crud.list_users(db)


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, data)


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, db: Session = Depends(get_db)):
    return crud.get_user(db, user_id)


@router.patch("/{user_id}", response_model=UserRead)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    return crud.update_user(db, user_id, data)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    crud.delete_user(db, user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{user_id}/favorites", response_model=list[RecipeRead])
def list_favorites(user_id: int, db: Session = Depends(get_db)):
    return crud.list_favorites(db, user_id)


@router.put("/{user_id}/favorites/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def add_favorite(user_id: int, recipe_id: int, db: Session = Depends(get_db)):
    crud.add_favorite(db, user_id, recipe_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/{user_id}/favorites/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(user_id: int, recipe_id: int, db: Session = Depends(get_db)):
    crud.remove_favorite(db, user_id, recipe_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
