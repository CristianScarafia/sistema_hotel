# no accents ni enie in comments
import os
from .base import *  # noqa: F401,F403

DEBUG = True
ALLOWED_HOSTS = ["*", "localhost", "127.0.0.1"]

# force a non-empty secret for dev to avoid ImproperlyConfigured
SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-unsafe-secret"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME", "postgres"),
        "USER": os.environ.get("DB_USER", "postgres"),
        "PASSWORD": os.environ.get("DB_PASSWORD", "1234"),
        "HOST": os.environ.get("DB_HOST", "db"),
        "PORT": os.environ.get("DB_PORT", "5432"),
        "CONN_MAX_AGE": 60,
        "ATOMIC_REQUESTS": True,
    }
}
