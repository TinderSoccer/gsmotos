"use client";

// Productos y neumáticos con Excel, desde /administracion → Productos.
//
// - Descargar: un .xlsx con dos hojas, "Productos" y "Neumáticos", con lo
//   que hoy está en la web. Las columnas se llaman igual que en el
//   inventario de Christopher (CODIGO, DESCRIPCIÓN, PRECIO VENTA,
//   CANTIDAD...), así también sirve subir ese inventario tal cual.
// - Subir: el Excel manda (pedido del cliente, nov 2026):
//     · lo que ya está en la web solo cambia su precio y su cantidad (el
//       nombre, el modelo, la categoría y la foto quedan como están);
//     · las filas nuevas se agregan;
//     · lo que no está en el Excel queda con stock 0.
//   Sin stock (cantidad 0) no se ve en la web, pero nunca se borra: sigue en
//   el panel con su foto y vuelve a verse en cuanto tiene stock otra vez
//   (en un Excel o editándolo en el panel). Ver lib/catalogo.js (enStock).
//   Además, antes de aplicar se guarda una copia para "Deshacer la última
//   carga" (app/api/admin/excel-backup).
//   Si el Excel no trae una de las dos hojas, esa parte no se toca. Antes
//   de aplicar, el panel muestra el resumen (planExcelImport) y pide
//   confirmación.
// Los productos se emparejan por código; sin código, por nombre. Los
// neumáticos (no tienen código), por nombre.
// Columnas internas del inventario (PROCEDENCIA, PRECIO USA, VALOR NETO,
// UBICACIÓN...) se ignoran: nunca llegan a la web.

import { slugify } from "./servicesData";
import { PLACEHOLDER_PHOTO } from "./productosData";
import { NEUMATICOS_USOS } from "./neumaticosContent";

// ── Lectura del .xlsx ─────────────────────────────────────────────────────
// Un .xlsx es un zip con XML adentro: se descomprime con fflate y se lee con
// DOMParser del navegador, sin depender de una librería grande.

function xmlDoc(files, path) {
  const bytes = files[path];
  if (!bytes) return null;
  return new DOMParser().parseFromString(new TextDecoder().decode(bytes), "application/xml");
}

function byTag(node, tag) {
  return Array.from(node.getElementsByTagNameNS("*", tag));
}

