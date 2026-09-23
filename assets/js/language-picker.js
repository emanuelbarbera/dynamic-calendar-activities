/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Emanuel Barbera
 *
 * Accessible language menu with visual country flags.
 *
 * Flags use one local SVG sprite, so the menu is immediately available and
 * renders consistently on desktop without a third-party CDN.
 */

/** Keep visual metadata beside the control instead of coupling it to i18n. */
export const LANGUAGE_OPTIONS = Object.freeze({
  en: { flag: "en", name: "English" },
  es: { flag: "es", name: "Español" },
  it: { flag: "it", name: "Italiano" },
  pt: { flag: "pt", name: "Português" },
  fr: { flag: "fr", name: "Français" },
  de: { flag: "de", name: "Deutsch" },
  zh: { flag: "zh", name: "简体中文" },
  ja: { flag: "ja", name: "日本語" },
  ko: { flag: "ko", name: "한국어" },
  ar: { flag: "ar", name: "العربية" },
  hi: { flag: "hi", name: "हिन्दी" },
  ru: { flag: "ru", name: "Русский" },
});

export class LanguagePicker {
  constructor({ root, input, trigger, menu, flag, name, onChange }) {
    this.root = root;
    this.input = input;
    this.trigger = trigger;
    this.menu = menu;
    this.flag = flag;
    this.name = name;
    this.onChange = onChange;
    this.options = [...menu.querySelectorAll("[data-language]")];

    this.bindEvents();
    this.setValue(input.value || "en");
  }

  /** Synchronize the hidden form value and every visual/accessibility state. */
  setValue(language) {
    const value = Object.hasOwn(LANGUAGE_OPTIONS, language) ? language : "en";
    const option = LANGUAGE_OPTIONS[value];

    this.input.value = value;
    this.flag.dataset.flag = option.flag;
    this.name.textContent = option.name;
    this.options.forEach((button) => {
      button.setAttribute("aria-checked", String(button.dataset.language === value));
    });
  }

  open({ focusSelected = false } = {}) {
    this.menu.hidden = false;
    this.trigger.setAttribute("aria-expanded", "true");

    if (focusSelected) {
      const selected = this.options.find((button) => button.dataset.language === this.input.value);
      window.requestAnimationFrame(() => selected?.focus());
    }
  }

  close({ restoreFocus = false } = {}) {
    this.menu.hidden = true;
    this.trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) this.trigger.focus();
  }

  toggle() {
    if (this.menu.hidden) this.open();
    else this.close();
  }

  /** Attach pointer and keyboard behavior once for the persistent control. */
  bindEvents() {
    this.trigger.addEventListener("click", () => this.toggle());

    this.trigger.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
      event.preventDefault();
      this.open({ focusSelected: true });
    });

    this.menu.addEventListener("click", (event) => {
      const button = event.target.closest("[data-language]");
      if (!button) return;

      const nextLanguage = button.dataset.language;
      this.setValue(nextLanguage);
      this.close({ restoreFocus: true });
      this.onChange(nextLanguage);
    });

    this.menu.addEventListener("keydown", (event) => {
      const currentIndex = this.options.indexOf(document.activeElement);

      if (event.key === "Escape") {
        event.preventDefault();
        this.close({ restoreFocus: true });
        return;
      }

      const destinations = {
        ArrowDown: (currentIndex + 1) % this.options.length,
        ArrowUp: (currentIndex - 1 + this.options.length) % this.options.length,
        Home: 0,
        End: this.options.length - 1,
      };
      if (!(event.key in destinations)) return;

      event.preventDefault();
      this.options[destinations[event.key]].focus();
    });

    document.addEventListener("pointerdown", (event) => {
      if (!this.root.contains(event.target)) this.close();
    });
  }
}
