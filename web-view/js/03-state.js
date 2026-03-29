// ============================================
// APP STATE
// ============================================
const State = {
  transactions: [],
  banks: [],
  banksMap: new Map(),
  accounts: [],
  failedLogs: [],
  categories: [], // manual overrides: [{txId, category}]
  categoryRules: [], // auto-rules: [{receiver, category}]
  categoryMap: new Map(), // txId → category name (merged)
  customCategories: [], // user-defined categories: [{name, color}]
  budgets: [],
  budgetGroups: [],
  budgetMonth: null,
  budgetDetail: null,
  budgetCollapsed: {},
  reasons: [], // [{txId, reason}]
  reasonMap: new Map(), // txId → reason string
  receiverNames: [], // [{txId, name}]
  receiverNameMap: new Map(), // txId → custom receiver name
  profiles: [], // [{id, name, accounts, order}]
  activeProfileId: null, // null = "All", or a profile id
  settings: { theme: null },
  onboarding: false,
  onboardingStep: 0,
  smsPatterns: [],
  contacts: [],
  contactSearch: "",
  accountOverrides: [],
  accountOverrideMap: new Map(),
  ledgerGrouped: false, // whether ledger grouped mode is on
  ledgerAccounts: [], // selected account numbers in grouped mode, empty = all
  currentTool: null,
  currentScreen: "home",
  currentTab: "activity",
  currentSubtab: "transactions",
  selectedBank: null,
  balanceVisible: false,
  searchQuery: "",
  theme: null, // null = system, 'dark', 'light'
  homeChartPeriod: "7D", // "7D" or "30D"
  chartType: "heatmap", // "line", "bar", "pie", "heatmap"
  chartFilter: "all", // "all", "expense", "income"
  expenseChartType: "bar", // "bar", "bubble"
  expenseChartPeriod: "weekly", // "weekly", "monthly"
  heatmapMonth: null, // Date object for first of displayed month
  // Filter state
  filters: {
    type: "all", // 'all', 'expense', 'income'
    bankIds: [], // array of selected bank IDs
    accounts: [], // array of selected account numbers
    categories: [], // array of selected category names
    dateStart: null,
    dateEnd: null,
  },
};

