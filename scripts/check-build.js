import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const run = spawnSync(process.execPath, ['scripts/build.js'], { encoding: 'utf8' });
if (run.status !== 0) {
  process.stderr.write(run.stderr || run.stdout);
  process.exit(run.status || 1);
}
const after = await readFile(new URL('../src/game.js', import.meta.url), 'utf8');
if (!after.includes("createNarrativeSystem") || !after.includes("function showMainMenu") || !after.includes("window.__voidLoaderReady")) {
  throw new Error('Generated game bundle is missing required runtime sections.');
}
console.log('Modular game bundle contains the runtime entry points.');
