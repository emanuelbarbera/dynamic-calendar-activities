/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Emanuel Barbera
 *
 * Browser persistence adapter.
 *
 * All storage access lives here so the rest of the app remains testable and
 * does not need to know key formats. Failures (private mode, full quota, or a
 * blocked storage policy) degrade gracefully to an in-memory session.
 */

const SETTINGS_KEY = "dynamic-calendar:settings";
const LANGUAGE_KEY = "dynamic-calendar:language";
const CONTENT_PREFIX = "dynamic-calendar:v2";
const memoryFallback = new Map();

function read(key) {
  try {
    return window.localStorage.getItem(key) ?? memoryFallback.get(key) ?? null;
  } catch {
    return memoryFallback.get(key) ?? null;
  }
}

function write(key, value) {
  memoryFallback.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The in-memory value keeps the current session functional.
  }
}

function remove(key) {
  memoryFallback.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    // There is nothing else to clean when persistent storage is unavailable.
  }
}

/** Build the stable identity used to isolate one calendar from another. */
export function getCalendarId(settings) {
  // `sin-nombre` is retained for backward compatibility with the original app.
  const project = settings.project.trim().toLowerCase() || "sin-nombre";
  return [project, settings.start, settings.end, settings.weekStart].join("|");
}

function noteKey(calendarId, dateKey) {
  return `${CONTENT_PREFIX}:${calendarId}:${dateKey}`;
}

function colorKey(calendarId, dateKey) {
  return `${CONTENT_PREFIX}:color:${calendarId}:${dateKey}`;
}

/** Load the last-used project settings, or an empty object on invalid data. */
export function loadSettings() {
  try {
    const value = JSON.parse(read(SETTINGS_KEY) ?? "{}");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

/** Save only the small set of settings required to restore a calendar. */
export function saveSettings(settings) {
  write(SETTINGS_KEY, JSON.stringify({
    project: settings.project,
    start: settings.start,
    end: settings.end,
    weekStart: settings.weekStart,
  }));
}

/** Load the preferred interface language. */
export function loadLanguage() {
  return read(LANGUAGE_KEY);
}

/** Save the preferred interface language. */
export function saveLanguage(language) {
  write(LANGUAGE_KEY, language);
}

/** Load a daily note for a calendar. */
export function loadNote(calendarId, dateKey) {
  return read(noteKey(calendarId, dateKey)) ?? "";
}

/** Save or remove a daily note for a calendar. */
export function saveNote(calendarId, dateKey, text) {
  const key = noteKey(calendarId, dateKey);
  if (text.trim()) write(key, text);
  else remove(key);
}

/** Load a saved cell color for a calendar. */
export function loadColor(calendarId, dateKey) {
  return read(colorKey(calendarId, dateKey));
}

/** Save a cell color for a calendar. */
export function saveColor(calendarId, dateKey, color) {
  write(colorKey(calendarId, dateKey), color);
}

/** Remove a cell color from a calendar. */
export function removeColor(calendarId, dateKey) {
  remove(colorKey(calendarId, dateKey));
}

/**
 * Persist a date-keyed snapshot after the calendar identity changes.
 * This makes edits survive changes to the project name, dates, or week mode.
 */
export function saveSnapshot(calendarId, snapshot) {
  Object.entries(snapshot.notes ?? {}).forEach(([dateKey, text]) => {
    saveNote(calendarId, dateKey, text);
  });
  Object.entries(snapshot.colors ?? {}).forEach(([dateKey, color]) => {
    saveColor(calendarId, dateKey, color);
  });
}

/** Clear the visible dates from one calendar without touching other projects. */
export function clearVisibleContent(calendarId, dateKeys, { notes = true, colors = true } = {}) {
  dateKeys.forEach((dateKey) => {
    if (notes) remove(noteKey(calendarId, dateKey));
    if (colors) remove(colorKey(calendarId, dateKey));
  });
}
