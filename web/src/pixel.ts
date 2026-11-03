// Meta (Facebook) Pixel, used only to measure ad campaigns.
// It loads only after the visitor accepts cookies, and it only ever receives these four
// moments: page view, check started, report requested (Lead) and checkout clicked.
// Answers, results, age, sex and email are never sent to Meta.

/** "Farket Pixel" in Meta Events Manager (Ucler business portfolio). Empty = off: nothing loads, no banner. */
export const PIXEL_ID: string = '956917537156142';

const CONSENT_KEY = 'cookie_consent'; // 'yes' | 'no'

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue: unknown[][]; loaded?: boolean; version?: string; push?: unknown };
declare global { interface Window { fbq?: Fbq; _fbq?: Fbq } }

export function consent(): 'yes' | 'no' | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'yes' || v === 'no' ? v : null;
  } catch { return null; }
}

/** Whether to ask the visitor about cookies. */
export function needsConsent(): boolean {
  return PIXEL_ID !== '' && consent() === null;
}

export function setConsent(v: 'yes' | 'no') {
  try { localStorage.setItem(CONSENT_KEY, v); } catch { /* private mode: ask again next visit */ }
  if (v === 'yes') loadPixel();
}

let loaded = false;

/** Loads Meta's script and records the page view. Safe to call more than once. */
export function loadPixel() {
  if (loaded || !PIXEL_ID || consent() !== 'yes') return;
  loaded = true;
  const q: unknown[][] = [];
  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args); else q.push(args);
  }) as Fbq;
  fbq.queue = q; fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0';
  window.fbq = fbq; window._fbq = fbq;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  // No automatic button and form scanning: answer buttons carry health-related text.
  fbq('set', 'autoConfig', false, PIXEL_ID);
  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
}

export type PixelEvent = 'StartCheck' | 'Lead' | 'InitiateCheckout';

/** Records one funnel moment. Sends no details about the child or the answers. */
export function track(event: PixelEvent) {
  if (!loaded || !window.fbq) return;
  if (event === 'StartCheck') window.fbq('trackCustom', 'StartCheck');
  else if (event === 'InitiateCheckout') window.fbq('track', 'InitiateCheckout', { value: 9.99, currency: 'USD' });
  else window.fbq('track', event);
}
