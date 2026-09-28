from flask import Blueprint, request, jsonify, g
from datetime import datetime, timedelta
from bson import ObjectId
from app.db import get_db, serialize_doc, serialize_docs
from app.utils.auth_middleware import token_required

study_bp = Blueprint("study", __name__, url_prefix="/api/study")

# ==================== NOTES ====================

@study_bp.route("/notes", methods=["GET"])
@token_required
def get_notes():
    db = get_db()
    subject_filter = request.args.get("subject")
    query = {"user_id": g.user_id}
    if subject_filter and subject_filter != "All":
        query["subject"] = subject_filter
        
    notes = list(db.notes.find(query).sort([("is_pinned", -1), ("updated_at", -1)]))
    return jsonify({"notes": serialize_docs(notes)}), 200

@study_bp.route("/notes", methods=["POST"])
@token_required
def create_note():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "Note title is required."}), 400

    now = datetime.utcnow()
    note_doc = {
        "user_id": g.user_id,
        "title": title,
        "subject": data.get("subject", "General"),
        "content": data.get("content", ""),
        "tags": data.get("tags", []),
        "is_pinned": bool(data.get("is_pinned", False)),
        "created_at": now,
        "updated_at": now
    }
    
    db = get_db()
    res = db.notes.insert_one(note_doc)
    note_doc["_id"] = res.inserted_id
    return jsonify({"message": "Note created successfully.", "note": serialize_doc(note_doc)}), 201

@study_bp.route("/notes/<id>", methods=["PUT"])
@token_required
def update_note(id):
    data = request.get_json() or {}
    db = get_db()
    
    update_data = {"updated_at": datetime.utcnow()}
    for field in ["title", "subject", "content", "tags", "is_pinned"]:
        if field in data:
            update_data[field] = data[field]
            
    res = db.notes.find_one_and_update(
        {"_id": ObjectId(id), "user_id": g.user_id},
        {"$set": update_data},
        return_document=True
    )
    if not res:
        return jsonify({"error": "Note not found."}), 404
        
    return jsonify({"message": "Note updated.", "note": serialize_doc(res)}), 200

@study_bp.route("/notes/<id>", methods=["DELETE"])
@token_required
def delete_note(id):
    db = get_db()
    res = db.notes.delete_one({"_id": ObjectId(id), "user_id": g.user_id})
    if res.deleted_count == 0:
        return jsonify({"error": "Note not found."}), 404
    return jsonify({"message": "Note deleted successfully."}), 200


# ==================== TASKS ====================

@study_bp.route("/tasks", methods=["GET"])
@token_required
def get_tasks():
    db = get_db()
    status_filter = request.args.get("status")
    query = {"user_id": g.user_id}
    if status_filter and status_filter != "all":
        query["status"] = status_filter
        
    tasks = list(db.tasks.find(query).sort([("due_date", 1), ("created_at", -1)]))
    return jsonify({"tasks": serialize_docs(tasks)}), 200

@study_bp.route("/tasks", methods=["POST"])
@token_required
def create_task():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    if not title:
        return jsonify({"error": "Task title is required."}), 400

    now = datetime.utcnow()
    task_doc = {
        "user_id": g.user_id,
        "title": title,
        "description": data.get("description", ""),
        "due_date": data.get("due_date", ""),
        "priority": data.get("priority", "medium"),
        "status": data.get("status", "pending"),
        "subject": data.get("subject", "General"),
        "created_at": now,
        "updated_at": now
    }
    
    db = get_db()
    res = db.tasks.insert_one(task_doc)
    task_doc["_id"] = res.inserted_id
    return jsonify({"message": "Task created successfully.", "task": serialize_doc(task_doc)}), 201

@study_bp.route("/tasks/<id>", methods=["PATCH", "PUT"])
@token_required
def update_task(id):
    data = request.get_json() or {}
    db = get_db()
    
    update_data = {"updated_at": datetime.utcnow()}
    for field in ["title", "description", "due_date", "priority", "status", "subject"]:
        if field in data:
            update_data[field] = data[field]
            
    res = db.tasks.find_one_and_update(
        {"_id": ObjectId(id), "user_id": g.user_id},
        {"$set": update_data},
        return_document=True
    )
    if not res:
        return jsonify({"error": "Task not found."}), 404
        
    return jsonify({"message": "Task updated.", "task": serialize_doc(res)}), 200

@study_bp.route("/tasks/<id>", methods=["DELETE"])
@token_required
def delete_task(id):
    db = get_db()
    res = db.tasks.delete_one({"_id": ObjectId(id), "user_id": g.user_id})
    if res.deleted_count == 0:
        return jsonify({"error": "Task not found."}), 404
    return jsonify({"message": "Task deleted successfully."}), 200


# ==================== EXAMS ====================

from app.utils.study_planner import generate_study_plan

