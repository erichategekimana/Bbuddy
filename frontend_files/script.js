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

/* TOP BAR ELEMENTS */
const usernameDisplay = document.getElementById("username-display");


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
const themeToggle = document.getElementById("theme-toggle");
const settingsUsername = document.getElementById("settings-username");
const settingsEmail = document.getElementById("settings-email");
const currentPassword = document.getElementById("current-password");
const newPassword = document.getElementById("new-password");
const confirmPassword = document.getElementById("confirm-password");
const updateProfileBtn = document.getElementById("update-profile-btn");
const logoutBtn = document.getElementById("logout-btn");

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
   THEME TOGGLE FUNCTIONALITY
--------------------------- */
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDark = savedTheme === 'dark';
    
    // Set theme on body
    if (isDark) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
    
    // Set toggle state
    if (themeToggle) {
        themeToggle.checked = isDark;
    }
    
    console.log(`Theme initialized: ${savedTheme}`);
}

function toggleTheme() {
    const isDark = themeToggle.checked;
    
    if (isDark) {
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        console.log('Switched to dark theme');
    } else {
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        console.log('Switched to light theme');
    }
}

// Initialize theme on page load
initTheme();

// Add event listener for theme toggle
if (themeToggle) {
    themeToggle.addEventListener('change', toggleTheme);
}


/* --------------------------
   UPDATE PROFILE FUNCTION
--------------------------- */
async function updateProfile() {
    console.log("DEBUG: Update profile function called");
    
    // Validate inputs
    const username = settingsUsername.value.trim();
    const currentPass = currentPassword.value;
    const newPass = newPassword.value;
    const confirmPass = confirmPassword.value;
    
    console.log("DEBUG: Form values:", { username, currentPass, newPass, confirmPass });
    
    // Show loading
    showLoading();
    updateProfileBtn.disabled = true;
    updateProfileBtn.textContent = 'Updating...';
    
    try {
        let updateData = {};
        let hasChanges = false;
        
        // Check if username changed
        if (username && username !== userData.profile.username) {
            updateData.username = username;
            hasChanges = true;
            console.log("DEBUG: Username will be updated");
        }
        
        // Check if password change requested
        if (currentPass && newPass && confirmPass) {
            if (newPass !== confirmPass) {
                hideLoading();
                updateProfileBtn.disabled = false;
                updateProfileBtn.textContent = 'Update Profile';
                showSimpleNotification('New passwords do not match', 'error');
                return;
            }
            
            if (newPass.length < 8) {
                hideLoading();
                updateProfileBtn.disabled = false;
                updateProfileBtn.textContent = 'Update Profile';
                showSimpleNotification('New password must be at least 8 characters', 'error');
                return;
            }
            
            updateData.old_password = currentPass;
            updateData.new_password = newPass;
            hasChanges = true;
            console.log("DEBUG: Password will be updated");
        } else if ((currentPass || newPass || confirmPass) && 
                  !(currentPass && newPass && confirmPass)) {
            hideLoading();
            updateProfileBtn.disabled = false;
            updateProfileBtn.textContent = 'Update Profile';
            showSimpleNotification('Please fill all password fields to change password', 'error');
            return;
        }
        
        if (!hasChanges) {
            hideLoading();
            updateProfileBtn.disabled = false;
            updateProfileBtn.textContent = 'Update Profile';
            showSimpleNotification('No changes to update', 'info');
            return;
        }
        
        console.log("DEBUG: Sending update data:", updateData);
        
        // Make API call
        const res = await apiCall(`${API}/auth/update_profile`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        
        console.log("DEBUG: API response:", res);
        
        if (!res) {
            hideLoading();
            updateProfileBtn.disabled = false;
            updateProfileBtn.textContent = 'Update Profile';
            showSimpleNotification('Authentication failed. Please login again.', 'error');
            return;
        }
        
        if (res.ok) {
            const result = await res.json();
            console.log("DEBUG: Update successful:", result);
            
            // Clear password fields
            currentPassword.value = '';
            newPassword.value = '';
            confirmPassword.value = '';
            
            // Reload user profile
            await loadUserProfile();
            
            showSimpleNotification('Profile updated successfully!', 'success');
            
        } else {
            const error = await res.json();
            console.error("DEBUG: Update failed:", error);
            showSimpleNotification('Update failed: ' + (error.error || error.message || 'Unknown error'), 'error');
        }
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showSimpleNotification('Error updating profile: ' + error.message, 'error');
    } finally {
        // Reset button and hide loading
        updateProfileBtn.disabled = false;
        updateProfileBtn.textContent = 'Update Profile';
        hideLoading();
    }
}


/* --------------------------
   SIMPLE NOTIFICATION FUNCTION
--------------------------- */
function showSimpleNotification(message, type = 'info') {
    console.log(`DEBUG: Showing notification: ${message}, type: ${type}`);
    
    // Remove any existing notification
    const existingNotification = document.getElementById('simple-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'simple-notification';
    notification.textContent = message;
    notification.className = `notification-${type}`;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}


/* --------------------------
   UPDATE PROFILE DISPLAY
--------------------------- */
function updateProfileDisplay() {
    if (userData.profile) {
        if (settingsUsername) {
            settingsUsername.value = userData.profile.username || '';
        }
        if (settingsEmail) {
            settingsEmail.value = userData.profile.email || '';
        }

        //  Display username in top bar
        if (usernameDisplay) {
            usernameDisplay.textContent = `Hello, ${userData.profile.username}`;
        }
        console.log('Profile display updated');
    }
}





/* --------------------------
   SETTINGS MESSAGE FUNCTIONS
--------------------------- */
function showSettingsMessage(message, type = 'info') {
    // Create or get message element
    let messageEl = document.getElementById('settings-message');
    
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'settings-message';
        // Insert after the h3 in settings
        const settingsContent = document.querySelector('.settings-content');
        const h3 = settingsContent.querySelector('h3');
        settingsContent.insertBefore(messageEl, h3.nextSibling);
    }
    
    messageEl.textContent = message;
    messageEl.className = type;
    
    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            hideSettingsMessage();
        }, 5000);
    }
}

