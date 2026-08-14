# DeepSeek Harness sidecar

This directory provides an optional runtime boundary between the Power BI Report Generator and DeepSeek Harness. The React/Vite application calls the sidecar server-side; browsers never call it directly.

The initial profile is deliberately tool-free. It supports source analysis, requirement analysis, and structured design reasoning without shell or filesystem access. Later profiles can add Pencil MCP and Power BI authoring tools with narrower permissions.

## Requirements

- Python 3.10 or later
- Linux x64, Linux arm64, or macOS arm64 supported by the published Harness runtime
- `DEEPSEEK_API_KEY`

## Install and run

```bash
python -m venv .venv
. .venv/bin/activate
python -m pip install -r agent-runtime/requirements.txt
export DEEPSEEK_API_KEY=sk-...
python agent-runtime/server.py
```

The server binds to `127.0.0.1:8090` by default.

Configure `frontend/.env`:

```dotenv
AI_RUNTIME_MODE=harness
DSH_RUNTIME_URL=http://127.0.0.1:8090
```

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `DSH_RUNTIME_HOST` | `127.0.0.1` | Sidecar bind address |
| `DSH_RUNTIME_PORT` | `8090` | Sidecar port |
| `DSH_PROVIDER` | `deepseek-official` | Harness provider route |
| `DSH_MODEL` | `deepseek-v4-flash` | Harness model |
| `DSH_MAX_TOKENS` | `12000` | Maximum output tokens per run |
| `DSH_CONTEXT_WINDOW` | `128000` | Model context metadata |
| `DSH_SESSION_ROOT` | `.harness-sessions` | Durable JSONL sessions |

## HTTP contract

`GET /health` returns runtime readiness.

`POST /v1/run` accepts:

```json
{
  "session_id": "pbi-analysis-123",
  "prompt": "Return the requested Power BI analysis as JSON."
}
```

The endpoint is intentionally loopback-only and has no user authentication. Do not expose it directly to a network. A hosted deployment must place it behind the authenticated project API.

## Windows build worker

This analyst profile does not run Power BI Desktop. The future build profile should dispatch Power BI Desktop and modeling MCP operations to a dedicated Windows worker while keeping project/session orchestration in Harness.
