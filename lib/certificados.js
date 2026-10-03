// Certificados y trayectoria de Christopher, portados desde el diseño de
// Claude Design "Christopher Fundador.dc.html" (bloque <script data-dc-script>).
// Datos puros (se usan también desde app/nosotros/christopher/page.jsx, un
// Server Component) — las fotos subidas desde el panel viven aparte, en
// lib/useCertPhotos.js, para no forzar este módulo al boundary de cliente.

// `defaultPhoto`: foto real del certificado, entregada por el cliente —
// escaneos originales en ~/Desktop/gsmotos (fuera del repo). La de
// "cert-7" (técnico de nivel medio) tiene el RUT difuminado antes de
// subirla, por privacidad; el resto no mostraba RUT visible. No hay
// tarjeta para "BMW Chile, 7 años" (Especialización BMW Motorrad): no es
// un diploma, describe un período de trabajo sin certificado físico —
// se sacó en vez de dejarla pendiente sin imagen (ese hito igual queda
// documentado en TRAYECTORIA, más abajo).
//
// "cert-7": el documento escaneado dice textualmente "Liceo Politécnico
// Particular Andes" (vía Ministerio de Educación, como corresponde a todo
// título de nivel medio en Chile) — el cliente confirmó que ese liceo es
// de Duoc UC, por eso el org menciona ambos (si dijera solo "Duoc UC"
// contradeciría lo que se lee en la propia foto del certificado al
// abrir el popup).
// `photoW`/`photoH`: tamaño real (px) de `defaultPhoto` — se lo pasamos a
// next/image en el popup (CertificadoModal) para que optimice el escaneo
// (140-260KB sin comprimir) en vez de servirlo tal cual. Si se sube una
// foto propia desde /administracion (reemplaza a `defaultPhoto`), esa
// sigue mostrándose con un <img> normal — ver CertificadoModal.jsx.
export const CERTIFICADOS = [
  { slot: "cert-7", year: "2004", org: "Liceo Politécnico Andes · Duoc UC", title: "Técnico de Nivel Medio en Mecánica Automotriz", desc: "Primera formación técnica, antes de especializarse en motocicletas BMW.", defaultPhoto: "/images/certificados/cert-tecnico-liceo.jpg", photoW: 1300, photoH: 933 },
  { slot: "cert-1", year: "2011", org: "Duoc UC", title: "Ingeniero de Ejecución en Mecánica Automotriz y Autotrónica", desc: "Especialización universitaria sobre la base técnica, con mención en autotrónica.", defaultPhoto: "/images/certificados/cert-ingenieria.jpg", photoW: 1300, photoH: 979 },
  { slot: "cert-3", year: "Internacional", org: "BMW Group", title: "Diagnóstico y programación BMW", desc: "Formación en diagnóstico electrónico y codificación de módulos.", defaultPhoto: "/images/certificados/cert-bmw-programacion.jpg", photoW: 942, photoH: 1300 },
  { slot: "cert-4", year: "2017", org: "Duoc UC", title: "Diplomado en Diseño Curricular", desc: "Formación pedagógica, base de sus años como docente de Mecánica de Motocicletas.", defaultPhoto: "/images/certificados/cert-diplomado-curricular.jpg", photoW: 1300, photoH: 964 },
  { slot: "cert-5", year: "2024", org: "Especialización", title: "Inmovilizadores y sistemas keyless", desc: "Procedimientos especializados de cerrajería y seguridad electrónica.", defaultPhoto: "/images/certificados/cert-inmovilizadores.jpg", photoW: 1300, photoH: 965 },
  { slot: "cert-6", year: "2025", org: "Certificación", title: "Soldador calificado", desc: "Certificación vigente para trabajos de soldadura estructural.", defaultPhoto: "/images/certificados/cert-soldadura.jpg", photoW: 1300, photoH: 1000 },
];

