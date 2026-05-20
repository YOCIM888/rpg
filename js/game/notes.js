import {
  getState,
  setPhase,
  setStory,
  setOptions,
} from '../state.js';

import {
  SURVIVAL_NOTES,
  GAME_CONSTANTS,
} from '../config.js';

import { showHomeOptions } from '../routing.js';

function getNewforceProgress(state) {
  const conditions = [
    { label: "救出露露薇", done: !!state.nurseZombieRescued },
    { label: "救出柳如烟", done: !!state.liuruyanRescued },
    { label: "击败匪徒", done: !!state.outlawKilled },
    { label: "击败黑影", done: !!(state.stats && state.stats.bossesDefeated && state.stats.bossesDefeated.includes("黑影")) },
    { label: "击败丧尸王", done: !!state.zombieKingDefeated },
    { label: "完成陈博士物资任务", done: !!state.doctorQuest3Done },
  ];
  const doneCount = conditions.filter(c => c.done).length;
  return { conditions, doneCount };
}

function buildLiuruyanStory(state) {
  let story = "📖 柳如烟救援\n━━━━━━━━━━━━━━━━━\n\n";
  if (state.liuruyanRescued) {
    story += "✅ 柳如烟已被救出，她现在是你忠实的伙伴。";
  } else if (state.day > GAME_CONSTANTS.LIURUYAN.RESCUE_DEADLINE_DAYS) {
    story += "❌ 救援期限已过，柳如烟已经变成了丧尸……";
  } else {
    const remaining = GAME_CONSTANTS.LIURUYAN.RESCUE_DEADLINE_DAYS - state.day;
    story += `⚠ 在高校大学城发现了一名感染的女人——柳如烟。\n\n`;
    story += `救援期限：还剩 ${remaining} 天\n`;
    story += `所需物品：抗感染药剂×${GAME_CONSTANTS.LIURUYAN.SERUM_COST}\n\n`;
    story += `如果不在期限内救治，她将变成丧尸。`;
  }
  return story;
}

export function buildSurvivalNotes() {
  const state = getState();
  const notes = SURVIVAL_NOTES;
  const story = "📖 生存笔记\n━━━━━━━━━━━━━━━━━\n选择分类查看提示：\n\n";
  const opts = notes.map((cat, i) => ({
    text: cat.name,
    action: "note_category",
    catIndex: i
  }));
  const { doneCount } = getNewforceProgress(state);
  if (doneCount > 0) {
    opts.push({ text: `新生力量（${doneCount}/6）`, action: "note_newforce" });
  }
  if (state.liuruyanDiscovered && !state.liuruyanRescued) {
    const remaining = GAME_CONSTANTS.LIURUYAN.RESCUE_DEADLINE_DAYS - state.day;
    if (remaining > 0) {
      opts.push({ text: `柳如烟救援（剩余${remaining}天）`, action: "note_liuruyan" });
    } else {
      opts.push({ text: "柳如烟救援（已过期）", action: "note_liuruyan" });
    }
  }
  opts.push({ text: "返回", action: "note_back" });
  setPhase("survival_notes");
  setStory(story);
  setOptions(opts);
}

function buildNewforceStory(state) {
  const { conditions, doneCount } = getNewforceProgress(state);
  let story = "📖 新生力量\n━━━━━━━━━━━━━━━━━\n\n";
  story += "传闻中，当所有关键事件都被解决后，一种新的力量将会觉醒…\n\n";
  story += "进度：\n";
  conditions.forEach(c => {
    story += `${c.done ? "✅" : "⬜"} ${c.label}\n`;
  });
  story += `\n已完成 ${doneCount}/6`;
  if (doneCount === 6) {
    story += "\n\n所有条件已满足，新的力量即将觉醒…";
  }
  return story;
}

export function handleSurvivalNotesAction(input) {
  const state = getState();
  const optIdx = input - 1;
  if (optIdx < 0 || optIdx >= state.options.length) { showHomeOptions(); return; }
  const opt = state.options[optIdx];
  if (opt.action === "note_back") { showHomeOptions(); return; }
  if (opt.action === "note_liuruyan") {
    const story = buildLiuruyanStory(state);
    const opts = SURVIVAL_NOTES.map((c, i) => ({
      text: c.name,
      action: "note_category",
      catIndex: i
    }));
    const { doneCount } = getNewforceProgress(state);
    if (doneCount > 0) {
      opts.push({ text: "新生力量", action: "note_newforce" });
    }
    opts.push({ text: "→ 柳如烟救援（当前）", action: "note_liuruyan" });
    opts.push({ text: "返回", action: "note_back" });
    setPhase("survival_notes");
    setStory(story);
    setOptions(opts);
    return;
  }
  if (opt.action === "note_newforce") {
    const story = buildNewforceStory(state);
    const opts = SURVIVAL_NOTES.map((c, i) => ({
      text: c.name,
      action: "note_category",
      catIndex: i
    }));
    opts.push({ text: "→ 新生力量（当前）", action: "note_newforce" });
    if (state.liuruyanDiscovered && !state.liuruyanRescued) {
      opts.push({ text: "柳如烟救援", action: "note_liuruyan" });
    }
    opts.push({ text: "返回", action: "note_back" });
    setPhase("survival_notes");
    setStory(story);
    setOptions(opts);
    return;
  }
  if (opt.action === "note_category") {
    const catIndex = opt.catIndex;
    const cat = SURVIVAL_NOTES[catIndex];
    if (!cat) { showHomeOptions(); return; }
    let story = `📖 ${cat.name}\n━━━━━━━━━━━━━━━━━\n\n`;
    cat.entries.forEach((entry) => {
      story += `🔹 ${entry.title}\n${entry.content}\n\n`;
    });
    const opts = SURVIVAL_NOTES.map((c, i) => ({
      text: i === catIndex ? `→ ${c.name}（当前）` : c.name,
      action: "note_category",
      catIndex: i
    }));
    const { doneCount } = getNewforceProgress(state);
    if (doneCount > 0) {
      opts.push({ text: "新生力量", action: "note_newforce" });
    }
    if (state.liuruyanDiscovered && !state.liuruyanRescued) {
      opts.push({ text: "柳如烟救援", action: "note_liuruyan" });
    }
    opts.push({ text: "返回", action: "note_back" });
    setPhase("survival_notes");
    setStory(story);
    setOptions(opts);
  }
}

export function handleSurvivalNotesDetailAction(input) {
  showHomeOptions();
}
