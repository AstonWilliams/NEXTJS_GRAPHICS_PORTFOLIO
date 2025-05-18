#!/bin/bash

# Install Python dependencies
cd backend/django_portfolio
pip install -r requirements.txt

# Create static directory if it doesn't exist
mkdir -p static

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Return to project root
cd ../..

# Install Node.js dependencies
npm install

# Build Next.js app
npm run build
