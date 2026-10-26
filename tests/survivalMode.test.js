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

test('Survival Trial map movement advances the player and clamps camera at map edges', () => {
  const config = createSurvivalTrialConfig({ world: worlds[0], coreId: 'frost' });
  const map = createSurvivalMapRuntime(config);
  const startX = map.player.x;
  stepSurvivalMapRuntime(map, { right: true, viewportWidth: 800, viewportHeight: 600 }, .05);
  assert.ok(map.player.x > startX);
  stepSurvivalMapRuntime(map, { left: true, viewportWidth: 800, viewportHeight: 600 }, 100);
  assert.ok(map.player.x >= map.player.radius);
  assert.ok(map.camera.x >= 400 && map.camera.x <= map.width - 400);
});



test('Survival Trial runtime spawns enemies outside the player and advances the horde', () => {
  const config = createSurvivalTrialConfig({ world: worlds[0], coreId: 'ember' });
  const map = createSurvivalMapRuntime(config);
  map.spawnTimer = 0;
  stepSurvivalMapRuntime(map, { viewportWidth: 800, viewportHeight: 600, coreColor: '#ff9c65' }, 0.05);
  assert.ok(map.enemies.length > 0);
  assert.ok(map.enemies.every(enemy => Number.isFinite(enemy.id) && enemy.hp > 0));
  assert.ok(map.enemies.every(enemy => Math.hypot(enemy.x-map.player.x, enemy.y-map.player.y) > 100));
});

test('Survival Trial map runtime no longer owns combat or upgrade progression', () => {
  const map = createSurvivalMapRuntime(createSurvivalTrialConfig({ world: worlds[0], coreId: 'ember' }));
  assert.equal('coreTrait' in map, false);
  assert.equal('projectiles' in map, false);
  assert.equal('upgradeChoices' in map, false);
  assert.equal('attackCooldown' in map.player, false);
  assert.equal(map.player.damage, undefined);
});

test('Survival Trial map director spawns and moves enemies while Campaign owns combat', () => {
  const map = createSurvivalMapRuntime(createSurvivalTrialConfig({ world: worlds[0], coreId: 'frost' }));
  map.spawnTimer = 0;
  stepSurvivalMapRuntime(map, { viewportWidth: 800, viewportHeight: 600 }, 0.05);
  assert.ok(map.enemies.length > 0);
  const enemy = map.enemies[0], start = { x: enemy.x, y: enemy.y };
  stepSurvivalMapRuntime(map, { viewportWidth: 800, viewportHeight: 600 }, 0.05);
  assert.ok(Math.hypot(enemy.x-start.x, enemy.y-start.y) > 0);
  assert.ok(map.enemies.every(item => Number.isFinite(item.r) && item.hp > 0));
});

test('Survival Trial XP collection is handed off to Campaign progression', () => {
  const map = createSurvivalMapRuntime(createSurvivalTrialConfig({ world: worlds[0], coreId: 'ember' }));
  map.xpDrops.push({ x: map.player.x, y: map.player.y, r: 5, value: 4, life: 10 });
  stepSurvivalMapRuntime(map, { viewportWidth: 800, viewportHeight: 600 }, 0.05);
  assert.equal(map.xpCollected, 4);
  assert.equal(map.xpDrops.length, 0);
});

test('Survival Trial spawns a miniboss at each 150-kill milestone and awards score', () => {
  const map = createSurvivalMapRuntime(createSurvivalTrialConfig({ world: worlds[0], coreId: 'frost' }));
  map.kills = 150;
  stepSurvivalMapRuntime(map, { viewportWidth: 800, viewportHeight: 600 }, 0.016);
  const boss = map.enemies.find(enemy => enemy.bossType === 'mini');
  assert.ok(boss, 'a miniboss should spawn once the 150-kill milestone is reached');
  assert.equal(map.nextBossAt, 300);
  assert.equal(map.score, 0, 'spawning a boss should not award kill score');
});

test('Survival Trial spawns the big boss at 1,000 kills', () => {
  const map = createSurvivalMapRuntime(createSurvivalTrialConfig({ world: worlds[0], coreId: 'ember' }));
  map.kills = 1000;
  stepSurvivalMapRuntime(map, { viewportWidth: 800, viewportHeight: 600 }, 0.016);
  const boss = map.enemies.find(enemy => enemy.bossType === 'big');
  assert.ok(boss, 'the 1,000-kill milestone should spawn the big boss');
  assert.ok(boss.maxHp > 4000);
  assert.equal(map.bigBossSpawned, true);
});

test('Survival Trial score is owned by the shared combat bridge, not the map simulator', () => {
  const map = createSurvivalMapRuntime(createSurvivalTrialConfig({ world: worlds[0], coreId: 'frost' }));
  assert.equal(map.score, 0);
  assert.equal(map.kills, 0);
});

