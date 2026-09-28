from flask import Blueprint, jsonify, g
from datetime import datetime
from app.db import get_db, serialize_docs
from app.utils.auth_middleware import token_required

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

@dashboard_bp.route("/stats", methods=["GET"])
@token_required
def get_dashboard_stats():
    db = get_db()
    user_id = g.user_id

    # 1. Tasks metrics
    all_tasks = list(db.tasks.find({"user_id": user_id}))
    total_tasks = len(all_tasks)
    completed_tasks = sum(1 for t in all_tasks if t.get("status") == "completed")
    pending_tasks = sum(1 for t in all_tasks if t.get("status") == "pending")
    in_progress_tasks = sum(1 for t in all_tasks if t.get("status") == "in_progress")
    
    completion_rate = round((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0

    # 2. Upcoming Exams
    exams = list(db.exams.find({"user_id": user_id}).sort("exam_date", 1))
    now_date = datetime.utcnow().date()
    upcoming_exams_list = []
    total_study_steps = 0
    completed_study_steps = 0

    for exam in exams:
        try:
            ed = datetime.strptime(str(exam.get("exam_date"))[:10], "%Y-%m-%d").date()
            days_left = (ed - now_date).days
        except Exception:
            days_left = 0
            
        exam["days_remaining"] = days_left
        if days_left >= 0:
            upcoming_exams_list.append(exam)

        plan = exam.get("study_plan", [])
        total_study_steps += len(plan)
        completed_study_steps += sum(1 for s in plan if s.get("completed"))

    study_progress_pct = round((completed_study_steps / total_study_steps * 100)) if total_study_steps > 0 else 0

    # 3. Today's Classes
    # Map current weekday
    weekday_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    current_day = weekday_names[datetime.utcnow().weekday()]
    today_classes = list(db.timetable.find({"user_id": user_id, "day": current_day}).sort("start_time", 1))

    # 4. Latest Notices
    latest_notices = list(db.notices.find().sort("posted_at", -1).limit(4))

    # 5. System Notifications / Alerts Feed for bell icon
    notifications = []
    
    # Check for urgent notices
    for notice in latest_notices:
        if notice.get("priority") == "urgent":
            notifications.append({
                "id": f"notice-{notice.get('_id')}",
                "type": "notice",
                "title": f"Urgent: {notice.get('title')}",
                "time": "Recent",
                "severity": "high"
            })

    # Check for exams within next 7 days
    for exam in upcoming_exams_list:
        if 0 <= exam.get("days_remaining", 99) <= 7:
            notifications.append({
                "id": f"exam-{exam.get('_id')}",
                "type": "exam",
                "title": f"Exam Alert: {exam.get('subject')} in {exam.get('days_remaining')} days!",
                "time": f"Due {exam.get('exam_date')}",
                "severity": "high" if exam.get("days_remaining") <= 2 else "medium"
            })

    # Check for pending high-priority tasks
    for task in all_tasks:
        if task.get("status") != "completed" and task.get("priority") == "high":
            notifications.append({
                "id": f"task-{task.get('_id')}",
                "type": "task",
                "title": f"High Priority Task: {task.get('title')}",
                "time": f"Due {task.get('due_date', 'Soon')}",
                "severity": "medium"
            })

    return jsonify({
        "summary": {
            "total_tasks": total_tasks,
            "pending_tasks": pending_tasks,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": in_progress_tasks,
            "completion_rate": completion_rate,
            "upcoming_exams_count": len(upcoming_exams_list),
            "today_classes_count": len(today_classes),
            "study_progress_pct": study_progress_pct
        },
        "charts": {
            "task_distribution": [
                {"name": "Completed", "value": completed_tasks, "color": "#10B981"},
                {"name": "In Progress", "value": in_progress_tasks, "color": "#F59E0B"},
                {"name": "Pending", "value": pending_tasks, "color": "#EF4444"}
            ],
            "study_plan_steps": {
                "total": total_study_steps,
                "completed": completed_study_steps,
                "percentage": study_progress_pct
            }
        },
        "today_classes": serialize_docs(today_classes),
        "upcoming_exams": serialize_docs(upcoming_exams_list[:3]),
        "latest_notices": serialize_docs(latest_notices),
        "notifications": notifications,
        "unread_notifications_count": len(notifications)
    }), 200
