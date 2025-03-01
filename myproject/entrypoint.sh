#!/bin/bash

echo 'Running collectstatic...'
python manage.py collectstatic --no-input --settings=myproject.settings.production

echo 'Applying migrations...'
python manage.py wait_for_db --settings=myproject.settings.production 
python manage.py migrate --settings=myproject.settings.production


echo 'Runing server...'
gunicorn --env DJANGO_SETTINGS_MODULE=myproject.settings.production myproject.wsgi:application --bind 0.0.0.0:8000