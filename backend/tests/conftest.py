"""Тесты работают на SQLite в памяти — PostgreSQL для них не нужен."""
import os

# Секрет для тестов задаётся ДО импорта приложения и не зависит от вашего .env
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-pytest-only-0123456789abcdef")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "15")
os.environ.setdefault("REFRESH_TOKEN_EXPIRE_DAYS", "7")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine, event  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app import models  # noqa: E402,F401
from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
from app.main import app  # noqa: E402
from tests.helpers import make_admin, register  # noqa: E402


@pytest.fixture()
def engine():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)

    @event.listens_for(engine, "connect")
    def _sqlite_setup(dbapi_conn, _):
        dbapi_conn.execute("PRAGMA foreign_keys=ON")
        # встроенный lower() в SQLite не понимает кириллицу — подменяем, как в PostgreSQL
        dbapi_conn.create_function("lower", 1, lambda s: s.lower() if isinstance(s, str) else s)

    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)


@pytest.fixture()
def client(engine):
    Session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def override_get_db():
        db = Session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def db_session(engine):
    """Прямой доступ к БД из теста (проверить хеш, подправить срок токена, выдать права администратора)."""
    Session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with Session() as session:
        yield session


@pytest.fixture()
def user(client):
    """Обычный пользователь Anna: словарь с токенами и профилем."""
    return register(client, "Anna", "anna@example.com")


@pytest.fixture()
def other(client):
    """Второй обычный пользователь Boris."""
    return register(client, "Boris", "boris@example.com")


@pytest.fixture()
def admin(client, db_session):
    tokens = register(client, "Admin", "admin@example.com")
    make_admin(db_session, tokens["user"]["id"])
    return tokens
