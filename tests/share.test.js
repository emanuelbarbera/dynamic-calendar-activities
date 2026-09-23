/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Emanuel Barbera
 *
 * Focused tests for URL cleanup behavior used by the destructive reset.
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  clearShareUrl,
  createShareUrl,
  decodeShareData,
  encodeShareData,
  readShareUrl,
} from "../assets/js/share.js";

test("clearShareUrl removes every query parameter and preserves the hash", () => {
  const previousWindow = globalThis.window;
  let replacement = null;

  globalThis.window = {
    location: { href: "https://example.test/calendar/?start=2026-09-01&data=abc#section" },
    history: {
      replaceState(_state, _title, url) {
        replacement = String(url);
      },
    },
  };

  try {
    clearShareUrl();
    assert.equal(replacement, "https://example.test/calendar/#section");
  } finally {
    globalThis.window = previousWindow;
  }
});

test("shared note groups survive share URL encoding", () => {
  const previousWindow = globalThis.window;
  globalThis.window = { btoa: globalThis.btoa, atob: globalThis.atob };
  const payload = {
    v: 1,
    project: "Release",
    notes: { "2026-09-23": "Launch", "2026-09-24": "Launch" },
    colors: {},
    sharedNotes: [["2026-09-23", "2026-09-24"]],
  };

  try {
    assert.deepEqual(decodeShareData(encodeShareData(payload)), payload);
  } finally {
    globalThis.window = previousWindow;
  }
});

test("createShareUrl produces one self-contained parameter without changing location", () => {
  const previousWindow = globalThis.window;
  const originalHref = "https://example.test/calendar/?unrelated=old#view";
  globalThis.window = {
    location: { href: originalHref },
    btoa: globalThis.btoa,
    atob: globalThis.atob,
  };

  try {
    const shareUrl = createShareUrl({
      settings: {
        project: "Release",
        start: "2026-09-23",
        end: "2026-09-24",
        weekStart: "1",
        printOrientation: "portrait",
      },
      language: "es",
      snapshot: {
        notes: { "2026-09-23": "Lanzamiento" },
        colors: { "2026-09-23": "#dbeafe" },
        sharedNotes: [],
      },
    });
    const parsed = new URL(shareUrl);

    assert.equal(globalThis.window.location.href, originalHref);
    assert.deepEqual([...parsed.searchParams.keys()], ["data"]);
    assert.equal(parsed.hash, "#view");

    globalThis.window.location.search = parsed.search;
    assert.deepEqual(readShareUrl(), {
      start: "2026-09-23",
      end: "2026-09-24",
      weekStart: "1",
      language: "es",
      printOrientation: "portrait",
      project: "Release",
      data: {
        v: 2,
        project: "Release",
        start: "2026-09-23",
        end: "2026-09-24",
        weekStart: "1",
        language: "es",
        printOrientation: "portrait",
        notes: { "2026-09-23": "Lanzamiento" },
        colors: { "2026-09-23": "#dbeafe" },
        sharedNotes: [],
      },
    });
  } finally {
    globalThis.window = previousWindow;
  }
});
