from .base import *
import os
from dotenv import load_dotenv
from ..logging import *

load_dotenv(Path.joinpath(BASE_DIR, '.env'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

CSRF_TRUSTED_ORIGINS = [
    "https://sistemahotel-sistemahotel.up.railway.app"
]



ALLOWED_HOSTS = [ '*' ]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv("POSTGRES_DB"),
        'USER': os.getenv("POSTGRES_USER"),
        'PASSWORD': os.getenv("POSTGRES_PASSWORD"),
        'HOST': os.getenv("POSTGRES_HOST"),
        'PORT': os.getenv("POSTGRES_PORT"),
        'OPTIONS': {
            'client_encoding': 'UTF8',
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
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': 'django_error.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
}

STATIC_ROOT = Path.joinpath(BASE_DIR, 'staticfiles')

