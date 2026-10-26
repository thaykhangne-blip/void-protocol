import test from 'node:test';
import assert from 'node:assert/strict';
import { worlds } from '../src/data/worlds.js';
import { createSurvivalTrialConfig, getSurvivalDifficulty, SURVIVAL_TRIAL_DEFAULTS } from '../src/systems/survivalMode.js';

test('creates a separate Survival Trial config for a selected world and core', () => {
  const config = createSurvivalTrialConfig({ world: worlds[0], coreId: 'ember' });
  assert.equal(config.id, 'survival-trial');
  assert.equal(config.world.name, worlds[0].name);
  assert.equal(config.coreId, 'ember');
  assert.equal(config.map.width, 2600);
  assert.equal(config.map.height, 1800);
  assert.equal(config.durationSeconds, 1200);
});

test('rejects missing world or core selection', () => {
  assert.throws(() => createSurvivalTrialConfig({ coreId: 'ember' }), /world/i);
  assert.throws(() => createSurvivalTrialConfig({ world: worlds[0] }), /core/i);
});

test('difficulty grows over time and activates elites and boss milestones', () => {
  const config = createSurvivalTrialConfig({ world: worlds[0], coreId: 'frost' });
  const early = getSurvivalDifficulty(config, 0);
  const late = getSurvivalDifficulty(config, 600);
  assert.equal(early.hpMultiplier, 1);
  assert.equal(early.eliteEnabled, false);
  assert.ok(late.hpMultiplier > early.hpMultiplier);
  assert.ok(late.damageMultiplier > early.damageMultiplier);
  assert.equal(late.eliteEnabled, true);
  assert.equal(late.bossMilestone, 2);
});

test('spawn pressure is capped by the configured maximum', () => {
  const config = createSurvivalTrialConfig({ world: worlds[0], coreId: 'flash' });
  const difficulty = getSurvivalDifficulty(config, 60 * 100);
  assert.equal(difficulty.spawnMultiplier, SURVIVAL_TRIAL_DEFAULTS.difficulty.maxSpawnMultiplier);
});
