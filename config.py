import os
from datetime import timedelta


class Config:
    SECRET_KEY = "This_is_my_secret_key"
    JWT_SECRET = "This_is_my_secret_key"
    JWT_ALGORITHM = "HS256"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)  # 1 hour default
    SQLALCHEMY_DATABASE_URI = "mysql+mysqlconnector://Bbuddy_user:Eric_123@127.0.0.1:3306/Bbuddy_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GEMINI_API_KEY = "AIzaSyB0Ed8oBdqwIgLfjn4uzXreH4xZu8sXWWo"

GEMINI_API_KEY = ""
