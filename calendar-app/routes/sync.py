from flask import Blueprint, request, jsonify, redirect, url_for, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import db
from models.user import User
from models.task import Task
from models.event import Event
from models.meeting import Meeting
from services.outlook_service import get_outlook_auth_url, get_outlook_token, get_outlook_events
from services.gmail_service import get_gmail_auth_url, get_gmail_token, get_gmail_events
from datetime import datetime

sync_bp = Blueprint('sync', __name__)

@sync_bp.route('/outlook/auth', methods=['GET'])
@jwt_required()
def outlook_auth():
    current_user_id = get_jwt_identity()
    
    # Generate authorization URL
    auth_url = get_outlook_auth_url(current_user_id)
    
    return jsonify({"auth_url": auth_url}), 200

@sync_bp.route('/outlook/callback', methods=['GET'])
def outlook_callback():
    code = request.args.get('code')
    state = request.args.get('state')  # Contains user_id
    
    if not code or not state:
        return jsonify({"error": "Invalid request"}), 400
    
    # Exchange code for token
    token = get_outlook_token(code)
    
    # Save token to user
    user = User.query.get(state)
    if user:
        user.outlook_token = token
        db.session.commit()
    
    # Redirect to frontend
    return redirect(current_app.config.get('FRONTEND_URL', '/') + '/sync-success?provider=outlook')

@sync_bp.route('/outlook', methods=['POST'])
@jwt_required()
def sync_outlook():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.outlook_token:
        return jsonify({"error": "Outlook not connected"}), 401
    
    # Get events from Outlook
    outlook_events = get_outlook_events(user.outlook_token)
    
    # Process and save events
    for event in outlook_events:
        # Check if it's a meeting
        if event.get('is_meeting'):
            # Check if meeting already exists
            existing = Meeting.query.filter_by(
                user_id=current_user_id,
                source='outlook',
                source_id=event.get('id')
            ).first()
            
            if existing:
                # Update existing meeting
                existing.title = event.get('subject')
                existing.description = event.get('body', '')
                existing.date = datetime.fromisoformat(event.get('start_time'))
                existing.duration = event.get('duration')
                existing.meeting_link = event.get('meeting_link', '')
                existing.participants = event.get('attendees', '')
            else:
                # Create new meeting
                new_meeting = Meeting(
                    title=event.get('subject'),
                    description=event.get('body', ''),
                    date=datetime.fromisoformat(event.get('start_time')),
                    duration=event.get('duration'),
                    platform='teams' if 'teams' in event.get('meeting_link', '').lower() else 'other',
                    meeting_link=event.get('meeting_link', ''),
                    participants=event.get('attendees', ''),
                    source='outlook',
                    source_id=event.get('id'),
                    user_id=current_user_id
                )
                db.session.add(new_meeting)
        else:
            # Regular event
            existing = Event.query.filter_by(
                user_id=current_user_id,
                source='outlook',
                source_id=event.get('id')
            ).first()
            
            if existing:
                # Update existing event
                existing.title = event.get('subject')
                existing.description = event.get('body', '')
                existing.start_date = datetime.fromisoformat(event.get('start_time'))
                existing.end_date = datetime.fromisoformat(event.get('end_time'))
                existing.location = event.get('location', '')
            else:
                # Create new event
                new_event = Event(
                    title=event.get('subject'),
                    description=event.get('body', ''),
                    start_date=datetime.fromisoformat(event.get('start_time')),
                    end_date=datetime.fromisoformat(event.get('end_time')),
                    location=event.get('location', ''),
                    source='outlook',
                    source_id=event.get('id'),
                    user_id=current_user_id
                )
                db.session.add(new_event)
    
    db.session.commit()
    
    return jsonify({
        "message": "Outlook calendar synced successfully",
        "events_synced": len(outlook_events)
    }), 200

@sync_bp.route('/gmail/auth', methods=['GET'])
@jwt_required()
def gmail_auth():
    current_user_id = get_jwt_identity()
    
    # Generate authorization URL
    auth_url = get_gmail_auth_url(current_user_id)
    
    return jsonify({"auth_url": auth_url}), 200

@sync_bp.route('/gmail/callback', methods=['GET'])
def gmail_callback():
    code = request.args.get('code')
    state = request.args.get('state')  # Contains user_id
    
    if not code or not state:
        return jsonify({"error": "Invalid request"}), 400
    
    # Exchange code for token
    token = get_gmail_token(code)
    
    # Save token to user
    user = User.query.get(state)
    if user:
        user.gmail_token = token
        db.session.commit()
    
    # Redirect to frontend
    return redirect(current_app.config.get('FRONTEND_URL', '/') + '/sync-success?provider=gmail')

@sync_bp.route('/gmail', methods=['POST'])
@jwt_required()
def sync_gmail():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.gmail_token:
        return jsonify({"error": "Gmail not connected"}), 401
    
    # Get events from Gmail
    gmail_events = get_gmail_events(user.gmail_token)
    
    # Process and save events
    for event in gmail_events:
        # Check if it's a meeting
        if event.get('is_meeting'):
            # Check if meeting already exists
            existing = Meeting.query.filter_by(
                user_id=current_user_id,
                source='gmail',
                source_id=event.get('id')
            ).first()
            
            if existing:
                # Update existing meeting
                existing.title = event.get('summary')
                existing.description = event.get('description', '')
                existing.date = datetime.fromisoformat(event.get('start_time'))
                existing.duration = event.get('duration')
                existing.meeting_link = event.get('meeting_link', '')
                existing.participants = event.get('attendees', '')
            else:
                # Create new meeting
                new_meeting = Meeting(
                    title=event.get('summary'),
                    description=event.get('description', ''),
                    date=datetime.fromisoformat(event.get('start_time')),
                    duration=event.get('duration'),
                    platform='zoom' if 'zoom' in event.get('meeting_link', '').lower() else 'other',
                    meeting_link=event.get('meeting_link', ''),
                    participants=event.get('attendees', ''),
                    source='gmail',
                    source_id=event.get('id'),
                    user_id=current_user_id
                )
                db.session.add(new_meeting)
        else:
            # Regular event
            existing = Event.query.filter_by(
                user_id=current_user_id,
                source='gmail',
                source_id=event.get('id')
            ).first()
            
            if existing:
                # Update existing event
                existing.title = event.get('summary')
                existing.description = event.get('description', '')
                existing.start_date = datetime.fromisoformat(event.get('start_time'))
                existing.end_date = datetime.fromisoformat(event.get('end_time'))
                existing.location = event.get('location', '')
            else:
                # Create new event
                new_event = Event(
                    title=event.get('summary'),
                    description=event.get('description', ''),
                    start_date=datetime.fromisoformat(event.get('start_time')),
                    end_date=datetime.fromisoformat(event.get('end_time')),
                    location=event.get('location', ''),
                    source='gmail',
                    source_id=event.get('id'),
                    user_id=current_user_id
                )
                db.session.add(new_event)
    
    db.session.commit()
    
    return jsonify({
        "message": "Gmail calendar synced successfully",
        "events_synced": len(gmail_events)
    }), 200

