# Smart School Stylist

A multi-agent AI assistant built with Google ADK that helps children choose personalized school outfits based on weather, school schedule, wardrobe items, and personal preferences.

## Project Track

Concierge Agents

## What It Does

Smart School Stylist helps families reduce morning stress by recommending school outfits for children.

The agent considers:
- Child profile and preferences
- Available wardrobe items
- Weather conditions
- School activities such as PE, art, regular school, or special events

## Current MVP

The current version uses mock wardrobe data for Emma and Mia.

It returns three outfit recommendations:
1. Best for Comfort
2. Best for Style
3. Best for Weather

## Agent Workflow

User request  
→ Load child profile  
→ Load wardrobe items  
→ Analyze weather  
→ Analyze school day  
→ Recommend outfits  
→ Format final response

## Tech Stack

- Google ADK
- Agents CLI
- Gemini
- Python
- Pydantic
- Pytest

## Demo Prompt

```text
Suggest an outfit for Emma. It is 60°F and rainy today. She has PE class.
Simple ReAct agent
Agent generated with `agents-cli` version `0.5.0`

## Project Structure

```
smart-school-stylist/
├── app/         # Core agent code
│   ├── agent.py               # Main agent logic
│   └── app_utils/             # App utilities and helpers
├── tests/                     # Unit, integration, and load tests
├── GEMINI.md                  # AI-assisted development guide
└── pyproject.toml             # Project dependencies
```

> 💡 **Tip:** Use [Gemini CLI](https://github.com/google-gemini/gemini-cli) for AI-assisted development - project context is pre-configured in `GEMINI.md`.

## Requirements

Before you begin, ensure you have:
- **uv**: Python package manager (used for all dependency management in this project) - [Install](https://docs.astral.sh/uv/getting-started/installation/) ([add packages](https://docs.astral.sh/uv/concepts/dependencies/) with `uv add <package>`)
- **agents-cli**: Agents CLI - Install with `uv tool install google-agents-cli`
- **Google Cloud SDK**: For GCP services - [Install](https://cloud.google.com/sdk/docs/install)


## Quick Start

Install `agents-cli` and its skills if not already installed:

```bash
uvx google-agents-cli setup
```

Install required packages:

```bash
agents-cli install
```

Test the agent with a local web server:

```bash
agents-cli playground
```

You can also use features from the [ADK](https://adk.dev/) CLI with `uv run adk`.

## Commands

| Command              | Description                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `agents-cli install` | Install dependencies using uv                                                         |
| `agents-cli playground` | Launch local development environment                                                  |
| `agents-cli lint`    | Run code quality checks                                                               |
| `agents-cli eval`    | Evaluate agent behavior (generate, grade, analyze, and more — see `agents-cli eval --help`) |
| `uv run pytest tests/unit tests/integration` | Run unit and integration tests                                                        |

## 🛠️ Project Management

| Command | What It Does |
|---------|--------------|
| `agents-cli scaffold enhance` | Add CI/CD pipelines and Terraform infrastructure |
| `agents-cli infra cicd` | One-command setup of entire CI/CD pipeline + infrastructure |
| `agents-cli scaffold upgrade` | Auto-upgrade to latest version while preserving customizations |

---

## Development

Edit your agent logic in `app/agent.py` and test with `agents-cli playground` - it auto-reloads on save.

## Deployment

```bash
gcloud config set project <your-project-id>
agents-cli deploy
```

To add CI/CD and Terraform, run `agents-cli scaffold enhance`.
To set up your production infrastructure, run `agents-cli infra cicd`.

## Observability

Built-in telemetry exports to Cloud Trace, BigQuery, and Cloud Logging.
