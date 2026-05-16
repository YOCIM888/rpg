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

// ---------- 香烟 ----------
export const CIGARETTES = [
  { id: "万宝露香烟", name: "万宝露香烟", type: "cigarette" },
  { id: "奇星香烟", name: "奇星香烟", type: "cigarette" },
  { id: "兰星香烟", name: "兰星香烟", type: "cigarette" },
  { id: "芸斯顿香烟", name: "芸斯顿香烟", type: "cigarette" },
  { id: "白乐香烟", name: "白乐香烟", type: "cigarette" },
];

// ---------- 近战武器 ----------
// rarity: common(普通) > uncommon(优秀) > rare(稀有) > epic(史诗)
export const MELEE_WEAPONS = [
  { id: "拳头", name: "拳头", type: "melee", damage: 10, durability: Infinity },

  // 普通 (common) - 常见武器，伤害较低
  { id: "平底锅", name: "平底锅", type: "melee", damage: 30, durability: 80, rarity: "common" },
  { id: "大扳手", name: "大扳手", type: "melee", damage: 36, durability: 50, rarity: "common" },
  { id: "棒球棍", name: "棒球棍", type: "melee", damage: 60, durability: 40, rarity: "common" },
  { id: "铁管", name: "铁管", type: "melee", damage: 50, durability: 35, rarity: "common" },

  // 优秀 (uncommon) - 中等武器
  { id: "小匕首", name: "小匕首", type: "melee", damage: 40, durability: 30, rarity: "uncommon" },
  { id: "屠刀", name: "屠刀", type: "melee", damage: 42, durability: 35, rarity: "uncommon" },
  { id: "警棍", name: "警棍", type: "melee", damage: 50, durability: 50, rarity: "uncommon" },
  { id: "撬棍", name: "撬棍", type: "melee", damage: 60, durability: 55, rarity: "uncommon" },
  { id: "羊角锤", name: "羊角锤", type: "melee", damage: 64, durability: 60, rarity: "uncommon" },
  { id: "消防斧", name: "消防斧", type: "melee", damage: 70, durability: 65, rarity: "uncommon" },

  // 稀有 (rare) - 较强武器
  { id: "指虎刀", name: "指虎刀", type: "melee", damage: 56, durability: 60, rarity: "rare" },
  { id: "大砍刀", name: "大砍刀", type: "melee", damage: 80, durability: 60, rarity: "rare" },

  // 史诗 (epic) - 最强武器，极难掉落
  { id: "武士刀", name: "武士刀", type: "melee", damage: 99, durability: 40, rarity: "epic" },
  { id: "电锯", name: "电锯", type: "melee", damage: 88, durability: 88, rarity: "epic" },
];

// ---------- 远程武器 ----------
export const RANGED_WEAPONS = [
  // 手枪 (暴击率 15-20%)
  { id: "G17", name: "G17", type: "ranged", damage: 30, integrity: 100, ammoType: "9×19mm", critRate: 0.15, rarity: "common" },
  { id: "P226", name: "P226", type: "ranged", damage: 28, integrity: 100, ammoType: "9×19mm", critRate: 0.18, rarity: "common" },
  { id: "GP100", name: "GP100", type: "ranged", damage: 59, integrity: 100, ammoType: ".357 Magnum", critRate: 0.20, rarity: "common" },

  // 冲锋枪 (暴击率 18-22%)
  { id: "UZI", name: "UZI", type: "ranged", damage: 42, integrity: 100, ammoType: "9×19mm", critRate: 0.18, rarity: "uncommon" },
  { id: "MP5", name: "MP5", type: "ranged", damage: 45, integrity: 100, ammoType: "9×19mm", critRate: 0.20, rarity: "uncommon" },
  { id: "MP7", name: "MP7", type: "ranged", damage: 48, integrity: 100, ammoType: "9×19mm", critRate: 0.22, rarity: "uncommon" },

  // 步枪 (暴击率 20-25%)
  { id: "M16A4", name: "M16A4", type: "ranged", damage: 49, integrity: 100, ammoType: "5.56×45mm NATO", critRate: 0.22, rarity: "uncommon" },
  { id: "M4A1", name: "M4A1", type: "ranged", damage: 50, integrity: 100, ammoType: "5.56×45mm NATO", critRate: 0.24, rarity: "uncommon" },
  { id: "HK416", name: "HK416", type: "ranged", damage: 52, integrity: 100, ammoType: "5.56×45mm NATO", critRate: 0.25, rarity: "uncommon" },
  { id: "AK47", name: "AK47", type: "ranged", damage: 55, integrity: 100, ammoType: "7.62×39mm", critRate: 0.20, rarity: "uncommon" },

  // 狙击枪 (暴击率 35-45%)
  { id: "M700", name: "M700", type: "ranged", damage: 120, integrity: 100, ammoType: "7.62×51mm", critRate: 0.35, rarity: "rare" },
  { id: "AWM", name: "AWM", type: "ranged", damage: 200, integrity: 100, ammoType: ".300 Winchester Magnum", critRate: 0.45, rarity: "rare" },

  // 霰弹枪 (暴击率 10-12%，溅射伤害为主)
  { id: "M870", name: "M870", type: "ranged", damage: 60, integrity: 100, ammoType: "12号霰弹", critRate: 0.10, rarity: "uncommon" },
  { id: "AA12", name: "AA12", type: "ranged", damage: 70, integrity: 100, ammoType: "12号霰弹", critRate: 0.12, rarity: "uncommon" },
];

