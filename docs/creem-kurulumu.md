# Creem ile ödeme alma (Lemon Squeezy'ye ek)

Site önce Creem'i dener. Creem anahtarları Supabase'e girilmediyse otomatik olarak Lemon Squeezy bağlantısına geçer. Yani Creem'i kurmak Lemon Squeezy'yi bozmaz.

## 1. Hesap
1. https://www.creem.io adresinde hesap açın. Ülke: Türkiye. Ödemeler için kendi adınıza bir TL banka hesabı (IBAN) ekleyin.
2. Mağaza bilgilerinde site adresi olarak `https://farket.uclergnlts.com` yazın.
3. Ürün açıklaması önerisi (incelemede önemli):
   > Farket is an informational developmental screening tool for parents of children aged 0-4. Parents answer questions based on public developmental milestones and get a free result. The optional one-time $4.99 product is an AI-written, personalized PDF/email report explaining the answers and suggesting home activities. It is not a medical diagnosis or medical advice; every result tells parents to talk to their pediatrician.
4. Sitede Gizlilik, Şartlar ve İade sayfaları zaten var; isterlerse bağlantılarını verin (`#privacy`, `#terms`, `#refund`).

## 2. Ürün
Creem panelinde **Products > Create product**:
- Ad: `Farket Detailed Development Report`
- Ödeme tipi: **One-time** (tek seferlik), fiyat **4.99 USD**
- Vergi kategorisi: dijital ürün / e-kitap (Digital goods)
- Kaydedin ve ürün kimliğini (`prod_...` ile başlar) kopyalayın.

Önce **Test mode** açıkken oluşturun; canlıya geçince aynı ürünü canlı modda da oluşturup yeni kimliği kullanın.

## 3. Anahtarlar
- **Developers > API Keys**: API anahtarını kopyalayın.
- **Developers > Webhooks > Add webhook**: URL olarak
  `https://ljvgqhszuepcestwmmet.supabase.co/functions/v1/creem-webhook`
  yazın. Oluşan **webhook secret** değerini kopyalayın.

## 4. Supabase'e girin
Supabase > Farket projesi > Edge Functions > **Secrets** bölümüne dört değer ekleyin:

| Ad | Değer |
|---|---|
| `CREEM_API_KEY` | 3. adımdaki API anahtarı |
| `CREEM_PRODUCT_ID` | 2. adımdaki `prod_...` |
| `CREEM_WEBHOOK_SECRET` | 3. adımdaki webhook secret |
| `CREEM_TEST_MODE` | test sırasında `true`, canlıda silin ya da `false` yapın |

Bu anahtarları sohbete yazmayın; doğrudan Supabase'e girin.

## 5. Deneme
Sitede bir tarama yapıp "Detaylı rapor" düğmesine basın. Creem ödeme sayfası açılmalı. Test kartı: `4242 4242 4242 4242`, ileri bir tarih, herhangi bir CVC. Ödemeden sonra site "ödemeniz alındı" sayfasına döner ve detaylı rapor birkaç dakika içinde e-postaya gelir.

## Canlıya geçiş
Creem hesabınızı onayladıktan sonra: canlı modda ürünü ve webhook'u tekrar oluşturun, Supabase'deki `CREEM_API_KEY`, `CREEM_PRODUCT_ID`, `CREEM_WEBHOOK_SECRET` değerlerini canlı olanlarla değiştirin ve `CREEM_TEST_MODE` değerini silin.
