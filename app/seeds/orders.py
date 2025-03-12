from datetime import datetime
from app.models import db, Order, Portfolio, Stock, OrderTypeEnum, OrderStatusEnum, environment, SCHEMA

def seed_orders():
    # Create a dummy order if a portfolio and stock (e.g., "AAPL") exist
    portfolio = Portfolio.query.first()
    stock = Stock.query.filter_by(ticker_symbol="AAPL").first()
    if portfolio and stock:
        order = Order(
            portfolio_id=portfolio.id,
            stock_id=stock.id,
            order_type=OrderTypeEnum.buy,
            quantity=5,  # Example: buy 5 shares
            target_price=None,  # Immediate order
            scheduled_time=None,
            status=OrderStatusEnum.pending,
            executed_price=None,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            executed_at=None
        )
        db.session.add(order)
        db.session.commit()

def undo_orders():
    if environment == "production":
        db.session.execute(f"TRUNCATE {SCHEMA}.orders RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("TRUNCATE orders RESTART IDENTITY CASCADE;")
    db.session.commit()
