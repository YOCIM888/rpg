import {
  getState,
  setPhase,
  setStory,
  setOptions,
  addItem,
  advanceTime,
  updateStatusEffects,
  checkDeath,
  removeGasoline,
} from '../state.js';

import {
  GAME_CONSTANTS,
  MAP_NPC_INTROS,
  NAMED_NPCS,
  MEDICINES,
  DEFAULT_ITEM_IDS,
  getRandomZombie,
} from '../config.js';

import {
  showExploreOptionsState,
} from '../routing.js';

import { triggerEnding } from '../game/endings.js';
import { handleGoHome } from '../game/index.js';

export function handleInfectedWoman() {
  const state = getState();
  if (state.liuruyanRescued) {
    setStory(MAP_NPC_INTROS.liuruyan_intro);
    showExploreOptionsState();
    return;
  }
  state.liuruyanDiscovered = true;
  if (state.day <= GAME_CONSTANTS.LIURUYAN.RESCUE_DEADLINE_DAYS) {
    const remaining = GAME_CONSTANTS.LIURUYAN.RESCUE_DEADLINE_DAYS - state.day;
    setPhase("explore");
    setStory(`${MAP_NPC_INTROS.infected_woman_intro}\n\n生命倒计时：还剩 ${remaining} 天`);
    setOptions([
      { text: `给她注射抗感染药剂×${GAME_CONSTANTS.LIURUYAN.SERUM_COST}`, action: "inject_woman" },
      { text: "先不管她吧。", action: "ignore_woman" },
    ]);
  } else {
    setPhase("explore");
    setStory(MAP_NPC_INTROS.infected_woman_zombie);
    setOptions([
      { text: "消灭她（她已变成丧尸）", action: "kill_zombie_woman" },
    ]);
  }
}

export function handleInjectWoman() {
  const state = getState();
  const serumCount = state.medicine.filter(m => m.id === DEFAULT_ITEM_IDS.serum).reduce((sum, m) => sum + (m.count || 1), 0);
  if (serumCount < GAME_CONSTANTS.LIURUYAN.SERUM_COST) {
    setStory(`你的${MEDICINES.find(m => m.id === DEFAULT_ITEM_IDS.serum).name}不够，需要 ${GAME_CONSTANTS.LIURUYAN.SERUM_COST} 支。`);
    handleInfectedWoman();
    return;
  }
  let serumRemaining = GAME_CONSTANTS.LIURUYAN.SERUM_COST;
  for (let i = state.medicine.length - 1; i >= 0 && serumRemaining > 0; i--) {
    if (state.medicine[i].id === DEFAULT_ITEM_IDS.serum) {
      const available = state.medicine[i].count || 1;
      if (available <= serumRemaining) {
        state.medicine.splice(i, 1);
        serumRemaining -= available;
      } else {
        state.medicine[i].count = available - serumRemaining;
        serumRemaining = 0;
      }
    }
  }
  state.liuruyanRescued = true;
  if (!state.unlockedAchievements) state.unlockedAchievements = [];
  if (!state.unlockedAchievements.includes("companion_recruit")) state.unlockedAchievements.push("companion_recruit");
  handleGoHome();
  const serumName = MEDICINES.find(m => m.id === DEFAULT_ITEM_IDS.serum).name;
  setStory(`你颤抖着双手，将${GAME_CONSTANTS.LIURUYAN.SERUM_COST}支${serumName}依次注入她的体内。血清的效果几乎是立竿见影的——她剧烈地咳嗽了几声，皮肤上的溃烂开始肉眼可见地愈合。\n\n她缓缓睁开了眼睛，那是一双棕色的眼眸，清澈而迷茫。\n\n"我……我这是在哪儿？"她虚弱地问道。\n\n你向她说明了情况。她沉默了很久，泪水无声地滑落。\n\n"谢……谢谢。我叫柳如烟。"她的声音很轻，像是用尽了全身的力气。"如果你不嫌弃的话……我想跟着你。虽然我可能帮不上什么大忙，但我可以帮你搜集一些物资……"\n\n你点了点头。\n\n就这样，柳如烟成为了你的伙伴。从今以后，她每天都会出门为你搜集一些物资。\n\n你带着柳如烟安全回到了幸存者帐篷。`);
}

export function handleIgnoreWoman() {
  setStory(MAP_NPC_INTROS.infected_woman_ignore);
  showExploreOptionsState();
}

export function handleKillZombieWoman() {
  const state = getState();
  const zombieDef = getRandomZombie(state.currentMap);
  setPhase("pre_combat");
  state._pendingZombie = zombieDef;
  const crashWarning = state.crash >= GAME_CONSTANTS.CRASH_MAX ? "\n\n⚠ 你的精神状态极差，无法正常战斗！建议先恢复精神再探索。" : "";
  setStory(`曾经的女人已经完全变成了丧尸，她嘶吼着朝你扑了过来！${crashWarning}`);
  setOptions([
    { text: "近战作战", action: "combat_melee" },
    { text: "远程射击", action: "combat_ranged" },
    { text: GAME_CONSTANTS.COMBAT.FLEE_RATE_TEXT, action: "combat_flee" },
  ]);
}

