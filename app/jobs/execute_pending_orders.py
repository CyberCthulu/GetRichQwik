# app/jobs/execute_pending_orders.py
from datetime import datetime
from app.models import db, Order, Portfolio, Holding, Stock, OrderStatusEnum
from app.jobs.is_market_open import is_market_open_now
from decimal import Decimal

def execute_pending_orders():
    """
    Checks for pending immediate orders and executes them if the market is open.
    """
    if not is_market_open_now():
        print("Market is closed; skipping pending order execution.")
        return

    now = datetime.utcnow()
    # Query orders that are still pending and have no scheduled time (immediate orders)
    pending_orders = Order.query.filter(
        Order.status == OrderStatusEnum.pending,
        Order.scheduled_time == None
    ).all()

    for order in pending_orders:
        # Retrieve the current stock data.
        stock_obj = Stock.query.get(order.stock_id)
        if not stock_obj:
            continue

        fill_price = stock_obj.market_price  # current market price
        quantity = Decimal(str(order.quantity))
        fill_price_decimal = Decimal(str(fill_price))
        cost = quantity * fill_price_decimal  # calculate total cost

        # Process based on order type
        if order.order_type == OrderStatusEnum.pending and order.order_type == "buy":
            portfolio = order.portfolio
            # Check if the user has sufficient funds
            if portfolio.user.cash_balance < cost:
                print(f"Order {order.id}: Insufficient funds for execution.")
                continue

            order.status = OrderStatusEnum.executed
            order.executed_price = fill_price
            order.executed_at = now
            portfolio.user.cash_balance -= cost

            # Update holdings
            holding = Holding.query.filter_by(
                portfolio_id=portfolio.id, stock_id=order.stock_id
            ).first()
            if holding:
                holding.quantity += order.quantity
            else:
                new_holding = Holding(
                    portfolio_id=portfolio.id,
                    stock_id=order.stock_id,
                    quantity=order.quantity,
                    created_at=now,
                    updated_at=now
                )
                db.session.add(new_holding)
            print(f"Executed buy order {order.id} for {order.stock_id} at {fill_price}")

        elif order.order_type == "sell":
            portfolio = order.portfolio
            holding = Holding.query.filter_by(
                portfolio_id=portfolio.id, stock_id=order.stock_id
            ).first()
            if not holding or holding.quantity < order.quantity:
                print(f"Order {order.id}: Not enough shares to sell.")
                continue

            order.status = OrderStatusEnum.executed
            order.executed_price = fill_price
            order.executed_at = now

            proceeds = quantity * fill_price_decimal
            portfolio.user.cash_balance += proceeds

            holding.quantity -= order.quantity
            print(f"Executed sell order {order.id} for {order.stock_id} at {fill_price}")

    db.session.commit()
