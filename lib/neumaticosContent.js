// Contenido de /servicios/neumaticos — texto entregado por el cliente, SIN
// modificar. Centralizado acá (no hardcodeado en el JSX) para que sea fácil
// de ubicar y editar a futuro sin tocar los componentes.
import { ClipboardCheck, Gauge, Mountain, RefreshCcw, Route, Shuffle, Wrench } from "lucide-react";

export const NEUMATICOS_HERO = {
  title: "Neumáticos & Vulcanización",
  lead: "El neumático es el único punto de contacto entre tu moto y el camino.",
  paragraphs: [
    "En GSmotos trabajamos neumáticos para motocicletas pensando no solo en su instalación, sino también en el uso que tendrá la moto, las condiciones de conducción y el tipo de ruta.",
    "Realizamos montaje, balanceo y vulcanización, además de entregar asesoría para ayudarte a elegir la alternativa adecuada para tu motocicleta.",
  ],
  quote: "Porque un neumático no se elige solo por su medida. Se elige según cómo y dónde vas a usar tu moto.",
};

// Sirve igual en celular y computador (antes decía "Toca", y en el
// computador no se toca).
export const NEUMATICOS_SERVICIOS_HINT = "Elige un servicio para ver el detalle.";

// slot: identifica la imagen propia de cada tarjeta en lib/neumaticosPhotos.js.
// `defaultPhoto`: foto de referencia (banco libre, Pexels — licencia Pexels,
// uso comercial libre sin atribución obligatoria) mientras el cliente no
// suba la suya propia desde /administracion; ahí siempre tiene prioridad.
// Fuente de cada una, por si se quiere cambiar más adelante:
//   - servicio-cambio: pexels.com/photo/bearded-man-fixing-motorcycle-in-workshop-3822843
//   - servicio-balanceo: pexels.com/photo/close-up-of-motorcycle-fork-and-wheel-16033298
//   - servicio-vulcanizado: pexels.com/photo/mechanics-checking-the-motorcycle-12741638
//   - servicio-asesoria: pexels.com/photo/close-up-shot-of-a-person-fixing-an-engine-of-a-motorcycle-11890963
export const NEUMATICOS_SERVICIOS = [
  {
    slot: "servicio-cambio",
    Icon: Wrench,
    title: "Cambio de neumático",
    subtitle: "Montaje especializado para tu motocicleta.",
    text: "Realizamos el desmontaje y montaje de neumáticos utilizando procedimientos y equipamiento adecuados para motocicletas, cuidando llantas, sensores y componentes asociados.",
    defaultPhoto: "/images/neumaticos/servicio-cambio.jpg",
  },
  {
    slot: "servicio-balanceo",
    Icon: Gauge,
    title: "Balanceo",
    subtitle: "Estabilidad y comportamiento en cada kilómetro.",
    text: "Un correcto balanceo ayuda a mantener el funcionamiento estable de la rueda y a reducir vibraciones, especialmente a velocidades de carretera.",
    defaultPhoto: "/images/neumaticos/servicio-balanceo.jpg",
  },
  {
    slot: "servicio-vulcanizado",
    Icon: RefreshCcw,
    title: "Vulcanizado",
    subtitle: "Reparar cuando es posible. Reemplazar cuando corresponde.",
    text: "Evaluamos daños y perforaciones para determinar si el neumático puede ser reparado mediante vulcanización, considerando siempre su ubicación, características y condiciones de seguridad.",
    defaultPhoto: "/images/neumaticos/servicio-vulcanizado.jpg",
  },
  {
    slot: "servicio-asesoria",
    Icon: ClipboardCheck,
    title: "Asesoría",
    subtitle: "El neumático adecuado depende de cómo usas tu moto.",
    text: "Te orientamos según tu motocicleta, tipo de conducción, uso en ciudad, carretera, viajes o caminos fuera de asfalto, para que puedas tomar una decisión informada.",
    defaultPhoto: "/images/neumaticos/servicio-asesoria.jpg",
  },
];

export const NEUMATICOS_USOS_TITLE = "No todos los neumáticos están pensados para el mismo camino.";

// El cliente todavía no entregó el detalle real de cada tipo de uso (lo va
// a pasar más adelante) — mientras tanto cada tarjeta abre el mismo popup
// que los servicios (ver NeumaticosUsos.jsx) con un texto honesto de
// "contenido en camino" en vez de inventar specs. Apenas llegue el texto
// real, se reemplaza `text` acá, en un solo lugar, sin tocar componentes.
const USO_TEXT_PENDIENTE =
  "Estamos preparando el detalle de neumáticos recomendados para este tipo de uso. Mientras tanto, escríbenos y te asesoramos según tu modelo.";

// `defaultPhoto`: foto de referencia mientras el cliente no suba la suya
// propia desde /administracion (ver NeumaticosUsos.jsx — una vez que
// exista una foto propia, esa siempre tiene prioridad). Fuentes:
//   - uso-calle: "Pirelli Diablo Rosso.jpg" (Wikimedia Commons)
//     © alex roberts, CC BY-SA 2.0 — commons.wikimedia.org/wiki/File:Pirelli_Diablo_Rosso.jpg
//   - uso-mixto: pexels.com/photo/motorcycle-on-dirt-road-in-summer-mountain-scenery-6346143
//     (licencia Pexels, uso comercial libre)
//   - uso-offroad: "Knobbytire.jpg" (Wikimedia Commons)
//     © Pale2hall, CC BY-SA 3.0 — commons.wikimedia.org/wiki/File:Knobbytire.jpg
export const NEUMATICOS_USOS = [
  {
    slot: "uso-calle",
    Icon: Route,
    title: "100% calle",
    subtitle: "Ciudad y carretera.",
    text: USO_TEXT_PENDIENTE,
    defaultPhoto: "/images/neumaticos/uso-calle.jpg",
  },
  {
    slot: "uso-mixto",
    Icon: Shuffle,
    title: "Mixtos",
    subtitle: "Asfalto y caminos de tierra o ripio.",
    text: USO_TEXT_PENDIENTE,
    defaultPhoto: "/images/neumaticos/uso-mixto.jpg",
  },
  {
    slot: "uso-offroad",
    Icon: Mountain,
    title: "Off road",
    subtitle: "Fuera de asfalto.",
    text: USO_TEXT_PENDIENTE,
    defaultPhoto: "/images/neumaticos/uso-offroad.jpg",
  },
];

export const NEUMATICOS_CTA = {
  title: "¿Listo para rodar?",
  subtitle: "Cuéntanos cómo usas tu moto y te ayudamos a encontrar la alternativa adecuada.",
  asesoriaMessage: "Hola GSmotos, quiero asesoría para elegir neumáticos para mi moto.",
};

// Lista plana de los 7 slots de imagen de la sección, con una etiqueta
// legible — la usa /administracion (pestaña "Neumáticos") para no repetir
// esta misma lista ahí. El hero ya no lleva imagen propia (ver
// NeumaticosHero.jsx), así que no hay slot para eso.
export const NEUMATICOS_PHOTO_SLOTS = [
  ...NEUMATICOS_SERVICIOS.map(({ slot, title, defaultPhoto }) => ({ slot, label: `Servicio — ${title}`, defaultPhoto })),
  ...NEUMATICOS_USOS.map(({ slot, title, defaultPhoto }) => ({ slot, label: `Tipo de uso — ${title}`, defaultPhoto })),
];
