"""Конфигурация приложения: все параметры берутся из переменных окружения / .env."""
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    POSTGRES_USER: str = "recipe_user"
    POSTGRES_PASSWORD: str = "change_me"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "recipe_book"

    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    # Секрет подписи JWT: обязателен, значения по умолчанию нет — чтобы не запустить приложение с «общим» ключом
    JWT_SECRET_KEY: str = Field(min_length=32)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=15, gt=0)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, gt=0)

    @property
    def database_url(self) -> URL:
        # URL.create сам экранирует спецсимволы в пароле
        return URL.create(
            "postgresql+psycopg2",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_HOST,
            port=self.POSTGRES_PORT,
            database=self.POSTGRES_DB,
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
