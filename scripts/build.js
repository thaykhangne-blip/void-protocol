import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFile(resolve(root, path), 'utf8');

const bootstrapPath = 'src/game-bootstrap.js';
const outputPath = 'src/game.js';
const placeholder = '// The module fragments below are concatenated here by the build script.';
const bootstrap = await read(bootstrapPath);
const placeholderIndex = bootstrap.indexOf(placeholder);

if (placeholderIndex < 0) {
  throw new Error(`Build placeholder not found in ${bootstrapPath}. Restore the bootstrap marker before building.`);
}

const prefix = bootstrap.slice(0, placeholderIndex).trimEnd();
const runtimePrelude = `let roomDialogueShown=new Set();const milestoneDeliveriesPresented=new Set();`;
const fragments = [
  'src/systems/combat.js',
  'src/systems/campaign.js',
  'src/systems/progression.js',
  'src/ui/menus.js',
  'src/systems/runtime.js',
];

const sections = await Promise.all(fragments.map(read));
await writeFile(resolve(root, outputPath), output, 'utf8');
console.log(`Built ${outputPath} from ${bootstrapPath} and ${fragments.length} source fragments.`);
