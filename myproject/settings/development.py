from .base import *
import os

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = "admin123"

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "sishotel"),
        "USER": os.getenv("POSTGRES_USER", "postgres"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "1234"),
        "HOST": os.getenv(
            "POSTGRES_HOST", "localhost"
        ),  # Se usará la variable de entorno
        "PORT": os.getenv("POSTGRES_PORT", "5431"),
        "OPTIONS": {
            "client_encoding": "UTF8",
        },
    }
}
