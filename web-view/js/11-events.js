// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
  // Navigation (double-tap tools → open contacts with keyboard)
  var toolsLastTap = 0;
  // Hidden input to capture keyboard on user gesture before navigating
  var ghostInput = document.createElement("input");
  ghostInput.style.cssText = "position:fixed;top:-100px;opacity:0;height:0;";
  document.body.appendChild(ghostInput);

  DOM.$$(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      if (item.dataset.screen === "tools") {
        var now = Date.now();
        if (now - toolsLastTap < 400) {
          toolsLastTap = 0;
          ghostInput.focus();
          openTool("contacts");
          setTimeout(function () {
            var input = DOM.$("#contacts-search-input");
            if (input) input.focus();
          }, 50);
          return;
        }
        toolsLastTap = now;
      }
      navigateTo(item.dataset.screen);
    });
  });

  // Long-press on You nav button → profile switcher dropdown
  (function() {
    var profileBtn = DOM.$("#nav-profile-btn");
    var longPressTimer = null;
    var didLongPress = false;

    profileBtn.addEventListener("touchstart", function(e) {
      didLongPress = false;
      longPressTimer = setTimeout(function() {
        didLongPress = true;
        toggleProfileDropdown();
      }, 400);
    }, { passive: true });

    profileBtn.addEventListener("touchend", function() {
      clearTimeout(longPressTimer);
    });
    profileBtn.addEventListener("touchmove", function() {
      clearTimeout(longPressTimer);
    });
    profileBtn.addEventListener("touchcancel", function() {
      clearTimeout(longPressTimer);
    });

    // Prevent normal click if long-press fired
    profileBtn.addEventListener("click", function(e) {
      if (didLongPress) {
        e.stopImmediatePropagation();
        didLongPress = false;
      }
    });

    // Mouse long-press for desktop/dev
    profileBtn.addEventListener("mousedown", function(e) {
      didLongPress = false;
      longPressTimer = setTimeout(function() {
        didLongPress = true;
        toggleProfileDropdown();
      }, 400);
    });
    profileBtn.addEventListener("mouseup", function() {
      clearTimeout(longPressTimer);
    });
    profileBtn.addEventListener("mouseleave", function() {
      clearTimeout(longPressTimer);
    });
  })();

  // Section links
  DOM.$$("[data-navigate]").forEach((link) => {
    link.addEventListener("click", () =>
      navigateTo(link.dataset.navigate),
    );
  });

  // Insight card → money screen, activity tab
  DOM.$("#insight-card").addEventListener("click", function () {
    navigateTo("money");
    switchTab("activity");
    switchSubtab("analytics");
  });

  // "How did I get here?" → money screen, ledger subtab
  DOM.$("#link-how-did-i-get-here").addEventListener("click", function () {
    navigateTo("money");
    switchSubtab("ledger");
  });

  // Tabs (both underline and pill variants)
  DOM.$$("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Subtabs
  DOM.$$("[data-subtab]").forEach((btn) => {
    btn.addEventListener("click", () => switchSubtab(btn.dataset.subtab));
  });

  // Theme toggle (You screen toggle switch)
  DOM.$("#you-darkmode-toggle").addEventListener("change", function() {
    _navMutedColor = null; _navActiveColor = null;
    var isDark = this.checked;
    State.theme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", State.theme);
    try { localStorage.setItem("theme", State.theme); } catch (e) {}
    State.settings.theme = State.theme;
    persistSettings();
    if (State.currentSubtab === "analytics") {
      setTimeout(drawAllCharts, 50);
    }
  });

  // Balance toggle
  function toggleBalance() {
    State.balanceVisible = !State.balanceVisible;
    updateDashboard();
    updateActivityTab();
    updateTransactionsList();
    updateLedger();
    refreshAccountsMasking();
  }
  DOM.$("#btn-balance-toggle").addEventListener("click", toggleBalance);
  DOM.$("#btn-accounts-balance-toggle").addEventListener(
    "click",
    toggleBalance,
  );

  // Double-tap anywhere to toggle balance visibility
  var lastTapTime = 0;
  document.addEventListener("click", function(e) {
    var now = Date.now();
    if (now - lastTapTime < 350) {
      e.preventDefault();
      toggleBalance();
      lastTapTime = 0;
    } else {
      lastTapTime = now;
    }
  });

  // Search with debounce — refreshes the whole activity page
  let searchTimeout;
  DOM.$("#search-input").addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      State.searchQuery = e.target.value;
      updateActivityTab();
      updateTransactionsList();
      updateLedger();
      setTimeout(drawAllCharts, 100);
    }, 150);
  });

  // Modal
  DOM.$("#modal-close").addEventListener("click", hideModal);
  DOM.$("#transaction-modal").addEventListener("click", (e) => {
    if (e.target.id === "transaction-modal") hideModal();
  });

  // Drag to close
  initModalDrag("transaction-modal", hideModal);
  initModalDrag("add-account-modal", function() { AddAccountModal.hide(); });
  initModalDrag("filter-modal", function() { FilterModal.hide(); });

  // Add Account Modal
  DOM.$("#add-account-modal-close").addEventListener("click", () =>
    AddAccountModal.hide(),
  );
  DOM.$("#add-account-modal").addEventListener("click", (e) => {
    if (e.target.id === "add-account-modal") AddAccountModal.hide();
  });
  DOM.$("#bank-selector-selected").addEventListener("click", () =>
    AddAccountModal.toggleDropdown(),
  );
  DOM.$("#add-account-form").addEventListener("submit", (e) => {
    e.preventDefault();
    AddAccountModal.submit();
  });

  // Close bank dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const selector = DOM.$("#bank-selector");
    if (selector && !selector.contains(e.target)) {
      AddAccountModal.closeDropdown();
    }
  });

  // Filter Modal
  DOM.$("#btn-filter").addEventListener("click", () =>
    FilterModal.show(),
  );
  DOM.$("#filter-modal").addEventListener("click", (e) => {
    if (e.target.id === "filter-modal") FilterModal.hide();
  });
  DOM.$("#filter-clear").addEventListener("click", () =>
    FilterModal.clear(),
  );
  DOM.$("#filter-apply").addEventListener("click", () => {
    FilterModal.apply();
  });

  // Filter type chips
  DOM.$$("#filter-type-chips .filter-chip").forEach((chip) => {
    chip.addEventListener("click", () =>
      FilterModal.toggleTypeChip(chip),
    );
  });

  // Date button helper: format date for display
  function formatDateBtn(val) {
    if (!val) return null;
    var d = new Date(val + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  function updateDateBtn(btnId, val) {
    var btn = DOM.$("#" + btnId);
    if (!btn) return;
    if (val) {
      btn.textContent = formatDateBtn(val);
      btn.classList.add("has-value");
    } else {
      btn.textContent = btn.id.indexOf("start") !== -1 ? "Start date" : btn.id.indexOf("end") !== -1 ? "End date" : "Select month";
      btn.classList.remove("has-value");
    }
  }

  // Date filter inputs - sync between filter modal and ledger
  DOM.$("#filter-date-start").addEventListener("change", function (e) {
    State.filters.dateStart = e.target.value || null;
    DOM.$("#ledger-date-start").value = e.target.value;
    updateDateBtn("filter-start-btn", e.target.value);
    updateDateBtn("ledger-start-btn", e.target.value);
  });
  DOM.$("#filter-date-end").addEventListener("change", function (e) {
    State.filters.dateEnd = e.target.value || null;
    DOM.$("#ledger-date-end").value = e.target.value;
    updateDateBtn("filter-end-btn", e.target.value);
    updateDateBtn("ledger-end-btn", e.target.value);
  });

  // Ledger date inputs - apply filter and refresh
  DOM.$("#ledger-date-start").addEventListener("change", function (e) {
    State.filters.dateStart = e.target.value || null;
    DOM.$("#filter-date-start").value = e.target.value;
    updateDateBtn("ledger-start-btn", e.target.value);
    updateDateBtn("filter-start-btn", e.target.value);
    FilterModal.updateFilterIndicator();
    updateLedger();
    updateTransactionsList();
    updateActivityTab();
    setTimeout(drawAllCharts, 100);
  });
  DOM.$("#ledger-date-end").addEventListener("change", function (e) {
    State.filters.dateEnd = e.target.value || null;
    DOM.$("#filter-date-end").value = e.target.value;
    updateDateBtn("ledger-end-btn", e.target.value);
    updateDateBtn("filter-end-btn", e.target.value);
    FilterModal.updateFilterIndicator();
    updateLedger();
    updateTransactionsList();
    updateActivityTab();
    setTimeout(drawAllCharts, 100);
  });

  // Chart type selector
  DOM.$("#chart-type-selector").addEventListener("click", function (e) {
    e.stopPropagation();
    DOM.$("#chart-type-dropdown").classList.toggle("hidden");
  });

  DOM.$$("#chart-type-dropdown .chart-type-option").forEach(function (opt) {
    opt.addEventListener("click", function () {
      State.chartType = opt.dataset.chartType;
      DOM.$("#chart-type-label").textContent = opt.textContent;
      DOM.$$("#chart-type-dropdown .chart-type-option").forEach(function (o) {
        o.classList.toggle("active", o === opt);
      });
      DOM.$("#chart-type-dropdown").classList.add("hidden");
      drawChart();
    });
  });

  // Chart filter chips
  DOM.$$("#chart-filter-chips .chart-filter-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      State.chartFilter = chip.dataset.chartFilter;
      DOM.$$("#chart-filter-chips .chart-filter-chip").forEach(function (c) {
        c.classList.toggle("active", c === chip);
      });
      drawChart();
    });
  });

  // Heatmap month navigation
  DOM.$("#heatmap-prev").addEventListener("click", function () {
    if (!State.heatmapMonth) State.heatmapMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    State.heatmapMonth = new Date(State.heatmapMonth.getFullYear(), State.heatmapMonth.getMonth() - 1, 1);
    renderHeatmap();
  });
  DOM.$("#heatmap-next").addEventListener("click", function () {
    if (!State.heatmapMonth) State.heatmapMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    State.heatmapMonth = new Date(State.heatmapMonth.getFullYear(), State.heatmapMonth.getMonth() + 1, 1);
    renderHeatmap();
  });
  DOM.$("#heatmap-today").addEventListener("click", function () {
    var now = new Date();
    State.heatmapMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    renderHeatmap();
  });

  // Expense chart type selector
  DOM.$("#expense-chart-selector").addEventListener("click", function (e) {
    e.stopPropagation();
    DOM.$("#expense-chart-dropdown").classList.toggle("hidden");
  });

  DOM.$$("#expense-chart-dropdown .chart-type-option").forEach(function (opt) {
    opt.addEventListener("click", function () {
      State.expenseChartType = opt.dataset.expenseChart;
      DOM.$("#expense-chart-label").textContent = opt.textContent;
      DOM.$$("#expense-chart-dropdown .chart-type-option").forEach(function (o) {
        o.classList.toggle("active", o === opt);
      });
      DOM.$("#expense-chart-dropdown").classList.add("hidden");
      drawExpenseChart();
    });
  });

  // Expense period chips
  DOM.$$("#expense-period-chips .expense-period-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      State.expenseChartPeriod = chip.dataset.period;
      DOM.$$("#expense-period-chips .expense-period-chip").forEach(function (c) {
        c.classList.toggle("active", c === chip);
      });
      drawExpenseChart();
    });
  });

  // Close chart dropdowns on outside click
  document.addEventListener("click", function (e) {
    var dropdown = DOM.$("#chart-type-dropdown");
    var selector = DOM.$("#chart-type-selector");
    if (dropdown && !dropdown.classList.contains("hidden") && selector && !selector.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
    var expDrop = DOM.$("#expense-chart-dropdown");
    var expSel = DOM.$("#expense-chart-selector");
    if (expDrop && !expDrop.classList.contains("hidden") && expSel && !expSel.contains(e.target) && !expDrop.contains(e.target)) {
      expDrop.classList.add("hidden");
    }
  });

  // Window resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (State.currentSubtab === "analytics") {
        drawAllCharts();
      }
    }, 100);
  });

  // Handle escape key for modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideModal();
      AddAccountModal.hide();
      AddContactModal.hide();
      FilterModal.hide();
      BudgetModal.hide();
      ProfileModal.hide();
      CashExpenseModal.hide();
      CashIncomeModal.hide();
      QRModal.hide();
      ScanQRModal.hide();
      hideProfileListModal();
    }
  });

  // Tools events - tool card clicks
  DOM.$$(".tool-card[data-tool]").forEach(function (card) {
    card.addEventListener("click", function () {
      if (card.dataset.tool === "contacts") {
        // Grab keyboard with ghost input synchronously within user gesture
        ghostInput.focus();
        openTool("contacts");
        setTimeout(function () {
          var input = DOM.$("#contacts-search-input");
          if (input) input.focus();
        }, 50);
      } else {
        openTool(card.dataset.tool);
      }
    });
  });

  // Tools back button (single header back)
  DOM.$("#tools-back-btn").addEventListener("click", closeTool);

  // Contact search with debounce
  var contactSearchTimeout;
  DOM.$("#contacts-search-input").addEventListener("input", function (e) {
    clearTimeout(contactSearchTimeout);
    contactSearchTimeout = setTimeout(function () {
      State.contactSearch = e.target.value;
      renderContactsList();
    }, 150);
  });

  // Add Contact Modal
  DOM.$("#add-contact-modal-close").addEventListener("click", function () {
    AddContactModal.hide();
  });
  DOM.$("#add-contact-modal").addEventListener("click", function (e) {
    if (e.target.id === "add-contact-modal") AddContactModal.hide();
  });
  DOM.$("#contact-bank-selected").addEventListener("click", function () {
    AddContactModal.toggleDropdown();
  });
  DOM.$("#add-contact-form").addEventListener("submit", function (e) {
    e.preventDefault();
    AddContactModal.submit();
  });
  DOM.$("#add-contact-delete").addEventListener("click", function () {
    AddContactModal.deleteContact();
  });
  initModalDrag("add-contact-modal", function () { AddContactModal.hide(); });

  // Scan QR Modal
  DOM.$("#contacts-scan-btn").addEventListener("click", function () {
    ScanQRModal.show();
  });
  DOM.$("#scan-qr-modal-close").addEventListener("click", function () {
    ScanQRModal.hide();
  });
  DOM.$("#scan-qr-modal").addEventListener("click", function (e) {
    if (e.target.id === "scan-qr-modal") ScanQRModal.hide();
  });
  DOM.$("#scan-qr-capture-btn").addEventListener("click", function () {
    DOM.$("#scan-qr-file-input").click();
  });
  DOM.$("#scan-qr-file-input").addEventListener("change", function (e) {
    if (e.target.files && e.target.files[0]) {
      ScanQRModal.handleFileSelect(e.target.files[0]);
    }
  });
  DOM.$("#scan-qr-paste-btn").addEventListener("click", function () {
    ScanQRModal.handlePaste();
  });
  DOM.$("#scan-qr-save-btn").addEventListener("click", function () {
    ScanQRModal.save();
  });
  initModalDrag("scan-qr-modal", function () { ScanQRModal.hide(); });

  // FAB - context-aware: show AddContactModal when in contacts tool, otherwise AddAccountModal
  DOM.$("#fab-add-account").addEventListener("click", function () {
    if (State.currentScreen === "tools" && State.currentTool === "contacts") {
      AddContactModal.show();
    } else {
      AddAccountModal.show();
    }
  });

  // Cash Expense Modal
  DOM.$("#cash-expense-btn").addEventListener("click", function () {
    CashExpenseModal.show();
  });
  DOM.$("#cash-expense-modal-close").addEventListener("click", function () {
    CashExpenseModal.hide();
  });
  DOM.$("#cash-expense-modal").addEventListener("click", function (e) {
    if (e.target.id === "cash-expense-modal") CashExpenseModal.hide();
  });
  DOM.$("#cash-expense-form").addEventListener("submit", function (e) {
    e.preventDefault();
    CashExpenseModal.submit();
  });
  initModalDrag("cash-expense-modal", function () { CashExpenseModal.hide(); });

  // Cash Income Modal
  DOM.$("#cash-income-btn").addEventListener("click", function () {
    CashIncomeModal.show();
  });
  DOM.$("#cash-income-modal-close").addEventListener("click", function () {
    CashIncomeModal.hide();
  });
  DOM.$("#cash-income-modal").addEventListener("click", function (e) {
    if (e.target.id === "cash-income-modal") CashIncomeModal.hide();
  });
  DOM.$("#cash-income-form").addEventListener("submit", function (e) {
    e.preventDefault();
    CashIncomeModal.submit();
  });
  initModalDrag("cash-income-modal", function () { CashIncomeModal.hide(); });

  // Failed SMS events
  DOM.$("#failed-sms-retry-all").addEventListener("click", function () {
    retryAllFailedSms();
  });

  // SMS Parser events
  DOM.$("#sms-parser-bank-selected").addEventListener("click", function () {
    SmsParserBankSelector.toggleDropdown();
  });
  DOM.$("#sms-parser-submit").addEventListener("click", function () {
    var text = DOM.$("#sms-parser-text").value;
    var result = parseSmsText(text, SmsParserBankSelector.selectedBankId);
    renderSmsParserResult(result);
  });

  // Verifier events
  DOM.$("#verifier-bank-selected").addEventListener("click", function () {
    VerifierBankSelector.toggleDropdown();
  });
  DOM.$("#verifier-submit").addEventListener("click", verifyPayment);

  // Close contact bank dropdown when clicking outside
  document.addEventListener("click", function (e) {
    var contactSelector = DOM.$("#contact-bank-selector");
    if (contactSelector && !contactSelector.contains(e.target)) {
      AddContactModal.closeDropdown();
    }
    var verifierSelector = DOM.$("#verifier-bank-selector");
    if (verifierSelector && !verifierSelector.contains(e.target)) {
      VerifierBankSelector.closeDropdown();
    }
    var smsParserSelector = DOM.$("#sms-parser-bank-selector");
    if (smsParserSelector && !smsParserSelector.contains(e.target)) {
      SmsParserBankSelector.closeDropdown();
    }
  });

  // Budget events
  DOM.$("#budget-month-prev").addEventListener("click", function () {
    State.budgetMonth = new Date(State.budgetMonth.getFullYear(), State.budgetMonth.getMonth() - 1, 1);
    updateBudgetScreen();
  });
  DOM.$("#budget-month-next").addEventListener("click", function () {
    State.budgetMonth = new Date(State.budgetMonth.getFullYear(), State.budgetMonth.getMonth() + 1, 1);
    updateBudgetScreen();
  });
  DOM.$("#budget-back").addEventListener("click", function () {
    State.budgetDetail = null;
    updateBudgetScreen();
  });
  DOM.$("#budget-edit").addEventListener("click", function () {
    if (State.budgetDetail) BudgetModal.show(State.budgetDetail);
  });

  // Budget modal events
  DOM.$("#budget-modal-close").addEventListener("click", function () { BudgetModal.hide(); });
  DOM.$("#budget-modal").addEventListener("click", function (e) {
    if (e.target.id === "budget-modal") BudgetModal.hide();
  });
  DOM.$("#budget-group-selected").addEventListener("click", function () { BudgetModal.toggleGroupDropdown(); });
  DOM.$("#budget-modal-submit").addEventListener("click", function () { BudgetModal.submit(); });
  DOM.$("#budget-modal-delete").addEventListener("click", function () { BudgetModal.deleteBudget(); });
  initModalDrag("budget-modal", function() { BudgetModal.hide(); });

  // Budget type toggle
  DOM.$("#budget-type-recurring").addEventListener("click", function () { BudgetModal.setRecurring(true); });
  DOM.$("#budget-type-onetime").addEventListener("click", function () { BudgetModal.setRecurring(false); });

  // Budget target month
  DOM.$("#budget-target-month-input").addEventListener("change", function (e) {
    BudgetModal.targetMonth = e.target.value ? e.target.value.substring(0, 7) : null;
    updateDateBtn("budget-target-month-btn", e.target.value);
  });

  // Budget edit scope buttons
  DOM.$("#budget-scope-this-month").addEventListener("click", function () { BudgetModal.applyEdit("this-month"); });
  DOM.$("#budget-scope-all-future").addEventListener("click", function () { BudgetModal.applyEdit("all-future"); });

  // Budget name input
  DOM.$("#budget-name-input").addEventListener("input", function (e) {
    BudgetModal.budgetName = e.target.value;
  });

  // Close budget group dropdown when clicking outside
  document.addEventListener("click", function (e) {
    var groupSelector = DOM.$("#budget-group-selector");
    if (groupSelector && !groupSelector.contains(e.target)) {
      BudgetModal.closeGroupDropdown();
    }
  });

  // Profile list modal events
  DOM.$("#profile-list-modal-close").addEventListener("click", hideProfileListModal);
  DOM.$("#profile-list-modal").addEventListener("click", function(e) {
    if (e.target.id === "profile-list-modal") hideProfileListModal();
  });
  initModalDrag("profile-list-modal", hideProfileListModal);
  DOM.$("#profile-add-btn").addEventListener("click", function() {
    hideProfileListModal();
    ProfileModal.show();
  });

  // Profile edit modal events
  DOM.$("#profile-modal-close").addEventListener("click", function() { ProfileModal.hide(); });
  DOM.$("#profile-modal").addEventListener("click", function(e) {
    if (e.target.id === "profile-modal") ProfileModal.hide();
  });
  DOM.$("#profile-modal-submit").addEventListener("click", function() { ProfileModal.submit(); });
  DOM.$("#profile-modal-delete").addEventListener("click", function() { ProfileModal.deleteProfile(); });
  initModalDrag("profile-modal", function() { ProfileModal.hide(); });

  // Category Manager (sub-screen)
  DOM.$("#you-row-categories").addEventListener("click", function () {
    DOM.$("#category-manager").classList.remove("hidden");
    DOM.$(".you-header").classList.add("hidden");
    DOM.$(".you-content").classList.add("hidden");
    renderCategoryManager();
  });
  DOM.$("#catmgr-back").addEventListener("click", function () {
    DOM.$("#category-manager").classList.add("hidden");
    DOM.$(".you-header").classList.remove("hidden");
    DOM.$(".you-content").classList.remove("hidden");
  });
  DOM.$("#catmgr-add-cat").addEventListener("click", function () {
    showCategoryCreateInManager();
  });
  DOM.$$(".catmgr-tab").forEach(function(tab) {
    tab.addEventListener("click", function() {
      DOM.$$(".catmgr-tab").forEach(function(t) { t.classList.remove("active"); });
      tab.classList.add("active");
      catmgrFilter = tab.dataset.filter;
      renderCategoryManager();
    });
  });
  DOM.$("#category-manager").addEventListener("click", function (e) {
    var btn = e.target.closest(".catmgr-delete");
    if (!btn) return;
    var type = btn.dataset.type;
    var idx = parseInt(btn.dataset.idx, 10);
    if (type === "cat") deleteCustomCategory(idx);
    else if (type === "rule") deleteCategoryRule(idx);
  });

  // Export Data (sub-screen)
  DOM.$("#you-row-export").addEventListener("click", function () {
    DOM.$("#export-screen").classList.remove("hidden");
    DOM.$(".you-header").classList.add("hidden");
    DOM.$(".you-content").classList.add("hidden");
    renderExportScreen();
  });
  DOM.$("#export-back").addEventListener("click", function () {
    DOM.$("#export-screen").classList.add("hidden");
    DOM.$(".you-header").classList.remove("hidden");
    DOM.$(".you-content").classList.remove("hidden");
  });

  // Export mode tabs
  DOM.$$(".export-mode-tab").forEach(function(tab) {
    tab.addEventListener("click", function () {
      DOM.$$(".export-mode-tab").forEach(function(t) { t.classList.remove("active"); });
      tab.classList.add("active");
      exportMode = tab.dataset.mode;
      DOM.$("#export-csv-mode").classList.toggle("hidden", exportMode !== "csv");
      DOM.$("#export-stmt-mode").classList.toggle("hidden", exportMode !== "statement");
      if (exportMode === "statement") renderStmtAccountChips();
    });
  });

  // Statement account chips (single-select)
  DOM.$("#export-stmt-account-chips").addEventListener("click", function (e) {
    var chip = e.target.closest(".export-chip");
    if (!chip) return;
    DOM.$$("#export-stmt-account-chips .export-chip").forEach(function(c) { c.classList.remove("active"); });
    chip.classList.add("active");
    stmtFilters.accountNumber = chip.dataset.value;
    updateStmtCount();
  });

  DOM.$("#export-stmt-start").addEventListener("change", function () {
    stmtFilters.dateStart = this.value || null;
    updateDateBtn("export-stmt-start-btn", this.value);
    updateStmtCount();
  });
  DOM.$("#export-stmt-end").addEventListener("change", function () {
    stmtFilters.dateEnd = this.value || null;
    updateDateBtn("export-stmt-end-btn", this.value);
    updateStmtCount();
  });

  DOM.$("#export-stmt-btn").addEventListener("click", function () {
    exportStatement();
  });

  // Export include chips (multi-select toggle)
  DOM.$("#export-include-chips").addEventListener("click", function (e) {
    var chip = e.target.closest(".export-chip");
    if (!chip) return;
    chip.classList.toggle("active");
    var key = chip.dataset.value;
    exportIncludes[key] = chip.classList.contains("active");
    // Show/hide transaction filters based on whether transactions is included
    DOM.$("#export-tx-filters").classList.toggle("hidden", !exportIncludes.transactions);
    updateExportCount();
  });

  // Export profile chips (single-select)
  DOM.$("#export-profile-chips").addEventListener("click", function (e) {
    var chip = e.target.closest(".export-chip");
    if (!chip) return;
    DOM.$$("#export-profile-chips .export-chip").forEach(function(c) { c.classList.remove("active"); });
    chip.classList.add("active");
    exportFilters.profileId = chip.dataset.value === "all" ? null : chip.dataset.value;
    renderExportAccountChips();
    updateExportCount();
  });

  // Export type chips
  DOM.$("#export-type-chips").addEventListener("click", function (e) {
    var chip = e.target.closest(".export-chip");
    if (!chip) return;
    DOM.$$("#export-type-chips .export-chip").forEach(function(c) { c.classList.remove("active"); });
    chip.classList.add("active");
    exportFilters.type = chip.dataset.value;
    updateExportCount();
  });

  // Export bank chips (delegated)
  DOM.$("#export-bank-chips").addEventListener("click", function (e) {
    var chip = e.target.closest(".export-chip");
    if (!chip) return;
    if (chip.dataset.value === "all") {
      exportFilters.bankIds = [];
      DOM.$$("#export-bank-chips .export-chip").forEach(function(c) { c.classList.remove("active"); });
      chip.classList.add("active");
    } else {
      DOM.$("#export-bank-chips .export-chip[data-value='all']").classList.remove("active");
      chip.classList.toggle("active");
      var sel = [];
      DOM.$$("#export-bank-chips .export-chip.active").forEach(function(c) {
        if (c.dataset.value !== "all") sel.push(c.dataset.value);
      });
      exportFilters.bankIds = sel;
      if (sel.length === 0) {
        DOM.$("#export-bank-chips .export-chip[data-value='all']").classList.add("active");
      }
    }
    renderExportAccountChips();
    updateExportCount();
  });

  // Export account chips (delegated)
  DOM.$("#export-account-chips").addEventListener("click", function (e) {
    var chip = e.target.closest(".export-chip");
    if (!chip) return;
    if (chip.dataset.value === "all") {
      exportFilters.accounts = [];
      DOM.$$("#export-account-chips .export-chip").forEach(function(c) { c.classList.remove("active"); });
      chip.classList.add("active");
    } else {
      DOM.$("#export-account-chips .export-chip[data-value='all']").classList.remove("active");
      chip.classList.toggle("active");
      var sel = [];
      DOM.$$("#export-account-chips .export-chip.active").forEach(function(c) {
        if (c.dataset.value !== "all") sel.push(c.dataset.value);
      });
      exportFilters.accounts = sel;
      if (sel.length === 0) {
        DOM.$("#export-account-chips .export-chip[data-value='all']").classList.add("active");
      }
    }
    updateExportCount();
  });

  // Export date filters
  DOM.$("#export-date-start").addEventListener("change", function () {
    exportFilters.dateStart = this.value || null;
    updateDateBtn("export-start-btn", this.value);
    updateExportCount();
  });
  DOM.$("#export-date-end").addEventListener("change", function () {
    exportFilters.dateEnd = this.value || null;
    updateDateBtn("export-end-btn", this.value);
    updateExportCount();
  });

  // Export CSV button
  DOM.$("#export-csv-btn").addEventListener("click", function () {
    exportCSV();
  });

  // Widget Profile Picker
  DOM.$("#you-row-widget-profiles").addEventListener("click", function () {
    var picker = DOM.$("#widget-profile-picker");
    picker.classList.toggle("hidden");
    if (!picker.classList.contains("hidden")) renderWidgetProfileChips();
  });

  function renderWidgetProfileChips() {
    var container = DOM.$("#widget-profile-chips");
    container.innerHTML = "";
    var selected = State.settings.widgetProfiles || [];

    // "All" chip
    var allChip = document.createElement("button");
    allChip.className = "widget-profile-chip widget-profile-chip-all" + (selected.length === 0 ? " active" : "");
    allChip.textContent = "All";
    allChip.addEventListener("click", function () {
      State.settings.widgetProfiles = [];
      persistSettings();
      renderWidgetProfileChips();
      updateWidgetProfileDesc();
    });
    container.appendChild(allChip);

    // Per-profile chips
    for (var i = 0; i < State.profiles.length; i++) {
      (function (profile) {
        var chip = document.createElement("button");
        var isActive = selected.indexOf(profile.id) !== -1;
        chip.className = "widget-profile-chip" + (isActive ? " active" : "");
        chip.textContent = profile.name;
        chip.addEventListener("click", function () {
          var sel = State.settings.widgetProfiles || [];
          var idx = sel.indexOf(profile.id);
          if (idx !== -1) sel.splice(idx, 1);
          else sel.push(profile.id);
          State.settings.widgetProfiles = sel;
          persistSettings();
          renderWidgetProfileChips();
          updateWidgetProfileDesc();
        });
        container.appendChild(chip);
      })(State.profiles[i]);
    }
  }

  function updateWidgetProfileDesc() {
    var desc = DOM.$("#widget-profiles-desc");
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

  // About (sub-screen)
  DOM.$("#you-row-about").addEventListener("click", function () {
    DOM.$("#about-screen").classList.remove("hidden");
    DOM.$(".you-header").classList.add("hidden");
    DOM.$(".you-content").classList.add("hidden");
    DOM.$("#screen-profile").scrollTop = 0;
  });
  DOM.$("#about-back").addEventListener("click", function () {
    DOM.$("#about-screen").classList.add("hidden");
    DOM.$(".you-header").classList.remove("hidden");
    DOM.$(".you-content").classList.remove("hidden");
  });
  DOM.$$(".about-social-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { openExternal(btn.dataset.url); });
  });

  // FAQ (sub-screen)
  DOM.$("#you-row-faq").addEventListener("click", function () {
    DOM.$("#faq-screen").classList.remove("hidden");
    DOM.$(".you-header").classList.add("hidden");
    DOM.$(".you-content").classList.add("hidden");
    DOM.$("#screen-profile").scrollTop = 0;
  });
  DOM.$("#faq-back").addEventListener("click", function () {
    DOM.$("#faq-screen").classList.add("hidden");
    DOM.$(".you-header").classList.remove("hidden");
    DOM.$(".you-content").classList.remove("hidden");
  });

  // Support & socials
  DOM.$("#you-row-support").addEventListener("click", function (e) { e.preventDefault(); openExternal("https://www.gurshaplus.com/detached"); });

  DOM.$("#you-row-update").addEventListener("click", function () {
    var statusEl = DOM.$("#update-status");
    var baseURL = "https://raw.githubusercontent.com/detached-space/totals-ios/main/";
    var files = [
      { name: "banks.json", path: "data/banks.json" },
      { name: "sms_patterns.json", path: "data/sms_patterns.json" },
    ];
    statusEl.textContent = "Checking…";
    var done = 0;
    var failed = 0;
    var total = files.length + 1; // +1 for script update signal
    var banksContent = null;
    var smsPatternsContent = null;
    function onFileDone() {
      if (done + failed < total) {
        statusEl.textContent = "Updating " + done + "/" + total + "…";
        return;
      }
      if (failed > 0) {
        statusEl.textContent = done + " updated, " + failed + " failed";
      } else {
        statusEl.textContent = "Updated! Close and reopen to apply.";
      }
      if (banksContent) {
        try {
          var banksData = Parser.parseBanks(banksContent);
          State.banks = banksData.banks || [];
          State.banksMap.clear();
          for (var i = 0; i < State.banks.length; i++) {
            State.banksMap.set(String(State.banks[i].id), State.banks[i]);
          }
        } catch (e) {}
      }
      if (smsPatternsContent) {
        try {
          State.smsPatterns = JSON.parse(smsPatternsContent).patterns || [];
        } catch (e) {}
      }
    }
    // Update data files via persist
    files.forEach(function (f) {
      fetch(baseURL + f.path)
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          return res.text();
        })
        .then(function (data) {
          if (f.name === "banks.json") banksContent = data;
          if (f.name === "sms_patterns.json") smsPatternsContent = data;
          var b64 = btoa(unescape(encodeURIComponent(data)));
          persistFile(f.name, b64);
          done++;
          onFileDone();
        })
        .catch(function () {
          failed++;
          onFileDone();
        });
    });
    // Signal Scriptable to download the script update after dismiss
    persistToScriptable("scriptupdate", Date.now());
    done++;
    onFileDone();
  });

  // Profile card → show profile list modal
  DOM.$("#you-profile-card").addEventListener("click", function() {
    showProfileListModal();
  });

  // Close profile dropdown on outside click
  document.addEventListener("click", function(e) {
    var dropdown = DOM.$("#profile-dropdown");
    var navBtn = DOM.$("#nav-profile-btn");
    if (dropdown && !dropdown.classList.contains("hidden") && navBtn && !navBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });

  // Onboarding events
  DOM.$("#onboarding-get-started").addEventListener("click", function () { Onboarding.goToStep(1); });
  DOM.$("#onboarding-video-link").addEventListener("click", function (e) { e.preventDefault(); openExternal("https://youtu.be/ZKHeKu32o7w"); });
  DOM.$("#onboarding-download-btn").addEventListener("click", function () { Onboarding.download(); });
  DOM.$("#onboarding-install-shortcut").addEventListener("click", function () { Onboarding.installShortcut(); });
  DOM.$("#ob-done-shortcut").addEventListener("click", function () { Onboarding.completeTask("shortcut"); });
  // Automation substep checks
  DOM.$$("#ob-automation-steps .ob-checkable").forEach(function (step) {
    step.addEventListener("click", function () {
      step.classList.toggle("checked");
      Onboarding.syncAutomationSteps();
    });
  });
  DOM.$("#ob-done-automation").addEventListener("click", function () { Onboarding.completeTask("automation"); });
  DOM.$("#ob-done-homescreen").addEventListener("click", function () { Onboarding.completeTask("homescreen"); });
  DOM.$("#ob-skip-homescreen").addEventListener("click", function () { Onboarding.completeTask("homescreen"); });
  DOM.$("#onboarding-add-account-btn").addEventListener("click", function () { Onboarding.openAddAccount(); });
  DOM.$("#ob-skip-account").addEventListener("click", function () { Onboarding.completeTask("account"); });
  DOM.$("#onboarding-finish-btn").addEventListener("click", function () { Onboarding.finish(); });

  // Tour preview arrows
  DOM.$$(".onboarding-step-preview .onboarding-preview-arrow").forEach(function (arrow) {
    arrow.addEventListener("click", function () {
      var step = parseInt(arrow.closest(".onboarding-step").dataset.step);
      if (arrow.dataset.dir === "prev" && step > 2) {
        Onboarding.goToStep(step - 1);
      } else if (arrow.dataset.dir === "next") {
        if (arrow.id === "onboarding-tour-done") {
          Onboarding.endTour();
        } else {
          Onboarding.goToStep(step + 1);
        }
      }
    });
  });

  // Tour swipe
  (function () {
    var touchStartX = 0;
    var overlay = DOM.$("#onboarding");
    overlay.addEventListener("touchstart", function (e) {
      if (State.onboardingStep >= 2) touchStartX = e.touches[0].clientX;
    }, { passive: true });
    overlay.addEventListener("touchend", function (e) {
      if (State.onboardingStep < 2) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) < 50) return;
      if (dx < 0) {
        // Swipe left → next
        if (State.onboardingStep < 7) Onboarding.goToStep(State.onboardingStep + 1);
        else Onboarding.endTour();
      } else {
        // Swipe right → prev
        if (State.onboardingStep > 2) Onboarding.goToStep(State.onboardingStep - 1);
      }
    }, { passive: true });
  })();

  // Task header toggle
  DOM.$$(".onboarding-task-header").forEach(function (header) {
    header.addEventListener("click", function () {
      var task = header.parentElement;
      if (task.classList.contains("locked")) return;
      var wasExpanded = task.classList.contains("expanded");
      // Collapse all
      DOM.$$(".onboarding-task").forEach(function (t) { t.classList.remove("expanded"); });
      if (!wasExpanded) task.classList.add("expanded");
    });
  });

  // QR Modal
  DOM.$("#btn-share-accounts").addEventListener("click", function() { QRModal.show(); });
  DOM.$("#qr-modal-close").addEventListener("click", function() { QRModal.hide(); });
  DOM.$("#qr-modal").addEventListener("click", function(e) {
    if (e.target.id === "qr-modal") QRModal.hide();
  });
  initModalDrag("qr-modal", function() { QRModal.hide(); });

  // Home chart period chips
  DOM.$$("#home-chart-chips .home-chart-chip").forEach(function(chip) {
    chip.addEventListener("click", function() {
      State.homeChartPeriod = chip.dataset.period;
      DOM.$$("#home-chart-chips .home-chart-chip").forEach(function(c) {
        c.classList.toggle("active", c === chip);
      });
      drawHomeChart();
    });
  });

  // Home chart touch interaction
  initHomeChartInteraction();
}

