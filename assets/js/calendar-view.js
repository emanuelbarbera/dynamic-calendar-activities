/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Emanuel Barbera
 *
 * Calendar grid renderer and interaction controller.
 *
 * This module owns only the generated calendar surface. Application settings,
 * language selection, date-picker state, and URL synchronization stay in the
 * orchestrator (`app.js`).
 */

import {
  addDays,
  inclusiveDaysBetween,
  parseDate,
  startOfCalendarWeek,
  toDateKey,
} from "./date-utils.js";
import {
  clearVisibleContent,
  loadColor,
  loadNote,
  removeColor,
  saveColor,
  saveNote,
} from "./storage.js";

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

export class CalendarView {
  constructor({ calendar, colorMenu, onContentChange, onStatusChange }) {
    this.calendar = calendar;
    this.colorMenu = colorMenu;
    this.onContentChange = onContentChange;
    this.onStatusChange = onStatusChange;
    this.selectedCells = new Set();
    this.selectionAnchor = null;
    this.selecting = false;
    this.selectionMoved = false;
    this.calendarId = "";
    this.messages = null;
    this.language = "en";

    this.bindPersistentEvents();
  }

  /** Attach listeners for controls that live outside the generated grid. */
  bindPersistentEvents() {
    document.querySelector("#applyMenuColor").addEventListener("click", () => this.applySelectedColor());
    document.querySelector("#closeColorMenu").addEventListener("click", () => this.hideColorMenu());

    document.addEventListener("pointerup", (event) => {
      if (!this.selecting) return;
      this.selecting = false;

      if (this.selectionMoved) this.showColorMenu(event.clientX, event.clientY);
      else this.clearSelection();
    });

    document.addEventListener("pointerdown", (event) => {
      if (!this.colorMenu.contains(event.target) && !event.target.closest(".day")) {
        this.hideColorMenu();
      }
    });
  }

  /** Render a complete calendar from immutable settings and translations. */
  render({ settings, calendarId, language, messages }) {
    const start = parseDate(settings.start);
    const end = parseDate(settings.end);
    if (!start || !end || start > end) return false;

    this.calendarId = calendarId;
    this.messages = messages;
    this.language = language;
    this.clearSelection();
    this.calendar.replaceChildren();

    const first = startOfCalendarWeek(start, settings.weekStart);
    const periodDays = inclusiveDaysBetween(start, end);
    const last = settings.weekStart === "first"
      ? addDays(first, Math.ceil(periodDays / 7) * 7 - 1)
      : addDays(startOfCalendarWeek(end, settings.weekStart), 6);
    const weeksCount = Math.round((last - first) / (7 * 86_400_000)) + 1;
    const spansMultipleMonths = start.getMonth() !== end.getMonth()
      || start.getFullYear() !== end.getFullYear();

    this.updateHeading(settings.project, start, end);
    this.updatePrintSizing(weeksCount);
    this.renderWeekdayHeader(start, settings.weekStart, messages, spansMultipleMonths);
    this.renderWeeks({ start, end, first, last, messages, spansMultipleMonths });
    return true;
  }

  /** Update the visible project title without rebuilding editable cells. */
  updateProjectTitle(project) {
    document.querySelector("#calendarTitle").textContent = project.trim() || this.messages.defaultTitle;
  }

  /** Return serializable notes and colors from the current visible grid. */
  getSnapshot() {
    const notes = {};
    const colors = {};

    this.calendar.querySelectorAll(".notes").forEach((note) => {
      const text = note.innerText.trim();
      if (text) notes[note.closest(".day").dataset.date] = note.innerText;
    });

    this.calendar.querySelectorAll(".day.colored").forEach((cell) => {
      colors[cell.dataset.date] = cell.style.getPropertyValue("--custom-color");
    });

    return { notes, colors };
  }

  /** Return all currently rendered date keys, including padding days. */
  getVisibleDateKeys() {
    return [...this.calendar.querySelectorAll(".day")].map((cell) => cell.dataset.date);
  }

  /** Remove notes from visible cells and storage. */
  clearNotes() {
    clearVisibleContent(this.calendarId, this.getVisibleDateKeys(), { notes: true, colors: false });
    this.calendar.querySelectorAll(".notes").forEach((note) => {
      note.textContent = "";
    });
    this.onContentChange();
  }

