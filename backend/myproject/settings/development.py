# no accents ni enie in comments
import os
from .base import *  # noqa: F401,F403
from .base import BASE_DIR

DEBUG = True
ALLOWED_HOSTS = ["*", "localhost", "127.0.0.1"]

# force a non-empty secret for dev to avoid ImproperlyConfigured
SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-unsafe-secret"

# Use SQLite for local development
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Configuración de archivos estáticos para desarrollo
STATICFILES_FINDERS = [
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
]

# Configuración para servir archivos estáticos en desarrollo
if DEBUG:
    STATICFILES_DIRS = [
        os.path.join(BASE_DIR, "reservas", "static"),
    ]

    # Configuración para servir archivos estáticos en desarrollo
    STATIC_URL = "/static/"
    STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

    # Configuración para servir archivos estáticos directamente en desarrollo
    MIDDLEWARE = list(MIDDLEWARE)
    if "whitenoise.middleware.WhiteNoiseMiddleware" not in MIDDLEWARE:
        MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")

    # Configuración de WhiteNoise para desarrollo
    WHITENOISE_USE_FINDERS = True
    WHITENOISE_AUTOREFRESH = True
