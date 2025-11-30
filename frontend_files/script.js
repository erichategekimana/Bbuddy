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
const createPlanForm = document.getElementById("create-plan-form");

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
const planAmount = document.getElementById("plan-amount-display");;
const planRemaining = document.getElementById("plan-remaining");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");
const totalPlansElement = document.getElementById("total-plans");
const totalExpensesElement = document.getElementById("total-expenses");
const totalCategoriesElement = document.getElementById("total-categories");

/* CREATE PLAN ELEMENTS */
const planCategory = document.getElementById("plan-category");
const createNewCategoryCheckbox = document.getElementById("create-new-category");
const newCategoryGroup = document.getElementById("new-category-group");
const newCategoryName = document.getElementById("new-category-name");
const newCategoryDesc = document.getElementById("new-category-desc");
const planAmountInput = document.getElementById("plan-amount");
const planStartDate = document.getElementById("plan-start-date");
const planEndDate = document.getElementById("plan-end-date");
const planPreview = document.getElementById("plan-preview");
const previewCategory = document.getElementById("preview-category");
const previewAmount = document.getElementById("preview-amount");
const previewDuration = document.getElementById("preview-duration");
const existingPlansList = document.getElementById("existing-plans-list");

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
        "Authorization": `Bearer ${authToken}`  // FIXED: Use backticks ` not quotes "
    };
}

async function apiCall(url, options = {}) {  // FIXED: Added closing parenthesis and bracket
    try {
        const response = await fetch(url, {  // FIXED: Removed invalid characters
            headers: getAuthHeaders(),
            ...options
        });
        
        if (response.status === 401) {  // FIXED: Use === instead of ==
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
                initializeCreatePlanForm();
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
            updateCategoryDropdown(); // For expense form
            updatePlanCategoryDropdown(); // For create plan form
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

function updatePlanCategoryDropdown() {
    // Clear existing options except the first one
    while (planCategory.options.length > 1) {
        planCategory.remove(1);
    }
    
    // Add categories from API
    userCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.category_id;
        option.textContent = category.name;
        planCategory.appendChild(option);
    });
}

/* --------------------------
   CREATE PLAN EVENT LISTENERS
--------------------------- */
createNewCategoryCheckbox.addEventListener("change", function() {
    if (this.checked) {
        newCategoryGroup.classList.remove("hidden");
        planCategory.disabled = true;
        planCategory.required = false;
        newCategoryName.required = true;
    } else {
        newCategoryGroup.classList.add("hidden");
        planCategory.disabled = false;
        planCategory.required = true;
        newCategoryName.required = false;
        newCategoryName.value = "";
        newCategoryDesc.value = "";
    }
    updatePlanPreview();
});

// Real-time preview updates
planCategory.addEventListener("change", updatePlanPreview);
newCategoryName.addEventListener("input", updatePlanPreview);
planAmountInput.addEventListener("input", updatePlanPreview);
planStartDate.addEventListener("change", updatePlanPreview);
planEndDate.addEventListener("change", updatePlanPreview);

// Amount validation with min/max
planAmountInput.addEventListener("blur", function() {
    const value = parseFloat(this.value);
    if (value < 1) {
        alert("Minimum amount is ₣1");
        this.value = "1";
    } else if (value > 10000000) {
        alert("Maximum amount is ₣10,000,000");
        this.value = "10000000";
    }
    updatePlanPreview();
});

/* --------------------------
   CREATE PLAN FORM SUBMISSION
--------------------------- */
createPlanForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let categoryId;
    let categoryName;

    try {
        // Handle category creation if needed
        if (createNewCategoryCheckbox.checked) {
            const newCategoryNameValue = newCategoryName.value.trim();
            
            if (!newCategoryNameValue) {
                alert("Please enter a category name");
                return;
            }

            // Check if category already exists for this user
            const existingCategory = userCategories.find(
                cat => cat.name.toLowerCase() === newCategoryNameValue.toLowerCase()
            );

            if (existingCategory) {
                alert(`Category "${newCategoryNameValue}" already exists. Please select it from the dropdown instead.`);
                // Auto-select the existing category
                createNewCategoryCheckbox.checked = false;
                newCategoryGroup.classList.add("hidden");
                planCategory.disabled = false;
                planCategory.value = existingCategory.category_id;
                updatePlanPreview();
                return;
            }

            // Create new category USING apiCall (this sends the token)
            const categoryRes = await apiCall(`${API}/categories/categories`, {
                method: 'POST',
                body: JSON.stringify({
                    name: newCategoryNameValue,
                    description: newCategoryDesc.value.trim() || undefined
                })
            });

            if (!categoryRes || !categoryRes.ok) {
                const error = await categoryRes.json();
                alert("Failed to create category: " + (error.error || "Unknown error"));
                return;
            }

            const newCategory = await categoryRes.json();
            categoryId = newCategory.category_id;
            categoryName = newCategoryNameValue;
            
            // Reload categories to include the new one
            await loadCategories();
        } else {
            categoryId = parseInt(planCategory.value);
            if (!categoryId) {
                alert("Please select a category");
                return;
            }
            
            const selectedCategory = userCategories.find(cat => cat.category_id === categoryId);
            categoryName = selectedCategory ? selectedCategory.name : 'Unknown Category';
        }

      // FIX: Better amount validation and parsing
        const amountValue = planAmountInput.value.trim();
        if (!amountValue) {
            alert("Please enter a budget amount");
            return;
        }

        const amount = parseFloat(amountValue);
        if (isNaN(amount)) {
            alert("Please enter a valid budget amount");
            return;
        }

        if (amount < 1) {
            alert("Minimum budget amount is ₣1");
            return;
        }
        if (amount > 10000000) {
            alert("Maximum budget amount is ₣10,000,000");
            return;
        }

        // Validate dates
        const startDate = new Date(planStartDate.value);
        const endDate = new Date(planEndDate.value);
        
        if (endDate < startDate) {
            alert("End date must be on or after start date");
            return;
        }

        // Create the budget plan USING apiCall (this was missing!)
        const planData = {
            category_id: categoryId,
            amount: amount,
            start_date: planStartDate.value,
            end_date: planEndDate.value
        };

        console.log("Creating budget plan with data:", planData);

        const planRes = await apiCall(`${API}/budget_plans/budget_plans`, {  // FIXED: Using apiCall instead of fetch
            method: 'POST',
            body: JSON.stringify(planData)
        });

        if (!planRes || !planRes.ok) {
            const errorData = await planRes.json();
            console.error("Backend error:", errorData);
            alert("Failed to create budget plan: " + (errorData.error || errorData.message || "validation_error"));
            return;
        }

        const result = await planRes.json();
        
        alert(`Budget plan for "${categoryName}" created successfully!`);
        
        // Reset form
        createPlanForm.reset();
        createNewCategoryCheckbox.checked = false;
        newCategoryGroup.classList.add("hidden");
        planCategory.disabled = false;
        planPreview.classList.add("hidden");
        
        // Set default dates again
        initializeCreatePlanFormDates();
        
        // Reload data
        await loadBudgetPlans();
        await loadExistingPlans();
        await loadHomeData(); // Refresh home section stats
        
    } catch (error) {
        console.error("Error creating budget plan:", error);
        alert("Error creating budget plan: " + error.message);
    }
});

