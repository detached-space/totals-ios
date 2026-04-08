// ============================================
// UI UPDATES
// ============================================
function updateDashboard() {
  const balance = Analytics.getTotalBalance();
  const outflow = Analytics.getOutflow();
  const inflow = Analytics.getInflow();
  const today = Analytics.getToday();
  const week = Analytics.getThisWeek();

  DOM.$("#total-balance").textContent = Format.masked(
    Format.currency(balance),
  );

  DOM.$("#today-income").textContent =
    Format.masked("+ " + Format.compact(today.income));
  DOM.$("#today-expense").textContent =
    Format.masked("- " + Format.compact(today.expense));
  DOM.$("#week-income").textContent = Format.masked("+ " + Format.compact(week.income));
  DOM.$("#week-expense").textContent =
    Format.masked("- " + Format.compact(week.expense));

  // Insight
  const savingsRate =
    inflow > 0 ? (((inflow - outflow) / inflow) * 100).toFixed(0) : 0;
  DOM.$("#insight-text").textContent =
    savingsRate > 0
      ? `You're on track to save ETB ${Format.currency(inflow - outflow).replace("ETB ", "")} this period, that's ${savingsRate}% of your income.`
      : getProfileTransactions().length > 0
        ? `Your expenses are exceeding your income. Consider reviewing your spending.`
        : `No transactions yet. Your spending insights will appear here.`;

  // Recent transactions (today only)
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const todayTx = getProfileTransactions().filter((tx) => {
    if (!tx.timestamp) return false;
    var txDate = new Date(tx.timestamp);
    txDate.setHours(0, 0, 0, 0);
    return txDate.getTime() === todayDate.getTime();
  });
  const recent = todayTx.slice(0, 5);
  DOM.$("#recent-count").textContent = recent.length;
  const recentContainer = DOM.$("#recent-transactions");
  if (recent.length === 0) {
    recentContainer.innerHTML =
      '<div class="empty-state"><div class="empty-state-title">No transactions today</div></div>';
  } else {
    const fragment = document.createDocumentFragment();
    for (const tx of recent) {
      fragment.appendChild(Render.transactionItem(tx));
    }
    recentContainer.innerHTML = "";
    recentContainer.appendChild(fragment);
  }

  // Draw home chart
  setTimeout(drawHomeChart, 100);
}

function drawHomeChart() {
  const canvas = DOM.$("#home-chart-canvas");
  if (!canvas) return;
  drawChartOnCanvas(canvas);
}

function updateActivityTab() {
  // Use filtered transactions for analytics when filters are active
  const filtered = getFilteredTransactions();

  const expenseTx = filtered.filter((tx) => tx.isExpense);
  const incomeTx = filtered.filter((tx) => !tx.isExpense);

  // Calculate from filtered data
  const outflow = expenseTx.reduce((sum, tx) => sum + tx.amount, 0);
  const inflow = incomeTx.reduce((sum, tx) => sum + tx.amount, 0);
  const fees = filtered.reduce(
    (sum, tx) => sum + tx.vat + tx.serviceCharge + tx.totalFees,
    0,
  );

  // Calculate health score from filtered data
  let health = 50;
  if (inflow > 0 || outflow > 0) {
    if (inflow === 0) {
      health = 23;
    } else {
      const ratio = (inflow - outflow) / inflow;
      health = Math.max(0, Math.min(100, Math.round((ratio + 1) * 50)));
    }
  }

  // Health card
  DOM.$("#health-score").textContent = health;
  DOM.$("#health-score-text").textContent = health;
  DOM.$("#cashflow-in").textContent = "+" + Format.currency(inflow);
  DOM.$("#cashflow-out").textContent = "-" + Format.currency(outflow);

  // Update health gauge
  const circumference = 2 * Math.PI * 32;
  const offset = circumference - (health / 100) * circumference;
  const gauge = DOM.$("#health-gauge-fill");
  gauge.style.strokeDasharray = circumference;
  gauge.style.strokeDashoffset = offset;
  gauge.style.stroke =
    health < 40
      ? "var(--red)"
      : health < 70
        ? "var(--yellow)"
        : "var(--green)";

  // Chart summary buttons
  DOM.$("#btn-total-income").textContent = "+" + Format.currency(inflow);
  DOM.$("#btn-total-expense").textContent =
    "-" + Format.currency(outflow);

  // --- Quick Stat Cards ---
  DOM.$("#stat-total-income").textContent = Format.currency(inflow);
  DOM.$("#stat-income-count").textContent =
    incomeTx.length + " deposit" + (incomeTx.length !== 1 ? "s" : "");
  DOM.$("#stat-total-expense").textContent = Format.currency(outflow);
  DOM.$("#stat-expense-count").textContent =
    expenseTx.length +
    " transaction" +
    (expenseTx.length !== 1 ? "s" : "");
  DOM.$("#total-fees").textContent = Format.currency(fees);

  // Transaction count stat card
  DOM.$("#stat-tx-count").textContent = filtered.length;
  DOM.$("#stat-tx-sub").textContent = expenseTx.length + " expense | " + incomeTx.length + " income";

  // Active days (still needed for breakdown)
  const daysWithTx = new Set(
    filtered
      .filter((tx) => tx.timestamp)
      .map((tx) => tx.timestamp.toDateString()),
  );
  const activeDays = daysWithTx.size || 1;

  // --- Money Flow Breakdown ---
  const netFlow = inflow - outflow;
  const savingsRate =
    inflow > 0 ? ((netFlow / inflow) * 100).toFixed(1) : "0.0";
  const largestExpense =
    expenseTx.length > 0
      ? Math.max(...expenseTx.map((tx) => tx.amount))
      : 0;
  const largestDeposit =
    incomeTx.length > 0
      ? Math.max(...incomeTx.map((tx) => tx.amount))
      : 0;

  const netFlowEl = DOM.$("#stat-net-flow");
  netFlowEl.textContent =
    (netFlow >= 0 ? "+" : "-") + Format.currency(Math.abs(netFlow));
  netFlowEl.style.color = netFlow >= 0 ? "var(--green)" : "var(--red)";
  DOM.$("#stat-savings-rate").textContent = savingsRate + "%";
  DOM.$("#stat-largest-expense").textContent =
    Format.currency(largestExpense);
  DOM.$("#stat-largest-deposit").textContent =
    Format.currency(largestDeposit);
  DOM.$("#stat-total-tx-count").textContent = filtered.length;
  DOM.$("#stat-active-days").textContent = activeDays;

  // --- Spending by Day of Week ---
  const dowTotals = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  const dowLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (const tx of expenseTx) {
    if (tx.timestamp) {
      dowTotals[tx.timestamp.getDay()] += tx.amount;
    }
  }
  const maxDow = Math.max(...dowTotals, 1);
  const peakDayIdx = dowTotals.indexOf(Math.max(...dowTotals));
  const todayIdx = new Date().getDay();

  DOM.$("#dow-peak-label").textContent =
    dowTotals[peakDayIdx] > 0 ? "Peak: " + dowLabels[peakDayIdx] : "";

  const dowContainer = DOM.$("#analytics-dow-chart");
  dowContainer.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const pct = maxDow > 0 ? (dowTotals[i] / maxDow) * 100 : 0;
    const wrap = document.createElement("div");
    wrap.className = "analytics-dow-bar-wrap";
    wrap.innerHTML = `
    <div class="analytics-dow-bar-track">
      <div class="analytics-dow-bar-fill${i === todayIdx ? " highlight" : ""}" style="height: ${Math.max(pct, 2)}%"></div>
    </div>
    <div class="analytics-dow-label">${dowLabels[i]}</div>
  `;
    dowContainer.appendChild(wrap);
  }

  // --- Top Recipients ---
  const recipientMap = new Map();
  for (const tx of expenseTx) {
    const name = tx.receiver;
    if (!recipientMap.has(name)) {
      recipientMap.set(name, { total: 0, count: 0 });
    }
    const r = recipientMap.get(name);
    r.total += tx.amount;
    r.count++;
  }
  const topRecipients = [...recipientMap.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  DOM.$("#top-recipients-count").textContent =
    recipientMap.size + " total";

  const topList = DOM.$("#analytics-top-recipients");
  if (topRecipients.length === 0) {
    topList.innerHTML =
      '<li style="padding: 20px 0; text-align: center; color: var(--text-muted); font-size: 13px;">No expense data yet</li>';
  } else {
    const maxRecipient = topRecipients[0][1].total;
    topList.innerHTML = "";
    topRecipients.forEach(([name, data], i) => {
      const pct =
        maxRecipient > 0 ? (data.total / maxRecipient) * 100 : 0;
      const li = document.createElement("li");
      li.className = "analytics-top-item";
      li.innerHTML = `
      <div class="analytics-top-rank">${i + 1}</div>
      <div class="analytics-top-bar-wrap">
        <div class="analytics-top-name">${name}</div>
        <div class="analytics-top-bar-track"><div class="analytics-top-bar-fill" style="width: ${pct}%"></div></div>
      </div>
      <div style="text-align: right; flex-shrink: 0;">
        <div class="analytics-top-amount">-${Format.currency(data.total)}</div>
        <div class="analytics-top-count">${data.count} tx</div>
      </div>
    `;
      topList.appendChild(li);
    });
  }
}

function updateTransactionsList() {
  const container = DOM.$("#transactions-list");
  const filtered = getFilteredTransactions();

  // Render active filters bar
  renderActiveFiltersBar("transactions-list");

  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><div class="empty-state-title">No transactions found</div></div>';
    return;
  }

  // Group by date
  const groups = new Map();
  for (const tx of filtered) {
    const dateKey = tx.timestamp
      ? tx.timestamp.toDateString()
      : "Unknown";
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey).push(tx);
  }

  const fragment = document.createDocumentFragment();
  for (const [dateKey, txs] of groups) {
    const date = txs[0].timestamp;
    fragment.appendChild(Render.transactionGroup(date, txs, true));
  }
  container.innerHTML = "";
  container.appendChild(fragment);
}

function updateLedger() {
  const container = DOM.$("#ledger-list");
  const accountBar = DOM.$("#ledger-account-bar");

  // Sync date inputs with filter state
  const lds = DOM.$("#ledger-date-start");
  const lde = DOM.$("#ledger-date-end");
  lds.value = State.filters.dateStart || "";
  lde.value = State.filters.dateEnd || "";
  lds.classList.toggle("empty", !lds.value);
  lde.classList.toggle("empty", !lde.value);

  // --- Render "All" checkbox + account pills ---
  var profileAccounts = getProfileAccounts();
  accountBar.innerHTML = "";
  if (profileAccounts.length > 1) {
    // "All" checkbox toggle
    var allCheck = DOM.createElement("label", {
      className: "filter-chip" + (State.ledgerGrouped ? " active" : ""),
      style: { cursor: "pointer" },
    }, [
      DOM.createElement("input", {
        type: "checkbox",
        style: { marginRight: "4px" },
        onChange: function() {
          State.ledgerGrouped = !State.ledgerGrouped;
          if (State.ledgerGrouped) {
            // Default: all accounts selected
            State.ledgerAccounts = profileAccounts.map(function(a) { return a.number; });
          } else {
            State.ledgerAccounts = [];
          }
          updateLedger();
        }
      }),
      "Multi mode",
    ]);
    // Set checkbox checked state
    allCheck.querySelector("input").checked = State.ledgerGrouped;
    accountBar.appendChild(allCheck);

    // Account pills (only visible when grouped mode is on)
    if (State.ledgerGrouped) {
      for (var pi = 0; pi < profileAccounts.length; pi++) {
        (function(acc) {
          var bank = State.banksMap.get(String(acc.bankId));
          var label = acc.name + (bank ? " (" + bank.shortName + ")" : "");
          var isSelected = State.ledgerAccounts.indexOf(acc.number) !== -1;
          var pill = DOM.createElement("button", {
            className: "filter-chip" + (isSelected ? " active" : ""),
            onClick: function() {
              var idx = State.ledgerAccounts.indexOf(acc.number);
              if (idx !== -1) {
                // Don't allow deselecting the last one
                if (State.ledgerAccounts.length <= 1) return;
                State.ledgerAccounts.splice(idx, 1);
              } else {
                State.ledgerAccounts.push(acc.number);
              }
              updateLedger();
            }
          }, [label]);
          accountBar.appendChild(pill);
        })(profileAccounts[pi]);
      }
    }
  }

  // --- Get transactions ---
  var allFiltered = getFilteredTransactions().filter(function(tx) { return tx.timestamp; });

  // In grouped mode, filter to selected accounts only
  var filtered;
  if (State.ledgerGrouped && State.ledgerAccounts.length > 0) {
    filtered = allFiltered.filter(function(tx) {
      return tx.resolvedAccount && State.ledgerAccounts.indexOf(tx.resolvedAccount.number) !== -1;
    });
  } else {
    filtered = allFiltered;
  }

  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><div class="empty-state-title">No ledger entries</div></div>';
    return;
  }

  // Sort newest first
  const sorted = [...filtered].sort((a, b) => b.timestamp - a.timestamp);

  // --- Compute combined running balance for grouped mode ---
  var combinedBalances = null;
  var headerBalance = null;
  var selectedCount = 0;
  if (State.ledgerGrouped && State.ledgerAccounts.length > 0) {
    selectedCount = State.ledgerAccounts.length;

    // Find latest balance per selected account from ALL profile tx (ignoring date filters)
    var allProfileTx = getProfileTransactions().filter(function(tx) { return tx.timestamp; });
    allProfileTx.sort(function(a, b) { return b.timestamp - a.timestamp; });
    var latestByAccount = {};
    for (var li = 0; li < allProfileTx.length; li++) {
      var ltx = allProfileTx[li];
      if (!ltx.resolvedAccount) continue;
      var accNum = ltx.resolvedAccount.number;
      if (State.ledgerAccounts.indexOf(accNum) === -1) continue;
      if (!latestByAccount[accNum]) {
        latestByAccount[accNum] = ltx;
      }
    }

    // Sum latest balances
    var combinedBal = 0;
    for (var ai = 0; ai < State.ledgerAccounts.length; ai++) {
      var accTx = latestByAccount[State.ledgerAccounts[ai]];
      if (accTx) combinedBal += accTx.balance;
    }
    headerBalance = combinedBal;

    // Walk ALL selected-account transactions newest→oldest to build balance map
    var allSelectedTx = allProfileTx.filter(function(tx) {
      return tx.resolvedAccount && State.ledgerAccounts.indexOf(tx.resolvedAccount.number) !== -1;
    });

    var runBal = combinedBal;
    var balMap = {};
    for (var ri = 0; ri < allSelectedTx.length; ri++) {
      var rtx = allSelectedTx[ri];
      balMap[rtx.id] = runBal;
      if (rtx.isExpense) {
        runBal += rtx.amount;
      } else {
        runBal -= rtx.amount;
      }
    }
    combinedBalances = balMap;
  }

  // Group by date
  const dateGroups = new Map();
  for (const tx of sorted) {
    const dateKey = tx.timestamp.toDateString();
    if (!dateGroups.has(dateKey)) {
      dateGroups.set(dateKey, []);
    }
    dateGroups.get(dateKey).push(tx);
  }

  container.innerHTML = "";

  // Timeline
  var timeline = DOM.createElement("div", {
    className: "ledger-timeline",
  });

  for (const [dateKey, txs] of dateGroups) {
    var dateLabel;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var txDate = new Date(dateKey);
    txDate.setHours(0, 0, 0, 0);
    if (txDate.getTime() === today.getTime()) {
      dateLabel = "Today";
    } else {
      dateLabel = txs[0].timestamp.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    var group = DOM.createElement("div", {
      className: "ledger-date-group",
    });
    group.appendChild(
      DOM.createElement("div", { className: "ledger-date-label" }, [
        dateLabel,
      ]),
    );

    for (const tx of txs) {
      if (State.ledgerGrouped && combinedBalances) {
        group.appendChild(Render.ledgerEntry(tx, {
          count: selectedCount,
          combinedBalance: combinedBalances[tx.id] !== undefined ? combinedBalances[tx.id] : 0,
        }));
      } else {
        group.appendChild(Render.ledgerEntry(tx));
      }
    }
    timeline.appendChild(group);
  }

  container.appendChild(timeline);
}

