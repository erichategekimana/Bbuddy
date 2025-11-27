from ..database import db

class Category(db.Model):
    __tablename__ = 'categories'
    category_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)

    budget_plans = db.relationship('BudgetPlan', backref='category', lazy=True)
    expenses = db.relationship('Expense', backref='category', lazy=True)
