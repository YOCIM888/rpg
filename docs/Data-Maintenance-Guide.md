English version of 数据维护指南.md

# 📋 Doomsday Survival Game — Data Maintenance Guide

## Core Principles

- **Game data is organized by module in the `js/data/` folder**, with each sub-module responsible for different types of data
- **`js/config.js` serves as the unified re-export entry point**, all data is exposed through `config.js`, other files only need to import from `config.js`
- After modifying data files under `js/data/`, refreshing the browser takes effect immediately
- Other files (`combat.js`, `maps.js`, `state.js`, etc.) do not need modification
- Adding new items only requires adding entries to the corresponding sub-module's array
- Some constants inside `config.js` and `utils.js` are automatically derived (e.g., `NURSE_MEDICINE_POOL`, `V_TRADE_AMMO_TYPES`, `BUILDING_MATERIAL_NAMES`, `BOSS_NAMES`), and update automatically after modifying source data

---

## 1. Data Folder Structure and Constants Overview

### 1.1 `js/data/` Folder Structure

| Path | Content | Included Constants |
|------|---------|-------------------|
| `js/data/items/` | Item data | FOODS, FRUITS, DRINKS, MEDICINES, CIGARETTES, BUILDING_MATERIALS, CROPS, BACKPACK_TYPES, LOOT_BACKPACKS |
| `js/data/weapons/` | Weapon data | MELEE_WEAPONS, RANGED_WEAPONS, AMMO |
| `js/data/entities/` | Entity data | ZOMBIES, NPCS, SURVIVOR_NPC, NAMED_NPCS, BOSS_NAMES |
| `js/data/maps/` | Map data | MAPS, MAP_ACTIONS |
| `js/data/dialogues/` | Dialogue data | OUTLAW_DIALOGUES, MECHANIC_DIALOGUES, WOLF_DIALOGUES, WAREHOUSE_GUARD_DIALOGUES, NERVOUS_VETERAN_DIALOGUES, MAP_NPC_INTROS, CASTLE_GUARD_DIALOGUES, CASTLE_KING_DIALOGUES, CASTLE_QUEEN_DIALOGUES, CASTLE_BANKER_DIALOGUES, CASTLE_GUARD_HIGH_DIALOGUES, CASTLE_KING_HIGH_DIALOGUES, CASTLE_QUEEN_HIGH_DIALOGUES, CASTLE_BANKER_HIGH_DIALOGUES, CASTLE_REJECTION_DIALOGUES, DOCTOR_INTRO, DOCTOR_DIALOGUES, ZOMBIE_KING_INTRO, NURSE_ZOMBIE_INTRO, LEADER_DIALOGUES, GUYUE_DIALOGUES, LINHAN_DIALOGUES, YUMO_DIALOGUES |
| `js/data/systems/` | System configuration | TIME_PHASES, GAME_CONSTANTS, DEFAULT_ITEM_IDS, AFFINITY_THRESHOLDS, AFFINITY_MAX, BASE_LEVELS, WAREHOUSE_LEVELS, CASTLE_RANKS, KING_QUESTS, SPECIAL_ITEMS, TRADER_WEAPON_SHOP, FIXED_LOOT_DROPS, TRADE_TEMPLATES, ACHIEVEMENTS, ENDING_STORIES, SURVIVAL_NOTES |
| `js/data/utils.js` | Utility data | CANNED_FOOD_IDS, TOOL_WEAPON_IDS, V_TRADE_AMMO_TYPES, LILI_REWARD_MEDICINE_IDS, XIAOHAN_REWARD_FOOD_IDS |

### 1.2 Constants List

Listed in the order they appear in the code, all `export` constants and their purposes:

| # | Constant Name | Type | Entry Count | Purpose |
|---|---------------|------|-------------|---------|
| 1 | `TIME_PHASES` | Array | 8 | 8 time phases in a day |
| 2 | `FOODS` | Array | 19 | Food list |
| 3 | `FRUITS` | Array | 11 | Fruit list |
| 4 | `DRINKS` | Array | 12 | Drink list |
| 5 | `MEDICINES` | Array | 14 | Medicines list |
| 6 | `NURSE_MEDICINE_POOL` | Array (auto-derived) | 6 | Nurse zombie medicine pool, automatically filtered from `MEDICINES` for `common`+`uncommon` |
| 7 | `CIGARETTES` | Array | 5 | Cigarettes list |
| 8 | `BUILDING_MATERIALS` | Array | 6 | Building materials list |
| 9 | `CROPS` | Array | 15 | Crop list |
| 10 | `MELEE_WEAPONS` | Array | 39 | Melee Weapons list (includes fists) |
| 11 | `RANGED_WEAPONS` | Array | 44 | Ranged Weapons list |
| 12 | `AMMO` | Array | 13 | Ammo list |
| 13 | `ZOMBIES` | Array | 16 | Zombie list |
| 14 | `NPCS` | Object | 4 | Encounter NPC templates (Wanderer/Scarface/Black Market Trader/Post-apocalyptic Doctor) |
| 15 | `SURVIVOR_NPC` | Array | 3 | Haven Outpost NPC full configuration (Miss V/Su Xiaohan/Lili) |
| 16 | `OUTLAW_DIALOGUES` | Array | 15 | Outlaw dialogues |
| 17 | `MECHANIC_DIALOGUES` | Array | 5 | Mechanic dialogues |
| 18 | `WOLF_DIALOGUES` | Array | 5 | Wolf dialogues |
| 19 | `WAREHOUSE_GUARD_DIALOGUES` | Array | 5 | Warehouse guard dialogues |
| 20 | `NERVOUS_VETERAN_DIALOGUES` | Array | 5 | Nervous veteran dialogues |
| 21 | `DOCTOR_INTRO` | String | 1 | Dr. Chen intro text |
| 22 | `DOCTOR_DIALOGUES` | Array | 5 | Dr. Chen dialogues |
| 23 | `ZOMBIE_KING_INTRO` | String | 1 | Zombie King intro text |
| 24 | `BACKPACK_TYPES` | Object | 14 | All backpack type definitions |
| 25 | `LOOT_BACKPACKS` | Array | 14 | Droppable backpack list (with rarity) |
| 26 | `MAPS` | Array | 22 | Map list (with loot tables) |
| 27 | `CASTLE_GUARD_DIALOGUES` | Array | 5 | Castle guard dialogues |
| 28 | `CASTLE_KING_DIALOGUES` | Array | 5 | Castle king dialogues |
| 29 | `CASTLE_QUEEN_DIALOGUES` | Array | 5 | Castle queen dialogues |
| 30 | `CASTLE_BANKER_DIALOGUES` | Array | 5 | Castle banker dialogues |
| 31 | `NURSE_ZOMBIE_INTRO` | String | 1 | Nurse zombie intro text |
| 32 | `CANNED_FOOD_IDS` | Array | 8 | Canned food ID list |
| 33 | `SPECIAL_ITEMS` | Object | 18 | Special Items (Noble ID card/Dawn badge/Silence badge/Level 6 noble rank badge/Dawn Captain badge/Farming Master badge/Miaomiao's diary/Strange voice recorder/Letter to sister/The Queen's reply/Love token/Castle pass/Car key, etc.) |
| 34 | `BASE_LEVELS` | Array | 5 | Haven Outpost building levels |
| 35 | `WAREHOUSE_LEVELS` | Array | 8 | Warehouse levels (index 0 is null) |
| 36 | `AFFINITY_THRESHOLDS` | Array | 5 | Affinity stage thresholds |
| 37 | `AFFINITY_MAX` | Object | 5 | Each NPC's Affinity cap |
| 38 | `NAMED_NPCS` | Object | 5 | BOSS configuration (Ma San/Shadow/Zombie King/Bank Director/Outpost Leader) |
| 39 | `BOSS_NAMES` | Array (auto-derived) | 5 | BOSS name list, automatically derived from `NAMED_NPCS` |
| 40 | `GAME_CONSTANTS` | Object | 22 groups | Global game parameters (includes CRASH_MAX/INFECTION_MAX/MAX_HEALTH/TURNS_PER_DAY top-level constants) |
| 41 | `TOOL_WEAPON_IDS` | Array | 4 | Tool weapon IDs |
| 42 | `V_TRADE_AMMO_TYPES` | Array (auto-derived) | 11 | Miss V trade ammo types, automatically filtered from `AMMO` excluding arrows |
| 43 | `TRADER_WEAPON_SHOP` | Array | 6 | Black market trader weapon shop list + prices |
| 44 | `FIXED_LOOT_DROPS` | Object | 7 | Fixed drop configuration |
| 45 | `BUILDING_MATERIAL_NAMES` | Object (auto-derived) | 6 | Building material ID→name mapping, automatically generated from `BUILDING_MATERIALS` |
| 46 | `TRADE_TEMPLATES` | Array | 4 | Trade templates |
| 47 | `SURVIVAL_NOTES` | Array | 7 | Survival Notes (7 categories, 25 tips total) |
| 48 | `ACHIEVEMENTS` | Array | 19 | Achievement list |
| 49 | `ENDING_STORIES` | Object | 7 | Ending story texts |
| 50 | `DEFAULT_ITEM_IDS` | Object | 5 | Default item IDs |
| 51 | `LILI_REWARD_MEDICINE_IDS` | Array | 4 | Lili reward medicine pool |
| 52 | `XIAOHAN_REWARD_FOOD_IDS` | Array | 3 | Su Xiaohan reward food pool |
| 53 | `MAP_ACTIONS` | Object | 23 | Map action routing (data-driven) |
| 54 | `LEADER_DIALOGUES` | Array | 5 | Outpost Leader dialogues |
| 55 | `MAP_NPC_INTROS` | Object | 13 | Map NPC intro texts |
| 56 | `CASTLE_REJECTION_DIALOGUES` | Object | 3 | Castle rejection dialogues (Miss V/Su Xiaohan/Lili) |
| 57 | `CASTLE_GUARD_HIGH_DIALOGUES` | Array | 5 | Castle guard (high noble rank) dialogues |
| 58 | `CASTLE_KING_HIGH_DIALOGUES` | Array | 5 | Castle king (high noble rank) dialogues |
| 59 | `CASTLE_QUEEN_HIGH_DIALOGUES` | Array | 5 | Castle queen (high noble rank) dialogues |
| 60 | `CASTLE_BANKER_HIGH_DIALOGUES` | Array | 5 | Castle banker (high noble rank) dialogues |
| 61 | `CASTLE_RANKS` | Array | 6 | Castle Noble Ranks |
| 62 | `KING_QUESTS` | Array | 5 | King Quests chain |

