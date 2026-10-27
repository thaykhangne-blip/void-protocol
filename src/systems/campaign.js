window.portalInteractionActive=false;
// CAMPAIGN MODULE
// Source fragment consumed by scripts/build.js. Do not import directly.

const narrative=createNarrativeSystem({overlay:$('overlay'),modal:$('modal'),getProgress:()=>saveData.storyProgress,saveProgress:()=>persist(),getCoreId:()=>core?.id,onStart:()=>{state='cutscene';last=performance.now()},onEnd:()=>{last=performance.now()},onSound:()=>sfx('ui'),onType:()=>sfx('text')});
let roomDialogueShown=new Set();const milestoneDeliveriesPresented=new Set();

function world(){return currentWorld===-1?tutorialWorld:(worlds[currentWorld]||worlds[0])}

function allWorldsCleared(){return worlds.length===4&&worlds.every((w,i)=>(Number(saveData.bestRooms?.[i])||0)>=w.rooms)}

function hardModeActive(){return currentWorld>=0&&!!saveData.hardModeByWorld?.[currentWorld]&&allWorldsCleared()}

function setWorldHardMode(index,enabled){if(index<0||index>=worlds.length||!allWorldsCleared())return;saveData.hardModeByWorld=saveData.hardModeByWorld||{};saveData.hardModeByWorld[index]=!!enabled;persist()}

function nativeElementForCore(id){return elements.find(e=>e.name===({ember:'FIRE',frost:'FROST',nova:'AETHER',remielle:'LUMINE',nature:'NATURE',flash:'LIGHTNING','elemental':'PRISM',vengeance:'BLOOD'}[id]||'AETHER'))||elements[2]}

function randomCargoDock(exclude){let pt={x:W/2,y:H/2};for(let i=0;i<40;i++){pt={x:rand(95,W-95),y:rand(85,H-85)};if(!exclude||dist(pt,exclude)>=Math.min(390,Math.min(W,H)*.72))break;}return pt;}

function createCargoRoute(delivered=0,total=10){const from=randomCargoDock(),to=randomCargoDock(from),swap=Math.random()<.5;return{from:swap?to:from,to:swap?from:to,fromLabel:swap?'B':'A',toLabel:swap?'A':'B',picked:false,delivered,total};}

function saveRunCheckpoint(){
 if(currentWorld<0||!player||!core)return;
 saveData.campaignCheckpoint={world:currentWorld,room:Math.max(1,Math.min(world().rooms,room||1)),cleared:cleared||0,updatedAt:Date.now(),runState:{coreId:core.id,player:JSON.parse(JSON.stringify(player)),build:JSON.parse(JSON.stringify(build||[])),level,xp,xpNext,shards,energy,kills,ultLevel,shopVisits,stageXpEarned,stageXpCap,roomPlan:JSON.parse(JSON.stringify(roomPlan||[])),worldState:{roomTime,spawnTimer,roomKills,roomType,roomObjective:JSON.parse(JSON.stringify(roomObjective||{})),blackHole:blackHole?(()=>{const savedHole=JSON.parse(JSON.stringify(blackHole));for(const key of ['hp','maxHp','fire','gravityTick'])if(savedHole[key]===null&&blackHole[key]===Infinity)savedHole[key]=Infinity;return savedHole})():null,enemies:JSON.parse(JSON.stringify(enemies||[])),natureDrones:JSON.parse(JSON.stringify(natureDrones||[])),enemyShots:JSON.parse(JSON.stringify(enemyShots||[])),bullets:JSON.parse(JSON.stringify(bullets||[])),lasers:JSON.parse(JSON.stringify(lasers||[])),xpDrops:JSON.parse(JSON.stringify(xpDrops||[])),portals:JSON.parse(JSON.stringify(portals||[])),environmentHazards:JSON.parse(JSON.stringify(environmentHazards||[])),defenseShip:defenseShip?JSON.parse(JSON.stringify(defenseShip)):null,cargoRoute:cargoRoute?JSON.parse(JSON.stringify(cargoRoute)):null,escortRoute:escortRoute?JSON.parse(JSON.stringify(escortRoute)):null,objectiveNodes:JSON.parse(JSON.stringify(objectiveNodes||[])),keyNodes:JSON.parse(JSON.stringify(keyNodes||[])),keyMaze:keyMaze?JSON.parse(JSON.stringify(keyMaze)):null,challengeModifier:challengeModifier?JSON.parse(JSON.stringify(challengeModifier)):null,hazardSpawnTimer,hazardHitCooldown,objectiveClearing,collapseTimer,collapseAge,roomTypeName:roomType,checkpointState:state}}};
 saveData.lastWorld=currentWorld;persist();
}

