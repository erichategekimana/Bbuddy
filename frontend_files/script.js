/* --------------------------
   SECTION SELECTORS
--------------------------- */
const loginPage = document.getElementById("login-page");
const registerPage = document.getElementById("register-page");
const app = document.getElementById("app");
const homeSection = document.getElementById("home-section");
const dashboardSection = document.getElementById("dashboard-section");
const createPlanSection = document.getElementById("create-plan-section");
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

/* HOME PAGE ELEMENTS */
const quoteElement = document.getElementById("quote");
const planAmount = document.getElementById("plan-amount");
const planRemaining = document.getElementById("plan-remaining");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");
const totalPlansElement = document.getElementById("total-plans");
const totalExpensesElement = document.getElementById("total-expenses");
const totalCategoriesElement = document.getElementById("total-categories");

/* ADD EXPENSE */
const expenseCategory = document.getElementById("expense-category");
const otherCategoryInput = document.getElementById("other-category");
const expenseAmount = document.getElementById("expense-amount");
const expenseDate = document.getElementById("expense-date");

/* SETTINGS PANEL */
const settingsPanel = document.getElementById("settings-panel");
const settingsBtn = document.getElementById("settings-btn");
const closeSettings = document.getElementById("close-settings");
const settingsName = document.getElementById("settings-name");
const settingsPic = document.getElementById("settings-pic");
const themeSwitcher = document.getElementById("theme-switcher");

/* BACKEND API BASE URL */
const API = "/api";

/* AUTH TOKEN */
let authToken = localStorage.getItem("authToken") || null;
let currentUser = null;
let userCategories = [];
let userBudgetPlans = [];
let userExpenses = [];

/* --------------------------
   API HELPER FUNCTIONS
--------------------------- */
function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
    };
}

async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: getAuthHeaders(),
            ...options
        });
        
        if (response.status === 401) {
            logout();
            return null;
        }
        
        return response;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

function logout() {
    localStorage.removeItem("authToken");
    authToken = null;
    currentUser = null;
    showPage(loginPage);
    alert("Session expired. Please login again.");
}

/* --------------------------
   PAGE/SECTION NAVIGATION
--------------------------- */
function showPage(page) {
    loginPage.classList.add("hidden");
    registerPage.classList.add("hidden");
    app.classList.add("hidden");
    page.classList.remove("hidden");
}

function showSection(section) {
    // Hide all sections
    homeSection.classList.add("hidden");
    dashboardSection.classList.add("hidden");
    createPlanSection.classList.add("hidden");
    addExpenseSection.classList.add("hidden");
    
    // Remove active class from all nav buttons
    navButtons.forEach(btn => btn.classList.remove("active"));
    
    // Show the selected section
    section.classList.remove("hidden");
    
    // Add active class to corresponding nav button
    const activeBtn = Array.from(navButtons).find(btn => 
        btn.getAttribute("data-page") === section.id
    );
    if (activeBtn) {
        activeBtn.classList.add("active");
    }
}

/* --------------------------
   NAVIGATION HANDLERS
--------------------------- */
showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    showPage(registerPage);
});

showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    showPage(loginPage);
});

