import logging
from google.adk.events.event import Event
from google.adk.events.event_actions import EventActions
from google.adk.agents.context import Context

from app.data.mock_wardrobe import MOCK_WARDROBE

logger = logging.getLogger("smart_school_stylist")

def load_wardrobe_items(ctx: Context, node_input: dict) -> Event:
    """Filter and load mock wardrobe items for the selected child."""
    name = node_input.get("name", "Unknown")
    logger.info(f"Node: load_wardrobe_items | Child: {name} | Status: STARTED")
    try:
        items = [
            item.model_dump()
            for item in MOCK_WARDROBE
            if item.owner.lower() == name.lower()
        ]
        logger.info(f"Node: load_wardrobe_items | Child: {name} | Status: COMPLETED")
        return Event(
            output=items, actions=EventActions(state_delta={"wardrobe_items": items})
        )
    except Exception as e:
        logger.error(
            f"Node: load_wardrobe_items | Child: {name} | Status: FAILED | Error: {e!s}"
        )
        raise