function start(resumeSavedRun=false){
 const unshownDelivery=(saveData.pendingVoidWeaponRewards||[])[0];if(unshownDelivery){showVoidWeaponDelivery(unshownDelivery,()=>start(resumeSavedRun));return;}
 // Release the world-selection preview as soon as gameplay starts; previews are procedural canvas effects, not reusable run assets.
 hoveredWorldPreview=null;lastWorldPreviewFrame=0;
 environmentHazards=[];hazardSpawnTimer=3.5;hazardHitCooldown=0;escortRoute=null;objectiveNodes=[];keyNodes=[];keyMaze=null;challengeModifier=null;featherTraps=[];roomDialogueShown=new Set();
 const checkpoint=resumeSavedRun&&saveData.campaignCheckpoint&&Number(saveData.campaignCheckpoint.world)===currentWorld?saveData.campaignCheckpoint:null;
 if(!resumeSavedRun)saveData.campaignCheckpoint=null;
 if(!resumeSavedRun)saveData.totalRuns=(saveData.totalRuns||0)+1;
 persist();player=newPlayer();bullets=[];lasers=[];lightningArcs=[];enemyShots=[];enemies=[];particles=[];damageTexts=[];xpDrops=[];portals=[];blackHole=null;
 room=checkpoint?Math.max(1,Math.min(world().rooms,Number(checkpoint.room)||1)):1;cleared=checkpoint?Math.max(0,Number(checkpoint.cleared)||room-1):0;
 kills=0;energy=0;shards=0;level=1;xp=0;xpNext=30;levelUpsPending=0;coreEvolutionQueue=[];pendingPortalReveal=false;pendingWorldComplete=false;pendingTutorialAdvance=false;stageXpEarned=0;stageXpCap=24;dash=0;dashCooldown=0;dashTrails=[];shopVisits=0;ultFx=[];skillMissiles=[];skillFx=[];ultLevel=0;ultCastFlash=0;build=[];core=null;element=null;
 roomPlan=checkpoint?.runState?.roomPlan?.length?checkpoint.runState.roomPlan:makeRoomPlan();
 const saved=checkpoint?.runState;
 if(saved&&saved.coreId&&Array.isArray(saved.build)&&saved.player&&typeof saved.player==='object'){
  const savedCore=cores.find(item=>item.id===saved.coreId);
  if(savedCore){core=savedCore;element=nativeElementForCore(savedCore.id);player=Object.assign(newPlayer(),saved.player);player.core=core;player.element=element;const restoredWeaponBonus=getVoidWeaponBonuses(saveData,core.id);player.voidWeaponPassive=restoredWeaponBonus.signaturePassive?.effectId||null;player.voidWeaponRefinementLevel=restoredWeaponBonus.refinementLevel||0;player.voidWeaponRank=restoredWeaponBonus.signaturePassive?.rank||0;player.voidWeaponDamageBonus=restoredWeaponBonus.stats.damage||0;if(!player.voidWeaponStatBonusesApplied){player.damage*=1+(restoredWeaponBonus.stats.atkPct||0)+(restoredWeaponBonus.stats.damage||0);player.critChance=Math.min(.95,(player.critChance||0)+(restoredWeaponBonus.stats.critChance||0));player.critDamage=(player.critDamage||1.8)+(restoredWeaponBonus.stats.critDamage||0);player.fireRate=(player.fireRate||1)*(1+(restoredWeaponBonus.stats.fireRate||0));player.maxHp=Math.round((player.maxHp||100)*(1+(restoredWeaponBonus.stats.hpPct||0)));player.hp=Math.min(player.hp||player.maxHp,player.maxHp);player.armor=Math.round((player.armor||0)*(1+(restoredWeaponBonus.stats.armorPct||0)));player.voidWeaponStatBonusesApplied=true;}build=saved.build;level=Math.max(1,Number(saved.level)||1);xp=Math.max(0,Number(saved.xp)||0);xpNext=Math.max(30,Number(saved.xpNext)||30);shards=Math.max(0,Number(saved.shards)||0);energy=Math.max(0,Number(saved.energy)||0);kills=Math.max(0,Number(saved.kills)||0);ultLevel=Math.max(0,Number(saved.ultLevel)||0);shopVisits=Math.max(0,Number(saved.shopVisits)||0);stageXpEarned=Math.max(0,Number(saved.stageXpEarned)||0);stageXpCap=Math.max(1,Number(saved.stageXpCap)||24);}
 }
 enterRoom();
 if(saved&&core){
  // enterRoom initializes a fresh encounter and clears temporary effects, so reapply the exact saved player state afterward.
  player=Object.assign(newPlayer(),saved.player);player.core=core;player.element=element;const restoredWeaponBonus=getVoidWeaponBonuses(saveData,core.id);player.voidWeaponPassive=restoredWeaponBonus.signaturePassive?.effectId||null;player.voidWeaponRefinementLevel=restoredWeaponBonus.refinementLevel||0;player.voidWeaponRank=restoredWeaponBonus.signaturePassive?.rank||0;player.voidWeaponDamageBonus=restoredWeaponBonus.stats.damage||0;if(!player.voidWeaponStatBonusesApplied){player.damage*=1+(restoredWeaponBonus.stats.atkPct||0)+(restoredWeaponBonus.stats.damage||0);player.critChance=Math.min(.95,(player.critChance||0)+(restoredWeaponBonus.stats.critChance||0));player.critDamage=(player.critDamage||1.8)+(restoredWeaponBonus.stats.critDamage||0);player.fireRate=(player.fireRate||1)*(1+(restoredWeaponBonus.stats.fireRate||0));player.maxHp=Math.round((player.maxHp||100)*(1+(restoredWeaponBonus.stats.hpPct||0)));player.hp=Math.min(player.hp||player.maxHp,player.maxHp);player.armor=Math.round((player.armor||0)*(1+(restoredWeaponBonus.stats.armorPct||0)));player.voidWeaponStatBonusesApplied=true;}
  const ws=saved.worldState;
  if(ws&&typeof ws==='object'){
   roomTime=Number(ws.roomTime)||0;spawnTimer=Number(ws.spawnTimer)||.8;roomKills=Number(ws.roomKills)||0;
   roomType=ws.roomType||roomType;roomObjective=ws.roomObjective||roomObjective;
   blackHole=ws.blackHole?JSON.parse(JSON.stringify(ws.blackHole)):blackHole;if(blackHole?.inactive){if(blackHole.hp==null)blackHole.hp=Infinity;if(blackHole.maxHp==null)blackHole.maxHp=Infinity;if(blackHole.fire==null)blackHole.fire=Infinity;if(blackHole.gravityTick==null)blackHole.gravityTick=Infinity;}
   enemies=Array.isArray(ws.enemies)?JSON.parse(JSON.stringify(ws.enemies)):[];
   natureDrones=Array.isArray(ws.natureDrones)?JSON.parse(JSON.stringify(ws.natureDrones)):[];player.natureDrones=natureDrones;
   enemyShots=Array.isArray(ws.enemyShots)?JSON.parse(JSON.stringify(ws.enemyShots)):[];
   bullets=Array.isArray(ws.bullets)?JSON.parse(JSON.stringify(ws.bullets)):[];
   lasers=Array.isArray(ws.lasers)?JSON.parse(JSON.stringify(ws.lasers)):[];
   xpDrops=Array.isArray(ws.xpDrops)?JSON.parse(JSON.stringify(ws.xpDrops)):[];
   portals=Array.isArray(ws.portals)?JSON.parse(JSON.stringify(ws.portals)):[];
   environmentHazards=Array.isArray(ws.environmentHazards)?JSON.parse(JSON.stringify(ws.environmentHazards)):[];
   defenseShip=ws.defenseShip?JSON.parse(JSON.stringify(ws.defenseShip)):null;
   cargoRoute=ws.cargoRoute?JSON.parse(JSON.stringify(ws.cargoRoute)):null;
   escortRoute=ws.escortRoute?JSON.parse(JSON.stringify(ws.escortRoute)):null;objectiveNodes=Array.isArray(ws.objectiveNodes)?JSON.parse(JSON.stringify(ws.objectiveNodes)):[];keyNodes=Array.isArray(ws.keyNodes)?JSON.parse(JSON.stringify(ws.keyNodes)):[];keyMaze=ws.keyMaze?JSON.parse(JSON.stringify(ws.keyMaze)):null;challengeModifier=ws.challengeModifier?JSON.parse(JSON.stringify(ws.challengeModifier)):null;
   hazardSpawnTimer=Number(ws.hazardSpawnTimer)||3.5;hazardHitCooldown=Number(ws.hazardHitCooldown)||0;
   // A campaign-menu save is taken from a paused active room. Never resume into a stale room-clear/collapse state.
   objectiveClearing=!!ws.objectiveClearing;collapseTimer=Number(ws.collapseTimer)||0;collapseAge=Number(ws.collapseAge)||0;pendingPortalReveal=!!ws.pendingPortalReveal;pendingWorldComplete=!!ws.pendingWorldComplete;
  }
  state='playing';hideModal();updateUI();last=performance.now();notify(saved.worldState?'RUN RESTORED · ROOM STATE RECOVERED':'RUN RESTORED · CORE, STATS AND BUILD RECOVERED');
 }
 else{showCoreSelection();state='menu'}
}

