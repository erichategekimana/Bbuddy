from werkzeug.security import generate_password_hash, check_password_hash
from flask import Blueprint, jsonify, request
from ..database import db
from ..models.user_model import User
from ..database import db
from ..schemas import RegisterSchema, LoginSchema
from ..utils import validate_json
from ..auth import hash_password, verify_password, create_access_token, jwt_required

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
@validate_json(RegisterSchema)
def register(validated):
    username = validated.username
    email = validated.email
    password = validated.password

    if User.query.filter((User.email == email) | (User.username == username)).first():
        return jsonify({"error": "user_exists"}), 409

    hashed = hash_password(password)
    user = User(username=username, email=email, password_hash=hashed)
    db.session.add(user)
    db.session.commit()

    token = create_access_token({"user_id": user.user_id})
    return jsonify({"message": "registered", "user_id": user.user_id, "access_token": token}), 201

@auth_bp.route("/login", methods=["POST"])
@validate_json(LoginSchema)
def login(validated):
    email = validated.email
    password = validated.password

    user = User.query.filter_by(email=email).first()
    if not user or not verify_password(user.password_hash, password):
        return jsonify({"error": "invalid_credentials"}), 401

    token = create_access_token({"user_id": user.user_id})
    return jsonify({"message": "logged_in", "access_token": token, "user_id": user.user_id})


# update profile info(email, username)
@auth_bp.route("/update_profile", methods=["PUT"])
@jwt_required
def update_profile():
    user_id = g.current_user["user_id"]
    data = request.get_json()

    new_username = data.get("username")
    new_email = data.get("email")

    user = User.query.get(user_id)

    if new_username:
        # ensure unique username
        existing = User.query.filter(User.username == new_username, User.user_id != user_id).first()
        if existing:
            return jsonify({"error": "username_taken"}), 409
        user.username = new_username

    if new_email:
        # ensure unique email
        existing = User.query.filter(User.email == new_email, User.user_id != user_id).first()
        if existing:
            return jsonify({"error": "email_taken"}), 409
        user.email = new_email

    db.session.commit()

    return jsonify({"message": "profile_updated"}), 200

# change password

@auth_bp.route("/change_password", methods=["PUT"])
@jwt_required
def change_password():
    user_id = g.current_user["user_id"]
    data = request.get_json()

    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not old_password or not new_password:
        return jsonify({"error": "missing_fields"}), 400

    user = User.query.get(user_id)

    # verify old password
    if not verify_password(user.password_hash, old_password):
        return jsonify({"error": "incorrect_password"}), 401

    # update to new password
    user.password_hash = hash_password(new_password)
    db.session.commit()

    return jsonify({"message": "password_changed"}), 200

# upload profel pic

@auth_bp.route("/update_picture", methods=["PUT"])
@jwt_required
def update_picture():
    user_id = g.current_user["user_id"]
    data = request.get_json()

    picture_url = data.get("profile_picture_url")

    if not picture_url:
        return jsonify({"error": "missing_picture_url"}), 400

    user = User.query.get(user_id)
    user.profile_picture_url = picture_url

    db.session.commit()

    return jsonify({"message": "picture_updated"}), 200



# Add to your auth_routes.py

@auth_bp.route("/profile", methods=["GET"])
@jwt_required
def get_profile():
    user_id = g.current_user["user_id"]
    user = User.query.get(user_id)
    
    return jsonify({
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email,
        "profile_picture_url": user.profile_picture_url,
        "currency": user.currency
    }), 200

@auth_bp.route("/update_currency", methods=["PUT"])
@jwt_required
def update_currency():
    user_id = g.current_user["user_id"]
    data = request.get_json()
    
    currency = data.get("currency")
    if currency not in ['RWF', 'USD', 'EUR', 'CNY']:
        return jsonify({"error": "invalid_currency"}), 400
    
    user = User.query.get(user_id)
    user.currency = currency
    db.session.commit()
    
    return jsonify({"message": "currency_updated"}), 200


