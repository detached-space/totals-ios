// ============================================
// ANALYTICS CALCULATIONS
// ============================================
function isSelfTransfer(tx) {
  return tx.categories && tx.categories.indexOf("Self") !== -1;
}

const Analytics = {
  getTotalBalance() {
    var txs = getProfileTransactions();
    if (txs.length === 0) return 0;
    var accounts = getProfileAccounts();
    let total = 0;
    if (accounts.length > 0) {
      // Sum latest balance from each registered account
      for (var i = 0; i < accounts.length; i++) {
        var accTxs = txs.filter(function(tx) { return tx.resolvedAccount === accounts[i]; });
        if (accTxs.length > 0) total += accTxs[0].balance;
      }
    } else {
      // No accounts registered — fall back to latest balance per bank
      const usedBankIds = [
        ...new Set(txs.map((tx) => tx.bankId)),
      ].filter(Boolean);
      for (const bankId of usedBankIds) {
        var bankObj = State.banksMap.get(String(bankId));
        if (bankObj && bankObj.virtual) continue;
        const bankTx = txs.filter(
          (tx) => String(tx.bankId) === String(bankId),
        );
        if (bankTx.length > 0) total += bankTx[0].balance;
      }
    }
    return total;
  },

  getTotalSpent() {
    return getProfileTransactions().reduce((sum, tx) => sum + tx.amount, 0);
  },

  getTotalFees() {
    return getProfileTransactions().reduce((sum, tx) => {
      return sum + tx.vat + tx.serviceCharge + tx.totalFees;
    }, 0);
  },

  getInflow() {
    return getProfileTransactions()
      .filter((tx) => !tx.isExpense && !isSelfTransfer(tx))
      .reduce((sum, tx) => sum + tx.amount, 0);
  },

  getOutflow() {
    return getProfileTransactions()
      .filter((tx) => tx.isExpense && !isSelfTransfer(tx))
      .reduce((sum, tx) => sum + tx.amount, 0);
  },

  getToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTx = getProfileTransactions().filter((tx) => {
      if (!tx.timestamp) return false;
      const txDate = new Date(tx.timestamp);
      txDate.setHours(0, 0, 0, 0);
      return txDate.getTime() === today.getTime();
    });
    return {
      income: todayTx
        .filter((tx) => !tx.isExpense && !isSelfTransfer(tx))
        .reduce((s, tx) => s + tx.amount, 0),
      expense: todayTx
        .filter((tx) => tx.isExpense && !isSelfTransfer(tx))
        .reduce((s, tx) => s + tx.amount, 0),
    };
  },

  getThisWeek() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekTx = getProfileTransactions().filter((tx) => {
      if (!tx.timestamp) return false;
      return tx.timestamp >= weekAgo;
    });
    return {
      income: weekTx
        .filter((tx) => !tx.isExpense && !isSelfTransfer(tx))
        .reduce((s, tx) => s + tx.amount, 0),
      expense: weekTx
        .filter((tx) => tx.isExpense && !isSelfTransfer(tx))
        .reduce((s, tx) => s + tx.amount, 0),
    };
  },

  getHealthScore() {
    // Simple health score based on spending ratio
    const inflow = this.getInflow();
    const outflow = this.getOutflow();
    if (inflow === 0 && outflow === 0) return 50;
    if (inflow === 0) return 23; // Default low score
    const ratio = (inflow - outflow) / inflow;
    return Math.max(0, Math.min(100, Math.round((ratio + 1) * 50)));
  },

  getByBank(bankId) {
    return getProfileTransactions().filter(
      (tx) => String(tx.bankId) === String(bankId),
    );
  },
};

// ============================================
// FORMATTERS
// ============================================
const Format = {
  currency(amount, showSign = false) {
    const abs = Math.abs(amount);
    let formatted;
    if (abs >= 1000000) {
      formatted = (abs / 1000000).toFixed(1) + "M";
    } else if (abs >= 1000) {
      formatted = (abs / 1000).toFixed(1) + "K";
    } else {
      formatted = abs.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    if (showSign) {
      return (amount >= 0 ? "+" : "-") + "ETB " + formatted;
    }
    return "ETB " + formatted;
  },

  compact(amount) {
    return this.currency(amount).replace("ETB ", "");
  },

  currencyFull(amount) {
    var abs = Math.abs(amount);
    var formatted = abs.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return "ETB " + formatted;
  },

  date(date) {
    if (!date) return "Unknown";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  },

  time(date) {
    if (!date) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  },

  dateGroup(date) {
    if (!date) return "Unknown Date";
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === today.getTime()) return "Today";
    if (dateOnly.getTime() === yesterday.getTime()) return "Yesterday";
    return this.date(date);
  },

  masked(value) {
    if (!State.balanceVisible) return "*****";
    return value;
  },
};

