from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from datetime import datetime
from app.models import Watchlist, WatchlistStock, db

watchlist_routes = Blueprint('watchlists', __name__)

@watchlist_routes.route('/', methods=['POST'])
@login_required
def create_watchlist():
    """
    Creates a new watchlist for the logged-in user.
    Request Body:
      {
        "name": "My Watchlist"
      }
    Successful Response (201):
      {
        "watchlist": {
          "id": 2,
          "user_id": 1,
          "name": "My Watchlist",
          "stocks": [],
          "created_at": "2025-02-20T10:30:00",
          "updated_at": "2025-02-20T10:30:00"
        }
      }
    Error Response (Validation Error, 400):
      {
        "message": "Validation error",
        "errors": {
          "name": "Watchlist name is required"
        }
      }
    """
    data = request.get_json() or {}
    name = data.get("name")
    if not name:
        return jsonify({"message": "Validation error", "errors": {"name": "Watchlist name is required"}}), 400

    watchlist = Watchlist(
        user_id=current_user.id,
        name=name,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.session.add(watchlist)
    db.session.commit()
    return jsonify({"watchlist": watchlist.to_dict()}), 201

@watchlist_routes.route('/<int:watchlist_id>/stocks', methods=['POST'])
@login_required
def add_stock_to_watchlist(watchlist_id):
    """
    Adds a stock (by its ID) to an existing watchlist.
    Request Body:
      {
        "stock_id": 1
      }
    Successful Response (200):
      {
        "message": "Stock added to watchlist successfully"
      }
    Error Response (Stock Already Added, 400):
      {
        "message": "Stock is already in the watchlist"
      }
    """
    data = request.get_json() or {}
    stock_id = data.get("stock_id")
    if not stock_id:
        return jsonify({"message": "Validation error", "errors": {"stock_id": "Stock ID is required"}}), 400

    # Retrieve the watchlist and ensure it belongs to the current user.
    watchlist = Watchlist.query.get_or_404(watchlist_id)
    if watchlist.user_id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403

    # Check if the stock is already in the watchlist.
    existing_entry = WatchlistStock.query.filter_by(watchlist_id=watchlist.id, stock_id=stock_id).first()
    if existing_entry:
        return jsonify({"message": "Stock is already in the watchlist"}), 400

    new_entry = WatchlistStock(
        watchlist_id=watchlist.id,
        stock_id=stock_id,
        created_at=datetime.utcnow()
    )
    db.session.add(new_entry)
    db.session.commit()
    return jsonify({"message": "Stock added to watchlist successfully"}), 200

@watchlist_routes.route('/<int:watchlist_id>/stocks/<int:stock_id>', methods=['DELETE'])
@login_required
def remove_stock_from_watchlist(watchlist_id, stock_id):
    """
    Removes a specified stock from a watchlist.
    Successful Response (200):
      {
        "message": "Stock removed from watchlist successfully"
      }
    Error Response (404):
      {
        "message": "Watchlist or stock not found"
      }
    """
    entry = WatchlistStock.query.filter_by(watchlist_id=watchlist_id, stock_id=stock_id).first()
    if not entry:
        return jsonify({"message": "Watchlist or stock not found"}), 404

    # Ensure the watchlist belongs to the current user.
    if entry.watchlist.user_id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403

    db.session.delete(entry)
    db.session.commit()
    return jsonify({"message": "Stock removed from watchlist successfully"}), 200

@watchlist_routes.route('/<int:watchlist_id>', methods=['GET'])
@login_required
def get_watchlist(watchlist_id):
    """
    Retrieves one watchlist by ID, including its stocks array.
    """
    watchlist = Watchlist.query.get_or_404(watchlist_id)
    if watchlist.user_id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403
    return jsonify({"watchlist": watchlist.to_dict()}), 200

@watchlist_routes.route('/<int:watchlist_id>', methods=['DELETE'])
@login_required
def delete_watchlist(watchlist_id):
    """
    Deletes an entire watchlist for the current user.
    """
    watchlist = Watchlist.query.get_or_404(watchlist_id)
    if watchlist.user_id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403

    db.session.delete(watchlist)
    db.session.commit()
    return jsonify({"message": "Watchlist deleted successfully"}), 200

