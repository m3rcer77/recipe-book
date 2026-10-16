from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints

Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]


class CategoryCreate(BaseModel):
    name: Name
    description: str | None = None


class CategoryUpdate(BaseModel):
    name: Name | None = None
    description: str | None = None


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
