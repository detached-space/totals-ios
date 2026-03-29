// ============================================
// ADD ACCOUNT MODAL
// ============================================
const AddAccountModal = {
  selectedBank: null,
  dropdownOpen: false,
  editingAccount: null,

  show() {
    this.editingAccount = null;
    this.selectedBank = null;
    this.dropdownOpen = false;
    DOM.$("#add-account-form").reset();
    DOM.$("#account-bank-id").value = "";
    DOM.$("#add-account-submit").disabled = false;
    DOM.$("#add-account-submit").querySelector("span").textContent = "Add Account";
    DOM.$("#add-account-modal-title").textContent = "Add Account";
    DOM.$("#submit-feedback").classList.add("hidden");
    this.updateSelectedDisplay();
    this.populateBankDropdown();
    DOM.$("#add-account-modal").classList.add("active");
  },

  edit(account) {
    this.editingAccount = account;
    this.dropdownOpen = false;
    DOM.$("#add-account-form").reset();
    DOM.$("#submit-feedback").classList.add("hidden");
    DOM.$("#add-account-submit").disabled = false;
    DOM.$("#add-account-submit").querySelector("span").textContent = "Save Changes";
    DOM.$("#add-account-modal-title").textContent = "Edit Account";

    // Pre-fill fields
    DOM.$("#account-name").value = account.name || "";
    DOM.$("#account-number").value = account.number || "";
    DOM.$("#account-bank-id").value = account.bankId || "";

    var bank = State.banksMap.get(String(account.bankId));
    if (bank) {
      this.selectedBank = bank;
    }
    this.updateSelectedDisplay();
    this.populateBankDropdown();
    DOM.$("#add-account-modal").classList.add("active");
  },

  hide() {
    DOM.$("#add-account-modal").classList.remove("active");
    this.closeDropdown();
  },

  populateBankDropdown() {
    const dropdown = DOM.$("#bank-selector-dropdown");
    dropdown.innerHTML = "";

    for (const bank of State.banks) {
      if (bank.virtual) continue;
      const option = DOM.createElement(
        "div",
        {
          className: "bank-selector-option",
          onClick: () => this.selectBank(bank),
        },
        [
          DOM.createElement(
            "div",
            {
              className: "bank-logo",
              style: {
                background: `linear-gradient(135deg, ${bank.colors[0]}, ${bank.colors[1]})`,
              },
            },
            [bank.shortName.substring(0, 3)],
          ),
          DOM.createElement(
            "div",
            { className: "bank-selector-option-info" },
            [
              DOM.createElement(
                "div",
                { className: "bank-selector-option-name" },
                [bank.shortName],
              ),
              DOM.createElement(
                "div",
                { className: "bank-selector-option-full" },
                [bank.name],
              ),
            ],
          ),
        ],
      );
      dropdown.appendChild(option);
    }
  },

  selectBank(bank) {
    this.selectedBank = bank;
    DOM.$("#account-bank-id").value = bank.id;
    this.updateSelectedDisplay();
    this.closeDropdown();
  },

  updateSelectedDisplay() {
    const selected = DOM.$("#bank-selector-selected");
    if (this.selectedBank) {
      selected.innerHTML = `
      <div class="bank-selector-value">
        <div class="bank-logo" style="background: linear-gradient(135deg, ${this.selectedBank.colors[0]}, ${this.selectedBank.colors[1]})">
          ${this.selectedBank.shortName.substring(0, 3)}
        </div>
        <span>${this.selectedBank.shortName}</span>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    `;
    } else {
      selected.innerHTML = `
      <span class="bank-selector-placeholder">Select a bank</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    `;
    }
  },

  toggleDropdown() {
    if (this.dropdownOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  },

  openDropdown() {
    this.dropdownOpen = true;
    DOM.$("#bank-selector-selected").classList.add("open");
    DOM.$("#bank-selector-dropdown").classList.remove("hidden");
  },

  closeDropdown() {
    this.dropdownOpen = false;
    DOM.$("#bank-selector-selected").classList.remove("open");
    DOM.$("#bank-selector-dropdown").classList.add("hidden");
  },

  showFeedback(message, type = "info") {
    const feedback = DOM.$("#submit-feedback");
    feedback.className = `submit-feedback ${type}`;
    feedback.innerHTML =
      type === "info"
        ? `<div class="spinner"></div><span>${message}</span>`
        : `<span>${message}</span>`;
    feedback.classList.remove("hidden");
  },

  hideFeedback() {
    DOM.$("#submit-feedback").classList.add("hidden");
  },

  submit() {
    const name = DOM.$("#account-name").value.trim();
    const number = DOM.$("#account-number").value.trim();
    const bankId = DOM.$("#account-bank-id").value;

    if (!bankId) {
      this.showFeedback("Please select a bank", "error");
      return;
    }
    if (!name) {
      this.showFeedback("Please enter an account name", "error");
      return;
    }
    if (!number) {
      this.showFeedback("Please enter an account number", "error");
      return;
    }

    const bank = State.banksMap.get(String(bankId));

    if (this.editingAccount) {
      // Update existing account
      this.editingAccount.name = name;
      this.editingAccount.number = number;
      this.editingAccount.bankId = bankId;
      this.editingAccount.bankName = bank ? bank.shortName : "Unknown";
      this.editingAccount.bankFullName = bank ? bank.name : "Unknown";

      reResolveAccounts();
      persistAccounts();

      this.showFeedback("Account updated!", "success");
      DOM.$("#add-account-submit").disabled = true;

      setTimeout(() => {
        this.hide();
        updateAccountsTab();
        updateDashboard();
      }, 800);
    } else {
      var isFirstForBank = !State.accounts.some(function(a) {
        return String(a.bankId) === String(bankId);
      });
      const account = {
        name: name,
        number: number,
        bankId: bankId,
        bankName: bank ? bank.shortName : "Unknown",
        bankFullName: bank ? bank.name : "Unknown",
        isDefault: isFirstForBank,
        createdAt: new Date().toISOString(),
      };

      State.accounts.push(account);
      reResolveAccounts();
      persistAccounts();

      this.showFeedback("Account created!", "success");
      DOM.$("#add-account-submit").disabled = true;

      setTimeout(() => {
        this.hide();
        updateAccountsTab();
        updateDashboard();
        if (State.onboarding) Onboarding.onAccountAdded();
      }, 1000);
    }
  },
};

// ============================================
// FILTER MODAL
// ============================================
const FilterModal = {
  show() {
    this.populateBankChips();
    this.populateAccountChips();
    this.populateCategoryChips();
    this.syncUIWithState();
    DOM.$("#filter-modal").classList.add("active");
  },

  hide() {
    DOM.$("#filter-modal").classList.remove("active");
  },

  populateBankChips() {
    const container = DOM.$("#filter-bank-chips");
    const usedBankIds = [
      ...new Set(getProfileTransactions().map((tx) => tx.bankId)),
    ].filter(Boolean);

    let html =
      '<div class="filter-chip active" data-bank="all">All Banks</div>';
    for (const bankId of usedBankIds) {
      const bank = State.banksMap.get(String(bankId));
      if (bank) {
        html += `<div class="filter-chip" data-bank="${bank.id}">
        <span class="chip-logo" style="background: linear-gradient(135deg, ${bank.colors[0]}, ${bank.colors[1]})">${bank.shortName.substring(0, 2)}</span>
        ${bank.shortName}
      </div>`;
      }
    }
    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => this.toggleBankChip(chip));
    });
  },

  populateAccountChips() {
    const container = DOM.$("#filter-account-chips");
    const scopedAccounts = getProfileAccounts();

    if (scopedAccounts.length === 0) {
      container.innerHTML =
        '<span class="text-muted" style="font-size: 13px;">No accounts found</span>';
      return;
    }

    let html =
      '<div class="filter-chip active" data-account="all">All Accounts</div>';
    for (const account of scopedAccounts) {
      var bank = State.banksMap.get(String(account.bankId));
      html += `<div class="filter-chip" data-account="${account.number}">${account.name}${bank ? ' (' + bank.shortName + ')' : ''}</div>`;
    }
    container.innerHTML = html;

    // Add click handlers
    container.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => this.toggleAccountChip(chip));
    });
  },

  populateCategoryChips() {
    const container = DOM.$("#filter-category-chips");
    var profileTx = getProfileTransactions();
    var catSet = {};
    for (var i = 0; i < profileTx.length; i++) {
      var txCats = profileTx[i].categories || [];
      for (var j = 0; j < txCats.length; j++) {
        catSet[txCats[j]] = true;
      }
    }
    const usedCategories = Object.keys(catSet);

    if (usedCategories.length === 0) {
      container.innerHTML =
        '<span class="text-muted" style="font-size: 13px;">No categories yet</span>';
      return;
    }

    let html =
      '<div class="filter-chip active" data-category="all">All</div>';
    for (const cat of usedCategories) {
      const catInfo = getCategoryInfo(cat);
      html += `<div class="filter-chip" data-category="${cat}">
      <span class="category-badge-dot" style="background:${catInfo.color};width:8px;height:8px;border-radius:50%;display:inline-block"></span>
      ${cat}
    </div>`;
    }
    container.innerHTML = html;

    container.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => this.toggleCategoryChip(chip));
    });
  },

  toggleCategoryChip(chip) {
    if (chip.dataset.category === "all") {
      DOM.$$("#filter-category-chips .filter-chip").forEach((c) =>
        c.classList.remove("active"),
      );
      chip.classList.add("active");
    } else {
      DOM.$(
        '#filter-category-chips .filter-chip[data-category="all"]',
      ).classList.remove("active");
      chip.classList.toggle("active");
      if (!DOM.$("#filter-category-chips .filter-chip.active")) {
        DOM.$(
          '#filter-category-chips .filter-chip[data-category="all"]',
        ).classList.add("active");
      }
    }
  },

  syncUIWithState() {
    // Sync type chips
    DOM.$$("#filter-type-chips .filter-chip").forEach((chip) => {
      chip.classList.toggle(
        "active",
        chip.dataset.type === State.filters.type,
      );
    });

    // Sync bank chips
    DOM.$$("#filter-bank-chips .filter-chip").forEach((chip) => {
      if (chip.dataset.bank === "all") {
        chip.classList.toggle(
          "active",
          State.filters.bankIds.length === 0,
        );
      } else {
        chip.classList.toggle(
          "active",
          State.filters.bankIds.includes(chip.dataset.bank),
        );
      }
    });

    // Sync account chips
    DOM.$$("#filter-account-chips .filter-chip").forEach((chip) => {
      if (chip.dataset.account === "all") {
        chip.classList.toggle(
          "active",
          State.filters.accounts.length === 0,
        );
      } else {
        chip.classList.toggle(
          "active",
          State.filters.accounts.includes(chip.dataset.account),
        );
      }
    });

    // Sync category chips
    DOM.$$("#filter-category-chips .filter-chip").forEach((chip) => {
      if (chip.dataset.category === "all") {
        chip.classList.toggle(
          "active",
          State.filters.categories.length === 0,
        );
      } else if (chip.dataset.category) {
        chip.classList.toggle(
          "active",
          State.filters.categories.includes(chip.dataset.category),
        );
      }
    });

    // Sync dates
    var fds = DOM.$("#filter-date-start");
    var fde = DOM.$("#filter-date-end");
    fds.value = State.filters.dateStart || "";
    fde.value = State.filters.dateEnd || "";
    // Update date buttons
    var fStartBtn = DOM.$("#filter-start-btn");
    var fEndBtn = DOM.$("#filter-end-btn");
    if (fStartBtn) {
      if (fds.value) {
        var d = new Date(fds.value + "T00:00:00");
        fStartBtn.textContent = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        fStartBtn.classList.add("has-value");
      } else {
        fStartBtn.textContent = "Start date";
        fStartBtn.classList.remove("has-value");
      }
    }
    if (fEndBtn) {
      if (fde.value) {
        var d = new Date(fde.value + "T00:00:00");
        fEndBtn.textContent = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        fEndBtn.classList.add("has-value");
      } else {
        fEndBtn.textContent = "End date";
        fEndBtn.classList.remove("has-value");
      }
    }
  },

  toggleTypeChip(chip) {
    DOM.$$("#filter-type-chips .filter-chip").forEach((c) =>
      c.classList.remove("active"),
    );
    chip.classList.add("active");
  },

  toggleBankChip(chip) {
    if (chip.dataset.bank === "all") {
      DOM.$$("#filter-bank-chips .filter-chip").forEach((c) =>
        c.classList.remove("active"),
      );
      chip.classList.add("active");
    } else {
      DOM.$(
        '#filter-bank-chips .filter-chip[data-bank="all"]',
      ).classList.remove("active");
      chip.classList.toggle("active");
      // If none selected, select "all"
      if (!DOM.$("#filter-bank-chips .filter-chip.active")) {
        DOM.$(
          '#filter-bank-chips .filter-chip[data-bank="all"]',
        ).classList.add("active");
      }
    }
  },

  toggleAccountChip(chip) {
    if (chip.dataset.account === "all") {
      DOM.$$("#filter-account-chips .filter-chip").forEach((c) =>
        c.classList.remove("active"),
      );
      chip.classList.add("active");
    } else {
      DOM.$(
        '#filter-account-chips .filter-chip[data-account="all"]',
      ).classList.remove("active");
      chip.classList.toggle("active");
      // If none selected, select "all"
      if (!DOM.$("#filter-account-chips .filter-chip.active")) {
        DOM.$(
          '#filter-account-chips .filter-chip[data-account="all"]',
        ).classList.add("active");
      }
    }
  },

  clear() {
    State.filters = {
      type: "all",
      bankIds: [],
      accounts: [],
      categories: [],
      dateStart: null,
      dateEnd: null,
    };
    this.syncUIWithState();
    this.apply();
  },

  apply() {
    // Read type
    const activeType = DOM.$("#filter-type-chips .filter-chip.active");
    State.filters.type = activeType ? activeType.dataset.type : "all";

    // Read banks
    const activeBanks = DOM.$$(
      '#filter-bank-chips .filter-chip.active:not([data-bank="all"])',
    );
    State.filters.bankIds = [...activeBanks].map((c) => c.dataset.bank);

    // Read accounts
    const activeAccounts = DOM.$$(
      '#filter-account-chips .filter-chip.active:not([data-account="all"])',
    );
    State.filters.accounts = [...activeAccounts].map(
      (c) => c.dataset.account,
    );

    // Read categories
    const activeCats = DOM.$$(
      '#filter-category-chips .filter-chip.active:not([data-category="all"])',
    );
    State.filters.categories = [...activeCats].map(
      (c) => c.dataset.category,
    );

    // Read dates
    State.filters.dateStart = DOM.$("#filter-date-start").value || null;
    State.filters.dateEnd = DOM.$("#filter-date-end").value || null;

    // Sync ledger date inputs and buttons
    DOM.$("#ledger-date-start").value = State.filters.dateStart || "";
    DOM.$("#ledger-date-end").value = State.filters.dateEnd || "";
    var lsBtn = DOM.$("#ledger-start-btn");
    var leBtn = DOM.$("#ledger-end-btn");
    if (lsBtn) {
      if (State.filters.dateStart) {
        var d = new Date(State.filters.dateStart + "T00:00:00");
        lsBtn.textContent = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        lsBtn.classList.add("has-value");
      } else {
        lsBtn.textContent = "Start date";
        lsBtn.classList.remove("has-value");
      }
    }
    if (leBtn) {
      if (State.filters.dateEnd) {
        var d = new Date(State.filters.dateEnd + "T00:00:00");
        leBtn.textContent = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        leBtn.classList.add("has-value");
      } else {
        leBtn.textContent = "End date";
        leBtn.classList.remove("has-value");
      }
    }

    // Update filter indicator
    this.updateFilterIndicator();

    // Refresh views
    updateActivityTab();
    updateTransactionsList();
    updateLedger();
    drawAllCharts();

    this.hide();
  },

  updateFilterIndicator() {
    const hasFilters =
      State.filters.type !== "all" ||
      State.filters.bankIds.length > 0 ||
      State.filters.accounts.length > 0 ||
      State.filters.categories.length > 0 ||
      State.filters.dateStart ||
      State.filters.dateEnd;

    const indicator = DOM.$("#filter-indicator");
    if (indicator) {
      indicator.classList.toggle("hidden", !hasFilters);
    }
  },

  hasActiveFilters() {
    return (
      State.filters.type !== "all" ||
      State.filters.bankIds.length > 0 ||
      State.filters.accounts.length > 0 ||
      State.filters.categories.length > 0 ||
      State.filters.dateStart ||
      State.filters.dateEnd
    );
  },
};

