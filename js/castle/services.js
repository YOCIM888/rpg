import { getState, setPhase, setStory, setOptions, addItem, addCigarettes, advanceTime, updateStatusEffects, checkDeath } from '../state.js';
import { MELEE_WEAPONS, MEDICINES, GAME_CONSTANTS, SPECIAL_ITEMS, CASTLE_RANKS, weightedRandom } from '../config.js';
import { getCastleRank, getCastleRankName, hasCastleIdentity, getHighestObtainedRank, hasAnyDawnIdentity, cleanDualIdentity } from '../faction.js';
import { refreshCastleOutpost } from './outpost.js';
import { refreshCastleInterior } from './interior.js';

export function handleCastleTreatment() {
  const state = getState();
  const rank = getCastleRank(state);
  if (state.lastTreatmentDay === state.day) {
    setStory("您今天已经接受过治疗了，明天再来吧。");
    setPhase("castle_interior");
    setOptions([{ text: "返回大厅", action: "castle_back" }]);
    return;
  }
  setPhase("castle_treatment");
  setStory("城堡医疗室内，几位穿着白大褂的医生正在忙碌。请选择为您治疗的医生：");
  const opts = [];
  const rankName = getCastleRankName(state) || "平民";
  opts.push({ text: rank >= GAME_CONSTANTS.CASTLE.TREATMENT_RANKS[0] ? "见习医生治疗（降低10%感染值）" : "见习医生（伯爵以上可用）", action: "treat_10", disabled: rank < GAME_CONSTANTS.CASTLE.TREATMENT_RANKS[0] });
  opts.push({ text: rank >= GAME_CONSTANTS.CASTLE.TREATMENT_RANKS[1] ? "正式医生治疗（降低30%感染值）" : "正式医生（侯爵以上可用）", action: "treat_30", disabled: rank < GAME_CONSTANTS.CASTLE.TREATMENT_RANKS[1] });
  opts.push({ text: rank >= GAME_CONSTANTS.CASTLE.TREATMENT_RANKS[2] ? "主治医生治疗（降低50%感染值）" : "主治医生（公爵以上可用）", action: "treat_50", disabled: rank < GAME_CONSTANTS.CASTLE.TREATMENT_RANKS[2] });
  opts.push({ text: rank >= GAME_CONSTANTS.CASTLE.TREATMENT_RANKS[3] ? "宫廷医生治疗（降低80%感染值）" : "宫廷医生（储君以上可用）", action: "treat_80", disabled: rank < GAME_CONSTANTS.CASTLE.TREATMENT_RANKS[3] });
  opts.push({ text: "离开", action: "treat_back" });
  setOptions(opts);
}

