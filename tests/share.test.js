/**
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Emanuel Barbera
 *
 * Focused tests for URL cleanup behavior used by the destructive reset.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { clearShareUrl } from "../assets/js/share.js";

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
