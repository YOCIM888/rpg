export const FISH_RECYCLE_PRICES = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 5,
  legendary: 8,
};

export const SEAFOOD_MEAL_RECIPES = [
  { mealId: "bad_seafood_meal", fishRarity: "common" },
  { mealId: "normal_seafood_meal", fishRarity: "uncommon" },
  { mealId: "delicious_seafood_meal", fishRarity: "rare" },
  { mealId: "tempting_seafood_meal", fishRarity: "epic" },
  { mealId: "top_seafood_meal", fishRarity: "legendary" },
];

export const SEAFOOD_MEALS = [
  { id: "bad_seafood_meal", name: "难吃海鲜套餐", type: "food", hunger: 20, hydration: 20, effects: { health: 30, crash: 20, infection: 10 }, rarity: "common" },
  { id: "normal_seafood_meal", name: "一般海鲜套餐", type: "food", hunger: 40, hydration: 40, effects: { health: 50, crash: 15, infection: 8 }, rarity: "uncommon" },
  { id: "delicious_seafood_meal", name: "美味海鲜套餐", type: "food", hunger: 60, hydration: 60, effects: { health: 70, crash: 10, infection: 5 }, rarity: "rare" },
  { id: "tempting_seafood_meal", name: "诱人海鲜套餐", type: "food", hunger: 80, hydration: 80, effects: { health: 100, crash: 5, infection: 3 }, rarity: "epic" },
  { id: "top_seafood_meal", name: "顶尖海鲜套餐", type: "food", hunger: 100, hydration: 100, effects: { health: 120, crash: 1, infection: 1 }, rarity: "legendary" },
];
