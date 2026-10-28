/**
 * content.js — NightShift Dark Mode
 *
 * Features:
 *  - Smooth fade transition when toggling on/off
 *  - Intensity slider: controls shade (40=lighter, 100=darker)
 */
(function () {
  'use strict';

  const STYLE_ID       = 'nightshift-dark-mode-style';
  const TRANS_STYLE_ID = 'nightshift-transition-style';

  function injectTransition() {
    if (document.getElementById(TRANS_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = TRANS_STYLE_ID;
    style.textContent = `
      html { transition: filter 0.5s ease !important; }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function applyDarkMode(intensity = 80) {
    injectTransition();

    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }

    const brightness = (1.7 - (intensity / 100) * 1.1).toFixed(2);

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
    injectTransition();
    const el = document.getElementById(STYLE_ID);
    if (el) el.remove();
  }

  const domain = window.location.hostname;
  chrome.storage.local.get([domain, `${domain}_intensity`], (result) => {
    if (result[domain] === true) {
      applyDarkMode(result[`${domain}_intensity`] ?? 80);
    }
  });

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action === 'enableDark')   { applyDarkMode(msg.intensity ?? 80); sendResponse({ ok: true }); }
    if (msg.action === 'disableDark')  { removeDarkMode();                   sendResponse({ ok: true }); }
    if (msg.action === 'setIntensity') { applyDarkMode(msg.intensity);       sendResponse({ ok: true }); }
    if (msg.action === 'getStatus')    { sendResponse({ enabled: !!document.getElementById(STYLE_ID), domain }); }
  });
})();
