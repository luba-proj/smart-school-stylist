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

import os
import logging
from typing import AsyncGenerator, Any
import google.auth
from pydantic import BaseModel, Field

from google.adk.agents import LlmAgent
from google.adk.apps import App
from google.adk.models import Gemini
from google.adk.workflow import Workflow, START
from google.adk.events.event import Event
from google.adk.agents.context import Context
from google.genai import types

logger = logging.getLogger("smart_school_stylist")

# Setup authentication and runtime config
# Support both Gemini API Key (.env/local) and Vertex AI (Google Cloud)
api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

if api_key:
    os.environ["GOOGLE_API_KEY"] = api_key
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "False"
else:
    try:
        _, project_id = google.auth.default()
        os.environ["GOOGLE_CLOUD_PROJECT"] = project_id
        os.environ["GOOGLE_CLOUD_LOCATION"] = "global"
        os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"
    except Exception:
        # Graceful fallback for offline testing/unit tests
        os.environ["GOOGLE_CLOUD_PROJECT"] = "mock-project-id"
        os.environ["GOOGLE_CLOUD_LOCATION"] = "global"
        os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "False"
        os.environ["GOOGLE_API_KEY"] = "mock-api-key"

# Instantiate Gemini LLM Model
model = Gemini(
    model="gemini-flash-latest",
    retry_options=types.HttpRetryOptions(attempts=3),
)


# ==========================================
# 1. Pydantic Schemas & Data Structures
# ==========================================

class ChildProfile(BaseModel):
    name: str = Field(description="Name of the child")
    age: int = Field(description="Age of the child")
    preferences: str = Field(description="Outfit preferences")
    favorite_colors: list[str] = Field(description="Favorite colors")
    dislikes: list[str] = Field(description="Disliked items or styles")


class WardrobeItem(BaseModel):
    id: str = Field(description="Unique ID of the wardrobe item")
    owner: str = Field(description="Name of the child who owns the item")
    category: str = Field(description="Item category (shirt, bottom, shoes, layer, dress)")
    color: str = Field(description="Color of the item")
    season: str = Field(description="Season category (spring/summer, fall/winter, all, etc.)")
    warmth_level: int = Field(description="Warmth rating from 1 (lightest) to 5 (warmest)")
    tags: list[str] = Field(description="Descriptive tags for the item")


class WeatherAnalysis(BaseModel):
    conditions: str = Field(description="Overall weather conditions (e.g. sunny, rainy, cold)")
    temperature: str = Field(description="Temperature or description of temperature")
    recommended_warmth: int = Field(description="Scale of 1 (lightest) to 5 (warmest) for recommended clothing warmth")
    requires_rain_gear: bool = Field(description="Whether rain gear or waterproof clothing is required")


class SchoolDayAnalysis(BaseModel):
    constraints: list[str] = Field(description="Constraints or special requirements (e.g. gym day requires sneakers)")
    activities: list[str] = Field(description="Special activities or schedule details (e.g., gym, art, field trip, picture day)")
    style_guideline: str = Field(description="Overall guideline for today's outfits based on schedule")


class Outfit(BaseModel):
    shirt_top: str = Field(description="The chosen shirt or top from the wardrobe")
    bottom_or_dress: str = Field(description="The chosen bottom (pants/leggings/jeans/skirt) or dress")
    shoes: str = Field(description="The chosen shoes")
    optional_layer: str = Field(description="The chosen layer (hoodie/jacket/cardigan) or 'none'")
    reason: str = Field(description="Explanation of why this outfit was selected")


class OutfitRecommendations(BaseModel):
    best_comfort: Outfit = Field(description="Outfit recommendation that prioritizes comfort")
    best_style: Outfit = Field(description="Outfit recommendation that prioritizes style")
    best_weather: Outfit = Field(description="Outfit recommendation that prioritizes weather suitability")


# ==========================================
# 2. Mock Data
# ==========================================

CHILD_PROFILES = {
    "emma": ChildProfile(
        name="Emma",
        age=11,
        preferences="casual comfortable outfits",
        favorite_colors=["blue", "purple"],
        dislikes=["dresses for regular school"]
    ),
    "mia": ChildProfile(
        name="Mia",
        age=7,
        preferences="soft comfortable clothes",
        favorite_colors=["pink", "purple"],
        dislikes=[]
    )
}

