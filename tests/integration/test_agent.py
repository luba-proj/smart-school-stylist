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

import google.auth
import pytest
from google.adk.agents.run_config import RunConfig, StreamingMode
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from app.agent import root_agent


def has_credentials() -> bool:
    if (
        os.environ.get("GOOGLE_API_KEY") == "mock-api-key"
        or os.environ.get("GOOGLE_CLOUD_PROJECT") == "mock-project-id"
    ):
        return False
    if os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"):
        return True
    try:
        google.auth.default()
        return True
    except Exception:
        return False


@pytest.mark.skipif(
    not has_credentials(), reason="No Google Cloud credentials or API Key available"
)
def test_agent_stream() -> None:
    """
    Integration test for the agent stream functionality.
    Tests that the agent returns valid streaming responses.
    """

    session_service = InMemorySessionService()

    session = session_service.create_session_sync(user_id="test_user", app_name="test")
    runner = Runner(agent=root_agent, session_service=session_service, app_name="test")

    message = types.Content(
        role="user", parts=[types.Part.from_text(text="Why is the sky blue?")]
    )

    events = list(
        runner.run(
            new_message=message,
            user_id="test_user",
            session_id=session.id,
            run_config=RunConfig(streaming_mode=StreamingMode.SSE),
        )
    )
    assert len(events) > 0, "Expected at least one message"

    has_text_content = False
    for event in events:
        if (
            event.content
            and event.content.parts
            and any(part.text for part in event.content.parts)
        ):
            has_text_content = True
            break
    assert has_text_content, "Expected at least one message with text content"


@pytest.mark.skipif(
    not has_credentials(), reason="No Google Cloud credentials or API Key available"
)
def test_emma_dress_dislike_constraint() -> None:
    """
    Integration test to verify that Emma is not recommended a dress
    on a regular school day, in accordance with her profile dislikes.
    """
    session_service = InMemorySessionService()
    session = session_service.create_session_sync(user_id="test_user", app_name="test")
    runner = Runner(agent=root_agent, session_service=session_service, app_name="test")

    message = types.Content(
        role="user",
        parts=[
            types.Part.from_text(
                text="Recommend a comfortable school outfit for Emma today."
            )
        ],
    )

    list(
        runner.run(
            new_message=message,
            user_id="test_user",
            session_id=session.id,
            run_config=RunConfig(streaming_mode=StreamingMode.SSE),
        )
    )

    # Fetch session from service to inspect the final state
    updated_session = session_service.get_session_sync(
        app_name="test", user_id="test_user", session_id=session.id
    )
    assert updated_session is not None, "Session should be found"
    state = updated_session.state

    recommendations = state.get("recommendations")
    assert recommendations is not None, (
        "Recommendations should be populated in session state"
    )

    # Verify comfort, style, and weather outfits do not contain dresses
    for category in ["best_comfort", "best_style", "best_weather"]:
        outfit = recommendations.get(category, {})
        bottom_or_dress = outfit.get("bottom_or_dress", "").lower()
        assert "dress" not in bottom_or_dress, (
            f"Emma should not be recommended a dress in {category}"
        )


@pytest.mark.skipif(
    not has_credentials(), reason="No Google Cloud credentials or API Key available"
)
def test_emma_gym_sneakers_constraint() -> None:
    """
    Integration test to verify that Emma is recommended sneakers
    when she has a PE/gym class, in accordance with school day constraints.
    """
    session_service = InMemorySessionService()
    session = session_service.create_session_sync(user_id="test_user", app_name="test")
    runner = Runner(agent=root_agent, session_service=session_service, app_name="test")

    message = types.Content(
        role="user",
        parts=[
            types.Part.from_text(
                text="What should Emma wear? She has PE/gym class today."
            )
        ],
    )

    list(
        runner.run(
            new_message=message,
            user_id="test_user",
            session_id=session.id,
            run_config=RunConfig(streaming_mode=StreamingMode.SSE),
        )
    )

    # Fetch session from service to inspect the final state
    updated_session = session_service.get_session_sync(
        app_name="test", user_id="test_user", session_id=session.id
    )
    assert updated_session is not None, "Session should be found"
    state = updated_session.state

    recommendations = state.get("recommendations")
    assert recommendations is not None, (
        "Recommendations should be populated in session state"
    )

    # Verify comfort, style, and weather outfits all recommend sneakers
    for category in ["best_comfort", "best_style", "best_weather"]:
        outfit = recommendations.get(category, {})
        shoes = outfit.get("shoes", "").lower()
        assert "sneaker" in shoes, (
            f"Emma must be recommended sneakers in {category} on gym days"
        )
