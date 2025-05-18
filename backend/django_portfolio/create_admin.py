#!/usr/bin/env python
"""
Script to create a superuser for the Django application.
"""

import os
import sys
import django
import time

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_portfolio.settings')

try:
    django.setup()
except Exception as e:
    print(f"Error setting up Django: {e}")
    sys.exit(1)

from django.contrib.auth.models import User
from django.db import IntegrityError, OperationalError, ProgrammingError

# Import token blacklist models - with error handling
try:
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
except ImportError:
    print("Warning: Could not import token blacklist models. Token invalidation may not work properly.")
    OutstandingToken = None
    BlacklistedToken = None

def create_admin():
    """Create a superuser if one doesn't exist."""
    username = 'admin'
    email = 'admin@example.com'
    password = 'admin123'
    
    # Check if the auth_user table exists
    try:
        # Try to query the User model to see if the table exists
        User.objects.count()
    except (OperationalError, ProgrammingError) as e:
        print(f"Database error: {e}")
        print("The auth_user table might not exist yet. Make sure migrations have been run.")
        return
    
    try:
        # Check if user exists
        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            print(f"Admin user '{username}' already exists.")
            
            # Update password
            user.set_password(password)
            user.save()
            print(f"Password for '{username}' has been updated.")
            
            # Invalidate existing tokens if token blacklist is available
            if OutstandingToken is not None:
                try:
                    # Delete all outstanding tokens for this user
                    tokens = OutstandingToken.objects.filter(user=user)
                    for token in tokens:
                        try:
                            # Create blacklisted token entry
                            BlacklistedToken.objects.get_or_create(token=token)
                        except Exception as e:
                            print(f"Error blacklisting token: {e}")
                    
                    print(f"All existing tokens for '{username}' have been invalidated.")
                except Exception as e:
                    print(f"Error handling tokens: {e}")
            
        else:
            # Create new superuser
            User.objects.create_superuser(username=username, email=email, password=password)
            print(f"Superuser '{username}' created successfully.")
            print(f"Email: {email}")
            print(f"Password: {password}")
    
    except IntegrityError:
        print(f"Error: Could not create superuser '{username}'. User may already exist.")
    except Exception as e:
        print(f"Error creating superuser: {e}")

if __name__ == '__main__':
    # Add a small delay to ensure database is ready
    time.sleep(1)
    create_admin()
