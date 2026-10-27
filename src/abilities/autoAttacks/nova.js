// Aether primary attack: two gravitational rings alternate between attraction and rejection.
// Hits use the shared damage pipeline so Rend and compatible weapon effects continue to work.
export function fireNovaAutoAttack(context, locals) {
 const { player, enemies, blackHole, applyDamage, skillFx, burst, dist } = context;
 const inward = (player.aetherRingPhase = ((player.aetherRingPhase || 0) + 1) % 2) === 1;
 const radius = (148 + Math.min(32, (player.evoTier || 0) * 8)) * (1 + Math.min(.75, player.aetherRingRangeBonus || 0));
 const innerRadius = Math.max(22, player.r + 10);
 const pulseDamage = player.damage * .62 * (player.laserDamageMult || 1);
 const color = '#fff0a6';
 for (const enemy of enemies) {
  if (!enemy || enemy.hp <= 0) continue;
  const dx = player.x - enemy.x, dy = player.y - enemy.y, d = Math.hypot(dx, dy) || 1;
  // The damaging radius matches the outer edge of the visible pulsating rings.
  if (d > radius + (enemy.r || 0)) continue;
  const falloff = Math.max(.15, 1 - d / Math.max(1, radius));
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
 // Side Cannons amplify the pulse inside the visible ring boundary; they do not extend its range.
 if (player.sideCannons) {
  const extra = pulseDamage * .18 * Math.min(2, player.sideCannons);
  for (const enemy of enemies) if (enemy.hp > 0 && dist(player, enemy) <= radius + (enemy.r || 0)) {
   applyDamage(enemy, extra, color, false, 'AETHER GRAVITY SIDECANNON');
  }
 }
}