// ============================================
// ONBOARDING
// ============================================
var ONBOARDING_TASKS = ["download", "shortcut", "automation", "homescreen", "account"];
var ONBOARDING_REQUIRED = ["download", "shortcut", "automation"];

var Onboarding = {
  checkSVG: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  circleSVG: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/></svg>',

  start: function () {
    var overlay = DOM.$("#onboarding");
    overlay.style.display = "flex";
    // Restore progress from settings
    var progress = State.settings.onboarding || {};
    var hasAnyProgress = false;
    for (var i = 0; i < ONBOARDING_TASKS.length; i++) {
      if (progress[ONBOARDING_TASKS[i]]) hasAnyProgress = true;
    }
    this.syncUI();
    // If returning user with progress, go straight to checklist
    if (hasAnyProgress) this.goToStep(1);
    else this.goToStep(0);
  },

  goToStep: function (n) {
    State.onboardingStep = n;
    var overlay = DOM.$("#onboarding");
    DOM.$$(".onboarding-step").forEach(function (el) {
      el.classList.toggle("active", parseInt(el.dataset.step) === n);
    });
    // Tour preview steps (2+): make overlay transparent, navigate to the screen
    if (n >= 2) {
      overlay.classList.add("preview");
      var step = DOM.$('.onboarding-step[data-step="' + n + '"]');
      if (step) {
        var screen = step.dataset.screen;
        var tab = step.dataset.tab;
        if (screen) navigateTo(screen);
        if (tab) setTimeout(function () { switchTab(tab); }, 50);
        // Hide prev arrow on first tour step
        var prevArrow = step.querySelector('[data-dir="prev"]');
        if (prevArrow) prevArrow.classList.toggle("hidden", n === 2);
      }
    } else {
      overlay.classList.remove("preview");
    }
  },

  syncUI: function () {
    var progress = State.settings.onboarding || {};
    // Update each task's state
    for (var i = 0; i < ONBOARDING_TASKS.length; i++) {
      var task = ONBOARDING_TASKS[i];
      var el = DOM.$("#ob-task-" + task);
      var checkEl = DOM.$("#ob-check-" + task);
      if (!el) continue;
      var done = !!progress[task];
      // Unlock logic: first task always unlocked, others require previous done
      var unlocked = i === 0 || !!progress[ONBOARDING_TASKS[i - 1]];
      el.classList.toggle("completed", done);
      el.classList.toggle("locked", !unlocked);
      if (done) {
        checkEl.innerHTML = this.checkSVG;
        el.classList.remove("expanded");
      } else {
        checkEl.innerHTML = this.circleSVG;
      }
    }
    // Finish button: enabled when all required tasks done
    var allReqDone = true;
    for (var i = 0; i < ONBOARDING_REQUIRED.length; i++) {
      if (!progress[ONBOARDING_REQUIRED[i]]) { allReqDone = false; break; }
    }
    var finishBtn = DOM.$("#onboarding-finish-btn");
    finishBtn.disabled = !allReqDone;
    if (allReqDone) {
      DOM.$(".onboarding-setup-note").textContent = "You're ready to go!";
    }
    // Auto-expand first incomplete task
    var expanded = false;
    for (var i = 0; i < ONBOARDING_TASKS.length; i++) {
      var task = ONBOARDING_TASKS[i];
      var el = DOM.$("#ob-task-" + task);
      if (!el.classList.contains("locked") && !el.classList.contains("completed") && !expanded) {
        el.classList.add("expanded");
        expanded = true;
      }
    }
    // Restore automation substep checks
    this.restoreAutomationSteps();
  },

  syncAutomationSteps: function () {
    // Read checked state from DOM, persist, and update Done button
    if (!State.settings.onboarding) State.settings.onboarding = {};
    var steps = DOM.$$("#ob-automation-steps .ob-checkable");
    var checkedArr = [];
    var allChecked = true;
    for (var i = 0; i < steps.length; i++) {
      var isChecked = steps[i].classList.contains("checked");
      checkedArr.push(isChecked);
      if (!isChecked) allChecked = false;
    }
    State.settings.onboarding.automationSteps = checkedArr;
    persistSettings();
    var doneBtn = DOM.$("#ob-done-automation");
    if (doneBtn) doneBtn.disabled = !allChecked;
  },

  restoreAutomationSteps: function () {
    var progress = State.settings.onboarding || {};
    var saved = progress.automationSteps;
    if (!saved || !saved.length) return;
    var steps = DOM.$$("#ob-automation-steps .ob-checkable");
    var allChecked = true;
    for (var i = 0; i < steps.length; i++) {
      if (saved[i]) {
        steps[i].classList.add("checked");
      } else {
        allChecked = false;
      }
    }
    var doneBtn = DOM.$("#ob-done-automation");
    if (doneBtn) doneBtn.disabled = !allChecked;
  },

  completeTask: function (task) {
    if (!State.settings.onboarding) State.settings.onboarding = {};
    State.settings.onboarding[task] = true;
    persistSettings();
    this.syncUI();
  },

  download: function () {
    var self = this;
    var btn = DOM.$("#onboarding-download-btn");
    btn.disabled = true;
    btn.textContent = "Downloading…";

    var baseURL = "https://raw.githubusercontent.com/detached-space/totals-ios/main/data/";
    var files = [
      { name: "banks.json", binary: false, statusId: "dl-status-banks" },
      { name: "sms_patterns.json", binary: false, statusId: "dl-status-sms" },
      { name: "totals-logo.png", binary: true, statusId: "dl-status-logo" },
    ];

    var done = 0;
    var failed = 0;
    var banksContent = null;

    var spinnerSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10" stroke-dasharray="30 70"/></svg>';
    var checkSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>';
    var errorSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    function onFileDone() {
      if (done + failed < files.length) return;
      if (failed > 0) {
        btn.disabled = false;
        btn.textContent = "Retry";
      } else {
        btn.textContent = "Done!";

        // Parse banks.json into State
        if (banksContent) {
          try {
            var banksData = Parser.parseBanks(banksContent);
            State.banks = banksData.banks || [];
            State.banksMap.clear();
            for (var i = 0; i < State.banks.length; i++) {
              State.banksMap.set(String(State.banks[i].id), State.banks[i]);
            }
          } catch (e) {}
        }

        setTimeout(function () {
          self.completeTask("download");
        }, 400);
      }
    }

    files.forEach(function (f) {
      var statusEl = DOM.$("#" + f.statusId);
      statusEl.innerHTML = spinnerSVG;
      statusEl.className = "onboarding-download-status downloading";

      fetch(baseURL + f.name)
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          return f.binary ? res.arrayBuffer() : res.text();
        })
        .then(function (data) {
          var b64;
          if (f.binary) {
            var bytes = new Uint8Array(data);
            var bin = "";
            for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
            b64 = btoa(bin);
          } else {
            if (f.name === "banks.json") banksContent = data;
            b64 = btoa(unescape(encodeURIComponent(data)));
          }
          persistFile(f.name, b64);
          statusEl.innerHTML = checkSVG;
          statusEl.className = "onboarding-download-status done";
          done++;
          onFileDone();
        })
        .catch(function () {
          statusEl.innerHTML = errorSVG;
          statusEl.className = "onboarding-download-status error";
          failed++;
          onFileDone();
        });
    });
  },

  shortcutURL: "https://www.icloud.com/shortcuts/cb1d983bf9024d7fb2c1ab408f5efb83",

  installShortcut: function () {
    window.location.href = this.shortcutURL;
  },

  openAddAccount: function () {
    DOM.$("#onboarding").style.zIndex = "1999";
    AddAccountModal.show();
  },

  onAccountAdded: function () {
    DOM.$("#onboarding").style.zIndex = "10000";
    this.completeTask("account");
  },

  finish: function () {
    // Start the app tour instead of closing immediately
    this.goToStep(2);
  },

  endTour: function () {
    DOM.$("#onboarding").style.display = "none";
    DOM.$("#onboarding").classList.remove("preview");
    if (!State.settings.onboarding) State.settings.onboarding = {};
    State.settings.onboarding.done = true;
    persistSettings();
    State.onboarding = false;
    navigateTo("money");
    switchTab("accounts");
  },
};

