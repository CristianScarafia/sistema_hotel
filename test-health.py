#!/usr/bin/env python3
"""
Health check tester for Django or any HTTP service.
- Defaults to http://127.0.0.1:${PORT:-8000}/health/
- Can target a full URL via --url or HEALTH_URL
- Exits 0 only on 2xx
"""
import os
import sys
import time
import argparse
import requests


def test_health(
    url: str, attempts: int, timeout: float, method: str, sleep: float, verify_tls: bool
) -> bool:
    print(f"Testing: {url} with {method.upper()} x{attempts}")
    delay = sleep
    for i in range(1, attempts + 1):
        try:
            resp = requests.request(
                method.upper(), url, timeout=timeout, verify=verify_tls
            )
            ok = 200 <= resp.status_code < 300
            print(f"[{i}/{attempts}] status={resp.status_code} ok={ok}")
            # Print a short body snippet for debugging
            body = (resp.text or "").strip().replace("\n", " ")
            if body:
                print(f"  body: {body[:200] + ('...' if len(body) > 200 else '')}")
            if ok:
                return True
        except requests.exceptions.ConnectionError as e:
            print(f"[{i}/{attempts}] connection error: {e}")
        except requests.exceptions.Timeout:
            print(f"[{i}/{attempts}] timeout after {timeout}s")
        except Exception as e:
            print(f"[{i}/{attempts}] error: {e}")
        time.sleep(delay)
        delay *= 1.5  # simple backoff
    return False


def main():
    parser = argparse.ArgumentParser(
        description="Probe a health endpoint until it returns 2xx."
    )
    parser.add_argument(
        "--url", help="Full URL (overrides host/port/path). Also read from HEALTH_URL."
    )
    parser.add_argument(
        "--host",
        default=os.getenv("HEALTH_HOST", "127.0.0.1"),
        help="Host if --url not provided.",
    )
    parser.add_argument(
        "--port", default=os.getenv("PORT", "8000"), help="Port if --url not provided."
    )
    parser.add_argument(
        "--path",
        default=os.getenv("HEALTH_PATH", "/health/"),
        help="Path if --url not provided.",
    )
    parser.add_argument(
        "--attempts",
        type=int,
        default=int(os.getenv("HEALTH_ATTEMPTS", "10")),
        help="Max attempts.",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=float(os.getenv("HEALTH_TIMEOUT", "5")),
        help="Per request timeout seconds.",
    )
    parser.add_argument(
        "--sleep",
        type=float,
        default=float(os.getenv("HEALTH_SLEEP", "2")),
        help="Initial sleep between attempts.",
    )
    parser.add_argument(
        "--method",
        default=os.getenv("HEALTH_METHOD", "GET"),
        choices=["GET", "HEAD"],
        help="HTTP method.",
    )
    parser.add_argument(
        "--insecure", action="store_true", help="Do not verify TLS certs."
    )
    args = parser.parse_args()

    url = args.url or os.getenv("HEALTH_URL")
    if not url:
        # Build from host/port/path
        path = args.path if args.path.startswith("/") else "/" + args.path
        url = f"http://{args.host}:{args.port}{path}"

    ok = test_health(
        url=url,
        attempts=args.attempts,
        timeout=args.timeout,
        method=args.method,
        sleep=args.sleep,
        verify_tls=not args.insecure,
    )
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
