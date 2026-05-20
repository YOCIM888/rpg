import {
  getState,
  setPhase,
  setStory,
  setOptions,
} from '../state.js';

import { showHomeOptions } from '../routing.js';

import {
  handleUpgradeBase,
  handlePlantCrop,
  handleViewCrops,
  handleHarvestCrops,
  handleBuildWarehouse,
  handleOpenWarehouse,
  getBaseName,
} from '../base.js';

export function handleBaseBuild() {
  setPhase("base_build");
  const state = getState();
  setStory(`[${getBaseName(state.baseLevel)}] 你开始规划基地的建设方案……`);
  setOptions([
    { text: "改造基地", action: "upgrade_base" },
    { text: "种植作物", action: "plant_crop" },
    { text: "查看耕地", action: "view_crops" },
    { text: "收获作物", action: "harvest_crops" },
    { text: "建造仓库", action: "build_warehouse" },
    { text: "打开仓库", action: "open_warehouse" },
    { text: "返回", action: "back_to_home" },
  ]);
}

export function handleBaseBuildAction(input) {
  const state = getState();
  const optionIndex = input - 1;
  if (optionIndex < 0 || optionIndex >= state.options.length) return;
  const action = state.options[optionIndex].action;
  if (action === "upgrade_base") { handleUpgradeBase(); return; }
  if (action === "plant_crop") { handlePlantCrop(); return; }
  if (action === "view_crops") { handleViewCrops(); return; }
  if (action === "harvest_crops") { handleHarvestCrops(); return; }
  if (action === "build_warehouse") { handleBuildWarehouse(); return; }
  if (action === "open_warehouse") { handleOpenWarehouse(); return; }
  if (action === "back_to_home") { showHomeOptions(); return; }
  if (action === "back_to_base") { handleBaseBuild(); return; }
  if (action === "back_to_warehouse") { handleOpenWarehouse(); return; }
}
