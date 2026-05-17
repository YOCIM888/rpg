/* ============================================================
   游戏数据常量与工具函数
   组织顺序：时间 → 物品（食物/水果/饮料/药品/香烟/背包）
   → 武器（近战/远程/弹药）→ 实体（僵尸/NPC）
   → 地图 → 交易模板 → 辅助函数
   ============================================================ */

// ---------- 时间阶段 ----------
export const TIME_PHASES = ["凌晨", "早上", "上午", "中午", "下午", "傍晚", "夜晚", "深夜"];

// ---------- 食物 ----------
export const FOODS = [
  { id: "小坚果", name: "小坚果", type: "food", hunger: 10 },
  { id: "棒棒糖", name: "棒棒糖", type: "food", hunger: 10 },
  { id: "能量棒", name: "能量棒", type: "food", hunger: 20 },
  { id: "巧克力", name: "巧克力", type: "food", hunger: 20 },
  { id: "干脆面", name: "干脆面", type: "food", hunger: 20 },
  { id: "银耳羹", name: "银耳羹", type: "food", hunger: 20, hydration: 20 },
  { id: "海苔脆", name: "海苔脆", type: "food", hunger: 20 },
  { id: "压缩饼干", name: "压缩饼干", type: "food", hunger: 30 },
  { id: "小麦面包", name: "小麦面包", type: "food", hunger: 30 },
  { id: "黄桃罐头", name: "黄桃罐头", type: "food", hunger: 40, hydration: 10 },
  { id: "豆类罐头", name: "豆类罐头", type: "food", hunger: 40, hydration: 10 },
  { id: "牛肉罐头", name: "牛肉罐头", type: "food", hunger: 40, hydration: 10 },
  { id: "军粮罐头", name: "军粮罐头", type: "food", hunger: 60, hydration: 10 },
  { id: "沙丁鱼罐头", name: "沙丁鱼罐头", type: "food", hunger: 40, hydration: 15 },
  { id: "金枪鱼罐头", name: "金枪鱼罐头", type: "food", hunger: 40, hydration: 15 },
  { id: "秋刀鱼罐头", name: "秋刀鱼罐头", type: "food", hunger: 40, hydration: 15 },
  { id: "青花鱼罐头", name: "青花鱼罐头", type: "food", hunger: 40, hydration: 15 },
];

// ---------- 水果 ----------
export const FRUITS = [
  { id: "苹果", name: "苹果", type: "fruit", hunger: 15, hydration: 20 },
  { id: "香蕉", name: "香蕉", type: "fruit", hunger: 20, hydration: 15 },
  { id: "橙子", name: "橙子", type: "fruit", hunger: 12, hydration: 25 },
  { id: "雪梨", name: "雪梨", type: "fruit", hunger: 14, hydration: 22 },
  { id: "葡萄", name: "葡萄", type: "fruit", hunger: 10, hydration: 28 },
  { id: "西瓜", name: "西瓜", type: "fruit", hunger: 18, hydration: 35 },
  { id: "草莓", name: "草莓", type: "fruit", hunger: 10, hydration: 20 },
  { id: "蓝莓", name: "蓝莓", type: "fruit", hunger: 5, hydration: 18 },
  { id: "桃子", name: "桃子", type: "fruit", hunger: 16, hydration: 22 },
  { id: "芒果", name: "芒果", type: "fruit", hunger: 22, hydration: 25 },
];

// ---------- 饮料 ----------
export const DRINKS = [
  { id: "矿泉水", name: "矿泉水", type: "drink", hydration: 40, effects: null },
  { id: "椰子汁", name: "椰子汁", type: "drink", hydration: 45, effects: null },
  { id: "果粒橙", name: "果粒橙", type: "drink", hydration: 30, effects: null },
  { id: "纯牛奶", name: "纯牛奶", type: "drink", hydration: 35, effects: null },
  { id: "优酸乳", name: "优酸乳", type: "drink", hydration: 35, effects: null },
  { id: "苹果醋", name: "苹果醋", type: "drink", hydration: 35, effects: null },
  { id: "魔爪饮料", name: "魔爪饮料", type: "drink", hydration: 60, effects: null },
  { id: "电解质水", name: "电解质水", type: "drink", hydration: 60, effects: null },
  { id: "运动饮料", name: "运动饮料", type: "drink", hydration: 60, effects: null },
  { id: "百味啤酒", name: "百味啤酒", type: "drink", hydration: 5, effects: { crash: -10 } },
  { id: "动力啤酒", name: "动力啤酒", type: "drink", hydration: 5, effects: { crash: -10 } },
  { id: "高度白酒", name: "高度白酒", type: "drink", hydration: 0, effects: { crash: -30 } },
];

// ---------- 药品 ----------
// rarity: common(普通) > uncommon(优秀) > rare(稀有) > epic(史诗)
export const MEDICINES = [
  // 普通 (common) - 常见基础药品
  { id: "创可贴", name: "创可贴", type: "medicine", effects: { health: 10 }, rarity: "common" },
  { id: "葡萄糖服液", name: "葡萄糖服液", type: "medicine", effects: { health: 25, hydration: 15 }, rarity: "common" },

  // 优秀 (uncommon) - 中等效果药品
  { id: "止痛片", name: "止痛片", type: "medicine", effects: { health: 15, crash: -5 }, rarity: "uncommon" },
  { id: "肾上腺素", name: "肾上腺素", type: "medicine", effects: { health: 20, crash: -10 }, rarity: "uncommon" },
  { id: "止血带", name: "止血带", type: "medicine", effects: { health: 30 }, rarity: "uncommon" },
  { id: "清创药", name: "清创药", type: "medicine", effects: { infection: -25 }, rarity: "uncommon" },

  // 稀有 (rare) - 较强效果药品
  { id: "手术包", name: "手术包", type: "medicine", effects: { health: 25, crash: -10 }, rarity: "rare" },
  { id: "抗生素", name: "抗生素", type: "medicine", effects: { health: 35, infection: -25 }, rarity: "rare" },
  { id: "抗感染血清", name: "抗感染血清", type: "medicine", effects: { infection: -60 }, rarity: "rare" },

  // 史诗 (epic) - 最强药品，极难掉落
  { id: "医用急救包", name: "医用急救包", type: "medicine", effects: { health: 70 }, rarity: "epic" },
  { id: "战地医疗箱", name: "战地医疗箱", type: "medicine", effects: { health: 120, crash: -30 }, rarity: "epic" },
];

export const NURSE_MEDICINE_POOL = MEDICINES.filter(m => m.rarity === "common" || m.rarity === "uncommon");

// ---------- 香烟 ----------
export const CIGARETTES = [
  { id: "万宝露香烟", name: "万宝露香烟", type: "cigarette" },
  { id: "奇星香烟", name: "奇星香烟", type: "cigarette" },
  { id: "兰星香烟", name: "兰星香烟", type: "cigarette" },
  { id: "芸斯顿香烟", name: "芸斯顿香烟", type: "cigarette" },
  { id: "白乐香烟", name: "白乐香烟", type: "cigarette" },
];

