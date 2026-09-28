from flask import Blueprint, request, jsonify, g
from datetime import datetime
from bson import ObjectId
from app.db import get_db, serialize_doc, serialize_docs
from app.utils.auth_middleware import token_required

campus_bp = Blueprint("campus", __name__, url_prefix="/api/campus")

# ==================== EVENTS ====================

@campus_bp.route("/events", methods=["GET"])
@token_required
def get_events():
    db = get_db()
    events = list(db.events.find().sort("date", 1))
    
    # Mark if current user has RSVP'd
    user_id = g.user_id
    serialized = serialize_docs(events)
    for ev in serialized:
        rsvps = ev.get("rsvps", [])
        ev["is_rsvpd"] = user_id in rsvps
        ev["rsvp_count"] = len(rsvps)
        
    return jsonify({"events": serialized}), 200

@campus_bp.route("/events/<id>/rsvp", methods=["POST"])
@token_required
def toggle_rsvp(id):
    db = get_db()
    user_id = g.user_id
    event = db.events.find_one({"_id": ObjectId(id)})
    if not event:
        return jsonify({"error": "Event not found."}), 404

    rsvps = event.get("rsvps", [])
    if user_id in rsvps:
        db.events.update_one({"_id": ObjectId(id)}, {"$pull": {"rsvps": user_id}})
        is_rsvpd = False
    else:
        db.events.update_one({"_id": ObjectId(id)}, {"$push": {"rsvps": user_id}})
        is_rsvpd = True

    updated_event = db.events.find_one({"_id": ObjectId(id)})
    return jsonify({
        "message": "RSVP updated successfully.",
        "is_rsvpd": is_rsvpd,
        "rsvp_count": len(updated_event.get("rsvps", []))
    }), 200


# ==================== CLUBS ====================

@campus_bp.route("/clubs", methods=["GET"])
@token_required
def get_clubs():
    db = get_db()
    clubs = list(db.clubs.find().sort("name", 1))
    user_id = g.user_id
    serialized = serialize_docs(clubs)
    for club in serialized:
        members = club.get("members", [])
        club["is_member"] = user_id in members
        club["member_count"] = len(members)
    return jsonify({"clubs": serialized}), 200

@campus_bp.route("/clubs/<id>/join", methods=["POST"])
@token_required
def join_club(id):
    db = get_db()
    user_id = g.user_id
    club = db.clubs.find_one({"_id": ObjectId(id)})
    if not club:
        return jsonify({"error": "Club not found."}), 404

    db.clubs.update_one({"_id": ObjectId(id)}, {"$addToSet": {"members": user_id}})
    updated_club = db.clubs.find_one({"_id": ObjectId(id)})
    return jsonify({
        "message": "Joined club successfully.",
        "is_member": True,
        "member_count": len(updated_club.get("members", []))
    }), 200

@campus_bp.route("/clubs/<id>/leave", methods=["POST"])
@token_required
def leave_club(id):
    db = get_db()
    user_id = g.user_id
    club = db.clubs.find_one({"_id": ObjectId(id)})
    if not club:
        return jsonify({"error": "Club not found."}), 404

    db.clubs.update_one({"_id": ObjectId(id)}, {"$pull": {"members": user_id}})
    updated_club = db.clubs.find_one({"_id": ObjectId(id)})
    return jsonify({
        "message": "Left club successfully.",
        "is_member": False,
        "member_count": len(updated_club.get("members", []))
    }), 200


# ==================== NOTICES ====================

@campus_bp.route("/notices", methods=["GET"])
@token_required
def get_notices():
    db = get_db()
    category = request.args.get("category")
    query = {}
    if category and category != "All":
        query["category"] = category
        
    notices = list(db.notices.find(query).sort("posted_at", -1))
    return jsonify({"notices": serialize_docs(notices)}), 200


# ==================== BUS ROUTES ====================

@campus_bp.route("/bus", methods=["GET"])
@token_required
def get_bus_routes():
    db = get_db()
    search = request.args.get("search", "").strip().lower()
    routes = list(db.bus_routes.find().sort("route_number", 1))
    
    serialized = serialize_docs(routes)
    if search:
        filtered = []
        for r in serialized:
            if (search in r.get("route_number", "").lower() or
                search in r.get("route_name", "").lower() or
                any(search in stop.get("stop_name", "").lower() for stop in r.get("stops", []))):
                filtered.append(r)
        return jsonify({"routes": filtered}), 200
        
    return jsonify({"routes": serialized}), 200
