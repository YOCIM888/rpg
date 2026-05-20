import {
  getState, setPhase, setStory, setOptions,
  removeRoyalCoins, advanceTime, updateStatusEffects, checkDeath,
} from '../state.js';

import { SPECIAL_ITEMS } from '../config.js';

import { hasCastleIdentity, getCastleRankName } from '../faction.js';

import { BAR_OPEN_PHASES, BAR_MENU } from '../data/island/bar-menu.js';

import { refreshIslandMenu } from './index.js';

export function handleBar() {
  const state = getState();
  if (!hasCastleIdentity(state) && !state.other.some(i => i.id === SPECIAL_ITEMS.castle_pass.id)) {
    setStory('门口的侍者拦住了你："抱歉，先生。这里是贵族专属场所，请出示您的身份牌或城堡通行证。"');
    refreshIslandMenu();
    return;
  }
  if (!BAR_OPEN_PHASES.includes(state.phaseIndex)) {
    setStory('酒吧大门紧闭，门上挂着一块牌子："营业时间：傍晚至凌晨"。');
    refreshIslandMenu();
    return;
  }
  const opts = BAR_MENU.map((item, i) => ({
    text: `${item.name}（${item.price}币）`,
    action: "bar_order",
    menuIndex: i,
  }));
  opts.push({ text: "离开", action: "bar_leave" });
  setPhase("island_bar");
  setStory('末日城堡的凯伦国王投资的酒吧，坐落在余墨公爵的岛屿中心地段。贵族们来来往往，岛上饮酒作乐与纸醉金迷的生活，就像城堡那样，好像末日从未发生一样。调酒师看着你，问道"先生？今晚喝点什么？"');
  setOptions(opts);
}

export function handleBarAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const option = state.options[optIdx];
  const action = option.action;

  if (action === "bar_order") {
    const menuItem = BAR_MENU[option.menuIndex];
    if (!menuItem) {
      handleBar();
      return;
    }
    if (state.royalCoins < menuItem.price) {
      setStory('你摸了摸口袋，皇家币不够……');
      handleBar();
      return;
    }
    removeRoyalCoins(menuItem.price);
    const effects = menuItem.effects;
    if (effects.crash) {
      state.crash = Math.max(0, state.crash + effects.crash);
    }
    if (effects.hunger) {
      state.hunger = Math.min(100, state.hunger + effects.hunger);
    }
    if (effects.hydration) {
      state.hydration = Math.min(100, state.hydration + effects.hydration);
    }
    setStory(menuItem.story);
    advanceTime(1);
    updateStatusEffects();
    checkDeath();
    if (!state.gameOver) {
      handleBar();
    }
  } else if (action === "bar_leave") {
    refreshIslandMenu();
  }
}
