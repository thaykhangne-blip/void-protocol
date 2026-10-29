// PROGRESSION MODULE
// Source fragment consumed by scripts/build.js. Do not import directly.

function clearToast(){toastTimer=0;toastPriority=0;const t=$('toast');if(t){t.classList.remove('show');t.textContent='';}}

function notify(){clearToast()}

function addEnergy(amount){const before=energy;energy=Math.max(0,Math.min(100,energy+amount));if(energy-before<amount&&amount>0)notify('ULTIMATE ENERGY AT CAP · 100');updateUI();return energy-before;}

function addShards(amount){const gain=Math.max(0,Math.floor(amount*(1+.10*Math.min(3,player?.salvageDividend||0))));shards=Math.max(0,shards+gain);updateUI();return shards;}

function xpRequired(lv){return Math.floor(30+lv*18+Math.max(0,lv-4)*5)}

function applyCoreEvolution(lv){
 if(!player||![5,10,15,20].includes(lv))return null;
 player.evolutions=player.evolutions||[];
 if(player.evolutions.some(e=>e.level===lv))return null;
 const id=core?.id||'ember';let name='',desc='';
 if(id==='ember'){
  if(lv===5){player.burnMult=1.30;name='CINDERHEART';desc='Burn damage increased by 30%, including Ring of Fire and other burn sources.'}
  if(lv===10){player.burnSplash=true;name='ASHFALL';desc='Burning enemies explode on defeat, damaging and igniting nearby enemies.'}
  if(lv===15){player.phoenixHeal=3;name='PHOENIX FURNACE';desc='Defeating a burning enemy restores 3 HP.'}
  if(lv===20){player.infernoCrown=true;name='INFERNO CROWN';desc='Deal 20% more damage to burning enemies.'}
 }else if(id==='frost'){
  if(lv===5){player.frostSlowDuration=2.4;name='PERMAFROST';desc='Ice hits slow enemies for 50% longer.'}
  if(lv===10){player.armor+=12;player.maxHp+=12;restoreHull(12);name='GLACIAL BASTION';desc:'+12 DEF, +12 Max HP, and restore 12 HP.'}
  if(lv===15){player.shatterglass=true;name='SHATTERGLASS';desc='Deal 15% more damage to slowed enemies.'}
  if(lv===20){player.absoluteZero=true;player.frostSlowDuration=3.2;name='ABSOLUTE ZERO';desc='Slow lasts 3.2s.'}
 }else if(id==='nova'){
  if(lv===5){player.aetherStasisBonus=(player.aetherStasisBonus||0)+.6;name='EVENT HORIZON';desc='Event Horizon stasis lasts 0.6s longer before the singularity begins moving.'}
  if(lv===10){player.aetherCollapsePerCaptureBonus=(player.aetherCollapsePerCaptureBonus||0)+.12;name='SINGULARITY AMPLIFIER';desc='Collapse damage gains +12% per additional enemy caught, up to +60%.'}
  if(lv===15){player.aetherSlowFieldRank=1;name='GRAVITATIONAL RESONANCE';desc='Enemies hit by Aether field pulses are slowed by 20% for 1.2s.'}
  if(lv===20){player.aetherAftershockRank=1;name='BLACK SUN AFTERSHOCK';desc='Black Sun collapse releases a secondary shockwave dealing 35% of collapse damage.'}
 }else if(id==='flash'){
  if(lv===5){player.flashChainPower=(player.flashChainPower||1)*1.10;name='ARC CONDUCTOR';desc='Lightning chain hits deal 10% more damage.'}
  if(lv===10){player.flashStunDurationBonus=(player.flashStunDurationBonus||0)+.20;name='STATIC CHARGE';desc='Static Shock stuns last 20% longer.'}
  if(lv===15){player.critDamage=(player.critDamage||1.8)*1.12;name='CAPACITOR SURGE';desc='Critical-hit damage increased by 12%.'}
  if(lv===20){player.flashQPower=(player.flashQPower||1)*1.10;player.flashQSpeed=(player.flashQSpeed||1)*1.15;name='THUNDERFIELD OVERDRIVE';desc='Thunderfield strikes 15% faster and deal 10% more damage.'}
 }else if(id==='remielle'){
  if(lv===5){player.luminizeMult=(player.luminizeMult||1)*1.2;name='PRISMATIC SNARE';desc='Lumox burst damage increased by 20%.'}
  if(lv===10){player.phaseFlowBonus=(player.phaseFlowBonus||0)+1.5;name='PRISM FLIGHT';desc='Daybreak Waltz lasts 1.5 seconds longer, allowing more autonomous light strikes.'}
  if(lv===15){player.prismatic=true;name='PRISMATIC';desc='Enemies carrying Lumine Buildup take 15% more damage from all your attacks.'}
  if(lv===20){player.maxVoidflares=4;player.luminizeMult=(player.luminizeMult||1)*1.25;name='LUMINOUS ARMORY';desc='Light swords reach their maximum size and quantity; store a fourth Void Burst and gain +25% Lumox damage.'}
 }else if(id==='nature'){
  if(lv===5){player.natureDroneCap=3;natureDrones=natureDrones.filter(d=>d.hp>0);natureDrones.forEach((d,i)=>{d.type=i===0?'support':'dps';d.maxHp=d.type==='support'?42:34;d.hp=Math.min(d.hp,d.maxHp);});while(natureDrones.length<3){const i=natureDrones.length,type=i===0?'support':'dps',angle=i*Math.PI*2/3;natureDrones.push({type,x:player.x+Math.cos(angle)*24,y:player.y+Math.sin(angle)*24,hp:type==='support'?42:34,maxHp:type==='support'?42:34,angle,attackTimer:.25,healTimer:1,life:Infinity,boost:0});}player.natureDrones=natureDrones;name='ROOT NETWORK';desc='Immediately deploys 2 DPS drones and 1 healing support drone, raising the active drone limit to 3.'}
  if(lv===10){player.natureDroneCap=4;natureDrones=natureDrones.filter(d=>d.hp>0);natureDrones.forEach((d,i)=>{d.type=i===0?'support':'dps';d.maxHp=d.type==='support'?42:34;d.hp=Math.min(d.hp,d.maxHp);});while(natureDrones.length<4){const i=natureDrones.length,type=i===0?'support':'dps',angle=i*Math.PI/2;natureDrones.push({type,x:player.x+Math.cos(angle)*24,y:player.y+Math.sin(angle)*24,hp:type==='support'?42:34,maxHp:type==='support'?42:34,angle,attackTimer:.25,healTimer:1,life:Infinity,boost:0});}player.natureDrones=natureDrones;name='SYMBIOSIS';desc='Immediately deploys 3 DPS drones and 1 healing support drone, raising the active drone limit to 4.'}
  if(lv===15){player.natureDpsDamageUpgrade=(player.natureDpsDamageUpgrade||0)+1;name='PREDATOR BLOOM';desc='DPS drones deal 16% more damage.'}
  if(lv===20){player.natureWorldtreeProtocol=(player.natureWorldtreeProtocol||0)+1;name='WORLDTREE PROTOCOL';desc='DPS drone attacks deal 20% more damage.'}
 }else if(id==='elemental'){
  if(lv===5){player.elementalDamageMult=(player.elementalDamageMult||1)*1.10;name='SPECTRUM CALIBRATION';desc='Elemental attacks deal 10% more damage.'}
  if(lv===10){player.elementalCooldownBonus=2;name='CHROMATIC TEMPEST';desc='Elemental Convergence cooldown reduced by 2 seconds.'}
  if(lv===15){player.elementalDamageMult=(player.elementalDamageMult||1)*1.12;name='CONVERGENCE';desc='Elemental attack damage increased by another 12%.'}
  if(lv===20){player.elementalUltMult=(player.elementalUltMult||1)*1.25;name='FOURFOLD CATACLYSM';desc='Prismatic Cataclysm deals 25% more damage.'}
 }
 if(!name)return null;
 // Every evolution grants permanent core-specific stat growth as well as its unique mechanic.
 // These are applied once because the milestone is recorded only after this block.
 let growthDesc='';
 if(id==='ember'){
  player.damage+=1;player.maxHp+=8;restoreHull(8);player.armor=(player.armor||0)+2;
  growthDesc='Core growth: +1 ATK, +8 Max HP (restore 8 HP), +2 DEF.';
 }else if(id==='frost'){
  player.damage+=.8;player.maxHp+=10;player.hp=Math.min(player.maxHp,player.hp+10);player.armor=(player.armor||0)+3;
  growthDesc='Core growth: +0.8 ATK, +10 Max HP (restore 10 HP), +3 DEF.';
 }else if(id==='nova'){
  player.damage+=.8;player.maxHp+=6;player.hp=Math.min(player.maxHp,player.hp+6);
  growthDesc='Core growth: +0.8 ATK, +6 Max HP (restore 6 HP).';
 }else if(id==='flash'){
  player.damage+=.6;player.maxHp+=5;restoreHull(5);
  growthDesc='Core growth: +0.6 ATK, +5 Max HP (restore 5 HP).';
 }else if(id==='remielle'){
  player.damage+=.8;player.maxHp+=7;player.hp=Math.min(player.maxHp,player.hp+7);
  growthDesc='Core growth: +0.8 ATK, +7 Max HP (restore 7 HP).';
 }else if(id==='elemental'){
  player.damage*=1.10;player.maxHp+=8;restoreHull(8);
  growthDesc='Core growth: +1 ATK, +8 Max HP (heal 8).';
 }
 desc += ' ' + growthDesc + ' These gains are also listed in ORBITAL BUILD → EVOLUTION STAT GAINS.';
 const evo={level:lv,name,desc,core:id,color:core?.color||'#fff',growth:growthDesc};
 player.evolutions.push(evo);player.evoTier=player.evolutions.length;
 // Level evolutions do not scale orb size; only HP, attack damage, and DEF increase as stats.
 build.push('LV '+lv+' · '+name);
 burst(player.x,player.y,evo.color,22);
 return evo;
}

function showCoreEvolution(){
 if(!coreEvolutionQueue.length)return;
 const evo=coreEvolutionQueue[0];state='evolution';sfx('level');
 showModal('CORE EVOLUTION · LEVEL '+evo.level,evo.name,evo.desc,[{glyph:core?.glyph||'✦',color:evo.color,title:'EVOLUTION UNLOCKED',desc:'Evolution unlocked. Your core gains a new effect and stronger stats for this run.',action:()=>{
  coreEvolutionQueue.shift();
  if(coreEvolutionQueue.length){showCoreEvolution();return;}
  state='playing';updateUI();
  if(levelUpsPending>0){showLevelUp();return;}
  hideModal();last=performance.now();
  if(pendingWorldComplete){pendingWorldComplete=false;completeWorld();}
  else if(pendingPortalReveal||pendingTutorialAdvance){continueAfterRoomClear();}
 }}]);
}

function playCoreLevelUpEffect(){
 if(!player)return;
 const x=player.x,y=player.y;
 burst(x,y,'#ffe38a',24);
 for(let i=0;i<18;i++){
  const a=(Math.PI*2*i/18)+rand(-.08,.08),speed=rand(42,105);
  pushParticle({x:x+Math.cos(a)*rand(5,player.r+4),y:y+Math.sin(a)*rand(5,player.r+4),vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-18,life:rand(.45,.85),max:.85,color:i%3===0?'#fff2b0':'#ffc857',size:3,glyph:i%3===0?'✦':'+'});
 }
 skillFx.push({type:'levelUpHalo',x,y,life:.62,max:.62,color:'#ffd76a',r:player.r+10});
}

function gainXP(amount){
 xp+=amount;
 while(xp>=xpNext){
  xp-=xpNext;level++;xpNext=xpRequired(level);levelUpsPending++;
  player.maxHp+=3;restoreHull(5);player.damage+=.35;player.armor=(player.armor||0)+1;
  if([5,10,15,20].includes(level)){
   player.damage+=1.2;player.maxHp+=8;restoreHull(8);
   const evo=applyCoreEvolution(level);if(evo)coreEvolutionQueue.push(evo);
  }else notify('ORB LEVEL UP · LV '+level);
 }
 updateUI();
 if((coreEvolutionQueue.length||levelUpsPending>0)&&state==='playing'){
  playCoreLevelUpEffect();
  state='levelupIntro';
  setTimeout(()=>{
   if(state!=='levelupIntro')return;
   state='playing';
   if(coreEvolutionQueue.length)showCoreEvolution();
   else if(levelUpsPending>0)showLevelUp();
  },560);
 }
}

function perkRank(title){const t=String(title||'').toUpperCase();switch(t){
 case 'OVERCHARGED PHOTONS':return buildCount('OVERCHARGED PHOTONS')+buildCount('DENSE PHOTONS')+buildCount('MARKET: DENSE PHOTONS');
 case 'DENSE PHOTONS':return buildCount('OVERCHARGED PHOTONS')+buildCount('DENSE PHOTONS');
 case 'ACCELERATED CYCLE':return buildCount('ACCELERATED CYCLE')+buildCount('RAPID PULSAR');
 case 'RAPID PULSAR':return buildCount('ACCELERATED CYCLE')+buildCount('RAPID PULSAR');
 case 'REACTIVE PLATING':return buildCount('REACTIVE PLATING')+buildCount('REINFORCED SHELL');
 case 'REINFORCED SHELL':return buildCount('REACTIVE PLATING')+buildCount('REINFORCED SHELL');
 case 'PREDICTIVE TARGETING':return Math.max(0,Math.min(10,Number(player?.predictiveTargetingRank)||0));
 case 'ULTIMATE MASTERY':return ultLevel||0;
 case 'EMBER: INFERNAL CONFLUX':return player?.emberSkillRelic||0;
 case 'FROST: ABSOLUTE AEGIS':return player?.frostSkillRelic||0;
 case 'AETHER: BLACK SUN CATALYST':return player?.novaSkillRelic||0;
 case 'AURALIS: DAYBREAK CHORUS':return player?.remielleSkillRelic||0;
 case 'EMBER: PYRE CASCADE':return player?.pyreCascade||0;
 case 'FROST: CRYSTAL RESONANCE':return player?.crystalResonance||0;
 case 'AETHER: GRAVITATIONAL LENS':return Math.round((player?.aetherPullStrengthBonus||0)/.18);
 case 'AETHER: BLACK SUN CATALYST':return player?.novaSkillRelic||0;
 case 'AETHER: EVENT HORIZON':case 'EVENT HORIZON':return Math.round((player?.aetherStasisBonus||0)/.6);
 case 'AETHER: SINGULARITY AMPLIFIER':case 'SINGULARITY AMPLIFIER':return Math.round((player?.aetherCollapsePerCaptureBonus||0)/.12);
 case 'AETHER: COLLAPSING STAR':return Math.round((player?.aetherBossCollapseBonus||0)/.20);
 case 'AETHER: GRAVITY WELL':return Math.round((player?.aetherWellDurationBonus||0)/.8);
 case 'AETHER: LUMINAL OVERDRIVE':return Math.round((player?.aetherBlackSunRadiusBonus||0)/.12);
 case 'AETHER: ORBITAL RESONANCE':return player?.aetherRendPulseBonus?1:0;
 case 'AETHER: BLACK SUN AFTERSHOCK':case 'BLACK SUN AFTERSHOCK':return player?.aetherAftershockRank||0;
 case 'AETHER: GRAVITATIONAL RESONANCE':case 'GRAVITATIONAL RESONANCE':return player?.aetherSlowFieldRank||0;
 case 'PRISM: CUBIC OVERLOAD':return player?.elementalCubeOverload||0;
 case 'PRISM: CHAIN REACTION':return player?.elementalChainReaction||0;
 case 'PRISM: FROST LATTICE':return player?.elementalFrostLattice||0;
 case 'PRISM: VERDANT SWARM':return player?.elementalVerdantSwarm||0;
 case 'PRISM: BURNING CONSTELLATION':return player?.elementalBurningConstellation||0;
 case 'PIERCING PHOTONS':return player?.pierce||0;
 case 'VOID SIPHON':return Math.floor((player?.lifeSiphon||0)/2);
 
 case 'SIDE CANNONS':return player?.sideCannons||0;
 case 'HOMING GUIDANCE':return player?.homingProjectiles||0;
 case 'MISSILE SALVO':return player?.autoMissiles||0;
 case 'RICOCHET CIRCUIT':return player?.ricochet||0;
 case 'CHAIN LIGHTNING':return player?.chainLightning||0;
 case 'CRITICAL PAYLOAD':return Math.max(0,Math.round(((player?.critDamage||1.8)-1.8)/.25));
 case 'SALVAGE PROTOCOL':return player?.shardBonus||0;
 case 'CAPACITOR KILLCHAIN':return Math.floor((player?.energyOnKill||0)/2);
 case 'MAGNETAR FIELD':return Math.max(0,Math.round(((player?.magnet||55)-55)/45));
 case 'PULSE REACTOR':return Math.ceil((player?.pulseAura||0)/24);
 case 'LIGHT FIELD':return player?.lightField||0;case 'PHASE RESERVE':return player?.extraDashChargeRank||0;case 'AFTERGLOW CAPACITOR':return player?.afterglowCapacitor||0;case 'SALVAGE DIVIDEND':return player?.salvageDividend||0;case 'LAST STAND':return player?.lastStand||0;case 'PHASE MOMENTUM':return player?.phaseMomentumRank||0;case 'REPAIR MATRIX':return player?.repairMatrix||0;case 'CRITICAL BATTERY':return player?.criticalBattery||0;case 'SINGULARITY HUNTER':return player?.singularityHunter||0;
 case 'AEGIS CIRCUIT':return player?.aegisCircuit||0;case 'OVERCLOCK RELAY':return player?.overclockRelay||0;
 case 'PRISM FLIGHT: SWIFT CURRENT':return player?.phaseFlowCadence||0;
 case 'PRISM FLIGHT: LASTING RADIANCE':return player?.phaseFlowDuration||0;
 case 'PRISM FLIGHT: PRISM ECHO':return player?.phaseFlowPower||0;
 case 'PRISM FLIGHT: MULTIPLICITY':return player?.phaseFlowExtraStrikes||0;
 case 'CORE SKILL MASTERY':return player?.skillLevel||0;
 case 'GLASS CANNON':return buildCount('GLASS CANNON');
 case 'CORE RESONANCE':case 'AURALIS: CORE RESONANCE':return buildCount('RESONANCE');
 case 'ARMOR MATRIX':return Math.ceil((player?.armor||0)/8);
 case 'PHASE DRIVE':return Math.min(3,buildCount('PHASE DRIVE'));
 case 'TEMPORAL COMPRESSION':return player?.cooldownReduction||0;
 default:return buildCount(t);
}}

