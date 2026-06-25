import logging
from google.adk.events.event import Event
from google.adk.events.event_actions import EventActions
from google.adk.agents.context import Context
from google.genai import types

from app.data.mock_profiles import CHILD_PROFILES

logger = logging.getLogger("smart_school_stylist")

def load_child_profile(ctx: Context, node_input: types.Content) -> Event:
    """Parse the user prompt to identify which child profile to load."""
    logger.info("Node: load_child_profile | Child: Unknown | Status: STARTED")
    try:
        text = ""
        if node_input and node_input.parts:
            text = " ".join([p.text for p in node_input.parts if p.text])

        text_lower = text.lower()
        if "mia" in text_lower:
            selected_name = "Mia"
        else:
            selected_name = "Emma"

        profile = CHILD_PROFILES[selected_name.lower()]

        logger.info(
            f"Node: load_child_profile | Child: {selected_name} | Status: COMPLETED"
        )
        return Event(
            output=profile.model_dump(),
            actions=EventActions(
                state_delta={
                    "child_profile": profile.model_dump(),
                    "original_query": text,
                }
            ),
        )
    except Exception as e:
        logger.error(
            f"Node: load_child_profile | Child: Unknown | Status: FAILED | Error: {e!s}"
        )
        raise
