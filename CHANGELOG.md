# Changelog

## v1.0.0 - 2026-03-29

First public release.

### App

- Single-screen dashboard with total balance, daily/weekly summaries, recent transactions, and income vs expense chart
- Activity tab with three subtabs: searchable transaction list, analytics charts, and chronological ledger
- Accounts tab with bank carousel, bank grid, account cards, and per-bank detail views
- Budget screen inspired by YNAB: month navigation, category groups (Needs/Wants/Savings), assigned amounts, progress bars, spending pace, and transaction breakdown
- Tools tab: contacts manager, manual SMS parser, failed message review, payment verifier
- Profile tab: category manager, custom categories, auto-categorization rules, theme toggle, check for updates, FAQ, about screen
- QR code generation and scanning for sharing bank account details
- Filter and search transactions by bank, account, date range, income/expense, category, or text
- Dark mode, light mode, and system preference
- Guided onboarding with step-by-step setup checklist and screen tour
- All data stored locally on device (iCloud Drive). No servers, no accounts, no tracking

### SMS Parsing

- Supported banks: CBE, Awash, BOA, Dashen, Zemen, NIB, Amhara Bank, Telebirr, M-Pesa
- Transaction types: transfers (in/out), deposits, withdrawals, agent transactions, airtime purchases, fee deductions, QR payments, bill payments, and more
- Automatic parsing via iOS Shortcuts automation triggered on SMS containing "ETB"
- Manual SMS paste-and-parse via Tools tab

### Development

- Local dev server with sample data (`bash web-view/serve.sh`)
- Modular source files in `web-view/` with cat-based build (`bash web-view/build.sh`)
- No dependencies, no npm, no frameworks
