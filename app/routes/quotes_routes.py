import requests
import random
from flask import Blueprint, jsonify
# Assuming config.py has a variable named GEMINI_API_KEY
from config import GEMINI_API_KEY 

quote_bp = Blueprint('quote', __name__)
MODEL_NAME = "gemini-2.5-flash"


# Fallback quotes in case Gemini API fails
FALLBACK_QUOTES = [
    "Take control of your finances, one expense at a time.",
    "The best time to start budgeting was yesterday. The second best time is now.",
    "A budget is telling your money where to go instead of wondering where it went.",
    "Financial freedom is available to those who learn about it and work for it.",
    "Don't tell your money where to go. Tell it where you want to go and let it take you there.",
    "Budgeting is not about restricting yourself, it's about empowering yourself.",
    "Every dollar you save today is a dollar you can invest in your future.",
    "Small amounts saved daily add up to huge investments over time.",
    "The goal isn't more money. The goal is living life on your terms.",
    "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make."
]


@quote_bp.route("/quote", methods=["GET"])
def get_quote():
    # 1. FIX: Use f-string and the correct 'generateContent' endpoint
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent"
    
    # 2. IMPROVEMENT: Pass API key in the header
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY 
    }
    
    data = {
        "contents": [{
            "parts": [{
                "text": """Give me a short, motivational quote about personal finance, budgeting, or saving money. 
                Make it inspiring and practical. Keep it under 100 characters. 
                Return ONLY the quote text, nothing else."""
            }]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 100,
        }
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        response_json = response.json()
        print(f"DEBUG: Full response: {response_json}")  # Debug
        
        # Try to extract quote - Gemini REST API can have different structures
        quote = None
        
        # Structure 1: Direct response
        if "candidates" in response_json and response_json["candidates"]:
            candidate = response_json["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                quote = candidate["content"]["parts"][0]["text"]
        
        # Structure 2: Nested differently
        elif "contents" in response_json and response_json["contents"]:
            content = response_json["contents"][0]
            if "parts" in content and content["parts"]:
                quote = content["parts"][0]["text"]
        
        # Clean up if we got a quote
        if quote:
            quote = quote.strip()
            # Remove surrounding quotes
            if (quote.startswith('"') and quote.endswith('"')) or \
               (quote.startswith("'") and quote.endswith("'")):
                quote = quote[1:-1]
            return jsonify({"quote": quote}), 200
        else:
            print(f"DEBUG: Could not extract quote from: {response_json}")
            return fallback_quote()
            
    except Exception as e:
        print(f"Error getting Gemini quote: {e}")
        return fallback_quote()
    

def fallback_quote():
    random_quote = random.choice(FALLBACK_QUOTES)
    return jsonify({"quote": random_quote}), 200