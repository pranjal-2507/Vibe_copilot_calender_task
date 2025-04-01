from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.database import db
from models.user import User
from services.zoom_service import create_zoom_meeting
from services.teams_service import create_teams_meeting

meeting_generator_bp = Blueprint('meeting_generator', __name__)

@meeting_generator_bp.route('', methods=['POST'])
@jwt_required()
def generate_meeting():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('platform') or not data.get('title') or not data.get('date') or not data.get('duration'):
        return jsonify({"error": "Platform, title, date, and duration are required"}), 400
    
    platform = data['platform'].lower()
    
    # Generate meeting link based on platform
    if platform == 'zoom':
        if not user.zoom_token:
            return jsonify({"error": "Zoom not connected"}), 401
        
        meeting_info = create_zoom_meeting(
            token=user.zoom_token,
            topic=data['title'],
            start_time=data['date'],
            duration=data['duration'],
            agenda=data.get('description', '')
        )
        
        return jsonify({
            "meeting_link": meeting_info.get('join_url'),
            "meeting_id": meeting_info.get('id'),
            "password": meeting_info.get('password')
        }), 200
        
    elif platform == 'teams':
        if not user.teams_token:
            return jsonify({"error": "Microsoft Teams not connected"}), 401
        
        meeting_info = create_teams_meeting(
            token=user.teams_token,
            subject=data['title'],
            start_time=data['date'],
            duration=data['duration'],
            content=data.get('description', '')
        )
        
        return jsonify({
            "meeting_link": meeting_info.get('online_meeting_url'),
            "meeting_id": meeting_info.get('id')
        }), 200
        
    else:
        return jsonify({"error": "Unsupported platform. Use 'zoom' or 'teams'"}), 400

