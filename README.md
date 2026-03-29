# Totals for iOS

<p align="center">
  <img src="totals.png" alt="Totals app screenshots" width="600" />
</p>

A personal finance tracker for Ethiopian banks. It reads your bank SMS notifications and turns them into a clear, organized dashboard across all your banks, in one place.

In Ethiopia, every bank transaction triggers an SMS. Totals captures these messages, parses them, and builds your complete financial picture without you typing a single number.

## The Problem

Ethiopian banks don't talk to each other. If you have accounts at CBE, Awash, and Telebirr (which most people do), there's no way to see your total balance or track where your money is going. International finance apps don't support Ethiopian banks at all.

The only universal record of your transactions is SMS. Every bank sends them. Totals uses that.

## How It Works

Apple doesn't let apps read SMS directly. Totals works around this using **iOS Shortcuts** and **Scriptable**.

```
Bank SMS > iOS Shortcuts automation > parse & save > Scriptable WebView dashboard
```

1. An iOS Shortcuts automation triggers on any SMS containing "ETB"
2. The shortcut parses the SMS using regex patterns and appends a JSON transaction to iCloud Drive
3. The Totals script (running in [Scriptable](https://scriptable.app)) reads the data and renders a full dashboard

Setup requires a one-time configuration, but once done, everything is automatic.

## Supported Banks

| Bank | Type |
|------|------|
| Commercial Bank of Ethiopia (CBE) | Bank |
| Awash Bank | Bank |
| Bank of Abyssinia (BOA) | Bank |
| Dashen Bank | Bank |
| Zemen Bank | Bank |
| Nib Bank | Bank |
| Amhara Bank | Bank |
| Telebirr | Mobile Money |
| M-Pesa | Mobile Money |

Each bank has multiple SMS formats for different transaction types: transfers, deposits, withdrawals, agent transactions, airtime, fees, and more.

## Features

- **Multi-bank dashboard** - Total balance, daily/weekly summaries, recent transactions, and charts on one screen
- **Transaction tracking** - Every parsed SMS becomes a searchable, filterable record. Filter by bank, account, date, type, or category
- **Categories** - Tag transactions as Food, Transport, Rent, etc. Create custom categories. Set up auto-categorization rules
- **Budgeting** - YNAB-inspired budgeting with category groups, monthly assignments, progress tracking, and spending pace
- **Multiple accounts** - Name and organize accounts across all your banks
- **QR sharing** - Generate QR codes with your bank details for easy sharing
- **Tools** - Contacts (saved bank details), manual SMS parser, failed message review, payment verifier
- **Charts** - Spending breakdowns by bank/category, income vs expense, trends over time

## Privacy

- Everything stays on your device. No servers, no accounts, no sign-ups
- No internet required. Works completely offline
- SMS parsing is local. Your messages are never sent anywhere
- No tracking, no analytics, no telemetry, no ads
- Account numbers are masked in the display

## Setup

### Prerequisites

- iPhone running iOS 16+
- [Scriptable](https://apps.apple.com/app/scriptable/id1405459188) app installed

### Quick Start

1. Open the Totals app. The onboarding guide will walk you through each step
2. **Download assets** - banks.json, sms_patterns.json, and logo
3. **Install the SMS shortcut** - adds the parsing shortcut to your Shortcuts app
4. **Link automation** - create a Shortcuts automation that triggers on SMS containing "ETB", set to Run Immediately, and linked to the Totals shortcut
5. **Optional** - add to Home Screen, add your first account

That's it. Incoming bank SMS messages will be automatically parsed and appear in the app.

## Development

The app is a self-contained HTML/CSS/JS dashboard rendered in Scriptable's WebView. No npm, no frameworks, no bundlers.

### Project Structure

```
totals-ios/
  banks.json              # Bank definitions (names, colors, SMS codes)
  sms_patterns.json       # Regex patterns for parsing bank SMS
  web-view/
    build.sh              # Concatenation build script
    styles.css            # All CSS
    body.inc              # HTML body markup
    js/
      01-persist.js       # Scriptable message passing
      02-parser.js        # NDJSON parser, categories
      03-state.js         # State object, data initialization
      04-analytics.js     # Analytics calculations, formatting
      05-dom.js           # DOM helpers, render functions
      06-filters.js       # Transaction filtering
      07-ui.js            # Screen update functions, budget UI
      08-charts.js        # Canvas chart drawing
      09-nav.js           # Navigation, theme toggle
      10-modals.js        # Modals (account, filter, budget)
      11-events.js        # Event listeners, init bootstrap
    dev-data/             # Sample data for local development
    dev.html              # Dev entry point (loads source files directly)
    serve.sh              # Local dev server
```

### Local Development

Run the app in a browser with sample data, no iPhone or Scriptable needed:

```bash
bash web-view/serve.sh        # starts server on :3000, opens browser
```

Or manually:

```bash
python -m http.server 3000    # from project root, then open localhost:3000/web-view/dev.html
```

Changes to source files in `web-view/` are reflected immediately on refresh (no build step needed for dev).

### Building

```bash
bash web-view/build.sh
```

This concatenates all source files into two outputs:
- `totals.html` - standalone HTML file
- `totals.js` - single-file Scriptable script with HTML embedded

### Data Format

Transactions are stored as NDJSON (one JSON object per line):

```json
{"amount":"1,500.00","reference":"FT12345ABC","account":"1000123456789","receiver":"JOHN DOE","balance":"23,048.49.","bankId":"1","timestamp":"2026-01-23T14:13:47+03:00"}
```

All data files live in `iCloud Drive/Scriptable/` and sync via iCloud.

## Contributing

Contributions are welcome. Some areas that could use help:

- **New bank patterns** - Add SMS patterns for banks not yet supported
- **Pattern fixes** - If a bank SMS isn't being parsed correctly, submit the (anonymized) message format and a fix
- **UI improvements** - The dashboard is pure HTML/CSS/JS, easy to hack on
- **Bug reports** - Open an issue with steps to reproduce

### Adding a New Bank SMS Pattern

1. Add the bank to `banks.json` if it's not already there
2. Add regex patterns to `sms_patterns.json` matching the bank's SMS formats
3. Test with sample messages in the dev environment
4. Submit a PR

## License

[MIT](LICENSE)