// ============================================
// REFRESH ON FOCUS + PULL TO REFRESH
// ============================================
var _refreshing = false;

function handleRefresh(txRaw) {
  refreshTransactions(txRaw);
  updateDashboard();
  _refreshing = false;
  var indicator = DOM.$("#ptr-indicator");
  indicator.classList.remove("refreshing");
  indicator.style.transform = "";
  indicator.style.opacity = "";
}

document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    requestRefresh();
  }
});

(function initPullToRefresh() {
  var startY = 0;
  var pulling = false;
  var threshold = 60;
  var indicator = null;

  function getActiveScreen() {
    return DOM.$("#screen-" + State.currentScreen);
  }

  document.addEventListener("touchstart", function (e) {
    if (_refreshing) return;
    var screen = getActiveScreen();
    if (!screen || screen.scrollTop > 0) return;
    indicator = DOM.$("#ptr-indicator");
    startY = e.touches[0].clientY;
    pulling = true;
    indicator.classList.add("pulling");
  }, { passive: true });

  document.addEventListener("touchmove", function (e) {
    if (!pulling || _refreshing) return;
    var screen = getActiveScreen();
    if (!screen || screen.scrollTop > 0) {
      pulling = false;
      return;
    }
    var dy = Math.max(0, e.touches[0].clientY - startY);
    if (dy === 0) return;
    var progress = Math.min(dy / threshold, 1);
    var translate = Math.min(dy * 0.5, 40);
    indicator.style.transform = "translateY(" + (translate - 40) + "px)";
    indicator.style.opacity = String(progress);
  }, { passive: true });

  document.addEventListener("touchend", function () {
    if (!pulling) return;
    pulling = false;
    if (!indicator) return;
    indicator.classList.remove("pulling");
    var opacity = parseFloat(indicator.style.opacity || "0");
    if (opacity >= 1) {
      _refreshing = true;
      indicator.classList.add("refreshing");
      indicator.style.transform = "translateY(0)";
      indicator.style.opacity = "1";
      requestRefresh();
    } else {
      indicator.style.transform = "";
      indicator.style.opacity = "";
    }
  }, { passive: true });
})();

// ============================================
// INITIALIZATION
// ============================================
function init() {
  initializeData();
  initTheme();
  initEventListeners();
  initChartInteraction();
  initScreenSwipe();
  // Set initial screen position without animation
  navigateTo("home", { skipAnimation: true });
  updateProfileAvatar();
  updateDashboard();
  // Remove loading overlay
  var loader = document.getElementById("_loader");
  if (loader) loader.remove();

  // Start onboarding if needed
  var obProgress = State.settings.onboarding || {};
  if (State.onboarding && !obProgress.done) {
    Onboarding.start();
  }
}

// Always init — data comes from DOM tags injected by totals.js,
// or empty state in dev/browser mode.
// When loaded dynamically by dev.html, window.__devMode is set
// and dev.html calls init() itself after all scripts are ready.
if (!window.__devMode) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
