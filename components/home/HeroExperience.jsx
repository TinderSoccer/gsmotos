"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import HeroBanner from "./HeroBanner";
import SelectorPanel from "./SelectorPanel";
import { menus } from "@/lib/servicesData";
import { useProductos } from "@/lib/catalogo";

const PER_PAGE = 4;

export default function HeroExperience() {
  const router = useRouter();
  const [sel, setSel] = useState(0);
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState("");
  const [prodPage, setProdPage] = useState(0);
  const autoRef = useRef(null);

  const menu = menus[sel];
  const isProductos = menu.kind === "catalog";
  const productos = useProductos();

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
  // categoría está activa.
  useEffect(() => {
    if (!isProductos) return undefined;
    autoRef.current = setInterval(() => setProdPage((p) => p + 1), 4500);
    return () => clearInterval(autoRef.current);
  }, [isProductos]);

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
    clearInterval(autoRef.current);
    setProdPage((p) => p + d);
  }

  return (
    <>
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
          setProdPage(0);
        }}
        visibleProducts={visibleProducts}
        prodPageLabel={`${page + 1} / ${pageCount}`}
        prodResultLabel={query.trim() ? `${catalogue.length} resultado${catalogue.length === 1 ? "" : "s"}` : ""}
        prodEmpty={catalogue.length === 0}
        onPrevProd={() => step(-1)}
        onNextProd={() => step(1)}
      />
    </>
  );
}
