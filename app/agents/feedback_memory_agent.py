import logging
from collections.abc import AsyncGenerator
from typing import Any

from google.adk.agents.context import Context
from google.adk.events.event import Event
from google.adk.events.event_actions import EventActions

logger = logging.getLogger("smart_school_stylist")

async def process_feedback_memory(ctx: Context, node_input: Any) -> AsyncGenerator[Event, None]:
    """Checks for parent feedback in the context state, logs it, and forwards outfit recommendations."""
    child_name = ctx.state.get("child_profile", {}).get("name", "Unknown")
    logger.info(f"Node: feedback_memory_agent | Child: {child_name} | Status: STARTED")
    try:
        # Load feedback from state if exists
        feedback_history = ctx.state.get("feedback_history", [])
        
        # Check if there is any new feedback passed in the context state or input
        new_feedback = ctx.state.get("new_feedback")
        if new_feedback:
            logger.info(f"Node: feedback_memory_agent | New feedback received: {new_feedback}")
            feedback_history.append(new_feedback)
            # Clear new_feedback so it's not processed repeatedly
            ctx.state["new_feedback"] = None
        
        logger.info(f"Node: feedback_memory_agent | Total feedback records: {len(feedback_history)}")
        
        yield Event(
            output=node_input,
            actions=EventActions(
                state_delta={
                    "feedback_history": feedback_history
                }
            )
        )
        logger.info(f"Node: feedback_memory_agent | Child: {child_name} | Status: COMPLETED")
    except Exception as e:
        logger.error(
            f"Node: feedback_memory_agent | Child: {child_name} | Status: FAILED | Error: {e!s}"
        )
        raise
