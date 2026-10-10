# GSmotos web

Sitio de GSmotos, un taller especialista en BMW Motorrad en Santiago, Chile. El cliente es Christopher, el dueño, y no es técnico. Todo el texto del sitio y del panel va en español de Chile. Al usuario (el desarrollador) también se le responde en español.

## Stack y deploy

- Next.js 16 (App Router, Turbopack), React 19, Tailwind, lucide-react. Comandos: `npm run dev`, `npm run build`.
- Hosting en Vercel, proyecto `gsmotos` (equipo `tindersoccers-projects`). **Cada push a `main` despliega a producción** (https://gsmotos.vercel.app). Para ver el estado: `npx vercel@latest ls gsmotos --prod`.
- Variables de entorno: ver `.env.example`. `.env.local` se baja con `npx vercel@latest env pull`. La contraseña del panel en `.env.local` **no es la de producción**.

## Contenido editable (panel `/administracion`)

- El panel (`components/admin/AdminPanel.jsx`) guarda **en el servidor, no en localStorage**:
  - Fotos → Vercel Blob (`app/api/admin/upload`).
  - Datos → Upstash Redis (`app/api/admin/content`). Las claves permitidas están en `lib/contentKeys.js`.
- `app/layout.jsx` lee todo el contenido con `getAllContent()` (`lib/contentServer.js`, cacheado con el tag `content`) y lo entrega con `<ContentProvider>`. Los hooks de `lib/*.js` (`useProductos`, `useSettings`, `useTallerItems`, `useGruasPhotos`, `useLogo`...) leen de `lib/contentStore.js`. Para agregar contenido editable nuevo: sumar la clave a `contentKeys.js` y crear su `lib/<algo>.js` con el mismo patrón.
- Las fotos de Blob pasan por `next/image`, que funciona porque el host está autorizado en `next.config.js` (`remotePatterns`).
- **Los previews de Vercel comparten Redis y Blob con producción** y no tienen las variables `ADMIN_*`. No sirven para probar el panel, y editar ahí cambia el sitio real.

## Preferencias del cliente (importante)

- En el panel **todo se guarda solo**: nada de botones "Guardar" ni avisos de "publicar". Usar lenguaje simple, sin rutas ni términos técnicos, y pedir confirmación antes de borrar o restaurar.
- En el panel, cada foto se muestra **igual que en la web** y se cambia tocándola.
- Hay dos logos distintos: claro para fondos oscuros (`logo`) y oscuro para fondos claros (`logoOnLight`).
- En mobile no hay menú hamburguesa: el menú es el tablero del hero (`TableroFoto`) y las páginas internas tienen "← Inicio".

## Forma de trabajar

- Para cambios visuales: trabajar en una **rama aparte**, mostrar capturas (Playwright, mobile 390px + desktop 1280px) y publicar recién cuando el usuario aprueba. Así siempre se puede volver atrás. Cada cambio va en su propio commit, fácil de revertir.
- Para probar el panel sin tocar datos reales: levantar un Redis falso local que imite la API REST de Upstash (`MGET`/`SET`/`DEL`), compilar con `KV_REST_API_URL` apuntando a él y **borrar `.next/cache/fetch-cache`** antes de compilar. Si no, se cuelan datos cacheados de producción.
- Después de publicar, verificar que el deploy quede `Ready` y probar en el sitio real.

## Medios

- Hero: timelapse `public/videos/hero-timelapse.mp4` (desktop, con marca de agua) y `hero-timelapse-movil.mp4` (sin marca de agua), más el poster `public/images/hero-timelapse-poster.jpg`.
- Material original del cliente (fuera del repo): `~/Desktop/gsmotos/MP_ROOT/100ANV01/*.MP4`, de 1440×1080. **MAH07004** y el final de **MAH07003** están borrosos, no usarlos. También están ahí los escaneos de los certificados y el inventario de productos.