function makeRoomPlan(){
 if(currentWorld===-1)return [null,'horde','horde','horde','horde'];
 const total=world().rooms,plan=Array(total+1).fill('singularity');
 // Encounter pacing is deliberately authored in four acts: teach, vary, combine, then test mastery.
 // Boss rooms remain fixed milestones. Each act introduces mechanics before asking players to handle them under pressure.
 const acts={
  early:['singularity','singularity','horde','singularity'],
  standard:['horde','defense','cargo','survival','singularity','horde'],
  advanced:['ambush','escort','multiObjective','defense','cargo','horde','survival'],
  elite:['lockdown','challenge','ambush','escort','multiObjective','challenge']
 };
 let previous='';
 const choose=(pool)=>{let options=pool.filter(type=>type!==previous);if(!options.length)options=pool;const type=pick(options);previous=type;return type;};
 for(let n=1;n<=total;n++){
  if([5,10,15].includes(n)){plan[n]='miniboss';previous='miniboss';continue;}
  if(n===total){plan[n]='finalboss';continue;}
  let pool;
  if(n<=4)pool=acts.early;
  else if(n<=9)pool=acts.standard;
  else if(n<=14)pool=acts.advanced;
  else pool=acts.elite;
  // Seed a recognizable ramp: early rooms teach the core loop; advanced objectives arrive only after the first miniboss.
  if(n===1)plan[n]='singularity';
  else if(n===2)plan[n]='horde';
  else if(n===3)plan[n]='singularity';
  else if(n===4)plan[n]='horde';
  else plan[n]=choose(pool);
 }
 // Keep the fixed milestones readable and guarantee at least one introduction to each advanced objective by the late game.
 if(total>=20){plan[16]='lockdown';plan[18]='challenge';plan[19]='multiObjective';}
 return plan;
}

function restorePhaseFlowStats(){if(!player)return;if(player.phaseFlowBaseRate!==null&&player.phaseFlowBaseRate!==undefined)player.fireRate=player.phaseFlowBaseRate;player.phaseFlowCritBonus=0;player.phaseFlowBaseCrit=null;player.phaseFlowBaseRate=null;player.phaseFlowBaseSpeed=null;player.skillShield=0;player.skillShieldHp=0;player.skillShieldMax=0;}

function clearAuralisRoomEffects(){if(core?.id!=='remielle'||!player)return;restorePhaseFlowStats();player.skillActive=0;player.phaseFlowTick=0;skillFx=skillFx.filter(fx=>!['phaseFlow','lightLance'].includes(fx.type));updateUI();}

function roomTypeName(){return ({singularity:'SINGULARITY HUNT',miniboss:'MINI-BOSS ENCOUNTER',finalboss:'FINAL BOSS',horde:'HOSTILE SWARM',defense:'SHIP DEFENSE',cargo:'CARGO RUN',survival:'SURVIVAL',ambush:'AMBUSH WAVES',escort:'SHIP ESCORT',multiObjective:'BEACON CONTROL',lockdown:'KEY HUNT',challenge:'HIGH-RISK CHALLENGE'})[roomType]||'COMBAT'}

function clearFlashRoomEffects(){if(player){player.flashFieldTimer=0;player.flashFieldTick=0;player.flashLinkTimer=0;player.flashLinkTargets=[];}for(const e of enemies){e.flashLinkedUntil=0;e.flashLinkGroup=[];e.stunned=0;}lightningArcs=[];skillFx=skillFx.filter(fx=>!['flashStormField','flashLinkPulse','flashStun'].includes(fx.type));}

function clearNatureRoomEffects(){skillFx=skillFx.filter(fx=>!['natureVine','natureRay','vineLeaf','vineImpact','natureHeal','natureMuzzle','natureDroneVine','natureOverdrive','natureOverdrivePulse'].includes(fx.type));bullets=bullets.filter(b=>!b.natureDroneShot&&!b.natureDroneVine);damageTexts=damageTexts.filter(d=>!String(d.text||'').includes('HP'));}

function completeObjectiveRoom(){if(state!=='playing'||objectiveClearing)return;if(roomType==='challenge'&&challengeModifier){addShards(challengeModifier.bonusShards);notify(`CONTRACT CLEARED · +${challengeModifier.bonusShards} BONUS SHARDS`);}objectiveClearing=true;clearFxType=roomType;clearAuralisRoomEffects();clearFlashRoomEffects();clearNatureRoomEffects();state='collapse';collapseTimer=1.15;collapseAge=0;pendingPortalReveal=false;enemies=[];enemyShots=[];bullets=[];lasers=[];addEnergy(15);blackHole={x:W/2,y:H/2,r:8,baseR:8,hp:Infinity,maxHp:Infinity,spin:0,elite:false,isFinalBoss:false,isObjectiveClear:true,inactive:true,fire:Infinity,gravityTick:Infinity,age:0,kills:0,dangerRadius:0};notify('OBJECTIVE COMPLETE · +15 ENERGY');for(let i=0;i<32;i++)burst(W/2+rand(-50,50),H/2+rand(-40,40),pick(['#72f6ff','#83ffc5','#ffe38a']),2)}

function failDefense(){if(state==='dead')return;state='dead';saveData.bestRooms[currentWorld]=Math.max(saveData.bestRooms[currentWorld]||0,cleared);persist();showModal('ESCORT DESTROYED','SHIP LOST','The ship was destroyed before the defense timer expired. The void has a truly terrible logistics department.',[{glyph:'↻',title:'REBOOT PARTICLE',desc:'Start a new run with a fresh core and build.',action:()=>{run++;start()}}])}

function clearRoomProjectiles(){bullets.length=0;lasers.length=0;enemyShots.length=0;skillMissiles.length=0;lightningArcs.length=0;particles.length=0;damageTexts.length=0;skillFx=[];ultFx=[];featherTraps=[];}