export function handleTreatConfirm(amount) {
  const state = getState();
  state.infection = Math.max(0, state.infection - amount);
  state.lastTreatmentDay = state.day;
  const doctors = GAME_CONSTANTS.CASTLE.TREATMENT_DOCTORS;
  setStory(`${doctors[amount]}为您进行了精心的治疗。感染值降低了${amount}%（当前感染值：${state.infection}%）。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleInterior();
}

export function handleCastleMeeting() {
  const state = getState();
  const rank = getCastleRank(state);
  const rankName = getCastleRankName(state) || "平民";
  if (rank < GAME_CONSTANTS.CASTLE.MEETING_RANK_REQUIRED) {
    setStory(`会议管理处查看了你的爵位身份牌，礼貌地要求你离开会议厅。\n"这位${rankName}大人，很抱歉您还没有参加会议的资格。"`);
    setPhase("castle_interior");
    setOptions([{ text: "返回大厅", action: "castle_back" }]);
    return;
  }
  if (state.lastMeetingDay === state.day) {
    setStory("您今天已经参加过会议了。");
    setPhase("castle_interior");
    setOptions([{ text: "返回大厅", action: "castle_back" }]);
    return;
  }
  state.lastMeetingDay = state.day;
  addCigarettes(2);
  setStory(`你参加了城堡会议，各位大臣们讨论着物资分配和防御部署。会议结束后，侍从递给你两根香烟作为参会津贴。\n\n获得了2根香烟。`);
  advanceTime(GAME_CONSTANTS.CASTLE.MEETING_TIME_COST);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleInterior();
}

export function handleCastleGarden() {
  const state = getState();
  const rank = getCastleRank(state);
  const rankName = getCastleRankName(state) || "平民";
  if (rank < GAME_CONSTANTS.CASTLE.GARDEN_RANK_REQUIRED) {
    setStory(`后花园禁卫看了看你的爵位身份牌，神情严肃。\n"这位${rankName}大人，留步，您目前还不被允许进入后花园。"`);
    setPhase("castle_interior");
    setOptions([{ text: "返回大厅", action: "castle_back" }]);
    return;
  }
  if (state.day - state.lastGardenDay < GAME_CONSTANTS.CASTLE.GARDEN_COOLDOWN_DAYS) {
    setStory("你最近已经逛过后花园了，过几天再来吧。");
    setPhase("castle_interior");
    setOptions([{ text: "返回大厅", action: "castle_back" }]);
    return;
  }
  state.lastGardenDay = state.day;
  if (Math.random() < GAME_CONSTANTS.CASTLE.GARDEN_MEDICINE_RATE) {
    const gardenMeds = MEDICINES.filter(m => m.rarity === "common" || m.rarity === "uncommon" || m.rarity === "rare");
    const rarityWeights = GAME_CONSTANTS.LOOT.RARITY_WEIGHTS;
    const received = [];
    for (let i = 0; i < GAME_CONSTANTS.CASTLE.GARDEN_MEDICINE_COUNT; i++) {
      const med = weightedRandom(gardenMeds, m => rarityWeights[m.rarity] || 1);
      if (med) {
        addItem({ ...med });
        received.push(med.name);
      }
    }
    setStory(`你在后花园漫步时遇到了皇后。她正在赏花，看到你后微笑着招了招手。\n\n"最近辛苦了，这些医疗用品你拿着，在外面探索时用得着。"\n\n获得了${received.join("、")}。`);
  } else {
    const commonMelee = MELEE_WEAPONS.filter(w => w.type === "melee" && w.rarity === "common" && w.id !== "拳头");
    if (commonMelee.length === 0) {
      setStory("你在后花园闲逛了一圈，什么也没找到。");
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      if (!state.gameOver) refreshCastleInterior();
      return;
    }
    const idx = Math.floor(Math.random() * commonMelee.length);
    const weapon = { ...commonMelee[idx], currentDurability: commonMelee[idx].durability };
    addItem(weapon);
    setStory(`你在后花园闲逛时遇到了国王。国王正在练剑，看到你后点了点头。\n\n"来得正好，这把${weapon.name}是孤王收藏的，送给你防身用。"\n\n获得了${weapon.name}（普通品质近战武器）。`);
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleInterior();
}

export function handleCastleTitleReissue() {
  const state = getState();
  const highest = getHighestObtainedRank(state);
  if (highest < 2) {
    setStory("办事员在档案室翻找了半天，摇了摇头：\"没有可补办的身份牌记录。\"");
    setPhase("castle_interior");
    setOptions([{ text: "返回大厅", action: "castle_back" }]);
    return;
  }
  const rankEntry = CASTLE_RANKS.find(r => r.rank === highest);
  if (!rankEntry) {
    setStory("补办出现错误，请联系管理员。");
    setPhase("castle_interior");
    setOptions([{ text: "返回大厅", action: "castle_back" }]);
    return;
  }
  const hasId = state.other.some(i => i.id === SPECIAL_ITEMS[rankEntry.itemId].id);
  if (hasId) {
    setStory(`您当前已经持有${rankEntry.name}身份牌，无需补办。`);
    setPhase("castle_interior");
    setOptions([{ text: "返回大厅", action: "castle_back" }]);
    return;
  }
  state.other.push({ ...SPECIAL_ITEMS[rankEntry.itemId] });
  setStory(`办事员仔细核对了档案，从保险柜中取出一块崭新的身份牌。\n\n"经查证，您确实曾被授予${rankEntry.name}身份。这是补办的身份牌，请收好。本次补办免费。"\n\n获得【${rankEntry.name}身份牌】！`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleInterior();
}

const CASTLE_WORK_BY_RANK = {
  0: {
    timeCost: 8,
    crashGain: 40,
    story: "你在城堡的工地上干了一整天的苦力——搬砖、扛沙袋、清理马厩……累得腰都直不起来。\n\n你累了一天，又饿又渴！最苦最累的工作，但你获得了工资——一根香烟。",
    storyFull: "你在城堡的工地上干了一整天的苦力——搬砖、扛沙袋、清理马厩……累得腰都直不起来。\n\n你累了一天，又饿又渴！最苦最累的工作，但背包已满，工资香烟未能放入！",
  },
  1: {
    timeCost: 7,
    crashGain: 30,
    story: "你在城堡里干了一天的劳累活——搬运物资、整理仓库、协助工匠……累得够呛。\n\n劳累的工作让你又饿又渴，崩溃度上升了！但你获得了工资——一根香烟。",
    storyFull: "你在城堡里干了一天的劳累活——搬运物资、整理仓库、协助工匠……累得够呛。\n\n劳累的工作让你又饿又渴，崩溃度上升了！但背包已满，工资香烟未能放入！",
  },
  2: {
    timeCost: 6,
    crashGain: 20,
    story: "你在城堡里做了一天的正常工作——管理物资登记、协助守卫巡逻、检查仓库库存……虽然忙碌但还算体面。\n\n正常的工作让你有些疲惫，但你获得了工资——一根香烟。",
    storyFull: "你在城堡里做了一天的正常工作——管理物资登记、协助守卫巡逻、检查仓库库存……虽然忙碌但还算体面。\n\n正常的工作让你有些疲惫，但背包已满，工资香烟未能放入！",
  },
  3: {
    timeCost: 5,
    crashGain: 10,
    story: "你在城堡里轻松地工作了一天——监督下属干活、审核物资报表、偶尔巡视一下……伯爵的身份让工作轻松了不少。\n\n轻松的工作，你获得了工资——一根香烟。",
    storyFull: "你在城堡里轻松地工作了一天——监督下属干活、审核物资报表、偶尔巡视一下……伯爵的身份让工作轻松了不少。\n\n轻松的工作，但背包已满，工资香烟未能放入！",
  },
  4: {
    timeCost: 4,
    crashGain: 0,
    story: "你在城堡里巡视了一圈——检查了各处的防务、听取了守卫的汇报、视察了物资储备……侯爵的身份让你只需走走看看。\n\n巡视完毕，你获得了工资——一根香烟。",
    storyFull: "你在城堡里巡视了一圈——检查了各处的防务、听取了守卫的汇报、视察了物资储备……侯爵的身份让你只需走走看看。\n\n巡视完毕，但背包已满，工资香烟未能放入！",
  },
  5: {
    timeCost: 3,
    crashGain: 0,
    story: "你在城堡里走了个过场——在文件上签了几个字、出席了一个简短的会议、和几位官员寒暄了几句……公爵的身份让一切如此轻松。\n\n走完过场，你获得了工资——一根香烟。",
    storyFull: "你在城堡里走了个过场——在文件上签了几个字、出席了一个简短的会议、和几位官员寒暄了几句……公爵的身份让一切如此轻松。\n\n走完过场，但背包已满，工资香烟未能放入！",
  },
  6: {
    timeCost: 2,
    crashGain: 0,
    story: "你在城堡里坐了一会——品了品茶、翻了翻报告、随口吩咐了几件事……储君殿下的\"工作\"不过如此。\n\n坐了一会，你获得了工资——一根香烟。",
    storyFull: "你在城堡里坐了一会——品了品茶、翻了翻报告、随口吩咐了几件事……储君殿下的\"工作\"不过如此。\n\n坐了一会，但背包已满，工资香烟未能放入！",
  },
};

export function handleCastleWork() {
  const state = getState();
  cleanDualIdentity(state);
  if (hasAnyDawnIdentity(state)) {
    setStory("城堡工头瞥了你一眼：\"曙光阵地的人还想来城堡干活？你怕不是奸细吧？滚！\" 两个卫兵把你架了出去。");
    setPhase("explore");
    setOptions([{ text: "返回", action: "castle_work_back" }]);
    return;
  }
  if (state.lastCastleWorkDay === state.day) {
    setStory("你今天已经在城堡工作过了，明天再来吧。");
    setPhase("explore");
    setOptions([{ text: "返回", action: "castle_work_back" }]);
    return;
  }
  const rank = getCastleRank(state);
  const workConfig = CASTLE_WORK_BY_RANK[rank] || CASTLE_WORK_BY_RANK[0];
  state.lastCastleWorkDay = state.day;
  setPhase("explore");
  state.hunger = Math.max(0, state.hunger - GAME_CONSTANTS.CASTLE.WORK_HUNGER_COST);
  state.hydration = Math.max(0, state.hydration - GAME_CONSTANTS.CASTLE.WORK_HYDRATION_COST);
  state.crash = Math.min(100, (state.crash || 0) + workConfig.crashGain);
  addCigarettes(1);
  setStory(workConfig.story);
  advanceTime(workConfig.timeCost);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    refreshCastleOutpost();
  }
}
