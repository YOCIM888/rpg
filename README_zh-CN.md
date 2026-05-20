# 🧟 丧尸世界 — 末日生存文字游戏

<p align="center">
  <strong>一个纯前端、数据驱动的末日生存文字冒险游戏</strong>
</p>

---

## 📖 项目简介

**丧尸世界** 是一款基于浏览器的末日生存文字游戏。玩家将在丧尸横行的废土中搜集物资、打造装备、招募伙伴、挑战BOSS，在末世中艰难求生。

游戏采用 **纯前端架构**，无需后端服务器，所有逻辑在浏览器端运行。核心设计理念是 **数据驱动**——所有游戏数据集中在 `js/config.js` 中管理，修改配置即可调整游戏平衡、新增物品和内容，无需改动逻辑代码。

---

## ✨ 游戏特色

- 🗺️ **22张地图** — 从安全的曙光阵地到炼狱级丧尸巢穴，难度递进
- ⚔️ **85把武器** — 39把近战 + 46把远程（弓弩/手枪/冲锋枪/步枪/霰弹枪/狙击枪/轻机枪）
- 🧟 **16种丧尸** — 各具特殊能力（感染/腐蚀/自爆/召唤/隐身等）
- � **14种药品** — 从创可贴到万能针剂，覆盖治疗/抗感染/精神恢复
- 🎯 **18种特殊物品** — 任务道具与关键物资
- �👥 **6名阵地NPC** — 完整好感度系统 + 任务链（V小姐/苏小涵/莉莉丝/阵地首领/沐苗苗/国王）
- 🤝 **2名可招募伙伴** — 柳如烟（限时30天救援）/ 露露薇（投喂罐头招募）
- 🏰 **末日城堡** — 6级爵位体系/银行借贷/阵营对立系统
- �️ **小型岛屿系统** — 独立经济/银行投资/酒吧/街道商铺/钓鱼
- 🚀 **火箭任务链** — 3段任务→3种结局选择（飞向太空/希望的火种/留下来吧）
- ⛽ **汽油经济** — 岛屿交通与资源流通的核心货币
- 🎣 **钓鱼系统** — 每日钓鱼上限/海鲜加工
- 📝 **生存笔记** — 动态追踪游戏进度与关键事件
- �🏠 **基地建设** — 5级基地升级 + 7级仓库 + 种植系统
- 🌦️ **天气系统** — 7种天气影响探索和生存
- 💾 **多存档** — 支持多存档位 + 最佳记录追踪
- 🏆 **19个成就** — 包含12个结局成就
- ⚙️ **22组配置常量** — GAME_CONSTANTS 涵盖生存/战斗/天气/岛屿/火箭等全部参数

---

## 🏗️ 技术架构

### 纯前端、零依赖

