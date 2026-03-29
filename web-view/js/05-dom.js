// ============================================
// DOM HELPERS
// ============================================
const DOM = {
  $(selector) {
    return document.querySelector(selector);
  },

  $$(selector) {
    return document.querySelectorAll(selector);
  },

  createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "className") {
        el.className = value;
      } else if (key === "style" && typeof value === "object") {
        Object.assign(el.style, value);
      } else if (key.startsWith("on")) {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key.startsWith("data")) {
        el.setAttribute(
          key.replace(/([A-Z])/g, "-$1").toLowerCase(),
          value,
        );
      } else {
        el.setAttribute(key, value);
      }
    }
    for (const child of children) {
      if (typeof child === "string") {
        el.appendChild(document.createTextNode(child));
      } else if (child) {
        el.appendChild(child);
      }
    }
    return el;
  },

  // Efficient batch rendering with DocumentFragment
  renderList(container, items, renderFn) {
    const fragment = document.createDocumentFragment();
    for (const item of items) {
      fragment.appendChild(renderFn(item));
    }
    container.innerHTML = "";
    container.appendChild(fragment);
  },
};

// ============================================
// RENDERERS
// ============================================
const Render = {
  transactionItem(tx, unmasked) {
    const isExpense = tx.isExpense;
    var _m = unmasked ? function(v) { return v; } : Format.masked.bind(Format);

    var categoryEl;
    if (tx.categories && tx.categories.length > 0) {
      if (tx.categories.length === 1) {
        var catInfo = getCategoryInfo(tx.categories[0]);
        categoryEl = DOM.createElement(
          "span",
          {
            className: "category-badge",
            style: {
              color: catInfo.color,
              background: catInfo.color + "18",
            },
          },
          [
            DOM.createElement("span", {
              className: "category-badge-dot",
              style: { background: catInfo.color },
            }),
            tx.categories[0],
          ],
        );
      } else {
        // Multiple categories: show dots + count
        var dotsChildren = [];
        for (var ci = 0; ci < tx.categories.length; ci++) {
          var ci2 = getCategoryInfo(tx.categories[ci]);
          dotsChildren.push(DOM.createElement("span", {
            className: "category-badge-dot",
            style: { background: ci2.color },
          }));
        }
        dotsChildren.push(tx.categories.length + " categories");
        categoryEl = DOM.createElement(
          "span",
          {
            className: "category-badge",
            style: {
              color: "var(--text-secondary)",
              background: "var(--border-color)",
            },
          },
          dotsChildren,
        );
      }
    } else {
      categoryEl = DOM.createElement(
        "span",
        {
          className: "categorize-badge",
        },
        ["Categorize"],
      );
    }

    const el = DOM.createElement(
      "div",
      {
        className: "transaction-item" + (isSelfTransfer(tx) ? " self-transfer" : ""),
        dataId: tx.id,
        onClick: () => showTransactionDetail(tx),
      },
      [
        DOM.createElement("div", { className: "transaction-bank-name" }, [
          tx.resolvedAccount ? tx.resolvedAccount.name : tx.bankName,
        ]),
        DOM.createElement(
          "div",
          {
            className:
              "transaction-amount " + (isExpense ? "expense" : "income"),
          },
          [
            _m((isExpense ? "- " : "+ ") + Format.currency(tx.amount)),
          ],
        ),
        DOM.createElement("div", { className: "transaction-category" }, [
          categoryEl,
        ]),
        DOM.createElement(
          "div",
          { className: "transaction-receiver-right" },
          [
            State.receiverNameMap.get(tx.id) || (tx.receiver && tx.receiver !== "Unknown"
              ? tx.receiver
              : "Deposit"),
          ],
        ),
      ],
    );
    return el;
  },

  transactionGroup(date, transactions, unmasked) {
    const group = DOM.createElement("div", {
      className: "transaction-group",
    });
    group.appendChild(
      DOM.createElement("div", { className: "transaction-date" }, [
        Format.dateGroup(date) + ` (${transactions.length})`,
      ]),
    );
    for (const tx of transactions) {
      group.appendChild(this.transactionItem(tx, unmasked));
    }
    return group;
  },

  bankCard(bank) {
    const bankTx = Analytics.getByBank(bank.id);
    const bankAccounts = getProfileAccounts().filter(
      (a) => String(a.bankId) === String(bank.id),
    );
    const hasAccounts = bankAccounts.length > 0;

    var children = [
      DOM.createElement("div", { className: "bank-card-header" }, [
        DOM.createElement("div", { className: "bank-card-name" }, [
          bank.shortName.toUpperCase(),
        ]),
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
      ]),
    ];

    if (hasAccounts) {
      var bankBalance = 0;
      for (var bi = 0; bi < bankAccounts.length; bi++) {
        var accTxs = bankTx.filter(function(tx) { return tx.resolvedAccount === bankAccounts[bi]; });
        if (accTxs.length > 0) bankBalance += accTxs[0].balance;
      }
      children.push(
        DOM.createElement("div", { className: "bank-card-info" }, [
          bankAccounts.length +
            " Account" +
            (bankAccounts.length !== 1 ? "s" : ""),
        ]),
      );
      var bankBalRaw = Format.currency(bankBalance);
      children.push(
        DOM.createElement("div", { className: "bank-card-masked" }, [
          DOM.createElement(
            "span",
            { className: "bank-card-masked-text", dataRaw: bankBalRaw },
            [Format.masked(bankBalRaw)],
          ),
          DOM.createElement("svg", {
            className: "bank-card-eye",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
          }),
        ]),
      );
    } else {
      if (bankTx.length > 0) {
        children.push(
          DOM.createElement("div", { className: "bank-card-messages" }, [
            bankTx.length + " messages found",
          ]),
        );
      }
      children.push(
        DOM.createElement(
          "div",
          {
            className: "bank-card-add-link",
            onClick: (e) => {
              e.stopPropagation();
              AddAccountModal.show();
            },
          },
          ["\u2295 Tap To Add"],
        ),
      );
    }

    return DOM.createElement(
      "div",
      {
        className: `bank-card ${State.selectedBank === bank.id ? "selected" : ""}`,
        onClick: () => selectBank(bank.id),
      },
      children,
    );
  },

  accountCard(account, bankTxForAccount) {
    const bank = State.banksMap.get(String(account.bankId));
    var acctTx =
      bankTxForAccount ||
      getProfileTransactions().filter((tx) => tx.resolvedAccount === account);
    var acctBalance = acctTx.length > 0 ? acctTx[0].balance : 0;
    var acctInflow = acctTx
      .filter((tx) => !tx.isExpense)
      .reduce((s, tx) => s + tx.amount, 0);
    var acctOutflow = acctTx
      .filter((tx) => tx.isExpense)
      .reduce((s, tx) => s + tx.amount, 0);

    const el = DOM.createElement("div", { className: "account-card" });
    el.addEventListener("click", () => {
      el.classList.toggle("expanded");
    });

    el.appendChild(
      DOM.createElement("div", { className: "account-header" }, [
        DOM.createElement("div", { className: "account-header-left" }, [
          bank
            ? DOM.createElement(
                "div",
                {
                  className: "bank-logo",
                  style: {
                    background: `linear-gradient(135deg, ${bank.colors[0]}, ${bank.colors[1]})`,
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    fontSize: "10px",
                  },
                },
                [bank.shortName.substring(0, 3)],
              )
            : null,
          DOM.createElement("div", {}, [
            DOM.createElement("div", { className: "account-name" }, [
              account.name,
            ]),
            DOM.createElement("div", { className: "account-number" }, [
              account.number,
            ]),
          ]),
        ]),
        DOM.createElement("div", { className: "account-header-right" }, [
          DOM.createElement("div", { className: "account-balance", dataRaw: Format.currency(acctBalance) }, [
            Format.masked(Format.currency(acctBalance)),
          ]),
          DOM.createElement("svg", {
            className: "account-chevron",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
          }),
        ]),
      ]),
    );

    // Expanded content
    var expanded = DOM.createElement("div", {
      className: "account-expanded-content",
    });
    expanded.innerHTML = `
    <div class="account-stat-row" style="gap:24px">
      <div>
        <div class="account-stat-label">Transactions</div>
        <div class="account-stat-value">${acctTx.length}</div>
      </div>
      <div>
        <div class="account-stat-label">In &amp; Out</div>
        <div class="account-stat-value"><span class="text-green" data-raw="${"+" + Format.currency(acctInflow)}">${Format.masked("+" + Format.currency(acctInflow))}</span> | <span class="text-red" data-raw="${"-" + Format.currency(acctOutflow)}">${Format.masked("-" + Format.currency(acctOutflow))}</span></div>
      </div>
    </div>
    <div class="account-actions">
      <button class="account-action-btn account-edit-btn">Edit</button>
      <button class="account-action-btn account-delete-btn">Delete</button>
    </div>
  `;
    // Wire edit/delete buttons
    (function(acc) {
      expanded.querySelector(".account-edit-btn").addEventListener("click", function(e) {
        e.stopPropagation();
        AddAccountModal.edit(acc);
      });
      var deleteBtn = expanded.querySelector(".account-delete-btn");
      var deleteTimer = null;
      var confirmPending = false;
      deleteBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        if (!confirmPending) {
          confirmPending = true;
          deleteBtn.textContent = "Tap again to confirm";
          deleteTimer = setTimeout(function() {
            confirmPending = false;
            deleteBtn.textContent = "Delete";
          }, 3000);
          return;
        }
        if (deleteTimer) clearTimeout(deleteTimer);
        State.accounts = State.accounts.filter(function(a) { return a !== acc; });
        reResolveAccounts();
        persistAccounts();
        updateAccountsTab();
        if (State.selectedBank) updateBankDetail();
      });
    })(account);
    el.appendChild(expanded);

    // Create the chevron SVG path
    el.querySelector(".account-chevron").innerHTML =
      '<polyline points="6 9 12 15 18 9"/>';

    return el;
  },

  ledgerEntry(tx, groupedInfo) {
    const isExpense = tx.isExpense;
    const timeStr = Format.time(tx.timestamp) || "—";

    var arrowSvg;
    if (isExpense) {
      arrowSvg =
        '<svg class="ledger-entry-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>';
    } else {
      arrowSvg =
        '<svg class="ledger-entry-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
    }

    var amountEl = DOM.createElement("div", {
      className:
        "ledger-entry-amount " + (isExpense ? "expense" : "income"),
    });
    amountEl.innerHTML =
      arrowSvg +
      " " +
      (isExpense ? "-" : "+") +
      Format.currency(tx.amount);

    var descText;
    var balanceLabel;
    var displayReceiver = State.receiverNameMap.get(tx.id) || tx.receiver;
    if (groupedInfo) {
      // Grouped mode: show "All(#N) → Receiver"
      descText = "All(#" + groupedInfo.count + ")";
      if (displayReceiver && displayReceiver !== "Unknown") {
        descText += " → " + displayReceiver;
      }
      balanceLabel = "Balance: " + Format.currency(groupedInfo.combinedBalance);
    } else {
      descText = (tx.resolvedAccount ? tx.resolvedAccount.name : tx.bankName) +
        (displayReceiver && displayReceiver !== "Unknown" ? " → " + displayReceiver : "");
      balanceLabel = "Balance: " + Format.currency(tx.balance);
    }

    return DOM.createElement("div", { className: "ledger-entry" + (isSelfTransfer(tx) ? " self-transfer" : "") }, [
      DOM.createElement("div", { className: "ledger-entry-time" }, [
        timeStr,
      ]),
      DOM.createElement("div", { className: "ledger-entry-content" }, [
        DOM.createElement("div", { className: "ledger-entry-desc" }, [
          descText,
        ]),
        amountEl,
        DOM.createElement("div", { className: "ledger-entry-balance" }, [
          balanceLabel,
        ]),
      ]),
    ]);
  },

  emptyState(message) {
    return DOM.createElement("div", { className: "empty-state" }, [
      DOM.createElement("svg", {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.5",
      }),
      DOM.createElement("div", { className: "empty-state-title" }, [
        message,
      ]),
    ]);
  },
};

