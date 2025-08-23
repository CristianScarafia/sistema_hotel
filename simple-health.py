#!/usr/bin/env python3
"""
Health check muy simple que siempre responde exitosamente
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json


class SimpleHealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health/":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            response = {"status": "healthy"}
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        # Silenciar logs
        pass


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8000), SimpleHealthHandler)
    print("Simple health check server running on port 8000")
    server.serve_forever()
