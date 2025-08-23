#!/usr/bin/env python3
"""
Script simple de health check para Railway
"""
import os
import sys
import socket
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading
import time


class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health/":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            response = {
                "status": "healthy",
                "service": "hotel-backend",
                "message": "Service is running",
                "timestamp": time.time(),
            }
            self.wfile.write(str(response).encode())
        else:
            self.send_response(404)
            self.end_headers()


def run_health_server():
    """Ejecutar servidor de health check en puerto 8000"""
    try:
        server = HTTPServer(("0.0.0.0", 8000), HealthCheckHandler)
        print("Health check server running on port 8000")
        server.serve_forever()
    except Exception as e:
        print(f"Error starting health server: {e}")
        sys.exit(1)


if __name__ == "__main__":
    run_health_server()
