> English version of 全结局快速速通.md

# All Endings Speedrun Guide

## Core Strategy

### Overview of All 12 Endings

| # | Ending | Game Over? | Faction | Core Condition |
|---|--------|-----------|---------|---------------|
| 1 | Death | Yes | Any | HP≤0 or Infection≥100 |
| 2 | Unknown Future | No | Any | Survive 999 days |
| 3 | Addicted to Power | No | Castle | Crown Prince ID (requires killing the Outpost Leader) |
| 4 | Shine Bright | No | Haven | Haven Captain Badge (requires Outpost Leader alive + 4 NPC Affinity at 150) |
| 5 | Become a New Force | No | Castle | All 6 conditions met + Dr. Chen Quest 3 completed |
| 6 | Into Space | Yes | Castle | Rocket chain → Board the rocket yourself |
| 7 | Spark of Hope | Yes | Haven→Castle | Rocket chain + Miss V/Xiaohan/Lili Affinity 150 |
| 8 | Stay Here | No | Castle | Rocket chain → Let Dr. Chen go |
| 9 | I Am No Farm God | No | Haven | Mu Miaomiao Quest 3 |
| 10 | Love and Hate | No | Haven→Castle | Outpost Leader Quest 3 → Love Token → The Queen Quest 4 |
| 11 | Become the Dish | Yes | Any | Ma San Quest 4 - Accept |
| 12 | Elopement | Yes | Any | Liu Ruyan Quest 4 (10 Gasoline) |

### Mutually Exclusive Relationships

| Mutually Exclusive Group | Reason |
|--------------------------|--------|
| ending_prince ↔ ending_captain | Crown Prince requires killing the Outpost Leader; Captain requires Outpost Leader alive |
| ending_prince ↔ ending_love_hate | Crown Prince requires killing the Outpost Leader; Love Token requires Outpost Leader quest chain |
| ending_newforce ↔ ending_food | New Force requires killing Ma San; Food requires Ma San alive |
| ending_space / ending_hope / ending_stay | Rocket three-way choice |

### Optimal Playthrough Plan: 2-Playthrough Full Collection

**Playthrough 1: Haven Route (6 endings)**
- ending_captain (can continue)
- ending_farming (can continue)
- ending_love_hate (can continue)
- ending_elopement (save switching)
- ending_food (save switching)
- ending_death (save switching)

**Playthrough 2: Castle + Rocket + 999 Route (6 endings)**
- ending_999 (can continue, obtain Dimensional Backpack)
- ending_newforce (can continue)
- ending_prince (can continue)
- ending_hope (save switching)
- ending_space (save switching)
- ending_stay (save switching)

### Save Switching Strategy

For endings that allow continuing, simply choose "Continue Surviving" after triggering the ending.
For Game Over endings, use save switching:
1. Save before triggering the Game Over ending
2. Trigger the ending (ending is recorded to unlockedEndings)
3. Load the save back to before the trigger
4. Take another route to trigger the next ending

---

## Playthrough 1: Haven Route (6 Endings)

**Goal**: captain + farming + love_hate + elopement + food + death
**Estimated Days**: ~120-150 days
**Faction**: Haven Outpost

### Phase 1: Foundation Building (Day 1-30)

**Day 1-3: Early Survival**
- Choose to explore low-danger maps (Riverside Camp, Rural Abandoned Barn)
- Collect basic supplies: food, water, medicine
- Goal: Survive and accumulate initial resources

**Day 4-10: Rescue Liu Ruyan (30-day time limit!)**
- Go to Downtown Shopping Mall → Half-infected Woman
- Need 3 Anti-infection Serums
- If not enough serum, explore the Suburban Large Hospital to obtain more
- ⚠️ Must complete within 30 days, otherwise Liu Ruyan turns into a zombie
- 💡 After discovering Liu Ruyan, a rescue countdown reminder will be automatically added to Survival Notes
- After rescue: liuruyanRescued = true, Liu Ruyan can gather supplies daily