// ---------- 建筑材料 ----------
export const BUILDING_MATERIALS = [
  { id: "wood", name: "木材", type: "building" },
  { id: "building_mat", name: "建筑材料", type: "building" },
  { id: "stone", name: "石头", type: "building" },
  { id: "nails", name: "铁钉", type: "building" },
  { id: "glass", name: "玻璃", type: "building" },
  { id: "seed", name: "种子", type: "building" },
];

// ---------- 作物 ----------
export const CROPS = [
  { id: "potato", name: "土豆", matureTurns: 16, reward: { food: 2 } },
  { id: "tomato", name: "番茄", matureTurns: 20, reward: { food: 2 } },
  { id: "carrot", name: "胡萝卜", matureTurns: 24, reward: { food: 3 } },
  { id: "cucumber", name: "黄瓜", matureTurns: 20, reward: { food: 2 } },
  { id: "corn", name: "玉米", matureTurns: 32, reward: { food: 4 } },
  { id: "rice", name: "水稻", matureTurns: 40, reward: { food: 6 } },
];

// ---------- 近战武器 ----------
// rarity: common(普通) > uncommon(优秀) > rare(稀有) > epic(史诗)
export const MELEE_WEAPONS = [
  { id: "拳头", name: "拳头", type: "melee", damage: 10, durability: Infinity, comboRate: 0 },

  // 普通 (common) - 常见武器，伤害较低
  { id: "平底锅", name: "平底锅", type: "melee", damage: 30, durability: 100, rarity: "common", comboRate: 0.05 },
  { id: "大扳手", name: "大扳手", type: "melee", damage: 36, durability: 50, rarity: "common", comboRate: 0.05 },
  { id: "棒球棍", name: "棒球棍", type: "melee", damage: 42, durability: 50, rarity: "common", comboRate: 0.05 },
  { id: "铁管", name: "铁管", type: "melee", damage: 46, durability: 35, rarity: "common", comboRate: 0.05 },
  { id: "铁铲", name: "铁铲", type: "melee", damage: 48, durability: 50, rarity: "common", comboRate: 0.05 },

  // 优秀 (uncommon) - 中等武器
  { id: "小匕首", name: "小匕首", type: "melee", damage: 40, durability: 40, rarity: "uncommon", comboRate: 0.08 },
  { id: "屠刀", name: "屠刀", type: "melee", damage: 42, durability: 35, rarity: "uncommon", comboRate: 0.08 },
  { id: "警棍", name: "警棍", type: "melee", damage: 50, durability: 50, rarity: "uncommon", comboRate: 0.08 },
  { id: "撬棍", name: "撬棍", type: "melee", damage: 60, durability: 55, rarity: "uncommon", comboRate: 0.08 },
  { id: "羊角锤", name: "羊角锤", type: "melee", damage: 64, durability: 60, rarity: "uncommon", comboRate: 0.08 },
  { id: "消防斧", name: "消防斧", type: "melee", damage: 68, durability: 65, rarity: "uncommon", comboRate: 0.08 },
  { id: "军工刀", name: "军工刀", type: "melee", damage: 70, durability: 77, rarity: "uncommon", comboRate: 0.08 },

  // 稀有 (rare) - 较强武器
  { id: "指虎刀", name: "指虎刀", type: "melee", damage: 66, durability: 80, rarity: "rare", comboRate: 0.12 },
  { id: "大砍刀", name: "大砍刀", type: "melee", damage: 75, durability: 60, rarity: "rare", comboRate: 0.12 },
  { id: "西洋剑", name: "西洋剑", type: "melee", damage: 79, durability: 70, rarity: "rare", comboRate: 0.12 },
  { id: "龙抄剑", name: "龙抄剑", type: "melee", damage: 88, durability: 66, rarity: "rare", comboRate: 0.12 },
  { id: "长骑枪", name: "长骑枪", type: "melee", damage: 90, durability: 80, rarity: "rare", comboRate: 0.12 },

  // 史诗 (epic) - 最强武器，极难掉落
  { id: "武士刀", name: "武士刀", type: "melee", damage: 99, durability: 40, rarity: "epic", comboRate: 0.15 },
  { id: "唐横刀", name: "唐横刀", type: "melee", damage: 102, durability: 70, rarity: "epic", comboRate: 0.15 },
  { id: "电锯", name: "电锯", type: "melee", damage: 105, durability: 120, rarity: "epic", comboRate: 0.15 },

  // 传奇 (legendary) - 最强武器，极难掉落
  { id: "寰宇之剑", name: "寰宇之剑", type: "melee", damage: 118, durability: 100, rarity: "legendary", comboRate: 0.18 },
];

