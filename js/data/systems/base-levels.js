export const BASE_LEVELS = [
  { name: "幸存者帐篷", bonus: 0, cost: null },
  { name: "幸存者木屋", bonus: 5, cost: { wood: 15, building_mat: 5 }, upgradeFlavor: "你挥汗如雨地搬运木材、敲打铁钉。简陋的帐篷在你手中一点一点地变了模样——墙壁立起来了，屋顶盖上了。当最后一块木板钉牢时，一座结实的小木屋矗立在你面前！" },
  { name: "幸存者石屋", bonus: 10, cost: { wood: 25, building_mat: 10, stone: 10 }, upgradeFlavor: "你拆掉木屋的旧墙，用石头和水泥重新砌筑。锤声叮当响了一整天，灰尘弥漫中，一座厚重的石屋拔地而起。墙壁厚实得连丧尸都撞不塌！" },
  { name: "幸存者房子", bonus: 15, cost: { wood: 40, building_mat: 20, stone: 20, nails: 10 }, upgradeFlavor: "你在石屋的基础上加盖二层，安装玻璃窗，铺设木地板。钢筋水泥间，一座像样的乡间小楼落成了！推开窗，微风吹进来，你恍惚觉得回到了文明世界。" },
  { name: "幸存者别墅", bonus: 20, cost: { wood: 60, building_mat: 35, stone: 35, nails: 25, glass: 10 }, upgradeFlavor: "你一砖一瓦地扩建、装修、造花园。当最后一块琉璃瓦铺上屋顶时，这座气派的别墅终于完工了！在末日废墟中，你拥有了一片属于自己的豪华避风港。" },
];

export const WAREHOUSE_LEVELS = [
  null,
  { wood: 5, building_mat: 3 },
  { wood: 10, building_mat: 5 },
  { wood: 15, building_mat: 8, stone: 5 },
  { wood: 20, building_mat: 12, stone: 10, nails: 5 },
  { wood: 30, building_mat: 18, stone: 15, nails: 10 },
  { wood: 40, building_mat: 25, stone: 20, nails: 15 },
  { wood: 50, building_mat: 35, stone: 30, nails: 20, glass: 5 },
];
