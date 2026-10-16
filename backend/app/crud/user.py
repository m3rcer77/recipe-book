from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import BadRequestError, ConflictError, NotFoundError
from app.crud import recipe as recipe_crud
from app.models import Favorite, Recipe, User
from app.schemas import UserCreate, UserUpdate


def list_users(db: Session) -> list[User]:
    return list(db.scalars(select(User).order_by(User.id)))


def get_user(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise NotFoundError(f"Пользователь с id={user_id} не найден")
    return user


def _ensure_username_free(db: Session, username: str, exclude_id: int | None = None) -> None:
    stmt = select(User.id).where(func.lower(User.username) == func.lower(username))
    if exclude_id is not None:
        stmt = stmt.where(User.id != exclude_id)
    if db.scalar(stmt) is not None:
        raise ConflictError(f"Имя пользователя «{username}» уже занято")


def create_user(db: Session, data: UserCreate) -> User:
    _ensure_username_free(db, data.username)
    user = User(**data.model_dump())
    db.add(user)
    db.commit()
    return user


def update_user(db: Session, user_id: int, data: UserUpdate) -> User:
    user = get_user(db, user_id)
    changes = data.model_dump(exclude_unset=True)
    if "username" in changes:
        if changes["username"] is None:
            raise BadRequestError("Имя пользователя не может быть null")
        _ensure_username_free(db, changes["username"], exclude_id=user_id)
    for field, value in changes.items():
        setattr(user, field, value)
    db.commit()
    return user


def delete_user(db: Session, user_id: int) -> None:
    user = get_user(db, user_id)
    db.delete(user)  # избранное удаляется каскадом
    db.commit()


# ---------- избранное ----------
def list_favorites(db: Session, user_id: int) -> list[Recipe]:
    get_user(db, user_id)
    stmt = (
        select(Recipe)
        .join(Favorite, Favorite.recipe_id == Recipe.id)
        .where(Favorite.user_id == user_id)
        .options(*recipe_crud.LOAD_OPTIONS)
        .order_by(Favorite.created_at.desc(), Recipe.id)
    )
    return list(db.scalars(stmt).unique())


def add_favorite(db: Session, user_id: int, recipe_id: int) -> None:
    """Идемпотентно: повторное добавление ничего не меняет."""
    get_user(db, user_id)
    recipe_crud.get_recipe(db, recipe_id)
    if db.get(Favorite, (user_id, recipe_id)) is None:
        db.add(Favorite(user_id=user_id, recipe_id=recipe_id))
        db.commit()


def remove_favorite(db: Session, user_id: int, recipe_id: int) -> None:
    get_user(db, user_id)
    favorite = db.get(Favorite, (user_id, recipe_id))
    if favorite is None:
        raise NotFoundError(f"Рецепт id={recipe_id} не найден в избранном пользователя id={user_id}")
    db.delete(favorite)
    db.commit()
