<div align="center">

# Void Protocol

**A little light, a lot of things trying to kill it, and a company that would rather cut the budget than admit it was wrong.**

[![Beta](https://img.shields.io/badge/status-beta-orange?style=for-the-badge)](https://github.com/thaykhangne-blip/void-protocol)
[![Version](https://img.shields.io/badge/version-v0.7.2-blue?style=for-the-badge)](https://github.com/thaykhangne-blip/void-protocol/commits/main)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow?style=for-the-badge&logo=javascript&logoColor=111111)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-e34f26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572b6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

[Source code](https://github.com/thaykhangne-blip/void-protocol) · [Report a bug](https://github.com/thaykhangne-blip/void-protocol/issues) · [Recent changes](https://github.com/thaykhangne-blip/void-protocol/commits/main)

</div>

---

## So, what is Void Protocol?

You’re a little living core of light dropped into a universe that has very clearly gone wrong. Fight through hostile rooms, break singularities, dodge things that should probably not have tentacles, and grab upgrades that turn a desperate run into a build that might actually survive.

Void Protocol is a browser-based action roguelike built around quick combat, distinct playable cores, elemental abilities, room-to-room choices, and increasingly nasty bosses. Between fights, there’s another problem waiting for you: V Corp, the company responsible for this mess, is determined to manage the disaster with budget cuts, corporate slogans, and the occasional wellness initiative.

The game is still in beta. Things will break, balance will change, and some ideas will turn out to be less clever once they meet actual gameplay. That’s part of making a game.

> **Current version:** Beta v0.7.2. This is an active work in progress, not a finished release.

## Recent changes

## v0.6 — Void Weapon balance and combat update

- Reworked Cinder Oath to fire fewer, smaller homing fireballs at higher refinement ranks.
- Changed Verdant Covenant's signature stat to Critical Damage.
- Reworked Blood Dividend to grant Max HP, increase damage below 50% HP, and scale final damage with health above that threshold.
- Updated Void Weapon data and refinement tests to match the revised passives.

## v0.6 — Campaign and interface update

- Added three linear story interludes between Worlds 1–3 and a final evidence-reconciliation epilogue after World 4.
- Expanded the Story Archive to include new campaign transmissions and replay support.
- Refined narrative presentation with speaker-specific colors, subtle transitions, and reduced-motion support.
- Removed the legacy toast notification system.
- Fixed gameplay edge controls: the floating back button is hidden during active runs, and the combat-statistics toggle is anchored to the right edge.
- Continued combat, core, room-objective, and progression tuning across the beta.

## What you can do

- **Explore four worlds.** Each one has its own look, threats, and slice of V Corp’s increasingly indefensible decisions.
- **Choose your core.** Eight cores bring different strengths, weaknesses, attacks, and abilities. The later cores are earned through campaign progress, including Vengeance, the Blood Reaver, unlocked by clearing World 2.
- **Build as you go.** Collect perks, combine upgrades, and evolve your core as the run gets harder.
- **Do more than survive a wave.** Rooms can ask you to destroy a singularity, defend a ship, deliver cargo, escort an evacuation, capture zones, hunt for keys in a maze, survive escalating attacks, or take on a high-risk challenge.
- **Take on tougher enemies and bosses.** Some rooms are a breather. Others are a reminder that the universe has a deeply personal issue with you.
- **Follow the story.** The Story Archive lets you revisit transmissions and internal memos as the bigger picture comes together.

## The mess V Corp made

V Corp invested its future in the Singularity Core, a supposedly limitless energy source that would make operating costs practically disappear. The launch went catastrophically wrong. Instead of owning the mistake, the company starts cutting the very people, tools, and support needed to contain it.

You play the Explorer, a field operations manager sent to clean up the fallout across four increasingly hostile worlds. The job description probably sounded better before the singularities started eating everything.

| World | What's going wrong |
| --- | --- |
| **Ashen Reach** | Emergency budget cuts leave the Explorer alone aboard a ship meant for a four-person crew. Efficiency, apparently. |
| **Cryo Archive** | Employees who warned about the Core are put into cryogenic storage, while somehow still counting toward headcount. |
| **Verdant Ruin** | Trained staff are replaced with a cheaper autonomous ecosystem. It grows out of control. Naturally. |
| **Event Horizon** | Leadership keeps pouring money into a failed investment and demands one last demonstration instead of admitting defeat. |

The story pokes fun at corporate jargon, wellness theatre, engagement surveys, and the magical accounting that makes a disaster look acceptable on a dashboard. Underneath the jokes is something less silly: people cannot keep compensating forever for missing staff, broken equipment, impossible deadlines, and leaders who refuse to take responsibility.

## Running the game

You’ll need a browser and a local web server. The game uses JavaScript modules, which some browsers won’t run properly if you simply open `index.html` from your file manager. Computers enjoy making simple things complicated.

Clone the repository:

```bash
git clone https://github.com/thaykhangne-blip/void-protocol.git
cd void-protocol
```

Start a local server. If Python is installed, this works:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Under the hood

Void Protocol is made with standard web technologies:

- **HTML5** for the page and interface structure
- **CSS3** for layouts, styling, and effects
- **JavaScript ES modules** for gameplay and game systems

The code is split into separate files rather than packed into one enormous HTML document, so systems can be worked on without turning every change into open-heart surgery.

## Where development stands

The current beta is **v0.7.2**. Combat, enemy behaviour, room objectives, core balance, visuals, progression, and story are all still being worked on. Expect rough edges. If something is broken, unfair, confusing, or unexpectedly hilarious, a clear bug report with steps to reproduce it is useful.

- [Report a bug or suggest a feature](https://github.com/thaykhangne-blip/void-protocol/issues)
- [Browse the source](https://github.com/thaykhangne-blip/void-protocol)
- [See recent changes](https://github.com/thaykhangne-blip/void-protocol/commits/main)
- [GitHub releases](https://github.com/thaykhangne-blip/void-protocol/releases) · [Tags](https://github.com/thaykhangne-blip/void-protocol/tags)

---

<div align="center">

*The universe is collapsing. Please submit your incident report before end of day.*

</div>


## Game source layout

The browser entry point is the generated `src/game.js` bundle. Edit the authored runtime bootstrap in `src/game-bootstrap.js` and the feature source fragments instead of hand-editing the generated bundle:

- `src/systems/combat.js`: attacks, damage, core skills, ultimates, and combat effects
- `src/systems/campaign.js`: world/run setup, encounter flow, rooms, objectives, and portals
- `src/systems/progression.js`: leveling, evolutions, perks, core setup, and upgrades
- `src/ui/menus.js`: menus, codex, pause/settings screens, shops, and upgrade dialogs
- `src/systems/runtime.js`: save/audio helpers, game updates, rendering, input, and tooltips

After editing the source fragments, run `npm run build` to regenerate `src/game.js`. Run `npm run check` to rebuild and check the generated bundle and source files. The fragments share the existing runtime closure; this keeps current game-state behavior intact while making feature ownership clearer.
