from datetime import datetime
from .db import db, environment, SCHEMA, add_prefix_for_prod
from decimal import Decimal, ROUND_HALF_UP

class Portfolio(db.Model):
    __tablename__ = 'portfolios'
    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    # Current cash balance available for purchasing stocks.
    portfolio_balance = db.Column(db.Numeric(15,2), default=Decimal("0.00"))
    # New field: the initial amount invested (i.e. the cash loaded when creating the portfolio)
    initial_investment = db.Column(db.Numeric(15,2), default=Decimal("0.00"))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref='portfolios')
    holdings = db.relationship('Holding', backref='portfolio', cascade="all, delete-orphan")
    orders = db.relationship('Order', backref='portfolio', cascade="all, delete-orphan")

    def to_dict(self):
        # Calculate the total value of holdings.
        holdings_value = Decimal("0.00")
        if self.holdings:
            for holding in self.holdings:
                if holding.stock and holding.stock.market_price is not None:
                    try:
                        price = Decimal(str(holding.stock.market_price))
                    except Exception:
                        price = Decimal("0.00")
                    try:
                        qty = Decimal(str(holding.quantity))
                    except Exception:
                        qty = Decimal("0.00")
                    holdings_value += qty * price

        # Use portfolio_balance as current cash balance (ensure it's a Decimal).
        cash_balance = self.portfolio_balance if self.portfolio_balance is not None else Decimal("0.00")
        # Use initial_investment if it exists; otherwise, default it to cash_balance.
        initial_investment = self.initial_investment if self.initial_investment is not None else cash_balance

        # Total portfolio value: cash available + value of holdings.
        total_value = cash_balance + holdings_value
        # Gains/Losses: the change relative to the initial investment.
        gains_loss = total_value - initial_investment

        # Round to two decimal places.
        cash_balance = cash_balance.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        total_value = total_value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        gains_loss = gains_loss.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "portfolio_balance": float(cash_balance),
            "initial_investment": float(initial_investment),
            "portfolio_value": float(total_value),
            "gains_loss": float(gains_loss),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "holdings": [holding.to_dict() for holding in self.holdings] if self.holdings else [],
            "orders": [order.to_dict() for order in self.orders] if self.orders else []
        }
