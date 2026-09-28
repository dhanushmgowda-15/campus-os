from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.db import init_db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for React frontend (defaulting to localhost:5173 and all origins during dev)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize MongoDB
    with app.app_context():
        init_db(app)

    # Register Blueprints
    from app.routes.auth import auth_bp
    from app.routes.user import user_bp
    from app.routes.study import study_bp
    from app.routes.campus import campus_bp
    from app.routes.career import career_bp
    from app.routes.dashboard import dashboard_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(study_bp)
    app.register_blueprint(campus_bp)
    app.register_blueprint(career_bp)
    app.register_blueprint(dashboard_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "app": "CampusOS Backend API",
            "version": "1.0.0"
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Requested resource was not found."}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error occurred."}), 500

    return app
