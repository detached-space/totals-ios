// ============================================
// NAVIGATION
// ============================================
var screenOrder = ["home", "money", "budget", "tools", "profile"];

function navigateTo(screen, opts) {
  opts = opts || {};

  // Reset accounts page when navigating away from money screen
  if (State.currentScreen === "money" && screen !== "money") {
    State.selectedBank = null;
    DOM.$("#bank-detail").classList.add("hidden");
    DOM.$("#bank-overview").classList.remove("hidden");
  }

  State.currentScreen = screen;

  // Position wrapper
  var idx = screenOrder.indexOf(screen);
  var wrapper = DOM.$("#screens-wrapper");
  if (wrapper) {
    if (opts.skipAnimation) {
      wrapper.style.transition = "none";
      wrapper.style.transform = "translateX(" + (-idx * 100) + "%)";
      wrapper.offsetHeight; // force reflow
      wrapper.style.transition = "";
    } else if (!opts.skipPosition) {
      wrapper.style.transition = "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
      wrapper.style.transform = "translateX(" + (-idx * 100) + "%)";
    }
  }

  // Update nav
  DOM.$$(".nav-item").forEach((n) => n.classList.remove("active"));
  DOM.$(`.nav-item[data-screen="${screen}"]`).classList.add("active");

  // Hide FAB by default — individual screens re-show it when needed
  var fab = DOM.$("#fab-add-account");
  if (fab) fab.classList.add("hidden");

  // Update content based on screen
  if (screen === "home") {
    updateDashboard();
  } else if (screen === "money") {
    updateActivityTab();
    updateTransactionsList();
    updateLedger();
    updateAccountsTab();
    setTimeout(drawAllCharts, 100);
  } else if (screen === "budget") {
    updateBudgetScreen();
  } else if (screen === "tools") {
    updateToolsScreen();
  } else if (screen === "profile") {
    updateProfileScreen();
    // Sync dark mode toggle
    var dmToggle = DOM.$("#you-darkmode-toggle");
    if (dmToggle) dmToggle.checked = State.theme === "dark";
  }

  // Hide FAB when leaving tools-contacts
  if (screen !== "tools") {
    State.currentTool = null;
  }
}

// ============================================
// SCREEN SWIPE GESTURES
// ============================================
// Interpolate between two hex colors
function lerpColor(a, b, t) {
  var ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
  var br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
  var r = Math.round(ar + (br - ar) * t), g = Math.round(ag + (bg - ag) * t), bl = Math.round(ab + (bb - ab) * t);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}

var _navMutedColor = null, _navActiveColor = null;
function getNavColors() {
  if (!_navMutedColor) {
    var s = getComputedStyle(document.documentElement);
    _navMutedColor = s.getPropertyValue("--text-muted").trim() || "#71717a";
    _navActiveColor = s.getPropertyValue("--primary-purple-light").trim() || "#a78bfa";
  }
  return { muted: _navMutedColor, active: _navActiveColor };
}

// Cache nav elements once for perf
var _navCache = null;
function getNavCache() {
  if (!_navCache) {
    var items = DOM.$$(".nav-item");
    _navCache = [];
    for (var i = 0; i < items.length; i++) {
      _navCache.push({
        el: items[i],
        light: items[i].querySelector(".ico-light"),
        fill: items[i].querySelector(".ico-fill"),
      });
    }
  }
  return _navCache;
}

function updateNavSwipeProgress(fractionalIdx) {
  var colors = getNavColors();
  var nav = getNavCache();
  for (var i = 0; i < nav.length; i++) {
    var active = Math.max(0, 1 - Math.abs(fractionalIdx - i));
    nav[i].light.style.opacity = 1 - active;
    nav[i].fill.style.opacity = active;
    nav[i].el.style.color = lerpColor(colors.muted, colors.active, active);
  }
}

function resetNavSwipeProgress() {
  var nav = getNavCache();
  for (var i = 0; i < nav.length; i++) {
    nav[i].light.style.opacity = "";
    nav[i].fill.style.opacity = "";
    nav[i].el.style.color = "";
  }
}

