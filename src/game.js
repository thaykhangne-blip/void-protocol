import './systems/combat.js';
import './systems/campaign.js';
import './systems/progression.js';
import './ui/menus.js';
import './systems/runtime.js';
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

const highlightVoidWeaponNumbers = value => String(value ?? '').replace(/(\d+(?:\.\d+)?%?)/g, '<span style="color:#5de8ff;font-weight:700;text-shadow:0 0 8px rgba(93,232,255,.18)">$1</span>');

// Wait until the startup loader has preloaded the local app resources before booting the game.
await window.__voidPreloadPromise;

(()=>{'use strict';const c=document.getElementById('game'),ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;let W=window.innerWidth,H=window.innerHeight;function resizeGameCanvas(){const cssW=Math.max(320,Math.round(window.innerWidth)),cssH=Math.max(240,Math.round(window.innerHeight));c.width=cssW*2;c.height=cssH*2;c.style.width='100%';c.style.height='100%';ctx.setTransform(2,0,0,2,0,0);ctx.imageSmoothingEnabled=false;W=cssW;H=cssH;}resizeGameCanvas();const $=id=>document.getElementById(id);let runInfoHudAlpha=1,state='start',portalTransition=null,roomTransition=null,pausedFrom='playing',player,keys={},autoShoot=true,mouseSteering=true,mouse={x:W/2,y:H/2,down:false,dx:1,dy:0,lastX:W/2,lastY:H/2},bullets=[],lasers=[],lightningArcs=[],enemyShots=[],enemies=[],particles=[],damageTexts=[],xpDrops=[],stars=[],room=1,cleared=0,kills=0,energy=0,shards=0,roomTime=0,spawnTimer=0,collapseTimer=0,collapseAge=0,blackHole=null,portals=[],build=[],core=null,element=null,toastTimer=0,toastPriority=0,last=0,dash=0,dashCooldown=0,dashTrails=[],shootCd=0,run=1,shopVisits=0,shopStock=null,shopPurchased=[],ultFx=[],skillMissiles=[],natureDrones=[],elementalSummons=[],skillFx=[],featherTraps=[],remielleFeathersSpawnedThisRoom=0,ultLevel=0,ultCastFlash=0,level=1,xp=0,xpNext=30,levelUpsPending=0,coreEvolutionQueue=[],pendingPortalReveal=false,pendingWorldComplete=false,pendingTutorialAdvance=false,stageXpEarned=0,stageXpCap=24,roomPlan=[],roomType='singularity',roomObjective={},escortRoute=null,objectiveNodes=[],keyNodes=[],keyMaze=null,challengeModifier=null,environmentHazards=[],hazardSpawnTimer=3.5,hazardHitCooldown=0,roomKills=0,defenseShip=null,cargoRoute=null,objectiveClearing=false,pendingCoreSkill=false,clearFxType='singularity';let rand=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);let roomCombatStats={damageDealt:0,healingReceived:0,damageReceived:0};

function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(saveData))}catch(e){}}

function applyUiScale(value=saveData.uiScale){const scale=Math.max(.8,Math.min(1.5,Number(value)||1));saveData.uiScale=scale;const wrap=document.querySelector('.wrap');document.documentElement.style.setProperty('--ui-scale',String(scale));if(wrap){wrap.style.zoom=String(scale);wrap.style.width=(100/scale)+'%';wrap.style.maxWidth='none';}return scale;}
applyUiScale();

function getAudioContext(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;if(!audioCtx)audioCtx=new AC();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}catch(e){return null}}

function ensureAudio(){return sfxEnabled?getAudioContext():null}

function musicTone(freq,when,duration,wave='square',volume=.045,detune=0){const ac=getAudioContext();if(!ac||!musicBus||!musicEnabled)return;try{const o=ac.createOscillator(),g=ac.createGain();o.type=wave;o.frequency.setValueAtTime(freq,when);if(detune)o.detune.setValueAtTime(detune,when);g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),when+.012);g.gain.exponentialRampToValueAtTime(.0001,when+duration);o.connect(g);g.connect(musicBus);o.start(when);o.stop(when+duration+.025)}catch(e){}}

function musicKick(when){const ac=getAudioContext();if(!ac||!musicBus||!musicEnabled)return;try{const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(125,when);o.frequency.exponentialRampToValueAtTime(42,when+.11);g.gain.setValueAtTime(.08,when);g.gain.exponentialRampToValueAtTime(.0001,when+.13);o.connect(g);g.connect(musicBus);o.start(when);o.stop(when+.14)}catch(e){}}

