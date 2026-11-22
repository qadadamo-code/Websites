/* BloomMark — Spanish, German and Russian copy (same structure as content.js + pages.js) */
(function () {
const C = window.BM_CONTENT;

/* ===================================================== SPANISH */
C.es = {
  dir: 'ltr', label: 'ES', htmlLang: 'es',
  meta: { title: 'BloomMark IP | Servicios de Propiedad Intelectual — El Cairo, Egipto', desc: 'BloomMark for Intellectual Property Services Ltd: marcas, patentes, diseños industriales, modelos de utilidad, derechos de autor, litigios y asesoría en PI en Egipto y la región MENA desde 2007.' },
  nav: { home: 'Inicio', firm: 'La firma', practice: 'Áreas', process: 'Método', egypt: 'PI en Egipto', req: 'Requisitos', insights: 'Novedades', contact: 'Contacto', cta: 'Solicitar consulta' },
  loader: 'Protegiendo la propiedad intelectual desde 2007',
  hero: {
    eyebrow: 'Firma egipcia de PI · El Cairo · Desde 2007',
    t1: 'Protegemos', t2: 'lo que usted crea', rotate: ['su marca', 'su invención', 'su diseño', 'su obra'],
    sub: 'BloomMark for Intellectual Property Services: agentes registrados de patentes y marcas que protegen sus activos intelectuales en Egipto y la región MENA, desde la primera búsqueda hasta el registro, la renovación y la defensa ante los tribunales.',
    cta1: 'Solicitar consulta', cta2: 'Ver nuestras áreas', scroll: 'Desplazar'
  },
  stats: [
    { n: 2007, pre: '', suf: '', l: 'Fundada en El Cairo' },
    { n: 200, pre: '', suf: '+', l: 'Países y territorios de origen de nuestros clientes' },
    { n: 6, pre: '', suf: '', l: 'Áreas de práctica integradas' },
    { n: 19, pre: '', suf: '', l: 'Años de ejercicio ininterrumpido' }
  ],
  marquee: ['Marcas', 'Patentes', 'Diseños industriales', 'Modelos de utilidad', 'Derechos de autor', 'Litigios', 'Vigilancia', 'Renovaciones y anualidades', 'Due diligence', 'Licencias y cesiones'],
  firm: {
    kicker: 'La firma',
    statement: 'Desde nuestra fundación en El Cairo en 2007, trabajamos como una extensión de las oficinas de nuestros clientes y socios en todo el mundo. Un equipo jurídico especializado, rigurosos estándares profesionales y éticos, y un compromiso constante: el cliente primero.',
    cols: [
      { h: 'Quiénes somos', p: 'BloomMark for Intellectual Property Services Ltd es una firma y agencia de propiedad intelectual con sede en El Cairo. Somos agentes de patentes especializados en el registro de marcas, patentes y diseños industriales. Gestionamos anualidades y renovaciones, inscripciones de cesiones y licencias, oposiciones y recursos para marcas locales e internacionales registradas en Egipto.' },
      { h: 'Un equipo a su lado', p: 'Cada mañana nuestro equipo jurídico se reúne para revisar los asuntos en curso. Trate con quien trate dentro de la firma, la experiencia de todo el equipo respalda su caso. Colaboramos estrechamente con los departamentos jurídicos internos para que cada encargo sea eficiente y rentable.' },
      { h: 'Una trayectoria de éxito', p: 'BloomMark es miembro de la Organización Egipcia de Agentes de Patentes. Combinamos un equipo interno cualificado y tecnología moderna de control de plazos con una sólida red de firmas asociadas de prestigio, para ofrecer un apoyo jurídico de primer nivel a honorarios competitivos.' }
    ],
    chairKicker: 'Mensaje del presidente',
    chairQuote: 'Nuestro objetivo es doble: dar a nuestros clientes la protección que su esfuerzo merece y contribuir al progreso de las personas. Les aseguro que seguiremos haciendo todo lo posible por ofrecer el más alto nivel de servicio.',
    chairBody: 'Desde 2007, BloomMark atiende las necesidades de propiedad intelectual de distinguidos clientes internacionales, a escala regional y global. A lo largo de este crecimiento hemos mantenido un compromiso firme con la máxima calidad de servicio en la protección de la PI.',
    chairSign: 'Presidente, BloomMark'
  },
  practice: {
    kicker: 'Áreas de práctica', title: 'Protección completa para cada activo intelectual', sub: 'Seleccione un área para ver el alcance completo del servicio.', more: 'Alcance del servicio', close: 'Cerrar',
    items: [
      { k: 'tm', h: 'Marcas', p: 'Una marca es más que un logotipo, un color o un eslogan. Es una herramienta de confianza que da a la empresa una ventaja competitiva duradera y un lugar en la mente del consumidor.', d: 'Ayudamos a las empresas a elegir nombres protegibles y nos ocupamos del registro y de cualquier asunto de infracción.', list: ['Búsquedas de marcas', 'Registro de marcas', 'Renovaciones', 'Cambio de nombre / domicilio', 'Cesiones', 'Licencias', 'Oposiciones', 'Servicios de vigilancia', 'Acciones legales', 'Dictámenes jurídicos', 'Cartas de requerimiento', 'Contratos de marcas', 'Due diligence en fusiones y adquisiciones'] },
      { k: 'pt', h: 'Patentes', p: 'La patente se concede a toda invención nueva, con actividad inventiva y aplicación industrial, y otorga a su titular el derecho de impedir que terceros la fabriquen, utilicen o vendan.', d: 'También se conceden patentes por toda modificación, mejora o adición a una invención ya patentada que cumpla los mismos requisitos.', list: ['Presentación y tramitación de solicitudes de patente', 'Fase nacional PCT y solicitudes por el Convenio de París', 'Dictámenes sobre validez e infracción', 'Cartas de requerimiento y resolución de controversias', 'Litigios de patentes y disputas conexas', 'Redacción y negociación de licencias y cesiones', 'Pago de anualidades para mantener las patentes en vigor'] },
      { k: 'ds', h: 'Diseños industriales', p: 'Toda composición de líneas o forma tridimensional, con o sin color, que confiere a un producto una apariencia nueva, distintiva y de aplicación industrial: desde envases y mobiliario hasta iluminación, joyería, dispositivos y textiles.', d: 'Un diseño es más que líneas: es la forma en que el mercado reconoce un producto.', list: ['Búsquedas de diseños', 'Registro de diseños', 'Renovaciones', 'Cambio de nombre / domicilio', 'Cesiones', 'Licencias', 'Oposiciones', 'Servicios de vigilancia', 'Acciones legales', 'Cartas de requerimiento'] },
      { k: 'um', h: 'Modelos de utilidad', p: 'Derecho exclusivo concedido a una invención que permite a su titular impedir su explotación comercial sin autorización durante un periodo limitado. Conocido también como «pequeña patente».', d: 'Una vía más rápida y económica para proteger mejoras técnicas prácticas.', list: ['Presentación y tramitación de solicitudes', 'Solicitudes PCT y por el Convenio de París', 'Dictámenes sobre validez e infracción', 'Cartas de requerimiento y acuerdos', 'Litigios', 'Licencias y cesiones'] },
      { k: 'cr', h: 'Derechos de autor', p: 'La obra del intelecto es una propiedad única y valiosa. Asesoramos y protegemos toda forma de expresión literaria, científica y artística: libros, escritos, conferencias, obras musicales, software y más.', d: 'Desde la creación, mantenimiento y explotación de los derechos hasta su defensa frente a infracciones, piratería, falsificación y mercado gris.', list: ['Registro y depósito de obras', 'Protección de nombres de dominio', 'Contratos de explotación y licencia', 'Lucha contra la infracción, la piratería y la falsificación', 'Acciones contra el mercado gris', 'Asesoría en derechos de autor'] },
      { k: 'lt', h: 'Litigios y controversias', p: 'Amplia experiencia ante los tribunales en la acusación y defensa de infracciones de marcas, patentes y derechos de autor, disputas de licencias, prácticas comerciales desleales y litigios mercantiles complejos.', d: 'También actuamos ampliamente ante la Oficina de Marcas en oposiciones, cancelaciones, reclamaciones y recursos.', list: ['Infracción de marcas, patentes y derechos de autor', 'Disputas de licencias', 'Competencia desleal', 'Acciones declarativas', 'Oposiciones y cancelaciones ante la Oficina de Marcas', 'Reclamaciones y recursos', 'Coordinación con asesores internos'] }
    ]
  },
  process: {
    kicker: 'Nuestro método', title: 'De la idea al derecho registrado', sub: 'Un camino claro y un seguimiento preciso de cada plazo legal.',
    steps: [
      { h: 'Consulta y búsqueda', p: 'Entendemos sus objetivos y buscamos en los registros para evaluar la protegibilidad y el riesgo de conflicto antes de presentar nada.' },
      { h: 'Preparación del expediente', p: 'Definimos con precisión las clases y reivindicaciones y preparamos el poder, los documentos legalizados y cualquier prioridad.' },
      { h: 'Presentación y examen', p: 'Presentamos ante la autoridad competente, seguimos el examen y respondemos a cada acción oficial u objeción.' },
      { h: 'Publicación y oposición', p: 'Vigilamos el periodo de publicación, defendemos su solicitud frente a oposiciones u oponemos por usted marcas confusamente similares.' },
      { h: 'Registro y renovación', p: 'Obtenemos el certificado y gestionamos renovaciones y anualidades para que su derecho nunca caduque.' },
      { h: 'Vigilancia y defensa', p: 'Vigilamos el mercado y los registros, y actuamos con cartas de requerimiento y acciones judiciales cuando es necesario.' }
    ]
  },
  egypt: {
    kicker: 'Protección en Egipto', title: 'El marco legal en cifras', sub: 'La PI en Egipto se rige por la Ley n.º 82 de 2002 de Protección de los Derechos de Propiedad Intelectual. Las solicitudes se presentan y examinan ante la Autoridad Egipcia de Propiedad Intelectual.',
    terms: [
      { n: 20, u: 'años', h: 'Patente', p: 'Desde la fecha de presentación en Egipto, sujeta al pago de anualidades.' },
      { n: 10, u: 'años', h: 'Marca', p: 'Renovable indefinidamente por periodos iguales.' },
      { n: 7, u: 'años', h: 'Modelo de utilidad', p: 'Desde la fecha de presentación, no renovable.' },
      { n: 50, u: 'años', h: 'Derecho de autor', p: 'La vida del autor más 50 años tras su fallecimiento.' }
    ],
    treatiesTitle: 'Egipto es parte de los principales tratados internacionales',
    treaties: ['Convenio de París para la Protección de la Propiedad Industrial', 'Tratado de Cooperación en materia de Patentes (PCT)', 'Protocolo de Madrid para marcas internacionales', 'Convenio de Berna para obras literarias y artísticas', 'Acuerdo ADPIC de la OMC', 'Clasificación Internacional de Niza'],
    note: 'Los plazos se indican a modo orientativo. Asesoramos con precisión en cada caso.'
  },
  network: {
    kicker: 'Nuestra red', title: 'De El Cairo al mundo', sub: 'Atendemos a clientes de más de 200 países y territorios, actuamos como agente local en Egipto para firmas de PI de todo el mundo y contamos con una red de firmas asociadas de confianza en la región y más allá.',
    points: ['Agente local en Egipto para firmas de PI extranjeras', 'Plena cooperación y descuentos especiales para firmas asociadas', 'Seguimiento continuo de la legislación en MENA, África y más allá'],
    cairo: 'El Cairo'
  },
  req: {
    kicker: 'Requisitos de presentación', title: 'Lo que necesitamos para empezar', sub: 'Una lista clara de documentos para cada tipo de solicitud en Egipto.',
    tabs: [
      { h: 'Marcas', groups: [{ t: '', list: ['Poder legalizado hasta el Consulado de Egipto, que puede presentarse dentro de los 6 meses siguientes a la solicitud.', 'Lista de productos y servicios; en Egipto pueden reivindicarse los títulos de clase de todas las clases.', 'El logotipo o nombre de la marca.', 'Copia certificada del documento de prioridad dentro de 6 meses, si se reivindica prioridad.'] }], note: 'El poder y los documentos de prioridad pueden presentarse después, dentro de 6 meses, sin coste adicional.' },
      { h: 'Patentes', groups: [{ t: 'Solicitudes PCT', list: ['Poder legalizado hasta el Consulado de Egipto; puede presentarse dentro de 4 meses sin coste adicional.'] }, { t: 'Solicitudes por el Convenio de París', list: ['Poder legalizado hasta el Consulado de Egipto; dentro de 4 meses sin coste adicional.', 'Certificado de constitución o licencia comercial legalizado; dentro de 3 meses sin coste adicional.', 'Escritura de cesión legalizada; dentro de 3 meses sin coste adicional.', 'Copia certificada de los documentos de prioridad.'] }], note: '' },
      { h: 'Diseños industriales', groups: [{ t: '', list: ['Poder legalizado hasta el Consulado de Egipto.', 'Registro mercantil de la empresa legalizado hasta el Consulado de Egipto, o copia del pasaporte si el solicitante es persona física.', 'Copia certificada de la solicitud de prioridad, si se reivindica; solo dentro de los 6 meses siguientes a la primera presentación en un Estado del Convenio de París.', 'Escritura de cesión legalizada del diseñador al solicitante, si no son la misma persona.'] }], note: 'Todos los documentos pueden presentarse después, dentro de 6 meses, sin coste adicional.' },
      { h: 'Modelos de utilidad', groups: [{ t: 'Solicitudes PCT', list: ['Poder legalizado hasta el Consulado de Egipto; dentro de 4 meses sin coste adicional.'] }, { t: 'Solicitudes por el Convenio de París', list: ['Poder legalizado hasta el Consulado de Egipto; dentro de 4 meses.', 'Certificado de constitución o licencia comercial legalizado; dentro de 3 meses.', 'Escritura de cesión legalizada; dentro de 3 meses.', 'Copia certificada de los documentos de prioridad.'] }], note: '' },
      { h: 'Derechos de autor', groups: [{ t: '', list: ['Poder legalizado hasta el Consulado de Egipto.', 'Copia del pasaporte o documento de identidad del solicitante y del agente.', 'El formulario de registro cumplimentado.', 'Certificado de registro de la obra en otro país, con sus datos, si lo hubiera.', 'La obra original y dos copias.'] }], note: '' },
      { h: 'Litigios', groups: [{ t: '', list: ['Poder notarial legalizado hasta el Consulado de Egipto.', 'Detalles completos del caso.'] }], note: '' }
    ]
  },
  values: {
    kicker: 'Nuestros valores', title: 'El cliente primero es nuestro valor principal',
    items: [
      { h: 'Calidad que supera expectativas', p: 'Entregamos un trabajo de la máxima calidad, superando siempre las expectativas del cliente.' },
      { h: 'Integridad sin concesiones', p: 'Actuamos con los más altos estándares morales, éticos y profesionales en cada asunto.' },
      { h: 'Desarrollo continuo', p: 'Seguimos desarrollando nuevas competencias a partir de nuestras capacidades y conocimientos.' },
      { h: 'Invertir en las personas', p: 'Un entorno respetuoso y basado en el mérito, porque nuestro futuro lo construye nuestra gente.' }
    ]
  },
  insights: {
    kicker: 'Novedades de PI', title: 'Seguimos la legislación mundial para protegerle', more: 'Síganos en LinkedIn',
    items: [
      { tag: 'Egipto', h: 'La EGIPA traslada a línea las audiencias de reclamaciones de marcas y diseños', p: 'En el marco de la transformación digital y la Visión 2030 de Egipto, los comités de reclamaciones sesionan ahora de forma electrónica.' },
      { tag: 'China', h: 'China moderniza su Ley de Marcas, en vigor el 1 de enero de 2027', p: 'Reconocimiento de marcas dinámicas, requisitos de uso efectivo más estrictos frente a solicitudes abusivas y mayor protección de las marcas notorias.' },
      { tag: 'Palestina', h: 'La Oficina de Marcas de Gaza amplía las renovaciones sin recargo hasta el 18 de noviembre de 2026', p: 'Según la Decisión Administrativa n.º 154/2026, que facilita la renovación de registros vencidos.' }
    ]
  },
  contact: {
    kicker: 'Contacto', title: 'Empecemos hoy a proteger sus activos', sub: 'Damos la bienvenida a empresas y firmas de PI de todo el mundo. Nuestra oficina es una extensión de la suya.',
    addrH: 'Sede central', addr: 'Edificio n.º 23, Oficina n.º 1, Planta baja, Green Hills Compound, Nasr City, El Cairo, Egipto',
    hoursH: 'Horario', hours: '09:00 – 17:00',
    phoneH: 'Teléfono y WhatsApp', mailH: 'Correo electrónico',
    mails: [{ l: 'Consultas generales', e: 'info@bloommark-ip.com' }, { l: 'Marcas', e: 'trademark@bloommark-ip.com' }, { l: 'Operaciones', e: 'operations@bloommark-ip.com' }, { l: 'Gestión de calidad', e: 'quality-management@bloommark-ip.com' }],
    form: { name: 'Nombre', company: 'Empresa', email: 'Correo electrónico', service: 'Servicio requerido', msg: 'Su mensaje', send: 'Enviar por WhatsApp', mail: 'o enviar por correo', ok: 'Gracias, abriendo la conversación.' },
    wa: 'Escríbanos por WhatsApp'
  },
  footer: { tag: 'Protegemos lo que usted crea.', rights: 'Todos los derechos reservados. BloomMark for Intellectual Property Services Ltd', top: 'Volver arriba' },
  pg: {
    nav: { home: 'Inicio', insights: 'Novedades' },
    heads: {
      firm: { t: 'La firma', s: 'Diecinueve años protegiendo la propiedad intelectual desde el corazón de El Cairo.' },
      practice: { t: 'Áreas', s: 'Seis áreas integradas que cubren cada activo intelectual que posee.' },
      process: { t: 'Método', s: 'Seis etapas claras, de la idea a un derecho registrado y protegido.' },
      egypt: { t: 'PI en Egipto', s: 'El marco legal, los plazos de protección y los requisitos de presentación.' },
      insights: { t: 'Novedades', s: 'Seguimos la legislación mundial y compartimos lo que importa a su marca.' },
      contact: { t: 'Contacto', s: 'Nuestra oficina es una extensión de la suya. Díganos qué desea proteger.' }
    },
    home: {
      drag: 'Mueva el cursor', introK: 'BloomMark',
      intro: 'No somos la primera firma de PI en Egipto, pero cada día trabajamos para ser la mejor.',
      indexK: 'Lo que protegemos', indexT: 'Seis áreas. Un compromiso.', open: 'Ver',
      firmK: 'La firma', firmT: 'Nuestra oficina es una extensión de la suya', firmP: 'Desde 2007 trabajamos junto a empresas y firmas de PI de todo el mundo, con un equipo que revisa cada asunto cada mañana.', firmCta: 'Conocer la firma',
      procK: 'Método', procT: 'De la idea al derecho registrado', procCta: 'Ver nuestro método',
      egyptK: 'PI en Egipto', egyptT: 'Plazos, tratados y documentos, en un solo lugar', egyptCta: 'Explorar el marco',
      newsK: 'Novedades', newsCta: 'Todas las novedades',
      ctaT: '¿Tiene una marca, una invención o un diseño que merece protección?', ctaB: 'Empezar'
    },
    next: 'Página siguiente', practiceHint: 'Desplácese para recorrer las áreas'
  }
};

/* ===================================================== GERMAN */
C.de = {
  dir: 'ltr', label: 'DE', htmlLang: 'de',
  meta: { title: 'BloomMark IP | Dienstleistungen im geistigen Eigentum — Kairo, Ägypten', desc: 'BloomMark for Intellectual Property Services Ltd: Marken, Patente, Designs, Gebrauchsmuster, Urheberrecht, Prozessführung und IP-Beratung in Ägypten und der MENA-Region seit 2007.' },
  nav: { home: 'Start', firm: 'Kanzlei', practice: 'Fachgebiete', process: 'Vorgehen', egypt: 'IP in Ägypten', req: 'Unterlagen', insights: 'Aktuelles', contact: 'Kontakt', cta: 'Beratung anfragen' },
  loader: 'Schutz geistigen Eigentums seit 2007',
  hero: {
    eyebrow: 'Ägyptische IP-Kanzlei · Kairo · Seit 2007',
    t1: 'Wir schützen', t2: 'was Sie erschaffen', rotate: ['Ihre Marke', 'Ihre Erfindung', 'Ihr Design', 'Ihr Werk'],
    sub: 'BloomMark for Intellectual Property Services: eingetragene Patent- und Markenvertreter, die Ihre geistigen Werte in Ägypten und der MENA-Region sichern – von der ersten Recherche über Eintragung und Verlängerung bis zur Durchsetzung vor Gericht.',
    cta1: 'Beratung anfragen', cta2: 'Fachgebiete ansehen', scroll: 'Scrollen'
  },
  stats: [
    { n: 2007, pre: '', suf: '', l: 'Gegründet in Kairo' },
    { n: 200, pre: '', suf: '+', l: 'Länder und Gebiete, aus denen unsere Mandanten kommen' },
    { n: 6, pre: '', suf: '', l: 'Integrierte Fachgebiete' },
    { n: 19, pre: '', suf: '', l: 'Jahre ununterbrochener Tätigkeit' }
  ],
  marquee: ['Marken', 'Patente', 'Designs', 'Gebrauchsmuster', 'Urheberrecht', 'Prozessführung', 'Überwachung', 'Verlängerungen & Jahresgebühren', 'Due Diligence', 'Lizenzen & Übertragungen'],
  firm: {
    kicker: 'Die Kanzlei',
    statement: 'Seit unserer Gründung in Kairo im Jahr 2007 arbeiten wir als Erweiterung der Büros unserer Mandanten und Partner weltweit. Ein spezialisiertes juristisches Team, strenge berufliche und ethische Standards und ein beständiges Versprechen: der Mandant zuerst.',
    cols: [
      { h: 'Wer wir sind', p: 'BloomMark for Intellectual Property Services Ltd ist eine Kanzlei und Agentur für geistiges Eigentum mit Sitz in Kairo. Wir sind Patentvertreter mit Schwerpunkt auf der Eintragung von Marken, Patenten und Designs. Wir betreuen Jahresgebühren und Verlängerungen, die Eintragung von Übertragungen und Lizenzen sowie Widersprüche und Beschwerden für nationale und internationale Marken in Ägypten.' },
      { h: 'Ein Team an Ihrer Seite', p: 'Jeden Morgen bespricht unser juristisches Team die laufenden Verfahren. Ganz gleich, mit wem Sie in der Kanzlei zu tun haben: Die Erfahrung des gesamten Teams fließt in Ihre Angelegenheit ein. Wir arbeiten eng mit Rechtsabteilungen zusammen, damit jedes Mandat effizient und wirtschaftlich bleibt.' },
      { h: 'Eine erfolgreiche Geschichte', p: 'BloomMark ist Mitglied der Ägyptischen Patentanwaltsorganisation. Wir verbinden ein qualifiziertes Team und moderne Fristenverwaltung mit einem starken Netzwerk renommierter Partnerkanzleien – für erstklassige rechtliche Unterstützung zu wettbewerbsfähigen Honoraren.' }
    ],
    chairKicker: 'Botschaft des Vorsitzenden',
    chairQuote: 'Unser Ziel ist ein doppeltes: unseren Mandanten den Schutz zu geben, den ihre Leistung verdient, und zum Fortschritt der Menschen beizutragen. Ich versichere Ihnen, dass wir weiterhin alles tun werden, um den höchsten Servicestandard zu bieten.',
    chairBody: 'Seit 2007 erfüllt BloomMark die Anforderungen namhafter internationaler Mandanten im Bereich des geistigen Eigentums, regional wie global. Bei allem Wachstum sind wir unserem Anspruch treu geblieben, beim IP-Schutz die bestmögliche Qualität zu liefern.',
    chairSign: 'Vorsitzender, BloomMark'
  },
  practice: {
    kicker: 'Fachgebiete', title: 'Umfassender Schutz für jeden geistigen Wert', sub: 'Wählen Sie ein Fachgebiet, um den vollen Leistungsumfang zu sehen.', more: 'Leistungsumfang', close: 'Schließen',
    items: [
      { k: 'tm', h: 'Marken', p: 'Eine Marke ist mehr als ein Logo, eine Farbe oder ein Slogan. Sie ist ein Vertrauensinstrument, das einem Unternehmen einen nachhaltigen Wettbewerbsvorteil und einen Platz im Kopf des Verbrauchers sichert.', d: 'Wir helfen Unternehmen, schutzfähige Namen zu wählen, und übernehmen die Eintragung sowie jede Verletzungsangelegenheit.', list: ['Markenrecherchen', 'Markeneintragung', 'Verlängerungen', 'Namens- / Adressänderung', 'Übertragungen', 'Lizenzen', 'Widersprüche', 'Markenüberwachung', 'Rechtliche Schritte', 'Rechtsgutachten', 'Abmahnungen', 'Markenverträge', 'Due Diligence bei Fusionen und Übernahmen'] },
      { k: 'pt', h: 'Patente', p: 'Ein Patent wird für jede gewerblich anwendbare Erfindung erteilt, die neu ist und auf erfinderischer Tätigkeit beruht. Es gibt dem Inhaber das Recht, anderen Herstellung, Nutzung und Verkauf zu untersagen.', d: 'Patente werden auch für Änderungen, Verbesserungen oder Ergänzungen bereits patentierter Erfindungen erteilt, die dieselben Kriterien erfüllen.', list: ['Einreichung und Verfolgung von Patentanmeldungen', 'PCT-Nationalphase und Anmeldungen nach der Pariser Verbandsübereinkunft', 'Gutachten zu Rechtsbestand und Verletzung', 'Abmahnungen und Streitbeilegung', 'Patentstreitigkeiten und verwandte IP-Verfahren', 'Entwurf und Verhandlung von Lizenzen und Übertragungen', 'Zahlung von Jahresgebühren zur Aufrechterhaltung'] },
      { k: 'ds', h: 'Designs', p: 'Jede Anordnung von Linien oder dreidimensionaler Form, mit oder ohne Farbe, die einem Erzeugnis ein neues, unterscheidungskräftiges und gewerblich anwendbares Erscheinungsbild verleiht: von Verpackung und Möbeln bis zu Leuchten, Schmuck, Geräten und Textilien.', d: 'Ein Design ist mehr als Linien – es ist die Art, wie ein Produkt am Markt erkannt wird.', list: ['Designrecherchen', 'Designeintragung', 'Verlängerungen', 'Namens- / Adressänderung', 'Übertragungen', 'Lizenzen', 'Widersprüche', 'Überwachung', 'Rechtliche Schritte', 'Abmahnungen'] },
      { k: 'um', h: 'Gebrauchsmuster', p: 'Ein ausschließliches Recht an einer Erfindung, mit dem der Inhaber die gewerbliche Nutzung ohne Zustimmung für einen begrenzten Zeitraum untersagen kann. Oft „kleines Patent“ genannt.', d: 'Ein schnellerer und günstigerer Weg zum Schutz praktischer technischer Verbesserungen.', list: ['Einreichung und Verfolgung von Anmeldungen', 'PCT- und Pariser Anmeldungen', 'Gutachten zu Rechtsbestand und Verletzung', 'Abmahnungen und Vergleiche', 'Prozessführung', 'Lizenzen und Übertragungen'] },
      { k: 'cr', h: 'Urheberrecht', p: 'Das Werk des Geistes ist ein einzigartiges und wertvolles Eigentum. Wir beraten zu und schützen jede Form literarischen, wissenschaftlichen und künstlerischen Ausdrucks: Bücher, Schriften, Vorträge, Musikwerke, Software und mehr.', d: 'Von der Begründung, Pflege und Verwertung der Rechte bis zu ihrer Verteidigung gegen Verletzung, Piraterie, Fälschung und Graumarktware.', list: ['Registrierung und Hinterlegung von Werken', 'Schutz von Domainnamen', 'Verwertungs- und Lizenzverträge', 'Vorgehen gegen Verletzung, Piraterie und Fälschung', 'Maßnahmen gegen Graumarktware', 'Urheberrechtsberatung'] },
      { k: 'lt', h: 'Prozessführung', p: 'Umfangreiche Prozesserfahrung bei der Verfolgung und Abwehr von Marken-, Patent- und Urheberrechtsverletzungen, Lizenzstreitigkeiten, unlauterem Wettbewerb und komplexen Handelsstreitigkeiten.', d: 'Zudem sind wir intensiv vor dem Markenamt in Widerspruchs-, Löschungs-, Beschwerde- und Rechtsmittelverfahren tätig.', list: ['Marken-, Patent- und Urheberrechtsverletzungen', 'Lizenzstreitigkeiten', 'Unlauterer Wettbewerb', 'Feststellungsklagen', 'Widerspruch und Löschung vor dem Markenamt', 'Beschwerden und Rechtsmittel', 'Abstimmung mit Rechtsabteilungen'] }
    ]
  },
  process: {
    kicker: 'Unser Vorgehen', title: 'Von der Idee zum eingetragenen Recht', sub: 'Ein klarer Weg und die genaue Überwachung jeder gesetzlichen Frist.',
    steps: [
      { h: 'Beratung & Recherche', p: 'Wir verstehen Ihre Ziele und recherchieren in den Registern, um Schutzfähigkeit und Kollisionsrisiko vor jeder Anmeldung zu bewerten.' },
      { h: 'Vorbereitung der Akte', p: 'Wir legen Klassen und Ansprüche präzise fest und bereiten Vollmacht, legalisierte Unterlagen und etwaige Prioritäten vor.' },
      { h: 'Anmeldung & Prüfung', p: 'Wir reichen bei der zuständigen Behörde ein, begleiten die Prüfung und beantworten jeden Bescheid und Einwand.' },
      { h: 'Veröffentlichung & Widerspruch', p: 'Wir überwachen die Veröffentlichungsfrist, verteidigen Ihre Anmeldung gegen Widersprüche oder legen für Sie Widerspruch gegen verwechselbare Marken ein.' },
      { h: 'Eintragung & Verlängerung', p: 'Wir erhalten die Urkunde und verwalten Verlängerungen und Jahresgebühren, damit Ihr Recht nie erlischt.' },
      { h: 'Überwachung & Durchsetzung', p: 'Wir beobachten Markt und Register und handeln bei Bedarf mit Abmahnungen und gerichtlichen Schritten.' }
    ]
  },
  egypt: {
    kicker: 'Schutz in Ägypten', title: 'Der Rechtsrahmen in Zahlen', sub: 'Geistiges Eigentum in Ägypten wird durch das Gesetz Nr. 82 von 2002 zum Schutz der Rechte des geistigen Eigentums geregelt. Anmeldungen werden bei der Ägyptischen Behörde für geistiges Eigentum eingereicht und geprüft.',
    terms: [
      { n: 20, u: 'Jahre', h: 'Patent', p: 'Ab dem Anmeldetag in Ägypten, vorbehaltlich der Jahresgebühren.' },
      { n: 10, u: 'Jahre', h: 'Marke', p: 'Unbegrenzt um gleiche Zeiträume verlängerbar.' },
      { n: 7, u: 'Jahre', h: 'Gebrauchsmuster', p: 'Ab dem Anmeldetag, nicht verlängerbar.' },
      { n: 50, u: 'Jahre', h: 'Urheberrecht', p: 'Lebenszeit des Urhebers plus 50 Jahre nach seinem Tod.' }
    ],
    treatiesTitle: 'Ägypten ist Vertragspartei der wichtigsten internationalen Abkommen',
    treaties: ['Pariser Verbandsübereinkunft zum Schutz des gewerblichen Eigentums', 'Vertrag über die internationale Zusammenarbeit auf dem Gebiet des Patentwesens (PCT)', 'Madrider Protokoll für internationale Marken', 'Berner Übereinkunft zum Schutz von Werken der Literatur und Kunst', 'TRIPS-Übereinkommen der WTO', 'Internationale Klassifikation von Nizza'],
    note: 'Die Fristen dienen der allgemeinen Orientierung. Wir beraten in jedem Einzelfall präzise.'
  },
  network: {
    kicker: 'Unser Netzwerk', title: 'Von Kairo in die Welt', sub: 'Wir betreuen Mandanten aus über 200 Ländern und Gebieten, handeln als Inlandsvertreter in Ägypten für IP-Kanzleien weltweit und stützen uns auf ein Netzwerk vertrauenswürdiger Partnerkanzleien in der Region und darüber hinaus.',
    points: ['Inlandsvertreter in Ägypten für ausländische IP-Kanzleien', 'Volle Zusammenarbeit und Sonderkonditionen für Partnerkanzleien', 'Laufende Beobachtung der Gesetzgebung in MENA, Afrika und darüber hinaus'],
    cairo: 'Kairo'
  },
  req: {
    kicker: 'Anmeldeunterlagen', title: 'Was wir von Ihnen zum Start benötigen', sub: 'Eine klare Checkliste der Unterlagen für jede Anmeldeart in Ägypten.',
    tabs: [
      { h: 'Marken', groups: [{ t: '', list: ['Vollmacht, legalisiert bis zum ägyptischen Konsulat; kann innerhalb von 6 Monaten nach der Anmeldung nachgereicht werden.', 'Verzeichnis der Waren und Dienstleistungen; in Ägypten können die Klassenüberschriften aller Klassen beansprucht werden.', 'Das Markenlogo oder der Markenname.', 'Beglaubigte Kopie des Prioritätsbelegs innerhalb von 6 Monaten, falls Priorität beansprucht wird.'] }], note: 'Vollmacht und Prioritätsbelege können innerhalb von 6 Monaten ohne Zusatzgebühr nachgereicht werden.' },
      { h: 'Patente', groups: [{ t: 'PCT-Anmeldungen', list: ['Vollmacht, legalisiert bis zum ägyptischen Konsulat; innerhalb von 4 Monaten ohne Zusatzkosten nachreichbar.'] }, { t: 'Anmeldungen nach der Pariser Verbandsübereinkunft', list: ['Vollmacht, legalisiert bis zum ägyptischen Konsulat; innerhalb von 4 Monaten ohne Zusatzkosten.', 'Legalisierte Gründungsurkunde oder Gewerbeerlaubnis; innerhalb von 3 Monaten ohne Zusatzkosten.', 'Legalisierte Übertragungsurkunde; innerhalb von 3 Monaten ohne Zusatzkosten.', 'Beglaubigte Kopie der Prioritätsbelege.'] }], note: '' },
      { h: 'Designs', groups: [{ t: '', list: ['Vollmacht, legalisiert bis zum ägyptischen Konsulat.', 'Handelsregisterauszug des Unternehmens, legalisiert bis zum ägyptischen Konsulat, oder Passkopie bei natürlichen Personen.', 'Beglaubigte Kopie der Prioritätsanmeldung, falls beansprucht; Priorität nur innerhalb von 6 Monaten nach der Erstanmeldung in einem Verbandsstaat.', 'Legalisierte Übertragungsurkunde vom Entwerfer auf den Anmelder, falls nicht identisch.'] }], note: 'Alle Unterlagen können innerhalb von 6 Monaten ohne Zusatzgebühr nachgereicht werden.' },
      { h: 'Gebrauchsmuster', groups: [{ t: 'PCT-Anmeldungen', list: ['Vollmacht, legalisiert bis zum ägyptischen Konsulat; innerhalb von 4 Monaten ohne Zusatzkosten.'] }, { t: 'Anmeldungen nach der Pariser Verbandsübereinkunft', list: ['Vollmacht, legalisiert bis zum ägyptischen Konsulat; innerhalb von 4 Monaten.', 'Legalisierte Gründungsurkunde oder Gewerbeerlaubnis; innerhalb von 3 Monaten.', 'Legalisierte Übertragungsurkunde; innerhalb von 3 Monaten.', 'Beglaubigte Kopie der Prioritätsbelege.'] }], note: '' },
      { h: 'Urheberrecht', groups: [{ t: '', list: ['Vollmacht, legalisiert bis zum ägyptischen Konsulat.', 'Kopie des Reisepasses oder Ausweises von Anmelder und Vertreter.', 'Das ausgefüllte Registrierungsformular.', 'Gegebenenfalls eine Registrierungsbescheinigung des Werks aus einem anderen Land mit den Angaben.', 'Das Originalwerk und zwei Kopien.'] }], note: '' },
      { h: 'Prozessführung', groups: [{ t: '', list: ['Notariell beglaubigte Vollmacht, legalisiert bis zum ägyptischen Konsulat.', 'Vollständige Angaben zum Fall.'] }], note: '' }
    ]
  },
  values: {
    kicker: 'Unsere Werte', title: 'Der Mandant zuerst ist unser wichtigster Wert',
    items: [
      { h: 'Qualität über Erwartung', p: 'Wir liefern Arbeit höchster Qualität und übertreffen stets die Erwartungen unserer Mandanten.' },
      { h: 'Kompromisslose Integrität', p: 'Wir handeln in jeder Angelegenheit nach höchsten moralischen, ethischen und beruflichen Maßstäben.' },
      { h: 'Ständige Weiterentwicklung', p: 'Wir entwickeln laufend neue Fähigkeiten auf Basis unseres Wissens und Könnens.' },
      { h: 'In Menschen investieren', p: 'Ein respektvolles, leistungsorientiertes Umfeld – denn unsere Zukunft gestalten unsere Mitarbeitenden.' }
    ]
  },
  insights: {
    kicker: 'IP-Aktuelles', title: 'Wir verfolgen die weltweite Gesetzgebung, um Sie zu schützen', more: 'Folgen Sie uns auf LinkedIn',
    items: [
      { tag: 'Ägypten', h: 'EGIPA verlegt Beschwerdeanhörungen zu Marken und Designs ins Internet', p: 'Im Rahmen der digitalen Transformation und der Vision 2030 tagen die Beschwerdeausschüsse nun elektronisch.' },
      { tag: 'China', h: 'China modernisiert sein Markengesetz, gültig ab 1. Januar 2027', p: 'Anerkennung dynamischer Marken, strengere Benutzungsanforderungen gegen missbräuchliche Anmeldungen und erweiterter Schutz bekannter Marken.' },
      { tag: 'Palästina', h: 'Markenamt Gaza verlängert zuschlagsfreie Verlängerungen bis 18. November 2026', p: 'Gemäß Verwaltungsbeschluss Nr. 154/2026, der die Verlängerung überfälliger Eintragungen erleichtert.' }
    ]
  },
  contact: {
    kicker: 'Kontakt', title: 'Schützen wir Ihre Werte – ab heute', sub: 'Wir begrüßen Unternehmen und IP-Kanzleien aus aller Welt. Unser Büro ist eine Erweiterung Ihres Büros.',
    addrH: 'Hauptsitz', addr: 'Gebäude Nr. 23, Büro Nr. 1, Erdgeschoss, Green Hills Compound, Nasr City, Kairo, Ägypten',
    hoursH: 'Bürozeiten', hours: '09:00 – 17:00',
    phoneH: 'Telefon & WhatsApp', mailH: 'E-Mail',
    mails: [{ l: 'Allgemeine Anfragen', e: 'info@bloommark-ip.com' }, { l: 'Marken', e: 'trademark@bloommark-ip.com' }, { l: 'Betrieb', e: 'operations@bloommark-ip.com' }, { l: 'Qualitätsmanagement', e: 'quality-management@bloommark-ip.com' }],
    form: { name: 'Name', company: 'Unternehmen', email: 'E-Mail', service: 'Gewünschte Leistung', msg: 'Ihre Nachricht', send: 'Per WhatsApp senden', mail: 'oder per E-Mail senden', ok: 'Vielen Dank, das Gespräch wird geöffnet.' },
    wa: 'Schreiben Sie uns auf WhatsApp'
  },
  footer: { tag: 'Wir schützen, was Sie erschaffen.', rights: 'Alle Rechte vorbehalten. BloomMark for Intellectual Property Services Ltd', top: 'Nach oben' },
  pg: {
    nav: { home: 'Start', insights: 'Aktuelles' },
    heads: {
      firm: { t: 'Kanzlei', s: 'Neunzehn Jahre Schutz geistigen Eigentums aus dem Herzen Kairos.' },
      practice: { t: 'Fachgebiete', s: 'Sechs integrierte Bereiche für jeden geistigen Wert, den Sie besitzen.' },
      process: { t: 'Vorgehen', s: 'Sechs klare Schritte, von der Idee zum eingetragenen, geschützten Recht.' },
      egypt: { t: 'IP in Ägypten', s: 'Rechtsrahmen, Schutzdauer und Anmeldeunterlagen.' },
      insights: { t: 'Aktuelles', s: 'Wir verfolgen die Gesetzgebung weltweit und teilen, was für Ihre Marke zählt.' },
      contact: { t: 'Kontakt', s: 'Unser Büro ist eine Erweiterung Ihres Büros. Sagen Sie uns, was Sie schützen möchten.' }
    },
    home: {
      drag: 'Cursor bewegen', introK: 'BloomMark',
      intro: 'Wir sind nicht die erste IP-Kanzlei Ägyptens, aber wir arbeiten jeden Tag daran, die beste zu sein.',
      indexK: 'Was wir schützen', indexT: 'Sechs Fachgebiete. Ein Versprechen.', open: 'Ansehen',
      firmK: 'Kanzlei', firmT: 'Unser Büro ist eine Erweiterung Ihres Büros', firmP: 'Seit 2007 arbeiten wir Seite an Seite mit Unternehmen und IP-Kanzleien weltweit, mit einem Team, das jeden Fall jeden Morgen prüft.', firmCta: 'Die Kanzlei kennenlernen',
      procK: 'Vorgehen', procT: 'Von der Idee zum eingetragenen Recht', procCta: 'Unser Vorgehen',
      egyptK: 'IP in Ägypten', egyptT: 'Fristen, Abkommen und Unterlagen an einem Ort', egyptCta: 'Rechtsrahmen ansehen',
      newsK: 'Aktuelles', newsCta: 'Alle Meldungen',
      ctaT: 'Haben Sie eine Marke, eine Erfindung oder ein Design, das Schutz verdient?', ctaB: 'Jetzt starten'
    },
    next: 'Nächste Seite', practiceHint: 'Scrollen, um durch die Fachgebiete zu gehen'
  }
};

/* ===================================================== RUSSIAN */
C.ru = {
  dir: 'ltr', label: 'RU', htmlLang: 'ru',
  meta: { title: 'BloomMark IP | Услуги в сфере интеллектуальной собственности — Каир, Египет', desc: 'BloomMark for Intellectual Property Services Ltd: товарные знаки, патенты, промышленные образцы, полезные модели, авторское право, судебные споры и консультации по ИС в Египте и регионе MENA с 2007 года.' },
  nav: { home: 'Главная', firm: 'О компании', practice: 'Услуги', process: 'Подход', egypt: 'ИС в Египте', req: 'Документы', insights: 'Новости', contact: 'Контакты', cta: 'Получить консультацию' },
  loader: 'Защищаем интеллектуальную собственность с 2007 года',
  hero: {
    eyebrow: 'Египетская фирма по ИС · Каир · С 2007 года',
    t1: 'Мы защищаем', t2: 'то, что вы создаёте', rotate: ['ваш товарный знак', 'ваше изобретение', 'ваш дизайн', 'ваше произведение'],
    sub: 'BloomMark for Intellectual Property Services — зарегистрированные патентные поверенные и агенты по товарным знакам, защищающие ваши интеллектуальные активы в Египте и регионе MENA: от первого поиска до регистрации, продления и защиты в суде.',
    cta1: 'Получить консультацию', cta2: 'Наши услуги', scroll: 'Прокрутить'
  },
  stats: [
    { n: 2007, pre: '', suf: '', l: 'Основана в Каире' },
    { n: 200, pre: '', suf: '+', l: 'Стран и территорий, откуда наши клиенты' },
    { n: 6, pre: '', suf: '', l: 'Интегрированных направлений' },
    { n: 19, pre: '', suf: '', l: 'Лет непрерывной практики' }
  ],
  marquee: ['Товарные знаки', 'Патенты', 'Промышленные образцы', 'Полезные модели', 'Авторское право', 'Судебные споры', 'Мониторинг', 'Продления и пошлины', 'Due diligence', 'Лицензии и уступки'],
  firm: {
    kicker: 'О компании',
    statement: 'С момента основания в Каире в 2007 году мы работаем как продолжение офисов наших клиентов и партнёров по всему миру. Специализированная юридическая команда, строгие профессиональные и этические стандарты и неизменный принцип: клиент прежде всего.',
    cols: [
      { h: 'Кто мы', p: 'BloomMark for Intellectual Property Services Ltd — юридическая фирма и агентство в сфере интеллектуальной собственности с офисом в Каире. Мы патентные поверенные, специализирующиеся на регистрации товарных знаков, патентов и промышленных образцов. Ведём уплату пошлин и продления, регистрацию уступок и лицензий, возражения и жалобы по национальным и международным знакам в Египте.' },
      { h: 'Команда на вашей стороне', p: 'Каждое утро наша юридическая команда собирается, чтобы рассмотреть текущие дела. С кем бы вы ни работали в фирме, над вашим делом работает опыт всей команды. Мы тесно взаимодействуем с юридическими отделами компаний, чтобы каждое поручение было эффективным и экономичным.' },
      { h: 'История успеха', p: 'BloomMark — член Египетской организации патентных поверенных. Мы сочетаем квалифицированную команду и современные системы контроля сроков с сильной сетью авторитетных партнёрских фирм, обеспечивая юридическую поддержку высшего уровня по конкурентным ставкам.' }
    ],
    chairKicker: 'Обращение председателя',
    chairQuote: 'Наша цель двойная: дать клиентам защиту, которой заслуживают их усилия, и способствовать развитию людей. Заверяю вас, что мы и дальше будем делать всё возможное для обеспечения высочайшего уровня обслуживания.',
    chairBody: 'С 2007 года BloomMark обслуживает потребности ведущих международных клиентов в сфере интеллектуальной собственности на региональном и глобальном уровне. На всём пути роста мы сохраняем неизменную приверженность лучшему качеству услуг по защите ИС.',
    chairSign: 'Председатель, BloomMark'
  },
  practice: {
    kicker: 'Направления', title: 'Полная защита каждого интеллектуального актива', sub: 'Выберите направление, чтобы увидеть полный перечень услуг.', more: 'Перечень услуг', close: 'Закрыть',
    items: [
      { k: 'tm', h: 'Товарные знаки', p: 'Товарный знак — это больше, чем логотип, цвет или слоган. Это инструмент доверия, дающий бизнесу устойчивое конкурентное преимущество и место в сознании потребителя.', d: 'Мы помогаем компаниям выбирать охраноспособные названия и ведём регистрацию и любые дела о нарушениях.', list: ['Поиск по товарным знакам', 'Регистрация товарных знаков', 'Продление', 'Изменение наименования / адреса', 'Уступка прав', 'Лицензии', 'Возражения', 'Мониторинг', 'Судебные действия', 'Юридические заключения', 'Претензионные письма', 'Договоры по товарным знакам', 'Due diligence при слияниях и поглощениях'] },
      { k: 'pt', h: 'Патенты', p: 'Патент выдаётся на любое промышленно применимое изобретение, обладающее новизной и изобретательским уровнем, и даёт владельцу право запрещать другим изготавливать, использовать или продавать его.', d: 'Патенты также выдаются на любое изменение, усовершенствование или дополнение запатентованного изобретения, отвечающее тем же критериям.', list: ['Подача и ведение патентных заявок', 'Национальная фаза PCT и заявки по Парижской конвенции', 'Заключения о действительности и нарушении', 'Претензионные письма и урегулирование споров', 'Патентные споры и смежные дела по ИС', 'Подготовка и согласование лицензий и уступок', 'Уплата пошлин для поддержания патентов в силе'] },
      { k: 'ds', h: 'Промышленные образцы', p: 'Любая композиция линий или объёмная форма, цветная или нет, придающая изделию новый, отличительный и промышленно применимый внешний вид: от упаковки и мебели до светильников, ювелирных изделий, устройств и текстиля.', d: 'Дизайн — это больше, чем линии: это то, как продукт узнают на рынке.', list: ['Поиск по образцам', 'Регистрация образцов', 'Продление', 'Изменение наименования / адреса', 'Уступка прав', 'Лицензии', 'Возражения', 'Мониторинг', 'Судебные действия', 'Претензионные письма'] },
      { k: 'um', h: 'Полезные модели', p: 'Исключительное право на изобретение, позволяющее владельцу запрещать его коммерческое использование без разрешения в течение ограниченного срока. Часто называется «малым патентом».', d: 'Более быстрый и экономичный способ защитить практические технические улучшения.', list: ['Подача и ведение заявок', 'Заявки PCT и по Парижской конвенции', 'Заключения о действительности и нарушении', 'Претензионные письма и мировые соглашения', 'Судебные споры', 'Лицензии и уступки'] },
      { k: 'cr', h: 'Авторское право', p: 'Плод интеллекта — уникальная и ценная собственность. Мы консультируем и защищаем любые формы литературного, научного и художественного творчества: книги, тексты, лекции, музыкальные произведения, программы и многое другое.', d: 'От создания, поддержания и использования прав до их защиты от нарушений, пиратства, контрафакта и «серого» импорта.', list: ['Регистрация и депонирование произведений', 'Защита доменных имён', 'Договоры об использовании и лицензии', 'Борьба с нарушениями, пиратством и контрафактом', 'Меры против «серого» импорта', 'Консультации по авторскому праву'] },
      { k: 'lt', h: 'Судебные споры', p: 'Большой опыт ведения дел в суде — как со стороны истца, так и ответчика — по нарушениям прав на товарные знаки, патенты и авторских прав, лицензионным спорам, недобросовестной конкуренции и сложным коммерческим спорам.', d: 'Мы также активно представляем клиентов в Ведомстве по товарным знакам по возражениям, аннулированию, жалобам и апелляциям.', list: ['Нарушения прав на знаки, патенты и авторских прав', 'Лицензионные споры', 'Недобросовестная конкуренция', 'Иски о признании', 'Возражения и аннулирование в Ведомстве по товарным знакам', 'Жалобы и апелляции', 'Взаимодействие с юристами компаний'] }
    ]
  },
  process: {
    kicker: 'Наш подход', title: 'От идеи до зарегистрированного права', sub: 'Понятный путь и точный контроль каждого юридического срока.',
    steps: [
      { h: 'Консультация и поиск', p: 'Изучаем ваши бизнес-цели и проводим поиск по реестрам, чтобы оценить охраноспособность и риск конфликта до подачи заявки.' },
      { h: 'Подготовка документов', p: 'Точно определяем классы и формулу, готовим доверенность, легализованные документы и притязание на приоритет.' },
      { h: 'Подача и экспертиза', p: 'Подаём заявку в компетентный орган, сопровождаем экспертизу и отвечаем на каждый запрос или возражение.' },
      { h: 'Публикация и возражения', p: 'Следим за сроком публикации, защищаем вашу заявку от возражений или подаём возражения против сходных до степени смешения знаков.' },
      { h: 'Регистрация и продление', p: 'Получаем свидетельство и ведём продления и уплату пошлин, чтобы ваше право никогда не прекратилось.' },
      { h: 'Мониторинг и защита', p: 'Следим за рынком и реестрами и при необходимости действуем претензионными письмами и судебными исками.' }
    ]
  },
  egypt: {
    kicker: 'Защита в Египте', title: 'Правовая база в цифрах', sub: 'ИС в Египте регулируется Законом № 82 от 2002 года о защите прав интеллектуальной собственности. Заявки подаются в Египетское ведомство интеллектуальной собственности и рассматриваются им.',
    terms: [
      { n: 20, u: 'лет', h: 'Патент', p: 'С даты подачи в Египте при условии уплаты пошлин.' },
      { n: 10, u: 'лет', h: 'Товарный знак', p: 'Продлевается неограниченно на равные сроки.' },
      { n: 7, u: 'лет', h: 'Полезная модель', p: 'С даты подачи, без продления.' },
      { n: 50, u: 'лет', h: 'Авторское право', p: 'Жизнь автора и 50 лет после его смерти.' }
    ],
    treatiesTitle: 'Египет — участник основных международных договоров',
    treaties: ['Парижская конвенция по охране промышленной собственности', 'Договор о патентной кооперации (PCT)', 'Мадридский протокол о международной регистрации знаков', 'Бернская конвенция об охране литературных и художественных произведений', 'Соглашение ТРИПС ВТО', 'Ниццкая международная классификация'],
    note: 'Сроки приведены для общего ориентира. По каждому делу мы даём точную консультацию.'
  },
  network: {
    kicker: 'Наша сеть', title: 'Из Каира — в мир', sub: 'Мы обслуживаем клиентов из более чем 200 стран и территорий, выступаем местным агентом в Египте для фирм по ИС со всего мира и опираемся на сеть надёжных партнёров в регионе и за его пределами.',
    points: ['Местный агент в Египте для иностранных фирм по ИС', 'Полное сотрудничество и специальные скидки для партнёров', 'Постоянный мониторинг законодательства в MENA, Африке и за их пределами'],
    cairo: 'Каир'
  },
  req: {
    kicker: 'Требования к подаче', title: 'Что нужно от вас для начала работы', sub: 'Понятный перечень документов для каждого вида заявки в Египте.',
    tabs: [
      { h: 'Товарные знаки', groups: [{ t: '', list: ['Доверенность, легализованная до уровня консульства Египта; может быть представлена в течение 6 месяцев после подачи.', 'Перечень товаров и услуг; в Египте можно заявлять заголовки всех классов.', 'Логотип или название знака.', 'Заверенная копия приоритетного документа в течение 6 месяцев, если заявлен приоритет.'] }], note: 'Доверенность и приоритетные документы можно представить позже, в течение 6 месяцев, без доплаты.' },
      { h: 'Патенты', groups: [{ t: 'Заявки PCT', list: ['Доверенность, легализованная до уровня консульства Египта; может быть представлена в течение 4 месяцев без доплаты.'] }, { t: 'Заявки по Парижской конвенции', list: ['Доверенность, легализованная до уровня консульства Египта; в течение 4 месяцев без доплаты.', 'Легализованное свидетельство о регистрации или лицензия; в течение 3 месяцев без доплаты.', 'Легализованный договор уступки; в течение 3 месяцев без доплаты.', 'Заверенная копия приоритетных документов.'] }], note: '' },
      { h: 'Промышленные образцы', groups: [{ t: '', list: ['Доверенность, легализованная до уровня консульства Египта.', 'Выписка из торгового реестра компании, легализованная до уровня консульства Египта, или копия паспорта для физических лиц.', 'Заверенная копия приоритетной заявки, если заявлен приоритет; только в течение 6 месяцев после первой подачи в стране Парижской конвенции.', 'Легализованный договор уступки от автора дизайна заявителю, если это разные лица.'] }], note: 'Все документы можно представить позже, в течение 6 месяцев, без доплаты.' },
      { h: 'Полезные модели', groups: [{ t: 'Заявки PCT', list: ['Доверенность, легализованная до уровня консульства Египта; в течение 4 месяцев без доплаты.'] }, { t: 'Заявки по Парижской конвенции', list: ['Доверенность, легализованная до уровня консульства Египта; в течение 4 месяцев.', 'Легализованное свидетельство о регистрации или лицензия; в течение 3 месяцев.', 'Легализованный договор уступки; в течение 3 месяцев.', 'Заверенная копия приоритетных документов.'] }], note: '' },
      { h: 'Авторское право', groups: [{ t: '', list: ['Доверенность, легализованная до уровня консульства Египта.', 'Копия паспорта или удостоверения личности заявителя и представителя.', 'Заполненная регистрационная форма.', 'Свидетельство о регистрации произведения в другой стране с данными, если имеется.', 'Оригинал произведения и две копии.'] }], note: '' },
      { h: 'Судебные споры', groups: [{ t: '', list: ['Нотариальная доверенность, легализованная до уровня консульства Египта.', 'Полная информация по делу.'] }], note: '' }
    ]
  },
  values: {
    kicker: 'Наши ценности', title: 'Клиент прежде всего — наша главная ценность',
    items: [
      { h: 'Качество сверх ожиданий', p: 'Мы выполняем работу высочайшего качества, всегда превосходя ожидания клиентов.' },
      { h: 'Безупречная честность', p: 'В каждом деле мы следуем высшим моральным, этическим и профессиональным стандартам.' },
      { h: 'Постоянное развитие', p: 'Мы непрерывно развиваем новые навыки на основе имеющихся знаний и опыта.' },
      { h: 'Инвестиции в людей', p: 'Уважительная среда, основанная на заслугах, потому что наше будущее создают наши сотрудники.' }
    ]
  },
  insights: {
    kicker: 'Новости ИС', title: 'Мы следим за законодательством мира, чтобы защитить вас', more: 'Мы в LinkedIn',
    items: [
      { tag: 'Египет', h: 'EGIPA переводит слушания по жалобам о знаках и образцах в онлайн', p: 'В рамках цифровой трансформации Египта и «Видения 2030» комиссии по жалобам теперь заседают в электронном формате.' },
      { tag: 'Китай', h: 'Китай модернизирует закон о товарных знаках с 1 января 2027 года', p: 'Признание динамических знаков, более строгие требования к использованию против недобросовестных заявок и расширенная охрана общеизвестных знаков.' },
      { tag: 'Палестина', h: 'Ведомство по товарным знакам Газы продлило продление без штрафов до 18 ноября 2026 года', p: 'Согласно административному решению № 154/2026, упрощающему продление просроченных регистраций.' }
    ]
  },
  contact: {
    kicker: 'Контакты', title: 'Начнём защищать ваши активы сегодня', sub: 'Мы открыты для компаний и фирм по ИС со всего мира. Наш офис — продолжение вашего.',
    addrH: 'Головной офис', addr: 'Здание № 23, офис № 1, первый этаж, Green Hills Compound, Наср-Сити, Каир, Египет',
    hoursH: 'Часы работы', hours: '09:00 – 17:00',
    phoneH: 'Телефон и WhatsApp', mailH: 'Эл. почта',
    mails: [{ l: 'Общие вопросы', e: 'info@bloommark-ip.com' }, { l: 'Товарные знаки', e: 'trademark@bloommark-ip.com' }, { l: 'Операционный отдел', e: 'operations@bloommark-ip.com' }, { l: 'Управление качеством', e: 'quality-management@bloommark-ip.com' }],
    form: { name: 'Имя', company: 'Компания', email: 'Эл. почта', service: 'Требуемая услуга', msg: 'Ваше сообщение', send: 'Отправить в WhatsApp', mail: 'или отправить по почте', ok: 'Спасибо, открываем чат.' },
    wa: 'Напишите нам в WhatsApp'
  },
  footer: { tag: 'Мы защищаем то, что вы создаёте.', rights: 'Все права защищены. BloomMark for Intellectual Property Services Ltd', top: 'Наверх' },
  pg: {
    nav: { home: 'Главная', insights: 'Новости' },
    heads: {
      firm: { t: 'О компании', s: 'Девятнадцать лет защищаем интеллектуальную собственность из сердца Каира.' },
      practice: { t: 'Услуги', s: 'Шесть направлений, охватывающих каждый ваш интеллектуальный актив.' },
      process: { t: 'Подход', s: 'Шесть понятных этапов — от идеи до зарегистрированного и защищённого права.' },
      egypt: { t: 'ИС в Египте', s: 'Правовая база, сроки охраны и требования к подаче.' },
      insights: { t: 'Новости', s: 'Следим за законодательством мира и делимся тем, что важно для вашего бренда.' },
      contact: { t: 'Контакты', s: 'Наш офис — продолжение вашего. Расскажите, что вы хотите защитить.' }
    },
    home: {
      drag: 'Двигайте курсор', introK: 'BloomMark',
      intro: 'Мы не первая фирма по ИС в Египте, но каждый день работаем, чтобы быть лучшей.',
      indexK: 'Что мы защищаем', indexT: 'Шесть направлений. Одно обязательство.', open: 'Открыть',
      firmK: 'О компании', firmT: 'Наш офис — продолжение вашего', firmP: 'С 2007 года мы работаем бок о бок с компаниями и фирмами по ИС по всему миру, и наша команда каждое утро рассматривает каждое дело.', firmCta: 'Познакомиться',
      procK: 'Подход', procT: 'От идеи до зарегистрированного права', procCta: 'Наши этапы',
      egyptK: 'ИС в Египте', egyptT: 'Сроки, договоры и документы — в одном месте', egyptCta: 'Правовая база',
      newsK: 'Новости', newsCta: 'Все новости',
      ctaT: 'У вас есть знак, изобретение или дизайн, достойные защиты?', ctaB: 'Начать'
    },
    next: 'Следующая страница', practiceHint: 'Прокрутите, чтобы просмотреть направления'
  }
};
})();
