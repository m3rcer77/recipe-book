"""Конфигурация приложения: все параметры берутся из переменных окружения / .env."""
from functools import lru_cache

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
