"""Small loopback HTTP adapter for the DeepSeek Harness Python SDK."""

from __future__ import annotations

import json
import os
import signal
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path
from typing import Any

from deepseek_harness import DeepSeekHarness


ROOT = Path(__file__).resolve().parent
MAX_REQUEST_BYTES = 1_000_000


def _package_version() -> str:
    try:
        return version("deepseek-harness-sdk")
    except PackageNotFoundError:
        return "unknown"


class HarnessRuntime:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._harness: DeepSeekHarness | None = None

    def _get_harness(self) -> DeepSeekHarness:
        if self._harness is None:
            workspace = Path(os.getenv("DSH_CWD", str(ROOT.parent))).resolve()
            session_root = Path(
                os.getenv("DSH_SESSION_ROOT", str(ROOT.parent / ".harness-sessions"))
            ).resolve()
            self._harness = DeepSeekHarness(
                provider=os.getenv("DSH_PROVIDER", "deepseek-official"),
                model=os.getenv("DSH_MODEL", "deepseek-v4-flash"),
                max_tokens=int(os.getenv("DSH_MAX_TOKENS", "12000")),
                cwd=str(workspace),
                session_root=str(session_root),
                cordis=str(ROOT / "cordis.yml"),
            )
        return self._harness

    def run(self, prompt: str, session_id: str) -> dict[str, Any]:
        with self._lock:
            result = self._get_harness().run(prompt, session_id=session_id)
        return {
            "session_id": result.session_id,
            "final_response": result.final_response,
            "finish_reason": result.finish_reason,
        }

    def close(self) -> None:
        if self._harness is not None:
            self._harness.close()
            self._harness = None


RUNTIME = HarnessRuntime()


class Handler(BaseHTTPRequestHandler):
    server_version = "PBIHarnessSidecar/0.1"

    def _send(self, status: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802
        if self.path != "/health":
            self._send(404, {"error": "Not found"})
            return
        configured = bool(os.getenv("DEEPSEEK_API_KEY", "").strip())
        self._send(
            200,
            {
                "status": "ready" if configured else "missing-credential",
                "configured": configured,
                "runtime": "deepseek-harness",
                "version": _package_version(),
                "model": os.getenv("DSH_MODEL", "deepseek-v4-flash"),
            },
        )

    def do_POST(self) -> None:  # noqa: N802
        if self.path != "/v1/run":
            self._send(404, {"error": "Not found"})
            return
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length <= 0 or content_length > MAX_REQUEST_BYTES:
                raise ValueError("Request body must be between 1 byte and 1 MB.")
            body = json.loads(self.rfile.read(content_length))
            prompt = str(body.get("prompt", "")).strip()
            session_id = str(body.get("session_id", "")).strip()
            if not prompt or len(prompt) > 800_000:
                raise ValueError("A prompt of at most 800,000 characters is required.")
            if not session_id or len(session_id) > 160:
                raise ValueError("A session_id of at most 160 characters is required.")
            self._send(200, RUNTIME.run(prompt, session_id))
        except (ValueError, json.JSONDecodeError) as exc:
            self._send(400, {"error": str(exc)})
        except Exception as exc:  # The HTTP boundary must return SDK failures as JSON.
            self._send(500, {"error": str(exc)})

    def log_message(self, format: str, *args: object) -> None:
        print(f"[harness-sidecar] {format % args}")


def main() -> None:
    host = os.getenv("DSH_RUNTIME_HOST", "127.0.0.1")
    port = int(os.getenv("DSH_RUNTIME_PORT", "8090"))
    server = ThreadingHTTPServer((host, port), Handler)

    def shutdown(_signum: int, _frame: object) -> None:
        threading.Thread(target=server.shutdown, daemon=True).start()

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)
    print(f"DeepSeek Harness sidecar listening on http://{host}:{port}")
    try:
        server.serve_forever()
    finally:
        RUNTIME.close()
        server.server_close()


if __name__ == "__main__":
    main()
