import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_portfolio.settings')
application = get_wsgi_application()

def handler(request, **kwargs):
    """
    WSGI handler for Vercel serverless functions
    """
    return application(request["headers"], lambda x, y: None)