```
game/
├── index.html              # 入口页面
├── css/
│   └── style.css           # 样式
├── js/
│   ├── main.js             # 入口模块
│   ├── config.js           # 🎯 数据中心（汇总导出）
│   ├── state.js            # 游戏状态管理
│   ├── combat.js           # 战斗系统
│   ├── maps.js             # 地图探索（re-export入口）
│   ├── map-events/         # 地图事件模块（按地图拆分）
│   │   ├── index.js        # 统一导出
│   │   ├── lookout.js      # 瞭望塔
│   │   ├── barn.js         # 谷仓
│   │   ├── village.js      # 农家乐
│   │   ├── campsite.js     # 露营地
│   │   ├── outlaw.js       # 马三/餐厅
│   │   ├── mechanic.js     # 王铁柱/汽油
│   │   ├── wolf.js         # 老狼
│   │   ├── factory.js      # 工厂
│   │   ├── harbor.js       # 港口/游艇
│   │   ├── supermarket.js  # 超市/黑影
│   │   ├── warehouse.js    # 仓库/老马
│   │   ├── nurse-zombie.js # 露露薇
│   │   ├── police.js       # 警局
│   │   ├── veteran.js      # 老赵
│   │   ├── tunnel.js       # 隧道
│   │   ├── doctor.js       # 陈博士
│   │   ├── rocket.js       # 航天基地/火箭
│   │   ├── zombie-king.js  # 丧尸之王
│   │   ├── liuruyan.js     # 柳如烟
│   │   └── partner-harvest.js # 伙伴收获
│   ├── ui.js               # UI渲染
│   ├── equipment.js        # 装备管理
│   ├── trading.js          # 以物易物
│   ├── base.js             # 基地建设
│   ├── farming.js          # 种植系统
│   ├── routing.js          # 场景路由
│   ├── cheats.js           # 作弊系统（开发测试用）
│   ├── faction.js          # 阵营工具
│   ├── game/               # 游戏主逻辑模块
│   │   ├── index.js        # 模块入口
│   │   ├── endings.js      # 结局系统
│   │   ├── base-actions.js # 基地操作
│   │   ├── consumables.js  # 消耗品使用
│   │   ├── navigation.js   # 场景导航
│   │   ├── exploration.js  # 探索逻辑
│   │   ├── save.js         # 存档系统
│   │   ├── notes.js        # 生存笔记
│   │   └── achievements.js # 成就系统
│   ├── data/               # 数据层（数据驱动核心）
│   │   ├── index.js        # 数据汇总导出
│   │   ├── utils.js        # 数据工具函数
│   │   ├── items/          # 物品数据
│   │   │   ├── index.js
│   │   │   ├── foods.js
│   │   │   ├── drinks.js
│   │   │   ├── medicines.js
│   │   │   ├── backpacks.js
│   │   │   ├── building-materials.js
│   │   │   ├── cigarettes.js
│   │   │   ├── crops.js
│   │   │   ├── fish.js
│   │   │   └── seafood-meals.js
│   │   ├── weapons/        # 武器数据
│   │   │   ├── index.js
│   │   │   ├── melee.js
│   │   │   └── ranged.js
│   │   ├── entities/       # 实体数据
│   │   │   ├── index.js
│   │   │   ├── zombies.js
│   │   │   ├── npcs.js
│   │   │   └── zombie-pools.js
│   │   ├── maps/           # 地图数据
│   │   │   ├── index.js
│   │   │   ├── maps.js
│   │   │   └── map-actions.js
│   │   ├── dialogues/      # 对话数据
│   │   │   ├── index.js
│   │   │   ├── castle-dialogues.js
│   │   │   ├── map-dialogues.js
│   │   │   ├── outpost-dialogues.js
│   │   │   ├── story-dialogues.js
│   │   │   └── yumo-dialogues.js
│   │   ├── systems/        # 系统配置
│   │   │   ├── index.js
│   │   │   ├── constants.js      # GAME_CONSTANTS 全局常量
│   │   │   ├── achievements.js
│   │   │   ├── affinity.js
│   │   │   ├── base-levels.js
│   │   │   ├── castle.js
│   │   │   ├── survival-notes.js
│   │   │   └── trading.js
│   │   └── island/         # 岛屿数据
│   │       ├── bar-menu.js
│   │       ├── investment.js
│   │       └── street-shop.js
│   ├── island/             # 岛屿系统
│   │   ├── index.js        # 岛屿入口
│   │   ├── fishing.js      # 钓鱼系统
│   │   ├── bar.js          # 酒吧
│   │   ├── invest.js       # 银行投资
│   │   ├── street.js       # 街道商铺
│   │   ├── guyue.js        # 孤月NPC
│   │   ├── linhan.js       # 林寒NPC
│   │   └── yumo.js         # 雨墨NPC
│   ├── outpost/            # 曙光阵地
│   │   ├── index.js        # 阵地入口
│   │   ├── leader.js       # 阵地首领
│   │   ├── menu.js         # 阵地菜单
│   │   ├── work.js         # 打工系统
│   │   └── assassinate.js  # 暗杀任务
│   ├── npcs/               # NPC系统
│   │   ├── index.js        # NPC核心逻辑
│   │   ├── v.js            # V小姐
│   │   ├── lili.js         # 莉莉丝
│   │   ├── xiaohan.js      # 苏小涵
│   │   ├── mumiao.js       # 沐苗苗
│   │   └── map-npcs.js     # 地图NPC
│   └── castle/             # 末日城堡
│       ├── index.js        # 城堡模块入口
│       ├── interior.js     # 城堡内部与路由
│       ├── royalty.js      # 国王/皇后+任务+皇家交易
│       ├── outpost.js      # 城堡外围与守卫
│       ├── services.js     # 城堡服务
│       ├── king-quest.js   # 国王任务链
│       ├── identity.js     # 身份管理
│       └── bank.js         # 银行系统
└── docs/
    ├── README_zh-CN.md     # 本文件
    ├── 通用游戏攻略.md      # 完整游戏攻略
    ├── 剧情路线攻略.md      # 剧情路线与任务链攻略
    ├── 全结局快速速通.md    # 12种结局速通指南
    ├── 作弊码大全.md        # 开发者作弊码
    └── 数据维护指南.md      # 数据驱动维护文档
```

