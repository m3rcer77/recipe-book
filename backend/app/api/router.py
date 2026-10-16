from fastapi import APIRouter

from app.api.routes import categories, ingredients, recipes, users

api_router = APIRouter()
api_router.include_router(categories.router)
api_router.include_router(ingredients.router)
api_router.include_router(recipes.router)
api_router.include_router(users.router)
