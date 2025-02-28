FROM python:3.13-alpine

WORKDIR /usr/app

ENV PYTHONUNBUFFERED=1

RUN apk update \ 
    && apk add --no-cache gcc musl-dev postgresql-dev python3-dev libffi-dev \
    && pip install --upgrade pip

COPY ./requirements.txt ./

COPY myproject /usr/app

RUN pip install -r requirements.txt

COPY . .



CMD ["bash", "./build.sh"]




 