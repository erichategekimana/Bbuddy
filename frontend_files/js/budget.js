const token = localStorage.getItem("token");
const API_PLANS = "http://10.227.124.219:5000/api/plans";

document.getElementById("budget-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const amount = document.getElementById("budget-amount").value;
  const start_date = document.getElementById("start-date").value;
  const end_date = document.getElementById("end-date").value;

  try {
    const res = await fetch(API_PLANS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: 1,        // mock for now
        category_id: 1,    // mock
        amount,
        start_date,
        end_date
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Budget plan added!");
      loadBudgetPlans(); // function to fetch and display plans
    } else {
      alert(data.message || "Error adding budget plan");
    }
  } catch (err) {
    console.error(err);
  }
});

// Mock function for displaying plans (you can replace with real API later)
function loadBudgetPlans() {
  const list = document.getElementById("budget-list");
  list.innerHTML = "<p>Mock budget plan 1: 50000</p><p>Mock budget plan 2: 30000</p>";
}

loadBudgetPlans();
