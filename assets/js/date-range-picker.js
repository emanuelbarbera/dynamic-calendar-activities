/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Emanuel Barbera
 *
 * Accessible, dependency-free date-range picker.
 *
 * The picker writes to the hidden `startDate` and `endDate` inputs used by the
 * rest of the application, keeping the custom UI replaceable in the future.
 */

import {
  addDays,
  endOfMonth,
  inclusiveDaysBetween,
  parseDate,
  startOfMonth,
  toDateKey,
} from "./date-utils.js";

export class DateRangePicker {
  constructor({ onChange, getWeekStart }) {
    this.onChange = onChange;
    this.getWeekStart = getWeekStart;
    this.language = "en";
    this.messages = null;
    this.stage = "start";
    this.draftStart = null;
    this.draftEnd = null;
    this.hoverDate = null;
    this.viewMonth = startOfMonth(new Date());

    this.elements = {
      field: document.querySelector("#travelDateField"),
      trigger: document.querySelector("#travelTriggerBtn"),
      popover: document.querySelector("#travelPopover"),
      startInput: document.querySelector("#startDate"),
      endInput: document.querySelector("#endDate"),
      startSlot: document.querySelector("#slotStart"),
      endSlot: document.querySelector("#slotEnd"),
      startTab: document.querySelector("#tabStart"),
      endTab: document.querySelector("#tabEnd"),
      calendars: document.querySelector("#popoverCalendars"),
    };

    this.bindEvents();
  }

  /** Refresh localized labels and values after settings or language changes. */
  update({ language, messages }) {
    this.language = language;
    this.messages = messages;
    this.updateRangeDisplay();
    this.updateStageDisplay();
    if (!this.elements.popover.hidden) this.renderCalendars();
  }

  /** Close the picker without committing draft values. */
  close() {
    this.elements.popover.hidden = true;
    this.elements.trigger.classList.remove("open");
    this.elements.trigger.setAttribute("aria-expanded", "false");
    this.elements.startSlot.classList.remove("active");
    this.elements.endSlot.classList.remove("active");
    this.hoverDate = null;
  }

  bindEvents() {
    this.elements.trigger.addEventListener("click", (event) => {
      const requestedStage = event.target.closest("#slotEnd") ? "end" : "start";
      const isSameOpenStage = !this.elements.popover.hidden && requestedStage === this.stage;
      if (isSameOpenStage) this.close();
      else this.open(requestedStage);
    });

    this.elements.startTab.addEventListener("click", () => this.setStage("start"));
    this.elements.endTab.addEventListener("click", () => this.setStage("end"));

    document.querySelector("#travelPrevMonth").addEventListener("click", () => {
      this.viewMonth = startOfMonth(this.viewMonth, -1);
      this.renderCalendars();
    });
    document.querySelector("#travelNextMonth").addEventListener("click", () => {
      this.viewMonth = startOfMonth(this.viewMonth, 1);
      this.renderCalendars();
    });

    document.querySelector("#travelTodayBtn").addEventListener("click", () => {
      const today = new Date();
      this.applyDates(toDateKey(today), toDateKey(addDays(today, 27)));
      this.close();
    });

    document.querySelector("#travelApplyBtn").addEventListener("click", () => {
      if (this.draftStart && this.draftEnd) {
        this.applyDates(this.draftStart, this.draftEnd);
      }
      this.close();
    });

    document.querySelector("#popoverPresets").addEventListener("click", (event) => {
      const preset = event.target.closest(".preset-pill");
      if (preset) this.applyPreset(preset);
    });

    document.addEventListener("pointerdown", (event) => {
      if (!this.elements.field.contains(event.target)) this.close();
    });
  }