// ============================================
// BUDGET MODAL
// ============================================
const BudgetModal = {
  editingBudget: null,
  selectedGroup: "Needs",
  selectedCategories: [],
  budgetName: "",
  isRecurring: true,
  targetMonth: null,
  groupDropdownOpen: false,
  deleteConfirmPending: false,
  deleteTimer: null,

  show(editBudgetId) {
    this.groupDropdownOpen = false;
    this.deleteConfirmPending = false;
    if (this.deleteTimer) { clearTimeout(this.deleteTimer); this.deleteTimer = null; }

    var titleEl = DOM.$("#budget-modal-title");
    var deleteBtn = DOM.$("#budget-modal-delete");
    var submitBtn = DOM.$("#budget-modal-submit");
    var assignedInput = DOM.$("#budget-assigned-input");
    var nameInput = DOM.$("#budget-name-input");
    var feedback = DOM.$("#budget-modal-feedback");
    var editScope = DOM.$("#budget-edit-scope");
    feedback.classList.add("hidden");
    editScope.classList.add("hidden");
    submitBtn.classList.remove("hidden");
    submitBtn.disabled = false;

    if (editBudgetId) {
      var budget = State.budgets.find(function (b) { return b.id === editBudgetId; });
      if (!budget) { this.editingBudget = null; return; }
      this.editingBudget = budget;
      titleEl.textContent = "Edit Budget";

      var eff = getEffectiveBudget(budget, State.budgetMonth);
      this.selectedGroup = budget.group;
      this.selectedCategories = (eff.categories || []).slice();
      this.budgetName = budget.name || "";
      this.isRecurring = budget.recurring !== false;
      this.targetMonth = budget.month || null;
      assignedInput.value = eff.assigned;
      nameInput.value = this.budgetName;
      deleteBtn.classList.remove("hidden");
      deleteBtn.textContent = "Delete Budget";
    } else {
      this.editingBudget = null;
      titleEl.textContent = "New Budget";
      this.selectedGroup = State.budgetGroups.length > 0 ? State.budgetGroups[0].name : "Needs";
      this.selectedCategories = [];
      this.budgetName = "";
      this.isRecurring = true;
      this.targetMonth = null;
      assignedInput.value = "";
      nameInput.value = "";
      deleteBtn.classList.add("hidden");
    }

    this.updateGroupDisplay();
    this.populateGroupDropdown();
    this.closeGroupDropdown();
    this.renderCategoryChips();
    this.updateRecurringToggle();
    this.updateMonthPicker();

    DOM.$("#budget-modal").classList.add("active");
  },

  hide() {
    DOM.$("#budget-modal").classList.remove("active");
    this.closeGroupDropdown();
    if (this.deleteTimer) { clearTimeout(this.deleteTimer); this.deleteTimer = null; }
  },

  populateGroupDropdown() {
    var dropdown = DOM.$("#budget-group-dropdown");
    dropdown.innerHTML = "";
    var self = this;
    for (var i = 0; i < State.budgetGroups.length; i++) {
      var group = State.budgetGroups[i];
      var option = document.createElement("div");
      option.className = "budget-selector-option";
      option.textContent = group.name;
      (function (g) {
        option.addEventListener("click", function () { self.selectGroup(g.name); });
      })(group);
      dropdown.appendChild(option);
    }
  },

  selectGroup(name) {
    this.selectedGroup = name;
    this.updateGroupDisplay();
    this.closeGroupDropdown();
  },

  updateGroupDisplay() {
    var el = DOM.$("#budget-group-selected");
    el.querySelector("span").textContent = this.selectedGroup;
  },

  toggleGroupDropdown() {
    if (this.groupDropdownOpen) {
      this.closeGroupDropdown();
    } else {
      this.openGroupDropdown();
    }
  },

  openGroupDropdown() {
    this.groupDropdownOpen = true;
    DOM.$("#budget-group-selected").classList.add("open");
    DOM.$("#budget-group-dropdown").classList.remove("hidden");
  },

  closeGroupDropdown() {
    this.groupDropdownOpen = false;
    DOM.$("#budget-group-selected").classList.remove("open");
    DOM.$("#budget-group-dropdown").classList.add("hidden");
  },

  // Build set of categories used by OTHER budgets (not the one being edited)
  _getOtherBudgetedCategories() {
    var used = {};
    var editId = this.editingBudget ? this.editingBudget.id : null;
    for (var i = 0; i < State.budgets.length; i++) {
      var b = State.budgets[i];
      if (b.id === editId) continue;
      var cats = b.categories || [];
      for (var j = 0; j < cats.length; j++) {
        used[cats[j]] = true;
      }
    }
    return used;
  },

  renderCategoryChips() {
    var container = DOM.$("#budget-category-chips");
    container.innerHTML = "";
    var self = this;
    var otherUsed = this._getOtherBudgetedCategories();
    var allCats = getAllCategoryNames();

    for (var i = 0; i < allCats.length; i++) {
      var name = allCats[i];
      var catInfo = getCategoryInfo(name);
      var isSelected = this.selectedCategories.indexOf(name) !== -1;
      var isDisabled = otherUsed[name] && !isSelected;

      var chip = document.createElement("div");
      chip.className = "budget-cat-chip" + (isSelected ? " active" : "") + (isDisabled ? " disabled" : "");

      var dot = document.createElement("span");
      dot.className = "budget-row-dot";
      dot.style.background = catInfo.color;
      chip.appendChild(dot);
      chip.appendChild(document.createTextNode(name));

      if (!isDisabled) {
        (function (n) {
          chip.addEventListener("click", function () { self.toggleCategory(n); });
        })(name);
      }
      container.appendChild(chip);
    }

    // "+ New" chip
    var newChip = document.createElement("div");
    newChip.className = "budget-cat-chip budget-cat-chip-new";
    newChip.textContent = "+ New";
    newChip.addEventListener("click", function (e) {
      e.stopPropagation();
      self.showNewCategoryForm();
    });
    container.appendChild(newChip);
  },

  toggleCategory(name) {
    var idx = this.selectedCategories.indexOf(name);
    if (idx !== -1) {
      this.selectedCategories.splice(idx, 1);
    } else {
      this.selectedCategories.push(name);
    }
    this.renderCategoryChips();
    this.autoFillName();
  },

  autoFillName() {
    // Only auto-fill for new budgets when user hasn't manually typed
    var nameInput = DOM.$("#budget-name-input");
    if (this.editingBudget) return;
    if (this.selectedCategories.length === 1) {
      nameInput.value = this.selectedCategories[0];
      this.budgetName = this.selectedCategories[0];
    } else if (this.selectedCategories.length === 0) {
      nameInput.value = "";
      this.budgetName = "";
    }
  },

  showNewCategoryForm() {
    var container = DOM.$("#budget-category-chips");
    var existing = container.querySelector(".budget-new-category-form");
    if (existing) { existing.remove(); return; }

    var self = this;
    var form = document.createElement("div");
    form.className = "budget-new-category-form";
    form.style.width = "100%";

    var input = document.createElement("input");
    input.type = "text";
    input.className = "category-create-input";
    input.placeholder = "Category name";
    input.maxLength = 24;

    var colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.className = "category-create-color";
    colorInput.value = "#6366f1";

    var saveBtn = document.createElement("button");
    saveBtn.className = "category-create-save";
    saveBtn.textContent = "Add";
    saveBtn.addEventListener("click", function () {
      var name = input.value.trim();
      if (!name) { input.focus(); return; }
      if (getAllCategoryNames().some(function (n) { return n.toLowerCase() === name.toLowerCase(); })) {
        input.style.borderColor = "var(--red)";
        input.focus();
        return;
      }
      createCustomCategory(name, colorInput.value);
      self.toggleCategory(name);
    });

    form.appendChild(input);
    form.appendChild(colorInput);
    form.appendChild(saveBtn);
    container.appendChild(form);
    input.focus();
  },

  updateRecurringToggle() {
    var recurBtn = DOM.$("#budget-type-recurring");
    var oneBtn = DOM.$("#budget-type-onetime");
    recurBtn.classList.toggle("active", this.isRecurring);
    oneBtn.classList.toggle("active", !this.isRecurring);
  },

  setRecurring(val) {
    this.isRecurring = val;
    this.updateRecurringToggle();
    this.updateMonthPicker();
  },

  updateMonthPicker() {
    var group = DOM.$("#budget-month-group");
    if (this.isRecurring) {
      group.classList.add("hidden");
    } else {
      group.classList.remove("hidden");
      var input = DOM.$("#budget-target-month-input");
      if (this.targetMonth) {
        // Set the date input to the 1st of the target month
        input.value = this.targetMonth + "-01";
      } else {
        var now = State.budgetMonth || new Date();
        input.value = getMonthKey(now) + "-01";
      }
    }
  },

  showFeedback(message, type) {
    var feedback = DOM.$("#budget-modal-feedback");
    feedback.className = "submit-feedback " + (type || "info");
    feedback.innerHTML = "<span>" + message + "</span>";
    feedback.classList.remove("hidden");
  },

  submit() {
    var assignedVal = DOM.$("#budget-assigned-input").value;
    var assigned = parseInt(assignedVal, 10);
    var name = DOM.$("#budget-name-input").value.trim();
    this.budgetName = name;

    if (this.selectedCategories.length === 0) {
      this.showFeedback("Please select at least one category", "error");
      return;
    }
    if (!name) {
      this.showFeedback("Please enter a budget name", "error");
      return;
    }
    if (isNaN(assigned) || assigned < 0) {
      this.showFeedback("Please enter a valid amount", "error");
      return;
    }

    // For recurring edits: check if anything changed and prompt scope
    if (this.editingBudget && this.editingBudget.recurring !== false) {
      var orig = this.editingBudget;
      var origCats = (orig.categories || []).slice().sort().join(",");
      var newCats = this.selectedCategories.slice().sort().join(",");
      var hasChanges = orig.assigned !== assigned || orig.group !== this.selectedGroup ||
        orig.name !== name || origCats !== newCats;
      if (hasChanges) {
        this.showEditScope();
        return;
      }
    }

    this._saveDirectly(assigned, name);
  },

  showEditScope() {
    DOM.$("#budget-modal-submit").classList.add("hidden");
    DOM.$("#budget-edit-scope").classList.remove("hidden");
    DOM.$("#budget-modal-feedback").classList.add("hidden");
  },

  applyEdit(scope) {
    var assigned = parseInt(DOM.$("#budget-assigned-input").value, 10);
    var name = DOM.$("#budget-name-input").value.trim();

    if (scope === "this-month") {
      // Add/update override for this month
      var key = getMonthKey(State.budgetMonth);
      var budget = this.editingBudget;
      if (!budget.overrides) budget.overrides = [];
      var found = false;
      for (var i = 0; i < budget.overrides.length; i++) {
        if (budget.overrides[i].month === key) {
          budget.overrides[i].assigned = assigned;
          budget.overrides[i].categories = this.selectedCategories.slice();
          found = true;
          break;
        }
      }
      if (!found) {
        budget.overrides.push({
          month: key,
          assigned: assigned,
          categories: this.selectedCategories.slice()
        });
      }
      // Group and name always update on base (they're not month-specific)
      budget.group = this.selectedGroup;
      budget.name = name;
    } else {
      // "all-future" — change base values
      var budget = this.editingBudget;
      budget.assigned = assigned;
      budget.group = this.selectedGroup;
      budget.name = name;
      budget.categories = this.selectedCategories.slice();
    }

    this._finishSave(scope === "this-month" ? "Override saved for this month!" : "Budget updated!");
  },

  _saveDirectly(assigned, name) {
    if (this.editingBudget) {
      // Update existing budget base
      var budget = this.editingBudget;
      budget.assigned = assigned;
      budget.group = this.selectedGroup;
      budget.name = name;
      budget.categories = this.selectedCategories.slice();
      budget.recurring = this.isRecurring;
      if (!this.isRecurring) {
        var monthInput = DOM.$("#budget-target-month-input");
        budget.month = monthInput.value ? monthInput.value.substring(0, 7) : getMonthKey(State.budgetMonth);
      } else {
        budget.month = null;
      }
    } else {
      // Create new budget
      var id = "b-" + name.replace(/\s+/g, "-").toLowerCase() + "-" + Date.now();
      var newBudget = {
        type: "budget",
        id: id,
        name: name,
        categories: this.selectedCategories.slice(),
        assigned: assigned,
        group: this.selectedGroup,
        recurring: this.isRecurring,
        month: null,
        overrides: [],
        createdAt: new Date().toISOString(),
      };
      if (State.activeProfileId) newBudget.profileId = State.activeProfileId;
      if (!this.isRecurring) {
        var monthInput = DOM.$("#budget-target-month-input");
        newBudget.month = monthInput.value ? monthInput.value.substring(0, 7) : getMonthKey(State.budgetMonth);
      }
      State.budgets.push(newBudget);
    }

    this._finishSave(this.editingBudget ? "Budget updated!" : "Budget created!");
  },

  _finishSave(msg) {
    persistBudgets();
    this.showFeedback(msg, "success");
    DOM.$("#budget-modal-submit").disabled = true;

    var self = this;
    setTimeout(function () {
      self.hide();
      updateBudgetScreen();
    }, 800);
  },

  deleteBudget() {
    if (!this.deleteConfirmPending) {
      this.deleteConfirmPending = true;
      DOM.$("#budget-modal-delete").textContent = "Tap again to confirm";
      var self = this;
      this.deleteTimer = setTimeout(function () {
        self.deleteConfirmPending = false;
        DOM.$("#budget-modal-delete").textContent = "Delete Budget";
      }, 3000);
      return;
    }

    // Actually delete
    var editId = this.editingBudget ? this.editingBudget.id : null;
    State.budgets = State.budgets.filter(function (b) {
      return b.id !== editId;
    });
    persistBudgets();

    this.hide();
    State.budgetDetail = null;
    updateBudgetScreen();
  },
};

