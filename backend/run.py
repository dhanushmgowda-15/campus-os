import os
from app import create_app
from app.utils.seeder import seed_database
from app.config import Config

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        try:
            seed_database()
        except Exception as e:
            print(f"Database seeding note: {e}")

    port = Config.PORT
    print(f"[*] CampusOS API Server running on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
