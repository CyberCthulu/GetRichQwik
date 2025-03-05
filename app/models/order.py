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

    def to_dict(self):
        return {
            "id": self.id,
            "portfolio_id": self.portfolio_id,
            "stock_id": self.stock_id,
            "order_type": self.order_type.value if self.order_type else None,
            "quantity": float(self.quantity) if self.quantity is not None else None,
            "target_price": float(self.target_price) if self.target_price is not None else None,
            "scheduled_time": self.scheduled_time.isoformat() if self.scheduled_time else None,
            "status": self.status.value if self.status else None,
            "executed_price": float(self.executed_price) if self.executed_price is not None else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "executed_at": self.executed_at.isoformat() if self.executed_at else None,
        }
