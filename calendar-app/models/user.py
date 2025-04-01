from datetime import datetime
from models.database import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # OAuth tokens
    outlook_token = db.Column(db.Text)
    gmail_token = db.Column(db.Text)
    zoom_token = db.Column(db.Text)
    teams_token = db.Column(db.Text)
    
    # Relationships
    tasks = db.relationship('Task', backref='user', lazy=True, cascade='all, delete-orphan')
    events = db.relationship('Event', backref='user', lazy=True, cascade='all, delete-orphan')
    meetings = db.relationship('Meeting', backref='user', lazy=True, cascade='all, delete-orphan')
    schedule = db.relationship('Schedule', backref='user', uselist=False, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.email}>'