// Hitos de la tarjeta "Trayectoria". `color` sigue el criterio del diseño
// original: azul de marca salvo el hito de fundación, en rojo. El hito
// "Duoc UC" usa `items` (lista) en vez de `text` (oración con comas) a
// pedido del cliente: quiere que se note que son 4 títulos distintos
// (detalle exacto que entregó el cliente), no uno solo con varias
// menciones — ver el render en app/nosotros/christopher/page.jsx (si hay
// `items`, se muestra cada uno en su propia línea en vez de unirlos en un
// párrafo).
//
// `logos`: logo real de la institución nombrada en ese hito (pedido del
// cliente: "los logos reales"). Solo en los hitos que nombran una
// institución puntual — "25+ años" y "2011 funda GSmotos" no llevan,
// porque no nombran ninguna. Fuente de cada logo:
//   - bmw.svg: ya existía en el proyecto (uso de marca ya autorizado).
//   - duoc-uc.svg: Wikimedia Commons, commons.wikimedia.org/wiki/File:Logo_DuocUC.svg
//     (dominio público por umbral de originalidad / patrimonio cultural común
//     en Chile; aun así es marca registrada de Duoc UC).
//   - aiep.png: Wikimedia Commons, "AIEP-alt-azul_1.png" (logo institucional
//     usado en el artículo de Wikipedia de Instituto Profesional AIEP).
//   - indura.png: seeklogo.com (recortado, sin marca de agua) — el
//     certificado de soldadura es de CETI/Air Products, pero el cliente
//     pidió puntualmente el logo de Indura (empresa chilena de gases y
//     soldadura, hoy parte de Air Products).
export const TRAYECTORIA = [
  { value: "25+", label: "años", color: "#1B5FAE", text: "Más de dos décadas de oficio: la mecánica empezó mucho antes de convertirse en profesión." },
  { value: "Duoc", label: "UC", color: "#1B5FAE", items: ["Técnico de Nivel Medio en Mecánica Automotriz", "Técnico de Nivel Superior en Mecánica Automotriz y Autotrónica", "Ingeniero de Ejecución en Mecánica Automotriz y Autotrónica", "Diplomado en Diseño Curricular"], logos: [{ src: "/images/marcas/duoc-uc.svg", alt: "Duoc UC" }] },
  {
    value: "7",
    label: "años",
    color: "#1B5FAE",
    text: "Especialización dentro de BMW Chile, más formación internacional en diagnóstico y programación BMW.",
    // El cliente sacó el logo BMW de acá (no le hacía sentido al lado de
    // la foto de prensa) — queda solo la foto, más grande.
    // Foto de prensa (revista, debut nacional FIM de enduro de 2009,
    // escaneada por el cliente). `thumb`: recorte chico para el ícono
    // junto al hito; `full`: página completa de la revista, la que se ve
    // en el popup (ver components/nosotros/PrensaModal.jsx).
    photo: {
      thumb: "/images/prensa/revista-bmw-fim-2009.jpg",
      full: "/images/prensa/revista-bmw-fim-2009-completa.jpg",
      alt: "Christopher en revista de motociclismo, debut BMW en Chile",
      year: "Prensa",
      org: "Debut Nacional FIM de Enduro",
      title: "BMW salta al ruedo en Chile",
      desc: "“BMW saltó al ruedo con su primer piloto oficial en Chile, Alejandro Denham Gutiérrez, quien aparece con Mauricio Vergara (Gte. Ventas BMW Motos), Claudio Gatica (Jefe Post Venta), Cristopher Ahumada y Pedro Navarro (mecánicos), además de los niños Alejandro y Diego.”",
    },
  },
  { value: "2011", label: "", color: "#E7002A", text: "Funda GSmotos, taller especializado en BMW Motorrad y grandes viajeras." },
  { value: "8", label: "años", color: "#1B5FAE", text: "Ex docente de las instituciones Duoc UC y AIEP. Formando parte del equipo docente de mecánica automotriz y autotrónica, con especialización en motocicletas y diagnóstico.", logos: [{ src: "/images/marcas/duoc-uc.svg", alt: "Duoc UC" }, { src: "/images/marcas/aiep.png", alt: "AIEP" }] },
  { value: "2024", label: "", color: "#1B5FAE", text: "Especialización en inmovilizadores y sistemas keyless." },
  { value: "2025", label: "", color: "#1B5FAE", text: "Certificación como soldador calificado.", logos: [{ src: "/images/marcas/indura.png", alt: "Indura" }] },
];
