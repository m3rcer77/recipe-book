"""Доменные ошибки и их преобразование в HTTP-ответы."""
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


class AppError(Exception):
    status_code = status.HTTP_400_BAD_REQUEST

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT


class BadRequestError(AppError):
    status_code = status.HTTP_400_BAD_REQUEST


class UnauthorizedError(AppError):
    """401: пользователь не аутентифицирован (нет токена, токен неверный или просрочен)."""
    status_code = status.HTTP_401_UNAUTHORIZED


class ForbiddenError(AppError):
    """403: пользователь известен, но у него нет права на эту операцию."""
    status_code = status.HTTP_403_FORBIDDEN


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
        headers = {"WWW-Authenticate": "Bearer"} if exc.status_code == status.HTTP_401_UNAUTHORIZED else None
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message}, headers=headers)
