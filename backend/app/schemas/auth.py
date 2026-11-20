from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints, field_validator

from app.schemas.user import UserRead, Username

# Простая проверка формата email: что-то@что-то.домен (без внешних зависимостей)
EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

Email = Annotated[
    str,
    StringConstraints(strip_whitespace=True, to_lower=True, max_length=254, pattern=EMAIL_PATTERN),
]


class RegisterRequest(BaseModel):
    username: Username
    email: Email
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def password_has_letters_and_digits(cls, value: str) -> str:
        if not any(c.isalpha() for c in value) or not any(c.isdigit() for c in value):
            raise ValueError("Пароль должен содержать буквы и цифры")
        return value


class LoginRequest(BaseModel):
    email: Annotated[str, StringConstraints(strip_whitespace=True, to_lower=True, min_length=1, max_length=254)]
    password: str = Field(min_length=1, max_length=128)


class RefreshRequest(BaseModel):
    """Тело запросов /auth/refresh и /auth/logout."""
    refresh_token: str = Field(min_length=1, max_length=512)


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    #: срок жизни access-токена в секундах
    expires_in: int


class AuthResponse(TokenPair):
    user: UserRead
