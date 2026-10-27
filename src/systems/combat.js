// Extracted from the legacy game runtime. Runtime behavior is intentionally preserved.

function updateCombatStatsUI(){const keys=['damageDealt','healingReceived','damageReceived'],peak=Math.max(1,...keys.map(k=>roomCombatStats[k]||0));for(const key of keys){const value=roomCombatStats[key]||0,valueNode=$(key+'Value'),barNode=$(key+'Bar');if(valueNode)valueNode.textContent=Math.round(value).toLocaleString();if(barNode)barNode.style.width=Math.min(100,value/peak*100)+'%';}}

function recordCombatMetric(key,amount){if(!Object.prototype.hasOwnProperty.call(roomCombatStats,key)||!Number.isFinite(amount)||amount<=0)return;roomCombatStats[key]+=amount;updateCombatStatsUI();}const CORE_TARGET_RANGE=440,RICOCHET_LINK_RANGE=160;const ELEMENTAL_CORE_ELEMENTS=[{name:'FIRE',color:'#ff4358'},{name:'FROST',color:'#52dcff'},{name:'LIGHTNING',color:'#ffe66d'},{name:'NATURE',color:'#65ed83'}];

function withinCoreRange(a,b,range=CORE_TARGET_RANGE){return !!(a&&b)&&dist(a,b)<=range;}

function addLightningArc(a,b){const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,px=-dy/len,py=dx/len,steps=Math.max(4,Math.min(8,Math.round(len/24))),pts=[{x:a.x,y:a.y}];for(let i=1;i<steps;i++){const t=i/steps,offset=(Math.random()-.5)*Math.min(34,len*.18);pts.push({x:a.x+dx*t+px*offset,y:a.y+dy*t+py*offset})}pts.push({x:b.x,y:b.y});lightningArcs.push({pts,life:.19,maxLife:.19});}

function triggerChainAttack(source,damage){let from=source;const hit=new Set([source]);const isFlash=core?.id==='flash';const criticalCascade=isFlash&&!!source?.lastHitWasCrit;const chainCount=isFlash?Math.min(4,Math.max(2,2+(player?.flashChainBonus||0)+(criticalCascade?(player?.flashCritChainTargets||0):0))):(player?.chainLightning||0);for(let i=0;i<chainCount;i++){const candidates=enemies.filter(o=>o.hp>0&&!hit.has(o)&&withinCoreRange(player,o)&&dist(o,from)<RICOCHET_LINK_RANGE);if(isFlash&&blackHole&&!blackHole.inactive&&blackHole.hp>0&&!hit.has(blackHole)&&withinCoreRange(player,blackHole)&&dist(blackHole,from)<RICOCHET_LINK_RANGE)candidates.push(blackHole);const next=candidates.sort((a,b)=>dist(a,from)-dist(b,from))[0];if(!next)break;addLightningArc(from,next);if(isFlash&&enemies.includes(next))next.flashUltVulnerabilityUntil=performance.now()+6000;applyDamage(next,damage*(isFlash?0.58:0.55)*(isFlash?(player?.flashChainPower||1)*(criticalCascade?1+(player?.flashCritChainBonus||0):1):1),'#ffe875',true,'CHAIN');burst(next.x,next.y,'#ffe875',7);hit.add(next);from=next;}}for(let i=0;i<145;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()<.85?1:2,a:rand(.15,.8),p:rand(0,6)});


let tutorialTipVisible=false;
const SAVE_KEY='void_orb_save_v1';let saveData={unlockedWorlds:1,totalRuns:0,bestRooms:[0,0,0,0],hardModeByWorld:{},autoShoot:true,mouseSteering:true,sfxEnabled:true,musicEnabled:true,musicVolume:0.32,uiScale:1,lastWorld:0,coreCurrency:0,coreUpgrades:{},voidWeaponInventory:{},equippedVoidWeapons:{},voidWeaponClaims:[],pendingVoidWeaponRewards:[],storyProgress:{seenScenes:[],recoveredFiles:[]}};try{const raw=localStorage.getItem(SAVE_KEY);if(raw){const parsed=JSON.parse(raw);saveData={...saveData,...parsed};saveData.coreCurrency=Math.max(0,Number(saveData.coreCurrency)||0);saveData.coreUpgrades=saveData.coreUpgrades&&typeof saveData.coreUpgrades==='object'?saveData.coreUpgrades:{};saveData.unlockedWorlds=Math.max(1,Math.min(4,Number(saveData.unlockedWorlds)||1));saveData.bestRooms=Array.isArray(saveData.bestRooms)?[0,1,2,3].map(i=>Number(saveData.bestRooms[i])||0):[0,0,0,0];saveData.hardModeByWorld=saveData.hardModeByWorld&&typeof saveData.hardModeByWorld==='object'?saveData.hardModeByWorld:{}}}catch(e){}saveData=normalizeVoidWeaponSave(saveData);persist();try{const legacy=saveData.coreUpgrades||{};if(Object.values(legacy).some(v=>v&&typeof v==='object')){const shared={};for(const value of Object.values(legacy)){if(value&&typeof value==='object')for(const [key,rank] of Object.entries(value))shared[key]=Math.max(Number(shared[key])||0,Number(rank)||0)}for(const key of ['atk','crit','rate','hull','armor','speed'])if(Number.isFinite(Number(legacy[key])))shared[key]=Math.max(Number(shared[key])||0,Number(legacy[key])||0);saveData.coreUpgrades=shared;localStorage.setItem(SAVE_KEY,JSON.stringify(saveData))}}catch(e){}saveData.storyProgress=saveData.storyProgress&&typeof saveData.storyProgress==='object'?saveData.storyProgress:{seenScenes:[],recoveredFiles:[]};saveData.storyProgress.seenScenes=Array.isArray(saveData.storyProgress.seenScenes)?saveData.storyProgress.seenScenes:[];saveData.storyProgress.recoveredFiles=Array.isArray(saveData.storyProgress.recoveredFiles)?saveData.storyProgress.recoveredFiles:[];const DEV_MODE_PASSWORD_SHA256='4a1c5ba9bab4ffbd545fc0e59e31ffa673a1c7dd06e6bccccc432245d922ba14';let developerMode=false;const CORE_UNLOCK_REQUIREMENTS={remielle:{worldIndex:2,label:'WORLD 3'},nature:{worldIndex:0,label:'WORLD 1'},elemental:{worldIndex:1,label:'WORLD 2'},vengeance:{worldIndex:2,label:'WORLD 3'},nova:{worldIndex:2,label:'WORLD 3'}};let currentWorld=Math.max(0,Math.min(3,saveData.lastWorld||0)),settingsReturn='paused',pausedPageNodes=null,pausedOverlayVisible=false,pausedModalClassName='';autoShoot=saveData.autoShoot!==false;mouseSteering=saveData.mouseSteering!==false;let sfxEnabled=saveData.sfxEnabled!==false,musicEnabled=saveData.musicEnabled!==false,musicVolume=Math.max(0,Math.min(1,Number(saveData.musicVolume??0.32))),audioCtx=null,sfxLast={},musicTimer=null,musicStep=0,musicBus=null,musicTrackIndex=-1;

function getPriorityTarget(origin,maxRange=Infinity,excluded=[]){const usable=t=>!!t&&t.hp>0&&!t.inactive&&!excluded.includes(t)&&dist(origin,t)<=maxRange;if(blackHole&&usable(blackHole))return blackHole;const objectives=[];for(const e of enemies){if(usable(e)&&(e.isMiniBoss||e.isFinalBoss||e.isBoss||e.role==='miniboss'||e.role==='boss'))objectives.push(e)}if(objectives.length)return objectives.sort((a,b)=>dist(origin,a)-dist(origin,b))[0];let target=null,best=maxRange;for(const e of enemies){const d=dist(origin,e);if(e.hp>0&&!e.inactive&&!excluded.includes(e)&&d<best){best=d;target=e}}return target}

function nearestTarget(maxRange=Infinity){return getPriorityTarget(player,maxRange)}

function getPrimaryAttackTarget(){const coreTargetRange=core?.id==='nova'?(104+Math.min(28,(player?.evoTier||0)*7)):CORE_TARGET_RANGE;return selectPrimaryAttackTarget({player,core,coreTargetRange,nearestTarget});}

function drawPrimaryTargetIndicator(target){if(!target)return;const pulse=.5+.5*Math.sin(performance.now()*.006),radius=(target.r||10)+14+pulse*1.2,elementalRainbow=core?.id==='elemental';ctx.save();ctx.translate(target.x,target.y);ctx.globalAlpha=.95;ctx.lineWidth=elementalRainbow?2.2:1.8;ctx.shadowBlur=10+pulse*5+(elementalRainbow?5:0);for(let i=0;i<4;i++){const a=i*Math.PI/2+.32,color=elementalRainbow?rainbowCoreColor(i*90+performance.now()*.04):(core?.color||'#72f6ff');ctx.strokeStyle=color;ctx.shadowColor=color;ctx.beginPath();ctx.arc(0,0,radius,a,(i+1)*Math.PI/2-.32);ctx.stroke();}ctx.shadowBlur=0;ctx.globalAlpha=.9;ctx.lineWidth=elementalRainbow?2:1.2;for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4+performance.now()*.00012,x=Math.cos(a),y=Math.sin(a),color=elementalRainbow?rainbowCoreColor(i*90+45+performance.now()*.04):'#ffffff';ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(x*(radius+2),y*(radius+2));ctx.lineTo(x*(radius+(elementalRainbow?7:6)),y*(radius+(elementalRainbow?7:6)));ctx.stroke();}ctx.fillStyle=elementalRainbow?rainbowCoreColor(180+performance.now()*.04):(core?.color||'#72f6ff');ctx.globalAlpha=.95;ctx.beginPath();ctx.arc(0,0,elementalRainbow?2.2:1.8,0,Math.PI*2);ctx.fill();ctx.restore()}

function applyLumineBuildup(target,amount=1){
 if(core?.id!=='remielle'||!target||target.hp<=0)return;
 target.lumineStacks=(target.lumineStacks||0)+amount;
 target.lumineTimer=5;
 if(target.lumineStacks>=4){
  const stored=player.voidflares||0;
  const activeCrystals=Math.min(5,featherTraps.filter(f=>!f.hit&&f.life>0).length);
  const rank=Math.max(1,Math.min(5,player?.voidWeaponRank||1));
  const dawnBonus=player.voidWeaponPassive==='last-light-first-dawn'?1+activeCrystals*([.08,.10,.12,.14,.16][rank-1]):1;
  const dmg=player.damage*(1.35*(player.luminizeMult||1)+stored*.12)*(target.voidflareDotTimer>0?1.5:1)*dawnBonus;
  applyDamage(target,dmg,'#ffb5e2',true,'LUMOX');
  target.lumineStacks=0;target.lumineTimer=0;
  player.voidflares=Math.min(player.maxVoidflares||3,stored+1);
  if(player.voidWeaponPassive==='last-light-first-dawn'){
   const count=[2,3,4,5,6][rank-1];
   const featherDamage=player.damage*([.75,.90,1.05,1.20,1.35][rank-1]);
   const featherTargets=enemies.filter(e=>e.hp>0&&e!==target&&dist(e,target)<300).sort((a,b)=>dist(a,target)-dist(b,target));
   for(let n=0;n<count;n++){
    const featherTarget=featherTargets[n%Math.max(1,featherTargets.length)]||target;
    const angle=Math.atan2(featherTarget.y-target.y,featherTarget.x-target.x)+(n-count/2)*.20;
    skillMissiles.push({x:target.x,y:target.y,vx:Math.cos(angle)*90,vy:Math.sin(angle)*90,speed:390,damage:featherDamage,life:4,targetId:featherTarget.id??null,targetCore:featherTarget===blackHole,color:'#ffb5e2',r:4,lightFeather:true,extraPierce:rank,hitTargets:[]});
   }
   if(Math.random()<[.25,.30,.35,.40,.45][rank-1]&&featherTraps.filter(f=>!f.hit&&f.life>0).length<8){
    featherTraps.push({x:target.x+rand(-8,8),y:target.y+rand(-8,8),age:0,life:8,damage:player.damage*.65,homing:false,targetId:null,targetCore:false,targetRef:null,hit:false,fromKillCrystal:true,fromWeaponCrystal:true});
   }
  }
  burst(target.x,target.y,'#ffd8f0',11);
  notify(`AURALIS · LUMOX · VOID BURST ${player.voidflares}/${player.maxVoidflares||3}`);
  updateUI();
 }
}

