> English version of 后续更新参考.md

# 🧟 Zombie World — Future Update Reference

> This document is for my future self, potential collaborators, or sequel developers.
>
> If you're reading this document, it means someone still remembers this project.
> That's enough.

---

## A Word Before We Begin

First of all, when it comes to making games, I've always been a rookie — but I really love this project.
This project went through dozens of test version iterations, growing from a simple text adventure into a complete game with 85 weapons, 16 types of zombies, 12 endings, and 10+ quest chains.

It's not perfect, but it's complete.

There may not be high-frequency updates like before — but this document will stay here. Whether it's a week later, a year later, or five years later, when you want to come back and take a look, everything you need is right here.

Thanks to all the AI assistants who participated in this project — you were indispensable partners on this journey, giving me a lot of help and inspiration, and are the reason this project succeeded.

---

## 1. Small Content Packs Ready to Implement

> These contents don't require changes to the core architecture — just add entries to existing data files and a small amount of logic code.

### 1.1 Zombie King Narrative Completion Pack

**Problem**: The Zombie King "Silence" is the strongest regular BOSS in the game, but there's no special storyline after defeating it. The philosophical meaning of "Silence" is left unexplored.

**Suggestions**:
- After defeating, drop [Heart of Silence] (special item), triggering a monologue text
- The monologue hints that Silence was once human — perhaps the first director of the research institute
- The Heart of Silence can be given to Dr. Chen, unlocking a conversation about the origin of the virus
- Does not change any endings, just completes the narrative

**Files involved**: `maps.js` (post-defeat logic), `story-dialogues.js` (monologue text), `castle.js` (new special item)

### 1.2 Giant Puppet Origin Completion Pack

**Problem**: "Puppet" implies artificial creation, but this is never expanded upon in the game.

**Suggestions**:
- Add "Research Log" item to the Space Base (obtainable with probability during scavenging, 5 pages total)
- Log content reveals: Puppets are products of a pre-apocalypse military project, used to guard key facilities
- The last page of the log hints that the virus is related to military experiments
- Collecting all 5 pages and giving them to Dr. Chen unlocks additional dialogue

**Files involved**: `map-actions.js` (new scavenging option), `story-dialogues.js` (log text), `castle.js` (new item)

### 1.3 The Island NPC Quest Chain Pack

**Problem**: Gu Yue and Lin Han only have 7 dialogue lines each, no quest chains, and limited functionality.

**Suggestions**:

**Gu Yue Quest Chain (3 steps)**:
1. "The King's Medal" — Gu Yue wants to find a memento The King left on the island in his youth (must be found during island exploration)
2. "Test of Faith" — The Island encounters a zombie landing; Gu Yue questions why The King doesn't send reinforcements
3. "Her Own Light" — Gu Yue no longer blindly follows, starts working for the islanders instead of The King. Reward: The Island shop discount

