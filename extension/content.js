/**
 * content.js — NightShift Dark Mode
 * Injected into every page at document_start.
 * Applies/removes dark mode CSS based on per-domain preference in chrome.storage.
 */
(function () {
  'use strict';

  const STYLE_ID = 'nightshift-dark-mode-style';

  function applyDarkMode() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Invert page colours, rotate hue back so overall tones stay correct */
      html {
        filter: invert(1) hue-rotate(180deg) !important;
      }
      /* Re-invert media elements so photos/videos look natural */
      img, video, canvas, iframe, embed, object,
      svg image, picture, [style*="background-image"] {
        filter: invert(1) hue-rotate(180deg) !important;
      }
    `;

    const target = document.head || document.documentElement;
    target.appendChild(style);
  }

  function removeDarkMode() {
    const el = document.getElementById(STYLE_ID);
    if (el) el.remove();
  }

  // Read stored preference and apply as early as possible (avoids flash of light content)
  const domain = window.location.hostname;
  chrome.storage.local.get([domain], (result) => {
    if (result[domain] === true) applyDarkMode();
  });

  // Listen for toggle messages sent by the popup
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action === 'enableDark')  { applyDarkMode();    sendResponse({ ok: true }); }
    if (msg.action === 'disableDark') { removeDarkMode();   sendResponse({ ok: true }); }
    if (msg.action === 'getStatus')   { sendResponse({ enabled: !!document.getElementById(STYLE_ID), domain }); }
  });
})();
