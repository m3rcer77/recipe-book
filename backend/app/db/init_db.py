"""Создание таблиц: python -m app.db.init_db"""
from app import models  # noqa: F401  (регистрирует модели в Base.metadata)
from app.db.base import Base
from app.db.session import engine


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    print("Таблицы созданы:", ", ".join(Base.metadata.tables))


if __name__ == "__main__":
    init_db()
