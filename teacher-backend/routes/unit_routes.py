from flask import Blueprint, request, jsonify
from config import db
from models.unit import Unit

unit_bp = Blueprint("unit_bp", __name__)

@unit_bp.route("/units", methods=["POST"])
def create_unit():

    data = request.get_json()

    new_unit = Unit(
        name=data["name"],
        course_id=data["course_id"]
    )

    db.session.add(new_unit)
    db.session.commit()

    return jsonify({
        "message": "Unit created successfully"
    })
@unit_bp.route("/units/<int:course_id>", methods=["GET"])
def get_units(course_id):

    units = Unit.query.filter_by(course_id=course_id).all()

    result = []

    for unit in units:
        result.append({
            "id": unit.id,
            "name": unit.name,
            "course_id": unit.course_id
        })

    return jsonify(result)