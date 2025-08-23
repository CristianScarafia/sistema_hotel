from .base import *
import os
from ..logging import *

# NO cargar archivo .env en producción - usar solo variables de entorno de Railway

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

CSRF_TRUSTED_ORIGINS = ["https://hotelbermudas.up.railway.app"]


ALLOWED_HOSTS = ["*"]

# Configuración de base de datos usando DATABASE_URL
import dj_database_url

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    # Usar DATABASE_URL de Railway
    DATABASES = {"default": dj_database_url.parse(DATABASE_URL)}
else:
    # Fallback a configuración manual de PostgreSQL
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("PGDATABASE") or os.getenv("POSTGRES_DB"),
            "USER": os.getenv("PGUSER") or os.getenv("POSTGRES_USER"),
            "PASSWORD": os.getenv("PGPASSWORD") or os.getenv("POSTGRES_PASSWORD"),
            "HOST": os.getenv("PGHOST") or os.getenv("POSTGRES_HOST"),
            "PORT": os.getenv("PGPORT") or os.getenv("POSTGRES_PORT"),
            "OPTIONS": {
                "client_encoding": "UTF8",
            },
        }
    }
"""
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),  # O la IP del servidor PostgreSQL
        'PORT': os.environ.get('DB_PORT'),  # Puerto por defecto de PostgreSQL
        'OPTIONS': {
            'client_encoding': 'UTF8',  # Asegura que la conexión se haga en UTF-8
        },
    }
}"""


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "file": {
            "level": "ERROR",
            "class": "logging.FileHandler",
            "filename": "django_error.log",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["file"],
            "level": "ERROR",
            "propagate": True,
        },
    },
}

STATIC_ROOT = Path.joinpath(BASE_DIR, "staticfiles")
