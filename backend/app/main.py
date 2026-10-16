from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers

app = FastAPI(title="Recipe Book API", version="0.2.0", description="Backend для приложения «Книга рецептов» (лабораторная работа №2)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_exception_handlers(app)
app.include_router(api_router)


@app.get("/health", tags=["Служебное"])
def health():
    return {"status": "ok"}
