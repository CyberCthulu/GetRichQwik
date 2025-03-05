from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from datetime import datetime
from app.models import Order, Portfolio, db, OrderTypeEnum, OrderStatusEnum

order_routes = Blueprint('orders', __name__)

@order_routes.route('/', methods=['POST'])
@login_required
def create_order():
    """
    Creates a new order (buy or sell) for a portfolio.
    Expects a JSON body with:
      {
        "portfolio_id": 1,
        "stock_id": 1,
        "order_type": "buy",
        "quantity": 5.0,
        "target_price": null,
        "scheduled_time": null
      }
    Successful Response:
      - Status Code: 201
      - Body: { "order": { ... order details ... } }
    Error Response (Validation Errors):
      - Status Code: 400
      - Body: { "message": "Validation error", "errors": { ... } }
    """
    data = request.get_json() or {}
    errors = {}
    
    # Validate required fields
    if not data.get("portfolio_id"):
        errors["portfolio_id"] = "Portfolio ID is required"
    if not data.get("stock_id"):
        errors["stock_id"] = "Stock ID is required"
    if not data.get("order_type") or data.get("order_type") not in ["buy", "sell"]:
        errors["order_type"] = "Order type must be either 'buy' or 'sell'"
    if not data.get("quantity") or data.get("quantity") <= 0:
        errors["quantity"] = "Quantity must be a positive number"
    
    if errors:
        return jsonify({"message": "Validation error", "errors": errors}), 400

    # Check if the portfolio belongs to the current user.
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

    # Create the order.
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
    """
    Cancels (soft-deletes) an order that has not yet been executed.
    Successful Response:
      - Status Code: 200
      - Body: { "message": "Order canceled successfully" }
    Error Response:
      - Status Code: 404
      - Body: { "message": "Order not found" }
    """
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"message": "Order not found"}), 404

    # Ensure the order belongs to the current user.
    if order.portfolio.user_id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403

    # Soft-delete: update deleted_at field.
    order.deleted_at = datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "Order canceled successfully"}), 200
