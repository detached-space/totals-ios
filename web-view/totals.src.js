// ============================================================
// Totals — Scriptable Script
// ============================================================
// Setup:
//   1. Copy this file  →  iCloud Drive/Scriptable/Totals.js
//   2. Copy totals.html →  iCloud Drive/Scriptable/totals.html
//   3. Copy banks.json  →  iCloud Drive/Scriptable/banks.json
//   4. In your Shortcut, set "Save File" destination to:
//        iCloud Drive -> Scriptable -> transactions.txt
//      (one JSON object per line, appended per transaction)
// ============================================================

var SCRIPT_NAME = "totals"; // must match this file's name in Scriptable
var HTML_FILE = "totals.html";
var TX_FILE = "transactions.txt";
var BANKS_FILE = "banks.json";
var FAILED_FILE = "failed_parsings.txt";
var ACCOUNTS_FILE = "accounts.txt";
var CATEGORIES_FILE = "categories.txt";
var RULES_FILE = "category_rules.txt";
var CUSTOM_CATEGORIES_FILE = "custom_categories.txt";
var BUDGETS_FILE = "budgets.txt";
var CONTACTS_FILE = "contacts.txt";
var ACCOUNT_OVERRIDES_FILE = "account_overrides.txt";
var REASONS_FILE = "reasons.txt";
var RECEIVER_NAMES_FILE = "receiver_names.txt";
var PROFILES_FILE = "profiles.txt";
var SMS_PATTERNS_FILE = "sms_patterns.json";
var SETTINGS_FILE = "settings.json";

var fm = FileManager.iCloud();
var dir = fm.documentsDirectory();

function fullPath(name) {
  return fm.joinPath(dir, name);
}

function readSafe(filePath, fallback) {
  if (fallback === undefined) {
    fallback = "";
  }
  return fm.fileExists(filePath) ? fm.readString(filePath) : fallback;
}

function writeNDJSON(path, arr) {
  var lines = [];
  for (var i = 0; i < arr.length; i++) {
    lines.push(JSON.stringify(arr[i]));
  }
  fm.writeString(path, lines.length > 0 ? lines.join("\n") + "\n" : "");
}