// ============================================
// DATA PROCESSING
// ============================================
function initializeData() {
  // Read data from <script type="application/json"> tags injected by totals.js
  // (or empty if running in dev/browser without data)
  var onboardingEl = document.getElementById("_donboarding");
  State.onboarding = onboardingEl ? onboardingEl.textContent.trim() === "true" : false;
  if (onboardingEl) onboardingEl.remove();

  var txEl = document.getElementById("_dtx");
  var banksEl = document.getElementById("_dbanks");
  var failedEl = document.getElementById("_dfailed");
  var accountsEl = document.getElementById("_daccounts");
  var categoriesEl = document.getElementById("_dcategories");
  var rulesEl = document.getElementById("_drules");
  var customCatsEl = document.getElementById("_dcustomcats");
  var budgetsEl = document.getElementById("_dbudgets");
  var contactsEl = document.getElementById("_dcontacts");
  var accountOverridesEl = document.getElementById("_daccountoverrides");
  var receiverNamesEl = document.getElementById("_dreceivernames");
  var reasonsEl = document.getElementById("_dreasons");
  var smsPatternsEl = document.getElementById("_dsmspatterns");
  var profilesEl = document.getElementById("_dprofiles");
  var settingsEl = document.getElementById("_dsettings");

  var txRaw = txEl ? txEl.textContent : "";
  var banksRaw = banksEl ? banksEl.textContent : '{"banks":[]}';
  var failedRaw = failedEl ? failedEl.textContent : "";
  var accountsRaw = accountsEl ? accountsEl.textContent : "";
  var categoriesRaw = categoriesEl ? categoriesEl.textContent : "";
  var rulesRaw = rulesEl ? rulesEl.textContent : "";
  var customCatsRaw = customCatsEl ? customCatsEl.textContent : "";
  var budgetsRaw = budgetsEl ? budgetsEl.textContent : "";
  var contactsRaw = contactsEl ? contactsEl.textContent : "";
  var accountOverridesRaw = accountOverridesEl ? accountOverridesEl.textContent : "";
  var receiverNamesRaw = receiverNamesEl ? receiverNamesEl.textContent : "";
  var reasonsRaw = reasonsEl ? reasonsEl.textContent : "";
  var smsPatternsRaw = smsPatternsEl ? smsPatternsEl.textContent : '{"patterns":[]}';
  var profilesRaw = profilesEl ? profilesEl.textContent : "";
  var settingsRaw = settingsEl ? settingsEl.textContent : "";

  // Clean up data elements from DOM
  if (txEl) txEl.remove();
  if (banksEl) banksEl.remove();
  if (failedEl) failedEl.remove();
  if (accountsEl) accountsEl.remove();
  if (categoriesEl) categoriesEl.remove();
  if (rulesEl) rulesEl.remove();
  if (customCatsEl) customCatsEl.remove();
  if (budgetsEl) budgetsEl.remove();
  if (contactsEl) contactsEl.remove();
  if (accountOverridesEl) accountOverridesEl.remove();
  if (receiverNamesEl) receiverNamesEl.remove();
  if (reasonsEl) reasonsEl.remove();
  if (smsPatternsEl) smsPatternsEl.remove();
  if (profilesEl) profilesEl.remove();
  if (settingsEl) settingsEl.remove();

  // Parse raw data
  const rawTx = Parser.parseNDJSON(txRaw);
  const banksData = Parser.parseBanks(banksRaw);
  State.failedLogs = Parser.parseFailed(failedRaw);
  State.accounts = Parser.parseNDJSON(accountsRaw);
  State.categoryRules = Parser.parseNDJSON(rulesRaw);
  State.categories = Parser.parseNDJSON(categoriesRaw);
  State.customCategories = Parser.parseNDJSON(customCatsRaw);
  State.contacts = Parser.parseNDJSON(contactsRaw);
  State.accountOverrides = Parser.parseNDJSON(accountOverridesRaw);
  State.receiverNames = Parser.parseNDJSON(receiverNamesRaw);
  State.reasons = Parser.parseNDJSON(reasonsRaw);
  try { State.smsPatterns = JSON.parse(smsPatternsRaw).patterns || []; } catch (e) { State.smsPatterns = []; }
  State.profiles = Parser.parseNDJSON(profilesRaw);
  State.profiles.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  try {
    var ws = settingsRaw ? JSON.parse(settingsRaw) : {};
    State.settings = { theme: ws.theme || null, onboarding: ws.onboarding || null, widgetProfiles: ws.widgetProfiles || [] };
  } catch (e) { State.settings = { theme: null, onboarding: null, widgetProfiles: [] }; }

  // Restore active profile from localStorage
  try {
    var savedProfile = localStorage.getItem("totals-active-profile");
    if (savedProfile && State.profiles.some(function(p) { return p.id === savedProfile; })) {
      State.activeProfileId = savedProfile;
    } else {
      State.activeProfileId = null;
    }
  } catch (e) {
    State.activeProfileId = null;
  }

  // Build account override map: txId → account object
  State.accountOverrideMap.clear();
  for (var oi = 0; oi < State.accountOverrides.length; oi++) {
    var ov = State.accountOverrides[oi];
    if (!ov.txId || !ov.accountNumber || !ov.bankId) continue;
    for (var ai = 0; ai < State.accounts.length; ai++) {
      var acc = State.accounts[ai];
      if (acc.number === ov.accountNumber && String(acc.bankId) === String(ov.bankId)) {
        State.accountOverrideMap.set(ov.txId, acc);
        break;
      }
    }
  }

  // Build receiver name map: txId → custom name
  State.receiverNameMap.clear();
  for (var rni = 0; rni < State.receiverNames.length; rni++) {
    var rn = State.receiverNames[rni];
    if (rn.txId && rn.name) State.receiverNameMap.set(rn.txId, rn.name);
  }

  // Build reason map: txId → reason string
  State.reasonMap.clear();
  for (var ri = 0; ri < State.reasons.length; ri++) {
    var r = State.reasons[ri];
    if (r.txId && r.reason) State.reasonMap.set(r.txId, r.reason);
  }

  // Parse budgets — split by type field into budgets and budgetGroups
  var budgetData = Parser.parseNDJSON(budgetsRaw);
  State.budgets = [];
  State.budgetGroups = [];
  for (var i = 0; i < budgetData.length; i++) {
    if (budgetData[i].type === "group") {
      State.budgetGroups.push(budgetData[i]);
    } else if (budgetData[i].type === "budget") {
      State.budgets.push(budgetData[i]);
    }
  }
  // Initialize default groups if none exist
  if (State.budgetGroups.length === 0) {
    State.budgetGroups = [
      { type: "group", name: "Needs", order: 0 },
      { type: "group", name: "Wants", order: 1 },
      { type: "group", name: "Savings", order: 2 },
    ];
  }
  State.budgetGroups.sort(function (a, b) { return a.order - b.order; });

  // Migrate old budget format (single category) to new format (multi-category with id)
  var needsMigration = false;
  for (var mi = 0; mi < State.budgets.length; mi++) {
    var ob = State.budgets[mi];
    if (ob.category && !ob.categories) {
      ob.id = "b-" + ob.category.replace(/\s+/g, "-").toLowerCase();
      ob.name = ob.category;
      ob.categories = [ob.category];
      ob.recurring = true;
      ob.month = null;
      ob.overrides = [];
      delete ob.category;
      needsMigration = true;
    }
  }
  if (needsMigration) {
    setTimeout(persistBudgets, 0);
  }

  // Initialize budgetMonth to current month
  var now = new Date();
  State.budgetMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Build banks map
  State.banks = banksData.banks || [];
  State.banksMap.clear();
  for (const bank of State.banks) {
    State.banksMap.set(String(bank.id), bank);
  }

  // Process transactions - join with banks
  State.transactions = rawTx
    .map((tx, index) => {
      const bank = tx.bankId
        ? State.banksMap.get(String(tx.bankId))
        : null;
      const receiver = tx.receiver || "Unknown";
      // Determine expense/income: check type field first, fall back to receiver heuristic
      const isExpense = tx.type
        ? tx.type === "DEBIT"
        : receiver && receiver.trim() !== "" && receiver !== "Unknown";
      return {
        id: tx.reference || `tx-${index}`,
        type: tx.type || null,
        isExpense: isExpense,
        amount: Parser.parseAmount(tx.amount),
        reference: tx.reference || "N/A",
        account: tx.account || "",
        receiver: receiver,
        vat: Parser.parseAmount(tx.vat),
        totalFees: Parser.parseAmount(tx.totalFees),
        serviceCharge: Parser.parseAmount(tx.serviceCharge),
        balance: Parser.parseAmount(tx.balance),
        bankId: tx.bankId || null,
        timestamp: tx.timestamp ? new Date(tx.timestamp) : null,
        bank: bank,
        bankName: bank ? bank.shortName : "Unknown",
        bankColors: bank ? bank.colors : ["#6b7280", "#4b5563"],
        profileId: tx.profileId || null,
      };
    })
    .sort((a, b) => {
      if (!a.timestamp && !b.timestamp) return 0;
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return b.timestamp - a.timestamp;
    });

  // Migrate old category overrides: {txId, category} → {txId, categories: [...]}
  var needsCatMigration = false;
  for (var ci = 0; ci < State.categories.length; ci++) {
    var co = State.categories[ci];
    if (co.category && !co.categories) {
      co.categories = [co.category];
      delete co.category;
      needsCatMigration = true;
    }
  }
  if (needsCatMigration) {
    setTimeout(persistCategories, 0);
  }

  // Apply category rules (receiver match → category)
  // categoryMap: txId → string[] (array of category names)
  State.categoryMap.clear();
  for (const rule of State.categoryRules) {
    if (!rule.receiver || !rule.category) continue;
    const receiverLower = rule.receiver.toLowerCase();
    for (const tx of State.transactions) {
      if (tx.receiver && tx.receiver.toLowerCase() === receiverLower) {
        var existing = State.categoryMap.get(tx.id);
        if (existing) {
          if (existing.indexOf(rule.category) === -1) existing.push(rule.category);
        } else {
          State.categoryMap.set(tx.id, [rule.category]);
        }
      }
    }
  }

  // Apply manual overrides (replace entire set for that txId)
  for (const cat of State.categories) {
    if (cat.txId && cat.categories) {
      State.categoryMap.set(cat.txId, cat.categories.slice());
    }
  }

  // Set tx.categories on each transaction (array of strings)
  for (const tx of State.transactions) {
    tx.categories = State.categoryMap.get(tx.id) || [];
  }

  // Resolve accounts for each transaction
  for (var i = 0; i < State.transactions.length; i++) {
    State.transactions[i].resolvedAccount = resolveAccountForTransaction(State.transactions[i]);
  }
}