// ---------- 远程武器 ----------
export const RANGED_WEAPONS = [
  // 弓/弩 (箭矢, 暴击率0, 不消耗完整度)
  { id: "木弓", name: "木弓", type: "ranged", damage: 24, integrity: 100, ammoType: "箭矢", critRate: 0, rarity: "common" },
  { id: "反曲弓", name: "反曲弓", type: "ranged", damage: 32, integrity: 100, ammoType: "箭矢", critRate: 0, rarity: "common" },
  { id: "复合弓", name: "复合弓", type: "ranged", damage: 42, integrity: 100, ammoType: "箭矢", critRate: 0, rarity: "uncommon" },
  { id: "十字弩", name: "十字弩", type: "ranged", damage: 52, integrity: 100, ammoType: "箭矢", critRate: 0, rarity: "uncommon" },
  { id: "折叠弩", name: "折叠弩", type: "ranged", damage: 65, integrity: 100, ammoType: "箭矢", critRate: 0, rarity: "rare" },
  { id: "狙击弩", name: "狙击弩", type: "ranged", damage: 80, integrity: 100, ammoType: "箭矢", critRate: 0, rarity: "rare" },

  // 手枪 (暴击率 15-20%)
  { id: "USP9", name: "USP9", type: "ranged", damage: 32, integrity: 100, ammoType: "9×19mm", critRate: 0.16, rarity: "common" },
  { id: "G17", name: "G17", type: "ranged", damage: 30, integrity: 100, ammoType: "9×19mm", critRate: 0.15, rarity: "common" },
  { id: "P226", name: "P226", type: "ranged", damage: 28, integrity: 100, ammoType: "9×19mm", critRate: 0.18, rarity: "common" },
  { id: "GP100", name: "GP100", type: "ranged", damage: 49, integrity: 100, ammoType: ".357 Magnum", critRate: 0.20, rarity: "common" },

  // 冲锋枪 (暴击率 18-22%)
  { id: "UZI", name: "UZI", type: "ranged", damage: 42, integrity: 100, ammoType: "9×19mm", critRate: 0.18, rarity: "uncommon" },
  { id: "MP5", name: "MP5", type: "ranged", damage: 45, integrity: 100, ammoType: "9×19mm", critRate: 0.20, rarity: "uncommon" },
  { id: "MP7", name: "MP7", type: "ranged", damage: 48, integrity: 100, ammoType: "9×19mm", critRate: 0.22, rarity: "uncommon" },
  { id: "Vector", name: "Vector", type: "ranged", damage: 50, integrity: 100, ammoType: "9×19mm", critRate: 0.23, rarity: "uncommon" },

  // 步枪 (暴击率 20-25%)
  { id: "M16A4", name: "M16A4", type: "ranged", damage: 49, integrity: 100, ammoType: "5.56×45mm NATO", critRate: 0.22, rarity: "uncommon" },
  { id: "M4A1", name: "M4A1", type: "ranged", damage: 50, integrity: 100, ammoType: "5.56×45mm NATO", critRate: 0.24, rarity: "uncommon" },
  { id: "HK416", name: "HK416", type: "ranged", damage: 52, integrity: 100, ammoType: "5.56×45mm NATO", critRate: 0.25, rarity: "uncommon" },
  { id: "SG552", name: "SG552", type: "ranged", damage: 53, integrity: 100, ammoType: "5.56×45mm NATO", critRate: 0.23, rarity: "uncommon" },
  { id: "AUG", name: "AUG", type: "ranged", damage: 55, integrity: 100, ammoType: "5.56×45mm NATO", critRate: 0.25, rarity: "rare" },

  // 步枪 (7.62×39mm, 暴击率 20-28%)
  { id: "AK47", name: "AK47", type: "ranged", damage: 55, integrity: 100, ammoType: "7.62×39mm", critRate: 0.20, rarity: "uncommon" },
  { id: "AKM", name: "AKM", type: "ranged", damage: 57, integrity: 100, ammoType: "7.62×39mm", critRate: 0.20, rarity: "uncommon" },
  { id: "81式", name: "81式", type: "ranged", damage: 60, integrity: 100, ammoType: "7.62×39mm", critRate: 0.22, rarity: "uncommon" },
  { id: "SKS", name: "SKS", type: "ranged", damage: 65, integrity: 100, ammoType: "7.62×39mm", critRate: 0.28, rarity: "rare" },

  // 战斗步枪 (7.62×51mm, 暴击率 22-32%)
  { id: "FAL", name: "FAL", type: "ranged", damage: 72, integrity: 100, ammoType: "7.62×51mm", critRate: 0.22, rarity: "rare" },
  { id: "EBR14", name: "EBR14", type: "ranged", damage: 80, integrity: 100, ammoType: "7.62×51mm", critRate: 0.30, rarity: "rare" },
  { id: "SR25", name: "SR25", type: "ranged", damage: 95, integrity: 100, ammoType: "7.62×51mm", critRate: 0.32, rarity: "epic" },

  // 狙击枪 (暴击率 35-45%)
  { id: "M700", name: "M700", type: "ranged", damage: 120, integrity: 100, ammoType: "7.62×51mm", critRate: 0.35, rarity: "rare" },
  { id: "AWM", name: "AWM", type: "ranged", damage: 200, integrity: 100, ammoType: ".300 Winchester Magnum", critRate: 0.45, rarity: "legendary" },

  // 霰弹枪 (暴击率 10-12%，溅射伤害为主)
  { id: "M870", name: "M870", type: "ranged", damage: 60, integrity: 100, ammoType: "12号霰弹", critRate: 0.10, rarity: "uncommon" },
  { id: "AA12", name: "AA12", type: "ranged", damage: 70, integrity: 100, ammoType: "12号霰弹", critRate: 0.12, rarity: "uncommon" },
];

// ---------- 弹药 ----------
export const AMMO = [
  { id: "箭矢", name: "箭矢", type: "ammo", compatibleWith: ["木弓", "反曲弓", "复合弓", "十字弩", "折叠弩", "狙击弩"] },
  { id: ".357 Magnum", name: ".357 Magnum", type: "ammo", compatibleWith: ["GP100"] },
  { id: "9×19mm", name: "9×19mm", type: "ammo", compatibleWith: ["G17", "MP7", "UZI", "MP5", "P226", "USP9", "Vector"] },
  { id: "7.62×39mm", name: "7.62×39mm", type: "ammo", compatibleWith: ["AK47", "AKM", "81式", "SKS"] },
  { id: "5.56×45mm NATO", name: "5.56×45mm NATO", type: "ammo", compatibleWith: ["M4A1", "HK416", "M16A4", "SG552", "AUG"] },
  { id: "7.62×51mm", name: "7.62×51mm", type: "ammo", compatibleWith: ["M700", "FAL", "EBR14", "SR25"] },
  { id: ".300 Winchester Magnum", name: ".300 Winchester Magnum", type: "ammo", compatibleWith: ["AWM"] },
  { id: "12号霰弹", name: "12号霰弹", type: "ammo", compatibleWith: ["AA12", "M870"] },
];

// ---------- 僵尸 ----------
export const ZOMBIES = [
  { id: "普通游荡丧尸", name: "普通游荡丧尸", hp: 120, damage: 16, dodge: 0.05, ability: ["infect"] },
  { id: "腐烂腐尸", name: "腐烂腐尸", hp: 100, damage: 24, dodge: 0, ability: ["infect"] },
  { id: "疾行丧尸", name: "疾行丧尸", hp: 80, damage: 30, dodge: 0.35, ability: ["infect", "screech"] },
  { id: "肥胖臃肿尸", name: "肥胖臃肿尸", hp: 240, damage: 20, dodge: 0, ability: ["infect", "selfDestruct"] },
  { id: "军警丧尸", name: "军警丧尸", hp: 160, damage: 36, dodge: 0.1, ability: ["infect", "corrode"] },
  { id: "群居尸母", name: "群居尸母", hp: 140, damage: 16, dodge: 0, ability: ["summon"] },
  { id: "撕裂狂暴尸", name: "撕裂狂暴尸", hp: 200, damage: 50, dodge: 0.05, ability: ["blind", "corrode"] },
  { id: "酸液喷射尸", name: "酸液喷射尸", hp: 240, damage: 28, dodge: 0.05, ability: ["acid"] },
  { id: "巨型坦克尸", name: "巨型坦克尸", hp: 300, damage: 40, dodge: 0, ability: ["selfDestruct"] },
  { id: "幽灵潜行尸", name: "幽灵潜行尸", hp: 80, damage: 30, dodge: 0.5, ability: ["cloak"] },
];

// ---------- NPC 模板 ----------
export const NPCS = {
  survivor: {
    name: "流浪者",
    hpMin: 100, hpMax: 160,
    damageMin: 20, damageMax: 30,
    hasRanged: 0.3
  },
  bandit: {
    name: "刀疤",
    hpMin: 150, hpMax: 240,
    damageMin: 30, damageMax: 40,
    hasRanged: 0.4
  },
  wanderingTrader: {
    name: "黑市商人",
    hpMin: 200, hpMax: 300,
    damageMin: 30, damageMax: 50,
    hasRanged: 0.6
  },
  doctor: {
    name: "末世游医",
    hpMin: 60, hpMax: 100,
    damageMin: 15, damageMax: 25,
    hasRanged: 0.2
  }
};