function refreshAccountsMasking() {
  // Lightweight re-mask of all monetary values on accounts page without rebuilding DOM
  var els = DOM.$$("#tab-accounts [data-raw]");
  for (var i = 0; i < els.length; i++) {
    els[i].textContent = Format.masked(els[i].dataset.raw);
  }
}

function updateAccountsTab() {
  var scopedAccounts = getProfileAccounts();
  var scopedTx = getProfileTransactions();
  var usedBankIds = [
    ...new Set(scopedAccounts.map(function(a) { return String(a.bankId); })),
  ];

  // If a bank is selected, delegate top card rendering to updateBankDetail
  if (State.selectedBank) {
    updateBankDetail();
  } else {
    // Only sum balances from transactions matched to registered accounts
    var acctBalance = 0;
    var acctInflow = 0;
    var acctOutflow = 0;
    var acctTxCount = 0;
    for (var ai = 0; ai < scopedAccounts.length; ai++) {
      var acc = scopedAccounts[ai];
      var accTxs = scopedTx.filter(function(tx) { return tx.resolvedAccount === acc; });
      if (accTxs.length > 0) {
        acctBalance += accTxs[0].balance;
      }
      for (var ti = 0; ti < accTxs.length; ti++) {
        acctTxCount++;
        if (accTxs[ti].isExpense) { acctOutflow += accTxs[ti].amount; }
        else { acctInflow += accTxs[ti].amount; }
      }
    }
    DOM.$("#accounts-balance-label").textContent = "TOTAL BALANCE";
    var balRaw = Format.currency(acctBalance);
    DOM.$("#accounts-total-balance").dataset.raw = balRaw;
    DOM.$("#accounts-total-balance").textContent = Format.masked(balRaw);

    DOM.$("#accounts-banks-count").textContent =
      usedBankIds.length + (usedBankIds.length === 1 ? " Bank" : " Banks");
    DOM.$("#accounts-accounts-count").textContent =
      scopedAccounts.length + " Accounts";
    DOM.$("#accounts-tx-count").textContent = acctTxCount;
    var inflowRaw = "+" + Format.compact(acctInflow);
    var outflowRaw = "-" + Format.compact(acctOutflow);
    DOM.$("#accounts-inflow").dataset.raw = inflowRaw;
    DOM.$("#accounts-inflow").textContent = Format.masked(inflowRaw);
    DOM.$("#accounts-outflow").dataset.raw = outflowRaw;
    DOM.$("#accounts-outflow").textContent = Format.masked(outflowRaw);
  }

  // Bank grid (only in overview mode)
  const grid = DOM.$("#bank-grid");
  const banks = State.banks.filter((b) =>
    usedBankIds.includes(String(b.id)),
  );

  // "Add Account" card — reused in both empty and populated states
  const addCard = DOM.createElement(
    "div",
    {
      className: "add-account-card",
      onClick: () => AddAccountModal.show(),
    },
    [
      DOM.createElement(
        "div",
        { className: "add-account-card-icon" },
        [],
      ),
      DOM.createElement(
        "div",
        { className: "add-account-card-title" },
        ["Add Account"],
      ),
      DOM.createElement("div", { className: "add-account-card-sub" }, [
        "Register New Bank Account",
      ]),
    ],
  );
  addCard.querySelector(".add-account-card-icon").innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';

  if (banks.length === 0) {
    grid.innerHTML = "";
    grid.appendChild(addCard);
  } else {
    const fragment = document.createDocumentFragment();
    for (const bank of banks) {
      fragment.appendChild(Render.bankCard(bank));
    }
    grid.innerHTML = "";
    grid.appendChild(fragment);
    grid.appendChild(addCard);
  }

  // Bank selector bar (for detail view)
  const selectorBar = DOM.$("#bank-selector-bar");
  // ቶ logo button — fixed, deselects bank
  var logoBtn = DOM.createElement(
    "div",
    {
      className: "bank-selector-logo",
      onClick: () => {
        State.selectedBank = null;
        updateAccountsTab();
        updateBankDetail();
      },
    },
    ["\u1276"],
  );
  // Scrollable pills container
  var pillsContainer = DOM.createElement("div", { className: "bank-selector-pills" });
  for (const bank of banks) {
    pillsContainer.appendChild(DOM.createElement(
      "div",
      {
        className: "bank-selector-pill" + (State.selectedBank === bank.id ? " selected" : ""),
        dataBankid: String(bank.id),
        onClick: () => selectBank(bank.id),
      },
      [bank.shortName],
    ));
  }
  selectorBar.innerHTML = "";
  selectorBar.appendChild(logoBtn);
  selectorBar.appendChild(pillsContainer);

  // FAB visibility
  var fab = DOM.$("#fab-add-account");
  if (fab) {
    fab.classList.toggle("hidden", !State.selectedBank);
  }
}

function updateBankDetail() {
  var fab = DOM.$("#fab-add-account");

  if (!State.selectedBank) {
    DOM.$("#bank-detail").classList.add("hidden");
    DOM.$("#bank-overview").classList.remove("hidden");
    if (fab) fab.classList.add("hidden");
    // Restore top card — delegate to updateAccountsTab for consistent registered-only logic
    updateAccountsTab();
    return;
  }

  DOM.$("#bank-detail").classList.remove("hidden");
  DOM.$("#bank-overview").classList.add("hidden");
  if (fab) fab.classList.remove("hidden");

  const bank = State.banksMap.get(String(State.selectedBank));
  if (!bank) return;

  const bankTx = Analytics.getByBank(State.selectedBank);
  const bankAccounts = getProfileAccounts().filter(
    (a) => String(a.bankId) === String(State.selectedBank),
  );

  // Update top card — sum latest balance from each account
  var topBalance = 0;
  var topInflow = 0;
  var topOutflow = 0;
  var topTxCount = 0;
  if (bankAccounts.length > 0) {
    for (var ai = 0; ai < bankAccounts.length; ai++) {
      var accTxs = bankTx.filter(function(tx) { return tx.resolvedAccount === bankAccounts[ai]; });
      if (accTxs.length > 0) topBalance += accTxs[0].balance;
      for (var ti = 0; ti < accTxs.length; ti++) {
        topTxCount++;
        if (accTxs[ti].isExpense) topOutflow += accTxs[ti].amount;
        else topInflow += accTxs[ti].amount;
      }
    }
  } else {
    // No accounts registered — show all bank tx data
    topBalance = bankTx.length > 0 ? bankTx[0].balance : 0;
    for (var ti = 0; ti < bankTx.length; ti++) {
      topTxCount++;
      if (bankTx[ti].isExpense) topOutflow += bankTx[ti].amount;
      else topInflow += bankTx[ti].amount;
    }
  }
  DOM.$("#accounts-balance-label").textContent = bank.shortName + " BALANCE";
  var balRaw = Format.currency(topBalance);
  DOM.$("#accounts-total-balance").dataset.raw = balRaw;
  DOM.$("#accounts-total-balance").textContent = Format.masked(balRaw);
  DOM.$("#accounts-banks-count").textContent = bank.shortName;
  DOM.$("#accounts-accounts-count").textContent =
    bankAccounts.length + " Account" + (bankAccounts.length !== 1 ? "s" : "");
  DOM.$("#accounts-tx-count").textContent = topTxCount;
  var inflowRaw = "+" + Format.compact(topInflow);
  var outflowRaw = "-" + Format.compact(topOutflow);
  DOM.$("#accounts-inflow").dataset.raw = inflowRaw;
  DOM.$("#accounts-inflow").textContent = Format.masked(inflowRaw);
  DOM.$("#accounts-outflow").dataset.raw = outflowRaw;
  DOM.$("#accounts-outflow").textContent = Format.masked(outflowRaw);

  // Bank accounts
  const accountsList = DOM.$("#bank-accounts-list");
  if (bankAccounts.length > 0) {
    const accFragment = document.createDocumentFragment();
    for (const acc of bankAccounts) {
      var acctTx = bankTx.filter((tx) => tx.resolvedAccount === acc);
      accFragment.appendChild(Render.accountCard(acc, acctTx));
    }
    // Unmatched transactions (no resolved account)
    var unmatchedTx = bankTx.filter(function(tx) { return !tx.resolvedAccount; });
    if (unmatchedTx.length > 0) {
      var otherHeader = document.createElement("div");
      otherHeader.className = "account-card";
      otherHeader.style.opacity = "0.7";
      otherHeader.innerHTML = '<div class="account-header"><div class="account-header-left"><div><div class="account-name">Other Transactions</div><div class="account-number">' + unmatchedTx.length + ' unmatched</div></div></div></div>';
      accFragment.appendChild(otherHeader);
    }
    accountsList.innerHTML = "";
    accountsList.appendChild(accFragment);
  } else {
    accountsList.innerHTML =
      '<div style="padding: 12px 0; text-align: center; color: var(--text-muted); font-size: 13px;">No accounts added for this bank</div>';
  }

  // Update pill selection
  DOM.$$(".bank-selector-pill").forEach((pill) => {
    pill.classList.remove("selected");
  });
  var activePill = DOM.$(`.bank-selector-pill[data-bankid="${State.selectedBank}"]`);
  if (activePill) activePill.classList.add("selected");
}

