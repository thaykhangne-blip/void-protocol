# Companion System Foundation

This branch establishes data and persistence groundwork for the first three Companions: Solace, Ruin, and Bastion. It does **not** yet spawn Companions in combat or add the selection UI. Those pieces should be integrated against the existing runtime after this foundation is reviewed.

## Design decisions

- The Companion System unlocks after clearing room 10 of World 1.
- Campaign world IDs are zero-based, so World 1 is represented by `worldId: 0`.
- One Companion can be equipped at a time for the initial release.
- Companions are five-star Legendary rewards.
- Duplicate copies currently increase the owned copy count. Duplicate conversion/refinement is intentionally unspecified.
- Companions cannot be attacked or permanently lost during a run.
- Companion definitions live in `src/data/companions.js`.
- Save normalization, collection and equip helpers live in `src/systems/companions.js`.

## Current roster

| ID | Name | Role | Primary mechanic |
| --- | --- | --- | --- |
| `solace` | Solace | Healing / protection | Healing pulse, overflow shield, incoming-healing and damage modifiers, low-HP Sanctuary |
| `ruin` | Ruin | Single-target DPS / offensive support | Two homing projectiles, Death Mark, chance to execute non-boss targets below 25% HP |
| `bastion` | Bastion | Defense / crowd control | Seismic knockback for ordinary enemies, +25% DEF, Bulwark barrier |

Mechanics are currently declarative data. Runtime implementation must use the game's existing damage, HP, targeting, enemy identity, cooldown and shield systems. In particular, Ruin's execution must never execute bosses or singularity cores; Bastion must not knock back bosses or singularity cores; Solace's overflow shield must respect its 35% Max HP cap.

## Mystery-box odds

The overall Legendary chance remains 5%, split evenly between categories:

- 2.5%: five-star Legendary Void Weapon.
- 2.5%: five-star Legendary Companion.
- 12%: Unique Void Weapon.
- 33%: Rare Void Weapon.
- 50%: Nexus Fragments.

The Void Weapon milestone reward resolver records both weapon and Companion rewards in the existing pending reward queue. Existing milestone-claim protection remains shared, so a given milestone cannot be rerolled to fish for another reward.

## Save fields

```js
{
  companionInventory: {},       // { [companionId]: ownedCopyCount }
  equippedCompanionId: null,    // one active equipment slot
  companionSystemUnlocked: false
}
```

Old saves normalize to an empty inventory, no equipped Companion and a locked system.

## Integration sequence

1. Call `unlockCompanionSystemAfterClear(saveData, worldId, roomNumber)` from the room-clear flow when room 10 of World 1 is cleared, then persist the returned save data and show a one-time unlock announcement.
2. Add a Companion selection/equipment panel beside the existing Void Weapon collection UI. Display ownership, star rating, role, basic attack, passive, signature, and equipped state. Require `companionSystemUnlocked` before opening or equipping.
3. Wire the selected Companion into a dedicated runtime manager. Keep follow/orbit movement, target acquisition, basic attack timing and ability cooldowns separate from UI.
4. Integrate effects with shared combat helpers. Do not reimplement damage, healing, shield absorption, status effect or boss immunity calculations inside the Companion modules.
5. Render a small Companion sprite and signature effects using existing particle/rendering conventions. Avoid expensive per-frame timers or duplicated collision loops.
6. Add save migration coverage and regression tests for room transitions, death handling, boss restrictions and the mystery-box reward queue.

## Scope intentionally deferred

- Combat spawning, orbit/follow AI and target selection.
- Selection UI and HUD indicator.
- Calling the unlock helper from room-clear handling.
- Actual application of the declarative stats and abilities to combat.
- Duplicate conversion, refinement and Companion-specific gacha pity.
- Companion-specific artwork and sound effects.
