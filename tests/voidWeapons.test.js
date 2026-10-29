import test from 'node:test';
import { voidWeapons } from '../src/data/voidWeapons.js';
import assert from 'node:assert/strict';
import {
  claimVoidWeaponMilestone,
  equipVoidWeapon,
  getVoidWeaponBonuses,
  getOwnedVoidWeapons,
  getRankedVoidWeaponDescription,
  getVoidWeapon,
  normalizeVoidWeaponSave,
  refineVoidWeapon,
  grantVoidWeapon,
  resolveVoidWeaponMilestoneReward,
  unequipVoidWeapon
} from '../src/systems/voidWeapons.js';

const baseSave = () => ({
  coreCurrency: 0,
  voidWeaponInventory: {},
  voidWeaponRefinements: {},
  equippedVoidWeapons: {},
  voidWeaponClaims: [],
  pendingVoidWeaponRewards: []
});

test('milestone reward grants a legendary weapon on a 5% roll', () => {
  const result = resolveVoidWeaponMilestoneReward(baseSave(), 0, 5, () => 0);
  assert.equal(result.awarded, true);
  assert.equal(result.reward.type, 'weapon');
  assert.equal(result.reward.rarity, 'legendary');
  assert.equal(result.saveData.voidWeaponInventory[result.reward.weaponId], 1);
  assert.equal(result.saveData.voidWeaponClaims.includes('0:5'), true);
  assert.equal(result.saveData.pendingVoidWeaponRewards.length, 1);
});

test('milestone reward grants Nexus Fragments outside the weapon roll', () => {
  const result = resolveVoidWeaponMilestoneReward(baseSave(), 2, 10, () => 0.50);
  assert.equal(result.awarded, true);
  assert.deepEqual(result.reward, {
    type: 'nexus-fragments',
    amount: 25,
    worldId: 2,
    roomNumber: 10,
    claimKey: '2:10'
  });
  assert.equal(result.saveData.coreCurrency, 25);
  assert.equal(result.saveData.voidWeaponInventory && Object.keys(result.saveData.voidWeaponInventory).length, 0);
});

test('the same milestone cannot be claimed twice or rerolled', () => {
  const first = resolveVoidWeaponMilestoneReward(baseSave(), 1, 15, () => 0.99);
  const second = resolveVoidWeaponMilestoneReward(first.saveData, 1, 15, () => 0);
  assert.equal(first.awarded, true);
  assert.equal(second.awarded, false);
  assert.equal(second.saveData.coreCurrency, first.saveData.coreCurrency);
  assert.equal(second.saveData.voidWeaponInventory['cinder-oath'] || 0, 0);
  assert.equal(second.saveData.pendingVoidWeaponRewards.length, 1);
});

test('tutorial, invalid worlds, and non-milestone rooms never claim rewards', () => {
  for (const [world, room] of [[-1, 5], [4, 5], [0, 6], [0, 21]]) {
    const result = resolveVoidWeaponMilestoneReward(baseSave(), world, room, () => 0);
    assert.equal(result.awarded, false);
    assert.equal(result.saveData.coreCurrency, 0);
    assert.equal(result.saveData.pendingVoidWeaponRewards.length, 0);
  }
});

test('save normalization preserves valid claims and pending rewards, rejects malformed claims', () => {
  const normalized = normalizeVoidWeaponSave({
    ...baseSave(),
    voidWeaponClaims: ['0:5', 'not-a-claim', '0:5'],
    pendingVoidWeaponRewards: [
      { type: 'nexus-fragments', amount: 15, worldId: 0, roomNumber: 5, claimKey: '0:5' },
      { type: 'weapon', weaponId: 'unknown', worldId: 0, roomNumber: 5, claimKey: '0:5' },
      { type: 'nexus-fragments', amount: 20, worldId: 0, roomNumber: 10, claimKey: '0:10' }
    ]
  });
  assert.deepEqual(normalized.voidWeaponClaims, ['0:5']);
  assert.equal(normalized.pendingVoidWeaponRewards.length, 1);
  assert.equal(normalized.pendingVoidWeaponRewards[0].claimKey, '0:5');
});

