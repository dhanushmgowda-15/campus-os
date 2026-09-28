import bcrypt
from datetime import datetime, timedelta
from app.db import get_db
from app.models.user import create_user_document
from app.utils.study_planner import generate_study_plan

def seed_database():
    db = get_db()
    print("Checking database seed status...")

    # 1. Seed Notices
    if db.notices.count_documents({}) == 0:
        notices = [
            {
                "title": "Mid-Term Examination Schedule Announced for Fall Semester",
                "content": "All undergraduate and postgraduate departments are requested to check the updated exam timetable on the portal. Hall tickets will be issued from Monday.",
                "category": "Examination",
                "priority": "urgent",
                "posted_by": "Academic Controller of Exams",
                "posted_at": datetime.utcnow() - timedelta(hours=2)
            },
            {
                "title": "Annual Campus Hackathon 'HackCampus 2026' Registrations Open",
                "content": "Form teams of up to 4 members. Over $15,000 in prizes and direct interview opportunities with top tech recruiters. Early bird registrations end this Friday.",
                "category": "Academic",
                "priority": "normal",
                "posted_by": "Computer Science Dept & Developer Student Club",
                "posted_at": datetime.utcnow() - timedelta(hours=14)
            },
            {
                "title": "Campus Library Extended Hours During Exam Month",
                "content": "The central library and digital reading rooms will stay open 24/7 starting next Monday to facilitate exam preparation. High-speed Wi-Fi and power stations available.",
                "category": "Administrative",
                "priority": "normal",
                "posted_by": "Chief Librarian",
                "posted_at": datetime.utcnow() - timedelta(days=1)
            },
            {
                "title": "Tech Giant Placement Drive: Internship & Full-time Roles",
                "content": "Shortlisting for Software Engineering and Cloud Operations will commence on September 20. Ensure your resume and portfolio links are updated.",
                "category": "Placement",
                "priority": "urgent",
                "posted_by": "Career & Placement Cell",
                "posted_at": datetime.utcnow() - timedelta(days=2)
            }
        ]
        db.notices.insert_many(notices)
        print("Seeded Notices.")

    # 2. Seed Clubs
    if db.clubs.count_documents({}) == 0:
        clubs = [
            {
                "name": "AI & Machine Learning Club",
                "category": "Technical",
                "description": "Building neural nets, organizing paper reading groups, and competing in global Kaggle & hackathon challenges.",
                "lead": "Sophia Chen (4th Year CS)",
                "avatar": "brain",
                "members": []
            },
            {
                "name": "Robotics & Hardware Society",
                "category": "Engineering",
                "description": "Hands-on microcontrollers, autonomous drones, ROS navigation, and combat bot competitions.",
                "lead": "Marcus Vance (3rd Year Mech)",
                "avatar": "bot",
                "members": []
            },
            {
                "name": "Design & Product Guild",
                "category": "Creative",
                "description": "Figma workshops, UX design sprints, portfolio critiques, and human-computer interaction research.",
                "lead": "Elena Rostova (3rd Year Design)",
                "avatar": "palette",
                "members": []
            },
            {
                "name": "Open Source Developers Guild",
                "category": "Technical",
                "description": "Contributing to upstream open-source projects, hosting Linux install-fests, and collaborative software dev.",
                "lead": "David Kim (4th Year SE)",
                "avatar": "code",
                "members": []
            }
        ]
        db.clubs.insert_many(clubs)
        print("Seeded Clubs.")

    # 3. Seed Campus Events
    if db.events.count_documents({}) == 0:
        now = datetime.utcnow()
        events = [
            {
                "title": "HackCampus 2026: 36-Hour Hackathon",
                "category": "Technical",
                "date": (now + timedelta(days=5)).strftime("%Y-%m-%d"),
                "time": "09:00 AM - 09:00 PM",
                "venue": "Innovation Center, 3rd Floor",
                "description": "Join 300+ builders to create next-gen AI, Web3, and HealthTech solutions. Food, swags, and mentors provided.",
                "organizer_club": "Open Source Developers Guild",
                "rsvps": []
            },
            {
                "title": "Tech Career & Internship Networking Night",
                "category": "Placement",
                "date": (now + timedelta(days=8)).strftime("%Y-%m-%d"),
                "time": "04:30 PM - 07:30 PM",
                "venue": "Grand University Auditorium",
                "description": "Connect directly with tech leads and recruiters from Microsoft, Google, Uber, and local unicorns.",
                "organizer_club": "Career & Placement Cell",
                "rsvps": []
            },
            {
                "title": "Deep Learning & LLM Workshop",
                "category": "Workshop",
                "date": (now + timedelta(days=12)).strftime("%Y-%m-%d"),
                "time": "02:00 PM - 05:00 PM",
                "venue": "CS Lab 4B",
                "description": "A beginner-friendly workshop on fine-tuning open-weights models and building RAG pipelines with Python.",
                "organizer_club": "AI & Machine Learning Club",
                "rsvps": []
            }
        ]
        db.events.insert_many(events)
        print("Seeded Events.")

    # 4. Seed Bus Routes
    if db.bus_routes.count_documents({}) == 0:
        routes = [
            {
                "route_number": "Route 101",
                "route_name": "North Campus - Tech Hub Express",
                "driver_contact": "+1 (555) 234-5678 (Mr. Robert)",
                "stops": [
                    {"stop_name": "North Metro Terminal", "morning_time": "07:30 AM", "evening_time": "05:15 PM"},
                    {"stop_name": "Oakridge Apartments", "morning_time": "07:45 AM", "evening_time": "05:30 PM"},
                    {"stop_name": "University Main Gate", "morning_time": "08:15 AM", "evening_time": "06:00 PM"},
                    {"stop_name": "Engineering Block Drop-off", "morning_time": "08:25 AM", "evening_time": "06:10 PM"}
                ]
            },
            {
                "route_number": "Route 204",
                "route_name": "South Suburbs & City Center Shuttle",
                "driver_contact": "+1 (555) 876-5432 (Mr. Thomas)",
                "stops": [
                    {"stop_name": "Central Railway Station", "morning_time": "07:15 AM", "evening_time": "05:00 PM"},
                    {"stop_name": "South Avenue Crossing", "morning_time": "07:35 AM", "evening_time": "05:20 PM"},
                    {"stop_name": "Greenwood Student Housing", "morning_time": "07:55 AM", "evening_time": "05:40 PM"},
                    {"stop_name": "University Campus Circle", "morning_time": "08:20 AM", "evening_time": "06:05 PM"}
                ]
            },
            {
                "route_number": "Route 305",
                "route_name": "West Lake - Hostel Direct",
                "driver_contact": "+1 (555) 345-6789 (Mr. Evans)",
                "stops": [
                    {"stop_name": "West Lake Complex", "morning_time": "07:40 AM", "evening_time": "05:25 PM"},
                    {"stop_name": "Sports Complex Gate", "morning_time": "08:05 AM", "evening_time": "05:50 PM"},
                    {"stop_name": "University Library & CS Wing", "morning_time": "08:20 AM", "evening_time": "06:05 PM"}
                ]
            }
        ]
        db.bus_routes.insert_many(routes)
        print("Seeded Bus Routes.")

    # 5. Seed Jobs & Internships
    if db.jobs.count_documents({}) == 0:
        jobs = [
            {
                "title": "Software Engineering Intern (Summer 2026)",
                "company": "Google",
                "location": "Mountain View, CA (Hybrid)",
                "type": "Internship",
                "stipend_or_salary": "$52 / hr + Housing Stipend",
                "deadline": (datetime.utcnow() + timedelta(days=25)).strftime("%Y-%m-%d"),
                "description": "Join Google's Core Infrastructure or Search team to build distributed systems used by billions. Work with senior mentors in Python, Go, and C++.",
                "requirements": ["Enrolled in BS/MS in CS or related field", "Solid fundamentals in Data Structures & Algorithms", "Experience with Git, Python or C++"],
                "apply_url": "https://careers.google.com/students",
                "saved_by": [],
                "applied_by": []
            },
            {
                "title": "Full-Stack Developer Intern",
                "company": "Stripe",
                "location": "San Francisco, CA / Remote",
                "type": "Internship",
                "stipend_or_salary": "$55 / hr",
                "deadline": (datetime.utcnow() + timedelta(days=18)).strftime("%Y-%m-%d"),
                "description": "Build high-reliability financial interfaces with React, TypeScript, and distributed backend microservices.",
                "requirements": ["Strong JavaScript/TypeScript & React proficiency", "Familiarity with RESTful APIs & SQL/NoSQL databases", "Passion for clean code & developer experience"],
                "apply_url": "https://stripe.com/jobs",
                "saved_by": [],
                "applied_by": []
            },
            {
                "title": "Junior Backend Engineer (New Grad)",
                "company": "TechNova Labs",
                "location": "Boston, MA",
                "type": "Full-time",
                "stipend_or_salary": "$115,000 / yr + Equity",
                "deadline": (datetime.utcnow() + timedelta(days=35)).strftime("%Y-%m-%d"),
                "description": "Design and optimize high-throughput microservices using Python Flask, FastAPI, and MongoDB/Redis clusters.",
                "requirements": ["Bachelor's degree graduating 2025/2026", "Proficiency with Python, REST APIs, and Docker", "Understanding of database indexing & caching"],
                "apply_url": "https://technova.io/careers",
                "saved_by": [],
                "applied_by": []
            },
            {
                "title": "Frontend Engineering Intern",
                "company": "Airbnb",
                "location": "Seattle, WA (Hybrid)",
                "type": "Internship",
                "stipend_or_salary": "$50 / hr",
                "deadline": (datetime.utcnow() + timedelta(days=14)).strftime("%Y-%m-%d"),
                "description": "Craft responsive, accessible web interfaces for host and guest travel discovery using React and Tailwind CSS.",
                "requirements": ["Proficient with modern React, CSS/Tailwind, and state management", "Good eye for UI/UX details and micro-interactions"],
                "apply_url": "https://careers.airbnb.com",
                "saved_by": [],
                "applied_by": []
            }
        ]
        db.jobs.insert_many(jobs)
        print("Seeded Jobs.")

    # 6. Seed Demo User (Alex Rivers)
    demo_email = "alex@campus.edu"
    demo_user = db.users.find_one({"email": demo_email})
    if not demo_user:
        hashed_pw = bcrypt.hashpw("password123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        user_doc = create_user_document(
            name="Alex Rivers",
            email=demo_email,
            password_hash=hashed_pw,
            college="Apex Institute of Technology",
            branch="Computer Science & Engineering",
            year_of_study="3rd Year"
        )
        res = db.users.insert_one(user_doc)
        user_id = str(res.inserted_id)
        print(f"Created demo user: {demo_email} (password: password123)")
        
        # Populate demo student data
        seed_student_starter_data(user_id)

