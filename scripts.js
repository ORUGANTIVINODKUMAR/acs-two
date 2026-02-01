/********************************
 * DATA STORAGE (TEMP DB)
 ********************************/

function loadClients() {
  const data = localStorage.getItem("clients");
  return data ? JSON.parse(data) : [];
}
function getVal(id, isNumber = true) {
  const el = document.getElementById(id);
  if (!el) return isNumber ? 0 : "";
  return isNumber ? Number(el.value || 0) : el.value;
}
function getCurrentScenarioData() {
  const c = Number(localStorage.getItem("selectedClientIndex"));
  const s = Number(localStorage.getItem("selectedScenarioIndex"));
  return loadClients()?.[c]?.scenarios?.[s]?.data || {};
}

function saveClients(data) {
  localStorage.setItem("clients", JSON.stringify(data));
}

/********************************
 * GLOBAL STATE (Dashboard only)
 ********************************/

let clients = loadClients();
let selectedClientIndex = null;
let draftScenarioData = {};

/********************************
 * AUTH SCREENS (LOGIN / SIGNUP)
 ********************************/

function showSignup() {
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("signupBox").style.display = "block";
}

function showLogin() {
  document.getElementById("signupBox").style.display = "none";
  document.getElementById("loginBox").style.display = "block";
}

function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  localStorage.setItem("loggedIn", "true");
  window.location.href = "dashboard.html";
}

function signup() {
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  localStorage.setItem("loggedIn", "true");
  window.location.href = "dashboard.html";
}

function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "index.html";
}

/********************************
 * DASHBOARD – CLIENTS & SCENARIOS
 ********************************/

if (location.pathname.includes("dashboard.html")) {
  if (!localStorage.getItem("loggedIn")) {
    window.location.href = "index.html";
  }
  renderClients();
}

function addClient() {
  const name = document.getElementById("clientName").value.trim();
  if (!name) return alert("Enter client name");

  clients.push({ name, scenarios: [] });
  saveClients(clients);

  document.getElementById("clientName").value = "";
  renderClients();
}

function selectClient(index) {
  selectedClientIndex = index;

  document.getElementById("selectedClientTitle").innerText =
    "Client: " + clients[index].name;

  document.getElementById("addScenarioBtn").style.display = "inline-block";
  renderScenarios();
}

function addScenario() {
  if (selectedClientIndex === null) {
    alert("Select a client first");
    return;
  }

  const name = prompt("Enter scenario name");
  if (!name) return;

  clients[selectedClientIndex].scenarios.push({ name, data: {} });
  saveClients(clients);

  renderScenarios();
}

function renderClients() {
  const container = document.getElementById("clientList");
  if (!container) return;

  const search = document
    .getElementById("searchClient")
    ?.value.toLowerCase() || "";

  container.innerHTML = "";

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    container.innerHTML = "<p>No clients found</p>";
    return;
  }

  filtered.forEach((client, index) => {
    const actualIndex = clients.indexOf(client);

    const div = document.createElement("div");
    div.className =
      "client-card" +
      (actualIndex === selectedClientIndex ? " active" : "");

    div.innerHTML = `
      <strong>${client.name}</strong>
      <small>${client.scenarios.length} scenario(s)</small>
      <button onclick="renameClient(${actualIndex})">Rename</button>
      <button onclick="deleteClient(${actualIndex})">Delete</button>
    `;

    div.onclick = () => selectClient(actualIndex);
    container.appendChild(div);
  });
}
function renameClient(index) {
  const newName = prompt("Enter new client name", clients[index].name);
  if (!newName) return;

  clients[index].name = newName;
  saveClients(clients);
  renderClients();
}

function sortClients() {
  clients.sort((a, b) => a.name.localeCompare(b.name));
  saveClients(clients);
  renderClients();
}

