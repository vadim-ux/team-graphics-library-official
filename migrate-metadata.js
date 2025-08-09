// migrate-metadata.js (flex version)
const fs = require('fs');
const { URL } = require('url');

const DEFAULT_VISIBILITY = (process.argv.find(a => a.startsWith('--defaultVisibility=')) || '').split('=')[1] || 'public';

// ---- helpers to locate entries ----
function isEntryLike(v) {
  return v && typeof v === 'object' && !Array.isArray(v);
}
function arrayLooksLikeEntries(arr) {
  return Array.isArray(arr) && arr.length > 0 && isEntryLike(arr[0]);
}
function findEntriesArray(obj, depth = 0) {
  if (!obj || typeof obj !== 'object') return null;
  if (Array.isArray(obj)) return arrayLooksLikeEntries(obj) ? obj : null;

  // Common keys
  const candidateKeys = ['items','assets','entries','data','list','records','elements'];
  for (const k of candidateKeys) {
    if (arrayLooksLikeEntries(obj[k])) return obj[k];
  }
  // Any array property that looks like entries
  for (const [k, v] of Object.entries(obj)) {
    if (arrayLooksLikeEntries(v)) return v;
  }
  // Recurse into objects a bit
  if (depth < 3) {
    for (const [k, v] of Object.entries(obj)) {
      if (isEntryLike(v)) {
        const found = findEntriesArray(v, depth + 1);
        if (found) return found;
      }
    }
  }
  return null;
}

function objectValuesIfDictionary(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
  const vals = Object.values(obj);
  if (vals.length === 0) return [];
  if (vals.every(isEntryLike)) return vals;
  return null;
}

function toArrayish(root) {
  if (Array.isArray(root)) return root;
  const fromKnown = findEntriesArray(root);
  if (fromKnown) return fromKnown;

  const dictVals = objectValuesIfDictionary(root);
  if (dictVals) return dictVals;

  const topKeys = root && typeof root === 'object' ? Object.keys(root) : [];
  const hint = topKeys.length ? `Top-level keys: ${topKeys.slice(0,10).join(', ')}` : 'No top-level keys.';
  throw new Error('Unsupported metadata top-level structure. Expected array, known array key (items/assets/entries/...), or dictionary object. ' + hint);
}

// ---- URL parsing / migration ----
function extractPathFromRawGitHub(urlStr) {
  try {
    const u = new URL(urlStr);
    if (u.hostname !== 'raw.githubusercontent.com') return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 4) return null;
    return parts.slice(3).join('/');
  } catch { return null; }
}
function extractPathFromNetlify(urlStr) {
  try {
    const u = new URL(urlStr);
    const p = u.searchParams.get('path');
    return p || null;
  } catch { return null; }
}
function inferVisibility(entry, pngPath, svgPath) {
  if (entry.isPrivate === true) return 'private';
  if (entry.isPrivate === false) return 'public';
  const sources = [entry.url, entry.svgUrl].filter(Boolean).join(' ');
  if (/\.netlify\.app\/\.netlify\/functions\/get-image/i.test(sources)) return 'private';
  if (/raw\.githubusercontent\.com/i.test(sources)) return 'public';
  if (pngPath || svgPath) return DEFAULT_VISIBILITY;
  return DEFAULT_VISIBILITY;
}
function migrateEntry(entry) {
  const out = { ...entry };

  let pngpath = null;
  if (entry.url) pngpath = extractPathFromRawGitHub(entry.url) || extractPathFromNetlify(entry.url);

  let svgpath = null;
  if (entry.svgUrl) svgpath = extractPathFromRawGitHub(entry.svgUrl) || extractPathFromNetlify(entry.svgUrl);

  const visibility = inferVisibility(entry, pngpath, svgpath);

  if (pngpath) out.pngpath = pngpath;
  if (svgpath) out.svgpath = svgpath;
  out.visibility = visibility;

  delete out.url;
  delete out.svgUrl;
  delete out.isPrivate;

  return out;
}

function migrateAll(data) {
  const arr = toArrayish(data);
  return arr.map(migrateEntry);
}

function main() {
  const [,, inFile, outFile] = process.argv;
  if (!inFile || !outFile) {
    console.error('Usage: node migrate-metadata.js <input.json> <output.json> [--defaultVisibility=public|private]');
    process.exit(1);
  }
  const raw = fs.readFileSync(inFile, 'utf8');
  const json = JSON.parse(raw);

  const migrated = migrateAll(json);

  // Try to preserve top-level shape if it's a known pattern
  let outData;
  if (Array.isArray(json)) {
    outData = migrated;
  } else if (json && Array.isArray(json.items)) {
    outData = { ...json, items: migrated };
  } else if (json && typeof json === 'object') {
    // If it looked like a pure dictionary, write back as array (canonical)
    outData = migrated;
  } else {
    outData = migrated;
  }

  fs.writeFileSync(outFile, JSON.stringify(outData, null, 2), 'utf8');
  console.log(`✅ Migrated ${migrated.length} entries → ${outFile}`);
}

main();