**Day 5-15: Grind NPC Affinity**
- Talk to Miss V, Su Xiaohan, and Lili 4 times each per day (+4/person/day)
- Give medical items (+5/time, Lili +10/time) or food/drinks (+3/time, Lili +6/time)
- Give Cigarettes (+2/time)
- Priority: Lili > Su Xiaohan > Miss V (Lili has the highest bonus)
- Reaching 150 takes about 7 days/person, all three in parallel takes about 7-10 days

**Day 10-20: Defeat Key Bosses**
- Downtown Shopping Mall → Chain Supermarket → Defeat Shadow
  - Shadow stats: HP 200, Damage 25-45, has ranged attack, Evasion 20%
  - After defeat: shadowDefeated
- Zombie Nest → Silent Zombie King
  - Zombie King stats: HP 500, Damage 50-80, has ranged attack, Evasion 25%
  - After defeat: zombieKingDefeated
- Suburban Large Hospital → Rescue Luluwei (feed canned food until Affinity 150)
  - nurseZombieRescued

**Day 15-25: Kill Ma San**
- Go to National Highway Service Area
- ⚠️ Note: Choose to kill Ma San here (rather than completing the quest chain), because ending_newforce requires outlawKilled
- Ma San stats: HP 300, Damage 40-60, has ranged attack, Evasion 40%
- After killing: outlawKilled
- 💡 ending_food (Ma San quest chain) will be completed separately via save switching

### Phase 2: Haven Captain (Day 25-60)

**Day 25-60: Grind Outpost Leader Affinity to 150**
- Talk to the Outpost Leader once per day (+1) + Give 1 gift (+1) = +2/day
- Complete the Outpost Leader quest chain for large Affinity boosts:
  - Quest 1 (Voice Recorder): +10
  - Quest 2 (Reply Letter + 5 Baijiu): +20
  - Quest 3 (3 Universal Syringes): +30
- Quest rewards total +60, remaining 90 needs 45 days of talking + gifting
- 💡 Prioritize completing the quest chain to accelerate Affinity

**Outpost Leader Quest 1: Voice Recorder**
- Go to Riverside Camp → Foul-smelling Tent
- ⚠️ Need Haven Captain Badge to enter! But the Captain Badge requires Outpost Leader Affinity 150...
- 🔄 Solution: First grind Affinity to 150 → Get Captain Badge → Then enter the tent to get the Voice Recorder
- Alternatively: The Voice Recorder can also be obtained through other means (needs confirmation)

**Outpost Leader Quest 2: Reply Letter + 5 Baijiu**
- After obtaining the Voice Recorder, the Outpost Leader gives "Letter to Sister"
- Need to go to Doom Castle to find The Queen and get "The Queen's Reply Letter"
- Also need 5 bottles of High-proof Baijiu
- ⚠️ Entering the castle requires a Castle ID (25 Cigarettes), but holding a Haven Badge prevents obtaining a Castle ID
- 🔄 Solution: First leave the Outpost → Get Castle ID → Meet The Queen for the reply letter → Give up Castle ID → Rejoin the Outpost
- Alternatively: Don't complete Outpost Leader Quest 2, rely purely on talking + gifting to grind Affinity (slower but simpler)

**Outpost Leader Quest 3: 3 Universal Syringes**
- Universal Syringe acquisition methods:
  - Liu Ruyan Quest 1 (University Campus → Old Classroom → Medical Room) gives 1
  - Other methods require exploration
- After completion: Obtain Love Token (love_token) + 9×19mm×100

**Obtain Haven Captain Badge**
- Condition: Miss V/Xiaohan/Lili/Outpost Leader Affinity all ≥150
- Talk to the Outpost Leader and select "About the Captain Badge"
- Obtain: dawn_captain_badge
- 🏆 **Trigger ending_captain** → Select "Continue Surviving"

### Phase 3: Mu Miaomiao + The Queen (Day 60-100)

**Mu Miaomiao Quest Chain**
- Mu Miaomiao is inside Haven Outpost, no need to go out
- Affinity gain: Tend the experimental field (+1~3/day) + Give gifts
- After reaching 150, triggers "Secret" → Obtain Farming Master Badge
- Quest 1: 3 Carrots + 3 Potatoes
- Quest 2: 5 High-proof Baijiu + 10 Rye
- Quest 3: 1 of each of 15 different crops
  - 💡 Buy seeds from Mu Miaomiao, plant and harvest in the experimental field
  - Takes a long time (each crop needs 1-3 days to mature)