  open(stage = "start") {
    this.stage = stage;
    this.draftStart = this.elements.startInput.value;
    this.draftEnd = this.elements.endInput.value;
    this.hoverDate = null;

    const reference = stage === "end"
      ? parseDate(this.draftEnd)
      : parseDate(this.draftStart);
    this.viewMonth = startOfMonth(reference ?? new Date());

    this.elements.popover.hidden = false;
    this.elements.trigger.classList.add("open");
    this.elements.trigger.setAttribute("aria-expanded", "true");

    // Prevent the fixed-width desktop popover from overflowing the viewport.
    const triggerBounds = this.elements.trigger.getBoundingClientRect();
    const alignRight = triggerBounds.left + 660 > window.innerWidth - 16;
    this.elements.popover.style.left = alignRight ? "auto" : "0";
    this.elements.popover.style.right = alignRight ? "0" : "auto";

    this.updateStageDisplay();
    this.renderCalendars();
  }

  setStage(stage) {
    this.stage = stage;
    this.updateStageDisplay();
    this.renderCalendars();
  }

  updateStageDisplay() {
    if (!this.messages) return;
    const selectingStart = this.stage === "start";
    this.elements.startTab.classList.toggle("active", selectingStart);
    this.elements.endTab.classList.toggle("active", !selectingStart);
    this.elements.startSlot.classList.toggle("active", selectingStart && !this.elements.popover.hidden);
    this.elements.endSlot.classList.toggle("active", !selectingStart && !this.elements.popover.hidden);
    document.querySelector("#popoverNavBadge").textContent = selectingStart
      ? this.messages.start
      : this.messages.end;
  }

