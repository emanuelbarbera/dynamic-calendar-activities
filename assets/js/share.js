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
const ALLOWED_PRINT_ORIENTATIONS = new Set(["landscape", "portrait"]);

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
  if (!value || typeof value !== "object" || ![1, 2].includes(value.v)) return null;

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

  const snapshot = {
    v: value.v,
    project: typeof (value.project ?? value.p) === "string"
      ? (value.project ?? value.p).slice(0, 80)
      : "",
    notes,
    colors,
    sharedNotes,
  };

  if (value.v === 1) return snapshot;

  return {
    ...snapshot,
    start: isDateKey(value.start ?? value.s) ? (value.start ?? value.s) : null,
    end: isDateKey(value.end ?? value.e) ? (value.end ?? value.e) : null,
    weekStart: ALLOWED_WEEK_STARTS.has(value.weekStart ?? value.w)
      ? (value.weekStart ?? value.w)
      : null,
    language: typeof (value.language ?? value.l) === "string"
      ? normalizeLanguage(value.language ?? value.l)
      : null,
    printOrientation: ALLOWED_PRINT_ORIENTATIONS.has(value.printOrientation ?? value.o)
      ? (value.printOrientation ?? value.o)
      : null,
  };
}

/** Read and validate calendar settings and content from the current URL. */
export function readShareUrl() {
  const params = new URLSearchParams(window.location.search);
  const data = decodeShareData(params.get("data"));
  const start = params.get("start_date");
  const end = params.get("end_date");
  const weekStart = params.get("week_start");
  const requestedLanguage = params.get("lang");

  return {
    start: data?.v === 2 ? data.start : (isDateKey(start) ? start : null),
    end: data?.v === 2 ? data.end : (isDateKey(end) ? end : null),
    weekStart: data?.v === 2
      ? data.weekStart
      : (ALLOWED_WEEK_STARTS.has(weekStart) ? weekStart : null),
    language: data?.v === 2
      ? data.language
      : (requestedLanguage ? normalizeLanguage(requestedLanguage) : null),
    printOrientation: data?.v === 2 ? data.printOrientation : null,
    project: data?.project || (params.get("project") ?? "").slice(0, 80),
    data,
  };
}

/** Build a complete share URL without exposing it in the current address bar. */
export function createShareUrl({ settings, language, snapshot }, baseUrl = window.location.href) {
  const url = new URL(baseUrl);
  url.search = "";
  url.searchParams.set("data", encodeShareData({
    v: 2,
    p: settings.project,
    s: settings.start,
    e: settings.end,
    w: settings.weekStart,
    o: settings.printOrientation,
    l: normalizeLanguage(language),
    n: snapshot.notes,
    c: snapshot.colors,
    g: snapshot.sharedNotes,
  }));
  return url.toString();
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