- After completing Quest 3: Obtain Plains Bow + Arrows ×30
- 🏆 **Trigger ending_farming** → Select "Continue Surviving"

**The Queen Quest Chain (requires Love Token)**
- Prerequisite: Hold the Love Token from Outpost Leader Quest 3
- ⚠️ Need Castle ID to enter the castle and meet The Queen
- Steps: Leave Outpost → Get Castle ID (25 Cigarettes) → Meet The Queen → Complete quests → Give up Castle ID
  - After leaving the Outpost, Affinity is retained; Captain Badge is lost, but ending_captain has already been triggered
- Quest 1: 5 Savory Beer + 5 Power Beer → 10 Royal Coins
- Quest 2: 10 Goji Berries → 20 Royal Coins
- Quest 3: 3 Western Swords → 30 Royal Coins
- Quest 4: 1 M700 → 40 Royal Coins + Castle Pass
  - 💡 M700 needs to be obtained from trading with Dr. Chen (30 serum), or from other sources
- 🏆 **Trigger ending_love_hate** → Select "Continue Surviving"

### Phase 4: Save Switch for Game Over Endings (Day 100-120)

**Save Slot Preparation**
- After completing all continue-able endings, save to Slot A

**ending_elopement**
1. Go to Suburban Abandoned Gas Station to find Wang Tiezhu, 5 Cigarettes for 1 Gasoline, exchange 10 times (needs 50 Cigarettes)
2. Go to University Campus → An Old Classroom
3. Complete Liu Ruyan Quests 1-3:
   - Quest 1: Go to the Medical Room together → Obtain Universal Syringe
   - Quest 2: Go to the Stadium → Defeat Football Zombie (HP 250 / 30-55 Damage / 15% Evasion)
   - Quest 3: Equip Crowbar → Open door to obtain Car Key
4. Quest 4: Consume 10 Gasoline
5. 🏆 **Trigger ending_elopement** → Game Over
6. 💡 Ending recorded, load save back to Slot A

**ending_food**
1. Load Slot A
2. Go to National Highway Service Area → Service Area Restaurant → Eat Strange Meat (hasEatenStrangeMeat = true, ⚠️ Strange Meat adds +10 Infection Value each time)
3. Talk to Ma San → "About the restaurant's food"
4. Complete Ma San Quests 1-3:
   - Quest 1: 3 bottles of Power Beer
   - Quest 2: 3 portions of crops
   - Quest 3: 10 Cigarettes
5. Quest 4: Select "Accept" (⚠️ Irreversible choice; whether you accept or defeat Ma San, the ending will be triggered)
6. 🏆 **Trigger ending_food** → Game Over
7. 💡 Ending recorded, load save back to Slot A

**ending_death**
1. Load Slot A
2. Intentionally let HP reach 0 or Infection Value reach 100
3. 🏆 **Trigger ending_death** → Game Over

**Playthrough 1 Complete! 6 endings unlocked.**

---

## Playthrough 2: Castle + Rocket + 999 Route (6 Endings)

**Goal**: 999 + newforce + prince + hope + space + stay
**Estimated Days**: 999+ days (the most time-consuming playthrough)
**Faction**: Haven first, then Castle

### Key Strategy: Grind Affinity First, Then Switch Factions

ending_hope requires Miss V/Xiaohan/Lili Affinity at 150, but holding a Castle ID prevents interacting with them. Solution: **Join Haven first and max out Affinity → Leave the Outpost → Switch to Castle route**. Affinity is retained after leaving the Outpost!

### Phase 1: Grind Affinity + Switch Factions (Day 1-20)

**Day 1-10: Join Haven, Max Out NPC Affinity**
- Join Haven Outpost
- Grind Miss V, Su Xiaohan, and Lili Affinity to 150 (about 7-10 days)
- 💡 No need to grind Outpost Leader Affinity (will kill the Outpost Leader later)

**Day 10-15: Leave the Outpost**
- Talk to the Outpost Leader and select "Leave the Outpost"
- Haven Badge and Captain Badge are removed
- Affinity is retained!