  updateRangeDisplay() {
    const start = parseDate(this.elements.startInput.value);
    const end = parseDate(this.elements.endInput.value);
    if (!start || !end) return;

    const dayCount = inclusiveDaysBetween(start, end);
    const duration = `${dayCount} ${dayCount === 1 ? this.messages.daySingular : this.messages.daysPlural}`;
    const shortFormatter = new Intl.DateTimeFormat(this.language, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const numericFormatter = new Intl.DateTimeFormat(this.language);
    const weekdayFormatter = new Intl.DateTimeFormat(this.language, { weekday: "long" });

    const startShort = shortFormatter.format(start);
    const endShort = shortFormatter.format(end);
    const startDetail = `${weekdayFormatter.format(start)} · ${numericFormatter.format(start)}`;
    const endDetail = `${weekdayFormatter.format(end)} · ${numericFormatter.format(end)}`;

    document.querySelector("#displayStartDate").textContent = startShort;
    document.querySelector("#displayEndDate").textContent = endShort;
    document.querySelector("#tabValStart").textContent = startShort;
    document.querySelector("#tabValEnd").textContent = endShort;
    document.querySelector("#tabSubStart").textContent = startDetail;
    document.querySelector("#tabSubEnd").textContent = endDetail;
    document.querySelector("#travelDurationBadge").textContent = duration;
    document.querySelector("#footerDaysText").textContent = duration;
    document.querySelector("#footerDatesText").textContent = `(${numericFormatter.format(start)} — ${numericFormatter.format(end)})`;
    this.elements.startSlot.title = `${this.messages.start}: ${startDetail}`;
    this.elements.endSlot.title = `${this.messages.end}: ${endDetail}`;
    this.elements.trigger.setAttribute(
      "aria-label",
      `${this.messages.start}: ${startShort}; ${this.messages.end}: ${endShort}; ${duration}`,
    );
  }

  renderCalendars() {
    this.elements.calendars.replaceChildren();
    const startsOnSunday = this.getWeekStart() === "0";
    const weekdayLabels = startsOnSunday
      ? this.messages.weekdays
      : [...this.messages.weekdays.slice(1), this.messages.weekdays[0]];

    for (let offset = 0; offset < 2; offset += 1) {
      const monthDate = startOfMonth(this.viewMonth, offset);
      this.elements.calendars.append(this.createMonth(monthDate, weekdayLabels, startsOnSunday));
    }
  }

  createMonth(monthDate, weekdayLabels, startsOnSunday) {
    const column = document.createElement("div");
    column.className = "popover-month-column";

    const title = document.createElement("div");
    title.className = "popover-month-title";
    title.textContent = new Intl.DateTimeFormat(this.language, {
      month: "long",
      year: "numeric",
    }).format(monthDate);

    const weekdayRow = document.createElement("div");
    weekdayRow.className = "popover-weekdays";
    weekdayLabels.forEach((label) => {
      const day = document.createElement("span");
      day.textContent = label;
      weekdayRow.append(day);
    });

    const grid = document.createElement("div");
    grid.className = "popover-days-grid";
    const leadingBlanks = startsOnSunday ? monthDate.getDay() : (monthDate.getDay() + 6) % 7;
    for (let index = 0; index < leadingBlanks; index += 1) {
      const spacer = document.createElement("span");
      spacer.setAttribute("aria-hidden", "true");
      grid.append(spacer);
    }

    const totalDays = endOfMonth(monthDate).getDate();
    for (let dayNumber = 1; dayNumber <= totalDays; dayNumber += 1) {
      grid.append(this.createDayButton(new Date(monthDate.getFullYear(), monthDate.getMonth(), dayNumber)));
    }

    column.append(title, weekdayRow, grid);
    return column;
  }

  createDayButton(date) {
    const key = toDateKey(date);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "popover-day";
    button.textContent = String(date.getDate());
    button.dataset.date = key;
    button.setAttribute("aria-label", new Intl.DateTimeFormat(this.language, { dateStyle: "full" }).format(date));

    if (key === toDateKey(new Date())) button.classList.add("is-today");
    if (key === this.draftStart) button.classList.add("is-start");
    if (key === this.draftEnd) button.classList.add("is-end");
    if (key === this.draftStart && key === this.draftEnd) button.classList.add("is-single");

    const start = parseDate(this.draftStart);
    const end = parseDate(this.draftEnd);
    if (start && end && date > start && date < end) button.classList.add("in-range");

    button.addEventListener("click", () => this.selectDate(key));
    button.addEventListener("pointerenter", () => {
      if (this.stage === "end" && this.draftStart) {
        this.hoverDate = key;
        this.updateHoverPreview();
      }
    });
    return button;
  }

  selectDate(dateKey) {
    if (this.stage === "start") {
      this.draftStart = dateKey;
      if (this.draftEnd && parseDate(this.draftEnd) < parseDate(this.draftStart)) {
        this.draftEnd = this.draftStart;
      }
      this.stage = "end";
      this.updateStageDisplay();
      this.renderCalendars();
      return;
    }

    if (parseDate(dateKey) < parseDate(this.draftStart)) {
      this.draftStart = dateKey;
      this.renderCalendars();
      return;
    }

    this.draftEnd = dateKey;
    this.applyDates(this.draftStart, this.draftEnd);
    this.close();
  }

  updateHoverPreview() {
    const start = parseDate(this.draftStart);
    const hovered = parseDate(this.hoverDate);
    if (!start || !hovered) return;

    this.elements.calendars.querySelectorAll(".popover-day").forEach((button) => {
      const date = parseDate(button.dataset.date);
      button.classList.toggle("is-hover-range", date > start && date <= hovered);
    });
  }

  applyPreset(element) {
    const currentStart = parseDate(this.elements.startInput.value) ?? new Date();
    let start = currentStart;
    let end = null;

    if (element.dataset.days) {
      end = addDays(start, Number.parseInt(element.dataset.days, 10) - 1);
    } else if (element.dataset.preset === "thisMonth") {
      start = startOfMonth(new Date());
      end = endOfMonth(new Date());
    } else if (element.dataset.preset === "nextMonth") {
      start = startOfMonth(new Date(), 1);
      end = endOfMonth(new Date(), 1);
    }

    if (end) {
      this.applyDates(toDateKey(start), toDateKey(end));
      this.close();
    }
  }

  applyDates(startKey, endKey) {
    let start = parseDate(startKey);
    let end = parseDate(endKey);
    if (!start || !end) return;
    if (start > end) [start, end] = [end, start];

    this.elements.startInput.value = toDateKey(start);
    this.elements.endInput.value = toDateKey(end);
    this.updateRangeDisplay();
    this.onChange();
  }
}
