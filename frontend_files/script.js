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
const planAmount = document.getElementById("plan-amount-display");
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
const expensePlan = document.getElementById("expense-plan"); // NEW
const expenseDescription = document.getElementById("expense-description");
const expenseAmount = document.getElementById("expense-amount");
const expenseDate = document.getElementById("expense-date");

/* SETTINGS PANEL */
const settingsPanel = document.getElementById("settings-panel");
const settingsBtn = document.getElementById("settings-btn");
const closeSettings = document.getElementById("close-settings");
const settingsName = document.getElementById("settings-name");
const profilePicUrl = document.getElementById("profile-pic-url");
const updatePictureBtn = document.getElementById("update-picture-btn");
const oldPassword = document.getElementById("old-password");
const newPassword = document.getElementById("new-password");
const changePasswordBtn = document.getElementById("change-password-btn");
const profilePic = document.getElementById("profile-pic");

/* BACKEND API BASE URL */
const API = "/api";

/* AUTH TOKEN */
let authToken = localStorage.getItem("authToken") || null;

/* --------------------------
   GLOBAL DATA MANAGEMENT WITH SYNCHRONIZATION
--------------------------- */
let userData = {
    profile: null,
    categories: [],
    budgetPlans: [],
    expenses: [],
    isLoading: false,
    loadPromise: null
};

/* --------------------------
   CURRENCY FORMATTING (HARDCODED TO RWF)
--------------------------- */
function formatCurrency(amount) {
    return `₣${parseFloat(amount).toFixed(2)}`;
}

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
        if (!authToken) {
            console.error("No auth token available");
            logout();
            return null;
        }

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
    userData = { 
        profile: null, 
        categories: [], 
        budgetPlans: [], 
        expenses: [],
        isLoading: false,
        loadPromise: null
    };
    showPage(loginPage);
    alert("Session expired. Please login again.");
}


/* --------------------------
   LOADING OVERLAY FUNCTIONS
--------------------------- */
function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}



/* --------------------------
   DATA LOADING WITH SYNCHRONIZATION
--------------------------- */
async function loadAllUserData() {
    // Remove the loading prevention logic since we want fresh data on section switches
    showLoading();
    
    try {
        console.log("Loading all user data...");
        
        // Load in sequence to ensure dependencies
        await loadUserProfile();
        await loadCategories();
        await loadBudgetPlans();
        await loadExpenses();
        
        console.log("All user data loaded successfully");
        updateAllDisplays();
    } catch (error) {
        console.error('Failed to load user data:', error);
        throw error;
    } finally {
        hideLoading();
    }
}

async function loadUserProfile() {
    try {
        const res = await apiCall(`${API}/auth/profile`);
        if (res && res.ok) {
            userData.profile = await res.json();
            updateProfileDisplay();
        }
    } catch (error) {
        console.error('Failed to load user profile:', error);
    }
}

async function loadBudgetPlans() {
    try {
        const res = await apiCall(`${API}/budget_plans/budget_plans`);
        if (res && res.ok) {
            userData.budgetPlans = await res.json();
            console.log("Loaded budget plans:", userData.budgetPlans.length);
            updateExpensePlanDropdown(); // Ensure dropdown gets updated
        }
    } catch (error) {
        console.error('Failed to load budget plans:', error);
        throw error; // Re-throw to handle in parent function
    }
}