function hideSettingsMessage() {
    const messageEl = document.getElementById('settings-message');
    if (messageEl) {
        messageEl.style.display = 'none';
    }
}




/* --------------------------
   CURRENCY FORMATTING (HARDCODED TO RWF)
--------------------------- */
function formatCurrency(amount) {
    return `RWF${parseFloat(amount).toFixed(2)}`;
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


/* --------------------------logout FUNCTIONALITY --------------------------- */
function logout() {
    // Clear local storage
    localStorage.removeItem("authToken");
    localStorage.removeItem('theme'); // Optional: keep theme preference
    
    // Reset global variables
    authToken = null;
    userData = { 
        profile: null, 
        categories: [], 
        budgetPlans: [], 
        expenses: [],
        isLoading: false,
        loadPromise: null
    };
    
    // Close settings if open
    closeSettingsPanel();
    
    // Show login page
    showPage(loginPage);
    
    console.log('User logged out');
}

// Add logout button event listener
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
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


    //  Display username in top bar
    if (usernameDisplay) {
        usernameDisplay.textContent = `Hello, ${userData.profile.username}`;
    }
    
    try {
        console.log("Loading all user data...");
        
        // Load in sequence to ensure dependencies
        await loadUserProfile();
        await loadCategories();
        await loadBudgetPlans();
        await loadExpenses();
        
        console.log("All user data loaded successfully");
        await loadQuote();
        updateAllDisplays();
        updateExpensePlanDropdown(); // ← NEED TO ADD THIS!
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
                     await loadQuote(); //  get fresh quote avery reload
                    break;
                case "dashboard-section":
                    await loadAllUserData(); // Reload all data for dashboard
                    showSection(dashboardSection);
                    updateExpensesTable(userData.expenses);
                     // Delete listeners will be added by updateExpensesTable
                    break;
                case "create-plan-section":
                    // Keep existing behavior - it already reloads plans
                    showSection(createPlanSection);
                    initializeCreatePlanForm();
                    await loadExistingPlans(); // This already exists
                    // Delete listeners will be added by displayExistingPlans
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
     // Expense delete listeners are added in updateExpensesTable
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


/* --------------------------
   CATEGORY DROPDOWNS
--------------------------- */
function updateCategoryDropdowns() {
    updateExpensePlanDropdown();
    updatePlanCategoryDropdown();
}

function updateExpensePlanDropdown() {
    console.log("DEBUG updateExpensePlanDropdown: Starting...");
    
    while (expensePlan.options.length > 1) {
        expensePlan.remove(1);
    }
    
    if (userData.budgetPlans.length === 0) {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No budget plans available";
        option.disabled = true;
        expensePlan.appendChild(option);
        console.log("DEBUG: No plans available");
        return;
    }
    
    userData.budgetPlans.forEach((plan, index) => {
        const categoryName = getCategoryName(plan.category_id);
        console.log(`DEBUG: Plan ${index}:`, {
            plan_id: plan.plan_id,
            category_id: plan.category_id,
            categoryName: categoryName,
            amount: plan.amount
        });
        
        const option = document.createElement('option');
        option.value = plan.plan_id; // ← CRITICAL: What is plan.plan_id?
        option.textContent = `${categoryName} - ${formatCurrency(plan.amount)}`;
        expensePlan.appendChild(option);
    });
    
    console.log("DEBUG: Dropdown populated with", userData.budgetPlans.length, "options");
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
            <div class="existing-plan-item" data-plan-id="${plan.plan_id}">
                <div class="plan-info">
                    <h4>${categoryName}</h4>
                    <div class="plan-details">
                        ${startDate} - ${endDate}
                    </div>
                    <div class="plan-details">
                        Spent: ${formatCurrency(spent)} | Remaining: ${formatCurrency(remaining)}
                    </div>
                </div>
                <div class="plan-actions">
                    <div class="plan-amount">${formatCurrency(total)}</div>
                    <button class="delete-plan-btn" data-plan-id="${plan.plan_id}">Delete</button>
                </div>
            </div>
        `;
    }).join('');

    existingPlansList.innerHTML = plansHTML;
    
    // Add event listeners to delete buttons
    addPlanDeleteListeners();
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


/* --------------------------
   ADD EXPENSE – SUBMIT (UPDATED FOR BUDGET PLANS)
--------------------------- */
expenseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoading();
    console.log("DEBUG: expensePlan value =", expensePlan.value);
    console.log("DEBUG: expensePlan selectedIndex =", expensePlan.selectedIndex);
    console.log("DEBUG: expensePlan options =", expensePlan.options);


     // Log all form values
    console.log("Form values:", {
        plan: expensePlan.value,
        description: expenseDescription.value,
        amount: expenseAmount.value,
        date: expenseDate.value
    });
    
    // Check dropdown state
    console.log("Dropdown options count:", expensePlan.options.length);
    console.log("All dropdown options:");

    try {
        // Ensure we have the latest data
        // await loadAllUserData();

        if (userData.budgetPlans.length === 0) {
            await loadBudgetPlans(); // Just load plans if needed
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
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">No expenses found</td></tr>';
        return;
    }
    
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        
        const categoryName = getCategoryNameFromExpense(expense);
        
        row.innerHTML = `
            <td>${categoryName}</td>
            <td>${formatCurrency(expense.amount)}</td>
            <td>${new Date(expense.expense_date).toLocaleDateString()}</td>
            <td class="action-cell">
                <button class="delete-btn" data-expense-id="${expense.expense_id}">Delete</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    addExpenseDeleteListeners();
}


/* --------------------------
   SETTINGS PANEL FUNCTIONALITY
--------------------------- */
if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
        settingsPanel.classList.remove("hidden");
        settingsPanel.style.display = 'flex';
        // Update profile fields when opening settings
        updateProfileDisplay();
    });
}

