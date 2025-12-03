# Bbuddy app

Bbuddy is a personal budget managment app that help users to track thier expenses and how much they're spending based on thier budget. It use Gemini API to generate quotes for user to keep them insipered and motivated.

Is built with flask at the backend and javascript at the fronend to provide full control for the users by letting them control thier finances


## Features:

## Budget planning:
- Create custom budget plans with categories
- Set spending limits for specific time periods
- Visual progress tracking with color-coded indicators
- Real-time budget remaining calculations

## Smart Features
- It use Gemini 2.0 flash to generate motivation quote(AI Powered motivation quote)
- dark/light theme taggle
- quicky status dashboard
- color wornings(based on how much you're spending)
- Responsive settings panel

## Expense Tracking
- Data-based expenses
- Each expense depends on plan
- Categorize expense by categories

## Authentication and user managment system
- JWT is used to grant permission to the user(Secure login)
- Session-based authentication(1h)

## API Usage & Best Practices

External API used in this app was from Gemini (goggle generativeai) which give access to different gemini models including gemini-2.0-flash, gemini-1.5-pro, and latest version gemini-2.0-flash.

Internal API also used to connect this app with backend severs to provide better connection


Getting started with how to use Bbuddy publicly.

Prerequisites
1. Browser( to run web app)
2. Internet connection (for API calls)

Run:
Open your browser and inter: www.erictecj.tech


Deplayment and load balancing

















Project sturcture:

1. Frontend:  frontend_files
│   ├── README.md
│   ├── index.html
│   ├── script.js
│   └── styles.css

2. Backend: 
Bbuddy
│   ├── README.md
│   ├── app
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── database.py
│   │   ├── middleware
│   │   │   └── auth_middleware.py
│   │   ├── models
│   │   │   ├── __init__.py
│   │   │   ├── budget_plan_model.py
│   │   │   ├── category_model.py
│   │   │   ├── expense_model.py
│   │   │   └── user_model.py
│   │   ├── routes
│   │   │   ├── __init__.py
│   │   │   ├── auth_routes.py
│   │   │   ├── budget_plan_routes.py
│   │   │   ├── category_routes.py
│   │   │   ├── expense_routes.py
│   │   │   └── quotes_routes.py
│   │   ├── schemas.py
│   │   └── utils.py
│   ├── config.py
│   ├── run.py
│   └── servers.svip
