import logging
from collections.abc import AsyncGenerator
from typing import Any

from google.adk.agents import LlmAgent
from google.adk.agents.context import Context
from google.adk.events.event import Event

from app.schemas.school_day_analysis import SchoolDayAnalysis
from app.services.model_config import model

logger = logging.getLogger("smart_school_stylist")

_analyze_school_day = LlmAgent(
    name="analyze_school_day",
    model=model,
    instruction="""You are a school schedule stylist.
Analyze the school day details and special events from the user's query: {original_query}
Consider the child's profile and preferences: {child_profile}

Determine:
1. Constraints or special requirements for the day (e.g., if there is gym/PE class, the child must wear sneakers/activewear. If it's a regular school day, Emma dislikes dresses).
2. Any special activities planned (e.g. gym, art, field trip, picture day).
3. A style guideline for the day (e.g. casual and active, nice dressy, warm layers).
""",
    output_schema=SchoolDayAnalysis,
    output_key="school_day_analysis",
)


async def analyze_school_day(
    ctx: Context, node_input: Any
) -> AsyncGenerator[Event, None]:
    child_name = ctx.state.get("child_profile", {}).get("name", "Unknown")
    logger.info(f"Node: analyze_school_day | Child: {child_name} | Status: STARTED")
    try:
        async for event in _analyze_school_day.run(ctx=ctx, node_input=node_input):
            yield event
        logger.info(
            f"Node: analyze_school_day | Child: {child_name} | Status: COMPLETED"
        )
    except Exception as e:
        logger.error(
            f"Node: analyze_school_day | Child: {child_name} | Status: FAILED | Error: {e!s}"
        )
        raise
