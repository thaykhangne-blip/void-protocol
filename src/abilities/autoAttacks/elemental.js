import { getProjectileDamageMultiplier } from './projectiles.js';

// elemental primary auto-attack implementation. Mutable game state is supplied by the engine.
export function fireElementalAutoAttack(context, locals) {
 const { player, blackHole, enemies, core, CORE_TARGET_RANGE, mouse, sfx, pick, ELEMENTAL_CORE_ELEMENTS, bullets, launchElementalNovaSalvo, natureDrones, withinCoreRange, dist, skillFx, rand, applyDamage, triggerRicochetChain, burst, pointSegmentDistance, W, H, lasers, RICOCHET_LINK_RANGE, addLightningArc, element, energy, firePhaseFlowAttack } = context;
 const { coreId, target, angle, extendedProjectileCore, attackProjectileRange } = locals;

  const total=Math.max(1,Math.min(5,player.shots||1));if(target)sfx('shoot_nova');
  const shotPenalty=getProjectileDamageMultiplier(total,player.baseShots,player.projectileDamagePenalty??.12);
  for(let i=0;i<total;i++){const prism=pick(ELEMENTAL_CORE_ELEMENTS),parallelPair=total>=2&&i<2,a=total>=3&&!parallelPair?angle+(i-(total-1)/2)*.20:angle,laneOffset=parallelPair?(i===0?-.5:.5)*16:0;const ox=player.x+Math.cos(angle)*10-Math.sin(angle)*laneOffset,oy=player.y+Math.sin(angle)*10+Math.cos(angle)*laneOffset;const shotDamage=player.damage*shotPenalty;bullets.push({x:ox,y:oy,vx:Math.cos(a)*player.shotSpeed,vy:Math.sin(a)*player.shotSpeed,r:4.5,life:extendedProjectileCore?2.2:1.6,rangeLeft:attackProjectileRange,damage:shotDamage,color:prism.color,el:prism.name,type:'prism',prismElement:prism.name,pierce:player.pierce||0,hitEnemies:[],ricochetsLeft:player.ricochet||0});if(prism.name==='AETHER'&&(player.elementalEmpowerTimer||0)>0)launchElementalNovaSalvo(target,shotDamage);}
  if(player.sideCannons){const count=Math.min(4,2*player.sideCannons);for(let i=0;i<count;i++){const prism=pick(ELEMENTAL_CORE_ELEMENTS),side=(i-(count-1)/2)*2,a=angle+side*.22,ox=player.x+Math.cos(angle)*5-Math.sin(angle)*side*12,oy=player.y+Math.sin(angle)*5+Math.cos(angle)*side*12;bullets.push({x:ox,y:oy,vx:Math.cos(a)*player.shotSpeed,vy:Math.sin(a)*player.shotSpeed,r:3.5,rangeLeft:attackProjectileRange,damage:player.damage*.48,color:prism.color,type:'prism',prismElement:prism.name,life:1.8,pierce:0,hitEnemies:[],ricochetsLeft:player.ricochet||0,fromSideCannon:true});}}
 
}
