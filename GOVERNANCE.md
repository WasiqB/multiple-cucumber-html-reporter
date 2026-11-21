# Project governance

This document describes how [multiple-cucumber-html-reporter](https://github.com/WasiqB/multiple-cucumber-html-reporter) is governed. It is intentionally short and should stay honest: this is a single-maintainer open-source project.

The project is released under the [MIT License](./LICENSE) (copyright Wasiq Bhamla, 2023). The official documentation is at [multiple-cucumber-html-reporter.com](https://www.multiple-cucumber-html-reporter.com/).

## Leadership

**Wasiq Bhamla** ([@WasiqB](https://github.com/WasiqB)) is the **lead maintainer** (a BDFL-style role) and the only documented [code owner](./.github/CODEOWNERS). He is the npm package author and the sole listed npm maintainer of `multiple-cucumber-html-reporter`, and he has final say on technical direction, releases, collaborators, and governance changes.

The package was originally created in 2017 by [@wswebcreation](https://github.com/wswebcreation), who remains the most frequent historical contributor by commit count. Leadership and publishing today rest with Wasiq.

## Roles

| Role | What it means in this project |
| ---- | ----------------------------- |
| **Lead maintainer** | Owns the repository, npm publishing, GitHub Sponsors, and this governance document. Reviews and merges pull requests, issues releases, and decides supported versions and security policy. Currently: Wasiq Bhamla. |
| **Collaborator** | Someone the lead maintainer has granted write or maintain access (for example to review PRs or help with triage). Collaborator access is by invitation and can be withdrawn. As of 15 Nov 2026, `@WasiqB` is the only person listed in `CODEOWNERS`. A public collaborator list could not be confirmed from unauthenticated GitHub APIs; this file should be updated if others are granted write access. |
| **Contributor** | Anyone who improves the project in a meaningful way: code, docs, issues, translations, examples, or a useful review. You do not need a special title to contribute. Contributor recognition on the documentation [Community page](https://www.multiple-cucumber-html-reporter.com/) follows the rules in the [Contributing guide](https://www.multiple-cucumber-html-reporter.com/docs/contributing) (currently: three PRs merged to `main` in the last 12 months, or one critical feature PR). That recognition is not the same as collaborator (write) access. |

Dependabot and other bots are automation, not collaborators.

## How decisions are made

- Day-to-day work happens in GitHub Issues, [Discussions](https://github.com/WasiqB/multiple-cucumber-html-reporter/discussions), and pull requests, against the default branch `main`. There is also a project [Discord](https://discord.gg/d6rfHkSDjc); it is a community space, not the official record of decisions.
- Contributors are encouraged to open an issue before a substantial pull request, as described in the [Contributing guide](https://www.multiple-cucumber-html-reporter.com/docs/contributing).
- Consensus is preferred. When it is not reached, or when a decision is urgent (including security releases), the **lead maintainer decides**.
- Breaking changes should be discussed in an issue and released as a new major version, following semantic versioning.
- Changes to this document, to [SECURITY.md](./.github/SECURITY.md), or to supported-version policy are made by the lead maintainer, usually via a pull request so the change is reviewable.

## Becoming a collaborator

There is no automatic promotion from contributor to collaborator.

The lead maintainer may invite a collaborator when it would genuinely help the project — typically after a period of high-quality, trusted contributions, constructive issue triage, and consistent adherence to the Code of Conduct. Write access is a responsibility, not a reward, and it is expected to remain rare while the project has a single lead.

If you are interested, the right first step is to contribute consistently and to mention it to the lead maintainer. Please do not treat a request for access as a support ticket.

## Release process

Releases are made only from `main`, using the repository's **Release to NPM and GitHub** workflow (`workflow_dispatch`, with `major` / `minor` / `patch` and an optional pre-release flag) and [release-it](https://github.com/release-it/release-it) as configured in `.release-it.json`. In summary:

- The published npm package is the `reporter/` workspace, tagged and released as `multiple-cucumber-html-reporter`.
- Versions follow semantic versioning. Pre-releases may be published under the npm `beta` dist-tag.
- Git commits and tags for a release are signed. A GitHub Release is created, and release discussion goes in the **Announcements** category.
- `CHANGELOG.md` is updated as part of the release (via the lerna-changelog release-it plugin). The [GitHub Releases](https://github.com/WasiqB/multiple-cucumber-html-reporter/releases) page is the other official source of release notes.
- Only the lead maintainer — or a collaborator they have explicitly authorized — runs a production release.

Current supported versions and how to report vulnerabilities are documented in [SECURITY.md](./.github/SECURITY.md). 4.x is the supported line; the 4.x series began with 4.0.0 on 4 Jun 2026.

## Funding and sponsorship

The project accepts support through the lead maintainer's personal GitHub Sponsors account:

- GitHub Sponsors: [https://github.com/sponsors/WasiqB](https://github.com/sponsors/WasiqB)
- Machine-readable funding manifest: [`funding.json`](./funding.json), also served at [https://www.multiple-cucumber-html-reporter.com/funding.json](https://www.multiple-cucumber-html-reporter.com/funding.json)
- The same manifest is listed in the [FLOSS/fund directory](https://dir.fundingjson.org/view/project/@www.multiple-cucumber-html-reporter.com/multiple-cucumber-html-reporter)

Sponsorship, donations, and grants are appreciated and are used to fund maintenance of this project and related open-source work by the lead maintainer. They do **not** buy commit access, a privileged roadmap position, or a change to technical or security decisions. Company logos and other sponsor benefits follow the tiers published on the Sponsors page and on the documentation [Sponsors](https://www.multiple-cucumber-html-reporter.com/sponsors) page.

## Continuity (bus factor)

The bus factor of this project is **one**. That is stated plainly so users and grant reviewers are not surprised.

There is **no designated successor** at the time this document was written. The lead maintainer should keep a private note of who could be asked to take over in an emergency, and this section should be updated if a backup collaborator is named.

If the lead maintainer becomes unreachable for a prolonged period (as a guideline: no response for 90 days to good-faith contact about project continuity), people who depend on the package are encouraged to fork it. The MIT license already allows that. A fork that the community trusts may become the practical successor; this document cannot assign the GitHub repository or the npm package name in advance.

## Code of conduct

Participation in this project is governed by the [Contributor Covenant Code of Conduct](./.github/CODE_OF_CONDUCT.md) (v1.4). The lead maintainer is responsible for enforcing it in project spaces, including the GitHub repository and official community channels.

The Code of Conduct does not currently list a dedicated enforcement email. Until one is added there, please report unacceptable behavior **privately** to the lead maintainer (@WasiqB) rather than in a public issue. If a report overlaps with a security vulnerability, use [Private Vulnerability Reporting](./.github/SECURITY.md) instead.

## Changes to governance

This is a living document. The lead maintainer may amend it; material changes should be made in a pull request and mentioned in a release or discussion when they affect users or contributors.
