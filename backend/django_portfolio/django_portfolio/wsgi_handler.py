from django.core.wsgi import get_wsgi_application
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_portfolio.settings')
application = get_wsgi_application()

def handler(event, context):
    return application(event.get('headers', {}), lambda x, y: (x, y, []))
