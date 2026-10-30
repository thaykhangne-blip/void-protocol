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
      healingMaxHpRatio: 0.04,
      healingAttackRatio: 1.2,
      description: "Every 2 seconds, restores 4% of the main core's Max HP plus 120% of Solace's ATK."
    },
    passive: {
      id: 'gentle-light',
      name: 'Gentle Light',
      incomingHealingMultiplier: 1.25,
      incomingDamageMultiplier: 1,
      description: "Increases healing received by the main core by 25%."
    },
    signature: {
      id: 'sanctuary',
      name: 'Sanctuary',
      triggerHpRatio: 0.35,
      damageReductionRatio: 0,
      duration: 3,
      healingMaxHpRatio: 0.10,
      cooldown: 30,
      description: 'Below 35% HP, restores 10% Max HP over 3 seconds. Cooldown: 30 seconds.'
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
      targetingRange: 360
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
      description: 'Marked enemies take 25% more damage for 4 seconds. Reapplying Death Mark refreshes its duration.'
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
      targetingRange: 180
    },
    basicAttack: {
      id: 'seismic-strike',
      name: 'Seismic Strike',
      damage: 4,
      interval: 1.5,
      radius: 145,
      knockbackStrength: 100,
      canDisplaceBosses: false,
      canDisplaceSingularityCores: false,
      description: 'Releases a shockwave that damages and pushes nearby enemies away, stunning affected enemies for 1 second.'
    },
    passive: {
      id: 'fortification',
      name: 'Fortification',
      defBonusRatio: 0.45,
      stacks: false,
      description: "Increases the main core's DEF by 45%."
    },
    signature: {
      id: 'bulwark',
      name: 'Bulwark',
      triggerDamageMaxHpRatio: 0.15,
      barrierMaxHpRatio: 0.20,
      duration: 10,
      cooldown: 12,
      cannotRecursivelyTrigger: true,
      description: 'When a single hit deals at least 15% of the main core Max HP, creates a barrier with durability equal to 20% of Max HP for up to 10 seconds. Cooldown: 12 seconds. The barrier follows the main core and cannot trigger itself recursively.'
    }
  },
  {
    id: 'echo',
    name: 'ECHO',
    epithet: 'The Resonance Engine',
    rarity: 'legendary',
    stars: 5,
    element: 'sound',
    role: ['offensive-support', 'damage-amplification'],
    color: '#70e8f2',
    glyph: '◎',
    visual: 'A cyan sonic core surrounded by rotating resonance rings and pulsing sound-wave arcs.',
    stats: { attack: 7, attackInterval: 3.0, followDistance: 50, targetingRange: 220 },
    basicAttack: {
      id: 'sonic-pulse', name: 'Sonic Pulse', damage: 5, interval: 3.0, radius: 145,
      markDuration: 4, markDamageTakenRatio: 0.10,
      description: 'Every 3 seconds, releases a circular sonic pulse that damages nearby enemies and marks them for 4 seconds. Marked enemies take 10% increased damage from the Main Core.'
    },
    passive: {
      id: 'harmonic-feedback', name: 'Harmonic Feedback', attackThreshold: 10,
      burstDamageRatio: 2.0, burstRadius: 145,
      description: 'Every 10 Main Core attacks, triggers Harmonic Burst, dealing damage equal to 200% of the Main Core ATK to nearby enemies.'
    },
    signature: {
      id: 'perfect-resonance', name: 'Perfect Resonance', duration: 4, damageBonusRatio: 0.15,
      description: 'When Harmonic Burst activates, the Main Core deals 15% increased damage for 4 seconds. Activating it again refreshes the duration.'
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