function firePhaseFlowAttack(tag='PRISM FLIGHT',origin=null,excludedTargetId=null){if(!player||core?.id!=='remielle')return false;const source=origin||player;const enemyTarget=enemies.filter(e=>e.hp>0&&e.id!==excludedTargetId&&withinCoreRange(source,e)).sort((a,b)=>dist(source,a)-dist(source,b))[0]||null;const coreTarget=(blackHole&&!blackHole.inactive&&blackHole.hp>0&&withinCoreRange(source,blackHole))?blackHole:null;const target=enemyTarget||coreTarget;if(!target)return false;// Prism Flight is a rapid passive-stack applicator; keep its original cadence but sharply reduce per-strike damage.
 const rank=player.skillLevel||0,power=player.phaseFlowPower||0,dmg=player.damage*(.14+rank*.025)*(1+power*.06)*(1+(player.remielleSkillRelic||0)*.08);const hit=(victim,suffix='')=>{applyDamage(victim,dmg,'#ff9ed8',true,tag+suffix);if(enemies.includes(victim))applyLumineBuildup(victim);burst(victim.x,victim.y,'#fff0fa',7);skillFx.push({type:'lightLance',x:source.x,y:source.y,tx:victim.x,ty:victim.y,life:.20,max:.20,radius:(victim.r||10)+8,color:'#ffd8f0'});};hit(target);if(enemyTarget&&coreTarget&&target!==coreTarget&&withinCoreRange(source,coreTarget)){hit(coreTarget,' · SINGULAR CORE');}return target}
const triggerRicochetChain=createRicochetSystem({getPlayer:()=>player,getCore:()=>core,getEnemies:()=>enemies,getSkillFx:()=>skillFx,dist,applyDamage,addLightningArc,burst});

function launchElementalVerdantSalvo(target,damage){
 const missileCount=3+Math.min(2,player?.elementalMissileBonus||0);
 for(let i=0;i<missileCount;i++){
  skillMissiles.push({
   x:player.x+rand(-7,7),y:player.y+rand(-7,7),
   vx:target?rand(-45,45):0,vy:target?rand(-45,45):0,
   speed:360+(player.skillLevel||0)*16,
   damage:damage*.52*(player?.elementalMissilePower||1)*(player?.elementalDamageMult||1)*1.12,
   critChance:.40,life:4.5,
   targetId:target&&target!==blackHole?(target.id??null):null,
   targetRef:target&&target!==blackHole?target:null,
   targetCore:target===blackHole,color:'#70e58a',r:5,elementalMissile:true
  });
 }
 burst(player.x,player.y,'#70e58a',8+missileCount);
}
const ELEMENTAL_EFFECT_MARKS={FIRE:{icon:'🔥',color:'#ff7a50'},FROST:{icon:'❄',color:'#7be8ff'},LIGHTNING:{icon:'ϟ',color:'#ffe875'},AETHER:{icon:'✦',color:'#fff0a6'},NATURE:{icon:'❧',color:'#70e58a'}};
const ELEMENTAL_EFFECT_DURATION=8;

function addElementalEffect(target,elementName){
 if(!target||!ELEMENTAL_EFFECT_MARKS[elementName])return;
 if(!target.elementalEffects||Array.isArray(target.elementalEffects))target.elementalEffects={};
 // Refresh only this element's timer; all other elemental marks keep their own expiry.
 target.elementalEffects[elementName]=ELEMENTAL_EFFECT_DURATION;
}

function updateElementalEffects(target,dt){
 if(!target?.elementalEffects||Array.isArray(target.elementalEffects))return;
 for(const [name,remaining] of Object.entries(target.elementalEffects)){
  const next=remaining-dt;
  if(next<=0)delete target.elementalEffects[name];
  else target.elementalEffects[name]=next;
 }
}

function drawElementalEffectIcons(target){
 const effects=Object.keys(target?.elementalEffects||{}).filter(name=>ELEMENTAL_EFFECT_MARKS[name]&&(target.elementalEffects[name]||0)>0);
 if(!effects.length)return;
 const gap=12,total=(effects.length-1)*gap,x0=target.x-total/2,y=target.y-(target.r||10)-27;
 ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 11px monospace';
 effects.forEach((name,i)=>{const mark=ELEMENTAL_EFFECT_MARKS[name],x=x0+i*gap;ctx.fillStyle='rgba(8,12,25,.88)';ctx.fillRect(x-6,y-7,12,13);ctx.strokeStyle=mark.color;ctx.lineWidth=1;ctx.strokeRect(x-6,y-7,12,13);ctx.fillStyle=mark.color;ctx.shadowColor=mark.color;ctx.shadowBlur=5;ctx.fillText(mark.icon,x,y);});
 ctx.restore();
}

function applyElementalStrike(target,elementName,damage,boosted=false,source='ELEMENTAL AUTO ATTACK'){
 const spec=ELEMENTAL_CORE_ELEMENTS.find(e=>e.name===elementName);if(!target||target.hp<=0||!spec)return;
 addElementalEffect(target,elementName);
 const bonus=(player?.elementalDamageMult||1)*(boosted?1.12:1)*(1);
 applyDamage(target,damage*bonus,spec.color,true,source+' · '+spec.name);
 if(elementName==='FIRE'){
  target.burn=Math.max(target.burn||0,boosted?3.8:2.6);
  target.burnStacks=boosted?5:Math.max(1,target.burnStacks||1);
  target.burnDps=Math.max(target.burnDps||0,(boosted?Math.max(9,(player?.damage||10)*.9):9)*(player?.burnMult||1)*(player?.elementalBurnPower||1));
  target.burnFx=0;target.burnTick=0;target.burnPending=0;
 }else if(elementName==='FROST'){
  if(boosted){
   const alreadyFrozen=(target.frozen||0)>0;
   target.frostStacks=0;target.frozen=Math.max(target.frozen||0,2.5);target.slow=Math.max(target.slow||0,2.5);target.iced=true;
   if(!alreadyFrozen&&enemies.includes(target))notify('CONVERGENCE · INSTANT FREEZE');
   skillFx.push({type:'frostPulse',x:target.x,y:target.y,life:.32,max:.32,radius:(target.r||10)+18,color:'#52dcff'});
  }else{
   target.frostStacks=(target.frostStacks||0)+1+(player?.elementalFrostBonus||0);
   target.slow=Math.max(target.slow||0,1.5);target.iced=true;
   if(target.frostStacks>=Math.max(2,5-(player?.elementalFrostBonus||0))){target.frostStacks=0;target.frozen=Math.max(target.frozen||0,1.25);target.slow=Math.max(target.slow||0,1.25);if(enemies.includes(target))notify('PRISM FROST · TARGET FROZEN');}
  }
 }else if(elementName==='LIGHTNING'&&enemies.includes(target)){
  const chainLimit=(boosted?4:2)+(player?.elementalChainBonus||0);
  const links=enemies.filter(e=>e!==target&&e.hp>0&&withinCoreRange(target,e)&&dist(target,e)<=RICOCHET_LINK_RANGE).sort((a,b)=>dist(target,a)-dist(target,b)).slice(0,chainLimit);
  for(const next of links){addLightningArc(target,next);addElementalEffect(next,'LIGHTNING');applyDamage(next,damage*(boosted?.60:.32)*(player?.elementalChainPower||1)*(boosted?1.12:1),spec.color,true,boosted?'CONVERGENCE LIGHTNING CHAIN':'ELEMENTAL LIGHTNING CHAIN');burst(next.x,next.y,spec.color,boosted?7:4);}
 }else if(elementName==='NATURE'){if(boosted&&source==='ELEMENTAL Q')launchElementalVerdantSalvo(target,damage);target.vineBound=Math.max(target.vineBound||0,boosted?3.5:1.4);target.rooted=Math.max(target.rooted||0,boosted?3.5:1.4);
  if(boosted){skillFx.push({type:'natureVine',x:player.x,y:player.y,tx:target.x,ty:target.y,life:.24,max:.24,radius:(target.r||10)+8,color:'#65ed83'});skillFx.push({type:'vineImpact',x:target.x,y:target.y,life:.30,max:.30,radius:(target.r||10)+13,color:'#65ed83'});}
 }
 burst(target.x,target.y,spec.color,boosted?7:4);
}

function applyElementalAutoSplash(primary,elementName,damage){
 const spec=ELEMENTAL_CORE_ELEMENTS.find(e=>e.name===elementName);if(!primary||!spec)return;
 const radius=34,splashDamage=damage*.35;
 let hits=0;
 for(const e of enemies){
  if(e===primary||e.hp<=0||dist(primary,e)>radius)continue;
  addElementalEffect(e,elementName);
  applyDamage(e,splashDamage,spec.color,true,'ELEMENTAL SPLASH · '+spec.name);
  burst(e.x,e.y,spec.color,3);hits++;
 }
 if(blackHole&&blackHole!==primary&&!blackHole.inactive&&blackHole.hp>0&&dist(primary,blackHole)<=radius){
  addElementalEffect(blackHole,elementName);
  applyDamage(blackHole,splashDamage,spec.color,true,'ELEMENTAL SPLASH · '+spec.name);
  burst(blackHole.x,blackHole.y,spec.color,3);hits++;
 }
 burst(primary.x,primary.y,spec.color,5);
 if(hits)skillFx.push({type:'elementalSplash',x:primary.x,y:primary.y,life:.22,max:.22,radius,color:spec.color});
}

function configureVoidWeaponAutoAttack(target){
 if(!player?.voidWeaponPassive||!target)return;
 const effect=player.voidWeaponPassive;
 if(!['cinder-oath','stillpoint','eventide-array','thunderclap-protocol'].includes(effect))return;
 player.voidWeaponAutoCount=(player.voidWeaponAutoCount||0)+1;
 const rank=Math.max(1,Math.min(5,player.voidWeaponRank||1));
 if(effect==='eventide-array'&&player.voidWeaponAutoCount>=[5,5,4,4,3][rank-1]){
  player.voidWeaponAutoCount=0;player.voidWeaponChargedAttack=true;player.voidWeaponChargedTarget=target===blackHole?blackHole:(enemies.filter(e=>e.hp>0).sort((a,b)=>dist(player,a)-dist(player,b))[0]||target);
 }else if(effect==='thunderclap-protocol'&&player.voidWeaponAutoCount>=[6,5,4,3,3][rank-1]){
  player.voidWeaponAutoCount=0;player.voidWeaponChargedAttack=true;player.voidWeaponChargedTarget=target;
 }else if(effect==='cinder-oath'){
  const fireballCount=[1,1,2,2,2][rank-1];
  for(let n=0;n<fireballCount;n++){
   const angle=Math.atan2(target.y-player.y,target.x-player.x)+(n-(rank-1)/2)*.12;
   bullets.push({x:player.x+Math.cos(angle)*12,y:player.y+Math.sin(angle)*12,vx:Math.cos(angle)*Math.max(220,player.shotSpeed*.76),vy:Math.sin(angle)*Math.max(220,player.shotSpeed*.76),r:3.5,life:3.2,rangeLeft:CORE_TARGET_RANGE*2,damage:player.damage*.42,color:'#ff5a36',type:'voidWeaponFireball',pierce:0,hitEnemies:[],homingTarget:target,homingTargetLocked:true,homingTargetLost:false,fromVoidWeapon:true});
  }
 }
}

