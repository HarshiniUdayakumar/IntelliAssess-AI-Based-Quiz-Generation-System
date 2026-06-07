from flask import Blueprint, request, jsonify
from config import db
from models.question import Question

question_bp = Blueprint("question_bp", __name__)


# CREATE QUESTION
@question_bp.route("/questions", methods=["POST"])
def create_question():

    data = request.get_json()

    new_question = Question(
        question_text=data["question_text"],
        option_a=data["option_a"],
        option_b=data["option_b"],
        option_c=data["option_c"],
        option_d=data["option_d"],
        correct_answer=data["correct_answer"],
        quiz_id=data["quiz_id"]
    )

    db.session.add(new_question)
    db.session.commit()

    return jsonify({
        "message": "Question created successfully"
    })


# GET QUESTIONS BY QUIZ
@question_bp.route("/questions/<int:quiz_id>", methods=["GET"])
def get_questions(quiz_id):

    questions = Question.query.filter_by(
        quiz_id=quiz_id
    ).all()

    result = []

    for question in questions:
        result.append({
            "id": question.id,
            "question_text": question.question_text,
            "option_a": question.option_a,
            "option_b": question.option_b,
            "option_c": question.option_c,
            "option_d": question.option_d,
            "correct_answer": question.correct_answer,
            "quiz_id": question.quiz_id
        })

    return jsonify(result)
@question_bp.route("/questions/<int:id>", methods=["PUT"])
def update_question(id):

    question = Question.query.get(id)

    if not question:
        return jsonify({
            "message": "Question not found"
        }), 404

    data = request.get_json()

    question.question_text = data["question_text"]
    question.option_a = data["option_a"]
    question.option_b = data["option_b"]
    question.option_c = data["option_c"]
    question.option_d = data["option_d"]
    question.correct_answer = data["correct_answer"]

    db.session.commit()

    return jsonify({
        "message": "Question updated successfully"
    })
@question_bp.route("/questions/<int:id>", methods=["DELETE"])
def delete_question(id):

    question = Question.query.get(id)

    if not question:
        return jsonify({
            "message": "Question not found"
        }), 404

    db.session.delete(question)
    db.session.commit()

    return jsonify({
        "message": "Question deleted successfully"
    })