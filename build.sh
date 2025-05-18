#!/bin/bash

echo "=== Starting build.sh ==="

# Check if Python is available and install if needed
if ! command -v python3 &> /dev/null; then
    echo "Python not found, attempting to use Vercel's Python..."
    export PATH="/vercel/path0/.vercel/bin:$PATH"
    
    if ! command -v python3 &> /dev/null; then
        echo "Python still not available. Creating a minimal Python environment..."
        mkdir -p /tmp/python-env
        curl -sSL https://bootstrap.pypa.io/get-pip.py -o /tmp/get-pip.py
        python /tmp/get-pip.py --user
        export PATH="$HOME/.local/bin:$PATH"
    fi
fi

# Check if pip is available
if command -v pip3 &> /dev/null; then
    PIP_CMD="pip3"
elif command -v pip &> /dev/null; then
    PIP_CMD="pip"
else
    echo "pip not found, attempting to use python -m pip..."
    PIP_CMD="python3 -m pip"
fi

echo "Using pip command: $PIP_CMD"

# Install Python dependencies
echo "Installing Python dependencies..."
cd backend/django_portfolio
$PIP_CMD install --user -r requirements.txt

# Check if Django is installed
if python3 -c "import django" &> /dev/null; then
    echo "Django installed successfully"
    
    # Create necessary directories for Django
    mkdir -p staticfiles
    mkdir -p media
    mkdir -p static
    
    # Run Django commands
    echo "Running makemigrations..."
    python3 manage.py makemigrations portfolio || echo "makemigrations failed, but continuing..."
    
    echo "Running migrations..."
    python3 manage.py migrate || echo "migrations failed, but continuing..."
    
    echo "Creating admin user..."
    python3 create_admin.py || echo "create_admin.py failed, but continuing..."
    
    echo "Collecting static files..."
    python3 manage.py collectstatic --noinput || echo "collectstatic failed, but continuing..."
else
    echo "Django installation failed, but continuing with frontend build..."
fi

# Return to project root
cd ../..

echo "=== Django setup completed, proceeding to Next.js build ==="

# Next.js build will be handled by Vercel's build system
# This script only handles the Django setup

echo "=== build.sh completed ==="
