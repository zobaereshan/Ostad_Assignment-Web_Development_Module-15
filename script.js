// ==========================================================
// Personal Expense Tracker — script.js
// Full CRUD + Local Storage + CSV Export + Pie Chart + Clear All
// ==========================================================

const STORAGE_KEY = "expenseTrackerData";

const CATEGORY_COLORS = {
  Food: "#f59e0b",
  Transport: "#3b82f6",
  Shopping: "#ec4899",
  Bills: "#ef4444",
  Entertainment: "#8b5cf6",
  Others: "#10b981"
};

let expenses = [];       // in-memory list of expense objects
let editingId = null;    // id of expense currently being edited
let pendingDeleteId = null;

// ---------- DOM References ----------
const form = document.getElementById("expenseForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const paymentInput = document.getElementById("payment");
const expenseIdInput = document.getElementById("expenseId");

const addBtn = document.getElementById("addBtn");
const updateBtn = document.getElementById("updateBtn");
const resetBtn = document.getElementById("resetBtn");
const formTitle = document.getElementById("formTitle");

const tableBody = document.getElementById("expenseTableBody");
const emptyMessage = document.getElementById("emptyMessage");
const searchInput = document.getElementById("searchInput");

const exportBtn = document.getElementById("exportBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

const confirmOverlay = document.getElementById("confirmOverlay");
const confirmMessage = document.getElementById("confirmMessage");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

const toastEl = document.getElementById("toast");

const pieCanvas = document.getElementById("pieChart");
const chartLegend = document.getElementById("chartLegend");

// ==========================================================
// INITIALIZATION
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();
  renderAll();
  // default date field to today for convenience
  dateInput.value = new Date().toISOString().split("T")[0];
});

// ==========================================================
// STORAGE
// ==========================================================
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    expenses = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load expenses from storage:", e);
    expenses = [];
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error("Failed to save expenses to storage:", e);
    showToast("Could not save data locally.");
  }
}

// ==========================================================
// FORM SUBMISSION (Add / Update)
// ==========================================================
form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const expenseData = {
    title: titleInput.value.trim(),
    amount: parseFloat(amountInput.value),
    category: categoryInput.value,
    date: dateInput.value,
    payment: paymentInput.value
  };

  if (editingId) {
    // UPDATE
    const idx = expenses.findIndex((x) => x.id === editingId);
    if (idx !== -1) {
      expenses[idx] = { ...expenses[idx], ...expenseData };
      showToast("Expense updated successfully.");
    }
  } else {
    // CREATE
    const newExpense = {
      id: generateId(),
      ...expenseData
    };
    expenses.push(newExpense);
    showToast("Expense added successfully.");
  }

  saveToStorage();
  renderAll();
  resetForm();
});

function generateId() {
  return "exp_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
}

// ==========================================================
// VALIDATION
// ==========================================================
function validateForm() {
  let isValid = true;

  isValid = validateField(
    titleInput,
    "err-title",
    titleInput.value.trim().length > 0,
    "Title is required."
  ) && isValid;

  const amountVal = parseFloat(amountInput.value);
  isValid = validateField(
    amountInput,
    "err-amount",
    amountInput.value.trim() !== "" && !isNaN(amountVal) && amountVal > 0,
    "Amount must be a positive number."
  ) && isValid;

  isValid = validateField(
    categoryInput,
    "err-category",
    categoryInput.value.trim().length > 0,
    "Please select a category."
  ) && isValid;

  isValid = validateField(
    dateInput,
    "err-date",
    dateInput.value.trim().length > 0,
    "Date is required."
  ) && isValid;

  isValid = validateField(
    paymentInput,
    "err-payment",
    paymentInput.value.trim().length > 0,
    "Please select a payment method."
  ) && isValid;

  return isValid;
}

function validateField(inputEl, errorId, condition, message) {
  const errorEl = document.getElementById(errorId);
  const fieldWrap = inputEl.closest(".field");
  if (!condition) {
    errorEl.textContent = message;
    fieldWrap.classList.add("invalid");
    return false;
  } else {
    errorEl.textContent = "";
    fieldWrap.classList.remove("invalid");
    return true;
  }
}