function shoot(){
 // Black Sun suspends Aether's ring pulses and all auto-attack-triggered Void Weapon effects.
 if(core?.id==='nova'&&skillFx.some(f=>f.type==='aetherBlackSun'&&f.life>0))return null;
 player.voidWeaponOnPrimaryAttack=configureVoidWeaponAutoAttack;
 const nextShootCd=executeAutoAttack({player,blackHole,enemies,addEnergy,core,CORE_TARGET_RANGE,getPrimaryAttackTarget,mouse,sfx,pick,ELEMENTAL_CORE_ELEMENTS,bullets,launchElementalVerdantSalvo,natureDrones,withinCoreRange,dist,skillFx,rand,applyDamage,triggerRicochetChain,burst,pointSegmentDistance,W,H,lasers,RICOCHET_LINK_RANGE,addLightningArc,element,energy,firePhaseFlowAttack});
 player.voidWeaponOnPrimaryAttack=null;
 if(player?.voidWeaponPassive==='eventide-array'&&player.voidWeaponChargedAttack&&core?.id==='nova'&&!skillFx.some(f=>(f.type==='aetherWell'&&f.weaponEnhanced||f.type==='aetherCollapse'&&f.weaponEnhanced)&&f.life>0)){
  const rank=Math.max(1,Math.min(5,player.voidWeaponRank||1));const target=player.voidWeaponChargedTarget&&player.voidWeaponChargedTarget.hp>0?player.voidWeaponChargedTarget:enemies.filter(e=>e.hp>0).sort((a,b)=>dist(player,a)-dist(player,b))[0];const x=target?target.x:mouse.x,y=target?target.y:mouse.y;const radius=[118,132,148,164,184][rank-1]*(1+(player.aetherWellRadiusBonus||0));const damage=[2,2.25,2.5,2.75,3][rank-1];const duration=2.1+rank*.12;
  // Eventide Array may maintain only one Void Weapon singularity at a time.
  for(let i=skillFx.length-1;i>=0;i--){const fx=skillFx[i];if(fx.type==='aetherWell'&&fx.weaponEnhanced)skillFx.splice(i,1);}
  skillFx.push({type:'aetherWell',x:Math.max(24,Math.min(W-24,x)),y:Math.max(24,Math.min(H-24,y)),life:duration,max:duration,radius,color:'#fff0a6',damage:player.damage*.18,collapseDamage:player.damage*damage*(player.aetherCollapseMult||1),tickTimer:.15,weaponEnhanced:true});burst(x,y,'#fff0a6',22);notify(`EVENTIDE ARRAY · SINGULARITY ${rank}/5`);player.voidWeaponChargedAttack=false;player.voidWeaponChargedTarget=null;
 }else if(player?.voidWeaponPassive==='thunderclap-protocol'&&player.voidWeaponChargedAttack&&core?.id==='flash'){
  const first=player.voidWeaponChargedTarget||getPrimaryAttackTarget();const rank=Math.max(1,Math.min(5,player.voidWeaponRank||1));
  const maxJumps=[3,4,5,6,7][rank-1],damage=player.damage*([1.5,1.75,2,2.25,2.5][rank-1]),cascadeBonus=[.20,.25,.30,.35,.40][rank-1];
  const hit=new Set();let from=first;
  if(first){hit.add(first);applyDamage(first,damage,'#fff7b0',true,'OVERLOAD CIRCUIT');burst(first.x,first.y,'#fff7b0',14);}
  for(let n=0;first&&n<maxJumps;n++){
   const next=enemies.filter(e=>e.hp>0&&!hit.has(e)&&withinCoreRange(player,e)&&dist(e,from)<RICOCHET_LINK_RANGE).sort((a,b)=>dist(a,from)-dist(b,from))[0]||(!hit.has(blackHole)&&blackHole&&!blackHole.inactive&&blackHole.hp>0&&withinCoreRange(player,blackHole)&&dist(blackHole,from)<RICOCHET_LINK_RANGE?blackHole:null);
   if(!next)break;
   addLightningArc(from,next);
   const jumpDamage=damage*.58*(1+Math.min(3,n+1)*cascadeBonus);
   applyDamage(next,jumpDamage,'#ffe875',true,'OVERLOAD CIRCUIT · CHAIN');
   hit.add(next);if(next!==blackHole)burst(next.x,next.y,'#fff4a8',8);from=next;
  }
  player.voidWeaponChargedAttack=false;player.voidWeaponChargedTarget=null;
 }
 if(nextShootCd!==null)shootCd=nextShootCd;
}
// Bound transient visual work and compact live-effect arrays without per-frame filter allocations.
const MAX_PARTICLES=900;

function pushParticle(p){if(particles.length<MAX_PARTICLES)particles.push(p);}

function compactEffectsByLife(list){let write=0;for(let read=0;read<list.length;read++){const item=list[read];if(item.life>0)list[write++]=item;}list.length=write;return list;}

function burst(x,y,color,n=8){for(let i=0;i<n;i++){let a=rand(0,Math.PI*2),v=rand(25,170);pushParticle({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.2,.65),max:.65,color,size:Math.random()<.7?2:3})}}

function supernovaBurst(x,y,r,color='#aabaff',boss=false){const palette=boss?['#ffffff','#aabaff','#bd92ff','#72f6ff','#ff79b8','#ffcf8a']:[color,'#ffffff','#72f6ff','#bd92ff'];const count=boss?150:88;for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,heavy=Math.random()<.22,speed=heavy?rand(190,420):rand(65,270),life=heavy?rand(.65,1.35):rand(.35,.95),c=palette[Math.floor(Math.random()*palette.length)],start=rand(0,Math.max(4,r*.72));pushParticle({x:x+Math.cos(a)*start,y:y+Math.sin(a)*start,vx:Math.cos(a)*speed+rand(-24,24),vy:Math.sin(a)*speed+rand(-24,24),life,max:life,color:c,size:heavy?rand(2.5,5.5):rand(1,3.4),drag:.94});}for(let i=0;i<(boss?3:2);i++)ultFx.push({type:'shockwave',x,y,r:Math.max(8,r*.25),maxR:r*(boss?5.5:4),life:.75+i*.16,max:.75+i*.16,color:palette[i%palette.length]});burst(x,y,'#ffffff',boss?35:20);}

function floatDamage(x,y,amount,color,crit=false,tag=''){const value=Math.max(1,Math.round(amount));damageTexts.push({x:x+rand(-5,5),y:y-7,vx:rand(-10,10),vy:crit?-42:-28,life:crit?1.05:.78,max:crit?1.05:.78,text:(crit?'CRIT ':'')+value,color,crit});}

function applyDamage(target,amount,color,allowCrit=true,tag=''){if(!target||amount<=0)return 0;const appliesAetherRend=/AETHER|BLACK SUN|SINGULARITY SHARD|EVENTIDE ARRAY/i.test(String(tag||''))||(core?.id==='nova'&&target===blackHole);if(appliesAetherRend){target.aetherRendStacks=Math.min(10,(target.aetherRendStacks||0)+1);if(Number.isFinite(target.damage)){if(!Number.isFinite(target.aetherBaseDamage))target.aetherBaseDamage=target.damage;target.damage=target.aetherBaseDamage*(1-target.aetherRendStacks*.05);}}let multiplier=1;if(core?.id==='vengeance'&&player?.vengeanceCrimsonMomentum)multiplier*=1.12;if((target.aetherRendStacks||0)>0)multiplier*=1+(target.aetherRendStacks||0)*.05;if(player?.voidWeaponPassive==='blood-dividend'){const rank=Math.max(1,Math.min(5,player.voidWeaponRank||1)),healthPct=100*Math.max(0,Math.min(1,player.hp/Math.max(1,player.maxHp))),lowHealthBonus=healthPct<50?[.20,.25,.30,.35,.40][rank-1]:0,perPoint=[.005,.006,.007,.008,.009][rank-1],cap=[.50,.60,.70,.80,.90][rank-1],highHealthBonus=Math.min(cap,Math.max(0,healthPct-50)*perPoint);multiplier*=1+lowHealthBonus+highHealthBonus;}if(player?.voidWeaponPassive==='verdant-covenant'){const activeDrones=Math.min(5,natureDrones.filter(d=>d.hp>0).length);multiplier*=1+activeDrones*([.05,.06,.07,.08,.09][(player.voidWeaponRank||1)-1]||.05);}if(player?.voidWeaponPassive==='stillpoint'&&(target.frozen||0)>0)multiplier*=1+([.25,.30,.35,.40,.45][(player.voidWeaponRank||1)-1]||.25);if(player?.voidWeaponPassive==='cinder-oath'&&(target.burn||0)>0)multiplier*=1+([.25,.30,.35,.40,.45][(player.voidWeaponRank||1)-1]||.25);if(player?.voidWeaponPassive==='prism-paradox'){const effectNames=Object.entries(target.elementalEffects||{}).filter(([name,remaining])=>remaining>0).map(([name])=>name);const effectCount=Math.min(3,new Set(effectNames).size);if(effectCount)multiplier*=1+effectCount*([.08,.10,.12,.14,.16][(player.voidWeaponRank||1)-1]||.08);}if(core?.id==='vengeance'&&player?.vengeanceBloodFrenzy&&player.hp<player.maxHp*.5)multiplier*=1.18;if(core?.id==='vengeance'&&player?.vengeanceRuthlessPursuit&&target.hp/Math.max(1,target.maxHp||target.hp)<.3)multiplier*=1.2;if(target===blackHole&&target.isFinalBoss&&(target.bossPhase||1)===2&&(target.breakStun||0)<=0)multiplier*=.20;if((target.stunned||0)>0)multiplier*=(target.stunDamageTaken||1.25)*(core?.id==='flash'?1+(player?.flashStunDamageBonus||0):1);const activeElementCount=core?.id==='elemental'?Object.values(target.elementalEffects||{}).filter(remaining=>remaining>0).length:0;if(core?.id==='frost'&&(player?.skillShield||0)>0&&(player?.skillShieldHp||0)>0)multiplier*=1.25+Math.max(1,level)*.0075;if(core?.id==='nature'){const activeDrones=natureDrones.filter(d=>d.hp>0).length;if(activeDrones)multiplier*=1+.10*activeDrones;if(player?.natureEvergreenCovenant&&activeDrones)multiplier*=1+.10*activeDrones;}if(core?.id==='ember'&&player?.emberLastSpark&&player.hp<player.maxHp*.35)multiplier*=1.15;if(core?.id==='flash'&&(target.flashUltVulnerabilityUntil||0)>performance.now()&&/(SOLAR|FLARE|SNOWSTORM|RADIANT FINALE|VERDANT OVERDRIVE|THUNDERFIELD|PRISMATIC CATACLYSM|BLACK SUN|PHASE NOVA|VOIDFLARE|VOID BURST)/i.test(String(tag)))multiplier*=1.25;if(core?.id==='frost'&&player?.shatterglass&&target.slow>0)multiplier*=1.15;if(core?.id==='ember'&&player?.infernoCrown&&target.burn>0)multiplier*=1.2;if((core?.id==='nova'||core?.id==='elemental')&&target.novaVuln>0)multiplier*=1.2;if(core?.id==='nova'&&player?.aetherOrbitalResonance&&skillFx.some(fx=>fx.type==='aetherWell'&&dist(target,fx)<(fx.radius||0)))multiplier*=1.15;if(core?.id==='ember'&&player?.cinderMark&&(target.burn||0)>0)multiplier*=1.18;if(core?.id==='frost'&&player?.shatterProtocol){if((target.frozen||0)>0)multiplier*=1.25;else if((target.slow||0)>0)multiplier*=1.10;}if(core?.id==='frost'&&player?.frostFractureBonus&&(target.frozen||0)>0)multiplier*=1+player.frostFractureBonus;if(core?.id==='remielle'&&player?.prismatic&&(target.lumineStacks||0)>0)multiplier*=1.15;if(player?.lastStand>0&&player.hp<=player.maxHp*.35)multiplier*=1+.15*Math.min(2,player.lastStand);if((player?.dashMomentumTimer||0)>0&&(player?.phaseMomentumRank||0)>0)multiplier*=1+.10*Math.min(2,player.phaseMomentumRank);if((player?.singularityHunter||0)>0&&(target===blackHole||target.isMiniBoss||target.isFinalBoss))multiplier*=1+.12*Math.min(3,player.singularityHunter);if(core?.id==='vengeance'&&(player.bloodlettingTimer||0)>0&&String(tag).startsWith('CRIMSON REAVER')){const missing=1-Math.max(0,Math.min(1,player.hp/Math.max(1,player.maxHp)));multiplier*=1.25+.5*missing;}let prismEffectNames=player?.voidWeaponPassive==='prism-paradox'?Object.entries(target.elementalEffects||{}).filter(([name,remaining])=>remaining>0).map(([name])=>name):[];const prismEffectCount=new Set(prismEffectNames).size;const prismThreshold=[3,3,2,2,2][Math.max(1,Math.min(5,player?.voidWeaponRank||1))-1];let prismDetonation=player?.voidWeaponPassive==='prism-paradox'&&prismEffectCount>=prismThreshold&&!String(tag).includes('PRISMATIC DETONATION');const crit=allowCrit&&Math.random()<(player?.critChance??.12);target.lastHitWasCrit=crit;if(crit&&(player?.criticalBattery||0)>0)energy=Math.min(100,energy+2*Math.min(3,player.criticalBattery));let critDamageMultiplier=player?.critDamage??1.8;if(crit&&core?.id==='ember'&&(target.burn||0)>0)critDamageMultiplier+=.25+Math.max(1,level)*.01;if(crit&&player?.voidWeaponPassive==='prism-paradox')critDamageMultiplier+=([.20,.25,.30,.35,.40][(player.voidWeaponRank||1)-1]||.20);if(crit&&core?.id==='elemental'&&activeElementCount>0)critDamageMultiplier*=1+.08*Math.min(5,activeElementCount);if(crit&&core?.id==='nova'&&tag==='AETHER')critDamageMultiplier+=player?.novaLaserCritBonus||0;const dealt=amount*multiplier*(crit?critDamageMultiplier:1);let remaining=dealt;if(target===blackHole&&target.isFinalBoss&&(target.bossPhase||1)===2&&(target.breakStun||0)<=0){target.breakHp=Math.max(0,(target.breakHp??target.breakMaxHp)-amount*(crit?(player?.critDamage??1.8):1));if(target.breakHp<=0){target.breakStun=4.5;target.breakFlash=1.2;target.breakHp=0;target.stunned=4.5;target.stunDamageTaken=1;burst(target.x,target.y,'#ffffff',46);skillFx.push({type:'bossShieldPulse',x:target.x,y:target.y,life:1.1,max:1.1,radius:112,color:'#ffffff'});sfx('ultimate');notify('BREAK STUN · BOSS VULNERABLE');}}const bossBroken=target===blackHole&&target.isFinalBoss&&(target.bossPhase||1)===2&&(target.breakStun||0)>0;if((target.shieldHp||0)>0&&!bossBroken){const absorbed=Math.min(target.shieldHp,remaining);target.shieldHp-=absorbed;remaining-=absorbed;if(absorbed>0)floatDamage(target.x,target.y,absorbed,'#9f9cff',false,'SHIELD');}const actualHpDamage=Math.max(0,Math.min(Math.max(0,target.hp),remaining));recordCombatMetric('damageDealt',actualHpDamage+Math.max(0,dealt-remaining));target.hp-=remaining;floatDamage(target.x,target.y,dealt,color||core?.color||'#eaf5ff',crit,tag);if(crit)burst(target.x,target.y,color||core?.color||'#fff',5);if(core?.id==='flash'&&player?.flashLinkTimer>0&&!String(tag).startsWith('LINK SHARE')){const group=target.flashLinkGroup||[];for(const linked of enemies){if(linked!==target&&linked.hp>0&&linked.flashLinkedUntil>0&&group.includes(linked.id??linked.flashLinkId)){const share=Math.min(linked.hp,dealt*.42);linked.hp-=share;floatDamage(linked.x,linked.y,share,'#ffe875',false,'LINK SHARE');addLightningArc(target,linked);}}}if(prismDetonation){const rank=Math.max(1,Math.min(5,player?.voidWeaponRank||1));const detonationDamage=player.damage*([1.5,1.75,2,2.25,2.5][rank-1]);const spreadRange=82;const spreadTargets=enemies.filter(nearby=>nearby!==target&&nearby.hp>0&&dist(nearby,target)<=spreadRange);skillFx.push({type:'prismDetonation',x:target.x,y:target.y,life:.32,max:.32,radius:spreadRange,color:'#ff71cd',targets:spreadTargets.slice(0,6).map(nearby=>({x:nearby.x,y:nearby.y}))});ultFx.push({type:'shockwave',x:target.x,y:target.y,r:4,maxR:spreadRange,life:.3,max:.3,color:'#ff71cd'});if(target.hp>0)applyDamage(target,detonationDamage,'#ff71cd',false,'PRISMATIC DETONATION');for(const nearby of spreadTargets){for(const effectName of prismEffectNames){if(!(nearby.elementalEffects||{})[effectName])addElementalEffect(nearby,effectName);}burst(nearby.x,nearby.y,'#ff71cd',3);skillFx.push({type:'prismDetonationHit',x:nearby.x,y:nearby.y,life:.28,max:.28,color:'#ff71cd'});}burst(target.x,target.y,'#fff0ff',8);}return dealt}

