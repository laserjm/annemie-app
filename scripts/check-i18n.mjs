import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const enPath = path.join(root, "lib/i18n/messages/en.ts");
const dePath = path.join(root, "lib/i18n/messages/de.ts");

const readKeys = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const keyMatches = [...content.matchAll(/^\s*"([^"]+)":\s*"/gm)];
  return new Set(keyMatches.map((match) => match[1]));
};

const missingFrom = (source, target) =>
  [...source].filter((key) => !target.has(key)).sort();

const enKeys = readKeys(enPath);
const deKeys = readKeys(dePath);

const missingInDe = missingFrom(enKeys, deKeys);
const missingInEn = missingFrom(deKeys, enKeys);

if (missingInDe.length === 0 && missingInEn.length === 0) {
  console.log(`i18n parity check passed (${enKeys.size} keys).`);
  process.exit(0);
}

if (missingInDe.length > 0) {
  console.error("Missing keys in de.ts:");
  for (const key of missingInDe) {
    console.error(`  - ${key}`);
  }
}

if (missingInEn.length > 0) {
  console.error("Missing keys in en.ts:");
  for (const key of missingInEn) {
    console.error(`  - ${key}`);
  }
}

process.exit(1);
