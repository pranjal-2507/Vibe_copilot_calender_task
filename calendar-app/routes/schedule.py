from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, time
from models.database import db
from models.schedule import Schedule

schedule_bp = Blueprint('schedule', __name__)

@schedule_bp.route('', methods=['GET'])
@jwt_required()
def get_schedule():
    current_user_id = get_jwt_identity()
    
    schedule = Schedule.query.filter_by(user_id=current_user_id).first()
    
    if not schedule:
        return jsonify({"message": "No schedule found"}), 404
    
    return jsonify(schedule.to_dict()), 200

@schedule_bp.route('', methods=['POST'])
@jwt_required()
def create_schedule():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('start_date') or not data.get('end_date') or not data.get('start_time') or not data.get('end_time'):
        return jsonify({"error": "Start date, end date, start time, and end time are required"}), 400
    
    # Check if schedule already exists
    existing_schedule = Schedule.query.filter_by(user_id=current_user_id).first()
    
    if existing_schedule:
        # Update existing schedule
        existing_schedule.start_date = datetime.fromisoformat(data['start_date']).date()
        existing_schedule.end_date = datetime.fromisoformat(data['end_date']).date()
        existing_schedule.monday = data.get('working_days', {}).get('monday', True)
        existing_schedule.tuesday = data.get('working_days', {}).get('tuesday', True)
        existing_schedule.wednesday = data.get('working_days', {}).get('wednesday', True)
        existing_schedule.thursday = data.get('working_days', {}).get('thursday', True)
        existing_schedule.friday = data.get('working_days', {}).get('friday', True)
        existing_schedule.saturday = data.get('working_days', {}).get('saturday', False)
        existing_schedule.sunday = data.get('working_days', {}).get('sunday', False)
        existing_schedule.start_time = time.fromisoformat(data['start_time'])
        existing_schedule.end_time = time.fromisoformat(data['end_time'])
        existing_schedule.slot_duration = data.get('slot_duration', 30)
        
        db.session.commit()
        
        return jsonify(existing_schedule.to_dict()), 200
    else:
        # Create new schedule
        new_schedule = Schedule(
            start_date=datetime.fromisoformat(data['start_date']).date(),
            end_date=datetime.fromisoformat(data['end_date']).date(),
            monday=data.get('working_days', {}).get('monday', True),
            tuesday=data.get('working_days', {}).get('tuesday', True),
            wednesday=data.get('working_days', {}).get('wednesday', True),
            thursday=data.get('working_days', {}).get('thursday', True),
            friday=data.get('working_days', {}).get('friday', True),
            saturday=data.get('working_days', {}).get('saturday', False),
            sunday=data.get('working_days', {}).get('sunday', False),
            start_time=time.fromisoformat(data['start_time']),
            end_time=time.fromisoformat(data['end_time']),
            slot_duration=data.get('slot_duration', 30),
            user_id=current_user_id
        )
        
        db.session.add(new_schedule)
        db.session.commit()
        
        return jsonify(new_schedule.to_dict()), 201

@schedule_bp.route('', methods=['DELETE'])
@jwt_required()
def delete_schedule():
    current_user_id = get_jwt_identity()
    
    schedule = Schedule.query.filter_by(user_id=current_user_id).first()
    
    if not schedule:
        return jsonify({"error": "Schedule not found"}), 404
    
    db.session.delete(schedule)
    db.session.commit()
    
    return jsonify({"message": "Schedule deleted successfully"}), 200

@schedule_bp.route('/available-slots', methods=['GET'])
@jwt_required()
def get_available_slots():
    current_user_id = get_jwt_identity()
    date_str = request.args.get('date')
    
    if not date_str:
        return jsonify({"error": "Date parameter is required"}), 400
    
    # Get user's schedule
    schedule = Schedule.query.filter_by(user_id=current_user_id).first()
    
    if not schedule:
        return jsonify({"error": "No schedule found"}), 404
    
    # Parse the requested date
    requested_date = datetime.fromisoformat(date_str).date()
    
    # Check if date is within schedule range
    if requested_date < schedule.start_date or requested_date > schedule.end_date:
        return jsonify({"message": "Date is outside of scheduled range", "slots": []}), 200
    
    # Check if day is a working day
    day_of_week = requested_date.weekday()  # 0 = Monday, 6 = Sunday
    is_working_day = False
    
    if day_of_week == 0 and schedule.monday:
        is_working_day = True
    elif day_of_week == 1 and schedule.tuesday:
        is_working_day = True
    elif day_of_week == 2 and schedule.wednesday:
        is_working_day = True
    elif day_of_week == 3 and schedule.thursday:
        is_working_day = True
    elif day_of_week == 4 and schedule.friday:
        is_working_day = True
    elif day_of_week == 5 and schedule.saturday:
        is_working_day = True
    elif day_of_week == 6 and schedule.sunday:
        is_working_day = True
    
    if not is_working_day:
        return jsonify({"message": "Not a working day", "slots": []}), 200
    
    # Generate time slots
    slots = []
    current_time = schedule.start_time
    end_time = schedule.end_time
    
    while current_time < end_time:
        slot_end = time(
            current_time.hour + ((current_time.minute + schedule.slot_duration) // 60),
            (current_time.minute + schedule.slot_duration) % 60
        )
        
        if slot_end <= end_time:
            slots.append({
                "start": current_time.isoformat(),
                "end": slot_end.isoformat()
            })
        
        current_time = slot_end
    
    return jsonify({"slots": slots}), 200