function coreSkillCooldown(){return Math.max(5,(core?.id==='vengeance'?16:core?.id==='ember'?14:core?.id==='frost'?16:core?.id==='remielle'?13:core?.id==='elemental'?Math.max(7,16-(player?.elementalCooldownBonus||0)):core?.id==='nova'?13:11)-(player?.skillLevel||0)*1.5)*cooldownFactor()}

function useCoreSkill(){if(state==='paused'&&pausedFrom==='playing'&&player&&core){pendingCoreSkill=true;notify('E SKILL QUEUED · ACTIVATES ON RESUME');return;}if(state!=='playing'||!player||!core)return;if(core.id==='nature'){const droneCap=player.natureDroneCap||2;natureDrones=natureDrones.filter(d=>d.hp>0);if(natureDrones.length&&!natureDrones.some(d=>d.type==='support')){const promoted=natureDrones[0];promoted.type='support';promoted.maxHp=42;promoted.hp=Math.min(promoted.hp,42);}player.natureDrones=natureDrones;if(natureDrones.length>=droneCap){if((player.natureDroneCharges||0)<=0){notify('DRONE CHARGE RECHARGING');return;}player.natureDroneCharges--;player.natureDroneChargeTimer=player.natureDroneCharges<Math.min(2,droneCap)?12:0;const eligible=natureDrones.filter(d=>d.hp>0);eligible.forEach(d=>{d.empowerTimer=12;});burst(player.x,player.y,'#baffc5',24);sfx('ultimate');notify('VERDANT RESONANCE · DRONE DAMAGE +25% · HEALING +25% · 12s');updateUI();return;}if((player.natureDroneCharges||0)<=0){notify('DRONE CHARGE RECHARGING');return;}}if(core.id!=='nature'&&(player.skillCooldown||0)>0){notify(`E SKILL READY IN ${player.skillCooldown.toFixed(1)}s`);return;}if(core.id==='remielle'&&(player.skillActive||0)>0){restorePhaseFlowStats();skillFx=skillFx.filter(fx=>fx.type!=='phaseFlow');}const lv=player.skillLevel||0;if(core.id==='nature'){player.skillCooldown=0;player.natureDroneCooldown=0;}else player.skillCooldown=coreSkillCooldown();player.skillActive=core.id==='nature'?0:core.id==='ember'?5.5+lv*1.25:core.id==='frost'?4.5+lv*1.25:core.id==='remielle'?6.5+lv*1.1+(player.phaseFlowBonus||0)+(player.phaseFlowDuration||0)*.8+(player.remielleSkillRelic||0)*.7:core.id==='elemental'?0:core.id==='flash'?8:core.id==='vengeance'?8:core.id==='nova'?10:0;player.skillRingTick=0;const skillEnergy=15;addEnergy(skillEnergy);notify(`E SKILL · +${skillEnergy} ULTIMATE ENERGY`);
 if(core.id==='vengeance'){
  const bloodCost=Math.round(player.hp*.30);player.hp=Math.max(1,player.hp-bloodCost);player.bloodlettingTimer=12;player.skillActive=12;player.skillCooldown=16*cooldownFactor();
  const shieldRequested=Math.round(player.maxHp*.30*1.30);const shieldGain=grantVengeanceShield(shieldRequested);player.vengeanceShieldCap=player.vengeanceShieldHp;player.vengeanceShieldDuration=Math.max(player.vengeanceShieldDuration||0,12);
  burst(player.x,player.y,'#ff304f',28);burst(player.x,player.y,'#ff9baf',14);skillFx.push({type:'bloodletting',x:player.x,y:player.y,life:1,max:1,radius:player.r+48,color:'#ff304f'});notify(`CRIMSON SURGE · -${bloodCost} HP · +${shieldGain} PERMANENT SHIELD · AUTO ATTACK +${Math.round(25+50*(1-player.hp/player.maxHp))}% · 12s`);updateUI();
 }
 else if(core.id==='elemental'){
  player.elementalEmpowerTimer=10;sfx('ultimate');burst(player.x,player.y,'#ffffff',26);
  for(let i=0;i<ELEMENTAL_CORE_ELEMENTS.length;i++){
   const prism=ELEMENTAL_CORE_ELEMENTS[i],angle=i*Math.PI*2/ELEMENTAL_CORE_ELEMENTS.length;
   burst(player.x+Math.cos(angle)*16,player.y+Math.sin(angle)*16,prism.color,10);
   skillFx.push({type:'prismConvergence',x:player.x,y:player.y,life:.62,max:.62,radius:38+i*10,color:prism.color,elementIndex:i});
  }
  notify('ELEMENTAL CONVERGENCE ACTIVE · 10s · ELEMENTAL ATTACKS EMPOWERED');
 }
 else if(core.id==='ember'){sfx('ultimate');skillFx.push({type:'fireRing',x:player.x,y:player.y,life:player.skillActive,max:player.skillActive,radius:90+lv*15,color:'#ff9c65'});burst(player.x,player.y,'#ff9a36',24);notify(`RING OF FIRE · ${player.skillActive.toFixed(1)}s`);}
 else if(core.id==='frost'){sfx('ultimate');player.skillActive+=(player.frostSkillRelic||0)*.7;player.skillShield=player.skillActive;player.skillShieldMax=Math.round(player.maxHp*(.42+lv*.12+(player.frostSkillRelic||0)*.14));player.skillShieldHp=player.skillShieldMax;player.skillShieldPower=1;player.frostFieldTick=0;skillFx.push({type:'iceShield',life:player.skillActive,max:player.skillActive,radius:player.r+23+lv*3,color:'#8cecff'});skillFx.push({type:'frostField',x:player.x,y:player.y,life:player.skillActive,max:player.skillActive,radius:92+lv*10,color:'#8cecff'});burst(player.x,player.y,'#8cecff',20);notify(`CRYO SHIELD + FROST FIELD · CHILLS ENEMIES · ${player.skillShieldMax} SHIELD`);}
 else if(core.id==='nature'){const droneCap=player.natureDroneCap||2;player.natureDroneCharges--;player.natureDroneChargeTimer=player.natureDroneCharges<Math.min(2,droneCap)?12:0;const haveSupport=natureDrones.some(d=>d.type==='support'&&d.hp>0);const type=haveSupport?'dps':'support';natureDrones.push({type,x:player.x+(type==='support'?-20:20),y:player.y-16,hp:type==='support'?42:34,maxHp:type==='support'?42:34,angle:rand(0,6.28),attackTimer:.25,healTimer:1,life:Infinity,boost:0});player.natureDrones=natureDrones;burst(player.x,player.y,'#70e58a',14);sfx('ultimate');notify(type==='support'?'SUPPORT DRONE DEPLOYED':'DPS DRONE DEPLOYED');}else if(core.id==='flash'){const stunDuration=(2.8+lv*.45)*(1+(player.flashStunDurationBonus||0));const targets=enemies.filter(e=>e.hp>0).sort((a,b)=>dist(player,a)-dist(player,b)).slice(0,3);for(const e of targets){addLightningArc(player,e);e.stunned=Math.max(e.stunned||0,stunDuration);e.stunDamageTaken=1.25;applyDamage(e,player.damage*(.72+lv*.12),'#ffe875',true,'STATIC SHOCK');burst(e.x,e.y,'#fff8c2',12);skillFx.push({type:'flashStun',x:e.x,y:e.y,life:stunDuration,max:stunDuration,radius:e.r+10,color:'#ffe875'});}sfx('ultimate');notify(`STATIC SHOCK · ${targets.length} ENEMIES STUNNED · +35% DAMAGE TAKEN`);}
 else if(core.id==='remielle'){player.phaseFlowTick=.12;player.inv=Math.max(player.inv,.25);player.phaseFlowBaseCrit=null;player.phaseFlowBaseRate=player.fireRate;player.phaseFlowBaseSpeed=null;player.phaseFlowCritBonus=0;player.fireRate*=1.25;player.skillShield=player.skillActive;player.skillShieldMax=Math.round(player.maxHp*.25);player.skillShieldHp=player.skillShieldMax;sfx('ultimate');burst(player.x,player.y,'#ff9ed8',22);skillFx.push({type:'phaseFlow',x:player.x,y:player.y,life:player.skillActive,max:player.skillActive,radius:player.r+24,color:'#ffffff',shieldAura:true});notify(`AURALIS · DAYBREAK WALTZ · ATK Speed +25% · FLY SPEED +25% · SHIELD ${player.skillShieldMax}`,2);}
 else if(core.id==='nova'){
 const x=player.x,y=player.y;
 const radius=(142+lv*10)*(1+(player.aetherWellRadiusBonus||0));
 skillFx.push({type:'aetherStasis',x,y,originX:x,originY:y,vx:0,vy:0,life:10,max:10,radius,color:'#fff0a6',damage:player.damage*(.20+lv*.045),collapseDamage:player.damage*(1.15+lv*.20)*(player.aetherCollapseMult||1),tickTimer:.2,phase:'stasis',weaponEnhanced:false});
 sfx('ultimate');burst(x,y,'#fff0a6',24);burst(x,y,'#08070a',12);
 notify('AETHER · EVENT HORIZON · 5s STASIS → 4s MOVING SINGULARITY → COLLAPSE',2);}
 updateUI();}

