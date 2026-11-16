/* eslint-disable @typescript-eslint/no-require-imports -- script de Node (CommonJS), no código de la app */
/*
 * Unifica los Excel de cartas de Navidad (uno por hogar, cada uno con su propio formato)
 * en el formato de las tablas niño_navidad / regalo_navidad.
 *
 * Uso:
 *   npm i --no-save xlsx
 *   node scripts/navidad/unificar-cartas.cjs "../cartas navidad"
 *
 * Genera, dentro de esa carpeta:
 *   cartas_navidad_unificado.xlsx  hojas "niño_navidad" y "regalo_navidad" (mismas columnas que la DB)
 *   cartas_navidad.csv             una fila por regalo con los datos del chico/a (es lo que carga load-cartas.sql)
 *
 * Criterios (acordados):
 * - Nombre: tal cual, salvo Liniers (viene "Apellido, Nombres") -> "Nombre I." (primer nombre + inicial del apellido).
 *   Los nombres en MAYÚSCULAS (CeTAD) se pasan a "Nombre".
 * - Edad: entero. Si viene "13/14" o "7 meses" se guarda la menor (13 / 0) y el valor original va a observaciones.
 * - Talle: si el regalo dice "(talle X)", "talle X", "(calzado X)", etc. se saca del texto y va a la columna talle.
 *   Los talles que vienen aparte (Vivencia/Creciendo) se asignan al regalo que corresponde por palabra clave;
 *   si no se puede, van a observaciones.
 * - Links de referencia (CeTAD) -> link_ref, sin los parámetros de tracking.
 * - "Además le gusta...", dudas, etc. -> observaciones.
 */

const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const dir = process.argv[2];
if (!dir) {
  console.error('Uso: node scripts/navidad/unificar-cartas.cjs "<carpeta con los excels>"');
  process.exit(1);
}

// ---------- helpers de texto ----------

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const capitalize = (text) => (text ? text[0].toUpperCase() + text.slice(1) : text);
const titleCase = (text) => clean(text).toLowerCase().replace(/(^|\s)(\p{L})/gu, (_, space, letter) => space + letter.toUpperCase());

/** Divide por `separator` sólo fuera de paréntesis: "a (x; y); b" -> ["a (x; y)", "b"] */
function splitOutsideParens(text, separator) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const char of text) {
    if (char === "(") depth++;
    if (char === ")") depth--;
    if (char === separator && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.map(clean).filter(Boolean);
}

/** "13/14" -> { edad: 13, nota: "Edad indicada: 13/14" }; "7 meses" -> { edad: 0, ... }; "6" -> { edad: 6 } */
function parseAge(raw) {
  const text = clean(raw);
  if (/^\d+$/.test(text)) return { edad: Number(text), nota: null };
  if (/mes/i.test(text)) return { edad: 0, nota: `Edad indicada: ${text}` };
  const numbers = text.match(/\d+/g);
  if (numbers) return { edad: Math.min(...numbers.map(Number)), nota: `Edad indicada: ${text}` };
  throw new Error(`Edad inválida: "${raw}"`);
}

/**
 * Saca el talle del texto del regalo.
 * "Botines azules (talle 33)" -> { regalo: "Botines azules", talle: "33" }
 * Si hay más de un talle en el mismo regalo ("zapatillas (calzado 30) y ropa (talle 8)") no se toca.
 */
function extractSize(gift) {
  // "(remera talle 10, pantalón talle 14)" -> talle "remera 10, pantalón 14"
  const severalSizes = gift.match(/\s*\(((?:[\wáéíóú]+ talle [^,)]+,?\s*){2,})\)/i);
  if (severalSizes) {
    return { regalo: clean(gift.replace(severalSizes[0], "")), talle: clean(severalSizes[1].replace(/ talle /gi, " ")) };
  }

  const parenthesized = /\s*\((?:ropa |calzado |ambos )?(?:talle|calzado)(?: de remera)?\s+([^)]+)\)/gi;
  const matches = [...gift.matchAll(parenthesized)];
  if (matches.length === 1) {
    return { regalo: clean(gift.replace(matches[0][0], "")), talle: clean(matches[0][1]) };
  }
  if (matches.length > 1) return { regalo: gift, talle: null };

  // "Buzo talle M", "pijama de Pikachu talle L (adulto)", "rollers talle 37" (sólo fuera de paréntesis)
  const inline = gift.match(/\s+talle\s+([\w½/.-]+(?:\s+o\s+[\w½/.-]+)?)(\s*\(adulto\))?/i);
  if (inline && !isInsideParens(gift, inline.index)) {
    const talle = inline[1] + (inline[2] ? " adulto" : "");
    return { regalo: clean(gift.replace(inline[0], "")), talle };
  }
  // "botines n.º 37"
  const number = gift.match(/\s+n\.º\s*(\d+)/i);
  if (number) return { regalo: clean(gift.replace(number[0], "")), talle: number[1] };

  return { regalo: gift, talle: null };
}