function compareScenarios() {
  if (selectedClientIndex === null) {
    alert("Select a client first");
    return;
  }

  localStorage.setItem(
    "compareClientIndex",
    selectedClientIndex
  );

  window.location.href = "compare.html";
}
if (location.pathname.includes("compare.html")) {
  const clientIndex = Number(
    localStorage.getItem("compareClientIndex")
  );
  const clients = loadClients();
  const scenarios = clients[clientIndex].scenarios;

  const div = document.getElementById("comparison");

  scenarios.forEach(s => {
    div.innerHTML += `
      <div class="card">
        <strong>${s.name}</strong><br>
        Taxable Income: $${s.data?.taxableIncome || "—"}<br>
        Total Tax: $${s.data?.totalTax || "—"}
      </div>
    `;
  });
}


function renderScenarios() {
  const list = document.getElementById("scenarioList");
  if (!list || selectedClientIndex === null) return;

  list.innerHTML = "";

  const scenarios = clients[selectedClientIndex].scenarios;

  if (scenarios.length === 0) {
    list.innerHTML = "<p>No scenarios yet</p>";
    return;
  }

  scenarios.forEach((scenario, idx) => {
    const li = document.createElement("li");
    li.className = "scenario-item";

    li.innerHTML = `
      <span>${scenario.name}</span>
      <div>
        <button onclick="openScenario(${idx})">Open</button>
        <button onclick="renameScenario(${idx})">Rename</button>
        <button onclick="deleteScenario(${idx})">Delete</button>
      </div>
    `;

    list.appendChild(li);
  });
}

function renameScenario(index) {
  const scenario = clients[selectedClientIndex].scenarios[index];
  const newName = prompt("Enter new scenario name", scenario.name);
  if (!newName) return;

  scenario.name = newName;
  saveClients(clients);
  renderScenarios();
}


function deleteScenario(index) {
  if (!confirm("Delete this scenario?")) return;

  clients[selectedClientIndex].scenarios.splice(index, 1);
  saveClients(clients);
  renderScenarios();
}

function deleteClient(index) {
  if (!confirm("Delete this client and all scenarios?")) return;

  clients.splice(index, 1);
  selectedClientIndex = null;
  saveClients(clients);

  document.getElementById("selectedClientTitle").innerText = "Select a client";
  document.getElementById("addScenarioBtn").style.display = "none";
  document.getElementById("scenarioList").innerHTML = "";

  renderClients();
}


/********************************
 * SCENARIO PAGE
 ********************************/

function openScenario(index) {
  localStorage.setItem("selectedClientIndex", String(selectedClientIndex));
  localStorage.setItem("selectedScenarioIndex", String(index));
  window.location.href = "scenario.html";
}

function goBack() {
  window.location.href = "dashboard.html";
}

function saveScenario() {
  captureVisibleInputs();

  const clientIndex = Number(localStorage.getItem("selectedClientIndex"));
  const scenarioIndex = Number(localStorage.getItem("selectedScenarioIndex"));

  const allClients = loadClients();

  if (
    isNaN(clientIndex) ||
    isNaN(scenarioIndex) ||
    !allClients[clientIndex] ||
    !allClients[clientIndex].scenarios[scenarioIndex]
  ) {
    alert("Please open scenario from Dashboard");
    return false;
  }

  if (!draftScenarioData.taxYear || !draftScenarioData.filingStatus) {
    alert("Tax year and filing status are required");
    return false;
  }

  allClients[clientIndex].scenarios[scenarioIndex].data = {
    ...allClients[clientIndex].scenarios[scenarioIndex].data,
    ...draftScenarioData
  };


  saveClients(allClients);

  alert("Scenario saved successfully ✅");
  return true;
}


function toggleGroup(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = el.style.display === "none" ? "block" : "none";
}



/********************************
 * TAX SUMMARY
 ********************************/

if (location.pathname.includes("scenario.html")) {
  draftScenarioData = {
    ...getCurrentScenarioData()
  };
}




function calculateTax() {
  if (!saveScenario()) return;
  window.location.href = "summary.html";
}


function goBackToScenario() {
  window.location.href = "scenario.html";
}

