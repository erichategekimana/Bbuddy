# Bbuddy app

Bbuddy is a personal budget managment app that help users to track thier expenses and how much they're spending based on thier budget. It use Gemini API to generate quotes for user to keep them insipered and motivated.

Is built with flask at the backend and javascript at the fronend to provide full control for the users by letting them control thier finances


Video link:  https://drive.google.com/file/d/1hQnNA6dBNWMm3wOy_JmE46UJx_ETx6s6/view?usp=sharing


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

External API used in this app was from Gemini (Google generativeai), which give access to different gemini models including gemini-2.0-flash, gemini-1.5-pro, and the latest version Gemini-2.0-flash.

Internal API also used to connect this app with backend severs to provide better connection


Getting started with how to use Bbuddy publicly.

# Prerequisites
1. Browser( to run web app)
2. Internet connection (for API calls)

## Run:
Open your browser and inter: www.erictecj.tech


## Deployment and load balancing

N.B: In the beginning of this project, Bbuddy was deployed on two servers(web-01 and web-02) with a load balancer to control and distribute traffic
     but after creating a MySQL database for storing user data, even if I created a replication user so that both nodes can share the same data(synchronize data between web-01 and web-02)
     but it doesn't synchronize in real time! I decided to use only web-01 and load balancer to avoid this.
# How Bbuddy was deployed

1. Setup project repo:
   This step help to get every modification easy without copying and pasting, you just pull
   - clone the repository to all nodes, including the load balancer
2. Setup servers:
   - Web-01: Installing Nginx, python3 and all its libraries, Gunicorn, and setup flask web framework
   - Lb-01: Install nginx, setup frontend files, config HTTPS for secure connection
3. Build the frontend:
   - This step include creating html, css, and java script for better user interface
   - On lb-01, I pulled and copy those files into:
<img width="303" height="210" alt="image" src="https://github.com/user-attachments/assets/91213376-6729-44f0-b3d0-5cff319129e9" />
4. Request Gamini API from google studio
5. Connect and verfy that frontend and backend can work together(make API calls successfully)
   - This step includes testing from servers (http://98.94.26.92:5000/api/quotes/quote)
7. Testing from a web browser
   - use DNS in browser
   - Try on different divices
   - Test all functionality
|
|
|

Project structure:

1. Frontend: 
<img width="174" height="94" alt="Screenshot 2025-12-03 115919" src="https://github.com/user-attachments/assets/47811ce5-0da3-4df9-b4fa-3620ec12cc8e" />


2. Backend: 

<img width="457" height="751" alt="image" src="https://github.com/user-attachments/assets/9632f948-d617-4179-801e-1a9df3922f53" />

# License
Bbuddy project is licensed under the MIT License.

# Commendation
Google studion: Bbuddy app uses Gemini-2.0-flash model to generate qoutes for users to motivate and insipire them to keep in the plan!

## contribution and support
. Clone this repository.
. Create a feature branch
. Commit and push your changes.

If you have questions or support, open an issue in this repository or use [erichategekiman](https://github.com/erichategekimana)




