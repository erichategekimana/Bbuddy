// Function to show a specific section and hide others
function showSection(sectionId) {
    const sections = ['home', 'addExpense', 'dashboard', 'login', 'register'];
    sections.forEach(sec => {
        document.getElementById(sec).style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

// Event listeners for navigation links
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = e.target.getAttribute('href').substring(1); // Get the section ID
        showSection(targetSection);
    });
});

// Event listeners for form submissions
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log('Logging in with username:', username);
    simulateLogin();
});

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    console.log('Registering with username:', username);
    simulateRegister();
});

document.getElementById('expenseForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const category = document.getElementById('category').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    console.log('Adding expense:', { category, amount, date });
    simulateAddExpense();
});

// Simulated actions
function simulateLogin() {
    showSection('dashboard');
    document.getElementById('quote-of-the-day').innerText = '"Simplicity is the ultimate sophistication." — Leonardo da Vinci';
}

function simulateRegister() {
    showSection('home');
    document.getElementById('quote-of-the-day').innerText = '"Simplicity is the ultimate sophistication." — Leonardo da Vinci';
}

function simulateAddExpense() {
    const expensesDiv = document.getElementById('expenses');
    const expenseDiv = document.createElement('div');
    expenseDiv.innerText = `Category: ${document.getElementById('category').value}, Amount: ${document.getElementById('amount').value}, Date: ${document.getElementById('date').value}`;
    expensesDiv.appendChild(expenseDiv);
    document.getElementById('expenseForm').reset();
}

// Handle category selection for "Other"
document.getElementById('category').addEventListener('change', function() {
    const otherCategoryInput = document.getElementById('otherCategory');
    if (this.value === 'other') {
        otherCategoryInput.style.display = 'block';
    } else {
        otherCategoryInput.style.display = 'none';
        otherCategoryInput.value = '';
    }
});

// Initialize the app by showing the login section
document.addEventListener('DOMContentLoaded', () => {
    showSection('login');
});