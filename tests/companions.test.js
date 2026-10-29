import test from 'node:test';
import assert from 'node:assert/strict';
import { companions, COMPANION_BY_ID, MAX_EQUIPPED_COMPANIONS } from '../src/data/companions.js';
import {
  equipCompanion,
  getCompanion,
  getEquippedCompanion,
  getOwnedCompanions,
  grantCompanion,
  normalizeCompanionSave,
  unequipCompanion,
  unlockCompanionSystemAfterClear
} from '../src/systems/companions.js';
import { resolveVoidWeaponMilestoneReward } from '../src/systems/voidWeapons.js';

const baseSave = () => ({
  coreCurrency: 0,
  voidWeaponInventory: {},
  voidWeaponRefinements: {},
  equippedVoidWeapons: {},
  voidWeaponClaims: [],
  pendingVoidWeaponRewards: [],
  companionInventory: {},
  equippedCompanionId: null,
  companionSystemUnlocked: false
});

test('initial Companion registry contains three distinct five-star legendary Companions', () => {
  assert.deepEqual(companions.map(companion => companion.id), ['solace', 'ruin', 'bastion']);
  assert.equal(new Set(companions.map(companion => companion.id)).size, 3);
  for (const companion of companions) {
    assert.equal(companion.rarity, 'legendary');
    assert.equal(companion.stars, 5);
    assert.ok(companion.basicAttack && companion.passive && companion.signature);
    assert.equal(COMPANION_BY_ID[companion.id], companion);
  }
  assert.equal(MAX_EQUIPPED_COMPANIONS, 1);
});

test('legacy saves normalize Companion fields safely and preserve unrelated data', () => {
  const normalized = normalizeCompanionSave({ coreCurrency: 42, unlockedWorlds: 1 });
  assert.deepEqual(normalized.companionInventory, {});
  assert.equal(normalized.equippedCompanionId, null);
  assert.equal(normalized.companionSystemUnlocked, false);
  assert.equal(normalized.coreCurrency, 42);
});

test('Companion inventory normalization rejects unknown IDs and invalid counts', () => {
  const normalized = normalizeCompanionSave({
    companionInventory: { solace: 2.9, ruin: '1', unknown: 9, bastion: -2 },
    equippedCompanionId: 'unknown'
  });
  assert.deepEqual(normalized.companionInventory, { solace: 2, ruin: 1 });
  assert.equal(normalized.equippedCompanionId, null);
});

test('granting a Companion adds owned copies and rejects invalid IDs', () => {
  const first = grantCompanion(baseSave(), 'solace');
  assert.equal(first.granted, true);
  assert.equal(first.saveData.companionInventory.solace, 1);
  const second = grantCompanion(first.saveData, 'solace', 2);
  assert.equal(second.saveData.companionInventory.solace, 3);
  assert.equal(grantCompanion(second.saveData, 'not-real').granted, false);
});

test('Companion system unlocks only after clearing room 10 of World 1 (zero-based ID 0)', () => {
  const untouched = unlockCompanionSystemAfterClear(baseSave(), 1, 10);
  assert.equal(untouched.unlocked, false);
  assert.equal(unlockCompanionSystemAfterClear(baseSave(), 0, 9).unlocked, false);
  const unlocked = unlockCompanionSystemAfterClear(baseSave(), 0, 10);
  assert.equal(unlocked.unlocked, true);
  assert.equal(unlocked.newlyUnlocked, true);
  assert.equal(unlockCompanionSystemAfterClear(unlocked.saveData, 0, 10).newlyUnlocked, false);
});

test('equipping requires unlock and ownership, and only one slot is exposed', () => {
  const owned = grantCompanion(baseSave(), 'ruin').saveData;
  assert.equal(equipCompanion(owned, 'ruin').reason, 'system-locked');
  const unlocked = unlockCompanionSystemAfterClear(owned, 0, 10).saveData;
  const equipped = equipCompanion(unlocked, 'ruin');
  assert.equal(equipped.equipped, true);
  assert.equal(equipped.slotCount, 1);
  assert.equal(getEquippedCompanion(equipped.saveData).id, 'ruin');
  assert.equal(getCompanion('solace').id, 'solace');
  assert.equal(getOwnedCompanions(equipped.saveData).length, 1);
  const unequipped = unequipCompanion(equipped.saveData);
  assert.equal(unequipped.saveData.equippedCompanionId, null);
  assert.equal(getEquippedCompanion(unequipped.saveData), null);
});

test('mystery box splits the 5% legendary chance into 2.5% weapons and 2.5% Companions', () => {
  const weapon = resolveVoidWeaponMilestoneReward(baseSave(), 0, 5, () => 0.01);
  assert.equal(weapon.reward.type, 'weapon');
  assert.equal(weapon.reward.rarity, 'legendary');

  const companion = resolveVoidWeaponMilestoneReward(baseSave(), 0, 5, () => 0.03);
  assert.equal(companion.reward.type, 'companion');
  assert.equal(companion.reward.rarity, 'legendary');
  assert.equal(companion.reward.stars, 5);
  assert.equal(companion.saveData.companionInventory[companion.reward.companionId], 1);

  const normalized = normalizeCompanionSave(companion.saveData);
  assert.equal(normalized.companionInventory[companion.reward.companionId], 1);
  assert.equal(normalized.pendingVoidWeaponRewards.some(reward => reward.type === 'companion'), true);
});

test('unique, rare, and Nexus Fragment odds retain their existing thresholds', () => {
  const unique = resolveVoidWeaponMilestoneReward(baseSave(), 0, 5, () => 0.08);
  assert.equal(unique.reward.type, 'weapon');
  assert.equal(unique.reward.rarity, 'unique');

  const rare = resolveVoidWeaponMilestoneReward(baseSave(), 0, 5, () => 0.20);
  assert.equal(rare.reward.type, 'weapon');
  assert.equal(rare.reward.rarity, 'rare');

  const fragments = resolveVoidWeaponMilestoneReward(baseSave(), 0, 5, () => 0.50);
  assert.equal(fragments.reward.type, 'nexus-fragments');
});