function refreshTransactions(txRaw) {
  var rawTx = Parser.parseNDJSON(txRaw);
  State.transactions = rawTx
    .map(function (tx, index) {
      var bank = tx.bankId ? State.banksMap.get(String(tx.bankId)) : null;
      var receiver = tx.receiver || "Unknown";
      var isExpense = tx.type
        ? tx.type === "DEBIT"
        : receiver && receiver.trim() !== "" && receiver !== "Unknown";
      return {
        id: tx.reference || "tx-" + index,
        type: tx.type || null,
        isExpense: isExpense,
        amount: Parser.parseAmount(tx.amount),
        reference: tx.reference || "N/A",
        account: tx.account || "",
        receiver: receiver,
        vat: Parser.parseAmount(tx.vat),
        totalFees: Parser.parseAmount(tx.totalFees),
        serviceCharge: Parser.parseAmount(tx.serviceCharge),
        balance: Parser.parseAmount(tx.balance),
        bankId: tx.bankId || null,
        timestamp: tx.timestamp ? new Date(tx.timestamp) : null,
        bank: bank,
        bankName: bank ? bank.shortName : "Unknown",
        bankColors: bank ? bank.colors : ["#6b7280", "#4b5563"],
        profileId: tx.profileId || null,
      };
    })
    .sort(function (a, b) {
      if (!a.timestamp && !b.timestamp) return 0;
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return b.timestamp - a.timestamp;
    });

  // Re-apply category rules
  State.categoryMap.clear();
  for (var ri = 0; ri < State.categoryRules.length; ri++) {
    var rule = State.categoryRules[ri];
    if (!rule.receiver || !rule.category) continue;
    var receiverLower = rule.receiver.toLowerCase();
    for (var ti = 0; ti < State.transactions.length; ti++) {
      var t = State.transactions[ti];
      if (t.receiver && t.receiver.toLowerCase() === receiverLower) {
        var existing = State.categoryMap.get(t.id);
        if (existing) {
          if (existing.indexOf(rule.category) === -1) existing.push(rule.category);
        } else {
          State.categoryMap.set(t.id, [rule.category]);
        }
      }
    }
  }
  // Re-apply manual overrides
  for (var ci = 0; ci < State.categories.length; ci++) {
    var cat = State.categories[ci];
    if (cat.txId && cat.categories) {
      State.categoryMap.set(cat.txId, cat.categories.slice());
    }
  }
  // Set categories on each transaction
  for (var ti = 0; ti < State.transactions.length; ti++) {
    State.transactions[ti].categories = State.categoryMap.get(State.transactions[ti].id) || [];
  }
  // Re-resolve accounts
  for (var ti = 0; ti < State.transactions.length; ti++) {
    State.transactions[ti].resolvedAccount = resolveAccountForTransaction(State.transactions[ti]);
  }
}

