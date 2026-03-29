<div
  id="_loader"
  style="
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-dark);
  "
>
  <div class="loading">
    <div class="loading-spinner"></div>
    <div>Loading…</div>
  </div>
</div>

<!-- Onboarding Overlay -->
<div id="onboarding" class="onboarding-overlay" style="display:none">

  <!-- Step 0: Welcome -->
  <div class="onboarding-step" data-step="0">
    <div class="onboarding-logo-glow"></div>
    <div class="onboarding-icon">
      <svg id="onboarding-logo" class="onboarding-logo" viewBox="0 0 400 400" width="100" height="100">
        <defs><linearGradient id="ob-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0" stop-color="#284DC1"/><stop offset="1" stop-color="#172A69"/></linearGradient></defs>
        <rect width="400" height="400" rx="80" fill="url(#ob-logo-grad)"/>
        <g transform="translate(90, 55)">
          <path fill="#fff" d="M202,124.2H17.5c-3.6,0-6.7,2.6-7.4,6.1l-10,54.4c-0.7,4.1,1.9,8,6,8.7c0.4,0.1,0.9,0.1,1.4,0.1c10.4,0,19.2-2.6,26.6-7.9c7.2-5,12.3-12.5,14.4-21h34.6V282c0,4.1,3.4,7.5,7.5,7.5h38.1c4.1,0,7.5-3.4,7.5-7.5V164.7H171c2.2,8.5,7.3,16,14.4,21.2c7.1,5.2,15.9,7.8,26.4,7.8h0.2c4.1,0,7.5-3.4,7.5-7.5c0-0.5,0-0.9-0.1-1.4l-10-54.4C208.7,126.8,205.6,124.3,202,124.2"/>
          <path fill="#fff" d="M110.3,0c27.1,0,49,21.9,49,49s-21.9,49-49,49s-49-21.9-49-49S83.2,0,110.3,0"/>
        </g>
      </svg>
    </div>
    <h1 class="onboarding-title">Welcome to Totals</h1>
    <p class="onboarding-desc">Your personal finance tracker. Track transactions, manage accounts, and budget smarter.</p>
    <button class="onboarding-welcome-btn" id="onboarding-get-started">
      <span>Get Started</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </button>
  </div>

  <!-- Step 1: Checklist -->
  <div class="onboarding-step onboarding-step-scrollable" data-step="1">
    <div class="onboarding-setup-scroll">
      <h1 class="onboarding-title" style="margin-bottom: 4px">Setup</h1>
      <p class="onboarding-desc" style="margin-bottom: 20px">Complete each step to get Totals running.</p>

      <a class="onboarding-video-banner" href="https://youtu.be/ZKHeKu32o7w" id="onboarding-video-link">
        <div class="onboarding-video-play">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><polygon points="9.5 7.5 16.5 12 9.5 16.5"/></svg>
        </div>
        <div class="onboarding-video-text">
          <span class="onboarding-video-title">Watch the setup guide</span>
          <span class="onboarding-video-sub">2 min video walkthrough</span>
        </div>
        <svg class="onboarding-video-ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>

      <div class="onboarding-checklist" id="onboarding-checklist">
        <!-- Task 1: Download -->
        <div class="onboarding-task" id="ob-task-download" data-task="download">
          <div class="onboarding-task-header">
            <div class="onboarding-task-check" id="ob-check-download">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <div class="onboarding-task-info">
              <div class="onboarding-task-title">Download Assets</div>
              <div class="onboarding-task-desc">Required files for the app</div>
            </div>
            <svg class="onboarding-task-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="onboarding-task-body" id="ob-body-download">
            <div id="onboarding-download-files" class="onboarding-download-files">
              <div class="onboarding-download-row" data-file="banks.json">
                <span class="onboarding-download-name">banks.json</span>
                <span class="onboarding-download-status" id="dl-status-banks">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10" opacity="0.3"/></svg>
                </span>
              </div>
              <div class="onboarding-download-row" data-file="sms_patterns.json">
                <span class="onboarding-download-name">sms_patterns.json</span>
                <span class="onboarding-download-status" id="dl-status-sms">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10" opacity="0.3"/></svg>
                </span>
              </div>
              <div class="onboarding-download-row" data-file="totals-logo.png">
                <span class="onboarding-download-name">totals-logo.png</span>
                <span class="onboarding-download-status" id="dl-status-logo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10" opacity="0.3"/></svg>
                </span>
              </div>
            </div>
            <button class="onboarding-action-btn" id="onboarding-download-btn">Download</button>
          </div>
        </div>

        <!-- Task 2: Install Shortcut -->
        <div class="onboarding-task locked" id="ob-task-shortcut" data-task="shortcut">
          <div class="onboarding-task-header">
            <div class="onboarding-task-check" id="ob-check-shortcut">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <div class="onboarding-task-info">
              <div class="onboarding-task-title">Install SMS Shortcut</div>
              <div class="onboarding-task-desc">Parses bank SMS messages</div>
            </div>
            <svg class="onboarding-task-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="onboarding-task-body" id="ob-body-shortcut">
            <ol class="onboarding-substeps">
              <li>Tap <strong>Install</strong> below</li>
              <li>You'll be taken to iCloud</li>
              <li>Tap <strong>Add Shortcut</strong></li>
              <li>Come back here and check this off</li>
            </ol>
            <button class="onboarding-action-btn" id="onboarding-install-shortcut">Install</button>
            <button class="onboarding-action-btn onboarding-done-btn" id="ob-done-shortcut">Done</button>
          </div>
        </div>

        <!-- Task 3: Setup Automation -->
        <div class="onboarding-task locked" id="ob-task-automation" data-task="automation">
          <div class="onboarding-task-header">
            <div class="onboarding-task-check" id="ob-check-automation">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <div class="onboarding-task-info">
              <div class="onboarding-task-title">Link Automation</div>
              <div class="onboarding-task-desc">Auto-parse incoming SMS</div>
            </div>
            <svg class="onboarding-task-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="onboarding-task-body" id="ob-body-automation">
            <p class="ob-check-instruction">Tap each step as you complete it</p>
            <div class="onboarding-setup-steps" id="ob-automation-steps">
              <div class="onboarding-setup-step ob-checkable" data-substep="0">
                <div class="ob-checkbox"><svg class="ob-checkbox-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><circle cx="12" cy="12" r="10"/></svg><svg class="ob-checkbox-checked" viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="12" r="10" fill="#22c55e"/><polyline points="7 12.5 10.5 16 17 9" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                <div class="onboarding-setup-label">Open the <strong>Shortcuts</strong> app on your iPhone</div>
              </div>
              <div class="onboarding-setup-step ob-checkable" data-substep="1">
                <div class="ob-checkbox"><svg class="ob-checkbox-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><circle cx="12" cy="12" r="10"/></svg><svg class="ob-checkbox-checked" viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="12" r="10" fill="#22c55e"/><polyline points="7 12.5 10.5 16 17 9" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                <div class="onboarding-setup-label">Tap the <strong>Automation</strong> tab at the bottom of the screen</div>
              </div>
              <div class="onboarding-setup-step ob-checkable" data-substep="2">
                <div class="ob-checkbox"><svg class="ob-checkbox-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><circle cx="12" cy="12" r="10"/></svg><svg class="ob-checkbox-checked" viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="12" r="10" fill="#22c55e"/><polyline points="7 12.5 10.5 16 17 9" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                <div class="onboarding-setup-label">Tap <strong>+</strong> or <strong>New Automation</strong> to create a new automation</div>
              </div>
              <div class="onboarding-setup-step ob-checkable" data-substep="3">
                <div class="ob-checkbox"><svg class="ob-checkbox-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><circle cx="12" cy="12" r="10"/></svg><svg class="ob-checkbox-checked" viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="12" r="10" fill="#22c55e"/><polyline points="7 12.5 10.5 16 17 9" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                <div class="onboarding-setup-label">Scroll down and tap <strong>Message</strong> under the list of triggers</div>
              </div>
              <div class="onboarding-setup-step onboarding-setup-step-highlight ob-checkable" data-substep="4">
                <div class="ob-checkbox"><svg class="ob-checkbox-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><circle cx="12" cy="12" r="10"/></svg><svg class="ob-checkbox-checked" viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="12" r="10" fill="#22c55e"/><polyline points="7 12.5 10.5 16 17 9" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                <div class="onboarding-setup-label">In the <strong>Message Contains</strong> field, type <span class="onboarding-setup-code">ETB</span></div>
              </div>
              <div class="onboarding-setup-step onboarding-setup-step-highlight ob-checkable" data-substep="5">
                <div class="ob-checkbox"><svg class="ob-checkbox-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><circle cx="12" cy="12" r="10"/></svg><svg class="ob-checkbox-checked" viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="12" r="10" fill="#22c55e"/><polyline points="7 12.5 10.5 16 17 9" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                <div class="onboarding-setup-label">Make sure <strong>Run Immediately</strong> is selected (not "Ask Before Running")</div>
              </div>
              <div class="onboarding-setup-step ob-checkable" data-substep="6">
                <div class="ob-checkbox"><svg class="ob-checkbox-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><circle cx="12" cy="12" r="10"/></svg><svg class="ob-checkbox-checked" viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="12" r="10" fill="#22c55e"/><polyline points="7 12.5 10.5 16 17 9" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                <div class="onboarding-setup-label">Tap <strong>Next</strong> in the top right corner</div>
              </div>
              <div class="onboarding-setup-step ob-checkable" data-substep="7">
                <div class="ob-checkbox"><svg class="ob-checkbox-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><circle cx="12" cy="12" r="10"/></svg><svg class="ob-checkbox-checked" viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="12" r="10" fill="#22c55e"/><polyline points="7 12.5 10.5 16 17 9" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                <div class="onboarding-setup-label">Search for and select the <strong>Totals</strong> shortcut you installed in the previous step</div>
              </div>
              <div class="onboarding-setup-step ob-checkable" data-substep="8">
                <div class="ob-checkbox"><svg class="ob-checkbox-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><circle cx="12" cy="12" r="10"/></svg><svg class="ob-checkbox-checked" viewBox="0 0 24 24" fill="none" width="22" height="22"><circle cx="12" cy="12" r="10" fill="#22c55e"/><polyline points="7 12.5 10.5 16 17 9" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
                <div class="onboarding-setup-label">Tap <strong>Done</strong> — any SMS containing "ETB" will now automatically be parsed by Totals</div>
              </div>
            </div>
            <button class="onboarding-action-btn onboarding-done-btn" id="ob-done-automation" disabled>Done</button>
          </div>
        </div>

        <!-- Task 4: Add to Home Screen (optional) -->
        <div class="onboarding-task locked" id="ob-task-homescreen" data-task="homescreen">
          <div class="onboarding-task-header">
            <div class="onboarding-task-check" id="ob-check-homescreen">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <div class="onboarding-task-info">
              <div class="onboarding-task-title">Add to Home Screen</div>
              <div class="onboarding-task-desc">Optional — quick access icon</div>
            </div>
            <svg class="onboarding-task-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="onboarding-task-body" id="ob-body-homescreen">
            <ol class="onboarding-substeps">
              <li>In <strong>Shortcuts</strong> app, long press <strong>Totals</strong></li>
              <li>Tap <strong>Share</strong> → <strong>Add to Home Screen</strong></li>
              <li>Tap the icon, choose <strong>Choose File</strong>, find <strong>totals-logo.png</strong> in <strong>iCloud Drive/Scriptable</strong></li>
              <li>Tap <strong>Add</strong></li>
            </ol>
            <button class="onboarding-action-btn onboarding-done-btn" id="ob-done-homescreen">Done</button>
            <button class="onboarding-btn-link" id="ob-skip-homescreen">Skip</button>
          </div>
        </div>

        <!-- Task 5: Add Account (optional) -->
        <div class="onboarding-task locked" id="ob-task-account" data-task="account">
          <div class="onboarding-task-header">
            <div class="onboarding-task-check" id="ob-check-account">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <div class="onboarding-task-info">
              <div class="onboarding-task-title">Add First Account</div>
              <div class="onboarding-task-desc">Optional — match transactions to accounts</div>
            </div>
            <svg class="onboarding-task-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div class="onboarding-task-body" id="ob-body-account">
            <button class="onboarding-action-btn" id="onboarding-add-account-btn">Add Account</button>
            <button class="onboarding-btn-link" id="ob-skip-account">Skip</button>
          </div>
        </div>
      </div>

      <div class="onboarding-setup-footer">
        <button class="onboarding-btn-primary" id="onboarding-finish-btn" disabled>Finish Setup</button>
        <p class="onboarding-setup-note">Complete all required steps to continue.</p>
      </div>
    </div>
  </div>

  <!-- Steps 2-7: Screen tour -->
  <div class="onboarding-step onboarding-step-preview" data-step="2" data-screen="home">
    <div class="onboarding-scrim"></div>
    <div class="onboarding-preview-card">
      <button class="onboarding-preview-arrow" data-dir="prev">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      <div class="onboarding-preview-card-text">
        <h2 class="onboarding-preview-title">Home</h2>
        <p class="onboarding-preview-desc">Your total balance, daily and weekly summaries, and recent transactions.</p>
      </div>
      <button class="onboarding-preview-arrow" data-dir="next">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>

  <div class="onboarding-step onboarding-step-preview" data-step="3" data-screen="money" data-tab="activity">
    <div class="onboarding-scrim"></div>
    <div class="onboarding-preview-card">
      <button class="onboarding-preview-arrow" data-dir="prev">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      <div class="onboarding-preview-card-text">
        <h2 class="onboarding-preview-title">Money</h2>
        <p class="onboarding-preview-desc">Search and filter transactions, view analytics charts, and browse a chronological ledger.</p>
      </div>
      <button class="onboarding-preview-arrow" data-dir="next">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>

  <div class="onboarding-step onboarding-step-preview" data-step="4" data-screen="money" data-tab="accounts">
    <div class="onboarding-scrim"></div>
    <div class="onboarding-preview-card">
      <button class="onboarding-preview-arrow" data-dir="prev">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      <div class="onboarding-preview-card-text">
        <h2 class="onboarding-preview-title">Accounts</h2>
        <p class="onboarding-preview-desc">Add and manage your bank accounts. See transactions, balances, and details.</p>
      </div>
      <button class="onboarding-preview-arrow" data-dir="next">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>

  <div class="onboarding-step onboarding-step-preview" data-step="5" data-screen="budget">
    <div class="onboarding-scrim"></div>
    <div class="onboarding-preview-card">
      <button class="onboarding-preview-arrow" data-dir="prev">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      <div class="onboarding-preview-card-text">
        <h2 class="onboarding-preview-title">Budget</h2>
        <p class="onboarding-preview-desc">Set monthly budgets by category, track spending, and stay on top of your goals.</p>
      </div>
      <button class="onboarding-preview-arrow" data-dir="next">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>

  <div class="onboarding-step onboarding-step-preview" data-step="6" data-screen="tools">
    <div class="onboarding-scrim"></div>
    <div class="onboarding-preview-card">
      <button class="onboarding-preview-arrow" data-dir="prev">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      <div class="onboarding-preview-card-text">
        <h2 class="onboarding-preview-title">Tools</h2>
        <p class="onboarding-preview-desc">Contacts, SMS parser, payment verifier, and more utilities.</p>
      </div>
      <button class="onboarding-preview-arrow" data-dir="next">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>

  <div class="onboarding-step onboarding-step-preview" data-step="7" data-screen="profile">
    <div class="onboarding-scrim"></div>
    <div class="onboarding-preview-card">
      <button class="onboarding-preview-arrow" data-dir="prev">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      <div class="onboarding-preview-card-text">
        <h2 class="onboarding-preview-title">Settings</h2>
        <p class="onboarding-preview-desc">Manage profiles, toggle dark mode, check for updates, and customize your experience.</p>
      </div>
      <button class="onboarding-preview-arrow" data-dir="next" id="onboarding-tour-done">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
      </button>
    </div>
  </div>
