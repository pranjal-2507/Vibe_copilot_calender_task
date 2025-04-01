from datetime import datetime
from models.database import db

class Meeting(db.Model):
    __tablename__ = 'meetings'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    date = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Integer, nullable=False)  # Duration in minutes
    platform = db.Column(db.String(20), nullable=False)  # 'zoom', 'teams'
    meeting_link = db.Column(db.String(255))
    participants = db.Column(db.Text)  # Comma-separated list of email addresses
    source = db.Column(db.String(20), default='local')  # 'local', 'outlook', 'gmail'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'date': self.date.isoformat(),
            'duration': self.duration,
            'platform': self.platform,
            'meeting_link': self.meeting_link,
            'participants': self.participants,
            'source': self.source,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Meeting {self.title}>'

