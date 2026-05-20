export const INVEST_AMOUNTS = [10, 20, 50, 80, 100];

export const INVEST_DURATION_DAYS = 5;

export const INVEST_DIRECTIONS = [
  {
    id: "realestate",
    name: "投资房产",
    outcomes: [
      { probability: 0.05, returnRate: 0.5, desc: "岛上地价暴涨！你的房产投资获得了丰厚回报！" },
      { probability: 0.15, returnRate: 0.3, desc: "房产市场小幅上涨，你获得了一些收益。" },
      { probability: 0.80, returnRate: -0.3, desc: "房产市场低迷，你的投资亏损了。" },
    ],
  },
  {
    id: "food",
    name: "投资食品",
    outcomes: [
      { probability: 0.50, returnRate: 0.1, desc: "食品需求稳定，你获得了一些收益。" },
      { probability: 0.30, returnRate: 0, desc: "食品市场平稳，你的投资不赚不赔。" },
      { probability: 0.20, returnRate: -0.1, desc: "食品供应过剩，你的投资小幅亏损。" },
    ],
  },
  {
    id: "entertainment",
    name: "投资娱乐",
    outcomes: [
      { probability: 0.01, returnRate: 0.9, desc: "娱乐项目一炮而红！你赚得盆满钵满！" },
      { probability: 0.04, returnRate: 0.5, desc: "娱乐项目反响不错，你获得了可观的收益。" },
      { probability: 0.05, returnRate: 0.1, desc: "娱乐项目勉强回本，你获得了一点收益。" },
      { probability: 0.20, returnRate: -0.4, desc: "娱乐项目反响平平，你亏损了不少。" },
      { probability: 0.30, returnRate: -0.6, desc: "娱乐项目无人问津，你亏损严重。" },
      { probability: 0.40, returnRate: -0.8, desc: "娱乐项目彻底失败，你的投资几乎血本无归。" },
    ],
  },
  {
    id: "tech",
    name: "投资科技",
    outcomes: [
      { probability: 0.30, returnRate: 0.2, desc: "科技研发取得进展，你获得了一些收益。" },
      { probability: 0.20, returnRate: 0, desc: "科技研发仍在进行，你的投资不赚不赔。" },
      { probability: 0.50, returnRate: -0.1, desc: "科技研发遇到瓶颈，你的投资小幅亏损。" },
    ],
  },
  {
    id: "agriculture",
    name: "投资农业",
    outcomes: [
      { probability: 0.10, returnRate: 0.3, desc: "今年风调雨顺，农作物大丰收！你获得了丰厚回报！" },
      { probability: 0.05, returnRate: 0.1, desc: "农业收成尚可，你获得了一点收益。" },
      { probability: 0.80, returnRate: 0, desc: "农业收成平平，你的投资不赚不赔。" },
      { probability: 0.05, returnRate: -0.2, desc: "遭遇虫害，农作物减产，你的投资小幅亏损。" },
    ],
  },
];