</div>

<div class="app-container">
  <div class="ptr-indicator" id="ptr-indicator">
    <svg class="ptr-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
      <path d="M21 12a9 9 0 11-6.22-8.56"/>
    </svg>
  </div>
  <div class="screens-wrapper" id="screens-wrapper">
  <!-- Home Screen -->
  <div id="screen-home" class="screen active">
    <div style="text-align:center;padding:8px;font-size:12px;color:#888;">v1.0.0-test</div>
    <div class="balance-card">
      <div class="balance-label">TOTAL BALANCE</div>
      <div class="balance-row">
        <span class="balance-amount" id="total-balance">ETB 0</span>
        <button
          class="balance-toggle"
          id="btn-balance-toggle"
          aria-label="Toggle balance visibility"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>
      <div class="balance-card-link" id="link-how-did-i-get-here">
        How did I get here? <span style="margin-left: 2px">→</span>
      </div>
      <div class="balance-card-summary">
        <div class="balance-card-summary-col">
          <div class="balance-card-summary-title">Today</div>
          <div class="balance-card-summary-row">
            <span class="summary-income" id="today-income">+ ETB 0</span>
            <span style="color: rgba(255, 255, 255, 0.4)">|</span>
            <span class="summary-expense" id="today-expense">- ETB 0</span>
          </div>
        </div>
        <div class="balance-card-summary-col">
          <div class="balance-card-summary-title">This Week</div>
          <div class="balance-card-summary-row">
            <span class="summary-income" id="week-income">+ ETB 0</span>
            <span style="color: rgba(255, 255, 255, 0.4)">|</span>
            <span class="summary-expense" id="week-expense">- ETB 0</span>
          </div>
        </div>
      </div>
    </div>

    <div class="insight-card" id="insight-card">
      <div class="insight-card-header">
        <div class="insight-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <span class="insight-card-title">Insight</span>
      </div>
      <div class="insight-text" id="insight-text">
        Analyzing your spending patterns...
      </div>
    </div>

    <div class="cash-entry-row">
      <button class="cash-expense-btn" id="cash-expense-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <polyline points="17 7 12 2 7 7"/><line x1="12" y1="2" x2="12" y2="14"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        </svg>
        <span>Expense</span>
      </button>
      <button class="cash-income-btn" id="cash-income-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <polyline points="7 7 12 12 17 7"/><line x1="12" y1="12" x2="12" y2="3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        </svg>
        <span>Income</span>
      </button>
    </div>

    <div class="section-header">
      <span class="section-title"
        >Today (<span id="recent-count">0</span>)</span
      >
      <span class="section-link" data-navigate="money">See all →</span>
    </div>

    <div id="recent-transactions"></div>

    <div class="home-chart-card">
      <div class="home-chart-header">
        <span class="home-chart-title">Income vs Expense</span>
        <div class="home-chart-chips" id="home-chart-chips">
          <button class="home-chart-chip active" data-period="7D">7D</button>
          <button class="home-chart-chip" data-period="30D">30D</button>
        </div>
      </div>
      <div class="home-chart-area">
        <canvas id="home-chart-canvas" class="chart-canvas"></canvas>
        <div class="home-chart-tooltip" id="home-chart-tooltip">
          <div class="home-chart-tooltip-date" id="home-tooltip-date"></div>
          <div class="home-chart-tooltip-row">
            <span class="home-tooltip-income" id="home-tooltip-income"></span>
            <span class="home-tooltip-expense" id="home-tooltip-expense"></span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Money Screen -->
  <div id="screen-money" class="screen">
    <div class="tab-nav-underline" style="margin-top: 12px">
      <button class="tab-btn-underline active" data-tab="activity">
        Activity
      </button>
      <button class="tab-btn-underline" data-tab="accounts">
        Accounts
      </button>
    </div>

    <!-- Activity Tab -->
    <div id="tab-activity" class="tab-content">
      <div class="health-card">
        <div class="health-info">
          <div class="health-label">Financial Health</div>
          <div class="health-title">
            <span id="health-score-text">23</span>/100
          </div>
          <div style="margin-top: 8px">
            <div class="health-label" id="cashflow-period-label">
              CASH FLOW
            </div>
            <div class="health-flow">
              <span class="text-green" id="cashflow-in">+ETB 0</span>
              <span>|</span>
              <span class="text-red" id="cashflow-out">-ETB 0</span>
            </div>
          </div>
        </div>
        <div class="health-gauge">
          <svg viewBox="0 0 80 80">
            <circle class="health-gauge-bg" cx="40" cy="40" r="32" />
            <circle
              class="health-gauge-fill"
              id="health-gauge-fill"
              cx="40"
              cy="40"
              r="32"
              stroke-dasharray="201"
              stroke-dashoffset="155"
            />
          </svg>
          <span class="health-score" id="health-score">23</span>
        </div>
      </div>

      <div class="activity-sticky-header">
        <div class="activity-toolbar">
          <div class="tab-nav">
            <button class="tab-btn active" data-subtab="transactions">
              Transactions
            </button>
            <button class="tab-btn" data-subtab="analytics">Analytics</button>
            <button class="tab-btn" data-subtab="ledger">Ledger</button>
          </div>
          <button class="filter-btn" id="btn-filter">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polygon
                points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
              />
            </svg>
            <div
              class="filter-active-indicator hidden"
              id="filter-indicator"
            ></div>
          </button>
        </div>
        <div id="active-filters-bar"></div>
      </div>

      <!-- Transactions Sub-tab -->
      <div id="subtab-transactions" class="subtab-content">
        <div class="search-bar">
          <div class="search-input-wrapper">
            <svg
              class="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              class="search-input"
              id="search-input"
              placeholder="Search transactions..."
            />
          </div>
        </div>
        <div id="transactions-list"></div>
      </div>

      <!-- Analytics Sub-tab -->
      <div id="subtab-analytics" class="subtab-content hidden">
        <!-- Quick Stats Grid -->
        <div class="analytics-stat-grid" id="analytics-stat-grid">
          <div class="analytics-stat-card">
            <div
              class="analytics-stat-icon"
              style="
                background: rgba(34, 197, 94, 0.15);
                color: var(--green);
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div class="analytics-stat-label">Total Income</div>
            <div class="analytics-stat-value" id="stat-total-income">
              ETB 0
            </div>
            <div class="analytics-stat-sub" id="stat-income-count">
              0 deposits
            </div>
          </div>
          <div class="analytics-stat-card">
            <div
              class="analytics-stat-icon"
              style="background: rgba(239, 68, 68, 0.15); color: var(--red)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                <polyline points="17 18 23 18 23 12" />
              </svg>
            </div>
            <div class="analytics-stat-label">Total Expense</div>
            <div class="analytics-stat-value" id="stat-total-expense">
              ETB 0
            </div>
            <div class="analytics-stat-sub" id="stat-expense-count">
              0 transactions
            </div>
          </div>
          <div class="analytics-stat-card">
            <div
              class="analytics-stat-icon"
              style="
                background: rgba(99, 102, 241, 0.15);
                color: var(--primary-purple-light);
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </div>
            <div class="analytics-stat-label">Transactions</div>
            <div class="analytics-stat-value" id="stat-tx-count">0</div>
            <div class="analytics-stat-sub" id="stat-tx-sub">
              0 expense | 0 income
            </div>
          </div>
          <div class="analytics-stat-card">
            <div
              class="analytics-stat-icon"
              style="
                background: rgba(234, 179, 8, 0.15);
                color: var(--yellow);
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div class="analytics-stat-label">Total Fees</div>
            <div class="analytics-stat-value" id="total-fees">ETB 0</div>
            <div class="analytics-stat-sub">Service charges + VAT</div>
          </div>
        </div>

        <!-- Main Chart -->
        <div class="analytics-card" id="analytics-chart-card">
          <div class="analytics-header">
            <div class="chart-type-selector" id="chart-type-selector">
              <span class="chart-type-selected" id="chart-type-label">Heatmap</span>
              <svg class="chart-type-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            <div class="chart-filter-chips" id="chart-filter-chips">
              <button class="chart-filter-chip active" data-chart-filter="all">All</button>
              <button class="chart-filter-chip" data-chart-filter="expense">Expense</button>
              <button class="chart-filter-chip" data-chart-filter="income">Income</button>
            </div>
          </div>
          <div class="chart-type-dropdown hidden" id="chart-type-dropdown">
            <div class="chart-type-option" data-chart-type="line">Line Chart</div>
            <div class="chart-type-option" data-chart-type="bar">Bar Chart</div>
            <div class="chart-type-option" data-chart-type="pie">Pie Chart</div>
            <div class="chart-type-option active" data-chart-type="heatmap">Heatmap</div>
          </div>
          <!-- Canvas charts (line/bar/pie) -->
          <div id="chart-canvas-view">
            <div class="analytics-chart">
              <canvas id="chart-canvas" class="chart-canvas"></canvas>
              <div class="chart-tooltip" id="chart-tooltip">
                <div class="chart-tooltip-date" id="chart-tooltip-date"></div>
                <div class="chart-tooltip-row">
                  <div class="chart-tooltip-dot" style="background: var(--green)"></div>
                  <span class="chart-tooltip-value" id="chart-tooltip-income"></span>
                </div>
                <div class="chart-tooltip-row">
                  <div class="chart-tooltip-dot" style="background: var(--red)"></div>
                  <span class="chart-tooltip-value" id="chart-tooltip-expense"></span>
                </div>
              </div>
            </div>
            <div class="analytics-summary">
              <button class="analytics-btn income" id="btn-total-income">+ETB 0</button>
              <button class="analytics-btn expense" id="btn-total-expense">-ETB 0</button>
            </div>
          </div>
          <!-- PnL Heatmap view -->
          <div id="chart-heatmap-view" class="hidden">
            <div class="heatmap-header">
              <div class="heatmap-month-title" id="heatmap-month-title">January 2026</div>
              <div class="heatmap-legend">
                <div class="heatmap-legend-item"><span class="heatmap-legend-box income"></span> Income</div>
                <div class="heatmap-legend-item"><span class="heatmap-legend-box expense"></span> Expense</div>
              </div>
            </div>
            <div class="heatmap-grid" id="heatmap-grid"></div>
            <div class="heatmap-nav">
              <button class="heatmap-nav-btn" id="heatmap-prev">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span class="heatmap-nav-label" id="heatmap-today">Today</span>
              <button class="heatmap-nav-btn" id="heatmap-next">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="9 6 15 12 9 18"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Expense Charts -->
        <div class="analytics-card" id="expense-chart-card">
          <div class="analytics-header">
            <span class="analytics-title">Expenses</span>
            <div class="chart-type-selector" id="expense-chart-selector">
              <span class="chart-type-selected" id="expense-chart-label">Bar chart</span>
              <svg class="chart-type-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
          <div class="chart-type-dropdown hidden" id="expense-chart-dropdown">
            <div class="chart-type-option active" data-expense-chart="bar">Bar chart</div>
            <div class="chart-type-option" data-expense-chart="bubble">Bubble chart</div>
          </div>
          <div class="expense-period-chips" id="expense-period-chips">
            <button class="expense-period-chip active" data-period="weekly">Weekly</button>
            <button class="expense-period-chip" data-period="monthly">Monthly</button>
            <button class="expense-period-chip" data-period="yearly">Yearly</button>
          </div>
          <div class="expense-chart-subtitle" id="expense-chart-subtitle"></div>
          <div class="analytics-chart" id="expense-chart-area" style="height: 220px">
            <canvas id="chart-expense" class="chart-canvas"></canvas>
          </div>
          <div class="expense-chart-legend" id="expense-chart-legend"></div>
        </div>

        <!-- Spending by Day of Week -->
        <div class="analytics-card">
          <div class="analytics-header">
            <span class="analytics-title">Spending by Day</span>
            <span class="analytics-period" id="dow-peak-label">-</span>
          </div>
          <div class="analytics-dow-chart" id="analytics-dow-chart"></div>
        </div>

        <!-- Top Recipients -->
        <div class="analytics-card">
          <div class="analytics-header">
            <span class="analytics-title">Top Recipients</span>
            <span class="analytics-period" id="top-recipients-count"
              >0 total</span
            >
          </div>
          <ul class="analytics-top-list" id="analytics-top-recipients">
            <li
              style="
                padding: 20px 0;
                text-align: center;
                color: var(--text-muted);
                font-size: 13px;
              "
            >
              No data yet
            </li>
          </ul>
        </div>

        <!-- Money Flow Breakdown -->
        <div class="analytics-card">
          <div class="analytics-header">
            <span class="analytics-title">Money Flow</span>
          </div>
          <div id="analytics-money-flow">
            <div class="analytics-breakdown-row">
              <span class="analytics-breakdown-label">Net Cash Flow</span>
              <span class="analytics-breakdown-value" id="stat-net-flow"
                >ETB 0</span
              >
            </div>
            <div class="analytics-breakdown-row">
              <span class="analytics-breakdown-label">Savings Rate</span>
              <span class="analytics-breakdown-value" id="stat-savings-rate"
                >0%</span
              >
            </div>
            <div class="analytics-breakdown-row">
              <span class="analytics-breakdown-label">Largest Expense</span>
              <span
                class="analytics-breakdown-value"
                id="stat-largest-expense"
                >ETB 0</span
              >
            </div>
            <div class="analytics-breakdown-row">
              <span class="analytics-breakdown-label">Largest Deposit</span>
              <span
                class="analytics-breakdown-value"
                id="stat-largest-deposit"
                >ETB 0</span
              >
            </div>
            <div class="analytics-breakdown-row">
              <span class="analytics-breakdown-label"
                >Total Transactions</span
              >
              <span
                class="analytics-breakdown-value"
                id="stat-total-tx-count"
                >0</span
              >
            </div>
            <div class="analytics-breakdown-row">
              <span class="analytics-breakdown-label">Active Days</span>
              <span class="analytics-breakdown-value" id="stat-active-days"
                >0</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Ledger Sub-tab -->
      <div id="subtab-ledger" class="subtab-content hidden">
        <div class="ledger-controls">
          <div class="ledger-date-picker">
            <label>Start Date:</label>
            <div class="date-btn-wrap">
              <button class="date-btn" id="ledger-start-btn">Start date</button>
              <input type="date" class="date-btn-input" id="ledger-date-start" />
            </div>
          </div>
          <div class="ledger-date-picker">
            <label>End Date:</label>
            <div class="date-btn-wrap">
              <button class="date-btn" id="ledger-end-btn">End date</button>
              <input type="date" class="date-btn-input" id="ledger-date-end" />
            </div>
          </div>
        </div>
        <div class="ledger-account-bar filter-chips" id="ledger-account-bar"></div>
        <div id="ledger-list"></div>
      </div>
    </div>

    <!-- Accounts Tab -->
    <div id="tab-accounts" class="tab-content hidden">
      <div class="balance-card" id="accounts-balance-card">
        <div class="acct-card-top">
          <div>
            <div class="balance-label" id="accounts-balance-label">TOTAL BALANCE</div>
            <div class="acct-card-balance" id="accounts-total-balance">ETB 0</div>
          </div>
          <button
            class="balance-toggle"
            id="btn-accounts-balance-toggle"
            aria-label="Toggle balance visibility"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
        <div class="acct-card-divider"></div>
        <div class="acct-card-meta">
          <span id="accounts-banks-count">0 Banks</span>
          <span>|</span>
          <span id="accounts-accounts-count">0 Accounts</span>
          <span>|</span>
          <button class="acct-share-btn" id="btn-share-accounts" title="Share via QR">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><line x1="21" y1="14" x2="21" y2="17"/><line x1="14" y1="21" x2="17" y2="21"/></svg>
            QR
          </button>
        </div>
        <div class="acct-card-divider"></div>
        <div class="acct-card-stats">
          <div class="acct-card-stat">
            <div class="acct-card-stat-label">TRANSACTIONS</div>
            <div class="acct-card-stat-value" id="accounts-tx-count">0</div>
          </div>
          <div class="acct-card-stat-sep"></div>
          <div class="acct-card-stat">
            <div class="acct-card-stat-label">IN &amp; OUT</div>
            <div class="acct-card-stat-value">
              <span class="text-green" id="accounts-inflow">+ETB 0</span>
              <span style="color: rgba(255,255,255,0.5)">|</span>
              <span class="text-red" id="accounts-outflow">-ETB 0</span>
            </div>
          </div>
        </div>
      </div>

      <div id="bank-detail" class="hidden">
        <div class="bank-selector-bar" id="bank-selector-bar"></div>
        <div id="bank-accounts-list"></div>
      </div>

      <div id="bank-overview">
        <div class="bank-grid" id="bank-grid"></div>
      </div>
    </div>
  </div>

  <!-- Budget Screen -->
  <div id="screen-budget" class="screen">
    <!-- Budget Overview -->
    <div id="budget-overview">
      <div class="month-nav">
        <button class="month-nav-btn" id="budget-month-prev" aria-label="Previous month">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="month-nav-label" id="budget-month-label">February 2026</span>
        <button class="month-nav-btn" id="budget-month-next" aria-label="Next month">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="9 6 15 12 9 18"/></svg>
        </button>
      </div>
      <div id="budget-content"></div>
    </div>

    <!-- Budget Detail -->
    <div id="budget-detail" class="hidden">
      <div class="budget-detail-header">
        <button class="budget-back-btn" id="budget-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <button class="budget-edit-btn" id="budget-edit">Edit</button>
      </div>
      <div id="budget-detail-content"></div>
    </div>
  </div>

  <!-- Tools Screen -->
  <div id="screen-tools" class="screen">
    <!-- Dynamic header: shows "Tools" on grid, tool name on sub-view -->
    <div class="tools-header" id="tools-header">
      <div class="tools-header-main" id="tools-header-main">
        <h1 class="tools-header-title">Tools</h1>
        <p class="tools-header-desc">Utilities for your finances</p>
      </div>
      <div class="tools-header-back hidden" id="tools-header-back">
        <button class="tools-back-btn" id="tools-back-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span class="tools-header-tool-name" id="tools-header-tool-name"></span>
      </div>
    </div>

    <!-- Tools Grid -->
    <div id="tools-grid" class="tools-grid">
      <div class="tool-card" data-tool="contacts">
        <div class="tool-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="tool-card-title">Contacts</div>
        <div class="tool-card-desc">Save bank accounts of friends &amp; family</div>
        <div class="tool-card-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="9 6 15 12 9 18"/></svg>
        </div>
      </div>
      <div class="tool-card" data-tool="sms-parser">
        <div class="tool-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="tool-card-title">SMS Parser</div>
        <div class="tool-card-desc">Paste bank SMS to add transactions</div>
        <div class="tool-card-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="9 6 15 12 9 18"/></svg>
        </div>
      </div>
      <div class="tool-card" data-tool="failed-sms">
        <div class="tool-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div class="tool-card-title">Failed SMS</div>
        <div class="tool-card-desc">Review &amp; retry unparsed messages</div>
        <div class="tool-card-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="9 6 15 12 9 18"/></svg>
        </div>
      </div>
      <div class="tool-card" data-tool="verifier">
        <div class="tool-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
          </svg>
        </div>
        <div class="tool-card-title">Verifier</div>
        <div class="tool-card-desc">Check transaction references</div>
        <div class="tool-card-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="9 6 15 12 9 18"/></svg>
        </div>
      </div>
    </div>

    <div id="tools-grid-footer" class="tools-grid-footer">
      <div class="tools-grid-footer-line"></div>
      <span>More coming soon</span>
    </div>

    <!-- Contacts Sub-view -->
    <div id="tools-contacts" class="tools-subview hidden">
      <div class="tools-subview-intro">
        <span class="tools-subview-count" id="contacts-count">0 saved</span>
      </div>
      <div class="tools-search-wrap">
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" class="search-input contacts-search-has-action" id="contacts-search-input" placeholder="Search or scan QR..."/>
          <button class="contacts-scan-btn" id="contacts-scan-btn" title="Scan QR">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
              <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
              <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
              <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
              <rect x="7" y="7" width="10" height="10" rx="1"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="tools-section-divider">
        <div class="tools-section-divider-line"></div>
      </div>
      <div id="contacts-list"></div>
      <div id="contacts-empty" class="tools-empty-state">
        <div class="tools-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
        </div>
        <div class="tools-empty-title">No contacts yet</div>
        <p class="tools-empty-text">Tap <strong>+</strong> to save someone's bank account</p>
      </div>
    </div>

    <!-- SMS Parser Sub-view -->
    <div id="tools-sms-parser" class="tools-subview hidden">
      <div class="tools-subview-intro">
        <span class="tools-subview-hint">Paste a bank SMS to parse it into a transaction</span>
      </div>
      <div class="sms-parser-form-wrap">
        <div class="form-group">
          <label class="form-label" for="sms-parser-text">SMS message</label>
          <textarea class="form-input sms-parser-textarea" id="sms-parser-text" rows="5" placeholder="Paste the full SMS text here..."></textarea>
        </div>
        <div class="tools-section-divider" style="padding: 8px 0 4px">
          <div class="tools-section-divider-line"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Bank sender (optional — auto-detects if empty)</label>
          <div class="bank-selector" id="sms-parser-bank-selector">
            <div class="bank-selector-selected" id="sms-parser-bank-selected">
              <span class="bank-selector-placeholder">Auto-detect</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <div class="bank-selector-dropdown hidden" id="sms-parser-bank-dropdown"></div>
          </div>
        </div>
        <button class="form-submit" id="sms-parser-submit">
          <span>Parse SMS</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>
      <div id="sms-parser-result" class="hidden"></div>
    </div>

    <!-- Failed SMS Sub-view -->
    <div id="tools-failed-sms" class="tools-subview hidden">
      <div class="tools-subview-intro">
        <span class="tools-subview-count" id="failed-sms-count">0 messages</span>
        <button class="failed-sms-retry-all" id="failed-sms-retry-all">Retry All</button>
      </div>
      <div id="failed-sms-list"></div>
      <div id="failed-sms-empty" class="tools-empty-state hidden">
        <div class="tools-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="tools-empty-title">All clear</div>
        <p class="tools-empty-text">No failed SMS messages to review</p>
      </div>
    </div>

    <!-- Verifier Sub-view -->
    <div id="tools-verifier" class="tools-subview hidden">
      <div class="tools-subview-intro">
        <span class="tools-subview-hint">Enter a reference to look it up</span>
      </div>
      <div class="verifier-form-wrap">
        <div class="form-group">
          <label class="form-label" for="verifier-reference">Reference number</label>
          <input type="text" class="form-input" id="verifier-reference" placeholder="e.g., FT12345ABC"/>
        </div>
        <div class="tools-section-divider" style="padding: 8px 0 4px">
          <div class="tools-section-divider-line"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Bank (optional)</label>
          <div class="bank-selector" id="verifier-bank-selector">
            <div class="bank-selector-selected" id="verifier-bank-selected">
              <span class="bank-selector-placeholder">Select a bank</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <div class="bank-selector-dropdown hidden" id="verifier-bank-dropdown"></div>
          </div>
        </div>
        <button class="form-submit" id="verifier-submit">
          <span>Verify</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M5 12l5 5L20 7"/>
          </svg>
        </button>
      </div>
      <div id="verifier-result" class="hidden"></div>
    </div>
  </div>

  <!-- You Screen -->
  <div id="screen-profile" class="screen">
    <div class="you-header">
      <h1 class="you-title">You</h1>
      <div class="you-subtitle">Preferences & settings.</div>
    </div>
    <div class="you-content">
      <!-- Profile Card -->
      <div class="you-profile-card" id="you-profile-card">
        <div class="you-profile-avatar" id="you-profile-avatar">A</div>
        <div class="you-profile-info">
          <div class="you-profile-name" id="you-profile-name">All Accounts</div>
          <div class="you-profile-meta">Manage profiles</div>
        </div>
        <svg class="you-row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="9 18 15 12 9 6"/></svg>
      </div>

      <!-- Preferences -->
      <div class="you-section-label">PREFERENCES</div>
      <div class="you-rows">
        <div class="you-row" id="you-row-darkmode">
          <div class="you-row-icon you-row-icon-moon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </div>
          <div class="you-row-info">
            <div class="you-row-title">Dark Mode</div>
            <div class="you-row-desc">Switch between light and dark theme</div>
          </div>
          <label class="you-toggle">
            <input type="checkbox" id="you-darkmode-toggle"/>
            <span class="you-toggle-track"></span>
          </label>
        </div>
        <div class="you-row" id="you-row-categories">
          <div class="you-row-icon you-row-icon-categories">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <div class="you-row-info">
            <div class="you-row-title">Categories</div>
            <div class="you-row-desc">Manage transaction categories</div>
          </div>
          <svg class="you-row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div class="you-row" id="you-row-widget-profiles">
          <div class="you-row-icon you-row-icon-moon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <rect x="2" y="4" width="20" height="16" rx="3"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>
            </svg>
          </div>
          <div class="you-row-info">
            <div class="you-row-title">Widget Profiles</div>
            <div class="you-row-desc" id="widget-profiles-desc">Show all profiles</div>
          </div>
          <svg class="you-row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>

      <!-- Widget Profile Picker (hidden by default) -->
      <div id="widget-profile-picker" class="you-rows widget-profile-picker hidden">
        <div id="widget-profile-chips" class="widget-profile-chips"></div>
      </div>

      <!-- Data -->
      <div class="you-section-label">DATA</div>
      <div class="you-rows">
        <div class="you-row" id="you-row-export">
          <div class="you-row-icon you-row-icon-export">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <div class="you-row-info">
            <div class="you-row-title">Export Data</div>
            <div class="you-row-desc">Download transactions as CSV</div>
          </div>
          <svg class="you-row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>

      <div class="you-section-label">UPDATES</div>
      <div class="you-rows">
        <div class="you-row" id="you-row-update">
          <div class="you-row-icon you-row-icon-categories">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
          </div>
          <div class="you-row-info">
            <div class="you-row-title">Check for Updates</div>
            <div class="you-row-desc" id="update-status">Update app, banks &amp; SMS patterns</div>
          </div>
          <svg class="you-row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>

      <div class="you-section-label">SUPPORT</div>
      <div class="you-rows">
        <div class="you-row" id="you-row-about">
          <div class="you-row-icon you-row-icon-about">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <div class="you-row-info">
            <div class="you-row-title">About Totals</div>
            <div class="you-row-desc">Privacy, socials & app info</div>
          </div>
          <svg class="you-row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div class="you-row" id="you-row-faq">
          <div class="you-row-icon you-row-icon-faq">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="you-row-info">
            <div class="you-row-title">FAQ</div>
            <div class="you-row-desc">Common questions answered</div>
          </div>
          <svg class="you-row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <a class="you-row" id="you-row-support" href="https://www.gurshaplus.com/detached" style="text-decoration:none;color:inherit">
          <div class="you-row-icon you-row-icon-support">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <div class="you-row-info">
            <div class="you-row-title">Support The Devs</div>
            <div class="you-row-desc">Buy us a coffee & keep Totals alive</div>
          </div>
          <svg class="you-row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>
    </div>

    <!-- Category Manager (sub-screen) -->
    <div id="category-manager" class="you-subscreen hidden">
      <div class="you-subscreen-header">
        <button class="you-subscreen-back" id="catmgr-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 class="you-subscreen-title">Categories</h2>
        <button class="catmgr-add-btn" id="catmgr-add-cat">+ New</button>
      </div>
      <div class="catmgr-tabs">
        <button class="catmgr-tab active" data-filter="expense">Expense</button>
        <button class="catmgr-tab" data-filter="income">Income</button>
      </div>
      <div id="catmgr-create-form" class="hidden"></div>

      <div class="catmgr-section">
        <div class="catmgr-section-title">Built-in</div>
        <div id="catmgr-builtin-list"></div>
      </div>

      <div class="catmgr-section">
        <div class="catmgr-section-header">
          <span class="catmgr-section-title">Custom</span>
        </div>
        <div id="catmgr-custom-list"></div>
      </div>

      <div class="catmgr-section">
        <div class="catmgr-section-header">
          <span class="catmgr-section-title">Auto-categorization Rules</span>
        </div>
        <div id="catmgr-rules-list"></div>
      </div>
    </div>

    <!-- Export Data (sub-screen) -->
    <div id="export-screen" class="you-subscreen hidden">
      <div class="you-subscreen-header">
        <button class="you-subscreen-back" id="export-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 class="you-subscreen-title">Export</h2>
      </div>

      <div class="export-section">
        <div class="export-label">Format</div>
        <div class="export-mode-tabs">
          <button class="export-mode-tab active" data-mode="csv">CSV</button>
          <button class="export-mode-tab" data-mode="statement">Statement</button>
        </div>
      </div>

      <!-- CSV mode -->
      <div id="export-csv-mode">
        <div class="export-section">
          <div class="export-label">Include</div>
          <div class="export-chips" id="export-include-chips">
            <button class="export-chip active" data-value="transactions">Transactions</button>
            <button class="export-chip" data-value="accounts">Accounts</button>
            <button class="export-chip" data-value="categories">Categories</button>
            <button class="export-chip" data-value="rules">Rules</button>
            <button class="export-chip" data-value="budgets">Budgets</button>
          </div>
        </div>

        <div id="export-tx-filters">
          <div class="export-section">
            <div class="export-label">Profile</div>
            <div class="export-chips" id="export-profile-chips"></div>
          </div>

          <div class="export-section">
            <div class="export-label">Date Range</div>
            <div class="filter-date-row">
              <div class="date-btn-wrap">
                <button class="date-btn" id="export-start-btn">Start date</button>
                <input type="date" class="date-btn-input" id="export-date-start" />
              </div>
              <span class="filter-date-sep">—</span>
              <div class="date-btn-wrap">
                <button class="date-btn" id="export-end-btn">End date</button>
                <input type="date" class="date-btn-input" id="export-date-end" />
              </div>
            </div>
          </div>

          <div class="export-section">
            <div class="export-label">Type</div>
            <div class="export-chips" id="export-type-chips">
              <button class="export-chip active" data-value="all">All</button>
              <button class="export-chip" data-value="expense">Expenses</button>
              <button class="export-chip" data-value="income">Income</button>
            </div>
          </div>

          <div class="export-section">
            <div class="export-label">Bank</div>
            <div class="export-chips" id="export-bank-chips"></div>
          </div>

          <div class="export-section">
            <div class="export-label">Account</div>
            <div class="export-chips" id="export-account-chips"></div>
          </div>
        </div>

        <div class="export-preview">
          <span id="export-count">0 transactions</span>
        </div>

        <button class="export-btn" id="export-csv-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download CSV
        </button>
      </div>

      <!-- Statement mode -->
      <div id="export-stmt-mode" class="hidden">
        <div class="export-section">
          <div class="export-label">Account</div>
          <div class="export-chips" id="export-stmt-account-chips"></div>
        </div>

        <div class="export-section">
          <div class="export-label">Period</div>
          <div class="filter-date-row">
            <div class="date-btn-wrap">
              <button class="date-btn" id="export-stmt-start-btn">Start date</button>
              <input type="date" class="date-btn-input" id="export-stmt-start" />
            </div>
            <span class="filter-date-sep">—</span>
            <div class="date-btn-wrap">
              <button class="date-btn" id="export-stmt-end-btn">End date</button>
              <input type="date" class="date-btn-input" id="export-stmt-end" />
            </div>
          </div>
        </div>

        <div class="export-preview">
          <span id="export-stmt-count">Select an account</span>
        </div>

        <button class="export-btn" id="export-stmt-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          Generate Statement
        </button>
      </div>
    </div>

    <!-- About (sub-screen) -->
    <div id="about-screen" class="you-subscreen hidden">
      <div class="you-subscreen-header">
        <button class="you-subscreen-back" id="about-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 class="you-subscreen-title">About</h2>
      </div>

      <div class="about-app-header">
        <div class="about-app-icon">
          <svg viewBox="0 0 400 400" width="64" height="64">
            <defs><linearGradient id="about-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0" stop-color="#284DC1"/><stop offset="1" stop-color="#172A69"/></linearGradient></defs>
            <rect width="400" height="400" rx="80" fill="url(#about-logo-grad)"/>
            <g transform="translate(90, 55)">
              <path fill="#fff" d="M202,124.2H17.5c-3.6,0-6.7,2.6-7.4,6.1l-10,54.4c-0.7,4.1,1.9,8,6,8.7c0.4,0.1,0.9,0.1,1.4,0.1c10.4,0,19.2-2.6,26.6-7.9c7.2-5,12.3-12.5,14.4-21h34.6V282c0,4.1,3.4,7.5,7.5,7.5h38.1c4.1,0,7.5-3.4,7.5-7.5V164.7H171c2.2,8.5,7.3,16,14.4,21.2c7.1,5.2,15.9,7.8,26.4,7.8h0.2c4.1,0,7.5-3.4,7.5-7.5c0-0.5,0-0.9-0.1-1.4l-10-54.4C208.7,126.8,205.6,124.3,202,124.2"/>
              <path fill="#fff" d="M110.3,0c27.1,0,49,21.9,49,49s-21.9,49-49,49s-49-21.9-49-49S83.2,0,110.3,0"/>
            </g>
          </svg>
        </div>
        <div class="about-app-name">
          <svg viewBox="0 0 78.6 15" height="20" fill="#294EC3">
            <path d="M78.3,8.8c-0.2-0.5-0.5-0.9-0.9-1.2c-0.5-0.4-1-0.7-1.5-0.9c-0.7-0.3-1.5-0.5-2.2-0.6l-1.2-0.2c-0.4-0.1-0.8-0.2-1.2-0.3c-0.3-0.1-0.5-0.2-0.7-0.4c-0.2-0.1-0.3-0.3-0.4-0.5C70,4.6,70,4.3,70,4.1c0-0.2,0-0.4,0.1-0.6c0.1-0.2,0.2-0.3,0.4-0.5c0.2-0.1,0.4-0.2,0.7-0.3c0.3-0.1,0.6-0.1,1-0.1c0.4,0,0.8,0,1.2,0.1c0.3,0.1,0.6,0.2,0.8,0.4c0.2,0.2,0.4,0.4,0.5,0.6c0.1,0.3,0.2,0.6,0.2,0.9h3.2C78.1,4.3,78,4,78,3.6c-0.1-0.3-0.2-0.6-0.3-0.9c-0.1-0.3-0.3-0.6-0.5-0.8c-0.2-0.2-0.4-0.5-0.7-0.7C76.2,1,76,0.8,75.7,0.7c-0.3-0.2-0.7-0.3-1-0.4C73.8,0.1,73,0,72.1,0c-0.8,0-1.6,0.1-2.4,0.3c-0.3,0.1-0.7,0.2-1,0.4C68.5,0.8,68.2,1,68,1.2c-0.2,0.2-0.4,0.4-0.6,0.6C67.2,2,67,2.2,66.9,2.5c-0.1,0.3-0.2,0.5-0.3,0.8c-0.1,0.3-0.1,0.6-0.1,0.9c0,0.6,0.1,1.1,0.3,1.7c0.2,0.5,0.5,0.9,0.9,1.3c0.4,0.4,0.9,0.7,1.5,0.9c0.7,0.3,1.4,0.5,2.1,0.6L72.5,9c0.7,0.1,1.4,0.3,2,0.6c0.2,0.1,0.3,0.3,0.4,0.4c0.1,0.2,0.1,0.4,0.1,0.6c0,0.2,0,0.5-0.2,0.7c-0.1,0.2-0.3,0.4-0.5,0.5c-0.2,0.1-0.5,0.3-0.8,0.3c-0.4,0.1-0.7,0.1-1.1,0.1c-0.5,0-0.9,0-1.4-0.1c-0.3-0.1-0.7-0.2-1-0.4c-0.3-0.2-0.5-0.4-0.6-0.7c-0.1-0.4-0.2-0.7-0.2-1.1h-3.3c0,0.4,0,0.8,0.1,1.1c0.1,0.3,0.2,0.7,0.3,1c0.1,0.3,0.3,0.6,0.5,0.9c0.2,0.3,0.5,0.5,0.7,0.7c0.3,0.2,0.6,0.4,0.9,0.6c0.3,0.2,0.7,0.3,1.1,0.4c0.4,0.1,0.8,0.2,1.2,0.2C71.6,15,72,15,72.5,15l0,0c0.9,0,1.7-0.1,2.6-0.3c0.4-0.1,0.7-0.2,1-0.4c0.3-0.1,0.6-0.3,0.9-0.5c0.3-0.2,0.5-0.4,0.7-0.6c0.2-0.2,0.4-0.5,0.5-0.8c0.1-0.3,0.2-0.6,0.3-0.9c0.1-0.3,0.1-0.7,0.1-1C78.6,9.9,78.5,9.3,78.3,8.8z"/>
            <path d="M27.6,5.9c-0.1-0.5-0.2-1-0.4-1.4c-0.5-1.4-1.4-2.5-2.6-3.3c-0.4-0.3-0.8-0.5-1.3-0.6c-0.5-0.2-0.9-0.3-1.4-0.4c-1-0.2-2.1-0.2-3.1,0c-0.5,0.1-1,0.2-1.4,0.4c-0.4,0.2-0.9,0.4-1.3,0.6c-0.4,0.3-0.8,0.6-1.1,0.9c-0.7,0.7-1.2,1.5-1.5,2.4c-0.2,0.5-0.3,1-0.4,1.4C13,7,13,8,13.1,9.1c0.1,0.5,0.2,1,0.4,1.4c0.5,1.4,1.4,2.5,2.6,3.3c0.4,0.3,0.8,0.5,1.3,0.6c0.5,0.2,0.9,0.3,1.4,0.4c1,0.2,2.1,0.2,3.1,0c0.5-0.1,1-0.2,1.4-0.4c0.4-0.2,0.9-0.4,1.3-0.6c0.4-0.3,0.8-0.6,1.1-0.9c0.7-0.7,1.2-1.5,1.5-2.4c0.2-0.5,0.3-0.9,0.4-1.4C27.8,8,27.8,7,27.6,5.9L27.6,5.9z M24,9.4L24,9.4c-0.2,0.5-0.4,1-0.8,1.4c-0.3,0.4-0.8,0.7-1.2,0.9c-1,0.4-2.1,0.4-3.1,0c-0.5-0.2-0.9-0.5-1.2-0.9c-0.4-0.4-0.6-0.9-0.8-1.4c-0.2-0.6-0.3-1.3-0.3-1.9c0-0.6,0.1-1.3,0.3-1.9c0.2-0.5,0.4-1,0.8-1.4c0.3-0.4,0.7-0.7,1.2-0.9c1-0.4,2.1-0.4,3.1,0c0.5,0.2,0.9,0.5,1.2,0.9c0.4,0.4,0.6,0.9,0.8,1.4c0.2,0.6,0.3,1.3,0.3,1.9C24.2,8.1,24.1,8.8,24,9.4z"/>
            <path d="M44.3,0l-5.5,15h3.6l2.7-8.2c0.1-0.2,0.5-1.5,1.2-3.8c0.6,1.8,1,3,1.3,3.8l2.8,8.2h3.8L48.6,0H44.3z"/>
            <polygon points="58.7,0 55.2,0 55.2,15 65.6,15 65.6,11.8 58.7,11.8"/>
            <polygon points="40.8,0 28,0 28,3.2 32.6,3.2 32.6,15 36.2,15 36.2,3.2 40.8,3.2"/>
            <polygon points="0,3.2 4.6,3.2 4.6,15 8.2,15 8.2,3.2 12.8,3.2 12.8,0 0,0"/>
          </svg>
        </div>
        <div class="about-app-tagline">Personal finance tracker for Ethiopian banks</div>
        <p class="about-intro">Totals is a personal finance app for Ethiopian banks. It automatically reads your bank SMS notifications, tracks your transactions, and gives you a clear picture of your money, balances, spending, budgets, and more, all in one place.</p>
      </div>

      <div class="about-section">
        <div class="about-section-title">PRIVACY</div>
        <div class="about-card">
          <div class="about-privacy-item">
            <div class="about-privacy-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div class="about-privacy-text">
              <div class="about-privacy-title">100% Offline</div>
              <div class="about-privacy-desc">Totals never connects to any server. Your financial data stays on your device and your iCloud account, nowhere else.</div>
            </div>
          </div>
          <div class="about-privacy-item">
            <div class="about-privacy-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="about-privacy-text">
              <div class="about-privacy-title">No Accounts, No Sign-up</div>
              <div class="about-privacy-desc">No registration, no email, no phone number. There is no user account because there is no server. You are anonymous.</div>
            </div>
          </div>
          <div class="about-privacy-item">
            <div class="about-privacy-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <div class="about-privacy-text">
              <div class="about-privacy-title">No Tracking or Analytics</div>
              <div class="about-privacy-desc">Zero analytics, zero telemetry, zero third-party SDKs. No one, including us, can see how you use the app or what your data looks like.</div>
            </div>
          </div>
          <div class="about-privacy-item">
            <div class="about-privacy-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </div>
            <div class="about-privacy-text">
              <div class="about-privacy-title">Fully Open Source</div>
              <div class="about-privacy-desc">Every line of code is public. You can audit exactly what the app does. No hidden behavior, no obfuscation.</div>
            </div>
          </div>
          <div class="about-privacy-item">
            <div class="about-privacy-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div class="about-privacy-text">
              <div class="about-privacy-title">Your Data, Your Control</div>
              <div class="about-privacy-desc">All data is stored as plain text files in your iCloud Drive. You can read, edit, export, or delete them at any time. No lock-in.</div>
            </div>
          </div>
        </div>
      </div>

      <div class="about-section">
        <div class="about-section-title">HOW IT WORKS</div>
        <div class="about-card">
          <div class="about-how-step">
            <div class="about-how-num">1</div>
            <div class="about-how-text">iOS Shortcuts intercepts bank SMS notifications on your device</div>
          </div>
          <div class="about-how-step">
            <div class="about-how-num">2</div>
            <div class="about-how-text">Transactions are parsed locally and saved to a plain text file</div>
          </div>
          <div class="about-how-step">
            <div class="about-how-num">3</div>
            <div class="about-how-text">Totals reads the file and displays your dashboard, all on-device</div>
          </div>
        </div>
      </div>

      <div class="about-socials">
        <button class="about-social-btn" data-url="https://t.me/detached_totals"><svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M11.944 0A12 12 0 1 0 24 12.056A12.01 12.01 0 0 0 11.944 0Zm5.655 8.166c-.18 1.897-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.064-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.484-.429-.008-1.252-.242-1.865-.44-.751-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.1-.002.321.023.465.141a.506.506 0 0 1 .171.325c.016.093.036.306.02.472Z"/></svg></button>
        <button class="about-social-btn" data-url="https://github.com/detached-space"><svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></button>
        <button class="about-social-btn" data-url="https://x.com/detached_space"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></button>
      </div>

      <div class="about-footer">
        Made by Detached
      </div>
    </div>

    <!-- FAQ (sub-screen) -->
    <div id="faq-screen" class="you-subscreen hidden">
      <div class="you-subscreen-header">
        <button class="you-subscreen-back" id="faq-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 class="you-subscreen-title">FAQ</h2>
      </div>

      <div class="faq-list">
        <details class="faq-item">
          <summary class="faq-question">Is my financial data sent anywhere?</summary>
          <div class="faq-answer">No. Totals is 100% offline. Your data lives only on your device and in your personal iCloud Drive. There are no servers, no APIs, no network requests. The app literally cannot send data anywhere, it has no networking code.</div>
        </details>

        <details class="faq-item">
          <summary class="faq-question">Can the developers see my transactions?</summary>
          <div class="faq-answer">No. We have zero access to your data. There is no server-side component, no analytics, and no telemetry. The app is fully open source, you can verify this yourself by reading the code.</div>
        </details>

        <details class="faq-item">
          <summary class="faq-question">How does Totals read my bank SMS?</summary>
          <div class="faq-answer">Totals uses iOS Shortcuts automations that run locally on your device. When a bank SMS arrives, the shortcut parses it using pattern matching and saves the result to a text file in your iCloud Drive. The Totals app then reads that file to display your dashboard.</div>
        </details>

        <details class="faq-item">
          <summary class="faq-question">Which banks are supported?</summary>
          <div class="faq-answer">Currently supported: Commercial Bank of Ethiopia (CBE), Telebirr, Awash Bank, Bank of Abyssinia (BOA), Dashen Bank, Zemen Bank, Nib Bank, M-Pesa, and Amhara Bank. More banks are added through updates.</div>
        </details>

        <details class="faq-item">
          <summary class="faq-question">Where is my data stored?</summary>
          <div class="faq-answer">All data is stored as plain text files in <strong>iCloud Drive/Scriptable/</strong>. These are simple, human-readable files you can open with any text editor. You own them completely — they sync through your personal iCloud account, and no one else can access them.</div>
        </details>

        <details class="faq-item">
          <summary class="faq-question">Can I export or delete my data?</summary>
          <div class="faq-answer">Yes. Use the Export feature in the You tab to download your data as CSV. To delete everything, simply remove the data files from iCloud Drive/Scriptable/. There is no hidden data, no cached copies on any server, deleting the files is a complete and permanent deletion.</div>
        </details>

        <details class="faq-item">
          <summary class="faq-question">What does "Check for Updates" do?</summary>
          <div class="faq-answer">It downloads the latest bank definitions, SMS patterns, and app code from the public GitHub repository. This is the only time Totals makes a network request, and only when you explicitly tap the button. No personal data is sent.</div>
        </details>

        <details class="faq-item">
          <summary class="faq-question">Does Totals work without internet?</summary>
          <div class="faq-answer">Yes. The entire app runs offline. Internet is only needed for manual updates (Check for Updates) and iCloud sync of your data files between your own devices.</div>
        </details>

        <details class="faq-item">
          <summary class="faq-question">Is Totals free?</summary>
          <div class="faq-answer">Yes, completely free and open source. No subscriptions, no ads, no in-app purchases. If you'd like to support development, you can buy us a coffee through the Support link.</div>
        </details>

        <details class="faq-item">
          <summary class="faq-question">Why does it need Scriptable?</summary>
          <div class="faq-answer">Scriptable is an iOS app that lets you run JavaScript with access to system features like file storage and widgets. Totals runs inside Scriptable because it provides a lightweight way to build a full app without going through the App Store, keeping the app free, open source, and under your control.</div>
        </details>
      </div>
    </div>

  </div>
