# Dynamic Calendar Activities

A lightweight, private, browser-based planner for activities, deliverables, and shifts. Choose any date range, write directly into each day, add color, share the current view through its URL, and print a clean landscape calendar.

[Open the live demo](https://calendar.emanuelbarbera.it/)

The application is intentionally built with semantic HTML, modern CSS, and vanilla JavaScript. It has no framework, production dependencies, database, account system, analytics, or backend. It is free software released under the GNU Affero General Public License v3 or later.

## Why this project exists

Many planning tools are excellent but unnecessarily heavy for a short-lived project calendar. Dynamic Calendar Activities is designed for the smaller job:

- Open quickly on desktop or mobile.
- Keep personal calendar data in the browser.
- Work from any static web host.
- Remain understandable to contributors without a complex toolchain.
- Print well enough to use on a wall, in a meeting, or as a PDF.

## Features

- Custom start and end dates with a two-month range picker.
- Useful presets for 7 days, 2 weeks, 4 weeks, this month, and next month.
- Monday, Sunday, or exact-start week layouts.
- Editable daily notes with automatic local saving.
- Color applied to a selection, a full week row, or a weekday column.
- English, Spanish, Italian, Portuguese, French, German, Simplified Chinese, Japanese, Korean, Arabic, Hindi, and Russian interfaces.
- Automatic right-to-left layout for Arabic.
- Flag-assisted language menu with text fallbacks and keyboard navigation.
- Shareable URLs containing the visible calendar state.
- Responsive layout and reduced-motion support.
- A4 landscape print and PDF styling.
- No backend, analytics, remote fonts, or runtime application services.
- No production install or build step.

## Quick start

ES modules are loaded by the browser, so use a small local static server instead of opening `index.html` directly.

With Python:

```bash
python -m http.server 8080
```

Then open <http://localhost:8080>.

Any static server works. For example, an editor's preview server or `npx serve` is fine if you already use one. The application itself does not require Node.js; Node.js is only used for the optional checks and tests.

## Using the calendar

1. Enter a project or calendar name.
2. Open the date-range control and choose a start and end date, or use a preset.
3. Choose when calendar weeks should begin.
4. Click inside a day and type a note. Changes are saved automatically.
5. Right-click a day, or drag across day headers, to select cells and apply a color.
6. Use **Print / save PDF** for an A4 landscape copy.

Changing the project name, date range, or week mode carries visible notes and colors into the new calendar identity. Other saved calendars are left untouched.

## Data, privacy, and sharing

The application has two client-side storage mechanisms:

- `localStorage` keeps settings, daily notes, colors, and language preferences on the current device and browser profile.
- The URL query string contains a Base64URL-encoded copy of the visible calendar so the view can be shared without a server.

The initial page render never creates a query string. Share parameters are written only after a user changes the calendar. **Clear all** removes the visible content and every query parameter from the current URL. Existing share parameters are still read on arrival so shared links continue to work.

Base64 is encoding, not encryption. Anyone who receives a shared URL can decode and read its notes. Do not put secrets, credentials, regulated data, or sensitive personal information in a shared calendar URL.

There is no cloud synchronization. Clearing browser data removes locally saved calendars. A recipient who edits a shared calendar changes only their own browser copy and URL.

The only third-party runtime request is the pinned `flag-icons` stylesheet and its SVG flags from jsDelivr. It receives ordinary web-request metadata such as the visitor's IP address and user agent, but never receives calendar content from the application. Language names remain available if that request is blocked or offline.

Very large calendars or long notes create longer URLs. Browser and messaging-platform limits vary, so keep URL-shared calendars reasonably concise. A future optional export/import file format would be the best solution for large plans while preserving the backend-free design.

## Project structure

```text
.
├── index.html                    # Semantic application shell
├── assets/
│   ├── css/
│   │   └── main.css              # Screen, responsive, and print styles
│   ├── icons/
│   │   └── favicon.svg           # Lightweight application icon
│   └── js/
│       ├── app.js                # Application composition and event flow
│       ├── calendar-view.js      # Calendar rendering, notes, and colors
│       ├── date-range-picker.js  # Date-range popover behavior
│       ├── date-utils.js         # Pure local-date helpers
│       ├── i18n.js               # Translations and DOM localization
│       ├── language-picker.js    # Accessible flag-assisted language menu
│       ├── locales/
│       │   └── additional.js     # Additional complete translation catalogs
│       ├── share.js              # Validated URL serialization
│       └── storage.js            # localStorage adapter and key ownership
├── tests/
│   └── date-utils.test.js        # Dependency-free Node.js unit tests
├── .github/                       # Issue and pull-request review templates
├── CONTRIBUTING.md               # Contribution workflow and standards
├── NOTICE.md                     # Copyright and attribution information
├── SECURITY.md                   # Private vulnerability reporting guidance
├── LICENSE                       # GNU AGPL v3 license text
├── package.json                  # Optional checks; no dependencies
└── README.md
```

## Architecture

The project uses native browser ES modules. Each module has a narrow responsibility:

- `app.js` is the composition root. It initializes state, wires controls, coordinates rendering, and updates the share URL.
- `calendar-view.js` owns the generated calendar DOM and user interactions inside it.
- `date-range-picker.js` owns draft date selection and commits validated ranges to the form.
- `storage.js` is the only module that reads or writes browser storage.
- `share.js` treats URL data as untrusted input, validates it, and serializes visible state.
- `date-utils.js` contains pure date operations that can be tested without a browser.
- `i18n.js` contains the language dictionaries and the small translation layer.
- `language-picker.js` manages the accessible language menu and its visual flag state.
- `locales/additional.js` keeps the expanded translation catalog reviewable without adding runtime requests.

This separation keeps the application easy to review without introducing a framework, bundler, package download, or runtime service.

### State flow

```text
Controls or shared URL
        ↓
      app.js
   ↙           ↘
storage.js   date-range-picker.js
   ↓             ↓
calendar-view.js → visible calendar
        ↓
   share.js → current URL
```

The DOM is the working view of daily notes and colors. Storage is the durable local copy. After a manual edit, the current URL becomes a debounced, portable snapshot of visible content; initialization alone leaves the address unchanged.

## Development

The production application has zero dependencies. Optional development commands require Node.js 20 or newer:

```bash
npm test
npm run check
```

`npm test` uses Node's built-in test runner. `npm run check` performs JavaScript syntax checks. There is no package installation step because the repository has no npm dependencies.

Before proposing a change:

1. Run both commands.
2. Test the affected workflow in a current Chromium- or Firefox-based browser.
3. Check a narrow mobile viewport if layout changed.
4. Open print preview if calendar geometry or print CSS changed.
5. Confirm that notes survive a reload and that a copied share URL restores the view.

More detail is available in [CONTRIBUTING.md](CONTRIBUTING.md).

## Coding principles

- Prefer browser standards over libraries for small, well-supported behavior.
- Keep modules cohesive and dependencies directed from `app.js` toward focused helpers.
- Use semantic HTML and accessible names before adding ARIA.
- Treat URL parameters and browser storage as untrusted input.
- Use `textContent`, not `innerHTML`, for user-authored data.
- Store local calendar dates as `YYYY-MM-DD`; do not parse them as UTC timestamps.
- Comment intent, invariants, and non-obvious tradeoffs rather than restating syntax.
- Preserve the no-build production path unless a clear user benefit justifies changing it.
- Keep remote assets exceptional, version-pinned, documented, and usable with a local text fallback.
- Keep destructive actions explicit and confirmed.

Preserve SPDX headers, copyright notices, the in-app source link, `NOTICE.md`, and the complete license text when modifying or redistributing the project.

## Adding a language

1. Copy the English dictionary into `assets/js/locales/additional.js`.
2. Translate every user-facing value while keeping the keys unchanged.
3. Add the language code to `SUPPORTED_LANGUAGES` and to `RTL_LANGUAGES` when required.
4. Add the native language name and representative flag to `LANGUAGE_OPTIONS` in `language-picker.js`.
5. Add a matching menu button to `#languageMenu` in `index.html`.
6. Run `npm test` to verify the translation contract and selector metadata.
7. Exercise the date picker, action buttons, confirmations, placeholders, and print view.

Keep language names in their native form (for example, `Italiano`) so users can recognize them regardless of the current interface language.

## Deploying to GitHub Pages

The repository includes `.github/workflows/pages.yml`, which validates and publishes the application automatically. It runs the tests and syntax checks first, then uploads only the runtime files and required legal notices as the public website.

To enable the deployment:

1. Push the repository to GitHub with `main` as the default branch.
2. Open **Settings → Pages** in the GitHub repository.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main`, or open the **Actions** tab and manually run **Deploy to GitHub Pages**.
5. When the workflow finishes, use the URL shown in its deployment summary.

For a project repository, the default address is:

```text
https://<account>.github.io/<repository>/
```

No base-path configuration is required. HTML assets and JavaScript imports use relative paths, so the application works both at an account root and below a repository path. The generated share URLs also preserve the deployed Pages path.

The workflow publishes only from `main`. If the repository uses another default branch, update the branch under `on.push.branches` in `.github/workflows/pages.yml`.

The included `.nojekyll` file also makes the source compatible with GitHub Pages' simpler branch-based publishing mode, although the Actions workflow is recommended because it validates the project before release.

### Account-level custom domains

GitHub automatically applies a custom domain configured on an account-level `<account>.github.io` site to that account's project sites. For example, a project may be published at `https://www.example.com/project/` instead of `https://account.github.io/project/`. This behavior is controlled by GitHub Pages and cannot be overridden by an HTML setting.

To restore the default `github.io` addresses for all project sites, remove the custom domain from the `<account>.github.io` repository under **Settings → Pages → Custom domain**. To keep the account website on its custom domain, give this project a distinct subdomain such as `calendar.example.com` instead. Configure that domain in this repository's Pages settings and point its DNS `CNAME` record to `<account>.github.io`.

### Other static hosts

Publish the repository root—or just `index.html` and `assets/`—to any static host. The host must serve JavaScript files with a JavaScript MIME type and should route `index.html` normally; no rewrite rules, server functions, environment variables, or database are needed.

Other good fits include GitLab Pages, Cloudflare Pages, Netlify, Vercel static hosting, or a basic web server. HTTPS is recommended even though the application has no server-side component.

For production, consider these response headers when your host supports them:

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://cdn.jsdelivr.net; img-src 'self' data: https://cdn.jsdelivr.net; object-src 'none'; base-uri 'none'; frame-ancestors 'none'
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Test header changes on a preview deployment before applying them broadly.

## Browser support

The project targets current versions of Chrome, Edge, Firefox, and Safari. It uses ES modules, `Intl.DateTimeFormat`, `TextEncoder`, `TextDecoder`, and CSS Grid. Unsupported older browsers receive the `<noscript>` message only when JavaScript is disabled; no legacy bundle is provided.

## Accessibility notes

- Major regions and controls have programmatic labels.
- Save feedback uses a polite live region.
- The date picker and color menu close with `Escape`.
- Focus styles are visible and motion follows the operating-system preference.
- Color is supplementary; dates and notes remain readable without it.
- Print styles remove editing controls and placeholder text.

The custom date picker is usable with standard tab navigation, but complete arrow-key grid navigation would be a valuable future enhancement.

## Suggested improvements

These ideas preserve the lightweight, backend-free premise. They are intentionally not required for the core application:

1. **Export and import a `.json` calendar file.** This avoids oversized sharing URLs and provides a user-controlled backup.
2. **Add keyboard grid navigation to the date picker.** Arrow, Page Up/Down, Home, and End behavior would improve accessibility.
3. **Add browser-level integration tests.** A small Playwright suite could cover persistence, URL restoration, color selection, responsive layout, and printing. Keep it as a development-only dependency.
4. **Offer a compact mobile calendar mode.** The current mobile layout intentionally scrolls horizontally to preserve a readable seven-day grid. An optional agenda view could reduce scrolling.
5. **Introduce storage version migration.** The current `v2` key format remains compatible with the original file. A migration registry would help if the data model changes later.
6. **Add an optional installable PWA layer.** A manifest and service worker could improve offline discovery while keeping all data local. This should remain optional because service-worker caching adds maintenance complexity.
7. **Add automated accessibility checks.** Static checks and a small manual screen-reader checklist would make community reviews more repeatable.

Performance work should be driven by measurements. For typical project ranges, direct DOM rendering is simpler and faster than introducing virtualization or a UI framework.

## Known constraints

- Data is tied to one browser profile unless a URL is shared.
- Share URLs may become long when many notes are present.
- Country flags require access to the pinned jsDelivr asset; language text remains functional without it.
- Browser storage quotas and privacy settings vary.
- A week is displayed as seven columns; narrow devices scroll horizontally.
- There is no collaboration, conflict resolution, account recovery, or server backup by design.

## Project links

- [Live demo](https://calendar.emanuelbarbera.it/)
- [GitHub repository](https://github.com/emanuelbarbera/dynamic-calendar-activities)
- [Issue tracker](https://github.com/emanuelbarbera/dynamic-calendar-activities/issues)
- [Contribution guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## License

Copyright © 2026 Emanuel Barbera.

Dynamic Calendar Activities is free software released under the [GNU Affero General Public License, version 3 or any later version](LICENSE). The SPDX identifier is `AGPL-3.0-or-later`.

In practical terms:

- Individuals and companies may use the application, including commercially.
- Anyone may inspect, copy, modify, and redistribute it under the license terms.
- Distributed modified versions must remain under the same license and provide their corresponding source.
- Modified versions made available to users over a network must offer those users the corresponding source at no charge.
- Copyright, license, warranty, attribution, and modification notices must be preserved as required by the license.

“Free software” refers to user freedoms, not necessarily a zero price. The AGPL permits charging for copies, hosting, customization, or support; it prevents recipients from losing the freedoms granted by the license.

See [NOTICE.md](NOTICE.md) for the concise attribution notice. Versions already received under an earlier license remain governed by the license terms under which those copies were received.
