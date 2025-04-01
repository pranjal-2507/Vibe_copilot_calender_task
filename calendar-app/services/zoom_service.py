import requests
import json
import jwt
import time
from flask import current_app
from datetime import datetime

def create_zoom_meeting(token, topic, start_time, duration, agenda=''):
    """Create a Zoom meeting and return the meeting details"""
    # Parse the token
    token_data = json.loads(token)
    access_token = token_data.get('access_token')
    
    if not access_token:
        # Generate JWT token if no OAuth token
        api_key = current_app.config['ZOOM_API_KEY']
        api_secret = current_app.config['ZOOM_API_SECRET']
        
        # Create a JWT token
        token_exp = int(time.time()) + 3600  # 1 hour expiration
        payload = {
            'iss': api_key,
            'exp': token_exp
        }
        
        access_token = jwt.encode(payload, api_secret, algorithm='HS256')
    
    # Format the start time
    try:
        start_datetime = datetime.fromisoformat(start_time)
        formatted_start_time = start_datetime.strftime('%Y-%m-%dT%H:%M:%S')
    except:
        # Default to current time if parsing fails
        formatted_start_time = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
    
    # Create meeting
    url = "https://api.zoom.us/v2/users/me/meetings"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "topic": topic,
        "type": 2,  # Scheduled meeting
        "start_time": formatted_start_time,
        "duration": duration,
        "timezone": "UTC",
        "agenda": agenda,
        "settings": {
            "host_video": True,
            "participant_video": True,
            "join_before_host": False,
            "mute_upon_entry": True,
            "auto_recording": "none"
        }
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 201:
        return response.json()
    else:
        # Handle error
        return {
            "error": "Failed to create Zoom meeting",
            "status_code": response.status_code,
            "message": response.text

        }
def get_zoom_meeting(token, meeting_id):
    """Get details of a specific Zoom meeting"""
    # Parse the token
    token_data = json.loads(token)
    access_token = token_data.get('access_token')
    
    if not access_token:
        # Generate JWT token if no OAuth token
        api_key = current_app.config['ZOOM_API_KEY']
        api_secret = current_app.config['ZOOM_API_SECRET']
        
        # Create a JWT token
        token_exp = int(time.time()) + 3600  # 1 hour expiration
        payload = {
            'iss': api_key,
            'exp': token_exp
        }
        
        access_token = jwt.encode(payload, api_secret, algorithm='HS256')
    
    # Get meeting details
    url = f"https://api.zoom.us/v2/meetings/{meeting_id}"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        # Handle error
        return {
            "error": "Failed to get Zoom meeting",
            "status_code": response.status_code,
            "message": response.text
        }

