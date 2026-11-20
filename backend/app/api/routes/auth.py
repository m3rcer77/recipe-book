from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.crud import auth as crud
from app.db.session import get_db
from app.models import User
from app.schemas import AuthResponse, LoginRequest, RefreshRequest, RegisterRequest, TokenPair, UserRead

router = APIRouter(prefix="/auth", tags=["Аутентификация"])


def _auth_response(db: Session, user: User) -> dict:
    tokens = crud.issue_tokens(db, user)
    return {**tokens.model_dump(), "user": user}


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """Регистрация. Сразу возвращает токены и профиль — отдельный вход не нужен."""
    user = crud.register_user(db, data)
    return _auth_response(db, user)


@router.post("/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = crud.authenticate(db, data.email, data.password)
    return _auth_response(db, user)


@router.post("/refresh", response_model=TokenPair)
def refresh(data: RefreshRequest, db: Session = Depends(get_db)):
    """Новая пара токенов по действующему refresh-токену (старый refresh-токен перестаёт работать)."""
    return crud.refresh_tokens(db, data.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(data: RefreshRequest, db: Session = Depends(get_db)):
    """Выход: refresh-токен текущей сессии отзывается и больше не даёт новых access-токенов."""
    crud.revoke_refresh_token(db, data.refresh_token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=UserRead)
def me(user: User = Depends(get_current_user)):
    """Текущий пользователь (приватный маршрут)."""
    return user
