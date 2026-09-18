# Contributing

Thank you for improving Dynamic Calendar Activities. The project is small on purpose, and contributions that preserve that clarity are especially welcome.

## Before starting

For a bug fix, open an issue that includes the browser, operating system, expected behavior, actual behavior, and a minimal reproduction. For a feature, explain the user problem before proposing an implementation.

Small pull requests are easier to review and safer to release. Separate refactoring from behavior changes whenever practical.

## Local setup

No production dependencies are required.

1. Clone or download the repository.
2. Serve the repository root with `python -m http.server 8080` or another static server.
3. Open `http://localhost:8080`.
4. Optionally use Node.js 20 or newer to run `npm test` and `npm run check`.

## Branches and commits

- Create a focused branch from the current default branch.
- Use short, imperative commit subjects, such as `Fix range selection across months`.
- Keep generated files, editor settings, and unrelated formatting out of a change.
- Explain important tradeoffs in the pull request, not only in commit history.

## Code standards

### HTML

- Prefer native semantic elements.
- Give every form control an explicit accessible label.
- Use ARIA only when native semantics do not express the interaction.
- Keep user-authored content out of `innerHTML`.

### CSS

- Reuse design tokens from `:root`.
- Keep selectors shallow and component-oriented.
- Add responsive behavior near the end of the stylesheet.
- Verify print styles after changing the grid.
- Respect reduced-motion and high-contrast user needs.

### JavaScript

- Keep modules focused and dependency-free unless a dependency has a clear, documented benefit.
- Use named exports for reusable helpers and classes.
- Validate URL and storage data at the boundary.
- Use local calendar dates rather than UTC parsing for `YYYY-MM-DD` values.
- Add JSDoc to exported functions and comments for non-obvious decisions.
- Prefer early returns and descriptive names over deeply nested conditions.
- Do not introduce a build step solely for syntax that current supported browsers already understand.

### Translations

- Keep translation keys identical across languages.
- Preserve punctuation and meaning rather than translating word by word.
- Check text expansion in narrow layouts.
- Do not translate source-code identifiers, filenames, or documentation examples.

## Testing checklist

Run:

```bash
npm test
npm run check
```

Then verify the behavior relevant to your change. For broad UI work, cover:

- A new calendar with default dates.
- Manual date selection and each preset.
- Monday, Sunday, and exact-start layouts.
- Note persistence after reload.
- Color selection, row color, and column color.
- URL restoration in a fresh tab.
- No query parameters on an untouched initial load, and complete URL cleanup after **Clear all**.
- Language switching.
- Mobile layout around 390 CSS pixels wide.
- Print preview in both portrait and landscape orientation.
- Multi-month printing that packs complete month groups efficiently without splitting a month label from its week rows.
- Keyboard focus visibility and `Escape` behavior.

## Pull request expectations

A pull request should include:

- A concise problem and solution summary.
- Manual test coverage and automated test results.
- Screenshots only when the visual result changed.
- Documentation updates for behavior, data format, or contributor workflow changes.
- No unrelated dependency or lockfile churn.

Reviewers may ask for a smaller change, clearer naming, a regression test, or an explanation of how the proposal preserves the project's lightweight and private nature.

## Contribution license

This project is licensed under `AGPL-3.0-or-later`. By submitting a contribution, you confirm that you have the right to provide it and agree that it will be licensed under the same terms without an additional contributor agreement.

Do not remove or weaken SPDX identifiers, copyright notices, modification notices, the in-app legal notice, source-code access, `NOTICE.md`, or the complete `LICENSE` text. Operators of modified network versions must update the in-app **GitHub repository** link so it provides the corresponding source for the version users are running. New third-party material must have a compatible license and must be documented in `NOTICE.md` before inclusion.

## Reporting security problems

Please follow [SECURITY.md](SECURITY.md). Do not publish a vulnerability with sensitive reproduction details before maintainers have had a reasonable opportunity to respond.
