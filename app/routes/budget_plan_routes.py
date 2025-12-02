from flask import Blueprint, request, jsonify
from app.models.budget_plan_model import BudgetPlan
from app import db
from flask import g
from app.utils import validate_json
from ..auth import jwt_required
from ..utils import db_commit_or_rollback
from app.schemas import CreatePlanSchema
from app.schemas import RegisterSchema, LoginSchema

budget_plans_bp = Blueprint("budget_plans", __name__)

@budget_plans_bp.route("/budget_plans", methods=["POST"])
@validate_json(CreatePlanSchema)
@jwt_required
@db_commit_or_rollback
def create_plan(validated):
    user_id = g.current_user.get("user_id")

    plan = BudgetPlan(
        user_id=user_id,
        category_id=validated.category_id,
        amount=validated.amount,
        start_date=validated.start_date,
        end_date=validated.end_date
    )
    db.session.add(plan)
    db.session.flush()
    return jsonify({"message":"plan_created", "plan_id": plan.plan_id}), 201

@budget_plans_bp.route("/budget_plans", methods=["GET"])
@jwt_required
def get_plans():
    user_id = g.current_user.get("user_id")

    plans = BudgetPlan.query.filter_by(user_id=user_id).all()

    result = []
    for p in plans:
        result.append({
            "plan_id": p.plan_id,
            "category_id": p.category_id,
            "amount": float(p.amount),
            "spent": float(p.spent),
            "start_date": str(p.start_date),
            "end_date": str(p.end_date)
        })

    return jsonify(result)



@budget_plans_bp.route("/budget_plans/<int:plan_id>", methods=["GET"])
@jwt_required
def get_single_plan(plan_id):
    user_id = g.current_user.get("user_id")

    plan = BudgetPlan.query.filter_by(plan_id=plan_id, user_id=user_id).first()

    if not plan:
        return jsonify({"error": "not_found", "message": "Plan not found"}), 404

    return jsonify({
        "plan_id": plan.plan_id,
        "category_id": plan.category_id,
        "amount": float(plan.amount),
        "spent": float(plan.spent),
        "start_date": str(plan.start_date),
        "end_date": str(plan.end_date)
    }), 200



@budget_plans_bp.route("/budget_plans/<int:plan_id>", methods=["PUT"])
@jwt_required
@db_commit_or_rollback
def update_plan(plan_id):
    user_id = g.current_user.get("user_id")
    plan = BudgetPlan.query.filter_by(plan_id=plan_id, user_id=user_id).first()

    if not plan:
        return jsonify({"error": "not_found", "message": "Plan not found"}), 404

    data = request.json

    # Update only allowed fields
    if "category_id" in data:
        plan.category_id = data["category_id"]
    if "amount" in data:
        plan.amount = data["amount"]
    if "start_date" in data:
        plan.start_date = data["start_date"]
    if "end_date" in data:
        plan.end_date = data["end_date"]

    return jsonify({"message": "plan_updated"}), 200


@budget_plans_bp.route("/budget_plans/<int:plan_id>", methods=["DELETE"])
@jwt_required
@db_commit_or_rollback
def delete_plan(plan_id):
    user_id = g.current_user.get("user_id")
    
    # Get the plan (this will load expenses due to relationship)
    plan = BudgetPlan.query.filter_by(plan_id=plan_id, user_id=user_id).first()

    if not plan:
        return jsonify({"error": "not_found", "message": "Plan not found"}), 404

    # Get expense count from the relationship
    expense_count = len(plan.expenses)
    
    # Database will handle cascade delete of expenses
    db.session.delete(plan)
    
    return jsonify({
        "message": "plan_deleted",
        "plan_id": plan_id,
        "expenses_deleted_count": expense_count
    }), 200

@budget_plans_bp.route("/budget_plans/<int:plan_id>/remaining", methods=["GET"])
@jwt_required
def get_remaining(plan_id):
    user_id = g.current_user.get("user_id")
    plan = BudgetPlan.query.filter_by(plan_id=plan_id, user_id=user_id).first()

    if not plan:
        return jsonify({"error": "not_found", "message": "Plan not found"}), 404

    remaining = float(plan.amount) - float(plan.spent)

    return jsonify({
        "plan_id": plan_id,
        "remaining": remaining
    }), 200

