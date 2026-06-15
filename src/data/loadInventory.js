import Papa from "papaparse";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTNusOimFi3KAWHslPF5gIzrIkc-QQm_nTz9nSUZlF0o_GT74aA7fPUiu57CTQv-cpMmt9brRRItxJh/pub?output=csv";

// piso 2 → N1, piso 3 → N2, … piso 10 → N9
// N2 y N3 comparten plano N2_3
const FLOOR_IMG = {
  N1: "N1", N2: "N2_3", N3: "N2_3",
  N4: "N4", N5: "N5", N6: "N6",
  N7: "N7", N8: "N8", N9: "N9",
};

const parsePrice = (s) =>
  parseFloat(String(s).replace(/[^0-9,]/g, "").replace(",", ".")) || 0;

const parseM2 = (s) =>
  parseFloat(String(s).replace(",", ".").replace(/[^0-9.]/g, "")) || 0;

function buildInventory(rows) {
  const floors = {};
  for (const row of rows) {
    const piso = parseInt(row[2], 10);
    if (!piso || piso < 2 || piso > 10) continue;
    const floorKey = `N${piso - 1}`;
    if (!floors[floorKey]) floors[floorKey] = { piso, img: FLOOR_IMG[floorKey], units: [] };
    floors[floorKey].units.push({
      nom: String(row[5]).trim(),
      modelo: String(row[4]).trim(),
      rec: parseFloat(row[6]) || 0,
      ban: parseFloat(row[7]) || 0,
      m2: parseM2(row[8]),
      vendido: row[9] === "1" || String(row[9]).toUpperCase() === "TRUE",
      k: parsePrice(row[10]),
      l: parsePrice(row[11]),
      m: parsePrice(row[12]),
      n: parsePrice(row[13]),
    });
  }
  return floors;
}

export async function loadInventory() {
  const res = await fetch(`${CSV_URL}&_=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`CSV fetch failed: ${res.status}`);
  const text = await res.text();
  const { data } = Papa.parse(text, { skipEmptyLines: false });
  return buildInventory(data);
}