// ---------- 阵地 NPC 配置 ----------
export const SURVIVOR_NPC = [
  {
    id: "v",
    name: "V小姐",
    desc: "一个眼神凌厉的女杀手，总是独来独往。她从不主动说话，但偶尔会给你一个冷峻的眼神。",
    dialogues: {
      stranger: [
        "\"别靠太近。\" 她冷冷地说。",
        "她警惕地盯着你，一言不发。",
        "\"这里不欢迎陌生人。\"",
        "她擦拭着匕首，完全无视你的存在。",
        "\"有事？\" 她头也不抬地问。"
      ],
      acquaintance: [
        "\"是你……有事吗？\"",
        "她停下手中的动作，看了你一眼。",
        "\"你还活着，不错。\"",
        "\"别在这晃悠，小心丧尸。\"",
        "\"我没什么好说的。\""
      ],
      friend: [
        "\"来了。\" 她的语气稍微缓和了一些。",
        "她扔给你一把匕首：\"拿着，防身用。\"",
        "\"最近东边的丧尸变多了，小心点。\"",
        "\"你进步了不少。\" 她难得地夸了你一句。",
        "\"需要帮忙？\""
      ],
      close: [
        "\"坐。\" 她指了指旁边的石头。",
        "她递给你一瓶水：\"渴了吧。\"",
        "\"我以前是特种兵……算了，不说这个。\"",
        "\"你是我在这末世唯一信任的人。\"",
        "\"如果我死了，帮我照顾好自己。\""
      ],
      soulmate: [
        "\"终于……找到你了。\" 她眼中第一次出现了温暖。",
        "她紧紧握住你的手：\"我们一起活下去。\"",
        "\"我把我的一切都交给你了。\"",
        "\"不管发生什么，我都会在你身边。\"",
        "\"有你在，这个末世也没那么可怕了。\""
      ]
    },
    tips: [
      "【提示】医院里有很多医疗物资，但丧尸也很多。",
      "【提示】警察局附近有武器刷新，但要小心军警丧尸。",
      "【提示】军用背包在军事检查站刷新概率最高。",
      "【提示】近战武器的耐久低于10时要小心使用。",
      "【提示】感染值超过50会持续掉血，尽快找抗感染血清。"
    ],
    quests: {
      v1: { name: "初见任务", desc: "上交1份食物+1份饮品", reqAffection: 0, require: { food: 1, drinks: 1 }, reward: { item: "小匕首", desc: "小匕首×1" }, story: "\"饿着肚子没法战斗。给我吃的，我给你武器。\" 她用匕首指了指你。" },
      v2: { name: "止血训练", desc: "上交5个止血带", reqAffection: 30, require: { medicine: 5, medicineId: "止血带" }, reward: { item: "指虎刀", desc: "指虎刀×1" }, story: "\"你还不算太弱。\" 她丢过来一把指虎刀。\"这把刀跟着我杀过不少丧尸，别让它蒙羞。\"" },
      v3: { name: "血清任务", desc: "上交8个抗感染血清", reqAffection: 60, require: { medicine: 8, medicineId: "抗感染血清" }, reward: { item: "龙抄剑", desc: "龙抄剑×1" }, story: "\"血清是末世最珍贵的资源之一。\" 她递给你一把龙抄剑。\"你值得用这个了。\"" },
      v4: { name: "困难试炼", desc: "上交8个战地医疗箱", reqAffection: 90, require: { medicine: 8, medicineId: "战地医疗箱" }, reward: { item: "P226", ammo: { type: "9×19mm", count: 50 }, desc: "P226×1 + 9×19mm×50" }, story: "\"你是我见过最顽强的幸存者。\" 她终于露出了真诚的笑容。\"这把P226，是我最后的压箱底了。别让我失望。\"" },
      v5: { name: "急救物资", desc: "提交6个医用急救包+6个抗感染血清", reqAffection: 120, require: { items: [{ type: "medicine", id: "医用急救包", count: 6 }, { type: "medicine", id: "抗感染血清", count: 6 }] }, reward: { item: "UZI", ammo: { type: "9×19mm", count: 50 }, desc: "UZI×1 + 9×19mm×50" }, story: "\"你成长得很快。\" 她递给你一把UZI冲锋枪和几盒子弹。\"这把枪火力猛，适合对付成群的丧尸。别浪费子弹。\"" },
      v6: { name: "终极试炼", desc: "提交所有药品各2个", reqAffection: 150, require: { allMedicine: 2 }, reward: { item: "M4A1", ammo: { type: "5.56×45mm NATO", count: 50 }, desc: "M4A1×1 + 5.56×45mm NATO×50" }, story: "\"你已经超越了我。\" 她郑重地递给你一把M4A1。\"这是我珍藏多年的步枪，现在它属于你了。去创造一个没有丧尸的世界吧。\"" }
    }
  },
  {
    id: "xiaohan",
    name: "苏小涵",
    desc: "一个笑容温暖的女孩，总是热心地帮助阵地里的每一个人。她的背包里似乎永远有喝不完的牛奶。",
    dialogues: {
      stranger: [
        "\"嗨！你是新来的吗？欢迎欢迎！\" 她热情地向你打招呼。",
        "\"你好呀！我叫小涵，以后有什么需要帮忙的尽管说！\"",
        "\"要不要喝杯牛奶？补充营养很重要哦~\"",
        "\"这是我的一点心意，希望你喜欢！\" 她递给你一串自制的护身符。",
        "\"认识你真开心！在这末世能遇到新朋友真好！\""
      ],
      acquaintance: [
        "\"又见面啦！今天感觉怎么样？\"",
        "\"我刚整理完物资，好累呀……\"",
        "\"莉莉又调皮了，真是拿她没办法~\"",
        "\"V姐姐今天心情好像不错呢！\"",
        "\"你今天有什么打算吗？\""
      ],
      friend: [
        "\"来啦！我给你留了一点吃的！\"",
        "\"谢谢你一直照顾我，真的很感谢！\"",
        "\"今天天气真好，要是没有丧尸就好了……\"",
        "\"我做了些饼干，你要不要尝尝？\"",
        "\"有你在，我感觉安全多了。\""
      ],
      close: [
        "\"我们是最好的朋友，对吧？\" 她开心地笑着。",
        "\"告诉你一个秘密……其实我很害怕丧尸……\"",
        "\"你知道吗，我以前是幼儿园老师，那些孩子们都很可爱……\"",
        "\"要是能回到以前就好了……\" 她的眼神有些黯淡。",
        "\"无论发生什么，我们都要一起活下去！\""
      ],
      soulmate: [
        "\"我……我喜欢你！\" 她红着脸小声说。",
        "\"有你在身边，我什么都不怕。\"",
        "\"我们一起建立一个新的家园，好吗？\"",
        "\"你是我在这个世界上最重要的人。\"",
        "\"永远不要离开我，好吗？\""
      ]
    },
    tips: [
      "【提示】水果可以同时补充饱腹和水分，是很好的应急食物。",
      "【提示】饮用水分后会减少口渴值，但注意别喝太多！",
      "【提示】牛奶和优酸乳是我最喜欢的饮品！",
      "【提示】压缩饼干虽然不好吃，但饱腹值很高。",
      "【提示】注意保持饥饿和水分在0%以上，否则会掉血哦！"
    ],
    quests: {
      xh1: { name: "牛奶储备", desc: "提交10盒纯牛奶", reqAffection: 30, require: { drinks: 10, drinkId: "纯牛奶" }, reward: { itemStack: [{ id: "手术包", count: 3 }], desc: "手术包×3" }, story: "\"太好了，有了这些牛奶，阵地的孩子们就不用挨饿了。\" 她从医疗箱里拿出几个手术包。\"这是之前医生给我的，我用不上，给你吧！\"" },
      xh2: { name: "饮品大采购", desc: "提交15盒优酸乳", reqAffection: 60, require: { drinks: 15, drinkId: "优酸乳" }, reward: { itemStack: [{ id: "抗生素", count: 5 }], desc: "抗生素×5" }, story: "\"天哪，这么多优酸乳！\" 她激动地抱了你一下。\"我找了很久的抗生素也给你，就当是谢礼啦！\"" },
      xh0: { name: "初来乍到", desc: "提交任意1个饮品", reqAffection: 0, require: { drinks: 1 }, reward: { itemStack: [{ id: "创可贴", count: 3 }], desc: "创可贴×3" }, story: "\"你是新来的吧？给，这是见面礼！\" 她从包里掏出几个创可贴递给你。\"以后有需要就来阵地的厨房找我！\"" },
      xh4: { name: "罐头收集", desc: "提交所有罐头各1个", reqAffection: 90, require: { allCanned: 1 }, reward: { itemStack: [{ id: "抗感染血清", count: 3 }], desc: "抗感染血清×3" }, story: "\"哇，这么多罐头！\" 苏小涵开心地把罐头分类放好。\"这些够阵地的大家吃好几天了！这些血清是我之前存下来的，给你！\"" },
      xh5: { name: "水果派对", desc: "提交所有水果各1个", reqAffection: 120, require: { allFruits: 1 }, reward: { itemStack: [{ id: "医用急救包", count: 3 }], desc: "医用急救包×3" }, story: "\"天哪！水果！\" 苏小涵的眼睛亮了起来。\"好久没吃过新鲜水果了！我要给大家做水果拼盘！这几个急救包你收好！\"" },
      xh6: { name: "大采购", desc: "提交所有饮品各1个+所有食物各1个", reqAffection: 150, require: { allDrinks: 1, allFoods: 1 }, reward: { itemStack: [{ id: "战地医疗箱", count: 3 }], desc: "战地医疗箱×3" }, story: "\"这、这太多了吧！\" 苏小涵感动得眼眶泛红。\"你把整个超市都搬来了吗？我……我都不知道该怎么谢你！这几个战地医疗箱你一定要收下！\"" }
    }
  },
  {
    id: "lili",
    name: "莉莉丝",
    desc: "一个古灵精怪的少女，总喜欢摆弄各种废弃武器。她说她有个仓库，专门回收废旧近战武器。",
    dialogues: {
      stranger: [
        "\"哇，你是谁呀？新来的吗？\" 她好奇地打量着你。",
        "\"嗨！我是莉莉！你有没有香烟呀？\"",
        "\"看！这是我今天捡到的宝贝！\" 她举起一把生锈的扳手。",
        "\"你要不要和我一起去捡东西？可好玩了！\"",
        "\"V姐姐说我太调皮了……可是捡东西真的很有趣嘛！\""
      ],
      acquaintance: [
        "\"又是你！今天带香烟来了吗？\"",
        "\"我昨天在工厂发现了好多好东西！\"",
        "\"小涵姐姐做的布丁真好吃！\"",
        "\"V姐姐好凶……不过她其实很关心我们的！\"",
        "\"你去过那个超市吗？里面有好多零食！\""
      ],
      friend: [
        "\"来啦来啦！我给你看我新收藏的武器！\"",
        "\"偷偷告诉你，我知道一个秘密基地！\"",
        "\"你帮我保密哦……我半夜会溜出去捡东西。\"",
        "\"香烟香烟！你有多余的香烟吗？\"",
        "\"等我攒够香烟，我要建一个花园！\""
      ],
      close: [
        "\"我们是好朋友对吧？那你要帮我保守秘密哦！\"",
        "\"其实……我有点害怕黑暗……\"",
        "\"你知道吗，我以前想当工程师的……\"",
        "\"要是世界没有丧尸就好了，我好想上学……\"",
        "\"谢谢你一直陪我聊天，你是我最好的朋友！\""
      ],
      soulmate: [
        "\"我……我喜欢你！你愿意和我在一起吗？\"",
        "\"有你在，黑夜也不可怕了！\"",
        "\"我们一起收集好多好多东西，建立一个新世界！\"",
        "\"你是我生命中最重要的人！\"",
        "\"永远永远都不要离开我哦！\""
      ]
    },
    tips: [
      "【提示】近战武器可以在工厂和警察局找到很多！",
      "【提示】香烟是很好的交易货币，记得多收集！",
      "【提示】黑市商人那里可以用香烟换武器哦！",
      "【提示】回收武器可以获得香烟，找我就对啦！",
      "【提示】棒球棍和消防斧是很好用的近战武器！"
    ],
    recycleQuest: { name: "武器回收（永久）", desc: "回收任意近战武器，获得1支随机香烟", reward: { cigarette: true }, story: "\"好东西！\" 她仔细端详着你递来的武器，然后从兜里掏出一支香烟。\"这支给你，够意思吧？\"" },
    recycleRangedQuest: { name: "回收远程武器（永久）", desc: "回收任意远程武器，获得2支随机香烟", reward: 2, story: "\"哟，这玩意儿不错嘛！\" 她眼睛一亮，熟练地把玩着你的远程武器。\"我正好缺零件，这两支烟归你了！\"" },
    repairQuest: { name: "维修枪支（永久）", desc: "上交10支香烟修复一把远程武器的50%完整度", cost: 10, repair: 50, story: "\"把枪给我！\" 莉莉兴奋地接过武器，熟练地拆卸、清理、上油……\"修好啦！{weapon}现在和新的一样好用！\"" },
    repairBowQuest: { name: "修复弓弩（永久）", desc: "消耗5支香烟修复一把弓/弩的50%完整度", cost: 5, repair: 50, story: "\"弓弩我最拿手了！\" 她接过你的弓弩，熟练地调试着。\"以前我可是射箭俱乐部的！{weapon}现在好使多了！\"" },
    cureInfectionQuest: { name: "清除感染（永久）", desc: "消耗10支香烟清除50%感染", cost: 10, cureAmount: 50, story: "\"你看起来不太对劲……\" 她皱起眉头打量着你。\"感染可不是闹着玩的！来，这个能帮你。\" 她给你注射了一针淡黄色的药剂。" },
    giftQuest: { name: "神秘礼物", desc: "领取神秘礼物", reqAffection: 150, reward: { cigarettes: 20, ammo: { type: "9×19mm", count: 50 }, desc: "随机香烟×20 + 9×19mm×50" }, story: "\"嘿嘿，其实我早就给你准备了这个！\" 莉莉从仓库角落拖出一个大箱子。\"20根香烟加上50发子弹，我的全部压箱底了，因为我信任你！\"" }
  }
];