async function loadCategories() {
    try {
        const res = await apiCall(`${API}/categories/categories`);
        if (res && res.ok) {
            userData.categories = await res.json();
            console.log("Loaded categories:", userData.categories.length);
            updateCategoryDropdowns();
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
        throw error; // Re-throw to handle in parent function
    }
}

async function loadExpenses() {
    try {
        const res = await apiCall(`${API}/expenses/expenses`);
        if (res && res.ok) {
            userData.expenses = await res.json();
            console.log("Loaded expenses:", userData.expenses.length);
             updateExpensePlanDropdown(); // Ensure dropdown gets updated
        }
    } catch (error) {
        console.error('Failed to load expenses:', error);
        throw error; // Re-throw to handle in parent function
    }
}


/* --------------------------
   CATEGORY NAME RESOLUTION - SAFE VERSION
--------------------------- */
function getCategoryName(categoryId) {
    if (!userData.categories || userData.categories.length === 0) {
        console.warn("Categories not loaded yet for ID:", categoryId);
        return "Loading...";
    }
    
    const category = userData.categories.find(cat => cat.category_id === categoryId);
    if (!category) {
        console.warn("Category not found for ID:", categoryId);
        return "Unknown Category";
    }
    
    return category.name;
}

function getCategoryNameFromExpense(expense) {
    // Try to use category_name from expense first (if backend provides it)
    if (expense.category_name) {
        return expense.category_name;
    }
    
    // Fallback to looking up by category_id
    return getCategoryName(expense.category_id);
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
    homeSection.classList.add("hidden");
    dashboardSection.classList.add("hidden");
    createPlanSection.classList.add("hidden");
    addExpenseSection.classList.add("hidden");
    
    navButtons.forEach(btn => btn.classList.remove("active"));
    
    section.classList.remove("hidden");
    
    const activeBtn = Array.from(navButtons).find(btn => 
        btn.getAttribute("data-page") === section.id
    );
    if (activeBtn) {
        activeBtn.classList.add("active");
    }
}

/* --------------------------
   NAVIGATION HANDLERS - SYNCHRONIZED
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
    button.addEventListener("click", async () => {
        const page = button.getAttribute("data-page");
        
        showLoading(); // Show loading when switching sections
        
        try {
            switch(page) {
                case "home-section":
                    await loadAllUserData(); // Reload all data for home
                    showSection(homeSection);
                    break;
                case "dashboard-section":
                    await loadAllUserData(); // Reload all data for dashboard
                    showSection(dashboardSection);
                    updateExpensesTable(userData.expenses);
                    break;
                case "create-plan-section":
                    // Keep existing behavior - it already reloads plans
                    showSection(createPlanSection);
                    initializeCreatePlanForm();
                    await loadExistingPlans(); // This already exists
                    break;
                case "add-expense-section":
                    await loadAllUserData(); // Reload all data for add expense
                    showSection(addExpenseSection);
                    break;
            }
        } catch (error) {
            console.error('Error loading section data:', error);
            alert('Error loading data. Please try again.');
        } finally {
            hideLoading(); // Hide loading when done
        }
    });
});

/* --------------------------
   UPDATE DISPLAY FUNCTIONS
--------------------------- */
function updateAllDisplays() {
    updateBudgetPlanDisplay();
    updateQuickStats();
    updateExpensesTable(userData.expenses);
}

function updateBudgetPlanDisplay() {
    if (userData.budgetPlans.length > 0) {
        const plan = userData.budgetPlans[0];
        
        planAmount.textContent = formatCurrency(plan.amount);
        
        const spent = parseFloat(plan.spent || 0);
        const remaining = parseFloat(plan.amount) - spent;
        planRemaining.textContent = formatCurrency(remaining);
        
        const spentPercentage = (spent / parseFloat(plan.amount)) * 100;
        progressFill.style.width = `${Math.min(spentPercentage, 100)}%`;
        progressText.textContent = `${spentPercentage.toFixed(1)}% spent`;
        
        if (spentPercentage > 80) {
            progressFill.style.background = 'var(--danger)';
        } else if (spentPercentage > 60) {
            progressFill.style.background = 'var(--warning)';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, var(--success), var(--primary))';
        }
    } else {
        planAmount.textContent = formatCurrency(0);
        planRemaining.textContent = formatCurrency(0);
        progressFill.style.width = "0%";
        progressText.textContent = "No budget plan";
    }
}

function updateQuickStats() {
    totalPlansElement.textContent = userData.budgetPlans.length;
    totalExpensesElement.textContent = userData.expenses.length;
    totalCategoriesElement.textContent = userData.categories.length;
}

