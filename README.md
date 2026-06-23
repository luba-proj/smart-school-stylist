# Smart School Stylist 👗🎒

An AI-powered concierge agent that helps parents and children choose school outfits based on weather, schedule, and personal preferences, reducing morning friction.

## Competition Track: Concierge Agents

Smart School Stylist is built under the **Concierge Agents** track. It serves as a personal styling concierge that handles the daily decision-making process of selecting outfits, factoring in multiple complex rules (weather suitability, school schedules like gym or picture days, and personal style/dislike constraints).

---

## Architecture Overview

The system is designed around a multi-agent Directed Acyclic Graph (DAG) orchestration pattern using **Google ADK 2.0**. The FastAPI backend wraps the ADK workflow, enabling streaming of recommendations using Server-Sent Events (SSE). OpenTelemetry is utilized for tracing, and Cloud Logging tracks feedback.

### Request Flow
1. **User Query**: The user provides a natural language query specifying the child (e.g. Emma or Mia), schedule, and weather.
2. **Context Resolution**: The workflow starts, loading the child's profile and wardrobe.
3. **LLM Extraction**: Gemini models analyze weather queries and schedule details to generate styling guidelines.
4. **Style Recommendations**: A dedicated recommendation agent selects three outfits (Comfort, Style, Weather) from the wardrobe following strict constraints.
5. **Formatting & Streaming**: The final node formats the recommendations as Markdown and streams them via SSE.

### Workflow Diagram

```mermaid
graph LR
    START([START]) --> LoadProfile[load_child_profile]
    LoadProfile --> LoadWardrobe[load_wardrobe_items]
    LoadWardrobe --> AnalyzeWeather[analyze_weather]
    AnalyzeWeather --> AnalyzeSchool[analyze_school_day]
    AnalyzeSchool --> Recommend[recommend_outfits]
    Recommend --> FinalResponse[final_response]
    FinalResponse --> END([END])
```

---

## Agent Inventory

| Node Name | Node Type | Responsibility | Inputs | Outputs | External Services / Models |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`load_child_profile`** | Utility | Parses the user query to select and load the child's profile. | User Query | Child Profile Dict | None |
| **`load_wardrobe_items`** | Utility | Filters the available wardrobe items matching the selected child. | Child Profile Dict | list[WardrobeItem] | None |
| **`analyze_weather`** | LLM Agent | Extracts weather conditions, temperature, warmth level, and rain gear requirement. | Weather/User Query | WeatherAnalysis schema | Gemini LLM (`gemini-flash-latest`) |
| **`analyze_school_day`** | LLM Agent | Identifies school activities, constraints (e.g., sneakers for PE), and style guidelines. | User Query, Child Profile | SchoolDayAnalysis schema | Gemini LLM (`gemini-flash-latest`) |
| **`recommend_outfits`** | LLM Agent | Selects 3 outfits (Comfort, Style, Weather) from wardrobe respecting constraints. | Profile, Wardrobe, Weather, Schedule | OutfitRecommendations schema | Gemini LLM (`gemini-flash-latest`) |
| **`final_response`** | Utility | Formats recommendations as nice user-facing Markdown and streams events. | Outfit recommendations | Markdown string | None |

---

## Project Structure

```
smart-school-stylist/
├── app/                      # Core agent code
│   ├── agent.py              # Main agent logic
│   └── app_utils/            # App utilities and helpers
├── tests/                    # Unit, integration, and load tests
│   └── eval/                 # Evaluation dataset (basic-dataset.json)
├── GEMINI.md                 # AI-assisted development guide
├── SECURITY.md               # Security disclosure policy
├── PROJECT_DOCUMENTATION.md  # Detailed audit & architecture review
└── pyproject.toml            # Project dependencies
```

> 💡 **Tip:** Use [Gemini CLI](https://github.com/google-gemini/gemini-cli) for AI-assisted development - project context is pre-configured in `GEMINI.md`.

---

## Demo Prompts

- "Recommend a school outfit for Emma. It's a sunny day and she has PE class."
- "Mia has art class on a chilly day. What should she wear?"
- "It's cold and rainy today, and Emma has picture day. Help her choose an outfit."

---

## How to Run Locally

### Prerequisites
- Python 3.11+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- [google-agents-cli](https://github.com/google-gemini/agents-cli)
- **Google Cloud SDK**: For GCP services - [Install](https://cloud.google.com/sdk/docs/install)

### Setup
1. Clone the repository and navigate to the project directory:
   ```bash
   cd smart-school-stylist
   ```
2. Install dependencies:
   ```bash
   uv tool install google-agents-cli
   agents-cli install
   ```
3. Set your Gemini API key:
   - On Windows (PowerShell):
     ```powershell
     $env:GEMINI_API_KEY="your_api_key_here"
     ```
   - On Linux/macOS:
     ```bash
     export GEMINI_API_KEY="your_api_key_here"
     ```

### Running the App
- Launch the interactive local development playground:
  ```bash
  agents-cli playground
  ```
- Alternatively, run the FastAPI web server:
  ```bash
  uv run uvicorn app.fast_api_app:app --host 127.0.0.1 --port 8000 --reload
  ```

---

## Commands Reference

| Command              | Description                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `agents-cli install` | Install dependencies using uv                                                         |
| `agents-cli playground` | Launch local development environment                                                  |
| `agents-cli lint`    | Run code quality checks                                                               |
| `agents-cli eval`    | Evaluate agent behavior (generate, grade, analyze, and more — see `agents-cli eval --help`) |
| `uv run pytest tests` | Run the test suite (unit and integration tests)                                        |

### 🛠️ Project Management

| Command | What It Does |
|---------|--------------|
| `agents-cli scaffold enhance` | Add CI/CD pipelines and Terraform infrastructure |
| `agents-cli infra cicd` | One-command setup of entire CI/CD pipeline + infrastructure |
| `agents-cli scaffold upgrade` | Auto-upgrade to latest version while preserving customizations |

---

## Deployment & Production

```bash
gcloud config set project <your-project-id>
agents-cli deploy
```

To add CI/CD and Terraform, run `agents-cli scaffold enhance`.
To set up your production infrastructure, run `agents-cli infra cicd`.

### Observability
Built-in telemetry exports to Cloud Trace, BigQuery, and Cloud Logging.

---

## Current MVP Status

- **ADK 2.0 Graph Workflow**: Multi-agent chain implemented cleanly with standard Pydantic schema validation.
- **Rule Enforcement**: Core constraints (Emma's dislike of dresses, activewear/sneaker requirements for PE, favorite color matching) are successfully integrated and verified.
- **Structured Observability**: Logging added to every workflow node tracing start, completion, and failure statuses without exposing private PII data.
- **20 Realistic Evaluation Cases**: An expanded evaluation dataset in `tests/eval/datasets/basic-dataset.json` covers 20 scenario-specific test cases for offline quality checks.

---

## Future Roadmap

1. **Database Integration**: Migrate mock wardrobes and child profiles to **Google Cloud Firestore**.
2. **User Authentication**: Implement **Firebase Authentication** JWT middleware in the FastAPI server.
3. **MCP Tool Services**: Build MCP servers to query external APIs (e.g. OpenWeatherMap, Google Calendar) to fetch weather and schedules automatically.
4. **Smart Wardrobe Scanner**: Add a signed GCS upload workflow + Gemini Vision agent to auto-classify and tag photos of clothes.
5. **Mobile Application**: Build a **React Native / Expo** mobile client for parent/child interaction.
