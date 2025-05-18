# This file is used by Vercel to run your Django application
from django.core.wsgi import get_wsgi_application
import os

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_portfolio.settings')

# Get the WSGI application
app = get_wsgi_application()

# This is the WSGI application callable that Vercel will use
def handler(request, **kwargs):
    """
    The handler function that Vercel will call when a request comes in.
    """
    return app(request, **kwargs)