// Use the shared rank table; perks without a listed cap can keep stacking.

function perkMaxRank(title){const key=String(title||'').trim().toUpperCase();return PERK_MAX_RANK[key]??Infinity}

function perkAvailable(o){if(String(o.title||'').trim().toUpperCase()==='AURALIS: CORE RESONANCE'&&core?.id!=='remielle')return false;return perkRank(o.title)<perkMaxRank(o.title)}

function coreExclusiveWeight(perk){const title=String(perk?.title||'').trim().toUpperCase();const prefixes={ember:['EMBER:'],frost:['FROST:'],nova:['AETHER:'],nature:['NATURE:'],flash:['FLASH:'],vengeance:['CRIMSON:'],remielle:['AURALIS:','PRISM FLIGHT:'],'elemental':['PRISM:']}[core?.id]||[];return prefixes.some(prefix=>title.startsWith(prefix))?6:1}

function randomPerks(options,count=3){const pool=options.filter(perkAvailable),picks=[],limit=Math.min(count,pool.length);while(picks.length<limit&&pool.length){const totalWeight=pool.reduce((sum,o)=>sum+coreExclusiveWeight(o),0);let roll=Math.random()*totalWeight,index=pool.length-1;for(let i=0;i<pool.length;i++){roll-=coreExclusiveWeight(pool[i]);if(roll<0){index=i;break}}picks.push(pool.splice(index,1)[0])}return picks}

function createGeneralPerks(){return [
 {id:'homing-guidance',title:'HOMING GUIDANCE',glyph:'◎',color:'#d2a0ff',cost:70,maxRank:1,rank:()=>player?.homingProjectiles||0,desc:'Primary auto-attack and side-cannon projectiles steer toward a living target.',action:()=>{player.homingProjectiles=1;build.push('Homing Guidance')}},
 {id:'phase-reserve',title:'PHASE RESERVE',glyph:'◇',color:'#9deaff',cost:65,maxRank:1,rank:()=>player?.extraDashChargeRank||0,desc:'Gain one extra dash charge. Charges recharge one at a time.',action:()=>{player.extraDashChargeRank=1;player.dashCharges=Math.min(2,(player.dashCharges||0)+1);build.push('Phase Reserve')}},
 {id:'afterglow-capacitor',title:'AFTERGLOW CAPACITOR',glyph:'✹',color:'#c29aff',cost:60,maxRank:3,rank:()=>player?.afterglowCapacitor||0,desc:'Your ultimate refunds 8 energy per rank after use.',action:()=>{player.afterglowCapacitor=Math.min(3,(player.afterglowCapacitor||0)+1);build.push('Afterglow Capacitor '+player.afterglowCapacitor)}},
 {id:'salvage-dividend',title:'SALVAGE DIVIDEND',glyph:'⬡',color:'#ffe38a',cost:45,maxRank:3,rank:()=>player?.salvageDividend||0,desc:'Collect 10% more Void Shards per rank.',action:()=>{player.salvageDividend=Math.min(3,(player.salvageDividend||0)+1);build.push('Salvage Dividend '+player.salvageDividend)}},
 {id:'last-stand',title:'LAST STAND',glyph:'♥',color:'#ff79b8',cost:55,maxRank:2,rank:()=>player?.lastStand||0,desc:'Deal 15% more damage per rank while at or below 35% HP.',action:()=>{player.lastStand=Math.min(2,(player.lastStand||0)+1);build.push('Last Stand '+player.lastStand)}},
 {id:'phase-momentum',title:'PHASE MOMENTUM',glyph:'➤',color:'#72f6ff',cost:60,maxRank:2,rank:()=>player?.phaseMomentumRank||0,desc:'After dashing, deal 10% more damage per rank for 2.5s.',action:()=>{player.phaseMomentumRank=Math.min(2,(player.phaseMomentumRank||0)+1);build.push('Phase Momentum '+player.phaseMomentumRank)}},
 {id:'repair-matrix',title:'REPAIR MATRIX',glyph:'✚',color:'#83ffc5',cost:50,maxRank:3,rank:()=>player?.repairMatrix||0,desc:'Restore 8 HP per rank when you leave a cleared room.',action:()=>{player.repairMatrix=Math.min(3,(player.repairMatrix||0)+1);build.push('Repair Matrix '+player.repairMatrix)}},
 {id:'critical-battery',title:'CRITICAL BATTERY',glyph:'ϟ',color:'#ffe875',cost:55,maxRank:3,rank:()=>player?.criticalBattery||0,desc:'Critical hits grant 2 ultimate energy per rank.',action:()=>{player.criticalBattery=Math.min(3,(player.criticalBattery||0)+1);build.push('Critical Battery '+player.criticalBattery)}},
 {id:'singularity-hunter',title:'SINGULARITY HUNTER',glyph:'◉',color:'#c29aff',cost:70,maxRank:3,rank:()=>player?.singularityHunter||0,desc:'Deal 12% more damage per rank to singularities and bosses.',action:()=>{player.singularityHunter=Math.min(3,(player.singularityHunter||0)+1);build.push('Singularity Hunter '+player.singularityHunter)}},
 {id:'aegis-circuit',title:'AEGIS CIRCUIT',glyph:'⬢',color:'#8cecff',cost:55,maxRank:3,rank:()=>player?.aegisCircuit||0,desc:'Reduce incoming damage by 8% per rank, after DEF.',action:()=>{player.aegisCircuit=Math.min(3,(player.aegisCircuit||0)+1);build.push('Aegis Circuit '+player.aegisCircuit)}},
 {id:'overclock-relay',title:'OVERCLOCK RELAY',glyph:'»',color:'#ff9ed8',cost:60,maxRank:2,rank:()=>player?.overclockRelay||0,desc:'Gain up to 8% ATK Speed per rank as Ultimate Energy fills.',action:()=>{player.overclockRelay=Math.min(2,(player.overclockRelay||0)+1);build.push('Overclock Relay '+player.overclockRelay)}}
]}