/* --------------------------
   CREATE PLAN FUNCTIONS
--------------------------- */
function updatePlanPreview() {
    const hasCategory = createNewCategoryCheckbox.checked ? 
        newCategoryName.value.trim() : 
        planCategory.selectedIndex > 0;
    
    const amount = parseFloat(planAmountInput.value) || 0;
    const hasValidAmount = amount >= 1 && amount <= 10000000;
    const hasStartDate = planStartDate.value;
    const hasEndDate = planEndDate.value;

    if (hasCategory && hasValidAmount && hasStartDate && hasEndDate) {
        // Update preview content
        previewCategory.textContent = createNewCategoryCheckbox.checked ? 
            newCategoryName.value : 
            planCategory.options[planCategory.selectedIndex].text;
        
        previewAmount.textContent = `₣${amount.toFixed(2)}`;
        
        // Calculate and display duration
        const start = new Date(planStartDate.value);
        const end = new Date(planEndDate.value);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
        previewDuration.textContent = `${diffDays} days`;
        
        planPreview.classList.remove("hidden");
    } else {
        planPreview.classList.add("hidden");
    }
}

async function loadExistingPlans() {
    try {
        const res = await apiCall(`${API}/budget_plans/budget_plans`);
        if (res && res.ok) {
            const plans = await res.json();
            displayExistingPlans(plans);
        }
    } catch (error) {
        console.error('Failed to load existing plans:', error);
    }
}

function displayExistingPlans(plans) {
    if (plans.length === 0) {
        existingPlansList.innerHTML = '<p class="empty-state">No budget plans created yet.</p>';
        return;
    }

    const plansHTML = plans.map(plan => {
        const category = userCategories.find(cat => cat.category_id === plan.category_id);
        const categoryName = category ? category.name : 'Unknown Category';
        const startDate = new Date(plan.start_date).toLocaleDateString();
        const endDate = new Date(plan.end_date).toLocaleDateString();
        const spent = parseFloat(plan.spent || 0);
        const total = parseFloat(plan.amount);
        const remaining = total - spent;
        
        return `
            <div class="existing-plan-item">
                <div class="plan-info">
                    <h4>${categoryName}</h4>
                    <div class="plan-details">
                        ${startDate} - ${endDate}
                    </div>
                    <div class="plan-details">
                        Spent: ₣${spent.toFixed(2)} | Remaining: ₣${remaining.toFixed(2)}
                    </div>
                </div>
                <div class="plan-amount">₣${total.toFixed(2)}</div>
            </div>
        `;
    }).join('');

    existingPlansList.innerHTML = plansHTML;
}

function initializeCreatePlanFormDates() {
    // Set default dates to current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    planStartDate.value = firstDayOfMonth.toISOString().split('T')[0];
    planEndDate.value = lastDayOfMonth.toISOString().split('T')[0];
}

function initializeCreatePlanForm() {
    initializeCreatePlanFormDates();
    
    // Reset form state
    createNewCategoryCheckbox.checked = false;
    newCategoryGroup.classList.add("hidden");
    planCategory.disabled = false;
    planPreview.classList.add("hidden");
    
    // Load existing plans
    loadExistingPlans();
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
    // Set default date to today (for expense form)
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


// Add this helper function for debugging
async function debugApiCall(url, options = {}) {
    console.log("Making API call to:", url);
    console.log("Request options:", options);
    
    try {
        const response = await fetch(url, {
            headers: getAuthHeaders(),
            ...options
        });
        
        console.log("Response status:", response.status);
        const responseText = await response.text();
        console.log("Response text:", responseText);
        
        // Try to parse as JSON, but keep text if it fails
        try {
            const jsonData = JSON.parse(responseText);
            return { ok: response.ok, status: response.status, data: jsonData };
        } catch (e) {
            return { ok: response.ok, status: response.status, data: responseText };
        }
    } catch (error) {
        console.error("API call failed:", error);
        throw error;
    }
}
