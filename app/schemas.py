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
    amount: condecimal(gt=0)
    start_date: date
    end_date: date

    @validator("end_date")
    def end_after_start(cls, v, values):
        if "start_date" in values and v < values["start_date"]:
            raise ValueError("end_date must be >= start_date")
        return v

class AddExpenseSchema(BaseModel):
    plan_id: int
    category_id: int
    amount: condecimal(gt=0)
    description: Optional[constr(max_length=255)] = None
