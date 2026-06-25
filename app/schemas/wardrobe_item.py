from pydantic import BaseModel, Field

class WardrobeItem(BaseModel):
    id: str = Field(description="Unique ID of the wardrobe item")
    owner: str = Field(description="Name of the child who owns the item")
    category: str = Field(
        description="Item category (shirt, bottom, shoes, layer, dress)"
    )
    color: str = Field(description="Color of the item")
    season: str = Field(
        description="Season category (spring/summer, fall/winter, all, etc.)"
    )
    warmth_level: int = Field(
        description="Warmth rating from 1 (lightest) to 5 (warmest)"
    )
    tags: list[str] = Field(description="Descriptive tags for the item")
