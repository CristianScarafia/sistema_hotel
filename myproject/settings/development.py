# no accents ni enie en comments
import os
from .base import *  # noqa: F401,F403  # import all base settings safely

DEBUG = True
ALLOWED_HOSTS = ["*", "localhost", "127.0.0.1"]

# define DATABASES sin referenciar la variable importada para evitar F405/PyLance
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