function updateCoreSkill(dt){if(!player||!core)return;clampVengeanceShields();if(player.skillCooldown>0)player.skillCooldown=Math.max(0,player.skillCooldown-dt);if(core.id==='elemental'&&(player.elementalEmpowerTimer||0)>0)player.elementalEmpowerTimer=Math.max(0,player.elementalEmpowerTimer-dt);if(player.skillActive>0){player.skillActive=Math.max(0,player.skillActive-dt);if(player.skillActive===0&&core.id==='vengeance'&&(player.bloodlettingMaxHpPenalty||0)>0){player.maxHp+=player.bloodlettingMaxHpPenalty;player.bloodlettingMaxHpPenalty=0;player.bloodlettingTimer=0;player.hp=Math.min(player.hp,player.maxHp);burst(player.x,player.y,'#ff304f',12);notify('BLOODLETTING ENDED · Max HP RESTORED');updateUI();}if(player.skillActive===0&&player.phaseFlowBaseRate!==null&&player.phaseFlowBaseRate!==undefined){restorePhaseFlowStats();updateUI();}if(core.id==='ember'){player.skillRingTick-=dt;if(player.skillRingTick<=0){player.skillRingTick=.48;const radius=90+(player.skillLevel||0)*15+(player.emberSkillRelic||0)*8;for(const e of enemies){if(e.hp>0&&dist(player,e)<radius+e.r){applyDamage(e,player.damage*(.62+(player.skillLevel||0)*.20)*(1+(player.emberSkillRelic||0)*.22),'#ff9c65',false,'FIRE RING');e.burn=Math.max(e.burn||0,1.5);e.burnDps=Math.max(e.burnDps||0,(8+(player.skillLevel||0)*3+(player.emberSkillRelic||0)*4)*(player.burnMult||1));e.burnFx=0;e.burnTick=0;}}if(blackHole&&dist(player,blackHole)<radius+blackHole.r)applyDamage(blackHole,player.damage*(.42+(player.skillLevel||0)*.12)*(1+(player.emberSkillRelic||0)*.22),'#ff9c65',false,'FIRE RING');skillFx.push({type:'ringPulse',x:player.x,y:player.y,life:.22,max:.22,radius,color:'#ff9c65'});}}else if(core.id==='remielle'){player.phaseFlowTick=(player.phaseFlowTick||0)-dt;if(player.phaseFlowTick<=0){const baseInterval=Math.max(.20,.42-(player.skillLevel||0)*.035);const upgradedInterval=baseInterval*(1-(player.phaseFlowCadence||0)*.12);player.phaseFlowTick=upgradedInterval;const strikes=1+Math.min(3,player.phaseFlowExtraStrikes||0);for(let strike=0;strike<strikes;strike++)firePhaseFlowAttack(strikes>1?`PRISM FLIGHT ${strike+1}/${strikes}`:'PRISM FLIGHT');}}}if(core.id==='frost'&&(player.skillActive||0)>0){player.frostFieldTick=(player.frostFieldTick||0)-dt;if(player.frostFieldTick<=0){player.frostFieldTick=.45;const radius=92+(player.skillLevel||0)*10+(player.frostSkillRelic||0)*8;for(const e of enemies){if(e.hp>0&&dist(player,e)<radius+e.r){e.frostStacks=Math.min(4,(e.frostStacks||0)+1);e.slow=Math.max(e.slow||0,player.frostSlowDuration||1.6);e.iced=true;burst(e.x,e.y,'#8cecff',3);}}skillFx.push({type:'frostPulse',x:player.x,y:player.y,life:.22,max:.22,radius,color:'#8cecff'});}}if(core.id==='flash'&&(player.skillActive||0)>0){player.flashLinkTimer=Math.max(0,(player.flashLinkTimer||0)-dt);for(const e of enemies){if(e.flashLinkedUntil>0)e.flashLinkedUntil=Math.max(0,e.flashLinkedUntil-dt)}if(player.flashLinkTimer<=0)player.flashLinkTargets=[];}if((player.flashFieldTimer||0)>0){player.flashFieldTimer=Math.max(0,player.flashFieldTimer-dt);player.flashFieldTick=(player.flashFieldTick||0)-dt;if(player.flashFieldTick<=0){player.flashFieldTick=.62/(player.flashQSpeed||1);const target=pick(enemies.filter(e=>e.hp>0));if(target){const strikeDmg=player.damage*(.72+(player.ultLevel||0)*.12)*(player.flashFieldPower||1);addLightningArc({x:target.x,y:0},{x:target.x,y:target.y});applyDamage(target,strikeDmg,'#ffe875',true,'THUNDERFIELD');burst(target.x,target.y,'#fff6a8',9);const nearby=enemies.filter(e=>e!==target&&e.hp>0&&dist(e,target)<155).sort((a,b)=>dist(a,target)-dist(b,target)).slice(0,2);for(const e of nearby){addLightningArc(target,e);applyDamage(e,strikeDmg*.48,'#ffe875',false,'THUNDERFIELD CHAIN');burst(e.x,e.y,'#fff6a8',5)}}}}if((player.frostStormTimer||0)>0){const frostUltRange=Math.min(340,Math.max(220,Math.min(W,H)*.38));player.frostStormTimer=Math.max(0,player.frostStormTimer-dt);player.frostStormTick=(player.frostStormTick||0)-dt;if(player.frostStormTick<=0){player.frostStormTick=.5;const stormDmg=player.damage*(.50+(player.ultLevel||0)*.12)*(player.frostStormPower||1);for(const e of enemies){if(e.hp>0&&dist(player,e)<=frostUltRange){applyDamage(e,stormDmg,'#8cecff',false,'SNOWSTORM');burst(e.x+rand(-e.r,e.r),e.y+rand(-e.r,e.r),'#dffbff',3);}}if(blackHole&&!blackHole.inactive&&blackHole.hp>0&&dist(player,blackHole)<=frostUltRange+blackHole.r)applyDamage(blackHole,stormDmg,'#8cecff',false,'SNOWSTORM');skillFx.push({type:'snowstorm',x:player.x,y:player.y,life:.48,max:.48,radius:Math.max(W,H)*.62,color:'#8cecff'});}if(player.frostStormTimer<=0){const finisher=player.damage*(1.35+(player.ultLevel||0)*.28)*(player.frostStormPower||1);for(const e of enemies){if(e.hp<=0||dist(player,e)>frostUltRange)continue;applyDamage(e,finisher,'#dffbff',false,'SNOWSTORM FINISHER');e.frostStacks=0;e.frozen=Math.max(e.frozen||0,2.5+(player.ultLevel||0)*.25);e.slow=Math.max(e.slow||0,e.frozen);e.iced=true;burst(e.x,e.y,'#e8fdff',15);}if(blackHole&&!blackHole.inactive&&blackHole.hp>0&&dist(player,blackHole)<=frostUltRange+blackHole.r){const extra=player.damage*(1.35+(player.ultLevel||0)*.28)*(player.frostStormPower||1);applyDamage(blackHole,extra,'#e8fdff',false,'SNOWSTORM FINISHER');applyDamage(blackHole,extra,'#e8fdff',false,'SNOWSTORM BOSS BONUS');burst(blackHole.x,blackHole.y,'#e8fdff',28);}notify('SNOWSTORM ENDS · FINISHER DAMAGE · ALL ENEMIES FROZEN');}}
 if(player.skillShield>0){player.skillShield=Math.max(0,player.skillShield-dt);if(player.skillShield===0){player.skillShieldHp=0;player.skillShieldMax=0;}if(core.id==='frost'||core.id==='remielle')updateUI();}for(const fx of skillFx){
 const previousLife=fx.life;fx.life-=dt;
 if(fx.type==='fireRing'||fx.type==='phaseFlow'||fx.type==='frostField'){fx.x=player.x;fx.y=player.y;}
 if(fx.type==='aetherStasis'&&state==='playing'){
  const elapsed=fx.max-fx.life,remain=Math.max(0,5-elapsed);
  if(elapsed<5){
   // During stasis the field is anchored to the moving Aether core, not the cast location.
   fx.x=player.x;fx.y=player.y;fx.phase='stasis';fx.tickTimer=(fx.tickTimer||0)-dt;
   for(const e of enemies){if(e.hp<=0||dist(e,fx)>fx.radius+(e.r||0))continue;e.stunned=Math.max(e.stunned||0,Math.min(remain,dt*1.5));e.stunDamageTaken=1;if(fx.tickTimer<=0)applyDamage(e,fx.damage,'#fff0a6',false,'AETHER EVENT HORIZON STASIS');}
   if(fx.tickTimer<=0)fx.tickTimer=.32;
  }else if(elapsed<9){
   if(fx.phase!=='moving'){
    fx.phase='moving';fx.x=player.x;fx.y=player.y;
    // Prefer the singularity, then a boss. Otherwise aim at the densest enemy cluster.
    let aimTarget=blackHole&&!blackHole.inactive&&blackHole.hp>0?blackHole:null;
    if(!aimTarget)aimTarget=enemies.filter(e=>e.hp>0&&(e.isMiniBoss||e.isFinalBoss||e.role==='boss'||e.role==='miniboss'||e.role==='warden')).sort((a,b)=>dist(player,a)-dist(player,b))[0]||null;
    let aimX=0,aimY=0;
    if(aimTarget){aimX=aimTarget.x-fx.x;aimY=aimTarget.y-fx.y;}
    else{
     const alive=enemies.filter(e=>e.hp>0);
     let best=null,bestCount=0;
     for(const candidate of alive){const group=alive.filter(e=>dist(candidate,e)<=145);if(group.length>bestCount){best=group;bestCount=group.length;}}
     if(best&&best.length){aimX=best.reduce((sum,e)=>sum+e.x,0)/best.length-fx.x;aimY=best.reduce((sum,e)=>sum+e.y,0)/best.length-fx.y;}
     else{const randomAngle=Math.random()*Math.PI*2;aimX=Math.cos(randomAngle);aimY=Math.sin(randomAngle);}
    }
    const aimLength=Math.hypot(aimX,aimY)||1;fx.vx=aimX/aimLength;fx.vy=aimY/aimLength;
    burst(fx.x,fx.y,'#fff7cf',14);
   }
   fx.x=Math.max(32,Math.min(W-32,fx.x+fx.vx*185*dt));fx.y=Math.max(32,Math.min(H-32,fx.y+fx.vy*185*dt));
   fx.tickTimer=(fx.tickTimer||0)-dt;
   for(const e of enemies){if(e.hp<=0)continue;const dx=fx.x-e.x,dy=fx.y-e.y,d=Math.hypot(dx,dy)||1;if(d>=fx.radius)continue;const boss=e.isMiniBoss||e.isFinalBoss||e.role==='miniboss'||e.role==='warden',pull=(boss?64:285)*(1-d/fx.radius)*dt;e.x+=dx/d*pull;e.y+=dy/d*pull;if(fx.tickTimer<=0)applyDamage(e,fx.damage*(boss?.65:1),'#fff0a6',false,'AETHER EVENT HORIZON GRAVITY');}
   if(fx.tickTimer<=0)fx.tickTimer=.32;
  }else if(fx.phase!=='collapse'){
   fx.phase='collapse';burst(fx.x,fx.y,'#fff7cf',20);burst(fx.x,fx.y,'#050509',12);skillFx.push({type:'aetherCollapse',x:fx.x,y:fx.y,life:.72,max:.72,radius:fx.radius,color:'#fff0a6'});
   for(const e of enemies){if(e.hp<=0)continue;const d=dist(e,fx);if(d<fx.radius*1.12){const boss=e.isMiniBoss||e.isFinalBoss||e.role==='miniboss'||e.role==='warden';applyDamage(e,fx.collapseDamage*(boss?2:1)*(1-d/(fx.radius*1.12)*.35),'#fff7cf',true,'AETHER EVENT HORIZON COLLAPSE');}}
   if(blackHole&&!blackHole.inactive&&blackHole.hp>0&&dist(blackHole,fx)<fx.radius+blackHole.r)applyDamage(blackHole,fx.collapseDamage*2,'#fff7cf',true,'AETHER EVENT HORIZON COLLAPSE');
  }
 }
 if(fx.type==='aetherBlackSun'&&state==='playing'){
  fx.x=player.x;fx.y=player.y;
  // Black Sun grants continuous invulnerability for the entire transformation.
  player.inv=Math.max(player.inv,dt+.05);
  fx.tickTimer=(fx.tickTimer||0)-dt;
  for(const e of enemies){if(e.hp<=0)continue;const dx=fx.x-e.x,dy=fx.y-e.y,d2=dx*dx+dy*dy;if(d2>=fx.radius*fx.radius)continue;const d=Math.sqrt(d2)||1,boss=e.isMiniBoss||e.isFinalBoss||e.role==='boss'||e.role==='miniboss'||e.role==='warden';const pull=(boss?72:430)*(1-d/fx.radius)*dt;e.x+=dx/d*pull;e.y+=dy/d*pull;if(d<=Math.max(32,player.r+18))fx.capturedEnemies.add(e.id??e);if(fx.tickTimer<=0)applyDamage(e,fx.damage*(boss?.55:1),'#fff0a6',false,'BLACK SUN GRAVITY');}
  if(blackHole&&!blackHole.inactive&&blackHole.hp>0&&dist(fx,blackHole)<=fx.radius+(blackHole.r||0)&&fx.tickTimer<=0)applyDamage(blackHole,fx.damage*.55,'#fff0a6',false,'BLACK SUN GRAVITY');
  if(fx.tickTimer<=0)fx.tickTimer=.32;
  if(previousLife>0&&fx.life<=0){
   const capturedCount=Math.min(20,fx.capturedEnemies.size),collapseMultiplier=Math.min(2.5,1+capturedCount*.075);
   burst(fx.x,fx.y,'#fff7cf',64);burst(fx.x,fx.y,'#fff0a6',48);burst(fx.x,fx.y,'#08070a',34);burst(fx.x,fx.y,'#ffffff',28);
   skillFx.push({type:'aetherCollapse',x:fx.x,y:fx.y,life:.78,max:.78,radius:fx.radius,color:'#fff7cf',ultimate:true});skillFx.push({type:'aetherShockwave',x:fx.x,y:fx.y,life:.62,max:.62,radius:fx.radius,color:'#fff0a6'});
   for(const e of enemies){if(e.hp<=0||dist(e,fx)>fx.radius*1.08)continue;const boss=e.isMiniBoss||e.isFinalBoss||e.role==='boss'||e.role==='miniboss'||e.role==='warden';applyDamage(e,Math.min(player.damage*12,fx.collapseDamage*collapseMultiplier*(boss?2:1)),'#fff7cf',true,'AETHER BLACK SUN COLLAPSE');}
   if(blackHole&&!blackHole.inactive&&blackHole.hp>0&&dist(fx,blackHole)<=fx.radius+(blackHole.r||0))applyDamage(blackHole,Math.min(player.damage*16,fx.collapseDamage*collapseMultiplier*2),'#fff7cf',true,'AETHER BLACK SUN COLLAPSE');
   notify('BLACK SUN COLLAPSE · '+capturedCount+' ENEMIES CONSUMED · '+Math.round((collapseMultiplier-1)*100)+'% BONUS DAMAGE',2);
  }
 }
 if((fx.type==='aetherWell'||fx.type==='aetherUltWell')&&state==='playing'){
  const isUlt=fx.type==='aetherUltWell',isWeapon=!!fx.weaponEnhanced,r=fx.radius||112,r2=r*r;fx.tickTimer=(fx.tickTimer||0)-dt;
  for(const e of enemies){if(e.hp<=0)continue;const dx=fx.x-e.x,dy=fx.y-e.y,d2=dx*dx+dy*dy;if(d2>=r2)continue;const d=Math.sqrt(d2)||1,boss=e.isMiniBoss||e.isFinalBoss||e.role==='miniboss'||e.role==='warden',falloff=1-d/r,pull=(boss?(isUlt?92:isWeapon?68:60):(isUlt?420:isWeapon?360:280))*falloff*dt;e.x+=dx/d*pull;e.y+=dy/d*pull;if(fx.tickTimer<=0)applyDamage(e,fx.damage*(boss?.55:1)*(player.aetherOrbitalResonance?1.15:1),'#fff0a6',false,isUlt?'BLACK SUN GRAVITY':isWeapon?'EVENTIDE ARRAY GRAVITY':'AETHER GRAVITY');}
  if(fx.tickTimer<=0)fx.tickTimer=.32;
  if(previousLife>0&&fx.life<=0){const trapped=enemies.filter(e=>e.hp>0&&dist(e,fx)<r*1.15).length,crowdMultiplier=isUlt?1+Math.min(6,Math.max(0,trapped-1))*.12:1;burst(fx.x,fx.y,'#fff7cf',isUlt?64:30);burst(fx.x,fx.y,'#fff0a6',isUlt?48:18);burst(fx.x,fx.y,'#08070a',isUlt?34:12);burst(fx.x,fx.y,'#ffffff',isUlt?28:8);if(isUlt){skillFx.push({type:'aetherCollapse',x:fx.x,y:fx.y,life:.78,max:.78,radius:r,color:'#fff7cf',ultimate:true});skillFx.push({type:'aetherShockwave',x:fx.x,y:fx.y,life:.62,max:.62,radius:r,color:'#fff0a6'});}for(const e of enemies){if(e.hp<=0)continue;const d=dist(e,fx);if(d<r*1.15){const boss=e.isMiniBoss||e.isFinalBoss||e.role==='miniboss'||e.role==='warden';applyDamage(e,fx.collapseDamage*crowdMultiplier*(boss?.65:1)*(1-d/(r*1.15)*.35),'#fff7cf',true,isUlt?'AETHER BLACK SUN COLLAPSE':'AETHER SINGULARITY COLLAPSE');}}if(!isUlt)skillFx.push({type:'aetherCollapse',x:fx.x,y:fx.y,life:.42,max:.42,radius:r,color:'#fff0a6',weaponEnhanced:isWeapon});}
 }
}
skillFx=skillFx.filter(f=>f.life>0);
 for(const m of skillMissiles){m.life-=dt;let target=m.targetCore&&blackHole&&!blackHole.inactive&&blackHole.hp>0?blackHole:(m.targetRef&&m.targetRef.hp>0?m.targetRef:(m.targetId!=null?enemies.find(e=>e.hp>0&&e.id===m.targetId):null));if(!target&&!m.targetCore){target=enemies.filter(e=>e.hp>0).sort((a,b)=>dist(m,a)-dist(m,b))[0];if(target){m.targetId=target.id??null;m.targetRef=target;}}if(!target&&blackHole&&!blackHole.inactive&&blackHole.hp>0)target=blackHole;if(target){const dx=target.x-m.x,dy=target.y-m.y,d=Math.hypot(dx,dy)||1,turn=Math.min(1,dt*6.5);const tx=dx/d*m.speed,ty=dy/d*m.speed;m.vx+=(tx-m.vx)*turn;m.vy+=(ty-m.vy)*turn;m.x+=m.vx*dt;m.y+=m.vy*dt;if(d<target.r+m.r+5){const crit=!m.voidWeaponSeed&&!m.lightFeather&&Math.random()<(m.critChance??0.25);const missileDamage=m.damage*(crit?Math.max(1.8,player.critDamage||1.8):1);applyDamage(target,missileDamage,m.color||'#ffb84d',false,crit?(m.elementalMissile?'ELEMENTAL NOVA CRIT':m.lightFeather?'DAWN FEATHER CRIT':'HOMING CRIT'):(m.elementalMissile?'ELEMENTAL NOVA':m.lightFeather?'DAWN FEATHER':m.voidWeaponSeed?'PREDATORY BLOOM':'HOMING'));burst(m.x,m.y,crit?'#fff0a8':(m.color||'#ffb84d'),crit?12:7);if(m.voidWeaponSeed&&m.voidWeaponSeedSplash){for(const nearby of enemies){if(nearby!==target&&nearby.hp>0&&dist(nearby,target)<=76){applyDamage(nearby,missileDamage*.5,'#70e58a',false,'PREDATORY BLOOM SPLASH');burst(nearby.x,nearby.y,'#aaffb2',5);}}if(blackHole&&!blackHole.inactive&&blackHole.hp>0&&target!==blackHole&&dist(blackHole,target)<=76)applyDamage(blackHole,missileDamage*.5,'#70e58a',false,'PREDATORY BLOOM SPLASH');}if(m.lightFeather&&(m.extraPierce||0)>0){m.hitTargets=m.hitTargets||[];m.hitTargets.push(target===blackHole?'core':(target.id??target));const next=enemies.filter(e=>e.hp>0&&!m.hitTargets.includes(e.id)&&e!==target&&dist(e,m)<220).sort((a,b)=>dist(a,m)-dist(b,m))[0];if(next){m.targetRef=next;m.targetId=next.id??null;m.targetCore=next===blackHole;m.x=target.x;m.y=target.y;m.life=Math.max(m.life,.1);m.extraPierce--;continue;}}m.life=0;}}else{m.x+=m.vx*dt;m.y+=m.vy*dt;}}
 skillMissiles=skillMissiles.filter(m=>m.life>0&&m.x>-20&&m.x<W+20&&m.y>-20&&m.y<H+20);if(core.id==='frost'||core.id==='remielle')updateUI();}

