import type { Lang } from './scoring.ts';

/** Info pages reached by URL hash, e.g. https://farket.uclergnlts.com/#privacy */
export type PageId = 'privacy' | 'terms' | 'refund' | 'sample';
export const PAGE_IDS: PageId[] = ['sample', 'privacy', 'terms', 'refund'];

/** Where parents write for questions, data deletion and refunds. */
export const CONTACT_EMAIL = 'uclergnlts_0101@hotmail.com';
/** Legal name of the person operating Farket (must match the payment provider onboarding). */
export const OPERATOR = 'Ucler Gonultas';
const UPDATED = '2026-11-05';
const PRICE = '$9.99';

export function pageFromHash(): PageId | null {
  const h = location.hash.replace(/^#\/?/, '');
  return (PAGE_IDS as string[]).includes(h) ? (h as PageId) : null;
}

interface Section { h?: string; p: string[] }
interface Doc { title: string; intro?: string; sections: Section[] }

const C = CONTACT_EMAIL;
const O = OPERATOR;

export const PAGE_LABELS: Record<Lang, Record<PageId, string> & { updated: string; sampleBadge: string; back: string }> = {
  en: { privacy: 'Privacy Policy', terms: 'Terms of Use', refund: 'Refund Policy', sample: 'Sample report',
    updated: 'Last updated', sampleBadge: 'SAMPLE · fictional answers', back: 'Back to the check' },
  es: { privacy: 'Política de privacidad', terms: 'Términos de uso', refund: 'Política de reembolso', sample: 'Informe de ejemplo',
    updated: 'Última actualización', sampleBadge: 'EJEMPLO · respuestas ficticias', back: 'Volver a la revisión' },
  ar: { privacy: 'سياسة الخصوصية', terms: 'شروط الاستخدام', refund: 'سياسة الاسترداد', sample: 'نموذج تقرير',
    updated: 'آخر تحديث', sampleBadge: 'نموذج · إجابات افتراضية', back: 'العودة إلى الفحص' },
};

const DOCS: Record<Lang, Record<PageId, Doc>> = {
  en: {
    privacy: {
      title: 'Privacy Policy',
      intro: 'Farket (farket.uclergnlts.com) is an online early development screening service for children aged 6 to 48 months. This policy explains what we collect, why, and the choices you have.',
      sections: [
        { h: 'Who runs Farket', p: [`Farket is operated by ${O}, an individual seller based in Turkey. Contact: ${C}.`] },
        { h: 'What we collect', p: [
          'Your child’s age range and sex (or “prefer not to say”), and your answers to the screening questions.',
          'Your email address, so we can send you your report, and whether you agreed to receive occasional tips.',
          'If you buy the detailed report: order details from our payment provider (order number, email, amount). We never see or store your card details.',
          'We do not ask for your child’s name, date of birth, photos or any medical records. Please do not include them anywhere.',
        ] },
        { h: 'Why we use it', p: [
          'To calculate your screening result, write your personal report and email it to you.',
          'To deliver the detailed report you paid for, and to handle refunds and support requests.',
          'To send occasional tips about child development, only if you ticked that box. You can unsubscribe at any time.',
          'We do not sell your data. Your answers, results, your child’s details and your email are never shared with advertisers.',
        ] },
        { h: 'Cookies and ads', p: [
          'If you click “Accept” on the cookie notice, we use the Meta (Facebook) Pixel to measure our ads. It only records that a page was visited, that a check was started, that a report was requested and that the checkout button was clicked. If you decline, it is not loaded. You can change your mind by clearing this site’s data in your browser.',
        ] },
        { h: 'Legal basis', p: [
          'Information about your child’s development is sensitive. We process it only with your explicit consent, which you give by completing the check and submitting your email. We process order details to perform our contract with you.',
        ] },
        { h: 'Who helps us', p: [
          'Supabase (database and servers, hosted in the EU, Frankfurt).',
          'OpenAI (writes the report text from your answers; answers are sent without your email address. OpenAI does not use API data to train its models).',
          'Resend (sends the report emails).',
          'Creem and Lemon Squeezy (handle payments as our merchant of record).',
          'Vercel (hosts the website).',
          'Meta Platforms (ad measurement, only if you accept cookies).',
          'These providers process data only on our instructions. Some are located outside your country, including the United States; they use standard contractual safeguards.',
        ] },
        { h: 'How long we keep it', p: [
          'We keep your screening and report so we can resend it or deliver a report you buy later. You can ask us to delete it at any time and we will do so within 30 days. Order records may be kept longer where tax law requires it.',
        ] },
        { h: 'Your rights', p: [
          `You can ask to see, correct, export or delete your data, or withdraw your consent, by writing to ${C}. You can also complain to your local data protection authority.`,
        ] },
        { h: 'Children', p: [
          'The service is used by parents and legal guardians aged 18 or over. Children do not use it themselves.',
        ] },
        { h: 'Changes and contact', p: [
          `If we change this policy we will update the date on this page. Questions: ${C}.`,
        ] },
      ],
    },
    terms: {
      title: 'Terms of Use',
      intro: 'By using Farket you agree to these terms. Please read them, especially the part about what the service is not.',
      sections: [
        { h: 'Who runs Farket', p: [`Farket is operated by ${O}, an individual seller based in Turkey. Contact: ${C}.`] },
        { h: 'Screening, not diagnosis', p: [
          'Farket is a screening tool. It is not a medical device and does not diagnose autism or any other condition. Results and reports are based only on the answers you give and are written with the help of artificial intelligence. They do not replace an evaluation by a doctor or a qualified specialist.',
          'If you are worried about your child’s development, talk to your pediatrician whatever the result. In an emergency, contact your local emergency services.',
        ] },
        { h: 'Who can use it', p: [
          'You must be at least 18 and the parent or legal guardian of the child, or have their permission. Please answer honestly; the result can only be as accurate as your answers.',
        ] },
        { h: 'Free and paid parts', p: [
          'The screening, your result and your personal report are free. The result and the advice to see a specialist are never behind a payment.',
          `The detailed development report is an optional one-time purchase (${PRICE}, prices shown at checkout include applicable taxes). It is a digital product delivered by email, normally within a few minutes. There is no subscription and no recurring charge. Because each report is personalized, sales are final; see our Refund Policy.`,
          'Payments are processed by Creem or Lemon Squeezy, our reseller and merchant of record, which also handles taxes and invoices. Their buyer terms apply to the payment.',
        ] },
        { h: 'Acceptable use', p: [
          'Do not misuse the service: no automated access, no attempts to break or overload it, and no entering other people’s data without their permission.',
        ] },
        { h: 'Intellectual property', p: [
          'The website, questions and design belong to Farket. You may keep, print and share your own reports, for example with your doctor.',
        ] },
        { h: 'Liability', p: [
          'We work hard to keep the service accurate and available, but we provide it “as is”. To the extent the law allows, we are not liable for decisions made based on a result or report, or for indirect losses. Our total liability for a paid report is limited to the amount you paid for it. Nothing in these terms limits rights you have under consumer law.',
        ] },
        { h: 'Changes, law and contact', p: [
          'We may update these terms; the date on this page shows the latest version. These terms are governed by the laws of the Republic of Türkiye, without affecting the mandatory consumer protections of the country where you live.',
          `Contact: ${C}.`,
        ] },
      ],
    },
    refund: {
      title: 'Refund Policy',
      intro: `The detailed development report costs ${PRICE} as a one-time payment.`,
      sections: [
        { h: 'All sales are final', p: [
          'Each detailed report is written specifically for your child’s answers and is delivered right after payment, so it cannot be returned. For this reason we do not offer refunds once the report has been delivered, including for a change of mind.',
          'By completing the purchase you agree that the report is delivered immediately and that you lose the right to withdraw from the purchase once delivery has started, where the law allows this.',
        ] },
        { h: 'When we do refund', p: [
          'You were charged but never received the report, and we are unable to send it to you.',
          'You were charged more than once for the same report.',
          'Nothing in this policy limits rights you have under the consumer law of your country.',
        ] },
        { h: 'Report not delivered', p: [
          'If your report has not arrived within 24 hours (please check your spam folder first), write to us. We will send it again, and if we cannot deliver it we will refund you in full.',
        ] },
        { h: 'How to ask', p: [
          `Email ${C} with the email address you used and your order number. You can also reply to your payment receipt email.`,
          'Refunds go back to your original payment method through our payment provider. Depending on your bank, they usually appear within 5 to 10 business days.',
        ] },
        { h: 'No subscriptions', p: [
          'Farket has no subscriptions, so there is nothing to cancel and you will never be charged again.',
        ] },
      ],
    },
    sample: {
      title: 'Sample detailed development report',
      intro: 'This is an example of the paid detailed report. The child and answers are fictional. Your own report is written for your child’s answers and age.',
      sections: [
        { p: ['Child: 18–23 months · Girl · Result: Medium likelihood'] },
        { h: 'What your results mean', p: [
          'Thank you for taking the time to answer these questions. Your answers show that your daughter is doing well in several areas, such as playing with toys and enjoying being close to you. A few answers point to areas that are worth watching more closely. This is not a diagnosis. It means these are good topics to discuss with your pediatrician.',
        ] },
        { h: 'Areas worth watching', p: [
          'Shared attention: you answered “sometimes” when asked whether she points to show you something interesting. At this age, children usually point to share things with you, not only to ask for them.',
          'Responding to her name: you said she “sometimes” looks up when you call her name. Many children this age turn to their name most of the time.',
          'Words: you answered “no” to using at least a few words with meaning. This is worth mentioning to your doctor, especially together with the points above.',
        ] },
        { h: 'Activities to try at home', p: [
          'Point and name: point at things you both see (“Look, a dog!”), wait a moment, and smile when she looks. Repeat during walks and with picture books.',
          'Name games: call her name softly when you are close and give her something fun when she turns to you, like a tickle or a song.',
          'Talk about what she does: describe her play in short words (“ball… roll!”), and leave pauses for her to answer with sounds or gestures.',
        ] },
        { h: 'When to screen again', p: [
          'Repeat this check in about 3 months, or sooner if you notice new concerns.',
        ] },
        { h: 'What to tell your doctor', p: [
          'Age range: 18–23 months. Result: medium likelihood. Areas: pointing to share interest, response to name, first words. No loss of skills was reported.',
        ] },
        { h: 'Next step', p: [
          'Share these results with your pediatrician at your next visit. Early support makes a real difference, and talking about it early is always a good idea.',
        ] },
      ],
    },
  },
  es: {
    privacy: {
      title: 'Política de privacidad',
      intro: 'Farket (farket.uclergnlts.com) es un servicio en línea de detección del desarrollo temprano para niños de 6 a 48 meses. Esta política explica qué datos recogemos, para qué y qué opciones tiene.',
      sections: [
        { h: 'Quién gestiona Farket', p: [`Farket está gestionado por ${O}, vendedor individual con sede en Turquía. Contacto: ${C}.`] },
        { h: 'Qué recogemos', p: [
          'El rango de edad y el sexo de su hijo (o “prefiero no decirlo”) y sus respuestas a las preguntas.',
          'Su correo electrónico, para enviarle el informe, y si aceptó recibir consejos ocasionales.',
          'Si compra el informe detallado: datos del pedido de nuestro proveedor de pagos (número de pedido, correo, importe). Nunca vemos ni guardamos los datos de su tarjeta.',
          'No pedimos el nombre, la fecha de nacimiento, fotos ni historiales médicos de su hijo. Por favor, no los incluya.',
        ] },
        { h: 'Para qué lo usamos', p: [
          'Para calcular su resultado, escribir su informe personal y enviárselo por correo.',
          'Para entregar el informe detallado que compró y atender reembolsos y consultas.',
          'Para enviar consejos ocasionales sobre el desarrollo infantil, solo si marcó esa casilla. Puede darse de baja en cualquier momento.',
          'No vendemos sus datos. Sus respuestas, resultados, los datos de su hijo y su correo nunca se comparten con anunciantes.',
        ] },
        { h: 'Cookies y anuncios', p: [
          'Si pulsa “Aceptar” en el aviso de cookies, usamos el Píxel de Meta (Facebook) para medir nuestros anuncios. Solo registra que se visitó una página, que se empezó una revisión, que se pidió un informe y que se pulsó el botón de pago. Si lo rechaza, no se carga. Puede cambiar de opinión borrando los datos de este sitio en su navegador.',
        ] },
        { h: 'Base legal', p: [
          'La información sobre el desarrollo de su hijo es sensible. Solo la tratamos con su consentimiento explícito, que da al completar la revisión y enviar su correo. Los datos del pedido se tratan para cumplir nuestro contrato con usted.',
        ] },
        { h: 'Quién nos ayuda', p: [
          'Supabase (base de datos y servidores, alojados en la UE, Fráncfort).',
          'OpenAI (redacta el texto del informe a partir de sus respuestas; se envían sin su correo. OpenAI no usa los datos de la API para entrenar sus modelos).',
          'Resend (envía los correos con los informes).',
          'Creem y Lemon Squeezy (gestionan los pagos como comerciante registrado).',
          'Vercel (aloja el sitio web).',
          'Meta Platforms (medición de anuncios, solo si acepta las cookies).',
          'Estos proveedores tratan los datos solo según nuestras instrucciones. Algunos están fuera de su país, incluido Estados Unidos, y aplican cláusulas contractuales estándar.',
        ] },
        { h: 'Cuánto tiempo los guardamos', p: [
          'Guardamos su revisión e informe para poder reenviarlo o entregar un informe que compre más tarde. Puede pedirnos que los borremos en cualquier momento y lo haremos en un plazo de 30 días. Los registros de pedidos pueden conservarse más tiempo si la ley fiscal lo exige.',
        ] },
        { h: 'Sus derechos', p: [
          `Puede pedir ver, corregir, exportar o borrar sus datos, o retirar su consentimiento, escribiendo a ${C}. También puede reclamar ante la autoridad de protección de datos de su país.`,
        ] },
        { h: 'Menores', p: [
          'El servicio lo usan padres y tutores legales mayores de 18 años. Los niños no lo usan por sí mismos.',
        ] },
        { h: 'Cambios y contacto', p: [
          `Si cambiamos esta política, actualizaremos la fecha de esta página. Consultas: ${C}.`,
        ] },
      ],
    },
    terms: {
      title: 'Términos de uso',
      intro: 'Al usar Farket acepta estos términos. Léalos, sobre todo la parte que explica lo que el servicio no es.',
      sections: [
        { h: 'Quién gestiona Farket', p: [`Farket está gestionado por ${O}, vendedor individual con sede en Turquía. Contacto: ${C}.`] },
        { h: 'Detección, no diagnóstico', p: [
          'Farket es una herramienta de detección. No es un dispositivo médico y no diagnostica el autismo ni ninguna otra condición. Los resultados e informes se basan solo en sus respuestas y se redactan con ayuda de inteligencia artificial. No sustituyen la evaluación de un médico o especialista.',
          'Si le preocupa el desarrollo de su hijo, hable con su pediatra sea cual sea el resultado. En una emergencia, llame a los servicios de emergencia locales.',
        ] },
        { h: 'Quién puede usarlo', p: [
          'Debe tener al menos 18 años y ser el padre, la madre o el tutor legal del niño, o contar con su permiso. Responda con sinceridad; el resultado solo puede ser tan preciso como sus respuestas.',
        ] },
        { h: 'Partes gratuitas y de pago', p: [
          'La revisión, su resultado y su informe personal son gratuitos. El resultado y la recomendación de ver a un especialista nunca están detrás de un pago.',
          `El informe detallado del desarrollo es una compra única y opcional (${PRICE}; los precios en el pago incluyen los impuestos aplicables). Es un producto digital que se entrega por correo, normalmente en pocos minutos. No hay suscripción ni cargos recurrentes. Como cada informe es personalizado, las ventas son definitivas; consulte nuestra Política de reembolso.`,
          'Los pagos los procesa Creem o Lemon Squeezy, nuestro revendedor y comerciante registrado, que también gestiona impuestos y facturas. Sus condiciones para compradores se aplican al pago.',
        ] },
        { h: 'Uso aceptable', p: [
          'No haga un mal uso del servicio: nada de acceso automatizado, intentos de dañarlo o sobrecargarlo, ni introducir datos de otras personas sin su permiso.',
        ] },
        { h: 'Propiedad intelectual', p: [
          'El sitio, las preguntas y el diseño pertenecen a Farket. Puede guardar, imprimir y compartir sus propios informes, por ejemplo con su médico.',
        ] },
        { h: 'Responsabilidad', p: [
          'Nos esforzamos por que el servicio sea preciso y esté disponible, pero se ofrece “tal cual”. En la medida en que la ley lo permita, no somos responsables de decisiones tomadas a partir de un resultado o informe, ni de pérdidas indirectas. Nuestra responsabilidad total por un informe de pago se limita a lo que pagó por él. Nada de esto limita sus derechos como consumidor.',
        ] },
        { h: 'Cambios, ley y contacto', p: [
          'Podemos actualizar estos términos; la fecha de esta página indica la última versión. Se rigen por las leyes de la República de Turquía, sin perjuicio de las protecciones obligatorias al consumidor del país donde vive.',
          `Contacto: ${C}.`,
        ] },
      ],
    },
    refund: {
      title: 'Política de reembolso',
      intro: `El informe detallado del desarrollo cuesta ${PRICE} en un pago único.`,
      sections: [
        { h: 'Todas las ventas son definitivas', p: [
          'Cada informe detallado se escribe específicamente a partir de las respuestas sobre su hijo y se entrega justo después del pago, por lo que no puede devolverse. Por eso no ofrecemos reembolsos una vez entregado el informe, tampoco por cambio de opinión.',
          'Al completar la compra acepta que el informe se entregue de inmediato y que pierde el derecho de desistimiento una vez iniciada la entrega, cuando la ley lo permite.',
        ] },
        { h: 'Cuándo sí reembolsamos', p: [
          'Se le cobró pero nunca recibió el informe y no podemos enviárselo.',
          'Se le cobró más de una vez por el mismo informe.',
          'Nada de esta política limita los derechos que le otorga la ley de consumo de su país.',
        ] },
        { h: 'Informe no recibido', p: [
          'Si su informe no ha llegado en 24 horas (revise primero la carpeta de spam), escríbanos. Se lo volveremos a enviar y, si no podemos entregarlo, le devolveremos el importe completo.',
        ] },
        { h: 'Cómo pedirlo', p: [
          `Escriba a ${C} con el correo que usó y su número de pedido. También puede responder al correo de recibo del pago.`,
          'El reembolso vuelve a su método de pago original a través de nuestro proveedor de pagos. Según su banco, suele aparecer en 5 a 10 días hábiles.',
        ] },
        { h: 'Sin suscripciones', p: [
          'Farket no tiene suscripciones: no hay nada que cancelar y nunca se le volverá a cobrar.',
        ] },
      ],
    },
    sample: {
      title: 'Ejemplo de informe detallado del desarrollo',
      intro: 'Este es un ejemplo del informe detallado de pago. La niña y las respuestas son ficticias. Su propio informe se escribe según las respuestas y la edad de su hijo.',
      sections: [
        { p: ['Niña · 18–23 meses · Resultado: probabilidad media'] },
        { h: 'Qué significan sus resultados', p: [
          'Gracias por dedicar tiempo a responder. Sus respuestas muestran que su hija va bien en varias áreas, como jugar con juguetes y disfrutar de estar cerca de usted. Algunas respuestas señalan áreas que conviene observar más de cerca. No es un diagnóstico: son buenos temas para comentar con su pediatra.',
        ] },
        { h: 'Áreas a observar', p: [
          'Atención compartida: respondió “a veces” a si señala para mostrarle algo interesante. A esta edad los niños suelen señalar para compartir, no solo para pedir.',
          'Respuesta a su nombre: dijo que “a veces” mira cuando la llama. Muchos niños de esta edad responden a su nombre casi siempre.',
          'Palabras: respondió “no” a usar al menos algunas palabras con sentido. Conviene mencionarlo al médico, sobre todo junto con los puntos anteriores.',
        ] },
        { h: 'Actividades para hacer en casa', p: [
          'Señalar y nombrar: señale cosas que ven juntas (“¡Mira, un perro!”), espere un momento y sonría cuando mire. Repítalo en los paseos y con libros de imágenes.',
          'Juegos con su nombre: llámela suavemente cuando esté cerca y dele algo divertido cuando se gire, como cosquillas o una canción.',
          'Hable de lo que hace: describa su juego con palabras cortas (“pelota… ¡rueda!”) y deje pausas para que responda con sonidos o gestos.',
        ] },
        { h: 'Cuándo repetir la revisión', p: ['Repita esta revisión en unos 3 meses, o antes si nota nuevas preocupaciones.'] },
        { h: 'Qué decirle a su médico', p: [
          'Edad: 18–23 meses. Resultado: probabilidad media. Áreas: señalar para compartir, respuesta al nombre, primeras palabras. No se informó pérdida de habilidades.',
        ] },
        { h: 'Siguiente paso', p: [
          'Comparta estos resultados con su pediatra en la próxima visita. El apoyo temprano marca una gran diferencia.',
        ] },
      ],
    },
  },
  ar: {
    privacy: {
      title: 'سياسة الخصوصية',
      intro: 'Farket ‏(farket.uclergnlts.com) خدمة إلكترونية للفحص الأولي للنمو المبكر للأطفال من عمر 6 إلى 48 شهرًا. توضح هذه السياسة البيانات التي نجمعها وسبب جمعها والخيارات المتاحة لك.',
      sections: [
        { h: 'من يدير Farket', p: [`يدير Farket ‏${O}، وهو بائع فرد مقيم في تركيا. للتواصل: ${C}.`] },
        { h: 'ما الذي نجمعه', p: [
          'الفئة العمرية لطفلك وجنسه (أو «أفضّل عدم الإجابة»)، وإجاباتك عن أسئلة الفحص.',
          'بريدك الإلكتروني لإرسال التقرير إليك، وما إذا كنت قد وافقت على تلقي نصائح من حين لآخر.',
          'إذا اشتريت التقرير المفصّل: بيانات الطلب من مزوّد الدفع (رقم الطلب، البريد الإلكتروني، المبلغ). لا نرى بيانات بطاقتك ولا نخزّنها أبدًا.',
          'لا نطلب اسم طفلك أو تاريخ ميلاده أو صوره أو أي سجلات طبية. يرجى عدم إدخالها في أي مكان.',
        ] },
        { h: 'لماذا نستخدمها', p: [
          'لحساب نتيجة الفحص وكتابة تقريرك الشخصي وإرساله إليك بالبريد الإلكتروني.',
          'لتسليم التقرير المفصّل الذي دفعت ثمنه، ومعالجة طلبات الاسترداد والدعم.',
          'لإرسال نصائح حول نمو الطفل من حين لآخر، فقط إذا اخترت ذلك. ويمكنك إلغاء الاشتراك في أي وقت.',
          'لا نبيع بياناتك. لا تتم مشاركة إجاباتك أو نتائجك أو بيانات طفلك أو بريدك الإلكتروني مع المعلنين أبدًا.',
        ] },
        { h: 'ملفات تعريف الارتباط والإعلانات', p: [
          'إذا ضغطت «موافق» في إشعار ملفات تعريف الارتباط، نستخدم بكسل Meta (فيسبوك) لقياس إعلاناتنا. وهو يسجّل فقط زيارة الصفحة، وبدء الفحص، وطلب التقرير، والضغط على زر الدفع. إذا رفضت، فلن يتم تحميله. ويمكنك تغيير رأيك بمسح بيانات هذا الموقع من متصفحك.',
        ] },
        { h: 'الأساس القانوني', p: [
          'المعلومات المتعلقة بنمو طفلك حساسة، ولا نعالجها إلا بموافقتك الصريحة التي تقدّمها عند إكمال الفحص وإرسال بريدك الإلكتروني. ونعالج بيانات الطلب لتنفيذ العقد المبرم معك.',
        ] },
        { h: 'من يساعدنا', p: [
          'Supabase (قاعدة البيانات والخوادم، مستضافة في الاتحاد الأوروبي، فرانكفورت).',
          'OpenAI (يكتب نص التقرير بناءً على إجاباتك؛ تُرسل الإجابات دون بريدك الإلكتروني، ولا تستخدم OpenAI بيانات واجهة البرمجة لتدريب نماذجها).',
          'Resend (يرسل رسائل التقارير).',
          'Creem وLemon Squeezy (يتوليان المدفوعات بصفتهما التاجر المسجّل).',
          'Vercel (يستضيف الموقع).',
          'Meta Platforms (قياس الإعلانات، فقط إذا وافقت على ملفات تعريف الارتباط).',
          'يعالج هؤلاء المزوّدون البيانات وفق تعليماتنا فقط. يقع بعضهم خارج بلدك، بما في ذلك الولايات المتحدة، ويطبّقون ضمانات تعاقدية قياسية.',
        ] },
        { h: 'مدة الاحتفاظ', p: [
          'نحتفظ بالفحص والتقرير لنتمكن من إعادة إرساله أو تسليم تقرير تشتريه لاحقًا. يمكنك أن تطلب حذفها في أي وقت وسنحذفها خلال 30 يومًا. قد تُحفظ سجلات الطلبات مدة أطول إذا اقتضى قانون الضرائب ذلك.',
        ] },
        { h: 'حقوقك', p: [
          `يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو تصديرها أو حذفها، أو سحب موافقتك، بمراسلتنا على ${C}. ويمكنك أيضًا تقديم شكوى إلى سلطة حماية البيانات في بلدك.`,
        ] },
        { h: 'الأطفال', p: [
          'يستخدم الخدمةَ الآباءُ والأوصياء القانونيون الذين تبلغ أعمارهم 18 عامًا فأكثر، ولا يستخدمها الأطفال بأنفسهم.',
        ] },
        { h: 'التغييرات والتواصل', p: [
          `إذا غيّرنا هذه السياسة فسنحدّث التاريخ في هذه الصفحة. للاستفسارات: ${C}.`,
        ] },
      ],
    },
    terms: {
      title: 'شروط الاستخدام',
      intro: 'باستخدامك Farket فإنك توافق على هذه الشروط. يرجى قراءتها، خاصة الجزء الذي يوضح ما ليست عليه الخدمة.',
      sections: [
        { h: 'من يدير Farket', p: [`يدير Farket ‏${O}، وهو بائع فرد مقيم في تركيا. للتواصل: ${C}.`] },
        { h: 'فحص أولي وليس تشخيصًا', p: [
          'Farket أداة فحص أولي، وليست جهازًا طبيًا، ولا تشخّص التوحد أو أي حالة أخرى. تعتمد النتائج والتقارير فقط على إجاباتك وتُكتب بمساعدة الذكاء الاصطناعي، ولا تغني عن تقييم طبيب أو مختص مؤهل.',
          'إذا كنت قلقًا بشأن نمو طفلك، فتحدث إلى طبيب الأطفال مهما كانت النتيجة. وفي حالات الطوارئ، اتصل بخدمات الطوارئ المحلية.',
        ] },
        { h: 'من يمكنه الاستخدام', p: [
          'يجب أن يكون عمرك 18 عامًا على الأقل وأن تكون والد الطفل أو وصيه القانوني، أو أن تحصل على إذنهما. يرجى الإجابة بصدق، فدقة النتيجة تعتمد على دقة إجاباتك.',
        ] },
        { h: 'الأجزاء المجانية والمدفوعة', p: [
          'الفحص ونتيجتك وتقريرك الشخصي مجانية. ولا تُوضع النتيجة ونصيحة مراجعة المختص خلف أي دفع أبدًا.',
          `تقرير النمو المفصّل عملية شراء اختيارية لمرة واحدة (${PRICE}، وتشمل الأسعار المعروضة عند الدفع الضرائب المطبّقة). وهو منتج رقمي يُرسل بالبريد الإلكتروني، عادةً خلال دقائق. لا يوجد اشتراك ولا رسوم متكررة. ولأن كل تقرير مخصّص، فإن جميع المبيعات نهائية؛ راجع سياسة الاسترداد.`,
          'تتولى Creem أو Lemon Squeezy معالجة المدفوعات بصفتها البائع والتاجر المسجّل، وتتولى أيضًا الضرائب والفواتير. وتسري شروطها الخاصة بالمشترين على عملية الدفع.',
        ] },
        { h: 'الاستخدام المقبول', p: [
          'لا تُسئ استخدام الخدمة: يُمنع الوصول الآلي، ومحاولات تعطيلها أو إثقالها، وإدخال بيانات أشخاص آخرين دون إذنهم.',
        ] },
        { h: 'الملكية الفكرية', p: [
          'الموقع والأسئلة والتصميم ملك لـ Farket. يمكنك الاحتفاظ بتقاريرك وطباعتها ومشاركتها، مثلًا مع طبيبك.',
        ] },
        { h: 'المسؤولية', p: [
          'نبذل جهدنا لتكون الخدمة دقيقة ومتاحة، لكننا نقدّمها «كما هي». وبالقدر الذي يسمح به القانون، لسنا مسؤولين عن القرارات المتخذة بناءً على نتيجة أو تقرير، ولا عن الخسائر غير المباشرة. وتقتصر مسؤوليتنا الإجمالية عن التقرير المدفوع على المبلغ الذي دفعته. ولا يحدّ أي شيء هنا من حقوقك بموجب قوانين حماية المستهلك.',
        ] },
        { h: 'التغييرات والقانون والتواصل', p: [
          'قد نحدّث هذه الشروط، ويبيّن التاريخ في هذه الصفحة أحدث نسخة. تخضع هذه الشروط لقوانين جمهورية تركيا، دون المساس بحماية المستهلك الإلزامية في بلد إقامتك.',
          `للتواصل: ${C}.`,
        ] },
      ],
    },
    refund: {
      title: 'سياسة الاسترداد',
      intro: `يكلّف تقرير النمو المفصّل ${PRICE} بدفعة واحدة.`,
      sections: [
        { h: 'جميع المبيعات نهائية', p: [
          'يُكتب كل تقرير مفصّل خصيصًا بناءً على إجاباتك عن طفلك ويُسلَّم فور الدفع، لذا لا يمكن إرجاعه. ولهذا لا نقدّم استردادًا بعد تسليم التقرير، بما في ذلك في حال تغيير رأيك.',
          'بإتمام الشراء، توافق على تسليم التقرير فورًا وعلى أنك تفقد حق العدول عن الشراء بمجرد بدء التسليم، حيث يسمح القانون بذلك.',
        ] },
        { h: 'متى نعيد المبلغ', p: [
          'إذا خُصم المبلغ ولم يصلك التقرير أبدًا ولم نتمكن من إرساله إليك.',
          'إذا خُصم المبلغ أكثر من مرة للتقرير نفسه.',
          'لا يحدّ أي شيء في هذه السياسة من حقوقك بموجب قانون حماية المستهلك في بلدك.',
        ] },
        { h: 'لم يصل التقرير', p: [
          'إذا لم يصل تقريرك خلال 24 ساعة (يرجى التحقق من مجلد الرسائل غير المرغوب فيها أولًا)، فراسلنا. سنعيد إرساله، وإذا تعذّر تسليمه فسنعيد إليك المبلغ كاملًا.',
        ] },
        { h: 'كيف تطلب الاسترداد', p: [
          `راسلنا على ${C} بالبريد الإلكتروني الذي استخدمته ورقم الطلب. ويمكنك أيضًا الرد على رسالة إيصال الدفع.`,
          'يُعاد المبلغ إلى وسيلة الدفع الأصلية عبر مزوّد الدفع لدينا، ويظهر عادةً خلال 5 إلى 10 أيام عمل حسب البنك.',
        ] },
        { h: 'لا اشتراكات', p: [
          'لا يوجد في Farket أي اشتراك، فلا شيء لإلغائه ولن تُحاسب مرة أخرى أبدًا.',
        ] },
      ],
    },
    sample: {
      title: 'نموذج تقرير النمو المفصّل',
      intro: 'هذا مثال على التقرير المفصّل المدفوع. الطفلة والإجابات افتراضية. يُكتب تقريرك الخاص بناءً على إجابات طفلك وعمره.',
      sections: [
        { p: ['بنت · 18–23 شهرًا · النتيجة: احتمال متوسط'] },
        { h: 'ماذا تعني نتائجك', p: [
          'شكرًا لك على وقتك في الإجابة. تُظهر إجاباتك أن ابنتك تسير بشكل جيد في عدة مجالات، مثل اللعب بالألعاب والاستمتاع بالقرب منك. وتشير بعض الإجابات إلى مجالات تستحق المتابعة عن قرب. هذا ليس تشخيصًا، بل هي مواضيع جيدة لمناقشتها مع طبيب الأطفال.',
        ] },
        { h: 'مجالات تستحق المتابعة', p: [
          'الانتباه المشترك: أجبت «أحيانًا» عن سؤال ما إذا كانت تشير لتريك شيئًا مثيرًا للاهتمام. في هذا العمر يشير الأطفال عادةً للمشاركة، لا للطلب فقط.',
          'الاستجابة لاسمها: قلت إنها «أحيانًا» تنظر عندما تناديها. معظم الأطفال في هذا العمر يستجيبون لأسمائهم في أغلب الأوقات.',
          'الكلمات: أجبت «لا» عن استخدام بضع كلمات ذات معنى على الأقل. يستحق ذلك ذكره للطبيب، خاصة مع النقاط السابقة.',
        ] },
        { h: 'أنشطة يمكن تجربتها في المنزل', p: [
          'أشِر وسمِّ: أشِر إلى أشياء تريانها معًا («انظري، كلب!»)، وانتظر لحظة، وابتسم عندما تنظر. كرّر ذلك أثناء النزهات ومع كتب الصور.',
          'ألعاب الاسم: نادِها بلطف وأنت قريب منها، وقدّم لها شيئًا ممتعًا عندما تلتفت، مثل الدغدغة أو أغنية.',
          'تحدّث عمّا تفعله: صِف لعبها بكلمات قصيرة («كرة… تتدحرج!»)، واترك فترات صمت لترد بأصوات أو إيماءات.',
        ] },
        { h: 'متى تعيد الفحص', p: ['أعد هذا الفحص بعد نحو 3 أشهر، أو قبل ذلك إذا لاحظت مخاوف جديدة.'] },
        { h: 'ماذا تقول لطبيبك', p: [
          'العمر: 18–23 شهرًا. النتيجة: احتمال متوسط. المجالات: الإشارة للمشاركة، الاستجابة للاسم، الكلمات الأولى. لم يُبلَّغ عن فقدان مهارات.',
        ] },
        { h: 'الخطوة التالية', p: [
          'شارك هذه النتائج مع طبيب الأطفال في الزيارة القادمة. الدعم المبكر يصنع فرقًا حقيقيًا.',
        ] },
      ],
    },
  },
};

export function InfoPage({ id, lang, onBack }: { id: PageId; lang: Lang; onBack: () => void }) {
  const d = DOCS[lang][id];
  const L = PAGE_LABELS[lang];
  return (
    <section className="doc">
      {id === 'sample' && <p className="sample-badge">{L.sampleBadge}</p>}
      <h1>{d.title}</h1>
      {id !== 'sample' && <p className="muted">{L.updated}: {UPDATED}</p>}
      {d.intro && <p className="lead">{d.intro}</p>}
      {d.sections.map((sec, i) => (
        <div key={i} className={id === 'sample' && i === 0 ? 'note' : undefined}>
          {sec.h && <h3>{sec.h}</h3>}
          {sec.p.map((p, j) => <p key={j}>{p}</p>)}
        </div>
      ))}
      {id === 'sample'
        ? <button className="primary" onClick={onBack}>{L.back}</button>
        : <button className="link" onClick={onBack}>{L.back}</button>}
    </section>
  );
}

const OPERATED_BY: Record<Lang, string> = {
  en: `Operated by ${OPERATOR} · Turkey`, es: `Gestionado por ${OPERATOR} · Turquía`, ar: `يديره ${OPERATOR} · تركيا`,
};

export function FooterLinks({ lang }: { lang: Lang }) {
  const L = PAGE_LABELS[lang];
  return (
    <nav className="footer-links">
      {PAGE_IDS.map((id) => <a key={id} href={`#${id}`}>{L[id]}</a>)}
      <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      <span className="operator">{OPERATED_BY[lang]}</span>
    </nav>
  );
}