@study_bp.route("/exams", methods=["GET"])
@token_required
def get_exams():
    db = get_db()
    exams = list(db.exams.find({"user_id": g.user_id}).sort("exam_date", 1))
    
    # Calculate days remaining dynamically
    now_date = datetime.utcnow().date()
    for exam in exams:
        try:
            ed = datetime.strptime(str(exam.get("exam_date"))[:10], "%Y-%m-%d").date()
            exam["days_remaining"] = (ed - now_date).days
        except Exception:
            exam["days_remaining"] = 0
            
    return jsonify({"exams": serialize_docs(exams)}), 200

@study_bp.route("/exams", methods=["POST"])
@token_required
def create_exam():
    data = request.get_json() or {}
    subject = data.get("subject", "").strip()
    exam_date = data.get("exam_date", "").strip()
    if not subject or not exam_date:
        return jsonify({"error": "Subject and Exam Date are required."}), 400

    syllabus_topics = data.get("syllabus_topics", [])
    if isinstance(syllabus_topics, str):
        syllabus_topics = [t.strip() for t in syllabus_topics.split(",") if t.strip()]

    # Generate day-by-day study plan automatically
    study_plan = generate_study_plan(subject, exam_date, syllabus_topics)

    exam_doc = {
        "user_id": g.user_id,
        "subject": subject,
        "exam_date": exam_date,
        "room_or_venue": data.get("room_or_venue", "Hall A"),
        "syllabus_topics": syllabus_topics,
        "study_plan": study_plan,
        "created_at": datetime.utcnow()
    }

    db = get_db()
    res = db.exams.insert_one(exam_doc)
    exam_doc["_id"] = res.inserted_id
    
    # Compute countdown
    try:
        ed = datetime.strptime(exam_date[:10], "%Y-%m-%d").date()
        exam_doc["days_remaining"] = (ed - datetime.utcnow().date()).days
    except Exception:
        exam_doc["days_remaining"] = 0

    return jsonify({"message": "Exam created with automated study plan.", "exam": serialize_doc(exam_doc)}), 201

@study_bp.route("/exams/<id>/plan-step", methods=["PATCH"])
@token_required
def toggle_study_plan_step(id):
    data = request.get_json() or {}
    day_number = data.get("day")
    completed = data.get("completed", True)

    db = get_db()
    exam = db.exams.find_one({"_id": ObjectId(id), "user_id": g.user_id})
    if not exam:
        return jsonify({"error": "Exam not found."}), 404

    study_plan = exam.get("study_plan", [])
    for step in study_plan:
        if step.get("day") == day_number:
            step["completed"] = completed
            break

    db.exams.update_one({"_id": ObjectId(id)}, {"$set": {"study_plan": study_plan}})
    return jsonify({"message": "Study plan progress updated.", "study_plan": study_plan}), 200

@study_bp.route("/exams/<id>", methods=["DELETE"])
@token_required
def delete_exam(id):
    db = get_db()
    res = db.exams.delete_one({"_id": ObjectId(id), "user_id": g.user_id})
    if res.deleted_count == 0:
        return jsonify({"error": "Exam not found."}), 404
    return jsonify({"message": "Exam removed successfully."}), 200


# ==================== TIMETABLE ====================

@study_bp.route("/timetable", methods=["GET"])
@token_required
def get_timetable():
    db = get_db()
    slots = list(db.timetable.find({"user_id": g.user_id}).sort([("start_time", 1)]))
    return jsonify({"timetable": serialize_docs(slots)}), 200

@study_bp.route("/timetable", methods=["POST"])
@token_required
def create_timetable_slot():
    data = request.get_json() or {}
    subject = data.get("subject", "").strip()
    day = data.get("day", "").strip()
    start_time = data.get("start_time", "").strip()
    end_time = data.get("end_time", "").strip()

    if not subject or not day or not start_time or not end_time:
        return jsonify({"error": "Subject, Day, Start Time, and End Time are required."}), 400

    slot_doc = {
        "user_id": g.user_id,
        "day": day,
        "start_time": start_time,
        "end_time": end_time,
        "subject": subject,
        "room": data.get("room", ""),
        "instructor": data.get("instructor", ""),
        "color": data.get("color", "indigo"),
        "created_at": datetime.utcnow()
    }

    db = get_db()
    res = db.timetable.insert_one(slot_doc)
    slot_doc["_id"] = res.inserted_id
    return jsonify({"message": "Timetable slot added.", "slot": serialize_doc(slot_doc)}), 201

@study_bp.route("/timetable/<id>", methods=["DELETE"])
@token_required
def delete_timetable_slot(id):
    db = get_db()
    res = db.timetable.delete_one({"_id": ObjectId(id), "user_id": g.user_id})
    if res.deleted_count == 0:
        return jsonify({"error": "Slot not found."}), 404
    return jsonify({"message": "Timetable slot deleted."}), 200
