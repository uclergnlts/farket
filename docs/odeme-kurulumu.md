# Ödeme kurulumu (App Store + Google Play)

Uygulamada iki ürün var. İkisi de **tüketilebilir (consumable)** tek seferlik satın alma:

| Ürün kimliği (iki mağazada da aynı) | Ne açar | Önerilen fiyat |
|---|---|---|
| `farket_short_report` | Bir taramanın kısa yapay zeka raporu | 2,99 $ |
| `farket_detailed_report` | Detaylı rapor (kısa raporu da açar) | 9,99 $ |

Ödemeleri RevenueCat üzerinden alıyoruz. Aylık 2.500 $ gelire kadar ücretsiz; makbuz doğrulamayı ve iadeleri bizim yerimize yapar.

## 1. Mağazalarda ürünleri oluşturun
- **App Store Connect** > Uygulamanız > Monetization > In-App Purchases > `+` > **Consumable**. Ürün kimliklerini yukarıdaki gibi yazın, fiyatı seçin.
- **Google Play Console** > Uygulamanız > Monetize > Products > **In-app products** > Create product. Aynı kimlikler.
- Google Play ürün ekranı, uygulamanın en az bir kez (iç test kanalına) yüklenmiş olmasını ister; bu sırayı birlikte yaparız.

## 2. RevenueCat
1. revenuecat.com'da ücretsiz hesap açın, "Farket" adında bir proje oluşturun.
2. Projeye bir **App Store** ve bir **Play Store** uygulaması ekleyin (sihirbaz mağaza bağlantısı için gereken anahtarları adım adım ister).
3. Products bölümüne iki ürün kimliğini ekleyin.
4. **API keys** sayfasındaki iki **public** anahtarı (iOS `appl_...`, Android `goog_...`) bana yazın. Bunlar herkese açık anahtarlardır, paylaşmak güvenlidir.

## 3. Webhook (ödemenin sunucuya bildirilmesi)
1. Uzun, rastgele bir şifre üretin (örneğin bir şifre yöneticisiyle 40 karakter).
2. Supabase > Edge Functions > Secrets: adı `REVENUECAT_WEBHOOK_SECRET`, değeri bu şifre.
3. RevenueCat > Integrations > Webhooks > Add:
   - URL: `https://ljvgqhszuepcestwmmet.supabase.co/functions/v1/revenuecat-webhook`
   - Authorization header: `Bearer ŞİFRENİZ`
4. "Send test event" ile deneyin.

## 4. Ödemeyi zorunlu yapma
Her şey test edildikten sonra Supabase > Edge Functions > Secrets'a `REQUIRE_PURCHASE` = `true` eklenir. O andan itibaren ödemesiz rapor üretilmez.

## Not
Satın almalar Expo Go ile denenemez; telefona kurulan bir geliştirme sürümü (EAS Build) gerekir. Bunun için ücretsiz bir Expo hesabı lazım olacak.