function startMusic(){
 if(!musicEnabled)return;
 const ac=getAudioContext();if(!ac)return;
 if(!musicBus){musicBus=ac.createGain();musicBus.gain.value=musicVolume;musicBus.connect(ac.destination)}else musicBus.gain.setTargetAtTime(musicVolume,ac.currentTime,.04);
 const trackIndex=Math.max(0,Math.min(3,currentWorld<0?0:currentWorld));
 if(musicTimer&&musicTrackIndex===trackIndex)return;
 if(musicTimer){clearInterval(musicTimer);musicTimer=null}
 musicTrackIndex=trackIndex;musicStep=0;
 // Four original, procedurally synthesized world themes. Each has its own tempo,
 // tonal palette, melody, bass movement, and percussion character.
 const tracks=[
  {name:'THE ABYSSAL FRONTIER',tempo:138,root:110,scale:[0,3,5,7,10,12,15,17],melody:[0,7,12,10,7,3,5,7,0,7,15,12,10,7,5,3],bass:[0,0,0,0,-5,-5,-5,-5,-3,-3,-3,-3,-7,-7,-7,-7],wave:'triangle',lead:'square',leadVol:.027,bassVol:.078,beat:4,drum:118},
  {name:'FROSTBOUND SILENCE',tempo:116,root:82.41,scale:[0,2,5,7,9,12,14,17],melody:[12,9,7,5,2,5,9,12,14,12,9,7,5,2,0,5],bass:[0,0,-3,-3,-5,-5,-3,-3,-7,-7,-5,-5,-3,-3,0,0],wave:'sine',lead:'triangle',leadVol:.031,bassVol:.065,beat:8,drum:92},
  {name:'NEON SUPERNOVA',tempo:156,root:98,scale:[0,2,4,7,9,12,14,16],melody:[0,4,7,12,9,7,4,2,0,7,12,16,14,12,9,4],bass:[0,0,0,7,-5,-5,-3,-3,-7,-7,-5,-5,-3,-3,0,0],wave:'sawtooth',lead:'square',leadVol:.022,bassVol:.07,beat:4,drum:145},
  {name:'THE VERDANT CIRCUIT',tempo:126,root:92.5,scale:[0,2,5,7,9,12,14,17],melody:[0,5,9,12,9,7,5,2,0,5,12,14,12,9,7,5],bass:[0,0,-5,-5,-3,-3,0,0,-7,-7,-5,-5,-3,-3,0,0],wave:'sine',lead:'triangle',leadVol:.03,bassVol:.073,beat:6,drum:108}
 ];
 const track=tracks[trackIndex],stepMs=60000/track.tempo/2;
 musicTimer=setInterval(()=>{
  if(!musicEnabled||!audioCtx||audioCtx.state!=='running')return;
  // If the player enters another world, switch to its soundtrack without restarting the app.
  const liveIndex=Math.max(0,Math.min(3,currentWorld<0?0:currentWorld));
  if(liveIndex!==musicTrackIndex){startMusic();return}
  const now=audioCtx.currentTime+.015,step=musicStep%16,semi=track.melody[step];
  musicTone(track.root*2*Math.pow(2/1,semi/12),now,stepMs/1000*.78,track.lead,track.leadVol);
  if(step%2===0){const b=track.bass[step];musicTone(track.root*Math.pow(2,b/12),now,stepMs/1000*1.45,track.wave,track.bassVol)}
  if(step%track.beat===0)musicKick(now);
  else if(step%4===2)musicTone(track.drum*9,now,.03,'square',trackIndex===2?.013:.008);
  if(step===7||step===15)musicTone(track.root*6,now,.05,'sine',.014,trackIndex===1?-8:5);
  musicStep=(musicStep+1)%16;
 },stepMs);
}

function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null}if(musicBus&&audioCtx){musicBus.gain.setTargetAtTime(0,audioCtx.currentTime,.035)}}

function updateMusicVolume(){if(musicBus&&audioCtx&&musicEnabled)musicBus.gain.setTargetAtTime(musicVolume,audioCtx.currentTime,.04)}

function sfx(type){if(!sfxEnabled)return;const now=performance.now();const minGap=type==='shoot'?95:type==='hit'?35:type==='text'?28:0;if(minGap&&now-(sfxLast[type]||0)<minGap)return;sfxLast[type]=now;const ac=ensureAudio();if(!ac)return;const presets={shoot:[560,230,.055,'square',.035],shoot_ember:[260,105,.095,'sawtooth',.045],shoot_frost:[760,420,.085,'triangle',.04],shoot_nova:[920,130,.19,'sawtooth',.035],hit:[220,95,.075,'triangle',.045],kill:[390,690,.12,'sine',.055],xp:[720,1080,.09,'sine',.035],damage:[155,70,.16,'sawtooth',.055],ultimate:[120,520,.38,'sawtooth',.075],portal:[330,880,.22,'sine',.05],ui:[520,660,.045,'sine',.025],text:[840,520,.025,'square',.012],dash:[260,720,.1,'triangle',.04],level:[660,990,.16,'sine',.045]};const q=presets[type]||presets.ui;try{const osc=ac.createOscillator(),gain=ac.createGain();osc.type=q[3];osc.frequency.setValueAtTime(q[0],ac.currentTime);osc.frequency.exponentialRampToValueAtTime(Math.max(35,q[1]),ac.currentTime+q[2]);gain.gain.setValueAtTime(q[4],ac.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+q[2]);osc.connect(gain);gain.connect(ac.destination);osc.start();osc.stop(ac.currentTime+q[2]+.01)}catch(e){}}
const narrative=createNarrativeSystem({overlay:$('overlay'),modal:$('modal'),getProgress:()=>saveData.storyProgress,saveProgress:()=>persist(),getCoreId:()=>core?.id,onStart:()=>{state='cutscene';last=performance.now()},onEnd:()=>{last=performance.now()},onSound:()=>sfx('ui'),onType:()=>sfx('text')});
let roomDialogueShown=new Set();const milestoneDeliveriesPresented=new Set();

})();