export function handleLiuruyanClassroom() {
  const state = getState();
  if (!state.liuruyanRescued) {
    setStory(MAP_NPC_INTROS.liuruyan_classroom_none);
    showExploreOptionsState();
    return;
  }
  if (state.liuruyanQuest4Done) {
    setStory(MAP_NPC_INTROS.liuruyan_quest4_enough);
    setPhase("explore");
    setOptions([
      { text: "上车离开", action: "liuruyan_quest_accept" },
      { text: "再准备一下", action: "liuruyan_reject" },
    ]);
    return;
  }
  if (!state.liuruyanQuest1Done) {
    setStory(MAP_NPC_INTROS.liuruyan_classroom_intro);
    setPhase("explore");
    setOptions([
      { text: "那个座位", action: "liuruyan_seat" },
      { text: "离开", action: "liuruyan_reject" },
    ]);
    return;
  }
  if (!state.liuruyanQuest2Done) {
    setStory(MAP_NPC_INTROS.liuruyan_quest2_intro);
    setPhase("explore");
    setOptions([
      { text: "去体育场", action: "liuruyan_quest_fight" },
      { text: "还没准备好", action: "liuruyan_reject" },
    ]);
    return;
  }
  if (!state.liuruyanQuest3Done) {
    setStory(MAP_NPC_INTROS.liuruyan_quest3_intro);
    setPhase("explore");
    setOptions([
      { text: "用撬棍开门", action: "liuruyan_quest_accept" },
      { text: "先算了", action: "liuruyan_reject" },
    ]);
    return;
  }
  if (!state.liuruyanQuest4Done) {
    if (state.gasoline >= 10) {
      state.liuruyanQuest4Done = true;
      removeGasoline(10);
      triggerEnding("ending_elopement");
      return;
    }
    const need = 10 - state.gasoline;
    setStory(MAP_NPC_INTROS.liuruyan_quest4_intro + "\n\n" + MAP_NPC_INTROS.liuruyan_quest4_need_gas.replace("{need}", need));
    setPhase("explore");
    setOptions([
      { text: "去弄汽油", action: "liuruyan_reject" },
    ]);
    return;
  }
}

export function handleLiuruyanSeat() {
  setStory(MAP_NPC_INTROS.liuruyan_classroom_seat);
  setPhase("explore");
  setOptions([
    { text: "一起去医务室", action: "liuruyan_quest_accept" },
    { text: "下次再说", action: "liuruyan_reject" },
  ]);
}

export function handleLiuruyanReject() {
  showExploreOptionsState();
}

export function handleLiuruyanQuestAccept() {
  const state = getState();
  if (!state.liuruyanQuest1Done) {
    addItem({ id: "万能针剂", name: "万能针剂", type: "medicine" });
    state.liuruyanQuest1Done = true;
    setStory(MAP_NPC_INTROS.liuruyan_quest1_accept);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) {
      setOptions([
        { text: "离开教室", action: "liuruyan_reject" },
      ]);
    }
    return;
  }
  if (state.liuruyanQuest2Done && !state.liuruyanQuest3Done) {
    const stateRef = getState();
    const hasCrowbar = stateRef.meleeWeapon?.id === "撬棍";
    if (!hasCrowbar) {
      setStory(MAP_NPC_INTROS.liuruyan_quest3_need_crowbar);
      setOptions([
        { text: "离开", action: "liuruyan_reject" },
      ]);
      return;
    }
    addItem({ id: "car_key", name: "车钥匙", type: "other" });
    state.liuruyanQuest3Done = true;
    setStory(MAP_NPC_INTROS.liuruyan_quest3_success);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) {
      setOptions([
        { text: "离开", action: "liuruyan_reject" },
      ]);
    }
    return;
  }
}

export function handleLiuruyanQuestReject() {
  showExploreOptionsState();
}

export function handleLiuruyanQuestFight() {
  const state = getState();
  state._pendingNpc = {
    name: NAMED_NPCS.football_zombie.name,
    hp: NAMED_NPCS.football_zombie.hp,
    damage: Math.floor(Math.random() * (NAMED_NPCS.football_zombie.damageMax - NAMED_NPCS.football_zombie.damageMin + 1)) + NAMED_NPCS.football_zombie.damageMin,
    hasRanged: NAMED_NPCS.football_zombie.hasRanged,
    dodgeRate: NAMED_NPCS.football_zombie.dodgeRate,
  };
  state._liuruyanQuest2Combat = true;
  setPhase("pre_combat_npc");
  setStory("一只体型庞大的橄榄球丧尸正在操场上游荡，它穿着破烂的队服，头盔下露出腐烂的脸。它似乎注意到了你们！");
  setOptions([
    { text: "近战作战", action: "combat_npc_melee" },
    { text: "远程射击", action: "combat_npc_ranged" },
    { text: GAME_CONSTANTS.COMBAT.FLEE_RATE_TEXT, action: "combat_npc_flee" },
  ]);
}