if (closeSettings) {
    closeSettings.addEventListener("click", () => {
        closeSettingsPanel();
    });
}

if (settingsPanel) {
    settingsPanel.addEventListener("click", (e) => {
        if (e.target === settingsPanel) {
            closeSettingsPanel();
        }
    });
}

// Close settings with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !settingsPanel.classList.contains('hidden')) {
        closeSettingsPanel();
    }
});

function closeSettingsPanel() {
    settingsPanel.classList.add("hidden");
    settingsPanel.style.display = 'none';
    // Clear any messages
    hideSettingsMessage();
    // Clear password fields
    if (currentPassword) currentPassword.value = '';
    if (newPassword) newPassword.value = '';
    if (confirmPassword) confirmPassword.value = '';
}

/* --------------------------
   QUOTES
--------------------------- */
async function loadQuote() {
    try {
        showLoading(); // Show loading while fetching quote
        const res = await fetch(`${API}/quotes/quote`);
        
        if (res.ok) {
            const data = await res.json();
            // Display the Gemini-generated quote
            quoteElement.textContent = `"${data.quote}"`;
            console.log(`Quote loaded from ${data.source || 'unknown'}`);
        } else {
            // Fallback if API fails
            fallbackQuote();
        }
    } catch (error) {
        console.error('Error loading quote:', error);
        fallbackQuote();
    } finally {
        hideLoading();
    }
}

