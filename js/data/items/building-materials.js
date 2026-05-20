export const BUILDING_MATERIALS = [
  { id: "wood", name: "木材", type: "building" },
  { id: "building_mat", name: "建筑材料", type: "building" },
  { id: "stone", name: "石头", type: "building" },
  { id: "nails", name: "铁钉", type: "building" },
  { id: "glass", name: "玻璃", type: "building" },
  { id: "pure_energy", name: "纯净能源", type: "building" },
  { id: "small_nuclear_generator", name: "小核能发电机", type: "building" },
];

export const BUILDING_MATERIAL_NAMES = {};
for (const m of BUILDING_MATERIALS) {
  BUILDING_MATERIAL_NAMES[m.id] = m.name;
}
