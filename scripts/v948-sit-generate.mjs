/* v9.48 · Fotos realistas para las 62 situaciones faltantes (56 nuevas v9.47 + 6 DE históricas)
   Patrón v9.40/v9.41: SDK z-ai 1024×576 → sharp 1008×576 jpg q82 (proceso aparte).
   - Reanudable: salta los raw ya existentes
   - Concurrencia 3 + pacing 2.5 s
   - Backoff creciente en 429/5xx (15→30→60→90 s)
   - Escritura atómica (tmp + rename)
   - Segunda pasada con prompt sanitizado (primera cláusula) para fallos persistentes
   Uso: node scripts/v948-sit-generate.mjs [--only id1,id2] [--pass2]            */

import ZAI from "z-ai-web-dev-sdk";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "scripts/v948-sit-manifest.json");
const RAW_DIR = path.join(ROOT, "scripts/v948-raw");
const SIZE = "1024x576";
const CONCURRENCY = 3;
const PACING_MS = 2500;
const BACKOFF = [15_000, 30_000, 60_000, 90_000];

const SUFFIX = "No text, no words, no letters, no logos, no watermark; not an illustration, not a drawing, not a 3D render.";

const args = process.argv.slice(2);
const onlyFlag = args.find((a) => a.startsWith("--only"));
const only = onlyFlag ? onlyFlag.split("=")[1]?.split(",") : null;
const pass2 = args.includes("--pass2");

fs.mkdirSync(RAW_DIR, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

const sanitize = (p) => {
  const first = p.split(",")[0];
  return `${first}, realistic professional photography, natural light, 50mm lens, shallow depth of field, high quality. ${SUFFIX}`;
};

const pending = manifest.filter((m) => {
  const raw = path.join(RAW_DIR, `${m.id}.png`);
  if (fs.existsSync(raw) && fs.statSync(raw).size > 20_000) return false; // ya generado
  if (only && !only.includes(m.id)) return false;
  return true;
});

console.log(`[v948-generate] manifiesto ${manifest.length} · pendientes ${pending.length}${pass2 ? " · PASS2 (sanitizado)" : ""}`);
if (pending.length === 0) { console.log("Nada por generar. ✓"); process.exit(0); }

const zai = await ZAI.create();
let done = 0, failed = [];
const t0 = Date.now();
const log = (msg) => console.log(`[${Math.round((Date.now() - t0) / 1000)}s] ${msg}`);

async function generateOne(item) {
  const raw = path.join(RAW_DIR, `${item.id}.png`);
  const prompt = pass2 ? sanitize(item.prompt) : item.prompt;
  for (let attempt = 0; attempt <= BACKOFF.length; attempt++) {
    try {
      const res = await zai.images.generations.create({ prompt, size: SIZE });
      const b64 = res?.data?.[0]?.base64;
      if (!b64) throw new Error("respuesta sin base64");
      const buf = Buffer.from(b64, "base64");
      if (buf.length < 20_000) throw new Error(`base64 sospechosamente corto (${buf.length}B)`);
      const tmp = `${raw}.tmp`;
      fs.writeFileSync(tmp, buf);
      fs.renameSync(tmp, raw);
      done++;
      log(`✓ ${item.id} (${Math.round(buf.length / 1024)}KB) ${done}/${pending.length}`);
      return true;
    } catch (e) {
      const msg = String(e?.message || e);
      const retriable = /429|rate|limit|timeout|ECONN|fetch failed|5\d\d/i.test(msg);
      if (attempt < BACKOFF.length && retriable) {
        const wait = BACKOFF[attempt];
        log(`↻ ${item.id} intento ${attempt + 1} falló (${msg.slice(0, 80)}) → espera ${wait / 1000}s`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      failed.push(item.id);
      log(`✗ ${item.id} DEFINTIVO: ${msg.slice(0, 120)}`);
      return false;
    }
  }
}

/* cola con concurrencia + pacing */
let cursor = 0;
async function worker(wid) {
  while (cursor < pending.length) {
    const item = pending[cursor++];
    const ok = await generateOne(item);
    if (!ok && !pass2) {
      /* los fallos se reintentan en pass2 */
    }
    await new Promise((r) => setTimeout(r, PACING_MS));
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));

console.log(`\n[v948-generate] FIN: ${done} generadas, ${failed.length} fallidas de ${pending.length}`);
const rawCount = fs.readdirSync(RAW_DIR).filter((f) => f.endsWith(".png")).length;
console.log(`[v948-generate] raw totales en disco: ${rawCount}/${manifest.length}`);
if (failed.length) {
  console.log("FALLIDAS:", failed.join(","));
  if (!pass2) console.log("→ relanzar con: node scripts/v948-sit-generate.mjs --pass2");
}
