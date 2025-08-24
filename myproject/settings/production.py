from .base import *
import os
from ..logging import *

# NO cargar archivo .env en producción - usar solo variables de entorno de Railway

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Configuración CORS para permitir comunicación con frontend separado
CORS_ALLOWED_ORIGINS = [
    "https://hotelbermudas.up.railway.app",
    "https://sistemahotel-production-5a7f.up.railway.app",
    "https://hotel-frontend-production.up.railway.app",  # URL del frontend separado
    "https://hotel-frontend-dev.up.railway.app",        # URL de desarrollo del frontend
]

# Permitir credenciales en CORS
CORS_ALLOW_CREDENTIALS = True

# Configuración adicional de CORS para desarrollo
CORS_ALLOW_ALL_ORIGINS = os.environ.get('CORS_ALLOW_ALL_ORIGINS', 'False').lower() == 'true'

CSRF_TRUSTED_ORIGINS = [
    "https://hotelbermudas.up.railway.app",
    "https://sistemahotel-production-5a7f.up.railway.app",
    "https://hotel-frontend-production.up.railway.app",
    "https://hotel-frontend-dev.up.railway.app",
]

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

# Configuración de archivos estáticos
STATIC_ROOT = Path.joinpath(BASE_DIR, "staticfiles")
STATIC_URL = '/static/'

# Configuración de logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "level": "INFO",
            "class": "logging.StreamHandler",
        },
        "file": {
            "level": "ERROR",
            "class": "logging.FileHandler",
            "filename": "django_error.log",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": True,
        },
        "django.db.backends": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
    },
}

# Configuración de seguridad adicional
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