**Day 15-20: Obtain Castle Noble Status**
- Go to Doom Castle → Apply for Noble Status (25 Cigarettes)
- Obtain Castle ID

### Phase 2: The King Quests 1-4 (Day 20-50)

**The King Quest 1: 10 Glucose Solutions → Viscount**
- Glucose Solutions from exploring hospitals or trading

**The King Quest 2: 10 bottles of High-proof Baijiu → Earl**
- High-proof Baijiu from exploration or trading

**The King Quest 3: 10 Cigarettes + 5 Savory Beer + 5 Power Beer → Marquis**
- Cigarettes and Beer from exploration or trading

**The King Quest 4: 3 Universal Syringes → Duke**
- Universal Syringe acquisition: Liu Ruyan Quest 1 gives 1, the rest need exploration
- 💡 Liu Ruyan Quests 1-3 can be completed at this time (no Haven status required)

### Phase 3: Dr. Chen Trading + Rocket Prerequisites (Day 30-60)

**Dr. Chen Trade: 30 Anti-infection Serums → M700 + 7.62×51mm×30**
- Serum from exploring hospitals, trading with Lili, or The Queen's General Store
- 💡 30 serums is a large amount, requires continuous collection

**Defeat Giant Zombie Puppet**
- Go to Top-secret Space Base → Launch Center
- Puppet stats: HP 400, Damage 35-60, has ranged attack, Evasion 20%
- After defeat: giantPuppetDefeated

**Accept Rocket Repair Consultation**
- Talk to Dr. Chen and select About the Rocket
- 💡 If prerequisites are not met, the game will display specific missing conditions in Dr. Chen's dialogue options

### Phase 4: Survive to Day 999 (Day 60-999)

**🏆 This is the most time-consuming phase of the entire speedrun**

**Efficient Survival Strategy**:
- Work at Haven Outpost daily to obtain resources (can you work without Haven status? Needs confirmation)
- Or rest at base + explore low-danger maps to collect supplies
- Maintain satiety/hydration/health, avoid death
- Utilize Liu Ruyan's daily supply gathering
- Regularly go to the Energy Mining Well to collect Pure Energy (after Dr. Chen Quest 1 is completed)

**Day 999: Trigger ending_999**
- 🏆 **Trigger ending_999** → Obtain **Dimensional Storage Backpack (68 slots)** → Select "Continue Surviving"
- 💡 The Dimensional Backpack is a key item for the Rocket chain's underground area!

### Phase 5: Rocket Chain (Day 999+)

**Obtain AWM (5% chance Space Crate)**
- Repeatedly explore the Top-secret Space Base
- Each exploration has a 5% chance of triggering a Space Crate
- 💡 This is the biggest random bottleneck of the Rocket chain, may require extensive exploration

**The King Quest 5: Assassinate the Outpost Leader → Crown Prince**
- Talk to The King and select "Eliminate Dissent"
- Go to Haven Outpost to assassinate the Outpost Leader
- ⚠️ Outpost Leader battle: HP 300, Damage 40-60
- After completion, obtain Crown Prince ID (crown_prince_id)
- 🏆 **Trigger ending_prince** → Select "Continue Surviving"

**Obtain Underground Key**
- Condition: Crown Prince (rank 6) + Dr. Chen Quest 1 accepted + Submit AWM
- Talk to The King and select "Your Majesty, I want to go to the underground area"
- Hand over AWM → Obtain Underground Key

**Dismantle Nuclear Power Device**
- Enter the Castle Underground Area
- Required equipment: Large Wrench (melee weapon) + Dimensional Storage Backpack (68 slots, from ending_999)
- After dismantling, obtain Small Nuclear Generator
- Give to Dr. Chen → Dr. Chen Quest 1 completed → Unlocks Energy Mining Well

**Dr. Chen Quest 2: 15 Pure Energy**
- Collect 1 per day from the Energy Mining Well
- Takes 15 days
- 💡 The game will display current progress when collecting (X/15)
- 💡 If you've already started collecting earlier, you may have enough

