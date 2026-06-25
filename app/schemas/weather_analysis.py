from pydantic import BaseModel, Field

class WeatherAnalysis(BaseModel):
    conditions: str = Field(
        description="Overall weather conditions (e.g. sunny, rainy, cold)"
    )
    temperature: str = Field(description="Temperature or description of temperature")
    recommended_warmth: int = Field(
        description="Scale of 1 (lightest) to 5 (warmest) for recommended clothing warmth"
    )
    requires_rain_gear: bool = Field(
        description="Whether rain gear or waterproof clothing is required"
    )