function updateProfileDisplay() {
    if (userData.profile) {
        settingsName.value = userData.profile.username || '';
        profilePicUrl.value = userData.profile.profile_picture_url || '';
        
        if (userData.profile.profile_picture_url) {
            profilePic.src = userData.profile.profile_picture_url;
            profilePic.classList.remove("hidden");
        } else {
            profilePic.classList.add("hidden");
        }
    }
}

/* --------------------------
   CATEGORY DROPDOWNS
--------------------------- */
function updateCategoryDropdowns() {
    updateExpensePlanDropdown();
    updatePlanCategoryDropdown();
}

function updateExpensePlanDropdown() {
    while (expensePlan.options.length > 1) {
        expensePlan.remove(1);
    }
    
    if (userData.budgetPlans.length === 0) {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No budget plans available";
        option.disabled = true;
        expensePlan.appendChild(option);
        return;
    }
    
    userData.budgetPlans.forEach(plan => {
        const categoryName = getCategoryName(plan.category_id);
        const startDate = new Date(plan.start_date).toLocaleDateString();
        const endDate = new Date(plan.end_date).toLocaleDateString();
        
        const option = document.createElement('option');
        option.value = plan.plan_id;
        option.textContent = `${categoryName} - ${formatCurrency(plan.amount)} (${startDate} to ${endDate})`;
        expensePlan.appendChild(option);
    });
}

function updatePlanCategoryDropdown() {
    while (planCategory.options.length > 1) {
        planCategory.remove(1);
    }
    
    userData.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.category_id;
        option.textContent = category.name;
        planCategory.appendChild(option);
    });
}

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

        await loadAllUserData();

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

planCategory.addEventListener("change", updatePlanPreview);
newCategoryName.addEventListener("input", updatePlanPreview);
planAmountInput.addEventListener("input", updatePlanPreview);
planStartDate.addEventListener("change", updatePlanPreview);
planEndDate.addEventListener("change", updatePlanPreview);