function enterRoom(){
 // Start each new room with the core entering from a random edge.
 if(player){
  const entry=randomCoreEdge(),pad=(player.r||12)+10;
  player.roomEntry={elapsed:0,duration:.72,startX:entry.edge==='left'?-pad:entry.edge==='right'?W+pad:entry.x,startY:entry.edge==='top'?-pad:entry.edge==='bottom'?H+pad:entry.y,targetX:W/2,targetY:H/2};
  player.x=player.roomEntry.startX;player.y=player.roomEntry.startY;
 }
 // Room transitions must always release Aether's Black Sun auto-attack lock from the previous room.
 shootCd=0;if(player)player.voidWeaponOnPrimaryAttack=null;
 if(currentWorld>=0&&room===10){
  const evidence=corporateMemos.find(entry=>entry.worldIndex===currentWorld&&entry.unlockRoom===10);
  if(evidence&&!saveData.storyProgress.recoveredFiles.includes(evidence.id)){
   saveData.storyProgress.recoveredFiles.push(evidence.id);persist();
   if(typeof toast==='function')toast('CLASSIFIED RECORD RECOVERED');
  }
 }roomCombatStats={damageDealt:0,healingReceived:0,damageReceived:0};updateCombatStatsUI();clearRoomProjectiles();clearFlashRoomEffects();clearAuralisRoomEffects();clearNatureRoomEffects();featherTraps=[];remielleFeathersSpawnedThisRoom=0;skillFx=[];ultFx=[];if(player){if(player.phaseFlowBaseRate!==null&&player.phaseFlowBaseRate!==undefined)restorePhaseFlowStats();if((player.natureUltBuffTimer||0)>0){player.damage/=player.natureUltDamageMult||1;player.fireRate/=player.natureUltRateMult||1;}player.natureUltBuffTimer=0;player.natureOverdrive=0;player.natureUltDamageMult=1;player.natureUltRateMult=1;player.natureUltHealMult=1;player.frostStormTimer=0;player.frostStormTick=0;player.frostStormPower=1;player.flashFieldTimer=0;player.flashFieldTick=0;player.flashFieldPower=1;player.voidflareDotTimer=0;player.voidflareDotDps=0;player.voidflareDotTick=0;player.ultHaste=0;if(core?.id==='vengeance'&&(player.bloodlettingMaxHpPenalty||0)>0){player.maxHp+=player.bloodlettingMaxHpPenalty;player.bloodlettingMaxHpPenalty=0;player.bloodlettingTimer=0;player.hp=Math.min(player.hp,player.maxHp);}player.vengeanceUltTimer=0;player.vengeanceShieldHp=0;player.vengeanceShieldCap=0;player.vengeanceShieldDuration=0;player.skillActive=0;player.skillShield=0;player.skillShieldHp=0;player.skillShieldMax=0;player.inv=0;player.bound=0;player.frozen=0;player.slow=0;player.burn=0;player.burnDps=0;player.burnTick=0;player.natureBind=0;player.natureOverdriveBind=0;player.flashFieldTimer=0;player.flashLinkTimer=0;player.flashLinkTargets=[];}stageXpEarned=0;stageXpCap=Math.max(36,Math.round(xpRequired(level)*1.25));portals=[];clearRoomProjectiles();enemies=[];roomTime=0;spawnTimer=.8;objectiveClearing=false,pendingCoreSkill=false,clearFxType='singularity';roomKills=0;defenseShip=null;cargoRoute=null;escortRoute=null;objectiveNodes=[];keyNodes=[];challengeModifier=null;const miniBossRoom=currentWorld!==-1&&[5,10,15].includes(room),finalBossRoom=currentWorld!==-1&&room===20;roomType=miniBossRoom?'miniboss':finalBossRoom?'finalboss':(roomPlan[room]||'singularity');const coreActive=['singularity','miniboss','finalboss'].includes(roomType);roomObjective={type:roomType,kills:0,target:currentWorld===-1?([0,2,3,3,4][room]||3):roomType==='ambush'?12+Math.ceil(room*.65)+currentWorld*2:10+Math.ceil(room*1.1)+currentWorld*2+Math.floor(Math.max(0,level-1)/8),duration:['survival','escort'].includes(roomType)?(currentWorld===-1?22:30+Math.min(15,room*.35)):currentWorld===-1?18:35,progress:0,bonus:0};const lateStageCoreFactor=currentWorld===-1||room<10?1:1.25+(room-10)*.075+Math.pow((room-10)/10,2)*.25;const coreHp=Math.round((finalBossRoom?1850+currentWorld*420:135+room*17)*(1+(level-1)*.078)*(1+currentWorld*.18+Math.pow(currentWorld,2)*.012)*(1+room*.022+Math.pow(room,1.2)*.003+Math.pow(room/20,2)*.08)*(currentWorld===-1?1:finalBossRoom?2.4:miniBossRoom?2.0:(2.5+currentWorld*.75)*(room>=10?1.35:1))*lateStageCoreFactor);if(coreActive){const progression=1+Math.max(0,level-1)*.035+Math.max(0,cleared)*.012;blackHole={x:rand(170,W-170),y:rand(120,H-120),r:finalBossRoom?43:19,baseR:finalBossRoom?43:19,hp:Math.round(coreHp*(finalBossRoom?progression*1.18:progression)),maxHp:Math.round(coreHp*(finalBossRoom?progression*1.18:progression)),spin:0,elite:finalBossRoom||miniBossRoom,isFinalBoss:finalBossRoom,fire:finalBossRoom?.95:miniBossRoom?1.15:1.6,gravityTick:finalBossRoom?.9:1.2,age:0,kills:0,dangerRadius:finalBossRoom?220:miniBossRoom?190:172,shieldHp:0,shieldMax:0,shieldRecasts:0,shieldCooldown:rand(10,14),singularityShieldTimer:rand(8,12),singularityShieldActive:0,halfHpMinionsSpawned:false,minionTimer:2.8,bossPhase:1,breakVulnerable:0,breakRecover:0,breakMaxHp:Math.round(coreHp*(.18+currentWorld*.025)),breakHp:Math.round(coreHp*(.18+currentWorld*.025)),debuffTimer:5,variant:(room===5?0:room===10?1:2)};}else{blackHole={x:-1000,y:-1000,r:1,baseR:1,hp:Infinity,maxHp:Infinity,spin:0,elite:false,isFinalBoss:false,inactive:true,fire:Infinity,gravityTick:Infinity,age:0,kills:0,dangerRadius:0};}if(hardModeActive()&&blackHole&&!blackHole.inactive&&Number.isFinite(blackHole.hp)){blackHole.hp=Math.round(blackHole.hp*1.65);blackHole.maxHp=blackHole.hp;blackHole.dangerRadius*=1.12;blackHole.fire=Math.max(.55,(blackHole.fire||1)*.82);blackHole.gravityTick=Math.max(.55,(blackHole.gravityTick||1)*.82);}if(roomType==='defense'||roomType==='escort')defenseShip={x:W*.5,y:H*.5,r:22,hp:currentWorld===-1?900:roomType==='escort'?560:420,maxHp:currentWorld===-1?900:roomType==='escort'?560:420};if(hardModeActive()&&defenseShip){defenseShip.hp=Math.round(defenseShip.hp*1.35);defenseShip.maxHp=defenseShip.hp;}if(roomType==='escort'){escortRoute={points:[{x:W*.18,y:H*.25},{x:W*.82,y:H*.25},{x:W*.82,y:H*.75},{x:W*.18,y:H*.75},{x:W*.5,y:H*.5}],index:0,speed:Math.max(34,Math.min(W,H)*.13)};roomObjective.duration=currentWorld===-1?22:42;}if(roomType==='cargo')cargoRoute=createCargoRoute(0,currentWorld===-1?3:10);if(roomType==='multiObjective'){objectiveNodes=Array.from({length:3},(_,i)=>({x:W*(.22+i*.28),y:H*(i===1?.72:.30),r:25,progress:0,captured:false,label:['A','B','C'][i],color:['#72f6ff','#ffe38a','#c29aff'][i]}));roomObjective.target=3;}if(roomType==='lockdown'){keyMaze=createKeyMaze();keyNodes=keyMaze.keys;roomObjective.target=3;}if(roomType==='challenge'){challengeModifier=pick([{name:'OVERCHARGED',enemyHp:1.18,enemyDamage:1.48,bonusShards:110+room*5},{name:'FRAGILE REALITY',enemyHp:1.55,enemyDamage:1.15,bonusShards:120+room*5},{name:'NO SAFE ZONE',enemyHp:1.28,enemyDamage:1.30,bonusShards:130+room*5}]);roomObjective.target=8+Math.floor(room/4)+Math.max(0,currentWorld);roomObjective.kills=0;roomObjective.bonus=challengeModifier.bonusShards;}player.x=W/2;player.y=H/2;if(roomType==='lockdown'&&keyMaze){player.x=keyMaze.start.x;player.y=keyMaze.start.y;}player.inv=1.5;if(currentWorld===-1&&room===4)energy=100;if(miniBossRoom)spawnMiniBoss();if(finalBossRoom)notify(`${world().name} · FINAL BOSS: ${world().boss}`);else if(miniBossRoom)notify(`${world().name} · MINI-BOSS DETECTED`);else if(roomType==='singularity')notify(`${world().name} · GRAVITY WELL DETECTED`);else if(roomType==='horde')notify(currentWorld===-1?`TRAINING DRILL ${room}/4 · PRACTICE AND CLEAR THE DRONES`:`CLEAR THE SWARM · ELIMINATE ${roomObjective.target} HOSTILES`);else if(roomType==='defense')notify('SHIP DEFENSE · SURVIVE FOR 35 SECONDS');else if(roomType==='cargo')notify('CARGO RUN · COMPLETE 10 SHIP-TO-SHIP DELIVERIES');else if(roomType==='survival')notify(`SURVIVE FOR ${roomObjective.duration} SECONDS`);else if(roomType==='ambush')notify(`AMBUSH · ELIMINATE ${roomObjective.target} HOSTILES`);else if(roomType==='escort')notify(`SHIP ESCORT · REACH ALL ${escortRoute.points.length} WAYPOINTS`);else if(roomType==='multiObjective')notify('BEACON CONTROL · CAPTURE ALL 3 BEACONS');else if(roomType==='lockdown')notify('KEY HUNT · FIND ALL 3 ACCESS KEYS');else if(roomType==='challenge')notify(`HIGH-RISK CONTRACT · ${challengeModifier.name} · ELIMINATE ${roomObjective.target} HOSTILES · BONUS ${challengeModifier.bonusShards} SHARDS`);$('phase').textContent=`W${currentWorld+1} · RUN ${String(run).padStart(2,'0')} · ${String(room).padStart(2,'0')}/${world().rooms}`;if(currentWorld===-1&&player&&core)showTutorialTip()}

