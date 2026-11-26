"""Serve checkpoint forms locally and save answers into their HTML files."""
import argparse
from html import escape
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, HTTPServer
import json
import os
from pathlib import Path
import re
import tempfile
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent
CHECKPOINTS = ROOT / "learning/checkpoints"
LESSON = re.compile(r"/learning/checkpoints/([A-Za-z0-9_-]+\.html)")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = unquote(urlsplit(self.path).path)
        allowed = (
            LESSON.fullmatch(path)
            or re.fullmatch(r"/learning/checkpoints/[A-Za-z0-9_-]+\.md", path)
            or path == "/learning/answers.js"
            or re.fullmatch(r"/experiments/[A-Za-z0-9_.-]+\.(ll|td)", path)
        )
        if not allowed or not (ROOT / path.lstrip("/")).resolve().is_relative_to(ROOT):
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):
        match = LESSON.fullmatch(self.path)
        expected_host = f"127.0.0.1:{self.server.server_port}"
        if (
            not match
            or self.headers.get("Host") != expected_host
            or self.headers.get("Origin") != f"http://{expected_host}"
            or self.headers.get_content_type() != "application/json"
        ):
            self.send_error(HTTPStatus.FORBIDDEN)
            return

        try:
            size = int(self.headers.get("Content-Length", "0"))
            if not 0 < size <= 1024 * 1024:
                raise ValueError("Invalid request size")
            answers = json.loads(self.rfile.read(size))
            if not isinstance(answers, dict) or not answers:
                raise ValueError("Expected answers")
            lesson = CHECKPOINTS / match[1]
            if lesson.is_symlink():
                raise ValueError("Expected a local lesson file")
            source = lesson.read_text(encoding="utf-8")
            for name, value in answers.items():
                if not re.fullmatch(r"[A-Za-z0-9_-]+", name) or not isinstance(value, str):
                    raise ValueError("Invalid answer field")
                pattern = rf'(<textarea\b[^>]*\bname="{name}"[^>]*>).*?(</textarea>)'
                source, count = re.subn(
                    pattern, lambda m: m[1] + "\n" + escape(value) + m[2], source, flags=re.S
                )
                if count != 1:
                    raise ValueError("Unknown or duplicate answer field")
            with tempfile.NamedTemporaryFile(
                mode="w", encoding="utf-8", dir=CHECKPOINTS, delete=False
            ) as output:
                temporary = Path(output.name)
                try:
                    output.write(source)
                    output.flush()
                    os.chmod(temporary, lesson.stat().st_mode & 0o777)
                    os.replace(temporary, lesson)
                finally:
                    temporary.unlink(missing_ok=True)
        except ValueError:
            self.send_error(HTTPStatus.BAD_REQUEST)
            return
        except OSError:
            self.send_error(HTTPStatus.INTERNAL_SERVER_ERROR)
            return

        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    with HTTPServer(("127.0.0.1", args.port), Handler) as server:
        print(f"http://127.0.0.1:{server.server_port}/learning/checkpoints/Unit-1.html", flush=True)
        server.serve_forever()
