/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Emanuel Barbera
 *
 * Dynamic Calendar application entry point.
 *
 * This file coordinates the focused modules. It intentionally contains no
 * build-tool assumptions, framework lifecycle, network requests, or backend
 * integration so the project can be hosted as plain static files.
 */

import { CalendarView } from "./calendar-view.js";
import { DateRangePicker } from "./date-range-picker.js";
import { addDays, parseDate, toDateKey } from "./date-utils.js";
import { LanguagePicker } from "./language-picker.js";
import {
  getMessages,
  normalizeLanguage,
  SUPPORTED_LANGUAGES,
  translateDocument,
} from "./i18n.js";
import { clearShareUrl, createShareUrl, readShareUrl } from "./share.js";
import {
  clearVisibleContent,
  getCalendarId,
  loadLanguage,
  loadSettings,
  saveLanguage,
  saveSettings,
  saveSnapshot,
} from "./storage.js";

const elements = {
  form: document.querySelector("#calendarForm"),
  project: document.querySelector("#projectName"),
  start: document.querySelector("#startDate"),
  end: document.querySelector("#endDate"),
  weekStart: document.querySelector("#weekStart"),
  printOrientation: document.querySelector("#printOrientation"),
  orientationButtons: [...document.querySelectorAll(".orientation-button")],
  share: document.querySelector("#shareButton"),
  language: document.querySelector("#language"),
  status: document.querySelector("#saveStatus"),
  calendar: document.querySelector("#calendar"),
  colorMenu: document.querySelector("#colorMenu"),
};

let language = "en";
let messages = getMessages(language);
let statusTimer = null;

/** Read the current control values into the application's settings shape. */
function getSettings() {
  return {
    project: elements.project.value.trim(),
    start: elements.start.value,
    end: elements.end.value,
    weekStart: elements.weekStart.value,
    printOrientation: elements.printOrientation.value,
  };
}

/** Apply the selected A4 page orientation before opening print preview. */
function applyPrintOrientation() {
  const orientation = elements.printOrientation.value === "portrait" ? "portrait" : "landscape";
  elements.orientationButtons.forEach((button) => {
    const active = button.dataset.orientation === orientation;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelector("#printPageStyle").textContent = `@page { size: A4 ${orientation}; margin: 7mm; }`;
}

/** Announce a status immediately and optionally replace it after a short delay. */
function setStatus(current, settled = null) {
  window.clearTimeout(statusTimer);
  elements.status.textContent = current;
  if (settled) {
    statusTimer = window.setTimeout(() => {
      elements.status.textContent = settled;
    }, 450);
  }
}

const calendarView = new CalendarView({
  calendar: elements.calendar,
  colorMenu: elements.colorMenu,
  onContentChange: () => {},
  onStatusChange: setStatus,
});

const dateRangePicker = new DateRangePicker({
  onChange: () => refreshCalendar({ carryVisibleContent: true }),
  getWeekStart: () => elements.weekStart.value,
});

const languagePicker = new LanguagePicker({
  root: document.querySelector("#languagePicker"),
  input: elements.language,
  trigger: document.querySelector("#languageTrigger"),
  menu: document.querySelector("#languageMenu"),
  flag: document.querySelector("#selectedLanguageFlag"),
  name: document.querySelector("#selectedLanguageName"),
  onChange: applyLanguage,
});

/**
 * Rebuild the grid. Before identity-changing edits, visible content is copied
 * into the new namespace so a project rename or range adjustment feels safe.
 */
function refreshCalendar({ carryVisibleContent = false } = {}) {
  const snapshot = carryVisibleContent ? calendarView.getSnapshot() : null;
  const settings = getSettings();
  const start = parseDate(settings.start);
  const end = parseDate(settings.end);

  if (!start || !end || start > end) return;

  const calendarId = getCalendarId(settings);
  if (snapshot) saveSnapshot(calendarId, snapshot);

  saveSettings(settings);
  calendarView.render({ settings, calendarId, language, messages });
  dateRangePicker.update({ language, messages });
  setStatus(messages.saved);
}

/** Share a self-contained snapshot without changing the URL in the address bar. */
async function shareCalendar() {
  try {
    const url = createShareUrl({
      settings: getSettings(),
      language,
      snapshot: calendarView.getSnapshot(),
    });
    const title = getSettings().project || messages.defaultTitle;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        setStatus(messages.linkShared);
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setStatus(messages.linkCopied);
        return;
      } catch {
        // Clipboard access can be denied even after a direct button click.
        // The prompt below remains a usable manual-copy fallback.
      }
    }

    window.prompt(messages.copyLink, url);
    setStatus(messages.linkReady);
  } catch {
    setStatus(messages.shareFailed);
  }
}

