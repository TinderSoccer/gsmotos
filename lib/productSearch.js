// Búsqueda de productos (inicio, /productos y el panel). Antes se buscaba el
// texto escrito completo y seguido, así que "llanta r1200" no encontraba la
// "Llanta delantera negra" para "R1200/1250GS": el modelo va en otro campo.
// Ahora cada palabra se busca por separado (todas tienen que aparecer, en
// cualquier orden) en nombre, categoría, modelo y código, sin importar
// tildes ni mayúsculas. Los modelos se parten entre número y letra
// ("r1200gs" → "r1200" + "gs") y se comparan también sin espacios ni
// barras, así "R1200GS", "r1200 gs" y "R 1200 GS" encuentran lo mismo, y las
// listas abreviadas ("R1200/1250GS") cuentan como cada modelo.

function normalize(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function queryWords(query) {
  return normalize(query)
    .split(/[\s,;]+/)
    // Sin lookbehind en la expresión: los iPhone con iOS anterior a 16.4 no
    // lo entienden y dejaría de funcionar toda la página.
    .flatMap((word) => word.replace(/(\d)([a-z])/g, "$1 $2").split(" "))
    .filter(Boolean);
}

// Los modelos vienen abreviados en listas: "R1200/1250GS" son la R1200GS y
// la R1250GS, y "F650/700/800GS" la F650GS, F700GS y F800GS. Se agrega cada
// modelo completo al texto para que "r1250" o "f700gs" los encuentren.
function expandModels(text) {
  const extra = [];
  text.replace(/([a-z]+)(\d+)((?:\/\d+)+)([a-z]*)/g, (m, letters, first, rest, suffix) => {
    for (const num of [first, ...rest.split("/").filter(Boolean)]) extra.push(`${letters}${num}${suffix}`);
    return m;
  });
  return extra.length ? `${text} ${extra.join(" ")}` : text;
}

export function productMatches(product, words) {
  if (!words.length) return true;
  const text = expandModels(normalize(`${product.name} ${product.cat} ${product.aplicacion || ""} ${product.codigo || ""}`));
  const compact = text.replace(/[\s\-./]+/g, "");
  return words.every((w) => text.includes(w) || compact.includes(w));
}