function showLevelUp(){if(levelUpsPending<=0||state!=='playing')return;sfx('level');state='levelup';const options=[{title:'OVERCHARGED PHOTONS',glyph:'✦',color:'#ffe38a',desc:'ATK +2.2.',action:()=>player.damage+=2.2},{title:'PREDICTIVE TARGETING',glyph:'◎',color:'#72f6ff',desc:`Crit Chance +5% (rank ${perkRank('PREDICTIVE TARGETING')}/10 → ${Math.min(10,perkRank('PREDICTIVE TARGETING')+1)}/10).`,action:()=>{player.predictiveTargetingRank=Math.min(10,(player.predictiveTargetingRank||0)+1);player.critChance=Math.min(.6,(player.critChance||.12)+.05)}},{title:'REACTIVE PLATING',glyph:'⬡',color:'#83ffc5',desc:'+18 Max HP and restore 18 HP.',action:()=>{player.maxHp+=18;restoreHull(18)}},{title:'ACCELERATED CYCLE',glyph:'»',color:'#c29aff',desc:'ATK Speed +15%.',action:()=>player.fireRate*=1.15},{title:'KINETIC DRIVE',glyph:'➤',color:'#ff8fcb',desc:'Movement Speed +10%; ATK Speed +8%.',action:()=>{player.speed*=1.1;player.fireRate*=1.08}},{title:'ULTIMATE MASTERY',glyph:'✹',color:core?.color||'#c29aff',desc:`Rank ${ultLevel}/5 → ${Math.min(5,ultLevel+1)}/5 · Ultimate damage +18% per rank.`,action:()=>{ultLevel=getUltimateMasteryRank(ultLevel+1);build.push('Ultimate Mastery '+ultLevel)}},{title:'PIERCING PHOTONS',glyph:'↠',color:'#72f6ff',desc:'Shots pierce one additional enemy.',action:()=>player.pierce=Math.min(4,(player.pierce||0)+1)},{title:'VOID SIPHON',glyph:'♥',color:'#ff79b8',desc:'Defeating enemies restores 2 HP.',action:()=>player.lifeSiphon=(player.lifeSiphon||0)+2},{title:'SIDE CANNONS',glyph:'⊣',color:core?.id==='nova'?'#fff0a6':'#72f6ff',desc:core?.id==='nova'?`TWIN CANNON RANK ${(player.sideCannons||0)+1}/2 · Aether fires +1 extra beam per rank (2 → 3 → 4 beams).`:`RANK ${(player.sideCannons||0)+1}/2 · Adds two small, glowing companion stars per rank, matching your core color; rank 2 gives four stars.`,action:()=>player.sideCannons=Math.min(2,(player.sideCannons||0)+1)},{title:'MISSILE SALVO',glyph:'➤',color:'#d2a0ff',desc:'Launch a homing missile every 5s. Higher ranks shorten the interval to 3.8s and 2.8s.',action:()=>{player.autoMissiles=Math.min(3,(player.autoMissiles||0)+1);player.autoMissileTimer=Math.min(player.autoMissileTimer||4,1)}} ,{title:'RICOCHET CIRCUIT',glyph:'↗',color:'#72f6ff',desc:'Attacks bounce to nearby enemies for 65% damage. Each rank adds a bounce (max 3).',action:()=>player.ricochet=Math.min(3,(player.ricochet||0)+1)},{title:'CHAIN LIGHTNING',glyph:'ϟ',color:'#ffe875',desc:'Hits chain to nearby enemies for 55% damage. Each rank adds a target (max 3).',action:()=>player.chainLightning=Math.min(3,(player.chainLightning||0)+1)},{title:'CRITICAL PAYLOAD',glyph:'✹',color:'#ffe38a',desc:'Crit Damage multiplier +25%.',action:()=>player.critDamage=Math.min(3.5,player.critDamage+.25)},{title:'SALVAGE PROTOCOL',glyph:'⬡',color:'#ffe38a',desc:'Gain +1 Void Shard per enemy kill.',action:()=>player.shardBonus=(player.shardBonus||0)+1},{title:'CAPACITOR KILLCHAIN',glyph:'ϟ',color:'#c29aff',desc:'Gain +2 extra energy whenever you defeat an enemy.',action:()=>player.energyOnKill=(player.energyOnKill||0)+2},{title:'MAGNETAR FIELD',glyph:'◎',color:'#ff79b8',desc:'Collect XP shards from 45 pixels farther away.',action:()=>player.magnet=(player.magnet||55)+45},{title:'PULSE REACTOR',glyph:'✺',color:'#72f6ff',desc:'Every 2.25s, release a damaging pulse (90px radius, 38% attack damage). Higher ranks increase range and damage.',action:()=>{player.pulseAura=Math.min(170,(player.pulseAura||0)+24);player.pulseTimer=Math.min(player.pulseTimer||2.25,1)}},{title:'LIGHT FIELD',glyph:'☼',color:'#fff0a8',desc:'Create a light field that damages nearby enemies every 0.3s. Higher ranks increase its size and damage (max 3).',action:()=>{player.lightField=Math.min(3,(player.lightField||0)+1);player.lightFieldTimer=0;build.push('Light Field '+player.lightField)}},{title:'TEMPORAL COMPRESSION',glyph:'◷',color:'#9deaff',desc:`Ability cooldowns -10% per rank (rank ${player.cooldownReduction||0} → ${Math.min(3,(player.cooldownReduction||0)+1)}), affecting E skill, dash, and Missile Salvo.`,action:()=>{player.cooldownReduction=Math.min(3,(player.cooldownReduction||0)+1);build.push('Temporal Compression '+player.cooldownReduction)}},{title:'CORE SKILL MASTERY',glyph:core?.id==='ember'?'♨':core?.id==='frost'?'❄':'➤',color:core?.color||'#72f6ff',desc:`Upgrade ${core?.id==='ember'?'Ring of Fire':core?.id==='frost'?'Cryo Shield':core?.id==='remielle'?'Daybreak Waltz · Prism Flight':core?.id==='flash'?'Static Shock · Thunderfield':core?.id==='nature'?'Symbiotic Deployment · Verdant Overdrive · 2 charges':core?.id==='vengeance'?'Crimson Surge':core?.id==='nova'?'Event Horizon':'Core Skill'} (rank ${player.skillLevel||0} → ${Math.min(3,(player.skillLevel||0)+1)}): major boost to damage, duration or protection, plus shorter cooldown.`,action:()=>{player.skillLevel=Math.min(3,(player.skillLevel||0)+1);player.skillCooldown=Math.min(player.skillCooldown||0,1);build.push('Core Skill Mastery '+player.skillLevel)}},{title:'GLASS CANNON',glyph:'⚔',color:'#ff5a36',desc:'ATK +35%, but Max HP -12.',action:()=>{player.damage*=1.35;player.maxHp=Math.max(30,player.maxHp-12);player.hp=Math.min(player.hp,player.maxHp)}}];const coreSignaturePerks={ember:{title:'EMBER: CINDER MARK',glyph:'♨',color:'#ff9c65',desc:'Burning enemies take 18% more damage from your attacks.',action:()=>{player.cinderMark=true;build.push('Ember: Cinder Mark')}},frost:{title:'FROST: SHATTER PROTOCOL',glyph:'❄',color:'#8cecff',desc:'Deal 25% more damage to frozen enemies and 10% more damage to chilled enemies.',action:()=>{player.shatterProtocol=true;build.push('Frost: Shatter Protocol')}},nova:{title:'AETHER: ORBITAL RESONANCE',glyph:'◉',color:'#fff7cf',desc:'Enemies inside your black hole take 15% more damage. Singularity collapse damage +15%.',action:()=>{player.aetherOrbitalResonance=true;player.aetherRendPulseBonus=true;build.push('Aether: Orbital Resonance')}},'elemental':{title:'PRISM: SPECTRUM MASTERY',glyph:'◈',color:'#ff71cd',rarity:'rare',desc:'RARE · Fire, Frost, Lightning, and Nature damage +15%.',action:()=>{player.elementalSignature=true;player.elementalDamageMult=(player.elementalDamageMult||1)*1.15;player.elementalUltMult=(player.elementalUltMult||1)*1.10;build.push('Prism: Spectrum Mastery')}}};if(core?.id==='flash'||core?.id==='elemental'){for(let i=options.length-1;i>=0;i--)if(options[i].title==='CHAIN LIGHTNING')options.splice(i,1);}const signature=coreSignaturePerks[core?.id];if(signature&&!player[({ember:'cinderMark',frost:'shatterProtocol',nova:'aetherOrbitalResonance','elemental':'elementalSignature'})[core.id]])options.push(signature);
// Additional exclusive relics bring every core to ten distinct perks.
// These apply immediate, tangible run stats and are restricted to their matching core.
const coreExclusiveAdditions={
 ember:[
 ['EMBER: KINDLED ENGINE','♨','ATK +0.8.',false,()=>{player.damage+=.8}],
 ['EMBER: SCORCHING WAKE','♨','ATK Speed +10%.',false,()=>{player.fireRate*=1.10}],
 ['EMBER: ASHEN APPETITE','♥','Max HP +8 and restore 8 HP.',false,()=>{player.maxHp+=8;player.hp=Math.min(player.maxHp,player.hp+8)}],
 ['EMBER: SUNFIRE RESERVOIR','☼','Max HP +12 and restore 12 HP.',false,()=>{player.maxHp+=12;player.hp=Math.min(player.maxHp,player.hp+12)}],
 ['EMBER: CROWN OF CINDERS','♛','Burn damage +12%; burning enemies are more vulnerable to your fire kit.',true,()=>{player.burnMult=(player.burnMult||1)*1.12}],
 ['EMBER: IGNITION CASCADE','☄','Crit Chance +5 percentage points.',true,()=>{player.critChance=Math.min(.75,(player.critChance||0)+.05)}],
 ['EMBER: LAST SPARK','✹','RARE · Deal 15% more damage while below 35% HP.',true,()=>{player.emberLastSpark=true}]
 ],
 frost:[
 ['FROST: RIME PLATING','❄','DEF +4.',false,()=>{player.armor=Math.min(60,(player.armor||0)+4)}],
 ['FROST: WINTER PULSE','❄','ATK +0.8.',false,()=>{player.damage+=.8}],
 ['FROST: STILLWATER FOCUS','◇','Crit Damage +15%.',false,()=>{player.critDamage=(player.critDamage||1.5)*1.15}],
 ['FROST: BLUE HOUR','✧','Max HP +10 and restore 10 HP.',false,()=>{player.maxHp+=10;player.hp=Math.min(player.maxHp,player.hp+10)}],
 ['FROST: GLACIER HEART','⬡','Reduce incoming damage by 8%.',true,()=>{player.frostGlacierHeart=true}],
 ['FROST: SHARDSTORM','❄','Crit Chance +5 percentage points.',true,()=>{player.critChance=Math.min(.6,(player.critChance||0)+.05)}],
 ['FROST: ZERO-POINT FRACTURE','✦','RARE · Frozen enemies take 15% more damage.',true,()=>{player.frostFractureBonus=.15}]
 ],
 nova:[
 ['AETHER: GRAVITATIONAL LENS','✦','Singularity fields pull ordinary enemies 18% harder and tighten grouping around their center.',false,()=>{player.aetherPullStrengthBonus=(player.aetherPullStrengthBonus||0)+.18}],
 ['AETHER: EVENT HORIZON','◉','Event Horizon stasis lasts 0.6s longer before the singularity begins moving.',false,()=>{player.aetherStasisBonus=(player.aetherStasisBonus||0)+.6}],
 ['AETHER: SINGULARITY AMPLIFIER','✦','Collapse damage gains +12% per enemy caught, up to +60%.',false,()=>{player.aetherCollapsePerCaptureBonus=(player.aetherCollapsePerCaptureBonus||0)+.12}],
 ['AETHER: COLLAPSING STAR','✹','RARE · Black Sun deals 20% more collapse damage to bosses and singularity cores.',true,()=>{player.aetherBossCollapseBonus=(player.aetherBossCollapseBonus||0)+.20}],
 ['AETHER: GRAVITY WELL','◉','RARE · Event Horizon moving-singularity phase lasts +0.8s per rank, up to +2.4s.',true,()=>{player.aetherWellDurationBonus=Math.min(2.4,(player.aetherWellDurationBonus||0)+.8}],
 ['AETHER: LUMINAL OVERDRIVE','✦','RARE · Black Sun gravity field reaches 12% farther.',true,()=>{player.aetherBlackSunRadiusBonus=(player.aetherBlackSunRadiusBonus||0)+.12}],
 ['AETHER: BLACK SUN AFTERSHOCK','◉','Black Sun collapse releases a secondary shockwave dealing 35% of collapse damage.',true,()=>{player.aetherAftershockRank=1}],
 ['AETHER: GRAVITATIONAL RESONANCE','◎','Enemies hit by Aether field pulses are slowed by 20% for 1.2s.',false,()=>{player.aetherSlowFieldRank=1}]
 ],
 flash:[
 ['FLASH: VOLTAGE SPIKE','ϟ','ATK +0.8.',false,()=>{player.damage+=.8}],
 ['FLASH: ARC FLASH','ϟ','ATK Speed +10%.',false,()=>{player.fireRate*=1.10}],
 ['FLASH: STORM CHASER','➤','Move Speed +8%.',true,()=>{player.speed*=1.08}],
 ['FLASH: OVERLOAD WINDOW','ϟ','Lightning chains deal 15% more damage.',true,()=>{player.flashChainPower=(player.flashChainPower||1)*1.15}]
 ],
 nature:[
 ['NATURE: DEEP ROOTS','❧','Max HP +12 and restore 12 HP.',false,()=>{player.maxHp+=12;player.hp=Math.min(player.maxHp,player.hp+12)}],
 ['NATURE: POLLEN ARMOR','❧','DEF +3.',false,()=>{player.armor=Math.min(60,(player.armor||0)+3)}],
 ['NATURE: HUNTER BLOOM','✿','DPS drone attacks deal 16% more damage.',true,()=>{player.natureDpsDamageUpgrade=(player.natureDpsDamageUpgrade||0)+1}],
 ['NATURE: LIVING CANOPY','❧','DEF +4.',true,()=>{player.armor=Math.min(60,(player.armor||0)+4)}]
 ],
 elemental:[
 ['PRISM: SPECTRAL FOCUS','◈','ATK +0.8.',false,()=>{player.damage+=.8}],
 ['PRISM: FOURFOLD RESONANCE','◈','Crit Chance +4 percentage points.',false,()=>{player.critChance=Math.min(.75,(player.critChance||0)+.04)}],
 ['PRISM: CHROMATIC SHELL','⬢','Max HP +10 and restore 10 HP.',true,()=>{player.maxHp+=10;player.hp=Math.min(player.maxHp,player.hp+10)}],
 ['PRISM: ELEMENTAL AFTERSHOCK','✦','Elemental damage +15%.',true,()=>{player.elementalDamageMult=(player.elementalDamageMult||1)*1.15}]
 ],
 vengeance:[
 ['CRIMSON: IRON OATH','⟡','DEF +4.',false,()=>{player.armor=Math.min(70,(player.armor||0)+4)}],
 ['CRIMSON: REDLINE INSTINCT','♥','ATK +1.',true,()=>{player.damage+=1}],
 ['CRIMSON: BLOOD MOON','☠','Crit Chance +5 percentage points.',true,()=>{player.critChance=Math.min(.6,(player.critChance||0)+.05)}]
 ]
};

function makeCoreExclusivePerk(coreId,entry){const [title,glyph,desc,rare,effect]=entry;return {title,glyph,color:({ember:'#ff4b2e',frost:'#8cecff',nova:'#fff7cf',flash:'#ffe875',nature:'#70e58a',elemental:'#ff71cd',vengeance:'#ff304f'})[coreId],rarity:rare?'rare':undefined,desc:(rare?'RARE · ':'')+desc,action:()=>{effect();build.push(title);updateUI();}};}

const exclusiveCorePerks={flash:{title:'FLASH: STORM CIRCUIT',glyph:'ϟ',color:'#ffe875',rarity:'rare',desc:`RARE · +1 chain jump and +15% chain damage per rank (max 2).`,action:()=>{player.flashChainBonus=Math.min(2,(player.flashChainBonus||0)+1);player.flashChainPower=(player.flashChainPower||1)*1.15;build.push('Flash: Storm Circuit')}},
flashStatic:{title:'FLASH: STATIC OVERLOAD',glyph:'ϟ',color:'#ffe875',desc:'Stunned enemies take 10% more damage from all sources.',action:()=>{player.flashStunDamageBonus=(player.flashStunDamageBonus||0)+.10;build.push('Flash: Static Overload')}},
flashCascade:{title:'FLASH: CAPACITOR CASCADE',glyph:'ϟ',color:'#ffe875',desc:'A critical primary hit makes its chain deal 15% more damage and jump one extra time per rank.',action:()=>{player.flashCritChainBonus=Math.min(.30,(player.flashCritChainBonus||0)+.15);player.flashCritChainTargets=Math.min(2,(player.flashCritChainTargets||0)+1);build.push('Flash: Capacitor Cascade')}},
flashThunder:{title:'FLASH: THUNDER GOD',glyph:'ϟ',color:'#ffe875',rarity:'rare',desc:'RARE · Thunderfield strikes 30% faster and deals 20% more damage.',action:()=>{player.flashQPower=(player.flashQPower||1)*1.20;player.flashQSpeed=(player.flashQSpeed||1)*1.30;build.push('Flash: Thunder God')}},
flashNervous:{title:'FLASH: NERVOUS SYSTEM',glyph:'ϟ',color:'#ffe875',desc:'Static Shock stuns last 25% longer and stunned enemies take 10% more damage.',action:()=>{player.flashStunDurationBonus=(player.flashStunDurationBonus||0)+.25;player.flashStunDamageBonus=(player.flashStunDamageBonus||0)+.10;build.push('Flash: Nervous System')}},
flashWire:{title:'FLASH: LIVE WIRE',glyph:'ϟ',color:'#ffe875',desc:'Crit Chance +6 percentage points; ATK Speed +10%.',action:()=>{player.critChance=Math.min(.75,(player.critChance||0)+.06);player.fireRate*=1.10;build.push('Flash: Live Wire')}},ember:{title:'EMBER: PYRE CASCADE',glyph:'♨',color:'#ff9c65',rarity:'rare',desc:`RARE · Burn potency +15% per rank (rank ${player.pyreCascade||0} → ${Math.min(3,(player.pyreCascade||0)+1)}).`,action:()=>{player.pyreCascade=Math.min(3,(player.pyreCascade||0)+1);player.burnMult=(player.burnMult||1)*1.15;build.push('Ember: Pyre Cascade '+player.pyreCascade)}},frost:{title:'FROST: CRYSTAL RESONANCE',glyph:'❄',color:'#8cecff',rarity:'rare',desc:`RARE · +2 DEF and +3 % critical chance per rank (rank ${player.crystalResonance||0} → ${Math.min(3,(player.crystalResonance||0)+1)}).`,action:()=>{player.crystalResonance=Math.min(3,(player.crystalResonance||0)+1);player.armor=Math.min(60,(player.armor||0)+2);player.critChance=Math.min(.6,(player.critChance||0)+.03);build.push('Frost: Crystal Resonance '+player.crystalResonance)}},nova:{title:'AETHER: GRAVITATIONAL LENS',glyph:'◉',color:'#fff7cf',rarity:'rare',desc:`RARE · Singularity radius +12% and collapse damage +12% per rank (rank ${player.aetherGravitationalLensRank||0} → ${Math.min(3,(player.aetherGravitationalLensRank||0)+1)}/3).`,action:()=>{player.aetherGravitationalLensRank=Math.min(3,(player.aetherGravitationalLensRank||0)+1);player.aetherWellRadiusBonus=(player.aetherWellRadiusBonus||0)+.12;player.aetherCollapseMult=(player.aetherCollapseMult||1)*1.12;build.push('Aether: Gravitational Lens '+player.aetherGravitationalLensRank)}},
elementalCube:{title:'PRISM: CUBIC OVERLOAD',glyph:'⬢',color:'#ff71cd',desc:`Cube damage +10% and cube size +6% per rank (rank ${player.elementalCubeOverload||0} → ${Math.min(3,(player.elementalCubeOverload||0)+1)}).`,action:()=>{player.elementalCubeOverload=Math.min(3,(player.elementalCubeOverload||0)+1);player.elementalDamageMult=(player.elementalDamageMult||1)*1.10;player.elementalCubeSizeBonus=Math.min(.18,(player.elementalCubeSizeBonus||0)+.06);build.push('Prism: Cubic Overload '+player.elementalCubeOverload)}},
elementalChain:{title:'PRISM: CHAIN REACTION',glyph:'ϟ',color:'#ffe66d',desc:`Lightning chains hit +1 additional enemy and deal +15% chain damage per rank (rank ${player.elementalChainReaction||0} → ${Math.min(2,(player.elementalChainReaction||0)+1)}).`,action:()=>{player.elementalChainReaction=Math.min(2,(player.elementalChainReaction||0)+1);player.elementalChainBonus=player.elementalChainReaction;player.elementalChainPower=(player.elementalChainPower||1)*1.15;build.push('Prism: Chain Reaction '+player.elementalChainReaction)}},
elementalFrost:{title:'PRISM: FROST LATTICE',glyph:'❄',color:'#52dcff',desc:`Frost hits add +1 chill stack and need one fewer stack to freeze per rank (rank ${player.elementalFrostLattice||0} → ${Math.min(2,(player.elementalFrostLattice||0)+1)}).`,action:()=>{player.elementalFrostLattice=Math.min(2,(player.elementalFrostLattice||0)+1);player.elementalFrostBonus=player.elementalFrostLattice;build.push('Prism: Frost Lattice '+player.elementalFrostLattice)}},
elementalVerdant:{title:'PRISM: VERDANT SWARM',glyph:'❧',color:'#70e58a',rarity:'rare',desc:`RARE · During Elemental Convergence, every Nature cube launches a salvo of 3 homing seed missiles; Verdant Swarm adds +1 missile and +5% missile damage per rank (rank ${player.elementalVerdantSwarm||0} → ${Math.min(2,(player.elementalVerdantSwarm||0)+1)}). Missiles retain 40% crit chance.`,action:()=>{player.elementalVerdantSwarm=Math.min(2,(player.elementalVerdantSwarm||0)+1);player.elementalMissileBonus=player.elementalVerdantSwarm;player.elementalMissilePower=(player.elementalMissilePower||1)*1.05;build.push('Prism: Verdant Swarm '+player.elementalVerdantSwarm)}}, elementalBurn:{title:'PRISM: BURNING CONSTELLATION',glyph:'♨',color:'#ff4358',rarity:'rare',desc:`RARE · Fire burn damage +20% per rank (rank ${player.elementalBurningConstellation||0} → ${Math.min(2,(player.elementalBurningConstellation||0)+1)}).`,action:()=>{player.elementalBurningConstellation=Math.min(2,(player.elementalBurningConstellation||0)+1);player.elementalBurnPower=(player.elementalBurnPower||1)*1.20;build.push('Prism: Burning Constellation '+player.elementalBurningConstellation)}}};const vengeanceExclusivePerks=[{title:'CRIMSON: CRIMSON MOMENTUM',glyph:'➤',color:'#ff526b',desc:'ATK +12%.',action:()=>{player.vengeanceCrimsonMomentum=true;build.push('Crimson: Crimson Momentum');}},{title:'CRIMSON: BLOOD FRENZY',glyph:'♥',color:'#ff304f',desc:'Deal +18% damage while below 50% HP.',action:()=>{player.vengeanceBloodFrenzy=true;build.push('Crimson: Blood Frenzy');}},{title:'CRIMSON: RUTHLESS PURSUIT',glyph:'☠',color:'#ff7189',desc:'Deal +20% damage to enemies below 30% health.',action:()=>{player.vengeanceRuthlessPursuit=true;build.push('Crimson: Ruthless Pursuit');}},{title:'CRIMSON: SANGUINE RESERVOIR',glyph:'⬡',color:'#ff8fa3',desc:'Blood Shield gained from damage and Sanguine Rampage is increased by 20%.',action:()=>{player.vengeanceSanguineReservoir=true;build.push('Crimson: Sanguine Reservoir');}},
{title:'CRIMSON: BLOOD CONVERSION',glyph:'♥',color:'#ff304f',rarity:'rare',desc:'RARE · All healing you receive becomes Blood Shield instead of restoring HP. Shield can exceed missing HP and absorbs incoming damage.',action:()=>{player.vengeanceBloodConversion=true;const current=player.hp;player.hp=player.maxHp;const missing=Math.max(0,player.maxHp-current);player.hp=current;if(missing>0)grantVengeanceShield(missing,'vengeanceHealingShield');build.push('Crimson: Blood Conversion');updateUI();}},
{title:'CRIMSON: RED HARVEST',glyph:'⟡',color:'#ff304f',rarity:'rare',desc:'RARE · Crimson crescent blades deal +18% damage and restore 2% of damage dealt as Blood Shield.',action:()=>{player.vengeanceRedHarvest=Math.min(3,(player.vengeanceRedHarvest||0)+1);player.vengeanceBladeDamage=(player.vengeanceBladeDamage||1)*1.18;build.push('Crimson: Red Harvest '+player.vengeanceRedHarvest);}},
{title:'CRIMSON: LAST RITES',glyph:'☠',color:'#ff7189',desc:'Gain 5 percentage points of damage reduction from missing HP; Sanguine Rampage starts with 20% more Shield.',action:()=>{player.vengeanceLastRites=Math.min(3,(player.vengeanceLastRites||0)+1);build.push('Crimson: Last Rites '+player.vengeanceLastRites);}}
];
if(core?.id==='vengeance'){for(const perk of vengeanceExclusivePerks){const already=perk.title==='CRIMSON: BLOOD CONVERSION'?player.vengeanceBloodConversion:perk.title==='CRIMSON: RED HARVEST'?(player.vengeanceRedHarvest||0)>=3:perk.title==='CRIMSON: LAST RITES'?(player.vengeanceLastRites||0)>=3:perk.title==='CRIMSON: CRIMSON MOMENTUM'?player.vengeanceCrimsonMomentum:perk.title==='CRIMSON: BLOOD FRENZY'?player.vengeanceBloodFrenzy:perk.title==='CRIMSON: RUTHLESS PURSUIT'?player.vengeanceRuthlessPursuit:perk.title==='CRIMSON: SANGUINE RESERVOIR'?player.vengeanceSanguineReservoir:false;if(!already)options.push(perk);}}
for(const entry of (coreExclusiveAdditions[core?.id]||[])){const perk=makeCoreExclusivePerk(core.id,entry);if(perkAvailable(perk))options.push(perk);}
const exclusiveCore=exclusiveCorePerks[core?.id];if(exclusiveCore&&perkAvailable(exclusiveCore))options.push(exclusiveCore);if(core?.id==='flash'){for(const key of ['flashStatic','flashCascade','flashThunder','flashNervous','flashWire']){const perk=exclusiveCorePerks[key];if(perk&&perkAvailable(perk))options.push(perk);}}if(core?.id==='elemental'){for(const key of ['elementalCube','elementalChain','elementalFrost','elementalVerdant','elementalBurn']){const perk=exclusiveCorePerks[key];if(perk&&perkAvailable(perk))options.push(perk);}}const rareSkillPerks={ember:{title:'EMBER: INFERNAL CONFLUX',glyph:'♨',color:'#ff9c65',desc:`RARE · Ring of Fire deals +22% damage and burn DPS +4 per rank; radius +8 (rank ${player.emberSkillRelic||0} → ${Math.min(3,(player.emberSkillRelic||0)+1)}).`,action:()=>{player.emberSkillRelic=Math.min(3,(player.emberSkillRelic||0)+1);build.push('Ember: Infernal Conflux '+player.emberSkillRelic)}},frost:{title:'FROST: ABSOLUTE AEGIS',glyph:'❄',color:'#8cecff',desc:`RARE · Cryo Shield gains +14% Max HP capacity and +0.7s duration per rank (rank ${player.frostSkillRelic||0} → ${Math.min(3,(player.frostSkillRelic||0)+1)}).`,action:()=>{player.frostSkillRelic=Math.min(3,(player.frostSkillRelic||0)+1);build.push('Frost: Absolute Aegis '+player.frostSkillRelic)}},nova:{title:'AETHER: BLACK SUN CATALYST',glyph:'◉',color:'#fff7cf',rarity:'rare',desc:`RARE · Black Sun lasts +0.4s per rank and gains +8% periodic damage per rank (rank ${player.novaSkillRelic||0} → ${Math.min(3,(player.novaSkillRelic||0)+1)}).`,action:()=>{player.novaSkillRelic=Math.min(3,(player.novaSkillRelic||0)+1);player.aetherBlackSunDurationBonus=(player.aetherBlackSunDurationBonus||0)+.4;player.aetherBlackSunDamageBonus=Math.min(.24,(player.aetherBlackSunDamageBonus||0)+.08);build.push('Aether: Black Sun Catalyst '+player.novaSkillRelic)}},remielle:{title:'AURALIS: DAYBREAK CHORUS',glyph:'✧',color:'#ff9ed8',desc:`RARE · Prism Flight strikes deal +22% damage and Daybreak Waltz lasts +0.7s per rank (rank ${player.remielleSkillRelic||0} → ${Math.min(3,(player.remielleSkillRelic||0)+1)}).`,action:()=>{player.remielleSkillRelic=Math.min(3,(player.remielleSkillRelic||0)+1);build.push('Auralis: Daybreak Chorus '+player.remielleSkillRelic)}}};const rareCoreSkill=rareSkillPerks[core?.id];if(rareCoreSkill&&perkAvailable(rareCoreSkill))options.push({...rareCoreSkill,rarity:'rare'});if(core?.id==='nature'){options.push({title:'NATURE: WORLDTREE PROTOCOL',glyph:'❧',color:'#70e58a',rarity:'rare',desc:`RARE · Verdant Overdrive lasts 3s longer and boosts drone healing and damage by 20%.`,action:()=>{player.natureWorldtreeProtocol=Math.min(3,(player.natureWorldtreeProtocol||0)+1);player.natureOverdriveBonus=(player.natureOverdriveBonus||0)+3;build.push('Nature: Worldtree Protocol '+player.natureWorldtreeProtocol)}},{title:'NATURE: EVERGREEN COVENANT',glyph:'✧',color:'#70e58a',rarity:'rare',desc:'RARE · Each living drone grants +10% damage and 6% damage reduction.',action:()=>{player.natureEvergreenCovenant=true;build.push('Nature: Evergreen Covenant')}});}if(core?.id==='remielle'){options.push({title:'PRISM FLIGHT: SWIFT CURRENT',glyph:'✧',rarity:'rare',color:'#ff9ed8',desc:`Prism Flight strikes 12% faster per rank (rank ${player.phaseFlowCadence||0} → ${(player.phaseFlowCadence||0)+1}).`,action:()=>{player.phaseFlowCadence=Math.min(3,(player.phaseFlowCadence||0)+1);build.push('Prism Flight: Swift Current '+player.phaseFlowCadence)}},{title:'PRISM FLIGHT: LASTING RADIANCE',glyph:'✧',rarity:'rare',color:'#ffe3f4',desc:`Daybreak Waltz lasts 0.8 seconds longer per rank (rank ${player.phaseFlowDuration||0} → ${(player.phaseFlowDuration||0)+1}).`,action:()=>{player.phaseFlowDuration=Math.min(3,(player.phaseFlowDuration||0)+1);build.push('Prism Flight: Lasting Radiance '+player.phaseFlowDuration)}},{title:'PRISM FLIGHT: PRISM ECHO',glyph:'✧',rarity:'rare',color:'#ffd8f0',desc:`Prism Flight strikes and automatic third-attack procs deal 18% more damage per rank (rank ${player.phaseFlowPower||0} → ${(player.phaseFlowPower||0)+1}).`,action:()=>{player.phaseFlowPower=Math.min(3,(player.phaseFlowPower||0)+1);build.push('Prism Flight: Prism Echo '+player.phaseFlowPower)}},{title:'PRISM FLIGHT: MULTIPLICITY',glyph:'✧',color:'#ffb7e7',rarity:'rare',desc:`RARE · Each Prism Flight pulse launches one additional strike per rank (rank ${player.phaseFlowExtraStrikes||0} → ${Math.min(3,(player.phaseFlowExtraStrikes||0)+1)}), up to 4 strikes per pulse.`,action:()=>{player.phaseFlowExtraStrikes=Math.min(3,(player.phaseFlowExtraStrikes||0)+1);build.push('Prism Flight: Multiplicity '+player.phaseFlowExtraStrikes)}})}options.push(...createGeneralPerks().map(({id,cost,rank,maxRank,...perk})=>perk));if(player.sideCannons>=2){for(let i=options.length-1;i>=0;i--)if(options[i].title==='SIDE CANNONS')options.splice(i,1)}let picks=randomPerks(options,3);if(!picks.length){levelUpsPending--;notify('ALL PERKS MAXED · LEVEL BONUS RETAINED');if(levelUpsPending>0){state='playing';if(coreEvolutionQueue.length)showCoreEvolution();else showLevelUp()}else if(coreEvolutionQueue.length){state='playing';showCoreEvolution()}else{hideModal();last=performance.now();if(pendingWorldComplete){pendingWorldComplete=false;completeWorld()}else if(pendingPortalReveal||pendingTutorialAdvance){continueAfterRoomClear()}else state='playing'}return}showModal('EXPERIENCE THRESHOLD · LEVEL '+level,'CHOOSE AN UPGRADE','Choose an upgrade to strengthen your core.',picks.map(o=>({title:o.title,glyph:o.glyph,color:o.color,desc:o.desc,rarity:o.rarity,action:()=>{o.action();build.push(o.title);levelUpsPending--;updateUI();if(levelUpsPending>0){state='playing';if(coreEvolutionQueue.length)showCoreEvolution();else showLevelUp()}else if(coreEvolutionQueue.length){state='playing';showCoreEvolution()}else{hideModal();last=performance.now();if(pendingWorldComplete){pendingWorldComplete=false;completeWorld()}else if(pendingPortalReveal){pendingPortalReveal=false;showPortals()}else state='playing'}}})));}

function cooldownFactor(){return 1-.10*Math.min(3,player?.cooldownReduction||0)}

function dashChargeCapacity(){return 1+Math.min(1,player?.extraDashChargeRank||0)}

function dashCooldownDuration(){return Math.max(1.4,3.5-Math.min(3,player?.dashPower||0)*.55)*cooldownFactor()}

function performDash(){if(state!=='playing'||!player||(player.dashCharges||0)<=0)return;sfx('dash');const ox=player.x,oy=player.y;let dx=mouse.x-player.x,dy=mouse.y-player.y,len=Math.hypot(dx,dy);if(len<1){dx=mouse.dx||1;dy=mouse.dy||0;len=Math.hypot(dx,dy)||1}dx/=len;dy/=len;dashTrails.push({x:ox,y:oy,dx,dy,life:.26,max:.26,active:true,color:core?.id==='elemental'?rainbowCoreColor(rand(0,180)):(core?.color||'#72f6ff'),phase:rand(0,Math.PI*2)});if(dashTrails.length>8)dashTrails.shift();dash=.17;if(dashCooldown<=0)dashCooldown=dashCooldownDuration();player.dashCharges=Math.max(0,(player.dashCharges||0)-1);if((player.phaseMomentumRank||0)>0)player.dashMomentumTimer=2.5;player.inv=Math.max(player.inv,.25);player.x=Math.max(12,Math.min(W-12,player.x+dx*86));player.y=Math.max(12,Math.min(H-12,player.y+dy*86));mouse.dx=dx;mouse.dy=dy;}

function newPlayer(){return{x:W/2,y:H/2,r:8,hp:100,maxHp:100,speed:190,damage:10,fireRate:1,shotSpeed:400,shots:1,inv:0,element:null,core:null,dashPower:0,magnet:55,ultHaste:0,critChance:.12,critDamage:1.8,armor:0,evoTier:0,pierce:0,orbitals:0,orbitalStates:[],lifeSiphon:0,shardBonus:0,energyOnKill:0,pulseAura:0,pulseTimer:0,extraDashChargeRank:0,dashCharges:1,afterglowCapacitor:0,salvageDividend:0,lastStand:0,phaseMomentumRank:0,dashMomentumTimer:0,repairMatrix:0,criticalBattery:0,singularityHunter:0,aegisCircuit:0,overclockRelay:0,lightField:0,lightFieldTimer:0,cooldownReduction:0,skillLevel:0,emberSkillRelic:0,frostSkillRelic:0,novaSkillRelic:0,remielleSkillRelic:0,skillCooldown:0,skillActive:0,skillRingTick:0,skillShield:0,skillShieldHp:0,skillShieldMax:0,frostFieldTick:0,frostStormTimer:0,frostStormTick:0,sideCannons:0,autoMissiles:0,autoMissileTimer:4,voidflares:0,maxVoidflares:3,luminizeMult:1,prismatic:false,phaseFlowBonus:0,phaseFlowTick:0,phaseFlowAttackCount:0,phaseFlowCadence:0,phaseFlowDuration:0,phaseFlowPower:0,phaseFlowExtraStrikes:0,elementalEmpowerTimer:0,elementalDamageMult:1,elementalUltMult:1,elementalCooldownBonus:0,elementalSignature:false,elementalCubeSizeBonus:0,elementalCubeOverload:0,elementalChainBonus:0,elementalChainPower:1,elementalChainReaction:0,elementalFrostBonus:0,elementalFrostLattice:0,elementalMissileBonus:0,elementalMissilePower:1,elementalVerdantSwarm:0,elementalBurnPower:1,elementalBurningConstellation:0,bloodlettingTimer:0,bloodlettingMaxHpPenalty:0,vengeanceUltTimer:0,vengeanceShieldCap:0,vengeanceShieldHp:0,vengeanceShieldDuration:0,natureDrones:[],natureDroneCharges:2,natureDroneCap:2,natureDroneChargeTimer:0,natureOverdrive:0,natureAttackTimer:0,flashLinkTimer:0,flashFieldTimer:0,flashFieldTick:0,flashLinkTargets:[]}}

function applyCoreDefaults(o){
 // Assign core stats from canonical base values; never multiply whatever a prior run left behind.
 core=o;element=nativeElementForCore(o.id);
 player.core=o;player.element=element;
 player.damage=10*(o.dmg??1);
 player.speed=190*(o.speed??1);
 player.fireRate=1*(o.fireRate??1);
 player.shots=Number.isFinite(o.shots)?o.shots:1;player.baseShots=player.shots;player.projectileDamagePenalty=.12;
 player.r=o.r??8;
 player.maxHp=o.maxHp??100;player.hp=player.maxHp;
 player.armor=(o.armor??0)+(o.id==='vengeance'?30:0);player.critChance=o.critChance??.12;player.pierce=o.pierce??0;
 player.critDamage=1.8;player.shotSpeed=400;player.dashPower=0;player.magnet=55;player.ultHaste=0;
 // Shared permanent upgrades are applied to each core's canonical starting stats on every new run.
 const perm=saveData.coreUpgrades||{};const upgradeRank=id=>Math.max(0,Number(perm[id])||0);player.damage+=.5*upgradeRank('atk');player.critChance=Math.min(.75,player.critChance+.02*upgradeRank('crit'));player.fireRate*=1+.04*upgradeRank('rate');player.maxHp+=5*upgradeRank('hull');player.hp=player.maxHp;player.armor+=2*upgradeRank('armor');player.speed*=1+.03*upgradeRank('speed');const weaponBonus=getVoidWeaponBonuses(saveData,o.id);player.voidWeaponPassive=weaponBonus.signaturePassive?.effectId||null;player.voidWeaponRefinementLevel=weaponBonus.refinementLevel||0;player.voidWeaponRank=weaponBonus.signaturePassive?.rank||0;player.voidWeaponStatBonusesApplied=true;player.voidWeaponPassiveTimer=0;player.voidWeaponAutoCount=0;player.voidWeaponChargedAttack=false;player.voidWeaponNatureTimer=5;player.voidWeaponDamageBonus=weaponBonus.stats.damage||0;player.damage+=(weaponBonus.stats.atkFlat||((weaponBonus.stats.atkPct||0)*10))+(weaponBonus.stats.damage||0);player.critChance=Math.min(.95,player.critChance+(weaponBonus.stats.critChance||0));player.critDamage+=weaponBonus.stats.critDamage||0;player.fireRate*=1+(weaponBonus.stats.fireRate||0);player.maxHp=Math.round(player.maxHp*(1+(weaponBonus.stats.hpPct||0)));player.hp=player.maxHp;player.armor=Math.round(player.armor*(1+(weaponBonus.stats.armorPct||0)));player.voidWeaponNatureTimer=5;player.voidWeaponBloodTimer=0;player.inv=1.2;player.evoTier=0;player.evolutions=[];player.pierce=o.pierce??0;player.orbitals=0;player.orbitalStates=[];
 player.cooldownReduction=0;player.predictiveTargetingRank=0;player.lifeSiphon=0;player.shardBonus=0;player.energyOnKill=0;player.pulseAura=0;player.pulseTimer=0;player.extraDashChargeRank=0;player.dashCharges=1;player.afterglowCapacitor=0;player.salvageDividend=0;player.lastStand=0;player.phaseMomentumRank=0;player.dashMomentumTimer=0;player.repairMatrix=0;player.criticalBattery=0;player.singularityHunter=0;player.aegisCircuit=0;player.overclockRelay=0;player.lightField=0;player.lightFieldTimer=0;player.skillLevel=0;player.skillCooldown=0;player.skillActive=0;player.skillRingTick=0;player.skillShield=0;player.skillShieldHp=0;player.skillShieldMax=0;player.frostFieldTick=0;player.frostStormTimer=0;player.frostStormTick=0;skillMissiles=[];natureDrones=[];skillFx=[];player.natureDrones=natureDrones;player.natureDroneCharges=2;player.natureDroneCap=2;player.natureDroneChargeTimer=0;player.natureOverdrive=0;player.natureOverdriveBonus=0;player.natureWorldtreeProtocol=0;player.natureEvergreenCovenant=false;player.natureDpsDamageUpgrade=0;player.aetherGravitationalLensRank=0;player.aetherBlackSunDurationBonus=0;player.aetherBlackSunDamageBonus=0;player.natureAttackTimer=0;player.natureAttackCount=0;player.flashChainBonus=0;player.flashChainPower=1;player.flashCritChainBonus=0;player.flashCritChainTargets=0;player.flashStunDurationBonus=0;player.flashStunDamageBonus=0;player.flashQPower=1;player.flashQSpeed=1;player.novaOverclock=false;player.novaOverclockCount=0;player.cinderMark=false;player.shatterProtocol=false;player.frostFractureBonus=0;player.frostGlacierHeart=false;player.emberLastSpark=false;player.prismEcho=false;player.prismEchoCount=0;player.burnMult=1;player.burnSplash=false;player.phoenixHeal=0;player.infernoCrown=false;player.frostSlowDuration=1.6;player.shatterglass=false;player.absoluteZero=false;player.laserDamageMult=1;player.laserWidthBonus=0;player.laserVulnerability=false;player.ricochet=0;player.voidflares=0;player.maxVoidflares=3;player.luminizeMult=1;player.prismatic=false;player.phaseFlowBonus=0;player.phaseFlowTick=0;player.phaseFlowAttackCount=0;player.phaseFlowCadence=0;player.phaseFlowDuration=0;player.phaseFlowPower=0;player.phaseFlowExtraStrikes=0;player.phaseFlowCritBonus=0;player.phaseFlowBaseCrit=null;player.phaseFlowBaseRate=null;player.phaseFlowBaseSpeed=null;player.elementalEmpowerTimer=0;player.elementalDamageMult=1;player.elementalUltMult=1;player.elementalCooldownBonus=0;player.elementalSignature=false;player.elementalCubeSizeBonus=0;player.elementalCubeOverload=0;player.elementalChainBonus=0;player.elementalChainPower=1;player.elementalChainReaction=0;player.elementalFrostBonus=0;player.elementalFrostLattice=0;player.elementalMissileBonus=0;player.elementalMissilePower=1;player.elementalVerdantSwarm=0;player.elementalBurnPower=1;player.elementalBurningConstellation=0;player.bloodlettingTimer=0;player.bloodlettingMaxHpPenalty=0;player.vengeanceUltTimer=0;player.vengeanceShieldCap=0;player.vengeanceShieldHp=0;
 energy=0;ultLevel=0;build=[];shootCd=0;
}
const coreUpgradeDefs=[{id:'atk',name:'ATTACK MATRIX',glyph:'⚔',desc:'+0.5 ATK per rank.',base:40,max:20},{id:'crit',name:'CRITICAL LENS',glyph:'✹',desc:'+2 % critical chance per rank.',base:55,max:15},{id:'rate',name:'ATK SPEED CONTROL',glyph:'ϟ',desc:'+4% ATK Speed per rank.',base:50,max:20},{id:'hull',name:'MAX HP REINFORCEMENT',glyph:'⬡',desc:'+5 Max HP per rank.',base:35,max:20},{id:'armor',name:'DEF LATTICE',glyph:'▦',desc:'+2 DEF per rank.',base:45,max:15},{id:'speed',name:'PHASE DRIVE',glyph:'➤',desc:'+3% movement speed per rank.',base:45,max:15}];

function coreUpgradeRank(coreId,id){const upgrades=saveData.coreUpgrades||{};if(Number.isFinite(Number(upgrades[id])))return Number(upgrades[id]);let best=0;for(const value of Object.values(upgrades)){if(value&&typeof value==='object')best=Math.max(best,Number(value[id])||0)}return best}

function coreUpgradeCost(def,rank){return Math.floor(def.base*Math.pow(1.34,rank))}

function showVoidWeaponTenPull(rewards,onDone){
 const valid=(rewards||[]).filter(reward=>reward&&reward.claimKey);
 if(!valid.length){onDone?.();return;}
 const single=valid.length===1;
 const rarityRank=reward=>reward.type==='companion'?5:reward.type!=='weapon'?0:reward.rarity==='legendary'?5:reward.rarity==='unique'?4:3;
 const topRank=Math.max(...valid.map(rarityRank));
 const tier=topRank>=5?'gold':topRank>=4?'purple':'blue';
 const accent=tier==='gold'?'#ffd66b':tier==='purple'?'#c69aff':'#72dfff';
 let phase='box',revealed=false,boxOpening=false;
 state='voidWeaponDelivery';
 const overlay=$('overlay'),modal=$('modal');
 overlay.classList.remove('hidden','closing','story-overlay','dialogue-field-overlay');
 modal.className='modal void-delivery-modal void-ten-pull-modal';
 const render=()=>{
  if(phase==='box'){
   modal.innerHTML='<div class="eyebrow">VOID SHOP · MYSTERY DELIVERY</div><h2>'+(boxOpening?'OPENING MYSTERY BOX':'MYSTERY BOX')+'</h2><p>'+(boxOpening?'The seal is breaking…':single?'One reward inside. Open to reveal it.':'Ten rewards inside. Open to reveal them.')+'</p><div class="void-delivery-stage '+(boxOpening?'is-opening':'is-sealed')+'" style="--delivery-accent:'+accent+'"><div class="void-delivery-orbit orbit-one"></div><div class="void-delivery-orbit orbit-two"></div><div class="void-delivery-scan" aria-hidden="true"></div><div class="void-delivery-rune-ring" aria-hidden="true">◇ · ✦ · ◇ · ✧ · ◇ · ✦ · ◇ · ✧</div><div class="void-delivery-box"><span class="delivery-box-glow"></span><span class="delivery-box-lid"></span><span class="delivery-box-mark">'+(boxOpening?'✦':'?')+'</span><span class="delivery-box-base"></span></div>'+(boxOpening?'<div class="void-delivery-sparks" aria-hidden="true">✦ · ✧ · ✦</div>':'')+'</div><p class="void-delivery-hint">'+(boxOpening?'OPENING…':single?'ONE REWARD SEALED INSIDE':'THE BOX CONTAINS 10 REWARDS')+'</p><div class="void-delivery-actions"><button class="btn void-delivery-primary" id="voidTenPullAction" '+(boxOpening?'disabled':'')+'>'+(boxOpening?'OPENING…':'OPEN MYSTERY BOX')+'</button></div>';
   const beginOpening=()=>{if(boxOpening)return;sfx('ui');boxOpening=true;render();setTimeout(()=>{phase='sequence';render();},820);};
   modal.querySelector('#voidTenPullAction')?.addEventListener('click',beginOpening);
   modal.querySelector('.void-delivery-stage')?.addEventListener('click',beginOpening);
   return;
  }
  const cards=valid.map((reward,index)=>{
   const weapon=reward.type==='weapon'?getVoidWeapon(reward.weaponId):null;
   const companion=reward.type==='companion'?getCompanion(reward.companionId):null;
   const rank=rarityRank(reward);
   const cardTier=rank>=5?'gold':rank>=4?'purple':'blue';
   const color=companion?.color||(rank>=5?'#ffd66b':rank>=4?'#c69aff':'#72dfff');
   const glyph=weapon?.glyph||companion?.glyph||'✧';
   const title=reward.presentationOnly?'MILESTONE REWARD':(weapon?.name||companion?.name||'NEXUS FRAGMENTS');
   const detail=reward.presentationOnly?'ALREADY CLAIMED':(companion?'LEGENDARY ★★★★★ COMPANION'+(reward.convertedFragments?' · +'+reward.convertedFragments+' FRAGMENTS':''):weapon?(weapon.rarity==='legendary'?'LEGENDARY ★★★★★':weapon.rarity==='unique'?'UNIQUE ★★★★':'RARE ★★★')+' VOID WEAPON':'+ '+reward.amount+' FRAGMENTS');
   const conversion=reward.convertedFragments?'<em class="void-duplicate-conversion">✦ CONVERTED TO '+reward.convertedFragments.toLocaleString()+' FRAGMENTS</em>':'';
   return '<article class="void-ten-pull-card tier-'+cardTier+'" style="--pull-accent:'+color+';animation-delay:'+(index*35)+'ms"><span class="void-ten-pull-index">PULL '+String(index+1).padStart(2,'0')+'</span><div class="void-ten-pull-glyph">'+(revealed?glyph:'?')+'</div><b>'+(revealed?title:'SEALED')+'</b><small>'+(revealed?detail:'MYSTERY REWARD')+'</small>'+(revealed?conversion:'')+'</article>';
  }).join('');
  modal.innerHTML='<div class="eyebrow">VOID SHOP · MYSTERY DELIVERY</div><h2>'+(revealed?(single?'REWARD REVEALED':'10 RESULTS REVEALED'):(single?'SINGLE PULL':'TEN-PULL SEQUENCE'))+'</h2><p>'+(revealed?(single?'Your reward has been revealed.':'All ten rewards have been revealed together. Highest rarity determines the reveal animation.'):(single?'Reveal the reward to identify its contents.':'Reveal all ten results together.'))+'</p><div class="void-ten-pull-stage tier-'+tier+' '+(revealed?'is-revealed':'is-sealed')+'" style="--pull-accent:'+accent+'"><div class="void-ten-pull-rings" aria-hidden="true"></div><div class="void-ten-pull-grid '+(single?'is-single':'')+'">'+cards+'</div></div><div class="void-delivery-actions"><button class="btn void-delivery-primary" id="voidTenPullAction" style="--delivery-accent:'+accent+'">'+(revealed?'SECURE '+(single?'REWARD':'REWARDS'):(single?'REVEAL REWARD':'REVEAL ALL 10'))+'</button></div>';
  modal.querySelector('#voidTenPullAction')?.addEventListener('click',()=>{
   sfx('ui');
   if(!revealed){revealed=true;render();return;}
   const claims=new Set(valid.filter(reward=>!reward.presentationOnly).map(reward=>reward.claimKey));
   if(claims.size){saveData.pendingVoidWeaponRewards=(saveData.pendingVoidWeaponRewards||[]).filter(item=>!claims.has(item.claimKey));persist();}
   hideModal();setTimeout(()=>onDone?.(),340);
  });
 };
 render();
}

function showCoreUpgradeSystem(back=showMainMenu,initialTab='upgrades'){
 let activeTab=initialTab;
 state='voidShop';$('overlay').classList.remove('hidden','closing');const modal=$('modal');
 const render=()=>{
  modal.className='modal core-upgrade-modal void-shop-modal';
  const upgrade=saveData.coreUpgrades||{};
  const upgradesHtml=coreUpgradeDefs.map(d=>{const rank=coreUpgradeRank(null,d.id),cost=coreUpgradeCost(d,rank),max=rank>=d.max;return `<div class="core-upgrade-card"><div class="core-upgrade-icon">${d.glyph}</div><b>${d.name}</b><small>${d.desc}</small><div class="core-upgrade-rank">RANK ${rank} / ${d.max}</div><button class="btn" data-upgrade="${d.id}" ${max||saveData.coreCurrency<cost?'disabled':''}>${max?'MAX RANK':`UPGRADE · ${cost} ✦`}</button></div>`}).join('');
  modal.innerHTML=`<div class="eyebrow">NEXUS EXCHANGE</div><h2>VOID SHOP</h2><p>Spend Nexus Fragments on permanent core upgrades or mystery deliveries. Core upgrades are saved between runs.</p><div class="currency-banner">✦ NEXUS FRAGMENTS <b>${saveData.coreCurrency||0}</b></div><nav class="void-shop-tabs"><button type="button" data-shop-tab="upgrades" ${activeTab==='upgrades'?'aria-current="page"':''}>PERMANENT UPGRADES</button><button type="button" data-shop-tab="boxes" ${activeTab==='boxes'?'aria-current="page"':''}>MYSTERY DELIVERIES</button></nav>${activeTab==='upgrades'?'<div class="core-upgrade-grid">'+upgradesHtml+'</div>':`<section class="void-shop-boxes"><div class="void-shop-box-art"><span>?</span><i></i><i></i></div><h3>MYSTERY DELIVERY</h3><p>Each opening grants one reward: 2.5% Legendary Void Weapon, 2.5% Legendary Companion, 12% Unique weapon, 33% Rare weapon, or 50% Nexus Fragments. Ten pulls cost 4,500 Fragments instead of 5,000, saving 10%.</p><div class="void-shop-purchase-row"><button type="button" class="btn" id="buyMysteryOne" ${!developerMode&&saveData.coreCurrency<500?'disabled':''}>OPEN ×1 <b>${developerMode?'FREE · DEV MODE':'500 ✦'}</b></button><button type="button" class="btn" id="buyMysteryTen" ${!developerMode&&saveData.coreCurrency<4500?'disabled':''}><span class="void-pull-discount-tag">SAVE 10%</span>OPEN ×10 <b>${developerMode?'FREE · DEV MODE':'4,500 ✦'}</b></button></div></section>`}<div class="menu-actions"><button class="btn" id="coreUpgradeBack">← BACK</button></div><p class="save-note">Purchases and permanent upgrades are saved in this browser.</p>`;
  modal.querySelectorAll('[data-shop-tab]').forEach(b=>b.onclick=()=>{activeTab=b.dataset.shopTab;render()});
  modal.querySelectorAll('[data-upgrade]').forEach(b=>b.onclick=()=>{const d=coreUpgradeDefs.find(x=>x.id===b.dataset.upgrade),rank=coreUpgradeRank(null,d.id),cost=coreUpgradeCost(d,rank);if(!d||rank>=d.max||saveData.coreCurrency<cost)return;saveData.coreCurrency-=cost;saveData.coreUpgrades[d.id]=rank+1;persist();sfx('ui');render()});
  const buy=count=>{
   const cost=count===10?4500:500;if(!developerMode&&saveData.coreCurrency<cost)return;
   if(!developerMode)saveData.coreCurrency-=cost;
   const rewards=[];
   for(let i=0;i<count;i++){
    const nextPity=Math.min(60,Math.max(0,Number(saveData.voidWeaponPity)||0)+1);
    const guaranteedLegendary=nextPity>=60;
    const roll=Math.random();let pool=null;let rarity=null;
    if(guaranteedLegendary||roll<.05){rarity='legendary';pool=voidWeapons.filter(w=>w.rarity==='legendary');}
    else if(roll<.17){rarity='unique';pool=voidWeapons.filter(w=>w.rarity==='unique');}
    else if(roll<.50){rarity='rare';pool=voidWeapons.filter(w=>w.rarity==='rare');}
    if(rarity==='legendary'){
      const mustBeSignature=Boolean(saveData.voidWeaponNextLegendarySignature);
      const awardCompanion=!guaranteedLegendary&&!mustBeSignature&&Math.random()>=0.5;
      saveData.voidWeaponPity=0;
      if(awardCompanion){
        const companionPool=companions.filter(companion=>companion.rarity==='legendary');
        const companion=companionPool[Math.floor(Math.random()*companionPool.length)];
        const grant=grantCompanion(saveData,companion.id,1);saveData=grant.saveData;
        rewards.push({type:'companion',companionId:companion.id,rarity:companion.rarity,stars:companion.stars,convertedFragments:grant.convertedFragments||0,worldId:-1,roomNumber:i+1,claimKey:'shop:'+Date.now()+':'+i});
      }else{
        const eligible=mustBeSignature?pool.filter(w=>w.category==='signature'):pool;
        const weapon=eligible[Math.floor(Math.random()*eligible.length)];
        if(mustBeSignature)saveData.voidWeaponNextLegendarySignature=false;
        else if(guaranteedLegendary&&weapon.category==='general')saveData.voidWeaponNextLegendarySignature=true;
        const grant=grantVoidWeaponToSave(saveData,weapon.id,1);saveData=grant.saveData;
        const convertedFragments=grant.convertedFragments||0;
        rewards.push({type:'weapon',weaponId:weapon.id,rarity:weapon.rarity,convertedFragments,worldId:-1,roomNumber:i+1,claimKey:'shop:'+Date.now()+':'+i});
      }
    }else{
      saveData.voidWeaponPity=nextPity;
      if(pool?.length){const weapon=pool[Math.floor(Math.random()*pool.length)];const grant=grantVoidWeaponToSave(saveData,weapon.id,1);saveData=grant.saveData;const convertedFragments=grant.convertedFragments||0;rewards.push({type:'weapon',weaponId:weapon.id,rarity:weapon.rarity,convertedFragments,worldId:-1,roomNumber:i+1,claimKey:'shop:'+Date.now()+':'+i});}
      else{const amount=50;saveData.coreCurrency+=amount;rewards.push({type:'nexus-fragments',amount,worldId:-1,roomNumber:i+1,claimKey:'shop:'+Date.now()+':'+i});}
    }
   }
   saveData.pendingVoidWeaponRewards=[...(saveData.pendingVoidWeaponRewards||[]),...rewards];persist();sfx('ui');
   const finish=()=>showCoreUpgradeSystem(back,'boxes');
   hideModal();
   showVoidWeaponTenPull(rewards,finish);
  };
  modal.querySelector('#buyMysteryOne')?.addEventListener('click',()=>buy(1));
  modal.querySelector('#buyMysteryTen')?.addEventListener('click',()=>buy(10));
  modal.querySelector('#coreUpgradeBack').onclick=back;
 };
 render();
}

function awardCoreCurrency(){if(currentWorld===-1)return;const reward=8+(currentWorld+1)*5+Math.max(0,room-1)*3;saveData.coreCurrency=(saveData.coreCurrency||0)+reward;persist();}

function coreUnlockRequirement(id){return CORE_UNLOCK_REQUIREMENTS[id]||null;}

function isCoreUnlocked(id){if(developerMode)return true;const req=coreUnlockRequirement(id);if(!req)return true;const requiredWorld=worlds[req.worldIndex];return !!requiredWorld&&(saveData.bestRooms?.[req.worldIndex]||0)>=requiredWorld.rooms;}

function coreUnlockMessage(id){const req=coreUnlockRequirement(id);return req?`LOCKED · COMPLETE ${req.label} TO UNLOCK`:'CORE LOCKED';}

function showVoidWeaponInventory(coreId){
 const modal=$('modal');
 const coreName=cores.find(item=>item.id===coreId)?.name||coreId.toUpperCase();
 const render=()=>{
  const owned=getOwnedVoidWeapons(saveData);
  const equippedId=saveData.equippedVoidWeapons?.[coreId]||null;
  const equipped=equippedId?getVoidWeapon(equippedId):null;
  modal.className='modal void-weapon-inventory-modal';
  modal.onwheel=event=>{
   const list=event.target.closest?.('.void-weapon-inventory-list');
   if(list&&list.scrollHeight>list.clientHeight){
    event.preventDefault();
    list.scrollTop+=event.deltaY;
   }else if(modal.scrollHeight>modal.clientHeight){
    event.preventDefault();
    modal.scrollTop+=event.deltaY;
   }
   event.stopPropagation();
  };
  modal.ontouchstart=null;
  modal.style.overscrollBehavior='contain';
  modal.innerHTML=`<button type="button" class="world-holo-back" id="voidWeaponInventoryBack" aria-label="Back to core selection" title="Back to core selection">←</button>
   <div class="eyebrow">ARMORY</div><h2>VOID WEAPONS</h2>
   <p>Equip a weapon to <b>${coreName}</b>. Any core can use any weapon, but signature passives only work with their matching core.</p>
   <div class="void-weapon-current">${equipped?'<span class="void-weapon-current-glyph" style="color:'+equipped.color+'">'+equipped.glyph+'</span><div><small>CURRENTLY EQUIPPED</small><b>'+equipped.name+'</b><em>'+(equipped.signatureCoreId===coreId?'SIGNATURE PASSIVE ACTIVE':'STATS ONLY · SIGNATURE INACTIVE')+'</em></div><button type="button" class="btn" id="voidWeaponUnequip">UNEQUIP</button>':'<span class="void-weapon-current-glyph">＋</span><div><small>CURRENT LOADOUT</small><b>EMPTY SLOT</b><em>Equip one weapon to this core.</em></div>'}</div>
   <div class="void-weapon-inventory-list">${owned.length?owned.map(weapon=>{const isEquipped=weapon.id===equippedId,signature=weapon.signatureCoreId===coreId;const rank=weapon.refinementLevel||0,canRefine=weapon.copies>1&&rank<MAX_VOID_WEAPON_REFINEMENT;return '<article class="void-weapon-card '+(isEquipped?'is-equipped':'')+'" style="--weapon-accent:'+weapon.color+'"><div class="void-weapon-card-head"><span class="void-weapon-card-glyph">'+weapon.glyph+'</span><div><b>'+weapon.name+'</b><small>'+(weapon.rarity||'legendary').toUpperCase()+' · COPIES '+weapon.copies+' · RANK '+rank+'/'+MAX_VOID_WEAPON_REFINEMENT+'</small></div><span class="void-weapon-card-status">'+(isEquipped?'EQUIPPED':'OWNED')+'</span></div><p class="void-weapon-card-desc">'+weapon.description+'</p><div class="void-weapon-stats">'+(()=>{const refinementBonus=Math.max(0,Math.min(5,rank||0))*0.02;return '<span>ATK <b>+'+Math.round((weapon.stats.atkPct+refinementBonus)*100)+'%</b></span><span>MAX HP <b>+'+Math.round((weapon.stats.hpPct+refinementBonus)*100)+'%</b></span><span>DEF <b>+'+Math.round((weapon.stats.armorPct+refinementBonus)*100)+'%</b></span>'})()+'</div><div class="void-weapon-passive"><small>'+weapon.passive.name+(signature?' · SIGNATURE ACTIVE':' · SIGNATURE: '+(cores.find(item=>item.id===weapon.signatureCoreId)?.name||weapon.signatureCoreId))+'</small><p>'+highlightVoidWeaponNumbers(weapon.passive.description)+'</p></div><button type="button" class="btn void-weapon-equip-button" data-equip-weapon="'+weapon.id+'" '+(isEquipped?'disabled':'')+'>'+(isEquipped?'CURRENTLY EQUIPPED':'EQUIP TO '+coreName.toUpperCase())+'</button><button type="button" class="btn void-weapon-refine-button" data-refine-weapon="'+weapon.id+'" '+(!canRefine?'disabled':'')+'>'+(rank>=MAX_VOID_WEAPON_REFINEMENT?'MAX REFINEMENT':canRefine?'REFINE · USE 1 COPY':'NEED AN EXTRA COPY')+'</button></article>';}).join(''):'<div class="void-weapon-empty"><span>◇</span><b>NO WEAPONS YET</b><p>Clear milestone rooms to earn mystery deliveries. Most contain Nexus Fragments, but some hold a Void Weapon.</p></div>'}</div>`;
  $('voidWeaponInventoryBack').onclick=()=>showCoreSelection(coreId);
  const unequipButton=$('voidWeaponUnequip');
  if(unequipButton)unequipButton.onclick=()=>{const result=unequipVoidWeapon(saveData,coreId);saveData=result.saveData;persist();sfx('ui');render();};
  modal.querySelectorAll('[data-equip-weapon]').forEach(button=>button.addEventListener('click',()=>{const result=equipVoidWeapon(saveData,coreId,button.dataset.equipWeapon);if(!result.equipped){notify('COULD NOT EQUIP WEAPON');return;}saveData=result.saveData;persist();sfx('ui');render();}));
  modal.querySelectorAll('[data-refine-weapon]').forEach(button=>button.addEventListener('click',()=>{const result=refineVoidWeapon(saveData,button.dataset.refineWeapon);if(!result.refined){notify(result.reason==='max-refinement'?'MAX RANK REACHED':'NEED AN EXTRA COPY');return;}saveData=result.saveData;persist();sfx('ui');notify('WEAPON REFINED · RANK '+result.level);render();}));
 };
 $('overlay').classList.remove('hidden','closing','story-overlay','dialogue-field-overlay');
 render();
}

function showCoreSelection(previewCoreId=null){
 // Backfill Companion access for existing saves that completed the campaign before this system was added.
 const campaignAlreadyPassedUnlock=(Number(saveData.bestRooms?.[0])||0)>=10||Number(saveData.lastWorld)>0||Number(saveData.campaignCheckpoint?.world)>0||(typeof allWorldsCleared==='function'&&allWorldsCleared());
 if(!saveData.companionSystemUnlocked&&campaignAlreadyPassedUnlock){saveData=normalizeCompanionSave(saveData);saveData.companionSystemUnlocked=true;persist();}
 clearToast();state='coreselect';const modal=$('modal');let selected=Math.max(0,cores.findIndex(c=>c.id===(previewCoreId||player.coreId)));let typeTimer=null;
 modal.className='modal world-hologram-modal core-hologram-modal';
 modal.innerHTML=`<button type="button" class="world-holo-back" id="coreHoloBack" aria-label="Back to world select" title="Back to world select">←</button>
 <div class="world-holo-topline"><span class="eyebrow">CORE DATABASE / ORIGIN MATRIX</span><span class="world-holo-signal"><i></i> CORE LINK STABLE</span></div>
 <h2>SELECT YOUR CORE</h2><p class="world-holo-subtitle">Choose your origin. Every core rewrites the way you survive.</p>
 <div class="world-holo-stage core-holo-stage"><div class="world-holo-scanline"></div>
 <div class="core-holo-side-icons core-holo-abilities" id="coreHoloAbilities" aria-label="Core abilities"></div>
 <div class="core-holo-side-icons core-holo-evolutions" id="coreHoloEvolutions" aria-label="Core evolution ranks"></div><div class="world-holo-planet-wrap core-holo-visual"><div class="world-holo-orbit world-holo-orbit-a"></div><div class="world-holo-orbit world-holo-orbit-b"></div>
 <div class="world-holo-planet core-holo-planet" id="coreHoloPlanet"><div class="world-holo-planet-surface"></div><div class="world-holo-atmosphere"></div><div class="world-holo-planet-ring"></div><span id="coreHoloGlyph"></span></div></div>
 <div class="world-holo-data"><div class="world-holo-kicker" id="coreHoloKicker">ORIGIN 01 / CORE MATRIX</div><h3 id="coreHoloName"></h3><div class="world-holo-rule"><span></span></div>
 <p class="world-holo-description" id="coreHoloDescription" aria-live="polite"></p>
 <div class="world-holo-readouts core-holo-readouts"><div><small>ATTACK</small><b id="coreHoloAttack">—</b></div><div><small>MAX HP</small><b id="coreHoloSpeed">—</b></div><div><small>DEF</small><b id="coreHoloHull">—</b></div><div><small>ELEMENT</small><b id="coreHoloElement">—</b></div><div><small>ATK SPEED</small><b id="coreHoloFireRate">—</b></div><div><small>SIZE</small><b id="coreHoloSize">—</b></div></div>
 <div class="core-loadout-row"><div class="void-weapon-equipment" id="coreVoidWeaponSlot"></div><div class="companion-equipment" id="coreCompanionSlot"></div></div>
 <button class="world-holo-deploy" id="coreHoloDeploy">SELECT CORE <span>↗</span></button></div></div>
 <div class="world-holo-navigation"><button type="button" class="world-holo-step" id="coreHoloPrev" aria-label="Previous core">←</button><div class="world-holo-track" id="coreHoloTrack">${cores.map((c,i)=>`<button type="button" class="world-holo-node" data-holo-core="${i}" style="--world-accent:${c.color}" aria-label="Select ${c.name}"><span>${String(i+1).padStart(2,'0')}</span><b>${c.name.replace(/\s+CORE$/i, '')}</b><i></i></button>`).join('')}</div><button type="button" class="world-holo-step" id="coreHoloNext" aria-label="Next core">→</button></div>
 <div class="world-holo-footer"><span>USE ARROWS TO NAVIGATE CORES</span><span>CORE MASTERY PERSISTS</span></div>`;
 const desc=$('coreHoloDescription');
 const statsFor=c=>{const id=(c.id||'').toLowerCase();const map={ember:['','100','0','FIRE','0.84/s','Large'],frost:['','82','18','FROST','1.00/s','Small'],nova:['','78','0','AETHER','1.00/s','Medium'],flash:['','62','0','LIGHTNING','1.38/s','Small'],remielle:['','88','0','LUMINE','1.12/s','Small'],nature:['','90','0','NATURE','1.00/s','Medium'],elemental:['','86','0','SPECTRUM','1.05/s','Medium'],vengeance:['','96','0','BLOOD','0.58/s','Large']};const stats=map[id]||['','100','0','UNKNOWN','1.00/s','Medium'];return [String(Number((10*(c.dmg??1)).toFixed(1))),...stats.slice(1)];};

function typeCoreText(text){if(typeTimer)clearInterval(typeTimer);desc.textContent='';let pos=0;desc.classList.add('is-typing');typeTimer=setInterval(()=>{if(!desc.isConnected){clearInterval(typeTimer);return;}desc.textContent=text.slice(0,pos++);if(pos>text.length){clearInterval(typeTimer);typeTimer=null;desc.classList.remove('is-typing');}},22);}

function selectCore(index,animate=true){selected=(index+cores.length)%cores.length;const c=cores[selected],unlocked=isCoreUnlocked(c.id),vals=statsFor(c);
 modal.style.setProperty('--world-accent',c.color||'#72f6ff');modal.style.setProperty('--world-secondary',c.color||'#174c78');modal.dataset.selectedCore=String(selected);
 $('coreHoloPlanet').className='world-holo-planet core-holo-planet core-holo-'+c.id+(c.id==='elemental'?' elemental-spectrum':'')+(animate?' is-arriving':'');
 // Keep the original glyph as the readable focal point; the CSS effect layers sit behind/around it.
 let coreFx=$('coreHoloFx');
 if(!coreFx){coreFx=document.createElement('div');coreFx.id='coreHoloFx';coreFx.className='core-holo-fx';coreFx.setAttribute('aria-hidden','true');$('coreHoloPlanet').insertBefore(coreFx,$('coreHoloPlanet').firstChild);}
 const coreFxMarkup={
  ember:'<i class="fx-flame fx-flame-a"></i><i class="fx-flame fx-flame-b"></i><i class="fx-ember"></i><i class="fx-ember fx-ember-b"></i>',
  frost:'<i class="fx-ice-cube"><b></b><b></b><b></b><b></b></i><i class="fx-ice-glint"></i>',
  flash:'<i class="fx-lightning-orb"><b class="fx-bolt"></b><b class="fx-bolt fx-bolt-b"></b></i><i class="fx-static"></i>',
  nature:'<i class="fx-stone"></i><i class="fx-vine fx-vine-a"></i><i class="fx-vine fx-vine-b"></i><i class="fx-leaf fx-leaf-a"></i><i class="fx-leaf fx-leaf-b"></i><i class="fx-leaf fx-leaf-c"></i>',
  elemental:'<i class="fx-prism"><b></b><b></b><b></b></i><i class="fx-prism-sweep"></i>',
  vengeance:'<i class="fx-blood-orb"></i><i class="fx-blood-ring"></i><i class="fx-blood-drop"></i>',
  remielle:'<i class="fx-light-crystal fx-crystal-a"></i><i class="fx-light-crystal fx-crystal-b"></i><i class="fx-light-crystal fx-crystal-c"></i><i class="fx-light-flare"></i>',
  nova:'<i class="fx-aether-disc"></i><i class="fx-aether-lens"></i><i class="fx-aether-particle"></i>'
 };
 coreFx.innerHTML=coreFxMarkup[c.id]||coreFxMarkup.ember;
 $('coreHoloGlyph').textContent='';
 $('coreHoloGlyph').classList.remove('aether-glyph');
 $('coreHoloGlyph').style.color='';
 $('coreHoloGlyph').style.textShadow='';
 const coreIconInfo={
 ember:{a:[['✦','NORMAL ATTACK','Fire shots ignite enemies, dealing burn damage over time.'],['✧','PASSIVE','Critical hits against burning enemies deal +25% critical damage, gaining another +1% per player level.'],['E','CORE SKILL','RING OF FIRE · Cooldown 14s. Surround yourself with a damaging orange fire ring that burns nearby enemies.'],['Q','ULTIMATE','SOLAR FLARE · Spend 100 energy to scorch all enemies and ignite them, dealing burst damage followed by burn damage over time.']],e:[['♨','LV 5','Burn damage +30% from all sources.'],['✹','LV 10','Burning enemies explode on defeat, damaging and igniting nearby enemies.'],['✦','LV 15','Defeating a burning enemy restores 3 HP.'],['☀','LV 20','Deal 20% more damage to burning enemies.']]},
 frost:{a:[['❄','NORMAL ATTACK','Ice bolts apply chill. At 5 stacks, enemies freeze briefly.'],['✧','PASSIVE','While a shield is active, Frost deals +25% damage, gaining another +0.75% per player level.'],['E','CORE SKILL','Gain a shield and a frost field that chills enemies. Enemies that hit the shield freeze instantly.'],['Q','ULTIMATE','A 5-second blizzard damages enemies, then freezes survivors.']],e:[['❄','LV 5','Ice hits slow enemies for 50% longer.'],['⬡','LV 10','Gain +12 DEF and +12 MAX HP, then restore 12 HP.'],['✧','LV 15','Deal 15% more damage to slowed enemies.'],['❅','LV 20','Chill/slow duration is set to 3.2 seconds.']]},
 nova:{a:[['◉','NORMAL ATTACK','Fire two pale-gold piercing beams toward your target. Twin Cannon adds one extra beam per rank: 2 beams at base, 3 at rank 1, and 4 at rank 2. Beam hits deal Aether damage and apply Rend.'],['✦','PASSIVE','Aether beams, Event Horizon, Black Sun, and Void Weapon singularities apply Aether Rend. Each stack reduces enemy ATK by 5% and increases damage taken by 5%, up to 10 stacks. Works on enemies, minibosses, bosses, and the Singularity.'],['E','CORE SKILL','EVENT HORIZON · A field follows you for 5 seconds, immobilizing nearby enemies and dealing Aether damage while applying Rend. It then launches a black hole toward the Singularity, a boss, the densest enemy cluster, or a random direction before collapsing.'],['Q','ULTIMATE','BLACK SUN · Spend 100 energy to become invulnerable for 10 seconds and draw nearby enemies in. Existing Aether singularities detonate on activation. Primary beam attacks and their Void Weapon triggers pause during the transformation. The final blast grows with each unique enemy consumed; bosses and the Singularity take 100% more explosion damage.']],e:[['◉','LV 5','Event Horizon / singularity radius +8%.'],['ϟ','LV 10','Singularity detonation damage +10%.'],['◈','LV 15','Enemies inside Aether singularities take 15% more periodic damage.'],['◉','LV 20','Black Sun detonation damage +15%.']]},
 flash:{a:[['ϟ','NORMAL ATTACK','Lightning jumps to nearby enemies for 58% of primary-hit damage per hop.'],['✦','PASSIVE','Enemies hit by chain lightning take +25% ultimate damage for 6 seconds.'],['E','CORE SKILL','Stuns nearby enemies and makes them take 25% more damage.'],['Q','ULTIMATE','Calls down lightning strikes for 10 seconds.']],e:[['ϟ','LV 5','Chains jump to two additional enemies and deal 15% more chain damage.'],['⚡','LV 10','Stunned enemies take 20% more damage.'],['✦','LV 15','Critical hits increase chain damage and add one chain jump.'],['☼','LV 20','Thunderfield strikes 30% faster and deals 20% more damage.']]},
 remielle:{a:[['✦','NORMAL ATTACK','Feather shots build Lumine. At 4 stacks, Lumox deals bonus damage and grants a Void Burst.'],['✧','PASSIVE','Enemy defeats generate Light Crystals that attack nearby enemies and boost Void Burst damage.'],['E','CORE SKILL','Enter Prism Flight, gaining ATK Speed, projectile speed, a small shield, and repeated light strikes.'],['Q','ULTIMATE','Deals burst damage, creates Light Crystal zones, and applies damage over time.']],e:[['❀','LV 5','Lumox burst damage increased by 20%.'],['✧','LV 10','Daybreak Waltz lasts 1.5 seconds longer.'],['◌','LV 15','Enemies carrying Lumine Buildup take 15% more damage.'],['✦','LV 20','Store a fourth Void Burst and gain +25% Lumox damage.']]},
 nature:{a:[['❧','NORMAL ATTACK','Vines root enemies for 2 seconds, but rooted enemies can still attack.'],['✦','PASSIVE','Each living summoned drone increases damage from all sources by +10%.'],['E','CORE SKILL','Summon drones that orbit, attack nearby enemies, and heal you and allies.'],['Q','ULTIMATE','Boosts active drones, improving healing, damage, attack buffs, and speed.']],e:[['❧','LV 5','Vine binds last 0.5 seconds longer per rank.'],['❧','LV 10','Support drones heal more and provide a stronger attack buff.'],['❧','LV 15','DPS drones deal more damage and attack faster.'],['✦','LV 20','Verdant Overdrive lasts longer and improves drone output.']]},
 elemental:{a:[['◈','NORMAL ATTACK','Fires projectiles that randomly deal Fire, Frost, Lightning, or Nature damage.'],['✦','PASSIVE','Critical hits gain bonus critical damage per active elemental effect, up to +40%.'],['E','CORE SKILL','Applies all four elemental effects for 10 seconds.'],['Q','ULTIMATE','Strikes every enemy and the singular core with all four elements.']],e:[['◈','LV 5','Elemental attacks deal 10% more damage.'],['✺','LV 10','Elemental Convergence cooldown reduced by 2 seconds.'],['✦','LV 15','Elemental damage increased by another 12%.'],['◈','LV 20','Prismatic Cataclysm deals 25% more damage.']]},
 vengeance:{a:[['⟡','NORMAL ATTACK','Fire crimson crescent blades that pierce targets and cleave nearby enemies.'],['✦','Defiance','For each 1% of MAX HP missing, gain +0.75% damage reduction, up to 75%.'],['E','CORE SKILL','Sacrifice current HP to gain a shield and increased attack damage.'],['Q','ULTIMATE','Gain a powerful shield that grows over time for 14 seconds.']],e:[['⟡','LV 5','ATK increased by 12%.'],['♥','LV 10','Deal 18% more damage below 50% HP.'],['☠','LV 15','Deal 20% more damage to enemies below 30% HP.'],['✦','LV 20','Gain more missing-HP damage reduction and a stronger starting shield.']]}
 };
 const safeAttr=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const iconStrip=(items)=>items.map(([,title,tip])=>'<button type="button" class="core-holo-mini-icon" data-tip-title="'+safeAttr(title)+'" data-tip-desc="'+safeAttr(tip)+'" aria-label="'+safeAttr(title+': '+tip)+'"><small>'+safeAttr(title)+'</small></button>').join('');
 const iconInfo=coreIconInfo[c.id]||coreIconInfo.ember;
 $('coreHoloAbilities').innerHTML='<div class="core-holo-icon-heading">ABILITIES</div>'+iconStrip(iconInfo.a);
 $('coreHoloEvolutions').innerHTML='<div class="core-holo-icon-heading">EVOLUTION</div>'+iconStrip(iconInfo.e);
 $('coreHoloKicker').textContent='ORIGIN '+String(selected+1).padStart(2,'0')+' / '+(unlocked?'ACCESS GRANTED':'ACCESS RESTRICTED');$('coreHoloName').textContent=c.name.toUpperCase();
 $('coreHoloAttack').textContent=vals[0];$('coreHoloSpeed').textContent=vals[1];$('coreHoloHull').textContent=vals[2];$('coreHoloElement').textContent=vals[3];$('coreHoloFireRate').textContent=vals[4];$('coreHoloSize').textContent=vals[5];
 const weaponId=saveData.equippedVoidWeapons?.[c.id],equippedWeapon=weaponId?getVoidWeapon(weaponId):null,weaponSlot=$('coreVoidWeaponSlot');
 if(weaponSlot){const signatureActive=!!equippedWeapon&&equippedWeapon.signatureCoreId===c.id;weaponSlot.innerHTML=equippedWeapon?'<button type="button" class="void-weapon-slot is-equipped '+(signatureActive?'is-signature-active':'')+'" id="manageCoreWeapon" style="--weapon-accent:'+equippedWeapon.color+'"><span class="void-weapon-slot-glyph">'+equippedWeapon.glyph+'</span><span class="void-weapon-slot-copy"><small>VOID WEAPON EQUIPPED</small><b>'+equippedWeapon.name+'</b><em>'+(signatureActive?'✦ SIGNATURE PASSIVE ACTIVE':'GENERAL STATS ACTIVE')+'</em></span><span class="void-weapon-slot-action">MANAGE ↗</span></button>':'<button type="button" class="void-weapon-slot" id="manageCoreWeapon"><span class="void-weapon-slot-glyph">＋</span><span class="void-weapon-slot-copy"><small>VOID WEAPON SLOT</small><b>NO WEAPON EQUIPPED</b><em>Equip a weapon to gain its stat bonuses.</em></span><span class="void-weapon-slot-action">INVENTORY ↗</span></button>';
  $('manageCoreWeapon')?.addEventListener('click',()=>showVoidWeaponInventory(c.id));
 }
 const companionSlot=$('coreCompanionSlot'),companionId=saveData.equippedCompanionId,companion=companionId?getCompanion(companionId):null,companionUnlocked=!!saveData.companionSystemUnlocked;
 if(companionSlot){companionSlot.innerHTML=companion?'<button type="button" class="companion-equipment-slot is-equipped" id="manageCoreCompanion" style="--companion-accent:'+companion.color+'"><span class="companion-equipment-glyph">'+companion.glyph+'</span><span class="companion-equipment-copy"><small>COMPANION EQUIPPED</small><b>'+companion.name+'</b><em>✦ COMBAT SUPPORT ACTIVE</em></span><span class="companion-equipment-action">MANAGE ↗</span></button>':'<button type="button" class="companion-equipment-slot" id="manageCoreCompanion"><span class="companion-equipment-glyph">◇</span><span class="companion-equipment-copy"><small>COMPANION SYSTEM</small><b>'+(companionUnlocked?'NOT EQUIPPED':'SYSTEM LOCKED')+'</b><em>'+(companionUnlocked?'Equip 1 companion for support.':'Clear World 1, Room 10 to unlock.')+'</em></span><span class="companion-equipment-action">'+(companionUnlocked?'ROSTER ↗':'LOCKED')+'</span></button>';
 $('manageCoreCompanion')?.addEventListener('click',()=>{if(companionUnlocked)showCompanionInventory();else notify('CLEAR WORLD 1, ROOM 10 TO UNLOCK COMPANION EQUIPMENT.');});
 }
 const deploy=$('coreHoloDeploy');deploy.disabled=!unlocked;deploy.innerHTML=unlocked?'SELECT CORE <span>↗</span>':'CORE LOCKED <span>⌁</span>';
 $('coreHoloPrev').disabled=selected===0;$('coreHoloNext').disabled=selected===cores.length-1;
 modal.querySelectorAll('[data-holo-core]').forEach((b,i)=>{b.classList.toggle('active',i===selected);b.classList.toggle('locked',!isCoreUnlocked(cores[i].id));b.classList.remove('has-signature-weapon');const badge=b.querySelector('.signature-weapon-badge');if(badge)badge.remove();b.setAttribute('aria-current',i===selected?'true':'false');});
 modal.querySelector('[data-holo-core="'+selected+'"]')?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});
 const text=isCoreUnlocked(c.id)?c.desc:coreUnlockMessage(c.id);if(animate)typeCoreText(text);else desc.textContent=text;
 }

