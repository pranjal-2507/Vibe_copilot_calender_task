import os
from datetime import timedelta

class Config:
    # Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    DEBUG = os.environ.get('FLASK_DEBUG', 'True') == 'True'
    
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@localhost/calendar_app')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # OAuth configuration
    OAUTH_CREDENTIALS = {
        'outlook': {
            'client_id': os.environ.get('OUTLOOK_CLIENT_ID', ''),
            'client_secret': os.environ.get('OUTLOOK_CLIENT_SECRET', ''),
            'redirect_uri': os.environ.get('OUTLOOK_REDIRECT_URI', 'http://localhost:5000/sync/outlook/callback')
        },
        'gmail': {
            'client_id': os.environ.get('GMAIL_CLIENT_ID', ''),
            'client_secret': os.environ.get('GMAIL_CLIENT_SECRET', ''),
            'redirect_uri': os.environ.get('GMAIL_REDIRECT_URI', 'http://localhost:5000/sync/gmail/callback')
        }
    }
    
    # Zoom API configuration
    ZOOM_API_KEY = os.environ.get('ZOOM_API_KEY', '')
    ZOOM_API_SECRET = os.environ.get('ZOOM_API_SECRET', '')
    
    # Microsoft Teams API configuration
    TEAMS_CLIENT_ID = os.environ.get('TEAMS_CLIENT_ID', '')
    TEAMS_CLIENT_SECRET = os.environ.get('TEAMS_CLIENT_SECRET', '')

