import hashlib
import os
from datetime import datetime, timedelta, timezone

import jwt
from sqlalchemy import select

from app.models import RefreshToken, User
from tests.helpers import PASSWORD, auth, register


def _secret() -> str:
    return os.environ["JWT_SECRET_KEY"]


# ---------- регистрация ----------
def test_register_returns_tokens_and_profile(client):
    r = client.post("/auth/register", json={"username": "Anna", "email": " Anna@Example.com ", "password": PASSWORD})
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["token_type"] == "bearer" and body["access_token"] and body["refresh_token"]
    assert body["expires_in"] == 15 * 60
    assert body["user"]["email"] == "anna@example.com"  # email нормализуется
    assert body["user"]["is_admin"] is False
    assert set(body["user"]) == {"id", "username", "email", "bio", "is_admin", "favorites_count"}  # хеша пароля нет


def test_password_is_stored_only_as_argon2_hash(client, db_session):
    register(client)
    stored = db_session.scalar(select(User).where(User.email == "anna@example.com"))
    assert stored.password_hash.startswith("$argon2")
    assert PASSWORD not in stored.password_hash


def test_register_duplicate_email_409(client):
    register(client)
    r = client.post("/auth/register", json={"username": "Other", "email": "ANNA@example.com", "password": PASSWORD})
    assert r.status_code == 409


def test_register_duplicate_username_409(client):
    register(client)
    r = client.post("/auth/register", json={"username": "anna", "email": "new@example.com", "password": PASSWORD})
    assert r.status_code == 409


def test_register_validation_422(client):
    base = {"username": "Anna", "email": "anna@example.com", "password": PASSWORD}
    for bad in (
        {"password": "short1"},          # короче 8 символов
        {"password": "onlyletters"},     # нет цифр
        {"password": "12345678"},        # нет букв
        {"email": "not-an-email"},
        {"username": "A"},
    ):
        r = client.post("/auth/register", json={**base, **bad})
        assert r.status_code == 422, (bad, r.text)


# ---------- вход ----------
def test_login_success(client):
    register(client)
    r = client.post("/auth/login", json={"email": "Anna@example.com", "password": PASSWORD})
    assert r.status_code == 200, r.text
    assert r.json()["user"]["username"] == "Anna"


def test_login_wrong_password_and_unknown_email_look_the_same(client):
    register(client)
    wrong = client.post("/auth/login", json={"email": "anna@example.com", "password": "Wrong12345"})
    unknown = client.post("/auth/login", json={"email": "nobody@example.com", "password": PASSWORD})
    assert wrong.status_code == unknown.status_code == 401
    assert wrong.json() == unknown.json()  # не раскрываем, существует ли такой email
    assert wrong.headers["www-authenticate"] == "Bearer"


def test_access_token_is_jwt_with_expiry(client):
    tokens = register(client)
    payload = jwt.decode(tokens["access_token"], _secret(), algorithms=["HS256"])
    assert payload["sub"] == str(tokens["user"]["id"]) and payload["type"] == "access"
    assert payload["exp"] - payload["iat"] == 15 * 60


def test_refresh_token_is_stored_hashed_with_expiry(client, db_session):
    tokens = register(client)
    record = db_session.scalar(select(RefreshToken))
    assert record.token_hash != tokens["refresh_token"]
    assert record.token_hash == hashlib.sha256(tokens["refresh_token"].encode()).hexdigest()
    expires = record.expires_at if record.expires_at.tzinfo else record.expires_at.replace(tzinfo=timezone.utc)
    assert timedelta(days=6, hours=23) < expires - datetime.now(timezone.utc) <= timedelta(days=7)


# ---------- текущий пользователь ----------
def test_me_with_valid_token(client, user):
    r = client.get("/auth/me", headers=auth(user))
    assert r.status_code == 200 and r.json()["email"] == "anna@example.com"


def test_me_without_token_401(client):
    r = client.get("/auth/me")
    assert r.status_code == 401
    assert r.headers["www-authenticate"] == "Bearer"


def test_me_with_garbage_token_401(client):
    r = client.get("/auth/me", headers={"Authorization": "Bearer not.a.jwt"})
    assert r.status_code == 401


