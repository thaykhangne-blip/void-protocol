// Aether primary attack: two gravitational rings alternate between attraction and rejection.
// Hits use the shared damage pipeline so Rend and compatible weapon effects continue to work.
export function fireNovaAutoAttack(context, locals) {
 const { player, enemies, blackHole, applyDamage, skillFx, burst, dist } = context;
 const inward = (player.aetherRingPhase = ((player.aetherRingPhase || 0) + 1) % 2) === 1;
 const radius = 104 + Math.min(28, (player.evoTier || 0) * 7);
 const innerRadius = Math.max(22, player.r + 10);
 const pulseDamage = player.damage * .62 * (player.laserDamageMult || 1);
 const color = '#fff0a6';
 for (const enemy of enemies) {
  if (!enemy || enemy.hp <= 0) continue;
  const dx = player.x - enemy.x, dy = player.y - enemy.y, d = Math.hypot(dx, dy) || 1;
  if (d > radius + (enemy.r || 0) || d < innerRadius) continue;
  const falloff = Math.max(.15, 1 - Math.max(0, d - innerRadius) / Math.max(1, radius - innerRadius));
  const strength = (inward ? 42 : 19) * falloff;
  enemy.x += (inward ? dx / d : -dx / d) * strength;
  enemy.y += (inward ? dy / d : -dy / d) * strength;
  applyDamage(enemy, pulseDamage, color, true, inward ? 'AETHER GRAVITY INFLUX' : 'AETHER GRAVITY REJECTION');
  if (player.laserVulnerability) enemy.novaVuln = Math.max(enemy.novaVuln || 0, 1.5);
  burst(enemy.x, enemy.y, color, 2);
 }
 if (blackHole && blackHole.hp > 0 && !blackHole.inactive && dist(player, blackHole) <= radius + (blackHole.r || 0)) {
  applyDamage(blackHole, pulseDamage, color, true, inward ? 'AETHER GRAVITY INFLUX' : 'AETHER GRAVITY REJECTION');
 }
 skillFx.push({ type:'aetherRingPulse', x:player.x, y:player.y, life:.36, max:.36, radius, innerRadius, inward, color });
 // Orbital Overdrive is now an empowered inward pulse, not a projectile.
 if (inward && player.novaOverclock && ((player.novaOverclockCount = (player.novaOverclockCount || 0) + 1) >= 4)) {
  player.novaOverclockCount = 0;
  for (const enemy of enemies) if (enemy.hp > 0 && dist(player, enemy) <= radius) applyDamage(enemy, pulseDamage * .35, '#ffffff', false, 'AETHER GRAVITY OVERDRIVE');
 } else if (!player.novaOverclock) player.novaOverclockCount = 0;
 // Side Cannons add a short outer pressure pulse instead of side projectiles.
 if (player.sideCannons) {
  const edgeRadius = radius + 20, extra = pulseDamage * .18 * Math.min(2, player.sideCannons);
  for (const enemy of enemies) if (enemy.hp > 0 && dist(player, enemy) > radius && dist(player, enemy) <= edgeRadius) {
   applyDamage(enemy, extra, color, false, 'AETHER GRAVITY SIDECANNON');
  }
 }
}
