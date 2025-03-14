from decimal import Decimal
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from datetime import datetime
from app.models import Order, Portfolio, db, OrderTypeEnum, OrderStatusEnum, Holding, Stock
from app.jobs.is_market_open import is_market_open_now

order_routes = Blueprint('orders', __name__)

@order_routes.route("", methods=["POST"])
@login_required
def create_order():
    """
    Creates a new order (buy or sell) for a portfolio.
    Expects a JSON body with:
      {
        "portfolio_id": 1,
        "stock_id": 1,
        "order_type": "buy",   // or "sell"
        "quantity": 5.0,
        "target_price": null,
        "scheduled_time": null
      }
    For immediate orders (no target_price and no scheduled_time):
      - Checks if the market is open.
      - For a buy order, verifies that the user has enough funds.
      - For a sell order, verifies that the portfolio holds enough shares.
      If everything is valid, the order is executed immediately.
    """
    data = request.get_json() or {}
    errors = {}

    # Validate required fields.
    if not data.get("portfolio_id"):
        errors["portfolio_id"] = "Portfolio ID is required."
    if not data.get("stock_id"):
        errors["stock_id"] = "Stock ID is required."
    if not data.get("order_type") or data.get("order_type") not in ["buy", "sell"]:
        errors["order_type"] = "Order type must be either 'buy' or 'sell'."
    if not data.get("quantity") or data.get("quantity") <= 0:
        errors["quantity"] = "Quantity must be a positive number."

    if errors:
        return jsonify({"message": "Validation error", "errors": errors}), 400

    # Ensure the portfolio belongs to the current user.
    portfolio = Portfolio.query.get(data["portfolio_id"])
    if not portfolio or portfolio.user_id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403

    # For scheduled_time, if provided, parse it from ISO format.
    scheduled_time = None
    if data.get("scheduled_time"):
        try:
            scheduled_time = datetime.fromisoformat(data["scheduled_time"])
        except ValueError:
            errors["scheduled_time"] = "Invalid scheduled_time format. Must be ISO 8601."
            return jsonify({"message": "Validation error", "errors": errors}), 400

    # Create the order with initial pending status.
    order = Order(
        portfolio_id=data["portfolio_id"],
        stock_id=data["stock_id"],
        order_type=OrderTypeEnum(data["order_type"]),
        quantity=data["quantity"],
        target_price=data.get("target_price"),
        scheduled_time=scheduled_time,
        status=OrderStatusEnum.pending,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.session.add(order)

    # Determine if this is an immediate order:
    immediate = (data.get("target_price") is None) and (scheduled_time is None)
    if immediate:
        # Check if the market is open.
        if not is_market_open_now():
            return jsonify({"message": "Market is closed. Order not executed."}), 400

        # Retrieve the current stock data.
        stock_obj = Stock.query.get(data["stock_id"])
        if not stock_obj:
            return jsonify({"message": "Stock not found"}), 404

        # Use the current market price from the stock.
        fill_price = stock_obj.market_price

        # Convert quantity and fill_price to Decimal for arithmetic
        quantity = Decimal(str(data["quantity"]))
        fill_price_decimal = Decimal(str(fill_price))
        cost = quantity * fill_price_decimal  # Cost as Decimal
        now = datetime.utcnow()

        if data["order_type"] == "buy":
            # Verify that the user has enough funds (both are Decimals).
            if portfolio.user.cash_balance < cost:
                return jsonify({"message": "Insufficient funds"}), 400
            # Execute order: mark as executed and record fill details.
            order.status = OrderStatusEnum.executed
            order.executed_price = fill_price  # store as Decimal if your column is Numeric
            order.executed_at = now
            # Deduct funds from the user's cash balance.
            portfolio.user.cash_balance -= cost

            # Update holdings: if already exists, add quantity; else, create new holding.
            holding = Holding.query.filter_by(
                portfolio_id=portfolio.id, stock_id=data["stock_id"]
            ).first()
            if holding:
                holding.quantity += quantity
            else:
                new_holding = Holding(
                    portfolio_id=portfolio.id,
                    stock_id=data["stock_id"],
                    quantity=quantity,
                    created_at=now,
                    updated_at=now
                )
                db.session.add(new_holding)
        elif data["order_type"] == "sell":
            # Retrieve the holding.
            holding = Holding.query.filter_by(
                portfolio_id=portfolio.id, stock_id=data["stock_id"]
            ).first()
            if not holding or holding.quantity < quantity:
                return jsonify({"message": "Not enough shares to sell"}), 400
            # Execute order:
            order.status = OrderStatusEnum.executed
            order.executed_price = fill_price
            order.executed_at = now
            # Add funds to user's cash balance.
            proceeds = quantity * fill_price_decimal
            portfolio.user.cash_balance += proceeds
            # Subtract shares from the holding.
            holding.quantity -= quantity
            # Optionally, remove the holding if quantity is zero.
        else:
            return jsonify({"message": "Invalid order type"}), 400

    # Commit all changes.
    db.session.commit()
    return jsonify({"order": order.to_dict()}), 201


# @order_routes.route('', methods=['POST'])
# @login_required
# def create_order():
#     """
#     Creates a new order (buy or sell) for a portfolio.
#     Expects a JSON body with:
#       {
#         "portfolio_id": 1,
#         "stock_id": 1,
#         "order_type": "buy",
#         "quantity": 5.0,
#         "target_price": null,
#         "scheduled_time": null
#       }
#     Successful Response:
#       - Status Code: 201
#       - Body: { "order": { ... order details ... } }
#     Error Response (Validation Errors):
#       - Status Code: 400
#       - Body: { "message": "Validation error", "errors": { ... } }
#     """
#     data = request.get_json() or {}
#     errors = {}
    
#     # Validate required fields
#     if not data.get("portfolio_id"):
#         errors["portfolio_id"] = "Portfolio ID is required"
#     if not data.get("stock_id"):
#         errors["stock_id"] = "Stock ID is required"
#     if not data.get("order_type") or data.get("order_type") not in ["buy", "sell"]:
#         errors["order_type"] = "Order type must be either 'buy' or 'sell'"
#     if not data.get("quantity") or data.get("quantity") <= 0:
#         errors["quantity"] = "Quantity must be a positive number"
    
#     if errors:
#         return jsonify({"message": "Validation error", "errors": errors}), 400

#     # Check if the portfolio belongs to the current user.
#     portfolio = Portfolio.query.get(data["portfolio_id"])
#     if not portfolio or portfolio.user_id != current_user.id:
#         return jsonify({"message": "Forbidden"}), 403

#     # For scheduled_time, if provided, parse it from ISO format.
#     scheduled_time = None
#     if data.get("scheduled_time"):
#         try:
#             scheduled_time = datetime.fromisoformat(data["scheduled_time"])
#         except ValueError:
#             errors["scheduled_time"] = "Invalid scheduled_time format. Must be ISO 8601."
#             return jsonify({"message": "Validation error", "errors": errors}), 400

#     # Create the order.
#     order = Order(
#         portfolio_id=data["portfolio_id"],
#         stock_id=data["stock_id"],
#         order_type=OrderTypeEnum(data["order_type"]),
#         quantity=data["quantity"],
#         target_price=data.get("target_price"),
#         scheduled_time=scheduled_time,
#         status=OrderStatusEnum.pending,
#         created_at=datetime.utcnow(),
#         updated_at=datetime.utcnow()
#     )
#     db.session.add(order)
#     db.session.commit()

#     return jsonify({"order": order.to_dict()}), 201


@order_routes.route('/<int:order_id>', methods=['PUT'])
@login_required
def update_order(order_id):
    """
    Updates details of an existing order that is still pending.
    Expects a JSON body (example):
      {
        "quantity": 10.0,
        "target_price": 145.00,
        "scheduled_time": "2025-02-20T12:00:00"
      }
    Successful Response:
      - Status Code: 200
      - Body: { "order": { ... updated order details ... } }
    Error Response:
      - Status Code: 404
      - Body: { "message": "Order not found or cannot be updated" }
    """
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"message": "Order not found or cannot be updated"}), 404

    # Ensure the order belongs to a portfolio owned by the current user.
    if order.portfolio.user_id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json() or {}

    # Update only allowed fields.
    if "quantity" in data:
        if data["quantity"] <= 0:
            return jsonify({"message": "Validation error", "errors": {"quantity": "Quantity must be a positive number"}}), 400
        order.quantity = data["quantity"]

    if "target_price" in data:
        order.target_price = data["target_price"]

    if "scheduled_time" in data:
        try:
            order.scheduled_time = datetime.fromisoformat(data["scheduled_time"])
        except ValueError:
            return jsonify({"message": "Validation error", "errors": {"scheduled_time": "Invalid scheduled_time format. Must be ISO 8601."}}), 400

    order.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({"order": order.to_dict()}), 200


@order_routes.route('/<int:order_id>', methods=['DELETE'])
@login_required
def delete_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"message": "Order not found"}), 404

    if order.portfolio.user_id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403

    order.deleted_at = datetime.utcnow()
    order.status = OrderStatusEnum.cancelled  # updated to set status to cancelled
    db.session.commit()

    return jsonify({
         "order": order.to_dict(),
         "message": "Order canceled successfully"
    }), 200


