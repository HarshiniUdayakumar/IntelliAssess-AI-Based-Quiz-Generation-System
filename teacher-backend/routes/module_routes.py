from flask import Blueprint, request, jsonify, send_from_directory
from config import db
from models.module import Module
from werkzeug.utils import secure_filename
import os
import fitz
from services.quiz_generator import generate_questions
from models.question import Question
from models.quiz import Quiz
import subprocess
import pdfplumber   

module_bp = Blueprint("module_bp", __name__)
def extract_pdf_text_smart(pdf_path):
    """Try multiple strategies to extract text from math-heavy PDFs."""

    # Strategy 1: pdftotext (best for math fonts)
    try:
        result = subprocess.run(
            ["pdftotext", "-layout", "-enc", "UTF-8", pdf_path, "-"],
            capture_output=True, text=True, timeout=30
        )
        text = result.stdout.strip()
        if text and _is_readable(text):
            print("[PDF] Using pdftotext")
            return text
    except Exception as e:
        print(f"[PDF] pdftotext failed: {e}")

    # Strategy 2: pdfplumber
    try:
        pages = []
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    pages.append(t)
        text = "\n".join(pages).strip()
        if text and _is_readable(text):
            print("[PDF] Using pdfplumber")
            return text
    except Exception as e:
        print(f"[PDF] pdfplumber failed: {e}")

    # Strategy 3: fitz fallback (original)
    print("[PDF] Using fitz (may be garbled for math PDFs)")
    doc = fitz.open(pdf_path)
    text = "".join(page.get_text() for page in doc)
    doc.close()
    return text.strip()


def _is_readable(text):
    """Return False if text looks garbled (too many symbol-only tokens)."""
    words = text.split()
    if not words:
        return False
    symbol_only = sum(1 for w in words if not any(c.isalnum() for c in w))
    short_tokens = sum(1 for w in words if len(w) <= 2)
    return (symbol_only / len(words)) < 0.4 and (short_tokens / len(words)) < 0.6

# =========================
# CREATE MODULE
# =========================
@module_bp.route("/modules", methods=["POST"])
def create_module():

    data = request.get_json()

    new_module = Module(
        name=data["name"],
        unit_id=data["unit_id"]
    )

    db.session.add(new_module)
    db.session.commit()

    return jsonify({
        "message": "Module created successfully"
    })


# =========================
# GET ALL MODULES OF A UNIT
# =========================
@module_bp.route("/units/<int:unit_id>/modules", methods=["GET"])
def get_modules(unit_id):

    modules = Module.query.filter_by(unit_id=unit_id).all()

    result = []

    for module in modules:
        result.append({
            "id": module.id,
            "name": module.name,
            "unit_id": module.unit_id
        })

    return jsonify(result)


# =========================
# GET SINGLE MODULE DETAIL
# =========================
@module_bp.route("/modules/<int:module_id>", methods=["GET"])
def get_module(module_id):

    module = Module.query.get(module_id)

    if not module:
        return jsonify({
            "message": "Module not found"
        }), 404

    return jsonify({
        "id": module.id,
        "name": module.name,
        "description": module.description,
        "pdf_path": module.pdf_path,
        "unit_id": module.unit_id
    })


# =========================
# UPLOAD PDF TO MODULE
# =========================
@module_bp.route("/modules/<int:module_id>/upload", methods=["POST"])
def upload_pdf(module_id):

    module = Module.query.get(module_id)

    if not module:
        return jsonify({
            "success": False,
            "message": "Module not found"
        }), 404

    if "file" not in request.files:
        return jsonify({
            "success": False,
            "message": "No file uploaded"
        }), 400

    file = request.files["file"]

    filename = secure_filename(file.filename)

    upload_folder = "uploads"

    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(upload_folder, filename)

    file.save(file_path)

    module.pdf_path = file_path

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "PDF uploaded successfully",
        "pdf_path": file_path
    })


# =========================
# EXTRACT TEXT
# =========================
@module_bp.route("/modules/<int:id>/extract-text", methods=["POST"])
def extract_text(id):

    module = Module.query.get(id)

    if not module:
        return jsonify({
            "message": "Module not found"
        }), 404

    if not module.pdf_path:
        return jsonify({
            "message": "No PDF uploaded"
        }), 400

    if not os.path.exists(module.pdf_path):
        return jsonify({
            "message": "PDF file not found on disk"
        }), 404

    extracted_text = extract_pdf_text_smart(module.pdf_path)
    extracted_text = "".join(page.get_text() for page in doc)
    doc.close()

    return jsonify({
        "module_id": module.id,
        "module_name": module.name,
        "text": extracted_text
    })