</div>

<!-- Bottom Navigation -->
<nav class="bottom-nav">
  <button class="nav-item active" data-screen="home">
    <svg class="ico-light" viewBox="0 0 256 256" fill="currentColor"><path d="M217.9,110.1l-80-80a14,14,0,0,0-19.8,0l-80,80A13.92,13.92,0,0,0,34,120v96a6,6,0,0,0,6,6h64a6,6,0,0,0,6-6V158h36v58a6,6,0,0,0,6,6h64a6,6,0,0,0,6-6V120A13.92,13.92,0,0,0,217.9,110.1ZM210,210H158V152a6,6,0,0,0-6-6H104a6,6,0,0,0-6,6v58H46V120a2,2,0,0,1,.58-1.42l80-80a2,2,0,0,1,2.84,0l80,80A2,2,0,0,1,210,120Z"/></svg>
    <svg class="ico-fill" viewBox="0 0 256 256" fill="currentColor"><path d="M224,120v96a8,8,0,0,1-8,8H160a8,8,0,0,1-8-8V164a4,4,0,0,0-4-4H108a4,4,0,0,0-4,4v52a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V120a16,16,0,0,1,4.69-11.31l80-80a16,16,0,0,1,22.62,0l80,80A16,16,0,0,1,224,120Z"/></svg>
    <span>Home</span>
  </button>
  <button class="nav-item" data-screen="money">
    <svg class="ico-light" viewBox="0 0 256 256" fill="currentColor"><path d="M216,66H56a10,10,0,0,1,0-20H192a6,6,0,0,0,0-12H56A22,22,0,0,0,34,56V184a22,22,0,0,0,22,22H216a14,14,0,0,0,14-14V80A14,14,0,0,0,216,66Zm2,126a2,2,0,0,1-2,2H56a10,10,0,0,1-10-10V75.59A21.84,21.84,0,0,0,56,78H216a2,2,0,0,1,2,2Zm-28-60a10,10,0,1,1-10-10A10,10,0,0,1,190,132Z"/></svg>
    <svg class="ico-fill" viewBox="0 0 256 256" fill="currentColor"><path d="M216,64H56a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H56A24,24,0,0,0,32,56V184a24,24,0,0,0,24,24H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64Zm-36,80a12,12,0,1,1,12-12A12,12,0,0,1,180,144Z"/></svg>
    <span>Money</span>
  </button>
  <button class="nav-item" data-screen="budget">
    <svg class="ico-light" viewBox="0 0 256 256" fill="currentColor"><path d="M190,116a10,10,0,1,1-10-10A10,10,0,0,1,190,116ZM152,66H112a6,6,0,0,0,0,12h40a6,6,0,0,0,0-12Zm94,46v32a22,22,0,0,1-22,22h-3.77l-16.68,46.71A14,14,0,0,1,190.36,222H177.64a14,14,0,0,1-13.19-9.29L162.06,206H101.94l-2.39,6.71A14,14,0,0,1,86.36,222H73.64a14,14,0,0,1-13.19-9.29L47.76,177.18a85.72,85.72,0,0,1-21.47-50.24A18,18,0,0,0,14,144a6,6,0,0,1-12,0,30,30,0,0,1,24.19-29.43A86.1,86.1,0,0,1,112,34H216a6,6,0,0,1,0,12H187.82a85.92,85.92,0,0,1,35.12,39.83c.6,1.38,1.16,2.77,1.68,4.18A22,22,0,0,1,246,112Zm-12,0a10,10,0,0,0-10-10h-3.66a6,6,0,0,1-5.73-4.2,71.4,71.4,0,0,0-2.68-7.19A74,74,0,0,0,144,46H112A74,74,0,0,0,57.44,170a5.81,5.81,0,0,1,1.22,2l13.09,36.64A2,2,0,0,0,73.64,210H86.36a2,2,0,0,0,1.89-1.33L92.06,198a6,6,0,0,1,5.65-4h68.58a6,6,0,0,1,5.65,4l3.81,10.69a2,2,0,0,0,1.89,1.33h12.72a2,2,0,0,0,1.89-1.33L210.35,158a6,6,0,0,1,5.65-4h8a10,10,0,0,0,10-10Z"/></svg>
    <svg class="ico-fill" viewBox="0 0 256 256" fill="currentColor"><path d="M226,88.08c-.4-1-.82-2-1.25-3a87.93,87.93,0,0,0-30.17-37H216a8,8,0,0,0,0-16H112a88.12,88.12,0,0,0-87.72,81A32,32,0,0,0,0,144a8,8,0,0,0,16,0,16,16,0,0,1,8.57-14.16A87.69,87.69,0,0,0,46,178.22l12.56,35.16A16,16,0,0,0,73.64,224H86.36a16,16,0,0,0,15.07-10.62l1.92-5.38h57.3l1.92,5.38A16,16,0,0,0,177.64,224h12.72a16,16,0,0,0,15.07-10.62L221.64,168H224a24,24,0,0,0,24-24V112A24,24,0,0,0,226,88.08ZM152,72H112a8,8,0,0,1,0-16h40a8,8,0,0,1,0,16Zm28,56a12,12,0,1,1,12-12A12,12,0,0,1,180,128Z"/></svg>
    <span>Budget</span>
  </button>
  <button class="nav-item" data-screen="tools">
    <svg class="ico-light" viewBox="0 0 256 256" fill="currentColor"><path d="M128,82a46,46,0,1,0,46,46A46.06,46.06,0,0,0,128,82Zm0,80a34,34,0,1,1,34-34A34,34,0,0,1,128,162Zm94.72-94.09-88-48.18a13.9,13.9,0,0,0-13.44,0l-88,48.18A14,14,0,0,0,26,80.18v95.64a14,14,0,0,0,7.28,12.27l88,48.18a13.92,13.92,0,0,0,13.44,0l88-48.18A14,14,0,0,0,230,175.82V80.18A14,14,0,0,0,222.72,67.91ZM218,175.82a2,2,0,0,1-1,1.75l-88,48.18a2,2,0,0,1-1.92,0L39,177.57a2,2,0,0,1-1-1.75V80.18a2,2,0,0,1,1-1.75l88-48.18a2,2,0,0,1,1.92,0l88,48.18a2,2,0,0,1,1,1.75Z"/></svg>
    <svg class="ico-fill" viewBox="0 0 256 256" fill="currentColor"><path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,168a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z"/></svg>
    <span>Tools</span>
  </button>
  <button class="nav-item" data-screen="profile" id="nav-profile-btn">
    <svg class="ico-light" viewBox="0 0 256 256" fill="currentColor"><path d="M229.19,213c-15.81-27.32-40.63-46.49-69.47-54.62a70,70,0,1,0-63.44,0C67.44,166.5,42.62,185.67,26.81,213a6,6,0,1,0,10.38,6C56.4,185.81,90.34,166,128,166s71.6,19.81,90.81,53a6,6,0,1,0,10.38-6ZM70,96a58,58,0,1,1,58,58A58.07,58.07,0,0,1,70,96Z"/></svg>
    <svg class="ico-fill" viewBox="0 0 256 256" fill="currentColor"><path d="M230.93,220a8,8,0,0,1-6.93,4H32a8,8,0,0,1-6.92-12c15.23-26.33,38.7-45.21,66.09-54.16a72,72,0,1,1,73.66,0c27.39,8.95,50.86,27.83,66.09,54.16A8,8,0,0,1,230.93,220Z"/></svg>
    <span>You</span>
    <div class="nav-profile-dot hidden" id="nav-profile-dot"></div>
  </button>
