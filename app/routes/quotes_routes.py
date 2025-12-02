from flask import Blueprint, jsonify, current_app
import google.generativeai as genai
import os
import random

quotes_bp = Blueprint("quotes", __name__)

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

def get_gemini_quote():
    """Get a motivational quote from Gemini API"""
    try:
        # Get API key from environment variable
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            print("GEMINI_API_KEY environment variable not set")
            return None
            
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Create the model
        model = genai.GenerativeModel('gemini-pro')
        
        # Create prompt for financial/budgeting quote
        prompt = """Give me a short, motivational quote about personal finance, budgeting, or saving money. 
        Make it inspiring and practical. Keep it under 120 characters. 
        Return ONLY the quote text, nothing else."""
        
        # Generate response
        response = model.generate_content(prompt)
        
        # Extract and clean the quote
        quote = response.text.strip()
        
        # Remove quotes if Gemini wrapped it in quotes
        if quote.startswith('"') and quote.endswith('"'):
            quote = quote[1:-1]
        elif quote.startswith("'") and quote.endswith("'"):
            quote = quote[1:-1]
            
        # Ensure it's not empty
        if quote and len(quote) > 10:
            return quote
        else:
            return None
            
    except Exception as e:
        print(f"Error getting Gemini quote: {e}")
        return None

@quotes_bp.route("/quote", methods=["GET"])
def get_quote():
    """Get a random motivational quote"""
    try:
        # Try to get quote from Gemini
        gemini_quote = get_gemini_quote()
        
        if gemini_quote:
            return jsonify({
                "quote": gemini_quote,
                "source": "gemini"
            }), 200
        else:
            # Fallback to random local quote
            random_quote = random.choice(FALLBACK_QUOTES)
            return jsonify({
                "quote": random_quote,
                "source": "fallback"
            }), 200
            
    except Exception as e:
        print(f"Error in get_quote route: {e}")
        # Always return something even if there's an error
        random_quote = random.choice(FALLBACK_QUOTES)
        return jsonify({
            "quote": random_quote,
            "source": "error_fallback"
        }), 200