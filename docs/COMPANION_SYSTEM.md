# Companion System

The initial Companion collection, equipment UI, World 1 Room 10 unlock, and first combat runtime are implemented. Combat logic lives in `src/systems/companionRuntime.js`, a dedicated source fragment included by `scripts/build.js`; the generated `src/game.js` bundle is rebuilt from the canonical source fragments.

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

Combat implementation uses shared damage/healing metrics and the existing enemy arrays. Ruin's execution excludes bosses, minibosses and singularity cores; Death Mark lasts four seconds and increases damage taken by 25%. Bastion's shockwave cannot displace bosses, minibosses or singularity cores. Solace's overflow shield is capped at 35% Max HP, while Bastion's Bulwark barrier is 20% Max HP for up to 10 seconds.

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

## Runtime and UI

- The unified Codex has a **COMPANIONS** tab with ownership, descriptions, equipped state and five reserved future roster slots.
- Companion equipment persists in the existing save data. Only one Companion can be equipped.
- The Companion System unlocks after clearing World 1, Room 10, and displays a one-time announcement.
- A dedicated runtime manager handles companion orbit visuals, attack cooldowns, homing projectiles, Seismic Strike, healing, Death Mark, Sanctuary, Bulwark and shield absorption.
- Runtime projectiles are cleared on room transitions; combat cooldowns and collection ownership are not saved into the persistent inventory.
- The player HUD includes Companion shield and barrier values.

## Runtime balance notes

- **Solace:** every 2 seconds heals 2.5% Max HP plus 120% of its ATK, increased by its 25% incoming-healing passive. Excess healing creates a shield capped at 35% Max HP. While equipped, incoming damage is reduced by 25%. Below 35% HP, Sanctuary can trigger once per 30 seconds, reducing incoming damage by another 25% for 3 seconds and healing 10% Max HP over that duration.
- **Ruin:** fires two homing projectiles every 1.5 seconds. Hits apply a 4-second, 25% damage-taken mark. Below 25% HP, non-boss targets can be executed at 25% chance, or 35% while marked. Failed execution attempts deal fallback damage. Execution is explicitly excluded from bosses, minibosses and singularity cores.
- **Bastion:** releases a 90-radius shockwave every 1.5 seconds, dealing damage and displacing ordinary enemies only. Its passive grants a DEF bonus, with a minimum 8-point bonus when base DEF is low. A single incoming hit of at least 15% Max HP can trigger a 20% Max HP barrier for 10 seconds, with a 25-second cooldown.

## Verification

- `npm run check` rebuilds the modular bundle and runs JavaScript syntax/build validation.
- `npm run test:companions` covers collection normalization, equipment, unlocks, reward odds, transient combat state, Death Mark duration and execution restrictions.
- The legacy Void Weapon test suite has pre-existing failures; the Companion-specific suite is tracked separately.

## Scope intentionally deferred

- Additional Companion animation polish beyond the current procedural effects.
- More than one equipment slot.
- Companion duplicate conversion/refinement and dedicated pity mechanics.
- Dedicated Companion balance telemetry and full browser-level combat regression tests.