function showTransactionDetail(tx) {
  const modal = DOM.$("#transaction-modal");
  const body = DOM.$("#modal-body");
  const isExpense = tx.isExpense;

  var catValueHTML = '';
  if (tx.categories && tx.categories.length > 0) {
    for (var ci = 0; ci < tx.categories.length; ci++) {
      var catInfo = getCategoryInfo(tx.categories[ci]);
      catValueHTML += '<span class="category-badge" style="color:' + catInfo.color + ';background:' + catInfo.color + '18">' +
        '<span class="category-badge-dot" style="background:' + catInfo.color + '"></span>' + tx.categories[ci] +
      '</span>';
    }
  } else {
    catValueHTML = '<span class="category-picker-placeholder">Tap to categorize</span>';
  }

  var bankName = tx.bank ? tx.bank.shortName : "?";
  var bankColors = tx.bank ? tx.bank.colors : ["#6b7280","#4b5563"];
  var receiverDisplay = State.receiverNameMap.get(tx.id) || (tx.receiver && tx.receiver !== "Unknown" ? tx.receiver : "Unknown");
  var receiverEscaped = (State.receiverNameMap.get(tx.id) || tx.receiver || '').replace(/"/g, '&quot;');
  var dateStr = tx.timestamp ? Format.date(tx.timestamp) : "";
  var timeStr = tx.timestamp ? Format.time(tx.timestamp) : "";

  // Build account section
  var accountHTML = (function() {
    var bank = tx.bank;
    var canPickAccount = bank && (!bank.uniformMasking || bank.simBased);
    var accountDisplay = tx.resolvedAccount ? tx.resolvedAccount.name : (tx.account || "N/A");
    if (canPickAccount) {
      return '<div class="category-picker-row" id="account-row">' +
        '<span class="detail-label">Account</span>' +
        '<div class="category-picker-value" id="account-value">' +
        '<span>' + accountDisplay + '</span>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>' +
        '</div></div>' +
        '<div id="account-chips-container"></div>';
    } else {
      return '<div class="detail-row">' +
        '<span class="detail-label">Account</span>' +
        '<span class="detail-value detail-value-mono">' + accountDisplay + '</span>' +
        '</div>';
    }
  })();

  // Build fees section (only show if non-zero)
  var feesHTML = '';
  var sc = Parser.parseAmount(tx.serviceCharge);
  var vat = Parser.parseAmount(tx.vat);
  if (sc > 0 || vat > 0) {
    feesHTML = '<div class="detail-card"><div class="detail-card-title">Fees</div><div class="detail-card-body">';
    if (sc > 0) feesHTML += '<div class="detail-row"><span class="detail-label">Service Charge</span><span class="detail-value">' + Format.currency(tx.serviceCharge) + '</span></div>';
    if (vat > 0) feesHTML += '<div class="detail-row"><span class="detail-label">VAT</span><span class="detail-value">' + Format.currency(tx.vat) + '</span></div>';
    feesHTML += '</div></div>';
  }

  body.innerHTML = `
  <div class="detail-hero">
    <div class="detail-hero-bank" style="background: linear-gradient(135deg, ${bankColors[0]}, ${bankColors[1]})">
      ${bankName.substring(0, 3)}
    </div>
    <div class="detail-hero-amount" style="color: ${isExpense ? "var(--red)" : "var(--green)"}">
      ${isExpense ? "-" : "+"} ${Format.currencyFull(tx.amount)}
    </div>
    <div class="detail-hero-receiver-row">
      <span class="detail-hero-receiver" id="detail-receiver-text">${receiverDisplay}</span>
      <button class="detail-receiver-edit-btn" id="receiver-edit-btn" title="Edit name">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
      </button>
    </div>
    <div class="detail-hero-date">${dateStr}  ${timeStr}</div>
    <div class="detail-receiver-edit hidden" id="receiver-edit-form">
      <input type="text" class="detail-receiver-input" id="receiver-name-input" placeholder="Enter name..." value="${receiverEscaped}" />
      <button class="detail-receiver-save" id="receiver-save-btn">Save</button>
    </div>
  </div>

  <div class="detail-tear"><span class="detail-tear-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="11" height="11"><circle cx="6" cy="7" r="3"/><circle cx="6" cy="17" r="3"/><line x1="8.6" y1="8.5" x2="20" y2="19"/><line x1="8.6" y1="15.5" x2="20" y2="5"/></svg></span></div>

  <div class="detail-card">
    <div class="detail-card-body">
      <div class="detail-row">
        <span class="detail-label">Bank</span>
        <span class="detail-value">${tx.bank ? tx.bank.name : "Unknown"}</span>
      </div>
      ${accountHTML}
      <div class="detail-row">
        <span class="detail-label">Reference</span>
        <span class="detail-value detail-value-mono">${tx.reference}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Balance After</span>
        <span class="detail-value">${Format.currency(tx.balance)}</span>
      </div>
    </div>
  </div>

  ${feesHTML}

  <div class="detail-card">
    <div class="detail-card-body">
      <div class="category-picker-row" id="category-row">
        <span class="detail-label">Category</span>
        <div class="category-picker-value" id="category-value">
          ${catValueHTML}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <div id="category-chips-container"></div>
      <div id="rule-prompt-container"></div>
      <div class="detail-reason-row">
        <span class="detail-label">Note</span>
        <input type="text" class="detail-reason-input" id="reason-input" placeholder="Add a note..." value="${(State.reasonMap.get(tx.id) || '').replace(/"/g, '&quot;')}" />
      </div>
    </div>
  </div>

  <div class="detail-receipt-footer">
    <span class="detail-receipt-stamp">${isExpense ? "PAID" : "RECEIVED"}</span>
  </div>
`;

  // Wire up receiver name editing
  DOM.$("#receiver-edit-btn").addEventListener("click", function() {
    var form = DOM.$("#receiver-edit-form");
    form.classList.toggle("hidden");
    if (!form.classList.contains("hidden")) {
      DOM.$("#receiver-name-input").focus();
    }
  });
  DOM.$("#receiver-save-btn").addEventListener("click", function() {
    var val = DOM.$("#receiver-name-input").value.trim();
    if (val) {
      State.receiverNameMap.set(tx.id, val);
      var idx = State.receiverNames.findIndex(function(r) { return r.txId === tx.id; });
      if (idx >= 0) { State.receiverNames[idx].name = val; }
      else { State.receiverNames.push({ txId: tx.id, name: val }); }
    } else {
      State.receiverNameMap.delete(tx.id);
      var idx = State.receiverNames.findIndex(function(r) { return r.txId === tx.id; });
      if (idx >= 0) State.receiverNames.splice(idx, 1);
    }
    persistReceiverNames();
    DOM.$("#detail-receiver-text").textContent = val || tx.receiver || "Unknown";
    DOM.$("#receiver-edit-form").classList.add("hidden");
    updateTransactionsList();
    updateLedger();
    if (State.currentScreen === "home") updateDashboard();
  });

  // Wire up reason input
  var reasonInput = DOM.$("#reason-input");
  var reasonDebounce;
  reasonInput.addEventListener("input", function() {
    clearTimeout(reasonDebounce);
    reasonDebounce = setTimeout(function() {
      var val = reasonInput.value.trim();
      if (val) {
        State.reasonMap.set(tx.id, val);
      } else {
        State.reasonMap.delete(tx.id);
      }
      // Update State.reasons array
      var idx = State.reasons.findIndex(function(r) { return r.txId === tx.id; });
      if (val) {
        if (idx >= 0) { State.reasons[idx].reason = val; }
        else { State.reasons.push({ txId: tx.id, reason: val }); }
      } else {
        if (idx >= 0) State.reasons.splice(idx, 1);
      }
      persistReasons();
    }, 400);
  });

  // Wire up category row tap
  DOM.$("#category-row").addEventListener("click", () =>
    showCategoryPicker(tx),
  );

  // Wire up account row tap (only exists for simBased/non-uniform banks)
  var accountRow = DOM.$("#account-row");
  if (accountRow) {
    accountRow.addEventListener("click", () => showAccountPicker(tx));
  }

  modal.classList.add("active");
}

function showAccountPicker(tx) {
  var container = DOM.$("#account-chips-container");
  if (container.children.length > 0) {
    container.innerHTML = "";
    return;
  }

  var bankId = String(tx.bankId);
  var bankAccounts = State.accounts.filter(function(a) {
    return String(a.bankId) === bankId;
  });

  if (bankAccounts.length === 0) return;

  var chipsDiv = document.createElement("div");
  chipsDiv.className = "category-picker-chips";

  for (var i = 0; i < bankAccounts.length; i++) {
    (function(acc) {
      var isSelected = tx.resolvedAccount && tx.resolvedAccount.number === acc.number;
      var chip = document.createElement("div");
      chip.className = "category-picker-chip" + (isSelected ? " selected" : "");
      chip.textContent = acc.name;
      if (isSelected) {
        chip.style.borderColor = "var(--purple)";
        chip.style.color = "var(--purple)";
      }
      chip.addEventListener("click", function() { applyAccountOverride(tx, acc); });
      chipsDiv.appendChild(chip);
    })(bankAccounts[i]);
  }

  container.appendChild(chipsDiv);
}

function applyAccountOverride(tx, account) {
  var txId = tx.id || tx.reference;

  // Update or add entry in State.accountOverrides
  var found = false;
  for (var i = 0; i < State.accountOverrides.length; i++) {
    if (State.accountOverrides[i].txId === txId) {
      State.accountOverrides[i].accountNumber = account.number;
      State.accountOverrides[i].bankId = String(tx.bankId);
      found = true;
      break;
    }
  }
  if (!found) {
    State.accountOverrides.push({
      txId: txId,
      accountNumber: account.number,
      bankId: String(tx.bankId),
    });
  }

  // Update the map
  State.accountOverrideMap.set(txId, account);

  // Update the transaction
  tx.resolvedAccount = account;

  // Persist
  persistAccountOverrides();

  // Refresh modal
  showTransactionDetail(tx);

  // Refresh lists
  updateTransactionsList();
  updateLedger();
  if (State.currentScreen === "accounts") {
    updateAccountsTab();
    if (State.selectedBank) updateBankDetail();
  }
  if (State.currentScreen === "home") updateDashboard();
}

function showCategoryPicker(tx) {
  const container = DOM.$("#category-chips-container");
  if (container.children.length > 0) {
    container.innerHTML = "";
    return;
  }

  const chipsDiv = document.createElement("div");
  chipsDiv.className = "category-picker-chips";
  var txCats = tx.categories || [];

  var txType = tx.type === "CREDIT" ? "income" : "expense";
  var filteredCats = getCategoryNamesByType(txType).sort(function(a, b) { return a.localeCompare(b); });
  for (var fi = 0; fi < filteredCats.length; fi++) {
    (function(name) {
      const catInfo = getCategoryInfo(name);
      var isSelected = txCats.indexOf(name) !== -1;
      const chip = document.createElement("div");
      chip.className =
        "category-picker-chip" + (isSelected ? " selected" : "");
      chip.style.color = catInfo.color;
      chip.style.borderColor = isSelected ? catInfo.color : "";
      chip.innerHTML = `<span class="category-picker-chip-dot" style="background:${catInfo.color}"></span>${name}`;
      chip.addEventListener("click", () => toggleTxCategory(tx, name));
      chipsDiv.appendChild(chip);
    })(filteredCats[fi]);
  }

  // Add remove option if any categories are set
  if (txCats.length > 0) {
    const removeChip = document.createElement("div");
    removeChip.className = "category-remove-chip";
    removeChip.textContent = "Remove all";
    removeChip.addEventListener("click", () => removeCategories(tx));
    chipsDiv.appendChild(removeChip);
  }

  // "+ New Category" chip
  const newChip = document.createElement("div");
  newChip.className = "category-new-chip";
  newChip.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New';
  newChip.addEventListener("click", () =>
    showCategoryCreateForm(container, tx),
  );
  chipsDiv.appendChild(newChip);

  container.appendChild(chipsDiv);
}

function showCategoryCreateForm(container, tx) {
  const existing = container.querySelector(".category-create-form");
  if (existing) {
    existing.remove();
    return;
  }

  const form = document.createElement("div");
  form.className = "category-create-form";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "category-create-input";
  input.placeholder = "Category name";
  input.maxLength = 24;

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.className = "category-create-color";
  colorInput.value = "#6366f1";

  const saveBtn = document.createElement("button");
  saveBtn.className = "category-create-save";
  saveBtn.textContent = "Add";
  saveBtn.addEventListener("click", () => {
    const name = input.value.trim();
    if (!name) {
      input.focus();
      return;
    }
    // Prevent duplicate names (case-insensitive)
    if (
      getAllCategoryNames().some(
        (n) => n.toLowerCase() === name.toLowerCase(),
      )
    ) {
      input.style.borderColor = "var(--red)";
      input.focus();
      return;
    }
    var catType = tx.type === "CREDIT" ? "income" : "expense";
    createCustomCategory(name, colorInput.value, catType);
    // Delay so persistCustomCategories() iframe fires before persistCategories()
    setTimeout(function () {
      toggleTxCategory(tx, name);
      // Re-render picker to include the new chip
      container.innerHTML = "";
      showCategoryPicker(tx);
    }, 50);
  });

  form.appendChild(input);
  form.appendChild(colorInput);
  form.appendChild(saveBtn);
  container.appendChild(form);
  input.focus();
}

function createCustomCategory(name, color, type) {
  var entry = { name: name, color: color, type: type || "both" };
  if (State.activeProfileId) entry.profileId = State.activeProfileId;
  State.customCategories.push(entry);
  persistCustomCategories();
}

function toggleTxCategory(tx, name) {
  var cats = (tx.categories || []).slice();
  var idx = cats.indexOf(name);
  var added = false;
  if (idx !== -1) {
    cats.splice(idx, 1);
  } else {
    cats.push(name);
    added = true;
  }

  // Update state
  State.categoryMap.set(tx.id, cats);
  tx.categories = cats;

  // Update State.categories (manual overrides)
  var existing = State.categories.findIndex(function(c) { return c.txId === tx.id; });
  if (existing >= 0) {
    State.categories[existing].categories = cats.slice();
  } else {
    State.categories.push({ txId: tx.id, categories: cats.slice() });
  }

  // Persist immediately
  persistCategories();

  // Update chips in-place (don't re-render the whole modal)
  var container = DOM.$("#category-chips-container");
  if (container) {
    var chips = container.querySelectorAll(".category-picker-chip");
    for (var ci = 0; ci < chips.length; ci++) {
      var chipName = chips[ci].textContent.trim();
      var isSel = cats.indexOf(chipName) !== -1;
      chips[ci].classList.toggle("selected", isSel);
      var catInfo = getCategoryInfo(chipName);
      chips[ci].style.borderColor = isSel ? catInfo.color : "";
    }
    // Update "Remove all" visibility
    var removeChip = container.querySelector(".category-remove-chip");
    if (cats.length > 0 && !removeChip) {
      var chipsDiv = container.querySelector(".category-picker-chips");
      if (chipsDiv) {
        var rc = document.createElement("div");
        rc.className = "category-remove-chip";
        rc.textContent = "Remove all";
        rc.addEventListener("click", function() { removeCategories(tx); });
        // Insert before "+ New" chip
        var newChip = chipsDiv.querySelector(".category-new-chip");
        if (newChip) chipsDiv.insertBefore(rc, newChip);
        else chipsDiv.appendChild(rc);
      }
    } else if (cats.length === 0 && removeChip) {
      removeChip.remove();
    }
  }

  // Update category value display in modal
  var catValue = DOM.$("#category-value");
  if (catValue) {
    var chevron = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
    if (cats.length > 0) {
      var html = '';
      for (var ci = 0; ci < cats.length; ci++) {
        var catInfo = getCategoryInfo(cats[ci]);
        html += '<span class="category-badge" style="color:' + catInfo.color + ';background:' + catInfo.color + '18">' +
          '<span class="category-badge-dot" style="background:' + catInfo.color + '"></span>' + cats[ci] +
        '</span>';
      }
      catValue.innerHTML = html + chevron;
    } else {
      catValue.innerHTML = '<span class="category-picker-placeholder">Tap to categorize</span>' + chevron;
    }
  }

  // Refresh lists in background
  updateTransactionsList();
  updateLedger();
  if (State.currentScreen === "home") updateDashboard();

  // Show rule prompt if a category was added and receiver is known
  if (
    added &&
    tx.receiver &&
    tx.receiver !== "Unknown" &&
    tx.receiver.trim() !== ""
  ) {
    showRulePrompt(tx);
  }
}

function removeCategories(tx) {
  // Save explicit empty override to block rule re-application on reload
  State.categoryMap.set(tx.id, []);
  tx.categories = [];

  var existing = State.categories.findIndex(function(c) { return c.txId === tx.id; });
  if (existing >= 0) {
    State.categories[existing].categories = [];
  } else {
    State.categories.push({ txId: tx.id, categories: [] });
  }

  // Persist immediately
  persistCategories();

  // Update chips in-place
  var container = DOM.$("#category-chips-container");
  if (container) {
    var chips = container.querySelectorAll(".category-picker-chip");
    for (var ci = 0; ci < chips.length; ci++) {
      chips[ci].classList.remove("selected");
      chips[ci].style.borderColor = "";
    }
    var removeChip = container.querySelector(".category-remove-chip");
    if (removeChip) removeChip.remove();
  }

  // Update category value display
  var catValue = DOM.$("#category-value");
  if (catValue) {
    catValue.innerHTML = '<span class="category-picker-placeholder">Tap to categorize</span>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
  }

  // Refresh lists
  updateTransactionsList();
  updateLedger();
  if (State.currentScreen === "home") updateDashboard();
}

function showRulePrompt(tx) {
  const container = DOM.$("#rule-prompt-container");
  if (!container) return;
  var cats = tx.categories || [];
  if (cats.length === 0) { container.innerHTML = ""; return; }

  // Filter out categories that already have rules for this receiver
  var receiverLower = tx.receiver.toLowerCase();
  var newCats = cats.filter(function(name) {
    return !State.categoryRules.some(function(r) {
      return r.receiver && r.receiver.toLowerCase() === receiverLower && r.category === name;
    });
  });
  if (newCats.length === 0) { container.innerHTML = ""; return; }

  const escapedReceiver = tx.receiver
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  var catLabels = newCats.map(function(n) { return '<strong>' + n.replace(/</g, '&lt;') + '</strong>'; }).join(', ');
  container.innerHTML = `
  <div class="rule-prompt">
    <div class="rule-prompt-text">
      Always categorize <strong>${escapedReceiver}</strong> as ${catLabels}?
    </div>
    <div class="rule-prompt-actions">
      <button class="rule-prompt-btn rule-prompt-btn-once" id="rule-once">Just this once</button>
      <button class="rule-prompt-btn rule-prompt-btn-always" id="rule-always">Always</button>
    </div>
  </div>
`;

  DOM.$("#rule-once").addEventListener("click", () => {
    container.innerHTML = "";
  });

  DOM.$("#rule-always").addEventListener("click", () => {
    for (var i = 0; i < newCats.length; i++) {
      createRule(tx.receiver, newCats[i]);
    }
    container.innerHTML = "";
  });
}

function createRule(receiver, categoryName) {
  // Check if a rule already exists for this receiver+category pair
  var existingIdx = -1;
  for (var i = 0; i < State.categoryRules.length; i++) {
    if (State.categoryRules[i].receiver &&
        State.categoryRules[i].receiver.toLowerCase() === receiver.toLowerCase() &&
        State.categoryRules[i].category === categoryName) {
      existingIdx = i;
      break;
    }
  }
  // Only add if not already present
  if (existingIdx < 0) {
    State.categoryRules.push({
      receiver: receiver,
      category: categoryName,
    });
  }

  // Persist immediately
  persistRules();

  // Retroactively apply to all matching transactions without manual overrides
  const manualTxIds = new Set(State.categories.map((c) => c.txId));
  const receiverLower = receiver.toLowerCase();
  for (const tx of State.transactions) {
    if (
      tx.receiver &&
      tx.receiver.toLowerCase() === receiverLower &&
      !manualTxIds.has(tx.id)
    ) {
      var cats = (tx.categories || []).slice();
      if (cats.indexOf(categoryName) === -1) {
        cats.push(categoryName);
      }
      State.categoryMap.set(tx.id, cats);
      tx.categories = cats;
    }
  }

  // Refresh lists
  updateTransactionsList();
  updateLedger();
}

function initModalDrag(modalId, hideFn) {
  const overlay = DOM.$("#" + modalId);
  const content = overlay.querySelector(".modal-content");
  var startY = 0, lastY = 0, dragging = false, maybeDrag = false;

  content.addEventListener("touchstart", function(e) {
    startY = lastY = e.touches[0].clientY;
    dragging = false;
    maybeDrag = content.scrollTop <= 0;
  }, { passive: true });

  content.addEventListener("touchmove", function(e) {
    if (!maybeDrag && !dragging) return;
    lastY = e.touches[0].clientY;
    var dy = lastY - startY;

    if (maybeDrag && !dragging) {
      if (dy > 8 && content.scrollTop <= 0) {
        dragging = true;
        maybeDrag = false;
        startY = lastY;
        content.style.transition = "none";
      } else if (dy < -3) {
        maybeDrag = false;
        return;
      }
      return;
    }

    if (dragging) {
      e.preventDefault();
      dy = Math.max(0, lastY - startY);
      content.style.transform = "translateY(" + dy + "px)";
      var progress = Math.min(dy / 300, 1);
      overlay.style.background = "rgba(0,0,0," + (0.5 * (1 - progress * 0.5)) + ")";
    }
  }, { passive: false });

  content.addEventListener("touchend", function() {
    maybeDrag = false;
    if (!dragging) return;
    dragging = false;
    overlay.style.background = "";
    var dy = lastY - startY;
    if (dy > 80) {
      content.style.transition = "transform 0.25s ease";
      content.style.transform = "translateY(100%)";
      setTimeout(function() {
        hideFn();
        content.style.transition = "";
        content.style.transform = "";
      }, 250);
    } else {
      content.style.transition = "transform 0.3s ease";
      content.style.transform = "";
    }
  }, { passive: true });
}

function hideModal() {
  DOM.$("#transaction-modal").classList.remove("active");
}

// ============================================
// BUDGET CALCULATIONS
// ============================================
function getMonthKey(monthDate) {
  var y = monthDate.getFullYear();
  var m = monthDate.getMonth() + 1;
  return y + "-" + (m < 10 ? "0" : "") + m;
}

function getEffectiveBudget(budget, monthDate) {
  var key = getMonthKey(monthDate);
  if (budget.overrides && budget.overrides.length > 0) {
    for (var i = 0; i < budget.overrides.length; i++) {
      if (budget.overrides[i].month === key) {
        return {
          assigned: budget.overrides[i].assigned != null ? budget.overrides[i].assigned : budget.assigned,
          categories: budget.overrides[i].categories || budget.categories
        };
      }
    }
  }
  return { assigned: budget.assigned, categories: budget.categories };
}

function isBudgetVisibleInMonth(budget, monthDate) {
  if (budget.recurring !== false) return true;
  // One-time budget: only visible in its target month
  if (!budget.month) return false;
  return budget.month === getMonthKey(monthDate);
}

function getBudgetActivity(budget, monthDate) {
  var start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  var end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
  var eff = getEffectiveBudget(budget, monthDate);
  var cats = eff.categories || [];

  return State.transactions.filter(function (tx) {
    if (!tx.timestamp || tx.timestamp < start || tx.timestamp > end) return false;
    if (!tx.isExpense) return false;
    var txCats = tx.categories || [];
    for (var i = 0; i < cats.length; i++) {
      if (txCats.indexOf(cats[i]) !== -1) return true;
    }
    return false;
  }).reduce(function (sum, tx) { return sum + tx.amount; }, 0);
}

function getBudgetAvailable(budget, monthDate) {
  var eff = getEffectiveBudget(budget, monthDate);
  return eff.assigned - getBudgetActivity(budget, monthDate);
}

function getBudgetStatus(available, assigned) {
  if (assigned === 0) return "gray";
  if (available <= 0) return "red";
  if (available / assigned <= 0.25) return "yellow";
  return "green";
}

function getUnbudgetedSpending(monthDate) {
  var start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  var end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
  var budgetedCategories = {};
  for (var i = 0; i < State.budgets.length; i++) {
    if (!isBudgetVisibleInMonth(State.budgets[i], monthDate)) continue;
    var eff = getEffectiveBudget(State.budgets[i], monthDate);
    var cats = eff.categories || [];
    for (var j = 0; j < cats.length; j++) {
      budgetedCategories[cats[j]] = true;
    }
  }

  return State.transactions.filter(function (tx) {
    if (!tx.timestamp || tx.timestamp < start || tx.timestamp > end) return false;
    if (!tx.isExpense) return false;
    var txCats = tx.categories || [];
    if (txCats.length === 0) return true;
    // Unbudgeted if NONE of the tx's categories are budgeted
    for (var k = 0; k < txCats.length; k++) {
      if (budgetedCategories[txCats[k]]) return false;
    }
    return true;
  });
}

function getDailyPace(available, monthDate) {
  var now = new Date();
  var endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  var daysLeft = Math.max(1, Math.ceil((endOfMonth - now) / (24 * 60 * 60 * 1000)));
  return available / daysLeft;
}

function isCurrentMonth(monthDate) {
  var now = new Date();
  return monthDate.getFullYear() === now.getFullYear() && monthDate.getMonth() === now.getMonth();
}

// ============================================
// BUDGET SCREEN
// ============================================
function updateBudgetScreen() {
  if (State.budgetDetail) {
    renderBudgetDetail(State.budgetDetail);
  } else {
    renderBudgetOverview();
  }
}

function renderBudgetOverview() {
  DOM.$("#budget-overview").classList.remove("hidden");
  DOM.$("#budget-detail").classList.add("hidden");

  // Update month label
  var monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  DOM.$("#budget-month-label").textContent = monthNames[State.budgetMonth.getMonth()] + " " + State.budgetMonth.getFullYear();

  var container = DOM.$("#budget-content");

  // Use profile-scoped budgets and groups
  var scopedBudgets = getProfileBudgets();
  var scopedGroups = getProfileBudgetGroups();

  // Empty state
  if (scopedBudgets.length === 0) {
    container.innerHTML = '<div class="budget-empty">' +
      '<svg class="budget-empty-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">' +
        '<rect x="14" y="8" width="36" height="48" rx="4"/>' +
        '<line x1="22" y1="20" x2="42" y2="20"/>' +
        '<line x1="22" y1="28" x2="42" y2="28"/>' +
        '<line x1="22" y1="36" x2="34" y2="36"/>' +
      '</svg>' +
      '<div class="budget-empty-title">Set up your first budget</div>' +
      '<div class="budget-empty-text">Decide how much you want to spend in each category. You can always adjust later.</div>' +
      '<button class="budget-empty-btn" id="budget-empty-add">+ Create Budget</button>' +
    '</div>';
    DOM.$("#budget-empty-add").addEventListener("click", function () { BudgetModal.show(); });
    return;
  }

  // Filter to visible budgets for this month
  var visibleBudgets = scopedBudgets.filter(function (b) {
    return isBudgetVisibleInMonth(b, State.budgetMonth);
  });

  // Compute totals
  var totalAssigned = 0;
  var totalActivity = 0;
  for (var i = 0; i < visibleBudgets.length; i++) {
    var b = visibleBudgets[i];
    var eff = getEffectiveBudget(b, State.budgetMonth);
    var activity = getBudgetActivity(b, State.budgetMonth);
    totalAssigned += eff.assigned;
    totalActivity += activity;
  }
  var totalAvailable = totalAssigned - totalActivity;
  var overallPct = totalAssigned > 0 ? Math.min(100, Math.round((totalActivity / totalAssigned) * 100)) : 0;
  var overallStatus = getBudgetStatus(totalAvailable, totalAssigned);

  var html = '';

  // Summary card
  html += '<div class="budget-summary">' +
    '<div class="budget-summary-columns">' +
      '<div class="budget-summary-col">' +
        '<div class="budget-summary-label">Assigned</div>' +
        '<div class="budget-summary-value">' + Format.currency(totalAssigned) + '</div>' +
      '</div>' +
      '<div class="budget-summary-col">' +
        '<div class="budget-summary-label">Activity</div>' +
        '<div class="budget-summary-value">' + Format.currency(totalActivity) + '</div>' +
      '</div>' +
      '<div class="budget-summary-col">' +
        '<div class="budget-summary-label">Available</div>' +
        '<div class="budget-summary-value ' + (totalAvailable >= 0 ? 'positive' : 'negative') + '">' +
          (totalAvailable < 0 ? '-' : '') + Format.currency(Math.abs(totalAvailable)) +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="budget-overall-bar">' +
      '<div class="budget-bar-track">' +
        '<div class="budget-bar-fill ' + overallStatus + '" style="width:' + overallPct + '%"></div>' +
      '</div>' +
    '</div>' +
  '</div>';

  // Group budgets
  for (var gi = 0; gi < scopedGroups.length; gi++) {
    var group = scopedGroups[gi];
    var groupBudgets = visibleBudgets.filter(function (b) { return b.group === group.name; });
    if (groupBudgets.length === 0) continue;

    var groupAvailable = 0;
    for (var j = 0; j < groupBudgets.length; j++) {
      groupAvailable += getBudgetAvailable(groupBudgets[j], State.budgetMonth);
    }

    var collapsed = State.budgetCollapsed[group.name] || false;

    html += '<div class="budget-group-header" data-group="' + group.name + '">' +
      '<div class="budget-group-left">' +
        '<span class="budget-group-chevron' + (collapsed ? ' collapsed' : '') + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg>' +
        '</span>' +
        '<span class="budget-group-name">' + group.name + '</span>' +
      '</div>' +
      '<span class="budget-group-available" style="color:' + (groupAvailable >= 0 ? 'var(--green)' : 'var(--red)') + '">' +
        (groupAvailable < 0 ? '-' : '') + Format.currency(Math.abs(groupAvailable)) +
      '</span>' +
    '</div>' +
    '<div class="budget-group-separator"></div>';

    if (!collapsed) {
      html += '<div class="budget-rows">';
      for (var k = 0; k < groupBudgets.length; k++) {
        var budget = groupBudgets[k];
        var eff = getEffectiveBudget(budget, State.budgetMonth);
        var effCats = eff.categories || [];

        // Build category dots HTML
        var dotsHtml = '';
        for (var di = 0; di < effCats.length; di++) {
          var ci = getCategoryInfo(effCats[di]);
          dotsHtml += '<span class="budget-row-dot" style="background:' + ci.color + '"></span>';
        }

        var activity = getBudgetActivity(budget, State.budgetMonth);
        var available = eff.assigned - activity;
        var status = getBudgetStatus(available, eff.assigned);
        var pct = eff.assigned > 0 ? Math.min(100, Math.round((activity / eff.assigned) * 100)) : 0;

        var spentLabel = activity > 0 ? 'Spent ' + Format.currency(activity) : 'No activity yet';
        var availableLabel = (available < 0 ? '-' : '') + Format.currency(Math.abs(available));

        html += '<div class="budget-row" data-budget-id="' + budget.id + '">' +
          '<div class="budget-row-name">' +
            dotsHtml +
            (budget.name || effCats[0] || 'Budget') +
          '</div>' +
          '<div class="budget-row-bar">' +
            '<div class="budget-bar-track">' +
              '<div class="budget-bar-fill ' + status + '" style="width:' + pct + '%"></div>' +
            '</div>' +
          '</div>' +
          '<div class="budget-row-bottom">' +
            '<span class="budget-row-spent">' + spentLabel + '</span>' +
            '<span class="budget-pill ' + status + '">' + availableLabel + '</span>' +
          '</div>' +
        '</div>';
      }
      html += '</div>';
    }
  }

  // Add budget button
  html += '<button class="budget-add-btn" id="budget-add-btn">+ Add Budget</button>';

  // Unbudgeted spending
  var unbudgeted = getUnbudgetedSpending(State.budgetMonth);
  if (unbudgeted.length > 0) {
    var unbudgetedTotal = unbudgeted.reduce(function (sum, tx) { return sum + tx.amount; }, 0);
    html += '<div class="budget-unbudgeted" id="budget-unbudgeted">' +
      '<div class="budget-unbudgeted-title">Spending Without a Budget</div>' +
      '<div class="budget-unbudgeted-amount">' + Format.currency(unbudgetedTotal) + ' from ' + unbudgeted.length + ' transaction' + (unbudgeted.length !== 1 ? 's' : '') + '</div>' +
    '</div>';
  }

  container.innerHTML = html;

  // Wire events
  DOM.$$("#budget-content .budget-group-header").forEach(function (header) {
    header.addEventListener("click", function () {
      var groupName = header.dataset.group;
      State.budgetCollapsed[groupName] = !State.budgetCollapsed[groupName];
      renderBudgetOverview();
    });
  });

  DOM.$$("#budget-content .budget-row").forEach(function (row) {
    row.addEventListener("click", function () {
      State.budgetDetail = row.dataset.budgetId;
      updateBudgetScreen();
    });
  });

  var addBtn = DOM.$("#budget-add-btn");
  if (addBtn) {
    addBtn.addEventListener("click", function () { BudgetModal.show(); });
  }
}

function renderBudgetDetail(budgetId) {
  DOM.$("#budget-overview").classList.add("hidden");
  DOM.$("#budget-detail").classList.remove("hidden");

  var budget = State.budgets.find(function (b) { return b.id === budgetId; });
  if (!budget) {
    State.budgetDetail = null;
    renderBudgetOverview();
    return;
  }

  var eff = getEffectiveBudget(budget, State.budgetMonth);
  var effCats = eff.categories || [];
  var activity = getBudgetActivity(budget, State.budgetMonth);
  var available = eff.assigned - activity;
  var status = getBudgetStatus(available, eff.assigned);
  var pct = eff.assigned > 0 ? Math.min(100, Math.round((activity / eff.assigned) * 100)) : 0;

  var container = DOM.$("#budget-detail-content");
  var html = '';

  // Detail card — budget name + category dots
  var catsHtml = '';
  for (var ci = 0; ci < effCats.length; ci++) {
    var catInfo = getCategoryInfo(effCats[ci]);
    catsHtml += '<span class="budget-detail-cat-item">' +
      '<span class="budget-row-dot" style="background:' + catInfo.color + '"></span>' +
      effCats[ci] +
    '</span>';
  }

  html += '<div class="budget-detail-card">' +
    '<div class="budget-detail-category">' +
      (budget.name || effCats[0] || 'Budget') +
    '</div>' +
    '<div class="budget-detail-categories">' + catsHtml + '</div>' +
    '<div class="budget-summary-columns">' +
      '<div class="budget-summary-col">' +
        '<div class="budget-summary-label">Assigned</div>' +
        '<div class="budget-summary-value">' + Format.currency(eff.assigned) + '</div>' +
      '</div>' +
      '<div class="budget-summary-col">' +
        '<div class="budget-summary-label">Activity</div>' +
        '<div class="budget-summary-value">' + Format.currency(activity) + '</div>' +
      '</div>' +
      '<div class="budget-summary-col">' +
        '<div class="budget-summary-label">Available</div>' +
        '<div class="budget-summary-value">' +
          '<span class="budget-pill ' + status + '">' + (available < 0 ? '-' : '') + Format.currency(Math.abs(available)) + '</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="budget-detail-bar">' +
      '<div class="budget-bar-track large">' +
        '<div class="budget-bar-fill ' + status + '" style="width:' + pct + '%"></div>' +
      '</div>' +
    '</div>';

  // Daily pace line
  if (isCurrentMonth(State.budgetMonth)) {
    if (available > 0) {
      var pace = getDailyPace(available, State.budgetMonth);
      var endOfMonth = new Date(State.budgetMonth.getFullYear(), State.budgetMonth.getMonth() + 1, 0);
      var daysLeft = Math.max(1, Math.ceil((endOfMonth - new Date()) / (24 * 60 * 60 * 1000)));
      html += '<div class="budget-detail-pace">' + Format.currency(Math.round(pace)) + '/day for ' + daysLeft + ' day' + (daysLeft !== 1 ? 's' : '') + ' left</div>';
    } else if (available < 0) {
      html += '<div class="budget-detail-pace overspent">Overspent by ' + Format.currency(Math.abs(available)) + '</div>';
    }
  }

  html += '</div>';

  // Transactions list — filter by ANY of the effective categories
  var start = new Date(State.budgetMonth.getFullYear(), State.budgetMonth.getMonth(), 1);
  var end = new Date(State.budgetMonth.getFullYear(), State.budgetMonth.getMonth() + 1, 0, 23, 59, 59);
  var txs = State.transactions.filter(function (tx) {
    if (!tx.timestamp || tx.timestamp < start || tx.timestamp > end) return false;
    if (!tx.isExpense) return false;
    var txCats = tx.categories || [];
    for (var c = 0; c < effCats.length; c++) {
      if (txCats.indexOf(effCats[c]) !== -1) return true;
    }
    return false;
  });

  html += '<div class="budget-detail-transactions-header">Transactions (' + txs.length + ')</div>';

  container.innerHTML = html;

  // Render transactions using existing Render functions
  if (txs.length === 0) {
    container.insertAdjacentHTML("beforeend",
      '<div class="empty-state" style="padding: 32px 16px;"><div class="empty-state-title">No spending in ' + (budget.name || 'this budget') + ' this month</div></div>'
    );
  } else {
    // Group by date
    var groups = new Map();
    for (var i = 0; i < txs.length; i++) {
      var dateKey = txs[i].timestamp ? txs[i].timestamp.toDateString() : "Unknown";
      if (!groups.has(dateKey)) groups.set(dateKey, []);
      groups.get(dateKey).push(txs[i]);
    }
    var fragment = document.createDocumentFragment();
    for (var entry of groups) {
      var date = entry[1][0].timestamp;
      fragment.appendChild(Render.transactionGroup(date, entry[1]));
    }
    container.appendChild(fragment);
  }
}

// ============================================
// TOOLS SCREEN
// ============================================
function updateToolsScreen() {
  var grid = DOM.$("#tools-grid");
  var gridFooter = DOM.$("#tools-grid-footer");
  var contactsView = DOM.$("#tools-contacts");
  var verifierView = DOM.$("#tools-verifier");
  var smsParserView = DOM.$("#tools-sms-parser");
  var failedSmsView = DOM.$("#tools-failed-sms");
  var fab = DOM.$("#fab-add-account");
  var headerMain = DOM.$("#tools-header-main");
  var headerBack = DOM.$("#tools-header-back");
  var toolName = DOM.$("#tools-header-tool-name");

  var TOOL_NAMES = { contacts: "Contacts", verifier: "Payment Verifier", "sms-parser": "SMS Parser", "failed-sms": "Failed SMS" };

  if (State.currentTool) {
    // Sub-view mode: swap header
    headerMain.classList.add("hidden");
    headerBack.classList.remove("hidden");
    toolName.textContent = TOOL_NAMES[State.currentTool] || "";
    grid.classList.add("hidden");
    gridFooter.classList.add("hidden");

    contactsView.classList.toggle("hidden", State.currentTool !== "contacts");
    verifierView.classList.toggle("hidden", State.currentTool !== "verifier");
    smsParserView.classList.toggle("hidden", State.currentTool !== "sms-parser");
    failedSmsView.classList.toggle("hidden", State.currentTool !== "failed-sms");

    if (fab) fab.classList.toggle("hidden", State.currentTool !== "contacts");
    if (State.currentTool === "contacts") renderContactsList();
    if (State.currentTool === "failed-sms") renderFailedSmsList();
  } else {
    // Grid mode
    headerMain.classList.remove("hidden");
    headerBack.classList.add("hidden");
    grid.classList.remove("hidden");
    gridFooter.classList.remove("hidden");
    contactsView.classList.add("hidden");
    verifierView.classList.add("hidden");
    smsParserView.classList.add("hidden");
    failedSmsView.classList.add("hidden");
    if (fab) fab.classList.add("hidden");
  }
}

// ============================================
// SMS PARSER
// ============================================
var SmsParserBankSelector = {
  selectedBankId: null,

  toggleDropdown: function () {
    var dropdown = DOM.$("#sms-parser-bank-dropdown");
    if (dropdown.classList.contains("hidden")) {
      dropdown.innerHTML = "";
      // Auto-detect option
      var autoOpt = document.createElement("div");
      autoOpt.className = "bank-selector-option";
      autoOpt.dataset.bankId = "";
      var autoInfo = document.createElement("div");
      autoInfo.className = "bank-selector-option-info";
      var autoName = document.createElement("div");
      autoName.className = "bank-selector-option-name";
      autoName.textContent = "Auto-detect";
      autoInfo.appendChild(autoName);
      autoOpt.appendChild(autoInfo);
      autoOpt.addEventListener("click", function () { SmsParserBankSelector.select(""); });
      dropdown.appendChild(autoOpt);

      for (var i = 0; i < State.banks.length; i++) {
        var b = State.banks[i];
        if (b.virtual) continue;
        var opt = document.createElement("div");
        opt.className = "bank-selector-option";
        opt.dataset.bankId = b.id;
        var logo = document.createElement("div");
        logo.className = "bank-logo";
        logo.style.background = "linear-gradient(135deg, " + b.colors[0] + ", " + b.colors[1] + ")";
        logo.textContent = b.shortName.substring(0, 3);
        var info = document.createElement("div");
        info.className = "bank-selector-option-info";
        var name = document.createElement("div");
        name.className = "bank-selector-option-name";
        name.textContent = b.shortName;
        var full = document.createElement("div");
        full.className = "bank-selector-option-full";
        full.textContent = b.name;
        info.appendChild(name);
        info.appendChild(full);
        opt.appendChild(logo);
        opt.appendChild(info);
        (function (bankId) {
          opt.addEventListener("click", function () { SmsParserBankSelector.select(bankId); });
        })(String(b.id));
        dropdown.appendChild(opt);
      }
      dropdown.classList.remove("hidden");
    } else {
      dropdown.classList.add("hidden");
    }
  },

  closeDropdown: function () {
    DOM.$("#sms-parser-bank-dropdown").classList.add("hidden");
  },

  select: function (bankId) {
    this.selectedBankId = bankId || null;
    var selected = DOM.$("#sms-parser-bank-selected");
    if (bankId) {
      var bank = State.banksMap.get(String(bankId));
      selected.innerHTML = '<div class="bank-selector-value">' +
        '<div class="bank-logo" style="background:linear-gradient(135deg,' +
        bank.colors[0] + ',' + bank.colors[1] + ')">' + bank.shortName.substring(0, 3) +
        '</div><span>' + bank.shortName + '</span></div>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="6 9 12 15 18 9"/></svg>';
    } else {
      selected.innerHTML = '<span class="bank-selector-placeholder">Auto-detect</span>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="6 9 12 15 18 9"/></svg>';
    }
    this.closeDropdown();
  }
};

function parseSmsText(smsText, filterBankId) {
  var text = smsText.trim();
  if (!text) return null;

  var patterns = State.smsPatterns;
  if (!patterns || patterns.length === 0) return null;

  for (var i = 0; i < patterns.length; i++) {
    var p = patterns[i];
    if (filterBankId && String(p.bankId) !== String(filterBankId)) continue;

    var regex;
    try {
      regex = new RegExp(p.regex, "s");
    } catch (e) {
      continue;
    }

    var match = text.match(regex);
    if (!match) continue;

    var result = {
      bankId: String(p.bankId),
      type: p.type || null,
      timestamp: new Date().toISOString(),
    };

    var mapping = p.mapping || {};
    for (var field in mapping) {
      var groupIndex = mapping[field];
      result[field] = match[groupIndex] || "";
    }

    // Use totalAmount as amount if amount not directly captured
    if (!result.amount && result.totalAmount) {
      result.amount = result.totalAmount;
    }

    result._patternDesc = p.description || "Pattern #" + i;
    result._senderId = p.senderId || "";
    return result;
  }

  return null;
}

function renderSmsParserResult(result) {
  var container = DOM.$("#sms-parser-result");
  if (!result) {
    container.className = "sms-parser-result-error";
    container.innerHTML = '<div class="sms-parser-error">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">' +
      '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' +
      '<span>No matching pattern found. Check the SMS text or try selecting a bank.</span></div>';
    return;
  }

  var bank = State.banksMap.get(String(result.bankId));
  var bankName = bank ? bank.shortName : "Bank #" + result.bankId;
  var colors = bank ? bank.colors : ["#6b7280", "#4b5563"];
  var isDebit = result.type === "DEBIT";

  var fields = [];
  if (result.amount) fields.push({ label: "Amount", value: "ETB " + result.amount });
  if (result.balance) fields.push({ label: "Balance", value: "ETB " + result.balance });
  if (result.account) fields.push({ label: "Account", value: result.account });
  if (result.reference) fields.push({ label: "Reference", value: result.reference });
  if (result.receiver) fields.push({ label: "Receiver", value: result.receiver });
  if (result.serviceCharge) fields.push({ label: "Service Charge", value: "ETB " + result.serviceCharge });
  if (result.vat) fields.push({ label: "VAT", value: "ETB " + result.vat });
  if (result.totalFees) fields.push({ label: "Total Fees", value: "ETB " + result.totalFees });

  var fieldsHtml = "";
  for (var i = 0; i < fields.length; i++) {
    fieldsHtml += '<div class="sms-parser-field">' +
      '<span class="sms-parser-field-label">' + fields[i].label + '</span>' +
      '<span class="sms-parser-field-value">' + fields[i].value + '</span></div>';
  }

  container.className = "sms-parser-result-success";
  container.innerHTML =
    '<div class="sms-parser-result-card">' +
      '<div class="sms-parser-result-header">' +
        '<div class="sms-parser-result-bank" style="background:linear-gradient(135deg,' + colors[0] + ',' + colors[1] + ')">' + bankName + '</div>' +
        '<span class="sms-parser-result-type ' + (isDebit ? 'debit' : 'credit') + '">' + (isDebit ? 'Expense' : 'Income') + '</span>' +
      '</div>' +
      '<div class="sms-parser-result-pattern">' + result._patternDesc + '</div>' +
      '<div class="sms-parser-fields">' + fieldsHtml + '</div>' +
      '<button class="form-submit sms-parser-save" id="sms-parser-save">' +
        '<span>Add Transaction</span>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 5v14M5 12h14"/></svg>' +
      '</button>' +
    '</div>';

  DOM.$("#sms-parser-save").addEventListener("click", function () {
    saveParsedSms(result);
  });
}

function saveParsedSms(result) {
  // Build transaction object matching the expected shape
  var txObj = {
    amount: result.amount || "",
    reference: result.reference || "",
    account: result.account || "",
    receiver: result.receiver || "",
    vat: result.vat || "",
    totalFees: result.totalFees || "",
    serviceCharge: result.serviceCharge || "",
    balance: result.balance || "",
    bankId: result.bankId,
    type: result.type || null,
    timestamp: result.timestamp,
  };

  // Persist to file
  persistAppendTx(txObj);

  // Add to in-memory State
  var bank = State.banksMap.get(String(txObj.bankId));
  var receiver = txObj.receiver || "Unknown";
  var isExpense = txObj.type ? txObj.type === "DEBIT" : (receiver && receiver.trim() !== "" && receiver !== "Unknown");
  var processed = {
    id: txObj.reference || "tx-" + State.transactions.length,
    type: txObj.type || null,
    isExpense: isExpense,
    amount: Parser.parseAmount(txObj.amount),
    reference: txObj.reference || "N/A",
    account: txObj.account || "",
    receiver: receiver,
    vat: Parser.parseAmount(txObj.vat),
    totalFees: Parser.parseAmount(txObj.totalFees),
    serviceCharge: Parser.parseAmount(txObj.serviceCharge),
    balance: Parser.parseAmount(txObj.balance),
    bankId: txObj.bankId || null,
    timestamp: txObj.timestamp ? new Date(txObj.timestamp) : null,
    bank: bank,
    bankName: bank ? bank.shortName : "Unknown",
    bankColors: bank ? bank.colors : ["#6b7280", "#4b5563"],
    categories: [],
  };
  processed.resolvedAccount = resolveAccountForTransaction(processed);

  State.transactions.unshift(processed);

  // Show success feedback
  var container = DOM.$("#sms-parser-result");
  container.innerHTML = '<div class="sms-parser-success">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">' +
    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
    '<span>Transaction added!</span></div>';

  // Clear the form
  DOM.$("#sms-parser-text").value = "";

  // Refresh relevant screens
  updateDashboard();
}

// ============================================
// FAILED SMS
// ============================================
function renderFailedSmsList() {
  var listEl = DOM.$("#failed-sms-list");
  var emptyEl = DOM.$("#failed-sms-empty");
  var countEl = DOM.$("#failed-sms-count");
  var retryAllBtn = DOM.$("#failed-sms-retry-all");

  // Filter out empty messages, show latest first
  var items = State.failedLogs.filter(function (f) {
    return f.message && f.message.trim();
  }).reverse();

  countEl.textContent = items.length + (items.length === 1 ? " message" : " messages");
  retryAllBtn.classList.toggle("hidden", items.length === 0);

  if (items.length === 0) {
    listEl.innerHTML = "";
    emptyEl.classList.remove("hidden");
    return;
  }
  emptyEl.classList.add("hidden");

  var html = "";
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var tsDate = item.timestamp ? new Date(item.timestamp) : null;
    var ts = tsDate ? Format.date(tsDate) + " " + Format.time(tsDate) : "";
    var preview = item.message.length > 120 ? item.message.substring(0, 120) + "…" : item.message;
    // Escape HTML
    preview = preview.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html += '<div class="failed-sms-item" data-index="' + i + '">' +
      '<div class="failed-sms-item-header">' +
        '<span class="failed-sms-item-date">' + ts + '</span>' +
        '<div class="failed-sms-item-actions">' +
          '<button class="failed-sms-btn-retry" data-index="' + i + '" title="Retry">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/></svg>' +
          '</button>' +
          '<button class="failed-sms-btn-dismiss" data-index="' + i + '" title="Dismiss">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="failed-sms-item-text">' + preview + '</div>' +
      '<div class="failed-sms-item-result hidden" id="failed-sms-result-' + i + '"></div>' +
    '</div>';
  }
  listEl.innerHTML = html;

  // Wire up retry buttons
  listEl.querySelectorAll(".failed-sms-btn-retry").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      retryFailedSms(parseInt(btn.dataset.index));
    });
  });

  // Wire up dismiss buttons
  listEl.querySelectorAll(".failed-sms-btn-dismiss").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      dismissFailedSms(parseInt(btn.dataset.index));
    });
  });
}

