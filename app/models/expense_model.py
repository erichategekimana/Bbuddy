from ..database import db
from datetime import datetime

class Expense(db.Model):
    __tablename__ = 'expenses'
    expense_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey('budget_plans.plan_id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.category_id'), nullable=False)
    amount = db.Column(db.Numeric(10,2), nullable=False)
    description = db.Column(db.String(255))
    expense_date = db.Column(db.DateTime, default=datetime.utcnow)
