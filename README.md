# 🧟 Zombie World — Post-Apocalyptic Survival Text Game

<p align="center">
  <strong>A pure front-end, data-driven text-based survival adventure game</strong>
</p>

---

## 📖 About

**Zombie World** (丧尸世界) is a browser-based post-apocalyptic survival text game. Players scavenge for supplies, craft equipment, recruit companions, and fight bosses to survive in a zombie-infested wasteland.

Built with a **pure front-end architecture** — no backend server required, all logic runs in the browser. The core design principle is **data-driven**: all game data is centralized in `js/config.js`. Modify the config to adjust game balance, add items, or create new content — no logic code changes needed.

---

## ✨ Features

- 🗺️ **22 Maps** — From the safe Haven Outpost to nightmare-level Zombie Nest
- ⚔️ **85 Weapons** — 39 melee + 46 ranged (bows/crossbows/pistols/SMGs/rifles/shotguns/snipers/LMGs)
- 💊 **14 Medicines** — From bandages to universal serum
- 🧟 **16 Zombie Types** — Each with unique abilities (infection/corrosion/self-destruct/summon/cloak, etc.)
- 🎒 **18 Special Items** — Quest items, key items & identity badges
- 👥 **6 Outpost NPCs** — Full affinity system + quest chains (V / Xiaohan / Lili / Leader / Mumiao / King)
- 🤝 **2 Recruit-able Companions** — Liu Ruyan (30-day time limit) / Luluwei (feed canned food)
- 🏰 **Doom Castle** — 6-rank nobility system / Banking / Faction rivalry system
- 🏝️ **Island System** — Fishing, banking, bar, street shops, investment & island NPCs
- 🚀 **Rocket Quest Chain** — 3-quest chain leading to 3 distinct ending choices
- ⛽ **Gasoline Economy** — Fuel as a key resource for island travel & rocket launch
- 🎣 **Fishing** — Daily catch limit, seafood meals & island economy
- 📝 **Dynamic Survival Notes** — In-game tips that unlock progressively as you explore
- 🏠 **Base Building** — 5-level base upgrades + 7-level warehouse + farming system
- 🌦️ **Weather System** — 7 weather types affecting exploration and survival
- 💾 **Multiple Saves** — Multi-slot saves + best record tracking
- 🏆 **19 Achievements** — Including 12 ending achievements

---

## 🏗️ Architecture

### Zero-Dependency Front-End