function initScreenSwipe() {
  var wrapper = DOM.$("#screens-wrapper");
  if (!wrapper) return;

  var startX = 0, startY = 0, currentX = 0, lastX = 0, lastTime = 0;
  var isDragging = false;
  var isHorizontal = null;
  var currentIdx = 0;
  var wrapperWidth = 0;
  var pendingOffset = null;
  var rafId = 0;

  function applyFrame() {
    rafId = 0;
    if (pendingOffset === null) return;
    wrapper.style.transform = "translateX(" + pendingOffset + "px)";
    var frac = Math.max(0, Math.min(screenOrder.length - 1, -pendingOffset / wrapperWidth));
    updateNavSwipeProgress(frac);
    pendingOffset = null;
  }

  wrapper.addEventListener("touchstart", function(e) {
    if (e.target.closest(".modal-overlay.active")) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    currentX = startX;
    lastX = startX;
    lastTime = Date.now();
    isDragging = false;
    isHorizontal = null;
    currentIdx = screenOrder.indexOf(State.currentScreen);
    wrapperWidth = wrapper.offsetWidth;
  }, { passive: true });

  wrapper.addEventListener("touchmove", function(e) {
    if (isHorizontal === false) return;

    var x = e.touches[0].clientX;
    var y = e.touches[0].clientY;
    lastX = currentX;
    lastTime = Date.now();
    currentX = x;
    var dx = x - startX;
    var dy = y - startY;

    if (isHorizontal === null) {
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isHorizontal = Math.abs(dx) >= Math.abs(dy);
        if (!isHorizontal) return;
        isDragging = true;
        wrapper.style.transition = "none";
      }
      return;
    }

    if (!isDragging) return;

    var baseOffset = -currentIdx * wrapperWidth;
    var offset = baseOffset + dx;
    var maxOffset = 0;
    var minOffset = -(screenOrder.length - 1) * wrapperWidth;

    if (offset > maxOffset) {
      offset = maxOffset + (offset - maxOffset) * 0.15;
    } else if (offset < minOffset) {
      offset = minOffset + (offset - minOffset) * 0.15;
    }

    // Batch into rAF — one DOM write per frame
    pendingOffset = offset;
    if (!rafId) rafId = requestAnimationFrame(applyFrame);
  }, { passive: true });

  wrapper.addEventListener("touchend", function(e) {
    if (!isDragging) return;
    isDragging = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }

    var dx = currentX - startX;
    var dt = Math.max(Date.now() - lastTime, 1);
    var velocity = (currentX - lastX) / dt;

    var isFlick = Math.abs(velocity) > 0.12 && Math.abs(dx) > 12;

    var targetIdx = currentIdx;
    if ((isFlick && velocity < 0) || dx < -(wrapperWidth * 0.06)) {
      if (currentIdx < screenOrder.length - 1) targetIdx = currentIdx + 1;
    } else if ((isFlick && velocity > 0) || dx > wrapperWidth * 0.06) {
      if (currentIdx > 0) targetIdx = currentIdx - 1;
    }

    // Update nav .active class IMMEDIATELY so there's no flash
    if (targetIdx !== currentIdx) {
      DOM.$$(".nav-item").forEach(function(n) { n.classList.remove("active"); });
      DOM.$('.nav-item[data-screen="' + screenOrder[targetIdx] + '"]').classList.add("active");
    }

    // Now safe to clear inline styles — CSS .active is already on the right tab
    resetNavSwipeProgress();

    var duration = isFlick ? 0.15 : 0.22;
    wrapper.style.transition = "transform " + duration + "s cubic-bezier(0.25, 0.1, 0.25, 1)";
    wrapper.style.transform = "translateX(" + (-targetIdx * 100) + "%)";

    if (targetIdx !== currentIdx) {
      setTimeout(function() {
        navigateTo(screenOrder[targetIdx], { skipPosition: true });
      }, duration * 1000 + 10);
    }
  }, { passive: true });
}

function switchTab(tab) {
  State.currentTab = tab;

  DOM.$$("#screen-money > .tab-nav-underline .tab-btn-underline").forEach(
    (b) => {
      b.classList.toggle("active", b.dataset.tab === tab);
    },
  );

  DOM.$("#tab-activity").classList.toggle("hidden", tab !== "activity");
  DOM.$("#tab-accounts").classList.toggle("hidden", tab !== "accounts");

  // Reset accounts view and hide FAB when switching away from accounts
  if (tab !== "accounts") {
    if (State.selectedBank) {
      State.selectedBank = null;
      DOM.$("#bank-detail").classList.add("hidden");
      DOM.$("#bank-overview").classList.remove("hidden");
    }
    var fab = DOM.$("#fab-add-account");
    if (fab) fab.classList.add("hidden");
  }

  if (tab === "accounts") {
    updateAccountsTab();
  } else {
    updateActivityTab();
    updateTransactionsList();
  }
}

function switchSubtab(subtab) {
  State.currentSubtab = subtab;

  DOM.$$("#tab-activity .tab-nav .tab-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.subtab === subtab);
  });

  DOM.$("#subtab-transactions").classList.toggle(
    "hidden",
    subtab !== "transactions",
  );
  DOM.$("#subtab-analytics").classList.toggle(
    "hidden",
    subtab !== "analytics",
  );
  DOM.$("#subtab-ledger").classList.toggle("hidden", subtab !== "ledger");

  if (subtab === "transactions") {
    updateTransactionsList();
  } else if (subtab === "analytics") {
    updateActivityTab();
    setTimeout(drawAllCharts, 100);
  } else if (subtab === "ledger") {
    updateLedger();
  }
}

function selectBank(bankId) {
  if (State.selectedBank === bankId) {
    State.selectedBank = null;
  } else {
    State.selectedBank = bankId;
  }
  updateAccountsTab();
  updateBankDetail();
}

function openTool(tool) {
  State.currentTool = tool;
  updateToolsScreen();
  // Focus search synchronously within the tap gesture so iOS opens the keyboard
  // Must come AFTER updateToolsScreen() so the input is visible
}

