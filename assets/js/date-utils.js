/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Emanuel Barbera
 *
 * Date helpers for local calendar dates.
 *
 * The app deliberately avoids parsing `YYYY-MM-DD` with `new Date(string)`
 * because browsers interpret that form as UTC. Constructing the value from
 * numeric parts keeps calendar days stable across time zones.
 */

const MILLISECONDS_PER_DAY = 86_400_000;

/** Convert a `YYYY-MM-DD` value into a local Date instance. */
export function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  // Reject values that the Date constructor silently normalizes, such as 31 February.
  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/** Format a local Date as the stable `YYYY-MM-DD` key used by storage and URLs. */
export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Return a new Date shifted by a whole number of calendar days. */
export function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

/** Return the inclusive number of calendar days between two local dates. */
export function inclusiveDaysBetween(start, end) {
  // Noon avoids daylight-saving transitions around local midnight.
  const startNoon = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 12);
  const endNoon = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 12);
  return Math.round((endNoon - startNoon) / MILLISECONDS_PER_DAY) + 1;
}

/**
 * Find the first visible day of a calendar row.
 * `mode` accepts Monday (`"1"`), Sunday (`"0"`), or the exact start date
 * (`"first"`).
 */
export function startOfCalendarWeek(date, mode) {
  if (mode === "first") {
    return new Date(date);
  }

  const result = new Date(date);
  const offset = mode === "1" ? (result.getDay() + 6) % 7 : result.getDay();
  result.setDate(result.getDate() - offset);
  return result;
}

/** Return true when a value is a valid supported calendar date string. */
export function isDateKey(value) {
  return parseDate(value) !== null;
}

/** Return a new Date representing the first day of a month. */
export function startOfMonth(date, offset = 0) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

/** Return a new Date representing the final day of a month. */
export function endOfMonth(date, offset = 0) {
  return new Date(date.getFullYear(), date.getMonth() + offset + 1, 0);
}
