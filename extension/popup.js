/**
 * popup.js — NightShift Dark Mode
 * No backend required — chrome.storage.local only.
 */
'use strict';

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function extractDomain(url) {
  try { return new URL(url).hostname; } catch { return ''; }
}

async function fetchStats() {
  const all = await chrome.storage.local.get(null);
  const count = Object.entries(all)
    .filter(([key, val]) => !key.includes('_') && val === true)
    .length;
  return `${count} site${count !== 1 ? 's' : ''} with dark mode enabled`;
}

function updateSliderFill(slider, value) {
  const min = parseInt(slider.min) || 40;
  const max = parseInt(slider.max) || 100;
  const pct = ((value - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(to right, #3d6fd4 ${pct}%, #4a4a68 ${pct}%)`;
}

function setToggleUI(enabled, intensity = 80) {
  document.getElementById('darkModeToggle').checked = enabled;
  const sub = document.getElementById('toggleSubtitle');
  sub.textContent = enabled ? 'On — page is dark' : 'Off';
  sub.className = `toggle-subtitle${enabled ? ' enabled' : ''}`;

  document.getElementById('intensitySection').style.display = enabled ? 'block' : 'none';
  const slider = document.getElementById('intensitySlider');
  slider.value = intensity;
  updateSliderFill(slider, intensity);
  document.getElementById('intensityValue').textContent = `${intensity}%`;
}

async function init() {
  const tab = await getCurrentTab();

  if (!tab?.url || /^(chrome|chrome-extension|about|edge):\/\//i.test(tab.url)) {
    document.getElementById('domainName').textContent     = 'System page';
    document.getElementById('toggleSubtitle').textContent = 'Cannot modify this page';
    document.getElementById('darkModeToggle').disabled    = true;
    document.getElementById('statsText').textContent      = 'System pages cannot be modified';
    return;
  }

  const domain = extractDomain(tab.url);
  document.getElementById('domainName').textContent = domain || tab.url;

  const stored    = await chrome.storage.local.get([domain, `${domain}_intensity`]);
  const enabled   = stored[domain] === true;
  const intensity = stored[`${domain}_intensity`] ?? 80;

  setToggleUI(enabled, intensity);
  fetchStats().then(t => { document.getElementById('statsText').textContent = t; });

  // ── Toggle ─────────────────────────────────────────
  document.getElementById('darkModeToggle').addEventListener('change', async (e) => {
    const enabled   = e.target.checked;
    const intensity = parseInt(document.getElementById('intensitySlider').value);

    setToggleUI(enabled, intensity);
    await chrome.storage.local.set({ [domain]: enabled });

    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: enabled ? 'enableDark' : 'disableDark',
        intensity,
      });
    } catch {
      chrome.tabs.reload(tab.id);
    }

    fetchStats().then(t => { document.getElementById('statsText').textContent = t; });
  });

  // ── Intensity slider ───────────────────────────────
  document.getElementById('intensitySlider').addEventListener('input', async (e) => {
    const intensity = parseInt(e.target.value);
    updateSliderFill(e.target, intensity);
    document.getElementById('intensityValue').textContent = `${intensity}%`;
    await chrome.storage.local.set({ [`${domain}_intensity`]: intensity });

    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'setIntensity', intensity });
    } catch { /* tab not reachable */ }
  });
}

init();