export const OUTLAW_DIALOGUES = [
  "\"你他妈看什么看？想死就直说。\"",
  "\"滚远点，别污染我的空气。\"",
  "\"你这种弱鸡也敢在末世混？\"",
  "\"再看一眼我就把你的眼珠子挖出来。\"",
  "\"这里不欢迎你，趁我还没发火，快滚。\"",
  "\"你活着简直就是浪费资源。\"",
  "\"呵，又一个不知死活的家伙。\"",
  "\"你是不是觉得自己很能打？来试试啊。\"",
  "\"我最讨厌的就是你这种自以为是的幸存者。\"",
  "\"你身上有一股让人恶心的味道。\"",
  "\"再靠近一步，我就让你永远留在这里。\"",
  "\"你觉得你能在我手下撑几个回合？\"",
  "\"滚，别让我说第三遍。\"",
  "\"你走吧，今天心情还算不错，不想杀人。\"",
  "\"趁我还没改变主意，从我眼前消失。\"",
];

export const MECHANIC_DIALOGUES = [
  "\"这年头，能修的东西越来越少了……你有什么要修的吗？\"",
  "\"大扳手、铁管，随便来一样，我就能给你点好东西。\"",
  "\"别看我这样，我以前可是高级技师。\"",
  "\"子弹、食物、水，我这里都有，拿材料来换。\"",
  "\"这鬼地方，能遇到个活人真不容易。你有什么能拿来交易的吗？\"",
];

