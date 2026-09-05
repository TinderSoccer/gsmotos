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

- `app/` — páginas (App Router de Next.js)
- `components/` — componentes reutilizables (Hero, DashboardNav, bloques de sección, footer)
- `public/images/` — assets estáticos (logo, tablero de referencia)

## Estado actual / pendientes conocidos

- **Video del hero**: hoy es un fondo degradado placeholder. Reemplazar el `<div>` de fondo en `components/Hero.jsx` por un `<video autoPlay muted loop playsInline>` cuando exista el material real del taller.
- **Tablero-menú (`DashboardNav.jsx`)**: usa la imagen de referencia (generada por IA, recortada del mockup del cliente) con texto real superpuesto. Es un prototipo funcional válido para mostrar al cliente, pero **lo ideal a futuro es reconstruirlo como SVG/CSS nativo** para que escale nítido en cualquier tamaño de pantalla (la imagen actual tiene resolución limitada).
- **Fotos placeholder**: los bloques "¿Por qué elegir GSmotos?" y "Nosotros vamos por ella" tienen recuadros con degradado en vez de fotos reales — reemplazar cuando el cliente entregue el material.
- **Íconos de la franja de atributos**: son círculos placeholder — falta reemplazar por íconos reales (SVG) para cada atributo.
- **QR del footer**: es un patrón visual, no un código QR funcional. Generar uno real apuntando al perfil de Google Business del negocio.
- **Logo**: se está usando el JPEG entregado por el cliente. Si consiguen el archivo `.ai` original, exportarlo a SVG y reemplazar en `public/images/` para que se vea nítido a cualquier tamaño (especialmente el favicon).
- **Integración con TallerGP**: pendiente (consulta de stock y agendamiento) — requiere credenciales de API del cliente.
- **Formulario de contacto**: aún no implementado.

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