function retryFailedSms(index) {
  var items = State.failedLogs.filter(function (f) {
    return f.message && f.message.trim();
  }).reverse();
  var item = items[index];
  if (!item) return;

  var result = parseSmsText(item.message, null);
  var resultEl = DOM.$("#failed-sms-result-" + index);
  if (!resultEl) return;

  if (!result) {
    resultEl.className = "failed-sms-item-result";
    resultEl.innerHTML = '<div class="failed-sms-no-match">No matching pattern</div>';
    return;
  }

  // Use the original timestamp from the failed entry
  if (item.timestamp) result.timestamp = item.timestamp;

  var bank = State.banksMap.get(String(result.bankId));
  var bankName = bank ? bank.shortName : "Bank #" + result.bankId;
  var colors = bank ? bank.colors : ["#6b7280", "#4b5563"];
  var isDebit = result.type === "DEBIT";
  var amountDisplay = result.amount ? "ETB " + result.amount : "";

  resultEl.className = "failed-sms-item-result";
  resultEl.innerHTML =
    '<div class="failed-sms-match">' +
      '<div class="failed-sms-match-header">' +
        '<span class="failed-sms-match-bank" style="background:linear-gradient(135deg,' + colors[0] + ',' + colors[1] + ')">' + bankName + '</span>' +
        '<span class="failed-sms-match-type ' + (isDebit ? 'debit' : 'credit') + '">' + (isDebit ? 'Expense' : 'Income') + '</span>' +
        (amountDisplay ? '<span class="failed-sms-match-amount">' + amountDisplay + '</span>' : '') +
      '</div>' +
      '<div class="failed-sms-match-pattern">' + result._patternDesc + '</div>' +
      '<button class="failed-sms-btn-save" data-index="' + index + '">Save Transaction</button>' +
    '</div>';

  resultEl.querySelector(".failed-sms-btn-save").addEventListener("click", function () {
    saveFailedSms(index, result);
  });
}

