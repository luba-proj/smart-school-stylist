import logging
from collections.abc import AsyncGenerator
from typing import Any

from google.adk.agents import LlmAgent
from google.adk.agents.context import Context
from google.adk.events.event import Event

from app.schemas.weather_analysis import WeatherAnalysis
from app.services.model_config import model

logger = logging.getLogger("smart_school_stylist")

_analyze_weather = LlmAgent(
    name="analyze_weather",
    model=model,
    instruction="""You are a weather stylist assistant.
Analyze the following weather query or description: {original_query}

Determine:
1. Overall weather conditions (e.g. sunny, rainy, snowy, cold, warm).
2. The temperature or a description of it.
3. Recommended clothing warmth level from 1 (very light/summer) to 5 (very warm/winter layers).
4. Whether rain gear or waterproof clothing is required.
""",
    output_schema=WeatherAnalysis,
    output_key="weather_analysis",
)


async def analyze_weather(ctx: Context, node_input: Any) -> AsyncGenerator[Event, None]:
    child_name = ctx.state.get("child_profile", {}).get("name", "Unknown")
    logger.info(f"Node: analyze_weather | Child: {child_name} | Status: STARTED")
    try:
        async for event in _analyze_weather.run(ctx=ctx, node_input=node_input):
            yield event
        logger.info(f"Node: analyze_weather | Child: {child_name} | Status: COMPLETED")
    except Exception as e:
        logger.error(
            f"Node: analyze_weather | Child: {child_name} | Status: FAILED | Error: {e!s}"
        )
        raise