test('legacy saves with no Void Weapon fields normalize safely', () => {
  const normalized = normalizeVoidWeaponSave({ coreCurrency: 12, unlockedWorlds: 2 });
  assert.deepEqual(normalized.voidWeaponInventory, {});
  assert.deepEqual(normalized.equippedVoidWeapons, {});
  assert.deepEqual(normalized.voidWeaponClaims, []);
  assert.deepEqual(normalized.pendingVoidWeaponRewards, []);
  assert.equal(normalized.coreCurrency, 12);
  assert.deepEqual(normalized.companionInventory, {});
  assert.equal(normalized.equippedCompanionId, null);
  assert.equal(normalized.companionSystemUnlocked, false);
});


test('equipping a weapon exposes its stats and only its signature passive on the matching core', () => {
  const owned = {
    ...baseSave(),
    voidWeaponInventory: { 'cinder-oath': 1, 'stillpoint': 1 }
  };
  const offSignature = equipVoidWeapon(owned, 'frost', 'cinder-oath');
  assert.equal(offSignature.equipped, true);
  assert.equal(getVoidWeaponBonuses(offSignature.saveData, 'frost').stats.atkPct, 0);
  assert.equal(getVoidWeaponBonuses(offSignature.saveData, 'frost').stats.critChance, 0);
  assert.equal(getVoidWeaponBonuses(offSignature.saveData, 'frost').signaturePassive, null);
  const onSignature = equipVoidWeapon(offSignature.saveData, 'ember', 'cinder-oath');
  assert.equal(getVoidWeaponBonuses(onSignature.saveData, 'ember').signaturePassive.effectId, 'cinder-oath');
  assert.equal(getVoidWeaponBonuses(onSignature.saveData, 'ember').stats.critChance, 0.12);
  const removed = unequipVoidWeapon(onSignature.saveData, 'ember');
  assert.equal(removed.unequipped, true);
  assert.equal(getVoidWeaponBonuses(removed.saveData, 'ember').weapon, null);
});


test('signature weapon passives expose the requested rank I-V stat progression', () => {
  const cases = [
    ['cinder-oath', 'ember', 'critChance', [0.12, 0.14, 0.16, 0.18, 0.20]],
    ['stillpoint', 'frost', 'critChance', [0.08, 0.10, 0.12, 0.14, 0.16]],
    ['eventide-array', 'nova', 'fireRate', [0.10, 0.12, 0.14, 0.16, 0.18]],
    ['thunderclap-protocol', 'flash', 'fireRate', [0.12, 0.14, 0.16, 0.18, 0.20]],
    ['verdant-covenant', 'nature', 'critDamage', [0.20, 0.24, 0.28, 0.32, 0.36]],
    ['prism-paradox', 'elemental', 'critDamage', [0.20, 0.25, 0.30, 0.35, 0.40]],
    ['blood-dividend', 'vengeance', 'hpPct', [0.25, 0.30, 0.35, 0.40, 0.45]],
    ['last-light-first-dawn', 'remielle', 'critChance', [0.10, 0.12, 0.14, 0.16, 0.18]]
  ];
  for (const [weaponId, coreId, statKey, values] of cases) {
    let save = { ...baseSave(), voidWeaponInventory: { [weaponId]: 6 } };
    const equipped = equipVoidWeapon(save, coreId, weaponId);
    save = equipped.saveData;
    for (let refinement = 0; refinement <= 4; refinement++) {
      if (refinement > 0) save = refineVoidWeapon(save, weaponId).saveData;
      const bonuses = getVoidWeaponBonuses(save, coreId);
      assert.equal(bonuses.signaturePassive.rank, refinement + 1, weaponId + ' rank');
      assert.equal(bonuses.stats[statKey], values[refinement], weaponId + ' ' + statKey);
    }
  }
});

test('owned weapon list includes the signature stat at its current refinement rank', () => {
  const save = {
    ...baseSave(),
    voidWeaponInventory: { 'stillpoint': 2 }
  };
  const owned = getOwnedVoidWeapons(save);
  assert.equal(owned.length, 1);
  assert.equal(owned[0].passive.rank, 1);
  assert.equal(owned[0].stats.critChance, 0.08);
});