// ============================================
// ADD CONTACT MODAL
// ============================================
const AddContactModal = {
  selectedBank: null,
  dropdownOpen: false,
  editingIndex: -1,
  deleteConfirmPending: false,

  show() {
    this.editingIndex = -1;
    this.selectedBank = null;
    this.dropdownOpen = false;
    this.deleteConfirmPending = false;
    DOM.$("#add-contact-form").reset();
    DOM.$("#contact-bank-id").value = "";
    DOM.$("#add-contact-submit").disabled = false;
    DOM.$("#contact-submit-feedback").classList.add("hidden");
    DOM.$("#add-contact-modal-title").textContent = "Add Contact";
    DOM.$("#add-contact-submit-text").textContent = "Add Contact";
    DOM.$("#add-contact-delete").classList.add("hidden");
    this.updateSelectedDisplay();
    this.populateBankDropdown();
    DOM.$("#add-contact-modal").classList.add("active");
  },

  edit(index) {
    var contact = State.contacts[index];
    if (!contact) return;
    this.show();
    this.editingIndex = index;
    DOM.$("#add-contact-modal-title").textContent = "Edit Contact";
    DOM.$("#add-contact-submit-text").textContent = "Save Changes";
    DOM.$("#add-contact-delete").classList.remove("hidden");
    DOM.$("#contact-name").value = contact.name || "";
    DOM.$("#contact-number").value = contact.number || "";
    if (contact.bankId) {
      var bank = State.banksMap.get(String(contact.bankId));
      if (bank) {
        this.selectBank(bank);
      }
    }
  },

  hide() {
    DOM.$("#add-contact-modal").classList.remove("active");
    this.closeDropdown();
    this.editingIndex = -1;
    this.deleteConfirmPending = false;
  },

  populateBankDropdown() {
    const dropdown = DOM.$("#contact-bank-dropdown");
    dropdown.innerHTML = "";

    for (const bank of State.banks) {
      if (bank.virtual) continue;
      const option = DOM.createElement(
        "div",
        {
          className: "bank-selector-option",
          onClick: () => this.selectBank(bank),
        },
        [
          DOM.createElement(
            "div",
            {
              className: "bank-logo",
              style: {
                background: `linear-gradient(135deg, ${bank.colors[0]}, ${bank.colors[1]})`,
              },
            },
            [bank.shortName.substring(0, 3)],
          ),
          DOM.createElement(
            "div",
            { className: "bank-selector-option-info" },
            [
              DOM.createElement(
                "div",
                { className: "bank-selector-option-name" },
                [bank.shortName],
              ),
              DOM.createElement(
                "div",
                { className: "bank-selector-option-full" },
                [bank.name],
              ),
            ],
          ),
        ],
      );
      dropdown.appendChild(option);
    }
  },

  selectBank(bank) {
    this.selectedBank = bank;
    DOM.$("#contact-bank-id").value = bank.id;
    this.updateSelectedDisplay();
    this.closeDropdown();
  },

  updateSelectedDisplay() {
    const selected = DOM.$("#contact-bank-selected");
    if (this.selectedBank) {
      selected.innerHTML = `
      <div class="bank-selector-value">
        <div class="bank-logo" style="background: linear-gradient(135deg, ${this.selectedBank.colors[0]}, ${this.selectedBank.colors[1]})">
          ${this.selectedBank.shortName.substring(0, 3)}
        </div>
        <span>${this.selectedBank.shortName}</span>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    `;
    } else {
      selected.innerHTML = `
      <span class="bank-selector-placeholder">Select a bank</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    `;
    }
  },

  toggleDropdown() {
    if (this.dropdownOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  },

  openDropdown() {
    this.dropdownOpen = true;
    DOM.$("#contact-bank-selected").classList.add("open");
    DOM.$("#contact-bank-dropdown").classList.remove("hidden");
  },

  closeDropdown() {
    this.dropdownOpen = false;
    DOM.$("#contact-bank-selected").classList.remove("open");
    DOM.$("#contact-bank-dropdown").classList.add("hidden");
  },

  showFeedback(message, type = "info") {
    const feedback = DOM.$("#contact-submit-feedback");
    feedback.className = `submit-feedback ${type}`;
    feedback.innerHTML =
      type === "info"
        ? `<div class="spinner"></div><span>${message}</span>`
        : `<span>${message}</span>`;
    feedback.classList.remove("hidden");
  },

  hideFeedback() {
    DOM.$("#contact-submit-feedback").classList.add("hidden");
  },

  submit() {
    const name = DOM.$("#contact-name").value.trim();
    const number = DOM.$("#contact-number").value.trim();
    const bankId = DOM.$("#contact-bank-id").value;

    if (!bankId) {
      this.showFeedback("Please select a bank", "error");
      return;
    }
    if (!name) {
      this.showFeedback("Please enter a name", "error");
      return;
    }
    if (!number) {
      this.showFeedback("Please enter an account number", "error");
      return;
    }

    const bank = State.banksMap.get(String(bankId));

    if (this.editingIndex >= 0) {
      var existing = State.contacts[this.editingIndex];
      existing.name = name;
      existing.number = number;
      existing.bankId = bankId;
      existing.bankName = bank ? bank.shortName : "Unknown";
      existing.bankFullName = bank ? bank.name : "Unknown";
    } else {
      State.contacts.push({
        name: name,
        number: number,
        bankId: bankId,
        bankName: bank ? bank.shortName : "Unknown",
        bankFullName: bank ? bank.name : "Unknown",
        createdAt: new Date().toISOString(),
      });
    }

    persistContacts();

    this.showFeedback(this.editingIndex >= 0 ? "Contact updated!" : "Contact added!", "success");
    DOM.$("#add-contact-submit").disabled = true;

    setTimeout(() => {
      this.hide();
      renderContactsList();
    }, 1000);
  },

  deleteContact() {
    if (!this.deleteConfirmPending) {
      this.deleteConfirmPending = true;
      DOM.$("#add-contact-delete").querySelector("span").textContent = "Tap again to confirm";
      setTimeout(() => {
        if (this.deleteConfirmPending) {
          this.deleteConfirmPending = false;
          DOM.$("#add-contact-delete").querySelector("span").textContent = "Delete Contact";
        }
      }, 3000);
      return;
    }
    if (this.editingIndex >= 0) {
      State.contacts.splice(this.editingIndex, 1);
      persistContacts();
      this.showFeedback("Contact deleted", "success");
      DOM.$("#add-contact-submit").disabled = true;
      DOM.$("#add-contact-delete").classList.add("hidden");
      setTimeout(() => {
        this.hide();
        renderContactsList();
      }, 800);
    }
  },
};

// ============================================
// SCAN QR MODAL
// ============================================
var ScanQRModal = {
  parsedAccounts: [],
  profileName: "",

  show: function() {
    this.parsedAccounts = [];
    this.profileName = "";
    DOM.$("#scan-qr-step1").classList.remove("hidden");
    DOM.$("#scan-qr-step2").classList.add("hidden");
    DOM.$("#scan-qr-error").classList.add("hidden");
    DOM.$("#scan-qr-file-input").value = "";
    DOM.$("#scan-qr-title").textContent = "Scan QR Code";
    // Remove any leftover paste area
    var step1 = DOM.$("#scan-qr-step1");
    var ta = step1.querySelector(".scan-qr-paste-area");
    if (ta) ta.remove();
    var pb = step1.querySelector(".scan-qr-paste-submit");
    if (pb) pb.remove();
    var actions = step1.querySelector(".scan-qr-actions");
    if (actions) actions.classList.remove("hidden");
    var hint = step1.querySelector(".scan-qr-hint");
    if (hint) hint.classList.remove("hidden");

    DOM.$("#scan-qr-modal").classList.add("active");
  },

  hide: function() {
    DOM.$("#scan-qr-modal").classList.remove("active");
    this.parsedAccounts = [];
    this.profileName = "";
    DOM.$("#scan-qr-step1").classList.remove("hidden");
    DOM.$("#scan-qr-step2").classList.add("hidden");
    DOM.$("#scan-qr-error").classList.add("hidden");
    DOM.$("#scan-qr-file-input").value = "";
    DOM.$("#scan-qr-title").textContent = "Scan QR Code";
    var step1 = DOM.$("#scan-qr-step1");
    var ta = step1.querySelector(".scan-qr-paste-area");
    if (ta) ta.remove();
    var pb = step1.querySelector(".scan-qr-paste-submit");
    if (pb) pb.remove();
    var actions = step1.querySelector(".scan-qr-actions");
    if (actions) actions.classList.remove("hidden");
    var hint = step1.querySelector(".scan-qr-hint");
    if (hint) hint.classList.remove("hidden");
    DOM.$("#scan-qr-accounts-list").innerHTML = "";
    DOM.$("#scan-qr-name").value = "";
    DOM.$("#scan-qr-save-feedback").classList.add("hidden");
    DOM.$("#scan-qr-save-btn").disabled = false;
  },

  handleFileSelect: function(file) {
    var self = this;
    self.hideError();

    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        if (typeof jsQR !== "function") {
          self.showError("QR scanner not available");
          return;
        }

        // Try at original size first, then progressively smaller
        var sizes = [img.width, 1500, 800];
        var result = null;
        for (var s = 0; s < sizes.length; s++) {
          var w = Math.min(sizes[s], img.width);
          var h = Math.round(img.height * (w / img.width));
          var canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          var imageData = ctx.getImageData(0, 0, w, h);
          result = jsQR(imageData.data, w, h, { inversionAttempts: "attemptBoth" });
          if (result) break;
        }

        if (!result) {
          self.showError("No QR code found in image. Try a clearer photo.");
          return;
        }

        var data = self.parseQRData(result.data);
        if (!data) {
          self.showError("Not a valid Totals QR code.");
          return;
        }

        self.showReview(data);
      };
      img.onerror = function() { self.showError("Could not read image."); };
      img.src = e.target.result;
    };
    reader.onerror = function() { self.showError("Could not read file."); };
    reader.readAsDataURL(file);
  },

  handlePaste: function() {
    var self = this;
    self.hideError();

    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(function(text) {
        if (!text || !text.trim()) {
          self.showPasteArea();
          return;
        }
        var data = self.parseQRData(text.trim());
        if (!data) {
          self.showPasteArea("Clipboard doesn't contain valid Totals data. Paste manually:");
          return;
        }
        self.showReview(data);
      }).catch(function() {
        self.showPasteArea();
      });
    } else {
      self.showPasteArea();
    }
  },

  showPasteArea: function(hint) {
    var step1 = DOM.$("#scan-qr-step1");
    var existing = step1.querySelector(".scan-qr-paste-area");
    if (existing) return;

    this.hideError();
    if (hint) this.showError(hint);

    step1.querySelector(".scan-qr-actions").classList.add("hidden");
    step1.querySelector(".scan-qr-hint").classList.add("hidden");

    var textarea = document.createElement("textarea");
    textarea.className = "scan-qr-paste-area";
    textarea.placeholder = 'Paste the QR data here...\ne.g., {"profile":"...","accounts":[...]}';

    var submitBtn = document.createElement("button");
    submitBtn.className = "scan-qr-paste-submit";
    submitBtn.textContent = "Import";

    var self = this;
    submitBtn.addEventListener("click", function() {
      self.hideError();
      var text = textarea.value.trim();
      if (!text) {
        self.showError("Please paste the QR data first.");
        return;
      }
      var data = self.parseQRData(text);
      if (!data) {
        self.showError("Invalid data. Expected Totals QR format.");
        return;
      }
      self.showReview(data);
    });

    step1.appendChild(textarea);
    step1.appendChild(submitBtn);
    textarea.focus();
  },

  showError: function(msg) {
    var el = DOM.$("#scan-qr-error");
    el.innerHTML = "<span>" + msg + "</span>";
    el.classList.remove("hidden");
  },

  hideError: function() {
    DOM.$("#scan-qr-error").classList.add("hidden");
  },

  parseQRData: function(jsonString) {
    try {
      var obj = JSON.parse(jsonString);
      if (!obj || !Array.isArray(obj.accounts) || obj.accounts.length === 0) return null;
      var valid = false;
      for (var i = 0; i < obj.accounts.length; i++) {
        if (obj.accounts[i].number) { valid = true; break; }
      }
      if (!valid) return null;
      return { profile: obj.profile || "", accounts: obj.accounts };
    } catch (e) {
      return null;
    }
  },

  resolveBank: function(bankId) {
    var b = bankId ? State.banksMap.get(String(bankId)) : null;
    if (b) return { bankId: String(b.id), bankName: b.shortName, bankFullName: b.name, colors: b.colors };
    return null;
  },

  showReview: function(data) {
    var self = this;
    self.profileName = data.profile || "";

    self.parsedAccounts = [];
    for (var i = 0; i < data.accounts.length; i++) {
      var acc = data.accounts[i];
      var resolved = self.resolveBank(acc.bankId);
      self.parsedAccounts.push({
        name: acc.name || "",
        number: acc.number || "",
        bankId: resolved ? resolved.bankId : (acc.bankId || ""),
        bankName: resolved ? resolved.bankName : "?",
        bankFullName: resolved ? resolved.bankFullName : "Unknown",
        colors: resolved ? resolved.colors : ["#6b7280", "#4b5563"],
        selected: true
      });
    }

    var nameInput = DOM.$("#scan-qr-name");
    nameInput.value = (self.profileName && self.profileName !== "All Accounts") ? self.profileName : "";

    DOM.$("#scan-qr-title").textContent = "Import Contacts";
    DOM.$("#scan-qr-accounts-count").textContent = self.parsedAccounts.length;
    self.renderAccountsList();

    DOM.$("#scan-qr-step1").classList.add("hidden");
    DOM.$("#scan-qr-step2").classList.remove("hidden");
    DOM.$("#scan-qr-save-feedback").classList.add("hidden");
    DOM.$("#scan-qr-save-btn").disabled = false;
  },

  renderAccountsList: function() {
    var listEl = DOM.$("#scan-qr-accounts-list");
    listEl.innerHTML = "";
    var self = this;

    for (var i = 0; i < self.parsedAccounts.length; i++) {
      (function(idx) {
        var acc = self.parsedAccounts[idx];

        var item = document.createElement("div");
        item.className = "scan-qr-account-item" + (acc.selected ? "" : " unchecked");

        var check = document.createElement("div");
        check.className = "scan-qr-account-check";
        check.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>';

        var logo = document.createElement("div");
        logo.className = "scan-qr-account-logo";
        logo.style.background = "linear-gradient(135deg, " + acc.colors[0] + ", " + acc.colors[1] + ")";
        logo.textContent = acc.bankName.substring(0, 3);

        var info = document.createElement("div");
        info.className = "scan-qr-account-info";

        var nameEl = document.createElement("div");
        nameEl.className = "scan-qr-account-name";
        nameEl.textContent = acc.name || acc.bankName;

        var detail = document.createElement("div");
        detail.className = "scan-qr-account-detail";
        detail.textContent = acc.bankName + " \u00B7 " + acc.number;

        info.appendChild(nameEl);
        info.appendChild(detail);
        item.appendChild(check);
        item.appendChild(logo);
        item.appendChild(info);

        item.addEventListener("click", function() {
          self.parsedAccounts[idx].selected = !self.parsedAccounts[idx].selected;
          item.classList.toggle("unchecked");
        });

        listEl.appendChild(item);
      })(i);
    }
  },

  save: function() {
    var name = DOM.$("#scan-qr-name").value.trim();
    if (!name) {
      var fb = DOM.$("#scan-qr-save-feedback");
      fb.className = "submit-feedback error";
      fb.innerHTML = "<span>Please enter a contact name</span>";
      fb.classList.remove("hidden");
      return;
    }

    var selected = [];
    for (var i = 0; i < this.parsedAccounts.length; i++) {
      if (this.parsedAccounts[i].selected) selected.push(this.parsedAccounts[i]);
    }

    if (selected.length === 0) {
      var fb = DOM.$("#scan-qr-save-feedback");
      fb.className = "submit-feedback error";
      fb.innerHTML = "<span>Select at least one account</span>";
      fb.classList.remove("hidden");
      return;
    }

    for (var i = 0; i < selected.length; i++) {
      var acc = selected[i];
      State.contacts.push({
        name: name,
        number: acc.number,
        bankId: acc.bankId,
        bankName: acc.bankName,
        bankFullName: acc.bankFullName,
        createdAt: new Date().toISOString()
      });
    }

    persistContacts();

    var fb = DOM.$("#scan-qr-save-feedback");
    fb.className = "submit-feedback success";
    fb.innerHTML = "<span>" + selected.length + (selected.length === 1 ? " contact" : " contacts") + " saved!</span>";
    fb.classList.remove("hidden");
    DOM.$("#scan-qr-save-btn").disabled = true;

    var self = this;
    setTimeout(function() {
      self.hide();
      renderContactsList();
    }, 1000);
  }
};

