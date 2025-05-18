# This file is used by Vercel to set up the Python environment
# It will be automatically executed by the @vercel/python builder

import os
import subprocess
import sys

def main():
    print("Setting up Django for Vercel deployment...")
    
    # Change to the Django project directory
    os.chdir('backend/django_portfolio')
    
    # Install dependencies
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
    
    # Create static directory if it doesn't exist
    os.makedirs('static', exist_ok=True)
    
    # Collect static files
    subprocess.check_call([sys.executable, 'manage.py', 'collectstatic', '--noinput'])
    
    # Run migrations if DATABASE_URL is set
    if 'DATABASE_URL' in os.environ:
        print("Running migrations...")
        subprocess.check_call([sys.executable, 'manage.py', 'migrate'])
    else:
        print("Skipping migrations (no DATABASE_URL set)")
    
    print("Django setup completed successfully")

if __name__ == "__main__":
    main()
