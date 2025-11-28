from flask import Blueprint, request, jsonify, g  # ADDED 'g' import
from app.models.category_model import Category
from app import db
from app.middleware.auth_middleware import token_required
from app.schemas import CategorySchema  # ADDED import
from app.utils import validate_json  # ADDED import

categories_bp = Blueprint("categories", __name__)

# Create a category
@categories_bp.route("/categories", methods=["POST"])
@token_required
@validate_json(CategorySchema)  # ADDED schema validation
def create_category(current_user, validated):
    name = validated.name
    description = validated.description

    # Make sure category name is unique
    existing = Category.query.filter_by(name=name, user_id=current_user.user_id).first()
    if existing:
        return jsonify({"error": "Category already exists"}), 409

    # Create category for this user
    category = Category(
        name=name,
        description=description,
        user_id=current_user.user_id
    )
    db.session.add(category)
    db.session.commit()

    return jsonify({
        "message": "category_created",
        "category_id": category.category_id
    }), 201

# Get all categories
@categories_bp.route("/categories", methods=["GET"])
@token_required
def get_categories(current_user):
    categories = Category.query.filter_by(user_id=current_user.user_id).all()
    return jsonify([
        {"category_id": c.category_id, "name": c.name, "description": c.description}
        for c in categories
    ])

# GET SINGLE CATEGORY
@categories_bp.route("/categories/<int:category_id>", methods=["GET"])
@token_required
def get_single_category(current_user, category_id):
    category = Category.query.filter_by(
        category_id=category_id,
        user_id=current_user.user_id
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
@token_required
@validate_json(CategorySchema)  # ADDED schema validation
def update_category(current_user, category_id, validated):
    category = Category.query.filter_by(
        category_id=category_id,
        user_id=current_user.user_id
    ).first()

    if not category:
        return jsonify({"error": "Category not found"}), 404

    name = validated.name
    description = validated.description

    if name:
        # Check if name already exists for same user
        existing = Category.query.filter_by(name=name, user_id=current_user.user_id).first()
        if existing and existing.category_id != category_id:
            return jsonify({"error": "Category name already used"}), 409
        category.name = name

    if description is not None:
        category.description = description

    db.session.commit()

    return jsonify({"message": "category_updated"}), 200

# DELETE CATEGORY
@categories_bp.route("/categories/<int:category_id>", methods=["DELETE"])
@token_required
def delete_category(current_user, category_id):
    category = Category.query.filter_by(
        category_id=category_id,
        user_id=current_user.user_id
    ).first()

    if not category:
        return jsonify({"error": "Category not found"}), 404

    # Check if category is used by any budget plan
    from app.models.budget_plan_model import BudgetPlan
    in_plans = BudgetPlan.query.filter_by(category_id=category_id, user_id=current_user.user_id).first()
    if in_plans:
        return jsonify({
            "error": "category_in_use",
            "message": "Cannot delete category because it is used in budget plans"
        }), 409

    # Check if category is used by any expense
    from app.models.expense_model import Expense
    in_expenses = Expense.query.filter_by(category_id=category_id, user_id=current_user.user_id).first()
    if in_expenses:
        return jsonify({
            "error": "category_in_use",
            "message": "Cannot delete category because it is used in expenses"
        }), 409

    db.session.delete(category)
    db.session.commit()

    return jsonify({"message": "category_deleted"}), 200