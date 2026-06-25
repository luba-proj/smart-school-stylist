from pydantic import BaseModel, Field

class SchoolDayAnalysis(BaseModel):
    constraints: list[str] = Field(
        description="Constraints or special requirements (e.g. gym day requires sneakers)"
    )
    activities: list[str] = Field(
        description="Special activities or schedule details (e.g., gym, art, field trip, picture day)"
    )
    style_guideline: str = Field(
        description="Overall guideline for today's outfits based on schedule"
    )
