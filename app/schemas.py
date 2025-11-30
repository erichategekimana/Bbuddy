from pydantic import BaseModel, EmailStr, constr, condecimal, validator
from typing import Optional
from datetime import date

class RegisterSchema(BaseModel):
    username: constr(min_length=3, max_length=255)
    email: EmailStr
    password: constr(min_length=6)

class LoginSchema(BaseModel):
    email: EmailStr
    password: constr(min_length=1)

class CreatePlanSchema(BaseModel):
    category_id: int
    amount: float  # ← Receives JavaScript numbers properly
    start_date: date
    end_date: date

    @validator("amount")
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("amount must be greater than 0")
        return v

    @validator("end_date")
    def end_after_start(cls, v, values):
        if "start_date" in values and v < values["start_date"]:
            raise ValueError("end_date must be on or after start_date")
        return v

class AddExpenseSchema(BaseModel):
    plan_id: int
    category_id: int
    amount: condecimal(gt=0)
    description: constr(min_length=1, max_length=255)  # Changed to required
    expense_date: date  # ADD THIS - user will provide date

# NEW SCHEMAS NEEDED:

class CategorySchema(BaseModel):
    name: constr(min_length=1, max_length=100)
    description: Optional[constr(max_length=500)] = None

class UpdateProfileSchema(BaseModel):
    username: Optional[constr(min_length=3, max_length=255)] = None
    email: Optional[EmailStr] = None

class ChangePasswordSchema(BaseModel):
    old_password: constr(min_length=1)
    new_password: constr(min_length=6)

class UpdatePictureSchema(BaseModel):
    profile_picture_url: constr(min_length=1)

class UpdateBudgetPlanSchema(BaseModel):
    category_id: Optional[int] = None
    amount: Optional[condecimal(gt=0)] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    @validator("end_date")
    def end_after_start(cls, v, values):
        if "start_date" in values and v and values["start_date"] and v < values["start_date"]:
            raise ValueError("end_date must be >= start_date")
        return v

class UpdateExpenseSchema(BaseModel):
    plan_id: int
    category_id: int
    amount: condecimal(gt=0)
    description: constr(min_length=1, max_length=255)  # Changed to required
    expense_date: date