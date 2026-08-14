# Power BI Report Generator

Power BI Report Generator is an AI-assisted workflow that converts business files into a grounded report specification, an editable pen.dev layout, and an agent-ready Power BI build package.

The application currently produces a structured build package rather than a finished `.pbix` file. The next product milestone is to execute that package through a Power BI authoring worker and return a validated PBIP project.

## Current workflow

1. Upload CSV, TSV, PDF, DOCX, XLSX, PPTX, text, or image sources.
2. Extract source knowledge and tabular previews.
3. Generate a source-grounded Power BI requirements contract.
4. Create and refine a real pen.dev layout through Codex and Pencil MCP.
5. Export source data, knowledge, requirements, theme, layout, and build instructions.

The React application lives in [`frontend/`](frontend/README.md). The optional DeepSeek Harness sidecar lives in [`agent-runtime/`](agent-runtime/README.md).

## Run the application

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

Add `DEEPSEEK_API_KEY` to `frontend/.env`. The default `AI_RUNTIME_MODE=direct` preserves the existing direct DeepSeek integration.

## Run with DeepSeek Harness

DeepSeek Harness is integrated behind a runtime boundary so the application does not depend on its internal APIs. Start the optional sidecar and select it in `frontend/.env`:

```bash
python -m venv .venv
. .venv/bin/activate
python -m pip install -r agent-runtime/requirements.txt
python agent-runtime/server.py
```

```dotenv
AI_RUNTIME_MODE=harness
DSH_RUNTIME_URL=http://127.0.0.1:8090
```

See [`agent-runtime/README.md`](agent-runtime/README.md) for configuration, security boundaries, and platform notes.

## Validate changes

```bash
cd frontend
npm test
npm run build
```

## Architecture direction

The existing UI and deterministic Power BI validation logic remain application-owned. DeepSeek Harness is responsible for durable agent sessions and will incrementally orchestrate specialized discovery, requirements, design, build, and QA agents. Power BI Desktop-dependent work will run on a separate Windows worker.

See [`docs/architecture.md`](docs/architecture.md) for the target architecture and migration sequence.

## License

The application template under `frontend/` includes its original MIT license. Before distributing the complete repository as a product, add a repository-wide license covering project-owned code and confirm the license of generated and third-party assets.