function clearValidationErrors() {
  document.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
  document.querySelectorAll(".field").forEach((el) => el.classList.remove("invalid"));
}

// ==========================================================
// RESET FORM
// ==========================================================
resetBtn.addEventListener("click", resetForm);

function resetForm() {
  form.reset();
  expenseIdInput.value = "";
  editingId = null;
  clearValidationErrors();
  dateInput.value = new Date().toISOString().split("T")[0];

  addBtn.classList.remove("hidden");
  updateBtn.classList.add("hidden");
  formTitle.textContent = "Add New Expense";
}

// ==========================================================
// EDIT
// ==========================================================
function editExpense(id) {
  const exp = expenses.find((x) => x.id === id);
  if (!exp) return;

  editingId = id;
  expenseIdInput.value = id;
  titleInput.value = exp.title;
  amountInput.value = exp.amount;
  categoryInput.value = exp.category;
  dateInput.value = exp.date;
  paymentInput.value = exp.payment;

  clearValidationErrors();
  addBtn.classList.add("hidden");
  updateBtn.classList.remove("hidden");
  formTitle.textContent = "Edit Expense";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==========================================================
// DELETE (with confirmation dialog)
// ==========================================================
function requestDelete(id) {
  pendingDeleteId = id;
  const exp = expenses.find((x) => x.id === id);
  confirmMessage.textContent = exp
    ? `Delete "${exp.title}" (৳${exp.amount.toFixed(2)})? This cannot be undone.`
    : "Are you sure you want to delete this expense?";
  confirmOverlay.classList.remove("hidden");
}

confirmYes.addEventListener("click", () => {
  if (pendingDeleteId === "__ALL__") {
    expenses = [];
    saveToStorage();
    renderAll();
    resetForm();
    showToast("All expenses cleared.");
  } else if (pendingDeleteId) {
    expenses = expenses.filter((x) => x.id !== pendingDeleteId);
    saveToStorage();
    renderAll();
    showToast("Expense deleted.");

    if (editingId === pendingDeleteId) {
      resetForm();
    }
  }
  closeConfirm();
});

confirmNo.addEventListener("click", closeConfirm);
confirmOverlay.addEventListener("click", (e) => {
  if (e.target === confirmOverlay) closeConfirm();
});

function closeConfirm() {
  pendingDeleteId = null;
  confirmOverlay.classList.add("hidden");
}

// ==========================================================
// CLEAR ALL
// ==========================================================
clearAllBtn.addEventListener("click", () => {
  if (expenses.length === 0) {
    showToast("There are no expenses to clear.");
    return;
  }
  pendingDeleteId = "__ALL__";
  confirmMessage.textContent = "Delete ALL expenses? This cannot be undone.";
  confirmOverlay.classList.remove("hidden");
});

// ==========================================================
// SEARCH / FILTER
// ==========================================================
searchInput.addEventListener("input", renderTable);

function getFilteredExpenses() {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) return expenses;
  return expenses.filter((x) => x.title.toLowerCase().includes(term));
}

// ==========================================================
// RENDER: TABLE
// ==========================================================
function renderTable() {
  const list = getFilteredExpenses();

  tableBody.innerHTML = "";

  if (list.length === 0) {
    emptyMessage.classList.remove("hidden");
  } else {
    emptyMessage.classList.add("hidden");
  }

  // show newest first
  const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));

  sorted.forEach((exp) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${escapeHtml(exp.title)}</td>
      <td class="amount-cell">৳${exp.amount.toFixed(2)}</td>
      <td><span class="category-badge" style="background:${CATEGORY_COLORS[exp.category] || "#6b7280"}">${escapeHtml(exp.category)}</span></td>
      <td>${formatDate(exp.date)}</td>
      <td>${escapeHtml(exp.payment)}</td>
      <td>
        <button class="btn btn-secondary btn-small" data-action="edit" data-id="${exp.id}">Edit</button>
        <button class="btn btn-danger btn-small" data-action="delete" data-id="${exp.id}">Delete</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

// delegate click events for edit/delete buttons
tableBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");

  if (action === "edit") editExpense(id);
  if (action === "delete") requestDelete(id);
});