function createKeyMaze(){const cols=15,rows=9,cell=Math.max(28,Math.min(44,Math.floor(Math.min((W-48)/cols,(H-110)/rows)))),ox=Math.round((W-cols*cell)/2),oy=Math.round((H-rows*cell)/2);const grid=Array.from({length:rows},()=>Array(cols).fill(1)),stack=[[1,1]];grid[1][1]=0;while(stack.length){const [x,y]=stack[stack.length-1],dirs=[[0,-2],[2,0],[0,2],[-2,0]].sort(()=>Math.random()-.5),next=dirs.map(([dx,dy])=>[x+dx,y+dy,dx,dy]).find(([nx,ny])=>nx>0&&ny>0&&nx<cols-1&&ny<rows-1&&grid[ny][nx]===1);if(!next){stack.pop();continue;}const [nx,ny,dx,dy]=next;grid[y+dy/2][x+dx/2]=0;grid[ny][nx]=0;stack.push([nx,ny]);}const walls=[];for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(grid[y][x])walls.push({x:ox+x*cell,y:oy+y*cell,w:cell,h:cell});const start={x:ox+cell*1.5,y:oy+cell*1.5};const queue=[[1,1,0]],seen=new Set(['1,1']),reachable=[];while(queue.length){const [x,y,d]=queue.shift();if(grid[y]?.[x]===0)reachable.push({x,y,d});for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx>0&&ny>0&&nx<cols-1&&ny<rows-1&&grid[ny][nx]===0&&!seen.has(k)){seen.add(k);queue.push([nx,ny,d+1]);}}}reachable.sort((a,b)=>b.d-a.d);const picks=[reachable[Math.floor(reachable.length*.18)],reachable[Math.floor(reachable.length*.52)],reachable[0]].filter(Boolean);const keys=picks.map((p,i)=>({x:ox+(p.x+.5)*cell,y:oy+(p.y+.5)*cell,r:10,collected:false,index:i+1}));return {cols,rows,cell,ox,oy,walls,start,keys};}

function mazeBlocked(x,y,r){if(roomType!=='lockdown'||!keyMaze)return false;for(const wall of keyMaze.walls){const nx=Math.max(wall.x,Math.min(x,wall.x+wall.w)),ny=Math.max(wall.y,Math.min(y,wall.y+wall.h));if((x-nx)**2+(y-ny)**2<(r+1)*(r+1))return true;}return false;}

