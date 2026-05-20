export const MEDICINES = [
  { id: "创可贴", name: "创可贴", type: "medicine", effects: { health: 10 }, rarity: "common" },
  { id: "葡萄糖服液", name: "葡萄糖服液", type: "medicine", effects: { health: 25, hydration: 15 }, rarity: "common" },
  { id: "止痛片", name: "止痛片", type: "medicine", effects: { health: 15, crash: -5 }, rarity: "uncommon" },
  { id: "肾上腺素", name: "肾上腺素", type: "medicine", effects: { health: 20, crash: -10 }, rarity: "uncommon" },
  { id: "止血带", name: "止血带", type: "medicine", effects: { health: 30 }, rarity: "uncommon" },
  { id: "清创药", name: "清创药", type: "medicine", effects: { infection: -25 }, rarity: "uncommon" },
  { id: "手术包", name: "手术包", type: "medicine", effects: { health: 25, crash: -10 }, rarity: "rare" },
  { id: "抗生素", name: "抗生素", type: "medicine", effects: { health: 35, infection: -25 }, rarity: "rare" },
  { id: "抗感染血清", name: "抗感染血清", type: "medicine", effects: { infection: -60 }, rarity: "rare" },
  { id: "医用急救包", name: "医用急救包", type: "medicine", effects: { health: 70 }, rarity: "epic" },
  { id: "战地医疗箱", name: "战地医疗箱", type: "medicine", effects: { health: 120, crash: -30 }, rarity: "epic" },
  { id: "万能针剂", name: "万能针剂", type: "medicine", effects: { health: 150, crash: -50, infection: -50, hydration: 20}, rarity: "legendary" },
  { id: "improved_serum", name: "改良抗体针", type: "medicine", effects: { infection: -90 }, rarity: "legendary" },
  { id: "zombie_gel", name: "丧尸凝胶", type: "medicine", effects: null, rarity: "common" },
];

export const NURSE_MEDICINE_POOL = MEDICINES.filter(m => m.rarity === "common" || m.rarity === "uncommon");
