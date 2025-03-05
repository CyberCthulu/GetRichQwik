from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models import User, Portfolio, Watchlist, db

user_routes = Blueprint('users', __name__)


@user_routes.route('/', methods=['GET'])
@login_required
def get_users():
    """
    Query for all users and returns them in a list of user dictionaries.
    """
    users = User.query.all()
    return jsonify({"users": [user.to_dict() for user in users]}), 200


@user_routes.route('/<int:id>', methods=['GET'])
@login_required
def get_user(id):
    """
    Query for a user by id and returns that user in a dictionary.
    """
    user = User.query.get_or_404(id)
    return jsonify({"user": user.to_dict()}), 200

@user_routes.route('/current', methods=['GET'])
@login_required
def get_current_user():
    """
    Retrieve the current logged-in user's details.
    """
    return jsonify({"user": current_user.to_dict()}), 200

@user_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_user(id):
    """
    Update a user's profile information.
    Only allows the current user to update their own profile.
    Expects a JSON body with any of: first_name, last_name, email, username.
    """
    user = User.query.get_or_404(id)
    # Only allow users to update their own profile
    if user.id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json()
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'email' in data:
        user.email = data['email']
    if 'username' in data:
        user.username = data['username']

    db.session.commit()
    return jsonify({"user": user.to_dict()}), 200

@user_routes.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_user(id):
    """
    Deletes a user account.
    Only allows the current user to delete their own account.
    """
    user = User.query.get_or_404(id)
    if user.id != current_user.id:
        return jsonify({"message": "Forbidden"}), 403

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200


@user_routes.route('/portfolios', methods=['GET'])
@login_required
def get_user_portfolios():
    """
    Retrieve all portfolios associated with the current user.
    This endpoint requires authentication and returns only the portfolios
    belonging to the logged-in user.
    """
    portfolios = Portfolio.query.filter_by(user_id=current_user.id).all()
    return jsonify({"portfolios": [portfolio.to_dict() for portfolio in portfolios]}), 200

@user_routes.route('/watchlists', methods=['GET'])
@login_required
def get_user_watchlists():
    """
    Retrieve all watchlists associated with the current user.
    This endpoint requires authentication and returns only the watchlists
    belonging to the logged-in user.
    """
    watchlists = Watchlist.query.filter_by(user_id=current_user.id).all()
    if not watchlists:
        return jsonify({"message": "Watchlists not found"}), 404
    return jsonify({"watchlists": [watchlist.to_dict() for watchlist in watchlists]}), 200

