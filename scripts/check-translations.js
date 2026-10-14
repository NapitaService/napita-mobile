// Checks the app wording against napita-docs rules:
// 1. es-CO.json and en.json have the same keys (ignoring plural endings).
// 2. No words from the "never use" list in napita-docs/product/language-and-tone.md.
// Run with: npm run check:i18n
const es = require('../src/i18n/es-CO.json');
const en = require('../src/i18n/en.json');

const PLURAL = /_(zero|one|two|few|many|other)$/;
const BANNED = ['basura', 'rescatar', 'rescatado', 'rescatada', 'sobrante', 'sobras', 'barato', 'barata', 'tienda'];

function keys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`.replace(PLURAL, '')]
  );
}

const esKeys = new Set(keys(es));
const enKeys = new Set(keys(en));
const problems = [
  ...[...esKeys].filter((k) => !enKeys.has(k)).map((k) => `Missing in en.json: ${k}`),
  ...[...enKeys].filter((k) => !esKeys.has(k)).map((k) => `Missing in es-CO.json: ${k}`),
];

const text = JSON.stringify(es).toLowerCase();
for (const word of BANNED) {
  if (new RegExp(`\\b${word}`).test(text)) problems.push(`Banned word in es-CO.json: "${word}"`);
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`Translations OK: ${esKeys.size} keys, no banned words.`);
