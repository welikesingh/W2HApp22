#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Show migration status
echo "Checking migration status..."
python manage.py showmigrations

# Create migrations if needed
echo "Creating migrations if needed..."
python manage.py makemigrations users --no-input || true

# Run migrations for all apps including users
echo "Running migrations..."
python manage.py migrate users
echo "Users app migrated"

python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Build complete!"