function loadSummary() {
  const clientIndex = Number(localStorage.getItem("selectedClientIndex"));
  const scenarioIndex = Number(localStorage.getItem("selectedScenarioIndex"));

  const allClients = loadClients();
  const scenario = allClients?.[clientIndex]?.scenarios?.[scenarioIndex];

  if (!scenario || !scenario.data) {
    alert("No scenario data found");
    return;
  }

  const d = scenario.data;

  /* INCOME */
  const netBusinessIncome = Math.max(
    0,
    d.businessGross - d.businessExpenses
  );

  const totalIncome =
    d.wages +
    d.interest +
    (d.dividends || 0) +
    d.capitalGains +
    netBusinessIncome +
    netRentalIncome;


  /* DEDUCTIONS */
  const deductionByStatus = {
    single: 13850,
    mfj: 27700,
    mfs: 13850,
    hoh: 20800
  };

  let deduction = deductionByStatus[d.filingStatus] || 0;

  if (d.deductionType === "itemized") {
    deduction = Math.max(d.itemizedDeduction, deduction);
  }

  /* SELF EMPLOYMENT TAX */
  let seTax = 0;
  let seDeduction = 0;

  if (d.isSelfEmployed && netBusinessIncome > 0) {
    const seIncome = netBusinessIncome * 0.9235;
    seTax = seIncome * 0.153;
    seDeduction = seTax / 2;
  }
  const netRentalIncome = Math.max(
    0,
    (d.rentalIncome || 0) - (d.rentalExpenses || 0)
  );

  /* TAXABLE INCOME */
  const taxableIncome = Math.max(
    0,
    totalIncome - deduction - seDeduction
  );

  /* FEDERAL TAX */
  function calculateIncomeTax(income, status) {
    if (status === "mfj") {
      if (income <= 22000) return income * 0.10;
      if (income <= 89450)
        return 2200 + (income - 22000) * 0.12;
      return 10294 + (income - 89450) * 0.22;
    } else {
      if (income <= 11000) return income * 0.10;
      if (income <= 44725)
        return 1100 + (income - 11000) * 0.12;
      return 5147 + (income - 44725) * 0.22;
    }
  }

  const incomeTax = calculateIncomeTax(
    taxableIncome,
    d.filingStatus
  );

  /* TOTAL TAX */
  let totalTax = incomeTax + seTax;
  totalTax = Math.max(0, totalTax - d.childCredit);

  const stateRates = { CA: 0.06, NY: 0.058, TX: 0 };
  const stateTax =
    d.state && stateRates[d.state]
      ? taxableIncome * stateRates[d.state]
      : 0;

  totalTax += stateTax;

  /* SAVE FOR COMPARISON */
  scenario.data.taxableIncome = taxableIncome;
  scenario.data.totalTax = totalTax;
  saveClients(allClients);
  const totalWithheld =
    (d.withheldTax || 0) +
    (d.interestWithheld || 0) +
    (d.dividendsWithheld || 0);

  /* REFUND / BALANCE */
  const balance = totalWithheld - totalTax;


  /* UI */
  document.getElementById("sumWages").innerText = "$" + d.wages.toFixed(2);
  document.getElementById("sumInterest").innerText = "$" + d.interest.toFixed(2);
  document.getElementById("sumCapitalGains").innerText = "$" + d.capitalGains.toFixed(2);
  document.getElementById("sumBizGross").innerText = "$" + d.businessGross.toFixed(2);
  document.getElementById("sumBizExpenses").innerText = "$" + d.businessExpenses.toFixed(2);
  document.getElementById("sumBizNet").innerText = "$" + netBusinessIncome.toFixed(2);

  document.getElementById("sumSeDeduction").innerText = "$" + seDeduction.toFixed(2);
  document.getElementById("sumAGI").innerText = "$" + (totalIncome - seDeduction).toFixed(2);

  document.getElementById("sumDeductionType").innerText =
    d.deductionType === "itemized" ? "Itemized" : "Standard";

  document.getElementById("sumStandardDeduction").innerText =
    "$" + (deductionByStatus[d.filingStatus] || 0).toFixed(2);

  document.getElementById("sumItemizedDeduction").innerText =
    "$" + d.itemizedDeduction.toFixed(2);

  document.getElementById("sumIncomeTax").innerText = "$" + incomeTax.toFixed(2);
  document.getElementById("sumSeTax").innerText = "$" + seTax.toFixed(2);
  document.getElementById("sumChildCredit").innerText = "$" + d.childCredit.toFixed(2);

  document.getElementById("sumWithheld").innerText = "$" + d.withheldTax.toFixed(2);
  document.getElementById("sumPayments").innerText = "$" + d.withheldTax.toFixed(2);

  document.getElementById("totalIncome").innerText =
    "$" + totalIncome.toFixed(2);

  document.getElementById("taxableIncome").innerText =
    "$" + taxableIncome.toFixed(2);

  document.getElementById("estimatedTax").innerText =
    "$" + totalTax.toFixed(2);

  document.getElementById("finalResult").innerText =
    balance >= 0
      ? `Refund Due: $${balance.toFixed(2)}`
      : `Balance Due: $${Math.abs(balance).toFixed(2)}`;
}