navButtons.forEach(button => {
    button.addEventListener("click", () => {
        const page = button.getAttribute("data-page");
        switch(page) {
            case "home-section":
                showSection(homeSection);
                loadHomeData();
                break;
            case "dashboard-section":
                showSection(dashboardSection);
                loadExpenses();
                break;
            case "create-plan-section":
                showSection(createPlanSection);
                // Will implement later
                break;
            case "add-expense-section":
                showSection(addExpenseSection);
                loadCategories();
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

        if (!res.ok) {
            alert("Login failed: " + (data.error || "Unknown error"));
            return;
        }

        authToken = data.access_token;
        localStorage.setItem("authToken", data.access_token);

        showPage(app);
        showSection(homeSection);

        // Load all initial data for home section
        await loadHomeData();

        alert("Logged in successfully!");
    } catch (err) {
        alert("Login error: " + err.message);
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

        if (!res.ok) {
            alert("Registration failed: " + (data.error || "Unknown error"));
            return;
        }

        alert("Registration successful! Please log in.");
        registerForm.reset();
        showPage(loginPage);
    } catch (err) {
        alert("Registration error: " + err.message);
    }
});

/* --------------------------
   HOME SECTION DATA LOADING
--------------------------- */
async function loadHomeData() {
    await Promise.all([
        loadQuote(),
        loadBudgetPlans(),
        loadCategories(),
        loadExpensesForStats()
    ]);
    updateHomeDisplay();
}

function updateHomeDisplay() {
    updateBudgetPlanDisplay();
    updateQuickStats();
}

/* --------------------------
   BUDGET PLANS
--------------------------- */
async function loadBudgetPlans() {
    try {
        const res = await apiCall(`${API}/budget_plans/budget_plans`);
        if (res && res.ok) {
            userBudgetPlans = await res.json();
        }
    } catch (error) {
        console.error('Failed to load budget plans:', error);
    }
}

function updateBudgetPlanDisplay() {
    if (userBudgetPlans.length > 0) {
        const plan = userBudgetPlans[0]; // Show first plan for now
        
        // Update amounts
        planAmount.textContent = `₣${parseFloat(plan.amount).toFixed(2)}`;
        
        const spent = parseFloat(plan.spent || 0);
        const remaining = parseFloat(plan.amount) - spent;
        planRemaining.textContent = `₣${remaining.toFixed(2)}`;
        
        // Update progress bar
        const spentPercentage = (spent / parseFloat(plan.amount)) * 100;
        progressFill.style.width = `${Math.min(spentPercentage, 100)}%`;
        progressText.textContent = `${spentPercentage.toFixed(1)}% spent`;
        
        // Change progress bar color based on usage
        if (spentPercentage > 80) {
            progressFill.style.background = 'var(--danger)';
        } else if (spentPercentage > 60) {
            progressFill.style.background = 'var(--warning)';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, var(--success), var(--primary))';
        }
    } else {
        planAmount.textContent = "₣0.00";
        planRemaining.textContent = "₣0.00";
        progressFill.style.width = "0%";
        progressText.textContent = "No budget plan";
    }
}

/* --------------------------
   QUICK STATS
--------------------------- */
function updateQuickStats() {
    // Update plan count
    totalPlansElement.textContent = userBudgetPlans.length;
    
    // Update expense count
    totalExpensesElement.textContent = userExpenses.length;
    
    // Update category count
    totalCategoriesElement.textContent = userCategories.length;
}

/* --------------------------
   LOAD EXPENSES FOR STATS
--------------------------- */
async function loadExpensesForStats() {
    try {
        const res = await apiCall(`${API}/expenses/expenses`);
        if (res && res.ok) {
            userExpenses = await res.json();
        }
    } catch (error) {
        console.error('Failed to load expenses:', error);
    }
}

/* --------------------------
   LOAD CATEGORIES
--------------------------- */
async function loadCategories() {
    try {
        const res = await apiCall(`${API}/categories/categories`);
        if (res && res.ok) {
            userCategories = await res.json();
            updateCategoryDropdown();
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

function updateCategoryDropdown() {
    // Clear existing options except the first one
    while (expenseCategory.options.length > 1) {
        expenseCategory.remove(1);
    }
    
    // Add categories from API
    userCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.category_id;
        option.textContent = category.name;
        expenseCategory.appendChild(option);
    });
    
    // Add "Other" option
    const otherOption = document.createElement('option');
    otherOption.value = "other";
    otherOption.textContent = "Other";
    expenseCategory.appendChild(otherOption);
}

/* --------------------------
   QUOTES
--------------------------- */
async function loadQuote() {
    try {
        const res = await fetch(`${API}/quotes/quote`);
        if (res.ok) {
            const data = await res.json();
            quoteElement.textContent = `"${data.quote}"`;
        } else {
            // Fallback quotes
            const fallbackQuotes = [
                "Take control of your finances, one expense at a time.",
                "The best time to start budgeting was yesterday. The second best time is now.",
                "A budget is telling your money where to go instead of wondering where it went.",
                "Financial freedom is available to those who learn about it and work for it."
            ];
            const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
            quoteElement.textContent = `"${randomQuote}"`;
        }
    } catch (error) {
        quoteElement.textContent = '"Take control of your finances, one expense at a time."';
    }
}

/* --------------------------
   ADD EXPENSE – CATEGORY HANDLING
--------------------------- */
expenseCategory.addEventListener("change", () => {
    if (expenseCategory.value === "other") {
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

    if (userBudgetPlans.length === 0) {
        alert("Please create a budget plan first before adding expenses.");
        return;
    }

    let categoryId;
    let categoryName;

    if (expenseCategory.value === "other") {
        // Create new category for "Other"
        if (!otherCategoryInput.value.trim()) {
            alert("Please enter a category name");
            return;
        }
        
        try {
            const res = await apiCall(`${API}/categories/categories`, {
                method: 'POST',
                body: JSON.stringify({ name: otherCategoryInput.value.trim() })
            });
            
            if (res && res.ok) {
                const newCategory = await res.json();
                categoryId = newCategory.category_id;
                categoryName = newCategory.name;
                
                // Reload categories to include the new one
                await loadCategories();
            } else {
                alert("Failed to create new category");
                return;
            }
        } catch (error) {
            alert("Error creating category: " + error.message);
            return;
        }
    } else {
        categoryId = parseInt(expenseCategory.value);
        const category = userCategories.find(cat => cat.category_id === categoryId);
        categoryName = category ? category.name : 'Unknown';
    }

    const body = {
        plan_id: userBudgetPlans[0].plan_id,
        category_id: categoryId,
        amount: parseFloat(expenseAmount.value),
        description: `Expense for ${categoryName}`
    };

    try {
        const res = await apiCall(`${API}/expenses/expenses`, {
            method: "POST",
            body: JSON.stringify(body)
        });

        if (res && res.ok) {
            alert(`Expense added successfully!`);
            expenseForm.reset();
            otherCategoryInput.classList.add("hidden");
            
            // Reload all data to reflect changes
            await loadHomeData();
        } else {
            const error = await res.json();
            alert("Failed to add expense: " + (error.message || "Unknown error"));
        }
    } catch (error) {
        alert("Error adding expense: " + error.message);
    }
});

/* --------------------------
   LOAD EXPENSES FOR DASHBOARD
--------------------------- */
async function loadExpenses() {
    try {
        const res = await apiCall(`${API}/expenses/expenses`);
        if (res && res.ok) {
            const expenses = await res.json();
            updateExpensesTable(expenses);
        }
    } catch (error) {
        console.error('Failed to load expenses:', error);
    }
}

function updateExpensesTable(expenses) {
    const tbody = document.querySelector('#expense-table tbody');
    tbody.innerHTML = '';
    
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        
        // Find category name
        const category = userCategories.find(cat => cat.category_id === expense.category_id);
        const categoryName = category ? category.name : 'Unknown';
        
        row.innerHTML = `
            <td>${categoryName}</td>
            <td>₣${expense.amount}</td>
            <td>${new Date(expense.expense_date).toLocaleDateString()}</td>
        `;
        
        tbody.appendChild(row);
    });
}

/* --------------------------
   SETTINGS PANEL
--------------------------- */
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
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove("dark");
        localStorage.setItem('theme', 'light');
    }
});

/* --------------------------
   PAGE LOAD
--------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    // Set default date to today
    const today = new Date();
    expenseDate.value = today.toISOString().split('T')[0];
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    themeSwitcher.value = savedTheme;
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    }
    
    if (authToken) {
        showPage(app);
        showSection(homeSection);
        loadHomeData();
    } else {
        showPage(loginPage);
    }
});