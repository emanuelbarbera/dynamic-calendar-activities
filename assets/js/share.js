/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Emanuel Barbera
 *
 * URL sharing helpers.
 *
 * Shared data is compact Base64URL-encoded JSON. It is not encryption: anyone
 * with the URL can read its contents. The README calls out that privacy model.
 */

import { isDateKey } from "./date-utils.js";
import { normalizeLanguage } from "./i18n.js";

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const ALLOWED_WEEK_STARTS = new Set(["0", "1", "first"]);

/** Encode a JSON-compatible value as Unicode-safe Base64URL text. */
export function encodeShareData(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

/** Decode Base64URL JSON, returning `null` for malformed or unsupported data. */
export function decodeShareData(value) {
  try {
    if (!value) return null;
    const padding = "=".repeat((4 - (value.length % 4)) % 4);
    const binary = window.atob(value.replace(/-/g, "+").replace(/_/g, "/") + padding);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const decoded = JSON.parse(new TextDecoder().decode(bytes));
    return sanitizeShareData(decoded);
  } catch {
    return null;
  }
}

/** Limit untrusted URL content before it reaches the DOM or local storage. */
function sanitizeShareData(value) {
  if (!value || typeof value !== "object" || value.v !== 1) return null;

  const notes = {};
  const colors = {};
  const sharedNotes = [];

  Object.entries(value.notes ?? value.n ?? {}).forEach(([dateKey, text]) => {
    if (isDateKey(dateKey) && typeof text === "string") {
      notes[dateKey] = text.slice(0, 10_000);
    }
  });

  Object.entries(value.colors ?? value.c ?? {}).forEach(([dateKey, color]) => {
    if (isDateKey(dateKey) && typeof color === "string" && HEX_COLOR_PATTERN.test(color)) {
      colors[dateKey] = color;
    }
  });

  const sharedNoteGroups = value.sharedNotes ?? value.g ?? [];
  (Array.isArray(sharedNoteGroups) ? sharedNoteGroups : []).forEach((dates) => {
    if (!Array.isArray(dates)) return;
    const normalized = [...new Set(dates.filter((dateKey) => isDateKey(dateKey)))].slice(0, 366);
    if (normalized.length > 1) sharedNotes.push(normalized);
  });

  return {
    v: 1,
    project: typeof (value.project ?? value.p) === "string"
      ? (value.project ?? value.p).slice(0, 80)
      : "",
    notes,
    colors,
    sharedNotes,
  };
}

/** Read and validate calendar settings and content from the current URL. */
export function readShareUrl() {
  const params = new URLSearchParams(window.location.search);
  const start = params.get("start_date");
  const end = params.get("end_date");
  const weekStart = params.get("week_start");
  const requestedLanguage = params.get("lang");

  return {
    start: isDateKey(start) ? start : null,
    end: isDateKey(end) ? end : null,
    weekStart: ALLOWED_WEEK_STARTS.has(weekStart) ? weekStart : null,
    language: requestedLanguage ? normalizeLanguage(requestedLanguage) : null,
    project: (params.get("project") ?? "").slice(0, 80),
    data: decodeShareData(params.get("data")),
  };
}

/** Replace the current URL with a shareable representation of visible state. */
export function updateShareUrl({ settings, language, snapshot }) {
  try {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("start_date", settings.start);
    url.searchParams.set("end_date", settings.end);
    url.searchParams.set("lang", normalizeLanguage(language));
    url.searchParams.set("week_start", settings.weekStart);
    url.searchParams.set("data", encodeShareData({
      v: 1,
      project: settings.project,
      notes: snapshot.notes,
      colors: snapshot.colors,
      sharedNotes: snapshot.sharedNotes,
    }));
    window.history.replaceState(null, "", url);
  } catch {
    // Some file:// environments restrict History API updates. The calendar
    // remains fully usable even when its URL cannot be refreshed.
  }
}

/** Remove every query parameter while preserving the current path and hash. */
export function clearShareUrl() {
  try {
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState(null, "", url);
  } catch {
    // History updates may be unavailable under file:// or strict policies.
  }
}
