from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, false, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    """Пользователь приложения: учётная запись для входа и профиль."""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    # Только хеш пароля (Argon2id), сам пароль нигде не хранится
    password_hash: Mapped[str] = mapped_column(String(255))
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, server_default=false())
    bio: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    favorites: Mapped[list["Favorite"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(  # noqa: F821
        back_populates="user", cascade="all, delete-orphan"
    )

    @property
    def favorites_count(self) -> int:
        return len(self.favorites)


class Favorite(Base):
    """Избранное: связь пользователь ↔ рецепт (многие ко многим)."""
    __tablename__ = "favorites"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="favorites")
    recipe: Mapped["Recipe"] = relationship(back_populates="favorited_by")  # noqa: F821
