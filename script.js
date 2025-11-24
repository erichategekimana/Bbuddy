/* --------------------------
   SECTION SELECTORS
--------------------------- */
const loginPage = document.getElementById("login-page");
const registerPage = document.getElementById("register-page");
const app = document.getElementById("app");
const homeSection = document.getElementById("home-section");
const dashboardSection = document.getElementById("dashboard-section");
const addExpenseSection = document.getElementById("add-expense-section");

/* NAV BUTTONS */
const navButtons = document.querySelectorAll(".nav-btn");

/* FORMS */
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const expenseForm = document.getElementById("expense-form");

/* AUTH SWITCH LINKS */
const showRegisterLink = document.getElementById("show-register");
const showLoginLink = document.getElementById("show-login");

/* LOGIN FIELDS */
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");

/* REGISTER FIELDS */
const regUsername = document.getElementById("reg-username");
const regEmail = document.getElementById("reg-email");
const regPassword = document.getElementById("reg-password");

/* HOME PAGE */
const quoteElement = document.getElementById("quote");
const planAmount = document.getElementById("plan-amount");
const planRemaining = document.getElementById("plan-remaining");

/* ADD EXPENSE */
const expenseCategory = document.getElementById("expense-category");
const otherCategoryInput = document.getElementById("other-category");
const expenseAmount = document.getElementById("expense-amount");
const expenseDate = document.getElementById("expense-date");

/* SETTINGS PANEL */
const settingsPanel = document.getElementById("settings-panel");
const settingsBtn = document.getElementById("settings-btn"); // Now this exists!
const closeSettings = document.getElementById("close-settings");
const settingsName = document.getElementById("settings-name");
const settingsPic = document.getElementById("settings-pic");
const themeSwitcher = document.getElementById("theme-switcher");

/* BACKEND API BASE URL */
const API = "http://10.227.124.219:5000/api";

/* AUTH TOKEN */
let authToken = localStorage.getItem("authToken") || null;

/* --------------------------
   PAGE/SECTION NAVIGATION
--------------------------- */
function showPage(page) {
    // Hide all pages first
    loginPage.classList.add("hidden");
    registerPage.classList.add("hidden");
    app.classList.add("hidden");
    
    // Show the selected page
    page.classList.remove("hidden");
}

function showSection(section) {
    // Hide all sections first
    homeSection.classList.add("hidden");
    dashboardSection.classList.add("hidden");
    addExpenseSection.classList.add("hidden");
    
    // Show the selected section
    section.classList.remove("hidden");
}

/* --------------------------
   NAVIGATION HANDLERS
--------------------------- */
// Navigation between login and register
showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    showPage(registerPage);
});

showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    showPage(loginPage);
});

// Navigation between app sections
navButtons.forEach(button => {
    button.addEventListener("click", () => {
        const page = button.getAttribute("data-page");
        switch(page) {
            case "home-section":
                showSection(homeSection);
                break;
            case "dashboard-section":
                showSection(dashboardSection);
                break;
            case "add-expense-section":
                showSection(addExpenseSection);
                break;
        }
    });
});

/* --------------------------
   LOGIN
--------------------------- */
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
        email: loginEmail.value,
        password: loginPassword.value
    };

    try {
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (res.ok) {
            authToken = data.access_token;
            localStorage.setItem("authToken", data.access_token);
            
            // Show the main app
            showPage(app);
            showSection(homeSection);
            loadQuote();
            loadPlan();
            alert("Logged in successfully!");
        } else {
            alert("Login failed: " + (data.message || "Unknown error"));
        }
    } catch (error) {
        alert("Login error: " + error.message);
    }
});

/* --------------------------
   REGISTER
--------------------------- */
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
        username: regUsername.value,
        email: regEmail.value,
        password: regPassword.value
    };

    try {
        const res = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (res.ok) {
            alert("Registration successful! Please log in.");
            showPage(loginPage);
            // Clear form
            registerForm.reset();
        } else {
            alert("Registration failed: " + (data.message || "Unknown error"));
        }
    } catch (error) {
        alert("Registration error: " + error.message);
    }
});

/* --------------------------
   LOAD QUOTE
--------------------------- */
async function loadQuote() {
    try {
        const res = await fetch(`${API}/quotes/random`);
        if (res.ok) {
            const data = await res.json();
            quoteElement.textContent = `"${data.quote}"`;
        } else {
            quoteElement.textContent = '"The best time to start budgeting was yesterday. The second best time is now."';
        }
    } catch (error) {
        quoteElement.textContent = '"Take control of your finances, one expense at a time."';
    }
}

/* --------------------------
   LOAD BUDGET PLAN (STATIC FOR NOW)
--------------------------- */
function loadPlan() {
    planAmount.textContent = "₣50,000";
    planRemaining.textContent = "₣31,000";
}

/* --------------------------
   ADD EXPENSE – CATEGORY HANDLING
--------------------------- */
expenseCategory.addEventListener("change", () => {
    if (expenseCategory.value === "Other") {
        otherCategoryInput.classList.remove("hidden");
        otherCategoryInput.required = true;
    } else {
        otherCategoryInput.classList.add("hidden");
        otherCategoryInput.required = false;
        otherCategoryInput.value = "";
    }
});

/* --------------------------
   ADD EXPENSE – SUBMIT
--------------------------- */
expenseForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const category = expenseCategory.value === "Other" 
        ? otherCategoryInput.value 
        : expenseCategory.value;

    const body = {
        category,
        amount: parseFloat(expenseAmount.value),
        date: expenseDate.value
    };

    try {
        // For now, just show an alert and reset the form
        alert(`Expense added: ${category} - ₣${body.amount} on ${body.date}`);
        expenseForm.reset();
        otherCategoryInput.classList.add("hidden");
    } catch (error) {
        alert("Error adding expense: " + error.message);
    }
});

/* --------------------------
   SETTINGS PANEL
--------------------------- */
// Settings button now works!
settingsBtn.addEventListener("click", () => {
    settingsPanel.classList.remove("hidden");
});

closeSettings.addEventListener("click", () => {
    settingsPanel.classList.add("hidden");
});

/* --------------------------
   DARK MODE TOGGLE
--------------------------- */
themeSwitcher.addEventListener("change", (e) => {
    if (e.target.value === "dark") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
});

/* --------------------------
   PAGE LOAD
--------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    // Set default date to today
    expenseDate.valueAsDate = new Date();
    
    if (authToken) {
        showPage(app);
        showSection(homeSection);
        loadQuote();
        loadPlan();
    } else {
        showPage(loginPage);
    }
});