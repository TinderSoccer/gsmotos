import Image from "next/image";

// El archivo real (logo-gsmotos.png) es un logo oscuro — se distingue bien
// sobre fondo claro, pero se pierde sobre los fondos oscuros donde vive en
// buena parte del sitio (hero, menú mobile, panel admin, login). El diseño
// original de Claude Design traía aparte una versión clara
// ("logo-gsmotos-claro.png") pensada justo para esos fondos, pero ese
// archivo nunca llegó a este repo — solo existe el oscuro.
//
// Mientras no exista el archivo real, `light` genera una versión blanca al
// vuelo con clases de filtro de Tailwind (brightness-0 invert: cada píxel
// visible pasa a negro y después a blanco, conservando la transparencia
// del PNG) — sin necesidad de un archivo nuevo:
//   - true (default): siempre blanco — para headers que son oscuros en
//     todos los tamaños (panel admin, login, menú mobile).
//   - "mobile": blanco solo bajo el breakpoint `sm`, vuelve al logo oscuro
//     original desde `sm` — para el hero de Home y de Christopher, donde
//     el recorte diagonal blanco que hay desde `sm` deja al logo sobre
//     fondo claro (el oscuro original SÍ se distingue ahí).
//   - false: nunca — logo oscuro tal cual, para fondos claros.
export default function Logo({
  width = 300,
  height = 200,
  className = "",
  light = true,
  priority = false,
  alt = "GSmotos — gsmotos.cl",
}) {
  const filterClass = light === "mobile" ? "brightness-0 invert sm:brightness-100 sm:invert-0" : light ? "brightness-0 invert" : "";

  return (
    <Image
      src="/images/logo-gsmotos.png"
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${filterClass}`.trim()}
      priority={priority}
    />
  );
}
