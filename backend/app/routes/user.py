from flask import Blueprint, request, jsonify, g
import bcrypt
from datetime import datetime
from bson import ObjectId
from app.db import get_db, serialize_doc
from app.utils.auth_middleware import token_required

user_bp = Blueprint("user", __name__, url_prefix="/api/user")

@user_bp.route("/settings", methods=["PATCH"])
@token_required
def update_settings():
    """
    PATCH /api/user/settings
    Updates user settings subfields: theme, notifications, timetable_preferences, privacy
    """
    data = request.get_json() or {}
    db = get_db()
    user_id = ObjectId(g.user_id)

    current_user = db.users.find_one({"_id": user_id})
    if not current_user:
        return jsonify({"error": "User not found."}), 404

    existing_settings = current_user.get("settings", {})

    # Merge top-level settings fields
    if "theme" in data and data["theme"] in ["light", "dark"]:
        existing_settings["theme"] = data["theme"]

    if "notifications" in data and isinstance(data["notifications"], dict):
        existing_notifications = existing_settings.get("notifications", {})
        for key in ["task_reminders", "exam_alerts", "event_notice_updates"]:
            if key in data["notifications"]:
                existing_notifications[key] = bool(data["notifications"][key])
        existing_settings["notifications"] = existing_notifications

    if "timetable_preferences" in data and isinstance(data["timetable_preferences"], dict):
        existing_tt = existing_settings.get("timetable_preferences", {})
        if "week_start_day" in data["timetable_preferences"]:
            existing_tt["week_start_day"] = data["timetable_preferences"]["week_start_day"]
        if "class_reminder_time" in data["timetable_preferences"]:
            existing_tt["class_reminder_time"] = data["timetable_preferences"]["class_reminder_time"]
        existing_settings["timetable_preferences"] = existing_tt

    if "privacy" in data and isinstance(data["privacy"], dict):
        existing_privacy = existing_settings.get("privacy", {})
        if "profile_visible" in data["privacy"]:
            existing_privacy["profile_visible"] = bool(data["privacy"]["profile_visible"])
        existing_settings["privacy"] = existing_privacy

    db.users.update_one(
        {"_id": user_id},
        {"$set": {"settings": existing_settings, "updated_at": datetime.utcnow()}}
    )

    updated_user = db.users.find_one({"_id": user_id})
    serialized = serialize_doc(updated_user)
    serialized.pop("password", None)

    return jsonify({
        "message": "Settings updated successfully.",
        "settings": existing_settings,
        "user": serialized
    }), 200

@user_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile():
    data = request.get_json() or {}
    db = get_db()
    user_id = ObjectId(g.user_id)

    name = data.get("name", "").strip()
    profile_data = data.get("profile", {})

    update_fields = {"updated_at": datetime.utcnow()}
    if name:
        update_fields["name"] = name

    current_user = db.users.find_one({"_id": user_id})
    existing_profile = current_user.get("profile", {}) if current_user else {}

    for key in ["college", "branch", "year_of_study", "avatar"]:
        if key in profile_data:
            existing_profile[key] = profile_data[key]

    update_fields["profile"] = existing_profile

    db.users.update_one({"_id": user_id}, {"$set": update_fields})

    updated_user = db.users.find_one({"_id": user_id})
    serialized = serialize_doc(updated_user)
    serialized.pop("password", None)

    return jsonify({
        "message": "Profile updated successfully.",
        "user": serialized
    }), 200

@user_bp.route("/change-password", methods=["PUT"])
@token_required
def change_password():
    data = request.get_json() or {}
    old_password = data.get("old_password", "")
    new_password = data.get("new_password", "")
    confirm_password = data.get("confirm_password", "")

    if not old_password or not new_password:
        return jsonify({"error": "Both old and new passwords are required."}), 400

    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters long."}), 400

    if confirm_password and new_password != confirm_password:
        return jsonify({"error": "New password and confirmation do not match."}), 400

    db = get_db()
    user_id = ObjectId(g.user_id)
    user = db.users.find_one({"_id": user_id})

    if not bcrypt.checkpw(old_password.encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({"error": "Incorrect current password."}), 400

    hashed_pw = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    db.users.update_one(
        {"_id": user_id},
        {"$set": {"password": hashed_pw, "updated_at": datetime.utcnow()}}
    )

    return jsonify({"message": "Password changed successfully."}), 200

@user_bp.route("/account", methods=["DELETE"])
@token_required
def delete_account():
    db = get_db()
    user_id = ObjectId(g.user_id)
    user_id_str = g.user_id

    # Cascade delete all related documents
    db.notes.delete_many({"user_id": user_id_str})
    db.tasks.delete_many({"user_id": user_id_str})
    db.exams.delete_many({"user_id": user_id_str})
    db.timetable.delete_many({"user_id": user_id_str})
    db.skills.delete_many({"user_id": user_id_str})
    db.resumes.delete_many({"user_id": user_id_str})
    
    # Remove from events RSVP and club members
    db.events.update_many({}, {"$pull": {"rsvps": user_id_str}})
    db.clubs.update_many({}, {"$pull": {"members": user_id_str}})
    
    # Delete user
    db.users.delete_one({"_id": user_id})

    return jsonify({"message": "Account and all associated personal data deleted permanently."}), 200
