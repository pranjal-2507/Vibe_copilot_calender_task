import requests
from flask import current_app
import json

def get_outlook_auth_url(user_id):
    """Generate the authorization URL for Microsoft Graph API (Outlook)"""
    credentials = current_app.config['OAUTH_CREDENTIALS']['outlook']
    
    auth_url = (
        f"https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
        f"?client_id={credentials['client_id']}"
        f"&response_type=code"
        f"&redirect_uri={credentials['redirect_uri']}"
        f"&scope=offline_access%20Calendars.Read"
        f"&state={user_id}"
    )
    
    return auth_url

def get_outlook_token(code):
    """Exchange authorization code for access token"""
    credentials = current_app.config['OAUTH_CREDENTIALS']['outlook']
    
    token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    
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

def refresh_outlook_token(refresh_token):
    """Refresh the access token using the refresh token"""
    credentials = current_app.config['OAUTH_CREDENTIALS']['outlook']
    
    token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    
    data = {
        "client_id": credentials['client_id'],
        "client_secret": credentials['client_secret'],
        "refresh_token": refresh_token,
        "redirect_uri": credentials['redirect_uri'],
        "grant_type": "refresh_token"
    }
    
    response = requests.post(token_url, data=data)
    
    if response.status_code == 200:
        return json.dumps(response.json())
    else:
        # Handle error
        return None

def get_outlook_events(token_json):
    """Fetch calendar events from Outlook"""
    token_data = json.loads(token_json)
    access_token = token_data.get('access_token')
    
    if not access_token:
        # Try to refresh token if no access token
        refresh_token = token_data.get('refresh_token')
        if refresh_token:
            new_token_json = refresh_outlook_token(refresh_token)
            if new_token_json:
                token_data = json.loads(new_token_json)
                access_token = token_data.get('access_token')
            else:
                return []
        else:
            return []
    
    # Get events from Microsoft Graph API
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Get events for the next 30 days
    url = "https://graph.microsoft.com/v1.0/me/calendarView?startDateTime={start}&endDateTime={end}"
    
    from datetime import datetime, timedelta
    start = datetime.utcnow().isoformat() + 'Z'
    end = (datetime.utcnow() + timedelta(days=30)).isoformat() + 'Z'
    
    url = url.format(start=start, end=end)
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        events_data = response.json().get('value', [])
        
        # Transform to our format
        events = []
        for event in events_data:
            is_meeting = bool(event.get('onlineMeeting'))
            
            event_dict = {
                'id': event.get('id'),
                'subject': event.get('subject', 'No Subject'),
                'body': event.get('bodyPreview', ''),
                'start_time': event.get('start', {}).get('dateTime', ''),
                'end_time': event.get('end', {}).get('dateTime', ''),
                'location': event.get('location', {}).get('displayName', ''),
                'is_meeting': is_meeting
            }
            
            # Calculate duration in minutes
            try:
                start_time = datetime.fromisoformat(event_dict['start_time'].replace('Z', '+00:00'))
                end_time = datetime.fromisoformat(event_dict['end_time'].replace('Z', '+00:00'))
                duration = int((end_time - start_time).total_seconds() / 60)
                event_dict['duration'] = duration
            except:
                event_dict['duration'] = 30  # Default duration
            
            # Add meeting-specific fields if it's a meeting
            if is_meeting:
                event_dict['meeting_link'] = event.get('onlineMeeting', {}).get('joinUrl', '')
                
                # Get attendees
                attendees = []
                for attendee in event.get('attendees', []):
                    email = attendee.get('emailAddress', {}).get('address')
                    if email:
                        attendees.append(email)
                
                event_dict['attendees'] = ','.join(attendees)
            
            events.append(event_dict)
        
        return events
    else:
        # Handle error
        return []

