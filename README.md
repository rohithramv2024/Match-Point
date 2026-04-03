# Match-Point 🎾
### A Personal Tennis Match Tracker

Match-Point is a browser-based tennis match tracking web app built with vanilla HTML, CSS, and JavaScript. Log your matches, analyze your performance stats, and track your improvement over time — all stored locally in your browser with no backend required.

---

## Project Info

| Field        | Details                            |
|--------------|------------------------------------|
| Course       | BCSE203E — Web Programming         |
| Assignment   | Digital Assignment II              |
| Semester     | Winter 2025 – 2026                 |
| Developer    | Rohith Ram V (24BCE0543)           |
| Institution  | VIT Bengaluru                      |

---

## Live Demo

> GitHub Pages: `https://<your-username>.github.io/match-point`

---

## Features

### Core
- **Landing Page** — Clay Court Sunset themed welcome screen with animated court lines and floating tennis balls
- **Dashboard** — Win rate, total matches, wins, losses, current streak, surface breakdown, head-to-head records, and recent match preview
- **Log Match** — Form to record opponent, date, set scores, surface, and result
- **Match History** — Full match log with filter chips (All / Wins / Losses / by surface) and per-match delete
- **LocalStorage Persistence** — All data survives page refresh with no server needed
- **Reset** — One-click data wipe for testing and fresh starts

### Advanced Stats (V1.4)
Accessible via the Advanced Stats toggle in Log Match:
- Aces
- Double Faults
- Winners
- Unforced Errors
- Break Points Won
- Break Points Faced

All advanced stats are stored per match and displayed on match cards in Match History.

---

## Version History

| Version | What was built                                              |
|---------|-------------------------------------------------------------|
| V1.0    | Base HTML structure + full CSS styling (3 separate files)   |
| V1.1    | JavaScript — tab switching, form logic, dashboard rendering |
| V1.2    | Animations + localStorage persistence                       |
| V1.3    | Reset button, final polish                                  |
| V1.4    | Advanced match stats (aces, double faults, winners, etc.)   |

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Markup     | HTML5                             |
| Styling    | CSS3 (custom properties, grid, flexbox) |
| Logic      | Vanilla JavaScript (ES6+)         |
| Storage    | Browser localStorage              |
| Fonts      | Google Fonts — Bebas Neue, DM Sans |
| Hosting    | GitHub Pages                      |

No frameworks, no build tools, no dependencies beyond Google Fonts.

---

## File Structure

```
match-point/
│
├── index.html       # Full page structure — landing + app
├── style.css        # All styling, Clay Court Sunset theme
├── script.js        # All JavaScript logic
└── README.md        # This file
```

---

## Design Theme

**Clay Court Sunset** — inspired by Roland Garros.

| Element         | Value                        |
|-----------------|------------------------------|
| Primary         | `#B8471C` — terracotta clay  |
| Deep            | `#7A2E0E` — burnt umber      |
| Accent          | `#F0C040` — golden yellow    |
| Background      | `#FFF8F2` — warm cream       |
| Win color       | `#28823C` — court green      |
| Loss color      | `#B82818` — fault red        |
| Display font    | Bebas Neue                   |
| Body font       | DM Sans                      |

---

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/match-point.git
   ```
2. Open `index.html` in any modern browser. No server or install needed.

---

## GitHub Pages Deployment

1. Push all files to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)`
4. Your site will be live at `https://<your-username>.github.io/match-point`

---

## Notes

- All data is stored in `localStorage` under the key `tennis_matches`. Clearing browser data will wipe match history.
- The advanced stats fields are optional — matches can be saved without them.
- Designed and tested on Chrome and Firefox.