</nav>

<!-- Profile Dropdown (long-press on You icon) -->
<div class="profile-dropdown hidden" id="profile-dropdown"></div>

<!-- Floating Action Button -->
<button class="fab hidden" id="fab-add-account" aria-label="Add Account">
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
</button>

<!-- Cash Expense Modal -->
<div class="modal-overlay" id="cash-expense-modal">
  <div class="modal-content">
    <div class="modal-handle"></div>
    <div class="modal-header">
      <span class="modal-title">Cash Expense</span>
      <button class="modal-close" id="cash-expense-modal-close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <form id="cash-expense-form">
      <div class="form-group">
        <label class="form-label" for="cash-expense-amount">Amount (ETB)</label>
        <input type="text" inputmode="decimal" class="form-input cash-expense-amount-input" id="cash-expense-amount" placeholder="0.00" required/>
      </div>
      <div class="form-group">
        <label class="form-label" for="cash-expense-receiver">Paid to</label>
        <input type="text" class="form-input" id="cash-expense-receiver" placeholder="e.g., Coffee shop, Taxi..."/>
      </div>
      <div class="form-group">
        <label class="form-label" for="cash-expense-date">Date</label>
        <input type="datetime-local" class="form-input" id="cash-expense-date"/>
      </div>
      <div class="form-group" id="cash-expense-profile-group">
        <label class="form-label">Profile</label>
        <div class="cash-expense-categories" id="cash-expense-profiles"></div>
      </div>
      <div class="form-group">
        <label class="form-label">Category</label>
        <div class="cash-expense-categories" id="cash-expense-categories"></div>
        <div class="cash-cat-create hidden" id="cash-expense-cat-create">
          <input type="text" class="cash-cat-create-input" id="cash-expense-cat-input" placeholder="Category name" maxlength="24"/>
          <input type="color" class="cash-cat-create-color" id="cash-expense-cat-color" value="#6b7280"/>
          <button type="button" class="cash-cat-create-save" id="cash-expense-cat-save">Add</button>
        </div>
      </div>
      <button type="submit" class="form-submit">
        <span>Add Expense</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M5 12l5 5L20 7"/></svg>
      </button>
    </form>
  </div>
