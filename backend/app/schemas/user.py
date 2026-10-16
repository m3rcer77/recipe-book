from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints

Username = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50)]


class UserCreate(BaseModel):
    username: Username
    bio: str | None = None


class UserUpdate(BaseModel):
    username: Username | None = None
    bio: str | None = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    bio: str | None = None
    favorites_count: int = 0
