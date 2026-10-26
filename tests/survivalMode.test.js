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

import {
  createSurvivalMapRuntime, getSurvivalCamera, isSurvivalPositionBlocked,
  screenToWorld, stepSurvivalMapRuntime, worldToScreen
} from '../src/systems/survivalMap.js';

test('semi-open map has world-space obstacles and bounded camera', () => {
  const config = createSurvivalTrialConfig({ world: worlds[0], coreId: 'ember' });
  const map = createSurvivalMapRuntime(config);
  assert.equal(map.width, 2600);
  assert.equal(map.height, 1800);
  assert.ok(map.obstacles.length >= 3);
  assert.ok(map.landmarks.length >= 2);
  assert.equal(isSurvivalPositionBlocked(map, -1, 50), true);
  assert.equal(isSurvivalPositionBlocked(map, map.obstacles[0].x, map.obstacles[0].y), true);
  const camera = getSurvivalCamera(map, 800, 600);
  assert.ok(camera.x >= 400 && camera.x <= map.width - 400);
  assert.ok(camera.y >= 300 && camera.y <= map.height - 300);
});

test('world and screen coordinate transforms round-trip', () => {
  const camera = { x: 1200, y: 800 };
  const point = { x: 1530, y: 960 };
  const screen = worldToScreen(point, camera, 1000, 700);
  const world = screenToWorld(screen, camera, 1000, 700);
  assert.ok(Math.abs(world.x - point.x) < 1e-9);
  assert.ok(Math.abs(world.y - point.y) < 1e-9);
});

test('prototype movement advances the player and clamps camera at map edges', () => {
  const config = createSurvivalTrialConfig({ world: worlds[0], coreId: 'frost' });
  const map = createSurvivalMapRuntime(config);
  const startX = map.player.x;
  stepSurvivalMapRuntime(map, { right: true, viewportWidth: 800, viewportHeight: 600 }, .05);
  assert.ok(map.player.x > startX);
  stepSurvivalMapRuntime(map, { left: true, viewportWidth: 800, viewportHeight: 600 }, 100);
  assert.ok(map.player.x >= map.player.radius);
  assert.ok(map.camera.x >= 400 && map.camera.x <= map.width - 400);
});