export const WOLF_DIALOGUES = [
  "\"滚开！我不想和你们这些掠夺者说话！\"",
  "\"你以为我不知道你是什么人？离我远点。\"",
  "\"这世道，人比丧尸更可怕。我已经看透你们这些人了。\"",
  "\"别靠近我，我身上没什么值钱的东西。\"",
  "\"哼，又来一个假装好心的家伙。\"",
];

export const WAREHOUSE_GUARD_DIALOGUES = [
  "\"嘿嘿，这里面有好东西，但就是不给你看！\"",
  "\"想进去？先叫声大哥听听……算了，叫了也不让你进。\"",
  "\"这仓库可是我一个人的地盘，谁也别想进来。\"",
  "\"你看起来挺能打的，但我就是不开门，你能拿我怎么样？\"",
  "\"仓库里的东西都是我的宝贝，你别打主意了。\"",
];

export const NERVOUS_VETERAN_DIALOGUES = [
  "\"别动！举起手来！这里是军事禁区……呃，曾经是。\"",
  "\"我服役了二十年，别以为你能骗过我！丧尸，都是丧尸！\"",
  "\"砰！哈哈哈哈哈，假的，我没开枪……等一下，这次是真的！\"",
  "\"我是最好的狙击手，听过没？一枪一个小朋友！\"",
  "\"你鬼鬼祟祟地想偷我的装备？我可是有PTSD的！\"",
];

export const DOCTOR_INTRO = "一个戴着厚重眼镜的中年男人——陈博士——坐在研究所的废墟中，手里拿着一管发光的血清。他抬起头推了推眼镜：\"又一个幸存者……我对你没有恶意，但如果你能帮我个忙的话……\"";

export const DOCTOR_DIALOGUES = [
  "\"我研究这个病毒已经三年了，就差最后一步……五十支血清，你拿得出来吗？\"",
  "\"你能活到现在，一定收集了不少血清吧？我需要它们来完成我的研究。\"",
  "\"作为交换，我可以给你我的私人物品……一把M700狙击步枪，还有三十发7.62×51mm子弹。\"",
  "\"我知道这个要求很过分，但这是我的毕生心血……拜托了。\"",
  "\"如果你凑不齐，就请离开吧。我需要的是真正有能力的人。\"",
];

export const ZOMBIE_KING_INTRO = "巢穴深处，一个巨大的身影缓缓站起。它的体型是普通丧尸的三倍，皮肤如同黑色的盔甲，猩红的眼睛死死盯着你。它的身上插满了各种武器残骸，似乎在诉说它战胜过无数挑战者。这就是丧尸巢穴真正的主人——尸王·寂灭。它没有咆哮，但那种压迫感让你的心脏几乎停止跳动。";

// ---------- 背包类型 ----------
export const BACKPACK_TYPES = {
  口袋: { name: "口袋", capacity: 15 },
  小腰包: { name: "小腰包", capacity: 20 },
  帆布背包: { name: "帆布背包", capacity: 24 },
  运动背包: { name: "运动背包", capacity: 28 },
  登山背包: { name: "登山背包", capacity: 32 },
  军用背包: { name: "军用背包", capacity: 36 },
  战术背包: { name: "战术背包", capacity: 42 },
  大型登山背包: { name: "大型登山背包", capacity: 48 },
  超大旅行背包: { name: "超大旅行背包", capacity: 56 },
};

// rarity: common(普通) > uncommon(优秀) > rare(稀有) > epic(史诗)
export const LOOT_BACKPACKS = [
  // 普通 (common)
  { id: "小腰包", name: "小腰包", type: "backpack", capacity: 20, rarity: "common" },
  { id: "帆布背包", name: "帆布背包", type: "backpack", capacity: 24, rarity: "common" },

  // 优秀 (uncommon)
  { id: "运动背包", name: "运动背包", type: "backpack", capacity: 28, rarity: "uncommon" },
  { id: "登山背包", name: "登山背包", type: "backpack", capacity: 32, rarity: "uncommon" },

  // 稀有 (rare)
  { id: "军用背包", name: "军用背包", type: "backpack", capacity: 36, rarity: "rare" },
  { id: "战术背包", name: "战术背包", type: "backpack", capacity: 42, rarity: "rare" },

  // 史诗 (epic) - 最大容量，极难掉落
  { id: "大型登山背包", name: "大型登山背包", type: "backpack", capacity: 48, rarity: "epic" },
  { id: "超大旅行背包", name: "超大旅行背包", type: "backpack", capacity: 56, rarity: "epic" },
];

