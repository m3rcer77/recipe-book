"""Разграничение доступа: публичные ресурсы, приватные ресурсы, права на чужие данные."""
from tests.helpers import auth
from tests.test_api import make_category, recipe_payload


# ---------- публичные ресурсы ----------
def test_public_resources_available_without_token(client, admin):
    category = make_category(client, admin)
    assert client.get("/categories").status_code == 200
    assert client.get(f"/categories/{category['id']}").status_code == 200
    assert client.get("/recipes").status_code == 200
    assert client.get("/ingredients").status_code == 200
    assert client.get("/health").status_code == 200


# ---------- рецепты: приватные операции ----------
def test_creating_recipe_requires_login(client, admin):
    category = make_category(client, admin)
    r = client.post("/recipes", json=recipe_payload(category["id"]))
    assert r.status_code == 401
    assert r.headers["www-authenticate"] == "Bearer"


def test_recipe_gets_author_from_token(client, admin, user):
    category = make_category(client, admin)
    r = client.post("/recipes", json=recipe_payload(category["id"]), headers=auth(user))
    assert r.status_code == 201, r.text
    assert r.json()["author_id"] == user["user"]["id"]


def test_only_author_can_change_or_delete_recipe(client, admin, user, other):
    category = make_category(client, admin)
    recipe = client.post("/recipes", json=recipe_payload(category["id"]), headers=auth(user)).json()
    url = f"/recipes/{recipe['id']}"

    assert client.patch(url, json={"title": "Взлом"}, headers=auth(other)).status_code == 403
    assert client.delete(url, headers=auth(other)).status_code == 403
    assert client.patch(url, json={"title": "Взлом"}).status_code == 401
    assert client.get(url).json()["title"] == recipe["title"]  # чужие правки не применились

    assert client.patch(url, json={"title": "Моя правка"}, headers=auth(user)).status_code == 200
    assert client.delete(url, headers=auth(user)).status_code == 204


def test_admin_can_delete_any_recipe(client, admin, user):
    category = make_category(client, admin)
    recipe = client.post("/recipes", json=recipe_payload(category["id"]), headers=auth(user)).json()
    assert client.delete(f"/recipes/{recipe['id']}", headers=auth(admin)).status_code == 204


# ---------- категории: только администратор ----------
def test_category_changes_are_admin_only(client, admin, user):
    body = {"name": "Супы"}
    assert client.post("/categories", json=body).status_code == 401
    assert client.post("/categories", json=body, headers=auth(user)).status_code == 403
    created = client.post("/categories", json=body, headers=auth(admin))
    assert created.status_code == 201

    cid = created.json()["id"]
    assert client.patch(f"/categories/{cid}", json={"name": "Новое"}, headers=auth(user)).status_code == 403
    assert client.delete(f"/categories/{cid}", headers=auth(user)).status_code == 403
    assert client.delete(f"/categories/{cid}", headers=auth(admin)).status_code == 204


# ---------- пользовательские данные ----------
def test_user_can_read_and_update_only_own_profile(client, user, other):
    uid, oid = user["user"]["id"], other["user"]["id"]

    assert client.get(f"/users/{uid}").status_code == 401
    assert client.get(f"/users/{uid}", headers=auth(user)).json()["email"] == "anna@example.com"
    assert client.get(f"/users/{oid}", headers=auth(user)).status_code == 403
    assert client.get("/users/9999", headers=auth(user)).status_code == 403  # не раскрываем, есть ли такой id

    r = client.patch(f"/users/{uid}", json={"bio": "Люблю супы"}, headers=auth(user))
    assert r.status_code == 200 and r.json()["bio"] == "Люблю супы"
    assert client.patch(f"/users/{oid}", json={"bio": "Взлом"}, headers=auth(user)).status_code == 403
    assert client.delete(f"/users/{oid}", headers=auth(user)).status_code == 403


def test_profile_validation_and_username_conflict(client, user, other):
    uid = user["user"]["id"]
    assert client.patch(f"/users/{uid}", json={"username": "A"}, headers=auth(user)).status_code == 422
    assert client.patch(f"/users/{uid}", json={"username": "boris"}, headers=auth(user)).status_code == 409
    assert client.patch(f"/users/{uid}", json={"username": "Anna K"}, headers=auth(user)).status_code == 200


def test_user_list_and_open_user_creation_are_gone(client, user):
    assert client.get("/users", headers=auth(user)).status_code in (404, 405)
    assert client.post("/users", json={"username": "Hacker"}).status_code in (404, 405)


def test_favorites_are_private(client, admin, user, other):
    category = make_category(client, admin)
    recipe = client.post("/recipes", json=recipe_payload(category["id"]), headers=auth(admin)).json()
    uid, rid = user["user"]["id"], recipe["id"]

    assert client.put(f"/users/{uid}/favorites/{rid}").status_code == 401
    assert client.put(f"/users/{uid}/favorites/{rid}", headers=auth(other)).status_code == 403
    assert client.get(f"/users/{uid}/favorites", headers=auth(other)).status_code == 403

    assert client.put(f"/users/{uid}/favorites/{rid}", headers=auth(user)).status_code == 204
    assert [r["id"] for r in client.get(f"/users/{uid}/favorites", headers=auth(user)).json()] == [rid]
    assert client.delete(f"/users/{uid}/favorites/{rid}", headers=auth(other)).status_code == 403
    assert client.delete(f"/users/{uid}/favorites/{rid}", headers=auth(user)).status_code == 204