function deployCore(){const c=cores[selected];if(!isCoreUnlocked(c.id)){notify(coreUnlockMessage(c.id));return;}applyCoreDefaults(c);saveRunCheckpoint();notify(c.name+' selected · '+player.shots+' projectile'+(player.shots===1?'':'s'));const enterRun=()=>{hideModal();state='playing';last=performance.now();updateUI();showTutorialTip()};const intro=currentWorld>=0?worldIntroScenes[currentWorld]:null;if(intro)narrative.play(intro,{force:true,markSeen:true,onComplete:enterRun});else enterRun();}
 modal.querySelectorAll('[data-holo-core]').forEach((b,i)=>b.addEventListener('click',()=>selectCore(i)));$('coreHoloPrev').onclick=()=>selectCore(Math.max(0,selected-1));$('coreHoloNext').onclick=()=>selectCore(Math.min(cores.length-1,selected+1));$('coreHoloDeploy').onclick=deployCore;$('coreHoloBack').onclick=showWorldSelect;
 let coreWheelDelta=0;modal.addEventListener('wheel',e=>{if(!modal.classList.contains('core-hologram-modal'))return;e.preventDefault();coreWheelDelta+=e.deltaY;if(Math.abs(coreWheelDelta)>=55){const direction=coreWheelDelta>0?1:-1;coreWheelDelta=0;selectCore(Math.max(0,Math.min(cores.length-1,selected+direction)));}},{passive:false});modal.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();selectCore(Math.min(cores.length-1,selected+1));}else if(e.key==='ArrowLeft'){e.preventDefault();selectCore(Math.max(0,selected-1));}else if(e.key==='Enter'&&!$('coreHoloDeploy').disabled){deployCore();}},{capture:true});selectCore(selected,false);
}

