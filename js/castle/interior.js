import { getState, setPhase, setStory, setOptions, addItem, advanceTime, updateStatusEffects, checkDeath, getItemDisplayName } from '../state.js';
import { FOODS, DRINKS, FRUITS, GAME_CONSTANTS, UNDERGROUND_STORY, BUILDING_MATERIALS } from '../config.js';
import { getCastleRank, getCastleRankName, hasCastleIdentity } from '../faction.js';
import { showExploreOptionsState } from '../routing.js';
import { handleEatSelect, handleDrinkSelect, handleMedicineSelect, handleGoOut } from '../game/index.js';
import { handleEquipSelect, handleDiscardSelect } from '../equipment.js';
import { refreshCastleOutpost } from './outpost.js';
import { handleCastleKing, handleCastleQueen, handleQueenLateApology, handleQueenPast, handleQueenQuest1, handleQueenQuest2, handleQueenQuest3, handleQueenQuest4, handleCastleBanquet, handleCastleBall, handleCastleRoom, handleCastleSalary, handleKingUnderground, handleKingTradeAWM, handleRoyalTrade, handleRoyalExchange, handleExchangeGouqi, handleExchangeSword, handleRoyalShop, handleRoyalShopBuy } from './royalty.js';
import { handleCastleTreatment, handleTreatConfirm, handleCastleMeeting, handleCastleGarden, handleCastleTitleReissue } from './services.js';
import { handleCastleKingQuest, handleKingQuestSubmit } from './king-quest.js';

export function enterCastleInterior() {
  const state = getState();
  state.currentSubMap = "城堡内部";
  showCastleInterior();
}

export function showCastleInterior() {
  const state = getState();
  state.currentSubMap = "城堡内部";
  setPhase("castle_interior");
  const acidBlock = state.weather === "酸雨";
  setStory("你进入了末日城堡内部。宏伟的大厅内灯火通明，贵族们身着华服觥筹交错，仿佛末日从未降临。");
  refreshCastleInterior();
}

export function refreshCastleInterior() {
  const state = getState();
  setPhase("castle_interior");
  const acidBlock = state.weather === "酸雨";
  const opts = [
    { text: "探索", action: "castle_interior_explore" },
    { text: "进食", action: "eat" },
    { text: "饮水", action: "drink" },
    { text: "医疗", action: "medicine" },
    { text: "装备", action: "equip" },
    { text: "丢弃", action: "discard" },
    { text: acidBlock ? "离开（酸雨无法离开）" : "离开", action: "leave_castle_interior", disabled: acidBlock },
    { text: "见城堡国王", action: "castle_king" },
    { text: "见城堡皇后", action: "castle_queen" },
    { text: "参加贵族宴会", action: "castle_banquet" },
    { text: "参加贵族舞会", action: "castle_ball" },
    { text: "在贵族客房休息", action: "castle_room" },
  ];
  const rank = getCastleRank(state);
  const rankName = getCastleRankName(state) || "平民";
  if (rank >= 2) {
    opts.push({ text: "领取爵位俸禄", action: "castle_salary" });
  }
  opts.push({ text: "进行感染治疗", action: "castle_treatment" });
  opts.push({ text: "爵位补办", action: "castle_reissue" });
  const meetingCooldown = state.lastMeetingDay === state.day ? "（今日已参加）" : "";
  opts.push({ text: `参加城堡会议${meetingCooldown}`, action: "castle_meeting", disabled: state.lastMeetingDay === state.day });
  const gardenCooldown = state.lastGardenDay >= state.day - (GAME_CONSTANTS.CASTLE.GARDEN_COOLDOWN_DAYS - 1) ? `（${GAME_CONSTANTS.CASTLE.GARDEN_COOLDOWN_DAYS - (state.day - state.lastGardenDay)}天后可再来）` : "";
  const gardenDisabled = state.day - state.lastGardenDay < GAME_CONSTANTS.CASTLE.GARDEN_COOLDOWN_DAYS;
  opts.push({ text: `在后花园闲逛${gardenCooldown}`, action: "castle_garden", disabled: gardenDisabled });
  opts.push({ text: "地下区域", action: "castle_underground" });
  opts.push({ text: "王国任务", action: "castle_king_quest" });
  setOptions(opts);
}

