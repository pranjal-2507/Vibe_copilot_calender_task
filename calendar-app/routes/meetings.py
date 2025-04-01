from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models.database import db
from models.meeting import Meeting
from services.meeting_service import generate_meeting_link

meetings_bp = Blueprint('meetings', __name__)

@meetings_bp.route('', methods=['GET'])
@jwt_required()
def get_meetings():
    current_user_id = get_jwt_identity()
    
    # Get query parameters for filtering
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    platform = request.args.get('platform')
    source = request.args.get('source')
    
    # Base query
    query = Meeting.query.filter_by(user_id=current_user_id)
    
    # Apply filters if provided
    if start_date:
        query = query.filter(Meeting.date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Meeting.date <= datetime.fromisoformat(end_date))
    if platform:
        query = query.filter_by(platform=platform)
    if source:
        query = query.filter_by(source=source)
    
    # Execute query and convert to dict
    meetings = [meeting.to_dict() for meeting in query.all()]
    
    return jsonify(meetings), 200

@meetings_bp.route('/<int:meeting_id>', methods=['GET'])
@jwt_required()
def get_meeting(meeting_id):
    current_user_id = get_jwt_identity()
    
    meeting = Meeting.query.filter_by(id=meeting_id, user_id=current_user_id).first()
    
    if not meeting:
        return jsonify({"error": "Meeting not found"}), 404
    
    return jsonify(meeting.to_dict()), 200

@meetings_bp.route('', methods=['POST'])
@jwt_required()
def create_meeting():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('title') or not data.get('date') or not data.get('duration') or not data.get('platform'):
        return jsonify({"error": "Title, date, duration, and platform are required"}), 400
    
    # Generate meeting link
    meeting_link = generate_meeting_link(
        platform=data['platform'],
        title=data['title'],
        date=data['date'],
        duration=data['duration'],
        user_id=current_user_id
    )
    
    # Create new meeting
    new_meeting = Meeting(
        title=data['title'],
        description=data.get('description', ''),
        date=datetime.fromisoformat(data['date']),
        duration=data['duration'],
        platform=data['platform'],
        meeting_link=meeting_link,
        participants=data.get('participants', ''),
        source=data.get('source', 'local'),
        user_id=current_user_id
    )
    
    db.session.add(new_meeting)
    db.session.commit()
    
    return jsonify(new_meeting.to_dict()), 201

@meetings_bp.route('/<int:meeting_id>', methods=['PUT'])
@jwt_required()
def update_meeting(meeting_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    meeting = Meeting.query.filter_by(id=meeting_id, user_id=current_user_id).first()
    
    if not meeting:
        return jsonify({"error": "Meeting not found"}), 404
    
    # Update meeting fields
    if 'title' in data:
        meeting.title = data['title']
    if 'description' in data:
        meeting.description = data['description']
    if 'date' in data:
        meeting.date = datetime.fromisoformat(data['date'])
    if 'duration' in data:
        meeting.duration = data['duration']
    if 'platform' in data and data['platform'] != meeting.platform:
        meeting.platform = data['platform']
        # Regenerate meeting link if platform changes
        meeting.meeting_link = generate_meeting_link(
            platform=meeting.platform,
            title=meeting.title,
            date=meeting.date.isoformat(),
            duration=meeting.duration,
            user_id=current_user_id
        )
    if 'participants' in data:
        meeting.participants = data['participants']
    
    db.session.commit()
    
    return jsonify(meeting.to_dict()), 200

@meetings_bp.route('/<int:meeting_id>', methods=['DELETE'])
@jwt_required()
def delete_meeting(meeting_id):
    current_user_id = get_jwt_identity()
    
    meeting = Meeting.query.filter_by(id=meeting_id, user_id=current_user_id).first()
    
    if not meeting:
        return jsonify({"error": "Meeting not found"}), 404
    
    db.session.delete(meeting)
    db.session.commit()
    
    return jsonify({"message": "Meeting deleted successfully"}), 200