  /** Remove colors from visible cells and storage. */
  clearColors() {
    clearVisibleContent(this.calendarId, this.getVisibleDateKeys(), { notes: false, colors: true });
    this.calendar.querySelectorAll(".day.colored").forEach((cell) => {
      cell.classList.remove("colored");
      cell.style.removeProperty("--custom-color");
    });
    this.onContentChange();
  }

  /** Remove all visible user-authored content. */
  clearAll() {
    clearVisibleContent(this.calendarId, this.getVisibleDateKeys());
    this.calendar.querySelectorAll(".notes").forEach((note) => {
      note.textContent = "";
    });
    this.calendar.querySelectorAll(".day.colored").forEach((cell) => {
      cell.classList.remove("colored");
      cell.style.removeProperty("--custom-color");
    });
    this.onContentChange();
  }

  /** Close the color menu and reset any temporary cell selection. */
  hideColorMenu() {
    this.colorMenu.hidden = true;
    this.clearSelection();
  }

  updateHeading(project, start, end) {
    document.querySelector("#calendarTitle").textContent = project.trim() || this.messages.defaultTitle;
    const formatter = new Intl.DateTimeFormat(this.language, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    document.querySelector("#calendarRange").textContent = typeof formatter.formatRange === "function"
      ? formatter.formatRange(start, end)
      : `${formatter.format(start)} — ${formatter.format(end)}`;
  }

  updatePrintSizing(weeksCount) {
    const height = weeksCount <= 4 ? "39mm" : weeksCount === 5 ? "32mm" : "26mm";
    document.documentElement.style.setProperty("--print-day-height", height);
  }

  renderWeekdayHeader(start, weekStart, messages, withMonthMargin) {
    const header = document.createElement("div");
    header.className = "weekdays";

    if (withMonthMargin) {
      header.classList.add("with-month-margin");
      const spacer = document.createElement("div");
      spacer.className = "month-spacer";
      spacer.setAttribute("aria-hidden", "true");
      header.append(spacer);
    }

    const weekdays = weekStart === "first"
      ? Array.from({ length: 7 }, (_, index) => messages.weekdays[addDays(start, index).getDay()])
      : weekStart === "0"
        ? messages.weekdays
        : [...messages.weekdays.slice(1), messages.weekdays[0]];

    weekdays.forEach((weekday) => {
      const element = document.createElement("div");
      element.className = "weekday";
      element.textContent = weekday;
      header.append(element);
    });

    this.calendar.append(header);
  }

  renderWeeks({ start, end, first, last, messages, spansMultipleMonths }) {
    let currentMonthKey = null;
    let monthWeeksContainer = null;

    for (let cursor = new Date(first); cursor <= last; cursor = addDays(cursor, 7)) {
      const representativeDay = addDays(cursor, 3);
      const monthKey = representativeDay.getFullYear() * 12 + representativeDay.getMonth();

      if (spansMultipleMonths && monthKey !== currentMonthKey) {
        currentMonthKey = monthKey;
        monthWeeksContainer = this.createMonthGroup(representativeDay, messages);
      }

      const week = document.createElement("div");
      week.className = "calendar-week";

      for (let offset = 0; offset < 7; offset += 1) {
        week.append(this.createDayCell(addDays(cursor, offset), start, end, messages));
      }

      if (spansMultipleMonths) monthWeeksContainer.append(week);
      else this.calendar.append(week);
    }
  }

  createMonthGroup(date, messages) {
    const group = document.createElement("div");
    group.className = "calendar-month-group";

    const indicator = document.createElement("div");
    indicator.className = "month-indicator";
    const text = document.createElement("span");
    text.textContent = messages.months[date.getMonth()];
    indicator.append(text);

    const weeks = document.createElement("div");
    weeks.className = "month-weeks";
    group.append(indicator, weeks);
    this.calendar.append(group);
    return weeks;
  }

  createDayCell(date, periodStart, periodEnd, messages) {
    const dateKey = toDateKey(date);
    const outside = date < periodStart || date > periodEnd;
    const cell = document.createElement("article");
    cell.className = "day";
    cell.dataset.date = dateKey;

    if (date.getDay() === 0 || date.getDay() === 6) cell.classList.add("weekend");
    if (outside) cell.classList.add("outside");

    const savedColor = loadColor(this.calendarId, dateKey);
    if (savedColor && HEX_COLOR_PATTERN.test(savedColor)) {
      this.setCellColor(cell, savedColor, false);
    }

    const header = document.createElement("div");
    header.className = "day-head";
    const number = document.createElement("span");
    number.className = "day-number";
    number.textContent = String(date.getDate());
    const month = document.createElement("span");
    month.className = "day-month";
    month.textContent = messages.months[date.getMonth()].slice(0, 3);
    header.append(number, month);

    const note = document.createElement("div");
    note.className = "notes";
    note.contentEditable = "plaintext-only";
    note.spellcheck = true;
    note.dataset.placeholder = outside ? messages.optional : messages.activity;
    note.setAttribute(
      "aria-label",
      `${messages.activitiesFor} ${new Intl.DateTimeFormat(this.language, { dateStyle: "long" }).format(date)}`,
    );
    note.textContent = loadNote(this.calendarId, dateKey);
    note.addEventListener("input", () => {
      saveNote(this.calendarId, dateKey, note.innerText);
      this.onStatusChange(messages.saving, messages.saved);
      this.onContentChange();
    });

    cell.addEventListener("contextmenu", (event) => this.openContextMenu(event));
    cell.addEventListener("pointerdown", (event) => this.beginSelection(event));
    cell.addEventListener("pointerenter", () => this.extendSelection(cell));
    cell.append(header, note);
    return cell;
  }

  openContextMenu(event) {
    event.preventDefault();
    this.clearSelection();
    this.selectionAnchor = event.currentTarget;
    this.addSelection(this.selectionAnchor);
    this.showColorMenu(event.clientX, event.clientY);
  }

  beginSelection(event) {
    if (event.button !== 0 || event.target.closest(".notes")) return;
    this.selecting = true;
    this.selectionMoved = false;
    this.selectionAnchor = event.currentTarget;
    this.clearSelection();
    this.addSelection(this.selectionAnchor);
    event.preventDefault();
  }

  extendSelection(cell) {
    if (!this.selecting || this.selectedCells.has(cell)) return;
    this.addSelection(cell);
    this.selectionMoved = true;
  }

  addSelection(cell) {
    this.selectedCells.add(cell);
    cell.classList.add("selected");
  }

  clearSelection() {
    this.selectedCells.forEach((cell) => cell.classList.remove("selected"));
    this.selectedCells.clear();
  }

  showColorMenu(x, y) {
    const count = this.selectedCells.size;
    const unit = count === 1 ? this.messages.daySingular : this.messages.daysPlural;
    document.querySelector("#colorMenuTitle").textContent = `${this.messages.applyColorTo} ${count} ${unit}`;
    this.colorMenu.hidden = false;
    this.colorMenu.style.left = `${Math.max(8, Math.min(x, window.innerWidth - 250))}px`;
    this.colorMenu.style.top = `${Math.max(8, Math.min(y, window.innerHeight - 245))}px`;
  }

  applySelectedColor() {
    if (!this.selectedCells.size || !this.selectionAnchor) return;

    const color = document.querySelector("#menuColor").value;
    const scope = document.querySelector("#menuScope").value;
    let targets = [...this.selectedCells];

    if (scope === "week") {
      targets = [...this.selectionAnchor.parentElement.children];
    } else if (scope === "column") {
      const index = [...this.selectionAnchor.parentElement.children].indexOf(this.selectionAnchor);
      targets = [...this.calendar.querySelectorAll(".calendar-week")]
        .map((week) => week.children[index])
        .filter(Boolean);
    }

    targets.forEach((cell) => this.setCellColor(cell, color));
    this.onStatusChange(this.messages.colorApplied);
    this.onContentChange();
    this.hideColorMenu();
  }

  setCellColor(cell, color, persist = true) {
    cell.classList.add("colored");
    cell.style.setProperty("--custom-color", color);
    if (persist) saveColor(this.calendarId, cell.dataset.date, color);
  }

  /** Remove a single saved color. Retained as a focused API for future UI work. */
  removeCellColor(cell) {
    cell.classList.remove("colored");
    cell.style.removeProperty("--custom-color");
    removeColor(this.calendarId, cell.dataset.date);
  }
}
