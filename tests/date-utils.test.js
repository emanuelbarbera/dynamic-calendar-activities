/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Emanuel Barbera
 *
 * Unit tests for the pure date helpers. No third-party runner is needed.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  addDays,
  inclusiveDaysBetween,
  isDateKey,
  parseDate,
  startOfCalendarWeek,
  toDateKey,
} from "../assets/js/date-utils.js";
import {
  getTextDirection,
  SUPPORTED_LANGUAGES,
  translations,
} from "../assets/js/i18n.js";
import { LANGUAGE_OPTIONS } from "../assets/js/language-picker.js";

test("parseDate creates a local date without UTC drift", () => {
  const date = parseDate("2026-09-17");
  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 8);
  assert.equal(date.getDate(), 17);
});

test("parseDate rejects malformed and normalized dates", () => {
  assert.equal(parseDate("2026-02-31"), null);
  assert.equal(parseDate("17-09-2026"), null);
  assert.equal(parseDate(""), null);
});

test("toDateKey pads months and days", () => {
  assert.equal(toDateKey(new Date(2026, 0, 5)), "2026-01-05");
});

test("addDays crosses month and year boundaries", () => {
  assert.equal(toDateKey(addDays(new Date(2026, 11, 31), 1)), "2027-01-01");
});

test("inclusiveDaysBetween counts both boundary dates", () => {
  assert.equal(inclusiveDaysBetween(new Date(2026, 8, 1), new Date(2026, 8, 1)), 1);
  assert.equal(inclusiveDaysBetween(new Date(2026, 8, 1), new Date(2026, 8, 28)), 28);
});

test("startOfCalendarWeek supports Monday, Sunday, and exact-start modes", () => {
  const thursday = new Date(2026, 8, 17);
  assert.equal(toDateKey(startOfCalendarWeek(thursday, "1")), "2026-09-14");
  assert.equal(toDateKey(startOfCalendarWeek(thursday, "0")), "2026-09-13");
  assert.equal(toDateKey(startOfCalendarWeek(thursday, "first")), "2026-09-17");
});

test("isDateKey validates supported URL and storage keys", () => {
  assert.equal(isDateKey("2024-02-29"), true);
  assert.equal(isDateKey("2025-02-29"), false);
});

test("every supported language implements the complete translation contract", () => {
  const englishKeys = Object.keys(translations.en).sort();
  SUPPORTED_LANGUAGES.forEach((language) => {
    assert.deepEqual(Object.keys(translations[language]).sort(), englishKeys);
    assert.equal(translations[language].months.length, 12);
    assert.equal(translations[language].weekdays.length, 7);
  });
});

test("language metadata and translation catalogs stay synchronized", () => {
  assert.deepEqual(Object.keys(LANGUAGE_OPTIONS), SUPPORTED_LANGUAGES);
});

test("Arabic uses right-to-left layout without affecting other languages", () => {
  assert.equal(getTextDirection("ar"), "rtl");
  assert.equal(getTextDirection("en"), "ltr");
  assert.equal(getTextDirection("unsupported"), "ltr");
});