test('equipping a weapon to another core automatically unequips it from the previous core', () => {
  const owned = {
    ...baseSave(),
    voidWeaponInventory: { 'cinder-oath': 1, stillpoint: 1 },
    equippedVoidWeapons: { ember: 'cinder-oath' }
  };
  const moved = equipVoidWeapon(owned, 'frost', 'cinder-oath');
  assert.equal(moved.equipped, true);
  assert.deepEqual(moved.saveData.equippedVoidWeapons, { frost: 'cinder-oath' });
  assert.equal(getVoidWeaponBonuses(moved.saveData, 'ember').weapon, null);
  assert.equal(getVoidWeaponBonuses(moved.saveData, 'frost').weapon.id, 'cinder-oath');
});

test('normalization removes duplicate equipment assignments from legacy saves', () => {
  const normalized = normalizeVoidWeaponSave({
    ...baseSave(),
    voidWeaponInventory: { 'cinder-oath': 1, stillpoint: 1 },
    equippedVoidWeapons: { ember: 'cinder-oath', frost: 'cinder-oath', nova: 'stillpoint' }
  });
  assert.equal(Object.values(normalized.equippedVoidWeapons).filter(id => id === 'cinder-oath').length, 1);
  assert.equal(normalized.equippedVoidWeapons.nova, 'stillpoint');
});

test('weapon bonuses reject unowned weapons and invalid core equipment', () => {
  const empty = baseSave();
  assert.equal(equipVoidWeapon(empty, 'ember', 'cinder-oath').reason, 'not-owned');
  assert.equal(equipVoidWeapon(empty, 'unknown-core', 'cinder-oath').reason, 'invalid-core');
  assert.equal(getVoidWeaponBonuses(empty, 'ember').stats.atkPct, 0);
});


test('refinement consumes one duplicate and permanently improves weapon stats', () => {
  const owned = { ...baseSave(), voidWeaponInventory: { 'cinder-oath': 3 } };
  const first = refineVoidWeapon(owned, 'cinder-oath');
  assert.equal(first.refined, true);
  assert.equal(first.level, 1);
  assert.equal(first.saveData.voidWeaponInventory['cinder-oath'], 2);
  assert.equal(first.saveData.voidWeaponRefinements['cinder-oath'], 1);
  const equipped = equipVoidWeapon(first.saveData, 'ember', 'cinder-oath');
  const bonuses = getVoidWeaponBonuses(equipped.saveData, 'ember');
  assert.equal(bonuses.refinementLevel, 1);
  assert.equal(bonuses.stats.atkPct, 0);
  assert.equal(bonuses.stats.hpPct, 0);
  assert.equal(bonuses.signaturePassive.rank, 2);
  assert.equal(bonuses.stats.critChance, 0.14);
  assert.equal(bonuses.stats.critChance, 0.14);
});

test('refinement requires a duplicate and stops at rank five', () => {
  const single = { ...baseSave(), voidWeaponInventory: { 'stillpoint': 1 } };
  assert.equal(refineVoidWeapon(single, 'stillpoint').reason, 'duplicate-required');
  let save = { ...baseSave(), voidWeaponInventory: { 'stillpoint': 6 } };
  for (let rank = 1; rank <= 5; rank++) {
    const result = refineVoidWeapon(save, 'stillpoint');
    assert.equal(result.refined, true);
    assert.equal(result.level, rank);
    save = result.saveData;
  }
  const capped = refineVoidWeapon(save, 'stillpoint');
  assert.equal(capped.refined, false);
  assert.equal(capped.reason, 'max-refinement');
  assert.equal(capped.saveData.voidWeaponInventory.stillpoint, 1);
});

test('normalization safely clamps refinement ranks and drops unknown weapon keys', () => {
  const normalized = normalizeVoidWeaponSave({
    ...baseSave(),
    voidWeaponInventory: { 'cinder-oath': 2 },
    voidWeaponRefinements: { 'cinder-oath': 99, unknown: 4, stillpoint: -1 }
  });
  assert.deepEqual(normalized.voidWeaponRefinements, { 'cinder-oath': 5 });
});


