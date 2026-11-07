/* v9.48 · Post-proceso: raw 1024×576 → 1008×576 jpg q82 mozjpeg (attention-crop)
   en public/images/situazioni/<id>.jpg — mismo formato que las 39 históricas.
   Uso: node scripts/v948-sit-process.mjs            */

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, "scripts/v948-raw");
const OUT_DIR = path.join(ROOT, "public/images/situazioni");
const W = 1008, H = 576;

fs.mkdirSync(OUT_DIR, { recursive: true });
const raws = fs.readdirSync(RAW_DIR).filter((f) => f.endsWith(".png")).sort();
console.log(`[v948-process] ${raws.length} raws → ${W}x${H} jpg q82`);

let ok = 0; const bad = [];
for (const f of raws) {
  const id = f.replace(".png", "");
  const out = path.join(OUT_DIR, `${id}.jpg`);
  try {
    const tmp = `${out}.tmp`;
    await sharp(path.join(RAW_DIR, f))
      .resize(W, H, { fit: "cover", position: sharp.strategy.attention })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(tmp);
    const meta = await sharp(tmp).metadata();
    if (meta.width !== W || meta.height !== H || meta.format !== "jpeg") throw new Error(`metadata inesperada ${meta.width}x${meta.height} ${meta.format}`);
    fs.renameSync(tmp, out);
    ok++;
  } catch (e) {
    bad.push(`${id}: ${e.message}`);
  }
}
console.log(`[v948-process] OK ${ok}/${raws.length}`);
if (bad.length) { console.log("ERRORES:"); bad.forEach((b) => console.log(" ", b)); process.exit(1); }

/* resumen de tamaños */
const files = fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".jpg"));
const total = files.reduce((s, f) => s + fs.statSync(path.join(OUT_DIR, f)).size, 0);
console.log(`[v948-process] carpeta situazioni: ${files.length} archivos, ${(total / 1024 / 1024).toFixed(2)} MB`);
