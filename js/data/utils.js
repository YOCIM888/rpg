import { AMMO } from './weapons/index.js';

export const CANNED_FOOD_IDS = ["黄桃罐头", "豆类罐头", "牛肉罐头", "军粮罐头", "沙丁鱼罐头", "金枪鱼罐头", "秋刀鱼罐头", "青花鱼罐头"];

export const TOOL_WEAPON_IDS = ["大扳手", "铁管", "铁铲", "撬棍"];

export const V_TRADE_AMMO_TYPES = AMMO.filter(a => a.id !== "箭矢").map(a => a.id);

export const LILI_REWARD_MEDICINE_IDS = ["止血带", "清创药", "抗生素", "抗感染血清"];

export const XIAOHAN_REWARD_FOOD_IDS = ["压缩饼干", "小麦面包", "牛肉罐头"];