// ---------- 弹药 ----------
export const AMMO = [
  { id: ".357 Magnum", name: ".357 Magnum", type: "ammo", compatibleWith: ["GP100"] },
  { id: "9×19mm", name: "9×19mm", type: "ammo", compatibleWith: ["G17", "MP7", "UZI", "MP5", "P226"] },
  { id: "7.62×39mm", name: "7.62×39mm", type: "ammo", compatibleWith: ["AK47"] },
  { id: "5.56×45mm NATO", name: "5.56×45mm NATO", type: "ammo", compatibleWith: ["M4A1", "HK416", "M16A4"] },
  { id: "7.62×51mm", name: "7.62×51mm", type: "ammo", compatibleWith: ["M700"] },
  { id: ".300 Winchester Magnum", name: ".300 Winchester Magnum", type: "ammo", compatibleWith: ["AWM"] },
  { id: "12号霰弹", name: "12号霰弹", type: "ammo", compatibleWith: ["AA12", "M870"] },
];

// ---------- 僵尸 ----------
export const ZOMBIES = [
  { id: "普通游荡丧尸", name: "普通游荡丧尸", hp: 60, damage: 16, dodge: 0.05, ability: null },
  { id: "腐烂腐尸", name: "腐烂腐尸", hp: 50, damage: 24, dodge: 0, ability: "infect" },
  { id: "疾行丧尸", name: "疾行丧尸", hp: 40, damage: 30, dodge: 0.35, ability: null },
  { id: "肥胖臃肿尸", name: "肥胖臃肿尸", hp: 120, damage: 20, dodge: 0, ability: null },
  { id: "军警丧尸", name: "军警丧尸", hp: 80, damage: 36, dodge: 0.1, ability: null },
  { id: "群居尸母", name: "群居尸母", hp: 70, damage: 16, dodge: 0, ability: "summon" },
  { id: "撕裂狂暴尸", name: "撕裂狂暴尸", hp: 100, damage: 50, dodge: 0.05, ability: null },
  { id: "酸液喷射尸", name: "酸液喷射尸", hp: 120, damage: 28, dodge: 0.05, ability: "acid" },
  { id: "巨型坦克尸", name: "巨型坦克尸", hp: 140, damage: 40, dodge: 0, ability: null },
  { id: "幽灵潜行尸", name: "幽灵潜行尸", hp: 40, damage: 30, dodge: 0.5, ability: "cloak" },
];

// ---------- NPC 模板 ----------
export const NPCS = {
  survivor: {
    name: "幸存者",
    hpMin: 100, hpMax: 160,
    damageMin: 20, damageMax: 30,
    hasRanged: 0.3
  },
  bandit: {
    name: "悍匪",
    hpMin: 150, hpMax: 240,
    damageMin: 30, damageMax: 40,
    hasRanged: 0.4
  },
  wanderingTrader: {
    name: "流浪商人",
    hpMin: 200, hpMax: 300,
    damageMin: 30, damageMax: 50,
    hasRanged: 0.6
  },
  doctor: {
    name: "末日医生",
    hpMin: 60, hpMax: 100,
    damageMin: 15, damageMax: 25,
    hasRanged: 0.2
  }
};