</div>

<!-- Cash Income Modal -->
<div class="modal-overlay" id="cash-income-modal">
  <div class="modal-content">
    <div class="modal-handle"></div>
    <div class="modal-header">
      <span class="modal-title">Cash Income</span>
      <button class="modal-close" id="cash-income-modal-close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <form id="cash-income-form">
      <div class="form-group">
        <label class="form-label" for="cash-income-amount">Amount (ETB)</label>
        <input type="text" inputmode="decimal" class="form-input cash-expense-amount-input" id="cash-income-amount" placeholder="0.00" required/>
      </div>
      <div class="form-group">
        <label class="form-label" for="cash-income-source">Received from</label>
        <input type="text" class="form-input" id="cash-income-source" placeholder="e.g., Salary, Gift, Freelance..."/>
      </div>
      <div class="form-group">
        <label class="form-label" for="cash-income-date">Date</label>
        <input type="datetime-local" class="form-input" id="cash-income-date"/>
      </div>
      <div class="form-group" id="cash-income-profile-group">
        <label class="form-label">Profile</label>
        <div class="cash-expense-categories" id="cash-income-profiles"></div>
      </div>
      <div class="form-group">
        <label class="form-label">Category</label>
        <div class="cash-expense-categories" id="cash-income-categories"></div>
        <div class="cash-cat-create hidden" id="cash-income-cat-create">
          <input type="text" class="cash-cat-create-input" id="cash-income-cat-input" placeholder="Category name" maxlength="24"/>
          <input type="color" class="cash-cat-create-color" id="cash-income-cat-color" value="#6b7280"/>
          <button type="button" class="cash-cat-create-save" id="cash-income-cat-save">Add</button>
        </div>
      </div>
      <button type="submit" class="form-submit">
        <span>Add Income</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M5 12l5 5L20 7"/></svg>
      </button>
    </form>
  </div>
