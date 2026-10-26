/* Survival Trial foundation.
 * Configuration only: the dedicated semi-open-map simulation will consume this in a later milestone.
 */
export const SURVIVAL_TRIAL_DEFAULTS = Object.freeze({
  id: 'survival-trial',
  title: 'SURVIVAL TRIAL',
  durationSeconds: 20 * 60,
  map: Object.freeze({ width: 2600, height: 1800, margin: 96 }),
  camera: Object.freeze({ follow: true, clampToMap: true }),
  spawning: Object.freeze({
    initialEnemiesPerMinute: 24,
    maxConcurrentEnemies: 180,
    spawnRingInner: 420,
    spawnRingOuter: 620,
    eliteStartSeconds: 5 * 60,
    bossMilestonesSeconds: Object.freeze([5 * 60, 10 * 60, 20 * 60])
  }),
  difficulty: Object.freeze({
    hpGrowthPerMinute: 0.18,
    damageGrowthPerMinute: 0.08,
    spawnGrowthPerMinute: 0.12,
    maxSpawnMultiplier: 3.2
  })
});

export function createSurvivalTrialConfig({ world, coreId } = {}) {
  if (!world || !Number.isInteger(world.id)) throw new TypeError('A valid world is required.');
  if (typeof coreId !== 'string' || !coreId.trim()) throw new TypeError('A selected core ID is required.');
  return Object.freeze({
    ...SURVIVAL_TRIAL_DEFAULTS,
    world: Object.freeze({
      id: world.id, name: world.name, accent: world.accent,
      secondary: world.secondary, description: world.desc, boss: world.boss
    }),
    coreId,
    map: Object.freeze({ ...SURVIVAL_TRIAL_DEFAULTS.map }),
    camera: Object.freeze({ ...SURVIVAL_TRIAL_DEFAULTS.camera }),
    spawning: Object.freeze({ ...SURVIVAL_TRIAL_DEFAULTS.spawning }),
    difficulty: Object.freeze({ ...SURVIVAL_TRIAL_DEFAULTS.difficulty })
  });
}

/** Pure scaling helper for the future survival director; elapsed time is in seconds. */
export function getSurvivalDifficulty(config, elapsedSeconds = 0) {
  const elapsed = Math.max(0, Number(elapsedSeconds) || 0);
  const minutes = elapsed / 60;
  const growth = config?.difficulty || SURVIVAL_TRIAL_DEFAULTS.difficulty;
  return Object.freeze({
    hpMultiplier: 1 + minutes * growth.hpGrowthPerMinute,
    damageMultiplier: 1 + minutes * growth.damageGrowthPerMinute,
    spawnMultiplier: Math.min(growth.maxSpawnMultiplier, 1 + minutes * growth.spawnGrowthPerMinute),
    eliteEnabled: elapsed >= (config?.spawning?.eliteStartSeconds ?? 300),
    bossMilestone: (config?.spawning?.bossMilestonesSeconds || []).filter(t => elapsed >= t).length
  });
}