// ============================================
// VERIFIER BANK SELECTOR
// ============================================
const VerifierBankSelector = {
  selectedBank: null,
  dropdownOpen: false,

  populate() {
    const dropdown = DOM.$("#verifier-bank-dropdown");
    dropdown.innerHTML = "";

    for (const bank of State.banks) {
      if (bank.virtual) continue;
      const option = DOM.createElement(
        "div",
        {
          className: "bank-selector-option",
          onClick: () => this.selectBank(bank),
        },
        [
          DOM.createElement(
            "div",
            {
              className: "bank-logo",
              style: {
                background: `linear-gradient(135deg, ${bank.colors[0]}, ${bank.colors[1]})`,
              },
            },
            [bank.shortName.substring(0, 3)],
          ),
          DOM.createElement(
            "div",
            { className: "bank-selector-option-info" },
            [
              DOM.createElement(
                "div",
                { className: "bank-selector-option-name" },
                [bank.shortName],
              ),
              DOM.createElement(
                "div",
                { className: "bank-selector-option-full" },
                [bank.name],
              ),
            ],
          ),
        ],
      );
      dropdown.appendChild(option);
    }
  },

  selectBank(bank) {
    this.selectedBank = bank;
    this.updateDisplay();
    this.closeDropdown();
  },

  updateDisplay() {
    const selected = DOM.$("#verifier-bank-selected");
    if (this.selectedBank) {
      selected.innerHTML = `
      <div class="bank-selector-value">
        <div class="bank-logo" style="background: linear-gradient(135deg, ${this.selectedBank.colors[0]}, ${this.selectedBank.colors[1]})">
          ${this.selectedBank.shortName.substring(0, 3)}
        </div>
        <span>${this.selectedBank.shortName}</span>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    `;
    } else {
      selected.innerHTML = `
      <span class="bank-selector-placeholder">Select a bank</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    `;
    }
  },

  toggleDropdown() {
    if (this.dropdownOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  },

  openDropdown() {
    this.dropdownOpen = true;
    DOM.$("#verifier-bank-selected").classList.add("open");
    DOM.$("#verifier-bank-dropdown").classList.remove("hidden");
  },

  closeDropdown() {
    this.dropdownOpen = false;
    DOM.$("#verifier-bank-selected").classList.remove("open");
    DOM.$("#verifier-bank-dropdown").classList.add("hidden");
  },
};

// ============================================
// PROFILE MODAL
// ============================================
const PROFILE_COLORS = [
  "#6b21a8", "#2563eb", "#0891b2", "#059669", "#d97706", "#dc2626",
];

function getAutoProfileColor(index) {
  return PROFILE_COLORS[index % PROFILE_COLORS.length];
}

function getProfileColor(profile) {
  if (profile && profile.color) return profile.color;
  var idx = State.profiles.indexOf(profile);
  return getAutoProfileColor(idx >= 0 ? idx : 0);
}

const ProfileModal = {
  editingProfile: null,
  selectedAccounts: [],
  selectedColor: null,
  deleteConfirmPending: false,
  deleteTimer: null,

  show(editProfileId) {
    this.deleteConfirmPending = false;
    if (this.deleteTimer) { clearTimeout(this.deleteTimer); this.deleteTimer = null; }

    var titleEl = DOM.$("#profile-modal-title");
    var deleteBtn = DOM.$("#profile-modal-delete");
    var nameInput = DOM.$("#profile-name-input");
    var feedback = DOM.$("#profile-modal-feedback");
    feedback.classList.add("hidden");
    DOM.$("#profile-modal-submit").disabled = false;

    if (editProfileId) {
      var profile = State.profiles.find(function(p) { return p.id === editProfileId; });
      if (!profile) return;
      this.editingProfile = profile;
      titleEl.textContent = "Edit Profile";
      nameInput.value = profile.name || "";
      this.selectedAccounts = (profile.accounts || []).slice();
      this.selectedColor = profile.color || getAutoProfileColor(State.profiles.indexOf(profile));
      deleteBtn.classList.remove("hidden");
      deleteBtn.textContent = "Delete Profile";
    } else {
      this.editingProfile = null;
      titleEl.textContent = "New Profile";
      nameInput.value = "";
      this.selectedAccounts = [];
      this.selectedColor = getAutoProfileColor(State.profiles.length);
      deleteBtn.classList.add("hidden");
    }

    this.renderColorPicker();
    this.renderAccountCheckboxes();
    DOM.$("#profile-modal").classList.add("active");
  },

  hide() {
    DOM.$("#profile-modal").classList.remove("active");
    if (this.deleteTimer) { clearTimeout(this.deleteTimer); this.deleteTimer = null; }
  },

  renderColorPicker() {
    var container = DOM.$("#profile-color-picker");
    if (!container) return;
    container.innerHTML = "";
    var self = this;
    for (var i = 0; i < PROFILE_COLORS.length; i++) {
      var color = PROFILE_COLORS[i];
      var swatch = document.createElement("div");
      swatch.className = "profile-color-swatch" + (color === this.selectedColor ? " active" : "");
      swatch.style.background = color;
      (function(c) {
        swatch.addEventListener("click", function() {
          self.selectedColor = c;
          self.renderColorPicker();
        });
      })(color);
      container.appendChild(swatch);
    }
  },

  renderAccountCheckboxes() {
    var container = DOM.$("#profile-accounts-list");
    if (!container) return;
    container.innerHTML = "";

    // Build map of accounts used by other profiles
    var usedBy = {};
    var editId = this.editingProfile ? this.editingProfile.id : null;
    for (var pi = 0; pi < State.profiles.length; pi++) {
      var p = State.profiles[pi];
      if (p.id === editId) continue;
      var accts = p.accounts || [];
      for (var ai = 0; ai < accts.length; ai++) {
        usedBy[accts[ai]] = p.name || "another profile";
      }
    }

    var self = this;
    for (var i = 0; i < State.accounts.length; i++) {
      var acc = State.accounts[i];
      var bank = State.banksMap.get(String(acc.bankId));
      var isSelected = this.selectedAccounts.indexOf(acc.number) !== -1;
      var otherProfile = usedBy[acc.number];
      var isDisabled = otherProfile && !isSelected;

      var item = document.createElement("label");
      item.className = "profile-account-item" + (isDisabled ? " disabled" : "");

      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = isSelected;
      cb.disabled = isDisabled;
      cb.value = acc.number;

      if (!isDisabled) {
        (function(accNum) {
          cb.addEventListener("change", function() {
            var idx = self.selectedAccounts.indexOf(accNum);
            if (this.checked && idx === -1) {
              self.selectedAccounts.push(accNum);
            } else if (!this.checked && idx !== -1) {
              self.selectedAccounts.splice(idx, 1);
            }
          });
        })(acc.number);
      }

      var info = document.createElement("div");
      info.className = "profile-account-info";

      var nameRow = document.createElement("div");
      nameRow.className = "profile-account-name";
      nameRow.textContent = acc.name || acc.number;

      var metaRow = document.createElement("div");
      metaRow.className = "profile-account-meta";
      metaRow.textContent = (bank ? bank.shortName : "Unknown") + " - " + acc.number;
      if (isDisabled) {
        metaRow.textContent += " (Used by " + otherProfile + ")";
      }

      info.appendChild(nameRow);
      info.appendChild(metaRow);

      item.appendChild(cb);
      item.appendChild(info);
      container.appendChild(item);
    }

    if (State.accounts.length === 0) {
      container.innerHTML = '<div class="profile-empty-hint">No accounts yet. Add accounts first in the Money tab.</div>';
    }
  },

  showFeedback(message, type) {
    var feedback = DOM.$("#profile-modal-feedback");
    feedback.className = "submit-feedback " + (type || "info");
    feedback.innerHTML = "<span>" + message + "</span>";
    feedback.classList.remove("hidden");
  },

  submit() {
    var name = DOM.$("#profile-name-input").value.trim();
    if (!name) {
      this.showFeedback("Please enter a profile name", "error");
      return;
    }

    if (this.editingProfile) {
      this.editingProfile.name = name;
      this.editingProfile.accounts = this.selectedAccounts.slice();
      this.editingProfile.color = this.selectedColor;
    } else {
      var id = "p-" + Date.now();
      var newProfile = {
        id: id,
        name: name,
        accounts: this.selectedAccounts.slice(),
        color: this.selectedColor,
        order: State.profiles.length,
      };
      State.profiles.push(newProfile);
    }

    persistProfiles();
    this.showFeedback(this.editingProfile ? "Profile updated!" : "Profile created!", "success");
    DOM.$("#profile-modal-submit").disabled = true;

    var self = this;
    setTimeout(function() {
      self.hide();
      updateProfileScreen();
      updateProfileAvatar();
    }, 800);
  },

  deleteProfile() {
    if (!this.deleteConfirmPending) {
      this.deleteConfirmPending = true;
      DOM.$("#profile-modal-delete").textContent = "Tap again to confirm";
      var self = this;
      this.deleteTimer = setTimeout(function() {
        self.deleteConfirmPending = false;
        DOM.$("#profile-modal-delete").textContent = "Delete Profile";
      }, 3000);
      return;
    }

    var deleteId = this.editingProfile ? this.editingProfile.id : null;
    State.profiles = State.profiles.filter(function(p) { return p.id !== deleteId; });

    // If active profile was deleted, switch to All
    if (State.activeProfileId === deleteId) {
      switchProfile(null);
    }

    persistProfiles();
    this.hide();
    updateProfileScreen();
    updateProfileAvatar();
  },
};

// ============================================
// CASH EXPENSE MODAL
// ============================================
var CashExpenseModal = {
  selectedCategory: null,
  selectedProfileId: null,

  show: function () {
    DOM.$("#cash-expense-amount").value = "";
    DOM.$("#cash-expense-receiver").value = "";
    // Default to current date/time in local timezone
    var now = new Date();
    var local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    DOM.$("#cash-expense-date").value = local.toISOString().slice(0, 16);
    this.selectedCategory = null;
    this.selectedProfileId = State.activeProfileId || null;
    this.renderCategories();
    this.renderProfiles();
    DOM.$("#cash-expense-modal").classList.add("active");
    setTimeout(function () {
      DOM.$("#cash-expense-amount").focus();
    }, 100);
  },

  hide: function () {
    DOM.$("#cash-expense-modal").classList.remove("active");
  },

  renderProfiles: function () {
    var container = DOM.$("#cash-expense-profiles");
    if (!container) return;
    if (State.profiles.length === 0) {
      container.parentElement.classList.add("hidden");
      return;
    }
    container.parentElement.classList.remove("hidden");

    var html = '<div class="cash-expense-cat-chip' + (!this.selectedProfileId ? ' selected' : '') +
      '" data-profile=""><span class="cat-dot" style="background:#6b7280"></span>All</div>';
    for (var i = 0; i < State.profiles.length; i++) {
      var p = State.profiles[i];
      var color = getProfileColor(p);
      var isActive = p.id === this.selectedProfileId;
      html += '<div class="cash-expense-cat-chip' + (isActive ? ' selected' : '') +
        '" data-profile="' + p.id + '">' +
        '<span class="cat-dot" style="background:' + color + '"></span>' +
        (p.name || "Unnamed") + '</div>';
    }
    container.innerHTML = html;

    var self = this;
    container.querySelectorAll(".cash-expense-cat-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        self.selectedProfileId = chip.dataset.profile || null;
        container.querySelectorAll(".cash-expense-cat-chip").forEach(function (c) {
          c.classList.remove("selected");
        });
        chip.classList.add("selected");
      });
    });
  },

  renderCategories: function () {
    var container = DOM.$("#cash-expense-categories");
    var cats = getCategoryNamesByType("expense");
    var html = "";
    for (var i = 0; i < cats.length; i++) {
      var name = cats[i];
      var info = getCategoryInfo(name);
      var color = info ? info.color : "#71717a";
      html += '<div class="cash-expense-cat-chip" data-category="' + name + '">' +
        '<span class="cat-dot" style="background:' + color + '"></span>' +
        name + '</div>';
    }
    html += '<div class="cash-expense-cat-chip cash-cat-new-chip" id="cash-expense-cat-new">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
      'New</div>';
    container.innerHTML = html;

    var self = this;
    container.querySelectorAll(".cash-expense-cat-chip:not(.cash-cat-new-chip)").forEach(function (chip) {
      chip.addEventListener("click", function () {
        if (self.selectedCategory === chip.dataset.category) {
          self.selectedCategory = null;
          chip.classList.remove("selected");
        } else {
          container.querySelectorAll(".cash-expense-cat-chip").forEach(function (c) {
            c.classList.remove("selected");
          });
          self.selectedCategory = chip.dataset.category;
          chip.classList.add("selected");
        }
      });
    });

    // New category toggle
    var createRow = DOM.$("#cash-expense-cat-create");
    DOM.$("#cash-expense-cat-new").addEventListener("click", function () {
      createRow.classList.toggle("hidden");
      if (!createRow.classList.contains("hidden")) DOM.$("#cash-expense-cat-input").focus();
    });
    DOM.$("#cash-expense-cat-save").addEventListener("click", function () {
      var name = DOM.$("#cash-expense-cat-input").value.trim();
      if (!name) return;
      var isDupe = getAllCategoryNames().some(function (n) { return n.toLowerCase() === name.toLowerCase(); });
      if (isDupe) {
        self.selectedCategory = name;
        self.renderCategories();
        var sel = container.querySelector('.cash-expense-cat-chip[data-category="' + name + '"]');
        if (sel) sel.classList.add("selected");
        createRow.classList.add("hidden");
        return;
      }
      var color = DOM.$("#cash-expense-cat-color").value;
      State.customCategories.push({ name: name, color: color, type: "expense" });
      persistCustomCategories();
      self.selectedCategory = name;
      self.renderCategories();
      var sel = container.querySelector('.cash-expense-cat-chip[data-category="' + name + '"]');
      if (sel) sel.classList.add("selected");
    });
  },

  submit: function () {
    var amountStr = DOM.$("#cash-expense-amount").value.trim();
    if (!amountStr) return;
    var amount = Parser.parseAmount(amountStr);
    if (amount <= 0) return;

    var receiver = DOM.$("#cash-expense-receiver").value.trim() || "Cash";
    var dateVal = DOM.$("#cash-expense-date").value;
    var ts = dateVal ? new Date(dateVal).toISOString() : new Date().toISOString();
    var ref = "CASH-" + Date.now();

    var txObj = {
      amount: amountStr,
      reference: ref,
      account: "",
      receiver: receiver,
      vat: "",
      totalFees: "",
      serviceCharge: "",
      balance: "",
      bankId: "0",
      type: "DEBIT",
      timestamp: ts,
    };
    if (this.selectedProfileId) txObj.profileId = this.selectedProfileId;

    // Persist to file
    persistAppendTx(txObj);

    // Add to in-memory State
    var bank = State.banksMap.get("0");
    var processed = {
      id: ref,
      type: "DEBIT",
      isExpense: true,
      amount: amount,
      reference: ref,
      account: "",
      receiver: receiver,
      vat: 0,
      totalFees: 0,
      serviceCharge: 0,
      balance: 0,
      bankId: "0",
      timestamp: new Date(ts),
      bank: bank || null,
      bankName: bank ? bank.shortName : "Cash",
      bankColors: bank ? bank.colors : ["#6b7280", "#4b5563"],
      categories: [],
      resolvedAccount: null,
      profileId: this.selectedProfileId || null,
    };

    // Apply category if selected
    if (this.selectedCategory) {
      processed.categories = [this.selectedCategory];
      State.categories.push({ txId: ref, categories: [this.selectedCategory] });
      State.categoryMap.set(ref, [this.selectedCategory]);
      persistCategories();
    }

    State.transactions.unshift(processed);
    this.hide();
    updateDashboard();
  },
};