function saveFailedSms(index, result) {
  var txObj = {
    amount: result.amount || "",
    reference: result.reference || "",
    account: result.account || "",
    receiver: result.receiver || "",
    vat: result.vat || "",
    totalFees: result.totalFees || "",
    serviceCharge: result.serviceCharge || "",
    balance: result.balance || "",
    bankId: result.bankId,
    type: result.type || null,
    timestamp: result.timestamp,
  };

  persistAppendTx(txObj);

  // Add to in-memory State
  var bank = State.banksMap.get(String(txObj.bankId));
  var receiver = txObj.receiver || "Unknown";
  var isExpense = txObj.type ? txObj.type === "DEBIT" : (receiver && receiver.trim() !== "" && receiver !== "Unknown");
  var processed = {
    id: txObj.reference || "tx-" + State.transactions.length,
    type: txObj.type || null,
    isExpense: isExpense,
    amount: Parser.parseAmount(txObj.amount),
    reference: txObj.reference || "N/A",
    account: txObj.account || "",
    receiver: receiver,
    vat: Parser.parseAmount(txObj.vat),
    totalFees: Parser.parseAmount(txObj.totalFees),
    serviceCharge: Parser.parseAmount(txObj.serviceCharge),
    balance: Parser.parseAmount(txObj.balance),
    bankId: txObj.bankId || null,
    timestamp: txObj.timestamp ? new Date(txObj.timestamp) : null,
    bank: bank,
    bankName: bank ? bank.shortName : "Unknown",
    bankColors: bank ? bank.colors : ["#6b7280", "#4b5563"],
    categories: [],
    profileId: null,
  };
  processed.resolvedAccount = resolveAccountForTransaction(processed);

  // Insert sorted by timestamp (newest first)
  var inserted = false;
  if (processed.timestamp) {
    for (var si = 0; si < State.transactions.length; si++) {
      if (!State.transactions[si].timestamp || processed.timestamp > State.transactions[si].timestamp) {
        State.transactions.splice(si, 0, processed);
        inserted = true;
        break;
      }
    }
  }
  if (!inserted) State.transactions.push(processed);

  // Apply category rules
  for (var ri = 0; ri < State.categoryRules.length; ri++) {
    var rule = State.categoryRules[ri];
    if (rule.receiver && processed.receiver && rule.receiver.toLowerCase() === processed.receiver.toLowerCase()) {
      var cats = processed.categories || [];
      if (cats.indexOf(rule.category) === -1) cats.push(rule.category);
      processed.categories = cats;
      State.categoryMap.set(processed.id, cats);
    }
  }

  // Remove from failed list AFTER transaction is persisted
  setTimeout(function() { removeFailedByIndex(index); }, 500);

  // Refresh all views
  updateDashboard();
  updateTransactionsList();
  updateLedger();
  if (State.currentScreen === "money") {
    updateActivityTab();
    updateAccountsTab();
  }
}

