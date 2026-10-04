"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import HeroBanner from "./HeroBanner";
import SelectorPanel from "./SelectorPanel";
import { menus } from "@/lib/servicesData";
import { useProductos } from "@/lib/catalogo";
import { PLACEHOLDER_PHOTO } from "@/lib/productosData";

const PER_PAGE = 4;

export default function HeroExperience() {
  const router = useRouter();
  const [sel, setSel] = useState(0);
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState("");
  const [prodPage, setProdPage] = useState(0);
  const [prodDir, setProdDir] = useState("next");
  const autoRef = useRef(null);

  const menu = menus[sel];
  const isProductos = menu.kind === "catalog";
  const productos = useProductos();

  // "Neumáticos & Vulcanización" navega con router.push a mano (ver
  // handleSelect) en vez de un <Link> — un <Link> precarga la página solo
  // con que quede a la vista, pero router.push() programático no, así que
  // sin este prefetch explícito el clic disparaba la descarga de esa
  // página recién en ese momento, sintiéndose con retardo.
  useEffect(() => {
    router.prefetch("/servicios/neumaticos");
  }, [router]);

  // "Destacados de esta semana" (sin búsqueda activa) muestra solo productos
  // usados, en orden aleatorio — a diferencia de una búsqueda puntual, que
  // sí busca en todo el catálogo (nuevo y usado) sin importar la condición.
  // El shuffle se hace en un efecto (no al renderizar) para que el primer
  // render en el servidor y en el cliente coincidan y no haya parpadeo de
  // hidratación; el orden se vuelve a mezclar si el catálogo cambia.
  const [usadosDestacados, setUsadosDestacados] = useState([]);
  useEffect(() => {
    const list = productos.filter((p) => p.estado === "usado");
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    setUsadosDestacados(list);
  }, [productos]);

  const catalogue = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return usadosDestacados;
    return productos.filter((p) => `${p.name} ${p.cat} ${p.aplicacion || ""}`.toLowerCase().includes(q));
  }, [productos, usadosDestacados, query]);

  const pageCount = Math.max(1, Math.ceil(catalogue.length / PER_PAGE));
  const page = ((prodPage % pageCount) + pageCount) % pageCount;
  const visibleProducts = catalogue.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  // Avance automático del carrusel de productos cada 4.5s, solo mientras esa
  // categoría está activa. Usar las flechas no lo detiene: reinicia la
  // cuenta (`autoRestart`) para que no avance justo después de un clic.
  const [autoRestart, setAutoRestart] = useState(0);
  useEffect(() => {
    if (!isProductos) return undefined;
    autoRef.current = setInterval(() => {
      setProdDir("next");
      setProdPage((p) => p + 1);
    }, 4500);
    return () => clearInterval(autoRef.current);
  }, [isProductos, autoRestart]);

  // "Neumáticos & Vulcanización" ya no se muestra inline en la home (esas 4
  // tarjetas genéricas quedaron obsoletas): tiene su propia página a medida
  // en /servicios/neumaticos (ver app/servicios/neumaticos/page.jsx), así
  // que el tablero del hero navega directo ahí en vez de cambiar de panel.
  function handleSelect(i) {
    if (menus[i]?.slug === "neumaticos") {
      router.push("/servicios/neumaticos");
      return;
    }
    // El cambio de panel se salta si ya estaba esa opción seleccionada
    // (evita un re-render/animación de más), pero el scroll NO — si no,
    // tocar de nuevo la opción ya activa (típico si el usuario volvió a
    // scrollear arriba) no hacía nada hasta elegir una distinta.
    if (i !== sel) {
      setSel(i);
      setTick((t) => t + 1);
    }
    document.getElementById("servicios")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function step(d) {
    setAutoRestart((n) => n + 1);
    setProdDir(d > 0 ? "next" : "prev");
    setProdPage((p) => p + d);
  }

  // Precarga de "Destacados": mientras el visitante está en cualquier OTRA
  // pestaña, prodPage queda congelado en 0 (el auto-avance solo corre si
  // isProductos, ver arriba) — así que estas son siempre las fotos de la
  // primera página. Se piden con `priority` pero en un bloque invisible
  // (1x1px, fuera de pantalla) para que el navegador las tenga en caché
  // ANTES de que el usuario toque "Productos", sin ocupar espacio ni
  // duplicar nada visible.
  // El `sizes` tiene que ser EXACTAMENTE el mismo que usa ProductPhoto
  // (SelectorPanel.jsx): next/image elige qué variante de la imagen pedir
  // en base al string de `sizes`, no al tamaño real del elemento — con un
  // `sizes` distinto (o un `width`/`height` chico) se precarga una URL
  // distinta a la que la foto real termina pidiendo, y no sirve de nada.
  // También las de la página siguiente: el carrusel cambia el contenido
  // cuando las tarjetas ya se fueron y las nuevas entran con un fundido,
  // así que sus fotos tienen que estar listas de antes.
  const nextPage = (page + 1) % pageCount;
  const nextProducts = nextPage === page ? [] : catalogue.slice(nextPage * PER_PAGE, nextPage * PER_PAGE + PER_PAGE);
  const preloadPhotos = [...visibleProducts, ...nextProducts].filter(
    (p, i, all) => p.photo && p.photo !== PLACEHOLDER_PHOTO && all.findIndex((q) => q.slug === p.slug) === i
  );

  return (
    <>
      {preloadPhotos.length > 0 && (
        <div aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
          {preloadPhotos.map((p) => (
            <div key={p.slug} style={{ position: "relative", width: 1, height: 1 }}>
              <Image src={p.photo} alt="" fill sizes="(max-width: 639px) 46vw, 190px" priority />
            </div>
          ))}
        </div>
      )}
      <HeroBanner onSelect={handleSelect} />
      <SelectorPanel
        menuTitles={menus.map((m) => m.title)}
        sel={sel}
        onSelect={handleSelect}
        menuTitle={menu.title}
        menuHint={menu.hint}
        tick={tick}
        isProductos={isProductos}
        isBigTrail={menu.slug === "big-trail"}
        serviceCards={menu.cards}
        query={query}
        onQueryChange={(v) => {
          setQuery(v);
          setProdDir("next");
          setProdPage(0);
        }}
        visibleProducts={visibleProducts}
        prodPageLabel={`${page + 1} / ${pageCount}`}
        prodDir={prodDir}
        prodResultLabel={query.trim() ? `${catalogue.length} resultado${catalogue.length === 1 ? "" : "s"}` : ""}
        prodEmpty={catalogue.length === 0}
        onPrevProd={() => step(-1)}
        onNextProd={() => step(1)}
      />
    </>
  );
}
