from ..database import db

class Category(db.Model):
    __tablename__ = 'categories'
    category_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)  # ← Add ondelete

    # Add passive_deletes=True since database handles cascade
    budget_plans = db.relationship('BudgetPlan', backref='category', lazy=True, cascade='all, delete-orphan', passive_deletes=True)
    expenses = db.relationship('Expense', backref='category', lazy=True, cascade='all, delete-orphan', passive_deletes=True)