function spawnEnemy(){if(currentWorld===-1&&enemies.filter(e=>e.hp>0).length>=([0,2,2,3,3][room]||3))return false;let side=Math.floor(Math.random()*4),x=side===0?0:side===1?W:rand(0,W),y=side===2?0:side===3?H:rand(0,H);if(Math.hypot(x-player.x,y-player.y)<150){x=x<W/2?W:0;y=rand(0,H)}const allEnemySpecs=world().enemies;let enemyPool;if(currentWorld===-1){const tutorialMaxRoleIndex=room<=2?1:room===3?2:room===4?3:room===5?5:allEnemySpecs.length-1;enemyPool=allEnemySpecs.slice(0,tutorialMaxRoleIndex+1);}else{const roleUnlockRoom={chaser:1,runner:1,shooter:1,tank:5,hunter:8,artillery:11,rammer:14,warden:17};enemyPool=allEnemySpecs.filter(spec=>(roleUnlockRoom[spec.role]??20)<=room);if(room>=20)enemyPool=allEnemySpecs;}const spec=pick(enemyPool);const lateStageFactor=currentWorld===-1||room<10?1:1.25+(room-10)*.075+Math.pow((room-10)/10,2)*.25;const lateDamageFactor=currentWorld===-1||room<10?1:1.15+(room-10)*.045+Math.pow((room-10)/10,2)*.15;const lateSpeedFactor=currentWorld===-1||room<10?1:1.05+(room-10)*.012;const nexusUpgrades=saveData.coreUpgrades||{};const nexusThreatBonus=Math.min(.42,(Number(nexusUpgrades.atk)||0)*.035+(Number(nexusUpgrades.rate)||0)*.018+(Number(nexusUpgrades.hull)||0)*.012+(Number(nexusUpgrades.armor)||0)*.012+(Number(nexusUpgrades.speed)||0)*.01);const runThreatBonus=Math.min(.24,Math.max(0,level-1)*.006);const scale=(1+room*.078+(level-1)*.07+Math.pow(room/20,2)*.08)*(currentWorld===-1?.48:(1+currentWorld*.19+Math.pow(currentWorld,2)*.018))*(1+nexusThreatBonus+runThreatBonus)*lateStageFactor*(challengeModifier?.enemyHp||1);const baseHp=['tank','warden'].includes(spec.role)?48+room*3.2:['shooter','artillery'].includes(spec.role)?34+room*2.5:29+room*2.2;const hp=Math.round(baseHp*scale*spec.hp);const speedBase=({shooter:58,artillery:48,tank:rand(42,55),warden:47,rammer:rand(65,78),hunter:rand(112,132),runner:rand(105,124)})[spec.role]??rand(72,94);const damageBase=({tank:22,warden:15,shooter:12,artillery:16,runner:15,hunter:16,rammer:21})[spec.role]??17;const enemy={id:'enemy-'+Math.random().toString(36).slice(2),x,y,r:['tank','warden'].includes(spec.role)?12:['shooter','artillery'].includes(spec.role)?9:8,hp,maxHp:hp,speed:(speedBase+room*(['tank','warden'].includes(spec.role)?.5:1.2))*spec.speed*(currentWorld===-1?.78:(1+Math.min(.28,level*.008)+room*.001+currentWorld*.018))*lateSpeedFactor,damage:damageBase*(1+room*.021+(level-1)*.028+Math.pow(room/20,2)*.045)*(currentWorld===-1?.42:(1+currentWorld*.065+Math.pow(currentWorld,2)*.012))*(1+Math.min(.22,nexusThreatBonus*.55+runThreatBonus*.45))*lateDamageFactor*spec.damage*(challengeModifier?.enemyDamage||1),type:spec.type,role:spec.role,color:spec.color,cd:rand(.8,1.6),slow:0,burn:0,frostStacks:0,frozen:0,telegraph:0,shieldHp:0,shieldMax:0,shieldPulse:rand(.5,1.6),chargeTime:0,chargeWindup:0,chargeX:0,chargeY:0,chargeVx:0,chargeVy:0};if(roomType==='challenge'){enemy.isElite=true;enemy.hp=Math.round(enemy.hp*2.15);enemy.maxHp=enemy.hp;enemy.damage*=1.7;enemy.speed*=1.12;enemy.shieldMax=Math.round(enemy.hp*.22);enemy.shieldHp=enemy.shieldMax;}if(hardModeActive()){enemy.hp=Math.round(enemy.hp*1.65);enemy.maxHp=enemy.hp;enemy.damage*=1.35;enemy.speed*=1.12;enemy.hardShieldTimer=rand(5,9);enemy.hardShieldActive=0;enemy.hardShieldCycle=rand(11,15);}enemies.push(enemy)}

function spawnBossMinion(kind='mini'){if(!player||!blackHole||enemies.filter(e=>e.hp>0&&!e.isMiniBoss).length>=20)return;const angle=rand(0,Math.PI*2),radius=rand(90,155),x=Math.max(18,Math.min(W-18,blackHole.x+Math.cos(angle)*radius)),y=Math.max(18,Math.min(H-18,blackHole.y+Math.sin(angle)*radius));const scale=(1+room*.065+Math.max(0,level-1)*.055)*(1+Math.max(0,currentWorld)*.16);const hp=Math.round((kind==='boss'?48:35)*scale*(kind==='boss'?10:8)),worldColors=['#ff865f','#80eaff','#8bffc7','#d5a0ff'];const guardian={id:'guardian-minion-'+Math.random().toString(36).slice(2),x,y,r:kind==='boss'?10:9,hp,maxHp:hp,speed:(kind==='boss'?115:96)*(1+Math.max(0,currentWorld)*.08),damage:(kind==='boss'?16:12)*(1+room*.018+Math.max(0,level-1)*.025)*(1+Math.max(0,currentWorld)*.09),type:kind==='boss'?'SINGULARITY GUARD':'CORE WARDEN',role:'hunter',color:worldColors[Math.max(0,currentWorld)]||'#d5a0ff',cd:rand(.6,1.2),slow:0,burn:0,frostStacks:0,frozen:0,telegraph:0,shieldHp:0,shieldMax:0,guardianMinion:true};if(hardModeActive()){guardian.hp=Math.round(guardian.hp*1.65);guardian.maxHp=guardian.hp;guardian.damage*=1.35;guardian.speed*=1.12;guardian.hardShieldTimer=rand(5,9);guardian.hardShieldActive=0;guardian.hardShieldCycle=rand(11,15);}enemies.push(guardian);burst(x,y,worldColors[Math.max(0,currentWorld)]||'#d5a0ff',9);sfx('portal');}

function applyWorldBossDebuff(bh){if(!player||!bh)return;const worldIndex=Math.max(0,currentWorld);if(worldIndex===0){player.burn=Math.max(player.burn||0,3.5);player.burnDps=Math.max(player.burnDps||0,Math.max(4,player.maxHp*.025));burst(player.x,player.y,'#ff9c65',12);notify('BOSS CURSE · IGNITED');}else if(worldIndex===1){player.frozen=Math.max(player.frozen||0,1.1);player.slow=Math.max(player.slow||0,2.4);burst(player.x,player.y,'#8cecff',14);notify('BOSS CURSE · FROSTBOUND');}else if(worldIndex===2){player.bound=Math.max(player.bound||0,1.8);burst(player.x,player.y,'#8bffc7',14);notify('BOSS CURSE · ROOT BIND');}else{const angle=Math.atan2(player.y-bh.y,player.x-bh.x);for(let i=0;i<3;i++){const a=angle+(i-1)*.32;enemyShots.push({x:bh.x+Math.cos(a)*bh.r,y:bh.y+Math.sin(a)*bh.r,vx:Math.cos(a)*235,vy:Math.sin(a)*235,r:6,life:4,color:'#d6a0ff',homing:true,turnRate:2.2,damage:18+currentWorld*4});}burst(bh.x,bh.y,'#d6a0ff',12);notify('BOSS CURSE · HOMING MISSILES');}sfx('damage');}

