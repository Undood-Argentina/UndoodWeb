/* eslint-disable @typescript-eslint/no-require-imports -- script de Node (CommonJS), no código de la app */
/*
 * Pasa el Excel de puntos de recepción al CSV que carga load-puntos.sql.
 *
 * Uso:
 *   npm i --no-save xlsx
 *   node scripts/navidad/puntos-a-csv.cjs ../Puntos_Recepcion_Navidad_Undood-v2.xlsx
 *
 * Genera puntos_navidad.csv al lado del Excel. Columnas del Excel (desde la fila 3):
 *   Nombre | Dirección | Coordenadas | Google Maps | availability_time | Notas | STATUS
 */

const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const file = process.argv[2];
if (!file) {
  console.error("Uso: node scripts/navidad/puntos-a-csv.cjs <excel de puntos>");
  process.exit(1);
}

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

/** '{0:"8:00-20:00",5:"8:00-13:00"}' (claves sin comillas) -> {"0":"8:00-20:00","5":"8:00-13:00"} */
function parseAvailability(raw, nombre) {
  const text = clean(raw);
  if (!text) return {};
  const json = text.replace(/([{,]\s*)(\d)\s*:/g, '$1"$2":');
  const availability = JSON.parse(json);
  for (const day of Object.keys(availability)) {
    if (!/^[0-6]$/.test(day)) throw new Error(`${nombre}: día inválido "${day}" en availability_time`);
  }
  return availability;
}

function parseCoordinates(raw, nombre) {
  const [lat, lng] = clean(raw).split(",").map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error(`${nombre}: coordenadas inválidas "${raw}"`);
  return { latitud: lat, longitud: lng };
}

const workbook = XLSX.readFile(file);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });

const headerIndex = rows.findIndex((row) => clean(row[0]).toLowerCase() === "nombre");
if (headerIndex === -1) throw new Error('No encontré la fila de encabezados ("Nombre", "Dirección", ...)');

const puntos = rows.slice(headerIndex + 1).filter((row) => clean(row[0])).map((row) => {
  const [nombre, direccion, coordenadas, googleMaps, availabilityTime, notas, status] = row.map(clean);
  return {
    nombre,
    direccion,
    ...parseCoordinates(coordenadas, nombre),
    google_maps: googleMaps || null,
    availability_time: JSON.stringify(parseAvailability(availabilityTime, nombre)),
    notas: notas || null,
    status: status === "0" ? 0 : 1,
  };
});

const output = path.join(path.dirname(file), "puntos_navidad.csv");
fs.writeFileSync(output, XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(puntos)) + "\n");
console.log(`${puntos.length} puntos (${puntos.filter((p) => p.status === 1).length} visibles) -> ${output}`);
