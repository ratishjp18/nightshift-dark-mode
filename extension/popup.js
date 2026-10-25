/**
 * popup.js — NightShift Dark Mode
 * Manages the toolbar popup UI.
 * Storage flow:
 *   1. chrome.storage.local  → instant, offline-capable
 *   2. Python Flask backend  → durable, survives browser resets (optional)
 */
'use strict';

const BACKEND = 'http://localhost:5000';

// ── Helpers ────────────────────────────────────────────────────────────────

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function extractDomain(url) {
  try { return new URL(url).hostname; } catch { return ''; }
}

// ── Backend ────────────────────────────────────────────────────────────────

async function checkBackend() {
  try {
    const res = await fetch(`${BACKEND}/api/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch { return false; }
}

async function saveToBackend(domain, enabled) {
  try {
    await fetch(`${BACKEND}/api/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, enabled }),
      signal: AbortSignal.timeout(3000),
    });
  } catch { /* offline — local storage already saved */ }
}

async function fetchStats() {
  try {
    const res = await fetch(`${BACKEND}/api/preferences`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const all = await res.json();
      const on = all.filter(p => p.enabled).length;
      return `${on} site${on !== 1 ? 's' : ''} with dark mode enabled`;
    }
  } catch { /* fall through */ }

  // Fallback: count from local storage
  const all = await chrome.storage.local.get(null);
  const on = Object.values(all).filter(v => v === true).length;
  return `${on} site${on !== 1 ? 's' : ''} with dark mode (local)`;
}

// ── UI ─────────────────────────────────────────────────────────────────────

function setBackendUI(online) {
  document.getElementById('statusDot').className   = `status-dot ${online ? 'online' : 'offline'}`;
  document.getElementById('statusLabel').className = `status-label ${online ? 'online' : 'offline'}`;
  document.getElementById('statusLabel').textContent = online ? 'API online' : 'API offline';
}

function setToggleUI(enabled) {
  document.getElementById('darkModeToggle').checked = enabled;
  const sub = document.getElementById('toggleSubtitle');
  sub.textContent = enabled ? 'On — page is dark' : 'Off';
  sub.className   = `toggle-subtitle${enabled ? ' enabled' : ''}`;
}

// ── Init ───────────────────────────────────────────────────────────────────

async function init() {
  const tab = await getCurrentTab();

  // Can't modify chrome:// or extension pages
  if (!tab?.url || /^(chrome|chrome-extension|about|edge):\/\//i.test(tab.url)) {
    document.getElementById('domainName').textContent     = 'System page';
    document.getElementById('toggleSubtitle').textContent = 'Cannot modify this page';
    document.getElementById('darkModeToggle').disabled    = true;
    document.getElementById('statsText').textContent      = 'System pages cannot be modified';
    setBackendUI(false);
    return;
  }

  const domain = extractDomain(tab.url);
  document.getElementById('domainName').textContent = domain || tab.url;

  // Load backend status + local preference in parallel
  const [backendOnline, localPref] = await Promise.all([
    checkBackend(),
    chrome.storage.local.get([domain]).then(r => r[domain] === true),
  ]);

  setBackendUI(backendOnline);
  setToggleUI(localPref);
  fetchStats().then(t => { document.getElementById('statsText').textContent = t; });

  // Toggle handler
  document.getElementById('darkModeToggle').addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    setToggleUI(enabled);

    // 1. Save locally (instant)
    await chrome.storage.local.set({ [domain]: enabled });

    // 2. Apply/remove on the active tab
    try {
      await chrome.tabs.sendMessage(tab.id, { action: enabled ? 'enableDark' : 'disableDark' });
    } catch {
      // Content script not injected yet — reload the tab so it picks up from storage
      chrome.tabs.reload(tab.id);
    }

    // 3. Sync to backend (non-blocking)
    saveToBackend(domain, enabled);

    // 4. Refresh stats
    fetchStats().then(t => { document.getElementById('statsText').textContent = t; });
  });
}

init();
