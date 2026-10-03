/* ============================================================
 * 悼溯茶馆 · 网页版 UI 控制器
 * 屏幕：封面 / 主菜单 / 剧情舞台 / 自由聊天 / 存档 / 设置
 * ============================================================ */
"use strict";

(function () {
  const DATA = window.DAOSU_DATA;
  const game = new window.DaosuGame();
  const CFG_KEY = "daosu_html_v1_cfg";
  const DEV_STORE_KEY = "daosu_html_v1_dev";
  // 开发者密钥：修改此处即可更换
  const DEV_KEY = "daosu123456";

  /* ---------------- 小工具 ---------------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function showScreen(id) {
    $$(".screen").forEach(s => s.classList.remove("active"));
    $("#" + id).classList.add("active");
  }

  let typeTimer = null;
  let typingDone = false;

  /* 打字机效果：返回 Promise，点击可加速 */
  function typeText(el, text, onDone) {
    clearTimeout(typeTimer);
    const speed = 28;
    let i = 0;
    el.textContent = "";
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    el.appendChild(cursor);
    const step = () => {
      if (i < text.length) {
        // 一次插入若干字符，保持速度
        const chunk = text.slice(i, i + 2);
        i += 2;
        cursor.before(document.createTextNode(chunk));
        el.scrollTop = el.scrollHeight;
        typeTimer = setTimeout(step, speed);
      } else {
        cursor.remove();
        typingDone = true;
        onDone && onDone();
      }
    };
    step();
  }
  function skipTyping() {
    clearTimeout(typeTimer);
    typingDone = true;
    const el = $("#story-text");
    const cursor = el.querySelector(".cursor");
    if (cursor) cursor.remove();
  }

  /* ---------------- 模态 ---------------- */
  function showModal(title, text, buttons) {
    $("#modal-title").textContent = title;
    $("#modal-text").textContent = text;
    const wrap = $("#modal-btns");
    wrap.innerHTML = "";
    (buttons || [{ label: "确定", onClick: hideModal }]).forEach(b => {
      const btn = document.createElement("button");
      btn.className = "btn " + (b.primary ? "btn-primary" : "") + (b.sm ? " btn-sm" : "");
      btn.textContent = b.label;
      btn.addEventListener("click", () => { hideModal(); b.onClick && b.onClick(); });
      wrap.appendChild(btn);
    });
    $("#modal").classList.remove("hidden");
  }
  function hideModal() { $("#modal").classList.add("hidden"); }

  /* ---------------- 好感度显示 ---------------- */
  function renderAffMeter(name) {
    const v = game.getAffection(name);
    const lv = game.getAffectionLevel(name);
    $("#game-aff-label").textContent = "好感 " + lv + " " + v;
    $("#game-aff-fill").style.width = Math.max(0, Math.min(100, ((v + 100) / 200) * 100)) + "%";
  }

  /* ============================================================
   * 主菜单
   * ============================================================ */
  function renderMenu() {
    const list = $("#character-list");
    list.innerHTML = "";
    const order = game.getCharacters();

    // 继续横幅：仅对"已载入存档"的剧情显示（未存档的临时会话会被清空，不提供继续）
    const resumeBar = document.createElement("div");
    if (game.loadedSlot && game.loadedSlot.mode === "plot") {
      resumeBar.className = "panel";
      resumeBar.style.cssText = "margin:0 auto 22px;text-align:center;";
      const slotScript = game.loadedSlot.plot_script ? DATA.plots[game.loadedSlot.plot_script] : null;
      resumeBar.innerHTML =
        '<p class="panel-desc" style="margin-bottom:12px">已载入存档' + (slotScript ? " · 《" + slotScript.title + "》" : "") + "</p>" +
        '<button class="btn btn-primary" data-action="resume-plot">继续剧情</button>';
    }
    if (resumeBar.innerHTML) list.parentNode.insertBefore(resumeBar, list);

    order.forEach(name => {
      const c = DATA.characters[name];
      const scripts = game.getScriptsForCharacter(name);
      const done = (game.completed[name] || []).length;
      const total = scripts.length;
      const aff = game.getAffection(name);
      const locked = game.getLockedScriptForCharacter(name);
      const resumePt = game.getResumePoint(name);


      // 无剧情脚本的角色：未开放占位（如孑鼠）
      const isPlaceholder = scripts.length === 0;
      const card = document.createElement("div");
      card.className = "char-card" + (locked ? " char-locked" : "") + (isPlaceholder ? " char-soon" : "");
      card.innerHTML =
        '<div class="char-name">' + c.name + "</div>" +
        '<div class="char-nick">' + (c.nickname || "") + " · " + (c.gender || "") + " · " + (c.age || "?") + "</div>" +
        '<p class="char-desc">' + (c.background || "").slice(0, 56) + "……</p>" +
        '<div class="char-actions">' +
        '<button class="chip" data-act="plot">存档</button>' +
        '<button class="chip" data-act="chat">自由聊天</button>' +
        "</div>" +
        '<div class="char-progress">' + (isPlaceholder ? "剧情筹备中 · 暂未开放" :
          "剧情 " + done + "/" + total +
          " · 好感 " + aff + "（" + game.getAffectionLevel(name) + "）" +
          (locked ? " · 下一章需好感 " + locked.min_affection : "") +
          (resumePt && resumePt.character_name === name ? " · 有未完成进度" : "")) +
        "</div>";
      card.addEventListener("click", (e) => {
        // 未开放角色：任何点击都提示暂不开放
        if (isPlaceholder) {
          showModal("暂未开放", "「" + name + "」的剧情正在筹备中。\n\n茶馆的灯还亮着。再等一等，ta 会来的。", [{ label: "知道了", primary: true }]);
          return;
        }
        if (e.target.closest("[data-act='chat']")) { startChat(name); return; }
        // 「存档」按钮：有未完成进度时可存档，否则为读档模式
        if (e.target.closest("[data-act='plot']")) { openSaves("menu"); return; }
        // 断点优先：退出后点卡片主体，从上次节点恢复
        if (game.getResumePoint(name)) { resumeFromPoint(name); return; }
        // 全部通关后：点卡片主体则弹窗确认后重新开始
        const scripts = game.getScriptsForCharacter(name);
        const allDone = scripts.length > 0 && (game.completed[name] || []).length >= scripts.length;
        if (allDone) {
          showModal("重新开始", "「" + name + "」的剧情已全部完成。\n\n点击「重新开始」将清空该角色的好感度与章节进度，从第一章重新开始。此操作不可撤销。", [
            { label: "取消" },
            { label: "重新开始", primary: true, onClick: () => {
                game.resetCharacter(name);
                renderMenu();
                startPlot(name);
              } },
          ]);
          return;
        }
        startPlot(name);
      });
      list.appendChild(card);
    });

    // 小剧场按钮
    const MEM_IDS = ["xaviel_mem_01", "xaviel_mem_02", "xaviel_mem_03",
                     "xaviel_mem_04", "xaviel_mem_05", "xaviel_mem_06"];
    const memTitles = MEM_IDS
      .map(id => DATA.events[id] ? DATA.events[id].title : null)
      .filter(Boolean);

    const sb = $("#side-story-btns");
    sb.innerHTML = "";
    Object.values(DATA.events).forEach(ev => {
      if (ev.script_id === "tutorial_intro") return;
      if (MEM_IDS.includes(ev.script_id)) return; // 回忆录统一入口处理
      const b = document.createElement("button");
      b.className = "chip";
      b.style.cssText = "border:1px solid var(--line);";
      b.textContent = ev.title;
      b.addEventListener("click", () => startEvent(ev.script_id));
      sb.appendChild(b);
    });

    // 查维尔的回忆：六个回忆录统一为一个入口，点击后选择章节
    if (memTitles.length) {
      const b = document.createElement("button");
      b.className = "chip";
      b.style.cssText = "border:1px solid var(--line);";
      b.textContent = "查维尔的回忆";
      b.addEventListener("click", () => {
        const buttons = MEM_IDS
          .filter(id => DATA.events[id])
          .map(id => ({
            label: DATA.events[id].title,
            sm: true,
            onClick: () => startEvent(id),
          }));
        buttons.push({ label: "返回", sm: true });
        showModal("查维尔的回忆",
          "以查维尔为视角写下的往事，按时间顺序排布。\n\n实验体 → 古代 → 渔村 → 归途 → 茶馆 → 写故事的人",
          buttons);
      });
      sb.appendChild(b);
    }
  }

  /* ============================================================
   * 剧情舞台
   * ============================================================ */
  let currentActor = null; // { kind: 'plot' | 'event', charName }

  function enterGame(charName) {
    currentActor = { kind: "plot", charName };
    showScreen("screen-game");
    renderAffMeter(charName);
  }

  function renderNode(result) {
    $("#story-speaker").classList.remove("hidden", "is-narrator");
    const isNarrator = !result.speaker || result.speaker === "narrator";
    const speakerEl = $("#story-speaker");
    if (isNarrator) {
      speakerEl.textContent = "旁白";
      speakerEl.classList.add("is-narrator");
    } else {
      speakerEl.textContent = result.speaker;
    }

    // 章节标题（结局节点时追加结局名；剧情推进节点无 title 时保留当前值）
    const chapter = result.title
      ? result.title + (result.script_index ? " · 第" + result.script_index + "章" : "") +
        (result.ending_name ? " · " + result.ending_name : "")
      : (result.event_title || $("#game-chapter").textContent || "");
    $("#game-chapter").textContent = chapter;
    $("#chapter-progress").textContent = result.script_index && result.total_scripts
      ? "章节 " + result.script_index + " / " + result.total_scripts : $("#chapter-progress").textContent || "";

    // 好感度变化提示
    if (result.affection_change || result.listen) {
      const name = result.character_name || currentActor.charName;
      if (name && !isNarrator) renderAffMeter(name);
    }

    // 文本打字机
    const textEl = $("#story-text");
    skipTyping();
    typingDone = false;
    textEl.scrollTop = 0;

    const choicesWrap = $("#story-choices");
    choicesWrap.innerHTML = "";
    const advanceBtn = $("#advance-btn");
    advanceBtn.classList.add("hidden");

    let done = false;
    typeText(textEl, result.text, () => { done = true; });

    // 选项
    const hasChoices = result.choices && result.choices.length;
    if (hasChoices || result.listen_option) {
      (result.choices || []).forEach(ch => {
        const b = document.createElement("button");
        b.className = "choice-btn";
        b.textContent = ch.text;
        b.addEventListener("click", () => onChoice(ch.index));
        choicesWrap.appendChild(b);
      });
      if (result.hidden_choices > 0) {
        const tip = document.createElement("div");
        tip.className = "choice-hint";
        tip.textContent = "（好感度不足，另有 " + result.hidden_choices + " 个选项尚未解锁）";
        choicesWrap.appendChild(tip);
      }
      if (result.listen_option) {
        const b = document.createElement("button");
        b.className = "choice-btn is-listen";
        b.textContent = "静静听着";
        b.addEventListener("click", () => onChoice((result.choices || []).length));
        choicesWrap.appendChild(b);
      }
      advanceBtn.classList.add("hidden");
    } else {
      advanceBtn.classList.remove("hidden");
      advanceBtn.textContent = result.resumed ? "▼ 继续" : "▼ 继续";
    }

    // 点击文本区：打字中加速
    textEl.onclick = () => { if (!typingDone) skipTyping(); };

    advanceBtn.onclick = () => {
      if (!typingDone) { skipTyping(); return; }
      advance();
    };
  }

  function onChoice(index) {
    if (currentActor.kind === "plot") {
      const r = game.makePlotChoice(index);
      handlePlotResult(r);
    } else {
      const r = game.makeEventChoice(index);
      handleEventResult(r);
    }
  }

  function advance() {
    if (currentActor.kind === "plot") {
      handlePlotResult(game.advancePlot());
    } else {
      handleEventResult(game.advanceEvent());
    }
  }

  function handlePlotResult(r) {
    if (!r.success) {
      showModal("提示", r.message || "操作失败。", [{ label: "知道了", onClick: () => goMenu() }]);
      return;
    }
    if (r.dialogue_ended) {
      if (r.waiting_next_confirm) {
        showModal("本章完", "《" + (r.script_title || r.script_id) + "》已完结\n\n下一章《" + r.next_script_title + "》已就绪。", [{
          label: "继续下一章", primary: true, onClick: () => {
            handlePlotResult(game.advancePlot()); // pendingNext 自动续章
          },
        }, { label: "先回茶馆", onClick: goMenu }]);
      } else {
        showModal(r.ending ? "结局达成" : "本章完", r.all_completed
          ? "「" + r.character_name + "」的全部剧情已经走完了。\n感谢你陪 TA 走完这段路。"
          : "对话已结束。", [{ label: "返回茶馆", primary: true, onClick: goMenu }]);
      }
      return;
    }
    if (r.locked) {
      showModal("未解锁", r.message, [{ label: "知道了", onClick: goMenu }]);
      return;
    }
    renderNode(r);
  }

  function handleEventResult(r) {
    if (!r.success) {
      showModal("提示", r.message || "操作失败。");
      return;
    }
    if (r.event_ended || r.dialogue_ended) {
      game.endEvent();
      showModal("结束", r.event_ended ? "这一段小故事讲完了。" : "对话已结束。", [{
        label: "返回茶馆", primary: true, onClick: goMenu,
      }]);
      return;
    }
    renderNode(r);
  }

  function startPlot(name) {
    const r = game.startPlot(name);
    if (!r.success) {
      if (r.locked) {
        showModal("未解锁", r.message, [{ label: "知道了" }]);
      } else {
        showModal("提示", r.message, [{ label: "知道了" }]);
      }
      return;
    }
    enterGame(name);
    renderNode(r);
  }

  function startEvent(scriptId) {
    const r = game.startEvent(scriptId);
    if (!r.success) { showModal("提示", r.message); return; }
    currentActor = { kind: "event" };
    showScreen("screen-game");
    renderNode(r);
  }

  function resumePlot() {
    const r = game.continueFromSave();
    if (!r.success) {
      showModal("提示", r.message, [{ label: "知道了", onClick: goMenu }]);
      return;
    }
    currentActor = { kind: "plot", charName: game.currentPlotScript().character_name };
    showScreen("screen-game");
    renderNode(r);
  }

  function goMenu() {
    // 退出回主页：保存断点（若有未完成的剧情会话），好感度与章节进度保留
    game.saveResumePoint();
    game.endEvent();
    game.endPlot();
    renderMenu();
    showScreen("screen-menu");
  }

  function resumeFromPoint(name) {
    const r = game.resumeFromPoint(name);
    if (!r.success) {
      showModal("提示", r.message, [{ label: "知道了", onClick: goMenu }]);
      return;
    }
    currentActor = { kind: "plot", charName: game.currentPlotScript().character_name };
    showScreen("screen-game");
    renderNode(r);
  }

  /* ============================================================
   * 开发者模式（密钥验证后可自定义好感度与剧情进程）
   * ============================================================ */
  function devIsUnlocked() {
    return localStorage.getItem(DEV_STORE_KEY) === "1";
  }
  function devFillChars() {
    const sel = $("#dev-char");
    sel.innerHTML = "";
    game.getCharacters().forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    });
  }
  function devFillCurrent() {
    const name = $("#dev-char").value || game.getCharacters()[0];
    const scripts = game.getScriptsForCharacter(name);
    $("#dev-aff").value = game.getAffection(name);
    $("#dev-chapter").value = (game.completed[name] || []).length;
    $("#dev-chapter").max = scripts.length;
  }
  function openDevtools() {
    const unlocked = devIsUnlocked();
    $("#dev-controls").classList.toggle("hidden", !unlocked);
    $("#dev-msg").textContent = "";
    if (unlocked) {
      devFillChars();
      devFillCurrent();
    }
    showScreen("screen-devtools");
  }
  function devClearResume(name) {
    game.clearResumePoint(name);
  }
  function devUnlock() {
    const msg = $("#dev-msg");
    const key = ($("#dev-key").value || "").trim();
    if (key === DEV_KEY) {
      localStorage.setItem(DEV_STORE_KEY, "1");
      msg.textContent = "解锁成功。";
      devFillChars();
      devFillCurrent();
      $("#dev-controls").classList.remove("hidden");
    } else {
      msg.textContent = "密钥错误。";
    }
  }
  function devSetAffection() {
    const name = $("#dev-char").value;
    devClearResume(name);
    const v = game.setAffection(name, $("#dev-aff").value);
    $("#dev-msg").textContent = name + " 好感度已设置为 " + v + "。";
    renderMenu();
  }
  function devSetChapter() {
    const name = $("#dev-char").value;
    devClearResume(name);
    const n = game.setChapterProgress(name, $("#dev-chapter").value);
    $("#dev-msg").textContent = name + " 已完成章节数已设置为 " + n + "。";
    renderMenu();
  }

  /* ============================================================
   * 自由聊天
   * ============================================================ */
  function startChat(name) {
    const cfg = loadCfg();
    if (!cfg.api_key) {
      showModal("需要配置 API", "自由聊天需要调用大模型接口。\n请先在「设置」中填写 Base URL 与 API Key。\n\n（剧情模式不受影响，可直接游玩）", [
        { label: "去设置", primary: true, onClick: () => { showScreen("screen-settings"); } },
        { label: "取消", onClick: goMenu },
      ]);
      return;
    }
    const r = game.startChat(name);
    if (!r.success) { showModal("提示", r.message); return; }
    showScreen("screen-chat");
    $("#chat-name").textContent = name;
    $("#chat-aff").textContent = "好感 " + game.getAffection(name) + "（" + game.getAffectionLevel(name) + "）";
    $("#chat-log").innerHTML = "";
    addMsg("bot", name, "（你推门走进茶馆，在" + name + "对面坐下。）\n\n茶还温着。你打算说点什么？");
    $("#chat-input").value = "";
    $("#chat-input").focus();
  }

  function addMsg(role, name, text) {
    const wrap = $("#chat-log");
    const div = document.createElement("div");
    div.className = "msg msg-" + role;
    if (name) {
      const nm = document.createElement("div");
      nm.className = "msg-name";
      nm.textContent = role === "user" ? "你" : name;
      div.appendChild(nm);
    }
    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.textContent = text;
    div.appendChild(bubble);
    wrap.appendChild(div);
    wrap.scrollTop = wrap.scrollHeight;
  }

  async function sendChat() {
    const input = $("#chat-input");
    const text = input.value.trim();
    if (!text || !game.chat) return;
    input.value = "";
    addMsg("user", "", text);
    const btn = $("#chat-send");
    btn.disabled = true;
    input.disabled = true;

    const typing = document.createElement("div");
    typing.className = "msg msg-bot";
    const bub = document.createElement("div");
    bub.className = "msg-bubble";
    bub.textContent = "（" + game.chat.name + " 正在斟酌措辞……）";
    typing.appendChild(bub);
    $("#chat-log").appendChild(typing);

    const cfg = loadCfg();
    const r = await game.sendChat(text, cfg);
    typing.remove();
    if (r.success) {
      addMsg("bot", game.chat.name, r.text);
    } else {
      addMsg("bot", game.chat.name, "（" + r.message + "）");
    }
    btn.disabled = false;
    input.disabled = false;
    input.focus();
  }

  /* ============================================================
   * 存档
   * ============================================================ */
  let saveReturn = "menu";
  function openSaves(backTo) {
    saveReturn = backTo || "menu";
    renderSaves();
    showScreen("screen-saves");
  }
  function renderSaves() {
    const grid = $("#save-slots");
    grid.innerHTML = "";
    // 仅在有未完成剧情进度（阅读剧情中）时可存档，否则为读档模式
    const canSave = !!game.getResumePoint();
    const hint = $("#save-mode-hint");
    if (hint) {
      hint.textContent = canSave
        ? "有未完成的剧情进度，可保存当前进度；也可以读取或删除存档。"
        : "当前没有进行中的剧情，仅可读取或删除存档。";
    }
    const slots = game.listSlots();
    const now = Date.now();
    slots.forEach((s, i) => {
      const slot = i + 1;
      const div = document.createElement("div");
      div.className = "save-slot" + (s ? "" : " empty");
      if (s) {
        const dt = new Date(s.timestamp);
        const ago = Math.floor((now - s.ts) / 60000);
        const agoTxt = ago < 1 ? "刚刚" : ago < 60 ? ago + " 分钟前" : ago < 1440 ? Math.floor(ago / 60) + " 小时前" : Math.floor(ago / 1440) + " 天前";
        let info = s.mode === "plot" && s.plot_script
          ? "剧情：《" + (DATA.plots[s.plot_script] ? DATA.plots[s.plot_script].title : s.plot_script) + "》"
          : s.mode === "event" ? "事件中" : "茶馆闲坐";
        div.innerHTML =
          '<div class="save-slot-num">槽位 ' + slot + (s.label ? " · " + s.label : "") + "</div>" +
          '<div class="save-slot-info">' + info + "</div>" +
          '<div class="save-slot-time">' + dt.toLocaleString() + "（" + agoTxt + "）</div>" +
          '<div class="save-slot-btns">' +
          '<button class="chip" data-op="load">读取</button>' +
          (canSave ? '<button class="chip" data-op="save">覆盖</button>' : "") +
          '<button class="chip" data-op="del">删除</button>' +
          "</div>";
      } else {
        div.innerHTML =
          '<div class="save-slot-num">槽位 ' + slot + "</div>" +
          '<div class="save-slot-info">空</div>' +
          '<div class="save-slot-btns">' + (canSave ? '<button class="chip" data-op="save">在此保存</button>' : '<span class="save-slot-info">仅读档模式</span>') + '</div>';
      }
      div.addEventListener("click", (e) => {
        const op = e.target.dataset.op;
        if (!op) return;
        e.stopPropagation();
        if (op === "save") {
          const label = prompt("给这个存档起个名字（可留空）：", "");
          if (label === null) return;
          const r = game.save(slot, label || "");
          if (r.success) renderSaves();
        } else if (op === "load") {
          const r = game.load(slot);
          if (!r.success) { showModal("提示", r.message); return; }
          renderSaves();
          if (r.data.mode === "plot" && r.data.plot_script) {
            // 注意：不能先 goMenu()——它会清掉刚恢复的剧情会话
            resumePlot();
          } else {
            showModal("已读取", "存档已载入，好感度与剧情进度已恢复。", [{ label: "好的", primary: true, onClick: goMenu }]);
          }
        } else if (op === "del") {
          if (confirm("确认删除槽位 " + slot + " 的存档？")) {
            game.deleteSlot(slot);
            renderSaves();
          }
        }
      });
      grid.appendChild(div);
    });
  }

  /* ============================================================
   * 存档导出 / 导入
   * ============================================================ */
  const SAVE_PREFIX = "daosu_html_v1_save_";
  function slotKey(n) { return SAVE_PREFIX + String(n).padStart(2, "0"); }

  /* 导出：好感度 + 已完成章节 + 全部 20 个槽位 → JSON 文件下载 */
  function exportSaves() {
    const slots = game.listSlots();
    const payload = {
      app: "daosu_teahouse",
      version: 1,
      exported_at: new Date().toISOString(),
      progress: {
        affection: game.affection,
        completed: game.completed,
      },
      saves: slots,
    };
    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const d = new Date();
      const stamp = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      a.download = "daosu_saves_" + stamp + ".json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      showModal("导出完成", "已下载存档文件（.json）。\n请妥善保管该文件；在新设备或清除浏览器数据后，可通过「导入存档」恢复。", [{ label: "好的", primary: true }]);
    } catch (e) {
      showModal("导出失败", e.message);
    }
  }

  /* 导入：读取 JSON 文件，恢复好感度 / 已完成章节 / 槽位存档 */
  function importSaves(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || data.app !== "daosu_teahouse") throw new Error("不是悼溯茶馆的存档文件。");
        if (!Array.isArray(data.saves)) throw new Error("存档数据格式不正确。");
        // 恢复槽位（最多 20 个；null 槽位清空）
        let restored = 0;
        data.saves.slice(0, 20).forEach((s, i) => {
          try {
            if (s && typeof s === "object") {
              localStorage.setItem(slotKey(i + 1), JSON.stringify(s));
              restored++;
            } else {
              localStorage.removeItem(slotKey(i + 1));
            }
          } catch (e) { /* 单槽失败忽略 */ }
        });
        // 恢复好感度与已完成章节
        if (data.progress && typeof data.progress === "object") {
          localStorage.setItem("daosu_html_v1_progress", JSON.stringify({
            affection: data.progress.affection || {},
            completed: data.progress.completed || {},
          }));
        }
        // 刷新内存状态与界面
        game._loadPersist();
        renderSaves();
        showModal("导入成功", "已恢复 " + restored + " 个存档槽位" +
          (data.progress ? "，好感度与剧情进度已同步。" : "。"), [{ label: "好的", primary: true }]);
      } catch (e) {
        showModal("导入失败", "无法读取该文件：" + e.message);
      }
    };
    reader.onerror = () => showModal("导入失败", "文件读取出错。");
    reader.readAsText(file);
  }

  /* ============================================================
   * 设置
   * ============================================================ */
  function loadCfg() {
    try { return JSON.parse(localStorage.getItem(CFG_KEY)) || {}; } catch (e) { return {}; }
  }
  function fillCfgForm() {
    const c = loadCfg();
    $("#cfg-base").value = c.base_url || "";
    $("#cfg-key").value = c.api_key || "";
    $("#cfg-model").value = c.model || "";
  }
  function saveCfg() {
    localStorage.setItem(CFG_KEY, JSON.stringify({
      base_url: $("#cfg-base").value.trim(),
      api_key: $("#cfg-key").value.trim(),
      model: $("#cfg-model").value.trim(),
    }));
    const msg = $("#settings-msg");
    msg.textContent = "已保存。";
    setTimeout(() => { msg.textContent = ""; }, 2000);
  }
  function applyFont(size) {
    const map = { sm: "15px", md: "17px", lg: "19px" };
    document.documentElement.style.setProperty("--fs-body", map[size] || "17px");
    try { localStorage.setItem("daosu_html_v1_font", size); } catch (e) { /* 存储不可用时忽略 */ }
  }

  /* ============================================================
   * 事件绑定
   * ============================================================ */
  function bindGlobal() {
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-action]");
      if (!el) return;
      const act = el.dataset.action;
      switch (act) {
        case "start": {
          renderMenu(); showScreen("screen-menu");
          break;
        }
        case "menu-continue": {
          if (game.loadedSlot && game.loadedSlot.mode === "plot" && game.plotScript && game.plotNode) {
            // 有已载入且当前活跃的存档会话：从存档继续
            resumePlot();
          } else if (game.getResumePoint()) {
            // 有断点：从上次退出的节点继续
            resumeFromPoint();
          } else if (game.mode === "plot" && game.plotScript) {
            // 仅有未存档的临时进度：清空它，重新从干净状态开始
            game.endPlot();
            renderMenu();
            showScreen("screen-menu");
            showModal("已重置临时进度", "上次的剧情进度未保存，已重新开始。\n好感度与已完成章节不受影响，可通过存档继续。", [{ label: "知道了", primary: true }]);
          } else {
            renderMenu(); showScreen("screen-menu");
          }
          break;
        }
        case "side-stories": {
          $("#side-stories-panel").classList.toggle("hidden");
          break;
        }
        case "open-changelog": {
          showModal("更新日志", [
            "v1.1.4 · 深度亲吻场景",
            "· 第 7 章新增：江边之吻后的深入拥抱与深吻（手探入衣摆、贴于腰侧）",
            "",
            "v1.1.3 · 第 6 章延长",
            "· 《茶烟深处的答案》新增雨中铺垫与夜色收尾，全章约 6000 字",
            "",
            "v1.1.2 · 修复",
            "· 修复：开发者模式设置进度后，点卡片不弹重置确认的问题",
            "",
            "v1.1.1 · 壁咚剧情",
            "· 第 7 章新增壁咚场景：洛疏律主动壁咚，玩家可选择反攻或顺从",
            "",
            "v1.1.0 · 亲密互动拓展",
            "· 第 6 章新增拥抱（好感 65+）/亲吻（85+）；番外第 7 章《雨停之后》（75+）",
            "· 好感度不足时，部分选项会隐藏并显示解锁提示",
            "",
            "v1.0.0 · 初版",
            "· 移植自 AstrBot 插件「悼溯茶馆」v1.2.4",
            "· 双角色主线剧情、小剧场、好感度系统、自由聊天",
          ].join("\n"), [{ label: "知道了", primary: true }]);
          break;
        }
        case "open-saves": {
          const inGame = $("#screen-game").classList.contains("active");
          openSaves(inGame ? "game" : "menu");
          break;
        }
        case "open-settings": fillCfgForm(); showScreen("screen-settings"); break;
        case "open-devtools": openDevtools(); break;
        case "devtools-back": showScreen("screen-settings"); break;
        case "dev-unlock": devUnlock(); break;
        case "dev-set-aff": devSetAffection(); break;
        case "dev-set-chapter": devSetChapter(); break;
        case "dev-reset": {
          game.resetProgress();
          $("#dev-msg").textContent = "好感度与剧情进度已全部重置。";
          renderMenu();
          break;
        }
        case "exit-game": {
          goMenu();
          break;
        }
        case "resume-plot": resumePlot(); break;
        case "chat-exit": {
          goMenu();
          break;
        }
        case "saves-back": {
          if (saveReturn === "game") {
            if (currentActor && currentActor.kind === "plot" && game.plotNode) {
              showScreen("screen-game");
            } else if (game.mode === "chat") {
              showScreen("screen-chat");
            } else { goMenu(); }
          } else { goMenu(); }
          break;
        }
        case "settings-back": {
          if (currentActor && currentActor.kind === "plot" && game.plotNode && game.mode === "plot") {
            showScreen("screen-game");
          } else if (game.mode === "chat" && game.chat) {
            showScreen("screen-chat");
          } else { goMenu(); }
          break;
        }
        case "settings-save": saveCfg(); break;
        case "font-sm": applyFont("sm"); break;
        case "font-md": applyFont("md"); break;
        case "font-lg": applyFont("lg"); break;
        case "export-saves": exportSaves(); break;
        case "import-saves": $("#import-file").click(); break;
        case "factory-reset": {
          showModal("清空全部数据", "将删除本机保存的全部进度、好感度与设置。\n（浏览器本地数据，无法恢复）", [
            { label: "确认清空", primary: true, onClick: () => {
                Object.keys(localStorage).filter(k => k.startsWith("daosu_html_v1")).forEach(k => localStorage.removeItem(k));
                location.reload();
              } },
            { label: "取消" },
          ]);
          break;
        }
      }
    });

    // 存档导入：文件选择
    $("#import-file").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) importSaves(file);
      e.target.value = "";
    });

    // 聊天发送
    $("#chat-send").addEventListener("click", sendChat);
    $("#chat-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendChat();
    });
  }

  /* ---------------- 初始化 ---------------- */
  function init() {
    // 存储可用性检测（Firefox 在部分 file:// 场景下可能禁用 localStorage）
    let storageOk = true;
    try {
      localStorage.setItem("daosu_html_v1_probe", "1");
      localStorage.removeItem("daosu_html_v1_probe");
    } catch (e) {
      storageOk = false;
      console.warn("[悼溯] 本地存储不可用，存档功能将被禁用。", e);
    }
    if (!storageOk) {
      showModal("存档不可用", `当前环境无法使用本地存储（Firefox 在直接打开文件时可能限制）。

建议通过本地服务器打开：
  python -m http.server
然后在浏览器访问 http://localhost:8000

（剧情游玩不受影响，仅无法保存进度）`);
    }
    const font = localStorage.getItem("daosu_html_v1_font");
    if (font) applyFont(font);
    bindGlobal();
    renderMenu();
    showScreen("screen-cover");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
