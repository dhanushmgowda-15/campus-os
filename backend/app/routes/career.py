from flask import Blueprint, request, jsonify, g, send_file
from datetime import datetime
from bson import ObjectId
import io
from app.db import get_db, serialize_doc, serialize_docs
from app.utils.auth_middleware import token_required

# ReportLab imports for PDF generation
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

career_bp = Blueprint("career", __name__, url_prefix="/api/career")

# ==================== RESUME ====================

def default_resume_data(user):
    name = user.get("name", "Student Name")
    email = user.get("email", "student@campus.edu")
    profile = user.get("profile", {})
    return {
        "user_id": user.get("id"),
        "personal_info": {
            "full_name": name,
            "email": email,
            "phone": "+1 (555) 019-2834",
            "location": "Boston, MA",
            "github": "github.com/student",
            "linkedin": "linkedin.com/in/student",
            "portfolio": "https://portfolio.dev",
            "summary": f"Passionate {profile.get('year_of_study', '3rd Year')} {profile.get('branch', 'Computer Science')} student with hands-on experience in full-stack web development, algorithms, and agile software practices. Eager to solve challenging problems and build scalable user-centric software systems."
        },
        "education": [
            {
                "institution": profile.get("college", "Apex Institute of Technology"),
                "degree": f"Bachelor of Technology in {profile.get('branch', 'Computer Science')}",
                "start_year": "2023",
                "end_year": "2027",
                "grade": "GPA: 3.85 / 4.0"
            }
        ],
        "experience": [
            {
                "title": "Software Engineering Intern",
                "company": "TechNova Labs",
                "location": "Remote",
                "start_date": "Jun 2025",
                "end_date": "Aug 2025",
                "description": "Engineered high-performance REST APIs with Flask and MongoDB, reducing latency by 28%. Collaborated in Scrum sprints and implemented automated unit tests with 90% coverage."
            }
        ],
        "projects": [
            {
                "title": "CampusOS – Digital Student Portal",
                "technologies": "React, Tailwind CSS, Python Flask, MongoDB, JWT",
                "link": "https://github.com/student/campus-os",
                "description": "Architected an all-in-one student workspace featuring smart timetable management, auto-generated exam revision plans, and career tools with real-time PDF generation."
            },
            {
                "title": "AI Study Assistant",
                "technologies": "Python, FastEmbed, LangChain, React",
                "link": "https://github.com/student/ai-assistant",
                "description": "Built a semantic document search pipeline summarizing multi-chapter textbooks into concise study flashcards."
            }
        ],
        "skills": ["Python", "JavaScript", "React", "Flask", "MongoDB", "Git & GitHub", "Tailwind CSS", "RESTful APIs", "Docker Basics", "Agile"],
        "updated_at": datetime.utcnow()
    }

@career_bp.route("/resume", methods=["GET"])
@token_required
def get_resume():
    db = get_db()
    resume = db.resumes.find_one({"user_id": g.user_id})
    if not resume:
        default_data = default_resume_data(g.user)
        db.resumes.insert_one(default_data)
        resume = default_data
    return jsonify({"resume": serialize_doc(resume)}), 200

@career_bp.route("/resume", methods=["PUT"])
@token_required
def update_resume():
    data = request.get_json() or {}
    db = get_db()
    
    update_doc = {
        "personal_info": data.get("personal_info", {}),
        "education": data.get("education", []),
        "experience": data.get("experience", []),
        "projects": data.get("projects", []),
        "skills": data.get("skills", []),
        "updated_at": datetime.utcnow()
    }
    
    res = db.resumes.find_one_and_update(
        {"user_id": g.user_id},
        {"$set": update_doc},
        upsert=True,
        return_document=True
    )
    return jsonify({"message": "Resume updated successfully.", "resume": serialize_doc(res)}), 200

