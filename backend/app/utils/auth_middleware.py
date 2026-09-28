from functools import wraps
from flask import request, jsonify, g
import jwt
from bson import ObjectId
from app.config import Config
from app.db import get_db, serialize_doc

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == "bearer":
                token = parts[1]
            elif len(parts) == 1:
                token = parts[0]
                
        if not token:
            return jsonify({"error": "Authentication token is missing. Please log in."}), 401
            
        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
            user_id = payload.get("user_id")
            if not user_id:
                return jsonify({"error": "Invalid token payload."}), 401
                
            db = get_db()
            user = db.users.find_one({"_id": ObjectId(user_id)})
            if not user:
                return jsonify({"error": "User associated with token no longer exists."}), 401
                
            # Exclude password hash from g.user
            user_serialized = serialize_doc(user)
            user_serialized.pop("password", None)
            g.user = user_serialized
            g.user_id = user_id
            
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session token has expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid authentication token."}), 401
        except Exception as e:
            return jsonify({"error": f"Authentication failed: {str(e)}"}), 401
            
        return f(*args, **kwargs)
    return decorated
