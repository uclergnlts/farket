import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { SEO_LANGS, SITE, langPath, seoBody, seoHead, type SeoLang } from './src/seo.ts'

/** Fills the SEO markers in index.html, and writes /es/ and /ar/ pages, a sitemap and robots.txt. */
function seoPages(): Plugin {
  let template = ''
  let outDir = 'dist'
  const fill = (html: string, l: SeoLang) => html
    .replace('<html lang="en" dir="ltr">', `<html lang="${l}" dir="${l === 'ar' ? 'rtl' : 'ltr'}">`)
    .replace('<!--seo-head-->', seoHead(l))
    .replace('<!--seo-body-->', seoBody(l))
  return {
    name: 'seo-pages',
    configResolved(c) { outDir = resolve(c.root, c.build.outDir) },
    transformIndexHtml: {
      order: 'post',
      handler(html) { template = html; return fill(html, 'en') },
    },
    closeBundle() {
      if (!template) return
      for (const l of SEO_LANGS.filter((x) => x !== 'en')) {
        mkdirSync(resolve(outDir, l), { recursive: true })
        writeFileSync(resolve(outDir, l, 'index.html'), fill(template, l))
      }
      const today = new Date().toISOString().slice(0, 10)
      const links = SEO_LANGS.map((x) => `    <xhtml:link rel="alternate" hreflang="${x}" href="${SITE}${langPath(x)}"/>`).join('\n')
      const urls = SEO_LANGS.map((l) => `  <url>\n    <loc>${SITE}${langPath(l)}</loc>\n    <lastmod>${today}</lastmod>\n${links}\n  </url>`).join('\n')
      writeFileSync(resolve(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`)
      writeFileSync(resolve(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)
    },
  }
}

// BASE_PATH is "/farket/" on GitHub Pages and "/" on a custom domain.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), seoPages()],
})