export function handleCastleInteriorExplore() {
  const state = getState();
  const hasId = hasCastleIdentity(state);
  const lootTables = [FOODS, DRINKS, FRUITS];
  const pool = lootTables[Math.floor(Math.random() * lootTables.length)];
  const item = pool[Math.floor(Math.random() * pool.length)];
  const added = addItem({ ...item });
  if (added) {
    if (hasId) {
      setStory(`你在城堡的角落发现了一些别人遗落的东西：${getItemDisplayName(item)}。`);
    } else {
      setStory(`你小心翼翼地搜寻，获得了${getItemDisplayName(item)}，但是你的身份被识破了！你被赶了出去！`);
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      if (!state.gameOver) {
        state.currentSubMap = null;
        refreshCastleOutpost();
      }
      return;
    }
  } else {
    if (hasId) {
      setStory("你在城堡里转了转，但背包已经满了，什么也拿不了。");
    } else {
      setStory("你正想搜刮点东西，但背包已经满了。巡逻的守卫注意到了你！你被赶了出去！");
      advanceTime(1);
      updateStatusEffects();
      checkDeath();
      if (!state.gameOver) {
        state.currentSubMap = null;
        refreshCastleOutpost();
      }
      return;
    }
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleInterior();
}

export function handleCastleInteriorAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const option = state.options[optIdx];
  if (option.action === "eat") { handleEatSelect(); return; }
  if (option.action === "drink") { handleDrinkSelect(); return; }
  if (option.action === "medicine") { handleMedicineSelect(); return; }
  if (option.action === "equip") { handleEquipSelect(); return; }
  if (option.action === "discard") { handleDiscardSelect(); return; }
  if (option.action === "castle_interior_explore") { handleCastleInteriorExplore(); return; }
  if (option.action === "leave_castle_interior") {
    if (getState().weather === "酸雨") {
      setStory("外面下着腐蚀性的酸雨，你根本没法出去。还是找个地方待着吧。");
      return;
    }
    handleLeaveCastleInterior(); return;
  }
  if (option.action === "castle_king") { handleCastleKing(); return; }
  if (option.action === "castle_queen") { handleCastleQueen(); return; }
  if (option.action === "queen_late_apology") { handleQueenLateApology(); return; }
  if (option.action === "queen_past") { handleQueenPast(); return; }
  if (option.action === "queen_quest1") { handleQueenQuest1(); return; }
  if (option.action === "queen_quest2") { handleQueenQuest2(); return; }
  if (option.action === "queen_quest3") { handleQueenQuest3(); return; }
  if (option.action === "queen_quest4") { handleQueenQuest4(); return; }
  if (option.action === "queen_royal_trade") { handleRoyalTrade(); return; }
  if (option.action === "queen_royal_exchange") { handleRoyalExchange(); return; }
  if (option.action === "queen_exchange_gouqi") { handleExchangeGouqi(); return; }
  if (option.action === "queen_exchange_sword") { handleExchangeSword(); return; }
  if (option.action === "queen_royal_shop") { handleRoyalShop(); return; }
  if (option.action.startsWith("queen_buy_")) {
    const itemId = option.action.replace("queen_buy_", "");
    handleRoyalShopBuy(itemId);
    return;
  }
  if (option.action === "castle_banquet") { handleCastleBanquet(); return; }
  if (option.action === "castle_ball") { handleCastleBall(); return; }
  if (option.action === "castle_room") { handleCastleRoom(); return; }
  if (option.action === "castle_salary") { handleCastleSalary(); return; }
  if (option.action === "castle_treatment") { handleCastleTreatment(); return; }
  if (option.action === "castle_meeting") { handleCastleMeeting(); return; }
  if (option.action === "castle_garden") { handleCastleGarden(); return; }
  if (option.action === "castle_reissue") { handleCastleTitleReissue(); return; }
  if (option.action === "castle_king_quest") { handleCastleKingQuest(); return; }
  if (option.action === "castle_underground") { handleCastleUnderground(); return; }
  if (option.action === "underground_dismantle") { handleDismantleEquipment(); return; }
  if (option.action === "underground_leave") { refreshCastleInterior(); return; }
  if (option.action === "king_underground") { handleKingUnderground(); return; }
  if (option.action === "king_trade_awm") { handleKingTradeAWM(); return; }
  if (option.action === "castle_back") { refreshCastleInterior(); return; }
  if (option.action === "treat_10") {
    const rank = getCastleRank(getState());
    if (rank < GAME_CONSTANTS.CASTLE.TREATMENT_RANKS[0]) {
      const rn = getCastleRankName(getState()) || "平民";
      setStory(`这位${rn}大人，不好意思，医疗资源有限，我们只给每位伯爵以上的大人安排见习医生。`);
      return;
    }
    handleTreatConfirm(GAME_CONSTANTS.CASTLE.TREATMENT_AMOUNTS[0]); return;
  }
  if (option.action === "treat_30") {
    const rank = getCastleRank(getState());
    if (rank < GAME_CONSTANTS.CASTLE.TREATMENT_RANKS[1]) {
      const rn = getCastleRankName(getState()) || "平民";
      setStory(`这位${rn}大人，不好意思，医疗资源有限，我们只给每位侯爵以上的大人安排正式医生。`);
      return;
    }
    handleTreatConfirm(GAME_CONSTANTS.CASTLE.TREATMENT_AMOUNTS[1]); return;
  }
  if (option.action === "treat_50") {
    const rank = getCastleRank(getState());
    if (rank < GAME_CONSTANTS.CASTLE.TREATMENT_RANKS[2]) {
      const rn = getCastleRankName(getState()) || "平民";
      setStory(`这位${rn}大人，不好意思，医疗资源有限，我们只给每位公爵以上的大人安排主治医生。`);
      return;
    }
    handleTreatConfirm(GAME_CONSTANTS.CASTLE.TREATMENT_AMOUNTS[2]); return;
  }
  if (option.action === "treat_80") {
    const rank = getCastleRank(getState());
    if (rank < GAME_CONSTANTS.CASTLE.TREATMENT_RANKS[3]) {
      const rn = getCastleRankName(getState()) || "平民";
      setStory(`这位${rn}大人，不好意思，医疗资源有限，我们只给每位储君以上的大人安排宫廷医生。`);
      return;
    }
    handleTreatConfirm(GAME_CONSTANTS.CASTLE.TREATMENT_AMOUNTS[3]); return;
  }
  if (option.action === "treat_back") { refreshCastleInterior(); return; }
  if (option.action === "king_quest_submit") { handleKingQuestSubmit(); return; }
  if (option.action === "king_quest_back") { refreshCastleInterior(); return; }
}

