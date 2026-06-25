# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import logging
from collections.abc import AsyncGenerator
from typing import Any

from google.adk.agents.context import Context
from google.adk.events.event import Event
from google.adk.workflow import Workflow
from google.genai import types

# Import agent nodes
from app.agents.profile_agent import load_child_profile
from app.agents.wardrobe_agent import load_wardrobe_items
from app.agents.weather_agent import analyze_weather
from app.agents.school_context_agent import analyze_school_day
from app.agents.stylist_agent import recommend_outfits
from app.agents.feedback_memory_agent import process_feedback_memory

logger = logging.getLogger("smart_school_stylist")

async def final_response(ctx: Context, node_input: dict) -> AsyncGenerator[Event, None]:
    """Step 6: Format recommendations nicely as user-facing markdown content."""
    child_name = ctx.state.get("child_profile", {}).get("name", "your child")
    logger.info(f"Node: final_response | Child: {child_name} | Status: STARTED")
    try:
        best_comfort = node_input.get("best_comfort", {})
        best_style = node_input.get("best_style", {})
        best_weather = node_input.get("best_weather", {})

        md_text = f"""### 🌟 Outfit Recommendations for {child_name}

Here are the personalized school outfit recommendations based on the wardrobe, weather, and schedule:

#### 1. 🛋️ Best for Comfort
* **Top:** {best_comfort.get("shirt_top")}
* **Bottom/Dress:** {best_comfort.get("bottom_or_dress")}
* **Shoes:** {best_comfort.get("shoes")}
* **Layer:** {best_comfort.get("optional_layer")}
* **Why:** {best_comfort.get("reason")}

#### 2. ✨ Best for Style
* **Top:** {best_style.get("shirt_top")}
* **Bottom/Dress:** {best_style.get("bottom_or_dress")}
* **Shoes:** {best_style.get("shoes")}
* **Layer:** {best_style.get("optional_layer")}
* **Why:** {best_style.get("reason")}

#### 3. 🌤️ Best for Weather
* **Top:** {best_weather.get("shirt_top")}
* **Bottom/Dress:** {best_weather.get("bottom_or_dress")}
* **Shoes:** {best_weather.get("shoes")}
* **Layer:** {best_weather.get("optional_layer")}
* **Why:** {best_weather.get("reason")}
"""

        yield Event(
            content=types.Content(
                role="model", parts=[types.Part.from_text(text=md_text)]
            )
        )
        yield Event(output=md_text)
        logger.info(f"Node: final_response | Child: {child_name} | Status: COMPLETED")
    except Exception as e:
        logger.error(
            f"Node: final_response | Child: {child_name} | Status: FAILED | Error: {e!s}"
        )
        raise

# Define root agent workflow
root_agent = Workflow(
    name="smart_school_stylist",
    edges=[
        ("START", load_child_profile),
        (load_child_profile, load_wardrobe_items),
        (load_child_profile, analyze_weather),
        (load_child_profile, analyze_school_day),
        (load_wardrobe_items, recommend_outfits),
        (analyze_weather, recommend_outfits),
        (analyze_school_day, recommend_outfits),
        (recommend_outfits, process_feedback_memory),
        (process_feedback_memory, final_response),
    ],
    description="A multi-agent assistant that helps children choose school outfits based on weather, schedule, and preferences.",
)
