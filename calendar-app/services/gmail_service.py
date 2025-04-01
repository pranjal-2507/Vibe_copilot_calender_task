import requests
from flask import current_app
import json
import base64
import re

def get_gmail_auth_url(user_id):
    """Generate the authorization URL for Google Calendar API"""
    credentials = current_app.config['OAUTH_CREDENTIALS']['gmail']
    
    auth_url = (
        f"https://accounts.google.com/o/oauth2/auth"
        f"?client_id={credentials['client_id']}"
        f"&response_type=code"
        f"&redirect_uri={credentials['redirect_uri']}"
        f"&scope=https://www.googleapis.com/auth/calendar.readonly"
        f"&access_type=offline"
        f"&state={user_id}"
    )
    
    return auth_url

def get_gmail_token(code):
    """Exchange authorization code for access token"""
    credentials = current_app.config['OAUTH_CREDENTIALS']['gmail']
    
    token_url = "https://oauth2.googleapis.com/token"
    
    data = {
        "client_id": credentials['client_id'],
        "client_secret": credentials['client_secret'],
        "code": code,
        "redirect_uri": credentials['redirect_uri'],
        "grant_type": "authorization_code"
    }
    
    response = requests.post(token_url, data=data)
    
    if response.status_code == 200:
        return json.dumps(response.json())
    else:
        # Handle error
        return None

def refresh_gmail_token(refresh_token):
    """Refresh the access token using the refresh token"""
    credentials = current_app.config['OAUTH_CREDENTIALS']['gmail']
    
    token_url = "https://oauth2.googleapis.com/token"
    
    data = {
        "client_id": credentials['client_id'],
        "client_secret": credentials['client_secret'],
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }
    
    response = requests.post(token_url, data=data)
    
    if response.status_code == 200:
        return json.dumps(response.json())
    else:
        # Handle error
        return None

def get_gmail_events(token_json):
    """Fetch calendar events from Google Calendar"""
    token_data = json.loads(token_json)
    access_token = token_data.get('access_token')
    
    if not access_token:
        # Try to refresh token if no access token
        refresh_token = token_data.get('refresh_token')
        if refresh_token:
            new_token_json = refresh_gmail_token(refresh_token)
            if new_token_json:
                token_data = json.loads(new_token_json)
                access_token = token_data.get('access_token')
            else:
                return []
        else:
            return []
    
    # Get events from Google Calendar API
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Get events for the next 30 days
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    time_min = now.isoformat() + 'Z'
    time_max = (now + timedelta(days=30)).isoformat() + 'Z'
    
    url = f"https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin={time_min}&timeMax={time_max}&singleEvents=true"
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        events_data = response.json().get('items', [])
        
        # Transform to our format
        events = []
        for event in events_data:
            # Check if it's a meeting (has conferencing data)
            is_meeting = 'conferenceData' in event
            
            # Extract meeting link if available
            meeting_link = ''
            if is_meeting:
                for entry_point in event.get('conferenceData', {}).get('entryPoints', []):
                    if entry_point.get('entryPointType') == 'video':
                        meeting_link = entry_point.get('uri', '')
                        break
            
            # Check description for meeting links if not found in conferenceData
            if not meeting_link and event.get('description'):
                # Look for Zoom or Teams links in description
                zoom_pattern = r'https://[a-zA-Z0-9.-]+\.zoom\.us/[a-zA-Z0-9/?.=&-]+'
                teams_pattern = r'https://teams\.microsoft\.com/[a-zA-Z0-9/?.=&-]+'
                
                zoom_match = re.search(zoom_pattern, event.get('description', ''))
                teams_match = re.search(teams_pattern, event.get('description', ''))
                
                if zoom_match:
                    meeting_link = zoom_match.group(0)
                    is_meeting = True
                elif teams_match:
                    meeting_link = teams_match.group(0)
                    is_meeting = True
            
            event_dict = {
                'id': event.get('id'),
                'summary': event.get('summary', 'No Subject'),
                'description': event.get('description', ''),
                'start_time': event.get('start', {}).get('dateTime', event.get('start', {}).get('date')),
                'end_time': event.get('end', {}).get('dateTime', event.get('end', {}).get('date')),
                'location': event.get('location', ''),
                'is_meeting': is_meeting,
                'meeting_link': meeting_link
            }
            
            # Calculate duration in minutes
            try:
                start_time = datetime.fromisoformat(event_dict['start_time'].replace('Z', '+00:00'))
                end_time = datetime.fromisoformat(event_dict['end_time'].replace('Z', '+00:00'))
                duration = int((end_time - start_time).total_seconds() / 60)
                event_dict['duration'] = duration
            except:
                event_dict['duration'] = 30  # Default duration
            
            # Get attendees
            attendees = []
            for attendee in event.get('attendees', []):
                email = attendee.get('email')
                if email:
                    attendees.append(email)
            
            event_dict['attendees'] = ','.join(attendees)
            
            events.append(event_dict)
        
        return events
    else:
        # Handle error
        return []

