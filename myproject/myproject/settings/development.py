from .base import *
import os
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'admin123'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres',
        'PASSWORD': '1234',
        'HOST': 'localhost',  # O la IP del servidor PostgreSQL
        'PORT': '5432',  # Puerto por defecto de PostgreSQL
        'OPTIONS': {
            'client_encoding': 'UTF8',  # Asegura que la conexión se haga en UTF-8
        },
    }
}