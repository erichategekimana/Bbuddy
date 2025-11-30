from flask import Blueprint, request, jsonify, g
from app.models.expense_model import Expense
from app.models.budget_plan_model import BudgetPlan
from app import db
from app.models.category_model import Category
from app.utils import db_commit_or_rollback, validate_json
from app.schemas import AddExpenseSchema
from ..auth import jwt_required
from decimal import Decimal

expenses_bp = Blueprint("expenses", __name__)

@expenses_bp.route("/expenses", methods=["POST"])
@jwt_required
@validate_json(AddExpenseSchema)
@db_commit_or_rollback
def add_expense(validated):
    user_id = g.current_user["user_id"]

    plan_id = validated.plan_id
    amount = Decimal(validated.amount)
    description = validated.description
    expense_date = validated.expense_date  # ADD THIS

    # Ensure plan belongs to this user
    plan = BudgetPlan.query.filter_by(plan_id=plan_id, user_id=user_id).first()
    if not plan:
        return jsonify({"error": "forbidden", "message": "Plan does not belong to this user"}), 403
    category_id = plan.category_id
    expense = Expense(
        user_id=user_id,
        plan_id=plan_id,
        category_id=category_id,        amount=amount,
        description=description,
        expense_date=expense_date  # ADD THIS
    )

    db.session.add(expense)
    db.session.flush()

    # Update plan spent safely
    plan.spent = plan.spent + amount

    return jsonify({
        "message": "expense_added",
        "expense_id": expense.expense_id
    }), 201

# get all expense

@expenses_bp.route("/expenses", methods=["GET"])
@jwt_required
def get_expenses():
    user_id = g.current_user["user_id"]
    
    # Join with categories to get category names
    expenses = db.session.query(Expense, Category).\
        join(Category, Expense.category_id == Category.category_id).\
        filter(Expense.user_id == user_id).\
        all()

    result = []
    for expense, category in expenses:
        result.append({
            "expense_id": expense.expense_id,
            "plan_id": expense.plan_id,
            "category_id": expense.category_id,
            "category_name": category.name,  # Add category name
            "amount": float(expense.amount),
            "description": expense.description,
            "expense_date": str(expense.expense_date)
        })

    return jsonify(result), 200

# Get expense for specific plan

@expenses_bp.route("expenses/<int:plan_id>", methods=["GET"])
@jwt_required
def get_expenses_by_plan(plan_id):
    user_id = g.current_user["user_id"]

    expenses = db.session.query(Expense, Category).\
        join(Category, Expense.category_id == Category.category_id).\
        filter(Expense.plan_id == plan_id, Expense.user_id == user_id).\
        all()

    result = []
    for expense, category in expenses:
        result.append({
            "expense_id": expense.expense_id,
            "category_id": expense.category_id,
            "category_name": category.name,  # Add category name
            "amount": float(expense.amount),
            "description": expense.description,
            "expense_date": str(expense.expense_date)
        })

    return jsonify(result), 200


# ========================= GET SINGLE EXPENSE =========================
@expenses_bp.route("/expenses/<int:expense_id>", methods=["GET"])
@jwt_required
def get_single_expense(expense_id):
    user_id = g.current_user["user_id"]

    expense = Expense.query.filter_by(expense_id=expense_id, user_id=user_id).first()

    if not expense:
        return jsonify({"error": "not_found", "message": "Expense not found"}), 404

    return jsonify({
        "expense_id": expense.expense_id,
        "plan_id": expense.plan_id,
        "category_id": expense.category_id,
        "amount": float(expense.amount),
        "description": expense.description,
        "expense_date": str(expense.expense_date)
    }), 200


# ========================= UPDATE EXPENSE =========================
@expenses_bp.route("/expenses/<int:expense_id>", methods=["PUT"])
@jwt_required
@db_commit_or_rollback
def update_expense(expense_id):
    user_id = g.current_user["user_id"]
    data = request.get_json()

    expense = Expense.query.filter_by(expense_id=expense_id, user_id=user_id).first()
    if not expense:
        return jsonify({"error": "not_found", "message": "Expense not found"}), 404
     # ADD THIS LINE to handle expense_date updates:
    if "expense_date" in data:
        expense.expense_date = data["expense_date"]

    # Restore old amount to plan.spent
    old_amount = expense.amount
    plan = BudgetPlan.query.filter_by(plan_id=expense.plan_id, user_id=user_id).first()
    plan.spent = plan.spent - old_amount

    # Apply updates
    expense.category_id = data.get("category_id", expense.category_id)
    expense.description = data.get("description", expense.description)

    if "amount" in data:
        new_amount = Decimal(data["amount"])
        expense.amount = new_amount
        plan.spent = plan.spent + new_amount

    db.session.flush()

    return jsonify({"message": "expense_updated"}), 200


# ========================= DELETE EXPENSE =========================
@expenses_bp.route("/expenses/<int:expense_id>", methods=["DELETE"])
@jwt_required
@db_commit_or_rollback
def delete_expense(expense_id):
    user_id = g.current_user["user_id"]

    expense = Expense.query.filter_by(expense_id=expense_id, user_id=user_id).first()

    if not expense:
        return jsonify({"error": "not_found", "message": "Expense not found"}), 404

    # Deduct from plan.spent
    plan = BudgetPlan.query.filter_by(plan_id=expense.plan_id, user_id=user_id).first()
    plan.spent = plan.spent - expense.amount

    db.session.delete(expense)

    return jsonify({"message": "expense_deleted"}), 200