planAmountInput.addEventListener("blur", function() {
    const value = parseFloat(this.value);
    if (value < 1) {
        alert("Minimum amount is " + formatCurrency(1));
        this.value = "1";
    } else if (value > 10000000) {
        alert("Maximum amount is " + formatCurrency(10000000));
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
        if (createNewCategoryCheckbox.checked) {
            const newCategoryNameValue = newCategoryName.value.trim();
            
            if (!newCategoryNameValue) {
                alert("Please enter a category name");
                return;
            }

            const existingCategory = userData.categories.find(
                cat => cat.name.toLowerCase() === newCategoryNameValue.toLowerCase()
            );

            if (existingCategory) {
                alert(`Category "${newCategoryNameValue}" already exists. Please select it from the dropdown instead.`);
                createNewCategoryCheckbox.checked = false;
                newCategoryGroup.classList.add("hidden");
                planCategory.disabled = false;
                planCategory.value = existingCategory.category_id;
                updatePlanPreview();
                return;
            }

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
            
            await loadCategories();
        } else {
            categoryId = parseInt(planCategory.value);
            if (!categoryId) {
                alert("Please select a category");
                return;
            }
            
            const selectedCategory = userData.categories.find(cat => cat.category_id === categoryId);
            if (!selectedCategory) {
                alert("Selected category not found. Please refresh and try again.");
                return;
            }
            categoryName = selectedCategory.name;
        }

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
            alert("Minimum budget amount is " + formatCurrency(1));
            return;
        }
        if (amount > 10000000) {
            alert("Maximum budget amount is " + formatCurrency(10000000));
            return;
        }

        const startDate = new Date(planStartDate.value);
        const endDate = new Date(planEndDate.value);
        
        if (endDate < startDate) {
            alert("End date must be on or after start date");
            return;
        }

        const planData = {
            category_id: categoryId,
            amount: amount,
            start_date: planStartDate.value,
            end_date: planEndDate.value
        };

        console.log("Creating budget plan with data:", planData);

        const planRes = await apiCall(`${API}/budget_plans/budget_plans`, {
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
        
        createPlanForm.reset();
        createNewCategoryCheckbox.checked = false;
        newCategoryGroup.classList.add("hidden");
        planCategory.disabled = false;
        planPreview.classList.add("hidden");
        
        initializeCreatePlanFormDates();
        
        await loadAllUserData();
        
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
        previewCategory.textContent = createNewCategoryCheckbox.checked ? 
            newCategoryName.value : 
            planCategory.options[planCategory.selectedIndex].text;
        
        previewAmount.textContent = formatCurrency(amount);
        
        const start = new Date(planStartDate.value);
        const end = new Date(planEndDate.value);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        previewDuration.textContent = `${diffDays} days`;
        
        planPreview.classList.remove("hidden");
    } else {
        planPreview.classList.add("hidden");
    }
}

async function loadExistingPlans() {
    showLoading(); // Add loading for create plan section
    try {
        const res = await apiCall(`${API}/budget_plans/budget_plans`);
        if (res && res.ok) {
            const plans = await res.json();
            displayExistingPlans(plans);
        }
    } catch (error) {
        console.error('Failed to load existing plans:', error);
    } finally {
        hideLoading(); // Hide loading when done
    }
}

function displayExistingPlans(plans) {
    if (plans.length === 0) {
        existingPlansList.innerHTML = '<p class="empty-state">No budget plans created yet.</p>';
        return;
    }

    const plansHTML = plans.map(plan => {
        const categoryName = getCategoryName(plan.category_id);
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
                        Spent: ${formatCurrency(spent)} | Remaining: ${formatCurrency(remaining)}
                    </div>
                </div>
                <div class="plan-amount">${formatCurrency(total)}</div>
            </div>
        `;
    }).join('');

    existingPlansList.innerHTML = plansHTML;
}

function initializeCreatePlanFormDates() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    planStartDate.value = firstDayOfMonth.toISOString().split('T')[0];
    planEndDate.value = lastDayOfMonth.toISOString().split('T')[0];
}

function initializeCreatePlanForm() {
    initializeCreatePlanFormDates();
    
    createNewCategoryCheckbox.checked = false;
    newCategoryGroup.classList.add("hidden");
    planCategory.disabled = false;
    planPreview.classList.add("hidden");
    
    loadExistingPlans();
}

// /* --------------------------
//    ADD EXPENSE – CATEGORY HANDLING
// --------------------------- */
// expenseCategory.addEventListener("change", () => {
//     if (expenseCategory.value === "other") {
//         otherCategoryInput.classList.remove("hidden");
//         otherCategoryInput.required = true;
//     } else {
//         otherCategoryInput.classList.add("hidden");
//         otherCategoryInput.required = false;
//         otherCategoryInput.value = "";
//     }
// });

/* --------------------------
   ADD EXPENSE – SUBMIT (UPDATED FOR BUDGET PLANS)
--------------------------- */
expenseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoading();

    try {
        // Ensure we have the latest data
        await loadAllUserData();

        if (userData.budgetPlans.length === 0) {
            alert("Please create a budget plan first before adding expenses.");
            hideLoading();
            return;
        }

        const planId = parseInt(expensePlan.value);
        if (!planId) {
            alert("Please select a budget plan");
            hideLoading();
            return;
        }

        // Find the selected plan to get category_id
        const selectedPlan = userData.budgetPlans.find(plan => plan.plan_id === planId);
        if (!selectedPlan) {
            alert("Selected plan not found. Please refresh and try again.");
            hideLoading();
            return;
        }

        const body = {
            plan_id: planId,
            category_id: selectedPlan.category_id, // Get from the selected plan
            amount: parseFloat(expenseAmount.value),
            description: expenseDescription.value.trim(),
            expense_date: expenseDate.value
        };

        // Validate required fields
        if (!body.description) {
            alert("Please enter a description for the expense");
            hideLoading();
            return;
        }

        if (body.amount <= 0) {
            alert("Please enter a valid amount");
            hideLoading();
            return;
        }

        const res = await apiCall(`${API}/expenses/expenses`, {
            method: "POST",
            body: JSON.stringify(body)
        });

        if (!res) {
            alert("Authentication failed. Please login again.");
            hideLoading();
            return;
        }

        if (res.ok) {
            alert(`Expense added successfully!`);
            expenseForm.reset();
            
            // Reset date to today
            const today = new Date();
            expenseDate.value = today.toISOString().split('T')[0];
            
            await loadAllUserData();
        } else {
            const error = await res.json();
            console.error("Expense creation error:", error);
            alert("Failed to add expense: " + (error.error || error.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Error adding expense:", error);
        alert("Error adding expense: " + error.message);
    } finally {
        hideLoading();
    }
});

/* --------------------------
   EXPENSES TABLE WITH SAFE CATEGORY NAMES
--------------------------- */
function updateExpensesTable(expenses) {
    const tbody = document.querySelector('#expense-table tbody');
    tbody.innerHTML = '';
    
    if (!expenses || expenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px;">No expenses found</td></tr>';
        return;
    }
    
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        
        const categoryName = getCategoryNameFromExpense(expense);
        
        row.innerHTML = `
            <td>${categoryName}</td>
            <td>${formatCurrency(expense.amount)}</td>
            <td>${new Date(expense.expense_date).toLocaleDateString()}</td>
        `;
        
        tbody.appendChild(row);
    });
}

/* --------------------------
   SETTINGS PANEL FUNCTIONALITY
--------------------------- */
settingsBtn.addEventListener("click", () => {
    settingsPanel.classList.remove("hidden");
    settingsPanel.style.display = 'flex';
});

closeSettings.addEventListener("click", () => {
    settingsPanel.classList.add("hidden");
    settingsPanel.style.display = 'none';
});

settingsPanel.addEventListener("click", (e) => {
    if (e.target === settingsPanel) {
        settingsPanel.classList.add("hidden");
        settingsPanel.style.display = 'none';
    }
});

/* --------------------------
   PROFILE PICTURE UPDATE
--------------------------- */
updatePictureBtn.addEventListener("click", async () => {
    const pictureUrl = profilePicUrl.value.trim();
    
    if (!pictureUrl) {
        alert("Please enter a profile picture URL");
        return;
    }

    try {
        const res = await apiCall(`${API}/auth/update_picture`, {
            method: 'PUT',
            body: JSON.stringify({ profile_picture_url: pictureUrl })
        });

        if (res && res.ok) {
            alert("Profile picture updated successfully!");
            await loadUserProfile();
        } else {
            const error = await res.json();
            alert("Failed to update profile picture: " + (error.error || "Unknown error"));
        }
    } catch (error) {
        alert("Error updating profile picture: " + error.message);
    }
});

/* --------------------------
   CHANGE PASSWORD
--------------------------- */
changePasswordBtn.addEventListener("click", async () => {
    const oldPass = oldPassword.value;
    const newPass = newPassword.value;

    if (!oldPass || !newPass) {
        alert("Please fill in both password fields");
        return;
    }

    if (newPass.length < 6) {
        alert("New password must be at least 6 characters long");
        return;
    }

    try {
        const res = await apiCall(`${API}/auth/change_password`, {
            method: 'PUT',
            body: JSON.stringify({ 
                old_password: oldPass, 
                new_password: newPass 
            })
        });

        if (res && res.ok) {
            alert("Password changed successfully!");
            oldPassword.value = "";
            newPassword.value = "";
        } else {
            const error = await res.json();
            alert("Failed to change password: " + (error.error || "Unknown error"));
        }
    } catch (error) {
        alert("Error changing password: " + error.message);
    }
});

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
   PAGE LOAD
--------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    const today = new Date();
    expenseDate.value = today.toISOString().split('T')[0];
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    }
    
    if (authToken) {
        showPage(app);
        showSection(homeSection);
        loadAllUserData();
    } else {
        showPage(loginPage);
    }
});