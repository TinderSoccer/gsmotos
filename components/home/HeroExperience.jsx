"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import HeroBanner from "./HeroBanner";
import SelectorPanel from "./SelectorPanel";
import { menus } from "@/lib/servicesData";
import { useProductos } from "@/lib/catalogo";

const PER_PAGE = 4;

export default function HeroExperience() {
  const [sel, setSel] = useState(0);
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState("");
  const [prodPage, setProdPage] = useState(0);
  const autoRef = useRef(null);

  const menu = menus[sel];
  const isProductos = menu.kind === "catalog";
  const productos = useProductos();

  const catalogue = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter((p) => `${p.name} ${p.cat}`.toLowerCase().includes(q));
  }, [productos, query]);

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

  function handleSelect(i) {
    if (i === sel) return;
    setSel(i);
    setTick((t) => t + 1);
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
