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

from unittest.mock import MagicMock

import pytest
from google.adk.agents.context import Context
from google.genai import types

from app.agent import (
    CHILD_PROFILES,
    final_response,
    load_child_profile,
    load_wardrobe_items,
)


def test_load_child_profile_emma():
    ctx = MagicMock(spec=Context)
    # Mock types.Content input
    node_input = types.Content(
        role="user", parts=[types.Part.from_text(text="What should Emma wear today?")]
    )

    event = load_child_profile(ctx, node_input)
    assert event.output["name"] == "Emma"
    assert event.actions.state_delta["child_profile"]["name"] == "Emma"
    assert "emma" in event.actions.state_delta["original_query"].lower()


def test_load_child_profile_mia():
    ctx = MagicMock(spec=Context)
    # Mock types.Content input
    node_input = types.Content(
        role="user", parts=[types.Part.from_text(text="Help Mia pick an outfit.")]
    )

    event = load_child_profile(ctx, node_input)
    assert event.output["name"] == "Mia"
    assert event.actions.state_delta["child_profile"]["name"] == "Mia"
    assert "mia" in event.actions.state_delta["original_query"].lower()


def test_load_wardrobe_items_emma():
    ctx = MagicMock(spec=Context)
    emma_profile = CHILD_PROFILES["emma"].model_dump()

    event = load_wardrobe_items(ctx, emma_profile)
    items = event.output
    # All items should belong to Emma
    assert isinstance(items, list)
    assert len(items) > 0
    assert all(item["owner"] == "Emma" for item in items)
    # Check that sweatpants is in Emma's wardrobe
    assert any(item["id"] == "e4" for item in items)


def test_load_wardrobe_items_mia():
    ctx = MagicMock(spec=Context)
    mia_profile = CHILD_PROFILES["mia"].model_dump()

    event = load_wardrobe_items(ctx, mia_profile)
    items = event.output
    # All items should belong to Mia
    assert isinstance(items, list)
    assert len(items) > 0
    assert all(item["owner"] == "Mia" for item in items)
    # Check that pink cardigan/leggings is in Mia's wardrobe
    assert any(item["id"] == "m3" for item in items)


@pytest.mark.asyncio
async def test_final_response():
    ctx = MagicMock(spec=Context)
    ctx.state = {"child_profile": {"name": "Emma"}}

    recommendations = {
        "best_comfort": {
            "shirt_top": "Purple graphic-tee",
            "bottom_or_dress": "Grey sweatpants",
            "shoes": "Black sneakers",
            "optional_layer": "Purple hoodie",
            "reason": "Emma prefers comfortable sweatpants and tees.",
        },
        "best_style": {
            "shirt_top": "Blue cotton shirt",
            "bottom_or_dress": "Blue jeans",
            "shoes": "Black sneakers",
            "optional_layer": "none",
            "reason": "Classic denim style.",
        },
        "best_weather": {
            "shirt_top": "Purple graphic-tee",
            "bottom_or_dress": "Grey sweatpants",
            "shoes": "Black sneakers",
            "optional_layer": "Purple hoodie",
            "reason": "Warm layers for a cold day.",
        },
    }

    events = []
    async for event in final_response(ctx, recommendations):
        events.append(event)

    assert len(events) == 2
    # First event should be content for rendering
    assert events[0].content is not None
    # Second event should be the final output
    assert events[1].output is not None
    assert "Best for Comfort" in events[1].output
    assert "Emma" in events[1].output
