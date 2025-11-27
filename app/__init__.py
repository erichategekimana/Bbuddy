from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from config import Config
from .database import db, init_db

migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize database
    init_db(app)
    migrate.init_app(app, db)

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register error handlers
    register_error_handlers(app)

    # Import blueprints *after* db is ready
    from .routes.auth_routes import auth_bp
    from .routes.budget_plan_routes import budget_plans_bp
    from .routes.expense_routes import expenses_bp
    from .routes.category_routes import categories_bp
    from .routes.quote_routes import quote_bp

    # Register routes
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(budget_plans_bp, url_prefix="/api/budget_plans")
    app.register_blueprint(expenses_bp, url_prefix="/api/expenses")
    app.register_blueprint(categories_bp, url_prefix="/api/categories")
    app.register_blueprint(quote_bp, url_prefix="/api/quotes")
    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db.session.remove()

    return app


def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "bad_request", "message": str(e)}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": "unauthorized", "message": str(e)}), 401

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "not_found", "message": "Resource not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "method_not_allowed"}), 405

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "internal_server_error", "message": str(e)}), 500
