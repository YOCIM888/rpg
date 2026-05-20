import {
  getState, setPhase, setStory, setOptions,
  addItem, advanceTime, updateStatusEffects, checkDeath,
  addNpcAffinity, getNpcAffinity, getAffinityLabel,
  canChatToday, incrementChatCount,
} from '../state.js';

import { GAME_CONSTANTS, AFFINITY_MAX } from '../config.js';

import { LINHAN_DIALOGUES } from '../data/dialogues/map-dialogues.js';

import { SEAFOOD_MEALS, SEAFOOD_MEAL_RECIPES } from '../data/items/seafood-meals.js';

import { refreshIslandMenu } from './index.js';

const RARITY_LABELS = { common: "普通", uncommon: "优秀", rare: "稀有", epic: "史诗", legendary: "传说" };

function randomDialogue(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function countFishByRarity(state, rarity) {
  return state.other
    .filter(i => i.type === "fish" && i.rarity === rarity)
    .reduce((sum, i) => sum + (i.count || 1), 0);
}

function removeFishByRarity(state, rarity, count) {
  let remaining = count;
  for (let i = state.other.length - 1; i >= 0 && remaining > 0; i--) {
    const item = state.other[i];
    if (item.type === "fish" && item.rarity === rarity) {
      const available = item.count || 1;
      if (available <= remaining) {
        remaining -= available;
        state.other.splice(i, 1);
      } else {
        item.count = available - remaining;
        remaining = 0;
      }
    }
  }
  return remaining <= 0;
}

export function handleNpcLinhan() {
  const state = getState();
  const affinity = getNpcAffinity("linhan");
  const friendshipLabel = getAffinityLabel(affinity);
  const dialogue = randomDialogue(LINHAN_DIALOGUES);

  let desc = `【岛民林寒】\n一位面容冷峻的中年男子，目光锐利而沉稳。他身上带着海风的咸腥味，双手因常年处理海鱼而布满伤痕。`;
  desc += `\n\n当前好感：${affinity}/${AFFINITY_MAX.linhan}（${friendshipLabel}）`;
  desc += `\n\n${dialogue}`;

  setPhase("island_linhan");
  setStory(desc);
  setOptions([
    { text: "对话", action: "linhan_chat" },
    { text: "毒海鱼处理", action: "linhan_cook" },
    { text: "离开", action: "linhan_leave" },
  ]);
}

export function handleLinhanAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const action = state.options[optIdx].action;

  switch (action) {
    case "linhan_chat":
      handleLinhanChat();
      break;
    case "linhan_cook":
      handleLinhanCook();
      break;
    case "linhan_cook_meal":
      handleLinhanCookMeal(input);
      break;
    case "linhan_cook_back":
      handleNpcLinhan();
      break;
    case "linhan_leave":
      refreshIslandMenu();
      break;
    default:
      handleNpcLinhan();
      break;
  }
}

export function handleLinhanChat() {
  const state = getState();
  if (!canChatToday("linhan")) {
    setStory("林寒摆了摆手：'今天已经聊了很多了，改日再叙吧。'");
    handleNpcLinhan();
    return;
  }
  incrementChatCount("linhan");
  addNpcAffinity("linhan", 1);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) handleNpcLinhan();
}

export function handleLinhanCook() {
  const state = getState();
  const opts = [];
  const fishCost = GAME_CONSTANTS.FISHING.SEAFOOD_FISH_COST;

  for (const recipe of SEAFOOD_MEAL_RECIPES) {
    const meal = SEAFOOD_MEALS.find(m => m.id === recipe.mealId);
    const fishCount = countFishByRarity(state, recipe.fishRarity);
    const rarityLabel = RARITY_LABELS[recipe.fishRarity] || recipe.fishRarity;
    const canCook = fishCount >= fishCost;
    opts.push({
      text: `${meal.name}（${rarityLabel}鱼 ${fishCount}/${fishCost}）`,
      action: "linhan_cook_meal",
      cookRecipe: recipe.mealId,
      disabled: !canCook,
    });
  }
  opts.push({ text: "返回", action: "linhan_cook_back" });

  setPhase("island_linhan");
  setStory("林寒可以帮你处理有毒的海鱼，制作成可食用的海鲜套餐。选择要制作的套餐：");
  setOptions(opts);
}

export function handleLinhanCookMeal(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) return;
  const option = state.options[optIdx];
  if (option.action !== "linhan_cook_meal") return;

  const recipe = SEAFOOD_MEAL_RECIPES.find(r => r.mealId === option.cookRecipe);
  if (!recipe) {
    handleLinhanCook();
    return;
  }

  const fishCost = GAME_CONSTANTS.FISHING.SEAFOOD_FISH_COST;
  const fishCount = countFishByRarity(state, recipe.fishRarity);

  if (fishCount < fishCost) {
    const rarityLabel = RARITY_LABELS[recipe.fishRarity] || recipe.fishRarity;
    setStory(`${rarityLabel}鱼不够，需要${fishCost}条，当前只有${fishCount}条。`);
    handleLinhanCook();
    return;
  }

  removeFishByRarity(state, recipe.fishRarity, fishCost);

  const meal = SEAFOOD_MEALS.find(m => m.id === recipe.mealId);
  addItem({ ...meal, count: 1 });

  advanceTime(1);
  updateStatusEffects();
  checkDeath();

  setStory(`林寒熟练地处理了${fishCost}条${RARITY_LABELS[recipe.fishRarity] || recipe.fishRarity}品质的毒海鱼，制作了1份${meal.name}。`);
  if (!state.gameOver) handleLinhanCook();
}
