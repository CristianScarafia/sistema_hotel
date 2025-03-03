#!/bin/bash

echo 'Running collectstatic...'
python manage.py collectstatic --no-input --settings=myproject.settings.development

echo 'Applying migrations...'
python manage.py wait_for_db --settings=myproject.settings.development 
python manage.py migrate --settings=myproject.settings.development

RUN chmod +x entrypoint.sh


echo 'Runing server...'
gunicorn --env DJANGO_SETTINGS_MODULE=myproject.settings.development myproject.wsgi:application --bind 0.0.0.0:8000 