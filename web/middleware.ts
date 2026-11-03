// Vercel Routing Middleware: sends first-time visitors of the home page to their
// language's page based on the country of their IP address (/es/ or /ar/).
// A language picked in the menu is stored in the "lang" cookie and always wins.
// Links that already say which language to use (?lang=...) are left alone.

export const config = { matcher: '/' };

const SPANISH = new Set(['ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY',
  'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'GQ']);
const ARABIC = new Set(['SA', 'AE', 'EG', 'DZ', 'MA', 'IQ', 'SD', 'SY', 'YE', 'TN', 'JO', 'LY', 'LB', 'PS',
  'OM', 'KW', 'MR', 'QA', 'BH']);
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview/i;

export default function middleware(request: Request): Response | undefined {
  const url = new URL(request.url);
  if (url.searchParams.has('lang')) return;
  if (BOT.test(request.headers.get('user-agent') ?? '')) return;

  const saved = (request.headers.get('cookie') ?? '').match(/(?:^|; )lang=(en|es|ar)/)?.[1];
  const country = (request.headers.get('x-vercel-ip-country') ?? '').toUpperCase();
  const lang = saved ?? (SPANISH.has(country) ? 'es' : ARABIC.has(country) ? 'ar' : 'en');
  if (lang === 'en') return;

  url.pathname = `/${lang}/`;
  return Response.redirect(url.toString(), 307);
}
