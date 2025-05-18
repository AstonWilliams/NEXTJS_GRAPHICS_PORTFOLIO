#!/bin/bash

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "Virtual environment activated."
else
    echo "Creating virtual environment..."
    python -m venv venv
    source venv/bin/activate
    echo "Virtual environment created and activated."
fi

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Run migrations
echo "Running migrations..."
python manage.py makemigrations portfolio
python manage.py migrate

# Create admin user
echo "Creating admin user..."
python create_admin.py

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Setup complete! You can now run the server with: python manage.py runserver"
