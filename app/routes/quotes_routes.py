import requests
import random
from flask import Blueprint, jsonify
from config import GEMINI_API_KEY

quotes_bp = Blueprint('quotes', __name__)

# Updated model list with Gemini 2.5 options
MODEL_OPTIONS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",          # Latest stable
    "gemini-1.5-flash",          # Previous good option
]

# Fallback quotes
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


def get_gemini_quote(model_name):
    """Try to get a quote from Gemini API with given model"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
    
    print(f"DEBUG: Using model: {model_name}")
    print(f"DEBUG: API Key: {GEMINI_API_KEY[:8]}...")
    
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
    }
    
    # Simpler, cleaner prompt
    data = {
        "contents": [{
            "parts": [{
                "text": """Give me a short, motivational quote about personal finance, budgeting, or saving money. 
                Make it inspiring and practical. Keep it under 180 characters. 
                Return ONLY the quote text, nothing else."""
            }]
        }],
        "generationConfig": {
            "temperature": 0.8,  # Slightly more creative
            "maxOutputTokens": 50,
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=data, timeout=5)
        print(f"DEBUG: Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"DEBUG: Error: {response.text[:100]}")
            return None
            
        response_json = response.json()
        
        # Extract quote - Gemini 2.x might have different structure
        quote = None
        
        # Try different response structures
        if "candidates" in response_json and response_json["candidates"]:
            candidate = response_json["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                quote = candidate["content"]["parts"][0]["text"]
        
        # Alternative structure
        elif "text" in response_json:
            quote = response_json["text"]
        
        # Direct response
        elif "response" in response_json:
            quote = response_json["response"]
        
        if quote:
            quote = quote.strip()
            # Clean up quotes
            if len(quote) > 2 and quote[0] == '"' and quote[-1] == '"':
                quote = quote[1:-1]
            print(f"DEBUG: Success! Quote: {quote}")
            return quote
            
        print(f"DEBUG: Unexpected response: {response_json}")
        return None
        
    except Exception as e:
        print(f"DEBUG: Error with {model_name}: {str(e)[:100]}")
        return None

@quotes_bp.route("/quote", methods=["GET"])
def get_quote():
    """Get a motivational quote - try Gemini first, then fallback"""
    
    print("\n" + "="*50)
    print("DEBUG: /quote endpoint called")
    
    # Try each model until one works
    for model_name in MODEL_OPTIONS:
        print(f"\nDEBUG: Trying model: {model_name}")
        quote = get_gemini_quote(model_name)
        if quote:
            print(f"DEBUG: ✓ Success with {model_name}")
            return jsonify({
                "quote": quote, 
                "source": "gemini",
                "model": model_name
            }), 200
        else:
            print(f"DEBUG: ✗ Failed with {model_name}")
    
    # If all models fail, use fallback
    print("\nDEBUG: All models failed, using fallback")
    random_quote = random.choice(FALLBACK_QUOTES)
    return jsonify({
        "quote": random_quote, 
        "source": "fallback",
        "model": "none"
    }), 200

# TEST endpoint to check available models
@quotes_bp.route("/test-models", methods=["GET"])
def test_models():
    """Test which models are available"""
    test_url = "https://generativelanguage.googleapis.com/v1beta/models"
    headers = {"x-goog-api-key": GEMINI_API_KEY}
    
    try:
        response = requests.get(test_url, headers=headers)
        models = response.json().get("models", [])
        
        model_names = [model["name"] for model in models]
        return jsonify({
            "available_models": model_names,
            "total": len(model_names)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500