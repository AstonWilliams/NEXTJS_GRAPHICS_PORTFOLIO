#!/bin/bash

# Activate virtual environment if it exists
if [ -d "../.venv" ]; then
  echo "Activating virtual environment..."
  source ../.venv/bin/activate
elif [ -d ".venv" ]; then
  echo "Activating virtual environment..."
  source .venv/bin/activate
fi

# Install requirements if needed
if [ ! -f ".requirements_installed" ]; then
  echo "Installing requirements..."
  pip install -r requirements.txt
  touch .requirements_installed
fi

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Start Uvicorn server
echo "Starting Uvicorn server..."
uvicorn django_portfolio.asgi:application --host 0.0.0.0 --port 8000 --reload
