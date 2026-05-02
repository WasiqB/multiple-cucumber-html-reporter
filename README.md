# Multiple Cucumber HTML Reporter

<p align="center">
  <strong>Generate beautiful, interactive, and customizable HTML reports for Cucumber runs.</strong>
</p>

<p align="center">
  <a href="https://discord.gg/d6rfHkSDjc"><img src="https://img.shields.io/discord/1057960728692260975?label=Chat%20on%20Discord&logo=Discord&style=for-the-badge" alt="Discord"></a>
  <a href="https://github.com/WasiqB/multiple-cucumber-html-reporter/actions"><img src="https://img.shields.io/github/actions/workflow/status/WasiqB/multiple-cucumber-html-reporter/test.yml?label=Tests&logo=GitHub&style=for-the-badge" alt="GitHub Workflow Status"></a>
  <a href="https://www.npmjs.com/package/multiple-cucumber-html-reporter"><img src="https://img.shields.io/npm/v/multiple-cucumber-html-reporter?logo=npm&style=for-the-badge" alt="NPM Version"></a>
  <a href="https://www.npmjs.com/package/multiple-cucumber-html-reporter"><img src="https://img.shields.io/npm/dm/multiple-cucumber-html-reporter?label=Downloads&logo=npm&style=for-the-badge" alt="NPM Downloads"></a>
  <a href="http://opensource.org/licenses/MIT"><img src="https://img.shields.io/github/license/WasiqB/multiple-cucumber-html-reporter?logo=open-source-initiative&style=for-the-badge" alt="License"></a>
  <a href="https://github.com/sponsors/WasiqB"><img src="https://img.shields.io/badge/Sponsor-WasiqB-ea4aaa?style=for-the-badge&logo=github-sponsors" alt="Sponsor"></a>
</p>

---

![Multiple Cucumber HTML Reporter Hero](https://k9v00w0cps.ufs.sh/f/RyRlUroX9tIHggv6ZktUDRdg6Q2jyeOKb3sVunz0vik8ZlLo)

## 🌟 Why this reporter?

**Multiple Cucumber HTML Reporter** is a robust reporting module that transforms standard Cucumber JSON output into stunning, feature-rich HTML reports. Unlike generic reporters, it is designed for scale and clarity.

### ✨ Key Features

-   📊 **Interactive Dashboard**: Scored overview of all tested features and scenarios.
-   🌓 **Dark Mode Support**: Built-in support for light and dark themes for better accessibility.
-   🔄 **Multiple Runs**: Consolidate multiple runs of the same feature (e.g., across different browsers or devices).
-   📱 **Rich Metadata**: Automatically display browser, device, platform, and app version details.
-   🔍 **Advanced Filtering**: Easily search, filter, and sort through large test suites.
-   🎨 **Fully Customizable**: Add custom data blocks, brand colors, and additional CSS styles.

---

## 🚀 Quick Start

### 1. Install

```bash
pnpm add multiple-cucumber-html-reporter --save-dev
```

### 2. Generate Report
Add this to your test teardown or a separate reporting script:

```javascript
const report = require("multiple-cucumber-html-reporter");

report.generate({
  jsonDir: "./path-to-your-json-output/",
  reportPath: "./path-where-the-report-needs-to-be/",
  metadata: {
    browser: {
      name: "chrome",
      version: "latest",
    },
    device: "Local test machine",
    platform: {
      name: "osx",
      version: "Sonoma",
    },
  },
  customData: {
    title: "Run info",
    data: [
      { label: "Project", value: "My Awesome Project" },
      { label: "Release", value: "1.0.0" },
    ],
  },
});
```

Check out the [examples](./examples) folder for integration with frameworks like Cypress.

---

## 📖 In-Depth Documentation

Looking for advanced configurations, framework integrations (WebdriverIO, Cypress, etc.), or FAQs? Visit our comprehensive documentation site:

### [👉 Read the Full Documentation](https://wasiqb.github.io/multiple-cucumber-html-reporter/)

---

## 🖼️ Feature Showcase

### Feature List Page

![Feature List Page](https://k9v00w0cps.ufs.sh/f/RyRlUroX9tIHggv6ZktUDRdg6Q2jyeOKb3sVunz0vik8ZlLo)

### Feature Details Page

![Feature Details Page](https://k9v00w0cps.ufs.sh/f/RyRlUroX9tIHPqiXBwZdhNxDiWyGMp7wlS2tBRa8TjPIQco3)

---

## 🤝 Contributing & Community

Contributions are what make the open source community such an amazing place to learn, inspire, and create.

- **Contributing**: Read our [Contributing Guide](./.github/CONTRIBUTING.md) to get started.
- **Security**: Please report vulnerabilities via our [Security Policy](./.github/SECURITY.md).
- **Code of Conduct**: We expect all contributors to follow our [Code of Conduct](./.github/CODE_OF_CONDUCT.md).

### 💬 Support & Talk

- **Discord**: [Join our Discord server](https://discord.gg/d6rfHkSDjc) for real-time support.
- **GitHub Issues**: [Report bugs or request features](https://github.com/WasiqB/multiple-cucumber-html-reporter/issues).
- **GitHub Discussions**: [Join our GitHub Discussions](https://github.com/WasiqB/multiple-cucumber-html-reporter/discussions).
- **Project Milestones**: [View Project Milestones](https://github.com/WasiqB/multiple-cucumber-html-reporter/milestones).
- **Twitter / X**: Follow [@WasiqBhamla](https://x.com/WasiqBhamla) for project updates.

## ❤️ Support the project

If you find this project useful, please consider [sponsoring the maintainer](https://github.com/sponsors/WasiqB). Your support helps keep the project maintained and improved!

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">Built with ❤️ by <a href="https://wasiqbhamla.com/">Wasiq Bhamla</a></p>
