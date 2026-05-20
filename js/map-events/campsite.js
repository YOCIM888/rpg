import {
  getState,
  setStory,
  setOptions,
  addItem,
  advanceTime,
  updateStatusEffects,
  checkDeath,
} from '../state.js';

import {
  GAME_CONSTANTS,
  SPECIAL_ITEMS,
  LOOT_BACKPACKS,
} from '../config.js';

import {
  showExploreOptionsState,
} from '../routing.js';

export function handleStinkyTent() {
  const state = getState();
  const hasCaptain = state.other.some(i => i.id === "dawn_captain_badge");
  if (!hasCaptain) {
    setStory("这个帐篷看起来太危险了，还是不进去了。（需要曙光先锋队长徽章）帐篷入口处挂着破烂的布帘，隐约能闻到一股腐烂的气味，令人作呕。");
    showExploreOptionsState();
    return;
  }
  setStory("带领曙光阵地成员作战这么久，什么风浪没见过，进去看看吧。\n\n你掀开布帘，一股浓烈的尸臭味扑面而来。");
  setOptions([
    { text: "进入", action: "stinky_tent_enter" },
    { text: "离开", action: "stinky_tent_leave" },
  ]);
}

export function handleStinkyTentEnter() {
  setStory("帐篷里昏暗潮湿，角落里躺着一具散发尸臭味的女尸。她的衣着虽然已经破旧，但依稀能看出曾经体面。她的手边散落着一些文件和一支录音笔，似乎在临死前还在试图记录什么。\n\n空气中弥漫着令人窒息的腐臭，苍蝇在尸体周围嗡嗡作响。");
  setOptions([
    { text: "翻找", action: "stinky_tent_search" },
    { text: "离开", action: "stinky_tent_leave" },
  ]);
}

export function handleStinkyTentSearch() {
  const state = getState();
  if (state.tentSearched) {
    setStory("你已经翻找过了，除了那支录音笔，这里没有其他有价值的东西了。尸臭味让你一刻也不想多待。");
    showExploreOptionsState();
    return;
  }
  state.tentSearched = true;
  const recorder = SPECIAL_ITEMS.strange_recorder;
  addItem({ ...recorder });
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  setStory(`你在女尸的手边找到了一支录音笔，按下了播放键——\n\n🎙️ 录音内容：\n\n熟悉的男声："念在我们是老朋友，你最好远离阵地那个首领。在末日，真正的秩序本就是要严格整合资源，大家才能活命。"\n\n女声："为什么？"\n\n熟悉的男声："因为他太愚蠢了！只有整合资源才能获取最大的利益，才能对抗尸潮！所以我需要有人为我卖命！"\n\n女声："你一个做房地产的知道什么？"\n\n熟悉的男声："我亲眼看着他那冰冷的态度！我为那阵地首领的妹妹做了那么多，明明她和我是两情相悦的。可他呢？拆散了我们，还不允许我自己出去单干，说什么以集体为中心。"\n\n女声："强扭的瓜不甜，是你太自私了。我要回露营地了。"\n\n女声："报告首领，经过间谍交流，已经收集到了目标对您妹妹的不利言论。"\n\n砰——录音中传来手枪枪声。\n\n熟悉的男声："去你的阵地！老子要自封为王！你们阵地的人一个也别想好过，连你这女人也要背叛我！相信那个断人缘分的首领！"\n\n录音到此结束。你握着录音笔，手心全是冷汗。\n\n📖 获得【奇怪录音笔】\n\n时间推进了1个回合。`);
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}

export function handleLootCorpse() {
  const state = getState();
  if (state.lastLootCorpseDay > 0 && state.day - state.lastLootCorpseDay < GAME_CONSTANTS.MAP_EVENTS.CORPSE_COOLDOWN_DAYS) {
    const remaining = GAME_CONSTANTS.MAP_EVENTS.CORPSE_COOLDOWN_DAYS - (state.day - state.lastLootCorpseDay);
    setStory(`已经翻找得差不多了，再过 ${remaining} 天再来吧`);
    showExploreOptionsState();
    return;
  }
  const backpackIds = LOOT_BACKPACKS.filter(b => b.rarity === "common" || b.rarity === "uncommon").map(b => b.id);
  const pickId = backpackIds[Math.floor(Math.random() * backpackIds.length)];
  const bp = LOOT_BACKPACKS.find(b => b.id === pickId);
  if (!bp) {
    setStory("搜刮尸体时出现了问题。");
    showExploreOptionsState();
    return;
  }
  state.lastLootCorpseDay = state.day;
  const added = addItem({ ...bp });
  if (added) {
    setStory(`你从尸体上搜刮到了一个${bp.name}（容量${bp.capacity}），已放入背包。可通过"装备→更换背包"来装备。`);
  } else {
    setStory(`你从尸体上搜刮到了一个${bp.name}（容量${bp.capacity}），但背包已满，无法携带。`);
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showExploreOptionsState();
  }
}
