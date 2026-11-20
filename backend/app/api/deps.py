"""Зависимости FastAPI для защиты маршрутов."""
import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import User

# Схема «Authorization: Bearer <access-токен>». auto_error=False: ошибку формируем сами в едином формате.
bearer_scheme = HTTPBearer(auto_error=False, description="Access-токен, полученный в /auth/login")


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Текущий пользователь по access-токену. Нет токена, он неверный или просрочен — 401."""
    if credentials is None:
        raise UnauthorizedError("Требуется авторизация")
    try:
        user_id = decode_access_token(credentials.credentials)
    except jwt.ExpiredSignatureError:
        raise UnauthorizedError("Срок действия токена истёк")
    except jwt.InvalidTokenError:
        raise UnauthorizedError("Недействительный токен")
    user = db.get(User, user_id)
    if user is None:
        raise UnauthorizedError("Пользователь не найден")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise ForbiddenError("Требуются права администратора")
    return user


def ensure_self(user_id: int, user: User = Depends(get_current_user)) -> User:
    """Доступ к данным пользователя {user_id} есть только у него самого. Иначе — 403."""
    if user.id != user_id:
        raise ForbiddenError("Нет доступа к данным другого пользователя")
    return user
