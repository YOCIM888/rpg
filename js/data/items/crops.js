export const CROPS = [
  { id: "niupicai", name: "牛皮菜", matureTurns: 12, yield: 1, seedId: "seed_niupicai", seedName: "牛皮菜种子", hunger: 8, hydration: 12 },
  { id: "machixian", name: "马齿苋", matureTurns: 14, yield: 1, seedId: "seed_machixian", seedName: "马齿苋种子", hunger: 6, hydration: 15 },
  { id: "juju", name: "菊苣", matureTurns: 16, yield: 2, seedId: "seed_juju", seedName: "菊苣种子", hunger: 10, hydration: 10 },
  { id: "yangjiang", name: "洋姜", matureTurns: 20, yield: 2, seedId: "seed_yangjiang", seedName: "洋姜种子", hunger: 18 },
  { id: "mushu", name: "木薯", matureTurns: 36, yield: 3, seedId: "seed_mushu", seedName: "木薯种子", hunger: 30 },
  { id: "hongshu", name: "红薯", matureTurns: 32, yield: 3, seedId: "seed_hongshu", seedName: "红薯种子", hunger: 28, hydration: 8 },
  { id: "tudou", name: "土豆", matureTurns: 24, yield: 2, seedId: "seed_tudou", seedName: "土豆种子", hunger: 22 },
  { id: "wujing", name: "芜菁", matureTurns: 22, yield: 2, seedId: "seed_wujing", seedName: "芜菁种子", hunger: 20, hydration: 5 },
  { id: "boluomencan", name: "婆罗门参", matureTurns: 28, yield: 2, seedId: "seed_boluomencan", seedName: "婆罗门参种子", hunger: 24 },
  { id: "luobo", name: "胡萝卜", matureTurns: 26, yield: 2, seedId: "seed_luobo", seedName: "胡萝卜种子", hunger: 18, hydration: 12 },
  { id: "jiucai", name: "韭菜", matureTurns: 14, yield: 1, seedId: "seed_jiucai", seedName: "韭菜种子", hunger: 8, hydration: 8 },
  { id: "gouqi", name: "枸杞", matureTurns: 20, yield: 2, seedId: "seed_gouqi", seedName: "枸杞种子", hunger: 10, hydration: 15 },
  { id: "suanmo", name: "酸模", matureTurns: 16, yield: 1, seedId: "seed_suanmo", seedName: "酸模种子", hunger: 8, hydration: 18 },
  { id: "heimai", name: "黑麦", matureTurns: 40, yield: 4, seedId: "seed_heimai", seedName: "黑麦种子", hunger: 32 },
  { id: "wandou", name: "豌豆", matureTurns: 28, yield: 3, seedId: "seed_wandou", seedName: "豌豆种子", hunger: 20, hydration: 10 },
];

export const SEEDS = CROPS.map(crop => ({
  id: crop.seedId,
  name: crop.seedName,
  type: "seed",
  cropId: crop.id,
}));

export const CROP_FOOD_MAP = {};
for (const crop of CROPS) {
  const foodItem = { id: crop.id, name: crop.name, type: "food", hunger: crop.hunger };
  if (crop.hydration) foodItem.hydration = crop.hydration;
  CROP_FOOD_MAP[crop.id] = foodItem;
}