</div>

<!-- Transaction Detail Modal -->
<div class="modal-overlay" id="transaction-modal">
  <div class="modal-content">
    <div class="modal-handle"></div>
    <div class="modal-header">
      <button class="modal-close" id="modal-close">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          width="16"
          height="16"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
    <div id="modal-body"></div>
  </div>
</div>

<!-- Add Account Modal -->
<div class="modal-overlay" id="add-account-modal">
  <div class="modal-content">
    <div class="modal-handle"></div>
    <div class="modal-header">
      <span class="modal-title" id="add-account-modal-title">Add Account</span>
      <button class="modal-close" id="add-account-modal-close">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          width="16"
          height="16"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
    <form id="add-account-form">
      <div class="form-group">
        <label class="form-label" for="account-bank">Bank</label>
        <div class="bank-selector" id="bank-selector">
          <div class="bank-selector-selected" id="bank-selector-selected">
            <span class="bank-selector-placeholder">Select a bank</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              width="20"
              height="20"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <div
            class="bank-selector-dropdown hidden"
            id="bank-selector-dropdown"
          ></div>
        </div>
        <input type="hidden" id="account-bank-id" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="account-name">Account Name</label>
        <input
          type="text"
          class="form-input"
          id="account-name"
          placeholder="e.g., Main Savings"
          required
        />
      </div>
      <div class="form-group">
        <label class="form-label" for="account-number"
          >Account Number</label
        >
        <input
          type="text"
          class="form-input"
          id="account-number"
          placeholder="e.g., 1000123456789"
          required
        />
      </div>
      <div id="submit-feedback" class="submit-feedback hidden"></div>
      <button type="submit" class="form-submit" id="add-account-submit">
        <span>Add Account</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          width="20"
          height="20"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </form>
  </div>