---

## 2. Common Operations Guide

### 2.1 Adding a New Food

Add an entry at the end of the `FOODS` array.

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier, globally unique |
| `name` | string | ✅ | Display name |
| `type` | string | ✅ | Fixed as `"food"` |
| `hunger` | number | ✅ | Hunger restoration value |
| `hydration` | number | ❌ | Hydration restoration value; omit if no hydration restoration |

**Example: Adding "Braised Pork"**

```js
// Add at the end of the FOODS array
{ id: "红烧肉", name: "红烧肉", type: "food", hunger: 50, hydration: 10 },
```

After adding, the cheat system automatically supports the `/get_food_红烧肉_10` format. The `food` type in map loot tables will automatically include the new food.

---

### 2.2 Adding a New Melee Weapon

Add an entry at the end of the `MELEE_WEAPONS` array.

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier |
| `name` | string | ✅ | Display name |
| `type` | string | ✅ | Fixed as `"melee"` |
| `damage` | number | ✅ | Base damage value |
| `durability` | number | ✅ | Maximum durability (`Infinity` for fists) |
| `rarity` | string | ❌ | Rarity: `common`/`uncommon`/`rare`/`epic`/`legendary`; fists have no this field |
| `comboRate` | number | ✅ | Combo probability (0~1) |

**Example: Adding "Chainsaw Sword"**

```js
{ id: "链锯剑", name: "链锯剑", type: "melee", damage: 110, durability: 90, rarity: "epic", comboRate: 0.16 },
```

**Rarity and Combo Rate Correspondence:**

| Rarity | Combo Rate | Damage Range Reference |
|--------|------------|----------------------|
| common | 0.05 | 30~48 |
| uncommon | 0.08 | 40~70 |
| rare | 0.12 | 66~90 |
| epic | 0.15 | 99~105 |
| legendary | 0.18 | 118+ |

---

### 2.3 Adding a New Ranged Weapon

Adding a ranged weapon requires **paying attention to ammo association** at the same time. Steps are as follows:

**Step 1: Add the weapon to `RANGED_WEAPONS`**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier |
| `name` | string | ✅ | Display name |
| `type` | string | ✅ | Fixed as `"ranged"` |
| `damage` | number | ✅ | Base damage value |
| `integrity` | number | ✅ | Integrity (usually 100) |
| `ammoType` | string | ✅ | Ammo type used, must correspond to an ammo `id` in `AMMO` |
| `critRate` | number | ✅ | Critical hit probability (0~1) |
| `rarity` | string | ✅ | Rarity |

**Step 2: If a new ammo type is needed, add ammo to `AMMO`**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Ammo unique identifier |
| `name` | string | ✅ | Display name |
| `type` | string | ✅ | Fixed as `"ammo"` |
| `compatibleWith` | string[] | ✅ | List of compatible weapon IDs |

**Step 3: If using existing ammo, add the new weapon ID to the corresponding ammo's `compatibleWith` array**

**Example: Adding "SCAR-H" (using existing ammo 7.62×51mm)**

```js
// 1. Add at the end of RANGED_WEAPONS
{ id: "SCAR-H", name: "SCAR-H", type: "ranged", damage: 85, integrity: 100, ammoType: "7.62×51mm", critRate: 0.28, rarity: "rare" },

// 2. Find "7.62×51mm" in AMMO, add "SCAR-H" to the compatibleWith array
{ id: "7.62×51mm", name: "7.62×51mm", type: "ammo", compatibleWith: ["M700", "FAL", "EBR14", "SR25", "SCAR-H"] },
```

**Example: Adding "SCAR-H" (using brand new ammo 7.62×51mm NATO)**

```js
// 1. Add at the end of RANGED_WEAPONS
{ id: "SCAR-H", name: "SCAR-H", type: "ranged", damage: 85, integrity: 100, ammoType: "7.62×51mm NATO", critRate: 0.28, rarity: "rare" },

// 2. Add new ammo at the end of AMMO
{ id: "7.62×51mm NATO", name: "7.62×51mm NATO", type: "ammo", compatibleWith: ["SCAR-H"] },
```

**Critical Rate Reference (by weapon category):**

| Weapon Category | Crit Rate Range | Ammo Type |
|-----------------|----------------|-----------|
| Bow/Crossbow | 0 | Arrows |
| Pistol | 0.15~0.20 | 9×19mm / .357 Magnum |
| SMG | 0.18~0.23 | 9×19mm |
| Rifle (5.56) | 0.22~0.25 | 5.56×45mm NATO |
| Rifle (7.62×39) | 0.20~0.28 | 7.62×39mm |
| Battle Rifle (7.62×51) | 0.22~0.32 | 7.62×51mm |
| Sniper Rifle | 0.35~0.45 | 7.62×51mm / .300 Win Mag |
| Shotgun | 0.10~0.12 | 12-gauge shell |

---

### 2.4 Adding/Modifying Backpacks