function spawnMiniBoss(){const lateStageFactor=currentWorld===-1||room<10?1:1.25+(room-10)*.075+Math.pow((room-10)/10,2)*.25;const lateDamageFactor=currentWorld===-1||room<10?1:1.15+(room-10)*.045+Math.pow((room-10)/10,2)*.15;const hp=Math.round((620+room*58+Math.pow(room,1.2)*2)*(1+(level-1)*.078)*(1+currentWorld*.22+Math.pow(currentWorld,2)*.012)*lateStageFactor);const colors=['#ff754f','#78eaff','#86ffc2','#d4a0ff'];const names=['CINDER JUGGERNAUT','CRYO WARDEN','VERDANT EXECUTIONER','RIFT COLOSSUS'];const color=colors[currentWorld]||'#d4a0ff';const miniBoss={id:'miniboss-'+currentWorld+'-'+room+'-'+Math.random().toString(36).slice(2),x:player.x<W/2?W-70:70,y:rand(90,H-90),r:23,hp,maxHp:hp,speed:(48+room*.7+currentWorld*5)*(1+Math.min(.15,(level-1)*.004)+currentWorld*.025)*(currentWorld!==-1&&room>=10?1.05+(room-10)*.012:1),damage:(24+room*.65+currentWorld*5)*(1+(level-1)*.025)*(1+currentWorld*.04)*lateDamageFactor,type:names[currentWorld]||'VOID CHAMPION',role:'miniboss',isMiniBoss:true,color,cd:1.25,slow:0,burn:0,frostStacks:0,frozen:0,minionTimer:2.2,shieldTriggered:false,shieldHp:0,shieldMax:0,shieldPulse:0,shieldCooldown:rand(7,11),shieldRecasts:0};if(hardModeActive()){miniBoss.hp=Math.round(miniBoss.hp*1.65);miniBoss.maxHp=miniBoss.hp;miniBoss.damage*=1.35;miniBoss.speed*=1.12;}enemies.push(miniBoss);}

function finishPortalRoom(){
 if(roomTransition||portalTransition)return;
 roomTransition={phase:'out',elapsed:0,fadeOut:.22,fadeIn:.38,callback:finishPortalRoomNow};
 state='roomTransition';hideModal();return;
}

function finishPortalRoomNow(){
 window.portalInteractionActive=false;
 if(player&&(player.repairMatrix||0)>0){const restored=Math.min(Math.max(0,player.maxHp-player.hp),8*Math.min(3,player.repairMatrix));if(restored>0){player.hp+=restored;recordCombatMetric('healingReceived',restored);damageTexts.push({x:player.x+rand(-4,4),y:player.y-player.r-10,vx:0,vy:-34,life:1.05,max:1.05,text:'+'+Math.round(restored)+' HP',color:'#83ffc5',crit:false});burst(player.x,player.y,'#83ffc5',5);}}cleared++;if(currentWorld>=0){saveData.campaignCheckpoint={world:currentWorld,room:Math.min(world().rooms,room+1),cleared:cleared,updatedAt:Date.now()};saveData.lastWorld=currentWorld;persist()}if(room>=world().rooms){saveData.bestRooms[currentWorld]=Math.max(saveData.bestRooms[currentWorld]||0,world().rooms);saveData.campaignCheckpoint=null;persist();completeWorld();return}room++;enterRoom();saveRunCheckpoint();state='playing';hideModal();last=performance.now();updateUI()}

function continueAfterRoomClear(){
 if(pendingWorldComplete){pendingWorldComplete=false;completeWorld();return;}
 if(pendingPortalReveal){pendingPortalReveal=false;showPortals();return;}
 if(pendingTutorialAdvance){pendingTutorialAdvance=false;if(room>=world().rooms){state='tutorialcomplete';tutorialTipVisible=false;$('tutorialTip').hidden=true;showModal('TRAINING SIMULATION · COMPLETE','YOU ARE READY','', [{title:'RETURN TO WORLD SELECT',glyph:'⌂',color:'#72f6ff',desc:'Confirm to return to campaign select.',action:()=>{if(window.__voidTutorialTypeTimer)clearInterval(window.__voidTutorialTypeTimer);hideModal();state='worldselect';showWorldSelect();}}]);const modal=$('modal'),message='MOVEMENT CALIBRATED. DASH PROTOCOL VERIFIED. CORE SKILL ONLINE. ULTIMATE DISCHARGED. TRAINING COMPLETE. YOUR CAMPAIGN BEGINS NOW.';const desc=modal.querySelector('p');desc.classList.add('tutorial-typewriter');desc.textContent='';if(window.__voidTutorialTypeTimer)clearInterval(window.__voidTutorialTypeTimer);let typeIndex=0;window.__voidTutorialTypeTimer=setInterval(()=>{if(state!=='tutorialcomplete'||!desc.isConnected){clearInterval(window.__voidTutorialTypeTimer);return;}desc.textContent=message.slice(0,++typeIndex);if(typeIndex%3===0)sfx('text');if(typeIndex>=message.length)clearInterval(window.__voidTutorialTypeTimer);},28);return;}room++;enterRoom();state='playing';hideModal();last=performance.now();updateUI();}
}

