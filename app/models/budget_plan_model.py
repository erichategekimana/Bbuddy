from ..database import db
from datetime import datetime

class BudgetPlan(db.Model):
    __tablename__ = 'budget_plans'
    plan_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)  # ← Add ondelete
    category_id = db.Column(db.Integer, db.ForeignKey('categories.category_id', ondelete='CASCADE'), nullable=False)  # ← Add ondelete
    amount = db.Column(db.Numeric(10,2), nullable=False)
    spent = db.Column(db.Numeric(10,2), default=0)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Add cascade and passive_deletes
    expenses = db.relationship('Expense', backref='plan', lazy=True, cascade='all, delete-orphan', passive_deletes=True)