</div>

<!-- Filter Modal -->
<div class="modal-overlay" id="filter-modal">
  <div class="modal-content filter-modal-content">
    <div class="modal-handle"></div>
    <div class="filter-header">
      <button class="filter-header-clear" id="filter-clear">Reset</button>
      <span class="filter-header-title">Filters</span>
      <button class="filter-header-apply" id="filter-apply">Apply</button>
    </div>

    <div class="filter-body">
      <div class="filter-section">
        <div class="filter-section-title">Type</div>
        <div class="filter-chips" id="filter-type-chips">
          <div class="filter-chip active" data-type="all">All</div>
          <div class="filter-chip" data-type="expense">Expense</div>
          <div class="filter-chip" data-type="income">Income</div>
        </div>
      </div>

      <div class="filter-section">
        <div class="filter-section-title">Bank</div>
        <div class="filter-chips" id="filter-bank-chips"></div>
      </div>

      <div class="filter-section">
        <div class="filter-section-title">Account</div>
        <div class="filter-chips" id="filter-account-chips"></div>
      </div>

      <div class="filter-section">
        <div class="filter-section-title">Category</div>
        <div class="filter-chips" id="filter-category-chips"></div>
      </div>

      <div class="filter-section">
        <div class="filter-section-title">Date Range</div>
        <div class="filter-date-row">
          <div class="date-btn-wrap">
            <button class="date-btn" id="filter-start-btn">Start date</button>
            <input type="date" class="date-btn-input" id="filter-date-start" />
          </div>
          <span class="filter-date-sep">—</span>
          <div class="date-btn-wrap">
            <button class="date-btn" id="filter-end-btn">End date</button>
            <input type="date" class="date-btn-input" id="filter-date-end" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Budget Modal -->
