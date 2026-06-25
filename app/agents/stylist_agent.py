import logging
from collections.abc import AsyncGenerator
from typing import Any

from google.adk.agents import LlmAgent
from google.adk.agents.context import Context
from google.adk.events.event import Event

from app.schemas.outfit import OutfitRecommendations
from app.services.model_config import model

logger = logging.getLogger("smart_school_stylist")

_recommend_outfits = LlmAgent(
    name="recommend_outfits",
    model=model,
    instruction="""You are the Smart School Stylist assistant.
Recommend exactly three school outfits for the child based on the following:
- Profile: {child_profile}
- Available Wardrobe: {wardrobe_items}
- Weather Analysis: {weather_analysis}
- School Day Analysis: {school_day_analysis}

Generate three distinct recommendations:
1. best_comfort: Prioritize comfort and soft, easy-to-move-in materials, adhering to child's preference.
2. best_style: A styling recommendation prioritizing color harmony and the child's favorite colors.
3. best_weather: Suitability for the current weather temperature, warmth level, and rain constraints.

Each recommendation MUST only choose items that are actually present in the available wardrobe items list. Specify the exact items chosen from the list:
- shirt_top: Description of shirt/top
- bottom_or_dress: Description of bottom (pants, leggings, jeans, sweatpants, skirt) or dress
- shoes: Description of shoes
- optional_layer: Description of layer (hoodie, jacket, cardigan) or 'none'
- reason: A short explanation (1-2 sentences) of why this outfit was chosen for this category.

Strict Constraints:
- Choose only from the wardrobe items listed under the child's name.
- Emma dislikes dresses for regular school. Do not recommend a dress for Emma unless it is a special event that explicitly overrides this.
- Emma's favorite colors are blue and purple. Mia's favorite colors are pink and purple. Prioritize these colors.
- If the school day requires activewear/sneakers (e.g., gym day), ensure sneakers are chosen.
""",
    output_schema=OutfitRecommendations,
    output_key="recommendations",
)


async def recommend_outfits(
    ctx: Context, node_input: Any
) -> AsyncGenerator[Event, None]:
    child_name = ctx.state.get("child_profile", {}).get("name", "Unknown")
    logger.info(f"Node: recommend_outfits | Child: {child_name} | Status: STARTED")
    try:
        async for event in _recommend_outfits.run(ctx=ctx, node_input=node_input):
            yield event
        logger.info(
            f"Node: recommend_outfits | Child: {child_name} | Status: COMPLETED"
        )
    except Exception as e:
        logger.error(
            f"Node: recommend_outfits | Child: {child_name} | Status: FAILED | Error: {e!s}"
        )
        raise