/** Apply a language consistently to static labels and dynamic calendar UI. */
function applyLanguage(nextLanguage, { rerender = true } = {}) {
  language = normalizeLanguage(nextLanguage);
  messages = getMessages(language);
  languagePicker.setValue(language);
  saveLanguage(language);
  translateDocument(language);
  dateRangePicker.update({ language, messages });

  if (rerender) refreshCalendar();
  else setStatus(messages.ready);
}

/** Load URL state first, then local preferences, then safe defaults. */
function initialize() {
  const shared = readShareUrl();
  // Consume incoming parameters immediately. Their validated values remain in
  // memory and are persisted below, while the visible address stays clean.
  if (window.location.search) clearShareUrl();
  const saved = loadSettings();
  const today = new Date();
  const browserLanguage = navigator.language?.split("-")[0];
  const preferredLanguage = shared.language
    ?? loadLanguage()
    ?? (SUPPORTED_LANGUAGES.includes(browserLanguage) ? browserLanguage : "en");

  elements.project.value = shared.data ? shared.project : (shared.project || saved.project || "");
  elements.start.value = shared.start || saved.start || toDateKey(today);
  elements.end.value = shared.end || saved.end || toDateKey(addDays(today, 27));
  elements.weekStart.value = shared.weekStart
    || (["0", "1", "first"].includes(saved.weekStart) ? saved.weekStart : "1");
  elements.printOrientation.value = shared.printOrientation
    || (["landscape", "portrait"].includes(saved.printOrientation)
      ? saved.printOrientation
      : "landscape");

  // Repair stale or manually edited URLs whose end precedes their start.
  const validStart = parseDate(elements.start.value);
  if (!validStart) elements.start.value = toDateKey(today);
  const start = parseDate(elements.start.value);
  const end = parseDate(elements.end.value);
  if (!end || end < start) elements.end.value = toDateKey(addDays(start, 27));

  language = normalizeLanguage(preferredLanguage);
  messages = getMessages(language);
  languagePicker.setValue(language);
  translateDocument(language);
  applyPrintOrientation();

  const settings = getSettings();
  const calendarId = getCalendarId(settings);
  calendarView.render({ settings, calendarId, language, messages });

  if (shared.data) {
    // A shared URL is an authoritative snapshot. Clear local content for the
    // same visible calendar first so stale notes cannot leak into that view.
    calendarView.clearAll();
    saveSnapshot(calendarId, shared.data);
    calendarView.render({ settings, calendarId, language, messages });
  }

  dateRangePicker.update({ language, messages });
  saveSettings(settings);
  saveLanguage(language);
  setStatus(messages.ready);
}

/** Bind controls after modules exist so every event follows one update path. */
function bindApplicationEvents() {
  elements.form.addEventListener("submit", (event) => event.preventDefault());

  elements.project.addEventListener("input", () => {
    calendarView.updateProjectTitle(elements.project.value);
    saveSettings(getSettings());
  });
  elements.project.addEventListener("change", () => {
    refreshCalendar({ carryVisibleContent: true });
  });

  elements.weekStart.addEventListener("change", () => {
    refreshCalendar({ carryVisibleContent: true });
  });
  elements.printOrientation.addEventListener("change", () => {
    applyPrintOrientation();
    saveSettings(getSettings());
  });
  elements.orientationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      elements.printOrientation.value = button.dataset.orientation;
      elements.printOrientation.dispatchEvent(new Event("change"));
    });
  });
  elements.share.addEventListener("click", shareCalendar);
  document.querySelector("#printButton").addEventListener("click", () => window.print());

  document.querySelector("#clearButton").addEventListener("click", () => {
    if (!Object.keys(calendarView.getSnapshot().notes).length) return;
    if (!window.confirm(messages.confirmNotes)) return;
    calendarView.clearNotes();
    setStatus(messages.notesCleared);
  });

  document.querySelector("#clearColorsButton").addEventListener("click", () => {
    if (!Object.keys(calendarView.getSnapshot().colors).length) return;
    if (!window.confirm(messages.confirmColors)) return;
    calendarView.clearColors();
    setStatus(messages.colorsCleared);
  });

  document.querySelector("#cleanAllButton").addEventListener("click", () => {
    if (!window.confirm(messages.confirmAll)) return;

    // Clear both the current project and the empty-name destination before the
    // original behavior resets the title field.
    calendarView.clearAll();
    elements.project.value = "";
    const blankSettings = getSettings();
    clearVisibleContent(getCalendarId(blankSettings), calendarView.getVisibleDateKeys());
    refreshCalendar();

    // Also clean manually supplied or stale query parameters.
    clearShareUrl();
    setStatus(messages.allCleared);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    calendarView.closeSharedNotesEditor();
    calendarView.hideColorMenu();
    dateRangePicker.close();
    languagePicker.close();
  });
}

bindApplicationEvents();
initialize();
