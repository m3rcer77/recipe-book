from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints

Username = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=30)]


class UserUpdate(BaseModel):
    """Изменение профиля. Email и пароль здесь не меняются."""
    username: Username | None = None
    bio: Annotated[str, StringConstraints(max_length=100)] | None = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    bio: str | None = None
    is_admin: bool = False
    favorites_count: int = 0
