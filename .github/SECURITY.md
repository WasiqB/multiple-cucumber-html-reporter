# Security Policy

This policy covers the [`multiple-cucumber-html-reporter`](https://www.npmjs.com/package/multiple-cucumber-html-reporter) npm package (the `reporter/` workspace in this repository), the `mchr` CLI, and the HTML reports those tools generate. The official documentation site at [multiple-cucumber-html-reporter.com](https://www.multiple-cucumber-html-reporter.com/) is also in scope when a report concerns that site's own content or configuration.

## Supported versions

The current stable line is **4.x**. The latest release at the time this policy was written is **4.6.0** (GitHub release and npm publish, 5 Nov 2026, 11:04 pm Asia/Calcutta). 4.x requires **Node.js 22 or later** as of 4.3.0 (4.0.0–4.2.0 declared `node: >=24`).

| Version | Status | Notes |
| ------- | ------ | ----- |
| 4.x     | :white_check_mark: Supported | Security fixes, bug fixes, and new features. This is the only actively maintained line. |
| 3.x     | :x: Unsupported | The official [v3 documentation](https://www.multiple-cucumber-html-reporter.com/docs/v3) already states that v3 is no longer supported and asks users to upgrade. Last GitHub-tagged 3.x release is **3.10.0** (12 Feb 2026). npm also has **3.11.0** (5 Jul 2026), which has no matching GitHub tag or GitHub Release. Critical security fixes for 3.x may be issued at the maintainer's discretion only; there is no commitment to backport. Please upgrade to 4.x. |
| 2.x     | :x: Unsupported | Single release, 2.0.0 (28 Aug 2022). No security updates. |
| 1.x and earlier | :x: Unsupported | Last 1.x release was 1.21.6 (2 Aug 2022). 0.x is also unsupported. |

Pre-release / `beta` tags are not a supported line. If a vulnerability is found in a beta, it will be fixed in the next stable 4.x release where applicable.

This table replaces the previous policy, which listed only 3.x as supported (written before 4.x became the current line).

### Choice recorded here

3.x is marked **unsupported**, not "security fixes only." That matches the project's published v3 docs, the lack of a maintained 3.x branch (only `main` and `gh-pages` exist), and the capacity of a single-maintainer project. If a formal, time-boxed 3.x security-fixes-only window is preferred instead, this table should be updated before the file is merged.

## Reporting a vulnerability

Please **do not** open a public GitHub issue, pull request, or discussion for a security vulnerability, and do not disclose it on Discord or social media before it is published.

This repository has **GitHub Private Vulnerability Reporting** enabled. Use it as the only official reporting channel:

1. Open the [Security tab](https://github.com/WasiqB/multiple-cucumber-html-reporter/security) of this repository.
2. Choose **Report a vulnerability** and start a private advisory.
3. Include as much detail as you can: a description of the issue, affected versions (npm and/or git), steps to reproduce, proof-of-concept if you have one, and the impact you expect (for example, script execution in a generated report).

There is no separate security email published in the previous policy, and none is added here. If Private Vulnerability Reporting were ever unavailable, wait for the maintainer to provide a private contact in a new revision of this file rather than posting the report in public.

## Response timelines

These are targets for a single-maintainer project, not a contractual SLA. "Business days" are Monday–Friday in Asia/Kolkata, excluding public holidays in India.

| Stage | Target |
| ----- | ------ |
| Acknowledgement | Within **48 hours** of the report (this was the commitment in the previous policy). If that window falls on a weekend or public holiday, then within **3 business days**. |
| Triage | An initial severity assessment and a short note on next steps within **7 days** of acknowledgement. |
| Fix | See the severity targets below. A workaround or a "not a vulnerability / out of scope" decision may be the outcome instead of a patch. |

### Fix targets by severity

Severity is assessed by the maintainer using the report and, where helpful, CVSS as a guide.

| Severity | Examples (illustrative) | Fix target |
| -------- | ----------------------- | ---------- |
| Critical | Remote code execution via the CLI or library, a malicious npm publish / typo-squatting style compromise of this package, or a fixable flaw that reliably executes attacker-controlled code in a typical report-viewing context without unusual configuration | As soon as practical, **target 14 days** |
| High     | Cross-site scripting in a generated HTML or emailable report that can run in a typical browser viewing context; significant data-exfiltration bugs in report generation | **Target 30 days** |
| Medium   | Vulnerabilities that need an unusual setup, limited impact, or a less typical viewing context | **Target 60 days**, or the next regular 4.x release, whichever is sooner |
| Low      | Defense-in-depth, hardening, or issues with minimal practical impact | The **next regular 4.x release**, on a best-effort basis |

If a target cannot be met (for example, because a correct fix needs a breaking change or a complex redesign), the reporter will be told and a public advisory, when issued, will say so.

## Disclosure process

1. The report stays private in the GitHub advisory while it is triaged and, if confirmed, while a fix is prepared.
2. A fix is developed on a private branch when possible, then released as a 4.x patch (or a discretionary 3.x patch, if one is made).
3. A [GitHub Security Advisory (GHSA)](https://github.com/WasiqB/multiple-cucumber-html-reporter/security/advisories) is published when the fix is available, or later if more time is needed to reach users. GitHub can assign a **CVE** through the advisory; a CVE will be requested for confirmed, in-scope vulnerabilities that warrant one.
4. Coordinated disclosure is the default: we aim to publish the advisory when the patched release is on npm. If a confirmed issue remains unfixed, we will discuss a public disclosure date with the reporter (a common starting point is 90 days after the report). Either side may ask to extend that window when users would be harmed by earlier disclosure.
5. Once public, the advisory is the canonical write-up. Release notes and the changelog should point to it. Please do not share exploit details beyond what the advisory contains until users have had a reasonable chance to upgrade.

As of 15 Nov 2026 this repository had no published GitHub Security Advisories and no public GitHub Advisory Database entries for the npm package.

## Scope

### In scope

- Vulnerabilities in the published `multiple-cucumber-html-reporter` package and the `mchr` CLI: for example remote or local code execution, prototype pollution that is exploitable through documented APIs, path traversal when writing reports, or insecure handling of configuration files.
- **Generated HTML and emailable reports**, including cross-site scripting (XSS) and related injection issues. Reports are built from Cucumber JSON or Cucumber Messages NDJSON, plus optional metadata, custom data, and attachments. In particular, `text/html` step embeddings are inserted into the report as HTML (this is intentional, long-standing "HTML embedding" behavior). If an attacker can influence that input — or other report fields that are not escaped — a person who later opens the report in a browser may be at risk. Issues of that kind are in scope.
- Supply-chain issues that are specific to this project's release process or published artifacts (for example a compromised release of *this* package).
- Security issues on the official documentation site that the project can fix.

### Out of scope (typical examples)

- Bugs that only affect unsupported versions, unless the maintainer chooses to treat them as useful intelligence for 4.x.
- Vulnerabilities solely in third-party dependencies, unless they are exploitable through this package in a realistic way and can be addressed here (for example by upgrading or wrapping the dependency).
- Security of CI systems, browsers, or file viewers that *consume* a generated report, except where this project can reasonably mitigate the issue in the report itself.
- Social-engineering, physical attacks, or denial of service that requires unrealistic resource exhaustion.
- Example projects under `examples/`, which exist for demonstration and debugging, except when they reveal a bug in the reporter itself.
- Issues in forks or unofficial builds.

Reports that turn out to be ordinary bugs will be moved to a public issue (with sensitive details removed) when that is helpful.

## Credit

We are grateful for responsible reports. Unless you ask us not to, we will credit you by the name or handle you provide in the public GitHub Security Advisory and, where appropriate, in the changelog. We will not credit you if you prefer to remain anonymous. We do not currently operate a paid bug-bounty program.

Thank you for helping keep this project and its users safe.