function colIndex(ref) {
  const letters = /^[A-Z]+/.exec(ref || "")?.[0] || "A";
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

// Devuelve [{ name, rows: string[][] }].
export async function readXlsx(file) {
  const { unzipSync } = await import("fflate");
  let files;
  try {
    files = unzipSync(new Uint8Array(await file.arrayBuffer()));
  } catch {
    throw new Error("Ese archivo no es un Excel (.xlsx). Si lo tienes en otro formato, ábrelo en Excel y guárdalo como .xlsx.");
  }
  const workbook = xmlDoc(files, "xl/workbook.xml");
  if (!workbook) throw new Error("Ese archivo no es un Excel (.xlsx).");

  const shared = (() => {
    const doc = xmlDoc(files, "xl/sharedStrings.xml");
    return doc ? byTag(doc, "si").map((si) => byTag(si, "t").map((t) => t.textContent).join("")) : [];
  })();

  const rels = {};
  const relsDoc = xmlDoc(files, "xl/_rels/workbook.xml.rels");
  if (relsDoc) {
    for (const rel of byTag(relsDoc, "Relationship")) {
      const target = rel.getAttribute("Target") || "";
      rels[rel.getAttribute("Id")] = target.startsWith("/") ? target.slice(1) : `xl/${target}`;
    }
  }

  return byTag(workbook, "sheet").map((sheet, i) => {
    const relId = Array.from(sheet.attributes).find((a) => a.localName === "id")?.value;
    const path = rels[relId] || `xl/worksheets/sheet${i + 1}.xml`;
    const doc = xmlDoc(files, path);
    const rows = [];
    if (doc) {
      for (const row of byTag(doc, "row")) {
        const cells = [];
        for (const c of byTag(row, "c")) {
          const type = c.getAttribute("t");
          let value = "";
          if (type === "inlineStr") value = byTag(c, "t").map((t) => t.textContent).join("");
          else {
            const v = byTag(c, "v")[0]?.textContent ?? "";
            value = type === "s" ? shared[Number(v)] ?? "" : v;
          }
          cells[colIndex(c.getAttribute("r"))] = String(value).trim();
        }
        rows.push(Array.from(cells, (v) => v ?? ""));
      }
    }
    return { name: sheet.getAttribute("name") || `Hoja ${i + 1}`, rows };
  });
}

// ── Interpretación ────────────────────────────────────────────────────────

function norm(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const codeKey = (codigo) => norm(codigo).replace(/[\s.-]+/g, "").toUpperCase();
const nameKey = (name) => norm(name);

// Nombres de columna aceptados (sin tildes ni mayúsculas). "precio" a secas
// solo si no hay "precio venta" — nunca "precio usa" ni "valor neto".
const HEADERS = {
  codigo: ["codigo", "cod", "codigo repuesto"],
  nombre: ["descripcion", "nombre", "producto", "neumatico", "neumaticos"],
  categoria: ["categoria"],
  aplicacion: ["aplicacion", "modelo", "modelos", "moto"],
  estado: ["estado"],
  precio: ["precio venta", "precio de venta", "precio"],
  cantidad: ["cantidad", "stock"],
  uso: ["uso", "tipo de uso", "tipo"],
};

function findHeader(rows) {
  for (let r = 0; r < Math.min(rows.length, 10); r++) {
    const cells = rows[r].map(norm);
    const col = {};
    for (const [field, names] of Object.entries(HEADERS)) {
      for (const name of names) {
        const i = cells.indexOf(name);
        if (i >= 0) {
          col[field] = i;
          break;
        }
      }
    }
    if (col.nombre !== undefined) return { row: r, col };
  }
  return null;
}

// "$850.000", "850000", "850.000,00" → 850000. Vacío → null (no se cambia).
function parseNumber(value) {
  const s = String(value ?? "").trim();
  if (!s) return null;
  if (/^-?\d+(\.\d+)?(e[+-]?\d+)?$/i.test(s)) return Math.max(0, Math.round(Number(s)));
  const digits = s.replace(/[,.]\d{1,2}$/, "").replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

function parseEstado(value) {
  return norm(value).startsWith("usad") ? "usado" : "nuevo";
}

function parseUso(value) {
  const v = norm(value).replace(/[\s-]/g, "");
  if (!v) return null;
  if (v.startsWith("mixt")) return "uso-mixto";
  if (v.startsWith("off")) return "uso-offroad";
  if (v.startsWith("on") || v.startsWith("calle") || v.startsWith("asfalto")) return "uso-calle";
  return null;
}

const usoTitle = (slot) => NEUMATICOS_USOS.find((u) => u.slot === slot)?.title || "";

function capitalize(text) {
  const t = String(text || "").trim();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}

function classifySheets(sheets) {
  let productos = null;
  let neumaticos = null;
  for (const sheet of sheets) {
    const header = findHeader(sheet.rows);
    if (!header) continue;
    const isTires = header.col.uso !== undefined || norm(sheet.name).startsWith("neumatico");
    if (isTires && !neumaticos) neumaticos = { sheet, header };
    else if (!isTires && !productos) productos = { sheet, header };
  }
  return { productos, neumaticos };
}

function cell(row, col, field) {
  return col[field] === undefined ? "" : row[col[field]] ?? "";
}

function planProductos({ sheet, header }, current) {
  const { col } = header;
  const byCode = new Map();
  const byName = new Map();
  current.forEach((p, i) => {
    if (p.codigo?.trim()) byCode.set(codeKey(p.codigo), i);
    else if (!byName.has(nameKey(p.name))) byName.set(nameKey(p.name), i);
  });

  const used = new Set();
  const seen = new Set();
  const updated = current.map((p) => ({ ...p }));
  const nuevos = [];
  const cambios = [];
  const problemas = [];
  const slugs = new Set(current.map((p) => p.slug));
  let sinCambios = 0;
  let filas = 0;

  sheet.rows.slice(header.row + 1).forEach((row, k) => {
    const nombre = cell(row, col, "nombre");
    const codigo = cell(row, col, "codigo");
    if (!nombre && !codigo) return; // fila vacía
    const fila = header.row + k + 2;
    if (!nombre) {
      problemas.push(`Fila ${fila}: tiene código (${codigo}) pero no tiene descripción. No se usó.`);
      return;
    }
    filas++;
    const key = codigo ? `c:${codeKey(codigo)}` : `n:${nameKey(nombre)}`;
    if (seen.has(key)) {
      problemas.push(`Fila ${fila}: "${nombre}" está repetido en el Excel. Se usó solo la primera vez.`);
      return;
    }
    seen.add(key);

    const precio = parseNumber(cell(row, col, "precio"));
    const cantidad = parseNumber(cell(row, col, "cantidad"));
    const i = codigo ? byCode.get(codeKey(codigo)) ?? (byName.has(nameKey(nombre)) ? byName.get(nameKey(nombre)) : undefined) : byName.get(nameKey(nombre));

    if (i !== undefined && !used.has(i)) {
      used.add(i);
      const p = updated[i];
      const cambio = { name: p.name, codigo: p.codigo };
      if (precio !== null && precio !== (p.price || 0)) cambio.precio = [p.price || 0, precio];
      if (cantidad !== null && cantidad !== (typeof p.stock === "number" ? p.stock : null)) cambio.cantidad = [p.stock ?? null, cantidad];
      if (cambio.precio || cambio.cantidad) {
        if (cambio.precio) p.price = precio;
        if (cambio.cantidad) p.stock = cantidad;
        cambios.push(cambio);
      } else sinCambios++;
      return;
    }

    let slug = slugify(`${nombre} ${codigo}`) || `producto-${Date.now()}`;
    for (let n = 2; slugs.has(slug); n++) slug = `${slugify(`${nombre} ${codigo}`)}-${n}`;
    slugs.add(slug);
    nuevos.push({
      cat: capitalize(cell(row, col, "categoria")) || "Otros",
      name: capitalize(nombre),
      photo: PLACEHOLDER_PHOTO,
      slug,
      price: precio ?? 0,
      ...(cantidad === null ? {} : { stock: cantidad }),
      aplicacion: cell(row, col, "aplicacion"),
      estado: parseEstado(cell(row, col, "estado")),
      codigo,
    });
  });

  const { ocultan, vuelven } = stockChanges(current, updated, used, (p) => ({ name: p.name, codigo: p.codigo }));
  return {
    filas,
    next: [...updated, ...nuevos],
    nuevos: nuevos.map((p) => ({ name: p.name, codigo: p.codigo, sinStock: p.stock === 0 })),
    cambios,
    vuelven,
    ocultan,
    sinCambios,
    problemas,
    renombres: posiblesRenombres(
      nuevos.filter((p) => !p.codigo).map((p) => p.name),
      ocultan.filter((p) => p.faltaEnExcel && !p.codigo).map((p) => p.name)
    ),
    muchos: ocultan.length > updated.filter((p) => p.stock !== 0).length + nuevos.length,
  };
}

// Lo que no vino en el Excel queda con stock 0. Devuelve lo que deja de verse
// en la web (tenía stock y queda en 0) y lo que vuelve (estaba en 0 y ahora
// tiene). `describe` arma la línea del resumen.
function stockChanges(before, after, used, describe) {
  const ocultan = [];
  const vuelven = [];
  after.forEach((item, i) => {
    delete item.oculto;
    const falta = !used.has(i);
    if (falta) item.stock = 0;
    const antes = before[i].stock !== 0;
    const ahora = item.stock !== 0;
    if (antes && !ahora) ocultan.push({ ...describe(item), faltaEnExcel: falta });
    if (!antes && ahora) vuelven.push(describe(item));
  });
  return { ocultan, vuelven };
}

// Un producto sin código (o un neumático) cuyo nombre se cambió en el Excel
// llega como "nuevo" y el antiguo queda sin stock. Se avisa cuando un nuevo se
// parece a uno que se oculta (la mitad o más de las palabras en común).
function posiblesRenombres(nuevos, ocultos) {
  const words = (t) => new Set(norm(t).split(/[^a-z0-9]+/).filter((w) => w.length > 1));
  const pairs = [];
  for (const nuevo of nuevos) {
    const a = words(nuevo);
    for (const viejo of ocultos) {
      const b = words(viejo);
      const common = [...a].filter((w) => b.has(w)).length;
      if (common && common / Math.max(a.size, b.size) >= 0.5) {
        pairs.push({ nuevo, viejo });
        break;
      }
    }
  }
  return pairs;
}

function planNeumaticos({ sheet, header }, currentStock) {
  const { col } = header;
  const current = NEUMATICOS_USOS.flatMap((u) => (currentStock[u.slot] || []).map((t) => ({ ...t, slot: u.slot })));
  const byName = new Map();
  current.forEach((t, i) => {
    if (t.title && !byName.has(nameKey(t.title))) byName.set(nameKey(t.title), i);
  });

  const updated = current.map((t) => ({ ...t }));
  const used = new Set();
  const seen = new Set();
  const nuevos = [];
  const cambios = [];
  const problemas = [];
  let sinCambios = 0;
  let filas = 0;

  sheet.rows.slice(header.row + 1).forEach((row, k) => {
    const nombre = cell(row, col, "nombre");
    if (!nombre) return;
    const fila = header.row + k + 2;
    filas++;
    if (seen.has(nameKey(nombre))) {
      problemas.push(`Neumáticos, fila ${fila}: "${nombre}" está repetido. Se usó solo la primera vez.`);
      return;
    }
    seen.add(nameKey(nombre));
    const precio = parseNumber(cell(row, col, "precio"));
    const cantidad = parseNumber(cell(row, col, "cantidad"));
    const i = byName.get(nameKey(nombre));

    if (i !== undefined) {
      used.add(i);
      const t = updated[i];
      const cambio = { name: t.title, uso: usoTitle(t.slot) };
      if (precio !== null && precio !== (t.price || 0)) cambio.precio = [t.price || 0, precio];
      if (cantidad !== null && cantidad !== (typeof t.stock === "number" ? t.stock : null)) cambio.cantidad = [t.stock ?? null, cantidad];
      if (cambio.precio || cambio.cantidad) {
        if (cambio.precio) t.price = precio;
        if (cambio.cantidad) t.stock = cantidad;
        cambios.push(cambio);
      } else sinCambios++;
      return;
    }

    const slot = parseUso(cell(row, col, "uso"));
    if (!slot) {
      problemas.push(`Neumáticos, fila ${fila}: "${nombre}" es nuevo pero no dice su uso (On road, Mixtos u Off road). No se agregó.`);
      return;
    }
    nuevos.push({ id: `neu-${Date.now()}-${k}`, photo: "", title: nombre, price: precio ?? 0, ...(cantidad === null ? {} : { stock: cantidad }), slot });
  });

  const { ocultan, vuelven } = stockChanges(current, updated, used, (t) => ({ name: t.title || "(sin nombre)", uso: usoTitle(t.slot) }));
  const next = {};
  for (const t of [...updated, ...nuevos]) {
    const { slot, ...item } = t;
    (next[slot] ||= []).push(item);
  }
  return {
    filas,
    next,
    nuevos: nuevos.map((t) => ({ name: t.title, uso: usoTitle(t.slot), sinStock: t.stock === 0 })),
    cambios,
    vuelven,
    ocultan,
    sinCambios,
    problemas,
    renombres: posiblesRenombres(nuevos.map((t) => t.title), ocultan.filter((t) => t.faltaEnExcel).map((t) => t.name)),
    muchos: ocultan.length > updated.filter((t) => t.stock !== 0).length + nuevos.length,
  };
}

// Compara el Excel con lo que hay hoy. No guarda nada.
export function planExcelImport(sheets, productos, neumaticosStock) {
  const found = classifySheets(sheets);
  if (!found.productos && !found.neumaticos) {
    throw new Error("No encontré productos en el Excel. La primera fila debe tener los títulos de las columnas, como DESCRIPCIÓN, PRECIO VENTA y CANTIDAD. Lo más fácil es descargar el Excel desde aquí, cambiarlo y subirlo.");
  }
  const plan = {
    productos: found.productos ? planProductos(found.productos, productos) : null,
    neumaticos: found.neumaticos ? planNeumaticos(found.neumaticos, neumaticosStock) : null,
  };
  // Un Excel con la hoja pero sin filas dejaría todo sin stock: se frena.
  if (plan.productos && plan.productos.filas === 0) throw new Error("La hoja de productos del Excel está vacía. No se cambió nada.");
  if (plan.neumaticos && plan.neumaticos.filas === 0 && Object.values(neumaticosStock).some((l) => l?.length)) {
    throw new Error("La hoja de neumáticos del Excel está vacía. No se cambió nada.");
  }
  return plan;
}

// ── Descarga ──────────────────────────────────────────────────────────────

export async function downloadCatalogoExcel(productos, neumaticosStock) {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  const head = (titles) => titles.map((value) => ({ value, fontWeight: "bold" }));
  const text = (value) => ({ value: value || "", type: String });
  const num = (value) => (typeof value === "number" ? { value, type: Number } : null);

  // Las filas sin stock (cantidad 0) van en rojo, igual que en el panel.
  const red = (row, stock) => (stock === 0 ? row.map((c) => c && { ...c, textColor: "#B0001F", backgroundColor: "#FDE3E8" }) : row);
  const productosData = [
    head(["CODIGO", "DESCRIPCIÓN", "CATEGORÍA", "APLICACIÓN", "ESTADO", "PRECIO VENTA", "CANTIDAD"]),
    ...productos.map((p) =>
      red([text(p.codigo), text(p.name), text(p.cat), text(p.aplicacion), text(p.estado || "nuevo"), num(p.price || 0), num(p.stock) || text("")], p.stock)
    ),
  ];
  const neumaticosData = [
    head(["DESCRIPCIÓN", "USO", "PRECIO VENTA", "CANTIDAD"]),
    ...NEUMATICOS_USOS.flatMap((u) =>
      (neumaticosStock[u.slot] || []).map((t) => red([text(t.title), text(u.title), num(t.price || 0), num(t.stock) || text("")], t.stock))
    ),
  ];

  const blob = await writeExcelFile([
    { data: productosData, sheet: "Productos", columns: [14, 44, 22, 26, 10, 14, 11].map((width) => ({ width })), stickyRowsCount: 1 },
    { data: neumaticosData, sheet: "Neumáticos", columns: [40, 12, 14, 11].map((width) => ({ width })), stickyRowsCount: 1 },
  ]).toBlob();

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Productos GSmotos ${new Date().toLocaleDateString("es-CL").replace(/\//g, "-")}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
