# Puanlama, rapor ve yasal metinler (Taslak v0.1)

> Bu belge 1. adımın çıktısıdır. Soru seti `sorular.json` dosyasında. Her şey **taslaktır**; yayından önce bir çocuk gelişim uzmanının kontrol etmesi gerekir.

## 1. Kimler kullanabilir

| Çocuğun yaşı | Ne olur |
|---|---|
| 0-5 ay | Anket yok. Ebeveyne o yaşa uygun gelişim bilgisi gösterilir, "6. ayda tekrar gelin" hatırlatması kurulur. |
| 6-11 ay | Kısa anket (4-6 soru). Raporda "bu yaşta tarama sınırlıdır" notu her zaman yer alır. |
| 12-48 ay | Tam anket (14-21 soru, yaşa göre otomatik seçilir). |
| 48 ay üstü | Uygulama kapsamı dışında, doğrudan uzmana yönlendirilir. |

Doğum tarihi alınır, yaş ay olarak hesaplanır. 24 aydan küçük ve 37 haftadan önce doğmuş çocuklarda düzeltilmiş yaş kullanılır.

## 2. Puanlama

- Olumlu davranış sorusu (`reverse: false`): Evet = 0, Bazen = 1, Hayır = 2 puan.
- Tersine soru (`reverse: true`, örneğin tekrarlayan hareketler): Evet = 2, Bazen = 1, Hayır = 0 puan.
- **Oran** = toplam puan / (soru sayısı × 2)
- **Kritik endişe** = `critical: true` olan bir sorudan 2 puan alınması.

### Risk seviyesi

| Seviye | Koşul (ilki tutan geçerli) |
|---|---|
| **Yüksek** | Beceri kaybı sorusu (q23) "Evet" **veya** 2+ kritik endişe **veya** oran ≥ 0,40 |
| **Orta** | 1 kritik endişe **veya** oran ≥ 0,20 |
| **Düşük** | Diğer tüm durumlar |

Eşikler geçicidir; uzman görüşü ve gerçek kullanım verisiyle güncellenecek. Puanlama **uygulamanın kodunda** yapılır, yapay zekaya bırakılmaz. Yapay zeka sadece hesaplanmış sonucu anlaşılır bir dille anlatır. Böylece aynı cevaplar hep aynı sonucu verir.

## 3. Raporlar

### Kısa rapor (ücretsiz)
1. Risk seviyesi (renkli gösterge) ve tek cümlelik açıklama
2. En çok dikkat çeken 2-3 alan (örneğin "ortak dikkat", "konuşma")
3. Ne yapmalı: düşük ise "3-6 ay sonra tekrar edin", orta ise "çocuk doktorunuzla konuşun", yüksek ise "bir çocuk gelişim uzmanı ya da çocuk psikiyatristinden randevu alın"
4. Sabit uyarı metni (bkz. bölüm 5)

### Detaylı rapor (ücretli)
1. Kısa raporun tamamı
2. Her alan için ayrıntılı açıklama ve çocuğun cevapları
3. Evde yapılabilecek, yaşa uygun etkileşim önerileri (oyunlar, konuşma alıştırmaları)
4. **Doktora götürülecek özet sayfası**: cevaplar, tarih, yaş, risk seviyesi (PDF)
5. Takip planı: ne zaman tekrar tarama yapılmalı

Önemli kural: yüksek ve orta riskte "uzmana başvurun" yönlendirmesi **kısa raporda, ücretsiz** verilir. Bu yönlendirme hiçbir zaman ödeme duvarının arkasına konmaz (hem etik hem App Store/Google Play kuralları açısından).

## 4. Yapay zeka talimatı (sistem mesajı taslağı)

```
You write a parent-facing report for an early autism screening app.
You receive: child's age in months, risk level (low/medium/high) already
computed by the app, domain scores, the list of answers, report type
(short/detailed) and output language.

Rules:
- Never diagnose. Never say the child "has" or "does not have" autism.
  Use "signs worth discussing with a professional" style language.
- Do not change the risk level you were given.
- Warm, calm, non-alarming, plain language; no medical jargon.
- Short report: max 150 words. Detailed report: max 900 words.
- Always end with the recommended next step for the given risk level.
- If risk is high or a loss of skills was reported, clearly recommend
  booking an appointment with a developmental specialist soon.
- Do not give medication, diet or treatment advice.
- Write only in the requested language.
```

## 5. Sabit uyarı metni

**TR:** Bu uygulama bir tanı aracı değildir. Sonuçlar yalnızca ebeveynin verdiği cevaplara dayanır ve bir uzman değerlendirmesinin yerini tutmaz. Çocuğunuzun gelişimiyle ilgili endişeniz varsa, sonuç ne olursa olsun çocuk doktorunuza danışın.

**EN:** This app is not a diagnostic tool. Results are based only on the answers you provide and do not replace a professional evaluation. If you have any concerns about your child's development, talk to your pediatrician regardless of the result.

## 6. Gizlilik (özet ilkeler)

- Çocuğun adı istenmez; sadece takma ad ve doğum ayı/yılı.
- Kayıt sırasında ayrı onay kutusu: "Çocuğumun gelişim bilgilerinin rapor hazırlamak için işlenmesine açık rıza veriyorum." (KVKK, GDPR)
- Cevaplar yapay zekaya kimlik bilgisi olmadan gönderilir.
- Kullanıcı tüm verisini tek tuşla silebilir.
- Tam gizlilik politikası ve kullanım koşulları 4. adımda (mağaza başvurusu öncesi) yazılacak.

## 7. Açık konular

- **M-CHAT-R/F lisansı:** Ticari uygulamada kullanmak için yazarlardan (mchatscreen.com) izin gerekiyor. İzin alınırsa 16-30 ay için mevcut sorular yerine bu doğrulanmış ölçek kullanılmalı; bu sonuçların güvenilirliğini ciddi artırır. İzin başvurusunu kullanıcı yapmalı.
- **Uzman kontrolü:** Soru metinleri, eşikler ve rapor dili yayından önce bir uzmana gösterilmeli.
- **Ücretlendirme:** Kullanıcı kısa raporun da ücretli olmasını istemişti. Öneri: kısa rapor ücretsiz, detaylı rapor ücretli. Karar bekleniyor.
