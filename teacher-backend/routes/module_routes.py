from flask import Blueprint, request, jsonify
from config import db
from models.module import Module
from werkzeug.utils import secure_filename
import os
import fitz  
from services.quiz_generator import generate_questions
from models.question import Question

module_bp = Blueprint("module_bp", __name__)

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
            "message": "Module not found"
        }), 404

    if "file" not in request.files:
        return jsonify({
            "message": "No file uploaded"
        }), 400

    file = request.files["file"]

    filename = secure_filename(file.filename)

    upload_folder = "uploads"

    os.makedirs(upload_folder, exist_ok=True)

    file_path = os.path.join(
        upload_folder,
        filename
    )

    file.save(file_path)

    module.pdf_path = file_path

    db.session.commit()

    return jsonify({
        "message": "PDF uploaded successfully",
        "pdf_path": file_path
    })
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

    pdf_path = module.pdf_path

    if not os.path.exists(pdf_path):
        return jsonify({
            "message": "PDF file not found"
        }), 404

    doc = fitz.open(pdf_path)

    extracted_text = ""

    for page in doc:
        extracted_text += page.get_text()

    doc.close()

    return jsonify({
        "module_id": module.id,
        "module_name": module.name,
        "text": extracted_text
    })

@module_bp.route("/modules/<int:id>/generate-quiz", methods=["POST"])
def generate_quiz(id):

    module = Module.query.get(id)

    if not module:
        return jsonify({"message": "Module not found"}), 404

    if not module.pdf_path:
        return jsonify({"message": "No PDF uploaded"}), 400

    # STEP 1: extract text
    doc = fitz.open(module.pdf_path)
    text = ""

    for page in doc:
        text += page.get_text()

    doc.close()

    # STEP 2: AI generation
    questions = generate_questions(text)

    if "error" in questions:
        return jsonify(questions), 500

    # STEP 3: return only (no DB for now - keep simple first)
    return jsonify({
        "message": "Quiz generated successfully",
        "questions": questions
    })