def test_me_with_expired_token_401(client, user):
    now = datetime.now(timezone.utc)
    expired = jwt.encode(
        {"sub": str(user["user"]["id"]), "type": "access",
         "iat": int((now - timedelta(hours=1)).timestamp()), "exp": int((now - timedelta(minutes=1)).timestamp())},
        _secret(), algorithm="HS256",
    )
    r = client.get("/auth/me", headers={"Authorization": f"Bearer {expired}"})
    assert r.status_code == 401
    assert "истёк" in r.json()["detail"]


def test_me_with_token_signed_by_someone_else_401(client, user):
    now = datetime.now(timezone.utc)
    forged = jwt.encode(
        {"sub": str(user["user"]["id"]), "type": "access",
         "iat": int(now.timestamp()), "exp": int((now + timedelta(minutes=5)).timestamp())},
        "another-secret-key-another-secret-key-123456", algorithm="HS256",
    )
    assert client.get("/auth/me", headers={"Authorization": f"Bearer {forged}"}).status_code == 401


def test_refresh_token_cannot_be_used_as_access_token(client, user):
    r = client.get("/auth/me", headers={"Authorization": f"Bearer {user['refresh_token']}"})
    assert r.status_code == 401


def test_token_of_deleted_user_401(client, user):
    assert client.delete(f"/users/{user['user']['id']}", headers=auth(user)).status_code == 204
    assert client.get("/auth/me", headers=auth(user)).status_code == 401


# ---------- обновление токенов ----------
def test_refresh_issues_new_pair_and_rotates(client, user):
    r = client.post("/auth/refresh", json={"refresh_token": user["refresh_token"]})
    assert r.status_code == 200, r.text
    new = r.json()
    assert new["refresh_token"] != user["refresh_token"]
    assert client.get("/auth/me", headers=auth(new)).status_code == 200

    # старый refresh-токен одноразовый: повторное использование отклоняется
    again = client.post("/auth/refresh", json={"refresh_token": user["refresh_token"]})
    assert again.status_code == 401
    assert "отозван" in again.json()["detail"]

    # а новый работает
    assert client.post("/auth/refresh", json={"refresh_token": new["refresh_token"]}).status_code == 200


def test_refresh_with_unknown_token_401(client):
    r = client.post("/auth/refresh", json={"refresh_token": "definitely-not-issued"})
    assert r.status_code == 401


def test_refresh_with_access_token_401(client, user):
    r = client.post("/auth/refresh", json={"refresh_token": user["access_token"]})
    assert r.status_code == 401


def test_refresh_with_expired_token_401(client, user, db_session):
    record = db_session.scalar(select(RefreshToken))
    record.expires_at = datetime.now(timezone.utc) - timedelta(minutes=1)
    db_session.commit()
    r = client.post("/auth/refresh", json={"refresh_token": user["refresh_token"]})
    assert r.status_code == 401
    assert "истёк" in r.json()["detail"]


def test_refresh_requires_body_422(client):
    assert client.post("/auth/refresh", json={}).status_code == 422


# ---------- выход ----------
def test_logout_revokes_refresh_token(client, user):
    assert client.post("/auth/logout", json={"refresh_token": user["refresh_token"]}).status_code == 204
    r = client.post("/auth/refresh", json={"refresh_token": user["refresh_token"]})
    assert r.status_code == 401
    assert "отозван" in r.json()["detail"]


def test_logout_is_idempotent_and_accepts_unknown_token(client, user):
    body = {"refresh_token": user["refresh_token"]}
    assert client.post("/auth/logout", json=body).status_code == 204
    assert client.post("/auth/logout", json=body).status_code == 204
    assert client.post("/auth/logout", json={"refresh_token": "never-issued"}).status_code == 204


def test_logout_only_ends_current_session(client, user):
    """Вход с другого устройства (вторая сессия) после выхода из первой продолжает работать."""
    second = client.post("/auth/login", json={"email": "anna@example.com", "password": PASSWORD}).json()
    client.post("/auth/logout", json={"refresh_token": user["refresh_token"]})
    assert client.post("/auth/refresh", json={"refresh_token": second["refresh_token"]}).status_code == 200
