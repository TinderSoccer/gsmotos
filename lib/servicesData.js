// Datos portados desde el diseño de Claude Design "GSmotos Home.dc.html"
// (bloque <script type="text/dc-logic">). Contenido textual sin editar.
// Vive en lib/ porque lo consumen tanto la Home (selector interactivo) como
// las páginas de servicio/catálogo/nosotros bajo app/.
const FOTO_TALLER = "/images/foto-taller-c.png";
const FOTO_TRASLADO = "/images/foto-traslado-b.png";

export function slugify(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// kind:
//  - "service": categoría con plantilla de listado + detalle en /servicios/[categoria]/[servicio]
//  - "catalog": categoría "Productos" — se muestra como buscador/carrusel, no como grilla de tarjetas
//  - "about":   categoría "GSmotos" — cada tarjeta enlaza a una página propia (Nosotros/Contacto)
const RAW_MENUS = [
  {
    slug: "bmw-motorrad",
    kind: "service",
    title: "Servicios BMW Motorrad",
    hint: "Taller especializado",
    cards: [
      {
        kicker: "Servicio BMW Motorrad",
        title: "Mantenimiento preventivo",
        desc: "Pautas originales BMW Motorrad, herramientas especiales y registro en el historial de tu moto.",
        lead: "Mantener tu BMW es cuidar su historia, su rendimiento y su vida útil.",
        long: "Realizamos mantenimiento preventivo siguiendo las pautas originales BMW Motorrad actualizadas, los procedimientos técnicos y las herramientas especiales requeridas para cada modelo. Un servicio BMW Motorrad va mucho más allá de un cambio de aceite y borrar el aviso del tablero: contempla las revisiones y operaciones establecidas por el fabricante para mantener la motocicleta en condiciones óptimas. Los servicios se realizan según pauta, generalmente cada 10.000 km o una vez al año, considerando las particularidades de cada modelo. También realizamos trabajos preventivos específicos por separado, y cada intervención queda registrada en el historial de tu motocicleta, entregando trazabilidad y respaldo para el futuro.",
        note: "¿Quieres saber qué le corresponde a tu moto? Envíanos los últimos 7 dígitos del chasis y el kilometraje y te contactaremos.",
        photo: FOTO_TALLER,
      },
      {
        kicker: "Servicio BMW Motorrad",
        title: "Mantenimiento correctivo",
        desc: "Identificamos el origen de la falla y realizamos la reparación que tu moto realmente necesita.",
        lead: "Cuando una falla aparece, encontrar la causa es el primer paso para solucionarla correctamente.",
        long: "Si tu BMW Motorrad sufrió un desperfecto mecánico, una caída o una reparación que no ha podido ser solucionada, nuestros técnicos están capacitados para entregar una solución profesional. No solo conocemos BMW Motorrad: trabajamos bajo procedimientos, herramientas y estándares técnicos especializados, buscando identificar el origen del problema y realizar la reparación que tu motocicleta realmente necesita.",
        note: "¿Necesitas que revisemos tu moto? Envíanos los últimos 7 dígitos del chasis, el kilometraje y una breve descripción de tu inquietud.",
        photo: FOTO_TRASLADO,
      },
      {
        kicker: "Servicio BMW Motorrad",
        title: "GS Ready",
        desc: "Chequeo de viaje, pre-compra, general y revisión técnica: anticiparse también es parte del viaje.",
        lead: "Anticiparse también es parte del viaje.",
        long: "GS Ready es un concepto desarrollado por GSmotos para anticiparnos a posibles problemas y ayudarte a tomar decisiones con información técnica, experiencia y respaldo profesional. Revisamos tu moto en sus puntos críticos antes de que la necesites, porque conocer su estado real te permite viajar con mayor tranquilidad, comprar con mayor seguridad, mantenerla correctamente o prepararla para la revisión técnica.",
        note: "Cuatro formas de estar GS Ready: chequeo de viaje · pre-compra · general · revisión técnica. Revisa hoy. Disfruta mañana.",
        photo: FOTO_TALLER,
      },
      {
        kicker: "Servicio BMW Motorrad",
        title: "Diagnóstico y programación",
        desc: "Scanner BMW original, codificación de módulos y diagnóstico eléctrico y electrónico.",
        lead: "La tecnología permite encontrar la falla. La experiencia permite interpretarla.",
        long: "Realizamos diagnósticos eléctricos y electrónicos especializados utilizando scanner BMW original y equipos multimarca constantemente actualizados, identificando el origen de las fallas antes de intervenir. También realizamos programación y codificación de módulos y computadores, trabajando con información técnica, herramientas específicas y procedimientos adecuados para cada motocicleta, evitando reparaciones basadas en ensayo y error.",
        note: "Diagnóstico con respaldo técnico, no por ensayo y error.",
        photo: FOTO_TRASLADO,
      },
      {
        kicker: "Servicio BMW Motorrad",
        title: "Cerrajería Keyless",
        desc: "Llaves y sistemas keyless con procedimientos especializados y confidencialidad total.",
        lead: "La seguridad de tu moto también requiere confianza.",
        long: "Realizamos servicios de cerrajería, llaves y sistemas KEYLESS para motocicletas BMW, utilizando herramientas y procedimientos especializados. La información sensible asociada a tu motocicleta es tratada con estricta confidencialidad: no conservamos ni almacenamos información electrónica de tu moto una vez finalizado el servicio, porque entendemos que la seguridad de tu vehículo también es responsabilidad nuestra.",
        note: "Tu moto. Tu información. Tu seguridad. En GSmotos, la información sensible no se queda con nosotros.",
        photo: FOTO_TALLER,
      },
      {
        kicker: "Servicio BMW Motorrad",
        title: "Instalación de accesorios",
        desc: "Integración mecánica y eléctrica cuidada, manteniendo la estética y características de fábrica.",
        lead: "Un buen accesorio debe integrarse a tu moto, no interferir con ella.",
        long: "Realizamos la instalación de accesorios y equipamiento para motocicletas cuidando su correcta integración mecánica y eléctrica. Trabajamos con procedimientos adecuados para cada modelo, procurando que cada instalación sea segura, funcional y limpia, manteniendo la estética y las características de fábrica de tu motocicleta.",
        note: "Equipamiento pensado para tu moto. Instalado como corresponde.",
        photo: FOTO_TRASLADO,
      },
    ],
  },
  {
    slug: "neumaticos",
    kind: "service",
    title: "Neumáticos & Vulcanización",
    hint: "Único punto de contacto con el camino",
    cards: [
      {
        kicker: "Neumáticos GSmotos",
        title: "Venta e instalación",
        desc: "Asesoría según uso, modelo y tipo de viaje, con montaje profesional en taller.",
        lead: "El neumático es el único punto de contacto entre tu moto y el camino.",
        long: "Te asesoramos en la elección del neumático según el uso real de tu motocicleta, su modelo y el tipo de viaje que haces, y realizamos el montaje en taller con las herramientas adecuadas para cada llanta.",
        note: "Cuéntanos tu modelo y uso, y te recomendamos la mejor alternativa disponible.",
        photo: FOTO_TRASLADO,
      },
      {
        kicker: "Neumáticos GSmotos",
        title: "Balanceo y montaje",
        desc: "Montaje y balanceo con equipos específicos para motocicleta.",
        lead: "Un buen montaje se nota en cada curva.",
        long: "Montaje y balanceo con equipos específicos para motocicleta, revisando el estado de la llanta, válvulas y sellos antes de entregar la moto.",
        note: "Servicio disponible con o sin cita previa según carga del taller.",
        photo: FOTO_TALLER,
      },
      {
        kicker: "Neumáticos GSmotos",
        title: "Vulcanización",
        desc: "Reparación especializada de pinchazos y cortes según factibilidad técnica.",
        lead: "Reparar cuando se puede. Recomendar cambio cuando corresponde.",
        long: "Reparación especializada de pinchazos y cortes en neumáticos de motocicleta, siempre evaluando la factibilidad técnica: si la reparación no es segura, te lo decimos.",
        note: "Evaluamos cada neumático antes de repararlo. Tu seguridad primero.",
        photo: FOTO_TRASLADO,
      },
      {
        kicker: "Neumáticos GSmotos",
        title: "Neumáticos tubeless",
        desc: "Sellado, válvulas y revisión de llanta para rodar seguro.",
        lead: "Sistemas tubeless con el procedimiento correcto.",
        long: "Trabajo específico para neumáticos tubeless: sellado, válvulas y revisión de llanta, con los materiales y procedimientos adecuados para cada configuración.",
        note: "Consulta por tu modelo y tipo de llanta.",
        photo: FOTO_TALLER,
      },
    ],
  },
  {
    slug: "productos",
    kind: "catalog",
    title: "Productos",
    hint: "Búsqueda guiada, no vitrina",
    // Estas 4 tarjetas no se muestran como grilla (la categoría "Productos"
    // usa el buscador/carrusel), pero son contenido real del diseño — se
    // reutilizan como bloque introductorio en /productos.
    cards: [
      {
        kicker: "Productos GSmotos",
        title: "Buscador de productos",
        desc: "Encuentra lo que necesita tu moto y contáctanos por WhatsApp o correo.",
        lead: "Un gestor de búsqueda, no una vitrina.",
        long: "La sección de productos funciona como un gestor de búsqueda administrable: te guía hasta lo que tu motocicleta necesita y te conecta directamente con el taller por WhatsApp o correo para agendar o cotizar.",
        note: "Buscas, encuentras y te contactamos. Sin catálogos interminables.",
        photo: FOTO_TALLER,
      },
      {
        kicker: "Productos GSmotos",
        title: "Aceites y filtros",
        desc: "Especificaciones originales para cada modelo y pauta de servicio.",
        lead: "Lo que tu pauta pide, no lo que hay disponible.",
        long: "Aceites y filtros según las especificaciones originales de cada modelo y su pauta de servicio, para que el mantenimiento se realice con los insumos correctos.",
        note: "Indícanos modelo y kilometraje y te confirmamos qué corresponde.",
        photo: FOTO_TRASLADO,
      },
      {
        kicker: "Productos GSmotos",
        title: "Accesorios y equipamiento",
        desc: "Maletas, protecciones y equipamiento para el piloto.",
        lead: "Equipamiento para la moto y para quien la maneja.",
        long: "Maletas, protecciones y equipamiento del piloto seleccionados según el uso real de tu motocicleta, con instalación disponible en taller.",
        note: "Consulta disponibilidad y compatibilidad con tu modelo.",
        photo: FOTO_TALLER,
      },
      {
        kicker: "Productos GSmotos",
        title: "Repuestos originales",
        desc: "Piezas BMW Motorrad y alternativas de calidad comprobada.",
        lead: "Piezas correctas para reparaciones que duran.",
        long: "Trabajamos con repuestos BMW Motorrad y alternativas de calidad comprobada, indicándote siempre qué se está instalando en tu motocicleta.",
        note: "Cotiza con los últimos 7 dígitos del chasis para asegurar compatibilidad.",
        photo: FOTO_TRASLADO,
      },
    ],
  },
  {
    slug: "big-trail",
    kind: "service",
    title: "Otras marcas Big Trail",
    hint: "Ducati · KTM · Triumph · Honda · Yamaha y más",
    cards: [
      {
        kicker: "Big Trail multimarca",
        title: "Mantenimiento preventivo",
        desc: "Mantenciones según las especificaciones técnicas de cada fabricante.",
        lead: "No solo conocemos BMW. Entendemos las grandes viajeras.",
        long: "Mantenciones realizadas según las especificaciones y requerimientos técnicos de cada fabricante, aplicando la misma metodología desarrollada trabajando con BMW Motorrad.",
        note: "Consulta por tu modelo: Ducati, KTM, Triumph, Honda, Yamaha, Harley-Davidson, Suzuki, Aprilia y más.",
        photo: FOTO_TRASLADO,
      },
      {
        kicker: "Big Trail multimarca",
        title: "Mantenimiento correctivo",
        desc: "Diagnóstico y reparación de fallas mecánicas y de sistemas.",
        lead: "Mismo estándar, otra marca.",
        long: "Diagnóstico y reparación de fallas mecánicas y de los sistemas de la motocicleta, según factibilidad técnica y disponibilidad de repuestos.",
        note: "Cuéntanos la falla y evaluamos factibilidad antes de recibir la moto.",
        photo: FOTO_TALLER,
      },
      {
        kicker: "Big Trail multimarca",
        title: "Diagnóstico multimarca",
        desc: "Lectura de sistemas, diagnóstico de fallas y comprobación electrónica.",
        lead: "Equipos multimarca, criterio especializado.",
        long: "Lectura de sistemas, diagnóstico de fallas y comprobación electrónica con equipos multimarca actualizados, según factibilidad técnica y disponibilidad de repuestos.",
        note: "Consulta compatibilidad de tu marca y modelo con nuestros equipos.",
        photo: FOTO_TRASLADO,
      },
      {
        kicker: "Big Trail multimarca",
        title: "Neumáticos & vulcanización",
        desc: "Cambio, montaje, balanceo y reparación especializada.",
        lead: "El mismo trabajo fino en cualquier marca.",
        long: "Cambio, montaje, balanceo y reparación especializada de neumáticos para motocicletas de alta cilindrada.",
        note: "Servicio disponible para todas las marcas Big Trail que atendemos.",
        photo: FOTO_TALLER,
      },
      {
        kicker: "Big Trail multimarca",
        title: "Instalación de accesorios",
        desc: "Equipamiento instalado considerando sistemas eléctricos y electrónicos.",
        lead: "Instalado como corresponde.",
        long: "Instalación de equipamiento y accesorios considerando los sistemas eléctricos y electrónicos de la motocicleta, cuidando su integración y estética.",
        note: "Consulta por la instalación de tu accesorio antes de comprarlo.",
        photo: FOTO_TRASLADO,
      },
      {
        kicker: "Big Trail multimarca",
        title: "GS Ready",
        desc: "Chequeos de viaje, pre-compra, general y revisión técnica.",
        lead: "Tu moto puede ser de otra marca. Tu servicio no tiene por qué ser de otro estándar.",
        long: "Chequeos de viaje, pre-compra, general y revisión técnica también para motocicletas Big Trail de otras marcas, con el mismo nivel de cuidado y precisión.",
        note: "La marca puede cambiar. Nuestro estándar de trabajo, no.",
        photo: FOTO_TALLER,
      },
    ],
  },
  {
    slug: "gsmotos",
    kind: "about",
    title: "GSmotos",
    hint: "15 años de experiencia",
    cards: [
      {
        kicker: "GSmotos",
        title: "Nosotros",
        desc: "Un equipo consolidado con más de una década trabajando juntos por tu moto.",
        lead: "Una pasión que se convirtió en una forma de trabajar.",
        long: "GSmotos nace en febrero de 2011 con el propósito de crear un espacio especializado en motocicletas, donde el conocimiento técnico, la experiencia y la atención personalizada fueran parte fundamental de cada trabajo. Desde sus comienzos, la especialización en BMW Motorrad fue uno de sus pilares; con los años el taller fue creciendo, incorporando equipamiento especializado, herramientas específicas y tecnología de diagnóstico.",
        note: "La experiencia nos enseñó cómo hacerlo. La tecnología nos permite hacerlo mejor.",
        photo: FOTO_TALLER,
        href: "/nosotros",
      },
      {
        kicker: "GSmotos",
        title: "Nuestro taller",
        desc: "Herramientas especiales BMW, información técnica y órdenes de trabajo con trazabilidad.",
        lead: "Un buen servicio comienza antes de tomar una herramienta.",
        long: "Creemos que todo comienza entendiendo la motocicleta, identificando correctamente sus necesidades y utilizando los procedimientos y herramientas adecuados para cada trabajo. Por eso cada intervención tiene diagnóstico, respaldo y trazabilidad, con registro de los trabajos realizados e información clara para el cliente.",
        note: "Diagnóstico, respaldo y trazabilidad en cada orden de trabajo.",
        photo: FOTO_TRASLADO,
        href: "/nosotros#taller",
      },
      {
        kicker: "GSmotos",
        title: "Christopher, fundador",
        desc: "Especialista BMW Motorrad, docente y técnico con más de 25 años de oficio.",
        lead: "La mecánica comenzó mucho antes de convertirse en una profesión.",
        long: "Técnico en Mecánica Automotriz formado en Duoc UC, con cinco años de especialización en BMW Chile y formación internacional en diagnóstico y programación BMW. Fundó GSmotos en 2011 sin dejar nunca el taller, y durante siete años fue docente de Mecánica de Motocicletas en Duoc UC. La formación no se detiene: inmovilizadores en 2024 y certificación como soldador calificado en 2025.",
        note: "No solamente trabaja con motocicletas: vive y respira motocicletas.",
        photo: FOTO_TALLER,
        href: "/nosotros/christopher",
      },
      {
        kicker: "GSmotos",
        title: "Contacto y traslado",
        desc: "Si tu moto no puede llegar, vamos por ella donde lo necesites.",
        lead: "Cuando tu moto no puede llegar, nosotros vamos por ella.",
        long: "Servicio de traslado de motocicletas desde tu domicilio, la carretera o donde lo necesites. También puedes agendar directamente tu servicio en taller: Av. Presidente Riesco 6721, Las Condes, Santiago.",
        note: "+56 9 8405 8116 · contacto@gsmotos.cl · WhatsApp disponible.",
        photo: FOTO_TRASLADO,
        href: "/contacto",
      },
    ],
  },
];

// Agrega `slug` a cada tarjeta (a partir del título) sin tocar el contenido
// a mano. Los slugs solo son únicos DENTRO de su categoría — varios títulos
// se repiten entre categorías (ej. "Mantenimiento preventivo" en BMW
// Motorrad y en Big Trail) — por eso las rutas siempre van anidadas por
// categoría (/servicios/[categoria]/[servicio]), nunca con un slug suelto.
export const menus = RAW_MENUS.map((menu) => ({
  ...menu,
  cards: menu.cards.map((card) => ({ ...card, slug: slugify(card.title) })),
}));

export function getMenuBySlug(slug) {
  return menus.find((m) => m.slug === slug);
}

export function getCardBySlug(categorySlug, cardSlug) {
  const menu = getMenuBySlug(categorySlug);
  return menu?.cards.find((c) => c.slug === cardSlug);
}

export const productos = [
  { cat: "Aceites", name: "Aceite motor BMW Advantec Ultimate 5W-40", photo: FOTO_TALLER },
  { cat: "Filtros", name: "Kit filtro de aceite + anillos", photo: FOTO_TRASLADO },
  { cat: "Neumáticos", name: "Metzeler Karoo 4 · 170/60 R17", photo: FOTO_TALLER },
  { cat: "Accesorios", name: "Maleta lateral Vario 29 L", photo: FOTO_TRASLADO },
  { cat: "Equipamiento", name: "Casco BMW GS Pure", photo: FOTO_TALLER },
  { cat: "Protecciones", name: "Defensas de motor R 1300 GS", photo: FOTO_TRASLADO },
  { cat: "Neumáticos", name: "Michelin Anakee Adventure · 120/70 R19", photo: FOTO_TALLER },
  { cat: "Frenos", name: "Pastillas de freno delanteras originales", photo: FOTO_TRASLADO },
  { cat: "Iluminación", name: "Faros auxiliares LED con soporte", photo: FOTO_TALLER },
  { cat: "Accesorios", name: "Cargador de batería BMW Plus", photo: FOTO_TRASLADO },
  { cat: "Filtros", name: "Filtro de aire de alto flujo", photo: FOTO_TALLER },
  { cat: "Equipamiento", name: "Guantes GS Dry", photo: FOTO_TRASLADO },
].map((p) => ({ ...p, slug: slugify(p.name) }));