function fallbackQuote() {
    const fallbackQuotes = [
        "Take control of your finances, one expense at a time.",
        "The best time to start budgeting was yesterday. The second best time is now.",
        "A budget is telling your money where to go instead of wondering where it went.",
        "Financial freedom is available to those who learn about it and work for it."
    ];
    const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    quoteElement.textContent = `"${randomQuote}"`;
}

/* --------------------------
   PAGE LOAD
--------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    const today = new Date();
    if (expenseDate) {
        expenseDate.value = today.toISOString().split('T')[0];
    }
    
    // Initialize theme
    initTheme();
    
    if (authToken) {
        showPage(app);
        showSection(homeSection);
        loadAllUserData();
    } else {
        showPage(loginPage);
    }
    
    console.log('App initialized');
});


/* --------------------------
   DELETE EXPENSE FUNCTION
--------------------------- */
async function deleteExpense(expenseId) {
    if (!confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
        return;
    }
    
    showLoading();
    
    try {
        const res = await apiCall(`${API}/expenses/expenses/${expenseId}`, {
            method: 'DELETE'
        });
        
        if (!res) {
            alert("Authentication failed. Please login again.");
            hideLoading();
            return;
        }
        
        if (res.ok) {
            alert("Expense deleted successfully!");
            // Reload all data to update the display
            await loadAllUserData();
        } else {
            const error = await res.json();
            alert("Failed to delete expense: " + (error.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Error deleting expense:", error);
        alert("Error deleting expense: " + error.message);
    } finally {
        hideLoading();
    }
}

/* --------------------------
   DELETE BUDGET PLAN FUNCTION
--------------------------- */
async function deleteBudgetPlan(planId) {
    if (!confirm("Are you sure you want to delete this budget plan? All associated expenses will also be deleted. This action cannot be undone.")) {
        return;
    }
    
    showLoading();
    
    try {
        const res = await apiCall(`${API}/budget_plans/budget_plans/${planId}`, {
            method: 'DELETE'
        });
        
        if (!res) {
            alert("Authentication failed. Please login again.");
            hideLoading();
            return;
        }
        
        if (res.ok) {
            alert("Budget plan deleted successfully!");
            // Reload all data to update the display
            await loadAllUserData();
            
            // If we're in the create plan section, reload the plans list
            if (!createPlanSection.classList.contains('hidden')) {
                await loadExistingPlans();
            }
        } else {
            const error = await res.json();
            alert("Failed to delete budget plan: " + (error.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Error deleting budget plan:", error);
        alert("Error deleting budget plan: " + error.message);
    } finally {
        hideLoading();
    }
}

/* --------------------------
   ADD DELETE EVENT LISTENERS
--------------------------- */
function addExpenseDeleteListeners() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const expenseId = e.target.getAttribute('data-expense-id');
            if (expenseId) {
                await deleteExpense(expenseId);
            }
        });
    });
}

function addPlanDeleteListeners() {
    const deleteButtons = document.querySelectorAll('.delete-plan-btn');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const planId = e.target.getAttribute('data-plan-id');
            if (planId) {
                await deleteBudgetPlan(planId);
            }
        });
    });
}