### 数据驱动设计

游戏采用数据驱动架构，核心原则：

| 原则 | 说明 |
|:-----|:-----|
| **单数据源** | 所有游戏数据集中在 `js/data/` 目录 |
| **配置即内容** | 修改数据文件 = 修改游戏，无需改逻辑代码 |
| **常量引用** | 逻辑文件通过导入常量引用数据，不硬编码 |
| **自动派生** | 部分常量从其他常量自动生成（如弹药交易池、建材名称表） |

关键配置常量：

| 常量 | 用途 |
|:-----|:-----|
| `FOODS` / `DRINKS` / `MEDICINES` / `FRUITS` / `FISH` / `SEAFOOD_MEALS` | 消耗品数据 |
| `MELEE_WEAPONS` / `RANGED_WEAPONS` / `AMMO` | 武器弹药数据 |
| `CROPS` / `SEEDS` | 作物与种子数据 |
| `SPECIAL_ITEMS` | 特殊物品与任务道具 |
| `ZOMBIES` / `NAMED_NPCS` | 敌人数据 |
| `MAPS` | 地图与掉落表 |
| `FIXED_LOOT_DROPS` | 固定掉落配置 |
| `TRADER_WEAPON_SHOP` | 商人商品配置 |
| `DEFAULT_ITEM_IDS` | 默认物品ID |
| `GAME_CONSTANTS` | 全局平衡参数（22组） |
| `ACHIEVEMENTS` / `ENDING_STORIES` | 成就与结局 |

GAME_CONSTANTS 主要分组：

| 分组 | 用途 |
|:-----|:-----|
| `SURVIVAL` | 饥饿/水分/崩溃衰减参数 |
| `COMBAT` | 战斗/逃跑/能力倍率 |
| `MAP_EVENTS` | 地图随机事件参数 |
| `CASTLE` | 城堡爵位/银行/服务 |
| `ISLAND` | 岛屿银行/休息/贷款参数 |
| `ROCKET` | 火箭任务链（能量/药品/食物消耗、改良抗体、希望好感需求） |
| `DOCTOR` | 医生治疗/心理/血清交易 |
| `WEATHER` | 天气概率与效果 |
| `ENCOUNTER` | 随机遭遇概率 |
| `SLEEP` | 睡眠恢复参数 |
| `OUTPOST` | 阵地打工/荣誉武器 |
| `BASE` | 基地升级/仓库/种植 |
| `ENDINGS` | 结局触发条件 |
| `FISHING` | 钓鱼上限/海鲜加工 |
| `YUMO` | 雨墨任务链参数 |
| `LIURUYAN` | 柳如烟救援时限 |
| `NURSE_ZOMBIE` | 露露薇招募参数 |
| `NPC` | NPC好感/交易/修理 |
| `LOOT` | 掉落稀有度权重 |
| `ACHIEVEMENTS` | 成就阈值 |
| `TRADING` | 交易参数 |
| `MAP` | 地图危险等级消息 |