function castUltimate(){
 if(state!=='playing'||!player||!core)return;
 const minimum=100;
 if(energy<minimum){notify(`ULTIMATE REQUIRES 100 ENERGY · ${energy}% CHARGED`);return;}
 sfx('ultimate');const spent=energy;energy=Math.min(100,(player.afterglowCapacitor||0)*8);const lv=ultLevel,energyPower=(.65+spent/100)*(1+lv*.18),center={x:player.x,y:player.y},ultRange=Math.min(520,Math.max(340,Math.min(W,H)*.55));const inUltRange=target=>!!target&&dist(center,target)<=ultRange+(target.r||0);ultCastFlash=.55;
 const fxColor=core.id==='ember'?'#ff9c65':core.id==='frost'?'#8cecff':core.id==='remielle'?'#ff9ed8':'#c18aff';
 if(core.id==='ember'){
   const dmg=(55+lv*22)*energyPower*(1+lv*.18);burst(player.x,player.y,'#ff6a2a',35);burst(player.x,player.y,'#d72638',26);
   for(let i=0;i<enemies.length;i++){const e=enemies[i];if(e.hp<=0||!inUltRange(e))continue;applyDamage(e,dmg, '#ff9c65',true,'SOLAR');e.burn=Math.max(e.burn||0,3.1+lv*.35);e.burnDps=Math.max(e.burnDps||0,(12+lv*3)*(player.burnMult||1));e.burnFx=0;e.burnTick=0;e.burnPending=0;burst(e.x,e.y,'#ff9a36',10)}
   if(blackHole&&inUltRange(blackHole)){applyDamage(blackHole,dmg*.8,'#ff9c65',true,'FLARE');burst(blackHole.x,blackHole.y,'#ff9a36',22)}
   notify(`SOLAR FLARE · ${spent} ENERGY CONSUMED`);
 }else if(core.id==='frost'){
   const tickDmg=player.damage*(.34+lv*.08)*energyPower;player.frostStormTimer=5;player.frostStormTick=0;player.frostStormPower=energyPower;player.ultLevel=lv;player.inv=Math.max(player.inv,.45);burst(player.x,player.y,'#8cecff',42);burst(player.x,player.y,'#e8fdff',24);skillFx.push({type:'snowstorm',x:player.x,y:player.y,life:5,max:5,radius:ultRange,color:'#8cecff'});
   // A separate immediate instance makes the singular core/boss feel the storm's heavier impact.
   if(blackHole&&!blackHole.inactive&&blackHole.hp>0)applyDamage(blackHole,tickDmg,'#dffbff',true,'SNOWSTORM IMPACT');
   notify(`SNOWSTORM · 5s DAMAGE OVER TIME · THEN GLOBAL FREEZE · ${spent} ENERGY CONSUMED`);
 }else if(core.id==='remielle'){
   const flares=player.voidflares||0;const lightCrystalCount=Math.min(4,featherTraps.filter(f=>!f.hit&&f.life>0).length);
   // Q is now a lighter burst followed by a five-second, Void Burst-scaled damage-over-time debuff.
   const dmg=player.damage*(.92+lv*.24)*energyPower*(1+lv*.08)*(1+lightCrystalCount*.12);
   const flareDps=player.damage*(.22+lv*.04)*flares*energyPower*(1+lightCrystalCount*.12);
   player.voidflares=0;burst(player.x,player.y,'#ff9ed8',30);burst(player.x,player.y,'#fff0fa',16);ultFx.push({x:player.x,y:player.y,r:125+lv*12,life:.45,max:.45,color:'#ff9ed8'});const ultimateCrystalCount=5,candidates=[...enemies.filter(e=>e.hp>0&&inUltRange(e)),...(blackHole&&!blackHole.inactive&&blackHole.hp>0&&inUltRange(blackHole)?[blackHole]:[])].sort((a,b)=>dist(player,a)-dist(player,b));for(let i=0;i<ultimateCrystalCount;i++){const target=candidates.length?candidates[i%candidates.length]:null,angle=(Math.PI*2*i/ultimateCrystalCount)+rand(-.12,.12),spread=target?30:0,angleFallback=rand(0,Math.PI*2),fallbackX=Math.max(28,Math.min(W-28,player.x+Math.cos(angleFallback)*rand(90,230))),fallbackY=Math.max(28,Math.min(H-28,player.y+Math.sin(angleFallback)*rand(70,180))),shardX=target?Math.max(28,Math.min(W-28,target.x+Math.cos(angle)*spread)):fallbackX,shardY=target?Math.max(28,Math.min(H-28,target.y+Math.sin(angle)*spread)):fallbackY;featherTraps.push({x:player.x,y:player.y,originX:player.x,originY:player.y,destinationX:shardX,destinationY:shardY,launchElapsed:0,launchDuration:.38,age:0,life:8,damage:player.damage*.65,homing:false,targetId:null,targetCore:false,targetRef:null,hit:false,fromUltimate:true,crystalZone:true,zoneAge:0,zoneTick:.5,zoneRadius:58,targetedOnCast:!!target});}
   for(const e of enemies){if(e.hp<=0||!inUltRange(e))continue;applyDamage(e,dmg,'#ff9ed8',true,'RADIANT FINALE');e.voidflareDotTimer=8;e.voidflareDotDps=flareDps;e.voidflareDotTick=0; e.lumineStacks=0;e.lumineTimer=0;burst(e.x,e.y,'#ffd8f0',8);skillFx.push({type:'lightLance',x:player.x,y:player.y,tx:e.x,ty:e.y,life:.18,max:.18,radius:e.r+8,color:'#ff9ed8'});}
   if(blackHole&&!blackHole.inactive&&inUltRange(blackHole)){applyDamage(blackHole,dmg*1.05,'#ffb5e2',true,'RADIANT FINALE');blackHole.voidflareDotTimer=8;blackHole.voidflareDotDps=flareDps;blackHole.voidflareDotTick=0;}notify(`AURALIS · RADIANT FINALE · ${flares} VOID BURST · 8s DOT · +50% LUMOX DAMAGE`,2);
 }else if(core.id==='nature'){
   const dmg=player.damage*(.72+lv*.16)*energyPower*(1+lv*.10);
   const bindBonus=1.65;
   burst(player.x,player.y,'#70e58a',44);burst(player.x,player.y,'#c8ffd1',22);
   ultFx.push({x:player.x,y:player.y,r:ultRange,life:.65,max:.65,color:'#70e58a'});
   for(const e of enemies){if(e.hp<=0||!inUltRange(e))continue;const bound=(e.rooted||0)>0||(e.vineBound||0)>0||(e.natureBind||0)>0;const dealt=dmg*(bound?bindBonus:1);applyDamage(e,dealt,'#70e58a',true,bound?'VERDANT OVERDRIVE · ROOTED':'VERDANT OVERDRIVE');e.natureOverdriveBind=Math.max(e.natureOverdriveBind||0,2);burst(e.x,e.y,'#70e58a',bound?13:8);skillFx.push({type:'natureHeal',x:e.x,y:e.y,life:.42,max:.42,radius:e.r+14,color:'#70e58a'});}
   if(blackHole&&!blackHole.inactive&&blackHole.hp>0&&inUltRange(blackHole))applyDamage(blackHole,dmg,'#70e58a',true,'VERDANT OVERDRIVE');
   if((player.natureUltBuffTimer||0)>0){player.damage/=player.natureUltDamageMult||1;player.fireRate/=player.natureUltRateMult||1;}player.natureOverdrive=12+(player.natureOverdriveBonus||0);player.natureUltBuffTimer=12;player.natureUltDamageMult=1.30;player.natureUltRateMult=1.25;player.natureUltHealMult=1.75;player.damage*=player.natureUltDamageMult;player.fireRate*=player.natureUltRateMult;
   notify(`VERDANT OVERDRIVE · GLOBAL DAMAGE ·  +30% ATK · +25% ATK Speed · +75% HEALING · 12s`);
 }else if(core.id==='vengeance'){
   const missing=1-Math.max(0,Math.min(1,player.hp/Math.max(1,player.maxHp)));const shieldRequested=Math.round(player.maxHp*(.50+.50*missing)*1.30);const shieldGain=grantVengeanceShield(shieldRequested);player.vengeanceShieldCap=player.vengeanceShieldHp;player.vengeanceShieldDuration=Math.max(player.vengeanceShieldDuration||0,14);player.vengeanceUltTimer=14;player.vengeanceShieldRegenTimer=1;burst(player.x,player.y,'#ff304f',34);burst(player.x,player.y,'#ffb3c0',18);skillFx.push({type:'vengeanceRampage',x:player.x,y:player.y,life:14,max:14,radius:player.r+36,color:'#ff304f'});notify(`SANGUINE RAMPAGE · +${shieldGain} PERMANENT SHIELD ·  +6.5% MAX HP SHIELD / SECOND · 14s`);updateUI();
 }else if(core.id==='flash'){player.flashFieldTimer=10;player.flashFieldTick=0;player.flashFieldPower=energyPower;player.inv=Math.max(player.inv,.35);skillFx.push({type:'flashStormField',x:player.x,y:player.y,life:10,max:10,radius:ultRange,color:'#ffe875'});burst(player.x,player.y,'#fff6a8',34);notify(`THUNDERFIELD · PERIODIC LIGHTNING STRIKES · 10s · ${spent} ENERGY CONSUMED`);
 }else if(core.id==='elemental'){
   // Every cast deals the direct elemental burst. Mini-cores are limited by mastery rank.
   const summonCap=getElementalSummonCount(lv),allowedSummonCoreIds=['ember','frost','nature','flash','nova'],available=cores.filter(c=>allowedSummonCoreIds.includes(c.id));
   const burstDamage=(48+lv*18)*energyPower*(1+lv*.15);skillFx.push({type:'prismCataclysm',x:player.x,y:player.y,life:.78,max:.78,radius:Math.min(ultRange+90,220+lv*24+spent*.25),color:'#ff71cd'});
   let hitCount=0;
   for(const target of enemies){if(target.hp<=0||!inUltRange(target))continue;applyDamage(target,burstDamage,'#ff71cd',true,'PRISMATIC CATACLYSM');hitCount++;burst(target.x,target.y,pick(ELEMENTAL_CORE_ELEMENTS).color,8);}
   if(blackHole&&blackHole.hp>0&&!blackHole.inactive&&inUltRange(blackHole)){applyDamage(blackHole,burstDamage,'#ff71cd',true,'PRISMATIC CATACLYSM');hitCount++;}
   const activeSummons=elementalSummons.filter(s=>s.lifeTimer>0);
   const activeCount=activeSummons.length;
   // Recasting Q refreshes every already-active mini-core instead of wasting the summon portion of the ultimate.
   // The refreshed duration and fire-rate buff remain tied to the current ultimate's summon cap.
   for(const summon of activeSummons){summon.lifeTimer=12;summon.buffTimer=12;summon.attackTimer=Math.min(summon.attackTimer||0,.1);}
   const summonCount=Math.max(0,summonCap-activeCount);
   const rankFiveDamageMult=lv>=5?1.5:1;
   // Shuffle the available core types for each Q, then exclude types already active.
   const activeCoreIds=new Set(elementalSummons.filter(s=>s.lifeTimer>0).map(s=>s.coreId));
   const pool=available.filter(c=>!activeCoreIds.has(c.id));
   for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
   const chosen=pool.slice(0,summonCount);
   for(let i=0;i<chosen.length;i++){
    const summonCore=chosen[i],slot=activeCount+i,angle=slot*Math.PI*2/Math.max(1,summonCap);
    elementalSummons.push({coreId:summonCore.id,name:summonCore.name||summonCore.title||summonCore.id,color:summonCore.color||'#72f6ff',x:player.x+Math.cos(angle)*34,y:player.y+Math.sin(angle)*34,r:6,angle,attackTimer:.1,fireRateMult:1.65,buffTimer:12,lifeTimer:12,damageMult:rankFiveDamageMult,slot});
    burst(player.x+Math.cos(angle)*34,player.y+Math.sin(angle)*34,summonCore.color||'#72f6ff',12);
   }
   if(lv>=5)for(const summon of elementalSummons)summon.damageMult=Math.max(summon.damageMult||1,1.5);
   const summonMessage=summonCount?('+'+summonCount+' MINI-CORE'+(summonCount===1?'':'S')):'MINI-CORE LIMIT REACHED';
   notify('PRISMATIC CATACLYSM · '+hitCount+' TARGETS HIT · '+summonMessage+' · '+(activeCount+summonCount)+'/'+summonCap+' ACTIVE · '+(lv>=5?'+50% MINI-CORE DAMAGE · ':'')+'+65% ATK Speed · 12s');
 }else if(core.id==='nova'){
   const duration=10+Math.min(1.2,player.aetherBlackSunDurationBonus||0);
   const radius=Math.min(Math.max(W,H)*.72,Math.max(360,Math.min(W,H)*.62))*(1+(player.aetherWellRadiusBonus||0));
   const rawCollapseDamage=player.damage*(2.8+lv*.55)*energyPower*(1+lv*.12)*(player.aetherCollapseMult||1);const collapseDamage=Math.min(player.damage*8,rawCollapseDamage);
   // Detonate lingering Aether singularities and Eventide Array wells before Black Sun begins.
   // Clear any queued Eventide proc and remove ring visuals already in flight.
   player.voidWeaponChargedAttack=false;player.voidWeaponChargedTarget=null;
   const lingeringWells=skillFx.filter(f=>f.type==='aetherWell'||f.type==='aetherUltWell'||(f.type==='aetherStasis'&&f.phase==='moving'));
   for(const well of lingeringWells){
    const wellRadius=well.radius||112,wellDamage=well.collapseDamage||player.damage*1.5;
    burst(well.x,well.y,'#fff7cf',22);burst(well.x,well.y,'#050509',12);
    skillFx.push({type:'aetherCollapse',x:well.x,y:well.y,life:.55,max:.55,radius:wellRadius,color:'#fff0a6'});
    for(const enemy of enemies){if(enemy.hp<=0||dist(enemy,well)>wellRadius*1.12)continue;const boss=enemy.isMiniBoss||enemy.isFinalBoss||enemy.role==='boss'||enemy.role==='miniboss'||enemy.role==='warden';applyDamage(enemy,Math.min(player.damage*4,wellDamage)*(boss?1.5:1),'#fff7cf',true,'AETHER SINGULARITY DETONATION');}
    if(blackHole&&!blackHole.inactive&&blackHole.hp>0&&dist(blackHole,well)<=wellRadius+(blackHole.r||0))applyDamage(blackHole,Math.min(player.damage*6,wellDamage*1.5),'#fff7cf',true,'AETHER SINGULARITY DETONATION');
   }
   skillFx=skillFx.filter(f=>!lingeringWells.includes(f)&&f.type!=='aetherRingPulse');
   skillFx.push({type:'aetherBlackSun',x:player.x,y:player.y,life:duration,max:duration,radius,color:'#fff0a6',damage:player.damage*(.17+lv*.035)*energyPower*(1+Math.min(.24,player.aetherBlackSunDamageBonus||0)),collapseDamage,tickTimer:.2,capturedEnemies:new Set(),isUltimate:true});
   burst(player.x,player.y,'#fff0a6',38);burst(player.x,player.y,'#050509',28);burst(player.x,player.y,'#fff7cf',16);
   notify('AETHER · BLACK SUN · 10s TRANSFORMATION · CONSUME ENEMIES TO AMPLIFY COLLAPSE',2);
 }else{
   const ax=mouse.dx||1,ay=mouse.dy||0;const len=Math.hypot(ax,ay)||1;const old={x:player.x,y:player.y};player.x=Math.max(16,Math.min(W-16,player.x+ax/len*(155+lv*28)));player.y=Math.max(16,Math.min(H-16,player.y+ay/len*(155+lv*28)));player.inv=Math.max(player.inv,.42);player.ultHaste=12+lv;
   const radius=Math.min(ultRange,115+lv*16+spent*.35),dmg=(42+lv*20)*energyPower*(1+lv*.18);burst(old.x,old.y,'#fff0a6',22);burst(player.x,player.y,'#fff7cf',36);ultFx.push({x:player.x,y:player.y,r:radius,life:.42,max:.42,color:'#fff0a6'});
   for(const e of enemies){if(e.hp>0&&dist(player,e)<radius){applyDamage(e,dmg,'#fff0a6',true,'AETHER');let dx=e.x-player.x,dy=e.y-player.y,l=Math.hypot(dx,dy)||1;e.x+=dx/l*18;e.y+=dy/l*18;burst(e.x,e.y,'#bd7aff',7)}}
   if(blackHole&&dist(player,blackHole)<radius+blackHole.r)applyDamage(blackHole,dmg,'#fff0a6',true,'AETHER');
   notify(`PHASE NOVA · ${spent} ENERGY · OVERCLOCK ${player.ultHaste.toFixed(0)}s`);
 }
 updateUI();
}

