from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models.database import db
from models.task import Task

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('', methods=['GET'])
@jwt_required()
def get_tasks():
    current_user_id = get_jwt_identity()
    
    # Get query parameters for filtering
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    source = request.args.get('source')
    
    # Base query
    query = Task.query.filter_by(user_id=current_user_id)
    
    # Apply filters if provided
    if start_date:
        query = query.filter(Task.date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Task.date <= datetime.fromisoformat(end_date))
    if source:
        query = query.filter_by(source=source)
    
    # Execute query and convert to dict
    tasks = [task.to_dict() for task in query.all()]
    
    return jsonify(tasks), 200

@tasks_bp.route('/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    current_user_id = get_jwt_identity()
    
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()
    
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    return jsonify(task.to_dict()), 200

@tasks_bp.route('', methods=['POST'])
def create_task():
    # current_user_id = get_jwt_identity()
    data = request.get_json()
    print(data)
    # Validate required fields
    if not data or not data.get('title') or not data.get('date'):
        return jsonify({"error": "Title and date are required"}), 400
    print(data)
    # Create new task
    new_task = Task(
        title=data['title'],
        description=data.get('description', ''),
        date=datetime.fromisoformat(data['date']),
        completed=data.get('completed', False),
        assigned_to=data.get('assignedTo', ''),
        source=data.get('source', 'local'),
        user_id=data["id"],
    )
    print(new_task)
    db.session.add(new_task)
    db.session.commit()
    
    return jsonify(new_task.to_dict()), 201

@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()
    
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    # Update task fields
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'date' in data:
        task.date = datetime.fromisoformat(data['date'])
    if 'completed' in data:
        task.completed = data['completed']
    if 'assigned_to' in data:
        task.assigned_to = data['assigned_to']
    
    db.session.commit()
    
    return jsonify(task.to_dict()), 200

@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    current_user_id = get_jwt_identity()
    
    task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()
    
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({"message": "Task deleted successfully"}), 200

