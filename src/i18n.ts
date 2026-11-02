import type { Lang, Risk } from './scoring';

interface Strings {
  title: string; intro: string; disclaimer: string; consent: string; agree: string;
  ageQ: string; ageInvalid: string; ageTooYoung: string; ageTooOld: string; start: string;
  back: string; focus: string; again: string; limitedAge: string;
  getReport: string; reportLoading: string; reportFailed: string; reportBusy: string; saveFailed: string;
  risk: Record<Risk, string>; next: Record<Risk, string>;
}

export const t: Record<Lang, Strings> = {
  tr: {
    title: 'Erken Gelişim Taraması',
    intro: 'Çocuğunuzun sosyal iletişim gelişimiyle ilgili birkaç kısa soru soracağız. Yaklaşık 5 dakika sürer.',
    disclaimer: 'Bu uygulama bir tanı aracı değildir. Sonuçlar yalnızca verdiğiniz cevaplara dayanır ve bir uzman değerlendirmesinin yerini tutmaz. Çocuğunuzun gelişimiyle ilgili endişeniz varsa, sonuç ne olursa olsun çocuk doktorunuza danışın.',
    consent: 'Devam ederek, çocuğumun gelişim bilgilerinin rapor hazırlamak amacıyla işlenmesine açık rıza veriyorum.',
    agree: 'Kabul ediyorum, devam et',
    ageQ: 'Çocuğunuz kaç aylık?',
    ageInvalid: 'Lütfen ay olarak bir sayı girin.',
    ageTooYoung: '6 aydan küçük bebekler için tarama yapılmaz. 6. ayda tekrar gelmenizi öneririz.',
    ageTooOld: 'Bu uygulama 48 aya kadar olan çocuklar içindir. Endişeniz varsa bir uzmana başvurun.',
    start: 'Başla',
    back: 'Önceki soru',
    focus: 'Dikkat çeken alanlar',
    again: 'Yeni tarama',
    getReport: 'Kişisel raporumu oluştur',
    reportLoading: 'Rapor hazırlanıyor…',
    reportFailed: 'Rapor şu an hazırlanamadı. Lütfen biraz sonra tekrar deneyin.',
    reportBusy: 'Şu an yoğunluk var, lütfen bir dakika sonra tekrar deneyin.',
    saveFailed: 'Sonuç kaydedilemedi. İnternet bağlantınızı kontrol edin.',
    limitedAge: '12 aydan küçük bebeklerde tarama sonuçları sınırlıdır. Birkaç ay sonra tekrar etmeniz önerilir.',
    risk: { low: 'Düşük olasılık', medium: 'Orta olasılık', high: 'Yüksek olasılık' },
    next: {
      low: 'Cevaplarınız şu an belirgin bir endişe göstermiyor. Gelişimini izlemek için 3-6 ay sonra taramayı tekrarlayın.',
      medium: 'Bazı alanlar yakından izlenmeye değer. Bu sonuçları bir sonraki kontrolde çocuk doktorunuzla paylaşın.',
      high: 'Cevaplarınızda bir uzmanla konuşmaya değer işaretler var. Bir çocuk gelişim uzmanı ya da çocuk psikiyatristinden yakın zamanda randevu almanızı öneririz. Erken destek çok fark yaratır.',
    },
  },
  en: {
    title: 'Early Development Screening',
    intro: "We'll ask a few short questions about your child's social communication development. It takes about 5 minutes.",
    disclaimer: "This app is not a diagnostic tool. Results are based only on the answers you provide and do not replace a professional evaluation. If you have any concerns about your child's development, talk to your pediatrician regardless of the result.",
    consent: "By continuing, I give explicit consent for my child's developmental information to be processed to prepare a report.",
    agree: 'I agree, continue',
    ageQ: 'How old is your child in months?',
    ageInvalid: 'Please enter a number of months.',
    ageTooYoung: "Screening isn't done for babies under 6 months. Please come back at 6 months.",
    ageTooOld: 'This app is for children up to 48 months. If you have concerns, please see a specialist.',
    start: 'Start',
    back: 'Previous question',
    focus: 'Areas to watch',
    again: 'New screening',
    getReport: 'Create my personal report',
    reportLoading: 'Preparing your report…',
    reportFailed: "The report couldn't be prepared right now. Please try again shortly.",
    reportBusy: "We're busy right now, please try again in a minute.",
    saveFailed: "The result couldn't be saved. Please check your internet connection.",
    limitedAge: 'Screening results are limited for babies under 12 months. Repeating it in a few months is recommended.',
    risk: { low: 'Low likelihood', medium: 'Medium likelihood', high: 'High likelihood' },
    next: {
      low: "Your answers don't show a clear concern right now. Repeat the screening in 3-6 months to keep track.",
      medium: 'Some areas are worth watching closely. Share these results with your pediatrician at the next visit.',
      high: 'Your answers show signs worth discussing with a specialist. We recommend booking an appointment with a developmental specialist or child psychiatrist soon. Early support makes a big difference.',
    },
  },
};
