document.getElementById("logout-btn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "index.html";
});
