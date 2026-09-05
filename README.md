# GSmotos — Sitio web

Proyecto Next.js + Tailwind CSS + Framer Motion para GSmotos, taller especializado en BMW Motorrad.

## Cómo correrlo en tu PC

1. Instala las dependencias:
   ```
   npm install
   ```
2. Levanta el servidor de desarrollo:
   ```
   npm run dev
   ```
3. Abre [http://localhost:3000](http://localhost:3000)

## Estructura

- `app/` — páginas (App Router de Next.js), organizadas por **tipo de
  contenido reutilizable**, no una página por cada ítem de menú:
  - `app/page.jsx` — Home (hero + selector interactivo de categorías).
  - `app/servicios/[categoria]/page.jsx` — listado de servicios de una
    categoría (`bmw-motorrad`, `neumaticos`, `big-trail`).
  - `app/servicios/[categoria]/[servicio]/page.jsx` — detalle de un
    servicio puntual dentro de esa categoría.
  - `app/productos/page.jsx` — catálogo con buscador y consulta de stock.
  - `app/nosotros/page.jsx` y `app/nosotros/christopher/page.jsx` — la
    empresa y su fundador.
  - `app/contacto/page.jsx` — datos de contacto + formulario de
    agendamiento (mock TallerGP).
- `components/` — componentes reutilizables (Hero, bloques de sección,
  footer). `components/home/` es específico de la Home; `components/services/`
  lo comparten las páginas de servicio/detalle.
- `lib/servicesData.js` — contenido de servicios y catálogo (portado del
  diseño de Claude Design), con slugs por categoría/tarjeta.
- `lib/tallergp.js` — cliente **mock** de la API de TallerGP (stock y
  agendamiento) — ver sección de abajo.
- `public/images/` — assets estáticos (logo, fotos).

## Estado actual / pendientes conocidos

- **Video del hero**: hoy usa un video de stock (`Big Buck Bunny`, de
  test-videos.co.uk) como placeholder visible. Reemplazar el `<source>` en
  `components/home/HeroBanner.jsx` por el material real del taller cuando
  esté disponible.
- **Tablero-menú**: ✅ resuelto — `components/home/SpeedometerDashboard.jsx`
  es un velocímetro 100% SVG/CSS (ya no depende de una imagen de referencia).
- **Íconos de la franja de atributos**: ✅ resuelto —
  `components/AttributeStrip.jsx` usa los 6 íconos SVG reales del diseño.
- **Fotos**: ✅ resuelto — `foto-taller-c.png` y `foto-traslado-b.png` son
  las fotos reales del proyecto de Design (esta última se trajo del `.zip`
  descargado del proyecto, ya que pesaba más de lo que el importador
  automático puede traer completo).
- **QR del footer**: sigue siendo un patrón visual, no un código QR
  funcional. Generar uno real apuntando al perfil de Google Business del
  negocio (`components/SiteFooter.jsx`).
- **Logo**: ✅ actualizado a `logo-gsmotos.png` (PNG con transparencia real
  del proyecto de Design, en vez del JPEG con fondo blanco que se usaba
  antes). Si consiguen el archivo `.ai` original, exportarlo a SVG para que
  se vea nítido a cualquier tamaño (especialmente el favicon).
- **Integración con TallerGP** (`https://developers.tallergp.com/`):
  mockeada en `lib/tallergp.js` — `checkStock`, `getAvailableSlots` y
  `createAppointment` simulan la API real con datos de ejemplo. El sitio
  **no tiene carrito ni pago online**, solo consulta de stock y
  agendamiento de horas. Cuando el cliente entregue las credenciales,
  reemplazar el cuerpo de esas 3 funciones por los `fetch` reales — las
  páginas que las consumen (`app/productos`, `app/contacto`) no deberían
  necesitar cambios.
- **Formulario de contacto**: ✅ implementado en `/contacto` (agendamiento
  mock); queda pendiente conectarlo a TallerGP real.
- **Navegación**: por pedido del cliente, el sitio no tiene un header/menú
  de navegación global (fiel al diseño de Claude Design, que tampoco lo
  trae). Se llega a `/productos`, `/nosotros` y `/contacto` desde enlaces
  dentro del contenido (tarjetas, CTAs) y la barra de categorías propia de
  la Home — no hay una barra fija en todas las páginas.

## Subir este proyecto a GitHub

Desde la carpeta del proyecto, en tu terminal:

```bash
git init
git add .
git commit -m "Setup inicial del proyecto GSmotos"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/gsmotos-web.git
git push -u origin main
```

(Antes de esto, crea el repositorio vacío en GitHub desde el botón "New repository" — sin agregar README ni .gitignore ahí, porque este proyecto ya los trae.)

Cuando el cliente confirme el correo/cuenta de GitHub de la empresa, este repo se puede transferir completo con la opción **Settings → Transfer ownership** desde GitHub, sin perder historial ni configuración.
