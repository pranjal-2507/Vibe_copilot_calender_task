from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models.database import db
from models.event import Event

events_bp = Blueprint('events', __name__)

@events_bp.route('', methods=['GET'])
@jwt_required()
def get_events():
    current_user_id = get_jwt_identity()
    
    # Get query parameters for filtering
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    source = request.args.get('source')
    
    # Base query
    query = Event.query.filter_by(user_id=current_user_id)
    
    # Apply filters if provided
    if start_date:
        query = query.filter(Event.start_date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Event.end_date <= datetime.fromisoformat(end_date))
    if source:
        query = query.filter_by(source=source)
    
    # Execute query and convert to dict
    events = [event.to_dict() for event in query.all()]
    
    return jsonify(events), 200

@events_bp.route('/<int:event_id>', methods=['GET'])
@jwt_required()
def get_event(event_id):
    current_user_id = get_jwt_identity()
    
    event = Event.query.filter_by(id=event_id, user_id=current_user_id).first()
    
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    return jsonify(event.to_dict()), 200

@events_bp.route('', methods=['POST'])
@jwt_required()
def create_event():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('title') or not data.get('start_date') or not data.get('end_date'):
        return jsonify({"error": "Title, start date, and end date are required"}), 400
    
    # Create new event
    new_event = Event(
        title=data['title'],
        description=data.get('description', ''),
        start_date=datetime.fromisoformat(data['start_date']),
        end_date=datetime.fromisoformat(data['end_date']),
        location=data.get('location', ''),
        source=data.get('source', 'local'),
        user_id=current_user_id
    )
    
    db.session.add(new_event)
    db.session.commit()
    
    return jsonify(new_event.to_dict()), 201

@events_bp.route('/<int:event_id>', methods=['PUT'])
@jwt_required()
def update_event(event_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    event = Event.query.filter_by(id=event_id, user_id=current_user_id).first()
    
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    # Update event fields
    if 'title' in data:
        event.title = data['title']
    if 'description' in data:
        event.description = data['description']
    if 'start_date' in data:
        event.start_date = datetime.fromisoformat(data['start_date'])
    if 'end_date' in data:
        event.end_date = datetime.fromisoformat(data['end_date'])
    if 'location' in data:
        event.location = data['location']
    
    db.session.commit()
    
    return jsonify(event.to_dict()), 200

@events_bp.route('/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    current_user_id = get_jwt_identity()
    
    event = Event.query.filter_by(id=event_id, user_id=current_user_id).first()
    
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    db.session.delete(event)
    db.session.commit()
    
    return jsonify({"message": "Event deleted successfully"}), 200