@career_bp.route("/resume/download-pdf", methods=["GET"])
@token_required
def download_resume_pdf():
    db = get_db()
    resume = db.resumes.find_one({"user_id": g.user_id})
    if not resume:
        resume = default_resume_data(g.user)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1E3A8A")
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#475569")
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1E40AF"),
        spaceBefore=8,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1E293B")
    )
    item_header = ParagraphStyle(
        'ItemHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#0F172A")
    )
    item_meta = ParagraphStyle(
        'ItemMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#64748B")
    )

    elements = []
    p_info = resume.get("personal_info", {})

    # Name and Contact
    elements.append(Paragraph(p_info.get("full_name", "Student Name"), title_style))
    contact_parts = [
        p_info.get("email", ""),
        p_info.get("phone", ""),
        p_info.get("location", ""),
        p_info.get("linkedin", ""),
        p_info.get("github", "")
    ]
    contact_line = "  •  ".join([p for p in contact_parts if p])
    elements.append(Paragraph(contact_line, subtitle_style))
    elements.append(Spacer(1, 6))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563EB"), spaceAfter=8))

    # Professional Summary
    summary = p_info.get("summary", "")
    if summary:
        elements.append(Paragraph("PROFESSIONAL SUMMARY", section_heading))
        elements.append(Paragraph(summary, body_style))
        elements.append(Spacer(1, 8))

    # Education
    education = resume.get("education", [])
    if education:
        elements.append(Paragraph("EDUCATION", section_heading))
        for edu in education:
            deg = f"<b>{edu.get('degree', '')}</b> — {edu.get('institution', '')}"
            yrs = f"{edu.get('start_year', '')} - {edu.get('end_year', '')} | {edu.get('grade', '')}"
            elements.append(Paragraph(deg, item_header))
            elements.append(Paragraph(yrs, item_meta))
            elements.append(Spacer(1, 4))
        elements.append(Spacer(1, 6))

    # Experience
    experience = resume.get("experience", [])
    if experience:
        elements.append(Paragraph("EXPERIENCE", section_heading))
        for exp in experience:
            title_comp = f"<b>{exp.get('title', '')}</b> — {exp.get('company', '')} ({exp.get('location', '')})"
            dates = f"{exp.get('start_date', '')} - {exp.get('end_date', '')}"
            elements.append(Paragraph(title_comp, item_header))
            elements.append(Paragraph(dates, item_meta))
            elements.append(Paragraph(exp.get("description", ""), body_style))
            elements.append(Spacer(1, 6))
        elements.append(Spacer(1, 4))

    # Projects
    projects = resume.get("projects", [])
    if projects:
        elements.append(Paragraph("KEY PROJECTS", section_heading))
        for proj in projects:
            p_title = f"<b>{proj.get('title', '')}</b> | <i>{proj.get('technologies', '')}</i>"
            elements.append(Paragraph(p_title, item_header))
            elements.append(Paragraph(proj.get("description", ""), body_style))
            elements.append(Spacer(1, 4))
        elements.append(Spacer(1, 6))

    # Skills
    skills_list = resume.get("skills", [])
    if skills_list:
        elements.append(Paragraph("TECHNICAL & PROFESSIONAL SKILLS", section_heading))
        skills_str = ", ".join(skills_list)
        elements.append(Paragraph(skills_str, body_style))

    doc.build(elements)
    buffer.seek(0)

    filename = f"Resume_{p_info.get('full_name', 'Student').replace(' ', '_')}.pdf"
    return send_file(
        buffer,
        as_attachment=True,
        download_name=filename,
        mimetype='application/pdf'
    )


# ==================== SKILLS ====================

@career_bp.route("/skills", methods=["GET"])
@token_required
def get_skills():
    db = get_db()
    skills = list(db.skills.find({"user_id": g.user_id}).sort("category", 1))
    return jsonify({"skills": serialize_docs(skills)}), 200

@career_bp.route("/skills", methods=["POST"])
@token_required
def create_skill():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Skill name is required."}), 400

    skill_doc = {
        "user_id": g.user_id,
        "name": name,
        "category": data.get("category", "Technical"),
        "proficiency": data.get("proficiency", "Intermediate"),
        "target_date": data.get("target_date", ""),
        "created_at": datetime.utcnow()
    }

    db = get_db()
    res = db.skills.insert_one(skill_doc)
    skill_doc["_id"] = res.inserted_id
    return jsonify({"message": "Skill added.", "skill": serialize_doc(skill_doc)}), 201

@career_bp.route("/skills/<id>", methods=["DELETE"])
@token_required
def delete_skill(id):
    db = get_db()
    res = db.skills.delete_one({"_id": ObjectId(id), "user_id": g.user_id})
    if res.deleted_count == 0:
        return jsonify({"error": "Skill not found."}), 404
    return jsonify({"message": "Skill removed."}), 200


# ==================== JOBS & INTERNSHIPS ====================

@career_bp.route("/jobs", methods=["GET"])
@token_required
def get_jobs():
    db = get_db()
    job_type = request.args.get("type")
    query = {}
    if job_type and job_type != "All":
        query["type"] = job_type

    jobs = list(db.jobs.find(query).sort("deadline", 1))
    user_id = g.user_id
    serialized = serialize_docs(jobs)

    for job in serialized:
        saved_list = job.get("saved_by", [])
        applied_list = job.get("applied_by", [])
        job["is_saved"] = user_id in saved_list
        job["is_applied"] = user_id in applied_list

    return jsonify({"jobs": serialized}), 200

@career_bp.route("/jobs/<id>/save", methods=["POST"])
@token_required
def toggle_save_job(id):
    db = get_db()
    user_id = g.user_id
    job = db.jobs.find_one({"_id": ObjectId(id)})
    if not job:
        return jsonify({"error": "Opportunity not found."}), 404

    saved_by = job.get("saved_by", [])
    if user_id in saved_by:
        db.jobs.update_one({"_id": ObjectId(id)}, {"$pull": {"saved_by": user_id}})
        is_saved = False
    else:
        db.jobs.update_one({"_id": ObjectId(id)}, {"$push": {"saved_by": user_id}})
        is_saved = True

    return jsonify({"message": "Saved status updated.", "is_saved": is_saved}), 200

@career_bp.route("/jobs/<id>/apply", methods=["POST"])
@token_required
def toggle_apply_job(id):
    db = get_db()
    user_id = g.user_id
    job = db.jobs.find_one({"_id": ObjectId(id)})
    if not job:
        return jsonify({"error": "Opportunity not found."}), 404

    applied_by = job.get("applied_by", [])
    if user_id in applied_by:
        db.jobs.update_one({"_id": ObjectId(id)}, {"$pull": {"applied_by": user_id}})
        is_applied = False
    else:
        db.jobs.update_one({"_id": ObjectId(id)}, {"$push": {"applied_by": user_id}})
        is_applied = True

    return jsonify({"message": "Application status updated.", "is_applied": is_applied}), 200