function dismissFailedSms(index) {
  removeFailedByIndex(index);
}

function removeFailedByIndex(visibleIndex) {
  // Visible list is reversed (newest first), so walk State.failedLogs backward
  var count = -1;
  for (var i = State.failedLogs.length - 1; i >= 0; i--) {
    if (State.failedLogs[i].message && State.failedLogs[i].message.trim()) {
      count++;
      if (count === visibleIndex) {
        State.failedLogs.splice(i, 1);
        break;
      }
    }
  }
  persistFailed();
  renderFailedSmsList();
}

function retryAllFailedSms() {
  var saved = 0;
  var txBatch = [];
  var removeIndices = []; // track which failed logs to remove AFTER persist

  for (var i = 0; i < State.failedLogs.length; i++) {
    var item = State.failedLogs[i];
    if (!item.message || !item.message.trim()) continue;

    var result = parseSmsText(item.message, null);
    if (!result) continue;

    if (item.timestamp) result.timestamp = item.timestamp;

    txBatch.push({
      amount: result.amount || "",
      reference: result.reference || "",
      account: result.account || "",
      receiver: result.receiver || "",
      vat: result.vat || "",
      totalFees: result.totalFees || "",
      serviceCharge: result.serviceCharge || "",
      balance: result.balance || "",
      bankId: result.bankId,
      type: result.type || null,
      timestamp: result.timestamp,
    });

    var txObj = txBatch[txBatch.length - 1];
    var bank = State.banksMap.get(String(txObj.bankId));
    var receiver = txObj.receiver || "Unknown";
    var isExpense = txObj.type ? txObj.type === "DEBIT" : (receiver && receiver.trim() !== "" && receiver !== "Unknown");
    var processed = {
      id: txObj.reference || "tx-" + (State.transactions.length + saved),
      type: txObj.type || null,
      isExpense: isExpense,
      amount: Parser.parseAmount(txObj.amount),
      reference: txObj.reference || "N/A",
      account: txObj.account || "",
      receiver: receiver,
      vat: Parser.parseAmount(txObj.vat),
      totalFees: Parser.parseAmount(txObj.totalFees),
      serviceCharge: Parser.parseAmount(txObj.serviceCharge),
      balance: Parser.parseAmount(txObj.balance),
      bankId: txObj.bankId || null,
      timestamp: txObj.timestamp ? new Date(txObj.timestamp) : null,
      bank: bank,
      bankName: bank ? bank.shortName : "Unknown",
      bankColors: bank ? bank.colors : ["#6b7280", "#4b5563"],
      categories: [],
      profileId: null,
    };
    processed.resolvedAccount = resolveAccountForTransaction(processed);

    // Insert sorted by timestamp
    var ins = false;
    if (processed.timestamp) {
      for (var si = 0; si < State.transactions.length; si++) {
        if (!State.transactions[si].timestamp || processed.timestamp > State.transactions[si].timestamp) {
          State.transactions.splice(si, 0, processed);
          ins = true;
          break;
        }
      }
    }
    if (!ins) State.transactions.push(processed);

    // Apply category rules
    for (var ri = 0; ri < State.categoryRules.length; ri++) {
      var rule = State.categoryRules[ri];
      if (rule.receiver && processed.receiver && rule.receiver.toLowerCase() === processed.receiver.toLowerCase()) {
        var cats = processed.categories || [];
        if (cats.indexOf(rule.category) === -1) cats.push(rule.category);
        processed.categories = cats;
        State.categoryMap.set(processed.id, cats);
      }
    }

    removeIndices.push(i);
    saved++;
  }

  // PERSIST TRANSACTIONS FIRST — this is the critical write
  if (txBatch.length > 0) persistAppendTx(txBatch);

  // Only remove from failed logs AFTER transactions are persisted
  // Remove backwards so indices stay valid
  for (var ri = removeIndices.length - 1; ri >= 0; ri--) {
    State.failedLogs.splice(removeIndices[ri], 1);
  }
  // Delay failed log persist to give Scriptable time to write transactions
  setTimeout(function() { persistFailed(); }, 500);

  renderFailedSmsList();
  if (saved > 0) {
    updateDashboard();
    updateTransactionsList();
    updateLedger();
    if (State.currentScreen === "money") {
      updateActivityTab();
      updateAccountsTab();
    }
  }

  var countEl = DOM.$("#failed-sms-count");
  if (saved > 0) {
    countEl.textContent = saved + " parsed & saved!";
  } else {
    countEl.textContent = "No new matches found";
  }
}

function renderContactsList() {
  var listEl = DOM.$("#contacts-list");
  var emptyEl = DOM.$("#contacts-empty");
  var countEl = DOM.$("#contacts-count");
  var query = State.contactSearch.toLowerCase().trim();

  // Update count
  var total = State.contacts.length;
  if (countEl) {
    countEl.textContent = total + (total === 1 ? " contact" : " contacts");
  }

  var filtered = State.contacts;
  if (query) {
    filtered = State.contacts.filter(function (c) {
      return (c.name && c.name.toLowerCase().indexOf(query) >= 0) ||
        (c.number && c.number.indexOf(query) >= 0) ||
        (c.bankName && c.bankName.toLowerCase().indexOf(query) >= 0);
    });
  }

  if (filtered.length === 0) {
    listEl.innerHTML = "";
    emptyEl.classList.remove("hidden");
    if (query) {
      emptyEl.querySelector(".tools-empty-title").textContent = "No matches";
      emptyEl.querySelector(".tools-empty-text").innerHTML = "Try a different search term";
    } else {
      emptyEl.querySelector(".tools-empty-title").textContent = "No contacts yet";
      emptyEl.querySelector(".tools-empty-text").innerHTML = "Tap <strong>+</strong> to save someone's bank account";
    }
    return;
  }

  emptyEl.classList.add("hidden");

  var fragment = document.createDocumentFragment();
  var wrapper = document.createElement("div");
  wrapper.className = "contacts-list-inner";

  for (var i = 0; i < filtered.length; i++) {
    var contact = filtered[i];
    var bank = contact.bankId ? State.banksMap.get(String(contact.bankId)) : null;
    var colors = bank ? bank.colors : ["#6b7280", "#4b5563"];
    var shortName = contact.bankName || (bank ? bank.shortName : "?");

    var item = document.createElement("div");
    item.className = "contact-item";

    var logo = document.createElement("div");
    logo.className = "contact-item-logo";
    logo.style.background = "linear-gradient(135deg, " + colors[0] + ", " + colors[1] + ")";
    logo.textContent = shortName.substring(0, 3);

    var info = document.createElement("div");
    info.className = "contact-item-info";

    var nameEl = document.createElement("div");
    nameEl.className = "contact-item-name";
    nameEl.textContent = contact.name || "Unnamed";

    var detail = document.createElement("div");
    detail.className = "contact-item-detail";
    detail.textContent = shortName + " \u00B7 " + (contact.number || "");

    info.appendChild(nameEl);
    info.appendChild(detail);

    var copyBtn = document.createElement("button");
    copyBtn.className = "contact-copy-btn";
    copyBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    (function (num, btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        copyToClipboard(num, btn);
      });
    })(contact.number || "", copyBtn);

    // Tap to edit
    (function (idx) {
      item.addEventListener("click", function () {
        AddContactModal.edit(idx);
      });
    })(State.contacts.indexOf(contact));

    item.appendChild(logo);
    item.appendChild(info);
    item.appendChild(copyBtn);
    wrapper.appendChild(item);
  }

  fragment.appendChild(wrapper);
  listEl.innerHTML = "";
  listEl.appendChild(fragment);
}

function copyToClipboard(text, btnEl) {
  if (!text) return;
  try {
    navigator.clipboard.writeText(text).then(function () {
      showCopyFeedback(btnEl);
    });
  } catch (e) {
    // Fallback
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showCopyFeedback(btnEl);
  }
}

function showCopyFeedback(btnEl) {
  btnEl.classList.add("copied");
  btnEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>';
  setTimeout(function () {
    btnEl.classList.remove("copied");
    btnEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  }, 1500);
}

function verifyPayment() {
  var refInput = DOM.$("#verifier-reference");
  var reference = refInput.value.trim();
  var resultEl = DOM.$("#verifier-result");

  if (!reference) {
    refInput.focus();
    return;
  }

  // Show loading
  resultEl.className = "verifier-result";
  resultEl.innerHTML = '<div class="verifier-result-loading">' +
    '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px"></div>' +
    '<span>Verifying transaction...</span>' +
    '</div>';
  resultEl.classList.remove("hidden");

  // Simulate API call (placeholder)
  setTimeout(function () {
    var success = reference.length > 4;
    if (success) {
      resultEl.className = "verifier-result verifier-result-success";
      resultEl.innerHTML = '<div class="verifier-result-title" style="color:var(--green)">Transaction Found</div>' +
        '<div class="verifier-result-text">' +
          'Reference: <strong>' + reference.replace(/</g, "&lt;") + '</strong><br>' +
          'Status: Completed<br>' +
          'This is a placeholder. Connect to a real API for live verification.' +
        '</div>';
    } else {
      resultEl.className = "verifier-result verifier-result-error";
      resultEl.innerHTML = '<div class="verifier-result-title" style="color:var(--red)">Not Found</div>' +
        '<div class="verifier-result-text">' +
          'No transaction found for reference: <strong>' + reference.replace(/</g, "&lt;") + '</strong><br>' +
          'Please check the reference number and try again.' +
        '</div>';
    }
  }, 1500);
}

// ============================================
// CATEGORY MANAGER (You screen)
// ============================================
var catmgrFilter = "expense";

function matchesCatFilter(type) {
  if (catmgrFilter === "all") return true;
  return type === catmgrFilter || type === "both";
}

