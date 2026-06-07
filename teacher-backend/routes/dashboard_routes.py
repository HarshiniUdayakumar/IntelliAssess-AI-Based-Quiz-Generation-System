from flask import Blueprint, jsonify
from models.course import Course
from models.unit import Unit
from models.module import Module
from models.quiz import Quiz

dashboard_bp = Blueprint("dashboard_bp", __name__)

@dashboard_bp.route("/dashboard", methods=["GET"])
def get_dashboard_stats():

    return jsonify({
        "courses": Course.query.count(),
        "units": Unit.query.count(),
        "modules": Module.query.count(),
        "quizzes": Quiz.query.count()
    })