Modifying backpacks requires maintaining both the `BACKPACK_TYPES` and `LOOT_BACKPACKS` arrays simultaneously.

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier, same as `name` |
| `name` | string | ✅ | Display name |
| `type` | string | ✅ | Fixed as `"backpack"` (in `BACKPACK_TYPES` it's the specific backpack name) |
| `capacity` | number | ✅ | Backpack capacity (slots) |
| `rarity` | string | ❌ | Rarity, only needed in `LOOT_BACKPACKS` |

#### `BACKPACK_TYPES` — All Backpack Type Definitions

Serves as the complete dictionary for backpacks. **All available backpacks** are registered here. The new game's starting backpack is also selected from here.

```js
export const BACKPACK_TYPES = {
  口袋: { id: "口袋", name: "口袋", type: "口袋", capacity: 15 },
  // ... existing backpacks
};
```

**Addition Example:**

```js
// Add a new entry in BACKPACK_TYPES
  轻型战术包: { id: "轻型战术包", name: "轻型战术包", type: "轻型战术包", capacity: 38 },
```

#### `LOOT_BACKPACKS` — Droppable Backpack List

Controls which backpacks can drop as loot, and their respective rarity weights.

**Addition Example:**

```js
// Add at the end of LOOT_BACKPACKS
{ id: "轻型战术包", name: "轻型战术包", type: "backpack", capacity: 38, rarity: "rare" },
```

**⚠️ Important Notes:**

1. **Both arrays must be synchronized**: If you only add to `LOOT_BACKPACKS` but not to `BACKPACK_TYPES`, the new backpack may not be correctly recognized when added to the player's backpack.
2. **`id` and `name` must match**: The backpack's `id` and `name` must be the same; this is a game logic convention.
3. **New backpacks are automatically included in drops**: After adding to `LOOT_BACKPACKS`, all maps with `backpack` in their `lootTable` will randomly drop the new backpack; no other files need modification.
4. **Capacity recommendation ranges:**

| Rarity | Capacity Reference |
|--------|-------------------|
| common | 20~24 |
| uncommon | 28~32 |
| rare | 36~42 |
| epic | 48~56 |

---

### 2.5 Modifying BOSS Drops

Modify the corresponding entry in `FIXED_LOOT_DROPS`.

**Current Fixed Drops Overview:**

| Key Name | Source | Current Drop |
|----------|--------|-------------|
| `banker_kill` | Kill Bank Director | Katana (Melee) |
| `leader_gift` | Outpost Leader gift | Tang Hengdao (Melee) |
| `doctor_trade` | Dr. Chen trade | M700 + 7.62×51mm×30 |
| `outlaw_kill` | Kill Ma San | AK47 + 7.62×39mm×30 |
| `shadow_kill` | Kill Shadow | GP100 + .357 Magnum×20 |
| `space_crate` | Space base crate | AWM + .300 Win Mag×30 |
| `tunnel_cache` | Tunnel cache | 9×19mm×20 + Compressed Biscuits |

**Example: Change Ma San's drop from AK47 to HK416**

```js
outlaw_kill: { weaponId: "HK416", type: "ranged", ammoId: "5.56×45mm NATO", ammoCount: 30 },
```

**Example: Change Bank Director's drop to a ranged weapon**

```js
banker_kill: { weaponId: "EBR14", type: "ranged", ammoId: "7.62×51mm", ammoCount: 30 },
```

**Note:** The `type` field determines which array to search for the weapon: `"melee"` searches `MELEE_WEAPONS`, `"ranged"` searches `RANGED_WEAPONS`. If the drop includes ammo, `ammoId` must correspond to an `id` in `AMMO`.

---

### 2.6 Modifying Black Market Trader's Shop

Add or remove entries in `TRADER_WEAPON_SHOP`.

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `weaponId` | string | Weapon ID, must exist in `MELEE_WEAPONS` or `RANGED_WEAPONS` |
| `type` | string | `"melee"` or `"ranged"` |
| `costMin` | number | Minimum Cigarettes price |
| `costMax` | number | Maximum Cigarettes price |

**Example: Adding a new item "Small Dagger"**

```js
{ weaponId: "小匕首", type: "melee", costMin: 3, costMax: 5 },
```

**Example: Adding "MP5" ranged weapon**

```js
{ weaponId: "MP5", type: "ranged", costMin: 15, costMax: 20 },
```

---

### 2.7 Modifying Map Drop Probabilities

Adjust weights in the `lootTable` of `MAPS`. Weights are relative values and don't need to sum to 100, but it's customary to total 100 for easier understanding.

**Available lootTable keys:**

| Key | Description | Data Source |
|-----|-------------|-------------|
| `food` | Food | `FOODS` |
| `drink` | Drinks | `DRINKS` |
| `fruit` | Fruits | `FRUITS` |
| `cigarette` | Cigarettes | `CIGARETTES` |
| `medicine` | Medicines | `MEDICINES` (weighted by rarity) |
| `backpack` | Backpacks | `LOOT_BACKPACKS` (weighted by rarity) |
| `melee` | Melee Weapons | `MELEE_WEAPONS` (excluding fists, weighted by rarity) |
| `ranged` | Ranged Weapons | `RANGED_WEAPONS` (weighted by rarity) |
| `ammo` | Ammo | `AMMO` (higher arrow probability in low-danger maps) |
| `building` | Building materials | `BUILDING_MATERIALS` |
| `empty` | No drop | — |

**Example: Increase ranged weapon drop rate for "Abandoned Police Station"**

```js
// Original
{ id: "废弃警察局", name: "废弃警察局", danger: "★★★★高危", encounterRate: 0.55,
  lootTable: { melee: 15, ranged: 15, ammo: 25, medicine: 10, backpack: 10, fruit: 10, food: 5, drink: 5, empty: 5 } },

// Modified: increase ranged weapon weight to 25, decrease ammo to 15
{ id: "废弃警察局", name: "废弃警察局", danger: "★★★★高危", encounterRate: 0.55,
  lootTable: { melee: 15, ranged: 25, ammo: 15, medicine: 10, backpack: 10, fruit: 10, food: 5, drink: 5, empty: 5 } },
```

---

### 2.8 Adjusting Game Balance

Modify in `GAME_CONSTANTS`, which includes the following sub-categories:

#### Global Caps

```js
CRASH_MAX: 100,              // Crash Value cap (crash >= this value means character crashes, unable to fight/eat/drink/sleep)
INFECTION_MAX: 100,          // Infection Value cap (infection >= this value means character dies)
```

#### Survival Parameters (`SURVIVAL`)

```js
SURVIVAL: {
  HUNGER_DECAY: 4,              // Hunger decay per turn
  HYDRATION_DECAY: 4,           // Hydration decay per turn
  CRASH_THRESHOLD_TURNS: 16,    // Crash cycle (triggers crash growth every 16 turns)
  CRASH_PER_CYCLE: 20,          // Crash growth per cycle
  STARVATION_DAMAGE: 10,        // Damage from starvation/dehydration
  INFECTION_THRESHOLD: 50,      // Infection danger threshold
  CRASH_STATUS_THRESHOLD: 50,   // Crash danger threshold
  SEVERE_INJURY_THRESHOLD: 30,  // Severe injury threshold
},
```

#### Combat Parameters (`COMBAT`)

```js
COMBAT: {
  FLEE_RATE: 0.25,                // Flee success rate
  FLEE_RATE_TEXT: "逃跑（25%）",    // Flee button text (derived from FLEE_RATE)
  RANGED_DODGE_RATE: 0.6,         // Ranged weapon dodge rate
  LIURUYAN_ASSIST_DAMAGE: 20,     // Miss V assist damage
  LIURUYAN_ASSIST_RATE: 0.3,      // Miss V assist trigger rate
  NPC_RANGED_TRIGGER_RATE: 0.4,   // NPC ranged weapon usage probability
  INFECTION_ON_HIT: 2,            // Infection Value increase when hit by zombie
  SUMMONED_ZOMBIE_DAMAGE: 8,      // Summoned zombie damage
  NURSE_HEAL_AFTER_COMBAT: 20,    // Nurse post-combat healing amount
  // Zombie ability parameters
  ABILITY_SCREECH_CRASH: 5,       // Screech crash growth
  ABILITY_TRIP_SKIP_RATE: 0.3,    // Trip skip turn probability
  ABILITY_BLIND_MISS_RATE: 0.5,   // Blind miss rate
  ABILITY_LEAP_DAMAGE_MULT: 0.6,  // Leap damage multiplier
  ABILITY_CLOAK_COUNTER_MULT: 0.5,// Cloak counter multiplier
  ABILITY_ARMOR_MULT: 0.5,        // Armor damage reduction multiplier
  ABILITY_CORRODE_DURABILITY: 5,  // Corrode melee durability
  ABILITY_CORRODE_INTEGRITY: 5,   // Corrode ranged integrity
  ABILITY_ACID_DAMAGE_MIN: 15,    // Acid minimum damage
  ABILITY_ACID_DAMAGE_MAX: 24,    // Acid maximum damage
  ABILITY_CLOAK_AMBUSH_RATE: 0.4, // Cloak ambush probability
  ABILITY_CLOAK_AMBUSH_MULT: 0.8, // Cloak ambush damage multiplier
  ABILITY_EXPLOSIVE_MULT: 2,      // Explosive damage multiplier
  // Loot parameters
  ZOMBIE_LOOT_DROP_RATE: 0.5,     // Zombie drop rate
  ZOMBIE_LOOT_FOOD_RATE: 0.5,     // Zombie food drop probability
  NPC_LOOT_DROP_RATE: 0.8,        // NPC drop rate
  TRADER_CIG_DROP_MIN: 2,         // Trader Cigarettes drop minimum
  TRADER_CIG_DROP_MAX: 5,         // Trader Cigarettes drop maximum
  // NPC combat parameters
  NPC_RANGED_OPENING_DAMAGE_MIN: 10, // NPC ranged opening minimum damage
  NPC_RANGED_OPENING_DAMAGE_MAX: 24, // NPC ranged opening maximum damage
  DEFAULT_NPC_DODGE_RATE: 0.2,       // NPC default dodge rate
  RANGED_INTEGRITY_LOSS: 5,          // Ranged weapon integrity loss per hit
  RANGED_SHOT_INTEGRITY_LOSS: 1,   // Ranged shot integrity consumption (-1 per shot)
},
```

#### Map Event Damage (`MAP_EVENTS`)

```js
MAP_EVENTS: {
  FACTORY_EXPLOSION_DAMAGE: 120,      // Factory explosion damage
  VETERAN_MISFIRE_DAMAGE: 40,         // Veteran misfire damage
  TUNNEL_COLLAPSE_DAMAGE: 80,         // Tunnel collapse damage
  TUNNEL_GAS_DAMAGE: 40,              // Tunnel gas damage
  TUNNEL_GAS_INFECTION: 10,           // Tunnel gas Infection Value
  TUNNEL_ZOMBIE_SWARM_DAMAGE: 60,     // Tunnel zombie swarm damage
  FOOD_LOCKER_HUNGER_RESTORE: 30,     // Food locker hunger restoration
  FOOD_LOCKER_HYDRATION_RESTORE: 30,  // Food locker hydration restoration
  FOOD_LOCKER_BAD_FOOD_CRASH: 44,     // Spoiled food Crash Value
  POLICE_TRAP_DAMAGE: 50,             // Police station trap damage
  // Additional map event parameters
  TOWER_CRASH_REDUCTION: 10,          // Watchtower crash reduction
  FRUIT_REGROW_DAYS: 3,              // Fruit regrowth days
  FRUIT_PICK_COUNT: 3,               // Fruit pick count
  CAVE_CIG_RATE: 0.1,                // Cave Cigarettes discovery probability
  CORPSE_COOLDOWN_DAYS: 3,           // Corpse looting cooldown days
  FOOD_LOCKER_GOOD_RATE: 0.3,        // Food locker good food probability
  WOLF_TRADE_FOOD_COST: 3,           // Old Wolf trade food cost
  FACTORY_EXPLOSION_RATE: 0.3,       // Factory explosion probability
  RIVER_CRASH_REDUCTION: 10,         // Riverside crash reduction
  WAREHOUSE_BUILDING_COST: 10,       // Warehouse building material cost
  POLICE_TRAP_RATE: 0.7,             // Police station trap probability
  POLICE_AMMO_MIN: 3,                // Police station ammo minimum
  POLICE_AMMO_MAX: 8,                // Police station ammo maximum
  VETERAN_MISFIRE_RATE: 0.5,         // Veteran misfire probability
  VETERAN_AMMO_GIVE_RATE: 0.5,       // Veteran gives ammo probability
  VETERAN_AMMO_MIN: 3,               // Veteran ammo minimum
  VETERAN_AMMO_MAX: 7,               // Veteran ammo maximum
  TUNNEL_CACHE_RATE: 0.15,           // Tunnel cache probability
  TUNNEL_COLLAPSE_RATE: 0.5,         // Tunnel collapse probability
  TUNNEL_GAS_RATE: 0.8,              // Tunnel gas probability
  SPACE_CRATE_RATE: 0.05,            // Space base crate probability
},
```

#### Castle Parameters (`CASTLE`)

```js
CASTLE: {
  WORK_HUNGER_COST: 18,          // Work hunger cost
  WORK_HYDRATION_COST: 18,       // Work hydration cost
  WORK_CRASH_GAIN: 40,           // Work Crash Value growth
  BALL_CRASH_REDUCTION: 50,      // Ball crash reduction
  ROOM_HEALTH_RESTORE: 50,       // Room health restoration
  NOBLE_ID_COST: 25,             // Noble ID card price
  LOAN_TERM_DAYS: 10,            // Loan term (days)
  MERCY_EXTENSION_DAYS: 5,       // Grace period (days)
  // Additional castle parameters
  BANQUET_HUNGER_RESTORE: 50,    // Banquet hunger restoration
  BANQUET_HYDRATION_RESTORE: 50, // Banquet hydration restoration
  GARDEN_MEDICINE_RATE: 0.3,     // Garden medicine discovery probability
  GARDEN_MEDICINE_COUNT: 3,      // Garden medicine count
  TREATMENT_AMOUNTS: [10, 30, 50, 80],   // Treatment amounts (by Noble Ranks)
  TREATMENT_RANKS: [3, 4, 5, 6],         // Treatment corresponding ranks
  MEETING_RANK_REQUIRED: 5,     // Minimum rank required to attend meeting
  GARDEN_RANK_REQUIRED: 6,      // Minimum rank required to enter back garden
  BANQUET_TIME_COST: 2,         // Banquet time phase cost
  BALL_TIME_COST: 2,            // Ball time phase cost
  ROOM_TIME_COST: 3,            // Room rest time phase cost
  MEETING_TIME_COST: 2,         // Meeting time phase cost
},
```

#### Doctor Parameters (`DOCTOR`)

```js
DOCTOR: {
  HEAL_AMOUNT: 120,                  // Healing health restoration
  PSYCHOLOGY_CRASH_REDUCTION: 30,    // Psychology treatment crash reduction
  TREATMENT_ITEM_COST: 5,            // Treatment item cost
  PSYCHOLOGY_FOOD_COST: 3,           // Psychology treatment food cost
  SERUM_TRADE_COST: 50,              // Serum trade cost (Cigarettes)
},
```

#### Rocket Parameters (`ROCKET`)

```js
ROCKET: {
  QUEST2_ENERGY_COST: 15,              // Rocket quest 2 pure energy requirement (originally 30, reduced)
  QUEST3_MEDICINE_COST: 10,            // Rocket quest 3 medical item requirement
  QUEST3_FOOD_COST: 10,                // Rocket quest 3 food requirement
  QUEST3_DRINKS_COST: 10,              // Rocket quest 3 drinks requirement
  IMPROVED_SERUM_INFECTION_REDUCTION: 90, // Improved serum infection reduction
  HOPE_AFFINITY_REQUIRED: 150,         // Hope ending required Affinity
  DISMANTLE_WEAPON_ID: "大扳手",       // Weapon needed to dismantle nuclear power
  DISMANTLE_BACKPACK_ID: "次元收纳背包", // Backpack needed to dismantle nuclear power
  AWM_ID: "AWM",                       // AWM weapon ID
},
```

#### The Island Parameters (`ISLAND`)

```js
ISLAND: {
  REST_HEALTH_RESTORE: 30,           // The Island rest health restoration
  REST_CRASH_REDUCTION: 30,          // The Island rest crash reduction
  REST_TIME_COST: 4,                 // The Island rest time phase cost
  YACHT_GASOLINE_COST: 1,            // Yacht Gasoline cost
  YACHT_TIME_COST: 8,                // Yacht time phase cost
},
```

#### Fishing Parameters (`FISHING`)

```js
FISHING: {
  CATCH_RATE: 0.6,                   // Fishing success rate
  CATCH_COUNT_MIN: 1,                // Minimum catch count
  CATCH_COUNT_MAX: 3,                // Maximum catch count
},
```

#### Yu Mo Duke Parameters (`YUMO`)

```js
YUMO: {
  TRADE_ROYAL_COIN_COST: 5,          // Yu Mo trade Royal Coins cost
  LOAN_INTEREST_RATE: 0.1,           // The Island bank interest rate
  LOAN_TERM_DAYS: 30,                // The Island bank repayment term
  LOAN_OVERDUE_PENALTY: 0.1,         // The Island bank overdue penalty rate
},
```

#### Weather Probabilities (`WEATHER`)

```js
WEATHER: {
  PROBABILITIES: { 晴天: 0.40, 阴天: 0.30, 雨天: 0.10, 酷暑: 0.05, 大雾: 0.05, 酸雨: 0.05, 沙暴: 0.05 },
  EFFECTS: {
    雨天: { crash: 2 },       // Rainy day increases Crash Value
    酷暑: { hydration: -5 },  // Extreme heat extra hydration consumption
    沙暴: { health: -2 },     // Sandstorm health loss
  },
},
```

#### Encounter Parameters (`ENCOUNTER`)

```js
ENCOUNTER: {
  NPC_RATE: 0.1,                                                    // NPC encounter rate
  NPC_DISTRIBUTION: { survivor: 0.6, wanderingTrader: 0.2, doctor: 0.1, bandit: 0.1 },  // NPC type distribution
},
```

#### Sleep Parameters (`SLEEP`)

```js
SLEEP: {
  CRASH_REDUCTION_MIN: 10,       // Crash reduction minimum
  CRASH_REDUCTION_MAX: 25,       // Crash reduction maximum
  HEALTH_RECOVERY_MIN: 20,       // Health recovery minimum
  HEALTH_RECOVERY_MAX: 40,       // Health recovery maximum
  TIME_COST: 4,                  // Sleep time phase cost
},
```

#### Haven Outpost Parameters (`OUTPOST`)

```js
OUTPOST: {
  WORK_HUNGER_COST: 6,           // Haven Outpost work hunger cost
  WORK_HYDRATION_COST: 6,        // Haven Outpost work hydration cost
  WORK_CRASH_GAIN: 5,            // Haven Outpost work Crash Value growth
  HONOR_WEAPON_ID: "Vector",     // Honor reward weapon ID
  HONOR_AMMO_ID: "9×19mm",      // Honor reward ammo ID
  HONOR_AMMO_COUNT: 60,          // Honor reward ammo count
  LEADER_CHAT_AFFINITY: 1,       // Chat with Leader Affinity
  LEADER_GIFT_AFFINITY: 1,       // Gift to Leader Affinity
},
```

#### Base Parameters (`BASE`)

```js
BASE: {
  UPGRADE_TIME_COST: 8,          // Base upgrade time phase cost
  WAREHOUSE_BASE_CAP: 30,        // Warehouse base capacity
  WAREHOUSE_CAP_PER_LEVEL: 10,   // Warehouse capacity per level
  MAX_WAREHOUSE_LEVEL: 7,        // Warehouse max level
  WAREHOUSE_UPGRADE_TIME: 2,     // Warehouse upgrade time phase cost
  FARMING_CROP_SLOTS: 5,         // Farming crop slots
},
```

#### Ending Parameters (`ENDINGS`)

```js
ENDINGS: {
  DAY_999_THRESHOLD: 999,               // 999-day ending threshold
  NEWFORCE_WEAPON_ID: "无畏之刃",       // New Force ending weapon ID
  ENDING_999_BACKPACK_ID: "次元收纳背包", // 999-day ending backpack ID
  NEWFORCE_BOSS_NAME: "新势力首领",     // New Force boss name
  ALL_IDS: ["ending_death", "ending_999", "ending_prince", "ending_captain", "ending_newforce", "ending_space", "ending_hope", "ending_stay", "ending_farming", "ending_love_hate", "ending_food", "ending_elopement"],  // All ending ID list
},
```

#### Liu Ruyan Parameters (`LIURUYAN`)

```js
LIURUYAN: {
  RESCUE_DEADLINE_DAYS: 30,      // Rescue deadline days
  SERUM_COST: 3,                 // Serum consumption count
},
```

#### Nurse Zombie Parameters (`NURSE_ZOMBIE`)

```js
NURSE_ZOMBIE: {
  BRING_HOME_AFFINITY: 150,      // Affinity gained from bringing home
  CANNED_AFFINITY_MIN: 2,        // Canned food Affinity minimum
  CANNED_AFFINITY_MAX: 3,        // Canned food Affinity maximum
  MAX_AFFINITY: 150,             // Affinity cap
},
```

#### NPC Affinity Parameters (`NPC`)

```js
NPC: {
  GIFT_AFFINITY_FOOD: 3,         // Gift food Affinity
  GIFT_AFFINITY_DRINKS: 3,       // Gift drinks Affinity
  GIFT_AFFINITY_MEDICINE: 5,     // Gift Medicines Affinity
  GIFT_AFFINITY_CARGO: 2,        // Gift supplies Affinity
  LILI_GIFT_AFFINITY_FOOD: 6,    // Lili gift food Affinity
  LILI_GIFT_AFFINITY_MEDICINE: 10, // Lili gift Medicines Affinity
  QUEST_AFFINITY_REWARD: 5,      // Quest completion Affinity reward
  MAP_NPC_GIFT_AFFINITY: 2,      // Map NPC gift Affinity
  CHAT_AFFINITY: 1,                 // Chat Affinity increment
  V_TRADE_AMMO_MIN: 3,             // Miss V trade ammo minimum count
  V_TRADE_AMMO_MAX: 12,            // Miss V trade ammo maximum count
  LILI_TRADE_MED_COUNT_MIN: 1,     // Lili trade Medicines minimum count
  LILI_TRADE_MED_COUNT_MAX: 3,     // Lili trade Medicines maximum count
},
```

#### Achievement Parameters (`ACHIEVEMENTS`)

```js
ACHIEVEMENTS: {
  ZOMBIE_KILLS: [                    // Zombie kill achievements
    { threshold: 50, id: "zombie_hunter" },
    { threshold: 200, id: "zombie_slayer" },
  ],
  SURVIVAL_DAYS: [                   // Survival days achievements
    { threshold: 10, id: "survive_10" },
    { threshold: 30, id: "survive_30" },
    { threshold: 100, id: "survive_100" },
  ],
  EXPLORATION_MAPS: [                // Exploration map achievements
    { threshold: 10, id: "explorer" },
    { threshold: 20, id: "collector" },
  ],
},
```

**Note:** Achievement thresholds are now data-driven by `GAME_CONSTANTS.ACHIEVEMENTS`. The `checkSurvivalAchievements` and `checkExplorationAchievements` functions in `game.js` iterate through these arrays for automatic detection. Adding new achievement levels only requires adding entries here; no logic code modification needed.

#### Loot Parameters (`LOOT`)

```js
LOOT: {
  RARITY_WEIGHTS: { common: 20, uncommon: 12, rare: 6, epic: 3, legendary: 1 },
  ARROW_CHANCE_LOW: 0.5,         // Arrow probability in low-danger maps
  ARROW_CHANCE_MID: 0.3,         // Arrow probability in mid-danger maps
  ARROW_CHANCE_HIGH: 0.1,        // Arrow probability in high-danger maps
  ARROW_COUNT_MIN: 3,            // Arrow minimum count
  ARROW_COUNT_MAX: 8,            // Arrow maximum count
  AMMO_COUNT_MIN: 5,             // Ammo minimum count
  AMMO_COUNT_MAX: 24,            // Ammo maximum count
},
```

#### Trading Parameters (`TRADING`)

```js
TRADING: {
  AMMO_PER_CIG_MIN: 3,           // Minimum ammo per Cigarette
  AMMO_PER_CIG_MAX: 6,           // Maximum ammo per Cigarette
},
```

#### Map Parameters (`MAP`)

```js
MAP: {
  DANGER_MESSAGES: {             // Danger level description texts
    "★轻松": "这里看起来很安全，适合搜刮物资。",
    "★★低危": "偶尔会有丧尸出没，保持警惕。",
    "★★★中危": "丧尸活动频繁，需要小心行事。",
    "★★★★高危": "大量丧尸聚集，极度危险！",
    "★★★★★绝境": "这里简直是地狱，没有充分准备别来！",
    "★★★★★★炼狱": "死亡禁区，只有最强者才能活着离开。",
  },
},
```

---

### 2.9 Adding a New Map

Add a new entry to the `MAPS` array.

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier, also used for zombie pool assignment |
| `name` | string | ✅ | Display name |
| `danger` | string | ✅ | Danger level display text |
| `encounterRate` | number | ✅ | Encounter rate (0~1), 0 means no zombie encounters |
| `noZombie` | boolean | ❌ | Set to `true` for no zombies at all |
| `lootTable` | object | ✅ | Drop weight table |

**Danger Level Reference:**

| Level | `danger` Value | `encounterRate` Reference |
|-------|---------------|--------------------------|
| Safe | `"☆安全"` | 0 |
| Easy | `"★轻松"` | 0.03~0.10 |
| Low Danger | `"★★低危"` | 0.12~0.20 |
| Mid Danger | `"★★★中危"` | 0.35~0.40 |
| High Danger | `"★★★★高危"` | 0.50~0.55 |
| Extreme | `"★★★★★绝境"` | 0.60~0.70 |
| Purgatory | `"★★★★★★炼狱"` | 0.80~0.90 |

**Example: Adding "Abandoned Subway Station"**

```js
{
  id: "废弃地铁站",
  name: "废弃地铁站",
  danger: "★★★★高危",
  encounterRate: 0.5,
  lootTable: { ammo: 20, ranged: 10, melee: 10, food: 15, drink: 15, medicine: 10, fruit: 10, backpack: 5, empty: 5 }
},
```

**⚠️ Important Reminder:** After adding a new map, you also need to add the map ID to zombie pool mapping in the `poolMap` of the `getRandomZombie` function, otherwise the new map will default to the low-danger zombie pool:

```js
const poolMap = {
  // ... existing mappings ...
  "废弃地铁站": highPool,  // Add this line
};
```

---

### 2.10 Modifying NPC Quests

Modify in the `quests` object of `SURVIVOR_NPC`.

**Quest Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Quest name |
| `desc` | string | Quest description |
| `reqAffection` | number | Required Affinity |
| `require` | object | Submission requirements |
| `reward` | object | Rewards |
| `story` | string | Quest story text |

**Supported `require` Formats:**

```js
// Food + Drinks
require: { food: 1, drinks: 1 }

// Specified Medicines
require: { medicine: 5, medicineId: "止血带" }

// Specified drink
require: { drinks: 10, drinkId: "纯牛奶" }

// Multiple item combination
require: { items: [{ type: "medicine", id: "医用急救包", count: 6 }, { type: "medicine", id: "抗感染血清", count: 6 }] }

// All Medicines ×N each
require: { allMedicine: 2 }

// All canned food ×1 each
require: { allCanned: 1 }

// All fruits ×1 each
require: { allFruits: 1 }

// All drinks + all foods ×1 each
require: { allDrinks: 1, allFoods: 1 }
```

**Supported `reward` Formats:**

```js
// Single item
reward: { item: "小匕首", desc: "小匕首×1" }

// Item + ammo
reward: { item: "P226", ammo: { type: "9×19mm", count: 50 }, desc: "P226×1 + 9×19mm×50" }

// Multiple items
reward: { itemStack: [{ id: "手术包", count: 3 }], desc: "手术包×3" }

// Cigarettes + ammo
reward: { cigarettes: 20, ammo: { type: "9×19mm", count: 50 }, desc: "随机香烟×20 + 9×19mm×50" }
```

**Example: Modifying Miss V's v1 quest reward**

```js
v1: { name: "初见任务", desc: "上交1份食物+1份饮品", reqAffection: 0, require: { food: 1, drinks: 1 }, reward: { item: "大扳手", desc: "大扳手×1" }, story: "\"饿着肚子没法战斗。给我吃的，我给你工具。\" 她用扳手敲了敲墙壁。" },
```

---

### 2.11 Modifying Default Items

Modify in `DEFAULT_ITEM_IDS`.

```js
export const DEFAULT_ITEM_IDS = {
  melee: "拳头",        // Default Melee Weapon
  food: "压缩饼干",     // Default food
  drink: "矿泉水",      // Default drink
  seed: "seed",         // Default seed (corresponds to seed in BUILDING_MATERIALS)
  serum: "抗感染血清",  // Default serum
};
```

**Note:** Modifying the `melee` value affects the starting weapon for new games; this ID must exist in `MELEE_WEAPONS`.

---

### 2.12 Modifying NPC Trade Pools

#### Lili Trade Reward Medicine Pool

```js
export const LILI_REWARD_MEDICINE_IDS = ["止血带", "清创药", "抗生素", "抗感染血清"];
```

Add new medicine IDs to expand Lili's trade reward range:

```js
export const LILI_REWARD_MEDICINE_IDS = ["止血带", "清创药", "抗生素", "抗感染血清", "手术包"];
```

#### Su Xiaohan Trade Reward Food Pool

```js
export const XIAOHAN_REWARD_FOOD_IDS = ["压缩饼干", "小麦面包", "牛肉罐头"];
```

Add new food IDs to expand Su Xiaohan's trade reward range:

```js
export const XIAOHAN_REWARD_FOOD_IDS = ["压缩饼干", "小麦面包", "牛肉罐头", "军粮罐头"];
```

---

### 2.13 Modifying Survival Notes

Add or remove categories or entries in the `SURVIVAL_NOTES` array.

**Data Structure Description:**

```js
SURVIVAL_NOTES = [
  {
    id: "category-identifier",   // Unique identifier, used for routing
    name: "category-name",       // Displayed category title
    entries: [                   // Array of entries under this category
      { title: "entry-title", content: "entry-content" },
      ...
    ]
  },
  ...
]
```

**Dynamic Entries:** Some entries in Survival Notes are dynamically generated by code and are not in the `SURVIVAL_NOTES` data:
- **New Force Progress** (`note_newforce`): Automatically appears when the player completes any New Force prerequisite, showing completion progress of 6 conditions (X/6)
- **Liu Ruyan Rescue** (`note_liuruyan`): Automatically appears after the player discovers Liu Ruyan, showing remaining rescue days

These dynamic entries are generated by the `buildNewforceStory(state)` and `buildLiuruyanStory(state)` functions in `game/notes.js`.

**Example: Adding a new entry to the "Basic Survival" category**

```js
{
  id: "basic_survival",
  name: "基础生存",
  entries: [
    { title: "时间与回合", content: "一天分为8个时段..." },
    { title: "核心属性", content: "饱腹度和水分..." },
    { title: "家与安全", content: "在家中..." },
    // New entry
    { title: "睡眠恢复", content: "睡觉可以恢复生命值、缓解崩溃值，同时跳过夜晚时段。" },
  ]
}
```

**Example: Adding a new category**

```js
// Add at the end of the SURVIVAL_NOTES array
{
  id: "crafting",
  name: "合成系统",
  entries: [
    { title: "基础合成", content: "收集材料后可以合成更高级的装备和道具。" },
  ]
}
```

**Note:** If you add a new category, you need to confirm in the `handleSurvivalNotesAction` function of `game.js` that the category's routing is handled properly, but at the data layer you only need to modify `config.js`.

---

### 2.14 Modifying Achievement Configuration

Add or remove entries in the `ACHIEVEMENTS` array.

**Data Structure Description:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier, used for achievement unlock detection |
| `name` | string | ✅ | Achievement display name |
| `desc` | string | ✅ | Achievement description text |
| `icon` | string | ✅ | Achievement icon (Emoji recommended) |

**Example: Adding a new achievement**

```js
// Add at the end of the ACHIEVEMENTS array
{ id: "rich_man", name: "万元户", desc: "累计获得100支香烟", icon: "🚬" },
```

**⚠️ Important:** For survival days and exploration map achievements, thresholds are now data-driven by `GAME_CONSTANTS.ACHIEVEMENTS.SURVIVAL_DAYS` and `GAME_CONSTANTS.ACHIEVEMENTS.EXPLORATION_MAPS`. The detection functions in `game.js` automatically iterate through these arrays. Adding new achievement levels only requires adding entries in `constants.js`. For other achievements (such as kills, base upgrades, etc.), you still need to manually add detection logic in `game.js`.

**Existing Achievement IDs and Unlock Conditions:**

| Achievement ID | Condition | Detection Timing |
|---------------|-----------|-----------------|
| `survive_10` | Survival days >= 10 | Day start |
| `survive_30` | Survival days >= 30 | Day start |
| `survive_100` | Survival days >= 100 | Day start |
| `zombie_hunter` | Zombie kills >= 50 | Battle victory |
| `zombie_slayer` | Zombie kills >= 200 | Battle victory |
| `explorer` | Explored maps >= 10 | Map exploration |
| `collector` | Explored all maps | Map exploration |
| `base_upgrade` | Base max level | Base upgrade |
| `companion_recruit` | Recruit first companion | Companion rescue |
| `boss_killer` | Defeat first BOSS | BOSS battle victory |
| `noble_status` | Obtain Noble ID card | Castle purchase |
| `dawn_member` | Join Haven Outpost | Outpost join |

---

## 3. `js/data/` Folder Structure and Extension Guide

### 3.1 Folder Organization Principles

The `js/data/` folder is divided into subdirectories by data type. Each subdirectory contains:

- **Data files**: Define specific constants and data
- **`index.js`**: Unified export of all constants in that directory

`js/data/index.js` serves as the top-level entry point, re-exporting all constants from each subdirectory's `index.js`. `js/config.js` then imports from `js/data/index.js` and re-exports, while also providing utility functions.

### 3.2 Export Chain

```
Data file (e.g., foods.js)
  → Subdirectory index.js (e.g., items/index.js)
    → js/data/index.js
      → js/config.js (re-export + utility functions)
        → Other modules (e.g., game.js, combat.js, etc.)
```

### 3.3 How to Add a New Data File

**Step 1: Create the data file in the corresponding subdirectory**

For example, add a new `crops-ext.js` in `js/data/items/`:

```js
// js/data/items/crops-ext.js
export const SPECIAL_CROPS = [
  { id: "变异种子", name: "变异种子", matureTurns: 10, reward: { food: "万能针剂" } },
];
```

**Step 2: Add the export in the subdirectory's `index.js`**

```js
// js/data/items/index.js
export { FOODS, FRUITS } from './foods.js';
export { DRINKS } from './drinks.js';
// ... existing exports ...
export { SPECIAL_CROPS } from './crops-ext.js';  // New addition
```

**Step 3: Import in `js/config.js` (if needed for utility functions)**

If the new constant needs to be used in `config.js` utility functions, add it to the import statement; otherwise, `export * from './data/index.js'` will automatically re-export it with no additional action needed.

### 3.4 How to Add a New Subdirectory

If you need to create a completely new data category (e.g., `js/data/quests/`):

**Step 1: Create the subdirectory and files**

```
js/data/quests/
  ├── index.js
  └── main-quests.js
```

**Step 2: Add the export in `js/data/index.js`**

```js
export * from './quests/index.js';
```

**Step 3: Export constants in the subdirectory's `index.js`**

```js
// js/data/quests/index.js
export { MAIN_QUESTS } from './main-quests.js';
```

### 3.5 Important Notes

1. **All constants are ultimately exported through `config.js`**: Other modules should import from `config.js`, not directly from `js/data/` subdirectories
2. **Derived constants in `utils.js`**: Derived constants like `CANNED_FOOD_IDS`, `TOOL_WEAPON_IDS`, `V_TRADE_AMMO_TYPES` are defined in `js/data/utils.js` and depend on data from other sub-modules
3. **After adding a new subdirectory**: Be sure to add an `export *` statement in `js/data/index.js`, otherwise constants won't be exported
4. **File naming**: Use lowercase letters and hyphens (e.g., `building-materials.js`, `map-actions.js`)

---

## 4. Rarity System Description

The game uses a 5-tier rarity system that affects drop probabilities and weapon attributes:

### Rarity Levels

| Rarity | English | Chinese | Drop Weight | Color Reference |
|--------|---------|---------|-------------|----------------|
| common | common | 普通 | 20 | White/Gray |
| uncommon | uncommon | 优秀 | 12 | Green |
| rare | rare | 稀有 | 6 | Blue |
| epic | epic | 史诗 | 3 | Purple |
| legendary | legendary | 传奇 | 1 | Orange/Gold |

### Drop Weight Explanation

Drop weights are used for weighted random selection in the `pickRandomLoot` function. Higher weights mean higher probability. Actual probability calculation:

```
Probability of a rarity = Weight of that rarity / Sum of all rarity weights
```

Using melee weapons as an example (total weight = 20+12+6+3+1 = 42):

| Rarity | Weight | Approximate Probability |
|--------|--------|------------------------|
| common | 20 | 47.6% |
| uncommon | 12 | 28.6% |
| rare | 6 | 14.3% |
| epic | 3 | 7.1% |
| legendary | 1 | 2.4% |

### Melee Weapon Combo Rate and Rarity Correspondence

| Rarity | Combo Rate | Existing Weapon Examples |
|--------|------------|------------------------|
| (Fists) | 0 | Fists |
| common | 0.05 | Kitchen knife, Club, Pickaxe, Small hammer, Frying pan, Large wrench, Baseball bat, Iron pipe, Shovel |
| uncommon | 0.08 | Small dagger, Cleaver, Baton, Crowbar, Claw hammer, Short axe, Fire axe, Hunting knife, Military knife |
| rare | 0.12 | Knuckle knife, Broad sword, Horse-chopping sword, Nine-section whip, Western sword, Morning star, Steel side-sword, Dragon sword, Long lance |
| epic | 0.15 | Double-edged sword, Malay sword, Katana, Tang Hengdao, Chainsaw |
| legendary | 0.18~0.20 | Brave Sword, Universe Sword, Imperial Sword, **Fearless Blade**, Royal Silver Sword (0.20) |

### Ranged Weapon Critical Rate Ranges

Ranged weapon critical rates are related to weapon category rather than directly to rarity:

| Weapon Category | Crit Rate Range | Rarity Range |
|-----------------|----------------|-------------|
| Bow/Crossbow | 0 | common~rare |
| Pistol | 0.12~0.20 | common~rare |
| SMG | 0.18~0.23 | uncommon |
| Light Machine Gun | 0.22~0.23 | rare |
| Rifle (5.56) | 0.22~0.27 | uncommon~epic |
| Rifle (7.62×39) | 0.20~0.28 | uncommon~rare |
| Battle Rifle (7.62×51) | 0.22~0.32 | rare~epic |
| Sniper Rifle | 0.35~0.45 | rare~legendary |
| Exclusive Weapons | 0.29~0.52 | legendary |
| Shotgun | 0.10~0.12 | uncommon~rare |

### Medicine Rarity

| Rarity | Medicines |
|--------|-----------|
| common | Band-aid, Glucose solution, zombie_gel |
| uncommon | Painkillers, Adrenaline, Tourniquet, Wound cleaner |
| rare | Surgery kit, Antibiotics, Anti-infection serum |
| epic | Medical emergency kit, Field medical box |
| legendary | Universal injection, improved_serum (Improved antibody injection) |

### Backpack Rarity

| Rarity | Backpacks | Capacity |
|--------|-----------|----------|
| common | Handbag, Small waist bag, Small school bag, Canvas backpack | 18, 20, 22, 24 |
| uncommon | Fashion backpack, Sports backpack, Hiking backpack | 26, 28, 32 |
| rare | Military backpack, Tactical backpack, Special ops backpack | 36, 39, 42 |
| epic | Large hiking backpack, Extra-large travel backpack, Extra-large load backpack | 48, 56, 64 |
| legendary | Dimensional storage backpack | 68 |

### Special Items (SPECIAL_ITEMS)

| Key Name | ID | Name | Description |
|----------|-----|------|-------------|
| `noble_id` | `noble_id` | Noble ID Card | Basic noble identity |
| `viscount_id` | `viscount_id` | Viscount ID Card | Viscount noble rank |
| `count_id` | `count_id` | Count ID Card | Count noble rank |
| `marquis_id` | `marquis_id` | Marquis ID Card | Marquis noble rank |
| `duke_id` | `duke_id` | Duke ID Card | Duke noble rank |
| `crown_prince_id` | `crown_prince_id` | Crown Prince ID Card | Crown Prince noble rank |
| `dawn_badge` | `dawn_badge` | Dawn Badge | Haven Outpost member |
| `dawn_captain_badge` | `dawn_captain_badge` | Dawn Captain Badge | Haven Outpost vanguard captain |
| `silence_badge` | `silence_badge` | Silence Badge | Souvenir from defeating Zombie King · Silence |
| `underground_key` | `underground_key` | Underground Key | Basement key |
| `farming_master_badge` | `farming_master_badge` | Farming Master Badge | Farming Master souvenir |
| `miaomiao_diary` | `miaomiao_diary` | Miaomiao's Diary | Miaomiao's diary |
| `strange_recorder` | `strange_recorder` | Strange Voice Recorder | Voice recorder |
| `letter_to_sister` | `letter_to_sister` | Letter to Sister | Outpost Leader's letter |
| `queen_reply` | `queen_reply` | The Queen's Reply | The Queen's reply letter |
| `love_token` | `love_token` | Love Token | Sunflower pendant |
| `castle_pass` | `castle_pass` | Castle Pass | Castle entry pass |
| `car_key` | `car_key` | Car Key | Liu Ruyan quest 3 reward, quest 4 prerequisite |

### Castle Noble Ranks (CASTLE_RANKS)

The game has a 6-tier noble rank system:

| Rank | Name | Rank Value | ID Card ID |
|:---:|------|:----------:|-----------|
| 1 | Noble | 1 | `noble_id` |
| 2 | Viscount | 2 | `viscount_id` |
| 3 | Count | 3 | `count_id` |
| 4 | Marquis | 4 | `marquis_id` |
| 5 | Duke | 5 | `duke_id` |
| 6 | Crown Prince | 6 | `crown_prince_id` |

### Achievement List (ACHIEVEMENTS)

The game has 17 achievements, including 5 ending achievements:

| Achievement ID | Name | Condition |
|---------------|------|-----------|
| `survive_10` | Survive 10 Days | Days >= 10 |
| `survive_30` | Survive 30 Days | Days >= 30 |
| `survive_100` | Survive 100 Days | Days >= 100 |
| `zombie_hunter` | Zombie Hunter | Kills >= 50 |
| `zombie_slayer` | Zombie Slayer | Kills >= 200 |
| `explorer` | Explorer | Explored maps >= 10 |
| `collector` | Collector | Explored all maps |
| `base_upgrade` | Home | Base max level |
| `companion_recruit` | Companion | Recruit first companion |
| `boss_killer` | BOSS Hunter | Defeat first BOSS |
| `noble_status` | Noble Status | Obtain noble identity |
| `dawn_member` | Dawn | Join Haven Outpost |
| `ending_farming` | I Am Not a Farm God | Achieve ending: I Am Not a Farm God |
| `ending_love_hate` | Love and Hate | Achieve ending: Love and Hate |
| `ending_death` | The End | Achieve ending: Death |
| `ending_999` | Unknown Future | Achieve ending: Unknown Future |
| `ending_prince` | Indulgence of Power | Achieve ending: Indulgence of Power |
| `ending_captain` | Shine Bright | Achieve ending: Shine Bright |
| `ending_newforce` | Become the New Force | Achieve ending: Become the New Force |

---

## 5. Data Relationship Diagram

The following constants have reference relationships; pay attention to linkages when modifying:

### Ammo ↔ Weapons (Bidirectional Association)

```
AMMO.compatibleWith[]  ←→  RANGED_WEAPONS.ammoType
```

- Each ranged weapon's `ammoType` must have a corresponding entry in `AMMO`
- Each ammo's `compatibleWith` must include all weapon IDs that use that ammo
- **When adding a new ranged weapon**: If using existing ammo, add the weapon ID to the ammo's `compatibleWith`
- **When adding new ammo**: Ensure all weapons using that ammo are included in `compatibleWith`

### Fixed Drops → Item Arrays

```
FIXED_LOOT_DROPS.weaponId  →  MELEE_WEAPONS / RANGED_WEAPONS
FIXED_LOOT_DROPS.ammoId    →  AMMO
FIXED_LOOT_DROPS.foodId    →  FOODS
```

- When `type` field is `"melee"`, `weaponId` is looked up in `MELEE_WEAPONS`
- When `type` field is `"ranged"`, `weaponId` is looked up in `RANGED_WEAPONS`

### Default Items → Item Arrays

```
DEFAULT_ITEM_IDS.melee  →  MELEE_WEAPONS
DEFAULT_ITEM_IDS.food   →  FOODS
DEFAULT_ITEM_IDS.drink  →  DRINKS
DEFAULT_ITEM_IDS.seed   →  BUILDING_MATERIALS
DEFAULT_ITEM_IDS.serum  →  MEDICINES
```

### Auto-Derivation Relationships

```
NURSE_MEDICINE_POOL  ←  MEDICINES.filter(rarity === "common" || rarity === "uncommon")
V_TRADE_AMMO_TYPES   ←  AMMO.filter(id !== "箭矢").map(id)
BUILDING_MATERIAL_NAMES  ←  BUILDING_MATERIALS iteration to generate {id: name}
BOSS_NAMES           ←  NAMED_NPCS iteration to generate name array
```

After modifying source data, these derived constants update automatically; no manual modification needed.

### BOSS Name Derivation

```
NAMED_NPCS  →  BOSS_NAMES (auto-derived)
```

`BOSS_NAMES` is automatically generated via `Object.values(NAMED_NPCS).map(npc => npc.name)`. After adding or modifying entries in `NAMED_NPCS`, `BOSS_NAMES` updates automatically.

### Map Action Routing

```
MAP_ACTIONS  →  routing.js (data-driven routing)
```

`MAP_ACTIONS` defines the available action buttons for each map and their corresponding action identifiers. `routing.js` routes to the corresponding handling logic based on action identifiers. When adding new map actions, you need to add entries in both `MAP_ACTIONS` and the corresponding handler function in `routing.js`.

### Map NPC Intro Texts

```
MAP_NPC_INTROS  →  maps.js (NPC intro texts)
```

`MAP_NPC_INTROS` stores the intro texts, battle texts, and departure texts for NPCs on each map. During map exploration, the corresponding intro is displayed based on NPC type.

### Outpost Leader Dialogues

```
LEADER_DIALOGUES  →  outpost.js (Leader dialogues)
```

`LEADER_DIALOGUES` stores the Outpost Leader's dialogue content, randomly selected and displayed during outpost interactions.

### Castle Rejection Dialogues

```
CASTLE_REJECTION_DIALOGUES  →  npcs/index.js (rejection dialogues)
```

`CASTLE_REJECTION_DIALOGUES` stores the dialogue text for when the player has a Castle ID card and Haven Outpost NPCs refuse interaction. The key names are the NPC IDs (v, xiaohan, lili).

### NPC Quest Rewards → Item Arrays

```
SURVIVOR_NPC.quests.reward.item      →  MELEE_WEAPONS / RANGED_WEAPONS
SURVIVOR_NPC.quests.reward.ammo.type →  AMMO
SURVIVOR_NPC.quests.require.medicineId →  MEDICINES
SURVIVOR_NPC.quests.require.drinkId    →  DRINKS
```

### Trading Related

```
TRADER_WEAPON_SHOP.weaponId  →  MELEE_WEAPONS / RANGED_WEAPONS
LILI_REWARD_MEDICINE_IDS     →  MEDICINES
XIAOHAN_REWARD_FOOD_IDS      →  FOODS
TRADE_TEMPLATES.ammoType     →  AMMO
```

### Maps → Zombie Pools

```
MAPS.id  →  getRandomZombie() poolMap mapping
```

After adding a new map ID, you need to add the corresponding mapping in `poolMap`.

### Canned Food List

```
CANNED_FOOD_IDS  →  FOODS (subset)
```

Used for Su Xiaohan's "Canned Food Collection" quest. If new canned foods are added, this array must be updated accordingly.

### Tool Weapons

```
TOOL_WEAPON_IDS  →  MELEE_WEAPONS (subset)
```

Identifies which Melee Weapons belong to the "tool" category.

---

## 6. Important Notes

### 1. IDs Must Be Globally Unique

Each item's `id` must be unique within its array. It's recommended to keep IDs unique across arrays as well to avoid confusion.

### 2. Modifying IDs Affects Save Compatibility

Player saves store item `id`s. If you modify an item's `id`, data in old saves referencing that `id` will not match correctly. **If you need to rename, it's recommended to only modify the `name` field and keep the `id` unchanged.**

### 3. Adding Items Does Not Require Modifying Other Files

Simply add entries to the corresponding array. The drop system, cheat system, etc. will automatically recognize new items.

### 4. Deleting Items Requires Checking All References

Before deleting an item, you must check the following locations for references:
- `weaponId`, `ammoId`, `foodId` in `FIXED_LOOT_DROPS`
- Various fields in `DEFAULT_ITEM_IDS`
- `compatibleWith` in `AMMO`
- `weaponId` in `TRADER_WEAPON_SHOP`
- `require` and `reward` in `SURVIVOR_NPC` quests
- `LILI_REWARD_MEDICINE_IDS` and `XIAOHAN_REWARD_FOOD_IDS`
- `CANNED_FOOD_IDS`
- `TOOL_WEAPON_IDS`
- `ammoType` in `TRADE_TEMPLATES`

### 5. The rarity Field Must Be One of 5 Values

Valid rarity values: `"common"`, `"uncommon"`, `"rare"`, `"epic"`, `"legendary"`. If a rarity not among these 5 values is used, the weighted random in the drop system will use a default weight of 1, which may cause unexpected behavior.

### 6. Ammo compatibleWith Must Correspond to Weapon ammoType

- Each ranged weapon's `ammoType` must exist in `AMMO`
- Each ammo's `compatibleWith` in `AMMO` must include all weapons using that ammo
- Both sides must be kept in sync, otherwise ammo cannot be loaded or weapons cannot fire

### 7. FIXED_LOOT_DROPS type Determines Lookup Scope

- `type: "melee"` → Look up `weaponId` in `MELEE_WEAPONS`
- `type: "ranged"` → Look up `weaponId` in `RANGED_WEAPONS`
- If `type` doesn't match the actual weapon type, the corresponding weapon won't be found

### 8. Map ID and Zombie Pool Mapping

The `getRandomZombie` function uses map `id` for exact zombie pool matching. When adding a new map, be sure to add a mapping in `poolMap`, otherwise it defaults to the low-danger zombie pool.

### 9. Cheat Command Format

The cheat system uses item type and ID to generate commands in the format `/get_{type}_{id}_{count}`. The `type` corresponds to the item's `type` field value. For example:
- `/get_food_压缩饼干_5`
- `/get_melee_武士刀_1`
- `/get_ranged_AK47_1`
- `/get_medicine_抗生素_3`

### 10. Royal Coins System

Royal Coins (`royal_coin`) are an independent currency that doesn't occupy backpack space, stored in `state.royalCoins`.
- Add via `addItem({ type: "royal_coin", count: N })`
- Deduct via `removeRoyalCoins(N)`
- Old saves automatically get `royalCoins: 0` added through `normalizeState()`

### 11. Gasoline System

Gasoline is a stackable special cargo that doesn't occupy backpack slots, stored in `state.gasoline`.
- Add via `addGasoline(N)`
- Deduct via `removeGasoline(N)`, returns actual deducted amount
- Can also add via `addItem({ type: "gasoline", count: N })` (internally calls `addGasoline`)
- Can also deduct via `removeItem("gasoline", N)` (internally calls `removeGasoline`)
- Old saves automatically get `gasoline: 0` added through `normalizeState()`
- Cheat code: `/get_gasoline_汽油_5` (gain 5 each time)
- Gasoline is displayed alongside Cigarettes and Royal Coins in the UI cargo panel
- Gasoline supports discarding and NPC gifting

### 12. Story-Exclusive Weapons

Some weapons are only obtainable through specific storylines and cannot be randomly acquired from drop pools:
- **Field Bow** (Mu Miaomiao quest 3 reward) — excluded in `pickRandomLoot`
- **Royal Short Gun** (The Queen's shop purchase) — excluded in `pickRandomLoot`
- **Royal Silver Sword** (The Queen's shop purchase) — excluded in `pickRandomLoot`
- **Fearless Blade** (New Force ending reward) — excluded in `pickRandomLoot`

### 13. Interaction Design Standards

When adding or modifying NPC interactions, follow these standards:

1. **No short-circuit returns**: NPC interaction entry functions must not use the `if (!condition) { setStory(); refreshMenu(); return; }` pattern. Always display the NPC dialogue page and at least one "Return" option; when conditions aren't met, only show dialogue text + return option.

2. **100% Crash Value behavior**: When Crash Value is full, the player cannot fight, eat, drink, or sleep. When refusing eat/drink, prompt that medical items (painkillers/adrenaline, etc.) can be used to restore spirit. When crash is full, only medicines that reduce Crash Value are allowed.

3. **Trade backpack space pre-check**: The trading system should check if the backpack has enough space for reward items before deducting player items; refuse the trade if space is insufficient.

4. **Dangerous operation warnings**: Irreversible choices (like Ma San quest 4) and high-risk operations (like eating mystery meat +10 infection) should display ⚠ warnings.

5. **Disabled option feedback**: Clicking a disabled option should display a "Conditions not met" prompt, not silently ignore.

6. **Return after consumable use**: After using food/drinks/medicine, return to the corresponding selection interface instead of the main menu, for convenient consecutive use.

7. **Black market trader ammo quantity selection**: When buying ammo, support quantity selection (1/5/10/all Cigarettes), rather than consuming all Cigarettes at once.

8. **Liu Ruyan rescue reminder**: After discovering Liu Ruyan, Survival Notes automatically adds a rescue countdown. The `state.liuruyanDiscovered` field tracks whether she has been discovered.

9. **New Force progress tracking**: After completing any New Force prerequisite, Survival Notes automatically adds a progress entry (X/6).

10. **Rocket Hope ending Affinity progress**: When selecting "Bring important people", display current Affinity progress for Miss V/Xiaohan/Lili.

---

## 6.5 Code Module Structure

### Castle Module (`js/castle/`)

The original `castle/index.js` (1033 lines) has been split into 7 sub-modules by functional domain:

| Sub-module | Functional Domain | Included Functions |
|------------|------------------|-------------------|
| `castle/outpost.js` | Castle outskirts + guard interaction | handleCastleOutpost, refreshCastleOutpost, handleCastleExploreBlocked, handleGuardChat, handleGuardEnter, handleGuardBribe, handleGuardLeave, handleCastleGuard, handleCastleGuardAction |
| `castle/interior.js` | Castle interior interface/exploration/routing | enterCastleInterior, showCastleInterior, refreshCastleInterior, handleCastleInteriorExplore, handleCastleInteriorAction, handleLeaveCastleInterior, handleLeaveCastle |
| `castle/royalty.js` | Royalty dialogues + banquet/ball/room + salary | handleCastleKing, handleCastleQueen, handleCastleBanquet, handleCastleBall, handleCastleRoom, handleCastleSalary |
| `castle/services.js` | Treatment/meeting/garden/reissue/work | handleCastleTreatment, handleTreatConfirm, handleCastleMeeting, handleCastleGarden, handleCastleTitleReissue, handleCastleWork |
| `castle/king-quest.js` | Full King Quests set | handleCastleKingQuest, checkKingQuestRequire, handleKingQuestSubmit, removeKingQuestItems |
| `castle/identity.js` | Identity application/cancellation | handleCastleIdentity, handleIdentityApply, handleIdentityCancel, refreshCastleIdentity, handleCastleIdentityAction |
| `castle/bank.js` | Bank/loan/banker interaction | handleCastleBank, handleBankLoan, handleLoanSubmit, handleBankRepay, handleBankBanker, handleBankerMercy, refreshCastleBank, handleBankerFight, handleCastleBankAction, handleCastleBankerAction |

`castle/index.js` serves as the unified entry point, re-exporting all functions from each sub-module. External import paths remain unchanged.

### Game Module (`js/game/`)

The original `game.js` (1779 lines) has been split into 8 sub-modules by functional domain:

| Sub-module | Functional Domain | Included Functions |
|------------|------------------|-------------------|
| `game/endings.js` | Ending system | triggerEnding, checkEndingTrigger, checkEndingTriggerAfterAction, checkGoHomeEnding, handleEndingAction |
| `game/base-actions.js` | Base construction | handleBaseBuild, handleBaseBuildAction |
| `game/consumables.js` | Sleep/diet/medicine | handleSleep, handleEatSelect, handleDrinkSelect, handleMedicineSelect, handleFoodAction, handleDrinkAction, handleMedicineAction, handleSelectionPhase |
| `game/navigation.js` | Map navigation | handleGoOut, handleGoHome, handleMapAction |
| `game/exploration.js` | Exploration system | handleExplore, handleExploreAction |
| `game/save.js` | Save system | handleSavePage, renderSaveSlotsAsOptions, handleSavePageAction, handleSaveConfirm |
| `game/notes.js` | Survival Notes | buildSurvivalNotes, handleSurvivalNotesAction, handleSurvivalNotesDetailAction |
| `game/achievements.js` | Achievement system | tryUnlockAchievement, checkSurvivalAchievements, checkExplorationAchievements |

`game/index.js` retains the main routing functions `handleChooseAction` and `handleAction`, and uniformly exports all functions. External import paths updated from `'./game.js'` to `'./game/index.js'`.

### Inter-Module Dependencies

- `castle/outpost.js` ↔ `castle/interior.js`: Mutual imports (ES modules support runtime circular references)
- `castle/interior.js` → `castle/royalty.js`, `castle/services.js`, `castle/king-quest.js`: Route calls
- `game/index.js` → all `game/` sub-modules: Main route dispatching
- `game/endings.js` → `game/achievements.js`: Ending triggers achievements
- `game/navigation.js` → `game/endings.js`: Going home checks endings
- `game/exploration.js` → `game/consumables.js`, `game/navigation.js`: Post-exploration consumption/navigation

### How to Locate Code When Modifying

| Need | File to Modify |
|------|---------------|
| Modify castle guard interaction | `castle/outpost.js` |
| Modify castle interior menu | `castle/interior.js` |
| Modify banquet/ball/room | `castle/royalty.js` |
| Modify treatment/meeting/garden | `castle/services.js` |
| Modify King Quests | `castle/king-quest.js` |
| Modify identity application | `castle/identity.js` |
| Modify bank/loan | `castle/bank.js` |
| Modify ending logic | `game/endings.js` |
| Modify base construction | `game/base-actions.js` |
| Modify sleep/diet/medicine | `game/consumables.js` |
| Modify map navigation | `game/navigation.js` |
| Modify exploration system | `game/exploration.js` |
| Modify save system | `game/save.js` |
| Modify Survival Notes | `game/notes.js` |
| Modify achievement system | `game/achievements.js` |
| Modify main menu routing | `game/index.js` |

---

## 7. Quick Reference Table

| Constant Name | Data Type | Entry Count | Main Fields |
|--------------|-----------|-------------|-------------|
| `TIME_PHASES` | string[] | 8 | Time phase names |
| `FOODS` | object[] | 19 | id, name, type, hunger, hydration? |
| `FRUITS` | object[] | 11 | id, name, type, hunger, hydration |
| `DRINKS` | object[] | 12 | id, name, type, hydration, effects? |
| `MEDICINES` | object[] | 14 | id, name, type, effects{health?,infection?,crash?}, rarity |
| `NURSE_MEDICINE_POOL` | object[] | 6 | (auto-derived from MEDICINES) |
| `CIGARETTES` | object[] | 5 | id, name, type |
| `BUILDING_MATERIALS` | object[] | 6 | id, name, type |
| `CROPS` | object[] | 15 | id, name, matureTurns, yield, seedId, seedName, hunger, hydration |
| `MELEE_WEAPONS` | object[] | 39 | id, name, type, damage, durability, rarity?, comboRate |
| `RANGED_WEAPONS` | object[] | 44 | id, name, type, damage, integrity, ammoType, critRate, rarity |
| `AMMO` | object[] | 13 | id, name, type, compatibleWith[] |
| `ZOMBIES` | object[] | 16 | id, name, hp, damage, dodge, ability[] |
| `NPCS` | object | 4 | {type: {name, hpMin, hpMax, damageMin, damageMax, hasRanged}} |
| `SURVIVOR_NPC` | object[] | 3 | id, name, desc, dialogues{}, tips[], quests{} |
| `NAMED_NPCS` | object | 5 | {key: {name, hp, damageMin?, damageMax?, damage?, hasRanged, dodgeRate}} |
| `BOSS_NAMES` | string[] | 5 | (auto-derived from NAMED_NPCS) |
| `BACKPACK_TYPES` | object | 14 | {name: {id, name, type, capacity}} |
| `LOOT_BACKPACKS` | object[] | 14 | id, name, type, capacity, rarity |
| `MAPS` | object[] | 22 | id, name, danger, encounterRate, noZombie?, lootTable{} |
| `MAP_ACTIONS` | object | 23 | {mapId: [{text, action}]} |
| `MAP_NPC_INTROS` | object | 13 | {key: intro/battle/departure text} |
| `OUTLAW_DIALOGUES` | string[] | 15 | Outlaw dialogue texts |
| `MECHANIC_DIALOGUES` | string[] | 5 | Mechanic dialogue texts |
| `WOLF_DIALOGUES` | string[] | 5 | Wolf dialogue texts |
| `WAREHOUSE_GUARD_DIALOGUES` | string[] | 5 | Warehouse guard dialogue texts |
| `NERVOUS_VETERAN_DIALOGUES` | string[] | 5 | Nervous veteran dialogue texts |
| `CASTLE_GUARD_DIALOGUES` | string[] | 5 | Castle guard dialogue texts |
| `CASTLE_KING_DIALOGUES` | string[] | 5 | Castle king dialogue texts |
| `CASTLE_QUEEN_DIALOGUES` | string[] | 5 | Castle queen dialogue texts |
| `CASTLE_BANKER_DIALOGUES` | string[] | 5 | Castle banker dialogue texts |
| `CASTLE_GUARD_HIGH_DIALOGUES` | string[] | 5 | Castle guard (high noble rank) dialogue texts |
| `CASTLE_KING_HIGH_DIALOGUES` | string[] | 5 | Castle king (high noble rank) dialogue texts |
| `CASTLE_QUEEN_HIGH_DIALOGUES` | string[] | 5 | Castle queen (high noble rank) dialogue texts |
| `CASTLE_BANKER_HIGH_DIALOGUES` | string[] | 5 | Castle banker (high noble rank) dialogue texts |
| `CASTLE_REJECTION_DIALOGUES` | object | 3 | {npcId: rejection dialogue text} |
| `DOCTOR_INTRO` | string | 1 | Dr. Chen intro text |
| `DOCTOR_DIALOGUES` | string[] | 5 | Dr. Chen dialogue texts |
| `ZOMBIE_KING_INTRO` | string | 1 | Zombie King intro text |
| `NURSE_ZOMBIE_INTRO` | string | 1 | Nurse zombie intro text |
| `LEADER_DIALOGUES` | string[] | 5 | Outpost Leader dialogue texts |
| `SPECIAL_ITEMS` | object | 18 | {key: {id, name, type}} |
| `CASTLE_RANKS` | object[] | 6 | id, rank, name, itemId |
| `KING_QUESTS` | object[] | 5 | id, name, desc, story, submitStory, require, reward, prereqQuest |
| `BASE_LEVELS` | object[] | 5 | name, bonus, cost{}? |
| `WAREHOUSE_LEVELS` | (object\|null)[] | 8 | {wood?, building_mat?, stone?, nails?, glass?} |
| `AFFINITY_THRESHOLDS` | object[] | 5 | min, label, stage |
| `AFFINITY_MAX` | object | 5 | {npcId: maxValue} |
| `GAME_CONSTANTS` | object | 22 groups | CRASH_MAX, INFECTION_MAX, MAX_HEALTH, TURNS_PER_DAY, SURVIVAL{}, COMBAT{}, MAP_EVENTS{}, CASTLE{}, ISLAND{}, DOCTOR{}, ROCKET{}, WEATHER{}, ENCOUNTER{}, SLEEP{}, OUTPOST{}, BASE{}, ENDINGS{}, FISHING{}, YUMO{}, LIURUYAN{}, NURSE_ZOMBIE{}, NPC{}, LOOT{}, ACHIEVEMENTS{}, TRADING{}, MAP{} |
| `TOOL_WEAPON_IDS` | string[] | 4 | Melee Weapon IDs |
| `V_TRADE_AMMO_TYPES` | string[] | 11 | (auto-derived from AMMO) |
| `TRADER_WEAPON_SHOP` | object[] | 6 | weaponId, type, costMin, costMax |
| `FIXED_LOOT_DROPS` | object | 7 | {key: {weaponId?, type?, ammoId?, ammoCount?, foodId?}} |
| `TRADE_TEMPLATES` | object[] | 4 | ammoType, ammoPerItem |
| `DEFAULT_ITEM_IDS` | object | 5 | melee, food, drink, seed, serum |
| `LILI_REWARD_MEDICINE_IDS` | string[] | 4 | Medicine IDs |
| `XIAOHAN_REWARD_FOOD_IDS` | string[] | 3 | Food IDs |
| `BUILDING_MATERIAL_NAMES` | object | 6 | (auto-derived from BUILDING_MATERIALS) |
| `CANNED_FOOD_IDS` | string[] | 8 | Canned food IDs |
| `SURVIVAL_NOTES` | object[] | 7 | id, name, entries[{title, content}] |
| `ACHIEVEMENTS` | object[] | 19 | id, name, desc, icon |
| `ENDING_STORIES` | object | 7 | {endingId: story text} |
