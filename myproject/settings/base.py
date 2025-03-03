from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = os.path.dirname(BASE_DIR)


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/


# Application definition

BASE_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",  # Asegúrate de que esta línea esté presente
    "django.contrib.contenttypes",  # Asegúrate de que esta línea esté presente
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "reservas",
    "debug_toolbar",
]

LOCAL_APPS = ["apps.core"]

THIRD_APPS = []

INSTALLED_APPS = BASE_APPS + LOCAL_APPS + THIRD_APPS

BASE_MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # (si lo usas)ç
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "debug_toolbar.middleware.DebugToolbarMiddleware",
]

LOCAL_MIDDLEWARE = []

THIRD_MIDDLEWARE = [
    "whitenoise.middleware.WhiteNoiseMiddleware",
]

MIDDLEWARE = BASE_MIDDLEWARE + LOCAL_MIDDLEWARE + THIRD_MIDDLEWARE

ROOT_URLCONF = "myproject.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "reservas" / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "myproject.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

"""DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres.soydgimrcwwgycqgeyls',
        'PASSWORD': '1234',
        'HOST': 'aws-0-us-west-1.pooler.supabase.com',  # O la IP del servidor PostgreSQL
        'PORT': '5432',  # Puerto por defecto de PostgreSQL
        'OPTIONS': {
            'client_encoding': 'UTF8',  # Asegura que la conexión se haga en UTF-8
        },
    }
}"""

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

INTERNAL_IPS = [
    "127.0.0.1",
]
SESSION_ENGINE = "django.contrib.sessions.backends.db"  # Use database-backed sessions


DEBUG_TOOLBAR_PANELS = [
    "debug_toolbar.panels.timer.TimerPanel",
    "debug_toolbar.panels.sql.SQLPanel",
]
# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = "/static/"


STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "reservas", "static"),
]
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
LOGIN_URL = "/login/"
LOGIN_REDIRECT_URL = "/"
