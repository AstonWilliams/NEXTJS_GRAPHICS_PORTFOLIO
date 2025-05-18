"""
WSGI config for django_portfolio project for Vercel deployment.
"""

import os
import sys
import json

# Add the project directory to the sys.path
path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if path not in sys.path:
    sys.path.append(path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_portfolio.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

# Handler for Vercel serverless function
def handler(event, context):
    # Ensure we have proper headers
    headers = event.get('headers', {})
    if headers is None:
        headers = {}
    
    # Create a minimal WSGI environment
    environ = {
        'wsgi.input': None,
        'wsgi.errors': sys.stderr,
        'wsgi.version': (1, 0),
        'wsgi.multithread': False,
        'wsgi.multiprocess': False,
        'wsgi.run_once': False,
        'wsgi.url_scheme': headers.get('x-forwarded-proto', 'https'),
        'REQUEST_METHOD': event.get('method', 'GET'),
        'PATH_INFO': event.get('path', '/'),
        'QUERY_STRING': event.get('query', ''),
        'CONTENT_TYPE': headers.get('content-type', ''),
        'CONTENT_LENGTH': headers.get('content-length', '0'),
        'SERVER_NAME': headers.get('host', 'localhost'),
        'SERVER_PORT': '443',
        'SERVER_PROTOCOL': 'HTTP/1.1',
    }
    
    # Add all headers
    for key, value in headers.items():
        key = key.upper().replace('-', '_')
        if key not in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
            environ[f'HTTP_{key}'] = value
    
    # Add request body if present
    if 'body' in event:
        body = event['body']
        if event.get('isBase64Encoded', False):
            import base64
            body = base64.b64decode(body)
        environ['wsgi.input'] = body
    
    # Capture the response
    response_headers = []
    response_body = []
    
    def start_response(status, headers, exc_info=None):
        response_headers.extend(headers)
        return response_body.append
    
    # Call the WSGI application
    result = application(environ, start_response)
    
    # Process the result
    for data in result:
        if isinstance(data, bytes):
            response_body.append(data.decode('utf-8'))
        else:
            response_body.append(data)
    
    # Return the response
    return {
        'statusCode': int(response_headers[0][1].split(' ')[0]),
        'headers': dict(response_headers),
        'body': ''.join(response_body),
    }
