import { getProjectileDamageMultiplier } from './projectiles.js';

// Aether primary attack: fast, piercing event-horizon shards rather than hitscan beams.
// Mutable game state is supplied by the engine.
export function fireNovaAutoAttack(context, locals) {
 const { player, enemies, core, CORE_TARGET_RANGE, bullets, W, H, lasers } = context;
 const { target, angle } = locals;

 // Orbital Overdrive charges every fourth shard. The empowered shard is brighter and hits harder.
 const overclockedNovaShot=!!player.novaOverclock&&((player.novaOverclockCount=(player.novaOverclockCount||0)+1)>=4);
 if(overclockedNovaShot)player.novaOverclockCount=0;
 const total=Math.max(1,Math.min(5,player.shots||1)),spread=.14,laneGap=24;
 for(let i=0;i<total;i++){
  const parallelPair=total===2;
  const a=total>=3?angle+(i-(total-1)/2)*spread:angle;
  const laneOffset=parallelPair?(i===0?-.5:.5)*laneGap:0;
  const ox=player.x+Math.cos(angle)*8-Math.sin(angle)*laneOffset;
  const oy=player.y+Math.sin(angle)*8+Math.cos(angle)*laneOffset;
  const vx=Math.cos(a),vy=Math.sin(a);
  bullets.push({
   x:ox,y:oy,vx:vx*player.shotSpeed*1.55,vy:vy*player.shotSpeed*1.55,
   r:5+(player.laserWidthBonus||0)*.18,life:2.2,rangeLeft:CORE_TARGET_RANGE,
   damage:player.damage*.78*(player.laserDamageMult||1)*(overclockedNovaShot?1.35:1)*getProjectileDamageMultiplier(total,player.baseShots,player.projectileDamagePenalty??.12),
   color:overclockedNovaShot?'#ffffff':'#fff0a6',type:'aether',coreId:'nova',
   pierce:Math.max(1,player.pierce||0),hitEnemies:[],aetherPierceCount:0,
   aetherOverclocked:overclockedNovaShot,ricochetsLeft:player.ricochet||0,ricochetChecked:false
  });
 }

 // Side cannons now fire smaller Aether shards too, instead of reverting to generic beams.
 if(player.sideCannons){
  const cannonCount=Math.min(4,2*(player.sideCannons||0));
  for(let i=0;i<cannonCount;i++){
   const side=(i-(cannonCount-1)/2)*2;
   const a=angle+side*.22;
   const ox=player.x+Math.cos(angle)*5-Math.sin(angle)*side*12;
   const oy=player.y+Math.sin(angle)*5+Math.cos(angle)*side*12;
   bullets.push({
    x:ox,y:oy,vx:Math.cos(a)*player.shotSpeed*1.35,vy:Math.sin(a)*player.shotSpeed*1.35,
    r:3.4,life:2,rangeLeft:CORE_TARGET_RANGE,
    damage:player.damage*.42*(player.laserDamageMult||1),color:'#fff0a6',type:'aether',coreId:'nova',
    pierce:0,hitEnemies:[],aetherPierceCount:0,isSideCannon:true,ricochetsLeft:player.ricochet||0
   });
  }
 }
}
