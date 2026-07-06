/**
 * Histórico de deuda. Cada toma (4:00 y 16:00) guarda un snapshot de los totales
 * de la cartera en server/data/history.json. La gráfica de tendencia consume la
 * agregación diaria (último snapshot de cada día).
 */

const fs = require('fs');
const path = require('path');
const { getCachedData } = require('./cache');
const { computeMetrics } = require('./metrics');

const FILE = path.join(__dirname, '..', 'data', 'history.json');
const TZ = process.env.CRON_TZ || 'America/Santo_Domingo';

// ── Helpers de fecha en la zona horaria de captura ──────────────────────────
function ymdInTz(d = new Date(), tz = TZ) {
  // 'en-CA' => YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
function hourInTz(d = new Date(), tz = TZ) {
  return parseInt(new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', hour12: false }).format(d), 10) % 24;
}

// ── Persistencia ─────────────────────────────────────────────────────────────
function load() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return []; }
}
function persist(arr) {
  fs.writeFileSync(FILE, JSON.stringify(arr, null, 2));
}

// ── Snapshot ─────────────────────────────────────────────────────────────────
async function takeSnapshot(slot = 'manual') {
  const { clientes, llamadas, source } = await getCachedData(true); // datos frescos para el snapshot
  const m = computeMetrics(clientes, llamadas);
  const now = new Date();
  const date = ymdInTz(now);
  const snap = {
    date, slot, at: now.toISOString(),
    deudaTotal: m.deudaTotal,
    deudaVencida: m.deudaVencida,
    creditoOfrecido: m.creditoOfrecido,
    totalClientes: m.totalClientes,
    source,
  };

  const arr = load();
  // Un único snapshot por (día, slot) para AM/PM; los demás slots se apilan.
  const idx = (slot === 'AM' || slot === 'PM')
    ? arr.findIndex((s) => s.date === date && s.slot === slot)
    : -1;
  if (idx >= 0) arr[idx] = snap; else arr.push(snap);
  arr.sort((a, b) => (a.at < b.at ? -1 : 1));
  persist(arr);
  console.log(`[history] snapshot ${slot} ${date}: deudaTotal=${m.deudaTotal}`);
  return snap;
}

// ── Seed inicial: rellena ~30 días para que la gráfica tenga forma desde el
// primer arranque. Marcados `seeded:true`; se reemplazan por reales conforme
// entran las tomas. Solo corre si el archivo está vacío. ──────────────────────
async function ensureSeed(days = 30) {
  if (load().length) return;
  const { clientes, llamadas } = await getCachedData();
  const m = computeMetrics(clientes, llamadas);
  const now = new Date();
  const seed = [];
  for (let i = days; i >= 1; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    // Deriva suave hacia el valor real de hoy + pequeña ondulación determinística.
    const trend = 1 - i * 0.004;                 // ~12% más bajo hace 30 días
    const wobble = 1 + Math.sin(i / 3) * 0.012;  // ±1.2%
    const f = trend * wobble;
    seed.push({
      date: ymdInTz(d), slot: 'seed', at: d.toISOString(),
      deudaTotal: Math.round(m.deudaTotal * f),
      deudaVencida: Math.round(m.deudaVencida * (f - 0.01)),
      creditoOfrecido: m.creditoOfrecido,
      totalClientes: m.totalClientes,
      seeded: true,
    });
  }
  persist(seed);
  console.log(`[history] seed de ${days} días creado (estimado; se reemplaza con tomas reales).`);
}

// Al arrancar: si ya pasó una toma del día y no está registrada, captúrala.
async function catchUp() {
  const h = hourInTz();
  const date = ymdInTz();
  const has = (slot) => load().some((s) => s.date === date && s.slot === slot);
  if (h >= 4 && !has('AM')) await takeSnapshot('AM');
  if (h >= 16 && !has('PM')) await takeSnapshot('PM');
}

// ── Agregación diaria para la gráfica (último snapshot de cada día) ───────────
function getDailyHistory() {
  const byDate = new Map();
  for (const s of load()) {
    const cur = byDate.get(s.date);
    if (!cur || s.at > cur.at) byDate.set(s.date, s);
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}

function getRawHistory() { return load(); }

module.exports = { takeSnapshot, ensureSeed, catchUp, getDailyHistory, getRawHistory, TZ };