MOCK_WARDROBE = [
    # Emma's wardrobe
    WardrobeItem(id="e1", owner="Emma", category="shirt", color="blue", season="spring/summer", warmth_level=2, tags=["casual", "comfortable", "cotton"]),
    WardrobeItem(id="e2", owner="Emma", category="shirt", color="purple", season="all", warmth_level=2, tags=["comfortable", "graphic-tee"]),
    WardrobeItem(id="e3", owner="Emma", category="bottom", color="blue", season="all", warmth_level=3, tags=["denim", "jeans", "classic"]),
    WardrobeItem(id="e4", owner="Emma", category="bottom", color="grey", season="all", warmth_level=3, tags=["sweatpants", "cozy", "comfortable"]),
    WardrobeItem(id="e5", owner="Emma", category="shoes", color="black", season="all", warmth_level=2, tags=["sneakers", "running", "comfortable"]),
    WardrobeItem(id="e6", owner="Emma", category="layer", color="purple", season="fall/winter", warmth_level=4, tags=["hoodie", "fleece", "warm"]),
    WardrobeItem(id="e7", owner="Emma", category="layer", color="blue", season="fall/winter", warmth_level=4, tags=["jacket", "windbreaker"]),
    WardrobeItem(id="e8", owner="Emma", category="dress", color="yellow", season="summer", warmth_level=2, tags=["dress", "flowy"]),
    WardrobeItem(id="e9", owner="Emma", category="shoes", color="brown", season="summer", warmth_level=1, tags=["sandals", "open-toe"]),
    WardrobeItem(id="e10", owner="Emma", category="shoes", color="grey", season="winter", warmth_level=5, tags=["boots", "waterproof", "warm"]),
    
    # Mia's wardrobe
    WardrobeItem(id="m1", owner="Mia", category="shirt", color="pink", season="all", warmth_level=2, tags=["soft", "cotton", "heart-print"]),
    WardrobeItem(id="m2", owner="Mia", category="shirt", color="purple", season="spring/summer", warmth_level=2, tags=["soft", "unicorn", "comfortable"]),
    WardrobeItem(id="m3", owner="Mia", category="bottom", color="purple", season="all", warmth_level=2, tags=["leggings", "stretchy", "soft"]),
    WardrobeItem(id="m4", owner="Mia", category="bottom", color="pink", season="all", warmth_level=3, tags=["joggers", "fleece", "cozy"]),
    WardrobeItem(id="m5", owner="Mia", category="shoes", color="white", season="all", warmth_level=2, tags=["sneakers", "velcro", "comfortable"]),
    WardrobeItem(id="m6", owner="Mia", category="layer", color="pink", season="fall/winter", warmth_level=4, tags=["cardigan", "knit", "soft"]),
    WardrobeItem(id="m7", owner="Mia", category="layer", color="purple", season="fall/winter", warmth_level=5, tags=["puffer-jacket", "warm", "fluffy"]),
    WardrobeItem(id="m8", owner="Mia", category="dress", color="pink", season="spring/summer", warmth_level=2, tags=["dress", "soft", "cotton"]),
    WardrobeItem(id="m9", owner="Mia", category="shoes", color="silver", season="all", warmth_level=1, tags=["flats", "sparkly"]),
]


# ==========================================
# 3. Workflow Nodes
# ==========================================

def load_child_profile(ctx: Context, node_input: types.Content) -> Event:
    """Step 1: Parse the user prompt to identify which child profile to load."""
    logger.info("Node: load_child_profile | Child: Unknown | Status: STARTED")
    try:
        text = ""
        if node_input and node_input.parts:
            text = " ".join([p.text for p in node_input.parts if p.text])
        
        # Simple, fast keyword matching to decide between Emma and Mia
        text_lower = text.lower()
        if "mia" in text_lower:
            selected_name = "Mia"
        else:
            # Default fallback to Emma
            selected_name = "Emma"
            
        profile = CHILD_PROFILES[selected_name.lower()]
        
        logger.info(f"Node: load_child_profile | Child: {selected_name} | Status: COMPLETED")
        return Event(
            output=profile.model_dump(),
            state={
                "child_profile": profile.model_dump(),
                "original_query": text
            }
        )
    except Exception as e:
        logger.error(f"Node: load_child_profile | Child: Unknown | Status: FAILED | Error: {str(e)}")
        raise


