# Contributing to Multiple Cucumber HTML Reporter

We love contributions! Following these simple guidelines will help us maintain a high-quality codebase.

## Prerequisites

To contribute, ensure you have the following installed:
- **Node.js** (LTS Recommended)
- **pnpm** (Our preferred package manager)

## Getting Started

1.  **Clone the Repo**: Clone the repository to your local machine.
2.  **Install Dependencies**: Use `pnpm install` to set up your development environment.

## Running Tests

We strive for 100% code coverage. Please ensure any new code or fixes include appropriate tests.

### Create Report
```bash
pnpm test
```

### Run Coverage Report
```bash
pnpm unit.test.coverage
```

### Preview Report
```bash
pnpm report
```

---

## Code Style & Commits

### Commit Messages

We strictly follow the [Conventional Commits](https://www.conventionalcommits.org/) format using `commitlint`. This ensures a clear, consistent, and automated way to generate our changelogs and releases.

Example: `feat: add support for new browser engine`

---

## Submitting Pull Requests

- Create a new branch for your feature or fix.
- Ensure all tests pass and coverage goals are met.
- Update documentation if applicable.
- Open a Pull Request with a clear description of your changes.

Thank you for helping make `multiple-cucumber-html-reporter` better!

For more detailed information, visit our [Documentation Site](https://wasiqb.github.io/multiple-cucumber-html-reporter/docs/contributing).