```
game/
├── index.html              # Entry page
├── css/
│   └── style.css           # Styles
├── js/
│   ├── main.js             # Entry module
│   ├── config.js           # 🎯 Data hub (re-exports from js/data/)
│   ├── state.js            # Game state management
│   ├── combat.js           # Combat system
│   ├── maps.js             # Map exploration (re-export entry)
│   ├── map-events/         # Map event modules (per-map split)
│   │   ├── index.js        # Barrel export
│   │   ├── lookout.js      # Watchtower
│   │   ├── barn.js         # Barn
│   │   ├── village.js      # Village
│   │   ├── campsite.js     # Campsite
│   │   ├── outlaw.js       # Ma San / Restaurant
│   │   ├── mechanic.js     # Wang Tiezhu / Gasoline
│   │   ├── wolf.js         # Old Wolf
│   │   ├── factory.js      # Factory
│   │   ├── harbor.js       # Harbor / Yacht
│   │   ├── supermarket.js  # Supermarket / Shadow
│   │   ├── warehouse.js    # Warehouse / Old Ma
│   │   ├── nurse-zombie.js # Luluwei
│   │   ├── police.js       # Police station
│   │   ├── veteran.js      # Veteran Zhao
│   │   ├── tunnel.js       # Tunnel
│   │   ├── doctor.js       # Dr. Chen
│   │   ├── rocket.js       # Launch center / Rocket
│   │   ├── zombie-king.js  # Zombie King
│   │   ├── liuruyan.js     # Liu Ruyan
│   │   └── partner-harvest.js # Partner harvest
│   ├── ui.js               # UI rendering
│   ├── equipment.js        # Equipment management
│   ├── trading.js          # Barter system
│   ├── base.js             # Base building
│   ├── farming.js          # Farming & crop system
│   ├── faction.js          # Faction utilities
│   ├── routing.js          # Scene routing
│   ├── cheats.js           # Cheat system (dev/testing)
│   ├── save.js             # Legacy save compat
│   ├── data/               # 📦 Data layer (single source of truth)
│   │   ├── index.js        # Data barrel export
│   │   ├── utils.js        # Data utilities
│   │   ├── items/          # Consumable & material data
│   │   │   ├── index.js
│   │   │   ├── foods.js
│   │   │   ├── drinks.js
│   │   │   ├── medicines.js
│   │   │   ├── cigarettes.js
│   │   │   ├── crops.js
│   │   │   ├── backpacks.js
│   │   │   ├── building-materials.js
│   │   │   ├── fish.js
│   │   │   └── seafood-meals.js
│   │   ├── weapons/        # Weapon & ammo data
│   │   │   ├── index.js
│   │   │   ├── melee.js
│   │   │   └── ranged.js
│   │   ├── entities/       # NPC & zombie data
│   │   │   ├── index.js
│   │   │   ├── npcs.js
│   │   │   ├── zombies.js
│   │   │   └── zombie-pools.js
│   │   ├── maps/           # Map & loot data
│   │   │   ├── index.js
│   │   │   ├── maps.js
│   │   │   └── map-actions.js
│   │   ├── dialogues/      # Dialogue scripts
│   │   │   ├── index.js
│   │   │   ├── outpost-dialogues.js
│   │   │   ├── castle-dialogues.js
│   │   │   ├── map-dialogues.js
│   │   │   ├── story-dialogues.js
│   │   │   └── yumo-dialogues.js
│   │   ├── island/         # Island data (menus, shops, investments)
│   │   │   ├── bar-menu.js
│   │   │   ├── street-shop.js
│   │   │   └── investment.js
│   │   └── systems/        # Game systems config
│   │       ├── index.js
│   │       ├── constants.js       # GAME_CONSTANTS (22 groups)
│   │       ├── achievements.js    # Achievements & endings
│   │       ├── affinity.js        # Affinity thresholds
│   │       ├── base-levels.js     # Base & warehouse levels
│   │       ├── castle.js          # Ranks, quests, special items
│   │       ├── trading.js         # Shop inventory & loot drops
│   │       └── survival-notes.js  # Dynamic survival notes
│   ├── game/               # 🎮 Game logic modules
│   │   ├── index.js        # Module barrel export
│   │   ├── endings.js      # Ending conditions & stories
│   │   ├── base-actions.js # Base action handlers
│   │   ├── consumables.js  # Item use logic
│   │   ├── navigation.js   # Scene navigation
│   │   ├── exploration.js  # Map exploration logic
│   │   ├── save.js         # Save/load handlers
│   │   ├── notes.js        # Survival notes tracking
│   │   └── achievements.js # Achievement tracking
│   ├── island/             # 🏝️ Island system
│   │   ├── index.js        # Island entry & routing
│   │   ├── fishing.js      # Fishing mechanic
│   │   ├── bar.js          # Island bar
│   │   ├── street.js       # Street shops
│   │   ├── invest.js       # Investment system
│   │   ├── guyue.js        # Guyue NPC
│   │   ├── linhan.js       # Linhan NPC
│   │   └── yumo.js         # Yumo quest chain
│   ├── npcs/               # Outpost NPC modules
│   │   ├── index.js        # NPC core logic
│   │   ├── v.js            # Miss V
│   │   ├── lili.js         # Lili
│   │   ├── xiaohan.js      # Su Xiaohan
│   │   ├── mumiao.js       # Mu Miaomiao
│   │   └── map-npcs.js     # Map NPCs
│   ├── outpost/            # Haven Outpost
│   │   ├── index.js        # Outpost entry
│   │   ├── leader.js       # Leader NPC
│   │   ├── menu.js         # Outpost menu
│   │   ├── work.js         # Work system
│   │   └── assassinate.js  # Assassination mission
│   └── castle/             # Doom Castle module
│       ├── index.js        # Castle module entry
│       ├── interior.js     # Castle interior & routing
│       ├── royalty.js      # King/Queen + quests + royal trading
│       ├── outpost.js      # Castle outpost & guards
│       ├── services.js     # Castle services
│       ├── king-quest.js   # King quest chain
│       ├── identity.js     # Identity management
│       └── bank.js         # Banking system
├── tools/
│   ├── index.html          # Dev cheat code lookup tool
│   ├── cheat_codes.csv     # Cheat code database
│   ├── encyclopedia.csv    # Item encyclopedia data
│   └── devtools-auth.js    # Auth logic (SHA-256 protected)
└── docs/
    ├── README_ZH.md        # Chinese README
    ├── 通用游戏攻略.md      # Full game guide (Chinese)
    ├── 剧情路线攻略.md      # Story route guide (Chinese)
    ├── 全结局快速速通.md    # All endings speedrun guide (Chinese)
    └── 数据维护指南.md      # Data maintenance guide (Chinese)
```

### Data-Driven Design

| Principle | Description |
|:----------|:------------|
| **Single Source of Truth** | All game data centralized in `js/data/` (re-exported via `config.js`) |
| **Config = Content** | Modify data files = modify game, no logic changes needed |
| **Constant References** | Logic files import constants, no hardcoded values |
| **Auto-Derived** | Some constants auto-generated from others (e.g., ammo trade pool, material names) |

Key config constants:

| Constant | Purpose |
|:---------|:--------|
| `FOODS` / `DRINKS` / `MEDICINES` / `FISH` / `SEAFOOD_MEALS` | Consumable items |
| `MELEE_WEAPONS` / `RANGED_WEAPONS` / `AMMO` | Weapons & ammunition |
| `CROPS` / `SEEDS` | Crops & seeds |
| `SPECIAL_ITEMS` | Quest items & key items (18 items) |
| `ZOMBIES` / `NAMED_NPCS` | Enemy data |
| `MAPS` | Maps & loot tables |
| `FIXED_LOOT_DROPS` | Fixed drop configuration |
| `TRADER_WEAPON_SHOP` | Trader shop inventory |
| `DEFAULT_ITEM_IDS` | Default item IDs |
| `GAME_CONSTANTS` | Global balance parameters (22 groups) |
| `GAME_CONSTANTS.ROCKET` | Rocket quest chain parameters (energy cost, medicine/food/drinks cost, improved serum) |
| `GAME_CONSTANTS.ISLAND` | Island system parameters (loan, interest, rest) |
| `GAME_CONSTANTS.FISHING` | Fishing parameters (daily limit, seafood cost) |
| `ACHIEVEMENTS` / `ENDING_STORIES` | Achievements & endings (12 endings) |
| `SURVIVAL_NOTES` | Dynamic survival notes (unlock progressively) |

### Gasoline Economy

Gasoline is a key resource introduced with the island and rocket systems:
- **Island Travel**: Gasoline required to travel to the island via boat
- **Rocket Launch**: Gasoline is one of the resources needed for the rocket quest chain
- **Acquisition**: Found during exploration, traded at specific locations

---

## 🚀 Quick Start

### Run the Game

1. Clone the repository:
```bash
git clone <repository-url>
cd game
```

2. Start a local server (any of these):
```bash
# Option 1: Node.js
npx serve -l 3000

# Option 2: Python
python -m http.server 3000

# Option 3: Open index.html directly in browser (some features may be limited)
```

3. Open your browser and navigate to `http://localhost:3000`

### Modify Game Data

Edit `js/data/` files (re-exported via `config.js`), then refresh the browser. See [Data Maintenance Guide](docs/数据维护指南.md) for details.

---

## 🎮 Game Progression

```
Early Survival (Days 1-5)
  └→ Work at Haven Outpost + Scavenge Barn → Get basic weapons

Accumulation (Days 5-15)
  └→ Farm maps for supplies → Find larger backpacks → Stockpile meds & cigarettes

Companion Recruitment (Days 15-30)
  └→ ⚠️ Rescue Liu Ruyan within 30 days (requires 3 anti-infection serums)
  └→ Recruit Luluwei (feed canned food to 150 affinity)

Advanced Armament (Days 30+)
  └→ Miss V quest line for Dragon Sword / UZI / M4A1
  └→ Defeat Ma San (AK47) / Shadow (GP100)

Island & Economy (Days 30-60)
  └→ Travel to island (requires gasoline) → Fishing / Banking / Bar / Street shops
  └→ Yumo quest chain (4 quests: gel → investment → diving → materials)
  └→ Ma San quest chain → ⚠️ Food ending (沦为盘中餐)
  └→ Liu Ruyan quest chain → Elopement ending (私奔)

Endgame Challenges
  └→ Dr. Chen trade (M700) / Space Crate (AWM) / Zombie King
  └→ 🚀 Rocket quest chain (3 quests → 3 ending choices):
      ├→ Fly solo → Space ending (飞向太空)
      ├→ Bring companions → Hope ending (希望的火种)
      └→ Stay behind → Stay ending (留下来吧)
  └→ 12 ending conditions:
      Death / Unknown Future / Power Indulgence / Shine / New Force /
      Space / Hope / Stay / Farming Goddess / Love & Hate / Food / Elopement
```

---

## 📚 Documentation

| Document | Description |
|:---------|:------------|
| [README_ZH.md](docs/README_ZH.md) | Chinese README |
| [通用游戏攻略](docs/通用游戏攻略.md) | Full game guide (Chinese) |
| [剧情路线攻略](docs/剧情路线攻略.md) | Story route guide (Chinese) |
| [全结局快速速通](docs/全结局快速速通.md) | All endings speedrun guide (Chinese) |
| [数据维护指南](docs/数据维护指南.md) | Data-driven maintenance guide (Chinese) |

### Developer Tools

After starting the game, click the **🔧 开发者工具** button on the main menu and enter the password `yocim888devtools` to access the cheat code lookup tool. Or open `tools/index.html` directly.

---

## 🛠️ Development

### Add New Items

Add entries to the corresponding array in `js/data/items/` — no other files need modification:

```javascript
// Example: Add a new food item
export const FOODS = [
  // ... existing foods
  { id: "braised_pork", name: "红烧肉", type: "food", hunger: 50, hydration: 10 },
];
```

The cheat system automatically supports new items: `/get_food_红烧肉_10`

### Adjust Game Balance

Modify parameters in `GAME_CONSTANTS`:

```javascript
export const GAME_CONSTANTS = {
  SURVIVAL: {
    HUNGER_DECAY: 4,        // Hunger decay per turn
    HYDRATION_DECAY: 4,     // Hydration decay per turn
    // ...
  },
  COMBAT: {
    FLEE_RATE: 0.25,        // Flee success rate
    // ...
  },
};
```

### Modify Boss Drops

Edit `FIXED_LOOT_DROPS`:

```javascript
export const FIXED_LOOT_DROPS = {
  outlaw_kill: { weaponId: "AK47", type: "ranged", ammoId: "7.62×39mm", ammoCount: 30 },
  // ...
};
```

---

## 📄 License

ISC

---

> 🌟 Survive the apocalypse — staying alive is victory.
