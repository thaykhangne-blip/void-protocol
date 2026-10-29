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


const SAVE_KEY='void_orb_save_v1';
const DEV_MODE_PASSWORD_SHA256='4a1c5ba9bab4ffbd545fc0e59e31ffa673a1c7dd06e6bccccc432245d922ba14';
let saveData={};
let developerMode=false;

const highlightVoidWeaponNumbers = value => String(value ?? '').replace(/(\d+(?:\.\d+)?%?)/g, '<span style="color:#5de8ff;font-weight:700;text-shadow:0 0 8px rgba(93,232,255,.18)">$1</span>');

// Wait until the startup loader has preloaded the local app resources before booting the game.
await window.__voidPreloadPromise;

(()=>{'use strict';const c=document.getElementById('game'),ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;let W=window.innerWidth,H=window.innerHeight;function resizeGameCanvas(){const cssW=Math.max(320,Math.round(window.innerWidth)),cssH=Math.max(240,Math.round(window.innerHeight));c.width=cssW*2;c.height=cssH*2;c.style.width='100%';c.style.height='100%';ctx.setTransform(2,0,0,2,0,0);ctx.imageSmoothingEnabled=false;W=cssW;H=cssH;}resizeGameCanvas();const $=id=>document.getElementById(id);let runInfoHudAlpha=1,state='start',portalTransition=null,roomTransition=null,pausedFrom='playing',player,keys={},autoShoot=true,mouseSteering=true,mouse={x:W/2,y:H/2,down:false,dx:1,dy:0,lastX:W/2,lastY:H/2},bullets=[],lasers=[],lightningArcs=[],enemyShots=[],enemies=[],particles=[],damageTexts=[],xpDrops=[],stars=[],room=1,cleared=0,kills=0,energy=0,shards=0,roomTime=0,spawnTimer=0,collapseTimer=0,collapseAge=0,blackHole=null,portals=[],build=[],core=null,element=null,toastTimer=0,toastPriority=0,last=0,dash=0,dashCooldown=0,dashTrails=[],shootCd=0,run=1,shopVisits=0,shopStock=null,shopPurchased=[],ultFx=[],skillMissiles=[],natureDrones=[],elementalSummons=[],skillFx=[],featherTraps=[],remielleFeathersSpawnedThisRoom=0,ultLevel=0,ultCastFlash=0,level=1,xp=0,xpNext=30,levelUpsPending=0,coreEvolutionQueue=[],pendingPortalReveal=false,pendingWorldComplete=false,pendingTutorialAdvance=false,stageXpEarned=0,stageXpCap=24,roomPlan=[],roomType='singularity',roomObjective={},escortRoute=null,objectiveNodes=[],keyNodes=[],keyMaze=null,challengeModifier=null,environmentHazards=[],hazardSpawnTimer=3.5,hazardHitCooldown=0,roomKills=0,defenseShip=null,cargoRoute=null,objectiveClearing=false,pendingCoreSkill=false,clearFxType='singularity';let rand=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);let roomCombatStats={damageDealt:0,healingReceived:0,damageReceived:0,companionDamageDealt:0,companionHealing:0,companionShieldAbsorbed:0,companionDamagePrevented:0,companionExecutions:0,companionBarrierGranted:0};let companionCombatState=createCompanionCombatState();

// The module fragments below are concatenated here by the build script.
