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

export const NEUMATICOS_SERVICIOS_HINT = "Toca cada servicio para ver el detalle.";

// slot: identifica la imagen propia de cada tarjeta en lib/neumaticosPhotos.js.
export const NEUMATICOS_SERVICIOS = [
  {
    slot: "servicio-cambio",
    Icon: Wrench,
    title: "Cambio de neumático",
    subtitle: "Montaje especializado para tu motocicleta.",
    text: "Realizamos el desmontaje y montaje de neumáticos utilizando procedimientos y equipamiento adecuados para motocicletas, cuidando llantas, sensores y componentes asociados.",
  },
  {
    slot: "servicio-balanceo",
    Icon: Gauge,
    title: "Balanceo",
    subtitle: "Estabilidad y comportamiento en cada kilómetro.",
    text: "Un correcto balanceo ayuda a mantener el funcionamiento estable de la rueda y a reducir vibraciones, especialmente a velocidades de carretera.",
  },
  {
    slot: "servicio-vulcanizado",
    Icon: RefreshCcw,
    title: "Vulcanizado",
    subtitle: "Reparar cuando es posible. Reemplazar cuando corresponde.",
    text: "Evaluamos daños y perforaciones para determinar si el neumático puede ser reparado mediante vulcanización, considerando siempre su ubicación, características y condiciones de seguridad.",
  },
  {
    slot: "servicio-asesoria",
    Icon: ClipboardCheck,
    title: "Asesoría",
    subtitle: "El neumático adecuado depende de cómo usas tu moto.",
    text: "Te orientamos según tu motocicleta, tipo de conducción, uso en ciudad, carretera, viajes o caminos fuera de asfalto, para que puedas tomar una decisión informada.",
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

export const NEUMATICOS_USOS = [
  { slot: "uso-calle", Icon: Route, title: "100% calle", subtitle: "Ciudad y carretera.", text: USO_TEXT_PENDIENTE },
  { slot: "uso-mixto", Icon: Shuffle, title: "Mixtos", subtitle: "Asfalto y caminos de tierra o ripio.", text: USO_TEXT_PENDIENTE },
  { slot: "uso-offroad", Icon: Mountain, title: "Off road", subtitle: "Fuera de asfalto.", text: USO_TEXT_PENDIENTE },
];

export const NEUMATICOS_CTA = {
  title: "¿Listo para rodar?",
  subtitle: "Cuéntanos cómo usas tu moto y te ayudamos a encontrar la alternativa adecuada.",
  comprarMessage: "Hola GSmotos, quiero comprar neumáticos para mi moto.",
  asesoriaMessage: "Hola GSmotos, quiero asesoría para elegir neumáticos para mi moto.",
};

// Lista plana de los 8 slots de imagen de la sección, con una etiqueta
// legible — la usa /administracion (pestaña "Neumáticos") para no repetir
// esta misma lista ahí.
export const NEUMATICOS_PHOTO_SLOTS = [
  { slot: "hero", label: "Imagen principal (encabezado)" },
  ...NEUMATICOS_SERVICIOS.map(({ slot, title }) => ({ slot, label: `Servicio — ${title}` })),
  ...NEUMATICOS_USOS.map(({ slot, title }) => ({ slot, label: `Tipo de uso — ${title}` })),
];
