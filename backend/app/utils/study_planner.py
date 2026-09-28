from datetime import datetime, timedelta

def generate_study_plan(exam_name, exam_date_str, syllabus_topics):
    """
    Auto-generates a day-by-day study plan leading up to the exam date.
    """
    plan = []
    try:
        exam_date = datetime.strptime(exam_date_str[:10], "%Y-%m-%d")
    except Exception:
        exam_date = datetime.utcnow() + timedelta(days=7)

    today = datetime.utcnow().date()
    target = exam_date.date()
    days_left = max((target - today).days, 1)

    topics = [t.strip() for t in syllabus_topics if t.strip()]
    if not topics:
        topics = [
            f"Review fundamental core concepts for {exam_name}",
            f"Solve key past year questions & assignments",
            f"Deep-dive into advanced modules & practical problems",
            f"Formula sheet, theorem review & flashcards",
            f"Full-length mock exam & final revision"
        ]

    # Distribute topics across available days (up to 14 days max for concise display)
    plan_days = min(days_left, 14)
    for i in range(plan_days):
        day_date = (datetime.utcnow() + timedelta(days=i)).strftime("%Y-%m-%d")
        topic_idx = min(i // max(1, (plan_days // len(topics))), len(topics) - 1)
        topic_desc = topics[topic_idx]
        
        if i == plan_days - 1:
            task_desc = f"Final quick recap, review cheat sheets & rest before {exam_name}"
        elif i == plan_days - 2:
            task_desc = f"Timed mock test & review weak topics for {exam_name}"
        else:
            task_desc = f"Study Topic {topic_idx + 1}: {topic_desc}"

        plan.append({
            "day": i + 1,
            "date": day_date,
            "task": task_desc,
            "completed": False
        })
        
    return plan
