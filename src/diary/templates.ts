// One-tap notes, picked by the child's (corrected) age. Wording follows the CDC
// "Learn the Signs. Act Early." milestone areas; these are prompts, not test items.
import type { Category, DLang, Kind } from './model';

export interface Template {
  id: string;
  category: Category;
  kind: Kind;
  regression?: boolean;
  minMonths: number;
  maxMonths: number;
  text: Record<DLang, string>;
}

export const TEMPLATES: Template[] = [
  {
    id: 't-smile', category: 'social', kind: 'positive', minMonths: 2, maxMonths: 60,
    text: {
      en: 'Smiled back at me', es: 'Me devolvió la sonrisa', pt: 'Sorriu de volta para mim',
      fr: "M'a rendu mon sourire", tr: 'Gülümsememe karşılık verdi', ar: 'ابتسم لي عندما ابتسمت له',
    },
  },
  {
    id: 't-eyes', category: 'social', kind: 'concern', minMonths: 2, maxMonths: 60,
    text: {
      en: 'Avoided looking at my face', es: 'Evitó mirarme a la cara', pt: 'Evitou olhar para o meu rosto',
      fr: 'A évité de regarder mon visage', tr: 'Yüzüme bakmaktan kaçındı', ar: 'تجنّب النظر إلى وجهي',
    },
  },
  {
    id: 't-babble', category: 'speech', kind: 'positive', minMonths: 4, maxMonths: 18,
    text: {
      en: 'Babbled back when I talked', es: 'Balbuceó cuando le hablé', pt: 'Balbuciou quando eu falei com ele',
      fr: 'A babillé quand je lui ai parlé', tr: 'Konuştuğumda agulayarak karşılık verdi', ar: 'ناغى عندما تحدثت إليه',
    },
  },
  {
    id: 't-name-yes', category: 'name', kind: 'positive', minMonths: 6, maxMonths: 60,
    text: {
      en: 'Turned when I called their name', es: 'Se giró cuando dije su nombre', pt: 'Virou quando chamei o nome dele',
      fr: "S'est retourné quand j'ai dit son prénom", tr: 'Adını söyleyince döndü', ar: 'التفت عندما ناديته باسمه',
    },
  },
  {
    id: 't-name-no', category: 'name', kind: 'concern', minMonths: 6, maxMonths: 60,
    text: {
      en: "Didn't turn when I called their name", es: 'No se giró cuando dije su nombre', pt: 'Não virou quando chamei o nome dele',
      fr: "Ne s'est pas retourné quand j'ai dit son prénom", tr: 'Adını söylediğimde dönmedi', ar: 'لم يلتفت عندما ناديته باسمه',
    },
  },
  {
    id: 't-sound', category: 'sensory', kind: 'concern', minMonths: 6, maxMonths: 60,
    text: {
      en: 'Was very upset by an everyday sound', es: 'Se alteró mucho con un ruido cotidiano', pt: 'Ficou muito incomodado com um barulho comum',
      fr: "A été très perturbé par un bruit du quotidien", tr: 'Gündelik bir sese çok tepki verdi', ar: 'انزعج كثيراً من صوت عادي',
    },
  },
  {
    id: 't-wave', category: 'social', kind: 'positive', minMonths: 9, maxMonths: 60,
    text: {
      en: 'Waved bye-bye', es: 'Dijo adiós con la mano', pt: 'Deu tchau com a mão',
      fr: 'A fait au revoir de la main', tr: 'El sallayarak bay bay yaptı', ar: 'لوّح بيده مودّعاً',
    },
  },
  {
    id: 't-copy', category: 'play', kind: 'positive', minMonths: 9, maxMonths: 60,
    text: {
      en: 'Copied what I did (clapping, waving)', es: 'Imitó lo que hice (aplaudir, saludar)', pt: 'Imitou o que eu fiz (bater palmas, acenar)',
      fr: "A imité ce que j'ai fait (applaudir, saluer)", tr: 'Yaptığımı taklit etti (alkış, el sallama)', ar: 'قلّد ما فعلته (التصفيق، التلويح)',
    },
  },
  {
    id: 't-word', category: 'speech', kind: 'positive', minMonths: 9, maxMonths: 60,
    text: {
      en: 'Said a new word', es: 'Dijo una palabra nueva', pt: 'Falou uma palavra nova',
      fr: 'A dit un nouveau mot', tr: 'Yeni bir kelime söyledi', ar: 'قال كلمة جديدة',
    },
  },
  {
    id: 't-show', category: 'joint', kind: 'positive', minMonths: 9, maxMonths: 60,
    text: {
      en: 'Brought a toy just to show me', es: 'Me trajo un juguete solo para enseñármelo', pt: 'Trouxe um brinquedo só para me mostrar',
      fr: 'M\'a apporté un jouet juste pour me le montrer', tr: 'Sırf göstermek için bana oyuncak getirdi', ar: 'أحضر لي لعبة فقط ليريني إياها',
    },
  },
  {
    id: 't-point', category: 'joint', kind: 'positive', minMonths: 12, maxMonths: 60,
    text: {
      en: 'Pointed to show me something', es: 'Señaló para enseñarme algo', pt: 'Apontou para me mostrar algo',
      fr: 'A pointé du doigt pour me montrer quelque chose', tr: 'Bir şeyi göstermek için parmağıyla işaret etti', ar: 'أشار بإصبعه ليريني شيئاً',
    },
  },
  {
    id: 't-no-follow', category: 'joint', kind: 'concern', minMonths: 12, maxMonths: 60,
    text: {
      en: "Didn't look where I pointed", es: 'No miró hacia donde señalé', pt: 'Não olhou para onde eu apontei',
      fr: "N'a pas regardé là où je montrais", tr: 'İşaret ettiğim yere bakmadı', ar: 'لم ينظر إلى حيث أشرت',
    },
  },
  {
    id: 't-spin', category: 'repetitive', kind: 'concern', minMonths: 12, maxMonths: 60,
    text: {
      en: 'Spun around in circles', es: 'Dio vueltas sobre sí mismo', pt: 'Ficou girando em círculos',
      fr: 'A tourné sur lui-même', tr: 'Kendi etrafında döndü', ar: 'دار حول نفسه',
    },
  },
  {
    id: 't-flap', category: 'repetitive', kind: 'concern', minMonths: 12, maxMonths: 60,
    text: {
      en: 'Flapped hands over and over', es: 'Aleteó las manos una y otra vez', pt: 'Balançou as mãos sem parar',
      fr: 'A agité les mains encore et encore', tr: 'Ellerini tekrar tekrar çırptı', ar: 'رفرف بيديه مراراً',
    },
  },
  {
    id: 't-line', category: 'play', kind: 'concern', minMonths: 12, maxMonths: 60,
    text: {
      en: 'Lined toys up in a row instead of playing', es: 'Puso los juguetes en fila en lugar de jugar', pt: 'Enfileirou os brinquedos em vez de brincar',
      fr: 'A aligné ses jouets au lieu de jouer', tr: 'Oynamak yerine oyuncakları sıraya dizdi', ar: 'صفّ الألعاب في خط بدلاً من اللعب بها',
    },
  },
  {
    id: 't-word-lost', category: 'speech', kind: 'concern', regression: true, minMonths: 12, maxMonths: 60,
    text: {
      en: 'Stopped saying a word they used to say', es: 'Dejó de decir una palabra que antes decía', pt: 'Parou de falar uma palavra que falava antes',
      fr: "Ne dit plus un mot qu'il disait avant", tr: 'Eskiden söylediği bir kelimeyi artık söylemiyor', ar: 'توقف عن قول كلمة كان يقولها',
    },
  },
  {
    id: 't-pretend', category: 'play', kind: 'positive', minMonths: 18, maxMonths: 60,
    text: {
      en: 'Pretended to feed a doll or toy', es: 'Hizo como que daba de comer a un muñeco', pt: 'Fingiu dar comida a uma boneca ou brinquedo',
      fr: 'A fait semblant de nourrir une poupée', tr: 'Bebeğini ya da oyuncağını besler gibi yaptı', ar: 'تظاهر بإطعام دمية أو لعبة',
    },
  },
  {
    id: 't-two-words', category: 'speech', kind: 'positive', minMonths: 18, maxMonths: 60,
    text: {
      en: 'Put two words together', es: 'Juntó dos palabras', pt: 'Juntou duas palavras',
      fr: 'A associé deux mots', tr: 'İki kelimeyi birleştirdi', ar: 'ركّب كلمتين معاً',
    },
  },
  {
    id: 't-routine', category: 'routine', kind: 'concern', minMonths: 18, maxMonths: 60,
    text: {
      en: 'Got very upset when the routine changed', es: 'Se alteró mucho cuando cambió la rutina', pt: 'Ficou muito agitado quando a rotina mudou',
      fr: 'A été très bouleversé quand la routine a changé', tr: 'Rutini değişince çok huzursuz oldu', ar: 'انزعج كثيراً عندما تغيّر الروتين',
    },
  },
  {
    id: 't-alone', category: 'social', kind: 'concern', minMonths: 24, maxMonths: 60,
    text: {
      en: 'Showed no interest in other children', es: 'No mostró interés por otros niños', pt: 'Não demonstrou interesse por outras crianças',
      fr: "N'a montré aucun intérêt pour les autres enfants", tr: 'Diğer çocuklara ilgi göstermedi', ar: 'لم يُبدِ اهتماماً بالأطفال الآخرين',
    },
  },
];

export const templatesForAge = (months: number) =>
  TEMPLATES.filter((t) => months >= t.minMonths && months <= t.maxMonths);
