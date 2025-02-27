import enum
from datetime import datetime
from .db import db, environment, SCHEMA, add_prefix_for_prod

# Enum definitions matching your schema
class OrderTypeEnum(enum.Enum):
    buy = "buy"
    sell = "sell"

class OrderStatusEnum(enum.Enum):
    pending = "pending"
    executed = "executed"
    cancelled = "cancelled"

class Order(db.Model):
    __tablename__ = 'orders'
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    portfolio_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('portfolios.id')), nullable=False)
    stock_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('stocks.id')), nullable=False)
    order_type = db.Column(db.Enum(OrderTypeEnum), nullable=False, comment="buy or sell")
    quantity = db.Column(db.Numeric(15,4), nullable=False)
    target_price = db.Column(db.Numeric(10,2), nullable=True)      # For scheduled orders; null for immediate orders
    scheduled_time = db.Column(db.DateTime, nullable=True)           # If provided, indicates a future scheduled order
    status = db.Column(db.Enum(OrderStatusEnum), default=OrderStatusEnum.pending, comment="pending, executed, cancelled")
    executed_price = db.Column(db.Numeric(10,2), nullable=True)      # Recorded when the order is executed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    executed_at = db.Column(db.DateTime, nullable=True)              # When the order was actually filled

    # Relationships