// ============================================
// CASH INCOME MODAL
// ============================================
var CashIncomeModal = {
  selectedCategory: null,
  selectedProfileId: null,

  show: function () {
    DOM.$("#cash-income-amount").value = "";
    DOM.$("#cash-income-source").value = "";
    var now = new Date();
    var local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    DOM.$("#cash-income-date").value = local.toISOString().slice(0, 16);
    this.selectedCategory = null;
    this.selectedProfileId = State.activeProfileId || null;
    this.renderCategories();
    this.renderProfiles();
    DOM.$("#cash-income-modal").classList.add("active");
    setTimeout(function () {
      DOM.$("#cash-income-amount").focus();
    }, 100);
  },

  hide: function () {
    DOM.$("#cash-income-modal").classList.remove("active");
  },

  renderProfiles: function () {
    var container = DOM.$("#cash-income-profiles");
    if (!container) return;
    if (State.profiles.length === 0) {
      container.parentElement.classList.add("hidden");
      return;
    }
    container.parentElement.classList.remove("hidden");

    var html = '<div class="cash-expense-cat-chip' + (!this.selectedProfileId ? ' selected' : '') +
      '" data-profile=""><span class="cat-dot" style="background:#6b7280"></span>All</div>';
    for (var i = 0; i < State.profiles.length; i++) {
      var p = State.profiles[i];
      var color = getProfileColor(p);
      var isActive = p.id === this.selectedProfileId;
      html += '<div class="cash-expense-cat-chip' + (isActive ? ' selected' : '') +
        '" data-profile="' + p.id + '">' +
        '<span class="cat-dot" style="background:' + color + '"></span>' +
        (p.name || "Unnamed") + '</div>';
    }
    container.innerHTML = html;

    var self = this;
    container.querySelectorAll(".cash-expense-cat-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        self.selectedProfileId = chip.dataset.profile || null;
        container.querySelectorAll(".cash-expense-cat-chip").forEach(function (c) {
          c.classList.remove("selected");
        });
        chip.classList.add("selected");
      });
    });
  },

  renderCategories: function () {
    var container = DOM.$("#cash-income-categories");
    var cats = getCategoryNamesByType("income");
    var html = "";
    for (var i = 0; i < cats.length; i++) {
      var name = cats[i];
      var info = getCategoryInfo(name);
      var color = info ? info.color : "#71717a";
      html += '<div class="cash-expense-cat-chip" data-category="' + name + '">' +
        '<span class="cat-dot" style="background:' + color + '"></span>' +
        name + '</div>';
    }
    html += '<div class="cash-expense-cat-chip cash-cat-new-chip" id="cash-income-cat-new">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
      'New</div>';
    container.innerHTML = html;

    var self = this;
    container.querySelectorAll(".cash-expense-cat-chip:not(.cash-cat-new-chip)").forEach(function (chip) {
      chip.addEventListener("click", function () {
        if (self.selectedCategory === chip.dataset.category) {
          self.selectedCategory = null;
          chip.classList.remove("selected");
        } else {
          container.querySelectorAll(".cash-expense-cat-chip").forEach(function (c) {
            c.classList.remove("selected");
          });
          self.selectedCategory = chip.dataset.category;
          chip.classList.add("selected");
        }
      });
    });

    // New category toggle
    var createRow = DOM.$("#cash-income-cat-create");
    DOM.$("#cash-income-cat-new").addEventListener("click", function () {
      createRow.classList.toggle("hidden");
      if (!createRow.classList.contains("hidden")) DOM.$("#cash-income-cat-input").focus();
    });
    DOM.$("#cash-income-cat-save").addEventListener("click", function () {
      var name = DOM.$("#cash-income-cat-input").value.trim();
      if (!name) return;
      var isDupe = getAllCategoryNames().some(function (n) { return n.toLowerCase() === name.toLowerCase(); });
      if (isDupe) {
        self.selectedCategory = name;
        self.renderCategories();
        var sel = container.querySelector('.cash-expense-cat-chip[data-category="' + name + '"]');
        if (sel) sel.classList.add("selected");
        createRow.classList.add("hidden");
        return;
      }
      var color = DOM.$("#cash-income-cat-color").value;
      State.customCategories.push({ name: name, color: color, type: "income" });
      persistCustomCategories();
      self.selectedCategory = name;
      self.renderCategories();
      var sel = container.querySelector('.cash-expense-cat-chip[data-category="' + name + '"]');
      if (sel) sel.classList.add("selected");
    });
  },

  submit: function () {
    var amountStr = DOM.$("#cash-income-amount").value.trim();
    if (!amountStr) return;
    var amount = Parser.parseAmount(amountStr);
    if (amount <= 0) return;

    var source = DOM.$("#cash-income-source").value.trim() || "Cash";
    var dateVal = DOM.$("#cash-income-date").value;
    var ts = dateVal ? new Date(dateVal).toISOString() : new Date().toISOString();
    var ref = "CASH-" + Date.now();

    var txObj = {
      amount: amountStr,
      reference: ref,
      account: "",
      receiver: source,
      vat: "",
      totalFees: "",
      serviceCharge: "",
      balance: "",
      bankId: "0",
      type: "CREDIT",
      timestamp: ts,
    };
    if (this.selectedProfileId) txObj.profileId = this.selectedProfileId;

    // Persist to file
    persistAppendTx(txObj);

    // Add to in-memory State
    var bank = State.banksMap.get("0");
    var processed = {
      id: ref,
      type: "CREDIT",
      isExpense: false,
      amount: amount,
      reference: ref,
      account: "",
      receiver: source,
      vat: 0,
      totalFees: 0,
      serviceCharge: 0,
      balance: 0,
      bankId: "0",
      timestamp: new Date(ts),
      bank: bank || null,
      bankName: bank ? bank.shortName : "Cash",
      bankColors: bank ? bank.colors : ["#6b7280", "#4b5563"],
      categories: [],
      resolvedAccount: null,
      profileId: this.selectedProfileId || null,
    };

    // Apply category if selected
    if (this.selectedCategory) {
      processed.categories = [this.selectedCategory];
      State.categories.push({ txId: ref, categories: [this.selectedCategory] });
      State.categoryMap.set(ref, [this.selectedCategory]);
      persistCategories();
    }

    State.transactions.unshift(processed);
    this.hide();
    updateDashboard();
  },
};