// ==========================================================
// RENDER: SUMMARY
// ==========================================================
function renderSummary() {
  const total = expenses.reduce((sum, x) => sum + x.amount, 0);
  const count = expenses.length;
  const amounts = expenses.map((x) => x.amount);
  const highest = amounts.length ? Math.max(...amounts) : 0;
  const lowest = amounts.length ? Math.min(...amounts) : 0;
  const average = count ? total / count : 0;

  document.getElementById("sumTotal").textContent = `৳${total.toFixed(2)}`;
  document.getElementById("sumCount").textContent = count;
  document.getElementById("sumHighest").textContent = `৳${highest.toFixed(2)}`;
  document.getElementById("sumLowest").textContent = `৳${lowest.toFixed(2)}`;
  document.getElementById("sumAverage").textContent = `৳${average.toFixed(2)}`;
}

// ==========================================================
// RENDER: PIE CHART (category breakdown) — pure canvas, no libs
// ==========================================================
function renderChart() {
  const ctx = pieCanvas.getContext("2d");
  const w = pieCanvas.width;
  const h = pieCanvas.height;
  ctx.clearRect(0, 0, w, h);

  // aggregate totals by category
  const totalsByCategory = {};
  expenses.forEach((exp) => {
    totalsByCategory[exp.category] = (totalsByCategory[exp.category] || 0) + exp.amount;
  });

  const categories = Object.keys(totalsByCategory);
  const grandTotal = Object.values(totalsByCategory).reduce((a, b) => a + b, 0);

  chartLegend.innerHTML = "";

  if (categories.length === 0 || grandTotal === 0) {
    ctx.fillStyle = "#9ca3af";
    ctx.font = "14px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText("No data yet", w / 2, h / 2);
    return;
  }

  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) / 2 - 6;

  let startAngle = -Math.PI / 2;

  categories.forEach((cat) => {
    const value = totalsByCategory[cat];
    const sliceAngle = (value / grandTotal) * Math.PI * 2;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = CATEGORY_COLORS[cat] || "#6b7280";
    ctx.fill();

    startAngle = endAngle;

    // legend entry
    const pct = ((value / grandTotal) * 100).toFixed(1);
    const legendItem = document.createElement("div");
    legendItem.className = "legend-item";
    legendItem.innerHTML = `
      <span class="legend-swatch" style="background:${CATEGORY_COLORS[cat] || "#6b7280"}"></span>
      <span>${escapeHtml(cat)}: ৳${value.toFixed(2)} (${pct}%)</span>
    `;
    chartLegend.appendChild(legendItem);
  });

  // donut hole for aesthetics
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

// ==========================================================
// EXPORT CSV
// ==========================================================
exportBtn.addEventListener("click", () => {
  if (expenses.length === 0) {
    showToast("No expenses to export.");
    return;
  }

  const headers = ["Title", "Amount (BDT)", "Category", "Date", "Payment Method"];
  const rows = expenses.map((exp) => [
    csvEscape(exp.title),
    exp.amount.toFixed(2),
    csvEscape(exp.category),
    exp.date,
    csvEscape(exp.payment)
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `expenses_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast("CSV exported successfully.");
});

function csvEscape(value) {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ==========================================================
// TOAST NOTIFICATIONS
// ==========================================================
let toastTimeout;
function showToast(message) {
  clearTimeout(toastTimeout);
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  toastEl.style.opacity = "1";
  toastTimeout = setTimeout(() => {
    toastEl.style.opacity = "0";
    setTimeout(() => toastEl.classList.add("hidden"), 300);
  }, 2500);
}

// ==========================================================
// HELPERS
// ==========================================================
function formatDate(isoDate) {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderAll() {
  renderTable();
  renderSummary();
  renderChart();
}