// ---------- 阵地 NPC 配置 ----------
export const SURVIVOR_NPC = [
  {
    id: "v",
    name: "幸存者V",
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
      v2: { name: "止血训练", desc: "上交5个止血带", reqAffection: 30, require: { medicine: 5, medicineId: "止血带" }, reward: { item: "武士刀", desc: "武士刀×1" }, story: "\"你还不算太弱。\" 她丢过来一把武士刀。\"这把刀跟着我杀过不少丧尸，别让它蒙羞。\"" },
      v3: { name: "血清任务", desc: "上交8个抗感染血清", reqAffection: 80, require: { medicine: 8, medicineId: "抗感染血清" }, reward: { item: "电锯", desc: "电锯×1" }, story: "\"血清是末世最珍贵的资源之一。\" 她递给你一把电锯。\"你值得用这个了。\"" },
      v4: { name: "最终试炼", desc: "上交10个战地医疗箱", reqAffection: 150, require: { medicine: 10, medicineId: "战地医疗箱" }, reward: { item: "P226", ammo: { type: "9×19mm", count: 50 }, desc: "P226×1 + 9×19mm×50" }, story: "\"你是我见过最顽强的幸存者。\" 她终于露出了真诚的笑容。\"这把P226，是我最后的压箱底了。别让我失望。\"" }
    }
  },
  {
    id: "xiaohan",
    name: "幸存者小涵",
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
      xh1: { name: "牛奶储备", desc: "提交10盒纯牛奶", reqAffection: 50, require: { drinks: 10, drinkId: "纯牛奶" }, reward: { itemStack: [{ id: "手术包", count: 3 }], desc: "手术包×3" }, story: "\"太好了，有了这些牛奶，阵地的孩子们就不用挨饿了。\" 她从医疗箱里拿出几个手术包。\"这是之前医生给我的，我用不上，给你吧！\"" },
      xh2: { name: "饮品大采购", desc: "提交15盒优酸乳", reqAffection: 100, require: { drinks: 15, drinkId: "优酸乳" }, reward: { itemStack: [{ id: "抗生素", count: 5 }], desc: "抗生素×5" }, story: "\"天哪，这么多优酸乳！\" 她激动地抱了你一下。\"我找了很久的抗生素也给你，就当是谢礼啦！\"" }
    }
  },
  {
    id: "lili",
    name: "幸存者莉莉",
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
      "【提示】流浪商人那里可以用香烟换武器哦！",
      "【提示】回收武器可以获得香烟，找我就对啦！",
      "【提示】棒球棍和消防斧是很好用的近战武器！"
    ],
    recycleQuest: { name: "武器回收（永久）", desc: "回收任意近战武器，获得1支随机香烟", reward: { cigarette: true }, story: "\"好东西！\" 她仔细端详着你递来的武器，然后从兜里掏出一支香烟。\"这支给你，够意思吧？\"" },
    giftQuest: { name: "神秘礼物", desc: "领取神秘礼物", reqAffection: 150, reward: { cigarettes: 20, ammo: { type: "9×19mm", count: 10 }, desc: "随机香烟×20 + 9×19mm×10" }, story: "\"嘿嘿，其实我早就给你准备了这个！\" 莉莉从仓库角落拖出一个大箱子。\"20根香烟加上10发子弹，我的全部压箱底了，因为我信任你！\"" }
  }
];

// ---------- 背包类型 ----------
export const BACKPACK_TYPES = {
  口袋: { name: "口袋", capacity: 15 },
  小腰包: { name: "小腰包", capacity: 20 },
  帆布背包: { name: "帆布背包", capacity: 24 },
  运动背包: { name: "运动背包", capacity: 28 },
  登山背包: { name: "登山包", capacity: 32 },
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
  { id: "登山背包", name: "登山包", type: "backpack", capacity: 32, rarity: "uncommon" },

  // 稀有 (rare)
  { id: "军用背包", name: "军用背包", type: "backpack", capacity: 36, rarity: "rare" },
  { id: "战术背包", name: "战术背包", type: "backpack", capacity: 42, rarity: "rare" },

  // 史诗 (epic) - 最大容量，极难掉落
  { id: "大型登山背包", name: "大型登山背包", type: "backpack", capacity: 48, rarity: "epic" },
  { id: "超大旅行背包", name: "超大旅行背包", type: "backpack", capacity: 56, rarity: "epic" },
];

