/* Persistent Void Weapon inventory helpers. No DOM or game-loop dependencies. */
import { voidWeapons, VOID_WEAPON_BY_ID } from '../data/voidWeapons.js';

export const VOID_WEAPON_SAVE_DEFAULTS = Object.freeze({
  voidWeaponInventory: {},
  voidWeaponRefinements: {},
  equippedVoidWeapons: {},
  voidWeaponClaims: [],
  pendingVoidWeaponRewards: [],
  voidWeaponPity: 0,
  voidWeaponNextLegendarySignature: false
});

const CORE_IDS = new Set(VOID_WEAPON_SIGNATURE_CORE_IDS_SAFE().filter(Boolean));
function VOID_WEAPON_SIGNATURE_CORE_IDS_SAFE() {
  return voidWeapons.filter(weapon => weapon.category === 'signature').map(weapon => weapon.signatureCoreId);
}

function isRecord(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeVoidWeaponSave(saveData = {}) {
  const normalized = { ...saveData };
  const inventory = isRecord(normalized.voidWeaponInventory) ? normalized.voidWeaponInventory : {};
  const equipped = isRecord(normalized.equippedVoidWeapons) ? normalized.equippedVoidWeapons : {};
  const refinements = isRecord(normalized.voidWeaponRefinements) ? normalized.voidWeaponRefinements : {};
  const claims = Array.isArray(normalized.voidWeaponClaims) ? normalized.voidWeaponClaims : [];

  normalized.voidWeaponInventory = {};
  for (const [id, count] of Object.entries(inventory)) {
    if (Object.prototype.hasOwnProperty.call(VOID_WEAPON_BY_ID, id)) {
      const safeCount = Math.floor(Number(count));
      if (Number.isFinite(safeCount) && safeCount > 0) normalized.voidWeaponInventory[id] = safeCount;
    }
  }

  normalized.voidWeaponRefinements = {};
  for (const [id, level] of Object.entries(refinements)) {
    if (Object.prototype.hasOwnProperty.call(VOID_WEAPON_BY_ID, id)) {
      const safeLevel = Math.floor(Number(level));
      if (Number.isFinite(safeLevel) && safeLevel > 0) normalized.voidWeaponRefinements[id] = Math.min(5, safeLevel);
    }
  }

  normalized.equippedVoidWeapons = {};
  const equippedWeaponIds = new Set();
  for (const [coreId, weaponId] of Object.entries(equipped)) {
    if (CORE_IDS.has(coreId) &&
        Object.prototype.hasOwnProperty.call(VOID_WEAPON_BY_ID, weaponId) &&
        (normalized.voidWeaponInventory[weaponId] || 0) > 0 &&
        !equippedWeaponIds.has(weaponId)) {
      normalized.equippedVoidWeapons[coreId] = weaponId;
      equippedWeaponIds.add(weaponId);
    }
  }

  normalized.voidWeaponClaims = [...new Set(
    claims.filter(key => typeof key === 'string' && /^\d+:(5|10|15|20)$/.test(key))
  )];
  normalized.voidWeaponPity = Math.max(0, Math.min(59, Math.floor(Number(normalized.voidWeaponPity) || 0)));
  normalized.voidWeaponNextLegendarySignature = Boolean(normalized.voidWeaponNextLegendarySignature);
  const pendingRewards = Array.isArray(normalized.pendingVoidWeaponRewards) ? normalized.pendingVoidWeaponRewards : [];
  normalized.pendingVoidWeaponRewards = pendingRewards.filter(reward => {
    if (!isRecord(reward) || typeof reward.claimKey !== 'string' || !normalized.voidWeaponClaims.includes(reward.claimKey)) return false;
    if (reward.type === 'weapon') return Object.prototype.hasOwnProperty.call(VOID_WEAPON_BY_ID, reward.weaponId);
    return reward.type === 'nexus-fragments' && Number.isFinite(Number(reward.amount)) && Number(reward.amount) > 0;
  }).map(reward => reward.type === 'weapon'
    ? { type: 'weapon', weaponId: reward.weaponId, worldId: Number(reward.worldId), roomNumber: Number(reward.roomNumber), claimKey: reward.claimKey }
    : { type: 'nexus-fragments', amount: Math.floor(Number(reward.amount)), worldId: Number(reward.worldId), roomNumber: Number(reward.roomNumber), claimKey: reward.claimKey }
  );
  return normalized;
}

/**
 * Resolve slash-separated rank progressions in passive copy so UI shows only
 * the selected refinement rank, not every rank's value.
 */
export function getRankedVoidWeaponDescription(description, rank = 1) {
  const selectedRank = Math.max(1, Math.min(5, Math.floor(Number(rank) || 1)));
  return String(description || '').replace(/\b(?:\d+(?:\.\d+)?%?\s*\/\s*){4}\d+(?:\.\d+)?%?/g, sequence => {
    const values = sequence.split('/').map(value => value.trim());
    return values[selectedRank - 1] ?? values[0];
  });
}

function withPassiveRank(weapon, rank = 1) {
  if (!weapon) return null;
  return {
    ...weapon,
    passive: weapon.passive ? {
      ...weapon.passive,
      rank,
      description: getRankedVoidWeaponDescription(weapon.passive.description, rank)
    } : weapon.passive
  };
}

export function getVoidWeapon(weaponId, refinementLevel = 0) {
  const weapon = VOID_WEAPON_BY_ID[weaponId] || null;
  const rank = Math.max(1, Math.min(5, Math.floor(Number(refinementLevel) || 1)));
  return withPassiveRank(weapon, rank);
}

export function getOwnedVoidWeapons(saveData) {
  const safe = normalizeVoidWeaponSave(saveData);
  return voidWeapons
    .filter(weapon => safe.voidWeaponInventory[weapon.id] > 0)
    .map(weapon => {
      const refinementLevel = safe.voidWeaponRefinements[weapon.id] || 0;
      const refinementBonus = refinementLevel * 0.02;
      const passiveRank = Math.max(1, Math.min(5, refinementLevel || 1));
      const passiveStatBonus = weapon.passive?.values?.[passiveRank - 1] || 0;
      return {
        ...weapon,
        stats: {
          atkFlat: (weapon.stats.atkFlat ?? (weapon.stats.atkPct || 0) * 10) + refinementBonus * 10 + (weapon.passive?.statKey === 'atkFlat' ? passiveStatBonus * 10 : 0),
          hpPct: weapon.stats.hpPct + (weapon.stats.hpPct > 0 ? refinementBonus : 0) + (weapon.passive?.statKey === 'hpPct' ? passiveStatBonus : 0),
          armorPct: weapon.stats.armorPct + refinementBonus,
          critChance: weapon.passive?.statKey === 'critChance' ? passiveStatBonus : 0,
          critDamage: weapon.passive?.statKey === 'critDamage' ? passiveStatBonus : 0,
          fireRate: weapon.passive?.statKey === 'fireRate' ? passiveStatBonus : 0,
          damage: weapon.passive?.statKey === 'damage' ? passiveStatBonus : 0
        },
        passive: { ...withPassiveRank(weapon, passiveRank).passive, statBonus: passiveStatBonus },
        refinementLevel,
        copies: safe.voidWeaponInventory[weapon.id]
      };
    });
}

export function grantVoidWeapon(saveData, weaponId, copies = 1) {
  const safe = normalizeVoidWeaponSave(saveData);
  const amount = Math.floor(Number(copies));
  if (!VOID_WEAPON_BY_ID[weaponId] || !Number.isFinite(amount) || amount < 1) {
    return { saveData: safe, granted: false, reason: 'invalid-weapon-or-count' };
  }
  const existingCopies = safe.voidWeaponInventory[weaponId] || 0;
  const refinementLevel = safe.voidWeaponRefinements[weaponId] || 0;
  const totalCopyProgress = existingCopies + refinementLevel;
  const conversionRate = VOID_WEAPON_BY_ID[weaponId].rarity === 'legendary' ? 250 : VOID_WEAPON_BY_ID[weaponId].rarity === 'unique' ? 150 : 100;
  // Refinement consumes duplicate copies, so include refinement ranks in the five-copy threshold.
  const remainingCapacity = Math.max(0, 5 - totalCopyProgress);
  const storedCopies = Math.min(amount, remainingCapacity);
  const convertedCopies = Math.max(0, amount - storedCopies);
  safe.voidWeaponInventory[weaponId] = existingCopies + storedCopies;
  const convertedFragments = convertedCopies * conversionRate;
  if (convertedFragments > 0) safe.coreCurrency = Math.max(0, Number(safe.coreCurrency) || 0) + convertedFragments;
  return { saveData: safe, granted: true, weaponId, copies: storedCopies, convertedCopies, convertedFragments, totalCopies: safe.voidWeaponInventory[weaponId] };
}

export function equipVoidWeapon(saveData, coreId, weaponId) {
  const safe = normalizeVoidWeaponSave(saveData);
  if (!CORE_IDS.has(coreId)) return { saveData: safe, equipped: false, reason: 'invalid-core' };
  if (!VOID_WEAPON_BY_ID[weaponId]) return { saveData: safe, equipped: false, reason: 'invalid-weapon' };
  if (!(safe.voidWeaponInventory[weaponId] > 0)) return { saveData: safe, equipped: false, reason: 'not-owned' };
  // A weapon instance can be assigned to only one core at a time.
  // Moving it automatically clears the previous core's equipment slot.
  for (const [equippedCoreId, equippedWeaponId] of Object.entries(safe.equippedVoidWeapons)) {
    if (equippedWeaponId === weaponId && equippedCoreId !== coreId) {
      delete safe.equippedVoidWeapons[equippedCoreId];
    }
  }
  safe.equippedVoidWeapons[coreId] = weaponId;
  return { saveData: safe, equipped: true, coreId, weaponId };
}

export function unequipVoidWeapon(saveData, coreId) {
  const safe = normalizeVoidWeaponSave(saveData);
  if (!CORE_IDS.has(coreId)) return { saveData: safe, unequipped: false, reason: 'invalid-core' };
  delete safe.equippedVoidWeapons[coreId];
  return { saveData: safe, unequipped: true, coreId };
}

export const MAX_VOID_WEAPON_REFINEMENT = 5;

/** Consume one duplicate copy to permanently refine a weapon, up to rank V. */
export function refineVoidWeapon(saveData, weaponId) {
  const safe = normalizeVoidWeaponSave(saveData);
  if (!VOID_WEAPON_BY_ID[weaponId]) return { saveData: safe, refined: false, reason: 'invalid-weapon' };
  const copies = safe.voidWeaponInventory[weaponId] || 0;
  const level = safe.voidWeaponRefinements[weaponId] || 0;
  if (level >= MAX_VOID_WEAPON_REFINEMENT) return { saveData: safe, refined: false, reason: 'max-refinement', level };
  if (copies < 2) return { saveData: safe, refined: false, reason: 'duplicate-required', level, copies };
  safe.voidWeaponInventory[weaponId] = copies - 1;
  safe.voidWeaponRefinements[weaponId] = level + 1;
  return { saveData: safe, refined: true, weaponId, level: level + 1, copiesRemaining: copies - 1 };
}

export function getVoidWeaponBonuses(saveData, coreId) {
  const safe = normalizeVoidWeaponSave(saveData);
  const weaponId = safe.equippedVoidWeapons[coreId];
  const weapon = weaponId ? VOID_WEAPON_BY_ID[weaponId] : null;
  if (!weapon) return { weapon: null, stats: { atkFlat: 0, hpPct: 0, armorPct: 0, critChance: 0, critDamage: 0, fireRate: 0, damage: 0 }, signaturePassive: null, refinementLevel: 0 };
  const refinementLevel = safe.voidWeaponRefinements[weaponId] || 0;
  const refinementBonus = refinementLevel * 0.02;
  const passive = weapon.category === 'general' || weapon.signatureCoreId === coreId ? weapon.passive : null;
  const passiveRank = Math.max(1, Math.min(5, refinementLevel || 1));
  const passiveStatBonus = passive?.values?.[passiveRank - 1] || 0;
  return {
    weapon,
    stats: {
      atkFlat: (weapon.stats.atkFlat ?? (weapon.stats.atkPct || 0) * 10) + refinementBonus * 10,
      hpPct: weapon.stats.hpPct + refinementBonus + (passive?.statKey === 'hpPct' ? passiveStatBonus : 0),
      armorPct: weapon.stats.armorPct + refinementBonus,
      critChance: passive?.statKey === 'critChance' ? passiveStatBonus : 0,
      critDamage: passive?.statKey === 'critDamage' ? passiveStatBonus : 0,
      fireRate: passive?.statKey === 'fireRate' ? passiveStatBonus : 0,
      damage: passive?.statKey === 'damage' ? passiveStatBonus : 0
    },
    signaturePassive: passive ? { ...withPassiveRank(weapon, passiveRank).passive, statBonus: passiveStatBonus } : null,
    refinementLevel
  };
}

export function claimVoidWeaponMilestone(saveData, worldId, roomNumber) {
  const safe = normalizeVoidWeaponSave(saveData);
  const world = Number(worldId);
  const milestone = Number(roomNumber);
  const key = `${world}:${milestone}`;
  if (!Number.isInteger(world) || world < 0 || world > 3 ||
      ![5, 10, 15, 20].includes(milestone) || safe.voidWeaponClaims.includes(key)) {
    return { saveData: safe, claimed: false, key };
  }
  safe.voidWeaponClaims.push(key);
  return { saveData: safe, claimed: true, key };
}


/** Resolve and persist a campaign milestone reward exactly once. */
export function resolveVoidWeaponMilestoneReward(saveData, worldId, roomNumber, rng = Math.random) {
  const claim = claimVoidWeaponMilestone(saveData, worldId, roomNumber);
  const safe = claim.saveData;
  if (!claim.claimed) return { saveData: safe, awarded: false, reason: 'already-claimed-or-invalid', claimKey: claim.key };

  const world = Number(worldId);
  const room = Number(roomNumber);
  const roll = Number(rng());
  let reward;
  let weaponPool = null;
  let poolStart = 0;
  let poolWidth = 0;
  if (Number.isFinite(roll) && roll >= 0 && roll < 0.05) {
    weaponPool = voidWeapons.filter(weapon => weapon.rarity === 'legendary');
    poolStart = 0; poolWidth = 0.05;
  } else if (Number.isFinite(roll) && roll >= 0.05 && roll < 0.17) {
    weaponPool = voidWeapons.filter(weapon => weapon.rarity === 'unique');
    poolStart = 0.05; poolWidth = 0.12;
  } else if (Number.isFinite(roll) && roll >= 0.17 && roll < 0.50) {
    weaponPool = voidWeapons.filter(weapon => weapon.rarity === 'rare');
    poolStart = 0.17; poolWidth = 0.33;
  }
  if (weaponPool?.length) {
    const poolRoll = Math.max(0, Math.min(0.999999999, (roll - poolStart) / poolWidth));
    const index = Math.min(weaponPool.length - 1, Math.floor(poolRoll * weaponPool.length));
    const weapon = weaponPool[index];
    const granted = grantVoidWeapon(safe, weapon.id, 1);
    reward = { type: 'weapon', weaponId: weapon.id, rarity: weapon.rarity, worldId: world, roomNumber: room, claimKey: claim.key };
    safe.voidWeaponInventory = granted.saveData.voidWeaponInventory;
    safe.equippedVoidWeapons = granted.saveData.equippedVoidWeapons;
    safe.voidWeaponClaims = granted.saveData.voidWeaponClaims;
    safe.pendingVoidWeaponRewards = granted.saveData.pendingVoidWeaponRewards || safe.pendingVoidWeaponRewards || [];
  } else {
    const amount = 15 + world * 5;
    safe.coreCurrency = Math.max(0, Number(safe.coreCurrency) || 0) + amount;
    reward = { type: 'nexus-fragments', amount, worldId: world, roomNumber: room, claimKey: claim.key };
  }
  safe.pendingVoidWeaponRewards = [...(safe.pendingVoidWeaponRewards || []), reward];
  return { saveData: safe, awarded: true, reward, claimKey: claim.key };
}