function resolveAccountForTransaction(tx) {
  var bankId = String(tx.bankId);
  var bank = State.banksMap.get(bankId);
  if (!bank) return null;

  var bankAccounts = State.accounts.filter(function(a) {
    return String(a.bankId) === bankId;
  });
  if (bankAccounts.length === 0) return null;

  // Non-uniform or SIM-based: check manual override first, then default account
  if (!bank.uniformMasking || bank.simBased) {
    var override = State.accountOverrideMap.get(tx.id || tx.reference);
    if (override) return override;
    var defaultAcc = bankAccounts.find(function(a) { return a.isDefault; });
    return defaultAcc || bankAccounts[0];
  }

  // Uniform masking: match by last N digits
  var digits = bank.maskPattern + 1; // 2→3, 3→4, 4→5
  var txNum = (tx.account || '').replace(/\D/g, '');
  var txSuffix = txNum.slice(-digits);
  if (!txSuffix) return null;

  for (var i = 0; i < bankAccounts.length; i++) {
    var accNum = (bankAccounts[i].number || '').replace(/\D/g, '');
    if (accNum.slice(-digits) === txSuffix) return bankAccounts[i];
  }

  return null;
}

function reResolveAccounts() {
  for (var i = 0; i < State.transactions.length; i++) {
    State.transactions[i].resolvedAccount = resolveAccountForTransaction(State.transactions[i]);
  }
}

