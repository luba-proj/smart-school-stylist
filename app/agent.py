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

from google.adk.apps import App
from app.workflows.outfit_workflow import root_agent, final_response
from app.agents.profile_agent import load_child_profile
from app.agents.wardrobe_agent import load_wardrobe_items
from app.data.mock_profiles import CHILD_PROFILES

app = App(
    root_agent=root_agent,
    name="app",
)

__all__ = [
    "root_agent",
    "app",
    "final_response",
    "load_child_profile",
    "load_wardrobe_items",
    "CHILD_PROFILES",
]
