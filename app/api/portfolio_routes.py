from flask import Blueprint, jsonify, request
from decimal import Decimal
from flask_login import login_required, current_user
from datetime import datetime
from app.models import Portfolio, User, Holding, Order, db

portfolio_routes = Blueprint('portfolios', __name__)

@portfolio_routes.route('/', methods=['GET'])
@login_required
def get_portfolios():
    """
    Retrieve all portfolios associated with the current user.
    ---
    Successful Response:
      - Status Code: 200
      - Body:
        {
          "portfolios": [
            {
              "id": 1,
              "user_id": 1,
              "name": "Main Portfolio",
              "portfolio_balance": 100000.00,
              "holdings": ["1", "2"],
              "orders": ["1"],
              "created_at": "2025-01-23T12:05:00",
              "updated_at": "2025-01-23T12:05:00"
            },
            ...
          ]
        }
    Error Response (User Not Found):
      - Status Code: 404
      - Body: { "message": "User not found" }
    """
    # current_user should be available thanks to @login_required
    if not current_user:
        return jsonify({"message": "User not found"}), 404

    portfolios = Portfolio.query.filter_by(user_id=current_user.id).all()
    return jsonify({"portfolios": [portfolio.to_dict() for portfolio in portfolios]}), 200

@portfolio_routes.route('/', methods=['POST'])
@login_required
def create_portfolio():
    data = request.get_json()
    name = data.get("name")
    portfolio_balance = data.get("portfolio_balance", 0)

    errors = {}
    if not name:
        errors["name"] = "Portfolio name is required"
    if portfolio_balance < 0:
        errors["portfolio_balance"] = "Portfolio balance must be a non-negative number"
    if errors:
        return jsonify({"message": "Validation error", "errors": errors}), 400

    # Check if the user has enough total cash_balance to fund this portfolio:
    if current_user.cash_balance < portfolio_balance:
        return jsonify({"message": "Insufficient funds in user's cash balance"}), 400

    # Create the portfolio AND set initial_investment to match the amount funded:
    portfolio = Portfolio(
        user_id=current_user.id,
        name=name,
        portfolio_balance=portfolio_balance,
        initial_investment=portfolio_balance,  # <-- Set it here
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.session.add(portfolio)

    # Deduct the funds from the user's overall cash balance
    current_user.cash_balance -= portfolio_balance
    db.session.commit()

    return jsonify({"portfolio": portfolio.to_dict()}), 201


@portfolio_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_portfolio(id):
    """
    Update the details of an existing portfolio.
    Only the owner can update their portfolio.
    ---
    Request Body (example):
      {
        "name": "Main Portfolio - Updated",
        "portfolio_balance": 105000.00
      }
    Successful Response:
      - Status Code: 200
      - Body: { "portfolio": { ... updated portfolio ... } }
    Error Response (Portfolio Not Found):
      - Status Code: 404
      - Body: { "message": "Portfolio not found" }
    """
    portfolio = Portfolio.query.get_or_404(id)
    # Ensure the portfolio belongs to the current user.
    if portfolio.user_id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json()
    if "name" in data:
        portfolio.name = data["name"]
    
    # Optional: Adjusting portfolio_balance might require additional logic,
    # such as transferring funds between portfolio and user's cash_balance.
    if "portfolio_balance" in data:
        new_balance = data["portfolio_balance"]
        # For simplicity, let's assume we're updating the portfolio_balance without transferring funds.
        portfolio.portfolio_balance = new_balance

    portfolio.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"portfolio": portfolio.to_dict()}), 200

