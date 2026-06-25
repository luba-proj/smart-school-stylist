from pydantic import BaseModel, Field

class ChildProfile(BaseModel):
    name: str = Field(description="Name of the child")
    age: int = Field(description="Age of the child")
    preferences: str = Field(description="Outfit preferences")
    favorite_colors: list[str] = Field(description="Favorite colors")
    dislikes: list[str] = Field(description="Disliked items or styles")
