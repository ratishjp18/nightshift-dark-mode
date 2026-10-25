/**
 * background.js — NightShift Dark Mode
 * Service worker. On install, pulls all preferences from the Python backend
 * into chrome.storage.local so pages get dark mode before the popup is opened.
 */
'use strict';

const BACKEND = 'http://localhost:5000';

chrome.runtime.onInstalled.addListener(() => {
  console.log('NightShift Dark Mode installed.');
  syncFromBackend();
});

async function syncFromBackend() {
  try {
    const res = await fetch(`${BACKEND}/api/preferences`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return;

    const prefs = await res.json();
    const data = {};
    for (const p of prefs) data[p.domain] = p.enabled;
    await chrome.storage.local.set(data);
    console.log(`NightShift: synced ${prefs.length} preference(s) from backend.`);
  } catch {
    // Backend offline — chrome.storage.local is the fallback.
  }
}