function renderCategoryManager() {
  var builtinList = DOM.$("#catmgr-builtin-list");
  var customList = DOM.$("#catmgr-custom-list");
  var rulesList = DOM.$("#catmgr-rules-list");
  if (!customList || !rulesList) return;

  // --- Built-in categories (compact chips) ---
  if (builtinList) {
    var bhtml = '';
    for (var k = 0; k < CATEGORY_NAMES.length; k++) {
      var bn = CATEGORY_NAMES[k];
      var bc = CATEGORIES[bn];
      if (!matchesCatFilter(bc.type)) continue;
      var typeLabel = bc.type === "both" ? "" : '<span class="catmgr-type-badge catmgr-type-' + bc.type + '">' + bc.type + '</span>';
      bhtml += '<span class="catmgr-chip" style="--cat-color:' + bc.color + '">' +
        '<span class="catmgr-dot" style="background:' + bc.color + '"></span>' + bn + typeLabel +
      '</span>';
    }
    builtinList.innerHTML = bhtml || '<div class="catmgr-empty">No built-in categories for this type.</div>';
  }

  // --- Custom categories (editable) ---
  var cats = State.customCategories || [];
  var filteredCustom = [];
  for (var fi = 0; fi < cats.length; fi++) {
    if (matchesCatFilter(cats[fi].type || "both")) filteredCustom.push({ cat: cats[fi], idx: fi });
  }
  if (filteredCustom.length === 0) {
    customList.innerHTML = '<div class="catmgr-card"><div class="catmgr-empty">No custom categories' + (cats.length > 0 ? ' for this type' : ' yet') + '.</div></div>';
  } else {
    var html = '<div class="catmgr-card">';
    for (var i = 0; i < filteredCustom.length; i++) {
      var c = filteredCustom[i].cat;
      var origIdx = filteredCustom[i].idx;
      var cType = c.type || "both";
      html += '<div class="catmgr-item" data-idx="' + origIdx + '">' +
        '<input type="color" class="catmgr-edit-color" data-idx="' + origIdx + '" value="' + c.color + '"/>' +
        '<input type="text" class="catmgr-edit-name" data-idx="' + origIdx + '" value="' + c.name.replace(/"/g, '&quot;') + '" maxlength="24"/>' +
        '<select class="catmgr-type-select" data-idx="' + origIdx + '">' +
          '<option value="expense"' + (cType === "expense" ? ' selected' : '') + '>Expense</option>' +
          '<option value="income"' + (cType === "income" ? ' selected' : '') + '>Income</option>' +
          '<option value="both"' + (cType === "both" ? ' selected' : '') + '>Both</option>' +
        '</select>' +
        '<button class="catmgr-delete" data-type="cat" data-idx="' + origIdx + '">&times;</button>' +
      '</div>';
    }
    html += '</div>';
    customList.innerHTML = html;

    // Attach edit listeners
    customList.querySelectorAll(".catmgr-edit-name").forEach(function(input) {
      input.addEventListener("change", function() {
        var idx = parseInt(input.dataset.idx, 10);
        var newName = input.value.trim();
        if (!newName) { input.value = State.customCategories[idx].name; return; }
        // Check for duplicates (excluding self)
        var isDupe = getAllCategoryNames().some(function(n, ni) {
          return n.toLowerCase() === newName.toLowerCase() && n !== State.customCategories[idx].name;
        });
        if (isDupe) { input.value = State.customCategories[idx].name; input.style.borderColor = "var(--red)"; return; }
        renameCustomCategory(idx, newName);
      });
    });
    customList.querySelectorAll(".catmgr-edit-color").forEach(function(input) {
      input.addEventListener("input", function() {
        var idx = parseInt(input.dataset.idx, 10);
        State.customCategories[idx].color = input.value;
        persistCustomCategories();
      });
    });
    customList.querySelectorAll(".catmgr-type-select").forEach(function(sel) {
      sel.addEventListener("change", function() {
        var idx = parseInt(sel.dataset.idx, 10);
        State.customCategories[idx].type = sel.value;
        persistCustomCategories();
      });
    });
  }

  // --- Category rules (editable) ---
  var rules = State.categoryRules || [];
  var filteredRules = [];
  for (var ri = 0; ri < rules.length; ri++) {
    var rCatInfo = getCategoryInfo(rules[ri].category);
    if (matchesCatFilter(rCatInfo.type || "both")) filteredRules.push({ rule: rules[ri], idx: ri });
  }
  if (filteredRules.length === 0) {
    rulesList.innerHTML = '<div class="catmgr-card"><div class="catmgr-empty">' + (rules.length > 0 ? 'No rules for this type.' : 'No rules yet. Rules are created when you categorize a transaction and tap "Always".') + '</div></div>';
  } else {
    var allCats = getAllCategoryNames();
    var rhtml = '<div class="catmgr-card">';
    for (var j = 0; j < filteredRules.length; j++) {
      var r = filteredRules[j].rule;
      var rOrigIdx = filteredRules[j].idx;
      var catInfo = getCategoryInfo(r.category);
      var escapedReceiver = (r.receiver || "").replace(/"/g, '&quot;');
      // Category dropdown options
      var optionsHtml = '';
      for (var ci = 0; ci < allCats.length; ci++) {
        optionsHtml += '<option value="' + allCats[ci].replace(/"/g, '&quot;') + '"' + (allCats[ci] === r.category ? ' selected' : '') + '>' + allCats[ci].replace(/</g, '&lt;') + '</option>';
      }
      rhtml += '<div class="catmgr-item" data-idx="' + rOrigIdx + '">' +
        '<span class="catmgr-dot catmgr-rule-dot" data-idx="' + rOrigIdx + '" style="background:' + catInfo.color + '"></span>' +
        '<input type="text" class="catmgr-edit-name catmgr-rule-receiver-input" data-idx="' + rOrigIdx + '" value="' + escapedReceiver + '"/>' +
        '<span class="catmgr-rule-arrow">&rarr;</span>' +
        '<select class="catmgr-rule-cat-select" data-idx="' + rOrigIdx + '">' + optionsHtml + '</select>' +
        '<button class="catmgr-delete" data-type="rule" data-idx="' + rOrigIdx + '">&times;</button>' +
      '</div>';
    }
    rhtml += '</div>';
    rulesList.innerHTML = rhtml;

    // Attach edit listeners for rules
    rulesList.querySelectorAll(".catmgr-rule-receiver-input").forEach(function(input) {
      input.addEventListener("change", function() {
        var idx = parseInt(input.dataset.idx, 10);
        var val = input.value.trim();
        if (!val) { input.value = State.categoryRules[idx].receiver; return; }
        State.categoryRules[idx].receiver = val;
        persistRules();
      });
    });
    rulesList.querySelectorAll(".catmgr-rule-cat-select").forEach(function(sel) {
      sel.addEventListener("change", function() {
        var idx = parseInt(sel.dataset.idx, 10);
        State.categoryRules[idx].category = sel.value;
        persistRules();
        // Update the dot color
        var dot = rulesList.querySelector('.catmgr-rule-dot[data-idx="' + idx + '"]');
        if (dot) dot.style.background = getCategoryInfo(sel.value).color;
      });
    });
  }
}

function renameCustomCategory(idx, newName) {
  var oldName = State.customCategories[idx].name;
  State.customCategories[idx].name = newName;
  persistCustomCategories();

  // Update all transactions using the old name
  for (var i = 0; i < State.transactions.length; i++) {
    var tx = State.transactions[i];
    if (tx.categories) {
      var ci = tx.categories.indexOf(oldName);
      if (ci !== -1) {
        tx.categories[ci] = newName;
        State.categoryMap.set(tx.id, tx.categories);
      }
    }
  }

  // Update manual overrides
  for (var j = 0; j < State.categories.length; j++) {
    var entry = State.categories[j];
    if (entry.categories) {
      var ei = entry.categories.indexOf(oldName);
      if (ei !== -1) entry.categories[ei] = newName;
    }
  }
  persistCategories();

  // Update rules
  for (var k = 0; k < State.categoryRules.length; k++) {
    if (State.categoryRules[k].category === oldName) {
      State.categoryRules[k].category = newName;
    }
  }
  persistRules();
}

function deleteCustomCategory(idx) {
  var cat = State.customCategories[idx];
  if (!cat) return;

  showConfirmDialog("Delete \"" + cat.name + "\"?", "This will remove it from all transactions and rules.", function() {
    var name = cat.name;

    State.customCategories.splice(idx, 1);
    persistCustomCategories();

    for (var i = 0; i < State.transactions.length; i++) {
      var tx = State.transactions[i];
      if (tx.categories && tx.categories.indexOf(name) !== -1) {
        tx.categories = tx.categories.filter(function(c) { return c !== name; });
        State.categoryMap.set(tx.id, tx.categories);
      }
    }

    for (var j = 0; j < State.categories.length; j++) {
      var entry = State.categories[j];
      if (entry.categories && entry.categories.indexOf(name) !== -1) {
        entry.categories = entry.categories.filter(function(c) { return c !== name; });
      }
    }
    persistCategories();

    State.categoryRules = State.categoryRules.filter(function(r) { return r.category !== name; });
    persistRules();

    renderCategoryManager();
  });
}

function deleteCategoryRule(idx) {
  var r = State.categoryRules[idx];
  if (!r) return;
  showConfirmDialog("Delete rule?", "\"" + (r.receiver || "") + "\" will no longer auto-categorize as \"" + r.category + "\".", function() {
    State.categoryRules.splice(idx, 1);
    persistRules();
    renderCategoryManager();
  });
}

function showConfirmDialog(title, message, onConfirm) {
  var overlay = document.createElement("div");
  overlay.className = "confirm-overlay";
  overlay.innerHTML =
    '<div class="confirm-dialog">' +
      '<div class="confirm-title">' + title + '</div>' +
      '<div class="confirm-message">' + message + '</div>' +
      '<div class="confirm-actions">' +
        '<button class="confirm-btn confirm-btn-cancel">Cancel</button>' +
        '<button class="confirm-btn confirm-btn-delete">Delete</button>' +
      '</div>' +
    '</div>';

  overlay.querySelector(".confirm-btn-cancel").addEventListener("click", function() {
    overlay.remove();
  });
  overlay.querySelector(".confirm-btn-delete").addEventListener("click", function() {
    overlay.remove();
    onConfirm();
  });
  overlay.addEventListener("click", function(e) {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
}

function showCategoryCreateInManager() {
  var formContainer = DOM.$("#catmgr-create-form");
  if (!formContainer) return;

  if (!formContainer.classList.contains("hidden")) {
    formContainer.classList.add("hidden");
    formContainer.innerHTML = "";
    return;
  }

  formContainer.classList.remove("hidden");
  formContainer.innerHTML =
    '<div class="catmgr-create-row">' +
      '<input type="text" class="catmgr-create-input" id="catmgr-new-name" placeholder="Category name" maxlength="24"/>' +
      '<input type="color" class="catmgr-create-color" id="catmgr-new-color" value="#6366f1"/>' +
      '<select class="catmgr-type-select" id="catmgr-new-type">' +
        '<option value="expense"' + (catmgrFilter === "expense" || catmgrFilter === "all" ? ' selected' : '') + '>Expense</option>' +
        '<option value="income"' + (catmgrFilter === "income" ? ' selected' : '') + '>Income</option>' +
        '<option value="both">Both</option>' +
      '</select>' +
      '<button class="catmgr-create-save" id="catmgr-save-btn">Add</button>' +
    '</div>';

  var nameInput = DOM.$("#catmgr-new-name");
  nameInput.focus();

  DOM.$("#catmgr-save-btn").addEventListener("click", function() {
    var name = nameInput.value.trim();
    if (!name) { nameInput.focus(); return; }
    if (getAllCategoryNames().some(function(n) { return n.toLowerCase() === name.toLowerCase(); })) {
      nameInput.style.borderColor = "var(--red)";
      nameInput.focus();
      return;
    }
    createCustomCategory(name, DOM.$("#catmgr-new-color").value, DOM.$("#catmgr-new-type").value);
    formContainer.classList.add("hidden");
    formContainer.innerHTML = "";
    renderCategoryManager();
  });

  nameInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") DOM.$("#catmgr-save-btn").click();
  });
}

// ============================================
// EXPORT DATA (You screen)
// ============================================
var exportFilters = { type: "all", bankIds: [], accounts: [], dateStart: null, dateEnd: null, profileId: null };
var exportIncludes = { transactions: true, accounts: false, categories: false, rules: false, budgets: false };
var exportMode = "csv";
var stmtFilters = { accountNumber: null, dateStart: null, dateEnd: null };

function renderExportScreen() {
  // Reset
  exportFilters = { type: "all", bankIds: [], accounts: [], dateStart: null, dateEnd: null, profileId: null };
  exportIncludes = { transactions: true, accounts: false, categories: false, rules: false, budgets: false };

  // Include chips
  DOM.$$("#export-include-chips .export-chip").forEach(function(c) {
    c.classList.toggle("active", c.dataset.value === "transactions");
  });

  // Profile chips
  var profileContainer = DOM.$("#export-profile-chips");
  var phtml = '<button class="export-chip active" data-value="all">All</button>';
  for (var p = 0; p < State.profiles.length; p++) {
    phtml += '<button class="export-chip" data-value="' + State.profiles[p].id + '">' + State.profiles[p].name + '</button>';
  }
  profileContainer.innerHTML = phtml;

  // Bank chips
  var bankContainer = DOM.$("#export-bank-chips");
  var banks = State.banks || [];
  var bhtml = '<button class="export-chip active" data-value="all">All</button>';
  for (var i = 0; i < banks.length; i++) {
    bhtml += '<button class="export-chip" data-value="' + banks[i].id + '">' + banks[i].shortName + '</button>';
  }
  bankContainer.innerHTML = bhtml;

  // Account chips
  renderExportAccountChips();

  DOM.$("#export-date-start").value = "";
  DOM.$("#export-date-end").value = "";
  updateDateBtn("export-start-btn", "");
  updateDateBtn("export-end-btn", "");

  DOM.$$("#export-type-chips .export-chip").forEach(function(c) {
    c.classList.toggle("active", c.dataset.value === "all");
  });

  // Show tx filters since transactions is selected by default
  DOM.$("#export-tx-filters").classList.remove("hidden");

  // Statement mode account chips
  renderStmtAccountChips();
  stmtFilters = { accountNumber: null, dateStart: null, dateEnd: null };
  DOM.$("#export-stmt-start").value = "";
  DOM.$("#export-stmt-end").value = "";
  updateDateBtn("export-stmt-start-btn", "");
  updateDateBtn("export-stmt-end-btn", "");
  updateStmtCount();

  // Mode tabs
  exportMode = "csv";
  DOM.$(".export-mode-tab.active").classList.remove("active");
  DOM.$('.export-mode-tab[data-mode="csv"]').classList.add("active");
  DOM.$("#export-csv-mode").classList.remove("hidden");
  DOM.$("#export-stmt-mode").classList.add("hidden");

  updateExportCount();
}

function renderStmtAccountChips() {
  var container = DOM.$("#export-stmt-account-chips");

  // Use explicit accounts first
  var accounts = (State.accounts || []).slice();

  // Also discover accounts from transactions (for users without explicit accounts)
  var knownNumbers = {};
  for (var i = 0; i < accounts.length; i++) knownNumbers[accounts[i].number] = true;
  for (var j = 0; j < State.transactions.length; j++) {
    var tx = State.transactions[j];
    if (tx.resolvedAccount && !knownNumbers[tx.resolvedAccount.number]) {
      knownNumbers[tx.resolvedAccount.number] = true;
      accounts.push(tx.resolvedAccount);
    }
  }

  if (accounts.length === 0) {
    container.innerHTML = '<span class="export-empty-hint">No accounts</span>';
    return;
  }
  var html = '';
  for (var k = 0; k < accounts.length; k++) {
    var a = accounts[k];
    var label = (a.name || ('...' + a.number.slice(-4))) + ' (' + (a.bankName || '') + ')';
    html += '<button class="export-chip" data-value="' + a.number + '">' + label + '</button>';
  }
  container.innerHTML = html;
}

function getStmtTransactions() {
  if (!stmtFilters.accountNumber) return [];
  var txs = State.transactions.filter(function(tx) {
    return tx.resolvedAccount && tx.resolvedAccount.number === stmtFilters.accountNumber;
  });
  if (stmtFilters.dateStart) {
    var start = new Date(stmtFilters.dateStart);
    start.setHours(0, 0, 0, 0);
    txs = txs.filter(function(tx) { return tx.timestamp && tx.timestamp >= start; });
  }
  if (stmtFilters.dateEnd) {
    var end = new Date(stmtFilters.dateEnd);
    end.setHours(23, 59, 59, 999);
    txs = txs.filter(function(tx) { return tx.timestamp && tx.timestamp <= end; });
  }
  txs.sort(function(a, b) { return (a.timestamp || 0) - (b.timestamp || 0); });
  return txs;
}

function updateStmtCount() {
  var el = DOM.$("#export-stmt-count");
  if (!stmtFilters.accountNumber) { el.textContent = "Select an account"; return; }
  var txs = getStmtTransactions();
  el.textContent = txs.length + " transaction" + (txs.length !== 1 ? "s" : "");
}

function exportStatement() {
  if (!stmtFilters.accountNumber) return;
  var txs = getStmtTransactions();
  var acct = (State.accounts || []).find(function(a) { return a.number === stmtFilters.accountNumber; });
  // Fallback: find from resolved transactions
  if (!acct) {
    for (var ti = 0; ti < State.transactions.length; ti++) {
      if (State.transactions[ti].resolvedAccount && State.transactions[ti].resolvedAccount.number === stmtFilters.accountNumber) {
        acct = State.transactions[ti].resolvedAccount;
        break;
      }
    }
  }
  if (!acct) return;

  var bank = State.banksMap ? State.banksMap[acct.bankId] : null;
  var bankName = bank ? bank.name : (acct.bankFullName || acct.bankName || "");
  var bankShort = bank ? bank.shortName : (acct.bankName || "");
  var bankColor = bank && bank.colors ? bank.colors[0] : "#6b21a8";

  // Compute totals
  var totalDebit = 0, totalCredit = 0;
  for (var i = 0; i < txs.length; i++) {
    if (txs[i].isExpense) totalDebit += txs[i].amount || 0;
    else totalCredit += txs[i].amount || 0;
  }

  var openBal = txs.length > 0 && txs[0].balance != null ? (txs[0].isExpense ? txs[0].balance + txs[0].amount : txs[0].balance - txs[0].amount) : 0;
  var closeBal = txs.length > 0 ? txs[txs.length - 1].balance || 0 : openBal;

  var periodStart = stmtFilters.dateStart ? Format.date(new Date(stmtFilters.dateStart)) : (txs.length > 0 ? Format.date(txs[0].timestamp) : "—");
  var periodEnd = stmtFilters.dateEnd ? Format.date(new Date(stmtFilters.dateEnd)) : (txs.length > 0 ? Format.date(txs[txs.length - 1].timestamp) : "—");

  var fmtNum = function(n) { return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };

  // Build statement rows
  var rowsHtml = '';
  for (var j = 0; j < txs.length; j++) {
    var tx = txs[j];
    var receiver = tx.receiver || "—";
    var reason = State.reasonMap.get(tx.id) || "";
    var txType = tx.isExpense ? "Debit" : "Credit";
    var txTypeClass = tx.isExpense ? "debit" : "credit";
    var amt = fmtNum(tx.amount || 0);
    var bal = tx.balance != null ? fmtNum(tx.balance) : "";
    var dateStr = tx.timestamp ? Format.date(tx.timestamp) : "";
    rowsHtml += '<tr><td>' + dateStr + '</td><td class="desc">' + receiver.replace(/</g, '&lt;') + '</td><td class="desc">' + reason.replace(/</g, '&lt;') + '</td><td class="type-' + txTypeClass + '">' + txType + '</td><td class="num">' + amt + '</td><td class="num">' + bal + '</td></tr>';
  }

  var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Statement - ' + bankShort + ' ' + (acct.name || "") + '</title>' +
    '<style>' +
    '* { margin:0; padding:0; box-sizing:border-box; }' +
    'body { font-family: -apple-system, "Segoe UI", sans-serif; color: #1a1a2e; padding: 32px; max-width: 900px; margin: 0 auto; }' +
    '.header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; border-bottom:3px solid ' + bankColor + '; padding-bottom:16px; }' +
    '.bank-name { font-size:22px; font-weight:700; color:' + bankColor + '; }' +
    '.stmt-title { font-size:13px; color:#666; margin-top:2px; }' +
    '.acct-info { text-align:right; font-size:13px; color:#444; line-height:1.6; }' +
    '.summary-row { display:flex; gap:24px; margin-bottom:20px; }' +
    '.summary-box { flex:1; padding:12px 16px; background:#f5f5f7; border-radius:8px; }' +
    '.summary-label { font-size:11px; text-transform:uppercase; color:#888; letter-spacing:0.5px; }' +
    '.summary-value { font-size:18px; font-weight:600; margin-top:2px; }' +
    'table { width:100%; border-collapse:collapse; font-size:13px; margin-bottom:20px; }' +
    'th { text-align:left; padding:8px 10px; border-bottom:2px solid #ddd; font-size:11px; text-transform:uppercase; color:#888; letter-spacing:0.5px; }' +
    'td { padding:7px 10px; border-bottom:1px solid #eee; }' +
    'td.num, th.num { text-align:right; font-variant-numeric:tabular-nums; }' +
    'td.desc { max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }' +
    '.type-debit { color:#ef4444; font-weight:500; font-size:12px; }' +
    '.type-credit { color:#22c55e; font-weight:500; font-size:12px; }' +
    'tr:nth-child(even) { background:#fafafa; }' +
    '.totals td { font-weight:600; border-top:2px solid #ddd; border-bottom:none; }' +
    '.footer { font-size:11px; color:#aaa; text-align:center; margin-top:24px; }' +
    '@media print { body { padding:16px; } .no-print { display:none; } }' +
    '</style></head><body>' +
    '<div class="header">' +
      '<div><div class="bank-name">' + bankName + '</div><div class="stmt-title">Account Statement</div></div>' +
      '<div class="acct-info">' +
        '<div><strong>' + (acct.name || "Account") + '</strong></div>' +
        '<div>' + acct.number + '</div>' +
        '<div>' + periodStart + ' — ' + periodEnd + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="summary-row">' +
      '<div class="summary-box"><div class="summary-label">Opening Balance</div><div class="summary-value">ETB ' + fmtNum(openBal) + '</div></div>' +
      '<div class="summary-box"><div class="summary-label">Total Debit</div><div class="summary-value" style="color:#ef4444">ETB ' + fmtNum(totalDebit) + '</div></div>' +
      '<div class="summary-box"><div class="summary-label">Total Credit</div><div class="summary-value" style="color:#22c55e">ETB ' + fmtNum(totalCredit) + '</div></div>' +
      '<div class="summary-box"><div class="summary-label">Closing Balance</div><div class="summary-value">ETB ' + fmtNum(closeBal) + '</div></div>' +
    '</div>' +
    '<table><thead><tr><th>Date</th><th>Receiver</th><th>Description</th><th>Type</th><th class="num">Amount</th><th class="num">Balance</th></tr></thead>' +
    '<tbody>' + rowsHtml + '</tbody></table>' +
    '<div class="footer">Generated by Totals on ' + Format.date(new Date()) + '</div>' +
    '</body></html>';

  var filename = "statement-" + bankShort + "-" + new Date().toISOString().slice(0, 10) + ".html";
  saveExportFile(filename, html);
}

function renderExportAccountChips() {
  var container = DOM.$("#export-account-chips");
  var accounts = exportFilters.profileId ? getExportProfileAccounts() : (State.accounts || []);

  if (exportFilters.bankIds.length > 0) {
    accounts = accounts.filter(function(a) {
      return exportFilters.bankIds.indexOf(String(a.bankId)) !== -1;
    });
  }

  if (accounts.length === 0) {
    container.innerHTML = '<span class="export-empty-hint">No accounts</span>';
    return;
  }

  var html = '<button class="export-chip active" data-value="all">All</button>';
  for (var i = 0; i < accounts.length; i++) {
    var a = accounts[i];
    var label = a.name || (a.bankName + " " + a.number.slice(-4));
    html += '<button class="export-chip" data-value="' + a.number + '">' + label + '</button>';
  }
  container.innerHTML = html;
  exportFilters.accounts = [];
}

function getExportProfileAccounts() {
  if (!exportFilters.profileId) return State.accounts || [];
  var profile = State.profiles.find(function(p) { return p.id === exportFilters.profileId; });
  if (!profile || !profile.accounts || profile.accounts.length === 0) return [];
  var acctSet = {};
  for (var i = 0; i < profile.accounts.length; i++) acctSet[profile.accounts[i]] = true;
  return (State.accounts || []).filter(function(a) { return acctSet[a.number]; });
}

function getExportProfileTransactions() {
  if (!exportFilters.profileId) return State.transactions;
  var profile = State.profiles.find(function(p) { return p.id === exportFilters.profileId; });
  if (!profile || !profile.accounts || profile.accounts.length === 0) {
    return State.transactions.filter(function(tx) { return tx.profileId === exportFilters.profileId; });
  }
  var acctSet = {};
  for (var i = 0; i < profile.accounts.length; i++) acctSet[profile.accounts[i]] = true;
  return State.transactions.filter(function(tx) {
    if (tx.profileId === exportFilters.profileId) return true;
    return tx.resolvedAccount && acctSet[tx.resolvedAccount.number];
  });
}

function getExportTransactions() {
  var txs = getExportProfileTransactions();

  if (exportFilters.type === "expense") {
    txs = txs.filter(function(tx) { return tx.isExpense; });
  } else if (exportFilters.type === "income") {
    txs = txs.filter(function(tx) { return !tx.isExpense; });
  }

  if (exportFilters.bankIds.length > 0) {
    txs = txs.filter(function(tx) {
      return exportFilters.bankIds.indexOf(String(tx.bankId)) !== -1;
    });
  }

  if (exportFilters.accounts.length > 0) {
    txs = txs.filter(function(tx) {
      return tx.resolvedAccount && exportFilters.accounts.indexOf(tx.resolvedAccount.number) !== -1;
    });
  }

  if (exportFilters.dateStart) {
    var start = new Date(exportFilters.dateStart);
    start.setHours(0, 0, 0, 0);
    txs = txs.filter(function(tx) { return tx.timestamp && tx.timestamp >= start; });
  }

  if (exportFilters.dateEnd) {
    var end = new Date(exportFilters.dateEnd);
    end.setHours(23, 59, 59, 999);
    txs = txs.filter(function(tx) { return tx.timestamp && tx.timestamp <= end; });
  }

  txs.sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
  return txs;
}

function updateExportCount() {
  var parts = [];
  if (exportIncludes.transactions) {
    var txs = getExportTransactions();
    parts.push(txs.length + " transaction" + (txs.length !== 1 ? "s" : ""));
  }
  if (exportIncludes.accounts) {
    var accts = exportFilters.profileId ? getExportProfileAccounts() : (State.accounts || []);
    parts.push(accts.length + " account" + (accts.length !== 1 ? "s" : ""));
  }
  if (exportIncludes.categories) {
    var cats = CATEGORY_NAMES.length + (State.customCategories || []).length;
    parts.push(cats + " categor" + (cats !== 1 ? "ies" : "y"));
  }
  if (exportIncludes.rules) {
    var rules = (State.categoryRules || []).length;
    parts.push(rules + " rule" + (rules !== 1 ? "s" : ""));
  }
  if (exportIncludes.budgets) {
    var budgets = (State.budgets || []).length;
    parts.push(budgets + " budget" + (budgets !== 1 ? "s" : ""));
  }
  var el = DOM.$("#export-count");
  if (el) el.textContent = parts.length > 0 ? parts.join(", ") : "Nothing selected";
}

function saveExportFile(filename, content) {
  // Persist to Scriptable (saves to iCloud Drive/Scriptable/)
  persistToScriptable("exportFile", { name: filename, content: content });

  // Blob download only in browser (not Scriptable WKWebView)
  // Detect browser: dev.html sets window.__devMode
  if (window.__devMode) {
    try {
      var blob = new Blob([content], { type: "application/octet-stream" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {}
  }

  showToast("Exported " + filename);
}

function showToast(message) {
  var existing = DOM.$("#export-toast");
  if (existing) existing.remove();

  var toast = document.createElement("div");
  toast.id = "export-toast";
  toast.className = "export-toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(function() { toast.classList.add("show"); }, 10);
  setTimeout(function() {
    toast.classList.remove("show");
    setTimeout(function() { toast.remove(); }, 300);
  }, 2500);
}

function csvRow(values) {
  return values.map(function(v) {
    var s = String(v == null ? "" : v).replace(/"/g, '""');
    return '"' + s + '"';
  }).join(",");
}

function exportCSV() {
  var sheets = [];

  if (exportIncludes.transactions) {
    var txs = getExportTransactions();
    if (txs.length > 0) {
      var txRows = [csvRow(["Date", "Time", "Type", "Amount", "Balance", "Bank", "Account Number", "Account Name", "Receiver", "Reference", "Categories", "Service Charge", "VAT", "Total Fees"])];
      for (var i = 0; i < txs.length; i++) {
        var tx = txs[i];
        txRows.push(csvRow([
          tx.timestamp ? Format.date(tx.timestamp) : "",
          tx.timestamp ? Format.time(tx.timestamp) : "",
          tx.isExpense ? "Expense" : "Income",
          tx.amount ? tx.amount.toFixed(2) : "0.00",
          tx.balance ? tx.balance.toFixed(2) : "",
          tx.bankName || "",
          tx.resolvedAccount ? tx.resolvedAccount.number : (tx.account || ""),
          tx.resolvedAccount ? tx.resolvedAccount.name : "",
          tx.receiver || "",
          tx.reference || "",
          (tx.categories || []).join("; "),
          tx.serviceCharge ? tx.serviceCharge.toFixed(2) : "",
          tx.vat ? tx.vat.toFixed(2) : "",
          tx.totalFees ? tx.totalFees.toFixed(2) : ""
        ]));
      }
      sheets.push("--- TRANSACTIONS ---");
      sheets.push(txRows.join("\n"));
    }
  }

  if (exportIncludes.accounts) {
    var accts = exportFilters.profileId ? getExportProfileAccounts() : (State.accounts || []);
    if (accts.length > 0) {
      var acctRows = [csvRow(["Account Name", "Account Number", "Bank", "Created"])];
      for (var j = 0; j < accts.length; j++) {
        var a = accts[j];
        acctRows.push(csvRow([a.name || "", a.number || "", a.bankName || a.bankFullName || "", a.createdAt || ""]));
      }
      sheets.push("\n--- ACCOUNTS ---");
      sheets.push(acctRows.join("\n"));
    }
  }

  if (exportIncludes.categories) {
    var catRows = [csvRow(["Category", "Type", "Color"])];
    for (var k = 0; k < CATEGORY_NAMES.length; k++) {
      catRows.push(csvRow([CATEGORY_NAMES[k], "Built-in", CATEGORIES[CATEGORY_NAMES[k]].color]));
    }
    var custom = State.customCategories || [];
    for (var l = 0; l < custom.length; l++) {
      catRows.push(csvRow([custom[l].name, "Custom", custom[l].color]));
    }
    sheets.push("\n--- CATEGORIES ---");
    sheets.push(catRows.join("\n"));
  }

  if (exportIncludes.rules) {
    var rules = State.categoryRules || [];
    if (rules.length > 0) {
      var ruleRows = [csvRow(["Receiver", "Category"])];
      for (var m = 0; m < rules.length; m++) {
        ruleRows.push(csvRow([rules[m].receiver || "", rules[m].category || ""]));
      }
      sheets.push("\n--- CATEGORY RULES ---");
      sheets.push(ruleRows.join("\n"));
    }
  }

  if (exportIncludes.budgets) {
    var budgetGroups = State.budgetGroups || [];
    var budgets = State.budgets || [];
    if (budgets.length > 0 || budgetGroups.length > 0) {
      var budgetRows = [csvRow(["Group", "Categories", "Assigned"])];
      for (var n = 0; n < budgets.length; n++) {
        var bg = budgets[n];
        var groupName = "";
        for (var g = 0; g < budgetGroups.length; g++) {
          if (budgetGroups[g].id === bg.groupId) { groupName = budgetGroups[g].name; break; }
        }
        budgetRows.push(csvRow([groupName, (bg.categories || []).join("; "), bg.assigned || 0]));
      }
      sheets.push("\n--- BUDGETS ---");
      sheets.push(budgetRows.join("\n"));
    }
  }

  if (sheets.length === 0) return;

  var csv = "\uFEFF" + sheets.join("\n");
  var filename = "totals-export-" + new Date().toISOString().slice(0, 10) + ".csv";
  saveExportFile(filename, csv);
}

// ============================================
// PROFILE SCREEN
// ============================================
function updateProfileScreen() {
  updateProfileAvatar();
  // Sync widget profile description
  var desc = DOM.$("#widget-profiles-desc");
  if (desc) {
    var sel = State.settings.widgetProfiles || [];
    if (sel.length === 0) {
      desc.textContent = "Show all profiles";
    } else {
      var names = [];
      for (var i = 0; i < sel.length; i++) {
        for (var j = 0; j < State.profiles.length; j++) {
          if (State.profiles[j].id === sel[i]) { names.push(State.profiles[j].name); break; }
        }
      }
      desc.textContent = names.join(", ");
    }
  }
}

function showProfileListModal() {
  var listEl = DOM.$("#profile-list");
  if (!listEl) return;

  var html = '';
  for (var i = 0; i < State.profiles.length; i++) {
    var p = State.profiles[i];
    var initial = (p.name || "?").charAt(0).toUpperCase();
    var color = getProfileColor(p);
    var acctCount = (p.accounts || []).length;
    var isActive = p.id === State.activeProfileId;
    html += '<div class="profile-list-item' + (isActive ? ' active' : '') + '" data-profile-id="' + p.id + '">' +
      '<div class="profile-list-avatar" style="background:' + color + '">' + initial + '</div>' +
      '<div class="profile-list-info">' +
        '<div class="profile-list-name">' + (p.name || "Unnamed") + '</div>' +
        '<div class="profile-list-meta">' + acctCount + (acctCount === 1 ? ' account' : ' accounts') + '</div>' +
      '</div>' +
      '<svg class="profile-list-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="9 18 15 12 9 6"/></svg>' +
    '</div>';
  }

  if (State.profiles.length === 0) {
    html = '<div class="profile-empty-hint">Create profiles to scope your finances by account groups.</div>';
  }

  listEl.innerHTML = html;

  // Attach click handlers
  var items = listEl.querySelectorAll(".profile-list-item");
  for (var j = 0; j < items.length; j++) {
    (function(item) {
      item.addEventListener("click", function() {
        DOM.$("#profile-list-modal").classList.remove("active");
        ProfileModal.show(item.dataset.profileId);
      });
    })(items[j]);
  }

  DOM.$("#profile-list-modal").classList.add("active");
}

function hideProfileListModal() {
  DOM.$("#profile-list-modal").classList.remove("active");
}

