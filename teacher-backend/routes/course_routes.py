from flask import Blueprint, request, jsonify
from config import db
from models.course import Course

course_bp = Blueprint("course_bp", __name__)

@course_bp.route("/courses", methods=["POST"])
def create_course():

    data = request.get_json()

    new_course = Course(
        name=data["name"]
    )

    db.session.add(new_course)
    db.session.commit()

    return jsonify({
        "message": "Course created successfully"
    })
@course_bp.route("/courses", methods=["GET"])
def get_courses():

    courses = Course.query.all()

    result = []

    for course in courses:
        result.append({
            "id": course.id,
            "name": course.name
        })

    return jsonify(result)