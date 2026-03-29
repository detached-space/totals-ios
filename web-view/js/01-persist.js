// ============================================
// SCRIPTABLE MESSAGE PASSING
// ============================================
// Uses a hidden iframe to navigate to totals-persist://type?d=JSON.
// Scriptable's shouldAllowRequest intercepts the request, writes
// the data to disk, and blocks the navigation (returns false).
// One iframe per type so concurrent saves don't clobber each other.
var _persistFrames = {};
function persistToScriptable(type, data) {
  try {
    if (!_persistFrames[type]) {
      _persistFrames[type] = document.createElement("iframe");
      _persistFrames[type].style.display = "none";
      document.body.appendChild(_persistFrames[type]);
    }
    _persistFrames[type].src =
      "totals-persist://" +
      type +
      "?t=" + Date.now() +
      "&d=" +
      encodeURIComponent(JSON.stringify(data));
  } catch (e) {
    // Not running inside Scriptable (browser dev mode)
  }
}

var _openFrame;
function openExternal(url) {
  try {
    if (!_openFrame) {
      _openFrame = document.createElement("iframe");
      _openFrame.style.display = "none";
      document.body.appendChild(_openFrame);
    }
    _openFrame.src = "totals-open://" + encodeURIComponent(url);
  } catch (e) {
    window.open(url, "_blank");
  }
}

function persistAccounts() {
  persistToScriptable("accounts", State.accounts);
}

function persistCategories() {
  persistToScriptable("categories", State.categories);
}

function persistRules() {
  persistToScriptable("rules", State.categoryRules);
}

function persistCustomCategories() {
  persistToScriptable("customCategories", State.customCategories);
}

function persistContacts() {
  persistToScriptable("contacts", State.contacts);
}

function persistAccountOverrides() {
  persistToScriptable("accountOverrides", State.accountOverrides);
}

function persistReasons() {
  persistToScriptable("reasons", State.reasons);
}

function persistProfiles() {
  persistToScriptable("profiles", State.profiles);
}

function persistFile(name, base64String) {
  try {
    var key = "file_" + name;
    if (!_persistFrames[key]) {
      _persistFrames[key] = document.createElement("iframe");
      _persistFrames[key].style.display = "none";
      document.body.appendChild(_persistFrames[key]);
    }
    _persistFrames[key].src =
      "totals-persist://file?name=" +
      encodeURIComponent(name) +
      "&d=" +
      encodeURIComponent(base64String);
  } catch (e) {
    // Not running inside Scriptable (browser dev mode)
  }
}

function requestRefresh() {
  try {
    if (!_persistFrames._refresh) {
      _persistFrames._refresh = document.createElement("iframe");
      _persistFrames._refresh.style.display = "none";
      document.body.appendChild(_persistFrames._refresh);
    }
    _persistFrames._refresh.src = "totals-refresh://tx";
  } catch (e) {}
}

function persistFailed() {
  persistToScriptable("failed", State.failedLogs);
}

function persistAppendTx(txObjOrArray) {
  var arr = Array.isArray(txObjOrArray) ? txObjOrArray : [txObjOrArray];
  persistToScriptable("appendTx", arr);
}

function persistSettings() {
  persistToScriptable("settings", State.settings);
}

function persistReceiverNames() {
  persistToScriptable("receiverNames", State.receiverNames);
}

function persistBudgets() {
  var data = [];
  for (var i = 0; i < State.budgetGroups.length; i++) {
    data.push(State.budgetGroups[i]);
  }
  for (var i = 0; i < State.budgets.length; i++) {
    data.push(State.budgets[i]);
  }
  persistToScriptable("budgets", data);
}

