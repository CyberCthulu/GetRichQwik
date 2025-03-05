from datetime import datetime
from .db import db, environment, SCHEMA, add_prefix_for_prod

class Portfolio(db.Model):
    __tablename__ = 'portfolios'
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    portfolio_balance = db.Column(db.Numeric(15,2), default=0.00)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref='portfolios')
    holdings = db.relationship('Holding', backref='portfolio', cascade="all, delete-orphan")
    orders = db.relationship('Order', backref='portfolio', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "portfolio_balance": float(self.portfolio_balance) if self.portfolio_balance is not None else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "holdings": [holding.to_dict() for holding in self.holdings] if self.holdings else [],
            "orders": [order.to_dict() for order in self.orders] if self.orders else []
        }
