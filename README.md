# Farket

0-48 ay arası çocuklar için yapay zeka destekli erken gelişim (otizm belirtisi) tarama uygulaması. Tanı aracı değildir; ebeveyni gerektiğinde uzmana yönlendirir.

- Uygulama: Expo (React Native) + TypeScript, iOS ve Android
- Soru seti: `src/data/sorular.json` (TR, EN)
- Puanlama: `src/scoring.ts` (deterministik, yapay zekaya bırakılmaz)
- İçerik ve rapor kuralları: `docs/icerik/puanlama-ve-rapor.md`

## Geliştirme

```bash
npm install
npm test          # puanlama testleri
npm run typecheck
npm start         # Expo geliştirme sunucusu
```

## Sunucu (Supabase)

- Veritabanı şeması: `supabase/migrations/` (her kullanıcı yalnızca kendi verisini görür)
- Yapay zeka raporu: `supabase/functions/report` (Claude API). Gerekli gizli anahtar: `ANTHROPIC_API_KEY`.
  `REQUIRE_PURCHASE=true` ayarlanınca ödemesi doğrulanmamış rapor üretilmez.
