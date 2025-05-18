#!/bin/bash

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example if it doesn't exist
if [ ! -f .env ]; then
    cat > .env << EOF
SECRET_KEY=django-insecure-default-key-for-development-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=
EOF
    echo "Created .env file. Please update with your settings."
fi

# Make scripts executable
chmod +x run_uvicorn.sh
chmod +x create_admin.py

# Run migrations
python manage.py makemigrations portfolio
python manage.py migrate

# Create superuser
python create_admin.py

# Collect static files
python manage.py collectstatic --noinput

echo "Setup complete! You can now run the server with: ./run_uvicorn.sh"