**Lin Han Quest Chain (3 steps)**:
1. "Mystery of the Poisoned Fish" — Investigate why coastal fish suddenly became toxic (hinting that Doom Castle's virus research polluted the waters)
2. "Strange Sounds from the Deep" — Unexplained sounds come from the deep sea; Lin Han suspects they're related to Doom Castle's experiments
3. "Choose Your Side" — Lin Han demands you take a stand: loyal to The King, or loyal to the truth. Reward: Improved toxic fish processing efficiency

**Files involved**: `guyue.js`, `linhan.js` (new quest functions), `yumo-dialogues.js` (new dialogues), `castle.js` (new items)

### 1.4 Map Event Expansion Pack

**Problem**: Some maps have few interaction options, lacking a sense of exploration.

**Suggestions**:
- Abandoned Police Station: Add "Search the Archives" option, discover pre-apocalypse police zombie incident reports
- Underground Subway Tunnel: Add "Broadcast from the Depths" option, hear intermittent distress signals
- Military Checkpoint: Add "Veteran Zhao's Past" dialogue chain, learn the truth about pre-apocalypse military operations
- Industrial Park: Add "Traces on the Assembly Line" option, discover unidentified pharmaceuticals produced before the apocalypse

**Files involved**: `map-actions.js`, `map-dialogues.js`

---

## 2. Medium System Expansions

> These contents require adding some system logic, but don't require changes to the core architecture.

### 2.1 Combat Skill System

**Problem**: The combat system is too simple — melee/ranged binary choice, lacking strategic depth.

**Suggestions**:

**Melee Skills (3)**:
| Skill | Effect | Unlock Condition |
|-------|--------|-----------------|
| Power Strike | Single hit damage ×1.5, costs 2 turns | Kill 30 zombies with melee |
| Block | Damage taken this turn halved | Equip shield-type weapon |
| Combo Slash | Attack twice consecutively, each hit ×0.7 damage | Kill 80 zombies with melee |

**Ranged Skills (3)**:
| Skill | Effect | Unlock Condition |
|-------|--------|-----------------|
| Precision Shot | Hit rate +30%, costs 2 turns | Kill 30 zombies with ranged |
| Suppressive Fire | Zombie cannot attack this turn | Equip submachine gun / light machine gun |
| Headshot | Chance of instant kill (except BOSS) | Kill 80 zombies with ranged |

**Files involved**: `combat.js` (core changes), `state.js` (new skill state), `ui.js` (skill display)

### 2.2 Equipment Special Effects System

**Problem**: Weapons only have basic attributes like damage/durability/ammunition, lacking differentiation.

**Suggestions**:

| Special Effect | Effect | Applicable Weapon Examples |
|---------------|--------|---------------------------|
| Burn | Continuous damage for 3 turns after hit | Molotov cocktail, Flamethrower |
| Freeze | Chance to freeze for 1 turn after hit | Frost rounds, Cryo gun |
| Pierce | Ignore armor | Armor-piercing rounds, Sniper rifle |
| Knockback | Chance to knock back after hit | Shotgun |
| Infect | Increase Infection Value after hit | Poison blade, Corrosive rounds |
| Lifesteal | Recover a small amount of health after hit | Vampire Blade (new weapon) |

**Files involved**: `melee.js`/`ranged.js` (new special effect fields), `combat.js` (special effect trigger logic)

### 2.3 Base Building Narrativization

**Problem**: Base upgrades are just numerical changes, lacking narrative feedback.

**Suggestions**:
- Trigger a narrative text at each base upgrade level
- Level 3 base: A wanderer knocks on the door for help; choose to take them in or refuse (affects subsequent events)
- Level 4 base: The base encounters a small zombie horde, requiring defense (combat event)
- Level 5 base: The base becomes a small community; NPCs come to visit

**Files involved**: `base-actions.js`, `base-levels.js` (new narrative fields)

### 2.4 Fishing Depth Expansion

**Problem**: The fishing system has 5 rarity levels but lacks stories or uses for special fish species.

**Suggestions**:
- Add 3 legendary fish species, each with unique uses:
  - **Abyssal Lanternfish** — Glows, can replace flashlight for nighttime exploration
  - **Mutated Giant Crab** — Give to Lin Han to craft special armor
  - **Ghost Jellyfish** — Give to Dr. Chen to extract trace amounts of improved serum components
- Add "Night Fishing" mechanic: Different probabilities when fishing late at night; legendary fish only appear at night

**Files involved**: `fish.js` (new fish species), `fishing.js` (night fishing logic)

---

## 3. Large DLC-Level Expansions

> These contents require adding a large amount of code and data, equivalent to an expansion pack for the game.

### 3.1 DLC: Origin of the Virus

**Theme**: Revealing the true source of the zombie virus

**New Content**:
- **Underground Laboratory** (new map, Desperation level) — Located beneath The Island, entrance unlocked after completing Yu Mo's quest chain step 5
- **Research Archives** (new item series, 10 total) — Scattered across various maps; collect them all to piece together the complete truth
- **Patient Zero** (new BOSS) — A mutant in the deepest part of the laboratory, once a core member of the research team
- **Truth Ending** (13th ending) — Reveals the virus was an accidental leak from military experiments; choose to make the truth public or conceal it

**Core Storyline**:
```
The zombie virus originated from a military experiment codenamed "Rebirth"
  └→ Goal: Allow soldiers to self-repair wounds on the battlefield
  └→ Side effect: Repair goes out of control, cells multiply infinitely, consciousness fades
  └→ Patient Zero was the project's chief researcher, who voluntarily injected the first dose
  └→ She became the first zombie, and the strongest — older than Silence
  └→ The King of Doom Castle knows the truth (he funded the project before the apocalypse)
  └→ Dr. Chen also knows (he was a former member of the project)
```

**Files involved**: New `js/data/maps/underground-lab.js`, `js/island/underground.js`, modifications to multiple existing files

### 3.2 DLC: The Third Path

**Theme**: The Island breaks away from Doom Castle, becoming an independent force

**New Content**:
- **The Island Independence Route** — After reaching the soulmate stage with Duke Yu Mo, you can choose to support him in breaking away from Doom Castle
- **The Island Council** — New political system; players can participate in The Island's decision-making
- **Naval Battle System** — Doom Castle sends a fleet to suppress; must defend The Island
- **Island of Freedom Ending** (14th ending) — The Island becomes the first independent city-state in the apocalypse

**Core Storyline**:
```
Duke Yu Mo awakens
  └→ "I've guarded this island for so long — not for The King, but for the people on it."
  └→ The player helps Yu Mo establish independent defenses
  └→ Doom Castle sends a fleet to suppress → Naval defense battle
  └→ After success, The Island declares independence
  └→ "This island doesn't belong to The King, doesn't belong to anyone — it belongs to every person on it."
```

### 3.3 DLC: New Game+

**Theme**: Multi-playthrough inheritance system, reducing repetitive experience

**New Content**:
- **Playthrough Inheritance**: New playthrough inherits bonuses corresponding to the number of unlocked endings
  - 3 endings: Initial supplies +50%
  - 6 endings: Initial weapon upgrade
  - 9 endings: Unlock "Speedrun Mode" (time flow ×2)
  - 12 endings: Unlock "True Mode" (zombies are stronger, but drops are better)
- **New Playthrough Exclusive Events**: Special dialogues and events that appear from the second playthrough onward
- **Cross-Playthrough Achievements**: All endings achieved, all achievements completed, etc.

**Files involved**: `state.js` (inheritance logic), `save.js` (cross-playthrough data), `endings.js` (settlement logic)

---

## 4. Sequel Direction Suggestions

> If someone is willing to make a sequel, here are expandable directions based on the current worldbuilding.

### 4.1 "Zombie World 2: Rebuilding"

**Timeline**: 10 years after the New Force ending

**Core Gameplay**: Shift from survival to rebuilding — construct towns, manage population, enact laws, handle faction conflicts

**Key Settings**:
- Improved serum is mass-produced, but not all zombies can be cured
- "Awakened Zombies" fight for equal rights, causing social division
- New mutants appear — the virus continues to evolve over 10 years
- The player is the leader of the "New Force", facing not survival problems, but governance problems

### 4.2 "Zombie World: The Island"

**Timeline**: Parallel to the original

**Core Gameplay**: Island survival — limited resources, surrounded by sea, zombies landing from the ocean

**Key Settings**:
- The player is an ordinary resident on The Island, not Duke Yu Mo
- Experience island life from a grassroots perspective — Doom Castle's oppression, Yu Mo's struggles, islanders' daily life
- The ocean is a new dimension of exploration — diving, sailing, underwater ruins
- Final choice: Continue serving Doom Castle, follow Yu Mo to independence, or build your own boat and leave

### 4.3 "Zombie World: Zero"

**Timeline**: 3 days before the virus outbreak → The day of the outbreak

**Core Gameplay**: Countdown narrative — you know the apocalypse is coming, but what can you do?

**Key Settings**:
- The player is a former member of the "Rebirth" project
- Within 3 days: Warn colleagues, destroy data, escape the lab, or try to stop it
- Every choice affects the scale of the apocalypse
- Multiple endings: Successful prevention (small-scale leak), Failed prevention (original timeline), Accelerated leak (worse timeline)

---

## 5. Technical Debt and Optimization Directions

> If you're just doing optimization without adding new content, here are the points worth addressing.

### 5.1 Code Level

| Priority | Issue | Suggestion |
|----------|-------|------------|
| High | `maps.js` is nearly 2000 lines | Split into `map-events/` subdirectory, one file per map |
| High | Some modules have circular dependencies | Introduce event bus or dependency injection for decoupling |
| Medium | Dialogue text hardcoded in logic files | All dialogue text should be moved to `dialogues/` directory |
| Medium | Save format has no version number | Add `saveVersion` field for easier future migration |
| Low | Missing unit tests | At least add core logic tests for `state.js`, `combat.js` |

### 5.2 Performance Level

| Priority | Issue | Suggestion |
|----------|-------|------------|
| Medium | Large amount of DOM operations without virtual DOM | Consider introducing a lightweight reactive update mechanism |
| Low | Image/audio resources not preloaded | If multimedia content is added in the future, a preloading strategy is needed |
| Low | No Service Worker | Add SW to enable offline availability |

### 5.3 Experience Level

| Priority | Issue | Suggestion |
|----------|-------|------------|
| High | No tutorial | Add an optional guided walkthrough (first 3 days) |
| Medium | Combat log not intuitive enough | Add combat animations/icon feedback |
| Medium | Item management is cumbersome | Add batch use/batch discard functionality |
| Low | No sound effects | Add ambient and combat sound effects (can be disabled) |

---

## 6. Data File Quick Reference

> If you haven't touched this project in a while, this table helps you quickly recall where the data is.

| What You Want to Change | Where to Change It |
|--------------------------|-------------------|
| Weapon data | `js/data/weapons/melee.js` / `ranged.js` |
| Zombie data | `js/data/entities/zombies.js` |
| NPC data | `js/data/entities/npcs.js` |
| Map data | `js/data/maps/maps.js` |
| Map interactions | `js/data/maps/map-actions.js` |
| Medicines/Foods/Drinks | `js/data/items/medicines.js` / `foods.js` / `drinks.js` |
| Special items/Titles/The King's quests | `js/data/systems/castle.js` |
| Global parameters | `js/data/systems/constants.js` |
| Achievements/Ending stories | `js/data/systems/achievements.js` |
| Survival Notes | `js/data/systems/survival-notes.js` |
| Dialogue text | Files under `js/data/dialogues/` directory |
| Doom Castle dialogues | `js/data/dialogues/castle-dialogues.js` |
| Map NPC dialogues | `js/data/dialogues/map-dialogues.js` |
| Main storyline dialogues | `js/data/dialogues/story-dialogues.js` |
| Duke Yu Mo dialogues | `js/data/dialogues/yumo-dialogues.js` |
| Cheat codes | `js/cheats.js` + `tools/cheat_codes.csv` |
| Game state | `js/state.js` |
| Combat logic | `js/combat.js` |
| Map interaction logic | `js/maps.js` |
| Ending triggers | `js/game/endings.js` |
| NPC interaction logic | Files under `js/npcs/` directory |
| Doom Castle interaction logic | Files under `js/castle/` directory |
| The Island interaction logic | Files under `js/island/` directory |
| UI rendering | `js/ui.js` |
| Save system | `js/save.js` + `js/game/save.js` |

---

## 7. Acknowledgments

The birth and growth of this project could not have happened without the help of the following:

**AI Assistants** — Across dozens of version iterations, multiple AI assistants participated in code writing, bug fixing, architecture optimization, documentation writing, and more. They were tireless and patient — the most reliable partners of this project.

**Open Source Community** — The pure front-end, zero-dependency architecture choice was made possible by the continuous evolution of native browser capabilities. Thanks to everyone who contributed to Web standards.

**Text Adventure Game Tradition** — This project stands on the shoulders of countless predecessors. From Zork to Lifeline, from MUD to Fallout — the flame of text adventure games has never been extinguished.

**Every Player** — If you've played this game, no matter which ending you reached — thank you. Surviving in the apocalypse isn't easy, but you did it.

---

> *"A good game doesn't need a AAA engine — just good story and good design."*
>
> *"If one day you come back, this document will tell you: this project is still waiting for you."*
>
> 🧟 **Zombie World** — Survive the apocalypse. Being alive is victory.
