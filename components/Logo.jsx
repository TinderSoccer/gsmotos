import Image from "next/image";

// El archivo original (logo-gsmotos.png) es un logo oscuro con sombra
// proyectada dibujada dentro del propio PNG — se distingue bien sobre
// fondo claro, pero se pierde sobre los fondos oscuros donde vive en buena
// parte del sitio (hero, menú mobile, panel admin, login).
//
// logo-gsmotos-claro.png es la versión clara para esos fondos: se generó
// aplicando un umbral al canal alfa del original en vez de invertir los
// colores con un filtro CSS — invertir convertía la sombra semitransparente
// en un "fantasma" blanco desplazado, como si el logo estuviera duplicado/
// sobrepuesto. El PNG claro no tiene ese problema porque la sombra (de
// opacidad intermedia) queda descartada junto con el resto del fondo
// transparente, dejando solo el trazo sólido en blanco.
export default function Logo({
  width = 300,
  height = 200,
  className = "",
  light = true,
  priority = false,
  alt = "GSmotos — gsmotos.cl",
}) {
  // "mobile": claro bajo el breakpoint `sm`, oscuro desde `sm` — para el
  // hero de Home y de Christopher, donde el recorte diagonal blanco deja
  // al logo sobre fondo claro desde tablet/desktop (ahí el oscuro se
  // distingue bien). Dos <Image> optimizadas por separado, alternadas por
  // CSS, en vez de un solo <picture> que forzaría a servir el PNG original
  // sin optimizar en desktop.
  if (light === "mobile") {
    return (
      <>
        <Image src="/images/logo-gsmotos-claro.png" alt={alt} width={width} height={height} className={`${className} sm:hidden`} priority={priority} />
        <Image src="/images/logo-gsmotos.png" alt={alt} width={width} height={height} className={`${className} hidden sm:block`} priority={priority} />
      </>
    );
  }

  return (
    <Image
      src={light ? "/images/logo-gsmotos-claro.png" : "/images/logo-gsmotos.png"}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
