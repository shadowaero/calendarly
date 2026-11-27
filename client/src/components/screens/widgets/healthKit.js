// healthKit.js — ws7bf: tiny widget-health registry + timeout fetch helper shared by
// the data widgets and the display-endpoint watchdog.
//
// Widgets call reportHealth(key, ok) on every poll. DisplayEndpointViewer runs
// watchdogTick() once a minute and reloads the endpoint when a key stays failed —
// the "reboot the Pi and it's fine again" heal, made automatic, with an escalation
// budget so a real long outage can never turn into a reload loop.

const G = typeof window !== 'undefined' ? window : globalThis;
if (!G.__fdHealth) G.__fdHealth = { status: {}, budget: { count: 0, lastAt: 0 } };

const FETCH_TIMEOUT_MS = 8000;

// fetch().json() with a hard timeout — a hung request can never pin a widget into
// a permanent "Loading …" state (browser fetch has no timeout of its own).
export function fetchJSON(url, timeoutMs = FETCH_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  return fetch(url, { signal: ctrl.signal, cache: 'no-store' })
    .then((r) => {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    })
    .finally(() => clearTimeout(timer));
}

export function reportHealth(key, ok) {
  const s = G.__fdHealth.status;
  const prev = s[key] || {};
  s[key] = ok
    ? { ok: true, at: Date.now(), fails: 0, firstFailAt: null }
    : { ok: false, at: Date.now(), fails: (prev.fails || 0) + 1, firstFailAt: prev.firstFailAt || Date.now() };
}

// Keys whose current fail streak started >= minAgeMs ago and has >= minFails polls.
export function unhealthyKeys(minAgeMs = 4 * 60 * 1000, minFails = 3) {
  const s = G.__fdHealth.status;
  const now = Date.now();
  return Object.keys(s).filter((k) => {
    const e = s[k];
    return !!(e && e.ok === false && (e.fails || 0) >= minFails && e.firstFailAt && now - e.firstFailAt >= minAgeMs);
  });
}

// Reload budget: reload #n waits GAPS_MIN[n] minutes after the previous watchdog
// reload — escalation 10 -> 20 -> 40 min, settling at max 1/hour. The budget resets
// once every reporter is healthy again. A 3-minute hard floor guards crash loops.
const GAPS_MIN = [0, 10, 20, 40, 60, 60];
const HARD_FLOOR_MS = 3 * 60 * 1000;

export function watchdogTick() {
  const budget = G.__fdHealth.budget;
  const bad = unhealthyKeys();
  const now = Date.now();
  if (!bad.length) {
    budget.count = 0; // healed — full budget again
    return false;
  }
  if (budget.lastAt && now - budget.lastAt < HARD_FLOOR_MS) return false;
  const gapMin = GAPS_MIN[Math.min(budget.count, GAPS_MIN.length - 1)];
  if (budget.lastAt && now - budget.lastAt < gapMin * 60 * 1000) return false;
  budget.count += 1;
  budget.lastAt = now;
  return true;
}
