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
    
    # Collect static files
    echo "Collecting static files..."
    python3 manage.py collectstatic --noinput || echo "Static collection failed, but continuing..."
    
    # Run migrations
    echo "Running migrations..."
    python3 manage.py migrate --noinput || echo "Migrations failed, but continuing..."
else
    echo "Django installation failed, but continuing with frontend build..."
fi

# Return to project root
cd ../..

# Create necessary directories for Django
mkdir -p backend/django_portfolio/staticfiles
mkdir -p backend/django_portfolio/media

# Create a simple wsgi handler if it doesn't exist
if [ ! -f backend/django_portfolio/django_portfolio/wsgi_handler.py ]; then
    echo "Creating wsgi_handler.py..."
    cat > backend/django_portfolio/django_portfolio/wsgi_handler.py << 'EOF'
from django.core.wsgi import get_wsgi_application
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_portfolio.settings')
application = get_wsgi_application()

def handler(event, context):
    return application(event.get('headers', {}), lambda x, y: (x, y, []))
EOF
fi

echo "=== Django setup completed, proceeding to Next.js build ==="

# Next.js build will be handled by Vercel's build system
# This script only handles the Django setup

echo "=== build.sh completed ==="