function rainbowCoreColor(offset=0){const h=((performance.now()*.12+offset)%360+360)%360/60,c=.7,x=c*(1-Math.abs(h%2-1)),m=.3;let rgb=h<1?[c,x,0]:h<2?[x,c,0]:h<3?[0,c,x]:h<4?[0,x,c]:h<5?[x,0,c]:[c,0,x];return '#'+rgb.map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('');}

function coreTrail(){if(!player||!core)return;const color=core.id==='elemental'?rainbowCoreColor(rand(0,100)):(core.color||'#72f6ff');pushParticle({x:player.x+rand(-3,3),y:player.y+rand(-3,3),vx:rand(-12,12),vy:rand(-12,12),life:core.id==='nova'?.32:core.id==='remielle'?.26:.22,max:core.id==='nova'?.32:core.id==='remielle'?.26:.22,color,size:core.id==='ember'?3:2});}

function updateDamageTexts(dt){for(const d of damageTexts){d.x+=d.vx*dt;d.y+=d.vy*dt;d.vy-=7*dt;d.life-=dt;}compactEffectsByLife(damageTexts); }

function enemyContactDamage(e){
 if(!e||!player||player.inv>0||(player.contactInv||0)>0)return;
 // Collision grants a shared 1.5s contact-only grace period for every core.
 player.contactInv=1.5;
 const roleMultipliers={chaser:1,runner:.78,shooter:.72,tank:1.38,hunter:1.08,artillery:.86,rammer:1.42,warden:1.58,miniboss:1.75};
 let multiplier=roleMultipliers[e.role]??.95;
 if(e.isMiniBoss)multiplier=1.85;
 if(e.role==='rammer'&&(e.chargeTime||0)>0)multiplier=2.05;
 const rawDamage=Math.max(8,Math.round((e.damage||18)*multiplier));
 // Reuse the shared damage pipeline so armor, Aegis Circuit, invulnerability,
 // and Frost/Auralis skill shields all mitigate or absorb the impact.
 damagePlayer(rawDamage);
}

