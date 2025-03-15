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

    # Parse scheduled_time if provided.
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

        fill_price = stock_obj.market_price  # Use current market price

        # Use Decimal arithmetic for accuracy.
        quantity_decimal = Decimal(str(data["quantity"]))
        fill_price_decimal = Decimal(str(fill_price))
        cost = quantity_decimal * fill_price_decimal
        now = datetime.utcnow()

        if data["order_type"] == "buy":
            # Check if the portfolio has enough funds.
            if portfolio.portfolio_balance < cost:
                return jsonify({"message": "Insufficient funds in portfolio"}), 400

            # Execute order.
            order.status = OrderStatusEnum.executed
            order.executed_price = fill_price
            order.executed_at = now

            # **Deduct funds from the portfolio balance only**
            portfolio.portfolio_balance -= cost

            # Update holdings.
            holding = Holding.query.filter_by(
                portfolio_id=portfolio.id, stock_id=data["stock_id"]
            ).first()
            if holding:
                holding.quantity += quantity_decimal
            else:
                new_holding = Holding(
                    portfolio_id=portfolio.id,
                    stock_id=data["stock_id"],
                    quantity=quantity_decimal,
                    created_at=now,
                    updated_at=now
                )
                db.session.add(new_holding)
        elif data["order_type"] == "sell":
            holding = Holding.query.filter_by(
                portfolio_id=portfolio.id, stock_id=data["stock_id"]
            ).first()
            if not holding or holding.quantity < quantity_decimal:
                return jsonify({"message": "Not enough shares to sell"}), 400

            order.status = OrderStatusEnum.executed
            order.executed_price = fill_price
            order.executed_at = now

            proceeds = quantity_decimal * fill_price_decimal
            portfolio.portfolio_balance += proceeds
            holding.quantity -= quantity_decimal
        else:
            return jsonify({"message": "Invalid order type"}), 400

    db.session.commit()
    return jsonify({"order": order.to_dict()}), 201




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


@order_routes.route('', methods=['GET'])
@login_required
def get_all_orders_for_user():
    user_id = current_user.id
    # Query for all orders from all portfolios belonging to this user
    orders = Order.query.join(Portfolio).filter(Portfolio.user_id == user_id).all()
    
    return jsonify([order.to_dict() for order in orders])
