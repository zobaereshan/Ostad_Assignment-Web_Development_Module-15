# Personal Expense Tracker

A simple, fully client-side **Personal Expense Tracker** built with plain **HTML, CSS, and JavaScript**. It supports full **CRUD** functionality (Create, Read, Update, Delete) for managing daily expenses, along with a summary dashboard and a few bonus features.

No frameworks, no build tools, no backend — just open `index.html` in a browser.

---

## Features

### Core (CRUD)
- **Create** — Add a new expense with title, amount, category, date, and payment method.
- **Read** — View all expenses in a sortable, searchable table.
- **Update** — Click **Edit** on any row to load it into the form, then click **Update Expense** to save changes.
- **Delete** — Click **Delete** on any row; a confirmation dialog appears before the expense is removed.

### Form Fields
- Expense Title
- Amount (BDT)
- Category — Food, Transport, Shopping, Bills, Entertainment, Others
- Expense Date
- Payment Method — Cash, bKash, Nagad, Card

### Validation
- All fields are required.
- Amount must be a number greater than 0.
- Inline error messages appear under each invalid field.

### Summary Dashboard
Automatically calculated and updated on every change:
- Total Expenses
- Total Number of Transactions
- Highest Expense
- Lowest Expense
- Average Expense

### Bonus Features (implemented)
- **Local Storage** — All expenses persist across page reloads/browser restarts.
- **CSV Export** — Download all expenses as a `.csv` file.
- **Pie Chart** — Visual breakdown of spending by category, drawn with plain HTML5 Canvas (no external libraries), with a color-coded legend.
- **Clear All Expenses** — One-click button (with confirmation) to wipe all data.
- **Search** — Quickly filter the expense table by title.
- **Toast notifications** — Small feedback messages for add/update/delete/export actions.

---

## Folder Structure

```
expense-tracker/
│── index.html      # Markup: form, summary, table, dialogs
│── style.css        # Styling for the whole app
│── script.js         # All CRUD logic, storage, chart, CSV export
│── README.md        # This file
```

---

## How to Run

1. Download or clone this folder.
2. Open `index.html` directly in any modern web browser (Chrome, Firefox, Edge, Safari).
3. That's it — no server, no dependencies, no build step required.

---

## How to Use

1. **Add an expense**: Fill in all fields in the form and click **Add Expense**.
2. **Edit an expense**: Click **Edit** next to any row — the form populates automatically. Make your changes and click **Update Expense**.
3. **Delete an expense**: Click **Delete** next to a row and confirm in the dialog that appears.
4. **Search**: Type in the search box above the table to filter by title.
5. **Export data**: Click **Export CSV** to download all expenses as a spreadsheet-friendly file.
6. **Clear everything**: Click **Clear All** and confirm to remove every stored expense.
7. **View the chart**: The pie chart and legend on the right update automatically as you add, edit, or delete expenses.

---

## Notes on Data Storage

All data is stored in the browser's **Local Storage** under the key `expenseTrackerData`. This means:
- Data persists between visits on the same browser/device.
- Data is **not** shared across different browsers or devices.
- Clearing your browser's site data/local storage will remove all saved expenses.

---

## Tech Stack

- **HTML5** — semantic structure and form controls
- **CSS3** — flexbox/grid layout, responsive design, custom styling (no frameworks)
- **Vanilla JavaScript (ES6+)** — DOM manipulation, Local Storage API, Canvas API for the chart, Blob API for CSV export

---

## Author

Built as a submission for the "Personal Expense Tracker (CRUD)" assignment.
