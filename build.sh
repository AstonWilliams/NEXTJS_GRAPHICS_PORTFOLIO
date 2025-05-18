#!/bin/bash

# Make script exit when a command fails
set -e

echo "=== Starting build.sh ==="

# Install Python dependencies
echo "Installing Python dependencies..."
cd backend/django_portfolio
pip install -r requirements.txt

# Create static directory if it doesn't exist
mkdir -p static

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Run migrations if database URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Running migrations..."
  python manage.py migrate
else
  echo "Skipping migrations (no DATABASE_URL set)"
fi

# Return to project root
cd ../..

echo "=== build.sh completed ==="
