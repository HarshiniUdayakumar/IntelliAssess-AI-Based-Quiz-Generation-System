from flask import Flask
from flask_cors import CORS
from config import Config, db
from models.course import Course
from routes.course_routes import course_bp
from routes.unit_routes import unit_bp
from models.unit import Unit
from models.module import Module
from routes.module_routes import module_bp
from models.quiz import Quiz
from routes.quiz_routes import quiz_bp
from models.question import Question
from routes.question_routes import question_bp
from routes.dashboard_routes import dashboard_bp
from models.user import User
from routes.auth_routes import auth_bp

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
app.register_blueprint(quiz_bp)
app.register_blueprint(question_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(auth_bp)

db.init_app(app)
app.register_blueprint(course_bp)
app.register_blueprint(unit_bp)
app.register_blueprint(module_bp)
@app.route("/")
def home():
    return {"message": "Flask + MySQL Connected"}

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
