const balanceEl = document.getElementById("balance");
const moneyPlus = document.getElementById("money-plus");
const moneyMinus = document.getElementById("money-minus");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const list = document.getElementById("list");
const toggleBtn = document.getElementById("theme-toggle");
const search = document.getElementById("search");

let transactions = [];
let chart;

/* Load Data */
window.addEventListener("DOMContentLoaded", () => {
    const data = JSON.parse(localStorage.getItem("transactions"));
    transactions = Array.isArray(data) ? data : [];

    renderTransactions();

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
    }
});

/* Dark Mode */
toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
});

search.addEventListener("input", () => {
    const value = search.value.toLowerCase();
    if (value === "") {
        renderTransactions();
        return;
    }
    const filtered = transactions.filter(t =>
        t.name.toLowerCase().includes(value)
    );
    renderFiltered(filtered);
});

/* Save */
function saveToLocal() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

/* Render Transactions */
function renderTransactions() {
    list.innerHTML = "";

    if (transactions.length === 0) {
        list.innerHTML = `
            <p style="text-align:center; opacity:0.7;">
                No transactions yet 😔
            </p>`;
        updateValues();
        return;
    }
transactions.forEach(t => {
    const li = document.createElement("li");
    li.className = `item ${t.amount > 0 ? "money-plus" : "money-minus"}`;

    li.innerHTML = `
        <div>
            <strong>${t.name}</strong> (${t.category})
            <br>
            <small>${t.date}</small>
        </div>
        <span>
            ${t.amount > 0 ? '+' : '-'}
            ${Math.abs(t.amount).toLocaleString('en-IN',{style:'currency',currency:'INR'})}
        </span>
    `;

    const delBtn = document.createElement("button");
    delBtn.className = "delBtn";
    delBtn.innerText = "X";

    delBtn.onclick = () => {
        transactions = transactions.filter(tx => tx.id !== t.id);
        saveToLocal();
        renderTransactions();
    };

    const editBtn = document.createElement("button");
    editBtn.className = "editBtn";
    editBtn.innerText = "Edit";

    editBtn.onclick = () => {
        text.value = t.name;
        amount.value = t.amount;
        category.value = t.category;

        transactions = transactions.filter(tx => tx.id !== t.id);
        saveToLocal();
        renderTransactions();
    };

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "5px";

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(actions);

    list.appendChild(li);
});
    updateValues(); 
}

/* Update Balance */
function updateValues() {
    let income = 0, expense = 0;

    transactions.forEach(t => {
        t.amount > 0 ? income += t.amount : expense += Math.abs(t.amount);
    });

    balanceEl.innerText = (income - expense).toLocaleString('en-IN',{style:'currency',currency:'INR'});
    moneyPlus.innerText = income.toLocaleString('en-IN',{style:'currency',currency:'INR'});
    moneyMinus.innerText = expense.toLocaleString('en-IN',{style:'currency',currency:'INR'});

    renderChart(income, expense);
}

/* Add Transaction */
form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!text.value || !amount.value) {
        alert("Fill all fields");
        return;
    }

    transactions.push({
        id: Date.now(),
        name: text.value,
        amount: Number(amount.value),
        category: category.value,
        date: new Date().toLocaleDateString()
    });

    saveToLocal();
    renderTransactions();
    form.reset();
});

/* Chart */
function renderChart(income, expense){
    const canvas = document.getElementById("chart");
    if(!canvas) return;

    if(chart) chart.destroy();

    chart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: ["Income", "Expense"],
            datasets: [{
                data: [income, expense],
                backgroundColor: ["#2ecc71", "#e74c3c"]
            }]
        }
    });
}

function renderFiltered(data){
    list.innerHTML = "";

    if(data.length === 0){
        list.innerHTML = `
            <p style="text-align:center; opacity:0.7;">
                No results found 😕
            </p>`;
        return;
    }

    data.forEach(t => {
        const li = document.createElement("li");
        li.className = "item";

        li.innerHTML = `${t.name} - ₹${t.amount}`;
        list.appendChild(li);
    });
}