"""Регистрация, вход, выдача, обновление и отзыв токенов."""
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_dummy_password,
    verify_password,
)
from app.models import RefreshToken, User
from app.schemas import RegisterRequest, TokenPair


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _as_utc(value: datetime) -> datetime:
    """SQLite возвращает даты без часового пояса, PostgreSQL — с ним. Приводим к одному виду."""
    return value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)


def register_user(db: Session, data: RegisterRequest) -> User:
    if db.scalar(select(User.id).where(User.email == data.email)) is not None:
        raise ConflictError("Пользователь с таким email уже зарегистрирован")
    if db.scalar(select(User.id).where(func.lower(User.username) == func.lower(data.username))) is not None:
        raise ConflictError(f"Имя пользователя «{data.username}» уже занято")

    user = User(username=data.username, email=data.email, password_hash=hash_password(data.password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError:  # гонка: два одинаковых запроса одновременно
        db.rollback()
        raise ConflictError("Пользователь с такими данными уже существует")
    return user


def authenticate(db: Session, email: str, password: str) -> User:
    """Проверяет email и пароль. Сообщение об ошибке одинаково для «нет такого email» и «неверный пароль»."""
    user = db.scalar(select(User).where(User.email == email))
    if user is None:
        verify_dummy_password(password)
        raise UnauthorizedError("Неверный email или пароль")
    if not verify_password(password, user.password_hash):
        raise UnauthorizedError("Неверный email или пароль")
    return user


def issue_tokens(db: Session, user: User) -> TokenPair:
    """Создаёт пару токенов; хеш refresh-токена сохраняется в БД."""
    access_token, expires_in = create_access_token(user.id)
    refresh_token, refresh_hash = generate_refresh_token()
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=refresh_hash,
            expires_at=_now() + timedelta(days=get_settings().REFRESH_TOKEN_EXPIRE_DAYS),
        )
    )
    db.commit()
    return TokenPair(access_token=access_token, refresh_token=refresh_token, expires_in=expires_in)


def refresh_tokens(db: Session, raw_refresh_token: str) -> TokenPair:
    """Обмен действующего refresh-токена на новую пару. Старый refresh-токен сразу отзывается (ротация)."""
    record = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_refresh_token(raw_refresh_token)))
    if record is None:
        raise UnauthorizedError("Недействительный refresh-токен")
    if record.revoked_at is not None:
        raise UnauthorizedError("Refresh-токен отозван")
    if _as_utc(record.expires_at) <= _now():
        raise UnauthorizedError("Срок действия refresh-токена истёк")

    user = db.get(User, record.user_id)
    if user is None:
        raise UnauthorizedError("Пользователь не найден")

    record.revoked_at = _now()
    return issue_tokens(db, user)  # один commit: старый токен отозван, новый создан


def revoke_refresh_token(db: Session, raw_refresh_token: str) -> None:
    """Выход из приложения: токен текущей сессии больше нельзя обменять на access-токен. Повторный вызов безопасен."""
    record = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == hash_refresh_token(raw_refresh_token)))
    if record is not None and record.revoked_at is None:
        record.revoked_at = _now()
        db.commit()
