from datetime import datetime

def default_user_profile(name="Student", college="", branch="", year_of_study=""):
    return {
        "avatar": f"https://api.dicebear.com/7.x/bottts/svg?seed={name.replace(' ', '')}",
        "college": college or "Apex Institute of Technology",
        "branch": branch or "Computer Science & Engineering",
        "year_of_study": year_of_study or "3rd Year"
    }

def default_user_settings():
    return {
        "theme": "light",
        "notifications": {
            "task_reminders": True,
            "exam_alerts": True,
            "event_notice_updates": True
        },
        "timetable_preferences": {
            "week_start_day": "Monday",
            "class_reminder_time": "15 mins before"
        },
        "privacy": {
            "profile_visible": True
        }
    }

def create_user_document(name, email, password_hash, college=None, branch=None, year_of_study=None):
    now = datetime.utcnow()
    return {
        "name": name.strip(),
        "email": email.strip().lower(),
        "password": password_hash,
        "profile": default_user_profile(name, college, branch, year_of_study),
        "settings": default_user_settings(),
        "created_at": now,
        "updated_at": now
    }
