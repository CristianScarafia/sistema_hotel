#!/bin/sh
set -euo pipefail

export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-myproject.settings.development}"

# wait for db tcp only
python - <<'PY'
import os, time, socket
host=os.environ['DB_HOST']; port=int(os.environ.get('DB_PORT','5432'))
for _ in range(60):
    try:
        with socket.create_connection((host, port), timeout=3): break
    except OSError:
        print("Database unavailable, waiting 1 second...")
        time.sleep(1)
else:
    raise SystemExit("DB not reachable")
PY

echo "collectstatic..."
python manage.py collectstatic --noinput || true

echo "migrate..."
python manage.py migrate --noinput

echo "gunicorn..."
exec gunicorn myproject.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 3 \
  --timeout 120
