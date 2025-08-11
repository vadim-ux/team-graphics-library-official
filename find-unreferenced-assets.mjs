// find-unreferenced-assets.mjs
import fs from "fs/promises";
import path from "path";

const ASSET_DIRS = [
  "diagrams",
  "ebees",
  "icons",
  "illustrations",
  "logos",
  "stickers",
  "templates",
];

const VALID_EXTS = new Set([".png", ".svg"]); // при желании добавь сюда ещё

const IGNORES = new Set([".DS_Store", "Thumbs.db"]);

const repoRoot = process.cwd();
const normalize = (p) => p.replace(/\\/g, "/");

async function readJSON(file) {
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw);
}

function extractAssetsArray(meta) {
  // Поддержка форматов:
  // 1) { assets: [...] }
  // 2) [...items]
  // 3) { items: [...] } – на всякий случай
  if (Array.isArray(meta)) return meta;
  if (meta && Array.isArray(meta.assets)) return meta.assets;
  if (meta && Array.isArray(meta.items)) return meta.items;
  throw new Error(
    "Не удалось понять формат metadata.json (ожидались assets[], items[] или массив верхнего уровня)."
  );
}

function collectReferencedPaths(assets) {
  const set = new Set();
  for (const a of assets) {
    if (a?.pngpath) set.add(normalize(a.pngpath));
    if (a?.svgpath) set.add(normalize(a.svgpath));
  }
  return set;
}

async function walkDir(dir, acc = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (IGNORES.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      await walkDir(full, acc);
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (VALID_EXTS.has(ext)) {
        // относительный путь от корня репо в формате с косой чертой
        const rel = normalize(path.relative(repoRoot, full));
        acc.push(rel);
      }
    }
  }
  return acc;
}

async function main() {
  const metaPath = path.join(repoRoot, "metadata.json");
  let meta;
  try {
    meta = await readJSON(metaPath);
  } catch (e) {
    console.error("Ошибка чтения metadata.json:", e.message);
    process.exit(1);
  }

  const assets = extractAssetsArray(meta);
  const referenced = collectReferencedPaths(assets);

  // собрать все физические файлы из нужных папок
  const present = [];
  for (const d of ASSET_DIRS) {
    const abs = path.join(repoRoot, d);
    try {
      const stat = await fs.stat(abs);
      if (!stat.isDirectory()) continue;
      await walkDir(abs, present);
    } catch {
      // папки может не быть — пропускаем
    }
  }

  const presentSet = new Set(present);

  // 1) Файлы, которых нет в metadata (кандидаты на удаление)
  const unreferenced = present.filter((p) => !referenced.has(p));

  // 2) Ссылки из metadata, которых нет в файловой системе (битые ссылки)
  const missing = [...referenced].filter((p) => !presentSet.has(p));

  // Вывод
  console.log("=== Кандидаты на удаление (есть в папках, но НЕ в metadata.json) ===");
  if (unreferenced.length === 0) {
    console.log("— нет");
  } else {
    unreferenced.sort().forEach((p) => console.log(p));
  }

  console.log("\n=== Битые ссылки в metadata.json (упомянуты, но файла нет) ===");
  if (missing.length === 0) {
    console.log("— нет");
  } else {
    missing.sort().forEach((p) => console.log(p));
  }

  // Дополнительно: короткая сводка
  console.log("\nИтого:");
  console.log(`  Всего файлов в папках: ${present.length}`);
  console.log(`  Упомянуто в metadata.json: ${referenced.size}`);
  console.log(`  К удалению (по списку выше): ${unreferenced.length}`);
  console.log(`  Битых ссылок: ${missing.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
