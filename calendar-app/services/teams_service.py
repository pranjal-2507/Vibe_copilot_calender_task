import requests
import json
from flask import current_app
from datetime import datetime, timedelta

def create_teams_meeting(token, subject, start_time, duration, content=''):
    """Create a Microsoft Teams meeting and return the meeting details"""
    # Parse the token
    token_data = json.loads(token)
    access_token = token_data.get('access_token')
    
    if not access_token:
        # Handle error - Teams requires OAuth token
        return {
            "error": "No valid Teams token found"
        }
    
    # Format the start and end times
    try:
        start_datetime = datetime.fromisoformat(start_time)
        end_datetime = start_datetime + timedelta(minutes=int(duration))
        
        formatted_start_time = start_datetime.isoformat() + 'Z'
        formatted_end_time = end_datetime.isoformat() + 'Z'
    except:
        # Default to current time if parsing fails
        now = datetime.now()
        formatted_start_time = now.isoformat() + 'Z'
        formatted_end_time = (now + timedelta(minutes=30)).isoformat() + 'Z'
    
    # Create meeting using Microsoft Graph API
    url = "https://graph.microsoft.com/v1.0/me/onlineMeetings"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "subject": subject,
        "startDateTime": formatted_start_time,
        "endDateTime": formatted_end_time,
        "isEntryPointPresented": True
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 201:
        return response.json()
    else:
        # Handle error
        return {
            "error": "Failed to create Teams meeting",
            "status_code": response.status_code,
            "message": response.text
        }

def get_teams_meeting(token, meeting_id):
    """Get details of a specific Teams meeting"""
    # Parse the token
    token_data = json.loads(token)
    access_token = token_data.get('access_token')
    
    if not access_token:
        # Handle error - Teams requires OAuth token
        return {
            "error": "No valid Teams token found"
        }
    
    # Get meeting details using Microsoft Graph API
    url = f"https://graph.microsoft.com/v1.0/me/onlineMeetings/{meeting_id}"
    
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
            "error": "Failed to get Teams meeting",
            "status_code": response.status_code,
            "message": response.text
        }