汽油系统：岛屿经济以汽油为核心流通货币，用于乘船交通、商铺交易等，相关参数由 `ISLAND` 和 `YUMO` 常量组控制。

---

## 🚀 快速开始

### 运行游戏

1. 克隆项目：
```bash
git clone <repository-url>
cd game
```

2. 启动本地服务器（任选一种）：
```bash
# 方式一：Node.js
npx serve -l 3000

# 方式二：Python
python -m http.server 3000

# 方式三：直接用浏览器打开 index.html（部分功能可能受限）
```

3. 打开浏览器访问 `http://localhost:3000`

### 修改游戏数据

编辑 `js/data/` 下对应的数据文件，刷新浏览器即可生效。详见 [数据维护指南](数据维护指南.md)。

---

## 🎮 游戏流程概览

```
开局求生（1~5天）
  └→ 曙光阵地打工 + 谷仓搜刮 → 获得基础武器

积累期（5~15天）
  └→ 刷地图攒物资 → 找大背包 → 囤药品和香烟

伙伴招募（15~30天）
  └→ ⚠️ 30天内救柳如烟（需3支血清）
  └→ 招募露露薇（投喂罐头至150好感）

进阶武装（30天+）
  └→ V小姐任务线拿龙抄剑/UZI/M4A1
  └→ 挑战马三(AK47)/黑影(GP100)

岛屿探索
  └→ 乘船前往小型岛屿 → 汽油经济体系
  └→ 酒吧/街道商铺/银行投资/钓鱼
  └→ 孤月/林寒/雨墨NPC任务链

终局挑战
  └→ 陈博士交易(M700) / 太空舱(AWM) / 尸王·寂灭
  └→ 🚀 火箭任务链（3段任务→飞向太空/希望的火种/留下来吧）
  └→ 柳如烟任务链→私奔结局
  └→ 马三任务链→沦为盘中餐结局
  └→ 12种结局达成条件：
      死亡 / 未知将来 / 权力沉溺 / 发光发热 / 新势力
      飞向太空 / 希望的火种 / 留下来吧 / 我不是农神
      爱恨情仇 / 沦为盘中餐 / 私奔
```

---

## 📚 文档索引

| 文档 | 说明 |
|:-----|:-----|
| [通用游戏攻略](通用游戏攻略.md) | 完整游戏攻略，从新手到终局 |
| [剧情路线攻略](剧情路线攻略.md) | 剧情路线与任务链攻略 |
| [全结局快速速通](全结局快速速通.md) | 12种结局速通指南 |
| [作弊码大全](作弊码大全.md) | 开发者测试用作弊指令 |
| [数据维护指南](数据维护指南.md) | 如何通过修改数据文件维护游戏数据 |

---

## 🛠️ 开发指南

### 新增物品

在 `js/data/items/` 对应文件中添加条目即可，无需修改其他文件：

```javascript
// 示例：新增食物
export const FOODS = [
  // ... 现有食物
  { id: "红烧肉", name: "红烧肉", type: "food", hunger: 50, hydration: 10 },
];
```

作弊系统会自动支持新物品：`/get_food_红烧肉_10`

### 调整平衡

修改 `js/data/systems/constants.js` 中的 `GAME_CONSTANTS`：

```javascript
export const GAME_CONSTANTS = {
  SURVIVAL: {
    HUNGER_DECAY: 4,        // 每回合饥饿衰减
    HYDRATION_DECAY: 4,     // 每回合水分衰减
    // ...
  },
  COMBAT: {
    FLEE_RATE: 0.25,        // 逃跑成功率
    // ...
  },
};
```

### 修改BOSS掉落

修改 `FIXED_LOOT_DROPS`：

```javascript
export const FIXED_LOOT_DROPS = {
  outlaw_kill: { weaponId: "AK47", type: "ranged", ammoId: "7.62×39mm", ammoCount: 30 },
  // ...
};
```

---

## 📄 许可证

ISC

---

> 🌟 在末日中活下去——活着就是胜利。