function closeTool() {
  State.currentTool = null;
  State.contactSearch = "";
  var searchInput = DOM.$("#contacts-search-input");
  if (searchInput) searchInput.value = "";
  var smsText = DOM.$("#sms-parser-text");
  if (smsText) smsText.value = "";
  var smsResult = DOM.$("#sms-parser-result");
  if (smsResult) { smsResult.innerHTML = ""; smsResult.className = "hidden"; }
  updateToolsScreen();
}

// ============================================
// PROFILE SWITCHER
// ============================================
function switchProfile(profileId) {
  State.activeProfileId = profileId || null;
  State.ledgerGrouped = false;
  State.ledgerAccounts = [];

  // Persist selection
  try {
    if (profileId) {
      localStorage.setItem("totals-active-profile", profileId);
    } else {
      localStorage.removeItem("totals-active-profile");
    }
  } catch (e) {}

  // Update avatar in nav
  updateProfileAvatar();

  // Refresh all screens
  updateDashboard();
  if (State.currentScreen === "money") {
    updateActivityTab();
    updateTransactionsList();
    updateLedger();
    updateAccountsTab();
    setTimeout(drawAllCharts, 100);
  }
  if (State.currentScreen === "budget") {
    updateBudgetScreen();
  }
  if (State.currentScreen === "profile") {
    updateProfileScreen();
  }
}

function updateProfileAvatar() {
  // Show a dot indicator on the You nav button when a profile is active
  var dot = DOM.$("#nav-profile-dot");
  if (dot) {
    dot.classList.toggle("hidden", !State.activeProfileId);
  }

  // Update the profile card on the You screen
  var avatarEl = DOM.$("#you-profile-avatar");
  var nameEl = DOM.$("#you-profile-name");
  if (!avatarEl || !nameEl) return;

  if (State.activeProfileId) {
    var profile = State.profiles.find(function(p) { return p.id === State.activeProfileId; });
    if (profile) {
      avatarEl.textContent = (profile.name || "?").charAt(0).toUpperCase();
      avatarEl.style.background = getProfileColor(profile);
      nameEl.textContent = profile.name;
    }
  } else {
    avatarEl.textContent = "A";
    avatarEl.style.background = "#6b7280";
    nameEl.textContent = "All Accounts";
  }
}

function toggleProfileDropdown() {
  var dropdown = DOM.$("#profile-dropdown");
  if (!dropdown) return;

  if (dropdown.classList.contains("hidden")) {
    // Populate dropdown
    var inner = '';
    inner += '<div class="profile-dropdown-item' + (!State.activeProfileId ? ' active' : '') + '" data-profile="">' +
      '<span class="profile-dropdown-avatar" style="background:#6b7280">A</span>' +
      '<span>All</span>' +
    '</div>';
    for (var i = 0; i < State.profiles.length; i++) {
      var p = State.profiles[i];
      var isActive = p.id === State.activeProfileId;
      var initial = (p.name || "?").charAt(0).toUpperCase();
      var color = getProfileColor(p);
      inner += '<div class="profile-dropdown-item' + (isActive ? ' active' : '') + '" data-profile="' + p.id + '">' +
        '<span class="profile-dropdown-avatar" style="background:' + color + '">' + initial + '</span>' +
        '<span>' + (p.name || "Unnamed") + '</span>' +
      '</div>';
    }
    dropdown.innerHTML = inner;

    // Attach handlers
    var items = dropdown.querySelectorAll(".profile-dropdown-item");
    for (var j = 0; j < items.length; j++) {
      (function(item) {
        item.addEventListener("click", function(e) {
          e.stopPropagation();
          switchProfile(item.dataset.profile || null);
          dropdown.classList.add("hidden");
        });
      })(items[j]);
    }

    dropdown.classList.remove("hidden");
  } else {
    dropdown.classList.add("hidden");
  }
}

// ============================================
// THEME
// ============================================
function toggleTheme() {
  _navMutedColor = null; _navActiveColor = null; // invalidate cached nav colors
  const themes = [null, "dark", "light"];
  const currentIndex = themes.indexOf(State.theme);
  State.theme = themes[(currentIndex + 1) % themes.length];

  if (State.theme) {
    document.documentElement.setAttribute("data-theme", State.theme);
    try {
      localStorage.setItem("theme", State.theme);
    } catch (e) {}
  } else {
    document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.removeItem("theme");
    } catch (e) {}
  }
  State.settings.theme = State.theme;
  persistSettings();

  // Redraw chart with new theme colors
  if (State.currentSubtab === "analytics") {
    setTimeout(drawAllCharts, 50);
  }
}

function initTheme() {
  // Prefer persisted theme from widget settings (survives Scriptable relaunch),
  // fall back to localStorage, then default to light
  var saved = State.settings.theme || null;
  if (!saved) {
    try { saved = localStorage.getItem("theme"); } catch (e) {}
  }
  State.theme = saved || "light";
  document.documentElement.setAttribute("data-theme", State.theme);
}

