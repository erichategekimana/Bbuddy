import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY")
    JWT_SECRET = os.environ.get("JWT_SECRET")
    JWT_ALGORITHM = "HS256"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)  # 1 hour default
    SQLALCHEMY_DATABASE_URI = os.environ.get("SQLALCHEMY_DATABASE_URI")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