test('Void Weapon descriptions show only values for the current rank', () => {
  const cinder = getVoidWeapon('cinder-oath');
  assert.match(cinder.passive.description, /Critical Rate: \\+12%\\./);
  assert.match(cinder.passive.description, /Burning enemies take 25% more damage/);
  assert.match(cinder.passive.description, /spawn 1 additional smaller homing fireball/);
  assert.doesNotMatch(cinder.passive.description, /12% \\/ 14%|25% \\/ 30%|1 \\/ 2 \\/ 3/);

  const rankThree = getVoidWeapon('cinder-oath', 2);
  assert.match(rankThree.passive.description, /Critical Rate: \\+16%\\./);
  assert.match(rankThree.passive.description, /Burning enemies take 35% more damage/);
  assert.match(rankThree.passive.description, /spawn 2 additional smaller homing fireballs/);

  const owned = {
    ...baseSave(),
    voidWeaponInventory: { 'cinder-oath': 2 },
    voidWeaponRefinements: { 'cinder-oath': 1 }
  };
  assert.match(getOwnedVoidWeapons(owned)[0].passive.description, /Critical Rate: \\+14%\\./);
  assert.match(getVoidWeaponBonuses(
    equipVoidWeapon(owned, 'ember', 'cinder-oath').saveData,
    'ember'
  ).signaturePassive.description, /Critical Rate: \\+14%\\./);

  assert.equal(
    getRankedVoidWeaponDescription('Test 1 / 2 / 3 / 4 / 5 and 10% / 20% / 30% / 40% / 50%', 5),
    'Test 5 and 50%'
  );
});

test('mystery box rarity bands award unique and rare weapons at their requested thresholds', () => {
  const unique = resolveVoidWeaponMilestoneReward(baseSave(), 0, 5, () => 0.05);
  assert.equal(unique.reward.type, 'weapon');
  assert.equal(unique.reward.rarity, 'unique');
  assert.equal(unique.saveData.voidWeaponInventory[unique.reward.weaponId], 1);

  const rare = resolveVoidWeaponMilestoneReward(baseSave(), 0, 5, () => 0.17);
  assert.equal(rare.reward.type, 'weapon');
  assert.equal(rare.reward.rarity, 'rare');
  assert.equal(rare.saveData.voidWeaponInventory[rare.reward.weaponId], 1);

  const fragments = resolveVoidWeaponMilestoneReward(baseSave(), 0, 5, () => 0.50);
  assert.equal(fragments.reward.type, 'nexus-fragments');
});

test('general weapons expose their passive stats on any equipped core', () => {
  const save = { ...baseSave(), voidWeaponInventory: { 'fracture-drive': 1, 'bastion-weave': 1 } };
  const ember = equipVoidWeapon(save, 'ember', 'fracture-drive');
  assert.equal(ember.equipped, true);
  assert.equal(getVoidWeaponBonuses(ember.saveData, 'ember').signaturePassive.effectId, 'general-fracture-drive');
  assert.equal(getVoidWeaponBonuses(ember.saveData, 'ember').stats.damage, 0.08);

  const nature = equipVoidWeapon(ember.saveData, 'nature', 'bastion-weave');
  assert.equal(nature.equipped, true);
  assert.equal(getVoidWeaponBonuses(nature.saveData, 'nature').stats.hpPct, 0.12);
  assert.equal(getVoidWeaponBonuses(nature.saveData, 'nature').signaturePassive.effectId, 'general-bastion-weave');
});

test('general weapon catalog contains three rare and three unique stat sticks', () => {
  assert.equal(voidWeapons.filter(weapon => weapon.category === 'general' && weapon.rarity === 'rare').length, 3);
  assert.equal(voidWeapons.filter(weapon => weapon.category === 'general' && weapon.rarity === 'unique').length, 3);
});

test('every world grants exactly one milestone delivery at rooms 5, 10, 15, and 20', () => {
  for (let worldId = 0; worldId < 4; worldId++) {
    for (const roomNumber of [5, 10, 15, 20]) {
      const result = resolveVoidWeaponMilestoneReward(baseSave(), worldId, roomNumber, () => 0.50);
      assert.equal(result.awarded, true, `world ${worldId + 1}, room ${roomNumber} should award a delivery`);
      assert.equal(result.reward.worldId, worldId);
      assert.equal(result.reward.roomNumber, roomNumber);
      assert.equal(result.reward.claimKey, `${worldId}:${roomNumber}`);
      assert.equal(result.saveData.pendingVoidWeaponRewards.some(item =>
        item.worldId === worldId && item.roomNumber === roomNumber && item.claimKey === result.reward.claimKey
      ), true);
      const duplicate = resolveVoidWeaponMilestoneReward(result.saveData, worldId, roomNumber, () => 0.50);
      assert.equal(duplicate.awarded, false, `world ${worldId + 1}, room ${roomNumber} must not award twice`);
    }
  }
});


