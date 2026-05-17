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
- ⚔️ **51 Weapons** — 21 melee + 30 ranged (bows/crossbows/pistols/SMGs/rifles/shotguns/snipers)
- 🧟 **10 Zombie Types** — Each with unique abilities (infection/corrosion/self-destruct/summon/cloak, etc.)
- 👥 **4 Outpost NPCs** — Full affinity system + quest chains (V / Xiaohan / Lili / Leader)
- 🤝 **2 Recruit-able Companions** — Liu Ruyan (30-day time limit) / Luluwei (feed canned food)
- 🏰 **Doom Castle** — Banking / Noble identity / Faction rivalry system
- 🏠 **Base Building** — 5-level base upgrades + 7-level warehouse + farming system
- 🌦️ **Weather System** — 7 weather types affecting exploration and survival
- 💾 **Multiple Saves** — Multi-slot saves + best record tracking

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
│   ├── config.js           # 🎯 Data center (all game data)
│   ├── state.js            # Game state management
│   ├── game.js             # Main logic / routing
│   ├── combat.js           # Combat system
│   ├── maps.js             # Map exploration
│   ├── ui.js               # UI rendering
│   ├── equipment.js        # Equipment management
│   ├── trading.js          # Barter system
│   ├── base.js             # Base building
│   ├── outpost.js          # Haven Outpost
│   ├── faction.js          # Faction utilities
│   ├── save.js             # Save system
│   ├── routing.js          # Scene routing
│   ├── cheats.js           # Cheat system (dev/testing)
│   ├── castle/
│   │   └── index.js        # Doom Castle module
│   └── npcs/
│       ├── index.js        # NPC core logic
│       ├── v.js            # Miss V
│       ├── lili.js         # Lili
│       ├── xiaohan.js      # Su Xiaohan
│       └── map-npcs.js     # Map NPCs
└── Readme_Docusments/
    ├── README_ZH.md        # Chinese README
    ├── 游戏攻略.md          # Full game guide (Chinese)
    ├── 作弊码大全.md        # Cheat codes (Chinese)
    └── 数据维护指南.md      # Data maintenance guide (Chinese)
```

### Data-Driven Design

| Principle | Description |
|:----------|:------------|
| **Single Source of Truth** | All game data centralized in `config.js` |
| **Config = Content** | Modify config = modify game, no logic changes needed |
| **Constant References** | Logic files import constants, no hardcoded values |
| **Auto-Derived** | Some constants auto-generated from others (e.g., ammo trade pool, material names) |

Key config constants:

| Constant | Purpose |
|:---------|:--------|
| `FOODS` / `DRINKS` / `MEDICINES` / `FRUITS` | Consumable items |
| `MELEE_WEAPONS` / `RANGED_WEAPONS` / `AMMO` | Weapons & ammunition |
| `ZOMBIES` / `NAMED_NPCS` | Enemy data |
| `MAPS` | Maps & loot tables |
| `FIXED_LOOT_DROPS` | Fixed drop configuration |
| `TRADER_WEAPON_SHOP` | Trader shop inventory |
| `DEFAULT_ITEM_IDS` | Default item IDs |
| `GAME_CONSTANTS` | Global balance parameters |

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

Edit `js/config.js`, then refresh the browser. See [Data Maintenance Guide](Readme_Docusments/数据维护指南.md) for details.

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

Endgame Challenges
  └→ Dr. Chen trade (M700) / Space Crate (AWM) / Zombie King
```

---

## 📚 Documentation

| Document | Description |
|:---------|:------------|
| [README_ZH.md](Readme_Docusments/README_ZH.md) | Chinese README |
| [游戏攻略](Readme_Docusments/游戏攻略.md) | Full game guide (Chinese) |
| [作弊码大全](Readme_Docusments/作弊码大全.md) | Developer cheat codes (Chinese) |
| [数据维护指南](Readme_Docusments/数据维护指南.md) | Data-driven maintenance guide (Chinese) |

---

## 🛠️ Development

### Add New Items

Add entries to the corresponding array in `config.js` — no other files need modification:

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
