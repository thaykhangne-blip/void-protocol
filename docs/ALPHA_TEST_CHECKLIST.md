# Void Protocol Alpha Test Checklist

Use this checklist for a focused first-pass alpha. Record the build commit, core, room type, Companion, perks, void weapon, and any reproducible steps for every issue.

## 1. Startup and save compatibility
- [ ] Load the game with a fresh save. Main menu, settings, Codex, and world selection open without console errors.
- [ ] Load an existing save created before the Companion system existed. The save loads, the Companion system remains locked until its unlock condition, and unrelated progression remains intact.
- [ ] Refresh during a run and verify the existing resume/checkpoint flow still behaves as expected.
- [ ] Toggle SFX and music independently. Companion sounds respect the SFX setting.

## 2. Companion unlock, collection, and equipment
- [ ] Clear World 1 Room 9. Companion system remains locked.
- [ ] Clear World 1 Room 10. Unlock announcement appears once.
- [ ] Open Codex > Companions. Solace, Ruin, and Bastion descriptions and ownership states render correctly.
- [ ] Claim a Companion reward. Inventory updates and the reward can be equipped.
- [ ] Attempt to equip without ownership or while the system is locked. The action is rejected cleanly.
- [ ] Equip each Companion in turn, enter a new room, pause, resume, and refresh/checkpoint. Equipment remains correct.
- [ ] Confirm only one Companion is active and its orbit visual does not overlap menus or remain visible outside gameplay.

## 3. Solace: healing and protection
- [ ] At full HP, wait through several healing pulses. Excess healing creates a shield capped at 35% Max HP.
- [ ] Take damage below full HP. Healing restores HP and the room telemetry increases.
- [ ] Take damage with a shield active. Shield absorbs damage before HP is reduced.
- [ ] Drop below 35% HP. Sanctuary activates, shows its visual/audio feedback, heals over time, and reduces incoming damage.
- [ ] Confirm Sanctuary cannot retrigger before its 30-second cooldown expires.
- [ ] Check that healing is not counted above actual HP restored, while overflow is counted as shield rather than healing.

## 4. Ruin: damage and execution
- [ ] Confirm two homing projectiles launch at valid targets and disappear if their target dies or becomes invalid.
- [ ] Confirm hits apply Death Mark for four seconds and marked targets take increased damage.
- [ ] Test low-HP ordinary enemies. Final Judgment can execute them, but the chance-based behavior must not be guaranteed.
- [ ] Test bosses, minibosses, and singularity cores. None may be executed.
- [ ] Confirm a failed execution attempt deals fallback damage and does not make target HP negative.
- [ ] Verify fire, impact, and execution sounds are distinct and respect SFX settings.

## 5. Bastion: crowd control and barrier
- [ ] Confirm Seismic Strike damages nearby ordinary enemies and pushes them away from the core.
- [ ] Confirm bosses, minibosses, and singularity cores are not displaced.
- [ ] Receive a single hit below 15% Max HP. Bulwark does not trigger.
- [ ] Receive a single hit at or above 15% Max HP. Barrier triggers once, has 20% Max HP durability, and expires after up to 10 seconds.
- [ ] Confirm the barrier cannot trigger recursively and respects its 25-second cooldown.
- [ ] Verify shockwave and barrier audio/visual effects are readable during busy combat.

## 6. Room telemetry
Open the T room-statistics panel during combat. The six Companion metrics should reset at each room transition:
- [ ] Companion Damage: increases from Ruin and Bastion attacks.
- [ ] Companion Healing: increases only by actual HP restored by Solace.
- [ ] Companion Shield Absorbed: increases when Solace's shield or Bastion's barrier absorbs damage.
- [ ] Companion Damage Prevented: increases when equipped Companion defensive effects reduce an incoming hit.
- [ ] Companion Executions: increases only when Ruin successfully executes an eligible enemy.
- [ ] Companion Barrier Granted: records barrier durability granted by Bastion, not damage absorbed.
- [ ] No Companion activity leaves all Companion metrics at zero.
- [ ] Compare metrics over similar rooms and builds; do not compare raw totals from rooms with very different enemy counts or durations.

## 7. Regression sweep
- [ ] Test at least one room each of singularity, horde, defense, and cargo objectives.
- [ ] Test a miniboss and a major boss with each Companion equipped.
- [ ] Test transitions through portals, shops, level-up choices, pause/resume, death, and a new run.
- [ ] Confirm existing core attacks, E/Q skills, perks, Void Weapons, Nexus Fragments, and room objectives still work.
- [ ] Watch for stuck projectiles, stale shields, effects that survive a run reset, sound spam, frame-rate drops, and HUD overlap.
- [ ] Check desktop and narrow/mobile viewport layouts.

## 8. Defect report template
- Build/commit:
- Browser and OS:
- Core / Companion / room:
- Perks and Void Weapon:
- Steps to reproduce:
- Expected:
- Actual:
- Frequency:
- Screenshot or short recording:
- Console error (if any):

## Alpha exit criteria
Do not call the build ready for a broader test until startup/save compatibility, all three Companion kits, room telemetry resets, boss restrictions, and the regression sweep have been checked. CI/build success is necessary but does not replace browser gameplay testing.