**Dr. Chen Quest 3: 10 Medical + 10 Food + 10 Drinks**
- Prepare supplies and give to Dr. Chen
- Rocket repair complete!

**ending_newforce Triggers Automatically**
- Check conditions: nurseZombieRescued + liuruyanRescued + outlawKilled + shadowDefeated + zombieKingDefeated + doctorQuest3Done
- ⚠️ outlawKilled: You killed Ma San in Playthrough 1, but this is a new playthrough! Need to kill Ma San again in this playthrough
- 💡 Make sure all 6 conditions are completed in this playthrough
- 💡 Survival Notes will track the New Force ending progress (X/6); you can check it after completing any prerequisite condition
- 🏆 **Trigger ending_newforce** → Select "Continue Surviving"

### Phase 6: Rocket Three-way Choice (Save Switching)

**Prepare Save**
- Before making a choice at the Launch Center, save to Slot B

**ending_hope (Spark of Hope)**
1. Select "Bring important people"
2. Miss V/Xiaohan/Lili Affinity already at 150 (grinded in Phase 1)
3. 💡 The game will display current Affinity progress (e.g., V:150/150 Xiaohan:150/150 Lili:150/150)
4. 🏆 **Trigger ending_hope** → Game Over
5. Load Slot B

**ending_space (Into Space)**
1. Select "Board the rocket yourself"
2. 🏆 **Trigger ending_space** → Game Over
3. Load Slot B

**ending_stay (Stay Here)**
1. Select "I'm not going, Dr. Chen, you go"
2. 🏆 **Trigger ending_stay** → Select "Continue Surviving"
3. 💡 Dr. Chen stays and improves the antibody syringe manufacturing equipment; you can collect 1 syringe per day

**Playthrough 2 Complete! 6 endings unlocked.**

---

## Item Farming Guide

### Cigarettes (Most Scarce Resource Throughout)

| Source | Method | Efficiency |
|--------|--------|-----------|
| Map Exploration | Random drops | Medium |
| Weapon Recycling | Melee damage/10, Ranged damage/15 | High (collect low-level weapons to recycle) |
| Wandering Merchant | Trading | Medium |
| Cave Exploration | Chance to obtain | Low |
| Liu Ruyan's Daily Harvest | Random | Low |

**Total Demand Estimate**:
- Playthrough 1: 25 (Castle ID) + 10 (Ma San Quest 3) + 50 (10 Gasoline × 5 Cigarettes) = 85 Cigarettes
- Playthrough 2: 25 (Castle ID) + 10 (The King Quest 3) = 35 Cigarettes
- 💡 Prioritize recycling weapons to obtain Cigarettes

### Anti-infection Serum

| Source | Method |
|--------|--------|
| Suburban Large Hospital | Exploration drops |
| Lili Trading | Medical trading |
| The Queen's General Store | 3 Royal Coins/each |
| Su Xiaohan Quest | Canned food collection quest reward ×3 |

**Total Demand Estimate**:
- Playthrough 1: 3 (Rescue Liu Ruyan) + 30 (Dr. Chen trade, if done) = 33 serums
- Playthrough 2: 30 (Dr. Chen trade) = 30 serums

### Crop Seeds (Mu Miaomiao Quest 3)

- Buy seeds from Mu Miaomiao
- Plant in the experimental field, 1-3 days to mature
- Need 1 of each of 15 different crops
- 💡 Start planting as early as possible, just plant 1 of each crop

### Gasoline

- Source 1: Wang Tiezhu at Suburban Abandoned Gas Station, 5 Cigarettes for 1 Gasoline
- Source 2: Cheat code `/get_gasoline_汽油_5` (obtain 5 each time)
- Playthrough 1 needs 10 (Liu Ruyan Quest 4) = 50 Cigarettes
- Playthrough 2 needs 1 (Yacht, optional) = 5 Cigarettes

### AWM (Rocket Chain Key Item)

- Only source: Top-secret Space Base Space Crate, 5% chance
- Only triggers once per save
- 💡 Repeatedly explore the Space Base; this is the biggest random bottleneck
- 💡 Increase encounter rate: Make sure you have sufficiently strong weapons and armor equipped

---

## Key Timeline

### Playthrough 1 Timeline

