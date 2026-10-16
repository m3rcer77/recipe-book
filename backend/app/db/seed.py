"""Демо-данные — те же, что в frontend (src/data.ts): python -m app.db.seed"""
from sqlalchemy import select

from app import models
from app.db.session import SessionLocal

CATEGORIES = ["Завтраки", "Обеды", "Ужины", "Десерты"]

# (название, категория, минут, сложность, ккал, emoji, описание, ингредиенты «название — количество», шаги)
RECIPES = [
    ("Паста с томатами и базиликом", "Ужины", 25, "Легко", 430, "🍝",
     "Простая паста с насыщенным томатным соусом, чесноком и свежим базиликом.",
     ["Спагетти — 180 г", "Томаты — 250 г", "Чеснок — 2 зубчика", "Базилик — горсть", "Оливковое масло — 1 ст. л."],
     ["Отварите пасту до состояния al dente.",
      "Обжарьте чеснок в масле и добавьте нарезанные томаты.",
      "Смешайте пасту с соусом и украсьте базиликом."]),
    ("Сырники с ягодами", "Завтраки", 20, "Легко", 360, "🥞",
     "Нежные творожные сырники с йогуртом и свежими ягодами.",
     ["Творог — 300 г", "Яйцо — 1 шт.", "Мука — 2 ст. л.", "Йогурт — 80 г", "Ягоды — 100 г"],
     ["Смешайте творог, яйцо и муку.",
      "Сформируйте небольшие сырники.",
      "Обжарьте до золотистой корочки и подайте с ягодами."]),
    ("Курица с овощами", "Обеды", 35, "Средне", 510, "🍗",
     "Сытное блюдо из куриного филе и сезонных овощей на одной сковороде.",
     ["Куриное филе — 400 г", "Перец — 1 шт.", "Кабачок — 1 шт.", "Морковь — 1 шт.", "Специи — по вкусу"],
     ["Нарежьте филе и овощи.",
      "Обжарьте курицу до готовности.",
      "Добавьте овощи и специи, тушите 10–12 минут."]),
    ("Шоколадный брауни", "Десерты", 40, "Средне", 390, "🍫",
     "Влажный шоколадный десерт с насыщенным какао-вкусом.",
     ["Тёмный шоколад — 120 г", "Сливочное масло — 100 г", "Яйца — 2 шт.", "Сахар — 100 г", "Мука — 80 г"],
     ["Растопите шоколад с маслом.",
      "Взбейте яйца с сахаром и соедините с шоколадной смесью.",
      "Добавьте муку и выпекайте около 25 минут при 180°C."]),
]


def seed() -> None:
    with SessionLocal() as db:
        if db.scalar(select(models.Category.id).limit(1)):
            print("В базе уже есть данные — пропускаю.")
            return

        categories = {name: models.Category(name=name) for name in CATEGORIES}
        db.add_all(categories.values())
        ingredients: dict[str, models.Ingredient] = {}
        recipes = []

        for title, cat, minutes, difficulty, kcal, emoji, description, items, steps in RECIPES:
            links = []
            for item in items:
                name, quantity = item.split(" — ")
                ingredient = ingredients.get(name.lower())
                if ingredient is None:
                    ingredient = ingredients[name.lower()] = models.Ingredient(name=name)
                links.append(models.RecipeIngredient(ingredient=ingredient, quantity=quantity))
            recipe = models.Recipe(
                title=title, description=description, emoji=emoji, cooking_time_minutes=minutes,
                difficulty=difficulty, calories=kcal, category=categories[cat], ingredients=links,
                steps=[models.RecipeStep(position=n, text=t) for n, t in enumerate(steps, start=1)],
            )
            recipes.append(recipe)
        db.add_all(recipes)

        user = models.User(username="Иван", bio="Люблю простые домашние блюда")
        db.add(user)
        db.flush()
        # как на экране «Избранное» во frontend — первые два рецепта
        for recipe in recipes[:2]:
            db.add(models.Favorite(user_id=user.id, recipe_id=recipe.id))
        db.commit()
        print("Демо-данные добавлены: 4 категории, 4 рецепта, пользователь «Иван» с 2 избранными.")


if __name__ == "__main__":
    seed()