function isInsideParens(text, index) {
  const before = text.slice(0, index);
  return (before.match(/\(/g) ?? []).length > (before.match(/\)/g) ?? []).length;
}

/** Saca los parámetros de tracking de los links de MercadoLibre. */
function cleanLink(url) {
  if (!url) return null;
  return url.replace(/&amp;/g, "&").split(/[?#]/)[0];
}

// ---------- modelo de salida ----------

const ninos = []; // { id, nombre, hogar, edad, observaciones }
const regalos = []; // { id, regalo, talle, link_ref, id_niño }

function addKid({ nombre, hogar, edad: rawAge, observaciones = [], gifts }) {
  const { edad, nota } = parseAge(rawAge);
  const notes = [nota, ...observaciones].filter(Boolean);
  const kid = { id: ninos.length + 1, nombre: clean(nombre), hogar, edad, observaciones: notes.join(" | ") || null };
  ninos.push(kid);
  for (const gift of gifts) {
    regalos.push({
      id: regalos.length + 1,
      regalo: capitalize(clean(gift.regalo)),
      talle: normalizeSize(gift.talle),
      link_ref: gift.link_ref ?? null,
      "id_niño": kid.id,
    });
  }
  return kid;
}

/** "s" -> "S" (talles de letra en mayúscula); el resto queda como vino. */
function normalizeSize(size) {
  const text = clean(size);
  if (!text) return null;
  return /^[a-z]{1,4}$/i.test(text) ? text.toUpperCase() : text;
}

const giftsFromText = (items) => items.map(extractSize);

function readRows(file, sheetName) {
  const workbook = XLSX.readFile(path.join(dir, file));
  const sheet = workbook.Sheets[sheetName ?? workbook.SheetNames[0]];
  if (!sheet) throw new Error(`No existe la hoja "${sheetName}" en ${file}`);
  return { sheet, rows: XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false }) };
}

// ---------- un parser por formato de Excel ----------

/** JUANITO: Nombre | Edad | "regalo; regalo; regalo" */
function parseJuanito() {
  const { rows } = readRows("JUANITO.xlsx");
  for (const [nombre, edad, pedido] of rows.slice(1)) {
    if (!clean(nombre)) continue;
    addKid({ nombre, hogar: "Juanito", edad, gifts: giftsFromText(splitOutsideParens(pedido, ";")) });
  }
}

/** LIGUEN Y MARCELINO: una hoja por hogar. N° | Nombre | Edad | "regalo, regalo, regalo" */
function parseLiguenYMarcelino() {
  for (const hogar of ["Marcelino", "Liguen"]) {
    const { rows } = readRows("LIGUEN Y MARCELINO.xlsx", hogar);
    for (const [, nombre, edad, pedido] of rows.slice(1)) {
      if (!clean(nombre)) continue;
      addKid({ nombre, hogar, edad, gifts: giftsFromText(splitOutsideParens(pedido, ",")) });
    }
  }
}

/** SOLES: Nombre | Edad | "1. regalo\n2. regalo\n3. regalo" */
function parseSoles() {
  const { rows } = readRows("SOLES.xlsx");
  for (const [nombre, edad, pedido] of rows.slice(1)) {
    if (!clean(nombre)) continue;
    const items = String(pedido).split("\n").map((line) => clean(line.replace(/^\s*\d+\.\s*/, ""))).filter(Boolean);
    addKid({ nombre, hogar: "Soles en el Camino", edad, gifts: giftsFromText(items) });
  }
}

/** Para Vivencia/Creciendo: a qué regalos aplica cada etiqueta de la columna "Talles". */
const SIZE_LABEL_MATCHERS = [
  [/^(calzado|zapas|zapatillas)$/i, /zapa|zapatilla|botin|crocs|calzado|ojota/i],
  [/^ropa$/i, /conjunto|remera|ropa|camiseta|buzo|pantal|short|jogging/i],
  [/^pijamas?$/i, /pijama/i],
  [/^disfraz$/i, /disfraz/i],
  [/^buzo$/i, /buzo/i],
  [/^botines$/i, /botin/i],
  [/^short$/i, /short/i],
  [/^remeras?$/i, /remer/i],
  [/^conjuntos?$/i, /conjunto/i],
  [/^patines$/i, /patin|roller/i],
  [/^campera$/i, /campera/i],
  [/^pantal[oó]n$/i, /pantal|short/i],
];

/**
 * Asigna "Calzado: 38½ / Ropa: 16" a los regalos que correspondan.
 * Devuelve el texto de los talles que no se pudieron asignar (para observaciones).
 */
function assignSizes(gifts, sizesText) {
  const unassigned = [];
  for (const part of clean(sizesText).split(/\s+\/\s+/).map(clean).filter(Boolean)) {
    const [label, value] = part.includes(":") ? part.split(":").map(clean) : [null, part];
    const matcher = label && SIZE_LABEL_MATCHERS.find(([labelPattern]) => labelPattern.test(label));
    const matchingGifts = matcher ? gifts.filter((gift) => matcher[1].test(gift.regalo)) : [];
    if (matchingGifts.length === 0) {
      unassigned.push(part);
      continue;
    }
    // Si el regalo ya traía el talle en el texto, se respeta ese.
    for (const gift of matchingGifts) if (!gift.talle) gift.talle = value;
  }
  return unassigned;
}