def seed_student_starter_data(user_id):
    db = get_db()
    
    # 1. Starter Notes
    notes = [
        {
            "user_id": user_id,
            "title": "Operating Systems: Process Synchronization & Mutexes",
            "subject": "Operating Systems",
            "content": "<h2>Process Synchronization Highlights</h2><p>Race conditions occur when multiple processes execute concurrently accessing shared state.</p><ul><li><b>Critical Section Problem</b>: Mutual exclusion, Progress, Bounded Waiting</li><li><b>Semaphores</b>: Wait (P) and Signal (V) primitives</li><li><b>Dining Philosophers Problem</b>: Resource hierarchy solution prevents circular wait deadlocks</li></ul>",
            "tags": ["OS", "Concurrency", "Semaphores"],
            "is_pinned": True,
            "created_at": datetime.utcnow() - timedelta(days=3),
            "updated_at": datetime.utcnow() - timedelta(hours=5)
        },
        {
            "user_id": user_id,
            "title": "Database Normalization (1NF through BCNF) Cheatsheet",
            "subject": "Database Systems",
            "content": "<h2>Normalization Summary</h2><p>Goal: Minimize data redundancy and prevent insertion, update, and deletion anomalies.</p><p><b>1NF:</b> Atomic values, no repeating groups.<br/><b>2NF:</b> 1NF + No partial functional dependencies on candidate keys.<br/><b>3NF:</b> 2NF + No transitive dependencies.<br/><b>BCNF:</b> For every functional dependency X -> Y, X must be a superkey.</p>",
            "tags": ["Databases", "SQL", "Cheatsheet"],
            "is_pinned": False,
            "created_at": datetime.utcnow() - timedelta(days=4),
            "updated_at": datetime.utcnow() - timedelta(days=2)
        }
    ]
    db.notes.insert_many(notes)

    # 2. Starter Tasks
    tasks = [
        {
            "user_id": user_id,
            "title": "Complete Computer Networks Lab Assignment #4",
            "description": "Implement socket programming client-server chat in Python and write up Wireshark packet capture analysis.",
            "due_date": (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d"),
            "priority": "high",
            "status": "pending",
            "subject": "Computer Networks",
            "created_at": datetime.utcnow() - timedelta(days=1),
            "updated_at": datetime.utcnow() - timedelta(days=1)
        },
        {
            "user_id": user_id,
            "title": "Prepare Slide Deck for Software Engineering Sprint Review",
            "description": "Document sprint velocity, burn-down chart, and UI prototypes for CampusOS release.",
            "due_date": (datetime.utcnow() + timedelta(days=4)).strftime("%Y-%m-%d"),
            "priority": "medium",
            "status": "in_progress",
            "subject": "Software Engineering",
            "created_at": datetime.utcnow() - timedelta(days=2),
            "updated_at": datetime.utcnow()
        },
        {
            "user_id": user_id,
            "title": "Read Chapter 7: Memory Hierarchy & Cache Coherence",
            "description": "Review direct-mapped vs set-associative caches for upcoming quiz.",
            "due_date": (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d"),
            "priority": "low",
            "status": "completed",
            "subject": "Computer Architecture",
            "created_at": datetime.utcnow() - timedelta(days=5),
            "updated_at": datetime.utcnow() - timedelta(days=1)
        }
    ]
    db.tasks.insert_many(tasks)

    # 3. Starter Exams with automated day-by-day plan
    exam_date_1 = (datetime.utcnow() + timedelta(days=6)).strftime("%Y-%m-%d")
    plan_1 = generate_study_plan(
        "Operating Systems Mid-Term",
        exam_date_1,
        ["Process Scheduling & IPC", "Threads & Synchronization", "Deadlocks & Banker's Algorithm", "Virtual Memory & Paging"]
    )
    # Mark first 2 days as completed for realism
    if len(plan_1) > 0:
        plan_1[0]["completed"] = True
    if len(plan_1) > 1:
        plan_1[1]["completed"] = True

    exam_date_2 = (datetime.utcnow() + timedelta(days=13)).strftime("%Y-%m-%d")
    plan_2 = generate_study_plan(
        "Database Management Systems",
        exam_date_2,
        ["Relational Algebra & SQL", "ER Diagrams & Normalization", "Indexing & B+ Trees", "Transaction Isolation & ACID"]
    )

    exams = [
        {
            "user_id": user_id,
            "subject": "Operating Systems Mid-Term",
            "exam_date": exam_date_1,
            "room_or_venue": "Hall B - Room 204",
            "syllabus_topics": ["Process Scheduling", "Synchronization", "Deadlocks", "Paging"],
            "study_plan": plan_1,
            "created_at": datetime.utcnow()
        },
        {
            "user_id": user_id,
            "subject": "Database Management Systems",
            "exam_date": exam_date_2,
            "room_or_venue": "Science Block Auditorium",
            "syllabus_topics": ["Relational Algebra", "Normalization", "B+ Trees", "ACID Transactions"],
            "study_plan": plan_2,
            "created_at": datetime.utcnow()
        }
    ]
    db.exams.insert_many(exams)

    # 4. Starter Timetable (Weekly Grid)
    timetable = [
        # Monday
        {"user_id": user_id, "day": "Monday", "start_time": "09:00", "end_time": "10:00", "subject": "Operating Systems", "room": "LH-101", "instructor": "Prof. Alan Turing", "color": "blue"},
        {"user_id": user_id, "day": "Monday", "start_time": "10:15", "end_time": "11:15", "subject": "Computer Networks", "room": "LH-103", "instructor": "Dr. Radia Perlman", "color": "emerald"},
        {"user_id": user_id, "day": "Monday", "start_time": "11:30", "end_time": "13:00", "subject": "DBMS Laboratory", "room": "Lab 3", "instructor": "Prof. E.F. Codd", "color": "purple"},
        # Tuesday
        {"user_id": user_id, "day": "Tuesday", "start_time": "09:00", "end_time": "10:00", "subject": "Software Engineering", "room": "LH-102", "instructor": "Prof. Margaret Hamilton", "color": "amber"},
        {"user_id": user_id, "day": "Tuesday", "start_time": "10:15", "end_time": "11:15", "subject": "Design & Algorithms", "room": "LH-101", "instructor": "Dr. Donald Knuth", "color": "rose"},
        {"user_id": user_id, "day": "Tuesday", "start_time": "13:30", "end_time": "15:00", "subject": "AI & Robotics Seminar", "room": "Auditorium", "instructor": "Dr. John McCarthy", "color": "indigo"},
        # Wednesday
        {"user_id": user_id, "day": "Wednesday", "start_time": "09:00", "end_time": "10:00", "subject": "Operating Systems", "room": "LH-101", "instructor": "Prof. Alan Turing", "color": "blue"},
        {"user_id": user_id, "day": "Wednesday", "start_time": "10:15", "end_time": "11:15", "subject": "Computer Networks", "room": "LH-103", "instructor": "Dr. Radia Perlman", "color": "emerald"},
        {"user_id": user_id, "day": "Wednesday", "start_time": "14:00", "end_time": "16:00", "subject": "Web Development Project Lab", "room": "Lab 5", "instructor": "Prof. Tim Berners-Lee", "color": "cyan"},
        # Thursday
        {"user_id": user_id, "day": "Thursday", "start_time": "09:00", "end_time": "10:00", "subject": "Software Engineering", "room": "LH-102", "instructor": "Prof. Margaret Hamilton", "color": "amber"},
        {"user_id": user_id, "day": "Thursday", "start_time": "10:15", "end_time": "11:15", "subject": "Design & Algorithms", "room": "LH-101", "instructor": "Dr. Donald Knuth", "color": "rose"},
        # Friday
        {"user_id": user_id, "day": "Friday", "start_time": "09:00", "end_time": "10:00", "subject": "Operating Systems", "room": "LH-101", "instructor": "Prof. Alan Turing", "color": "blue"},
        {"user_id": user_id, "day": "Friday", "start_time": "11:00", "end_time": "12:30", "subject": "Industry Guest Lecture", "room": "Main Hall", "instructor": "Guest Speakers", "color": "teal"}
    ]
    db.timetable.insert_many(timetable)

    # 5. Starter Skills
    skills = [
        {"user_id": user_id, "name": "Python & Flask", "category": "Technical", "proficiency": "Advanced", "target_date": "Current", "created_at": datetime.utcnow()},
        {"user_id": user_id, "name": "React.js & Tailwind CSS", "category": "Technical", "proficiency": "Advanced", "target_date": "Current", "created_at": datetime.utcnow()},
        {"user_id": user_id, "name": "MongoDB & NoSQL", "category": "Technical", "proficiency": "Intermediate", "target_date": "Current", "created_at": datetime.utcnow()},
        {"user_id": user_id, "name": "Data Structures & Algorithms", "category": "Technical", "proficiency": "Intermediate", "target_date": "Dec 2026", "created_at": datetime.utcnow()},
        {"user_id": user_id, "name": "Technical Writing & Presentation", "category": "Soft Skills", "proficiency": "Advanced", "target_date": "Current", "created_at": datetime.utcnow()},
        {"user_id": user_id, "name": "Git & GitHub Team Workflows", "category": "Tools", "proficiency": "Expert", "target_date": "Current", "created_at": datetime.utcnow()}
    ]
    db.skills.insert_many(skills)