# =========================
# GENERATE QUIZ
# =========================
@module_bp.route("/modules/<int:id>/generate-quiz", methods=["POST"])
def generate_quiz(id):
    """
    Generate quiz questions from a module's PDF.

    Always returns:
      { "success": bool, "message": str, "questions": list, "count": int }
    """
    module = Module.query.get(id)
    if not module:
        return jsonify({
            "success": False,
            "message": "Module not found",
            "questions": [],
            "count": 0,
        }), 404

    if not module.pdf_path:
        return jsonify({
            "success": False,
            "message": "No PDF uploaded for this module",
            "questions": [],
            "count": 0,
        }), 400

    # ── Extract PDF text ──────────────────────────────────────────────────────
# ── Extract PDF text ──────────────────────────────────────────────────────
    try:
        text = extract_pdf_text_smart(module.pdf_path)
    except Exception as e:
        print(f"[generate_quiz] PDF read error: {e}")
        return jsonify({
            "success": False,
            "message": "Failed to read PDF",
            "questions": [],
            "count": 0,
        }), 500

    if not text.strip():
        return jsonify({
            "success": False,
            "message": "PDF appears to be empty or unreadable",
            "questions": [],
            "count": 0,
        }), 400

    # ── Generate (quiz_generator handles retries + validation internally) ─────
    try:
        questions = generate_questions(text, target_count=5)
    except Exception as e:
        print(f"[generate_quiz] Generator error: {e}")
        return jsonify({
            "success": False,
            "message": "Quiz generation failed unexpectedly",
            "questions": [],
            "count": 0,
        }), 500

    if not isinstance(questions, list):
        questions = []

    return jsonify({
        "success": True,
        "message": f"Generated {len(questions)} question(s) successfully",
        "questions": questions,
        "count": len(questions),
    }), 200


# =========================
# APPROVE QUIZ
# =========================
@module_bp.route("/modules/<int:id>/approve-quiz", methods=["POST"])
def approve_quiz(id):
    """
    Save approved questions to the database.

    Expects: { "questions": [ { question, options, correct_answer, difficulty } ] }

    Always returns:
      { "success": bool, "message": str, "quiz_id": int|null }
    """
    module = Module.query.get(id)
    if not module:
        return jsonify({
            "success": False,
            "message": "Module not found",
            "quiz_id": None,
        }), 404

    data = request.get_json(silent=True)
    if not data:
        return jsonify({
            "success": False,
            "message": "Invalid or missing JSON body",
            "quiz_id": None,
        }), 400

    questions = data.get("questions", [])

    if not isinstance(questions, list) or len(questions) == 0:
        return jsonify({
            "success": False,
            "message": "No questions provided",
            "quiz_id": None,
        }), 400

    # ── Upsert Quiz record ────────────────────────────────────────────────────
    try:
        quiz = Quiz.query.filter_by(module_id=id).first()
        if not quiz:
            quiz = Quiz(title=f"{module.name} Quiz", module_id=id)
            db.session.add(quiz)
            db.session.flush()  # get quiz.id before inserting questions

        # Remove old questions first
        Question.query.filter_by(quiz_id=quiz.id).delete()
        db.session.flush()

        # Insert new questions
        for q in questions:
            options = q.get("options", [])
            if not isinstance(options, list):
                options = []

            options = [str(o).strip() for o in options]
            while len(options) < 4:
                options.append("N/A")
            options = options[:4]

            question_text = q.get("question", "").strip()
            correct_answer = q.get("correct_answer", options[0]).strip()

            if not question_text:
                continue  # skip blank questions

            new_question = Question(
                question_text=question_text,
                option_a=options[0],
                option_b=options[1],
                option_c=options[2],
                option_d=options[3],
                correct_answer=correct_answer,
                quiz_id=quiz.id,
            )
            db.session.add(new_question)

        db.session.commit()

    except Exception as e:
        db.session.rollback()
        print(f"[approve_quiz] DB error: {e}")
        return jsonify({
            "success": False,
            "message": "Failed to save quiz to database",
            "quiz_id": None,
        }), 500

    return jsonify({
        "success": True,
        "message": "Quiz approved and saved successfully",
        "quiz_id": quiz.id,
    }), 200


# =========================
# SERVE PDF
# =========================
@module_bp.route("/pdf/<path:filename>", methods=["GET"])
def serve_pdf(filename):

    return send_from_directory("uploads", filename)