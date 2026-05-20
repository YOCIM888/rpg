import {
  getState,
  setPhase,
  setStory,
  setOptions,
  addItem,
  advanceTime,
  updateStatusEffects,
  checkDeath,
  getItemDisplayName,
} from './state.js';

import {
  CROPS,
  SEEDS,
  CROP_FOOD_MAP,
  GAME_CONSTANTS,
} from './config.js';

import { showBaseBuildOptions } from './routing.js';

export function handlePlantCrop() {
  const state = getState();
  const emptySlot = state.crops.findIndex(c => c === null);
  if (emptySlot === -1) {
    setStory("🌱 你的五块耕地都种满了！等作物成熟收获后，空出位置再来吧。");
    showBaseBuildOptions();
    return;
  }
  if (!state.seeds || state.seeds.length === 0) {
    setStory("🌱 你翻遍了背包，一颗种子都没有。\n\n去沐苗苗那里购买种子，或者照看实验田获得种子吧。");
    showBaseBuildOptions();
    return;
  }
  const availableSeeds = state.seeds.filter(s => (s.count || 1) > 0);
  if (availableSeeds.length === 0) {
    setStory("🌱 你翻遍了背包，一颗种子都没有。\n\n去沐苗苗那里购买种子，或者照看实验田获得种子吧。");
    showBaseBuildOptions();
    return;
  }
  setPhase("seed_select");
  setStory("🌱 选择要种植的种子：\n\n每种种子对应不同的作物，种什么得什么。");
  const opts = availableSeeds.map((seed, i) => ({
    text: `${getItemDisplayName(seed)}`,
    action: "seed_plant",
    index: i,
    seedItem: seed,
  }));
  opts.push({ text: "返回", action: "seed_back", index: -1 });
  setOptions(opts);
}

export function handleSeedSelect(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) {
    showBaseBuildOptions();
    return;
  }
  const option = state.options[optIdx];
  if (option.action === "seed_back") {
    showBaseBuildOptions();
    return;
  }
  if (option.action !== "seed_plant") {
    showBaseBuildOptions();
    return;
  }
  const seedItem = option.seedItem;
  if (!seedItem) {
    showBaseBuildOptions();
    return;
  }
  const cropData = CROPS.find(c => c.seedId === seedItem.id);
  if (!cropData) {
    showBaseBuildOptions();
    return;
  }
  const emptySlot = state.crops.findIndex(c => c === null);
  if (emptySlot === -1) {
    setStory("🌱 没有空余的耕地了！");
    showBaseBuildOptions();
    return;
  }
  if ((seedItem.count || 1) > 1) {
    seedItem.count = (seedItem.count || 1) - 1;
  } else {
    const seedIdx = state.seeds.indexOf(seedItem);
    state.seeds.splice(seedIdx, 1);
  }
  state.crops[emptySlot] = {
    name: cropData.name,
    matureTurns: cropData.matureTurns,
    totalTurns: cropData.matureTurns,
    yield: cropData.yield,
    cropId: cropData.id,
  };
  const daysLeft = Math.ceil(cropData.matureTurns / GAME_CONSTANTS.TURNS_PER_DAY);
  setStory(`🌱 你蹲在耕地[${emptySlot + 1}]前，小心翼翼地将${cropData.seedName}埋进土里，轻轻覆土、浇水。\n\n预计 ${cropData.matureTurns} 回合后就能收获了（大约${daysLeft}天）。收获时可获得 ${cropData.yield} 份${cropData.name}。`);
  advanceTime(1);
  updateStatusEffects();
  checkDeath();
  if (!state.gameOver) {
    showBaseBuildOptions();
  }
}

export function handleViewCrops() {
  const state = getState();
  let lines = [`🌾 【耕地状态】`];
  lines.push(`━━━━━━━━━━━━━━━━━`);
  let hasAny = false;
  for (let i = 0; i < state.crops.length; i++) {
    const crop = state.crops[i];
    if (crop === null) {
      lines.push(`[${i + 1}] ⬜ 空位`);
    } else if (crop.matureTurns <= 0) {
      lines.push(`[${i + 1}] ✅ ${crop.name} —— 已成熟，快来收获吧！`);
      hasAny = true;
    } else {
      const turnsLeft = crop.matureTurns;
      const daysLeft = Math.ceil(turnsLeft / GAME_CONSTANTS.TURNS_PER_DAY);
      const progress = Math.round((1 - turnsLeft / crop.totalTurns) * 100);
      lines.push(`[${i + 1}] 🌱 ${crop.name} —— 还需 ${turnsLeft} 回合（约${daysLeft}天）[${progress}%]`);
      hasAny = true;
    }
  }
  lines.push(`━━━━━━━━━━━━━━━━━`);
  if (!hasAny) {
    lines.push(`💡 所有耕地都空着，种点东西吧！去搞些种子来。`);
  }
  lines.push(`💡 背包最多同时种5块，收获后自动空出位置。`);
  setStory(lines.join("\n"));
  showBaseBuildOptions();
}

export function handleHarvestCrops() {
  const state = getState();
  let harvested = [];
  let foodNames = [];
  for (let i = 0; i < state.crops.length; i++) {
    const crop = state.crops[i];
    if (crop !== null && crop.matureTurns <= 0) {
      const foodTemplate = CROP_FOOD_MAP[crop.cropId];
      if (!foodTemplate) {
        state.crops[i] = null;
        continue;
      }
      const yieldCount = crop.yield || 1;
      let addedCount = 0;
      for (let j = 0; j < yieldCount; j++) {
        const added = addItem({ ...foodTemplate });
        if (!added) {
          if (addedCount > 0) {
            harvested.push(`${crop.name}×${addedCount}`);
            foodNames.push(`${crop.name}×${addedCount}`);
          }
          state.crops[i] = null;
          setStory(`⚠️ 背包已满！只收获了一部分作物。\n\n已收获：${foodNames.join("、")}\n请先清理背包空间再来收获剩余作物。`);
          showBaseBuildOptions();
          return;
        }
        addedCount++;
        foodNames.push(foodTemplate.name);
      }
      harvested.push(`${crop.name}×${yieldCount}`);
      state.crops[i] = null;
    }
  }
  if (harvested.length === 0) {
    setStory("🌾 地里没有可以收获的作物。要么还没成熟，要么根本没种。去【查看耕地】看看吧。");
  } else {
    setStory(`🌾 你挎着篮子走进田地，小心翼翼地摘下成熟的果实。\n\n收获清单：${harvested.join("、")}\n共计 ${foodNames.length} 份食物已存入背包。`);
  }
  showBaseBuildOptions();
}
