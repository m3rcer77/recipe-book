"""CRUD рецептов и категорий (с авторизацией: создаёт пользователь, категории — администратор)."""
from tests.helpers import auth


def make_category(client, admin, name="Ужины"):
    r = client.post("/categories", json={"name": name}, headers=auth(admin))
    assert r.status_code == 201, r.text
    return r.json()


def recipe_payload(category_id, **overrides):
    payload = {
        "title": "Паста с томатами",
        "description": "Простая паста",
        "emoji": "🍝",
        "cooking_time_minutes": 25,
        "difficulty": "Легко",
        "calories": 430,
        "category_id": category_id,
        "ingredients": [
            {"name": "Спагетти", "quantity": "180 г"},
            {"name": "Томаты", "quantity": "250 г"},
        ],
        "steps": ["Отварить пасту", "Приготовить соус", "Смешать"],
    }
    payload.update(overrides)
    return payload


def make_recipe(client, admin, user, **overrides):
    cat = make_category(client, admin)
    r = client.post("/recipes", json=recipe_payload(cat["id"], **overrides), headers=auth(user))
    assert r.status_code == 201, r.text
    return r.json(), cat


# ---------- категории ----------
def test_category_crud(client, admin):
    cat = make_category(client, admin)
    assert client.get(f"/categories/{cat['id']}").json()["name"] == "Ужины"
    r = client.patch(f"/categories/{cat['id']}", json={"description": "Вечерние блюда"}, headers=auth(admin))
    assert r.status_code == 200 and r.json()["description"] == "Вечерние блюда"
    assert client.delete(f"/categories/{cat['id']}", headers=auth(admin)).status_code == 204
    assert client.get(f"/categories/{cat['id']}").status_code == 404


def test_category_duplicate_409(client, admin):
    make_category(client, admin, "Ужины")
    assert client.post("/categories", json={"name": "ужины"}, headers=auth(admin)).status_code == 409


def test_category_blank_name_422(client, admin):
    assert client.post("/categories", json={"name": "   "}, headers=auth(admin)).status_code == 422


# ---------- рецепты ----------
def test_create_and_get_recipe_with_relations(client, admin, user):
    recipe, cat = make_recipe(client, admin, user)
    body = client.get(f"/recipes/{recipe['id']}").json()
    assert body["category"]["id"] == cat["id"]
    assert [i["name"] for i in body["ingredients"]] == ["Спагетти", "Томаты"]
    assert body["ingredients"][0]["quantity"] == "180 г"
    assert body["steps"] == ["Отварить пасту", "Приготовить соус", "Смешать"]
    assert body["difficulty"] == "Легко" and body["calories"] == 430


def test_ingredients_are_reused_between_recipes(client, admin, user):
    cat = make_category(client, admin)
    for title in ("Паста 1", "Паста 2"):
        r = client.post("/recipes", json=recipe_payload(cat["id"], title=title), headers=auth(user))
        assert r.status_code == 201
    names = [i["name"] for i in client.get("/ingredients").json()]
    assert sorted(names) == ["Спагетти", "Томаты"]


def test_recipe_not_found_404(client):
    r = client.get("/recipes/999")
    assert r.status_code == 404 and "detail" in r.json()


def test_recipe_validation_422(client, admin, user):
    cat = make_category(client, admin)
    for bad in (
        {"title": ""},
        {"cooking_time_minutes": 0},
        {"calories": -5},
        {"difficulty": "Невозможно"},
        {"steps": ["ok", "  "]},
        {"ingredients": [{"name": "Соль", "quantity": "1 г"}, {"name": "соль", "quantity": "2 г"}]},
    ):
        r = client.post("/recipes", json=recipe_payload(cat["id"], **bad), headers=auth(user))
        assert r.status_code == 422, (bad, r.text)


def test_recipe_unknown_category_400(client, user):
    r = client.post("/recipes", json=recipe_payload(999), headers=auth(user))
    assert r.status_code == 400


def test_update_recipe_replaces_ingredients_and_steps(client, admin, user):
    recipe, _ = make_recipe(client, admin, user)
    r = client.patch(
        f"/recipes/{recipe['id']}",
        json={
            "title": "Новая паста",
            "ingredients": [{"name": "Спагетти", "quantity": "200 г"}, {"name": "Базилик", "quantity": "горсть"}],
            "steps": ["Один", "Два"],
        },
        headers=auth(user),
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["title"] == "Новая паста"
    assert {i["name"]: i["quantity"] for i in body["ingredients"]} == {"Спагетти": "200 г", "Базилик": "горсть"}
    assert body["steps"] == ["Один", "Два"]


def test_partial_update_keeps_children(client, admin, user):
    recipe, _ = make_recipe(client, admin, user)
    body = client.patch(f"/recipes/{recipe['id']}", json={"calories": 500}, headers=auth(user)).json()
    assert body["calories"] == 500
    assert len(body["ingredients"]) == 2 and len(body["steps"]) == 3


def test_update_null_required_field_400(client, admin, user):
    recipe, _ = make_recipe(client, admin, user)
    assert client.patch(f"/recipes/{recipe['id']}", json={"title": None}, headers=auth(user)).status_code == 400


def test_list_filters(client, admin, user):
    recipe, cat = make_recipe(client, admin, user)
    other = make_category(client, admin, "Десерты")
    client.post("/recipes", json=recipe_payload(other["id"], title="Брауни", difficulty="Средне"), headers=auth(user))

    assert len(client.get("/recipes").json()) == 2
    assert len(client.get(f"/recipes?category_id={cat['id']}").json()) == 1
    assert client.get("/recipes?difficulty=Средне").json()[0]["title"] == "Брауни"
    assert client.get("/recipes?category_id=999").json() == []
    assert client.get("/recipes?limit=0").status_code == 422
    assert client.get("/recipes?difficulty=Хм").status_code == 422


def test_delete_recipe_removes_children(client, admin, user):
    recipe, _ = make_recipe(client, admin, user)
    assert client.delete(f"/recipes/{recipe['id']}", headers=auth(user)).status_code == 204
    assert client.get(f"/recipes/{recipe['id']}").status_code == 404
    assert client.delete(f"/recipes/{recipe['id']}", headers=auth(user)).status_code == 404


def test_cannot_delete_category_with_recipes(client, admin, user):
    _, cat = make_recipe(client, admin, user)
    assert client.delete(f"/categories/{cat['id']}", headers=auth(admin)).status_code == 409


# ---------- каскадное удаление ----------
def test_deleting_recipe_cleans_favorites(client, admin, user):
    recipe, _ = make_recipe(client, admin, user)
    uid = user["user"]["id"]
    client.put(f"/users/{uid}/favorites/{recipe['id']}", headers=auth(user))
    assert client.delete(f"/recipes/{recipe['id']}", headers=auth(user)).status_code == 204
    assert client.get(f"/users/{uid}", headers=auth(user)).json()["favorites_count"] == 0


def test_deleting_user_keeps_recipes_without_author(client, admin, user):
    recipe, _ = make_recipe(client, admin, user)
    assert client.delete(f"/users/{user['user']['id']}", headers=auth(user)).status_code == 204
    body = client.get(f"/recipes/{recipe['id']}").json()
    assert body["author_id"] is None