if (location.pathname.includes("summary.html")) {
  loadSummary();
}

function captureVisibleInputs() {
  const fields = [
    "taxYear",
    "filingStatus",
    "wages",
    "interest",
    "interestWithheld",      // 🆕
    "dividends",             // 🆕
    "qualifiedDividends",    // 🆕
    "dividendsWithheld",     // 🆕
    "capitalGains",
    "businessGross",
    "businessExpenses",
    "rentalIncome",          // 🆕
    "rentalExpenses",        // 🆕
    "withheldTax",
    "childCredit",
    "itemizedDeduction",
    "state"
  ];


  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      draftScenarioData[id] =
        el.type === "number" ? Number(el.value || 0) : el.value;
    }
  });
  // Itemized deduction components
  ["propertyTax", "mortgageInterest", "charity"].forEach(id => {
   const el = document.getElementById(id);
   if (el) {
     draftScenarioData[id] = Number(el.value || 0);
   }
  });

  // Auto-calculate total itemized deduction
  draftScenarioData.itemizedDeduction =
    (draftScenarioData.propertyTax || 0) +
    (draftScenarioData.mortgageInterest || 0) +
    (draftScenarioData.charity || 0);

  const se = document.getElementById("isSelfEmployed");
  if (se) draftScenarioData.isSelfEmployed = se.checked;

  const ded = document.querySelector('input[name="deductionType"]:checked');
  if (ded) draftScenarioData.deductionType = ded.value;
}