/** VIVENCIA Y CRECIENDO: Nombre | Edad | Hogar | "regalo; regalo" | "Calzado: X / Ropa: Y" | Observaciones */
function parseVivenciaYCreciendo() {
  const { rows } = readRows("VIVENCIA Y CRECIENDO.xlsx");
  for (const [nombre, edad, hogar, pedidoRaw, talles, observacion] of rows.slice(1)) {
    if (!clean(nombre)) continue;
    const notes = [];
    // A veces "Además le gusta..." viene pegado al final del pedido.
    let pedido = String(pedidoRaw);
    const extra = pedido.match(/\.\s*(Además le gusta:.*)$/);
    if (extra) {
      notes.push(clean(extra[1]));
      pedido = pedido.slice(0, extra.index);
    }
    const items = splitOutsideParens(pedido, ";").map((item) => item.replace(/^o\s+/, ""));
    const gifts = giftsFromText(items);
    const unassignedSizes = assignSizes(gifts, talles);
    if (unassignedSizes.length) notes.push(`Talles: ${unassignedSizes.join(" / ")}`);
    if (clean(observacion)) notes.push(clean(observacion).replace(/\.$/, ""));
    addKid({ nombre, hogar: clean(hogar), edad, observaciones: notes, gifts });
  }
}

/**
 * CETAD: el nombre aparece sólo en la primera fila de cada chico/a; cada fila es un regalo.
 * NOMBRE | EDAD | REGALO | TALLE. Algunos regalos tienen un link de referencia en la celda.
 */
function parseCetad() {
  const { sheet, rows } = readRows("cetad.xlsx");
  let current = null;
  rows.forEach((row, index) => {
    if (index < 2) return; // título + encabezados
    const [nombre, edad, regalo, talle] = row;
    if (clean(nombre)) {
      if (current) addKid(current);
      current = { nombre: titleCase(nombre), hogar: "CeTAD", edad, gifts: [] };
    }
    if (!clean(regalo) || !current) return;
    const cell = sheet[XLSX.utils.encode_cell({ r: index, c: 2 })];
    const link = cleanLink(cell?.l?.Target);
    const text = link ? clean(String(regalo).replace(/\((link refe en enlace|modelo de referencia)\)/i, "")) : clean(regalo);
    current.gifts.push({ regalo: text, talle: clean(talle) || null, link_ref: link });
  });
  if (current) addKid(current);
}

/**
 * LINIERS: "Apellido, Nombres" | Edad | Opción 1 | Opción 2 | Opción 3. El talle viene suelto en el texto
 * ("Conjunto de boca M", "Zapatillas 45"). Abajo de la tabla hay una lista suelta sin edades que no son chicos.
 */
function parseLiniers() {
  const { rows } = readRows("liniers.xlsx");
  for (const [fullName, edad, ...options] of rows) {
    if (!clean(fullName).includes(",") || !clean(edad)) continue; // encabezado y lista de abajo
    const [surnames, givenNames] = fullName.split(",").map(clean);
    const nombre = `${givenNames.split(" ")[0]} ${surnames[0].toUpperCase()}.`;
    const gifts = options.map(clean).filter(Boolean).map((option) => {
      const withSize = extractSize(option);
      if (withSize.talle) return withSize;
      const sizes = [...option.matchAll(/\s(XXXL|XXL|XL|L|M|S|\d{2})\b/g)];
      if (sizes.length === 0) return { regalo: option, talle: null };
      const last = sizes[sizes.length - 1];
      return { regalo: clean(option.slice(0, last.index) + option.slice(last.index + last[0].length)), talle: last[1] };
    });
    addKid({ nombre, hogar: "Liniers", edad, gifts });
  }
}

// ---------- main ----------

parseLiguenYMarcelino();
parseJuanito();
parseSoles();
parseVivenciaYCreciendo();
parseCetad();
parseLiniers();

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(ninos), "niño_navidad");
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(regalos), "regalo_navidad");
XLSX.writeFile(workbook, path.join(dir, "cartas_navidad_unificado.xlsx"));

const csvRows = regalos.map((gift) => {
  const kid = ninos[gift["id_niño"] - 1];
  return { "id_niño": kid.id, nombre: kid.nombre, hogar: kid.hogar, edad: kid.edad, observaciones: kid.observaciones, regalo: gift.regalo, talle: gift.talle, link_ref: gift.link_ref };
});
fs.writeFileSync(path.join(dir, "cartas_navidad.csv"), XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(csvRows)) + "\n");

const byHogar = ninos.reduce((acc, kid) => ({ ...acc, [kid.hogar]: (acc[kid.hogar] ?? 0) + 1 }), {});
console.log(`${ninos.length} chicos/as, ${regalos.length} regalos`, byHogar);
