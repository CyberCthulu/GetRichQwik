from datetime import datetime
from .db import db, environment, SCHEMA, add_prefix_for_prod

class Watchlist(db.Model):
    __tablename__ = 'watchlists'
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref='watchlists')
    watchlist_stocks = db.relationship('WatchlistStock', backref='watchlist', cascade="all, delete-orphan")