@portfolio_routes.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_portfolio(id):
    portfolio = Portfolio.query.get_or_404(id)
    if portfolio.user_id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403

    # Prevent deletion if there are active holdings
    if portfolio.holdings and len(portfolio.holdings) > 0:
        return jsonify({
            "message": "Portfolio deletion error",
            "errors": {
                "holdings": "Please liquidate all holdings before deleting the portfolio."
            }
        }), 400

    # Transfer remaining funds from portfolio back to user's cash_balance.
    from decimal import Decimal
    current_user.cash_balance = float(Decimal(str(current_user.cash_balance)) + portfolio.portfolio_balance)

    db.session.delete(portfolio)
    db.session.commit()
    return jsonify({"message": "Portfolio deleted successfully"}), 200

    portfolio = Portfolio.query.get_or_404(id)
    if portfolio.user_id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403

    # Convert current_user.cash_balance to Decimal and add portfolio.portfolio_balance,
    # then convert back to float for storage (since SQLite doesn't support Decimal natively)
    from decimal import Decimal
    new_balance = Decimal(str(current_user.cash_balance)) + portfolio.portfolio_balance
    current_user.cash_balance = float(new_balance)

    db.session.delete(portfolio)
    db.session.commit()
    return jsonify({"message": "Portfolio deleted successfully"}), 200

    """
    Deletes an existing portfolio.
    Only allowed if the portfolio belongs to the current user.
    Upon deletion, any remaining portfolio_balance should be transferred
    back to the user's cash_balance.
    ---
    Successful Response:
      - Status Code: 200
      - Body: { "message": "Portfolio deleted successfully" }
    Error Response (Portfolio Not Found):
      - Status Code: 404
      - Body: { "message": "Portfolio not found" }
    """
    portfolio = Portfolio.query.get_or_404(id)
    if portfolio.user_id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403

    # Transfer remaining funds back to user's cash_balance.
    current_user.cash_balance = Decimal(str(current_user.cash_balance)) + portfolio.portfolio_balance

    db.session.delete(portfolio)
    db.session.commit()
    return jsonify({"message": "Portfolio deleted successfully"}), 200


@portfolio_routes.route('/<int:portfolio_id>/holdings', methods=['GET'])
@login_required
def get_holdings_for_portfolio(portfolio_id):
    """
    Retrieves all holdings for a specific portfolio.
    
    Successful Response (200):
      {
        "holdings": [
          {
            "id": 1,
            "portfolio_id": 1,
            "stock_id": 1,
            "quantity": 10.0,
            "average_purchase_price": 140.00,
            "created_at": "2025-02-18T12:30:00",
            "updated_at": "2025-02-18T12:30:00"
          },
          {
            "id": 2,
            "portfolio_id": 1,
            "stock_id": 2,
            "quantity": 5.0,
            "average_purchase_price": 270.00,
            "created_at": "2025-02-18T12:45:00",
            "updated_at": "2025-02-18T12:45:00"
          }
        ]
      }
      
    Error Response (404):
      { "message": "No Holdings in this portfolio." }
    """
    # Ensure the portfolio exists and belongs to the current user.
    portfolio = Portfolio.query.get_or_404(portfolio_id)
    if portfolio.user_id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403

    holdings = portfolio.holdings
    if not holdings:
        return jsonify({"message": "No Holdings in this portfolio."}), 404

    return jsonify({"holdings": [holding.to_dict() for holding in holdings]}), 200

@portfolio_routes.route('/<int:portfolio_id>/orders', methods=['GET'])
@login_required
def get_orders_for_portfolio(portfolio_id):
    """
    Retrieves all orders for a given portfolio.
    
    Successful Response:
      - Status Code: 200
      - Body:
        {
          "orders": [
            {
              "id": 1,
              "portfolio_id": 1,
              "stock_id": 1,
              "order_type": "buy",
              "quantity": 5.0,
              "target_price": null,
              "scheduled_time": null,
              "status": "pending",
              "executed_price": null,
              "created_at": "2025-02-18T12:35:00",
              "updated_at": "2025-02-18T12:35:00",
              "executed_at": null,
              "deleted_at": null
            }
          ]
        }
        
    Error Response:
      - Status Code: 404
      - Body:
        { "message": "Orders not found for the portfolio" }
    """
    portfolio = Portfolio.query.get_or_404(portfolio_id)
    # Ensure the portfolio belongs to the current user
    if portfolio.user_id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403

    orders = portfolio.orders
    if not orders:
        return jsonify({"message": "Orders not found for the portfolio"}), 404

    return jsonify({"orders": [order.to_dict() for order in orders]}), 200


@portfolio_routes.route('/<int:id>', methods=['GET'])
@login_required
def get_portfolio(id):
    portfolio = Portfolio.query.get_or_404(id)
    # Ensure the portfolio belongs to the current user
    if portfolio.user_id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403
    return jsonify({"portfolio": portfolio.to_dict()}), 200