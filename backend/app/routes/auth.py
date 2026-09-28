from flask import Blueprint, request, jsonify, g
import bcrypt
import jwt
from datetime import datetime, timedelta
from app.config import Config
from app.db import get_db, serialize_doc
from app.models.user import create_user_document
from app.utils.auth_middleware import token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def generate_token(user_id):
    expiration = datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRATION_HOURS)
    payload = {
        "user_id": str(user_id),
        "exp": expiration
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    confirm_password = data.get("confirm_password", "")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400

    if confirm_password and password != confirm_password:
        return jsonify({"error": "Passwords do not match."}), 400

    db = get_db()
    existing_user = db.users.find_one({"email": email})
    if existing_user:
        return jsonify({"error": "An account with this email already exists. Please log in."}), 400

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user_doc = create_user_document(name, email, hashed_pw)
    
    result = db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Pre-populate starter student data
    try:
        from app.utils.seeder import seed_student_starter_data
        seed_student_starter_data(user_id)
    except Exception as e:
        print(f"Warning: could not seed starter data for new user: {e}")

    token = generate_token(user_id)
    user_doc["_id"] = result.inserted_id
    serialized_user = serialize_doc(user_doc)
    serialized_user.pop("password", None)

    return jsonify({
        "message": "Account created successfully!",
        "token": token,
        "user": serialized_user
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Please provide both email and password."}), 400

    db = get_db()
    user = db.users.find_one({"email": email})
    if not user:
        return jsonify({"error": "Invalid email or password."}), 401

    if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({"error": "Invalid email or password."}), 401

    token = generate_token(user["_id"])
    serialized_user = serialize_doc(user)
    serialized_user.pop("password", None)

    return jsonify({
        "message": "Login successful!",
        "token": token,
        "user": serialized_user
    }), 200

@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user():
    return jsonify({"user": g.user}), 200

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    if not email:
        return jsonify({"error": "Email is required."}), 400
    
    db = get_db()
    user = db.users.find_one({"email": email})
    # Safe response regardless to prevent enumeration
    return jsonify({
        "message": "If an account exists with this email, password reset instructions have been dispatched to your inbox."
    }), 200

@auth_bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({"message": "Logged out successfully."}), 200
