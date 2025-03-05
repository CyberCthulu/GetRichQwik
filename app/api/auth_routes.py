from flask import Blueprint, request, jsonify
from app.models import User, db
from app.forms import LoginForm, SignUpForm
from flask_login import current_user, login_user, logout_user, login_required

auth_routes = Blueprint('auth', __name__)

@auth_routes.route('/')
def authenticate():
    """
    Authenticates a user.
    """
    if current_user.is_authenticated:
        return current_user.to_dict()
    return {'errors': {'message': 'Unauthorized'}}, 401

@auth_routes.route('/current', methods=['GET'])
def current_session():
    """
    Get the current logged-in user.
    If authenticated, returns the user object; otherwise, returns {"user": null}.
    """
    if current_user.is_authenticated:
        return jsonify({"user": current_user.to_dict()}), 200
    return jsonify({"user": None}), 200

@auth_routes.route('/login', methods=['POST'])
def login():
    """
    Logs a user in.
    Expects a JSON body with email and password.
    """
    form = LoginForm()
    # Get the CSRF token from the request cookie and assign it to the form.
    form['csrf_token'].data = request.cookies.get('csrf_token')
    if form.validate_on_submit():
        user = User.query.filter(User.email == form.data['email']).first()
        if user and user.check_password(form.data['password']):
            login_user(user)
            return jsonify({"user": user.to_dict()}), 200
        else:
            return jsonify({"message": "Invalid credentials"}), 401
    return jsonify({"message": "Bad Request", "errors": form.errors}), 400

@auth_routes.route('/logout', methods=['POST'])
@login_required
def logout():
    """
    Logs a user out.
    """
    logout_user()
    return jsonify({"message": "User logged out"}), 200


@auth_routes.route('/signup', methods=['POST'])
def sign_up():
    """
    Creates a new user and logs them in.
    Expects a JSON body with first_name, last_name, email, username, password, and confirm_password.
    """
    form = SignUpForm()
    form['csrf_token'].data = request.cookies.get('csrf_token')
    if form.validate_on_submit():
        existing_user = User.query.filter(
            (User.email == form.data['email']) | (User.username == form.data['username'])
        ).first()
        if existing_user:
            return jsonify({
                "message": "User already exists",
                "errors": {
                    "email": "User with that email already exists",
                    "username": "User with that username already exists"
                }
            }), 409

        user = User(
            first_name=form.data['first_name'],
            last_name=form.data['last_name'],
            username=form.data['username'],
            email=form.data['email']
        )
        user.password = form.data['password']
        db.session.add(user)
        db.session.commit()
        login_user(user)
        return jsonify({"user": user.to_dict()}), 201
    return jsonify({"message": "Bad Request", "errors": form.errors}), 400


@auth_routes.route('/unauthorized')
def unauthorized():
    """
    Returns unauthorized JSON when flask-login authentication fails.
    """
    return jsonify({"errors": {"message": "Unauthorized"}}), 401