// ============================================================
// WIDGET
// ============================================================
function parseAmountW(str) {
  if (str === null || str === undefined || str === "") return 0;
  if (typeof str === "number") return str;
  var cleaned = String(str).replace(/,/g, "").replace(/\.+$/, "");
  var num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseNDJSONW(raw) {
  if (!raw || raw.trim() === "") return [];
  var lines = raw.trim().split("\n");
  var results = [];
  for (var i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    try { results.push(JSON.parse(lines[i])); } catch (e) {}
  }
  return results;
}

function formatCurrencyW(amount) {
  var abs = Math.abs(amount);
  if (abs >= 1000000) return (abs / 1000000).toFixed(1) + "M";
  if (abs >= 1000) return (abs / 1000).toFixed(1) + "K";
  return abs.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

async function runWidget() {
  var txPath = fullPath(TX_FILE);
  var categoriesPath = fullPath(CATEGORIES_FILE);
  var rulesPath = fullPath(RULES_FILE);
  var customCatsPath = fullPath(CUSTOM_CATEGORIES_FILE);
  var settingsPath = fullPath(SETTINGS_FILE);
  var profilesPath = fullPath(PROFILES_FILE);
  var accountsPath = fullPath(ACCOUNTS_FILE);

  var wpaths = [txPath, categoriesPath, rulesPath, customCatsPath, settingsPath, profilesPath, accountsPath];
  for (var i = 0; i < wpaths.length; i++) {
    if (fm.fileExists(wpaths[i]) && !fm.isFileDownloaded(wpaths[i])) {
      await fm.downloadFileFromiCloud(wpaths[i]);
    }
  }

  var rawTx = parseNDJSONW(readSafe(txPath));
  var categories = parseNDJSONW(readSafe(categoriesPath));
  var rules = parseNDJSONW(readSafe(rulesPath));
  var customCats = parseNDJSONW(readSafe(customCatsPath));

  // Filter by widget profiles from settings
  var widgetSettings = {};
  try { widgetSettings = JSON.parse(readSafe(settingsPath, "{}")); } catch (e) {}
  var wpIds = widgetSettings.widgetProfiles || null;
  if (wpIds && wpIds.length > 0) {
    var profiles = parseNDJSONW(readSafe(profilesPath));
    var wAccounts = parseNDJSONW(readSafe(accountsPath));
    var banksPath = fullPath(BANKS_FILE);
    if (fm.fileExists(banksPath) && !fm.isFileDownloaded(banksPath)) await fm.downloadFileFromiCloud(banksPath);
    var banksData = {};
    try { banksData = JSON.parse(readSafe(banksPath, '{"banks":[]}')); } catch (e) {}
    var banksArr = banksData.banks || [];
    var banksMap = {};
    for (var bi = 0; bi < banksArr.length; bi++) banksMap[String(banksArr[bi].id)] = banksArr[bi];

    // Collect profile account numbers and build profile ID set
    var profileAcctNums = [];
    var pidSet = {};
    var foundAny = false;
    for (var pi = 0; pi < wpIds.length; pi++) {
      pidSet[wpIds[pi]] = true;
      for (var pj = 0; pj < profiles.length; pj++) {
        if (profiles[pj].id === wpIds[pi]) {
          foundAny = true;
          var pAccts = profiles[pj].accounts || [];
          for (var ai = 0; ai < pAccts.length; ai++) profileAcctNums.push(pAccts[ai]);
          break;
        }
      }
    }

    if (foundAny) {
      // Resolve which account each tx belongs to (same logic as app)
      rawTx = rawTx.filter(function (tx) {
        if (tx.profileId && pidSet[tx.profileId]) return true;
        var bankId = String(tx.bankId);
        var bank = banksMap[bankId];
        if (!bank) return false;
        var bankAccts = wAccounts.filter(function (a) { return String(a.bankId) === bankId; });
        if (bankAccts.length === 0) return false;

        var resolved = null;
        if (!bank.uniformMasking || bank.simBased) {
          // SIM-based / non-uniform: use default or first account for that bank
          var def = bankAccts.find(function (a) { return a.isDefault; });
          resolved = def || bankAccts[0];
        } else {
          // Uniform masking: match by last N digits
          var digits = (bank.maskPattern || 3) + 1;
          var txNum = (tx.account || "").replace(/\D/g, "");
          var txSuffix = txNum.slice(-digits);
          if (txSuffix) {
            for (var k = 0; k < bankAccts.length; k++) {
              var accNum = (bankAccts[k].number || "").replace(/\D/g, "");
              if (accNum.slice(-digits) === txSuffix) { resolved = bankAccts[k]; break; }
            }
          }
        }
        if (resolved && profileAcctNums.indexOf(resolved.number) !== -1) return true;
        return false;
      });
    }
  }

  // Category colors
  var catColors = {
    Food: "#f97316", Transport: "#3b82f6", Utilities: "#a855f7",
    Shopping: "#ec4899", Entertainment: "#eab308", Health: "#ef4444",
    Education: "#06b6d4", Salary: "#22c55e", Self: "#6366f1", Other: "#71717a"
  };
  for (var ci = 0; ci < customCats.length; ci++) {
    if (customCats[ci].name && customCats[ci].color) catColors[customCats[ci].name] = customCats[ci].color;
  }

  // Build category map: apply rules first, then manual overrides
  var categoryMap = {};
  for (var ri = 0; ri < rules.length; ri++) {
    var rule = rules[ri];
    if (!rule.receiver || !rule.category) continue;
    var rLower = rule.receiver.toLowerCase();
    for (var ti = 0; ti < rawTx.length; ti++) {
      var r = rawTx[ti].receiver || "";
      var ref = rawTx[ti].reference || "";
      if (r.toLowerCase() === rLower) {
        if (!categoryMap[ref]) categoryMap[ref] = [];
        if (categoryMap[ref].indexOf(rule.category) === -1) categoryMap[ref].push(rule.category);
      }
    }
  }
  for (var i = 0; i < categories.length; i++) {
    var c = categories[i];
    if (c.txId && c.categories) categoryMap[c.txId] = c.categories.slice();
  }

  // Process transactions
  var txs = [];
  for (var i = 0; i < rawTx.length; i++) {
    var raw = rawTx[i];
    var amount = parseAmountW(raw.amount);
    var receiver = raw.receiver || "Unknown";
    var isExpense = raw.type
      ? raw.type === "DEBIT"
      : receiver && receiver.trim() !== "" && receiver !== "Unknown";
    var cats = categoryMap[raw.reference] || [];
    var isSelf = cats.indexOf("Self") !== -1;
    txs.push({
      amount: amount,
      isExpense: isExpense,
      isSelf: isSelf,
      timestamp: raw.timestamp ? new Date(raw.timestamp) : null,
      cats: cats,
    });
  }

  // This week
  var now = new Date();
  var weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  var weekIncome = 0;
  var weekExpense = 0;
  for (var i = 0; i < txs.length; i++) {
    var tx = txs[i];
    if (!tx.timestamp || tx.timestamp < weekAgo || tx.isSelf) continue;
    if (tx.isExpense) weekExpense += tx.amount;
    else weekIncome += tx.amount;
  }

  // Today
  var todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  var todayExpense = 0;
  var todayCatTotals = {};
  for (var i = 0; i < txs.length; i++) {
    var tx = txs[i];
    if (!tx.timestamp || tx.isSelf) continue;
    var txDay = new Date(tx.timestamp);
    txDay.setHours(0, 0, 0, 0);
    if (txDay.getTime() !== todayStart.getTime()) continue;
    if (tx.isExpense) {
      todayExpense += tx.amount;
      var cat = (tx.cats && tx.cats.length > 0) ? tx.cats[0] : "Other";
      todayCatTotals[cat] = (todayCatTotals[cat] || 0) + tx.amount;
    }
  }

  // Sort categories by amount descending
  var catEntries = [];
  for (var cat in todayCatTotals) {
    catEntries.push({ name: cat, amount: todayCatTotals[cat], color: catColors[cat] || "#71717a" });
  }
  catEntries.sort(function (a, b) { return b.amount - a.amount; });

  // Build widget
  var w = new ListWidget();
  w.backgroundColor = new Color("#1c1c1e");
  w.setPadding(14, 14, 14, 14);
  w.url = "scriptable:///run/" + encodeURIComponent(SCRIPT_NAME);

  // Today's spending (hero)
  var todayLabel = w.addText("TODAY'S SPENDING");
  todayLabel.font = Font.semiboldSystemFont(9);
  todayLabel.textColor = new Color("#8e8e93");
  w.addSpacer(2);

  var todayAmount = w.addText(formatCurrencyW(todayExpense));
  todayAmount.font = Font.boldSystemFont(22);
  todayAmount.textColor = Color.white();
  todayAmount.minimumScaleFactor = 0.7;
  w.addSpacer(6);

  // Category bar
  if (todayExpense > 0 && catEntries.length > 0) {
    var barStack = w.addStack();
    barStack.layoutHorizontally();
    barStack.cornerRadius = 4;
    barStack.size = new Size(0, 6);
    for (var bi = 0; bi < catEntries.length; bi++) {
      var seg = barStack.addStack();
      seg.backgroundColor = new Color(catEntries[bi].color);
      seg.size = new Size(Math.max(2, Math.round((catEntries[bi].amount / todayExpense) * 140)), 6);
    }
    w.addSpacer(8);
  } else {
    w.addSpacer(4);
  }

  // This week summary
  var weekLabel = w.addText("THIS WEEK");
  weekLabel.font = Font.semiboldSystemFont(9);
  weekLabel.textColor = new Color("#8e8e93");
  w.addSpacer(4);

  var incStack = w.addStack();
  incStack.centerAlignContent();
  var incDot = incStack.addText("\u25CF ");
  incDot.font = Font.systemFont(8);
  incDot.textColor = new Color("#34c759");
  var incText = incStack.addText("+" + formatCurrencyW(weekIncome));
  incText.font = Font.semiboldSystemFont(13);
  incText.textColor = new Color("#34c759");
  w.addSpacer(2);

  var expStack = w.addStack();
  expStack.centerAlignContent();
  var expDot = expStack.addText("\u25CF ");
  expDot.font = Font.systemFont(8);
  expDot.textColor = new Color("#f87171");
  var expText = expStack.addText("-" + formatCurrencyW(weekExpense));
  expText.font = Font.semiboldSystemFont(13);
  expText.textColor = new Color("#f87171");

  // Request refresh every 15 minutes
  var nextRefresh = new Date(Date.now() + 5 * 60 * 1000);
  w.refreshAfterDate = nextRefresh;

  Script.setWidget(w);
  if (!config.runsInWidget) await w.presentSmall();
  Script.complete();
}

// ============================================================
// MAIN APP
// ============================================================
async function main() {
  var htmlPath = fullPath(HTML_FILE);
  var txPath = fullPath(TX_FILE);
  var banksPath = fullPath(BANKS_FILE);
  var failedPath = fullPath(FAILED_FILE);
  var accountsPath = fullPath(ACCOUNTS_FILE);
  var categoriesPath = fullPath(CATEGORIES_FILE);
  var rulesPath = fullPath(RULES_FILE);
  var customCatsPath = fullPath(CUSTOM_CATEGORIES_FILE);
  var budgetsPath = fullPath(BUDGETS_FILE);
  var contactsPath = fullPath(CONTACTS_FILE);
  var accountOverridesPath = fullPath(ACCOUNT_OVERRIDES_FILE);
  var reasonsPath = fullPath(REASONS_FILE);
  var receiverNamesPath = fullPath(RECEIVER_NAMES_FILE);
  var profilesPath = fullPath(PROFILES_FILE);
  var smsPatternsPath = fullPath(SMS_PATTERNS_FILE);
  var settingsPath = fullPath(SETTINGS_FILE);

  // Download from iCloud if not yet cached locally
  var paths = [
    htmlPath,
    txPath,
    banksPath,
    failedPath,
    accountsPath,
    categoriesPath,
    rulesPath,
    customCatsPath,
    budgetsPath,
    contactsPath,
    accountOverridesPath,
    reasonsPath,
    receiverNamesPath,
    profilesPath,
    smsPatternsPath,
    settingsPath,
  ];
  for (var i = 0; i < paths.length; i++) {
    if (fm.fileExists(paths[i]) && !fm.isFileDownloaded(paths[i])) {
      await fm.downloadFileFromiCloud(paths[i]);
    }
  }

  // Guard: HTML must exist
  if (!fm.fileExists(htmlPath)) {
    var a = new Alert();
    a.title = "Missing file";
    a.message =
      HTML_FILE +
      " not found in iCloud Drive/Scriptable/\n\nFiles found:\n" +
      fm.listContents(dir).join("\n");
    a.addCancelAction("OK");
    await a.presentAlert();
    return;
  }

  // Create any missing data files so the app works on first launch
  var dataFiles = [txPath, failedPath, accountsPath, categoriesPath, rulesPath, customCatsPath, budgetsPath, contactsPath, accountOverridesPath, reasonsPath, profilesPath];
  for (var i = 0; i < dataFiles.length; i++) {
    if (!fm.fileExists(dataFiles[i])) {
      fm.writeString(dataFiles[i], "");
    }
  }

  var html = readSafe(htmlPath);
  var txRaw = readSafe(txPath);
  var banksRaw = readSafe(banksPath, '{"banks":[]}');
  var settingsObj = {};
  try { settingsObj = JSON.parse(settingsRaw); } catch (e) {}
  var onboardingNeeded = !settingsObj.onboarding || !settingsObj.onboarding.done;
  var failedRaw = readSafe(failedPath);
  var accountsRaw = readSafe(accountsPath);
  var categoriesRaw = readSafe(categoriesPath);
  var rulesRaw = readSafe(rulesPath);
  var customCatsRaw = readSafe(customCatsPath);
  var budgetsRaw = readSafe(budgetsPath);
  var contactsRaw = readSafe(contactsPath);
  var accountOverridesRaw = readSafe(accountOverridesPath);
  var reasonsRaw = readSafe(reasonsPath);
  var receiverNamesRaw = readSafe(receiverNamesPath);
  var profilesRaw = readSafe(profilesPath);
  var smsPatternsRaw = readSafe(smsPatternsPath, '{"patterns":[]}');
  var settingsRaw = readSafe(settingsPath, "{}");

  // ---- Upgrade shortcuts:// to x-callback-url ----
  var returnURL = encodeURIComponent(
    "scriptable:///run?scriptName=" + encodeURIComponent(SCRIPT_NAME),
  );
  html = html
    .split("shortcuts://run-shortcut?")
    .join(
      "shortcuts://x-callback-url/run-shortcut?x-success=" + returnURL + "&",
    );

  // ---- Embed data as <script type="application/json"> tags ----
  // Escape </ in data to prevent closing <script> tags; \/ is valid JSON for /.
  var safeTx = txRaw.split("</").join("<\\/");
  var safeBanks = banksRaw.split("</").join("<\\/");
  var safeFailed = failedRaw.split("</").join("<\\/");
  var safeAccounts = accountsRaw.split("</").join("<\\/");
  var safeCategories = categoriesRaw.split("</").join("<\\/");
  var safeRules = rulesRaw.split("</").join("<\\/");
  var safeCustomCats = customCatsRaw.split("</").join("<\\/");
  var safeBudgets = budgetsRaw.split("</").join("<\\/");
  var safeContacts = contactsRaw.split("</").join("<\\/");
  var safeAccountOverrides = accountOverridesRaw.split("</").join("<\\/");
  var safeReasons = reasonsRaw.split("</").join("<\\/");
  var safeReceiverNames = receiverNamesRaw.split("</").join("<\\/");
  var safeProfiles = profilesRaw.split("</").join("<\\/");
  var safeSmsPatterns = smsPatternsRaw.split("</").join("<\\/");
  var safeSettings = settingsRaw.split("</").join("<\\/");

  // Inject data tags right after <body> so they're in the DOM
  // when the HTML's own <script> block runs initializeData()
  var dataBlock =
    '<script type="application/json" id="_donboarding">' + (onboardingNeeded ? 'true' : 'false') + '</script>' +
    '<script type="application/json" id="_dtx">' +
    safeTx +
    "</script>" +
    '<script type="application/json" id="_dbanks">' +
    safeBanks +
    "</script>" +
    '<script type="application/json" id="_dfailed">' +
    safeFailed +
    "</script>" +
    '<script type="application/json" id="_daccounts">' +
    safeAccounts +
    "</script>" +
    '<script type="application/json" id="_dcategories">' +
    safeCategories +
    "</script>" +
    '<script type="application/json" id="_drules">' +
    safeRules +
    "</script>" +
    '<script type="application/json" id="_dcustomcats">' +
    safeCustomCats +
    "</script>" +
    '<script type="application/json" id="_dbudgets">' +
    safeBudgets +
    "</script>" +
    '<script type="application/json" id="_dcontacts">' +
    safeContacts +
    "</script>" +
    '<script type="application/json" id="_daccountoverrides">' +
    safeAccountOverrides +
    "</script>" +
    '<script type="application/json" id="_dreasons">' +
    safeReasons +
    "</script>" +
    '<script type="application/json" id="_dreceivernames">' +
    safeReceiverNames +
    "</script>" +
    '<script type="application/json" id="_dprofiles">' +
    safeProfiles +
    "</script>" +
    '<script type="application/json" id="_dsmspatterns">' +
    safeSmsPatterns +
    "</script>" +
    '<script type="application/json" id="_dsettings">' +
    safeSettings +
    "</script>";

  html = html.replace("<body>", "<body>" + dataBlock);

  // ---- Show WebView with real-time persistence ----
  var wv = new WebView();
  await wv.loadHTML(html);

  // Intercept persist:// navigations from the WebView to write files in real time.
  // The HTML triggers these via a hidden iframe (see persistToScriptable in totals.html).
  var REFRESH_SCHEME = "totals-refresh://";
  var PERSIST_SCHEME = "totals-persist://";
  var OPEN_SCHEME = "totals-open://";
  wv.shouldAllowRequest = function (req) {
    var url = req.url;
    if (url.indexOf(OPEN_SCHEME) === 0) {
      var extURL = decodeURIComponent(url.substring(OPEN_SCHEME.length));
      Safari.open(extURL);
      return false;
    }
    if (url.indexOf(REFRESH_SCHEME) === 0) {
      var freshTx = readSafe(txPath);
      wv.evaluateJavaScript("handleRefresh(" + JSON.stringify(freshTx) + ")");
      return false;
    }
    if (url.indexOf(PERSIST_SCHEME) !== 0) return true;
    var rest = url.substring(PERSIST_SCHEME.length);
    var qIndex = rest.indexOf("?");
    if (qIndex < 0) return false;
    var type = rest.substring(0, qIndex);
    var query = rest.substring(qIndex + 1);
    try {
      if (type === "file") {
        // File: totals-persist://file?name=<filename>&d=<base64>
        var nameMatch = query.match(/(?:^|&)name=([^&]*)/);
        var dataMatch = query.match(/(?:^|&)d=([^&]*)/);
        if (nameMatch && dataMatch) {
          var fileName = decodeURIComponent(nameMatch[1]);
          var filePath = fullPath(fileName);
          var fileData = Data.fromBase64String(decodeURIComponent(dataMatch[1]));
          if (fm.fileExists(filePath)) { fm.remove(filePath); }
          fm.write(filePath, fileData);
        }
      } else {
        // NDJSON types: totals-persist://type?d=JSON
        var dPrefix = "d=";
        var encoded = query.substring(query.indexOf(dPrefix) + dPrefix.length);
        var data = JSON.parse(decodeURIComponent(encoded));
        if (type === "accounts") {
          writeNDJSON(accountsPath, data);
        } else if (type === "categories") {
          writeNDJSON(categoriesPath, data);
        } else if (type === "rules") {
          writeNDJSON(rulesPath, data);
        } else if (type === "customCategories") {
          writeNDJSON(customCatsPath, data);
        } else if (type === "budgets") {
          writeNDJSON(budgetsPath, data);
        } else if (type === "contacts") {
          writeNDJSON(contactsPath, data);
        } else if (type === "accountOverrides") {
          writeNDJSON(accountOverridesPath, data);
        } else if (type === "reasons") {
          writeNDJSON(reasonsPath, data);
        } else if (type === "receiverNames") {
          writeNDJSON(receiverNamesPath, data);
        } else if (type === "profiles") {
          writeNDJSON(profilesPath, data);
        } else if (type === "failed") {
          writeNDJSON(failedPath, data);
        } else if (type === "settings") {
          fm.writeString(settingsPath, JSON.stringify(data));
        } else if (type === "appendTx") {
          // Append new transaction lines to transactions.txt
          var lines = "";
          for (var ai = 0; ai < data.length; ai++) {
            lines += JSON.stringify(data[ai]) + "\n";
          }
          var existing = readSafe(txPath);
          // Ensure trailing newline so new lines don't concatenate with last existing line
          if (existing && existing.length > 0 && existing[existing.length - 1] !== "\n") {
            existing += "\n";
          }
          fm.writeString(txPath, existing + lines);
        } else if (type === "exportFile") {
          fm.writeString(fullPath(data.name), data.content);
        }
      }
    } catch (e) {}
    return false;
  };

  await wv.present(true);
}

if (config.runsInWidget) {
  runWidget();
} else {
  main();
}
