const Modal = {
  toggleActive() {
    document.querySelector(".modal-overlay").classList.toggle("active");
  },
};
const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("transactions")) || [];
  },
  set(transactions) {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  },
};
const Transaction = {
  all: Storage.get(),

  add(transaction) {
    this.all.push(transaction);
    App.reload();
  },
  remove(index) {
    this.all.splice(index, 1);
    App.reload();
  },
  incomes() {
    let income = 0;
    this.all.forEach((transaction) => {
      if (transaction.amount > 0) income += transaction.amount;
    });
    return income;
  },
  expanses() {
    let expense = 0;
    this.all.forEach((transaction) => {
      if (transaction.amount <= 0) expense += transaction.amount;
    });
    return expense;
  },
  total() {
    return this.incomes() + this.expanses();
  },
};
const DOM = {
  transactionContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");

    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;
    DOM.transactionContainer.appendChild(tr);
  },
  innerHTMLTransaction(transaction, index) {
    const CSSClass = transaction.amount > 0 ? "income" : "expanse";
    const amount = Utils.formatCurrency(transaction.amount);
    const total =
      CSSClass === "income" ? amount.value : amount.signal + amount.value;
    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSClass}">${total}</td>
      <td class="date">${transaction.date}</td>
      <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remove Transaction"></td>
    `;
    return html;
  },
  updateBalance() {
    const income = Utils.formatCurrency(Transaction.incomes()).value;
    const expense = Utils.formatCurrency(Transaction.expanses()).value;
    const total = Utils.formatCurrency(Transaction.total());
    const result = total.signal + total.value;

    const incomeDisplay = document.getElementById("incomeDisplay");
    const expenseDisplay = document.getElementById("expenseDisplay");
    const totalDisplay = document.getElementById("totalDisplay");

    incomeDisplay.innerHTML = income;
    expenseDisplay.innerHTML = expense;
    totalDisplay.innerHTML = result;

    totalDisplay.style.color =
      Number(Transaction.total()) < 0 ? "var(--dark-red)" : "white";
  },
  clearTransactions() {
    this.transactionContainer.innerHTML = "";
  },
};
const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";
    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;
    value = value.toLocaleString("us", { style: "currency", currency: "USD" });
    return { value, signal };
    // Expressão regular: // = abrir expreção
    // g = selecionar tudo
    // \D = tudo o que não for número
  },
  formatAmount(value) {
    // Number(value.replace(/\,?\.?/g, "")) // Subistituir pontos e virgulas
    return Math.round(value * 100);
  },
  formatDate(date) {
    const splittedDate = date.split("-");
    
    return `${splittedDate[1]}/${splittedDate[2]}/${splittedDate[0]}`;
  },
};
const Form = {
  description: document.getElementById("description"),
  amount: document.getElementById("amount"),
  date: document.getElementById("date"),

  getValues() {
    return {
      description: this.description.value,
      amount: this.amount.value,
      date: this.date.value,
    };
  },
  validateFields() {
    const { description, amount, date } = this.getValues();

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Please fill in all fields.");
    }
  },
  formatValues() {
    let { description, amount, date } = this.getValues();
    console.log(date);
    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);
    console.log(date);

    return { description, amount, date };
  },
  saveTransaction(transaction) {
    Transaction.add(transaction);
  },
  clearFields() {
    const form = [this.description, this.amount, this.date];
    form.forEach((field) => (field.value = ""));
  },
  submit(event) {
    event.preventDefault();
    try {
      this.validateFields();

      const transaction = this.formatValues();
      this.saveTransaction(transaction);
      this.clearFields();
      Modal.toggleActive();
    } catch (error) {
      alert(error.message);
    }
  },
};
const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);
    // Transaction.all.forEach((transaction, index) => DOM.addTransaction(transaction, index));
    DOM.updateBalance();
    Storage.set(Transaction.all);
  },
  reload() {
    DOM.clearTransactions();
    this.init();
  },
};

App.init();