// ---------- 地图 ----------
export const MAPS = [
  { id: "曙光阵地", name: "曙光阵地", danger: "½☆安全", encounterRate: 0, noZombie: true,
    lootTable: { empty: 100 } },
  { id: "山顶废弃瞭望塔", name: "山顶废弃瞭望塔", danger: "★安全", encounterRate: 0.01,
    lootTable: { food: 24, drink: 24, ammo: 5, fruit: 20, cigarette: 1, melee: 1, medicine: 5, backpack: 10, empty: 10 } },
  { id: "乡村废弃谷仓", name: "乡村废弃谷仓", danger: "★安全", encounterRate: 0.03,
    lootTable: { food: 30, drink: 30, melee: 15, fruit: 15, medicine: 5, building: 5, seed: 10, empty: 5 } },
  { id: "深山农家乐村落", name: "深山农家乐村落", danger: "★安全", encounterRate: 0.1,
    lootTable: { food: 30, drink: 30, fruit: 20, medicine: 5, building: 5, seed: 10, melee: 5, empty: 10 } },
  { id: "河边露营地", name: "河边露营地", danger: "★★低危", encounterRate: 0.12,
    lootTable: { food: 25, drink: 25, melee: 10, medicine: 15, fruit: 15, building: 5, seed: 8, backpack: 5, empty: 5 } },
  { id: "国道高速服务区", name: "国道高速服务区", danger: "★★低危", encounterRate: 0.2,
    lootTable: { food: 30, drink: 30, melee: 5, medicine: 10, fruit: 15, empty: 10 } },
  { id: "高校大学城", name: "高校大学城", danger: "★★低危", encounterRate: 0.15,
    lootTable: { food: 25, drink: 25, medicine: 10, fruit: 20, backpack: 10, empty: 10 } },
  { id: "城郊废弃加油站", name: "城郊废弃加油站", danger: "★★低危", encounterRate: 0.18,
    lootTable: { food: 20, drink: 25, melee: 15, medicine: 5, fruit: 10, ammo: 15, empty: 10 } },
  { id: "市中心综合商场", name: "市中心综合商场", danger: "★★★中危", encounterRate: 0.35,
    lootTable: { food: 25, drink: 25, melee: 10, medicine: 10, fruit: 10, backpack: 10, ammo: 5, empty: 5 } },
  { id: "老旧居民小区", name: "老旧居民小区", danger: "★★★中危", encounterRate: 0.35,
    lootTable: { food: 20, drink: 20, melee: 15, medicine: 15, backpack: 10, building: 8, fruit: 10, empty: 10 } },
  { id: "工业园区/加工厂", name: "工业园区/加工厂", danger: "★★★中危", encounterRate: 0.35,
    lootTable: { food: 10, drink: 10, melee: 30, backpack: 15, fruit: 10, ammo: 5, cigarette: 10, building: 10, empty: 10 } },
  { id: "江边港口码头", name: "江边港口码头", danger: "★★★中危", encounterRate: 0.35,
    lootTable: { food: 15, drink: 15, melee: 15, ammo: 15, fruit: 10, ranged: 5, backpack: 15, empty: 10 } },
  { id: "连锁大型仓储超市", name: "连锁大型仓储超市", danger: "★★★中危", encounterRate: 0.35,
    lootTable: { food: 25, drink: 25, medicine: 10, fruit: 15, building: 8, backpack: 15, empty: 10 } },
  { id: "废弃工厂仓库", name: "废弃工厂仓库", danger: "★★★中危", encounterRate: 0.4,
    lootTable: { food: 10, drink: 10, melee: 20, ammo: 10, fruit: 10, ranged: 5, cigarette: 10, backpack: 15, medicine: 5, building: 15, empty: 5 } },
  { id: "城郊大型医院", name: "城郊大型医院", danger: "★★★★高危", encounterRate: 0.5,
    lootTable: { medicine: 40, ammo: 10, fruit: 15, food: 10, drink: 10, melee: 5, empty: 10 } },
  { id: "废弃警察局", name: "废弃警察局", danger: "★★★★高危", encounterRate: 0.55,
    lootTable: { melee: 15, ranged: 15, ammo: 25, medicine: 10, backpack: 10, fruit: 10, food: 5, drink: 5, empty: 5 } },
  { id: "军事检查站", name: "军事检查站", danger: "★★★★高危", encounterRate: 0.55,
    lootTable: { melee: 10, ranged: 15, ammo: 30, medicine: 15, backpack: 10, fruit: 5, food: 5, drink: 5, empty: 5 } },
  { id: "地下地铁隧道", name: "地下地铁隧道", danger: "★★★★★绝境", encounterRate: 0.6,
    lootTable: { ammo: 20, ranged: 15, melee: 15, food: 10, drink: 10, medicine: 10, fruit: 10, backpack: 5, empty: 5 } },
  { id: "生化研究所", name: "生化研究所", danger: "★★★★★绝境", encounterRate: 0.7,
    lootTable: { medicine: 25, ammo: 20, ranged: 15, food: 5, drink: 5, fruit: 10, cigarette: 10, empty: 10 } },
  { id: "丧尸巢穴", name: "丧尸巢穴", danger: "★★★★★★炼狱", encounterRate: 0.8,
    lootTable: { melee: 10, ranged: 20, ammo: 25, medicine: 15, fruit: 5, food: 5, drink: 5, cigarette: 10, empty: 5 } },
];

export const NURSE_ZOMBIE_INTRO = "一个穿着破烂护士服的女性丧尸蜷缩在角落里，你隐约还能看出她胸牌上的名字——「露露薇」。她的眼睛竟然还保留着一丝人类的理智，盯着你手中的食物，喉咙里发出微弱的呜咽声。";

export const CANNED_FOOD_IDS = ["黄桃罐头", "豆类罐头", "牛肉罐头", "军粮罐头", "沙丁鱼罐头", "金枪鱼罐头", "秋刀鱼罐头", "青花鱼罐头"];

// ---------- 交易模板 ----------
export const TRADE_TEMPLATES = [
  { ammoType: "9×19mm", ammoPerItem: 5 },
  { ammoType: ".357 Magnum", ammoPerItem: 3 },
  { ammoType: "9×19mm", ammoPerItem: 4 },
  { ammoType: ".357 Magnum", ammoPerItem: 4 },
];

// ---------- 内部工具函数 ----------
/** 从数组中随机选取一个元素 */
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** 根据权重函数从数组中加权随机选取（返回原始对象） */
const weightedRandom = (arr, weightFn) => {
  const weighted = arr.map(item => ({ item, weight: weightFn(item) }));
  const total = weighted.reduce((sum, e) => sum + e.weight, 0);
  let r = Math.random() * total;
  for (const { item, weight } of weighted) {
    r -= weight;
    if (r <= 0) return item;
  }
  return weighted[0].item; // 保底
};

/** 根据权重表（Record<string, number>）随机返回 key */
const rollWeightedKey = (table) => {
  const entries = Object.entries(table);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  return null;
};

