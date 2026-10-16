def make_category(client, name="Ужины"):
    r = client.post("/categories", json={"name": name})
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


def make_recipe(client, **overrides):
    cat = make_category(client)
    r = client.post("/recipes", json=recipe_payload(cat["id"], **overrides))
    assert r.status_code == 201, r.text
    return r.json(), cat


def make_user(client, username="Иван"):
    r = client.post("/users", json={"username": username, "bio": "Люблю готовить"})
    assert r.status_code == 201, r.text
    return r.json()


# ---------- категории ----------
def test_category_crud(client):
    cat = make_category(client)
    assert client.get(f"/categories/{cat['id']}").json()["name"] == "Ужины"
    r = client.patch(f"/categories/{cat['id']}", json={"description": "Вечерние блюда"})
    assert r.status_code == 200 and r.json()["description"] == "Вечерние блюда"
    assert client.delete(f"/categories/{cat['id']}").status_code == 204
    assert client.get(f"/categories/{cat['id']}").status_code == 404


def test_category_duplicate_409(client):
    make_category(client, "Ужины")
    assert client.post("/categories", json={"name": "ужины"}).status_code == 409


def test_category_blank_name_422(client):
    assert client.post("/categories", json={"name": "   "}).status_code == 422


# ---------- рецепты ----------
def test_create_and_get_recipe_with_relations(client):
    recipe, cat = make_recipe(client)
    body = client.get(f"/recipes/{recipe['id']}").json()
    assert body["category"]["id"] == cat["id"]
    assert [i["name"] for i in body["ingredients"]] == ["Спагетти", "Томаты"]
    assert body["ingredients"][0]["quantity"] == "180 г"
    assert body["steps"] == ["Отварить пасту", "Приготовить соус", "Смешать"]
    assert body["difficulty"] == "Легко" and body["calories"] == 430


def test_ingredients_are_reused_between_recipes(client):
    cat = make_category(client)
    for title in ("Паста 1", "Паста 2"):
        r = client.post("/recipes", json=recipe_payload(cat["id"], title=title))
        assert r.status_code == 201
    names = [i["name"] for i in client.get("/ingredients").json()]
    assert sorted(names) == ["Спагетти", "Томаты"]


def test_recipe_not_found_404(client):
    r = client.get("/recipes/999")
    assert r.status_code == 404 and "detail" in r.json()


def test_recipe_validation_422(client):
    cat = make_category(client)
    for bad in (
        {"title": ""},
        {"cooking_time_minutes": 0},
        {"calories": -5},
        {"difficulty": "Невозможно"},
        {"steps": ["ok", "  "]},
        {"ingredients": [{"name": "Соль", "quantity": "1 г"}, {"name": "соль", "quantity": "2 г"}]},
    ):
        r = client.post("/recipes", json=recipe_payload(cat["id"], **bad))
        assert r.status_code == 422, (bad, r.text)


def test_recipe_unknown_category_400(client):
    r = client.post("/recipes", json=recipe_payload(999))
    assert r.status_code == 400


def test_update_recipe_replaces_ingredients_and_steps(client):
    recipe, _ = make_recipe(client)
    r = client.patch(f"/recipes/{recipe['id']}", json={
        "title": "Новая паста",
        "ingredients": [{"name": "Спагетти", "quantity": "200 г"}, {"name": "Базилик", "quantity": "горсть"}],
        "steps": ["Один", "Два"],
    })
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["title"] == "Новая паста"
    assert {i["name"]: i["quantity"] for i in body["ingredients"]} == {"Спагетти": "200 г", "Базилик": "горсть"}
    assert body["steps"] == ["Один", "Два"]


def test_partial_update_keeps_children(client):
    recipe, _ = make_recipe(client)
    body = client.patch(f"/recipes/{recipe['id']}", json={"calories": 500}).json()
    assert body["calories"] == 500
    assert len(body["ingredients"]) == 2 and len(body["steps"]) == 3


def test_update_null_required_field_400(client):
    recipe, _ = make_recipe(client)
    assert client.patch(f"/recipes/{recipe['id']}", json={"title": None}).status_code == 400


def test_list_filters(client):
    recipe, cat = make_recipe(client)
    other = make_category(client, "Десерты")
    client.post("/recipes", json=recipe_payload(other["id"], title="Брауни", difficulty="Средне"))

    assert len(client.get("/recipes").json()) == 2
    assert len(client.get(f"/recipes?category_id={cat['id']}").json()) == 1
    assert client.get("/recipes?difficulty=Средне").json()[0]["title"] == "Брауни"
    assert client.get("/recipes?category_id=999").json() == []
    assert client.get("/recipes?limit=0").status_code == 422
    assert client.get("/recipes?difficulty=Хм").status_code == 422


def test_delete_recipe_removes_children(client):
    recipe, _ = make_recipe(client)
    assert client.delete(f"/recipes/{recipe['id']}").status_code == 204
    assert client.get(f"/recipes/{recipe['id']}").status_code == 404
    assert client.delete(f"/recipes/{recipe['id']}").status_code == 404


def test_cannot_delete_category_with_recipes(client):
    _, cat = make_recipe(client)
    assert client.delete(f"/categories/{cat['id']}").status_code == 409


# ---------- пользователи и избранное ----------
def test_user_crud(client):
    user = make_user(client)
    assert user["favorites_count"] == 0
    assert client.patch(f"/users/{user['id']}", json={"bio": "Новое"}).json()["bio"] == "Новое"
    assert client.post("/users", json={"username": "иван"}).status_code == 409
    assert client.delete(f"/users/{user['id']}").status_code == 204
    assert client.get(f"/users/{user['id']}").status_code == 404


def test_favorites_flow(client):
    recipe, _ = make_recipe(client)
    user = make_user(client)
    uid, rid = user["id"], recipe["id"]

    assert client.put(f"/users/{uid}/favorites/{rid}").status_code == 204
    assert client.put(f"/users/{uid}/favorites/{rid}").status_code == 204  # идемпотентно
    favs = client.get(f"/users/{uid}/favorites").json()
    assert [f["id"] for f in favs] == [rid]
    assert favs[0]["category"]["name"] == "Ужины"
    assert client.get(f"/users/{uid}").json()["favorites_count"] == 1

    assert client.delete(f"/users/{uid}/favorites/{rid}").status_code == 204
    assert client.delete(f"/users/{uid}/favorites/{rid}").status_code == 404
    assert client.get(f"/users/{uid}/favorites").json() == []


def test_favorites_errors_404(client):
    recipe, _ = make_recipe(client)
    user = make_user(client)
    assert client.put(f"/users/999/favorites/{recipe['id']}").status_code == 404
    assert client.put(f"/users/{user['id']}/favorites/999").status_code == 404
    assert client.get("/users/999/favorites").status_code == 404


def test_deleting_recipe_or_user_cleans_favorites(client):
    recipe, _ = make_recipe(client)
    user = make_user(client)
    client.put(f"/users/{user['id']}/favorites/{recipe['id']}")
    assert client.delete(f"/recipes/{recipe['id']}").status_code == 204
    assert client.get(f"/users/{user['id']}").json()["favorites_count"] == 0