function showSection(section) {
  captureVisibleInputs(); // ⭐ CRITICAL LINE

  const area = document.getElementById("contentArea");

  const d = {
    ...getCurrentScenarioData(),
    ...draftScenarioData
  };

  if (section === "basic") {
    area.innerHTML = `
      <div class="form-card">
        <h3>Basic Information</h3>

        <label>Tax Year</label>
        <input id="taxYear" type="number" value="${d.taxYear || 2024}">

        <label>Filing Status</label>
        <select id="filingStatus">
          <option value="">Select filing status</option>
          <option value="single" ${d.filingStatus === "single" ? "selected" : ""}>Single</option>
          <option value="mfj" ${d.filingStatus === "mfj" ? "selected" : ""}>Married Filing Jointly</option>
          <option value="mfs" ${d.filingStatus === "mfs" ? "selected" : ""}>Married Filing Separately</option>
          <option value="hoh" ${d.filingStatus === "hoh" ? "selected" : ""}>Head of Household</option>
        </select>
      </div>
    `;
  }

  if (section === "w2") {
    area.innerHTML = `
      <div class="form-card">
        <h3>W-2 Wages</h3>

        <label>Box 1 Wages</label>
        <input id="wages" type="number" value="${d.wages || ""}">

        <label>Federal Withholding</label>
        <input id="withheldTax" type="number" value="${d.withheldTax || ""}">
      </div>
    `;
  }

  if (section === "interest") {
    area.innerHTML = `
      <div class="form-card">
        <h3>1099-INT</h3>

        <label>Interest Income (Box 1)</label>
        <input id="interest" type="number" value="${d.interest || ""}">

        <label>Federal Tax Withheld (Box 4)</label>
        <input id="interestWithheld" type="number" value="${d.interestWithheld || ""}">
      </div>
    `;
  }

  if (section === "dividends") {
    area.innerHTML = `
      <div class="form-card">
        <h3>1099-DIV – Dividends</h3>

        <label>Ordinary Dividends</label>
        <input id="dividends" type="number" value="${d.dividends || ""}">

        <label>Qualified Dividends</label>
        <input id="qualifiedDividends" type="number" value="${d.qualifiedDividends || ""}">

        <label>Federal Tax Withheld</label>
        <input id="dividendsWithheld" type="number" value="${d.dividendsWithheld || ""}">
      </div>
    `;
  }

  if (section === "scheduleC") {
    area.innerHTML = `
      <div class="form-card">
        <h3>Schedule C</h3>

        <label>Gross Income</label>
        <input id="businessGross" type="number" value="${d.businessGross || ""}">

        <label>Expenses</label>
        <input id="businessExpenses" type="number" value="${d.businessExpenses || ""}">

        <label>
          <input type="checkbox" id="isSelfEmployed" ${d.isSelfEmployed ? "checked" : ""}>
          Apply Self-Employment Tax
        </label>
      </div>
    `;
  }
  if (section === "scheduleE") {
    area.innerHTML = `
      <div class="form-card">
        <h3>Schedule E – Rental Income</h3>

        <label>Gross Rental Income</label>
        <input id="rentalIncome" type="number" value="${d.rentalIncome || ""}">

        <label>Rental Expenses</label>
        <input id="rentalExpenses" type="number" value="${d.rentalExpenses || ""}">
      </div>
    `;
  }

  if (section === "capitalGains") {
    area.innerHTML = `
      <div class="form-card">
        <h3>Capital Gains</h3>

        <label>Net Capital Gains</label>
        <input id="capitalGains" type="number" value="${d.capitalGains || ""}">
      </div>
    `;
  }

  if (section === "deductions") {
    area.innerHTML = `
      <div class="form-card">
        <h3>Deductions (Schedule A)</h3>

        <label>
          <input type="radio" name="deductionType" value="standard"
            ${!d.deductionType || d.deductionType === "standard" ? "checked" : ""}
            onclick="toggleItemized(false)">
          Standard Deduction
        </label>

        <label>
          <input type="radio" name="deductionType" value="itemized"
            ${d.deductionType === "itemized" ? "checked" : ""}
            onclick="toggleItemized(true)">
          Itemized Deduction
        </label>

        <div id="itemizedSection" style="display:${d.deductionType === "itemized" ? "block" : "none"}; margin-top:15px;">

          <h4>Itemized Deductions</h4>

          <label>Property Taxes (SALT)</label>
          <input id="propertyTax" type="number" value="${d.propertyTax || ""}">

          <label>Mortgage Interest</label>
          <input id="mortgageInterest" type="number" value="${d.mortgageInterest || ""}">

          <label>Charitable Donations</label>
          <input id="charity" type="number" value="${d.charity || ""}">

          <label>Total Itemized Deduction</label>
          <input id="itemizedDeduction" type="number" readonly
            value="${d.itemizedDeduction || 0}">
        </div>
      </div>
    `;
  }


  if (section === "credits") {
    area.innerHTML = `
      <div class="form-card">
        <h3>Credits</h3>

        <label>Child Tax Credit</label>
        <input id="childCredit" type="number" value="${d.childCredit || ""}">
      </div>
    `;
  }

  if (section === "state") {
    area.innerHTML = `
      <div class="form-card">
        <h3>State</h3>

        <label>State</label>
        <select id="state">
          <option value="">None</option>
          <option value="CA" ${d.state === "CA" ? "selected" : ""}>California</option>
          <option value="NY" ${d.state === "NY" ? "selected" : ""}>New York</option>
          <option value="TX" ${d.state === "TX" ? "selected" : ""}>Texas</option>
        </select>
      </div>
    `;
  }
}
function toggleItemized(show) {
  const section = document.getElementById("itemizedSection");
  if (!section) return;

  section.style.display = show ? "block" : "none";

  if (!show) {
    draftScenarioData.propertyTax = 0;
    draftScenarioData.mortgageInterest = 0;
    draftScenarioData.charity = 0;
    draftScenarioData.itemizedDeduction = 0;
  }
}