def load_wardrobe_items(ctx: Context, node_input: dict) -> Event:
    """Step 2: Filter and load mock wardrobe items for the selected child."""
    name = node_input.get("name", "Unknown")
    logger.info(f"Node: load_wardrobe_items | Child: {name} | Status: STARTED")
    try:
        items = [item.model_dump() for item in MOCK_WARDROBE if item.owner.lower() == name.lower()]
        logger.info(f"Node: load_wardrobe_items | Child: {name} | Status: COMPLETED")
        return Event(
            output=items,
            state={"wardrobe_items": items}
        )
    except Exception as e:
        logger.error(f"Node: load_wardrobe_items | Child: {name} | Status: FAILED | Error: {str(e)}")
        raise


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
    output_key="weather_analysis"
)


async def analyze_weather(ctx: Context, node_input: Any) -> AsyncGenerator[Event, None]:
    child_name = ctx.state.get("child_profile", {}).get("name", "Unknown")
    logger.info(f"Node: analyze_weather | Child: {child_name} | Status: STARTED")
    try:
        async for event in _analyze_weather.run(ctx=ctx, node_input=node_input):
            yield event
        logger.info(f"Node: analyze_weather | Child: {child_name} | Status: COMPLETED")
    except Exception as e:
        logger.error(f"Node: analyze_weather | Child: {child_name} | Status: FAILED | Error: {str(e)}")
        raise


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
    output_key="school_day_analysis"
)


async def analyze_school_day(ctx: Context, node_input: Any) -> AsyncGenerator[Event, None]:
    child_name = ctx.state.get("child_profile", {}).get("name", "Unknown")
    logger.info(f"Node: analyze_school_day | Child: {child_name} | Status: STARTED")
    try:
        async for event in _analyze_school_day.run(ctx=ctx, node_input=node_input):
            yield event
        logger.info(f"Node: analyze_school_day | Child: {child_name} | Status: COMPLETED")
    except Exception as e:
        logger.error(f"Node: analyze_school_day | Child: {child_name} | Status: FAILED | Error: {str(e)}")
        raise


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
    output_key="recommendations"
)


async def recommend_outfits(ctx: Context, node_input: Any) -> AsyncGenerator[Event, None]:
    child_name = ctx.state.get("child_profile", {}).get("name", "Unknown")
    logger.info(f"Node: recommend_outfits | Child: {child_name} | Status: STARTED")
    try:
        async for event in _recommend_outfits.run(ctx=ctx, node_input=node_input):
            yield event
        logger.info(f"Node: recommend_outfits | Child: {child_name} | Status: COMPLETED")
    except Exception as e:
        logger.error(f"Node: recommend_outfits | Child: {child_name} | Status: FAILED | Error: {str(e)}")
        raise


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
* **Top:** {best_comfort.get('shirt_top')}
* **Bottom/Dress:** {best_comfort.get('bottom_or_dress')}
* **Shoes:** {best_comfort.get('shoes')}
* **Layer:** {best_comfort.get('optional_layer')}
* **Why:** {best_comfort.get('reason')}

#### 2. ✨ Best for Style
* **Top:** {best_style.get('shirt_top')}
* **Bottom/Dress:** {best_style.get('bottom_or_dress')}
* **Shoes:** {best_style.get('shoes')}
* **Layer:** {best_style.get('optional_layer')}
* **Why:** {best_style.get('reason')}

#### 3. 🌤️ Best for Weather
* **Top:** {best_weather.get('shirt_top')}
* **Bottom/Dress:** {best_weather.get('bottom_or_dress')}
* **Shoes:** {best_weather.get('shoes')}
* **Layer:** {best_weather.get('optional_layer')}
* **Why:** {best_weather.get('reason')}
"""

        yield Event(
            content=types.Content(
                role='model',
                parts=[types.Part.from_text(text=md_text)]
            )
        )
        yield Event(output=md_text)
        logger.info(f"Node: final_response | Child: {child_name} | Status: COMPLETED")
    except Exception as e:
        logger.error(f"Node: final_response | Child: {child_name} | Status: FAILED | Error: {str(e)}")
        raise


# ==========================================
# 4. Root Agent Workflow Definition
# ==========================================

root_agent = Workflow(
    name="smart_school_stylist",
    edges=[
        ('START', load_child_profile),
        (load_child_profile, load_wardrobe_items),
        (load_wardrobe_items, analyze_weather),
        (analyze_weather, analyze_school_day),
        (analyze_school_day, recommend_outfits),
        (recommend_outfits, final_response),
    ],
    description="A multi-agent assistant that helps children choose school outfits based on weather, schedule, and preferences.",
)

app = App(
    root_agent=root_agent,
    name="app",
)
