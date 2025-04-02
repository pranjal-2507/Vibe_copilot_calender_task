from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models.database import db
from routes.tasks import tasks_bp
from routes.events import events_bp
from routes.meetings import meetings_bp
from routes.sync import sync_bp
from routes.meeting_generator import meeting_generator_bp
from routes.schedule import schedule_bp
from routes.auth import auth_bp
import traceback

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins
jwt = JWTManager(app)
db.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(tasks_bp, url_prefix='/tasks')
app.register_blueprint(events_bp, url_prefix='/events')
app.register_blueprint(meetings_bp, url_prefix='/meetings')
app.register_blueprint(sync_bp, url_prefix='/sync')
app.register_blueprint(meeting_generator_bp, url_prefix='/generate-meeting')
app.register_blueprint(schedule_bp, url_prefix='/schedule')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Calendar API is running"}), 200

@app.route('/check_db', methods=['GET'])
def check_db():
    try:
        db.session.execute("SELECT 1")  # Corrected DB check
        return jsonify({"status": "success", "message": "Database connected"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Error handling improvements
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({"error": "Something went wrong", "details": str(e)}), 500

# Ensure database tables are created
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, port=8181)
