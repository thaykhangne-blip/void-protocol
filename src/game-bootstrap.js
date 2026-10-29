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

const SAVE_KEY='void_orb_save_v1';let saveData={unlockedWorlds:1,totalRuns:0,bestRooms:[0,0,0,0],hardModeByWorld:{},autoShoot:true,mouseSteering:true,sfxEnabled:true,musicEnabled:true,musicVolume:0.32,uiScale:1,lastWorld:0,coreCurrency:0,coreUpgrades:{},voidWeaponInventory:{},equippedVoidWeapons:{},voidWeaponClaims:[],pendingVoidWeaponRewards:[],storyProgress:{seenScenes:[],recoveredFiles:[]}};try{const raw=localStorage.getItem(SAVE_KEY);if(raw){const parsed=JSON.parse(raw);saveData={...saveData,...parsed};saveData.coreCurrency=Math.max(0,Number(saveData.coreCurrency)||0);saveData.coreUpgrades=saveData.coreUpgrades&&typeof saveData.coreUpgrades==='object'?saveData.coreUpgrades:{};saveData.unlockedWorlds=Math.max(1,Math.min(4,Number(saveData.unlockedWorlds)||1));saveData.bestRooms=Array.isArray(saveData.bestRooms)?[0,1,2,3].map(i=>Number(saveData.bestRooms[i])||0):[0,0,0,0];saveData.hardModeByWorld=saveData.hardModeByWorld&&typeof saveData.hardModeByWorld==='object'?saveData.hardModeByWorld:{}}}catch(e){}saveData=normalizeVoidWeaponSave(saveData);persist();try{const legacy=saveData.coreUpgrades||{};if(Object.values(legacy).some(v=>v&&typeof v==='object')){const shared={};for(const value of Object.values(legacy)){if(value&&typeof value==='object')for(const [key,rank] of Object.entries(value))shared[key]=Math.max(Number(shared[key])||0,Number(rank)||0)}for(const key of ['atk','crit','rate','hull','armor','speed'])if(Number.isFinite(Number(legacy[key])))shared[key]=Math.max(Number(shared[key])||0,Number(legacy[key])||0);saveData.coreUpgrades=shared;localStorage.setItem(SAVE_KEY,JSON.stringify(saveData))}}catch(e){}saveData.storyProgress=saveData.storyProgress&&typeof saveData.storyProgress==='object'?saveData.storyProgress:{seenScenes:[],recoveredFiles:[]};saveData.storyProgress.seenScenes=Array.isArray(saveData.storyProgress.seenScenes)?saveData.storyProgress.seenScenes:[];saveData.storyProgress.recoveredFiles=Array.isArray(saveData.storyProgress.recoveredFiles)?saveData.storyProgress.recoveredFiles:[];const DEV_MODE_PASSWORD_SHA256='4a1c5ba9bab4ffbd545fc0e59e31ffa673a1c7dd06e6bccccc432245d922ba14';const CORE_UNLOCK_REQUIREMENTS={remielle:{worldIndex:2,label:'WORLD 3'},nature:{worldIndex:0,label:'WORLD 1'},elemental:{worldIndex:1,label:'WORLD 2'},vengeance:{worldIndex:2,label:'WORLD 3'},nova:{worldIndex:2,label:'WORLD 3'}};
let developerMode=false;

const highlightVoidWeaponNumbers = value => String(value ?? '').replace(/(\\d+(?:\\.\\d+)?%?)/g, '<span style="color:#5de8ff;font-weight:700;text-shadow:0 0 8px rgba(93,232,255,.18)">$1</span>');

// The module fragments below are concatenated here by the build script.
