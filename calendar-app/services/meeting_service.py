from flask import current_app
from models.user import User
from services.zoom_service import create_zoom_meeting
from services.teams_service import create_teams_meeting

def generate_meeting_link(platform, title, date, duration, user_id):
    """Generate a meeting link based on the platform"""
    user = User.query.get(user_id)
    
    if not user:
        return "#"
    
    if platform.lower() == 'zoom':
        if user.zoom_token:
            meeting_info = create_zoom_meeting(
                token=user.zoom_token,
                topic=title,
                start_time=date,
                duration=duration
            )
            return meeting_info.get('join_url', '#')
        else:
            # Mock link for development
            return f"https://zoom.us/j/{hash(title + date) % 1000000000}"
    
    elif platform.lower() == 'teams':
        if user.teams_token:
            meeting_info = create_teams_meeting(
                token=user.teams_token,
                subject=title,
                start_time=date,
                duration=duration
            )
            return meeting_info.get('joinWebUrl', '#')
        else:
            # Mock link for development
            return f"https://teams.microsoft.com/l/meetup-join/{hash(title + date) % 1000000000}"
    
    else:
        return "#"