function showCoreDetails(id){
 const data={
 ember:{element:'FIRE',accent:'#ff9c65',base:'ATK ×1.35 · Move Speed ×0.90 · ATK Speed ×0.84 · Max HP 100 · Orb radius 11',passive:"EMBER PASSIVE — Critical hits against burning enemies deal +25% critical damage, gaining another +1% per player level.",normal:'Fire shots ignite enemies, dealing burn damage over time.',skill:'E · RING OF FIRE — Cooldown 14s. Surrounds you with a damaging ring that burns enemies. Skill upgrades increase its damage, size, and duration.',ultimate:'Q · SOLAR FLARE — At 100 energy, damages all enemies and sets them on fire. Mastery increases damage and burn duration.',visual:'Fire ring, ember bursts, and burn effects. Evolutions add explosions and healing.',evolutions:'LV5 Cinderheart: burn damage +30%. LV10 Ashfall: burning enemies explode on defeat. LV15 Phoenix Furnace: restore 3 HP when a burning enemy dies. LV20 Inferno Crown: +20% damage to burning enemies.',exclusive:'Rare relic: stronger Ring of Fire. Other perks improve burn damage; evolutions add explosions, healing, and bonus damage.'},
 frost:{element:'FROST',accent:'#8cecff',base:'ATK ×0.80 · Move Speed ×1.00 · ATK Speed ×1.00 · Max HP 82 · DEF 18 · Crit Chance 28% · 1 Ice Bolt',passive:"FROST PASSIVE — While a shield is active, Frost deals +25% damage, gaining another +0.75% per player level.",normal:'Ice bolts apply chill. At 5 stacks, enemies freeze briefly.',skill:'E · CRYO SHIELD — Gain a shield and surround yourself with a frost field that chills enemies. Enemies that hit your shield freeze instantly.',ultimate:'Q · SNOWSTORM — At 100 energy, a blizzard damages all enemies for 5 seconds, then freezes survivors. Bosses take an extra hit.',visual:'Ice bolts, frost bursts, and a visible shield. Evolutions improve freeze effects.',evolutions:'LV5 Permafrost: slow lasts 50% longer. LV10 Glacial Bastion: +12 DEF, +12 Max HP, and heal 12. LV15 Shatterglass: +15% damage to slowed enemies. LV20 Absolute Zero: chill/slow duration is set to 3.2s.',exclusive:'Absolute Aegis increases Cryo Shield capacity and duration; Crystal Resonance adds DEF and Crit Chance; Shatter Protocol boosts damage against frozen and chilled enemies.'},
 nova:{element:'AETHER (BLACK SUN)',accent:'#fff7cf',base:'ATK ×0.90 · Move Speed ×1.28 · ATK Speed ×1.00 · Max HP 78 · Twin piercing beams',passive:"AETHER PASSIVE — Aether beams, Event Horizon, Black Sun, and Void Weapon singularities apply Aether Rend: each stack reduces enemy ATK by 5% and increases damage taken by 5%, up to 10 stacks. Applies to regular enemies, singularity cores, minibosses, and bosses.",normal:'Fire two pale-gold piercing beams toward your target. Twin Cannon adds one extra beam per rank: 2 beams at base, 3 at rank 1, and 4 at rank 2. Beam hits deal Aether damage and apply Rend.',skill:'E · EVENT HORIZON — 10-second sequence: immobilizes enemies in range for 5 seconds while dealing Aether damage and applying Rend, then launches a moving singularity for 4 seconds before a final collapse.',ultimate:'Q · BLACK SUN — Requires 100 energy. Transform into a Black Sun for 10 seconds, becoming invulnerable while continuously pulling nearby enemies into the core. The final explosion gains damage for every unique enemy consumed. Bosses and the Singularity take 100% additional explosion damage.',visual:'Pale-gold piercing beams are Aether’s primary attack. Event Horizon forms a stasis well before releasing a moving singularity, while Black Sun becomes a dense dark orb wrapped in collapsing photon rings.',evolutions:'LV5 Event Horizon: singularity radius +8%. LV10 Singularity Amplifier: detonation damage +10%. LV15 Gravitational Resonance: enemies inside Aether singularities take 15% more periodic damage. LV20 Black Sun Aftershock: Black Sun detonation damage +15%.',exclusive:'Aether upgrades improve singularity radius, collapse damage, and Black Sun duration and damage.'},
 remielle:{element:'LUMINE',accent:'#ff9ed8',base:'ATK ×0.88 · Move Speed ×1.12 · ATK Speed ×1.12 · Max HP 88 · Crit Chance 15% · Stores up to 3 Void Burst charges (4 after Luminous Armory)',passive:"Each enemy slain generates 1 Light Crystal on the field. After 3 seconds, Light Crystals launch toward the nearest enemy. Up to 5 Light Crystals can be generated from slain enemies. Additionally, each Light Crystal on the field increases Void Burst damage by 12%, up to 48%.",normal:'Feather shots build Lumine. At 4 stacks, Lumox deals bonus damage and grants a Void Burst. Q uses stored Void Burst.',skill:'E · DAYBREAK WALTZ / PRISM FLIGHT — Cooldown 13s. Enter Prism Flight for 6.5s, gaining 25% ATK Speed and projectile speed, a small shield, and repeated light strikes. Upgrades extend its duration.',ultimate:'Q · RADIANT FINALE — Requires 100 energy. Deals burst damage to nearby enemies and the singularity core, then creates 5 Light Crystal zones that damage enemies nearby. Applies 8 seconds of damage over time, scaled by stored Void Burst. Affected enemies take 50% more Lumox damage.',visual:'Pink feather shots, Lumox bursts, and bright Prism Flight strikes.',evolutions:'LV5 Prismatic Snare: Lumox burst damage +20%. LV10 Prism Flight: Daybreak Waltz lasts 1.5s longer. LV15 Prismatic: marked enemies take +15% damage. LV20 Luminous Armory: store a fourth Void Burst and gain +25% Lumox damage.',exclusive:'Exclusive perks can strengthen Prism Flight strikes, extend its duration, add extra strikes, and improve Lumox. Evolution names and effects are listed separately above.'},
 nature:{element:'NATURE',accent:'#70e58a',base:'ATK ×0.92 · Move Speed ×1.05 · ATK Speed ×1.00 · Max HP 90 · Support-and-summon specialist',passive:"NATURE PASSIVE — Each living summoned drone increases damage from all sources by +10%.",normal:'Vines root hit enemies for 2 seconds, but they can still attack.',skill:'E · SYMBIOTIC DEPLOYMENT — Summon drones that orbit, attack nearby enemies, and heal you and allies. Evolves at LV5 to command 3 DPS drones, then at LV10 to command 3 DPS drones + 1 support drone (4 total).' ,ultimate:'Q · VERDANT OVERDRIVE — Boosts all active drones for 12 seconds, improving healing, damage, attack buffs, and speed.',visual:'Green vines and support and attack drones. Verdant Overdrive boosts them with a bright green glow.',evolutions:'LV5 Root Network: immediately deploys 2 DPS drones and 1 support drone, raising the active limit to 3. LV10 Symbiosis: immediately deploys 3 DPS drones and 1 support drone, raising the active limit to 4. LV15 Predator Bloom: DPS drones deal 16% more damage. LV20 Worldtree Protocol: DPS drone attacks deal 20% more damage.',exclusive:'Root Network improves vine bind duration; Symbiosis improves support-drone healing and attack buffs; Predator Bloom improves DPS drones; Worldtree Protocol extends and strengthens Verdant Overdrive. Rare perks can improve drone durability and damage reduction.'},flash:{element:'LIGHTNING',accent:'#ffe875',base:'ATK ×0.62 · Move Speed ×1.42 · ATK Speed ×1.38 · Max HP 62 · DEF 0 · Crit Chance 38% · 2 chain hops at 58% damage each',passive:"FLASH PASSIVE — Enemies hit by chain lightning take +25% damage from ultimate abilities for 6 seconds.",normal:'Lightning jumps to up to two nearby enemies for 58% of primary-hit damage per hop. Flash is fast with a high critical chance, but very little hull.',skill:'E · STATIC SHOCK — Stuns up to 3 nearby enemies and makes them take 25% more damage. Stun duration can grow through mastery and perks.',ultimate:'Q · THUNDERFIELD — At 100 energy, calls down lightning strikes for 10 seconds. Strike frequency and damage scale with Overdrive upgrades.',visual:'A gold-white lightning shard with branching arcs and bright impact flashes.',evolutions:'LV5 Arc Conductor: chain damage +10%. LV10 Static Charge: Static Shock stuns last 20% longer. LV15 Capacitor Surge: critical-hit damage +12%. LV20 Thunderfield Overdrive: strikes 15% faster and deal 10% more damage.',exclusive:'Storm Circuit adds chain jumps and damage; Static Overload increases damage taken by stunned enemies; Capacitor Cascade empowers chains after a critical primary hit; Thunder God strengthens Thunderfield.'},
 'elemental':{element:'SPECTRUM',accent:'#ff71cd',base:'ATK ×0.92 · Move Speed ×1.08 · ATK Speed ×1.05 · Max HP 86 · Crit Chance 18%',passive:"ELEMENTAL PASSIVE — Critical hits deal +8% critical damage per active elemental effect on the target, up to +40% with four active effects.",normal:'Fires glowing, cube-shaped projectiles that randomly deal Fire, Frost, Lightning, or Nature damage.',skill:'E · ELEMENTAL CONVERGENCE — Cooldown 16s. E only activates a 10-second buff; it does not apply enemy effects by itself. During the buff, Fire hits apply 5 burn stacks, Frost hits instantly freeze, Nature hits bind for 3.5 seconds, every Nature cube attack launches 3 homing seed missiles with 40% crit chance, and Lightning hits chain to up to 4 additional enemies for increased damage. Verdant Swarm adds more missiles.',ultimate:'Q · PRISMATIC CATACLYSM — At 100 energy, strike every enemy and the singular core with Fire, Frost, Lightning, and Nature at once. Ultimate Mastery improves the damage of every element.',visual:'A four-color Prism core that cycles Fire, Frost, Lightning, and Nature cube shots. Fire burns, Frost slows and freezes, Lightning chains between enemies, and Nature roots targets. E empowers elemental attacks for 10 seconds; Q strikes all enemies and the singular core with all four elements.',evolutions:'LV5 Spectrum Calibration: +10% elemental damage. LV10 Chromatic Tempest: Elemental Convergence cooldown reduced by 2 seconds. LV15 Convergence: +12% elemental damage. LV20 Fourfold Cataclysm: Prismatic Cataclysm deals 25% more damage.',exclusive:'Spectrum Mastery boosts all four elemental damage types; Cubic Overload strengthens cube damage and size; Chain Reaction improves lightning chains; Frost Lattice accelerates chill and lowers the freeze threshold; Verdant Swarm adds homing seed missiles during Elemental Convergence; Burning Constellation increases burn damage.'},
 vengeance:{element:'BLOOD',accent:'#ff304f',base:'ATK ×1.35 · Move Speed ×1.02 · ATK Speed ×0.58 · Max HP 96 · DEF 30 · Crit Chance 14% · Piercing crimson blades',passive:"VENGEANCE PASSIVE · DEFIANCE — For each 1% of Max HP missing, gain +0.75% damage reduction, up to 75% damage reduction.",normal:'Fire crimson crescent blades that pierce targets and cleave nearby enemies. Missing missing HP grants up to 75% damage reduction.',skill:'E · CRIMSON SURGE — Cooldown 16s. Sacrifice 30% of current HP, gain a shield equal to 39% max HP for 12 seconds, and increase auto-attack damage by 25% plus 0.5% per percentage point of missing HP for 12 seconds. The shield expires when the effect ends.',ultimate:'Q · SANGUINE RAMPAGE — At 100 energy, gain a shield equal to 65% max HP plus 0.65% per percentage point of missing HP. For 14 seconds, generate another 6.5% max HP as shield every second. All shield from this effect expires after 14 seconds.',visual:'Crimson crescent blades, red energy arcs, a crimson core avatar, and a persistent shield bar.',evolutions:'LV5 Crimson Momentum: +12% attack damage. LV10 Blood Frenzy: +18% damage below 50% HP. LV15 Ruthless Pursuit: +20% damage against enemies below 30% HP. LV20 Last Rites: increases missing-HP damage reduction by 5 % and gives Sanguine Rampage +20% starting shield.',exclusive:'Crimson Momentum increases attack damage; Blood Frenzy boosts damage below 50% HP; Ruthless Pursuit boosts damage against enemies below 30% health; Sanguine Reservoir increases Blood Shield gain; Blood Conversion converts healing into Blood Shield; Red Harvest boosts crimson-blade damage and grants Blood Shield from damage dealt; Last Rites improves missing-HP damage reduction and Sanguine Rampage shield capacity.'}
 }[id];if(!data)return showCoreSelection();
 $('overlay').classList.remove('hidden','closing');const modal=$('modal');modal.className='modal core-details-modal';
 const name=cores.find(c=>c.id===id).name;
 const statRows={ember:[['ATK','×1.35'],['ATK SPEED','×0.84'],['MOVE SPD','×0.90'],['MAX HP','100'],['ELEMENT','FIRE']],frost:[['ATK','×0.80'],['ATK SPEED','×1.00'],['MOVE SPD','×1.00'],['MAX HP','82'],['DEF','18'],['CRIT','28%'],['ELEMENT','FROST']],nova:[['ATK','×0.90'],['ATK SPEED','×1.00'],['MOVE SPD','×1.28'],['MAX HP','78'],['WEAPON','TWIN BEAMS']],remielle:[['ATK','×0.88'],['ATK SPEED','×1.12'],['MOVE SPD','×1.12'],['MAX HP','88'],['CRIT','15%'],['VOID BURST','3 (4 evolved)'],['ELEMENT','LUMINE']],nature:[['ATK','×0.92'],['ATK SPEED','×1.00'],['MOVE SPD','×1.05'],['MAX HP','90'],['ELEMENT','NATURE']],flash:[['ATK','×0.62'],['ATK SPEED','×1.38'],['MOVE SPD','×1.42'],['MAX HP','62'],['DEF','0'],['CRIT','38%'],['ELEMENT','LIGHTNING']] ,'elemental':[['ATK','×0.92'],['ATK SPEED','×1.05'],['MOVE SPD','×1.08'],['MAX HP','86'],['CRIT','18%'],['ELEMENT','SPECTRUM']],vengeance:[['ATK','×1.35'],['ATK SPEED','×0.58'],['MOVE SPD','×1.02'],['MAX HP','96'],['CRIT','14%'],['WEAPON','CRIMSON STAR'],['ELEMENT','BLOOD']]}[id]||[];
 const statMarkup=statRows.map(([k,v])=>`<div class="core-stat"><span>${k}</span><b>${v}</b></div>`).join('');
 const abilities=[{key:'⚔',name:'NORMAL ATTACK',desc:data.normal},{key:'✦',name:'PASSIVE',desc:data.passive},{key:'E',name:'CORE SKILL',desc:data.skill},{key:'Q',name:'ULTIMATE',desc:data.ultimate}];
 const abilityMarkup=abilities.map((a,i)=>`<div class="core-ability-icon" tabindex="0" data-tip-title="${a.name.replace(/"/g,'&quot;')}" data-tip-desc="${a.desc.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" aria-label="${a.name}: ${a.desc.replace(/"/g,'&quot;')}"><span>${a.key}</span><small>${a.name}</small></div>`).join('');
 const evoGrowth={ember:'Core growth: +10% attack damage, +8 Max HP (heal 8), +2 DEF.',frost:'Core growth: +8% attack damage, +10 Max HP (heal 10), +3 DEF.',nova:'Core growth: +8% attack damage, +6 Max HP (heal 6).',remielle:'Core growth: +8% attack damage, +7 Max HP (heal 7).',nature:'Core growth: +8% attack damage, +6 Max HP (heal 6), +4% drone efficacy.','elemental':'Core growth: +10% attack damage, +8 Max HP (heal 8).',vengeance:'Core growth: +10% attack damage, +8 Max HP (heal 8).'}[id];
 const evoNames={ember:[['♨','Cinderheart','Burn damage +30% from all sources, including Ring of Fire.'],['✹','Ashfall','Burning enemies explode on defeat, damaging and igniting nearby enemies.'],['✦','Phoenix Furnace','Defeating a burning enemy restores 3 HP.'],['☀','Inferno Crown','Deal 20% more damage to burning enemies.']],frost:[['❄','Permafrost','Ice hits slow enemies for 50% longer.'],['⬡','Glacial Bastion','Gain +12 DEF and +12 Max HP, then restore 12 HP.'],['✧','Shatterglass','Deal 15% more damage to slowed enemies.'],['❅','Absolute Zero','Chill/slow duration is set to 3.2 seconds.']],nova:[['◉','Event Horizon','Singularity radius +8%.'],['✦','Singularity Amplifier','Singularity detonation damage +10%.'],['◈','Gravitational Resonance','Enemies inside Aether singularities take 15% more periodic damage.'],['◉','Black Sun Aftershock','Black Sun detonation damage +15.']],remielle:[['❀','Prismatic Snare','Lumox burst damage increased by 20%.'],['✧','Prism Flight','Daybreak Waltz lasts 1.5 seconds longer, allowing more autonomous light strikes.'],['◌','Prismatic','Enemies carrying Lumine Buildup take 15% more damage from all your attacks.'],['✦','Luminous Armory','Store a fourth Void Burst and gain +25% Lumox damage.']],nature:[['❧','Root Network','Vine binds last 0.5 seconds longer per rank.'],['❧','Symbiosis','Support drones heal more and provide a stronger attack buff.'],['❧','Predator Bloom','DPS drones deal more damage and attack faster.'],['✦','Worldtree Protocol','Verdant Overdrive lasts longer and improves drone output.']],flash:[['ϟ','Storm Circuit','Lightning chains jump to two additional enemies and deal 15% more chain damage.'],['⚡','Static Overload','Stunned enemies take 20% more damage from all sources.'],['✦','Capacitor Cascade','Critical normal attacks increase chain damage and add one chain jump.'],['☼','Thunder God','Thunderfield strikes 30% faster and deals 20% more damage.']],'elemental':[['◈','Spectrum Calibration','Elemental attacks deal 10% more damage.'],['✺','Chromatic Tempest','Elemental Convergence cooldown reduced by 2 seconds.'],['✦','Convergence','Elemental damage increased by another 12%.'],['◈','Fourfold Cataclysm','Prismatic Cataclysm deals 25% more damage.']],'vengeance':[['⟡','Crimson Momentum','ATK increased by 12%.'],['♥','Blood Frenzy','Deal 18% more damage while below 50% HP.'],['☠','Ruthless Pursuit','Deal 20% more damage to enemies below 30% HP.'],['✦','Last Rites','Gain 5 % of missing-HP damage reduction and start Sanguine Rampage with 20% more shield.']]}[id];
 const evoMarkup=evoNames.map((e,i)=>{const detail=`${e[2]} ${evoGrowth}`;return `<div class="core-evo-icon" tabindex="0" data-tip-title="LV ${[5,10,15,20][i]} · ${e[1]}" data-tip-desc="${detail.replace(/&/g,'&amp;').replace(/"/g,'&quot;') }" aria-label="Level ${[5,10,15,20][i]} ${e[1]}: ${detail}"><span>${e[0]}</span><small>LV ${[5,10,15,20][i]}</small></div>`}).join('');
 const exclusiveItemsByCore={
  ember:[
   {name:'Infernal Conflux',glyph:'♨',desc:'Empowers Ring of Fire with stronger pulses, more potent burn, and a wider area.'},
   {name:'Pyre Cascade',glyph:'✦',desc:'Makes burn effects increasingly potent.'},
   {name:'Cinder Mark',glyph:'♨',desc:'Burning enemies become more vulnerable to Ember attacks.'},
   {name:'Cinderheart',glyph:'♨',desc:'Burn damage increases by 30% from all sources.'},
   {name:'Ashfall',glyph:'☄',desc:'Burning enemies erupt when defeated, damaging and igniting nearby foes.'},
   {name:'Phoenix Furnace',glyph:'♥',desc:'Defeating burning enemies restores hull.'},
   {name:'Inferno Crown',glyph:'♛',desc:'Deal more damage to burning enemies.'}
  ],
  frost:[
   {name:'Absolute Aegis Relic',glyph:'❄',desc:'Strengthens Cryo Shield by increasing its protection and extending its duration.'},
   {name:'Crystal Resonance',glyph:'✦',desc:'Improves defensive plating and critical-hit potential.'},
   {name:'Shatter Protocol',glyph:'❄',desc:'Frost attacks deal increased damage to frozen and chilled enemies.'},
   {name:'Permafrost',glyph:'❄',desc:'Ice hits keep enemies slowed for longer.'},
   {name:'Glacial Bastion',glyph:'⬡',desc:'Increases DEF and Max HP, then restores HP.'},
   {name:'Shatterglass',glyph:'◇',desc:'Deal 15% more damage to slowed enemies.'},
   {name:'Absolute Zero',glyph:'❅',desc:'Sets chill/slow duration to 3.2 seconds.'}
  ],
  nova:[
   {name:'Supernova Guidance',glyph:'✦',desc:'Homing Missile Salvo launches a larger, harder-hitting volley.'},
   {name:'Prismatic Overdrive',glyph:'✦',desc:'Boosts attack power and firing speed.'},
   {name:'Prism Echo',glyph:'✧',desc:'Strengthens Aether beam damage and improves the bonus effect triggered by empowered beam attacks.'},
   {name:'Prism Focus',glyph:'✧',desc:'Increases Aether twin-beam damage.'},
   {name:'Overclock',glyph:'ϟ',desc:'Every fourth Aether auto-attack deals +35% damage and gains a wider beam hitbox.'},
   {name:'Spectrum Burn',glyph:'◈',desc:'Aether beam hits mark enemies so they take increased damage.'},
   {name:'Event Horizon',glyph:'◉',desc:'Strengthens Aether beam damage and widens the beam hitbox.'}
  ],
  nature:[
   {name:'Root Network',glyph:'❧',desc:'Extends vine bind duration by 0.5 seconds per rank, up to 3 ranks.'},
   {name:'Symbiosis',glyph:'❧',desc:'Support drone restores more hull and grants a stronger attack buff.'},
   {name:'Predator Bloom',glyph:'❧',desc:'DPS drone deals more damage and attacks more frequently.'},
   {name:'Worldtree Protocol',glyph:'✦',desc:'RARE · Verdant Overdrive lasts 3s longer and boosts all drones.'},
   {name:'Seedling Reserve',glyph:'❧',desc:'Drone charges recharge faster and newly summoned drones gain bonus maximum HP.'},
   {name:'Evergreen Covenant',glyph:'✧',desc:'RARE · Each living drone adds 10% damage and 6% damage reduction.'}
  ],
  flash:[
   {name:'Storm Circuit',glyph:'ϟ',desc:'Adds chain jumps and increases chain damage.'},
   {name:'Static Overload',glyph:'⚡',desc:'Stunned enemies take increased damage from all sources.'},
   {name:'Capacitor Cascade',glyph:'✦',desc:'Critical normal attacks empower lightning chains.'},
   {name:'Thunder God',glyph:'☼',desc:'Thunderfield strikes faster and hits harder.'},
   {name:'Nervous System',glyph:'⚡',desc:'Extends stun duration and increases damage taken by stunned enemies.'},
   {name:'Live Wire',glyph:'ϟ',desc:'Improves critical chance and attack speed.'}
  ],
  remielle:[
   {name:'Daybreak Chorus',glyph:'✧',desc:'Empowers Prism Flight strikes and extends Daybreak Waltz.'},
   {name:'Swift Current',glyph:'✧',desc:'Prism Flight strikes happen more rapidly.'},
   {name:'Lasting Radiance',glyph:'✧',desc:'Keeps Prism Flight active for longer.'},
   {name:'Prism Echo',glyph:'✧',desc:'Strengthens Prism Flight strikes and automatic follow-up attacks.'},
   {name:'Multiplicity',glyph:'✧',desc:'Adds extra luminous strikes to each Prism Flight pulse.'},
   {name:'Prismatic Snare',glyph:'❀',desc:'Increases the burst damage when Lumox triggers.'},
   {name:'Prism Flight',glyph:'✧',desc:'Daybreak Waltz lasts longer. Every third attack fires a light strike.'},
   {name:'Prismatic',glyph:'◌',desc:'Enemies carrying Lumine Buildup take increased damage from your attacks.'},
   {name:'Luminous Armory',glyph:'✦',desc:'Allows an additional Void Burst to be stored and further strengthens Lumox.'}
  ],
  vengeance:[
   {name:'Crimson Momentum',glyph:'➤',desc:'Vengeance-exclusive · Auto-attack damage +12%.'},
   {name:'Blood Frenzy',glyph:'♥',desc:'Vengeance-exclusive · Deal +18% damage while below 50% HP.'},
   {name:'Ruthless Pursuit',glyph:'☠',desc:'Vengeance-exclusive · Deal +20% damage to enemies below 30% HP.'},
   {name:'Sanguine Reservoir',glyph:'⬡',desc:'Vengeance-exclusive · Shield gained from Sanguine Rampage and shield generation is increased by 20%.'},
   {name:'Blood Conversion',glyph:'♥',desc:'RARE · All healing is converted into Blood Shield instead of restoring HP.'},
   {name:'Red Harvest',glyph:'⟡',desc:'RARE · Missing HP further increases damage and attack speed.'}
  ],
  'elemental':[
   {name:'Spectrum Mastery',glyph:'◈',desc:'RARE · Fire, Frost, Lightning, and Nature damage +15%.'},
   {name:'Cubic Overload',glyph:'⬢',desc:'RARE · Cube damage and projectile size increase per rank.'},
   {name:'Chain Reaction',glyph:'ϟ',desc:'RARE · Lightning chains hit more enemies and deal more damage.'},
   {name:'Frost Lattice',glyph:'❄',desc:'RARE · Faster chill buildup and an easier freeze threshold.'},
   {name:'Verdant Swarm',glyph:'✦',desc:'RARE · During Elemental Convergence, each Aether hit launches additional homing missiles with 40% crit chance.'},
   {name:'Burning Constellation',glyph:'♨',desc:'RARE · Fire burn damage increases per rank.'}
  ]
 };
 const exclusiveItems=exclusiveItemsByCore[id]||[];
 const motifs={ember:'<i class="motif-fire"></i><i class="motif-fire m2"></i><i class="motif-fire m3"></i>',frost:'<i class="motif-ice"></i><i class="motif-ice m2"></i><i class="motif-ice m3"></i>',nova:'<i class="motif-laser"></i><i class="motif-laser m2"></i><i class="motif-star"></i>',remielle:'<i class="motif-feather"></i><i class="motif-feather m2"></i><i class="motif-feather m3"></i>','elemental':'<i class="motif-elemental"></i><i class="motif-elemental m2"></i><i class="motif-elemental m3"></i>',flash:'<i class="motif-lightning"></i><i class="motif-lightning m2"></i><i class="motif-lightning m3"></i>',nature:'<i class="motif-leaf"></i><i class="motif-leaf m2"></i><i class="motif-leaf m3"></i>',vengeance:'<i class="motif-crimson"></i><i class="motif-crimson m2"></i><i class="motif-crimson m3"></i>'}[id];
 modal.innerHTML=`<div class="eyebrow">${data.element} CORE</div><h2 style="color:${data.accent}">${cores.find(c=>c.id===id).glyph} ${name}</h2><div class="core-detail-scroll core-visual-layout"><section class="core-detail-block core-stats-block"><h3>CORE STATS</h3><div class="core-stat-grid">${statMarkup}</div></section><section class="core-detail-block core-visual-block"><h3>CORE PREVIEW</h3><div class="core-visual-stage orb-render-stage ${id}" aria-label="${name} orb render"><div class="orb-render ${id}"><i class="orb-aura"></i><i class="orb-wing wing-left"></i><i class="orb-wing wing-right"></i><i class="orb-core"></i><i class="orb-orbit orbit-one"></i><i class="orb-orbit orbit-two"></i><i class="orb-spark spark-one"></i><i class="orb-spark spark-two"></i></div></div></section><section class="core-detail-block core-abilities-block"><h3>ABILITIES</h3><div class="core-ability-grid">${abilityMarkup}</div></section><section class="core-detail-block core-evolutions-block"><h3>EVOLUTIONS</h3><div class="core-evo-grid">${evoMarkup}</div></section><section class="core-detail-block core-exclusive-block"><h3>EXCLUSIVE CORE PERKS</h3><div class="core-exclusive-icons">${exclusiveItems.map((u,i)=>`<span tabindex="0" role="button" data-tip-title="${u.name.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" data-tip-desc="${u.desc.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" aria-label="${u.name}: ${u.desc.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">${u.glyph}<small>${u.name}</small></span>`).join('')}</div></section></div><div class="menu-actions"><button class="btn" id="coreDetailsBack">← BACK TO ORB SELECTION</button></div>`;$('coreDetailsBack').onclick=showCoreSelection;
}

