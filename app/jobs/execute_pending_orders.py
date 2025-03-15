# app/jobs/execute_pending_orders.py

from datetime import datetime
from decimal import Decimal
from app.models import Order, OrderStatusEnum, OrderTypeEnum, Stock, Holding, db
from app.jobs.is_market_open import is_market_open_now

def fill_order_immediately(order, fill_price):
    """
    Fills the order immediately: updates its status, records fill details,
    updates portfolio cash and holdings.
    """
    now = datetime.utcnow()
    order.status = OrderStatusEnum.executed
    order.executed_price = fill_price
    order.executed_at = now

    portfolio = order.portfolio
    quantity = Decimal(str(order.quantity))
    fill_price_decimal = Decimal(str(fill_price))
    
    if order.order_type == OrderTypeEnum.buy:
        cost = quantity * fill_price_decimal
        # Check funds here if needed; for now we assume that was verified earlier.
        portfolio.user.cash_balance -= cost

        # Update holdings: if a holding exists, add quantity; else, create a new one.
        holding = next((h for h in portfolio.holdings if h.stock_id == order.stock_id), None)
        if holding:
            holding.quantity += quantity
        else:
            new_holding = Holding(
                portfolio_id=portfolio.id,
                stock_id=order.stock_id,
                quantity=quantity,
                created_at=now,
                updated_at=now
            )
            db.session.add(new_holding)
    elif order.order_type == OrderTypeEnum.sell:
        proceeds = quantity * fill_price_decimal
        portfolio.user.cash_balance += proceeds
        holding = next((h for h in portfolio.holdings if h.stock_id == order.stock_id), None)
        if holding:
            holding.quantity -= quantity
            # Optionally remove holding if quantity becomes 0
    # (Optional: add notifications, logging, etc.)

def execute_pending_orders():
    """
    Fetch all pending orders and execute them if conditions are met.
    For market orders (target_price is None), execute immediately if the market is open.
    For limit orders, check:
      - Buy: current price <= target_price
      - Sell: current price >= target_price
    """
    pending_orders = Order.query.filter(Order.status == OrderStatusEnum.pending).all()

    for order in pending_orders:
        # Skip orders scheduled for the future
        if order.scheduled_time and order.scheduled_time > datetime.utcnow():
            continue

        stock = Stock.query.get(order.stock_id)
        if not stock:
            continue  # No stock info available; skip

        # Convert current market price to Decimal for safe comparison
        current_price = Decimal(str(stock.market_price))
        
        if order.target_price is None:
            # Market order: execute if the market is open.
            if is_market_open_now():
                fill_order_immediately(order, current_price)
        else:
            # Limit order: convert target_price to Decimal
            target_price = Decimal(str(order.target_price))
            if order.order_type == OrderTypeEnum.buy:
                # For a buy limit order, execute if the current price is at or below target.
                if current_price <= target_price:
                    fill_order_immediately(order, current_price)
            elif order.order_type == OrderTypeEnum.sell:
                # For a sell limit order, execute if the current price is at or above target.
                if current_price >= target_price:
                    fill_order_immediately(order, current_price)
    
    db.session.commit()
