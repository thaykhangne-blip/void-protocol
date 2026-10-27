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
 // Without Side Cannons, keep the focused twin-beam attack aimed at the target.
 // With the perk, the extra emitters cover the cardinal directions around Aether.
 const angles = rank > 0
  ? [-Math.PI / 2, Math.PI / 2, 0, Math.PI].slice(0, 2 + rank)
  : [baseAngle - .0225, baseAngle + .0225];
 const used = new Set();
 for (let i=0; i<angles.length; i++) {
  const angle = angles[i];
  const ux = Math.cos(angle), uy = Math.sin(angle);
  skillFx.push({type:'aetherTwinBeam',x1:player.x,y1:player.y,x2:player.x+ux*length,y2:player.y+uy*length,life:.22,max:.22,color:'#ffe7a0',beamIndex:i,beamCount:angles.length});
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
