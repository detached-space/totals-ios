// ============================================
// PROFILE-SCOPED DATA HELPERS
// ============================================
function getProfileTransactions() {
  if (!State.activeProfileId) return State.transactions;
  var profile = State.profiles.find(function(p) { return p.id === State.activeProfileId; });
  if (!profile || !profile.accounts || profile.accounts.length === 0) {
    // Still include cash expenses tagged to this profile
    return State.transactions.filter(function(tx) {
      return tx.profileId === State.activeProfileId;
    });
  }
  var acctSet = {};
  for (var i = 0; i < profile.accounts.length; i++) {
    acctSet[profile.accounts[i]] = true;
  }
  return State.transactions.filter(function(tx) {
    if (tx.profileId === State.activeProfileId) return true;
    if (tx.resolvedAccount) return acctSet[tx.resolvedAccount.number] || false;
    return false;
  });
}

function getProfileAccounts() {
  if (!State.activeProfileId) return State.accounts;
  var profile = State.profiles.find(function(p) { return p.id === State.activeProfileId; });
  if (!profile || !profile.accounts || profile.accounts.length === 0) return [];
  var acctSet = {};
  for (var i = 0; i < profile.accounts.length; i++) {
    acctSet[profile.accounts[i]] = true;
  }
  return State.accounts.filter(function(a) { return acctSet[a.number] || false; });
}

function getProfileBudgets() {
  if (!State.activeProfileId) return State.budgets.filter(function(b) { return !b.profileId; });
  return State.budgets.filter(function(b) {
    return !b.profileId || b.profileId === State.activeProfileId;
  });
}

function getProfileBudgetGroups() {
  if (!State.activeProfileId) return State.budgetGroups.filter(function(g) { return !g.profileId; });
  return State.budgetGroups.filter(function(g) {
    return !g.profileId || g.profileId === State.activeProfileId;
  });
}

function getProfileCustomCategories() {
  if (!State.activeProfileId) return State.customCategories.filter(function(c) { return !c.profileId; });
  return State.customCategories.filter(function(c) {
    return !c.profileId || c.profileId === State.activeProfileId;
  });
}

function getProfileCategoryRules() {
  if (!State.activeProfileId) return State.categoryRules.filter(function(r) { return !r.profileId; });
  return State.categoryRules.filter(function(r) {
    return !r.profileId || r.profileId === State.activeProfileId;
  });
}

// ============================================
// FILTERED DATA HELPER
// ============================================
function getFilteredTransactions() {
  let filtered = getProfileTransactions();

  // Apply search query
  if (State.searchQuery) {
    const query = State.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (tx) =>
        (tx.receiver && tx.receiver.toLowerCase().includes(query)) ||
        (tx.reference && tx.reference.toLowerCase().includes(query)) ||
        (tx.bankName && tx.bankName.toLowerCase().includes(query)) ||
        (tx.categories && tx.categories.some(function(c) { return c.toLowerCase().includes(query); })) ||
        (State.reasonMap.has(tx.id) && State.reasonMap.get(tx.id).toLowerCase().includes(query)) ||
        (State.receiverNameMap.has(tx.id) && State.receiverNameMap.get(tx.id).toLowerCase().includes(query)) ||
        (tx.amount && tx.amount.toString().includes(query)) ||
        (tx.amount && Format.currency(tx.amount).toLowerCase().includes(query)),
    );
  }

  // Apply type filter
  if (State.filters.type === "expense") {
    filtered = filtered.filter((tx) => tx.isExpense);
  } else if (State.filters.type === "income") {
    filtered = filtered.filter((tx) => !tx.isExpense);
  }

  // Apply bank filter
  if (State.filters.bankIds.length > 0) {
    filtered = filtered.filter((tx) =>
      State.filters.bankIds.includes(String(tx.bankId)),
    );
  }

  // Apply account filter
  if (State.filters.accounts.length > 0) {
    filtered = filtered.filter(function(tx) {
      return tx.resolvedAccount && State.filters.accounts.includes(tx.resolvedAccount.number);
    });
  }

  // Apply category filter
  if (State.filters.categories.length > 0) {
    filtered = filtered.filter(
      (tx) =>
        tx.categories && tx.categories.some(function(c) { return State.filters.categories.indexOf(c) !== -1; }),
    );
  }

  // Apply date filter
  if (State.filters.dateStart) {
    const startDate = new Date(State.filters.dateStart);
    startDate.setHours(0, 0, 0, 0);
    filtered = filtered.filter(
      (tx) => tx.timestamp && tx.timestamp >= startDate,
    );
  }

  if (State.filters.dateEnd) {
    const endDate = new Date(State.filters.dateEnd);
    endDate.setHours(23, 59, 59, 999);
    filtered = filtered.filter(
      (tx) => tx.timestamp && tx.timestamp <= endDate,
    );
  }

  return filtered;
}

function renderActiveFiltersBar(containerId) {
  // This is called but we show filters in the modal, not as tags
  // Could be expanded to show active filter tags above the list
}

