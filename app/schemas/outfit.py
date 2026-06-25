from pydantic import BaseModel, Field

class Outfit(BaseModel):
    shirt_top: str = Field(description="The chosen shirt or top from the wardrobe")
    bottom_or_dress: str = Field(
        description="The chosen bottom (pants/leggings/jeans/skirt) or dress"
    )
    shoes: str = Field(description="The chosen shoes")
    optional_layer: str = Field(
        description="The chosen layer (hoodie/jacket/cardigan) or 'none'"
    )
    reason: str = Field(description="Explanation of why this outfit was selected")


class OutfitRecommendations(BaseModel):
    best_comfort: Outfit = Field(
        description="Outfit recommendation that prioritizes comfort"
    )
    best_style: Outfit = Field(
        description="Outfit recommendation that prioritizes style"
    )
    best_weather: Outfit = Field(
        description="Outfit recommendation that prioritizes weather suitability"
    )
