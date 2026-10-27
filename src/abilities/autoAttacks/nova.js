// Aether primary attack: twin focused beams pierce along two parallel lanes.
// Pulsing gravity rings are handled separately as Aether's passive.
export function fireNovaAutoAttack(context, locals) {
 const { player, enemies, blackHole, applyDamage, skillFx, burst } = context;
 const target = locals?.target || enemies.filter(e => e && e.hp > 0)
  .sort((a, b) => Math.hypot(player.x-a.x, player.y-a.y) - Math.hypot(player.x-b.x, player.y-b.y))[0] || blackHole;
 if (!target || target.hp <= 0) return;
 const baseAngle = Math.atan2(target.y-player.y, target.x-player.x);
 const length = 700, width = 10;
 const damage = player.damage * .72 * (player.laserDamageMult || 1);
 const rank = Math.max(0, Math.min(2, player.sideCannons || 0));
 // Twin Cannon adds one extra primary beam per rank: 2 / 3 / 4 beams total.
 const beamCount = 2 + rank;
 const used = new Set();
 for (let i=0; i<beamCount; i++) {
  const angle = baseAngle + (i-(beamCount-1)/2)*.045;
  const ux = Math.cos(angle), uy = Math.sin(angle);
  skillFx.push({type:'aetherTwinBeam',x1:player.x,y1:player.y,x2:player.x+ux*length,y2:player.y+uy*length,life:.22,max:.22,color:'#ffe7a0',beamIndex:i,beamCount});
  const candidates = [...(enemies || []).filter(e => e && e.hp > 0)];
  if (blackHole && blackHole.hp > 0 && !blackHole.inactive) candidates.push(blackHole);
  for (const entity of candidates) {
   const dx=entity.x-player.x, dy=entity.y-player.y;
   const along=dx*ux+dy*uy, side=Math.abs(dx*uy-dy*ux);
   if (along<0 || along>length || side>(entity.r||10)+width || used.has(entity)) continue;
   used.add(entity);
   applyDamage(entity,damage,'#ffe7a0',true,'AETHER TWIN BEAM');
   if(player.laserVulnerability)entity.novaVuln=Math.max(entity.novaVuln||0,1.5);
   burst(entity.x,entity.y,'#ffe7a0',5);
  }
 }
}