function generateQRDataURL(text, cellSize) {
  cellSize = cellSize || 4;
  var qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  return qr.createDataURL(cellSize, 0);
}

// ============================================
// QR SHARE MODAL
// ============================================
var QRModal = {
  show: function() {
    var accounts = typeof getProfileAccounts === "function" ? getProfileAccounts() : State.accounts;
    if (accounts.length === 0) return;

    var body = DOM.$("#qr-modal-body");
    body.innerHTML = "";

    // Build profile name
    var profileName = "All Accounts";
    if (State.activeProfileId) {
      var profile = State.profiles.find(function(p) { return p.id === State.activeProfileId; });
      if (profile) profileName = profile.name;
    }

    // Build single payload with all accounts
    var payload = [];
    for (var i = 0; i < accounts.length; i++) {
      var acc = accounts[i];
      var bank = State.banksMap.get(String(acc.bankId));
      payload.push({
        name: acc.name || "",
        bankId: acc.bankId,
        number: acc.number || "",
      });
    }
    var qrData = JSON.stringify({ profile: profileName, accounts: payload });

    // Profile header
    var title = document.createElement("div");
    title.className = "qr-profile-title";
    title.textContent = profileName;
    body.appendChild(title);

    // Single QR code
    var wrap = document.createElement("div");
    wrap.className = "qr-canvas-wrap";
    var img = document.createElement("img");
    img.src = generateQRDataURL(qrData, 8);
    img.alt = "QR Code";
    wrap.appendChild(img);
    body.appendChild(wrap);

    // Account list below QR
    var list = document.createElement("div");
    list.className = "qr-account-list";
    for (var i = 0; i < accounts.length; i++) {
      var acc = accounts[i];
      var bank = State.banksMap.get(String(acc.bankId));
      var bankName = bank ? bank.shortName : acc.bankName || "?";
      var colors = bank ? bank.colors : ["#6b7280", "#4b5563"];

      var row = document.createElement("div");
      row.className = "qr-account-row";
      var logo = document.createElement("div");
      logo.className = "qr-account-bank-logo";
      logo.style.background = "linear-gradient(135deg, " + colors[0] + ", " + colors[1] + ")";
      logo.textContent = bankName.substring(0, 3);
      var info = document.createElement("div");
      info.className = "qr-account-info";
      info.innerHTML = '<div class="qr-account-name">' + (acc.name || "Account") +
        '</div><div class="qr-account-number">' + (acc.number || "") + '</div>';
      var copyNum = document.createElement("button");
      copyNum.className = "qr-account-copy";
      copyNum.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      (function(btn, num) {
        btn.addEventListener("click", function(e) {
          e.stopPropagation();
          if (!num) return;
          try { navigator.clipboard.writeText(num); } catch(ex) {
            var ta = document.createElement("textarea"); ta.value = num;
            ta.style.cssText = "position:fixed;top:-100px";
            document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
          }
          btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>';
          setTimeout(function() {
            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
          }, 1200);
        });
      })(copyNum, acc.number || "");
      row.appendChild(logo);
      row.appendChild(info);
      row.appendChild(copyNum);
      list.appendChild(row);
    }
    body.appendChild(list);

    // Copy all button
    var copyBtn = document.createElement("button");
    copyBtn.className = "qr-copy-btn";
    copyBtn.textContent = "Copy all details";
    copyBtn.addEventListener("click", function() {
      var lines = [];
      for (var i = 0; i < accounts.length; i++) {
        var a = accounts[i], b = State.banksMap.get(String(a.bankId));
        lines.push((a.name || "Account") + " | " + (b ? b.name : a.bankFullName || "") + " | " + (a.number || ""));
      }
      var text = lines.join("\n");
      try { navigator.clipboard.writeText(text); } catch(e) {
        var ta = document.createElement("textarea"); ta.value = text;
        ta.style.cssText = "position:fixed;top:-100px";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
      }
      copyBtn.textContent = "Copied!";
      setTimeout(function() { copyBtn.textContent = "Copy all details"; }, 1500);
    });
    body.appendChild(copyBtn);

    DOM.$("#qr-modal").classList.add("active");
  },
  hide: function() { DOM.$("#qr-modal").classList.remove("active"); },
};
