// tests/editor-context-menu.spec.js
// The custom right-click context menu was removed — right-clicks in the
// editor now defer entirely to the browser's native context menu
// (cut/copy/paste/select-all, spell-check suggestions, Inspect, ...).
// These tests pin that behavior: no custom menu element may exist, and
// dispatching a `contextmenu` event on the editor must not be
// preventDefault()ed by the app (a prevented event is what suppresses the
// native menu).
//
// Playwright's synthetic right-click (page.mouse.click(..., {button:'right'}))
// doesn't reliably fire a real `contextmenu` DOM event across environments —
// dispatching one directly is the robust way to exercise this in tests
// (real browsers fire it reliably on an actual right-click; this only affects
// how the test simulates one).

import { test, expect } from '@playwright/test';
import { createRoom, typeInEditor } from './helpers.js';

test.describe('Editor context menu (native)', () => {
  test('no custom context menu element exists in the DOM', async ({ page }) => {
    await createRoom(page);
    await expect(page.locator('#editor-context-menu')).toHaveCount(0);
  });

  test('right-click on the editor is not intercepted, so the native menu opens', async ({ page }) => {
    await createRoom(page);
    await typeInEditor(page, 'hello native world');
    const defaultPrevented = await page.locator('#note-editor').evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const ev = new MouseEvent('contextmenu', {
        bubbles: true, cancelable: true,
        clientX: rect.x + 40, clientY: rect.y + 20,
      });
      el.dispatchEvent(ev);
      return ev.defaultPrevented;
    });
    expect(defaultPrevented).toBe(false);
  });
});