test('automatic duplicate conversion is independent of refinement and caps inventory at five', () => {
  for (const [weaponId, rate] of [
    ['fracture-drive', 100],
    ['cinder-oath', 250],
    ['prism-paradox', 250]
  ]) {
    const starting = { ...baseSave(), coreCurrency: 10, voidWeaponInventory: { [weaponId]: 5 }, voidWeaponRefinements: { [weaponId]: 0 } };
    const grant = grantVoidWeapon(starting, weaponId, 1);
    assert.equal(grant.granted, true);
    assert.equal(grant.totalCopies, 5);
    assert.equal(grant.convertedCopies, 1);
    assert.equal(grant.convertedFragments, rate);
    assert.equal(grant.saveData.coreCurrency, 10 + rate);
    assert.equal(grant.saveData.voidWeaponRefinements[weaponId], undefined);
  }
  const batch = grantVoidWeapon({ ...baseSave(), coreCurrency: 0, voidWeaponInventory: { 'cinder-oath': 4 } }, 'cinder-oath', 3);
  assert.equal(batch.totalCopies, 5);
  assert.equal(batch.convertedCopies, 2);
  assert.equal(batch.convertedFragments, 500);
  assert.equal(batch.saveData.coreCurrency, 500);
});


test('general weapon catalog adds 10 rare, 6 unique, and 3 legendary entries', () => {
  const general = voidWeapons.filter(weapon => weapon.category === 'general');
  assert.equal(general.filter(weapon => weapon.rarity === 'rare').length, 13);
  assert.equal(general.filter(weapon => weapon.rarity === 'unique').length, 9);
  assert.equal(general.filter(weapon => weapon.rarity === 'legendary').length, 3);
  assert.equal(new Set(general.map(weapon => weapon.id)).size, general.length);
  assert.ok(general.every(weapon => !/universal|any core|any equipped core/i.test(weapon.passive.description)));
});

test('legendary pity and signature follow-up defaults normalize safely', () => {
  const normalized = normalizeVoidWeaponSave({ voidWeaponPity: 88, voidWeaponNextLegendarySignature: 1 });
  assert.equal(normalized.voidWeaponPity, 59);
  assert.equal(normalized.voidWeaponNextLegendarySignature, true);
  const fresh = normalizeVoidWeaponSave({});
  assert.equal(fresh.voidWeaponPity, 0);
  assert.equal(fresh.voidWeaponNextLegendarySignature, false);
});

test('R5 weapons convert every new duplicate even when inventory only has one or two copies', () => {
  for (const copies of [1, 2]) {
    const starting = {
      ...baseSave(),
      coreCurrency: 0,
      voidWeaponInventory: { 'cinder-oath': copies },
      voidWeaponRefinements: { 'cinder-oath': 5 }
    };
    const grant = grantVoidWeapon(starting, 'cinder-oath', 1);
    assert.equal(grant.totalCopies, copies);
    assert.equal(grant.convertedCopies, 1);
    assert.equal(grant.convertedFragments, 250);
    assert.equal(grant.saveData.coreCurrency, 250);
  }
});

test('refinement ranks count toward the duplicate conversion threshold', () => {
  const starting = {
    ...baseSave(),
    coreCurrency: 0,
    voidWeaponInventory: { 'cinder-oath': 2 },
    voidWeaponRefinements: { 'cinder-oath': 3 }
  };
  const grant = grantVoidWeapon(starting, 'cinder-oath', 1);
  assert.equal(grant.totalCopies, 3);
  assert.equal(grant.convertedCopies, 0);
  assert.equal(grant.saveData.voidWeaponInventory['cinder-oath'], 3);
  assert.equal(grant.saveData.coreCurrency, 0);
});
