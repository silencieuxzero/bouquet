/* ============================================================
 * 悼溯茶馆 · 网页版核心引擎
 * 由 daosu_astrbot（AstrBot 视觉小说插件）的 renderer / modules 移植
 * 纯逻辑模块，不依赖 DOM。数据源：window.DAOSU_DATA
 * ============================================================ */
"use strict";

(function (global) {
  const DATA = global.DAOSU_DATA;
  if (!DATA) {
    console.error("[悼溯] 未找到 DAOSU_DATA，请确认 data/data.js 已加载");
    return;
  }

  /* ---------- 好感度等级（与插件 AFFECTION_LEVELS 一致） ---------- */
  const AFFECTION_LEVELS = [
    ["爱慕", 96, 100],
    ["亲密", 81, 95],
    ["亲近", 61, 80],
    ["友好", 31, 60],
    ["普通", 0, 30],
    ["陌生", -50, -1],
    ["冷漠", -100, -51],
  ];
  function affectionLevel(value) {
    for (const [lv, lo, hi] of AFFECTION_LEVELS) {
      if (value >= lo && value <= hi) return lv;
    }
    return "未知";
  }

  const VENTING_EMOTIONS = ["sad", "anxious", "frustrated", "venting"];
  const STORAGE_PREFIX = "daosu_html_v1_";

  /* ================= 游戏主类 ================= */
  class Game {
    constructor() {
      this.affection = {};        // 角色名 -> 好感度数值
      this.completed = {};        // 角色名 -> 已完成 script_id 数组
      this.choiceHistory = [];    // 选择记录
      this.mode = "menu";         // menu | plot | event | chat
      // 剧情（plot）会话
      this.plotScript = null;
      this.plotNode = null;
      this.pendingNextCharacter = null;
      // 事件（引导 / 小剧场）会话
      this.eventScript = null;
      this.eventNode = null;
      // 自由聊天会话
      this.chat = null;
      this.loadedSlot = null;
      // 多结局：是否已进入结局节点（防止章末重复路由）
      this.plotEndingShown = false;
      this._loadPersist();
    }

    /* ---------------- 持久化（进度 + 好感度） ---------------- */
    _loadPersist() {
      try {
        const raw = localStorage.getItem(STORAGE_PREFIX + "progress");
        if (raw) {
          const d = JSON.parse(raw);
          this.affection = d.affection || {};
          this.completed = d.completed || {};
        }
      } catch (e) { /* 损坏则忽略 */ }
    }
    _savePersist() {
      try {
        localStorage.setItem(STORAGE_PREFIX + "progress", JSON.stringify({
          affection: this.affection,
          completed: this.completed,
        }));
      } catch (e) { /* 存储满等异常忽略 */ }
    }

    /* ---------------- 角色 ---------------- */
    getCharacters() { return DATA.meta.characters_order || Object.keys(DATA.characters); }
    getCharacter(name) {
      const c = DATA.characters[name];
      if (!c) throw new Error("角色「" + name + "」不存在");
      return c;
    }
    getCharacterPrompt(name) {
      const c = this.getCharacter(name);
      const lines = [
        "你正在扮演 " + c.name + "（" + c.nickname + "）。",
        "性格特征：" + (c.personality || []).join("、"),
        "背景故事：" + c.background,
        "对话风格：" + c.dialogue_style,
        "喜欢的事物：" + (c.likes || []).join("、"),
        "厌恶的事物：" + (c.dislikes || []).join("、"),
        "兴趣爱好：" + (c.hobbies || []).join("、"),
        "",
        "请根据以上设定进行对话，保持角色的一致性。",
      ];
      return lines.join("\n");
    }

    /* ---------------- 好感度 ---------------- */
    getAffection(name) { return this.affection[name] || 0; }
    getAffectionLevel(name) { return affectionLevel(this.getAffection(name)); }
    modifyAffection(name, delta) {
      if (!delta) return this.getAffection(name);
      const v = Math.max(-100, Math.min(100, this.getAffection(name) + delta));
      this.affection[name] = v;
      this._savePersist();
      return v;
    }

    /* ---------------- 剧情脚本查询 ---------------- */
    getScriptsForCharacter(name) {
      return Object.values(DATA.plots)
        .filter(s => s.character_name === name)
        .sort((a, b) => a.script_id.localeCompare(b.script_id));
    }
    getScript(scriptId) { return DATA.plots[scriptId] || null; }
    isCompleted(character, scriptId) {
      return (this.completed[character] || []).includes(scriptId);
    }
    getNextScriptForCharacter(name) {
      const aff = this.getAffection(name);
      for (const s of this.getScriptsForCharacter(name)) {
        if (this.isCompleted(name, s.script_id)) continue;
        if (s.min_affection != null && aff < s.min_affection) continue;
        return s;
      }
      return null;
    }
    getLockedScriptForCharacter(name) {
      const aff = this.getAffection(name);
      for (const s of this.getScriptsForCharacter(name)) {
        if (this.isCompleted(name, s.script_id)) continue;
        if (s.min_affection != null && aff < s.min_affection) return s;
        return null;
      }
      return null;
    }
    hasMoreScripts(name) { return this.getNextScriptForCharacter(name) !== null; }
    scriptIndex(name, scriptId) {
      return this.getScriptsForCharacter(name).findIndex(s => s.script_id === scriptId) + 1;
    }

    /* ---------------- 节点格式化 ---------------- */
    _isVenting(node) { return VENTING_EMOTIONS.includes(node.emotion); }

    _effectiveChoices(node, script) {
      if (!node.choices || !node.choices.length) return [];
      const aff = script ? this.getAffection(script.character_name) : 0;
      return node.choices.filter(c => {
        if (c.affection_min != null && aff < c.affection_min) return false;
        if (c.affection_max != null && aff > c.affection_max) return false;
        return true;
      });
    }

    formatNode(node, script, extra) {
      const r = {
        success: true,
        speaker: node.speaker,
        text: node.text,
        emotion: node.emotion || "neutral",
        node_id: node.node_id,
      };
      if (extra) Object.assign(r, extra);
      if (node.choices && node.choices.length) {
        const eff = this._effectiveChoices(node, script);
        r.choices = eff.map((c, i) => ({
          index: i,
          text: c.text,
          affection_change: c.affection_change || 0,
        }));
        r.hidden_choices = node.choices.length - eff.length;
        r.awaiting_choice = true;
      }
      if (this._isVenting(node)) {
        r.listen_option = true; // UI 追加「静静听着」
      }
      return r;
    }

    _goNode(script, nodeId, extra) {
      const node = script.nodes[nodeId];
      if (!node) return { success: false, message: "节点 '" + nodeId + "' 不存在。" };
      // 原始 JSON 节点对象不含 node_id（id 是对象 key），此处注入
      node.node_id = nodeId;
      this.plotNode = node;
      return this.formatNode(node, script, extra);
    }

    /* ---------------- 剧情：启动 ---------------- */
    startPlot(characterName) {
      if (!DATA.characters[characterName]) {
        return { success: false, message: "角色「" + characterName + "」不存在。" };
      }
      const script = this.getNextScriptForCharacter(characterName);
      if (!script) {
        const all = this.getScriptsForCharacter(characterName);
        if (!all.length) {
          return { success: false, message: "角色「" + characterName + "」暂无可用的剧情。" };
        }
        const locked = this.getLockedScriptForCharacter(characterName);
        if (locked) {
          return {
            success: false, locked: true, script_id: locked.script_id, title: locked.title,
            min_affection: locked.min_affection,
            message: "下一章《" + locked.title + "》尚未解锁——需要与角色好感度达到 " +
              locked.min_affection + "（当前：" + this.getAffection(characterName) + "）。",
          };
        }
        return { success: false, all_completed: true, message: "角色「" + characterName + "」的所有剧情已全部完成。" };
      }
      // 切换剧情前清理旧会话
      if (this.mode === "chat") this.endChat();
      if (this.mode === "event") this.endEvent();
      this.mode = "plot";
      this.plotScript = script.script_id;
      this.pendingNextCharacter = null;
      this.plotEndingShown = false;
      const r = this._goNode(script, script.start_node, {
        script_id: script.script_id,
        title: script.title,
        script_index: this.scriptIndex(characterName, script.script_id),
        total_scripts: this.getScriptsForCharacter(characterName).length,
        character_name: script.character_name,
      });
      if (r.success) {
        r.affection_value = this.getAffection(characterName);
        r.affection_level = this.getAffectionLevel(characterName);
      }
      return r;
    }

    currentPlotScript() { return this.plotScript ? DATA.plots[this.plotScript] : null; }

    /* ---------------- 剧情：推进 ---------------- */
    advancePlot() {
      if (this.pendingNextCharacter) {
        const name = this.pendingNextCharacter;
        this.pendingNextCharacter = null;
        return this.startPlot(name);
      }
      const script = this.currentPlotScript();
      if (!script || !this.plotNode) {
        return { success: false, message: "当前没有活跃的剧情。" };
      }
      const node = this.plotNode;
      // 有选项：等待选择
      if (node.choices && node.choices.length) {
        return this.formatNode(node, script);
      }
      // 好感度路由优先
      if (node.routes && node.routes.length) {
        const aff = this.getAffection(script.character_name);
        for (const route of node.routes) {
          if (route.affection_min != null && aff < route.affection_min) continue;
          if (route.affection_max != null && aff > route.affection_max) continue;
          return this._goNode(script, route.node, { routed_by_affection: true, affection_value: aff });
        }
      }
      if (node.next_node) {
        return this._goNode(script, node.next_node);
      }
      // 多结局路由：脚本配置了 endings 时，章末按好感度进入对应结局
      if (script.endings && script.endings.length && !this.plotEndingShown) {
        const aff = this.getAffection(script.character_name);
        for (const end of script.endings) {
          if (end.min_affection != null && aff < end.min_affection) continue;
          this.plotEndingShown = true;
          return this._goNode(script, end.node, {
            ending: true,
            ending_id: end.id,
            ending_name: end.name,
            affection_value: aff,
          });
        }
      }
      // 本章结束
      return this._finishChapter(script);
    }

    _finishChapter(script) {
      const char = script.character_name;
      if (!this.completed[char]) this.completed[char] = [];
      if (!this.completed[char].includes(script.script_id)) {
        this.completed[char].push(script.script_id);
      }
      this._savePersist();
      this.plotNode = null;
      this.plotScript = null;
      const result = {
        success: true, dialogue_ended: true, script_completed: true,
        character_name: char, script_id: script.script_id, script_title: script.title,
        ending: !!this.plotEndingShown,
      };
      if (this.hasMoreScripts(char)) {
        const next = this.getNextScriptForCharacter(char);
        if (next) {
          this.pendingNextCharacter = char;
          result.waiting_next_confirm = true;
          result.next_script_title = next.title;
          result.next_script_id = next.script_id;
        }
      } else {
        result.all_completed = true;
      }
      return result;
    }

    /* ---------------- 剧情：选择 ---------------- */
    makePlotChoice(index) {
      const script = this.currentPlotScript();
      if (!script || !this.plotNode) {
        return { success: false, message: "当前没有活跃的剧情。" };
      }
      const node = this.plotNode;
      if (!node.choices || !node.choices.length) {
        return { success: false, message: "当前节点没有选项。" };
      }
      const eff = this._effectiveChoices(node, script);
      const hasListen = this._isVenting(node);
      const total = eff.length + (hasListen ? 1 : 0);
      if (index < 0 || index >= total) {
        return { success: false, message: "无效的选项编号。" };
      }
      // 「静静听着」倾听选项
      if (hasListen && index === eff.length) {
        this.modifyAffection(script.character_name, 5);
        this.choiceHistory.push({
          node_id: node.node_id, choice_text: "静静听着", is_listen: true,
          ts: Date.now(),
        });
        if (node.next_node) {
          return this._goNode(script, node.next_node, { listen: true });
        }
        return this._finishChapter(script);
      }
      const choice = eff[index];
      let affChange = 0;
      if (choice.affection_change) {
        affChange = choice.affection_change;
        this.modifyAffection(script.character_name, affChange);
      }
      this.choiceHistory.push({
        node_id: node.node_id, choice_text: choice.text, ts: Date.now(),
      });
      const r = this._goNode(script, choice.next_node, {
        affection_change: affChange,
        character_name: script.character_name,
        affection_value: this.getAffection(script.character_name),
        affection_level: this.getAffectionLevel(script.character_name),
      });
      // 选择后到达终点：本章结束
      if (r.success && r.dialogue_ended) {
        return this._finishChapter(script);
      }
      return r;
    }

    /* ---------------- 事件脚本（引导 / 小剧场） ---------------- */
    startEvent(scriptId) {
      const script = DATA.events[scriptId];
      if (!script) return { success: false, message: "脚本不存在：" + scriptId };
      if (this.mode === "chat") this.endChat();
      this.mode = "event";
      this.eventScript = scriptId;
      const node = script.nodes[script.start_node];
      if (!node) return { success: false, message: "起始节点不存在。" };
      node.node_id = script.start_node;
      this.eventNode = node;
      return this._formatEventNode(node, script);
    }
    _formatEventNode(node, script) {
      const r = {
        success: true, speaker: node.speaker, text: node.text,
        emotion: node.emotion || "neutral", node_id: node.node_id,
        event_title: script.title,
      };
      if (node.choices && node.choices.length) {
        r.choices = node.choices.map((c, i) => ({
          index: i, text: c.text, affection_change: c.affection_change || 0,
        }));
        r.awaiting_choice = true;
      }
      return r;
    }
    advanceEvent() {
      const script = DATA.events[this.eventScript];
      if (!script || !this.eventNode) return { success: false, message: "当前没有活跃的事件。" };
      const node = this.eventNode;
      if (node.choices && node.choices.length) {
        return this._formatEventNode(node, script); // 等待选择
      }
      if (node.next_node) {
        const next = script.nodes[node.next_node];
        if (!next) return { success: false, message: "节点不存在。" };
        next.node_id = node.next_node;
        this.eventNode = next;
        return this._formatEventNode(next, script);
      }
      this.eventScript = null;
      this.eventNode = null;
      return { success: true, dialogue_ended: true, event_ended: true };
    }
    makeEventChoice(index) {
      const script = DATA.events[this.eventScript];
      if (!script || !this.eventNode) return { success: false, message: "当前没有活跃的事件。" };
      const node = this.eventNode;
      const choice = node.choices[index];
      if (!choice) return { success: false, message: "无效的选项编号。" };
      if (choice.affection_change && choice.affection_change !== 0 && node.speaker !== "narrator") {
        this.modifyAffection(node.speaker, choice.affection_change);
      }
      if (choice.next_node) {
        const next = script.nodes[choice.next_node];
        if (!next) return { success: false, message: "节点不存在。" };
        next.node_id = choice.next_node;
        this.eventNode = next;
        return this._formatEventNode(next, script);
      }
      this.eventScript = null;
      this.eventNode = null;
      return { success: true, dialogue_ended: true, event_ended: true };
    }
    endEvent() {
      this.eventScript = null;
      this.eventNode = null;
    }

    /* ---------------- 清空临时剧情会话 ----------------
     * 仅清空内存中的在途进度（当前节点 / 待续角色 / 选择历史），
     * 不影响好感度、已完成章节等持久数据，也不影响已保存的存档。
     */
    endPlot() {
      this.plotScript = null;
      this.plotNode = null;
      this.pendingNextCharacter = null;
      this.choiceHistory = [];
      if (this.mode === "plot") this.mode = "menu";
    }

    /* ---------------- 断点续玩（退出后从上次节点继续） ---------------- */
    _isTerminalNode(node) {
      return !node.choices && !node.routes && !node.next_node;
    }
    saveResumePoint() {
      if (this.mode === "plot" && this.plotScript && this.plotNode) {
        const script = DATA.plots[this.plotScript];
        if (!script) return null;
        // 终节点（如结局节点）不保存断点：重新进入从章节开头开始
        if (this._isTerminalNode(this.plotNode)) return null;
        const name = script.character_name;
        const pt = {
          character_name: name,
          script_id: this.plotScript,
          node_id: this.plotNode.node_id,
        };
        try {
          let all = {};
          const raw = localStorage.getItem(STORAGE_PREFIX + "resume");
          if (raw) { try { all = JSON.parse(raw) || {}; } catch (e) { all = {}; } }
          all[name] = pt;
          localStorage.setItem(STORAGE_PREFIX + "resume", JSON.stringify(all));
        } catch (e) {}
        return pt;
      }
      return null;
    }
    getResumePoint(name) {
      try {
        const raw = localStorage.getItem(STORAGE_PREFIX + "resume");
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        let pt = null;
        if (name) {
          pt = parsed[name] || (parsed.character_name === name ? parsed : null);
        } else {
          if (parsed.character_name) { pt = parsed; }
          else {
            for (const k of Object.keys(parsed)) { pt = parsed[k]; break; }
          }
        }
        if (!pt) return null;
        const script = DATA.plots[pt.script_id];
        if (!script || !script.nodes[pt.node_id]) return null;
        if (script.character_name !== pt.character_name) return null;
        return pt;
      } catch (e) { return null; }
    }
    clearResumePoint(name) {
      try {
        const raw = localStorage.getItem(STORAGE_PREFIX + "resume");
        if (!raw) return;
        let all = JSON.parse(raw);
        if (all && all.character_name && !all[all.character_name]) {
          // 旧格式：整体清除
          localStorage.removeItem(STORAGE_PREFIX + "resume");
          return;
        }
        if (name) { delete all[name]; }
        else { all = {}; }
        if (Object.keys(all).length === 0) {
          localStorage.removeItem(STORAGE_PREFIX + "resume");
        } else {
          localStorage.setItem(STORAGE_PREFIX + "resume", JSON.stringify(all));
        }
      } catch (e) {}
    }
    resumeFromPoint(name) {
      const pt = this.getResumePoint(name);
      if (!pt) return { success: false, message: "没有可继续的剧情断点。" };
      const script = DATA.plots[pt.script_id];
      const node = script.nodes[pt.node_id];
      this.endChat();
      this.endEvent();
      this.endPlot();
      this.mode = "plot";
      this.plotScript = pt.script_id;
      node.node_id = pt.node_id;
      this.plotNode = node;
      this.plotEndingShown = false;
      this.clearResumePoint(pt.character_name);
      const r = this.formatNode(node, script, {
        script_id: script.script_id,
        title: script.title,
        script_index: this.scriptIndex(pt.character_name, script.script_id),
        total_scripts: this.getScriptsForCharacter(pt.character_name).length,
        character_name: script.character_name,
        resumed: true,
      });
      if (r.success) {
        r.affection_value = this.getAffection(script.character_name);
        r.affection_level = this.getAffectionLevel(script.character_name);
      }
      return r;
    }

    /* ---------------- 退出清空（临时进度 + 好感度；不影响存档） ---------------- */
    resetProgress() {
      this.endChat();
      this.endEvent();
      this.endPlot();
      this.mode = "menu";
      this.plotEndingShown = false;
      this.loadedSlot = null;
      this.affection = {};
      this.completed = {};
      this.clearResumePoint();
      this._savePersist();
    }

    /* ---------------- 开发者工具（需密钥验证后使用） ---------------- */
    setAffection(name, value) {
      const v = Math.max(-100, Math.min(100, Math.round(Number(value) || 0)));
      this.affection[name] = v;
      this._savePersist();
      return v;
    }
    setChapterProgress(name, count) {
      const scripts = this.getScriptsForCharacter(name);
      const n = Math.max(0, Math.min(scripts.length, Math.round(Number(count) || 0)));
      this.completed[name] = scripts.slice(0, n).map(s => s.script_id);
      this._savePersist();
      return this.completed[name].length;
    }

    /* ---------------- 角色重开（全部通关后点击角色卡片重新开始） ---------------- */
    resetCharacter(name) {
      this.endChat();
      this.endEvent();
      this.endPlot();
      this.clearResumePoint(name);
      this.affection[name] = 0;
      this.completed[name] = [];
      this._savePersist();
    }

    /* ---------------- 存档 ---------------- */
    _slotKey(slot) { return STORAGE_PREFIX + "save_" + String(slot).padStart(2, "0"); }
    save(slot, label) {
      const state = {
        slot, label: label || "", ts: Date.now(),
        timestamp: new Date().toISOString(),
        mode: this.mode,
        plot_script: this.plotScript,
        plot_node: this.plotNode ? this.plotNode.node_id : null,
        event_script: this.eventScript,
        event_node: this.eventNode ? this.eventNode.node_id : null,
        pending_next: this.pendingNextCharacter,
        plot_ending_shown: this.plotEndingShown,
        affection: Object.assign({}, this.affection),
        completed: JSON.parse(JSON.stringify(this.completed)),
        choices: this.choiceHistory.slice(-50),
      };
      try {
        localStorage.setItem(this._slotKey(slot), JSON.stringify(state));
      } catch (e) {
        return { success: false, message: "无法写入本地存储（可能被浏览器禁用）：" + e.message };
      }
      return { success: true, slot, label: state.label, timestamp: state.timestamp };
    }
    load(slot) {
      const raw = localStorage.getItem(this._slotKey(slot));
      if (!raw) return { success: false, message: "槽位 " + slot + " 没有存档。" };
      try {
        const d = JSON.parse(raw);
        this.affection = d.affection || {};
        this.completed = d.completed || {};
        this.choiceHistory = d.choices || [];
        this.mode = d.mode || "menu";
        this.plotScript = d.plot_script || null;
        this.plotNode = null;
        if (this.plotScript && d.plot_node) {
          const script = DATA.plots[this.plotScript];
          if (script && script.nodes[d.plot_node]) {
            script.nodes[d.plot_node].node_id = d.plot_node;
            this.plotNode = script.nodes[d.plot_node];
          }
        }
        this.eventScript = d.event_script || null;
        this.eventNode = null;
        if (this.eventScript && d.event_node) {
          const es = DATA.events[this.eventScript];
          if (es && es.nodes[d.event_node]) {
            es.nodes[d.event_node].node_id = d.event_node;
            this.eventNode = es.nodes[d.event_node];
          }
        }
        this.pendingNextCharacter = d.pending_next || null;
        this.plotEndingShown = !!d.plot_ending_shown;
        this.chat = null;
        this.loadedSlot = d;
        this._savePersist();
        this.clearResumePoint();
        return { success: true, slot, data: d };
      } catch (e) {
        return { success: false, message: "存档数据损坏：" + e.message };
      }
    }
    listSlots() {
      const out = [];
      for (let i = 1; i <= 20; i++) {
        try {
          const raw = localStorage.getItem(this._slotKey(i));
          out.push(raw ? JSON.parse(raw) : null);
        } catch (e) { out.push(null); }
      }
      return out;
    }
    deleteSlot(slot) {
      localStorage.removeItem(this._slotKey(slot));
    }
    canContinue() {
      return this.plotScript && this.plotNode;
    }
    continueFromSave() {
      if (!this.plotScript || !this.plotNode) {
        return { success: false, message: "该存档不包含剧情进度，无法继续。" };
      }
      const script = DATA.plots[this.plotScript];
      if (!script) return { success: false, message: "脚本不存在，存档可能已过期。" };
      this.mode = "plot";
      const r = this.formatNode(this.plotNode, script, {
        script_id: script.script_id,
        title: script.title,
        script_index: this.scriptIndex(script.character_name, script.script_id),
        total_scripts: this.getScriptsForCharacter(script.character_name).length,
        resumed: true,
        character_name: script.character_name,
        affection_value: this.getAffection(script.character_name),
        affection_level: this.getAffectionLevel(script.character_name),
      });
      return r;
    }

    /* ---------------- 自由聊天（会话管理） ---------------- */
    startChat(name) {
      if (!DATA.characters[name]) return { success: false, message: "角色不存在。" };
      if (this.mode === "event") this.endEvent();
      this.mode = "chat";
      this.chat = {
        name,
        model: "",
        history: [{ role: "system", content: this.getCharacterPrompt(name) }],
      };
      return { success: true, character_name: name };
    }
    endChat() {
      if (this.chat) {
        const name = this.chat.name;
        this.chat = null;
        this.mode = "menu";
        return { success: true, character_name: name };
      }
      return { success: false, message: "当前没有活跃的聊天。" };
    }
    chatAddUser(text) { if (this.chat) this.chat.history.push({ role: "user", content: text }); }
    chatAddAssistant(text) {
      if (!this.chat) return;
      this.chat.history.push({ role: "assistant", content: text });
      // 裁剪历史（保留 system 与最近 19 条）
      if (this.chat.history.length > 20) {
        const sys = this.chat.history[0];
        this.chat.history = [sys].concat(this.chat.history.slice(-19));
      }
    }
  }

  /* ---------- 自由聊天：OpenAI 兼容接口直连（浏览器端） ---------- */
  Game.prototype.sendChat = async function (userText, cfg) {
    if (!this.chat) return { success: false, message: "没有活跃的聊天会话。" };
    this.chatAddUser(userText);
    const messages = this.chat.history.map(m => ({ role: m.role, content: m.content }));
    // 注入好感度等动态信息
    const aff = this.getAffection(this.chat.name);
    const lv = this.getAffectionLevel(this.chat.name);
    messages.push({
      role: "user",
      content: "【当前状态】\n玩家与你的好感度：" + aff + "（" + lv + "）\n请根据这个好感度水平自然地回应玩家。",
    });
    const base = (cfg.base_url || "").replace(/\/+$/, "");
    const url = base ? (base + "/chat/completions") : "https://api.openai.com/v1/chat/completions";
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + (cfg.api_key || ""),
        },
        body: JSON.stringify({
          model: cfg.model || "gpt-3.5-turbo",
          messages,
          temperature: 0.85,
        }),
      });
      if (!resp.ok) {
        const body = await resp.text().catch(() => "");
        return { success: false, message: "API 请求失败（" + resp.status + "）" + body.slice(0, 200) };
      }
      const data = await resp.json();
      const text = (data.choices && data.choices[0] && data.choices[0].message &&
        data.choices[0].message.content) || "";
      if (!text) return { success: false, message: "API 返回了空内容。" };
      this.chatAddAssistant(text);
      return { success: true, text };
    } catch (e) {
      return { success: false, message: "网络错误：" + e.message };
    }
  };

  global.DaosuGame = Game;
})(window);
