"""
WSGI config for django_portfolio project for Vercel deployment.
"""

import os
import sys

# Add the project directory to the sys.path
path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if path not in sys.path:
    sys.path.append(path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_portfolio.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

# Handler for Vercel serverless function
def handler(event, context):
    return application(event.get('headers', {}), lambda x, y: (x, y, []))
