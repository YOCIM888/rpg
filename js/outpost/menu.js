import {
  getState,
  setPhase,
  setStory,
  setOptions,
  addItem,
  advanceTime,
  updateStatusEffects,
  checkDeath,
  canBegToday,
  markBegDone,
} from '../state.js';

import {
  FRUITS,
  GAME_CONSTANTS,
} from '../config.js';

import {
  hasDawnCaptainBadge,
  hasCastleIdentity,
  cleanDualIdentity,
} from '../faction.js';

export function showOutpostOptions() {
  if (getState().gameOver) return;
  setPhase("explore");
  const state = getState();
  const opts = [
    { text: "探索", action: "outpost_explore" },
    { text: "进食", action: "eat" },
    { text: "饮水", action: "drink" },
    { text: "医疗", action: "medicine" },
    { text: "装备", action: "equip" },
    { text: "回家", action: "goHome" },
    { text: "丢弃", action: "discard" },
    { text: "V小姐", action: "npc_v" },
    { text: "苏小涵", action: "npc_xiaohan" },
    { text: "莉莉丝", action: "npc_lili" },
    { text: "沐苗苗", action: "npc_mumiao" },
    { text: "阵地首领", action: "npc_leader" }
  ];
  if (state.phaseIndex >= 1 && state.phaseIndex <= 4) {
    opts.push({ text: "轻松打工", action: "work" });
  }
  opts.push({ text: "乞讨物资", action: "beg_supplies" });
  setOptions(opts);
}

export function handleOutpostExplore() {
  setStory("你四处张望了一下——这里是别人的地盘，偷东西不好吧。");
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showOutpostOptions();
}

export function handleBegSupplies() {
  const state = getState();
  cleanDualIdentity(state);
  if (hasCastleIdentity(state)) {
    setStory("阵地管理员瞥了你一眼：\"哼，城堡的人还来我们这讨饭？要不要脸！\" 周围的人投来鄙夷的目光，你只好灰溜溜地走开。");
    showOutpostOptions();
    return;
  }
  if (!canBegToday()) {
    setStory("今天已经领取了救济，明天再来吧。");
    showOutpostOptions();
    return;
  }
  const fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
  const added1 = addItem({ ...fruit });

  const hasCaptain = hasDawnCaptainBadge(state);
  if (hasCaptain) {
    const fruit2 = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    const added2 = addItem({ ...fruit2 });
    if (added1 || added2) {
      markBegDone();
      setStory(`曙光先锋队长的身份让你多领了一份救济！阵地管理员递给你${fruit.name}和${fruit2.name}。"队长大人，请慢用！"`);
    } else {
      setStory("你的背包已满，无法领取救济物资。");
    }
  } else {
    if (added1) {
      markBegDone();
      setStory(`阵地管理员递给你一份${fruit.name}。"省着点吃，明天再来。"`);
    } else {
      setStory("你的背包已满，无法领取救济物资。");
    }
  }
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  showOutpostOptions();
}
