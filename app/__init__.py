import os
from flask import Flask, redirect, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_wtf.csrf import generate_csrf
from flask_login import LoginManager
from flask_apscheduler import APScheduler

from .models import db, User
from .api.user_routes import user_routes
from .api.auth_routes import auth_routes
from .api.stock_routes import stock_routes
from .api.portfolio_routes import portfolio_routes
from .api.order_routes import order_routes
from .api.watchlist_routes import watchlist_routes
from .config import Config
from .seeds import seed_commands  # CLI seed commands

def create_app():
    app = Flask(__name__, static_folder='../react-vite/dist', static_url_path='/')
    app.config.from_object(Config)

    # Setup Flask-Login
    login = LoginManager(app)
    login.login_view = 'auth.unauthorized'
    
    @login.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # Initialize extensions
    db.init_app(app)
    Migrate(app, db)
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(user_routes, url_prefix='/api/users')
    app.register_blueprint(auth_routes, url_prefix='/api/auth')
    app.register_blueprint(portfolio_routes, url_prefix='/api/portfolios')
    app.register_blueprint(stock_routes, url_prefix='/api/stocks')
    app.register_blueprint(order_routes, url_prefix='/api/orders')
    app.register_blueprint(watchlist_routes, url_prefix='/api/watchlists')
    
    # Add CLI commands (e.g., for seeding)
    app.cli.add_command(seed_commands)
    
    # Set up APScheduler for scheduled tasks
    scheduler = APScheduler()
    scheduler.init_app(app)
    scheduler.start()
    
    # Define a wrapper function for the pending orders job so that it runs within an app context.
    def execute_pending_orders_wrapper():
        from app.jobs.execute_pending_orders import execute_pending_orders
        with app.app_context():
            execute_pending_orders()
    
    # Schedule the pending orders job to run every minute
    scheduler.add_job(
        id="execute_pending_orders",
        func=execute_pending_orders_wrapper,
        trigger="interval",
        minutes=1,
        replace_existing=True
    )
    
    # Application Security: Redirect HTTP to HTTPS in production
    @app.before_request
    def https_redirect():
        if os.environ.get('FLASK_ENV') == 'production' and request.headers.get('X-Forwarded-Proto') == 'http':
            url = request.url.replace('http://', 'https://', 1)
            return redirect(url, code=301)
    
    # Inject CSRF token after each request
    @app.after_request
    def inject_csrf_token(response):
        response.set_cookie(
            'csrf_token',
            generate_csrf(),
            secure=True if os.environ.get('FLASK_ENV') == 'production' else False,
            samesite='Strict' if os.environ.get('FLASK_ENV') == 'production' else None,
            httponly=True
        )
        return response
    
    # API Documentation Route
    @app.route("/api/docs")
    def api_help():
        acceptable_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
        route_list = {
            rule.rule: [
                [method for method in rule.methods if method in acceptable_methods],
                app.view_functions[rule.endpoint].__doc__
            ]
            for rule in app.url_map.iter_rules() if rule.endpoint != 'static'
        }
        return jsonify(route_list)
    
    # Error Handlers
    @app.errorhandler(404)
    def not_found(e):
        return app.send_static_file('index.html')
    
    @app.errorhandler(500)
    def internal_server_error(e):
        return jsonify({"message": "Internal server error"}), 500
    
    # Serve React App
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def react_root(path):
        if path == 'favicon.ico':
            return app.send_from_directory('public', 'favicon.ico')
        return app.send_static_file('index.html')
    
    # Start a global WebSocket thread if desired
    if os.environ.get("FINNHUB_API_KEY"):
        from .services.finnhub_ws import run_finnhub_ws
        import threading
        ws_thread = threading.Thread(target=run_finnhub_ws, args=(app,), daemon=True)
        ws_thread.start()
    
    return app

app = create_app()
