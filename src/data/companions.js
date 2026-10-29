/**
 * Companion definitions.
 *
 * These are stable save-data IDs and initial balance values. Runtime behavior
 * will be wired through src/systems/companions.js in a later implementation
 * pass. Keep mechanics declarative here; do not add DOM or game-loop code.
 */
export const companions = [
  {
    id: 'solace',
    name: 'Solace',
    epithet: 'The Celestial Guardian',
    rarity: 'legendary',
    stars: 5,
    element: 'light',
    role: ['healing', 'protection'],
    color: '#ffd978',
    glyph: '✦',
    visual: 'Golden orb with three rotating luminous rings.',
    stats: {
      attack: 4,
      attackInterval: 2.0,
      followDistance: 48,
      targetingRange: 180
    },
    basicAttack: {
      id: 'radiant-pulse',
      name: 'Radiant Pulse',
      canDamageEnemies: false,
      interval: 2.0,
      healingMaxHpRatio: 0.025,
      healingAttackRatio: 1.2,
      overflowShieldCapMaxHpRatio: 0.35,
      description: "Periodically restores 2.5% of the main core's Max HP plus 120% of Solace's ATK. Excess healing becomes shield, capped at 35% of the main core's Max HP."
    },
    passive: {
      id: 'gentle-light',
      name: 'Gentle Light',
      incomingHealingMultiplier: 1.25,
      incomingDamageMultiplier: 0.75,
      description: "While deployed, increases the main core's incoming healing by 25% and reduces incoming damage by 25%."
    },
    signature: {
      id: 'sanctuary',
      name: 'Sanctuary',
      triggerHpRatio: 0.35,
      damageReductionRatio: 0.25,
      duration: 3,
      healingMaxHpRatio: 0.10,
      cooldown: 30,
      description: 'Automatically activates below 35% HP, reducing incoming damage by 25% and restoring 10% Max HP over 3 seconds. Cooldown: 30 seconds.'
    }
  },
  {
    id: 'ruin',
    name: 'Ruin',
    epithet: 'The Executioner',
    rarity: 'legendary',
    stars: 5,
    element: 'void',
    role: ['single-target-dps', 'offensive-support'],
    color: '#a884ff',
    glyph: '◈',
    visual: 'Dark violet orb with a fractured shell and a rotating red targeting ring.',
    stats: {
      attack: 8,
      attackInterval: 1.5,
      projectileCount: 2,
      projectileHoming: true,
      followDistance: 56,
      targetingRange: 200
    },
    basicAttack: {
      id: 'rupture',
      name: 'Rupture',
      projectileCount: 2,
      homing: true,
      targetPriority: ['lowest-hp-ratio', 'death-marked', 'nearest-valid-enemy-or-black-hole'],
      description: 'Fires two concentrated homing void projectiles at valid targets.'
    },
    passive: {
      id: 'death-mark',
      name: 'Death Mark',
      damageAmplificationRatio: 0.25,
      duration: 4,
      maxStacks: 1,
      reapplication: 'refresh-duration',
      affectsBosses: true,
      respectsGlobalDamageAmplificationCap: true,
      description: 'Enemies hit by Ruin take 25% increased damage for 4 seconds. Does not stack; reapplication refreshes duration. Must respect the global damage-amplification cap.'
    },
    signature: {
      id: 'final-judgment',
      name: 'Final Judgment',
      triggerHpRatio: 0.25,
      baseExecutionChance: 0.25,
      markedExecutionChance: 0.35,
      canExecuteBosses: false,
      canExecuteSingularityCores: false,
      fallbackDamage: 40,
      missingHpBonusRatio: 0.20,
      cooldown: 12,
      description: 'When attacking a target below 25% HP, has a 25% chance to execute it, increased to 35% if Death Mark is active. Bosses and singularity cores cannot be executed. Fallback damage: 40 plus 20% of missing HP, subject to damage limits.'
    }
  },
  {
    id: 'bastion',
    name: 'Bastion',
    epithet: 'The Unbreakable Wall',
    rarity: 'legendary',
    stars: 5,
    element: 'earth',
    role: ['defense', 'damage-mitigation', 'crowd-control'],
    color: '#f0ad58',
    glyph: '⬡',
    visual: 'Amber orb surrounded by three rotating stone-like armor plates.',
    stats: {
      attack: 4,
      attackInterval: 1.5,
      followDistance: 40,
      targetingRange: 120
    },
    basicAttack: {
      id: 'seismic-strike',
      name: 'Seismic Strike',
      damage: 4,
      interval: 1.5,
      radius: 90,
      knockbackStrength: 100,
      canDisplaceBosses: false,
      canDisplaceSingularityCores: false,
      description: 'Releases a short-range shockwave that deals damage and pushes ordinary enemies away from the main core. Bosses and singularity cores cannot be displaced.'
    },
    passive: {
      id: 'fortification',
      name: 'Fortification',
      defBonusRatio: 0.25,
      stacks: false,
      description: "Increases the main core's DEF by 25%. Does not stack with another copy of Bastion."
    },
    signature: {
      id: 'bulwark',
      name: 'Bulwark',
      triggerDamageMaxHpRatio: 0.15,
      barrierMaxHpRatio: 0.20,
      duration: 10,
      cooldown: 25,
      cannotRecursivelyTrigger: true,
      description: 'When a single hit deals at least 15% of the main core Max HP, creates a barrier with durability equal to 20% of Max HP for up to 10 seconds. Cooldown: 25 seconds. The barrier cannot trigger itself recursively.'
    }
  }
];

export const COMPANION_BY_ID = Object.freeze(
  Object.fromEntries(companions.map(companion => [companion.id, companion]))
);

export const COMPANION_IDS = Object.freeze(companions.map(companion => companion.id));
export const COMPANION_RARITY = 'legendary';
export const COMPANION_STAR_RATING = 5;
export const MAX_EQUIPPED_COMPANIONS = 1;
export const COMPANION_UNLOCK_WORLD_ID = 0; // World 1, using zero-based campaign IDs.
export const COMPANION_UNLOCK_ROOM = 10;