<div class="modal-overlay" id="budget-modal">
  <div class="modal-content">
    <div class="modal-handle"></div>
    <div class="modal-header">
      <span class="modal-title" id="budget-modal-title">New Budget</span>
      <button class="modal-close" id="budget-modal-close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
    <div class="form-group">
      <label class="form-label">Group</label>
      <div class="budget-selector" id="budget-group-selector">
        <div class="budget-selector-selected" id="budget-group-selected">
          <span>Needs</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="budget-selector-dropdown hidden" id="budget-group-dropdown"></div>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Categories</label>
      <div class="budget-category-chips" id="budget-category-chips"></div>
    </div>
    <div class="form-group">
      <label class="form-label">Name</label>
      <input type="text" class="form-input budget-name-input" id="budget-name-input" placeholder="e.g., Food & Dining" maxlength="30" />
    </div>
    <div class="form-group">
      <label class="form-label">Assigned Amount</label>
      <div class="budget-amount-input-wrap">
        <span class="budget-amount-prefix">ETB</span>
        <input type="number" class="form-input budget-amount-input" id="budget-assigned-input" placeholder="0" min="0" step="1" />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Type</label>
      <div class="budget-type-toggle">
        <button class="budget-type-btn active" id="budget-type-recurring">Recurring</button>
        <button class="budget-type-btn" id="budget-type-onetime">One-time</button>
      </div>
    </div>
    <div class="form-group hidden" id="budget-month-group">
      <label class="form-label">Target Month</label>
      <div class="date-btn-wrap">
        <button class="date-btn" id="budget-target-month-btn">Select month</button>
        <input type="date" class="date-btn-input" id="budget-target-month-input" />
      </div>
    </div>
    <div id="budget-modal-feedback" class="submit-feedback hidden"></div>
    <button class="form-submit" id="budget-modal-submit">
      <span>Save Budget</span>
    </button>
    <div class="budget-edit-scope hidden" id="budget-edit-scope">
      <div class="budget-edit-scope-label">Apply changes to:</div>
      <button class="budget-edit-scope-btn primary" id="budget-scope-all-future">All Future Months</button>
      <button class="budget-edit-scope-btn secondary" id="budget-scope-this-month">This Month Only</button>
    </div>
    <button class="budget-delete-btn hidden" id="budget-modal-delete">Delete Budget</button>
  </div>
</div>

<!-- Add Contact Modal -->
<div class="modal-overlay" id="add-contact-modal">
  <div class="modal-content">
    <div class="modal-handle"></div>
    <div class="modal-header">
      <span class="modal-title" id="add-contact-modal-title">Add Contact</span>
      <button class="modal-close" id="add-contact-modal-close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <form id="add-contact-form">
      <div class="form-group">
        <label class="form-label">Bank</label>
        <div class="bank-selector" id="contact-bank-selector">
          <div class="bank-selector-selected" id="contact-bank-selected">
            <span class="bank-selector-placeholder">Select a bank</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <div class="bank-selector-dropdown hidden" id="contact-bank-dropdown"></div>
        </div>
        <input type="hidden" id="contact-bank-id" required/>
      </div>
      <div class="form-group">
        <label class="form-label" for="contact-name">Name</label>
        <input type="text" class="form-input" id="contact-name" placeholder="e.g., Abebe Bikila" required/>
      </div>
      <div class="form-group">
        <label class="form-label" for="contact-number">Account Number</label>
        <input type="text" class="form-input" id="contact-number" placeholder="e.g., 1000123456789" required/>
      </div>
      <div id="contact-submit-feedback" class="submit-feedback hidden"></div>
      <button type="button" class="form-submit danger hidden" id="add-contact-delete">
        <span>Delete Contact</span>
      </button>
      <button type="submit" class="form-submit" id="add-contact-submit">
        <span id="add-contact-submit-text">Add Contact</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </form>
  </div>
</div>

<!-- Scan QR Modal -->
<div class="modal-overlay" id="scan-qr-modal">
  <div class="modal-content">
    <div class="modal-handle"></div>
    <div class="modal-header">
      <h2 class="modal-title" id="scan-qr-title">Scan QR Code</h2>
      <button class="modal-close" id="scan-qr-modal-close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Step 1: Capture / Paste -->
    <div id="scan-qr-step1" class="scan-qr-step">
      <p class="scan-qr-hint">Scan a Totals QR code to import accounts</p>
      <div class="scan-qr-actions">
        <button type="button" class="scan-qr-capture-btn" id="scan-qr-capture-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <span>Take Photo</span>
        </button>
        <input type="file" accept="image/*" capture="environment" id="scan-qr-file-input" style="position:absolute;width:0;height:0;overflow:hidden;opacity:0"/>
        <button class="scan-qr-paste-btn" id="scan-qr-paste-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
          <span>Paste Data</span>
        </button>
      </div>
      <div id="scan-qr-error" class="submit-feedback error hidden"><span></span></div>
    </div>

    <!-- Step 2: Review & Save -->
    <div id="scan-qr-step2" class="scan-qr-step hidden">
      <div class="form-group">
        <label class="form-label" for="scan-qr-name">Contact Name</label>
        <input type="text" class="form-input" id="scan-qr-name" placeholder="e.g., Friend's name"/>
      </div>
      <div class="scan-qr-accounts-header">
        <span>Accounts found</span>
        <span id="scan-qr-accounts-count" class="scan-qr-accounts-badge"></span>
      </div>
      <div id="scan-qr-accounts-list" class="scan-qr-accounts-list"></div>
      <div id="scan-qr-save-feedback" class="submit-feedback hidden"><span></span></div>
      <button class="form-submit" id="scan-qr-save-btn">
        <span>Save Contacts</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <line x1="5" y1="12" x2="19" y2="12"/>
          <polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </div>
  </div>
</div>

<!-- Profile List Modal (manage profiles) -->
<div class="modal-overlay" id="profile-list-modal">
  <div class="modal-content">
    <div class="modal-handle"></div>
    <div class="modal-header">
      <h2 class="modal-title">Profiles</h2>
      <button class="modal-close" id="profile-list-modal-close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div id="profile-list" class="profile-list"></div>
    <button class="profile-add-btn" id="profile-add-btn">+ Add Profile</button>
  </div>
</div>

<!-- Profile Edit Modal -->
<div class="modal-overlay" id="profile-modal">
  <div class="modal-content">
    <div class="modal-handle"></div>
    <div class="modal-header">
      <h2 class="modal-title" id="profile-modal-title">New Profile</h2>
      <button class="modal-close" id="profile-modal-close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="form-group">
      <label class="form-label" for="profile-name-input">Profile Name</label>
      <input type="text" class="form-input" id="profile-name-input" placeholder="e.g., Personal" maxlength="30"/>
    </div>
    <div class="form-group">
      <label class="form-label">Color</label>
      <div class="profile-color-picker" id="profile-color-picker"></div>
    </div>
    <div class="form-group">
      <label class="form-label">Accounts</label>
      <div id="profile-accounts-list" class="profile-accounts-list"></div>
    </div>
    <div id="profile-modal-feedback" class="submit-feedback hidden"></div>
    <button class="form-submit" id="profile-modal-submit">
      <span>Save Profile</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </button>
    <button class="budget-delete-btn hidden" id="profile-modal-delete">Delete Profile</button>
  </div>
</div>

<!-- QR Code Modal -->
<div class="modal-overlay" id="qr-modal">
  <div class="modal-content">
    <div class="modal-handle"></div>
    <div class="modal-header">
      <span class="modal-title">Share Accounts</span>
      <button class="modal-close" id="qr-modal-close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
    <div id="qr-modal-body" class="qr-modal-body"></div>
  </div>
</div>
