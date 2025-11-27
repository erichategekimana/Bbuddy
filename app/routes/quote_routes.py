import requests
from flask import Blueprint, jsonify
from config import GEMINI_API_KEY

quote_bp = Blueprint('quote', __name__)

@quote_bp.route("/quote", methods=["GET"])
def get_quote():
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText"
    headers = {"Content-Type": "application/json"}
    data = {
        "contents": [{
            "parts": [{
                "text": "Give me one short powerful finance quote."
            }]
        }]
    }

    response = requests.post(url, headers=headers, json=data,
                             params={"key": GEMINI_API_KEY})

    if response.status_code != 200:
        return jsonify({"error": "Gemini request failed"}), 500

    quote = response.json()["candidates"][0]["content"]["parts"][0]["text"]

    return jsonify({"quote": quote})
