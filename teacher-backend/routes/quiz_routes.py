from flask import Blueprint, request, jsonify
from config import db
from models.quiz import Quiz
from models.question import Question

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
@quiz_bp.route("/modules/<int:module_id>/quiz", methods=["GET"])
def get_quiz_by_module(module_id):

    quiz = Quiz.query.filter_by(
        module_id=module_id
    ).first()

    if not quiz:
        return jsonify({
            "message": "Quiz not found"
        }), 404

    return jsonify({
        "id": quiz.id,
        "title": quiz.title,
        "module_id": quiz.module_id
    })
@quiz_bp.route("/quizzes/<int:quiz_id>/questions", methods=["GET"])
def get_quiz_questions(quiz_id):

    questions = Question.query.filter_by(
        quiz_id=quiz_id
    ).all()

    result = []

    for q in questions:
        result.append({
            "id": q.id,
            "question": q.question_text,
            "options": [
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d
            ],
            "correct_answer": q.correct_answer
        })

    return jsonify(result)

@quiz_bp.route("/quizzes/<int:quiz_id>/submit", methods=["POST"])
def submit_quiz(quiz_id):

    data = request.get_json()

    answers = data.get("answers", [])

    questions = Question.query.filter_by(
        quiz_id=quiz_id
    ).all()

    score = 0

    results = []

    for q in questions:

        student_answer = ""

        for ans in answers:
            if ans["question_id"] == q.id:
                student_answer = ans["answer"]
                break

        is_correct = (
            student_answer.strip()
            ==
            q.correct_answer.strip()
        )

        if is_correct:
            score += 1

        results.append({
            "question_id": q.id,
            "your_answer": student_answer,
            "correct_answer": q.correct_answer,
            "is_correct": is_correct
        })

    total = len(questions)

    percentage = (
        round((score / total) * 100, 2)
        if total > 0
        else 0
    )

    return jsonify({
        "score": score,
        "total": total,
        "percentage": percentage,
        "results": results
    })
@quiz_bp.route("/quizzes", methods=["GET"])
def get_all_quizzes():

    quizzes = Quiz.query.all()

    return jsonify([
        {
            "id": quiz.id,
            "title": quiz.title,
            "module_id": quiz.module_id
        }
        for quiz in quizzes
    ])