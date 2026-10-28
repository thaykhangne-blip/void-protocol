/* Void Weapon definitions. IDs are stable save-data keys; signatureCoreId must match src/data/cores.js IDs. */
export const voidWeapons = [
  {
    id: 'cinder-oath',
    name: 'Cinder Oath',
    category: 'signature',
    signatureCoreId: 'ember',
    rarity: 'legendary',
    color: '#ff9c65',
    glyph: '♨',
    description: 'EMBER · CINDERS AND CRITICALS',
    stats: { atkFlat: 1, hpPct: 0.13, armorPct: 0.12 },
    passive: {
      name: 'Cinder Oath',
      effectId: 'cinder-oath',
      statKey: 'critChance',
      values: [0.12, 0.14, 0.16, 0.18, 0.20],
      description: 'Crit Chance: +12% / 14% / 16% / 18% / 20%. Ashen Verdict: Burning enemies take 25% / 30% / 35% / 40% / 45% more damage. Infernal Barrage: Auto-attacks spawn 1 / 1 / 2 / 2 / 2 additional smaller homing fireballs. Each fireball damages nearby enemies and applies Burn. Fireballs inherit player damage bonuses but cannot spawn more fireballs.'
    }
  },
  {
    id: 'stillpoint',
    name: 'Stillpoint',
    category: 'signature',
    signatureCoreId: 'frost',
    rarity: 'legendary',
    color: '#8cecff',
    glyph: '❄',
    description: 'FROST · FREEZE AND SHATTER',
    stats: { atkFlat: 1.1, hpPct: 0.14, armorPct: 0.13 },
    passive: {
      name: 'Stillpoint',
      effectId: 'stillpoint',
      statKey: 'critChance',
      values: [0.08, 0.10, 0.12, 0.14, 0.16],
      description: 'Crit Chance: +8% / 10% / 12% / 14% / 16%. Absolute Zero: Frozen enemies take 25% / 30% / 35% / 40% / 45% more damage. Glacial Shatter: Auto-attacking a frozen enemy triggers an explosion for 100% / 125% / 150% / 175% / 200% ATK as bonus damage, damaging nearby enemies and applying 1 / 1 / 2 / 2 / 3 Chill stacks.'
    }
  },
  {
    id: 'thunderclap-protocol',
    name: 'Thunderclap Protocol',
    category: 'signature',
    signatureCoreId: 'flash',
    rarity: 'legendary',
    color: '#ffe875',
    glyph: 'ϟ',
    description: 'FLASH · CHAIN LIGHTNING',
    stats: { atkFlat: 1.2, hpPct: 0.15, armorPct: 0.1 },
    passive: {
      name: 'Thunderclap Protocol',
      effectId: 'thunderclap-protocol',
      statKey: 'fireRate',
      values: [0.12, 0.14, 0.16, 0.18, 0.20],
      description: 'Attack Speed: +12% / 14% / 16% / 18% / 20%. Cascade Failure: Each successive chain-lightning jump increases that jump’s damage by 20% / 25% / 30% / 35% / 40%, stacking up to three times. Overload Circuit: Every 6 / 5 / 4 / 3 / 3 auto-attacks, the next hit triggers a surge dealing 150% / 175% / 200% / 225% / 250% ATK as bonus damage. It chains to 3 / 4 / 5 / 6 / 7 additional enemies, prioritizing targets not yet hit by the surge.'
    }
  },
  {
    id: 'verdant-covenant',
    name: 'Verdant Covenant',
    category: 'signature',
    signatureCoreId: 'nature',
    rarity: 'legendary',
    color: '#70e58a',
    glyph: '❧',
    description: 'NATURE · DRONES AND SYMBIOSIS',
    stats: { atkFlat: 1.3, hpPct: 0.12, armorPct: 0.11 },
    passive: {
      name: 'Verdant Covenant',
      effectId: 'verdant-covenant',
      statKey: 'critDamage',
      values: [0.20, 0.24, 0.28, 0.32, 0.36],
      description: 'Crit Damage: +20% / 24% / 28% / 32% / 36%. Symbiotic Engine: Each active summoned drone increases all damage dealt by 5% / 6% / 7% / 8% / 9%, stacking up to five times. Predatory Bloom: Every 5 / 4 / 4 / 3 / 3 seconds, each active drone launches a homing seed dealing 80% / 100% / 120% / 140% / 160% ATK. With at least three drones, seeds explode on impact for 50% of their damage to nearby enemies.'
    }
  },
  {
    id: 'prism-paradox',
    name: 'Prism Paradox',
    category: 'signature',
    signatureCoreId: 'elemental',
    rarity: 'legendary',
    color: '#ff71cd',
    glyph: '◈',
    description: 'PRISM · ELEMENTAL REACTIONS',
    stats: { atkFlat: 1, hpPct: 0.13, armorPct: 0.12 },
    passive: {
      name: 'Prism Paradox',
      effectId: 'prism-paradox',
      statKey: 'critDamage',
      values: [0.20, 0.25, 0.30, 0.35, 0.40],
      description: 'Crit Damage: +20% / 25% / 30% / 35% / 40%. Spectrum Collapse: Each distinct elemental effect on a target increases damage dealt to it by 8% / 10% / 12% / 14% / 16%, up to three effects. Prismatic Detonation: Hitting a target with 3 / 3 / 2 / 2 / 2 distinct effects triggers a burst for 150% / 175% / 200% / 225% / 250% ATK. The burst spreads the triggering effects to nearby enemies.'
    }
  },
  {
    id: 'blood-dividend',
    name: 'Blood Dividend',
    category: 'signature',
    signatureCoreId: 'vengeance',
    rarity: 'legendary',
    color: '#ff304f',
    glyph: '⟡',
    description: 'CRIMSON · BLOOD AND REPRISAL',
    stats: { atkFlat: 1.1, hpPct: 0.14, armorPct: 0.13 },
    passive: {
      name: 'Blood Dividend',
      effectId: 'blood-dividend',
      statKey: 'hpPct',
      values: [0.25, 0.30, 0.35, 0.40, 0.45],
      description: 'Max HP: +25% / 30% / 35% / 40% / 45%. Debt Collection: Below 50% HP, deal 20% / 25% / 30% / 35% / 40% more damage. Crimson Reprisal: While above 50% HP, each 1% of Max HP above that threshold increases final damage by 0.5% / 0.6% / 0.7% / 0.8% / 0.9%, capped at 50% / 60% / 70% / 80% / 90% bonus damage.'
    }
  },
  {
    id: 'last-light-first-dawn',
    name: 'Last Light, First Dawn',
    category: 'signature',
    signatureCoreId: 'remielle',
    rarity: 'legendary',
    color: '#ff9ed8',
    glyph: '✦',
    description: 'AURALIS · LIGHT CRYSTALS AND FEATHERS',
    stats: { atkFlat: 1.2, hpPct: 0.15, armorPct: 0.1 },
    passive: {
      name: 'Last Light, First Dawn',
      effectId: 'last-light-first-dawn',
      statKey: 'critChance',
      values: [0.10, 0.12, 0.14, 0.16, 0.18],
      description: 'Crit Chance: +10% / 12% / 14% / 16% / 18%. Luminous Afterimage: Each Light Crystal increases Void Burst damage by 8% / 10% / 12% / 14% / 16%, up to five stacks. Dawn’s Echo: Triggering Lumox at four stacks launches 2 / 3 / 4 / 5 / 6 luminous feathers. Each feather deals 75% / 90% / 105% / 120% / 135% ATK and pierces one additional enemy per refinement rank. Each activation has a 25% / 30% / 35% / 40% / 45% chance to generate one Light Crystal.'
    }
  },
  {
    id: 'eventide-array',
    name: 'Eventide Array',
    category: 'signature',
    signatureCoreId: 'nova',
    rarity: 'legendary',
    color: '#fff7cf',
    glyph: '◉',
    description: 'AETHER · SINGULARITY CONTROL',
    stats: { atkFlat: 1.3, hpPct: 0.12, armorPct: 0.11 },
    passive: {
      name: 'Eventide Array',
      effectId: 'eventide-array',
      statKey: 'fireRate',
      values: [0.15, 0.20, 0.25, 0.30, 0.35],
      description: 'Attack Speed: +15% / 20% / 25% / 30% / 35%. Event Horizon: Every 5 / 5 / 4 / 4 / 3 auto-attacks, create a black hole at the nearest enemy. The singularity pulls nearby enemies inward and collapses for 200% / 225% / 250% / 275% / 300% ATK damage. While an Eventide singularity is active, reduce incoming damage by 15% / 20% / 25% / 30% / 35%.'
    }
  },
  {
    id: 'fracture-drive',
    name: 'Fracture Drive',
    signatureCoreId: null,
    category: 'general',
    rarity: 'rare',
    color: '#72dfff',
    glyph: '⌁',
    description: 'GENERAL · DAMAGE',
    stats: { atkFlat: 0.4, hpPct: 0.07, armorPct: 0.07 },
    passive: { name: 'Kinetic Overdrive', effectId: 'general-fracture-drive', statKey: 'damage', values: [0.08, 0.10, 0.12, 0.14, 0.16], description: 'Damage: +8% / 10% / 12% / 14% / 16%.' }
  },
  {
    id: 'pale-orbit',
    name: 'Pale Orbit',
    signatureCoreId: null,
    category: 'general',
    rarity: 'rare',
    color: '#72dfff',
    glyph: '◌',
    description: 'GENERAL · CRITICAL CHANCE',
    stats: { atkFlat: 0.5, hpPct: 0.08, armorPct: 0.08 },
    passive: { name: 'Deadeye Alignment', effectId: 'general-pale-orbit', statKey: 'critChance', values: [0.06, 0.08, 0.10, 0.12, 0.14], description: 'Crit Chance: +6% / 8% / 10% / 12% / 14%.' }
  },
  {
    id: 'bastion-weave',
    name: 'Bastion Weave',
    signatureCoreId: null,
    category: 'general',
    rarity: 'rare',
    color: '#72dfff',
    glyph: '⬡',
    description: 'GENERAL · MAX HP',
    stats: { atkFlat: 0.6, hpPct: 0.09, armorPct: 0.05 },
    passive: { name: 'Layered Integrity', effectId: 'general-bastion-weave', statKey: 'hpPct', values: [0.12, 0.14, 0.16, 0.18, 0.20], description: 'Max HP: +12% / 14% / 16% / 18% / 20%.' }
  },
  {
    id: 'parallax-crown',
    name: 'Parallax Crown',
    signatureCoreId: null,
    category: 'general',
    rarity: 'unique',
    color: '#c69aff',
    glyph: '✥',
    description: 'GENERAL · CRITICAL DAMAGE',
    stats: { atkFlat: 1, hpPct: 0.09, armorPct: 0.08 },
    passive: { name: 'Critical Mass', effectId: 'general-parallax-crown', statKey: 'critDamage', values: [0.16, 0.19, 0.22, 0.25, 0.28], description: 'Crit Damage: +16% / 19% / 22% / 25% / 28%.' }
  },
  {
    id: 'chrono-spindle',
    name: 'Chrono Spindle',
    signatureCoreId: null,
    category: 'general',
    rarity: 'unique',
    color: '#c69aff',
    glyph: '⧖',
    description: 'GENERAL · ATTACK SPEED',
    stats: { atkFlat: 0.7, hpPct: 0.1, armorPct: 0.09 },
    passive: { name: 'Accelerated Cycle', effectId: 'general-chrono-spindle', statKey: 'fireRate', values: [0.10, 0.12, 0.14, 0.16, 0.18], description: 'Attack Speed: +10% / 12% / 14% / 16% / 18%.' }
  },
  {
    id: 'singularity-compass',
    name: 'Singularity Compass',
    signatureCoreId: null,
    category: 'general',
    rarity: 'unique',
    color: '#c69aff',
    glyph: '⊙',
    description: 'GENERAL · DAMAGE CALIBRATION',
    stats: { atkFlat: 0.8, hpPct: 0.11, armorPct: 0.1 },
    passive: { name: 'Convergence Index', effectId: 'general-singularity-compass', statKey: 'damage', values: [0.14, 0.16, 0.18, 0.20, 0.22], description: 'Damage: +14% / 16% / 18% / 20% / 22%.' }
  },
,
  {
    id: 'ashen-vector',
    name: 'Ashen Vector',
    signatureCoreId: null,
    category: 'general',
    rarity: 'rare',
    color: '#78dfff',
    glyph: '⌁',
    description: 'GENERAL · ATTACK POWER',
    stats: { atkFlat: 0.6, hpPct: 0.09, armorPct: 0.05 },
    passive: { name: 'Vector Surge', effectId: 'general-ashen-vector', statKey: 'atkFlat', values: [0.08, 0.1, 0.12, 0.14, 0.16], description: 'Attack: +0.8 / 1 / 1.2 / 1.4 / 1.6.' }
  },
  {
    id: 'glass-comet',
    name: 'Glass Comet',
    signatureCoreId: null,
    category: 'general',
    rarity: 'rare',
    color: '#78dfff',
    glyph: '✧',
    description: 'GENERAL · CRITICAL DAMAGE',
    stats: { atkFlat: 0.7, hpPct: 0.06, armorPct: 0.06 },
    passive: { name: 'Shatterpoint', effectId: 'general-glass-comet', statKey: 'critDamage', values: [0.1, 0.12, 0.14, 0.16, 0.18], description: 'Crit Damage: +10% / 12% / 14% / 16% / 18%.' }
  },
  {
    id: 'iron-psalm',
    name: 'Iron Psalm',
    signatureCoreId: null,
    category: 'general',
    rarity: 'rare',
    color: '#78dfff',
    glyph: '⬡',
    description: 'GENERAL · DEFENSE',
    stats: { atkFlat: 0.4, hpPct: 0.07, armorPct: 0.07 },
    passive: { name: 'Fortified Chassis', effectId: 'general-iron-psalm', statKey: 'armorPct', values: [0.08, 0.1, 0.12, 0.14, 0.16], description: 'DEF: +8% / 10% / 12% / 14% / 16%.' }
  },
  {
    id: 'afterburn-coil',
    name: 'Afterburn Coil',
    signatureCoreId: null,
    category: 'general',
    rarity: 'rare',
    color: '#78dfff',
    glyph: 'ϟ',
    description: 'GENERAL · ATTACK SPEED',
    stats: { atkFlat: 0.5, hpPct: 0.08, armorPct: 0.08 },
    passive: { name: 'Overclock Loop', effectId: 'general-afterburn-coil', statKey: 'fireRate', values: [0.06, 0.08, 0.1, 0.12, 0.14], description: 'Attack Speed: +6% / 8% / 10% / 12% / 14%.' }
  },
  {
    id: 'blue-shift-lens',
    name: 'Blue Shift Lens',
    signatureCoreId: null,
    category: 'general',
    rarity: 'rare',
    color: '#78dfff',
    glyph: '◉',
    description: 'GENERAL · CRITICAL RATE',
    stats: { atkFlat: 0.6, hpPct: 0.09, armorPct: 0.05 },
    passive: { name: 'Focused Aperture', effectId: 'general-blue-shift-lens', statKey: 'critChance', values: [0.04, 0.05, 0.06, 0.07, 0.08], description: 'Crit Chance: +4% / 5% / 6% / 7% / 8%.' }
  },
  {
    id: 'deepwell-plating',
    name: 'Deepwell Plating',
    signatureCoreId: null,
    category: 'general',
    rarity: 'rare',
    color: '#78dfff',
    glyph: '▣',
    description: 'GENERAL · MAX HP',
    stats: { atkFlat: 0.7, hpPct: 0.06, armorPct: 0.06 },
    passive: { name: 'Pressure Shell', effectId: 'general-deepwell-plating', statKey: 'hpPct', values: [0.1, 0.12, 0.14, 0.16, 0.18], description: 'Max HP: +10% / 12% / 14% / 16% / 18%.' }
  },
  {
    id: 'kinetic-lattice',
    name: 'Kinetic Lattice',
    signatureCoreId: null,
    category: 'general',
    rarity: 'rare',
    color: '#78dfff',
    glyph: '⧉',
    description: 'GENERAL · ATTACK POWER',
    stats: { atkFlat: 0.4, hpPct: 0.07, armorPct: 0.07 },
    passive: { name: 'Momentum Matrix', effectId: 'general-kinetic-lattice', statKey: 'atkFlat', values: [0.06, 0.08, 0.1, 0.12, 0.14], description: 'Attack: +0.6 / 0.8 / 1 / 1.2 / 1.4.' }
  },
  {
    id: 'ghost-frequency',
    name: 'Ghost Frequency',
    signatureCoreId: null,
    category: 'general',
    rarity: 'rare',
    color: '#78dfff',
    glyph: '∿',
    description: 'GENERAL · ATTACK SPEED',
    stats: { atkFlat: 0.5, hpPct: 0.08, armorPct: 0.08 },
    passive: { name: 'Phase Rhythm', effectId: 'general-ghost-frequency', statKey: 'fireRate', values: [0.05, 0.07, 0.09, 0.11, 0.13], description: 'Attack Speed: +5% / 7% / 9% / 11% / 13%.' }
  },
  {
    id: 'nullstone-heart',
    name: 'Nullstone Heart',
    signatureCoreId: null,
    category: 'general',
    rarity: 'rare',
    color: '#78dfff',
    glyph: '◇',
    description: 'GENERAL · DEFENSE',
    stats: { atkFlat: 0.6, hpPct: 0.09, armorPct: 0.05 },
    passive: { name: 'Null Guard', effectId: 'general-nullstone-heart', statKey: 'armorPct', values: [0.1, 0.12, 0.14, 0.16, 0.18], description: 'DEF: +10% / 12% / 14% / 16% / 18%.' }
  },
  {
    id: 'redline-prism',
    name: 'Redline Prism',
    signatureCoreId: null,
    category: 'general',
    rarity: 'rare',
    color: '#78dfff',
    glyph: '⟡',
    description: 'GENERAL · DAMAGE',
    stats: { atkFlat: 0.7, hpPct: 0.06, armorPct: 0.06 },
    passive: { name: 'Redline Calibration', effectId: 'general-redline-prism', statKey: 'damage', values: [0.06, 0.08, 0.1, 0.12, 0.14], description: 'Damage: +6% / 8% / 10% / 12% / 14%.' }
  },
  {
    id: 'eclipse-regulator',
    name: 'Eclipse Regulator',
    signatureCoreId: null,
    category: 'general',
    rarity: 'unique',
    color: '#c69aff',
    glyph: '◐',
    description: 'GENERAL · DAMAGE',
    stats: { atkFlat: 0.7, hpPct: 0.1, armorPct: 0.09 },
    passive: { name: 'Eclipse Alignment', effectId: 'general-eclipse-regulator', statKey: 'damage', values: [0.16, 0.18, 0.2, 0.22, 0.24], description: 'Damage: +16% / 18% / 20% / 22% / 24%.' }
  },
  {
    id: 'paradox-battery',
    name: 'Paradox Battery',
    signatureCoreId: null,
    category: 'general',
    rarity: 'unique',
    color: '#c69aff',
    glyph: '▰',
    description: 'GENERAL · ATTACK POWER',
    stats: { atkFlat: 0.8, hpPct: 0.11, armorPct: 0.1 },
    passive: { name: 'Overcharge Reserve', effectId: 'general-paradox-battery', statKey: 'atkFlat', values: [0.14, 0.16, 0.18, 0.2, 0.22], description: 'Attack: +1.4 / 1.6 / 1.8 / 2 / 2.2.' }
  },
  {
    id: 'starfall-mandrel',
    name: 'Starfall Mandrel',
    signatureCoreId: null,
    category: 'general',
    rarity: 'unique',
    color: '#c69aff',
    glyph: '✦',
    description: 'GENERAL · CRITICAL RATE',
    stats: { atkFlat: 0.9, hpPct: 0.12, armorPct: 0.07 },
    passive: { name: 'Starfall Focus', effectId: 'general-starfall-mandrel', statKey: 'critChance', values: [0.08, 0.1, 0.12, 0.14, 0.16], description: 'Crit Chance: +8% / 10% / 12% / 14% / 16%.' }
  },
  {
    id: 'event-horizon-shell',
    name: 'Event Horizon Shell',
    signatureCoreId: null,
    category: 'general',
    rarity: 'unique',
    color: '#c69aff',
    glyph: '◉',
    description: 'GENERAL · MAX HP',
    stats: { atkFlat: 1, hpPct: 0.09, armorPct: 0.08 },
    passive: { name: 'Horizon Integrity', effectId: 'general-event-horizon-shell', statKey: 'hpPct', values: [0.18, 0.2, 0.22, 0.24, 0.26], description: 'Max HP: +18% / 20% / 22% / 24% / 26%.' }
  },
  {
    id: 'axiom-engine',
    name: 'Axiom Engine',
    signatureCoreId: null,
    category: 'general',
    rarity: 'unique',
    color: '#c69aff',
    glyph: '⚙',
    description: 'GENERAL · ATTACK SPEED',
    stats: { atkFlat: 0.7, hpPct: 0.1, armorPct: 0.09 },
    passive: { name: 'Axiom Cycle', effectId: 'general-axiom-engine', statKey: 'fireRate', values: [0.14, 0.16, 0.18, 0.2, 0.22], description: 'Attack Speed: +14% / 16% / 18% / 20% / 22%.' }
  },
  {
    id: 'fractured-crown',
    name: 'Fractured Crown',
    signatureCoreId: null,
    category: 'general',
    rarity: 'unique',
    color: '#c69aff',
    glyph: '✥',
    description: 'GENERAL · CRITICAL DAMAGE',
    stats: { atkFlat: 0.8, hpPct: 0.11, armorPct: 0.1 },
    passive: { name: 'Fractured Impact', effectId: 'general-fractured-crown', statKey: 'critDamage', values: [0.22, 0.25, 0.28, 0.31, 0.34], description: 'Crit Damage: +22% / 25% / 28% / 31% / 34%.' }
  },
  {
    id: 'omega-spindle',
    name: 'Omega Spindle',
    signatureCoreId: null,
    category: 'general',
    rarity: 'legendary',
    color: '#ffcb70',
    glyph: '⧖',
    description: 'GENERAL · ATTACK TEMPO',
    stats: { atkFlat: 1.2, hpPct: 0.15, armorPct: 0.1 },
    passive: { name: 'Omega Cycle', effectId: 'general-omega-spindle', statKey: 'fireRate', values: [0.2, 0.23, 0.26, 0.29, 0.32], description: 'Attack Speed: +20% / 23% / 26% / 29% / 32%.' }
  },
  {
    id: 'singularity-forge',
    name: 'Singularity Forge',
    signatureCoreId: null,
    category: 'general',
    rarity: 'legendary',
    color: '#ffcb70',
    glyph: '✺',
    description: 'GENERAL · DAMAGE',
    stats: { atkFlat: 1.3, hpPct: 0.12, armorPct: 0.11 },
    passive: { name: 'Singularity Calibration', effectId: 'general-singularity-forge', statKey: 'damage', values: [0.24, 0.28, 0.32, 0.36, 0.4], description: 'Damage: +24% / 28% / 32% / 36% / 40%.' }
  },
  {
    id: 'eternal-keystone',
    name: 'Eternal Keystone',
    signatureCoreId: null,
    category: 'general',
    rarity: 'legendary',
    color: '#ffcb70',
    glyph: '⬡',
    description: 'GENERAL · MAX HP AND DEFENSE',
    stats: { atkFlat: 1, hpPct: 0.13, armorPct: 0.12 },
    passive: { name: 'Keystone Protocol', effectId: 'general-eternal-keystone', statKey: 'hpPct', values: [0.28, 0.32, 0.36, 0.4, 0.44], description: 'Max HP: +28% / 32% / 36% / 40% / 44%.' }
  }
];

export const VOID_WEAPON_BY_ID = Object.freeze(
  Object.fromEntries(voidWeapons.filter(weapon => weapon && typeof weapon.id === 'string').map(weapon => [weapon.id, weapon]))
);

export const VOID_WEAPON_SIGNATURE_CORE_IDS = Object.freeze(
  voidWeapons.filter(weapon => weapon.category === 'signature').map(weapon => weapon.signatureCoreId)
);
