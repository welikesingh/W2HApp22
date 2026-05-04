#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations (auto table creation)
python manage.py migrate

# Create superuser if not exists (optional - for admin access)
# python manage.py createsuperuser --noinput --username admin --email admin@example.com || true