function randomCoreEdge(){
 const edge=Math.floor(Math.random()*4);
 const pad=(player?.r||12)+10;
 if(edge===0)return {edge:'top',x:W/2,y:pad};
 if(edge===1)return {edge:'bottom',x:W/2,y:H-pad};
 if(edge===2)return {edge:'left',x:pad,y:H/2};
 return {edge:'right',x:W-pad,y:H/2};
}
function showPortals(){
 // Safety net: every campaign milestone must present its delivery before room dialogue.
 if(currentWorld>=0&&[5,10,15,20].includes(room)){
  const milestoneKey=`${currentWorld}:${room}`;
  if(!milestoneDeliveriesPresented.has(milestoneKey)){
   const pending=(saveData.pendingVoidWeaponRewards||[]).find(item=>Number(item.worldId)===Number(currentWorld)&&Number(item.roomNumber)===Number(room));
   let delivery=pending;
   if(!delivery){
    const roll=Math.random();let rarity=null;
    if(roll<.05)rarity='legendary';else if(roll<.17)rarity='unique';else if(roll<.50)rarity='rare';
    if(rarity){const pool=voidWeapons.filter(weapon=>weapon.rarity===rarity);const weapon=pool[Math.floor(Math.random()*pool.length)];const grant=grantVoidWeaponToSave(saveData,weapon.id,1);saveData=grant.saveData;delivery={type:'weapon',weaponId:weapon.id,rarity:weapon.rarity,convertedFragments:grant.convertedFragments||0,worldId:currentWorld,roomNumber:room,claimKey:`fallback:${currentWorld}:${room}:${Date.now()}`};}
    else{const amount=15+currentWorld*5;saveData.coreCurrency=(saveData.coreCurrency||0)+amount;delivery={type:'nexus-fragments',amount,worldId:currentWorld,roomNumber:room,claimKey:`fallback:${currentWorld}:${room}:${Date.now()}`};}
    saveData.pendingVoidWeaponRewards=[...(saveData.pendingVoidWeaponRewards||[]),delivery];persist();
   }
   milestoneDeliveriesPresented.add(milestoneKey);
   showVoidWeaponDelivery(delivery,()=>showPortals());
   return;
  }
 }
 // Portal selection is an in-run canvas state, not a menu. Remove any stale menu back controls.
 document.querySelectorAll('#worldHoloBack,.world-holo-back').forEach(button=>button.remove());
 const dialogueScene=currentWorld>=0?inRunCommsScenes.find(scene=>scene.worldIndex===currentWorld&&scene.room===room):null;
 if(dialogueScene&&!roomDialogueShown.has(room)){
  roomDialogueShown.add(room);
  const evidenceId=['log-ashen-safety','log-cryo-shutdown','log-verdant-vendor','log-event-core-memory'][currentWorld];
  const hasEvidence=saveData.storyProgress.recoveredFiles.includes(evidenceId);
  const sceneForPlay=room===18&&hasEvidence?{...dialogueScene,subtitle:'Recovered evidence has changed the shape of the transmission.',lines:[...dialogueScene.lines,{speaker:'THE CORE',role:'CROSS-REFERENCED RECORD',text:['The containment risk was recorded before deployment. They sent you anyway.','The shutdown request was rejected by every department. The crew paid for their indecision.','The procurement file confirms the savings depended on removing support. The system was left to fail alone.','I followed both preservation and deletion orders. They called the contradiction my malfunction.'][currentWorld]}]}:dialogueScene;
  narrative.play(sceneForPlay,{force:true,markSeen:true,presentation:'field',onComplete:()=>showPortals()});return;
 }
 awardCoreCurrency();
 // Exit toward a random edge, then enter portal selection from the opposite side.
 const exit=randomCoreEdge(),opposite={top:'bottom',bottom:'top',left:'right',right:'left'}[exit.edge];
 player.portalExitEdge=exit.edge;
 player.portalDeparture={elapsed:0,duration:.55,startX:player.x,startY:player.y,targetX:exit.x,targetY:exit.y,edge:exit.edge,arrivalEdge:opposite};
 player.portalArrival=null;
 clearRoomProjectiles();clearAuralisRoomEffects();clearNatureRoomEffects();featherTraps=[];state='portalDepart';blackHole=null;enemies=[];
 const perksInBuild=(build||[]).filter(Boolean);
 const exchangeFrom=perksInBuild.length?pick(perksInBuild):'No existing perk';
 const exchangeOptions=createGeneralPerks().filter(p=>perkAvailable(p));
 const exchangeTo=exchangeOptions.length?pick(exchangeOptions):null;
 const pool=[
  {type:'heal',color:'#83ffc5',glyph:'✚',label:'REPAIR GATE',desc:'Restore 40% of your core hull'},
  {type:'exchange',color:'#d2a0ff',glyph:'⇄',label:'PERK EXCHANGE',desc:exchangeTo?'Exchange '+exchangeFrom+' for '+exchangeTo.title:'No available perk exchange',exchangeFrom,exchangeTo},
  {type:'event',color:'#ff79b8',glyph:'?',label:'ANOMALY',desc:'Choose a cosmic reward'},
  {type:'shop',color:'#b28cff',glyph:'▣',label:'VOID MARKET',desc:'Buy combat perks with Void Shards'},
  {type:'forge',color:'#ffe38a',glyph:'⚒',label:'VOID FORGE',desc:'Rank up owned perks with Void Shards'}
 ];
 const count=Math.floor(rand(2,5)),chosen=[];while(chosen.length<count){const i=Math.floor(Math.random()*pool.length);if(!chosen.includes(pool[i]))chosen.push(pool[i])}
 const portalSpreadX=Math.min(W*.13,190),portalSpreadY=Math.min(H*.14,115);const spots=count===2?[{x:W/2-portalSpreadX*.8,y:H/2},{x:W/2+portalSpreadX*.8,y:H/2}]:count===3?[{x:W/2-portalSpreadX,y:H/2-portalSpreadY},{x:W/2+portalSpreadX,y:H/2-portalSpreadY},{x:W/2,y:H/2+portalSpreadY}]:[{x:W/2-portalSpreadX,y:H/2-portalSpreadY},{x:W/2+portalSpreadX,y:H/2-portalSpreadY},{x:W/2-portalSpreadX,y:H/2+portalSpreadY},{x:W/2+portalSpreadX,y:H/2+portalSpreadY}];
 portals=chosen.map((p,i)=>({...p,...spots[i],r:25,pulse:rand(0,6),age:0}));player.x=W/2;player.y=H/2;player.inv=0;notify(`${count} DESTINATIONS AVAILABLE · CLICK A PORTAL TO CHOOSE`);$('phase').textContent=`W${currentWorld+1} · ${world().name} · PORTAL SELECT`;updateUI()
}

function beginCoreCollapse(){if(state!=='playing')return;clearFxType='singularity';clearAuralisRoomEffects();clearFlashRoomEffects();clearNatureRoomEffects();state='collapse';collapseTimer=2.45;collapseAge=0;pendingPortalReveal=false;const coreShardReward=blackHole?.isFinalBoss?160:blackHole?.elite?30:18;addShards(coreShardReward);notify(blackHole?.isFinalBoss?`FINAL BOSS DEFEATED · +${coreShardReward} VOID SHARDS`:`SINGULARITY DESTROYED · +${coreShardReward} VOID SHARDS`);for(const orb of xpDrops){orb.life=999;orb.corePull=true;}addEnergy(25);if(blackHole?.elite)kills++;bullets=[];enemyShots=[];supernovaBurst(blackHole.x,blackHole.y,blackHole.r||34,blackHole.isFinalBoss?'#ff79b8':'#bd92ff',!!blackHole.isFinalBoss);notify('SINGULARITY COLLAPSE IMMINENT');}

function beginPortalTransition(portal){
 if(state!=='portal'||portalTransition||roomTransition||!player||!portal)return;
 portals.forEach(candidate=>{candidate.selected=candidate===portal;});
 portalTransition={type:portal.type,portalData:{exchangeFrom:portal.exchangeFrom,exchangeTo:portal.exchangeTo},x:portal.x,y:portal.y,startX:player.x,startY:player.y,color:portal.color||core?.color||'#72f6ff',glyph:portal.glyph||'◉',label:portal.label||'DESTINATION',elapsed:0,travelDuration:1.05,duration:1.62,hold:0,seed:Math.random()*Math.PI*2};
 state='portalTransition';sfx('portal');
}

function enterPortal(type,portalData=null){window.portalInteractionActive=true;state='portal';environmentHazards=[];hazardSpawnTimer=Math.max(1.8,4.2-(Math.max(0,currentWorld)*.35));hazardHitCooldown=0;portals=[];burst(player.x,player.y,'#72f6ff',12);if(type==='heal'){const healed=restoreHull(Math.ceil(player.maxHp*.4));updateUI();showModal('REPAIR GATE','CORE RESTORED',`The gate repairs ${Number(healed.toFixed(1)).toLocaleString('en-US',{maximumFractionDigits:1})} hull.`,[{glyph:'✚',color:'#83ffc5',title:'CONTINUE',desc:'Proceed with your repaired core.',action:finishPortalRoom}]);return}if(type==='exchange'){const oldPerk=portalData?.exchangeFrom||'No existing perk';const offer=portalData?.exchangeTo||null;if(!offer){showModal('PERK EXCHANGE','NO VALID OFFER','No general perk is available. This portal cannot be refreshed.',[{glyph:'→',title:'CONTINUE',desc:'Leave the exchange untouched.',action:finishPortalRoom}]);return}showPerkExchange(offer);return}if(type==='event'){showAnomaly();return}if(type==='shop'){shopVisits++;shopStock=null;shopPurchased=[];showShop();return}if(type==='forge'){showVoidForge();return}}

