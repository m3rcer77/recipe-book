from app.models import User

PASSWORD = "Password123"


def register(client, username: str = "Anna", email: str = "anna@example.com", password: str = PASSWORD) -> dict:
    response = client.post("/auth/register", json={"username": username, "email": email, "password": password})
    assert response.status_code == 201, response.text
    return response.json()


def auth(tokens: dict) -> dict:
    """Заголовок Authorization с access-токеном."""
    return {"Authorization": f"Bearer {tokens['access_token']}"}


def make_admin(db_session, user_id: int) -> None:
    user = db_session.get(User, user_id)
    user.is_admin = True
    db_session.commit()
