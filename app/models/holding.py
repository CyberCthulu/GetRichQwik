from datetime import datetime
from .db import db, environment, SCHEMA, add_prefix_for_prod

class Holding(db.Model):
    __tablename__ = 'holdings'
    if environment == "production":
        __table_args__ = (
            db.UniqueConstraint('portfolio_id', 'stock_id', name='uix_portfolio_stock'),
            {'schema': SCHEMA}
        )
    else:
        __table_args__ = (
            db.UniqueConstraint('portfolio_id', 'stock_id', name='uix_portfolio_stock'),
        )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    portfolio_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('portfolios.id')), nullable=False)
    stock_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('stocks.id')), nullable=False)
    quantity = db.Column(db.Numeric(15,4), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
