"""Пароли и токены.

* Пароли хранятся только в виде хеша Argon2id (специализированный алгоритм для паролей:
  медленный, с солью и параметрами в самой строке хеша).
* Access-токен — JWT (HS256) с коротким сроком жизни.
* Refresh-токен — случайная непрозрачная строка. В БД хранится только её SHA-256-хеш,
  поэтому утечка таблицы не даёт использовать токены.
"""
import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from app.core.config import get_settings

_hasher = PasswordHasher()
# Для ответа на «неизвестный email» тратим столько же времени, сколько на проверку настоящего хеша
_DUMMY_HASH = _hasher.hash("timing-equalizer-password-1")

ACCESS_TOKEN_TYPE = "access"


# ---------- пароли ----------
def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError, VerificationError):
        return False


def verify_dummy_password(password: str) -> None:
    """Имитация проверки пароля, когда пользователь не найден (защита от определения существования email по времени ответа)."""
    verify_password(password, _DUMMY_HASH)


# ---------- access-токен (JWT) ----------
def create_access_token(user_id: int) -> tuple[str, int]:
    """Возвращает (токен, срок жизни в секундах)."""
    settings = get_settings()
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "type": ACCESS_TOKEN_TYPE,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token, settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60


def decode_access_token(token: str) -> int:
    """Проверяет подпись, срок действия и тип токена; возвращает id пользователя.

    Бросает jwt.ExpiredSignatureError (токен просрочен) или jwt.InvalidTokenError (любая другая проблема).
    """
    settings = get_settings()
    payload = jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
        options={"require": ["exp", "sub", "iat"]},
    )
    if payload.get("type") != ACCESS_TOKEN_TYPE:
        raise jwt.InvalidTokenError("Неверный тип токена")
    try:
        return int(payload["sub"])
    except (TypeError, ValueError) as exc:
        raise jwt.InvalidTokenError("Неверный субъект токена") from exc


# ---------- refresh-токен ----------
def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def generate_refresh_token() -> tuple[str, str]:
    """Возвращает (токен для клиента, его хеш для БД)."""
    token = secrets.token_urlsafe(48)
    return token, hash_refresh_token(token)