| Day | Goal |
|-----|------|
| Day 1-3 | Early survival, collect basic supplies |
| Day 4-10 | Rescue Liu Ruyan (30-day time limit!) |
| Day 5-15 | Grind Miss V/Xiaohan/Lili Affinity to 150 |
| Day 10-20 | Defeat Shadow, Zombie King, rescue Luluwei |
| Day 15-25 | Kill Ma San |
| Day 25-60 | Grind Outpost Leader Affinity + complete Outpost Leader quest chain |
| Day 60 | Obtain Captain Badge → ending_captain |
| Day 60-90 | Mu Miaomiao quest chain → ending_farming |
| Day 90-100 | The Queen quest chain → ending_love_hate |
| Day 100-120 | Save switching: elopement → food → death |

### Playthrough 2 Timeline

| Day | Goal |
|-----|------|
| Day 1-10 | Join Haven, grind Miss V/Xiaohan/Lili Affinity to 150 |
| Day 10-15 | Leave the Outpost |
| Day 15-20 | Obtain Castle Noble Status |
| Day 20-50 | The King Quests 1-4 |
| Day 30-60 | Dr. Chen trade + Defeat Giant Puppet |
| Day 60-999 | Survive to 999 days → ending_999 |
| Day 999+ | The King Quest 5 → ending_prince |
| Day 999+ | AWM + Underground Key + Rocket chain |
| Day 999+ | ending_newforce |
| Day 999+ | Rocket three-way choice: hope → space → stay |

---

## FAQ

**Q: Why can't I collect all endings in one playthrough?**
A: ending_prince (Crown Prince) requires killing the Outpost Leader, while ending_captain (Captain) requires the Outpost Leader alive — they are mutually exclusive. Similarly, ending_newforce requires killing Ma San, while ending_food requires Ma San alive.

**Q: Why is ending_hope placed in Playthrough 2?**
A: ending_hope requires the Rocket chain (Castle route) + Miss V/Xiaohan/Lili Affinity at 150. Although holding a Castle ID prevents interacting with them, as long as you max out Affinity before obtaining the Castle ID, the Affinity is retained and won't affect triggering ending_hope.

**Q: Why is ending_999 placed in Playthrough 2?**
A: The Rocket chain's underground area requires the Dimensional Storage Backpack (68 slots), which comes from ending_999. So you must trigger ending_999 first to obtain the backpack before completing the Rocket chain.

**Q: What if AWM is too hard to obtain?**
A: AWM comes from the Space Base Space Crate (5% chance), which is the biggest random bottleneck. Suggestion: Equip your strongest weapons + armor and repeatedly explore the Space Base; each exploration has a 5% chance. Patience is key.

**Q: Will save switching cause progress loss?**
A: No. Once an ending is triggered, it's recorded to unlockedEndings, and loading a save won't lose it. Just be careful not to overwrite key save slots.

**Q: Do I need to complete Liu Ruyan's quest chain in Playthrough 1?**
A: You need to rescue Liu Ruyan (one of the ending_newforce conditions), but you don't need to complete her 4-segment quest chain (that's for ending_elopement). Complete Liu Ruyan's quest chain during the save switching phase.

**Q: Do I need to kill Ma San again in Playthrough 2?**
A: Yes! Each playthrough starts with a fresh game state, and all conditions must be met again. All 6 conditions for ending_newforce must be completed within the current playthrough.

**Q: What to do when Crash Value reaches 100%?**
A: When Crash is maxed out, you can't sleep, eat, drink, or fight normally. Self-rescue options: Use Painkillers (Crash -5), Adrenaline (Crash -10), Surgical Kit (Crash -10), Field Medical Kit (Crash -30), or Universal Syringe (Crash -50) to reduce Crash Value. Once Crash drops below 100, you return to normal. 💡 The game will prompt available medical items for self-rescue when you're refused eating/drinking.

**Q: How to choose quantity when buying ammo from the Black Market Merchant?**
A: When buying ammo from the Black Market Merchant, you can choose to exchange 1, 5, 10, or all Cigarettes; 1 Cigarette ≈ 3~6 rounds of ammo (random). It no longer consumes all Cigarettes at once.