/** 随机整数 [min, max] */
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ---------- 按 ID 查找函数 ----------
export function getMapById(id) {
  return MAPS.find((m) => m.id === id);
}
export function getFoodById(id) {
  return FOODS.find((f) => f.id === id);
}
export function getFruitById(id) {
  return FRUITS.find((f) => f.id === id);
}
export function getDrinkById(id) {
  return DRINKS.find((d) => d.id === id);
}
export function getMedicineById(id) {
  return MEDICINES.find((m) => m.id === id);
}
export function getMeleeById(id) {
  return MELEE_WEAPONS.find((w) => w.id === id);
}
export function getRangedById(id) {
  return RANGED_WEAPONS.find((w) => w.id === id);
}
export function getAmmoById(id) {
  return AMMO.find((a) => a.id === id);
}
export function getCigaretteById(id) {
  return CIGARETTES.find((c) => c.id === id);
}

// ---------- 游戏逻辑函数 ----------

/** 根据当前地图的地图名精确分配丧尸池，代替旧版星数阈值分配 */
export function getRandomZombie(map) {
  /** 低危丧尸池（★安全 地图） */
  const lowPool = ZOMBIES.filter((z) =>
    ["普通游荡丧尸", "腐烂腐尸"].includes(z.id)
  );
  /** 中低危丧尸池（★★低危 地图） */
  const midLowPool = ZOMBIES.filter((z) =>
    ["普通游荡丧尸", "腐烂腐尸", "肥胖臃肿尸", "疾行丧尸"].includes(z.id)
  );
  /** 中危丧尸池（★★★中危 地图） */
  const midPool = ZOMBIES.filter((z) =>
    ["普通游荡丧尸", "腐烂腐尸", "肥胖臃肿尸", "疾行丧尸", "军警丧尸", "群居尸母"].includes(z.id)
  );
  /** 高危丧尸池（★★★★高危 地图） */
  const highPool = ZOMBIES.filter((z) =>
    ["肥胖臃肿尸", "疾行丧尸", "军警丧尸", "群居尸母", "撕裂狂暴尸", "酸液喷射尸"].includes(z.id)
  );
  /** 绝境丧尸池（★★★★★绝境 地图） */
  const extremePool = ZOMBIES.filter((z) =>
    ["军警丧尸", "群居尸母", "撕裂狂暴尸", "酸液喷射尸", "巨型坦克尸", "幽灵潜行尸"].includes(z.id)
  );

  const mapId = map.id;
  const poolMap = {
    "曙光阵地": [],
    "山顶废弃瞭望塔": lowPool,
    "乡村废弃谷仓": lowPool,
    "深山农家乐村落": lowPool,
    "河边露营地": midLowPool,
    "国道高速服务区": midLowPool,
    "高校大学城": midLowPool,
    "城郊废弃加油站": midLowPool,
    "市中心综合商场": midPool,
    "老旧居民小区": midPool,
    "工业园区/加工厂": midPool,
    "江边港口码头": midPool,
    "连锁大型仓储超市": midPool,
    "废弃工厂仓库": midPool,
    "城郊大型医院": highPool,
    "废弃警察局": highPool,
    "军事检查站": highPool,
    "地下地铁隧道": extremePool,
    "生化研究所": extremePool,
    "丧尸巢穴": [...ZOMBIES],
  };

  const pool = poolMap[mapId] || lowPool;
  if (pool.length === 0) return null;
  return randomItem(pool);
}

/** 从地图的战利品表中随机拾取一件物品（深拷贝） */
export function pickRandomLoot(map) {
  const type = rollWeightedKey(map.lootTable);
  if (!type || type === "empty") return null;

  // 各类物品生成逻辑（保持原行为不变）
  switch (type) {
    case "food":
      return { ...randomItem(FOODS) };
    case "drink":
      return { ...randomItem(DRINKS) };
    case "fruit":
      return { ...randomItem(FRUITS) };
    case "cigarette":
      return { ...randomItem(CIGARETTES) };
    case "medicine": {
      const rarityWeights = { common: 20, uncommon: 12, rare: 6, epic: 3 };
      const medicine = weightedRandom(MEDICINES, m => rarityWeights[m.rarity] || 1);
      return { ...medicine };
    }
    case "backpack": {
      const rarityWeights = { common: 20, uncommon: 12, rare: 6, epic: 3 };
      const backpack = weightedRandom(LOOT_BACKPACKS, b => rarityWeights[b.rarity] || 1);
      return { ...backpack };
    }
    case "melee": {
      const rarityWeights = { common: 20, uncommon: 12, rare: 6, epic: 3, legendary: 1 };
      const melee = weightedRandom(MELEE_WEAPONS.filter(w => w.id !== "拳头"), w => rarityWeights[w.rarity] || 1);
      return { ...melee, currentDurability: melee.durability };
    }
    case "ranged": {
      const rarityWeights = { common: 20, uncommon: 12, rare: 6, epic: 3, legendary: 1 };
      const weapon = weightedRandom(RANGED_WEAPONS, w => rarityWeights[w.rarity] || 1);
      return { ...weapon };
    }
    case "ammo": {
      const isLowDanger = map && (map.danger.includes("★安全") || map.danger.includes("★★低危"));
      const isMidDanger = map && map.danger.includes("★★★中危");
      const arrowChance = isLowDanger ? 0.5 : (isMidDanger ? 0.3 : 0.1);
      if (Math.random() < arrowChance) {
        return { id: "箭矢", name: "箭矢", type: "ammo", count: randInt(3, 8) };
      }
      const ammo = randomItem(AMMO.filter(a => a.id !== "箭矢"));
      return { ...ammo, count: randInt(5, 24) };
    }
    case "building": {
      const buildingItem = randomItem(BUILDING_MATERIALS);
      return { ...buildingItem };
    }
    default:
      return null;
  }
}

/** 随机获取一个交易模板 */
export function getRandomTrade() {
  return randomItem(TRADE_TEMPLATES);
}

/** 根据 NPC 类型创建实例 */
export function createNpcInstance(type) {
  const def = NPCS[type];
  const hp = randInt(def.hpMin, def.hpMax);
  const damage = randInt(def.damageMin, def.damageMax);
  const hasRanged = Math.random() < def.hasRanged;
  return { type, name: def.name, hp, maxHp: hp, damage, hasRanged };
}

/** 生成 NPC 的随机掉落物列表 */
export function generateNpcLoot() {
  const count = randInt(2, 4); // 原 Math.floor(Math.random()*3)+2 => 2~4
  const loot = [];
  const pools = [
    () => ({ ...randomItem(FOODS) }),
    () => ({ ...randomItem(DRINKS) }),
    () => {
      const a = randomItem(AMMO);
      return { ...a, count: randInt(3, 12) }; // 原 floor(rand*10)+3 => 3~12
    },
    () => ({ ...randomItem(MEDICINES) }),
  ];

  for (let i = 0; i < count; i++) {
    loot.push(randomItem(pools)());
  }
  return loot;
}