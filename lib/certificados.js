// Certificados y trayectoria de Christopher, portados desde el diseño de
// Claude Design "Christopher Fundador.dc.html" (bloque <script data-dc-script>).
// Datos puros (se usan también desde app/nosotros/christopher/page.jsx, un
// Server Component) — la lógica de fotos con localStorage vive aparte, en
// lib/useCertPhotos.js, para no forzar este módulo al boundary de cliente.
export const CERT_STORE_KEY = "gsmotos-admin-certificados";

export const CERTIFICADOS = [
  { slot: "cert-1", year: "Titulación", org: "Duoc UC", title: "Técnico en Mecánica Automotriz", desc: "Formación técnica base en mecánica, sistemas y diagnóstico." },
  { slot: "cert-2", year: "5 años", org: "BMW Chile", title: "Especialización BMW Motorrad", desc: "Procedimientos, herramientas especiales y estándares de la marca." },
  { slot: "cert-3", year: "Internacional", org: "BMW Group", title: "Diagnóstico y programación BMW", desc: "Formación en diagnóstico electrónico y codificación de módulos." },
  { slot: "cert-4", year: "7 años", org: "Duoc UC", title: "Docente Mecánica de Motocicletas", desc: "Formando técnicos especializados en motocicletas." },
  { slot: "cert-5", year: "2024", org: "Especialización", title: "Inmovilizadores y sistemas keyless", desc: "Procedimientos especializados de cerrajería y seguridad electrónica." },
  { slot: "cert-6", year: "2025", org: "Certificación", title: "Soldador calificado", desc: "Certificación vigente para trabajos de soldadura estructural." },
];

// Hitos de la tarjeta "Trayectoria". `color` sigue el criterio del diseño
// original: azul de marca salvo el hito de fundación, en rojo.
export const TRAYECTORIA = [
  { value: "25+", label: "años", color: "#1B5FAE", text: "Más de dos décadas de oficio: la mecánica empezó mucho antes de convertirse en profesión." },
  { value: "Duoc", label: "UC", color: "#1B5FAE", text: "Titulación como Técnico en Mecánica Automotriz." },
  { value: "5", label: "años", color: "#1B5FAE", text: "Especialización dentro de BMW Chile, más formación internacional en diagnóstico y programación BMW." },
  { value: "2011", label: "", color: "#E7002A", text: "Funda GSmotos, taller especializado en BMW Motorrad y grandes viajeras." },
  { value: "7", label: "años", color: "#1B5FAE", text: "Docente de Mecánica de Motocicletas en Duoc UC, sin dejar nunca el taller." },
  { value: "2024", label: "", color: "#1B5FAE", text: "Especialización en inmovilizadores y sistemas keyless." },
  { value: "2025", label: "", color: "#1B5FAE", text: "Certificación como soldador calificado." },
];
