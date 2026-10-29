import { worlds, tutorialWorld, tutorialTips } from './data/worlds.js';
import { cores, elements } from './data/cores.js';
import { PERKCODEXDATA, PERK_MAX_RANK, PERK_RARITY } from './data/perks.js';
import { pointSegmentDistance } from './utils/geometry.js';
import { createRicochetSystem } from './systems/ricochet.js';
import { worldIntroScenes, worldOutroScenes, inRunCommsScenes, allStoryScenes, corporateMemos, campaignInterludes, campaignConvergenceScene } from './data/story.js';
import { createNarrativeSystem } from './systems/narrative.js';
import { getElementalSummonCount, getUltimateMasteryRank } from './abilities/ultimateScaling.js';
import { getPrimaryAttackTarget as selectPrimaryAttackTarget } from './abilities/targeting.js';
import { getProjectileDamageMultiplier } from './abilities/autoAttacks/projectiles.js';
import { executeAutoAttack } from './abilities/autoAttacks/execute.js';
import { getVoidWeapon, getOwnedVoidWeapons, equipVoidWeapon, unequipVoidWeapon, getVoidWeaponBonuses, normalizeVoidWeaponSave, refineVoidWeapon, grantVoidWeapon as grantVoidWeaponToSave, MAX_VOID_WEAPON_REFINEMENT, resolveVoidWeaponMilestoneReward } from './systems/voidWeapons.js';
import { voidWeapons } from './data/voidWeapons.js';
import { companions } from './data/companions.js';
import { getCompanion, getOwnedCompanions, equipCompanion, unequipCompanion, normalizeCompanionSave, unlockCompanionSystemAfterClear, grantCompanion, unlockAllCompanions, createCompanionCombatState, getCompanionDamageAmplification, isCompanionExecuteTarget, getCompanionExecutionDamage } from './systems/companions.js';




// The module fragments below are concatenated here by the build script.