export function handleLeaveCastleInterior() {
  const state = getState();
  state.currentSubMap = null;
  setStory("你离开了城堡。");
  showExploreOptionsState();
}

export function handleLeaveCastle() {
  setStory("你离开了末日城堡，回到了野外。");
  handleGoOut();
}

export function handleCastleUnderground() {
  const state = getState();
  if (!state.undergroundKeyObtained) {
    const hasKey = state.other.some(i => i.id === "underground_key");
    if (!hasKey) {
      setStory("厚重的铁门紧锁着，你没有钥匙，无法进入地下区域。");
      refreshCastleInterior();
      return;
    }
  }
  if (state.generatorObtained) {
    setStory(UNDERGROUND_STORY + "\n\n部分核电装置已经被拆除了，剩下的还在安静地运转。再拆的话，城堡恐怕就要停电了。");
    const opts = [
      { text: "返回大厅", action: "castle_back" },
    ];
    setOptions(opts);
    setPhase("castle_interior");
    return;
  }
  setStory(UNDERGROUND_STORY);
  const opts = [
    { text: "拆下设备", action: "underground_dismantle" },
    { text: "离开", action: "underground_leave" },
  ];
  setOptions(opts);
  setPhase("castle_interior");
}

export function handleDismantleEquipment() {
  const state = getState();
  if (state.generatorObtained) {
    setStory("再拆城堡就停电了！");
    refreshCastleInterior();
    return;
  }
  const hasWrench = state.meleeWeapon && state.meleeWeapon.id === GAME_CONSTANTS.ROCKET.DISMANTLE_WEAPON_ID;
  const hasDimBag = state.backpack && state.backpack.id === GAME_CONSTANTS.ROCKET.DISMANTLE_BACKPACK_ID;
  if (!hasWrench && !hasDimBag) {
    setStory("你既没有扳手，也没有合适的背包，什么都做不了。");
    refreshCastleInterior();
    return;
  }
  if (!hasWrench) {
    setStory("你没有扳手，无法卸下这些核电装置的固定螺栓。");
    refreshCastleInterior();
    return;
  }
  if (!hasDimBag) {
    setStory("你没有合适的背包装得下它，看来需要传说中的次元背包了。");
    refreshCastleInterior();
    return;
  }
  const generator = BUILDING_MATERIALS.find(b => b.id === "small_nuclear_generator");
  if (generator) {
    const added = addItem({ ...generator });
    if (added) {
      state.generatorObtained = true;
      setStory("你用大扳手小心翼翼地卸下固定螺栓，将小核能发电机从基座上拆了下来。次元收纳背包的空间刚好能装下这个大家伙。你感到背包微微发热——发电机还在运转。");
    } else {
      setStory("你试图拆下设备，但背包空间不足，无法携带！");
    }
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) refreshCastleInterior();
}
