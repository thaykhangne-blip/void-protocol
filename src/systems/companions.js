/* Persistent Companion inventory helpers. No DOM or game-loop dependencies. */
import {
  companions,
  COMPANION_BY_ID,
  MAX_EQUIPPED_COMPANIONS,
  COMPANION_UNLOCK_WORLD_ID,
  COMPANION_UNLOCK_ROOM
} from '../data/companions.js';

export const MAX_COMPANION_COPIES = 5; // Rank I plus four duplicates for future evolution.
export const COMPANION_DUPLICATE_FRAGMENTS = 50;

export const COMPANION_SAVE_DEFAULTS = Object.freeze({
  companionInventory: {},
  equippedCompanionId: null,
  companionSystemUnlocked: false
});

function isRecord(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/** Normalize companion fields while preserving unrelated save properties. */
export function normalizeCompanionSave(saveData = {}) {
  const normalized = { ...saveData };
  const inventory = isRecord(normalized.companionInventory) ? normalized.companionInventory : {};
  normalized.companionInventory = {};

  for (const [id, count] of Object.entries(inventory)) {
    if (!Object.prototype.hasOwnProperty.call(COMPANION_BY_ID, id)) continue;
    const safeCount = Math.floor(Number(count));
    if (Number.isFinite(safeCount) && safeCount > 0) normalized.companionInventory[id] = Math.min(MAX_COMPANION_COPIES, safeCount);
  }

  const equippedId = normalized.equippedCompanionId;
  normalized.equippedCompanionId =
    typeof equippedId === 'string' &&
    Object.prototype.hasOwnProperty.call(COMPANION_BY_ID, equippedId) &&
    normalized.companionInventory[equippedId] > 0
      ? equippedId
      : null;

  normalized.companionSystemUnlocked = Boolean(normalized.companionSystemUnlocked);
  return normalized;
}

/** Return the stable definition for a Companion ID, or null for unknown IDs. */
export function getCompanion(companionId) {
  return COMPANION_BY_ID[companionId] || null;
}

/** Return owned Companion definitions in registry order. */
export function getOwnedCompanions(saveData = {}) {
  const safe = normalizeCompanionSave(saveData);
  return companions.filter(companion => safe.companionInventory[companion.id] > 0);
}

/** Grant up to five total copies; convert excess duplicates into Nexus Fragments. */
export function grantCompanion(saveData, companionId, copies = 1) {
  const safe = normalizeCompanionSave(saveData);
  const amount = Math.floor(Number(copies));
  if (!Object.prototype.hasOwnProperty.call(COMPANION_BY_ID, companionId) ||
      !Number.isFinite(amount) || amount < 1) {
    return { saveData: safe, granted: false, reason: 'invalid-companion-or-count' };
  }

  const current = safe.companionInventory[companionId] || 0;
  const copiesGranted = Math.min(amount, Math.max(0, MAX_COMPANION_COPIES - current));
  const excessCopies = amount - copiesGranted;
  const convertedFragments = excessCopies * COMPANION_DUPLICATE_FRAGMENTS;
  if (copiesGranted > 0) safe.companionInventory[companionId] = current + copiesGranted;
  if (convertedFragments > 0) safe.coreCurrency = Math.max(0, Number(safe.coreCurrency) || 0) + convertedFragments;
  return { saveData: safe, granted: copiesGranted > 0, companionId, copies: copiesGranted, excessCopies, convertedFragments, totalCopies: safe.companionInventory[companionId] || current };
}

/** Equip the single allowed Companion slot. Ownership and unlock state are required. */
export function equipCompanion(saveData, companionId) {
  const safe = normalizeCompanionSave(saveData);
  if (!Object.prototype.hasOwnProperty.call(COMPANION_BY_ID, companionId)) {
    return { saveData: safe, equipped: false, reason: 'invalid-companion' };
  }
  if (!safe.companionSystemUnlocked) {
    return { saveData: safe, equipped: false, reason: 'system-locked' };
  }
  if (!(safe.companionInventory[companionId] > 0)) {
    return { saveData: safe, equipped: false, reason: 'not-owned' };
  }

  safe.equippedCompanionId = companionId;
  return { saveData: safe, equipped: true, companionId, slotCount: MAX_EQUIPPED_COMPANIONS };
}

/** Unequip the current Companion, if any. */
export function unequipCompanion(saveData) {
  const safe = normalizeCompanionSave(saveData);
  const previousCompanionId = safe.equippedCompanionId;
  safe.equippedCompanionId = null;
  return { saveData: safe, unequipped: true, previousCompanionId };
}

/**
 * Unlock after clearing room 10 of World 1.
 * Campaign world IDs are zero-based, so World 1 is ID 0.
 * Call this from the existing room-clear reward flow; not wired in this pass.
 */
export function unlockCompanionSystemAfterClear(saveData, worldId, roomNumber) {
  const safe = normalizeCompanionSave(saveData);
  const world = Number(worldId);
  const room = Number(roomNumber);
  if (world !== COMPANION_UNLOCK_WORLD_ID || room < COMPANION_UNLOCK_ROOM) {
    return { saveData: safe, unlocked: false, newlyUnlocked: false, reason: 'unlock-condition-not-met' };
  }
  const newlyUnlocked = !safe.companionSystemUnlocked;
  safe.companionSystemUnlocked = true;
  return { saveData: safe, unlocked: true, newlyUnlocked };
}

/** Read the equipped Companion definition, if it is owned and the system is unlocked. */
export function getEquippedCompanion(saveData) {
  const safe = normalizeCompanionSave(saveData);
  if (!safe.companionSystemUnlocked || !safe.equippedCompanionId) return null;
  return COMPANION_BY_ID[safe.equippedCompanionId] || null;
}


/**
 * Combat runtime state is intentionally separate from persistent collection data.
 * It is reset on a fresh run and room transitions; only equipped ownership is saved.
 */
export const COMPANION_COMBAT_DEFAULTS = Object.freeze({
  solace: { attackTimer: 2, signatureCooldown: 0, signatureTimer: 0 },
  ruin: { attackTimer: 1.5, signatureCooldown: 0 },
  bastion: { attackTimer: 1.5, signatureCooldown: 0, barrierTimer: 0 }
});

export function createCompanionCombatState() {
  return {
    companionId: null,
    attackTimer: 0,
    signatureCooldown: 0,
    signatureTimer: 0,
    barrierTimer: 0,
    projectiles: [],
    hitCount: 0
  };
}

export function getCompanionDamageAmplification(target, now = 0) {
  return target && Number(target.companionDeathMarkUntil) > now ? 1.25 : 1;
}

export function isCompanionExecuteTarget(target, blackHole = null) {
  return !!target && target !== blackHole && target.hp > 0 &&
    !target.isBoss && !target.isMiniBoss && !target.isFinalBoss &&
    target.role !== 'boss' && target.role !== 'miniboss' &&
    Number(target.hp) / Math.max(1, Number(target.maxHp) || Number(target.hp)) <= 0.25;
}

export function getCompanionExecutionDamage(target) {
  if (!target || !(target.hp > 0)) return 0;
  return Math.max(0, 40 + Math.max(0, (Number(target.maxHp) || target.hp) - target.hp) * 0.20);
}

/** Unlock the current Companion roster for developer-mode testing. */
export function unlockAllCompanions(saveData = {}) {
  const safe = normalizeCompanionSave(saveData);
  for (const companion of companions) safe.companionInventory[companion.id] = MAX_COMPANION_COPIES;
  safe.companionSystemUnlocked = true;
  return safe;
}
