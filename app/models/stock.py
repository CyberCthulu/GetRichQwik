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

    def to_dict(self):
        return {
            "id": self.id,
            "ticker_symbol": self.ticker_symbol,
            "company_name": self.company_name,
            "sector": self.sector,
            "market_price": float(self.market_price) if self.market_price is not None else None,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
