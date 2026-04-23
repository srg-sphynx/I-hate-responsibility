# I Hate Responsibility 🤷‍♂️🏃💨

> The world's most sophisticated excuse generator.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Powered By: BaaS](https://img.shields.io/badge/Powered_by-Blame_as_a_Service-3b82f6.svg)](https://github.com/sbmagar13/blame-as-a-service)
[![GitHub Pages](https://img.shields.io/badge/Live-GitHub_Pages-22c55e.svg)](https://srg-sphynx.github.io/I-hate-responsibility/)

A sleek, feature-rich web app that generates professional and hilarious excuses to help you dodge responsibility — at work, at home, or anywhere else. Built with vanilla HTML, CSS, and JavaScript.

**[🚀 Live Demo](https://srg-sphynx.github.io/I-hate-responsibility/)**

---

## ✨ Features

### 🎲 Five Generation Modes
| Mode | Description |
|------|-------------|
| **Random** | Get a random rich excuse with full metadata |
| **Category** | Pick from 10 categories: Cosmic, Technical, Management, Team, Environmental, Legacy, User, AI/ML, Cloud, Security |
| **Severity** | Filter by severity: 🟢 Minor, 🟡 Moderate, 🔴 Catastrophic |
| **Roulette** | Get 2–10 excuses at once with a slider control |
| **ASCII Art** | Get excuses rendered as ASCII art in 4 styles: Box, Banner, Simple, Dramatic |

### 🎯 Core Features
- **Rich Metadata** — Category, severity level, quality score, and believability rating
- **Copy to Clipboard** — One-click copy on every excuse
- **Local History** — Your excuses are saved to `localStorage` (privacy-first, no servers)
- **Blame Roulette** — Spin for multiple excuses at once
- **ASCII Art Mode** — Generate text-art excuses perfect for Slack or terminals

### 🎨 Premium UI
- Dark mode with blue accent glassmorphism design
- Animated particle background
- Micro-animations: ripples, shakes, emoji bursts
- Fully responsive (mobile, tablet, desktop)

---

## 🚀 How It Works

This app uses the open-source **[Blame as a Service API](https://github.com/sbmagar13/blame-as-a-service)** by [@sbmagar13](https://github.com/sbmagar13).

### API Endpoints Used
| Endpoint | Purpose |
|----------|---------|
| `GET /blame/rich` | Random excuse with detailed metadata |
| `GET /blame/category/{cat}` | Excuse from a specific category |
| `GET /blame/severity/{level}` | Excuse filtered by severity |
| `GET /blame/multiple?count=N` | Multiple excuses at once |
| `GET /blame/ascii?style=X` | ASCII art formatted excuse |

Base URL: `https://baas.budhathokisagar.com.np`

---

## 🛠️ Local Development

No build tools, no `npm install`, no nonsense.

```bash
git clone https://github.com/srg-sphynx/I-hate-responsibility.git
cd I-hate-responsibility
# Open index.html in your browser
open index.html
```

---

## 🔒 Privacy

- **No tracking, no analytics, no ads**
- All data stored in `localStorage` on your device
- You can clear history at any time
- [Full Privacy Policy](https://srg-sphynx.github.io/I-hate-responsibility/privacy.html)

---

## 📄 License

MIT — Do whatever you want, just don't blame yourself.

---

<p align="center">
  Made with 💀 by developers who definitely didn't break production<br>
  <a href="https://srg-sphynx.github.io/I-hate-responsibility/">Live Demo</a> · <a href="https://github.com/sbmagar13/blame-as-a-service">BaaS API</a>
</p>
