from datetime import datetime
from .db import db, environment, SCHEMA

class Stock(db.Model):
    __tablename__ = 'stocks'
    if environment == "production":
        __table_args__ = (
            db.Index('idx_ticker_symbol', 'ticker_symbol'),
            db.Index('idx_company_name', 'company_name'),
            {'schema': SCHEMA}
        )
    else:
        __table_args__ = (
            db.Index('idx_ticker_symbol', 'ticker_symbol'),
            db.Index('idx_company_name', 'company_name'),
        )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ticker_symbol = db.Column(db.String(10), unique=True, nullable=False)
    company_name = db.Column(db.String(255), nullable=False)
    sector = db.Column(db.String(100))
    market_price = db.Column(db.Numeric(10,2), nullable=False)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    holdings = db.relationship('Holding', backref='stock', cascade="all, delete-orphan")
    orders = db.relationship('Order', backref='stock', cascade="all, delete-orphan")
    watchlist_stocks = db.relationship('WatchlistStock', backref='stock', cascade="all, delete-orphan")
