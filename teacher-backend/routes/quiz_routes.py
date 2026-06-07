from flask import Blueprint, request, jsonify
from config import db
from models.quiz import Quiz

quiz_bp = Blueprint("quiz_bp", __name__)


@quiz_bp.route("/quizzes", methods=["POST"])
def create_quiz():

    data = request.get_json()

    new_quiz = Quiz(
        title=data["title"],
        module_id=data["module_id"]
    )

    db.session.add(new_quiz)
    db.session.commit()

    return jsonify({
        "message": "Quiz created successfully"
    })
@quiz_bp.route("/quizzes/<int:id>", methods=["GET"])
def get_quiz(id):

    quiz = Quiz.query.get(id)

    if not quiz:
        return jsonify({
            "message": "Quiz not found"
        }), 404

    return jsonify({
        "id": quiz.id,
        "title": quiz.title,
        "module_id": quiz.module_id
    })