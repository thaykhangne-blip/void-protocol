// Aether primary attack: focused beams fire sequentially from orbiting emitters.
// Pulsing gravity rings are handled separately as Aether's passive.
export function fireNovaAutoAttack(context, locals) {
 const { player, enemies, blackHole } = context;
 const target = locals?.target || enemies.filter(e => e && e.hp > 0)
  .sort((a, b) => Math.hypot(player.x-a.x, player.y-a.y) - Math.hypot(player.x-b.x, player.y-b.y))[0] || blackHole;
 if (!target || target.hp <= 0) return;
 const baseAngle = Math.atan2(target.y-player.y, target.x-player.x);
 const damage = player.damage * .72 * (player.laserDamageMult || 1);
 const rank = Math.max(0, Math.min(2, player.sideCannons || 0));
 // All cannons aim at the same target; their orbiting origins provide the spread.
 const angles = Array(2 + rank).fill(baseAngle);
 if (!Array.isArray(player.aetherBeamQueue)) player.aetherBeamQueue = [];
 const volleyId = (player.aetherBeamVolleyId || 0) + 1;
 player.aetherBeamVolleyId = volleyId;
 const used = new Set();
 for (let i=0; i<angles.length; i++) {
  player.aetherBeamQueue.push({delay:i*.3, angle:angles[i], damage, used, volleyId, beamIndex:i, beamCount:angles.length, rotatingEmitter:rank>0, length:700});
 }
}
