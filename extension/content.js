/**
 * content.js — NightShift Dark Mode
 * Injected into every page at document_start.
 * Applies/removes dark mode CSS with adjustable intensity.
 */
(function () {
  'use strict';

  const STYLE_ID = 'nightshift-dark-mode-style';

  function applyDarkMode(intensity = 80) {
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      const target = document.head || document.documentElement;
      target.appendChild(el);
    }

    const brightness = (intensity / 100).toFixed(2);
    el.textContent = `
      html {
        filter: invert(1) hue-rotate(180deg) brightness(${brightness}) !important;
      }
      img, video, canvas, iframe, embed, object,
      svg image, picture, [style*="background-image"] {
        filter: invert(1) hue-rotate(180deg) brightness(${brightness}) !important;
      }
    `;
  }

  function removeDarkMode() {
    const el = document.getElementById(STYLE_ID);
    if (el) el.remove();
  }

  // Apply on page load based on stored preference
  const domain = window.location.hostname;
  chrome.storage.local.get([domain, `${domain}_intensity`], (result) => {
    if (result[domain] === true) {
      applyDarkMode(result[`${domain}_intensity`] ?? 80);
    }
  });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action === 'enableDark') {
      applyDarkMode(msg.intensity ?? 80);
      sendResponse({ ok: true });
    }
    if (msg.action === 'disableDark') {
      removeDarkMode();
      sendResponse({ ok: true });
    }
    if (msg.action === 'setIntensity') {
      applyDarkMode(msg.intensity);
      sendResponse({ ok: true });
    }
    if (msg.action === 'getStatus') {
      sendResponse({ enabled: !!document.getElementById(STYLE_ID), domain });
    }
  });
})();
