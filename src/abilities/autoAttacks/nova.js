import { getProjectileDamageMultiplier } from './projectiles.js';

// nova primary auto-attack implementation. Mutable game state is supplied by the engine.
export function fireNovaAutoAttack(context, locals) {
 const { player, blackHole, enemies, core, CORE_TARGET_RANGE, mouse, sfx, pick, ELEMENTAL_CORE_ELEMENTS, bullets, launchElementalNovaSalvo, natureDrones, withinCoreRange, dist, skillFx, rand, applyDamage, triggerRicochetChain, burst, pointSegmentDistance, W, H, lasers, RICOCHET_LINK_RANGE, addLightningArc, element, energy, firePhaseFlowAttack } = context;
 const { coreId, target, angle, extendedProjectileCore, attackProjectileRange } = locals;

  // Aether's normal attack is a focused singularity laser. Orbital Overdrive charges every fourth attack.
  const overclockedNovaShot=!!player.novaOverclock&&((player.novaOverclockCount=(player.novaOverclockCount||0)+1)>=4);if(overclockedNovaShot)player.novaOverclockCount=0;
  const total=Math.max(1,Math.min(5,player.shots||1)),spread=.14,laneGap=24;
  for(let i=0;i<total;i++){
   const parallelPair=total===2;
   const a=total>=3?angle+(i-(total-1)/2)*spread:angle;
   const laneOffset=parallelPair?(i===0?-.5:.5)*laneGap:0;
   const ox=player.x+Math.cos(angle)*8-Math.sin(angle)*laneOffset;
   const oy=player.y+Math.sin(angle)*8+Math.cos(angle)*laneOffset;
   const vx=Math.cos(a),vy=Math.sin(a);
   const edgeX=vx>0?(W-ox)/vx:vx<0?(0-ox)/vx:Infinity;
   const edgeY=vy>0?(H-oy)/vy:vy<0?(0-oy)/vy:Infinity;
   const length=Math.min(CORE_TARGET_RANGE,Math.max(0,Math.min(edgeX>0?edgeX:Infinity,edgeY>0?edgeY:Infinity)));
   lasers.push({x:ox,y:oy,angle:a,vx,vy,length:Number.isFinite(length)?length:Math.max(W,H),damage:player.damage*.70*(player.laserDamageMult||1)*(overclockedNovaShot?1.35:1)*getProjectileDamageMultiplier(total,player.baseShots,player.projectileDamagePenalty??.12),color:overclockedNovaShot?'#ffedb0':'#ff9b3d',coreId:'nova',life:.16,maxLife:.16,ticks:1,tickTimer:0,hitRadius:6+(player.laserWidthBonus||0)+(overclockedNovaShot?3:0),ricochetsLeft:player.ricochet||0,ricochetChecked:false});
  }
  // Aether's primary weapon is a laser, so its side cannons must emit side beams
  // rather than ordinary ray bullets (which are not processed as laser hits).
  if(player.sideCannons){
   const cannonCount=Math.min(4,2*(player.sideCannons||0));
   for(let i=0;i<cannonCount;i++){
    const side=(i-(cannonCount-1)/2)*2;
    const a=angle+side*.22;
    const ox=player.x+Math.cos(angle)*8-Math.sin(angle)*side*12;
    const oy=player.y+Math.sin(angle)*8+Math.cos(angle)*side*12;
    const vx=Math.cos(a),vy=Math.sin(a);
    const edgeX=vx>0?(W-ox)/vx:vx<0?(0-ox)/vx:Infinity;
    const edgeY=vy>0?(H-oy)/vy:vy<0?(0-oy)/vy:Infinity;
    const length=Math.min(CORE_TARGET_RANGE,Math.max(0,Math.min(edgeX>0?edgeX:Infinity,edgeY>0?edgeY:Infinity)));
    lasers.push({x:ox,y:oy,angle:a,vx,vy,length:Number.isFinite(length)?length:Math.max(W,H),damage:player.damage*.48*(player.laserDamageMult||1),color:'#ffb84d',coreId:'nova',life:.16,maxLife:.16,ticks:1,tickTimer:0,hitRadius:3.5+(player.laserWidthBonus||0),ricochetsLeft:player.ricochet||0,ricochetChecked:false,isSideCannon:true});
   }
  }
 
}
