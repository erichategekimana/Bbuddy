from flask import Blueprint, request, jsonify, g  # Make sure 'g' is imported
from app.models.category_model import Category
from app import db
from app.schemas import CategorySchema
from app.utils import validate_json
from ..auth import jwt_required  # Change from token_required to jwt_required

categories_bp = Blueprint("categories", __name__)

# Create a category
@categories_bp.route("/categories", methods=["POST"])
@jwt_required  # Changed to jwt_required
@validate_json(CategorySchema)
def create_category(validated):  # Remove current_user parameter
    user_id = g.current_user["user_id"]  # Get user_id from g.current_user
    name = validated.name
    description = validated.description

    # Make sure category name is unique for this user
    existing = Category.query.filter_by(name=name, user_id=user_id).first()
    if existing:
        return jsonify({"error": "Category already exists"}), 409

    # Create category for this user
    category = Category(
        name=name,
        description=description,
        user_id=user_id  # Use user_id from g.current_user
    )
    db.session.add(category)
    db.session.commit()

    return jsonify({
        "message": "category_created",
        "category_id": category.category_id
    }), 201

# Get all categories
@categories_bp.route("/categories", methods=["GET"])
@jwt_required  # Changed to jwt_required
def get_categories():
    user_id = g.current_user["user_id"]  # Get user_id from g.current_user
    categories = Category.query.filter_by(user_id=user_id).all()
    return jsonify([
        {"category_id": c.category_id, "name": c.name, "description": c.description}
        for c in categories
    ])

# GET SINGLE CATEGORY
@categories_bp.route("/categories/<int:category_id>", methods=["GET"])
@jwt_required  # Changed to jwt_required
def get_single_category(category_id):
    user_id = g.current_user["user_id"]  # Get user_id from g.current_user
    category = Category.query.filter_by(
        category_id=category_id,
        user_id=user_id
    ).first()

    if not category:
        return jsonify({"error": "Category not found"}), 404

    return jsonify({
        "category_id": category.category_id,
        "name": category.name,
        "description": category.description
    })

# UPDATE CATEGORY
@categories_bp.route("/categories/<int:category_id>", methods=["PUT"])
@jwt_required  # Changed to jwt_required
@validate_json(CategorySchema)
def update_category(category_id, validated):  # Remove current_user parameter
    user_id = g.current_user["user_id"]  # Get user_id from g.current_user
    category = Category.query.filter_by(
        category_id=category_id,
        user_id=user_id
    ).first()

    if not category:
        return jsonify({"error": "Category not found"}), 404

    name = validated.name
    description = validated.description

    if name:
        # Check if name already exists for same user
        existing = Category.query.filter_by(name=name, user_id=user_id).first()
        if existing and existing.category_id != category_id:
            return jsonify({"error": "Category name already used"}), 409
        category.name = name

    if description is not None:
        category.description = description

    db.session.commit()

    return jsonify({"message": "category_updated"}), 200

# DELETE CATEGORY
@categories_bp.route("/categories/<int:category_id>", methods=["DELETE"])
@jwt_required  # Changed to jwt_required
def delete_category(category_id):
    user_id = g.current_user["user_id"]  # Get user_id from g.current_user
    category = Category.query.filter_by(
        category_id=category_id,
        user_id=user_id
    ).first()

    if not category:
        return jsonify({"error": "Category not found"}), 404

    # Check if category is used by any budget plan
    from app.models.budget_plan_model import BudgetPlan
    in_plans = BudgetPlan.query.filter_by(category_id=category_id, user_id=user_id).first()
    if in_plans:
        return jsonify({
            "error": "category_in_use",
            "message": "Cannot delete category because it is used in budget plans"
        }), 409

    # Check if category is used by any expense
    from app.models.expense_model import Expense
    in_expenses = Expense.query.filter_by(category_id=category_id, user_id=user_id).first()
    if in_expenses:
        return jsonify({
            "error": "category_in_use",
            "message": "Cannot delete category because it is used in expenses"
        }), 409

    db.session.delete(category)
    db.session.commit()

    return jsonify({"message": "category_deleted"}), 200