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
import os
import google.auth
from google.adk.models import Gemini
from google.genai import types

logger = logging.getLogger("smart_school_stylist")

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

model = Gemini(
    model="gemini-flash-latest",
    retry_options=types.HttpRetryOptions(attempts=3),
)
