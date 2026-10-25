/**
 * background.js — NightShift Dark Mode
 * Service worker. No backend sync needed — storage is chrome.storage.local only.
 */
'use strict';

chrome.runtime.onInstalled.addListener(() => {
  console.log('NightShift Dark Mode installed.');
});
