FROM python:3.9.18-alpine3.18

RUN apk add build-base

RUN apk add postgresql-dev gcc python3-dev musl-dev

ARG FLASK_APP
ARG FLASK_ENV
ARG DATABASE_URL
ARG SCHEMA
ARG SECRET_KEY

WORKDIR /var/www

COPY requirements.txt .

RUN pip install -r requirements.txt
RUN pip install psycopg2

COPY . .

# Remove the auto-migrate step and just apply existing migrations
RUN flask db upgrade

# Seed the database (remove or adjust if you don't want auto-seeding in production)
RUN flask seed all

CMD gunicorn app:app