// ---------- 地图 ----------
export const MAPS = [
  { id: "幸存者阵地", name: "幸存者阵地", danger: "½☆安全", encounterRate: 0, noZombie: true,
    lootTable: { empty: 100 } },
  { id: "山顶废弃瞭望塔", name: "山顶废弃瞭望塔", danger: "★安全", encounterRate: 0.01,
    lootTable: { food: 24, drink: 24, ammo: 5, fruit: 20, cigarette: 1, melee: 1, medicine: 5, backpack: 10, empty: 10 } },
  { id: "乡村废弃谷仓", name: "乡村废弃谷仓", danger: "★安全", encounterRate: 0.03,
    lootTable: { food: 30, drink: 30, melee: 15, fruit: 15, medicine: 5, empty: 5 } },
  { id: "深山农家乐村落", name: "深山农家乐村落", danger: "★安全", encounterRate: 0.1,
    lootTable: { food: 30, drink: 30, fruit: 20, medicine: 5, melee: 5, empty: 10 } },
  { id: "河边露营地", name: "河边露营地", danger: "★★低危", encounterRate: 0.12,
    lootTable: { food: 25, drink: 25, melee: 10, medicine: 15, fruit: 15, backpack: 5, empty: 5 } },
  { id: "国道高速服务区", name: "国道高速服务区", danger: "★★低危", encounterRate: 0.2,
    lootTable: { food: 30, drink: 30, melee: 5, medicine: 10, fruit: 15, empty: 10 } },
  { id: "高校大学城", name: "高校大学城", danger: "★★低危", encounterRate: 0.15,
    lootTable: { food: 25, drink: 25, medicine: 10, fruit: 20, backpack: 10, empty: 10 } },
  { id: "城郊废弃加油站", name: "城郊废弃加油站", danger: "★★低危", encounterRate: 0.18,
    lootTable: { food: 20, drink: 25, melee: 15, medicine: 5, fruit: 10, ammo: 15, empty: 10 } },
  { id: "市中心综合商场", name: "市中心综合商场", danger: "★★★中危", encounterRate: 0.35,
    lootTable: { food: 25, drink: 25, melee: 10, medicine: 10, fruit: 10, backpack: 10, ammo: 5, empty: 5 } },
  { id: "老旧居民小区", name: "老旧居民小区", danger: "★★★中危", encounterRate: 0.35,
    lootTable: { food: 20, drink: 20, melee: 15, medicine: 15, backpack: 10, fruit: 10, empty: 10 } },
  { id: "工业园区/加工厂", name: "工业园区/加工厂", danger: "★★★中危", encounterRate: 0.35,
    lootTable: { food: 10, drink: 10, melee: 30, backpack: 15, fruit: 10, ammo: 5, cigarette: 10, empty: 10 } },
  { id: "江边港口码头", name: "江边港口码头", danger: "★★★中危", encounterRate: 0.35,
    lootTable: { food: 15, drink: 15, melee: 15, ammo: 15, fruit: 10, ranged: 5, backpack: 15, empty: 10 } },
  { id: "连锁大型仓储超市", name: "连锁大型仓储超市", danger: "★★★中危", encounterRate: 0.35,
    lootTable: { food: 25, drink: 25, medicine: 10, fruit: 15, backpack: 15, empty: 10 } },
  { id: "废弃工厂仓库", name: "废弃工厂仓库", danger: "★★★中危", encounterRate: 0.4,
    lootTable: { food: 10, drink: 10, melee: 20, ammo: 10, fruit: 10, ranged: 5, cigarette: 10, backpack: 15, medicine: 5, empty: 5 } },
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
  /** 低危丧尸池（★安全 / ★★低危 地图） */
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
    "幸存者阵地": [],
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
      const rarityWeights = { common: 20, uncommon: 12, rare: 6, epic: 3 };
      const melee = weightedRandom(MELEE_WEAPONS.filter(w => w.id !== "拳头"), w => rarityWeights[w.rarity] || 1);
      return { ...melee, currentDurability: melee.durability };
    }
    case "ranged": {
      const rarityWeights = { common: 25, uncommon: 10, rare: 5 };
      const weapon = weightedRandom(RANGED_WEAPONS, w => rarityWeights[w.rarity] || 1);
      return { ...weapon };
    }
    case "ammo": {
      const ammo = randomItem(AMMO);
      return { ...ammo, count: randInt(5, 24) }; // 原为 5~24，即 floor(rand*20)+5
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