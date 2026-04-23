# I Hate Responsibility 🤷‍♂️🏃💨

> The world's most sophisticated excuse generator.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Powered By: BaaS](https://img.shields.io/badge/Powered_by-Blame_as_a_Service-ff69b4.svg)](https://github.com/sbmagar13/blame-as-a-service)

A sleek, responsive, vanilla web application that generates professional and hilarious excuses to help you dodge responsibility at work, home, or anywhere else.

[**Live Demo (GitHub Pages)**](https://srg-sphynx.github.io/I-hate-responsibility/)

## 🌟 Features

- **One-Click Excuses**: Instantly fetch high-quality excuses with a single click.
- **Rich Metadata**: Displays Category, Severity, Quality Score, and Believability.
- **Copy to Clipboard**: Easily copy excuses to drop into Slack, Teams, or emails.
- **Local History**: Automatically saves your generated excuses to your device using `localStorage`.
- **Privacy-First**: No tracking, no servers, no ads. What happens in your browser, stays in your browser.
- **Premium UI**: Dark mode, glassmorphism, animated particle backgrounds, and satisfying micro-animations.

## 🚀 How it Works

This application is built with vanilla HTML, CSS, and JavaScript. It relies on the incredible open-source [Blame as a Service API](https://github.com/sbmagar13/blame-as-a-service) to fetch excuse data. 

Specifically, it uses the `/blame/rich` endpoint to get detailed JSON responses containing not just the excuse, but also its severity and category.

## 🛠️ Local Development

No build tools, no `npm install`, no nonsense.

1. Clone the repository:
   ```bash
   git clone https://github.com/srg-sphynx/I-hate-responsibility.git
   ```
2. Open `index.html` in your favorite web browser.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