function grantVengeanceShield(amount,pool='vengeanceShieldHp'){if(!player||core?.id!=='vengeance')return 0;const cap=Math.max(0,player.maxHp*1.5),current=Math.max(0,player.vengeanceShieldHp||0)+Math.max(0,player.vengeanceHealingShield||0),granted=Math.min(Math.max(0,Number(amount)||0),Math.max(0,cap-current));player[pool]=Math.max(0,player[pool]||0)+granted;return granted;}

function clampVengeanceShields(){if(!player||core?.id!=='vengeance')return;const cap=Math.max(0,player.maxHp*1.5),total=Math.max(0,player.vengeanceShieldHp||0)+Math.max(0,player.vengeanceHealingShield||0);if(total>cap){let excess=total-cap;const blood=Math.min(excess,Math.max(0,player.vengeanceHealingShield||0));player.vengeanceHealingShield=Math.max(0,(player.vengeanceHealingShield||0)-blood);excess-=blood;if(excess>0)player.vengeanceShieldHp=Math.max(0,(player.vengeanceShieldHp||0)-excess);}player.vengeanceShieldCap=Math.max(0,player.vengeanceShieldHp||0);}

function restoreHull(amount){if(!player||!Number.isFinite(Number(amount)))return 0;const value=Math.max(0,Number(amount));if(player.vengeanceBloodConversion&&core?.id==='vengeance'){const granted=grantVengeanceShield(value,'vengeanceHealingShield');if(granted>0){floatDamage(player.x,player.y-player.r-12,granted,'#ff7189',false,'BLOOD SHIELD');burst(player.x,player.y,'#ff304f',3);}updateUI();return granted;}const before=player.hp;player.hp=Math.min(player.maxHp,player.hp+value);const restored=player.hp-before;if(restored>0){for(let i=0;i<Math.min(7,Math.max(3,Math.ceil(restored/4)));i++){const a=-Math.PI/2+(Math.random()-.5)*Math.PI*1.25;pushParticle({x:player.x+Math.cos(a)*rand(5,player.r+5),y:player.y+Math.sin(a)*rand(5,player.r+5),vx:Math.cos(a)*rand(8,32),vy:-rand(24,58),life:rand(.65,1.05),max:1.05,color:'#72ff9b',size:3,glyph:'+'});}burst(player.x,player.y,'#72ff9b',Math.min(12,Math.max(4,Math.ceil(restored/3))));}recordCombatMetric('healingReceived',restored);updateUI();return restored;}

function aetherRendAttackMultiplier(target){return 1-Math.min(10,Math.max(0,Number(target?.aetherRendStacks)||0))*.05;}

function hasAetherBlackHoleField(){return !!((skillFx||[]).some(fx=>['aetherWell','aetherUltWell','aetherStasis','aetherBlackSun'].includes(fx.type)&&fx.life>0));}

function hasAetherEventideSingularity(){return !!((skillFx||[]).some(fx=>(fx.type==='aetherWell'&&fx.weaponEnhanced||fx.type==='aetherCollapse'&&fx.weaponEnhanced)&&fx.life>0));}

function damagePlayer(d){if((skillFx||[]).some(fx=>fx.type==='aetherBlackSun'&&fx.life>0))return;if(player.inv>0)return;sfx('damage');const incomingDamage=Math.max(0,Number(d)||0);if(core?.id==='nova'&&player?.voidWeaponPassive==='eventide-array'&&hasAetherEventideSingularity()){const rank=Math.max(1,Math.min(5,player.voidWeaponRank||1));d=incomingDamage*(1-[.15,.20,.25,.30,.35][rank-1]);}else if(core?.id==='vengeance'){const missingHpRatio=1-Math.max(0,Math.min(1,player.hp/Math.max(1,player.maxHp)));const vengeanceReduction=Math.min(.75,missingHpRatio*.75);d=incomingDamage*(1-vengeanceReduction);}else d=incomingDamage;const hasSkillShield=(core?.id==='frost'||core?.id==='remielle')&&(player.skillShield||0)>0&&(player.skillShieldHp||0)>0;if(hasSkillShield){const frostShieldHit=core?.id==='frost';const absorbed=Math.min(Math.max(0,d),player.skillShieldHp);recordCombatMetric('damageReceived',absorbed);if(frostShieldHit){const attacker=enemies.filter(e=>e.hp>0&&dist(player,e)<player.r+42+e.r).sort((a,b)=>dist(player,a)-dist(player,b))[0];if(attacker){attacker.frostStacks=0;attacker.frozen=Math.max(attacker.frozen||0,2.2);attacker.slow=Math.max(attacker.slow||0,2.2);attacker.iced=true;burst(attacker.x,attacker.y,'#e8fdff',16);notify('CRYO SHIELD COUNTER · ATTACKER FROZEN');}}player.skillShieldHp=Math.max(0,player.skillShieldHp-absorbed);d-=absorbed;floatDamage(player.x,player.y-8,absorbed,'#8cecff',false,'SHIELD');burst(player.x,player.y,'#8cecff',5);if(player.skillShieldHp<=0){player.skillShield=0;notify('CRYO SHIELD BROKEN');burst(player.x,player.y,'#e1ffff',16)}}if(d>0)d=Math.max(.5,d*(1-Math.min(.7,(player.armor||0)/100))*(1-Math.min(.24,(player.aegisCircuit||0)*.08))*(core?.id==='frost'&&player.frostGlacierHeart?0.92:1)*(core?.id==='nature'&&player.natureEvergreenCovenant?1-Math.min(.30,natureDrones.filter(drone=>drone.hp>0).length*.06):1));if(core?.id==='vengeance'&&(player.vengeanceHealingShield||0)>0&&d>0){const absorbed=Math.min(d,player.vengeanceHealingShield);recordCombatMetric('damageReceived',absorbed);player.vengeanceHealingShield-=absorbed;d-=absorbed;floatDamage(player.x,player.y-8,absorbed,'#ff7189',false,'BLOOD CONVERSION');burst(player.x,player.y,'#ff304f',4);}if(core?.id==='vengeance'&&(player.vengeanceShieldHp||0)>0&&d>0){const absorbed=Math.min(d,player.vengeanceShieldHp);recordCombatMetric('damageReceived',absorbed);player.vengeanceShieldHp-=absorbed;d-=absorbed;floatDamage(player.x,player.y-8,absorbed,'#ff526b',false,'BLOOD SHIELD');burst(player.x,player.y,'#ff304f',4);}if(d>0){recordCombatMetric('damageReceived',d);player.hp-=d;floatDamage(player.x,player.y,d,'#ff709d',false,'-');player.inv=.65;}burst(player.x,player.y,core?.id==='frost'&&(player.skillShield||0)>0?'#8cecff':core?.id==='remielle'&&(player.skillShield||0)>0?'#ff9ed8':'#ff6c9d',12);updateUI();if(player.hp<=0){player.hp=0;saveData.bestRooms[currentWorld]=Math.max(saveData.bestRooms[currentWorld]||0,cleared);persist();state='dead';showModal('SIGNAL LOST',`YOU REACHED ROOM ${room}`,'The void has claimed this particle. Every run is data. Every death is a very rude lesson.',[{glyph:'↻',title:'REBOOT PARTICLE',desc:'Start a new run with a fresh core.',action:()=>{run++;start()}}]);}updateUI()}

function killEnemy(e){if(core?.id==='remielle'&&featherTraps.filter(f=>f.fromKillCrystal&&!f.hit&&f.life>0).length<5){featherTraps.push({x:e.x,y:e.y,age:0,life:8,damage:player.damage*.65,homing:false,targetId:null,targetCore:false,targetRef:null,hit:false,fromKillCrystal:true});burst(e.x,e.y,'#ffd8f0',5);}sfx('kill');addEnergy(3+(player.energyOnKill||0));addShards(Math.floor(rand(3,7)+(player.shardBonus||0)));if(e.isMiniBoss){const bonusShards=55+room*2;addShards(bonusShards);gainXP(70+room*7);notify(`MINI-BOSS DEFEATED · +${bonusShards} SHARDS · BONUS XP`);supernovaBurst(e.x,e.y,e.r||22,e.color||'#fff',true);}if(player.lifeSiphon)restoreHull(player.lifeSiphon);if(core?.id==='ember'&&e.burn>0&&player.phoenixHeal)restoreHull(player.phoenixHeal);if(core?.id==='ember'&&e.burn>0&&player.burnSplash){for(const other of enemies){if(other!==e&&other.hp>0&&dist(e,other)<78){applyDamage(other,player.damage*.45,'#ff9c65',false,'ASHFALL');other.burn=Math.max(other.burn||0,1.8);other.burnDps=Math.max(other.burnDps||0,6*(player.burnMult||1));other.burnFx=0;other.burnTick=0;other.burnPending=0;}}}kills++;if(blackHole&&!blackHole.inactive){blackHole.kills=(blackHole.kills||0)+1;}if(['horde','ambush','challenge'].includes(roomType)&&!e.isMiniBoss){roomObjective.kills=(roomObjective.kills||0)+1;roomKills=roomObjective.kills;if(roomType==='challenge'&&roomObjective.kills>=roomObjective.target){completeObjectiveRoom();}}const rawValue=Math.round(9+room*1.4+level*.8);const remaining=Math.max(0,stageXpCap-stageXpEarned);const taper=Math.pow(Math.max(0,1-stageXpEarned/Math.max(1,stageXpCap)),0.65);const value=Math.min(remaining,Math.max(0,Math.round(rawValue*taper)));if(value>0){stageXpEarned+=value;xpDrops.push({x:e.x,y:e.y,vx:rand(-28,28),vy:rand(-35,5),r:4,value,life:12,pulse:rand(0,6)})}if(e.isFinalBoss||e.isBoss||e.role==='boss')supernovaBurst(e.x,e.y,e.r||30,e.color||'#bd92ff',true);else if(e.isMiniBoss||e.role==='miniboss')supernovaBurst(e.x,e.y,e.r||22,e.color||'#aabaff',false);else burst(e.x,e.y,e.color||'#9cb5ff',7)}

