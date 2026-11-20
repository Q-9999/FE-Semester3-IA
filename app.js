(() => {
  'use strict';

  // =========================================================================
  // 1. CONSTANTS & SUBJECT METADATA (FPT SEMESTER 3 - 5 SUBJECTS)
  // =========================================================================

  const SUBJECT_INFO = {
    all: {
      code: 'ALL',
      name: 'Toàn bộ Kỳ 3 (5 Môn)',
      short: 'Tổng hợp 1,594 câu hỏi 5 môn Kỳ 3',
      lang: 'General'
    },
    CSD203: {
      code: 'CSD203',
      name: 'CSD203: Data Structures & Algorithms (Python)',
      short: 'Cấu trúc dữ liệu & Giải thuật Python',
      lang: 'Python 3'
    },
    DBI202: {
      code: 'DBI202',
      name: 'DBI202: Introduction to Databases (SQL)',
      short: 'Cơ sở dữ liệu SQL Server',
      lang: 'T-SQL / SQL'
    },
    IAO202: {
      code: 'IAO202',
      name: 'IAO202: Information Assurance Operations',
      short: 'Vận hành An toàn thông tin',
      lang: 'Security CLI'
    },
    NWC303: {
      code: 'NWC303',
      name: 'NWC303: Computer Networking',
      short: 'Mạng máy tính & Giao thức',
      lang: 'Network CLI'
    },
    JPD113: {
      code: 'JPD113',
      name: 'JPD113: Elementary Japanese 3',
      short: 'Tiếng Nhật cơ sở 3',
      lang: 'Japanese'
    }
  };

  const SUBJECT_KEYS = ['CSD203', 'DBI202', 'IAO202', 'NWC303', 'JPD113'];

  const STORAGE_KEYS = {
    THEME: 'fu_eos_theme',
    STARRED: 'fu_eos_v2_starred',
    MISTAKES: 'fu_eos_v2_mistakes',
    ATTEMPTED: 'fu_eos_v2_attempted',
    MODULE_STATS: 'fu_eos_v2_modstats',
    DAILY_HISTORY: 'fu_eos_v2_daily',
    FE_TESTS: 'fu_eos_v2_fetests',
    EXAM_CONFIG: 'fu_eos_v2_examcfg',
    FE_CFG: 'fu_eos_v2_fecfg',
    SIDEBAR_COLLAPSED: 'fu_eos_v2_sidebar_collapsed',
    MIGRATED_V1: 'fu_eos_v2_migrated_from_v1',
    LEGACY_PROGRESS: 'fu_eos_progress_v1',
    LEGACY_EXAMS: 'fu_eos_exams_v1'
  };

  // =========================================================================
  // 2. UTILITIES
  // =========================================================================

  class Utils {
    static escapeHtml(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    static shuffleArray(array) {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    static copyToClipboard(text, btnElement = null) {
      if (!navigator.clipboard || !navigator.clipboard.writeText) return;
      navigator.clipboard.writeText(text).then(() => {
        if (btnElement) {
          const orig = btnElement.innerText;
          btnElement.innerText = 'Đã chép!';
          setTimeout(() => { btnElement.innerText = orig; }, 1400);
        }
      }).catch(() => {});
    }

    static copyCli(btn, text) {
      if (!navigator.clipboard || !navigator.clipboard.writeText) return;
      navigator.clipboard.writeText(text).then(() => {
        const span = btn.querySelector('span');
        if (span) span.innerText = 'Đã sao chép!';
        btn.style.color = '#22c55e';
        setTimeout(() => {
          if (span) span.innerText = 'Sao chép';
          btn.style.color = '';
        }, 1600);
      }).catch(() => {});
    }

    static highlightCodeSyntax(escapedText) {
      return escapedText
        .replace(/^(\s*(?:#|--|\/\/).*)$/gm, '<span class="cli-comment">$1</span>')
        .replace(/\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|GROUP BY|ORDER BY|HAVING|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|PRIMARY KEY|FOREIGN KEY|AS|ON|AND|OR|NOT|IN|NULL|DISTINCT|COUNT|SUM|AVG|MAX|MIN|def|class|return|if|elif|else|for|while|import|from|in|range|len|None|True|False|self|print|switchport|router|interface|vlan|ip|access-list|permit|deny)\b/g, '<span class="cli-keyword">$1</span>');
    }

    static renderCodeTerminal(codeSnippet, subject = 'CSD203') {
      if (!codeSnippet || !String(codeSnippet).trim()) return '';
      const raw = String(codeSnippet).trim();
      const langTitle = SUBJECT_INFO[subject]?.lang || 'Code Snippet';
      const highlighted = Utils.highlightCodeSyntax(Utils.escapeHtml(raw));
      return `
        <div class="cisco-terminal-box">
          <div class="terminal-topbar">
            <div class="terminal-dots">
              <span class="dot dot-red"></span>
              <span class="dot dot-yellow"></span>
              <span class="dot dot-green"></span>
            </div>
            <span class="terminal-title">${Utils.escapeHtml(langTitle)}</span>
            <button type="button" class="btn-copy-cli" data-cli="${Utils.escapeHtml(raw)}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              <span>Sao chép</span>
            </button>
          </div>
          <pre class="terminal-code"><code>${highlighted}</code></pre>
        </div>
      `;
    }

    static formatQuestionText(text) {
      if (!text) return '';
      const escaped = Utils.escapeHtml(String(text));
      return escaped
        .replace(/`([^`]+)`/g, '<code class="inline-cli-code">$1</code>')
        .replace(/\n/g, '<br>');
    }

    static formatExplanation(text) {
      if (!text) return '';
      return Utils.escapeHtml(String(text))
        .replace(/`([^`]+)`/g, '<code class="inline-cli-code">$1</code>')
        .replace(/\n/g, '<br>');
    }

    static getSlidePath(q) {
      if (!q) return '';
      if (q.imagePath && !String(q.imagePath).startsWith('/api/slides/')) {
        return q.imagePath;
      }
      if (q.imageFileName) {
        const sub = (q.subject || 'CSD203').toUpperCase();
        return `/SEMESTER_3_${sub}/${q.imageFileName}`;
      }
      return '';
    }

    static renderSlidePreview(q, expandedByDefault = false) {
      const path = Utils.getSlidePath(q);
      if (!path) return '';
      const safePath = Utils.escapeHtml(path);
      const panelId = `slide_panel_${q.id}_${Math.random().toString(36).slice(2, 7)}`;
      return `
        <div class="slide-preview-wrap" style="margin: 10px 0;">
          <div class="slide-preview-header">
            <span>Tài liệu Slide tham khảo (${Utils.escapeHtml(q.imageFileName || 'Slide')})</span>
            <button type="button" class="btn btn-outline btn-xs btn-toggle-slide" data-target="${panelId}">
              ${expandedByDefault ? 'Ẩn Slide' : 'Xem Slide gốc'}
            </button>
          </div>
          <div id="${panelId}" style="display: ${expandedByDefault ? 'block' : 'none'};">
            <img src="${safePath}" alt="Slide minh họa" class="slide-preview-img" loading="lazy"
                 onerror="if(!this.dataset.fallbackTried){this.dataset.fallbackTried='1';this.src=this.src.endsWith('.png')?this.src.replace(/\.png$/i,'.jpg'):this.src.replace(/\.jpg$/i,'.png');}else{this.closest('.slide-preview-wrap').style.display='none';}">
          </div>
        </div>
      `;
    }

    static getDifficultyMeta(diff) {
      const d = (diff || 'Medium').toLowerCase();
      if (d === 'easy') return { label: 'Cơ bản', cls: 'diff-easy' };
      if (d === 'hard') return { label: 'Nâng cao', cls: 'diff-hard' };
      return { label: 'Trung bình', cls: 'diff-medium' };
    }

    static renderFixSourceBadge(q) {
      if (!q || !q.fixSource) return '';
      const tip = q.fixSourceNote || 'Đã hiệu chỉnh đáp án chuẩn so với tài liệu Source gốc';
      return `<button type="button" class="fix-source-pill" data-fixnote="${Utils.escapeHtml(tip)}" title="${Utils.escapeHtml(tip)}">Fix-Source</button>`;
    }

    static renderFixSourceBanner(q) {
      if (!q || !q.fixSource || !q.fixSourceNote) return '';
      return `<div class="fix-source-banner"><strong>Fix-Source:</strong> ${Utils.escapeHtml(q.fixSourceNote)}</div>`;
    }

    static showToast(message) {
      if (!message) return;
      let toast = document.getElementById('appFloatingToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'appFloatingToast';
        toast.className = 'fix-source-toast';
        document.body.appendChild(toast);
      }
      toast.innerText = String(message);
      toast.classList.add('visible');
      clearTimeout(toast._hideTimer);
      toast._hideTimer = setTimeout(() => {
        toast.classList.remove('visible');
      }, 4200);
    }

    static formatTimeMmSs(totalSeconds) {
      const sec = Math.max(0, Math.floor(totalSeconds));
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  }

  // =========================================================================
  // 3. STORAGE SERVICE & LEGACY MIGRATION
  // =========================================================================

  class StorageService {
    static getJson(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    }

    static setJson(key, val) {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {}
    }

    static todayKey(dateObj = new Date()) {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    static getTheme() {
      return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    }

    static setTheme(theme) {
      try { localStorage.setItem(STORAGE_KEYS.THEME, theme); } catch (e) {}
    }

    static getStarred() {
      return new Set(StorageService.getJson(STORAGE_KEYS.STARRED, []));
    }

    static saveStarred(set) {
      StorageService.setJson(STORAGE_KEYS.STARRED, Array.from(set));
    }

    static getMistakes() {
      return new Set(StorageService.getJson(STORAGE_KEYS.MISTAKES, []));
    }

    static saveMistakes(set) {
      StorageService.setJson(STORAGE_KEYS.MISTAKES, Array.from(set));
    }

    static getAttempted() {
      return new Set(StorageService.getJson(STORAGE_KEYS.ATTEMPTED, []));
    }

    static saveAttempted(set) {
      StorageService.setJson(STORAGE_KEYS.ATTEMPTED, Array.from(set));
    }

    static getModuleStats() {
      return StorageService.getJson(STORAGE_KEYS.MODULE_STATS, {});
    }

    static saveModuleStats(stats) {
      StorageService.setJson(STORAGE_KEYS.MODULE_STATS, stats);
    }

    static getDailyHistory() {
      return StorageService.getJson(STORAGE_KEYS.DAILY_HISTORY, {});
    }

    static saveDailyHistory(history) {
      StorageService.setJson(STORAGE_KEYS.DAILY_HISTORY, history);
    }

    static getFeTests() {
      return StorageService.getJson(STORAGE_KEYS.FE_TESTS, []);
    }

    static saveFeTests(tests) {
      StorageService.setJson(STORAGE_KEYS.FE_TESTS, tests);
    }

    static getExamConfig() {
      return StorageService.getJson(STORAGE_KEYS.EXAM_CONFIG, {
        shuffleQuestions: true,
        shuffleOptions: true,
        timerMinutes: 60,
        subject: 'all'
      });
    }

    static saveExamConfig(cfg) {
      StorageService.setJson(STORAGE_KEYS.EXAM_CONFIG, cfg);
    }

    static migrateFromV1IfNeeded() {
      if (localStorage.getItem(STORAGE_KEYS.MIGRATED_V1)) return;
      try {
        const legacyProg = StorageService.getJson(STORAGE_KEYS.LEGACY_PROGRESS, null);
        if (legacyProg && typeof legacyProg === 'object') {
          const starred = StorageService.getStarred();
          const mistakes = StorageService.getMistakes();
          const attempted = StorageService.getAttempted();

          Object.entries(legacyProg).forEach(([qid, rec]) => {
            if (!rec || typeof rec !== 'object') return;
            if (rec.bookmarked) starred.add(qid);
            if (rec.masteryStatus === 'review_needed') mistakes.add(qid);
            if (rec.masteryStatus || (rec.timesAnswered && rec.timesAnswered > 0)) {
              attempted.add(qid);
            }
          });

          StorageService.saveStarred(starred);
          StorageService.saveMistakes(mistakes);
          StorageService.saveAttempted(attempted);
        }

        const legacyExams = StorageService.getJson(STORAGE_KEYS.LEGACY_EXAMS, null);
        if (Array.isArray(legacyExams) && legacyExams.length > 0) {
          const feTests = StorageService.getFeTests();
          if (feTests.length === 0) {
            legacyExams.slice(0, 10).forEach((ex, i) => {
              const total = ex.totalQuestions || 50;
              const correct = ex.correctCount || 0;
              const pct = Math.round(ex.scorePercentage || (total ? (correct / total) * 100 : 0));
              const dateStr = ex.createdAt ? new Date(ex.createdAt).toLocaleDateString('vi-VN') : StorageService.todayKey();
              feTests.push({
                id: `Legacy_Exam_${i + 1}`,
                title: `${ex.subject || 'Kỳ 3'} (${total}Q • Lịch sử cũ)`,
                subject: ex.subject || 'all',
                mode: 'exam',
                durationMinutes: 60,
                shuffle: true,
                createdAt: dateStr,
                lastDate: dateStr,
                questionIds: [],
                completed: true,
                scorePct: pct,
                correctCount: correct,
                history: [{
                  turn: 1,
                  date: dateStr,
                  scorePct: pct,
                  correctCount: correct,
                  totalCount: total,
                  wrongQuestions: []
                }]
              });
            });
            StorageService.saveFeTests(feTests);
          }
        }
        localStorage.setItem(STORAGE_KEYS.MIGRATED_V1, '1');
      } catch (e) {}
    }
  }

  // =========================================================================
  // 4. DATA STORE
  // =========================================================================

  class ExamDataStore {
    constructor() {
      this.questions = [];
      this.questionMap = new Map();
      this.bySubject = new Map();
      this.topicsBySubject = new Map();

      StorageService.migrateFromV1IfNeeded();

      this.starredIds = StorageService.getStarred();
      this.mistakesIds = StorageService.getMistakes();
      this.attemptedIds = StorageService.getAttempted();
      this.moduleStats = StorageService.getModuleStats();
      this.dailyHistory = StorageService.getDailyHistory();
      this.feTests = StorageService.getFeTests();
    }

    async loadQuestions() {
      const res = await fetch('/data/questions.json');
      if (!res.ok) throw new Error(`HTTP ${res.status} khi tải /data/questions.json`);
      const raw = await res.json();
      if (!Array.isArray(raw)) throw new Error('Dữ liệu questions.json không hợp lệ');

      this.questions = raw.map((item) => {
        const subject = (item.subject || 'CSD203').toUpperCase();
        const correctKey = String(item.correctAnswer || 'A').trim().toUpperCase();
        const parsedKeys = Array.from(new Set(correctKey.replace(/[^A-Z]/g, '').split('')));
        const correctKeys = parsedKeys.length > 0 ? parsedKeys : ['A'];
        const opts = Array.isArray(item.options)
          ? item.options.map((o, idx) => {
              const key = String(o.key || String.fromCharCode(65 + idx)).trim().toUpperCase();
              return {
                key,
                text: String(o.text ?? ''),
                isCorrect: correctKeys.includes(key)
              };
            })
          : [];

        return {
          id: String(item.id),
          subject,
          subjectName: item.subjectName || SUBJECT_INFO[subject]?.name || subject,
          topic: String(item.topic || 'Chung').trim(),
          difficulty: String(item.difficulty || 'Medium').trim(),
          questionText: String(item.questionText || ''),
          codeSnippet: item.codeSnippet ? String(item.codeSnippet) : '',
          options: opts,
          correctAnswer: correctKey,
          correctKeys,
          isMultiple: correctKeys.length > 1,
          explanation: item.explanation ? String(item.explanation) : '',
          imageFileName: item.imageFileName || '',
          imagePath: item.imagePath || '',
          speakerNote: item.speakerNote || '',
          fixSource: Boolean(item.fixSource),
          fixSourceNote: item.fixSourceNote ? String(item.fixSourceNote) : ''
        };
      });

      this.questionMap.clear();
      this.bySubject.clear();
      this.topicsBySubject.clear();

      SUBJECT_KEYS.forEach((k) => {
        this.bySubject.set(k, []);
        this.topicsBySubject.set(k, new Set());
      });
      const allTopics = new Set();

      this.questions.forEach((q) => {
        this.questionMap.set(q.id, q);
        if (!this.bySubject.has(q.subject)) this.bySubject.set(q.subject, []);
        this.bySubject.get(q.subject).push(q);

        if (!this.topicsBySubject.has(q.subject)) this.topicsBySubject.set(q.subject, new Set());
        if (q.topic) {
          this.topicsBySubject.get(q.subject).add(q.topic);
          allTopics.add(q.topic);
        }
      });

      this.topicsBySubject.set('all', allTopics);
    }

    /**
     * Checks whether the chosen option keys match a question's exact correct key set.
     */
    static isOptionSetCorrect(q, selectedKeys) {
      if (!q || !Array.isArray(q.correctKeys) || q.correctKeys.length === 0) return false;
      const rawArr = Array.isArray(selectedKeys) ? selectedKeys : (selectedKeys ? [selectedKeys] : []);
      const normalized = Array.from(
        new Set(
          rawArr
            .map((k) => String(k || '').trim().toUpperCase())
            .filter(Boolean)
        )
      );
      return normalized.length === q.correctKeys.length && q.correctKeys.every((k) => normalized.includes(k));
    }

    getQuestion(id) {
      return this.questionMap.get(id) || null;
    }

    getQuestionsBySubject(subjectKey) {
      if (!subjectKey || subjectKey === 'all') return this.questions;
      return this.bySubject.get(subjectKey) || [];
    }

    getTopics(subjectKey) {
      const set = this.topicsBySubject.get(subjectKey || 'all') || new Set();
      return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
    }

    toggleStar(id) {
      if (this.starredIds.has(id)) {
        this.starredIds.delete(id);
      } else {
        this.starredIds.add(id);
      }
      StorageService.saveStarred(this.starredIds);
      return this.starredIds.has(id);
    }

    addMistake(id) {
      if (!this.mistakesIds.has(id)) {
        this.mistakesIds.add(id);
        StorageService.saveMistakes(this.mistakesIds);
      }
    }

    removeMistake(id) {
      if (this.mistakesIds.has(id)) {
        this.mistakesIds.delete(id);
        StorageService.saveMistakes(this.mistakesIds);
      }
    }

    clearAllMistakes() {
      this.mistakesIds.clear();
      StorageService.saveMistakes(this.mistakesIds);
    }

    markAttempted(ids) {
      let changed = false;
      ids.forEach((id) => {
        if (!this.attemptedIds.has(id)) {
          this.attemptedIds.add(id);
          changed = true;
        }
      });
      if (changed) StorageService.saveAttempted(this.attemptedIds);
    }

    recordDailyActivity(questionIds = [], testResultPct = null) {
      const today = StorageService.todayKey();
      if (!this.dailyHistory[today]) {
        this.dailyHistory[today] = { qIds: [], tests: 0, bestPct: 0 };
      }
      const entry = this.dailyHistory[today];
      const set = new Set(entry.qIds || []);
      questionIds.forEach((id) => set.add(id));
      entry.qIds = Array.from(set);

      if (typeof testResultPct === 'number') {
        entry.tests = (entry.tests || 0) + 1;
        entry.bestPct = Math.max(entry.bestPct || 0, testResultPct);
      }
      StorageService.saveDailyHistory(this.dailyHistory);
    }

    recordSubjectExamStat(subjectKey, correct, total) {
      if (!subjectKey) return;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      if (!this.moduleStats[subjectKey]) {
        this.moduleStats[subjectKey] = { latest: null, history: [] };
      }
      const entry = {
        date: new Date().toLocaleDateString('vi-VN'),
        correct,
        total,
        pct
      };
      this.moduleStats[subjectKey].latest = { correct, total, percentage: pct };
      this.moduleStats[subjectKey].history.unshift(entry);
      if (this.moduleStats[subjectKey].history.length > 20) {
        this.moduleStats[subjectKey].history = this.moduleStats[subjectKey].history.slice(0, 20);
      }
      StorageService.saveModuleStats(this.moduleStats);
    }

    getStreakInfo() {
      const today = new Date();
      const last7 = [];
      let activeDays = 0;

      for (let offset = 6; offset >= 0; offset--) {
        const d = new Date(today);
        d.setDate(today.getDate() - offset);
        const key = StorageService.todayKey(d);
        const rec = this.dailyHistory[key];
        const count = rec ? (rec.qIds?.length || 0) : 0;
        const tests = rec ? (rec.tests || 0) : 0;
        const active = count > 0 || tests > 0;
        last7.push({
          key,
          label: key,
          count,
          active
        });
      }

      let currentStreak = 0;
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = StorageService.todayKey(d);
        const rec = this.dailyHistory[key];
        const active = rec && ((rec.qIds?.length || 0) > 0 || (rec.tests || 0) > 0);
        if (active) {
          currentStreak++;
        } else if (i > 0) {
          break;
        }
      }

      const sortedKeys = Object.keys(this.dailyHistory)
        .filter((k) => (this.dailyHistory[k]?.qIds?.length || 0) > 0 || (this.dailyHistory[k]?.tests || 0) > 0)
        .sort();
      let best = currentStreak;
      let run = 0;
      let prevDate = null;
      sortedKeys.forEach((k) => {
        const curDate = new Date(`${k}T00:00:00`);
        if (prevDate && (curDate - prevDate) === 86400000) {
          run++;
        } else {
          run = 1;
        }
        best = Math.max(best, run);
        prevDate = curDate;
      });

      const todayRec = this.dailyHistory[StorageService.todayKey(today)];
      return {
        current: currentStreak,
        best,
        todayCount: todayRec?.qIds?.length || 0,
        last7,
        activeDays
      };
    }
  }

  // =========================================================================
  // 5. STUDY CONTROLLER
  // =========================================================================

  class StudyController {
    constructor(dataStore, app) {
      this.dataStore = dataStore;
      this.app = app;
      this.BATCH_SIZE = 35;

      this.currentSubject = 'all';
      this.topicFilter = 'ALL';
      this.difficultyFilter = 'ALL';
      this.searchQuery = '';
      this.hideAnswers = false;
      this.selfTestMode = false;
      this.starredOnly = false;
      this.selfSelectedMap = new Map(); // qid -> selectedKey

      this.currentFilteredList = [];
      this.renderedCount = 0;
      this.railOpen = false;
      this.activeQuestionIndex = 0;
    }

    init() {
      this.populateTopicSelect();
      this.updateHeaderMeta();
      this.bindEvents();
    }

    bindEvents() {
      const topicEl = document.getElementById('studyTopicSelect');
      if (topicEl) {
        topicEl.onchange = () => {
          this.topicFilter = topicEl.value;
          this.render();
        };
      }

      const diffEl = document.getElementById('studyDifficultySelect');
      if (diffEl) {
        diffEl.onchange = () => {
          this.difficultyFilter = diffEl.value;
          this.render();
        };
      }

      const resetBtn = document.getElementById('studyResetFiltersBtn');
      if (resetBtn) {
        resetBtn.onclick = () => {
          this.topicFilter = 'ALL';
          this.difficultyFilter = 'ALL';
          this.searchQuery = '';
          this.starredOnly = false;
          const sInput = document.getElementById('searchInput');
          if (sInput) sInput.value = '';
          if (topicEl) topicEl.value = 'ALL';
          if (diffEl) diffEl.value = 'ALL';
          const starBtn = document.getElementById('filterStarredOnlyBtn');
          if (starBtn) starBtn.classList.remove('active');
          this.render();
        };
      }

      const toggleAnsBtn = document.getElementById('toggleAnswersBtn');
      if (toggleAnsBtn) {
        toggleAnsBtn.onclick = () => {
          this.hideAnswers = !this.hideAnswers;
          const lbl = document.getElementById('toggleAnswersText');
          if (lbl) lbl.innerText = this.hideAnswers ? 'Hiện đáp án' : 'Ẩn đáp án';
          toggleAnsBtn.classList.toggle('active', this.hideAnswers);
          this.render();
        };
      }

      const toggleInterBtn = document.getElementById('toggleInteractiveBtn');
      if (toggleInterBtn) {
        toggleInterBtn.onclick = () => {
          this.selfTestMode = !this.selfTestMode;
          toggleInterBtn.classList.toggle('active', this.selfTestMode);
          toggleInterBtn.innerText = this.selfTestMode ? 'Chế độ: Tự kiểm tra' : 'Chế độ: Xem đáp án';
          if (!this.selfTestMode) this.selfSelectedMap.clear();
          this.render();
        };
      }

      const starOnlyBtn = document.getElementById('filterStarredOnlyBtn');
      if (starOnlyBtn) {
        starOnlyBtn.onclick = () => this.toggleStarredOnly();
      }

      const startExamBtn = document.getElementById('startExamFromStudyBtn');
      if (startExamBtn) {
        startExamBtn.onclick = () => {
          this.app.startQuickSubjectExam(this.currentSubject);
        };
      }

      // Study Nav Rail Toggle
      const rail = document.getElementById('studyNavRail');
      const railToggle = document.getElementById('studyNavRailToggle');
      const railClose = document.getElementById('studyNavRailCloseBtn');
      if (rail && railToggle) {
        railToggle.onclick = (e) => {
          e.stopPropagation();
          this.railOpen = !this.railOpen;
          rail.classList.toggle('open', this.railOpen);
        };
      }
      if (rail && railClose) {
        railClose.onclick = (e) => {
          e.stopPropagation();
          this.railOpen = false;
          rail.classList.remove('open');
        };
      }
    }

    setSubject(subjectKey) {
      this.currentSubject = subjectKey || 'all';
      this.topicFilter = 'ALL';
      this.populateTopicSelect();
      this.updateHeaderMeta();
      this.render();
    }

    setSearch(query) {
      this.searchQuery = String(query || '').trim().toLowerCase();
      this.render();
    }

    toggleStarredOnly(forceState = null) {
      this.starredOnly = forceState !== null ? Boolean(forceState) : !this.starredOnly;
      const btn = document.getElementById('filterStarredOnlyBtn');
      if (btn) {
        btn.classList.toggle('active', this.starredOnly);
        btn.innerText = this.starredOnly ? 'Hiện tất cả câu' : 'Hiện câu đã lưu';
      }
      this.render();
    }

    populateTopicSelect() {
      const sel = document.getElementById('studyTopicSelect');
      if (!sel) return;
      const topics = this.dataStore.getTopics(this.currentSubject);
      sel.innerHTML = `<option value="ALL">Tất cả chủ đề (${topics.length})</option>` +
        topics.map((t) => `<option value="${Utils.escapeHtml(t)}">${Utils.escapeHtml(t)}</option>`).join('');
      sel.value = this.topicFilter;
    }

    updateHeaderMeta() {
      const info = SUBJECT_INFO[this.currentSubject] || SUBJECT_INFO.all;
      const count = this.dataStore.getQuestionsBySubject(this.currentSubject).length;
      const titleEl = document.getElementById('studyModuleTitle');
      const descEl = document.getElementById('studyModuleDesc');
      if (titleEl) titleEl.innerText = info.name;
      if (descEl) descEl.innerText = `${count} câu hỏi trắc nghiệm & giải thích chi tiết (${info.short}).`;
    }

    getFilteredQuestions() {
      let pool = this.dataStore.getQuestionsBySubject(this.currentSubject);

      if (this.topicFilter && this.topicFilter !== 'ALL') {
        pool = pool.filter((q) => q.topic === this.topicFilter);
      }

      if (this.difficultyFilter && this.difficultyFilter !== 'ALL') {
        pool = pool.filter((q) => q.difficulty.toLowerCase() === this.difficultyFilter.toLowerCase());
      }

      if (this.starredOnly) {
        pool = pool.filter((q) => this.dataStore.starredIds.has(q.id));
      }

      if (this.searchQuery) {
        const kw = this.searchQuery;
        pool = pool.filter((q) => {
          const optText = q.options.map((o) => o.text).join(' ');
          const haystack = `${q.id} ${q.subject} ${q.topic} ${q.questionText} ${q.codeSnippet} ${optText} ${q.explanation}`.toLowerCase();
          return haystack.includes(kw);
        });
      }

      return pool;
    }

    render() {
      const listEl = document.getElementById('studyQuestionsList');
      if (!listEl) return;

      this.currentFilteredList = this.getFilteredQuestions();
      this.renderedCount = 0;
      listEl.innerHTML = '';

      const totalSubject = this.dataStore.getQuestionsBySubject(this.currentSubject).length;
      const summaryEl = document.getElementById('studyFilterSummary');
      if (summaryEl) {
        summaryEl.innerText = `Hiển thị ${this.currentFilteredList.length} / ${totalSubject} câu`;
      }

      if (this.currentFilteredList.length === 0) {
        listEl.innerHTML = `
          <div class="study-card" style="text-align: center; padding: 2.5rem 1.5rem;">
            <h3 style="margin-bottom: 0.5rem;">Không tìm thấy câu hỏi phù hợp</h3>
            <p style="color: var(--text-muted); margin-bottom: 1rem;">Thử thay đổi từ khóa tìm kiếm, chủ đề, độ khó hoặc tắt bộ lọc "Đã lưu".</p>
          </div>
        `;
        this.updateStudyNavRail();
        return;
      }

      this.renderNextBatch();
      this.updateStudyNavRail();
    }

    renderNextBatch() {
      const listEl = document.getElementById('studyQuestionsList');
      if (!listEl) return;

      const existingLoadMore = document.getElementById('studyLoadMoreContainer');
      if (existingLoadMore) existingLoadMore.remove();

      const frag = document.createDocumentFragment();
      const end = Math.min(this.renderedCount + this.BATCH_SIZE, this.currentFilteredList.length);

      for (let i = this.renderedCount; i < end; i++) {
        const card = this.createQuestionCard(this.currentFilteredList[i], i);
        frag.appendChild(card);
      }

      listEl.appendChild(frag);
      this.renderedCount = end;

      if (this.renderedCount < this.currentFilteredList.length) {
        const wrap = document.createElement('div');
        wrap.id = 'studyLoadMoreContainer';
        wrap.style.cssText = 'text-align: center; margin: 24px 0 36px;';
        wrap.innerHTML = `
          <button type="button" class="btn btn-outline" id="btnStudyLoadMore" style="padding: 10px 24px; font-weight: 600;">
            Tải thêm câu hỏi (${this.renderedCount} / ${this.currentFilteredList.length})
          </button>
        `;
        const btn = wrap.querySelector('#btnStudyLoadMore');
        if (btn) {
          btn.onclick = () => {
            this.renderNextBatch();
            this.updateStudyNavRail();
          };
        }
        listEl.appendChild(wrap);
      }
    }

    createQuestionCard(q, index) {
      const card = document.createElement('div');
      card.className = 'study-card';
      card.dataset.id = q.id;
      card.dataset.qindex = index;

      const isStarred = this.dataStore.starredIds.has(q.id);
      const diffMeta = Utils.getDifficultyMeta(q.difficulty);
      const rawPicked = this.selfSelectedMap.get(q.id);
      const pickedKeys = Array.isArray(rawPicked) ? rawPicked : (rawPicked ? [rawPicked] : []);
      const requiredCount = q.correctKeys?.length || 1;
      const isRevealed = this.selfTestMode
        ? (q.isMultiple ? pickedKeys.length >= requiredCount : pickedKeys.length > 0)
        : !this.hideAnswers;

      const codeHtml = q.codeSnippet ? Utils.renderCodeTerminal(q.codeSnippet, q.subject) : '';
      const slideHtml = Utils.renderSlidePreview(q, false);

      let optsHtml = '';
      q.options.forEach((opt, optIdx) => {
        const letter = opt.key || String.fromCharCode(65 + optIdx);
        const isPicked = pickedKeys.includes(letter);
        let cls = 'study-option';
        let badge = '';
        let pendingStyle = '';

        if (this.selfTestMode) {
          cls += ' interactive-opt';
          if (isRevealed) {
            if (opt.isCorrect) {
              cls += ' user-selected-correct';
              badge = `<span class="study-option-badge badge-green">${isPicked ? 'Bạn chọn (Đúng)' : 'Đáp án đúng'}</span>`;
            } else if (isPicked) {
              cls += ' user-selected-wrong';
              badge = '<span class="study-option-badge badge-red">Bạn chọn (Sai)</span>';
            }
          } else if (isPicked) {
            pendingStyle = ' style="border-color: var(--primary); background: var(--primary-light);"';
            badge = `<span class="study-option-badge" style="color: var(--primary); background: rgba(29, 114, 184, 0.14);">Đã chọn (${pickedKeys.length}/${requiredCount})</span>`;
          }
        } else if (opt.isCorrect && !this.hideAnswers) {
          cls += ' correct';
          badge = '<span class="study-option-badge">Đáp án đúng</span>';
        }

        optsHtml += `
          <div class="${cls}" data-optkey="${letter}"${pendingStyle}>
            <span class="option-indicator">${letter}</span>
            <div style="flex: 1;">${Utils.escapeHtml(opt.text)}</div>
            ${badge}
            <button type="button" class="copy-btn" title="Sao chép đáp án" data-copy="${Utils.escapeHtml(opt.text)}">Sao chép</button>
          </div>
        `;
      });

      let expHtml = '';
      if ((q.explanation || q.speakerNote || (q.fixSource && q.fixSourceNote)) && isRevealed) {
        const fixBanner = Utils.renderFixSourceBanner(q);
        const noteBlock = q.speakerNote
          ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(43, 147, 72, 0.25); font-size: 13px; color: var(--text-muted);"><strong>Ghi chú Slide:</strong> ${Utils.escapeHtml(q.speakerNote)}</div>`
          : '';
        expHtml = `
          <div class="explanation-box">
            ${fixBanner}
            <div class="exp-text">
              <strong>Giải thích:</strong> ${q.explanation ? Utils.formatExplanation(q.explanation) : 'Xem đáp án được đánh dấu ở trên.'}
            </div>
            ${noteBlock}
          </div>
        `;
      }

      card.innerHTML = `
        <div class="study-card-header">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span class="study-qnum">Câu ${index + 1}</span>
            <span class="tag-badge">${Utils.escapeHtml(q.subject)}</span>
            ${q.isMultiple ? `<span class="tag-badge" style="background: #fef3c7; color: #b45309;">Chọn ${requiredCount} đáp án</span>` : ''}
            <span class="topic-pill-tag">${Utils.escapeHtml(q.topic)}</span>
            <span class="diff-pill ${diffMeta.cls}">${diffMeta.label}</span>
            ${Utils.renderFixSourceBadge(q)}
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <span style="font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">${Utils.escapeHtml(q.id)}</span>
            <button type="button" class="btn-star ${isStarred ? 'starred' : ''}" title="${isStarred ? 'Bỏ lưu câu này' : 'Lưu câu này'}">
              ${isStarred ? '★' : '☆'}
            </button>
          </div>
        </div>

        <div style="font-size: 15.5px; font-weight: 600; margin: 12px 0; line-height: 1.65;">
          ${Utils.formatQuestionText(q.questionText)}
        </div>

        ${codeHtml}
        ${slideHtml}
        <div class="study-options">${optsHtml}</div>
        ${expHtml}
      `;

      // Bind bookmark star
      const starBtn = card.querySelector('.btn-star');
      if (starBtn) {
        starBtn.onclick = (e) => {
          e.stopPropagation();
          const starred = this.dataStore.toggleStar(q.id);
          starBtn.classList.toggle('starred', starred);
          starBtn.innerText = starred ? '★' : '☆';
          this.app.updateBadges();
          this.updateStudyNavRail();
        };
      }

      // Bind copy option button
      card.querySelectorAll('.copy-btn').forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation();
          Utils.copyToClipboard(btn.getAttribute('data-copy') || '', btn);
        };
      });

      // Bind interactive option click if in Self-Test Mode
      if (this.selfTestMode) {
        card.querySelectorAll('.study-option.interactive-opt').forEach((optEl) => {
          optEl.onclick = (e) => {
            if (e.target.closest('.copy-btn')) return;
            const chosenKey = String(optEl.getAttribute('data-optkey') || '').trim().toUpperCase();
            if (!chosenKey) return;

            let nextKeys;
            if (q.isMultiple) {
              if (isRevealed) {
                nextKeys = [chosenKey];
              } else if (pickedKeys.includes(chosenKey)) {
                nextKeys = pickedKeys.filter((k) => k !== chosenKey);
              } else {
                nextKeys = [...pickedKeys, chosenKey];
              }
            } else {
              nextKeys = [chosenKey];
            }

            if (nextKeys.length === 0) {
              this.selfSelectedMap.delete(q.id);
            } else {
              this.selfSelectedMap.set(q.id, nextKeys);
            }

            const nowRevealed = q.isMultiple ? nextKeys.length >= requiredCount : nextKeys.length > 0;
            if (nowRevealed) {
              const isOk = ExamDataStore.isOptionSetCorrect(q, nextKeys);
              this.dataStore.markAttempted([q.id]);
              this.dataStore.recordDailyActivity([q.id]);
              if (isOk) {
                this.dataStore.removeMistake(q.id);
              } else {
                this.dataStore.addMistake(q.id);
              }
              this.app.updateBadges();
            }

            const replacement = this.createQuestionCard(q, index);
            card.replaceWith(replacement);
          };
        });
      }

      return card;
    }

    updateStudyNavRail() {
      const railGrid = document.getElementById('studyNavRailGrid');
      const railCount = document.getElementById('studyNavRailCount');
      if (!railGrid) return;

      const total = this.currentFilteredList.length;
      if (railCount) railCount.innerText = total;
      railGrid.innerHTML = '';

      // Cap displayed grid buttons smoothly for huge sets (>300) if needed, or render efficiently
      const frag = document.createDocumentFragment();
      this.currentFilteredList.forEach((q, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rail-qbtn';
        btn.innerText = idx + 1;
        btn.dataset.qid = q.id;
        if (this.dataStore.starredIds.has(q.id)) btn.classList.add('starred');
        if (idx === this.activeQuestionIndex) btn.classList.add('active-target');

        btn.onclick = (e) => {
          e.stopPropagation();
          this.activeQuestionIndex = idx;
          while (this.renderedCount <= idx && this.renderedCount < this.currentFilteredList.length) {
            this.renderNextBatch();
          }
          const targetCard = document.querySelector(`#studyQuestionsList .study-card[data-id="${q.id}"]`);
          if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetCard.classList.remove('pulse-focus');
            void targetCard.offsetWidth;
            targetCard.classList.add('pulse-focus');
            setTimeout(() => targetCard.classList.remove('pulse-focus'), 1400);
          }
          railGrid.querySelectorAll('.rail-qbtn').forEach((b) => b.classList.remove('active-target'));
          btn.classList.add('active-target');
        };
        frag.appendChild(btn);
      });
      railGrid.appendChild(frag);
    }
  }

  // =========================================================================
  // 6. EXAM CONTROLLER (SEB MOCK & PRACTICE)
  // =========================================================================

  class ExamController {
    constructor(dataStore, app) {
      this.dataStore = dataStore;
      this.app = app;
      this.activeExam = null;
      this.timerInterval = null;
      this.config = StorageService.getExamConfig();
    }

    init() {
      this.bindEvents();
      this.syncSettingsModalInputs();
    }

    bindEvents() {
      const prevBtn = document.getElementById('btnPrevQuestion');
      if (prevBtn) prevBtn.onclick = () => this.prevQuestion();

      const nextBtn = document.getElementById('btnNextQuestion');
      if (nextBtn) {
        nextBtn.onclick = () => {
          if (!this.activeExam) return;
          if (this.activeExam.currentIndex >= this.activeExam.questions.length - 1) {
            this.openSubmitModal();
          } else {
            this.nextQuestion();
          }
        };
      }

      const markBtn = document.getElementById('btnMarkReview');
      if (markBtn) markBtn.onclick = () => this.toggleMarkReview();

      const clrBtn = document.getElementById('btnClearAnswer');
      if (clrBtn) clrBtn.onclick = () => this.clearCurrentAnswer();

      ['btnSubmitExam', 'submitExamTopBtn', 'sebSubmitBtn'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.onclick = () => this.openSubmitModal();
      });

      ['timerPauseBtn', 'sebPauseBtn'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.onclick = () => this.togglePause();
      });

      const cancelSubmit = document.getElementById('btnCancelSubmit');
      if (cancelSubmit) {
        cancelSubmit.onclick = () => this.closeModal('submitModal');
      }

      const confirmSubmit = document.getElementById('btnConfirmSubmit');
      if (confirmSubmit) {
        confirmSubmit.onclick = () => {
          this.closeModal('submitModal');
          this.submitExam();
        };
      }

      const settingsBtn = document.getElementById('examSettingsBtn');
      if (settingsBtn) {
        settingsBtn.onclick = () => {
          this.syncSettingsModalInputs();
          this.openModal('settingsModal');
        };
      }

      const closeSettings = document.getElementById('btnCloseSettings');
      if (closeSettings) closeSettings.onclick = () => this.closeModal('settingsModal');

      const saveSettings = document.getElementById('btnSaveSettings');
      if (saveSettings) {
        saveSettings.onclick = () => {
          this.config.shuffleQuestions = document.getElementById('cfgShuffleQ')?.checked !== false;
          this.config.shuffleOptions = document.getElementById('cfgShuffleO')?.checked !== false;
          this.config.subject = document.getElementById('cfgExamSubject')?.value || 'all';
          this.config.timerMinutes = parseInt(document.getElementById('cfgTimer')?.value || '60', 10);
          StorageService.saveExamConfig(this.config);
          this.closeModal('settingsModal');
          this.startDefaultSubjectExam(this.config.subject);
        };
      }

      const retakeBtn = document.getElementById('btnRetakeExam');
      if (retakeBtn) {
        retakeBtn.onclick = () => {
          if (!this.activeExam) return;
          this.startExam(
            this.activeExam.sourceQuestions,
            this.activeExam.title,
            this.activeExam.feTestId,
            this.activeExam.optionsCfg
          );
        };
      }

      const retryWrongBtn = document.getElementById('btnRetryWrongOnly');
      if (retryWrongBtn) {
        retryWrongBtn.onclick = () => {
          if (!this.lastWrongQuestions || this.lastWrongQuestions.length === 0) return;
          this.startExam(
            this.lastWrongQuestions,
            `Ôn lại ${this.lastWrongQuestions.length} câu làm sai`,
            null,
            { mode: 'practice', durationMinutes: 0, shuffleQuestions: true, shuffleOptions: true }
          );
        };
      }

      const reviewScrollBtn = document.getElementById('btnReviewAllAnswers');
      if (reviewScrollBtn) {
        reviewScrollBtn.onclick = () => {
          const rev = document.getElementById('examReviewList');
          if (rev) rev.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
      }
    }

    syncSettingsModalInputs() {
      const sq = document.getElementById('cfgShuffleQ');
      const so = document.getElementById('cfgShuffleO');
      const sub = document.getElementById('cfgExamSubject');
      const tm = document.getElementById('cfgTimer');
      if (sq) sq.checked = this.config.shuffleQuestions !== false;
      if (so) so.checked = this.config.shuffleOptions !== false;
      if (sub) sub.value = this.config.subject || 'all';
      if (tm) tm.value = String(this.config.timerMinutes ?? 60);
    }

    openModal(id) {
      const m = document.getElementById(id);
      if (m) m.classList.add('open');
    }

    closeModal(id) {
      const m = document.getElementById(id);
      if (m) m.classList.remove('open');
    }

    startDefaultSubjectExam(subjectKey = 'all') {
      const pool = this.dataStore.getQuestionsBySubject(subjectKey);
      const picked = Utils.shuffleArray(pool).slice(0, Math.min(50, pool.length));
      const subName = SUBJECT_INFO[subjectKey]?.name || subjectKey;
      this.startExam(picked, `Thi thử ${subName}`, null, {
        mode: 'exam',
        subjectKey,
        durationMinutes: typeof this.config.timerMinutes === 'number' ? this.config.timerMinutes : 60,
        shuffleQuestions: this.config.shuffleQuestions !== false,
        shuffleOptions: this.config.shuffleOptions !== false
      });
    }

    startExam(questionsList, title = 'Thi thử chuẩn EOS', feTestId = null, cfg = {}) {
      if (!questionsList || questionsList.length === 0) {
        alert('Không có câu hỏi để tạo đề thi.');
        return;
      }

      this.stopTimer();

      const shuffleQ = cfg.shuffleQuestions !== false;
      const shuffleO = cfg.shuffleOptions !== false;
      const mode = cfg.mode || 'exam';
      const durationMinutes = typeof cfg.durationMinutes === 'number' ? cfg.durationMinutes : 60;

      const workingQuestions = (shuffleQ ? Utils.shuffleArray(questionsList) : [...questionsList]).map((q) => {
        const clonedOpts = q.options.map((o) => ({ ...o }));
        return {
          ...q,
          displayOptions: shuffleO ? Utils.shuffleArray(clonedOpts) : clonedOpts
        };
      });

      this.activeExam = {
        title,
        feTestId,
        subjectKey: cfg.subjectKey || null,
        mode,
        optionsCfg: { ...cfg },
        sourceQuestions: [...questionsList],
        questions: workingQuestions,
        currentIndex: 0,
        userAnswers: {}, // qid -> chosen option object { key, text, isCorrect }
        reviewFlags: new Set(),
        revealedIds: new Set(),
        durationSeconds: durationMinutes * 60,
        remainingSeconds: durationMinutes * 60,
        elapsedSeconds: 0,
        isPaused: false,
        submitted: false
      };

      const titleEl = document.getElementById('examCurrentTitle');
      const sebNameEl = document.getElementById('sebExamName');
      const durMeta = document.getElementById('examMetaDuration');
      const subMeta = document.getElementById('examMetaSubject');
      const countBadge = document.getElementById('examQuestionsCountBadge');

      if (titleEl) titleEl.innerText = title;
      if (sebNameEl) sebNameEl.innerText = `${title} (${mode === 'practice' ? 'Luyện tập' : 'FE Mode'})`;
      if (durMeta) durMeta.innerText = durationMinutes > 0 ? `Thời gian: ${durationMinutes} phút` : 'Không giới hạn';
      if (subMeta) subMeta.innerText = SUBJECT_INFO[cfg.subjectKey]?.code || 'Tùy chỉnh';
      if (countBadge) countBadge.innerText = `${workingQuestions.length} Câu`;

      this.app.switchMode('exam');
      this.renderCurrentQuestion();
      this.renderGrid();
      this.startTimer();
    }

    startTimer() {
      this.stopTimer();
      this.updateTimerDisplays();
      if (!this.activeExam) return;

      this.timerInterval = setInterval(() => {
        if (!this.activeExam || this.activeExam.isPaused || this.activeExam.submitted) return;
        this.activeExam.elapsedSeconds++;
        if (this.activeExam.durationSeconds > 0) {
          this.activeExam.remainingSeconds--;
          if (this.activeExam.remainingSeconds <= 0) {
            this.activeExam.remainingSeconds = 0;
            this.updateTimerDisplays();
            this.submitExam();
            return;
          }
        }
        this.updateTimerDisplays();
      }, 1000);
    }

    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }

    togglePause() {
      if (!this.activeExam || this.activeExam.submitted) return;
      this.activeExam.isPaused = !this.activeExam.isPaused;
      const lbl = this.activeExam.isPaused ? 'Tiếp tục' : 'Tạm dừng';
      ['timerPauseBtn', 'sebPauseBtn'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.innerText = lbl;
      });
    }

    updateTimerDisplays() {
      if (!this.activeExam) return;
      const text = this.activeExam.durationSeconds > 0
        ? Utils.formatTimeMmSs(this.activeExam.remainingSeconds)
        : `∞ (${Utils.formatTimeMmSs(this.activeExam.elapsedSeconds)})`;

      const d1 = document.getElementById('timerDisplay');
      const d2 = document.getElementById('sebTimerDisplay');
      if (d1) d1.innerText = text;
      if (d2) d2.innerText = text;

      const isUrgent = this.activeExam.durationSeconds > 0 && this.activeExam.remainingSeconds <= 300;
      const b1 = document.getElementById('examTimerBadge');
      const b2 = document.getElementById('sebTimerBadge');
      if (b1) b1.className = `timer-badge ${isUrgent ? 'warning' : 'normal'}`;
      if (b2) b2.classList.toggle('warning', isUrgent);
    }

    isQuestionAnswered(qid) {
      if (!this.activeExam || !qid) return false;
      const ans = this.activeExam.userAnswers[qid];
      return Array.isArray(ans) ? ans.length > 0 : Boolean(ans);
    }

    isQuestionCorrect(q) {
      if (!this.activeExam || !q) return false;
      const ans = this.activeExam.userAnswers[q.id];
      if (!ans) return false;
      if (q.isMultiple) {
        const keys = Array.isArray(ans) ? ans.map((o) => o.key) : [ans.key];
        return ExamDataStore.isOptionSetCorrect(q, keys);
      }
      const chosen = Array.isArray(ans) ? ans[0] : ans;
      return Boolean(chosen && chosen.isCorrect);
    }

    getCorrectSummaryText(q) {
      if (!q || !Array.isArray(q.options)) return '';
      return q.options
        .filter((o) => o.isCorrect)
        .map((o) => `${o.key}. ${o.text}`)
        .join(' | ');
    }

    revealPracticeAnswer(q) {
      if (!this.activeExam || !q) return;
      this.activeExam.revealedIds.add(q.id);
      this.dataStore.markAttempted([q.id]);
      this.dataStore.recordDailyActivity([q.id]);
      if (this.isQuestionCorrect(q)) {
        this.dataStore.removeMistake(q.id);
      } else {
        this.dataStore.addMistake(q.id);
      }
      this.app.updateBadges();
      this.renderCurrentQuestion();
      this.renderGrid();
    }

    renderGrid() {
      const grid = document.getElementById('examGrid');
      if (!grid || !this.activeExam) return;
      grid.innerHTML = '';

      let answered = 0;
      let review = 0;

      this.activeExam.questions.forEach((q, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'q-grid-btn';
        btn.innerText = idx + 1;

        const isAns = this.isQuestionAnswered(q.id);
        const isRev = this.activeExam.reviewFlags.has(q.id);
        const isAct = this.activeExam.currentIndex === idx;

        if (isRev) {
          btn.classList.add('review');
          review++;
        } else if (isAns) {
          btn.classList.add('answered');
          if (this.activeExam.mode === 'practice' && this.activeExam.revealedIds.has(q.id)) {
            btn.classList.add(this.isQuestionCorrect(q) ? 'practice-correct' : 'practice-wrong');
          }
          answered++;
        }

        if (isAct) btn.classList.add('active');
        btn.onclick = () => this.goToQuestion(idx);
        grid.appendChild(btn);
      });

      const totalQ = this.activeExam.questions.length;
      const curNum = this.activeExam.currentIndex + 1;
      const pct = totalQ > 0 ? Math.round((answered / totalQ) * 100) : 0;

      const sebText = document.getElementById('sebProgressText');
      const sebFill = document.getElementById('sebProgressFill');
      const globalFill = document.getElementById('globalProgressBar');
      const palSub = document.getElementById('examPaletteSummary');

      if (sebText) sebText.innerText = `Câu ${curNum} / ${totalQ} (${pct}% đã làm)`;
      if (sebFill) sebFill.style.width = `${pct}%`;
      if (globalFill) globalFill.style.width = `${pct}%`;
      if (palSub) palSub.innerText = `Câu ${curNum}/${totalQ}`;

      const cA = document.getElementById('countAnswered');
      const cR = document.getElementById('countReview');
      const cU = document.getElementById('countUnanswered');
      if (cA) cA.innerText = answered;
      if (cR) cR.innerText = review;
      if (cU) cU.innerText = totalQ - answered;
    }

    goToQuestion(index) {
      if (!this.activeExam || index < 0 || index >= this.activeExam.questions.length) return;
      this.activeExam.currentIndex = index;
      this.renderCurrentQuestion();
      this.renderGrid();
    }

    prevQuestion() {
      if (this.activeExam && this.activeExam.currentIndex > 0) {
        this.goToQuestion(this.activeExam.currentIndex - 1);
      }
    }

    nextQuestion() {
      if (this.activeExam && this.activeExam.currentIndex < this.activeExam.questions.length - 1) {
        this.goToQuestion(this.activeExam.currentIndex + 1);
      }
    }

    toggleMarkReview() {
      if (!this.activeExam) return;
      const q = this.activeExam.questions[this.activeExam.currentIndex];
      if (this.activeExam.reviewFlags.has(q.id)) {
        this.activeExam.reviewFlags.delete(q.id);
      } else {
        this.activeExam.reviewFlags.add(q.id);
      }
      this.renderCurrentQuestion();
      this.renderGrid();
    }

    clearCurrentAnswer() {
      if (!this.activeExam) return;
      const q = this.activeExam.questions[this.activeExam.currentIndex];
      delete this.activeExam.userAnswers[q.id];
      this.activeExam.revealedIds.delete(q.id);
      this.renderCurrentQuestion();
      this.renderGrid();
    }

    renderCurrentQuestion() {
      if (!this.activeExam) return;
      const q = this.activeExam.questions[this.activeExam.currentIndex];
      const idx = this.activeExam.currentIndex;

      const titleEl = document.getElementById('examQTitle');
      const tagEl = document.getElementById('examQSubjectTag');
      const textEl = document.getElementById('examQText');
      const codeEl = document.getElementById('examQCodeContainer');
      const imgEl = document.getElementById('examQImageContainer');
      const optsEl = document.getElementById('examOptionsList');
      const fbEl = document.getElementById('examInstantFeedback');

      const requiredCount = q.correctKeys?.length || 1;
      if (titleEl) titleEl.innerText = `${idx + 1}. ${q.topic || 'Question'}`;
      if (tagEl) tagEl.innerText = `${q.subject} • ${q.isMultiple ? `Chọn ${requiredCount} đáp án • ` : ''}1 pt`;
      if (textEl) textEl.innerHTML = Utils.formatQuestionText(q.questionText);
      if (codeEl) codeEl.innerHTML = q.codeSnippet ? Utils.renderCodeTerminal(q.codeSnippet, q.subject) : '';

      if (imgEl) {
        const sHtml = Utils.renderSlidePreview(q, false);
        imgEl.style.display = sHtml ? 'block' : 'none';
        imgEl.innerHTML = sHtml;
      }

      const isPractice = this.activeExam.mode === 'practice';
      const isRevealed = isPractice && this.activeExam.revealedIds.has(q.id);
      const userAns = this.activeExam.userAnswers[q.id] || (q.isMultiple ? [] : null);

      if (optsEl) {
        optsEl.innerHTML = '';
        q.displayOptions.forEach((opt, optIdx) => {
          const dispLetter = String.fromCharCode(65 + optIdx);
          const isChecked = q.isMultiple
            ? Array.isArray(userAns) && userAns.some((a) => a.key === opt.key)
            : Boolean(userAns && userAns.key === opt.key);
          const inputType = q.isMultiple ? 'checkbox' : 'radio';

          const label = document.createElement('label');
          let cls = 'exam-option-label';
          let badgeHtml = '';

          if (isRevealed) {
            if (opt.isCorrect) {
              cls += ' practice-opt-correct';
              badgeHtml = `<span class="practice-opt-badge correct">${isChecked ? 'Bạn chọn (Đúng)' : 'Đáp án đúng'}</span>`;
            } else if (isChecked) {
              cls += ' practice-opt-wrong';
              badgeHtml = '<span class="practice-opt-badge wrong">Chọn sai</span>';
            }
          }

          label.className = cls;
          label.innerHTML = `
            <input type="${inputType}" name="exam_opt_${q.id}" class="exam-option-input" value="${Utils.escapeHtml(opt.key)}" ${isChecked ? 'checked' : ''}>
            <span class="option-indicator">${dispLetter}</span>
            <div style="flex: 1;">
              <div class="exam-option-text">${Utils.escapeHtml(opt.text)}</div>
            </div>
            ${badgeHtml}
          `;

          const input = label.querySelector('input');
          if (input) {
            input.onchange = () => {
              if (q.isMultiple) {
                let current = Array.isArray(this.activeExam.userAnswers[q.id])
                  ? [...this.activeExam.userAnswers[q.id]]
                  : [];
                if (input.checked) {
                  if (!current.some((a) => a.key === opt.key)) current.push(opt);
                } else {
                  current = current.filter((a) => a.key !== opt.key);
                }
                if (current.length === 0) {
                  delete this.activeExam.userAnswers[q.id];
                } else {
                  this.activeExam.userAnswers[q.id] = current;
                }
                if (isPractice && (isRevealed || current.length >= requiredCount)) {
                  this.revealPracticeAnswer(q);
                  return;
                }
              } else {
                this.activeExam.userAnswers[q.id] = opt;
                if (isPractice) {
                  this.revealPracticeAnswer(q);
                  return;
                }
              }
              this.renderGrid();
            };
          }
          optsEl.appendChild(label);
        });

        if (isPractice && q.isMultiple && !isRevealed) {
          const chkBtn = document.createElement('button');
          chkBtn.type = 'button';
          chkBtn.className = 'btn btn-primary btn-xs';
          chkBtn.style.alignSelf = 'flex-start';
          chkBtn.style.marginTop = '4px';
          chkBtn.innerText = 'Kiểm tra đáp án';
          chkBtn.onclick = () => this.revealPracticeAnswer(q);
          optsEl.appendChild(chkBtn);
        }
      }

      if (fbEl) {
        if (isRevealed) {
          const isOk = this.isQuestionCorrect(q);
          const expHtml = q.explanation ? Utils.formatExplanation(q.explanation) : 'Đáp án đúng đã được đánh dấu trực tiếp ở trên.';
          fbEl.style.display = 'block';
          fbEl.innerHTML = `
            <div class="instant-fb-banner ${isOk ? 'fb-correct' : 'fb-wrong'}">
              <strong>${isOk ? 'Chính xác!' : 'Chưa chính xác'}</strong>
              <span>• Giải thích chi tiết ngay sau câu trả lời</span>
            </div>
            <div class="explanation-box" style="margin-top: 8px;">
              <div class="exp-text">${expHtml}</div>
            </div>
          `;
        } else {
          fbEl.style.display = 'none';
          fbEl.innerHTML = '';
        }
      }

      const markBtn = document.getElementById('btnMarkReview');
      if (markBtn) {
        const marked = this.activeExam.reviewFlags.has(q.id);
        markBtn.classList.toggle('active', marked);
        markBtn.innerText = marked ? 'Bỏ đánh dấu xem lại' : 'Đánh dấu xem lại';
      }

      const prevBtn = document.getElementById('btnPrevQuestion');
      const nextBtn = document.getElementById('btnNextQuestion');
      if (prevBtn) prevBtn.disabled = idx === 0;
      if (nextBtn) {
        nextBtn.innerText = idx >= this.activeExam.questions.length - 1 ? 'Kiểm tra & Nộp' : 'Câu tiếp theo';
      }
    }

    openSubmitModal() {
      if (!this.activeExam) return;
      const total = this.activeExam.questions.length;
      const answered = this.activeExam.questions.filter((q) => this.isQuestionAnswered(q.id)).length;
      const unans = total - answered;
      const msg = document.getElementById('submitModalSummary');
      if (msg) {
        msg.innerHTML = `Bạn đã trả lời <strong>${answered}/${total}</strong> câu hỏi.${
          unans > 0 ? ` Còn <strong style="color: var(--correct-red);">${unans}</strong> câu chưa chọn đáp án.` : ' Tất cả câu hỏi đã được trả lời.'
        }<br>Bạn có chắc chắn muốn nộp bài để chấm điểm không?`;
      }
      this.openModal('submitModal');
    }

    submitExam() {
      if (!this.activeExam || this.activeExam.submitted) return;
      this.activeExam.submitted = true;
      this.stopTimer();

      let correct = 0;
      let wrong = 0;
      let skipped = 0;
      const wrongQuestions = [];
      const wrongDetails = [];
      const allIds = [];

      this.activeExam.questions.forEach((q) => {
        allIds.push(q.id);
        const isAns = this.isQuestionAnswered(q.id);
        const isOk = isAns && this.isQuestionCorrect(q);
        const correctSummary = this.getCorrectSummaryText(q);
        if (!isAns) {
          skipped++;
          wrongQuestions.push(q);
          wrongDetails.push({ id: q.id, userText: null, correctText: correctSummary });
        } else if (isOk) {
          correct++;
          this.dataStore.removeMistake(q.id);
        } else {
          wrong++;
          this.dataStore.addMistake(q.id);
          wrongQuestions.push(q);
          const ans = this.activeExam.userAnswers[q.id];
          const userText = Array.isArray(ans)
            ? ans.map((o) => `${o.key}. ${o.text}`).join(' | ')
            : (ans?.text || '');
          wrongDetails.push({ id: q.id, userText, correctText: correctSummary });
        }
      });

      this.lastWrongQuestions = wrongQuestions;
      const total = this.activeExam.questions.length;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      const scaledPts = total > 0 ? Math.round((correct / total) * 1000) : 0;

      // Persist Telemetry
      this.dataStore.markAttempted(allIds);
      this.dataStore.recordDailyActivity(allIds, pct);
      if (this.activeExam.subjectKey && this.activeExam.subjectKey !== 'all') {
        this.dataStore.recordSubjectExamStat(this.activeExam.subjectKey, correct, total);
      }

      // If created via FE-Test, record turn history
      if (this.activeExam.feTestId) {
        const test = this.dataStore.feTests.find((t) => t.id === this.activeExam.feTestId);
        if (test) {
          test.completed = true;
          test.scorePct = pct;
          test.correctCount = correct;
          test.lastDate = new Date().toLocaleDateString('vi-VN');
          if (!Array.isArray(test.history)) test.history = [];
          test.history.unshift({
            turn: test.history.length + 1,
            date: new Date().toLocaleString('vi-VN'),
            scorePct: pct,
            correctCount: correct,
            totalCount: total,
            wrongQuestions: wrongDetails
          });
          StorageService.saveFeTests(this.dataStore.feTests);
        }
      } else {
        // Auto-save standalone Quick Exam into module/feTests history so Dashboard displays it
        const subKey = this.activeExam.subjectKey && this.activeExam.subjectKey !== 'all'
          ? this.activeExam.subjectKey
          : null;
        if (!subKey) {
          this.dataStore.feTests.unshift({
            id: `Quick_EOS_${Date.now()}`,
            title: this.activeExam.title,
            subject: 'all',
            mode: this.activeExam.mode,
            durationMinutes: Math.round(this.activeExam.durationSeconds / 60),
            shuffle: true,
            createdAt: new Date().toLocaleDateString('vi-VN'),
            lastDate: new Date().toLocaleString('vi-VN'),
            questionIds: allIds,
            completed: true,
            scorePct: pct,
            correctCount: correct,
            history: [{
              turn: 1,
              date: new Date().toLocaleString('vi-VN'),
              scorePct: pct,
              correctCount: correct,
              totalCount: total,
              wrongQuestions: wrongDetails
            }]
          });
          StorageService.saveFeTests(this.dataStore.feTests);
        }
      }

      this.app.updateBadges();
      this.renderResults(correct, wrong, skipped, total, pct, scaledPts);
    }

    renderResults(correct, wrong, skipped, total, pct, scaledPts) {
      this.app.switchMode('results');

      const passed = scaledPts >= 750;
      const setTxt = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.innerText = v;
      };

      setTxt('resultTitle', this.activeExam.title);
      setTxt('scoreScaledPts', scaledPts);
      setTxt('scorePercent', `${pct}%`);
      setTxt('resCorrect', correct);
      setTxt('resWrong', wrong);
      setTxt('resSkipped', skipped);
      setTxt('resTime', Utils.formatTimeMmSs(this.activeExam.elapsedSeconds));

      document.querySelectorAll('.res-total-sub').forEach((el) => {
        el.innerText = `/${total}`;
      });

      const badgeEl = document.getElementById('scoreBadge');
      if (badgeEl) {
        badgeEl.className = `cisco-pass-pill ${passed ? '' : 'failed'}`;
        badgeEl.innerText = passed ? 'Đạt (Pass) • Chuẩn ≥ 750' : 'Chưa đạt • Cần ≥ 750';
      }

      const barEl = document.getElementById('scoreScaleBarFill');
      if (barEl) {
        barEl.style.width = `${pct}%`;
        barEl.style.background = passed ? 'var(--exp-green)' : 'var(--correct-red)';
      }

      const retryWrongBtn = document.getElementById('btnRetryWrongOnly');
      if (retryWrongBtn) {
        retryWrongBtn.style.display = (wrong + skipped) > 0 ? 'inline-flex' : 'none';
      }

      // Render Full Detailed Review List
      const reviewList = document.getElementById('examReviewList');
      if (!reviewList) return;
      reviewList.innerHTML = '';

      this.activeExam.questions.forEach((q, idx) => {
        const isAns = this.isQuestionAnswered(q.id);
        const userAns = this.activeExam.userAnswers[q.id];
        const isCorrect = isAns && this.isQuestionCorrect(q);

        const card = document.createElement('div');
        card.className = 'study-card';

        const statusTag = !isAns
          ? '<span class="tag-badge" style="background: #fef3c7; color: #b45309;">Bỏ qua</span>'
          : isCorrect
          ? '<span class="tag-badge" style="background: #dcfce7; color: #15803d;">Đúng</span>'
          : '<span class="tag-badge" style="background: #fee2e2; color: #b91c1c;">Sai</span>';

        const optsHtml = q.displayOptions.map((opt, optIdx) => {
          const letter = String.fromCharCode(65 + optIdx);
          const isPicked = Array.isArray(userAns)
            ? userAns.some((a) => a.key === opt.key)
            : Boolean(userAns && userAns.key === opt.key);
          let cls = 'study-option';
          let badge = '';

          if (opt.isCorrect) {
            cls += ' user-selected-correct';
            badge = `<span class="study-option-badge badge-green">${isPicked ? 'Bạn chọn (Đúng)' : 'Đáp án đúng'}</span>`;
          } else if (isPicked) {
            cls += ' user-selected-wrong';
            badge = '<span class="study-option-badge badge-red">Bạn chọn</span>';
          }

          return `
            <div class="${cls}">
              <span class="option-indicator">${letter}</span>
              <div style="flex: 1;">${Utils.escapeHtml(opt.text)}</div>
              ${badge}
            </div>
          `;
        }).join('');

        const codeHtml = q.codeSnippet ? Utils.renderCodeTerminal(q.codeSnippet, q.subject) : '';
        const fixBanner = Utils.renderFixSourceBanner(q);
        const expHtml = (q.explanation || fixBanner)
          ? `<div class="explanation-box">${fixBanner}<div class="exp-text"><strong>Giải thích:</strong> ${q.explanation ? Utils.formatExplanation(q.explanation) : 'Xem đáp án được đánh dấu ở trên.'}</div></div>`
          : '';

        card.innerHTML = `
          <div class="study-card-header">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="study-qnum">Câu ${idx + 1}</span>
              <span class="tag-badge">${Utils.escapeHtml(q.subject)}</span>
              ${statusTag}
              ${Utils.renderFixSourceBadge(q)}
            </div>
            <span style="font-size: 12px; color: var(--text-muted);">${Utils.escapeHtml(q.id)}</span>
          </div>
          <div style="font-size: 15.5px; font-weight: 600; margin: 12px 0; line-height: 1.6;">
            ${Utils.formatQuestionText(q.questionText)}
          </div>
          ${codeHtml}
          <div class="study-options">${optsHtml}</div>
          ${expHtml}
        `;
        reviewList.appendChild(card);
      });
    }
  }

  // =========================================================================
  // 7. FE - TEST CUSTOM BUILDER CONTROLLER
  // =========================================================================

  class FeTestController {
    constructor(dataStore, app) {
      this.dataStore = dataStore;
      this.app = app;
      this.cfg = StorageService.getJson(STORAGE_KEYS.FE_CFG, {
        subject: 'all',
        mode: 'exam',
        qCount: 50,
        timerMinutes: 60,
        mistakesOnly: false,
        unansweredOnly: false,
        starredOnly: false,
        shuffle: true
      });
      this.modalWrongQuestions = [];
    }

    init() {
      this.syncControlsFromCfg();
      this.bindEvents();
      this.render();
    }

    setSubject(sub) {
      this.cfg.subject = sub || 'all';
      const subSel = document.getElementById('feSubjectSelect');
      if (subSel) subSel.value = this.cfg.subject;
      this.updatePoolMeta();
    }

    syncControlsFromCfg() {
      const subSel = document.getElementById('feSubjectSelect');
      if (subSel) subSel.value = this.cfg.subject;

      document.querySelectorAll('#feModeGroup .fetest-mode-card').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.femode === this.cfg.mode);
      });

      const slider = document.getElementById('feCountSlider');
      const numInp = document.getElementById('feCountCustomInput');
      if (slider) slider.value = this.cfg.qCount;
      if (numInp) numInp.value = this.cfg.qCount;

      const mChk = document.getElementById('feFilterMistakes');
      const uChk = document.getElementById('feFilterUnanswered');
      const sChk = document.getElementById('feFilterStarred');
      const shChk = document.getElementById('feFilterShuffle');
      if (mChk) mChk.checked = Boolean(this.cfg.mistakesOnly);
      if (uChk) uChk.checked = Boolean(this.cfg.unansweredOnly);
      if (sChk) sChk.checked = Boolean(this.cfg.starredOnly);
      if (shChk) shChk.checked = this.cfg.shuffle !== false;
    }

    bindEvents() {
      const subSel = document.getElementById('feSubjectSelect');
      if (subSel) {
        subSel.onchange = () => {
          this.cfg.subject = subSel.value;
          StorageService.setJson(STORAGE_KEYS.FE_CFG, this.cfg);
          this.updatePoolMeta();
        };
      }

      document.querySelectorAll('#feModeGroup .fetest-mode-card').forEach((btn) => {
        btn.onclick = () => {
          this.cfg.mode = btn.dataset.femode;
          document.querySelectorAll('#feModeGroup .fetest-mode-card').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          const sum = document.getElementById('feModeSummaryText');
          if (sum) sum.innerText = this.cfg.mode === 'practice' ? 'Luyện tập' : 'FE';
          StorageService.setJson(STORAGE_KEYS.FE_CFG, this.cfg);
        };
      });

      const slider = document.getElementById('feCountSlider');
      const numInp = document.getElementById('feCountCustomInput');
      const countSummary = document.getElementById('feCountSummaryText');

      const updateCountVal = (val) => {
        const poolLen = Math.max(1, this.getFilteredPool().length);
        const clamped = Math.max(1, Math.min(val, poolLen));
        this.cfg.qCount = clamped;
        if (slider) slider.value = clamped;
        if (numInp) numInp.value = clamped;
        if (countSummary) countSummary.innerText = `${clamped} câu`;
        StorageService.setJson(STORAGE_KEYS.FE_CFG, this.cfg);
      };

      document.querySelectorAll('#feCountBtnGroup .fetest-seg-btn').forEach((btn) => {
        btn.onclick = () => {
          document.querySelectorAll('#feCountBtnGroup .fetest-seg-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          if (btn.dataset.qcount !== 'custom') {
            updateCountVal(parseInt(btn.dataset.qcount, 10));
          } else if (numInp) {
            numInp.focus();
          }
        };
      });

      if (slider) slider.oninput = () => updateCountVal(parseInt(slider.value, 10) || 50);
      if (numInp) numInp.onchange = () => updateCountVal(parseInt(numInp.value, 10) || 50);

      const customTimerWrap = document.getElementById('feCustomTimerWrap');
      const customTimerInp = document.getElementById('feTimerCustomInput');
      const timerSummary = document.getElementById('feTimerSummaryText');

      document.querySelectorAll('#feTimerBtnGroup .fetest-seg-btn').forEach((btn) => {
        btn.onclick = () => {
          document.querySelectorAll('#feTimerBtnGroup .fetest-seg-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          if (btn.dataset.timer === 'custom') {
            if (customTimerWrap) customTimerWrap.style.display = 'flex';
            const mins = parseInt(customTimerInp?.value || '45', 10) || 45;
            this.cfg.timerMinutes = mins;
            if (timerSummary) timerSummary.innerText = `${mins} phút`;
          } else {
            if (customTimerWrap) customTimerWrap.style.display = 'none';
            const mins = parseInt(btn.dataset.timer, 10);
            this.cfg.timerMinutes = mins;
            if (timerSummary) timerSummary.innerText = mins === 0 ? 'Không giới hạn' : `${mins} phút`;
          }
          StorageService.setJson(STORAGE_KEYS.FE_CFG, this.cfg);
        };
      });

      if (customTimerInp) {
        customTimerInp.onchange = () => {
          const mins = Math.max(1, parseInt(customTimerInp.value, 10) || 45);
          this.cfg.timerMinutes = mins;
          if (timerSummary) timerSummary.innerText = `${mins} phút`;
          StorageService.setJson(STORAGE_KEYS.FE_CFG, this.cfg);
        };
      }

      ['feFilterMistakes', 'feFilterUnanswered', 'feFilterStarred', 'feFilterShuffle'].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.onchange = () => {
          this.cfg.mistakesOnly = document.getElementById('feFilterMistakes')?.checked || false;
          this.cfg.unansweredOnly = document.getElementById('feFilterUnanswered')?.checked || false;
          this.cfg.starredOnly = document.getElementById('feFilterStarred')?.checked || false;
          this.cfg.shuffle = document.getElementById('feFilterShuffle')?.checked !== false;
          StorageService.setJson(STORAGE_KEYS.FE_CFG, this.cfg);
          this.updatePoolMeta();
        };
      });

      const createBtn = document.getElementById('btnCreateFeTest');
      if (createBtn) createBtn.onclick = () => this.createTest();

      const clearBtn = document.getElementById('btnClearFeTests');
      if (clearBtn) {
        clearBtn.onclick = () => {
          if (confirm('Xóa toàn bộ lịch sử đề FE-Test đã tạo?')) {
            this.dataStore.feTests = [];
            StorageService.saveFeTests([]);
            this.render();
          }
        };
      }

      // Mistakes Modal actions
      ['btnCloseTestMistakesModal', 'btnCloseTestMistakesFooter'].forEach((id) => {
        const b = document.getElementById(id);
        if (b) b.onclick = () => document.getElementById('testMistakesModal')?.classList.remove('open');
      });

      const retryModalBtn = document.getElementById('btnRetrySpecificTestMistakes');
      if (retryModalBtn) {
        retryModalBtn.onclick = () => {
          if (this.modalWrongQuestions.length === 0) return;
          document.getElementById('testMistakesModal')?.classList.remove('open');
          this.app.examController.startExam(
            this.modalWrongQuestions,
            `Luyện lại ${this.modalWrongQuestions.length} câu sai`,
            null,
            { mode: 'practice', durationMinutes: 0, shuffleQuestions: true, shuffleOptions: true }
          );
        };
      }
    }

    getFilteredPool() {
      let pool = this.dataStore.getQuestionsBySubject(this.cfg.subject);
      if (this.cfg.mistakesOnly) {
        pool = pool.filter((q) => this.dataStore.mistakesIds.has(q.id));
      }
      if (this.cfg.unansweredOnly) {
        pool = pool.filter((q) => !this.dataStore.attemptedIds.has(q.id));
      }
      if (this.cfg.starredOnly) {
        pool = pool.filter((q) => this.dataStore.starredIds.has(q.id));
      }
      return pool;
    }

    updatePoolMeta() {
      const basePool = this.dataStore.getQuestionsBySubject(this.cfg.subject);
      const filteredPool = this.getFilteredPool();
      const setTxt = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.innerText = v;
      };

      const mCnt = basePool.filter((q) => this.dataStore.mistakesIds.has(q.id)).length;
      const uCnt = basePool.filter((q) => !this.dataStore.attemptedIds.has(q.id)).length;
      const sCnt = basePool.filter((q) => this.dataStore.starredIds.has(q.id)).length;

      setTxt('feSubjectSummaryText', SUBJECT_INFO[this.cfg.subject]?.code || 'ALL');
      setTxt('feFilterMistakesCount', mCnt);
      setTxt('feFilterUnansweredCount', uCnt);
      setTxt('feFilterStarredCount', sCnt);
      setTxt('fePoolAvailableCount', `Khả dụng: ${filteredPool.length} câu`);

      const slider = document.getElementById('feCountSlider');
      const numInp = document.getElementById('feCountCustomInput');
      const maxPool = Math.max(1, filteredPool.length);
      if (slider) {
        slider.max = maxPool;
        if (this.cfg.qCount > maxPool) {
          this.cfg.qCount = maxPool;
          slider.value = maxPool;
        }
      }
      if (numInp) {
        numInp.max = maxPool;
        if (Number(numInp.value) > maxPool) numInp.value = maxPool;
      }
      setTxt('feCountSummaryText', `${Math.min(this.cfg.qCount, maxPool)} câu`);
    }

    createTest() {
      const candidates = this.getFilteredPool();
      if (candidates.length === 0) {
        alert('Không có câu hỏi nào khớp với bộ lọc hiện tại. Hãy nới lỏng điều kiện lọc.');
        return;
      }

      let maxNum = 0;
      this.dataStore.feTests.forEach((t) => {
        const m = t.id && t.id.match(/^FE_Test_(\d+)$/i);
        if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10) || 0);
      });
      const numStr = String(maxNum + 1).padStart(2, '0');
      const testId = `FE_Test_${numStr}`;
      const subCode = SUBJECT_INFO[this.cfg.subject]?.code || 'ALL';
      const modeTag = this.cfg.mode === 'practice' ? 'Practice' : 'FE';
      const countToTake = Math.min(this.cfg.qCount || 50, candidates.length);
      const pool = this.cfg.shuffle ? Utils.shuffleArray(candidates) : [...candidates];
      const selected = pool.slice(0, countToTake);

      const newTest = {
        id: testId,
        title: `FE_Test_${numStr} (${subCode} • ${modeTag} • ${selected.length}Q)`,
        subject: this.cfg.subject,
        mode: this.cfg.mode,
        durationMinutes: this.cfg.timerMinutes,
        shuffle: this.cfg.shuffle,
        createdAt: new Date().toLocaleDateString('vi-VN'),
        questionIds: selected.map((q) => q.id),
        completed: false,
        scorePct: 0,
        correctCount: 0,
        history: []
      };

      this.dataStore.feTests.unshift(newTest);
      StorageService.saveFeTests(this.dataStore.feTests);
      this.render();
      this.startTest(testId);
    }

    startTest(testId) {
      const test = this.dataStore.feTests.find((t) => t.id === testId);
      if (!test) return;
      const questions = test.questionIds.map((id) => this.dataStore.getQuestion(id)).filter(Boolean);
      if (questions.length === 0) {
        alert('Đề lịch sử cũ không còn danh sách ID câu hỏi chi tiết để làm lại.');
        return;
      }
      this.app.examController.startExam(questions, test.title, test.id, {
        mode: test.mode || 'exam',
        subjectKey: test.subject || 'all',
        durationMinutes: typeof test.durationMinutes === 'number' ? test.durationMinutes : 60,
        shuffleQuestions: test.shuffle !== false,
        shuffleOptions: test.shuffle !== false
      });
    }

    openMistakesModal(testId, turnNum = null) {
      const test = this.dataStore.feTests.find((t) => t.id === testId);
      if (!test) return;
      const attempt = turnNum
        ? (test.history || []).find((h) => h.turn === turnNum)
        : (test.history && test.history[0]);

      const wrongDetails = attempt?.wrongQuestions || [];
      this.modalWrongQuestions = wrongDetails
        .map((w) => this.dataStore.getQuestion(w.id || w))
        .filter(Boolean);

      const titleEl = document.getElementById('testMistakesModalTitle');
      const subEl = document.getElementById('testMistakesModalSubtitle');
      const bodyEl = document.getElementById('testMistakesModalBody');

      if (titleEl) titleEl.innerHTML = `<span>Xem câu sai • ${Utils.escapeHtml(test.title)}</span>`;
      if (subEl) {
        subEl.innerText = attempt
          ? `Lần ${attempt.turn} (${attempt.date}) • Đúng ${attempt.correctCount}/${attempt.totalCount} (${attempt.scorePct}%)`
          : 'Danh sách câu sai';
      }

      if (bodyEl) {
        if (this.modalWrongQuestions.length === 0) {
          bodyEl.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 2rem;">Không có câu sai nào trong lần thi này!</p>';
        } else {
          bodyEl.innerHTML = this.modalWrongQuestions.map((q, idx) => {
            const det = wrongDetails[idx] || {};
            const correctOpts = q.options.filter((o) => o.isCorrect);
            const correctDisplay = correctOpts.length > 0
              ? correctOpts.map((o) => `${o.key}. ${o.text}`).join(' | ')
              : (det.correctText || '');
            return `
              <div class="study-card" style="margin-bottom: 14px;">
                <div class="study-card-header">
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span class="study-qnum">Câu ${idx + 1}</span>
                    <span class="tag-badge">${Utils.escapeHtml(q.subject)}</span>
                    ${Utils.renderFixSourceBadge(q)}
                  </div>
                  <span style="font-size: 12px; color: var(--text-muted);">${Utils.escapeHtml(q.id)}</span>
                </div>
                <div style="font-weight: 600; margin: 8px 0;">${Utils.formatQuestionText(q.questionText)}</div>
                ${det.userText ? `<div style="color: var(--correct-red); font-size: 13.5px; margin-bottom: 4px;">✗ Bạn chọn: ${Utils.escapeHtml(det.userText)}</div>` : '<div style="color: #b45309; font-size: 13.5px; margin-bottom: 4px;">• Bỏ qua chưa chọn</div>'}
                <div style="color: var(--exp-green); font-size: 13.5px; font-weight: 600;">✓ Đáp án đúng: ${Utils.escapeHtml(correctDisplay)}</div>
                ${(q.explanation || q.fixSourceNote) ? `<div class="explanation-box" style="margin-top: 8px;">${Utils.renderFixSourceBanner(q)}<div class="exp-text">${q.explanation ? Utils.formatExplanation(q.explanation) : ''}</div></div>` : ''}
              </div>
            `;
          }).join('');
        }
      }

      const retryBtn = document.getElementById('btnRetrySpecificTestMistakes');
      if (retryBtn) retryBtn.style.display = this.modalWrongQuestions.length > 0 ? 'inline-flex' : 'none';

      document.getElementById('testMistakesModal')?.classList.add('open');
    }

    render() {
      this.updatePoolMeta();

      const totalEl = document.getElementById('feTestTotalCreated');
      const compEl = document.getElementById('feTestCompletedCount');
      const highEl = document.getElementById('feTestHighestScore');
      const listEl = document.getElementById('feTestListContainer');

      const tests = this.dataStore.feTests;
      const completed = tests.filter((t) => t.completed);
      const bestPct = completed.length > 0 ? Math.max(...completed.map((t) => t.scorePct || 0)) : null;

      if (totalEl) totalEl.innerText = tests.length;
      if (compEl) compEl.innerText = completed.length;
      if (highEl) highEl.innerText = bestPct !== null ? `${bestPct * 10}` : '--';

      if (!listEl) return;
      listEl.innerHTML = '';

      if (tests.length === 0) {
        listEl.innerHTML = `
          <div class="study-card" style="text-align: center; padding: 2rem;">
            <p style="color: var(--text-muted);">Chưa có đề thi tùy chỉnh nào. Hãy cấu hình bên trái và nhấn <strong>Tạo &amp; bắt đầu làm đề</strong>.</p>
          </div>
        `;
        return;
      }

      tests.forEach((test) => {
        const card = document.createElement('div');
        card.className = 'fe-test-card';

        const historyItems = Array.isArray(test.history) ? test.history : [];
        const hasHist = historyItems.length > 0 || test.completed;
        const latest = historyItems[0] || null;
        const totalQ = latest?.totalCount || test.questionIds?.length || 50;
        const curPct = latest ? latest.scorePct : (test.scorePct || 0);
        const curCorrect = latest ? latest.correctCount : (test.correctCount || 0);
        const isPassed = curPct >= 75;
        const wrongNum = latest?.wrongQuestions ? latest.wrongQuestions.length : Math.max(0, totalQ - curCorrect);

        const histRows = historyItems.map((h) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed var(--border-color); font-size: 13px;">
            <span><strong>Lần ${h.turn}</strong> • ${Utils.escapeHtml(h.date)}</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <strong style="color: ${h.scorePct >= 75 ? 'var(--exp-green)' : 'var(--correct-red)'};">${h.scorePct}% (${h.correctCount}/${h.totalCount})</strong>
              ${h.wrongQuestions && h.wrongQuestions.length > 0 ? `<button type="button" class="btn btn-outline btn-xs btn-view-turn-mistakes" data-turn="${h.turn}">Xem sai (${h.wrongQuestions.length})</button>` : ''}
            </div>
          </div>
        `).join('');

        card.innerHTML = `
          <div class="fetest-card-top">
            <div>
              <div class="fetest-card-title">${Utils.escapeHtml(test.title)}</div>
              <div class="fetest-card-meta">
                <span>Số câu: <strong>${totalQ}</strong></span>
                <span>•</span>
                <span>Thời gian: <strong>${test.durationMinutes === 0 ? 'Không giới hạn' : `${test.durationMinutes || 60}p`}</strong></span>
                ${hasHist ? `<span>•</span><span style="color: var(--primary); font-weight: 600;">${historyItems.length || 1} lượt</span>` : ''}
              </div>
            </div>
            <div class="fetest-actions">
              ${hasHist
                ? `<span class="tag-badge" style="background: ${isPassed ? '#dcfce7' : '#fee2e2'}; color: ${isPassed ? '#15803d' : '#b91c1c'};">${isPassed ? 'Đạt' : 'Chưa đạt'}: ${curPct}%</span>`
                : '<span class="tag-badge" style="background: #fef3c7; color: #b45309;">Chưa làm</span>'}
              ${test.questionIds && test.questionIds.length > 0 ? `<button type="button" class="btn btn-primary btn-sm btn-start-fetest">${hasHist ? 'Làm lại' : 'Làm bài'}</button>` : ''}
              ${hasHist ? `<button type="button" class="btn btn-outline btn-sm btn-toggle-history">Lịch sử (${historyItems.length || 1}) ▾</button>` : ''}
              ${hasHist && wrongNum > 0 && latest?.wrongQuestions?.length > 0 ? `<button type="button" class="btn btn-warning btn-sm btn-view-latest-mistakes">Xem câu sai (${wrongNum})</button>` : ''}
              <button type="button" class="btn btn-outline btn-sm btn-delete-fetest">Xóa</button>
            </div>
          </div>
          <div class="fetest-history-dropdown" style="display: none; margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-color);">
            ${histRows || '<div style="font-size: 12.5px; color: var(--text-muted);">Chưa có lượt thi chi tiết.</div>'}
          </div>
        `;

        const startBtn = card.querySelector('.btn-start-fetest');
        if (startBtn) startBtn.onclick = () => this.startTest(test.id);

        const delBtn = card.querySelector('.btn-delete-fetest');
        if (delBtn) {
          delBtn.onclick = () => {
            this.dataStore.feTests = this.dataStore.feTests.filter((t) => t.id !== test.id);
            StorageService.saveFeTests(this.dataStore.feTests);
            this.render();
          };
        }

        const histBtn = card.querySelector('.btn-toggle-history');
        const histDrop = card.querySelector('.fetest-history-dropdown');
        if (histBtn && histDrop) {
          histBtn.onclick = () => {
            const open = histDrop.style.display === 'none';
            histDrop.style.display = open ? 'block' : 'none';
          };
        }

        const latestErrBtn = card.querySelector('.btn-view-latest-mistakes');
        if (latestErrBtn) {
          latestErrBtn.onclick = () => this.openMistakesModal(test.id, latest?.turn || null);
        }

        card.querySelectorAll('.btn-view-turn-mistakes').forEach((b) => {
          b.onclick = () => this.openMistakesModal(test.id, parseInt(b.dataset.turn, 10));
        });

        listEl.appendChild(card);
      });
    }
  }

  // =========================================================================
  // 8. FLASHCARDS CONTROLLER
  // =========================================================================

  class FlashcardsController {
    constructor(dataStore, app) {
      this.dataStore = dataStore;
      this.app = app;
      this.subject = 'all';
      this.topic = 'ALL';
      this.mistakesOnly = false;
      this.shuffled = false;
      this.deck = [];
      this.index = 0;
      this.flipped = false;
    }

    init() {
      this.populateTopicSelect();
      this.bindEvents();
      this.rebuildDeck();
    }

    setSubject(sub) {
      this.subject = sub || 'all';
      this.topic = 'ALL';
      const subSel = document.getElementById('fcSubjectSelect');
      if (subSel) subSel.value = this.subject;
      this.populateTopicSelect();
      this.rebuildDeck();
    }

    populateTopicSelect() {
      const sel = document.getElementById('fcTopicSelect');
      if (!sel) return;
      const topics = this.dataStore.getTopics(this.subject);
      sel.innerHTML = `<option value="ALL">Tất cả chủ đề (${topics.length})</option>` +
        topics.map((t) => `<option value="${Utils.escapeHtml(t)}">${Utils.escapeHtml(t)}</option>`).join('');
      sel.value = this.topic;
    }

    bindEvents() {
      const subSel = document.getElementById('fcSubjectSelect');
      if (subSel) {
        subSel.onchange = () => {
          this.subject = subSel.value;
          this.topic = 'ALL';
          this.populateTopicSelect();
          this.rebuildDeck();
        };
      }

      const topSel = document.getElementById('fcTopicSelect');
      if (topSel) {
        topSel.onchange = () => {
          this.topic = topSel.value;
          this.rebuildDeck();
        };
      }

      const shufBtn = document.getElementById('fcShuffleBtn');
      if (shufBtn) {
        shufBtn.onclick = () => {
          this.shuffled = !this.shuffled;
          shufBtn.classList.toggle('active', this.shuffled);
          this.rebuildDeck();
        };
      }

      const misBtn = document.getElementById('fcMistakesOnlyBtn');
      if (misBtn) {
        misBtn.onclick = () => {
          this.mistakesOnly = !this.mistakesOnly;
          misBtn.classList.toggle('active', this.mistakesOnly);
          this.rebuildDeck();
        };
      }

      const prev = document.getElementById('fcPrevBtn');
      const next = document.getElementById('fcNextBtn');
      const flip = document.getElementById('fcFlipBtn');
      const needRev = document.getElementById('fcNeedReviewBtn');
      const mastered = document.getElementById('fcMasteredBtn');

      if (prev) prev.onclick = () => this.prev();
      if (next) next.onclick = () => this.next();
      if (flip) flip.onclick = () => this.toggleFlip();
      if (needRev) {
        needRev.onclick = () => {
          const cur = this.deck[this.index];
          if (!cur) return;
          this.dataStore.addMistake(cur.id);
          this.dataStore.markAttempted([cur.id]);
          this.dataStore.recordDailyActivity([cur.id]);
          this.app.updateBadges();
          this.next();
        };
      }
      if (mastered) {
        mastered.onclick = () => {
          const cur = this.deck[this.index];
          if (!cur) return;
          this.dataStore.removeMistake(cur.id);
          this.dataStore.markAttempted([cur.id]);
          this.dataStore.recordDailyActivity([cur.id]);
          this.app.updateBadges();
          this.next();
        };
      }

      window.addEventListener('keydown', (e) => {
        if (this.app.activeMode !== 'flashcards') return;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
        if (e.code === 'Space') {
          e.preventDefault();
          this.toggleFlip();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.next();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prev();
        }
      });
    }

    rebuildDeck() {
      let pool = this.dataStore.getQuestionsBySubject(this.subject);
      if (this.topic && this.topic !== 'ALL') {
        pool = pool.filter((q) => q.topic === this.topic);
      }
      if (this.mistakesOnly) {
        pool = pool.filter((q) => this.dataStore.mistakesIds.has(q.id));
      }
      this.deck = this.shuffled ? Utils.shuffleArray(pool) : [...pool];
      this.index = 0;
      this.flipped = false;
      this.render();
    }

    toggleFlip() {
      if (this.deck.length === 0) return;
      this.flipped = !this.flipped;
      this.render();
    }

    prev() {
      if (this.deck.length === 0) return;
      this.index = (this.index - 1 + this.deck.length) % this.deck.length;
      this.flipped = false;
      this.render();
    }

    next() {
      if (this.deck.length === 0) return;
      this.index = (this.index + 1) % this.deck.length;
      this.flipped = false;
      this.render();
    }

    render() {
      const host = document.getElementById('fcCardHost');
      const counter = document.getElementById('fcCounterLabel');
      const fill = document.getElementById('fcProgressFill');

      if (!host) return;
      if (this.deck.length === 0) {
        if (counter) counter.innerText = 'Thẻ 0 / 0';
        if (fill) fill.style.width = '0%';
        host.innerHTML = `
          <div class="study-card" style="text-align: center; padding: 3rem 1.5rem;">
            <p style="color: var(--text-muted);">Không có thẻ nào khớp với bộ lọc hiện tại.</p>
          </div>
        `;
        return;
      }

      const q = this.deck[this.index];
      const total = this.deck.length;
      const pct = Math.round(((this.index + 1) / total) * 100);
      if (counter) counter.innerText = `Thẻ ${this.index + 1} / ${total}`;
      if (fill) fill.style.width = `${pct}%`;

      const isStarred = this.dataStore.starredIds.has(q.id);
      const diffMeta = Utils.getDifficultyMeta(q.difficulty);
      const correctOpts = q.options.filter((o) => o.isCorrect);
      const correctDisplay = correctOpts.length > 0
        ? correctOpts.map((o) => `${o.key}. ${o.text}`).join(' | ')
        : q.correctAnswer;

      const optsHtml = q.options.map((opt) => {
        const cls = this.flipped && opt.isCorrect ? 'fc-opt-chip fc-opt-correct' : 'fc-opt-chip';
        return `<div class="${cls}"><strong>${Utils.escapeHtml(opt.key)}.</strong> <span>${Utils.escapeHtml(opt.text)}</span></div>`;
      }).join('');

      const answerSection = this.flipped ? `
        <div class="explanation-box" style="margin-top: 8px;">
          ${Utils.renderFixSourceBanner(q)}
          <div style="font-weight: 700; color: var(--exp-green); margin-bottom: 6px;">
            Đáp án đúng: ${Utils.escapeHtml(correctDisplay)}
          </div>
          <div class="exp-text">
            ${q.explanation ? Utils.formatExplanation(q.explanation) : 'Chưa có giải thích bổ sung.'}
          </div>
        </div>
      ` : '';

      host.innerHTML = `
        <div class="fc-card ${this.flipped ? 'fc-flipped' : ''}">
          <div class="fc-card-head">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="tag-badge">${Utils.escapeHtml(q.subject)}</span>
              <span class="topic-pill-tag">${Utils.escapeHtml(q.topic)}</span>
              <span class="diff-pill ${diffMeta.cls}">${diffMeta.label}</span>
              ${Utils.renderFixSourceBadge(q)}
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="dash-bench-tag">${this.flipped ? 'Mặt sau • Đáp án' : 'Mặt trước • Câu hỏi'}</span>
              <button type="button" class="btn-star ${isStarred ? 'starred' : ''}" id="fcStarBtn" title="Lưu sao">${isStarred ? '★' : '☆'}</button>
            </div>
          </div>
          <div class="fc-card-body">
            <div style="font-size: 1.08rem; font-weight: 600; line-height: 1.6;">
              ${Utils.formatQuestionText(q.questionText)}
            </div>
            ${q.codeSnippet ? Utils.renderCodeTerminal(q.codeSnippet, q.subject) : ''}
            ${Utils.renderSlidePreview(q, false)}
            <div class="fc-options-grid">${optsHtml}</div>
            ${answerSection}
          </div>
          <div class="fc-card-foot">
            <span>ID: ${Utils.escapeHtml(q.id)}</span>
            <span>Bấm vào thẻ hoặc nhấn Space để ${this.flipped ? 'úp lại' : 'xem đáp án'}</span>
          </div>
        </div>
      `;

      const cardEl = host.querySelector('.fc-card');
      if (cardEl) {
        cardEl.onclick = (e) => {
          if (e.target.closest('button') || e.target.closest('.slide-preview-wrap') || window.getSelection()?.toString()) return;
          this.toggleFlip();
        };
      }

      const starBtn = document.getElementById('fcStarBtn');
      if (starBtn) {
        starBtn.onclick = (e) => {
          e.stopPropagation();
          const st = this.dataStore.toggleStar(q.id);
          starBtn.classList.toggle('starred', st);
          starBtn.innerText = st ? '★' : '☆';
          this.app.updateBadges();
        };
      }
    }
  }

  // =========================================================================
  // 9. MISTAKES CONTROLLER
  // =========================================================================

  class MistakesController {
    constructor(dataStore, app) {
      this.dataStore = dataStore;
      this.app = app;
    }

    init() {
      const testBtn = document.getElementById('btnTestMistakesOnly');
      if (testBtn) {
        testBtn.onclick = () => {
          const list = Array.from(this.dataStore.mistakesIds)
            .map((id) => this.dataStore.getQuestion(id))
            .filter(Boolean);
          if (list.length === 0) {
            alert('Bạn chưa có câu sai nào để luyện tập.');
            return;
          }
          this.app.examController.startExam(list, `Luyện tập ${list.length} câu làm sai`, null, {
            mode: 'practice',
            durationMinutes: 0,
            shuffleQuestions: true,
            shuffleOptions: true
          });
        };
      }

      const clearBtn = document.getElementById('btnClearAllMistakes');
      if (clearBtn) {
        clearBtn.onclick = () => {
          if (this.dataStore.mistakesIds.size === 0) return;
          if (confirm('Xóa toàn bộ danh sách câu làm sai?')) {
            this.dataStore.clearAllMistakes();
            this.app.updateBadges();
            this.render();
          }
        };
      }
    }

    render() {
      const listEl = document.getElementById('mistakesQuestionsList');
      const summaryEl = document.getElementById('mistakesSummaryText');
      if (!listEl) return;

      const list = Array.from(this.dataStore.mistakesIds)
        .map((id) => this.dataStore.getQuestion(id))
        .filter(Boolean);

      if (summaryEl) {
        summaryEl.innerText = list.length > 0
          ? `Bạn hiện có ${list.length} câu hỏi cần ôn tập lại.`
          : 'Tuyệt vời! Bạn chưa có câu hỏi nào làm sai.';
      }

      listEl.innerHTML = '';
      if (list.length === 0) {
        listEl.innerHTML = `
          <div class="study-card" style="text-align: center; padding: 2.5rem 1.5rem;">
            <p style="color: var(--text-muted);">Chưa có câu sai nào được ghi nhận. Các câu trả lời sai khi làm bài thi hoặc tự kiểm tra sẽ tự động lưu tại đây.</p>
          </div>
        `;
        return;
      }

      list.forEach((q, idx) => {
        const card = this.app.studyController.createQuestionCard(q, idx);
        const headerActions = card.querySelector('.study-card-header > div:last-child');
        if (headerActions) {
          const rmBtn = document.createElement('button');
          rmBtn.type = 'button';
          rmBtn.className = 'btn btn-outline btn-xs';
          rmBtn.innerText = 'Đã nắm vững';
          rmBtn.onclick = (e) => {
            e.stopPropagation();
            this.dataStore.removeMistake(q.id);
            this.app.updateBadges();
            this.render();
          };
          headerActions.prepend(rmBtn);
        }
        listEl.appendChild(card);
      });
    }
  }

  // =========================================================================
  // 10. STATS & DASHBOARD CONTROLLER
  // =========================================================================

  class StatsController {
    constructor(dataStore, app) {
      this.dataStore = dataStore;
      this.app = app;
    }

    init() {
      const quickFe = document.getElementById('btnDashQuickFe');
      if (quickFe) quickFe.onclick = () => this.app.startQuickSubjectExam('all');

      const resetBtn = document.getElementById('btnResetAllStats');
      if (resetBtn) resetBtn.onclick = () => this.resetAll();

      const pracMistakes = document.getElementById('btnDashPracticeMistakes');
      if (pracMistakes) {
        pracMistakes.onclick = () => this.app.switchMode('mistakes');
      }

      const scFe = document.getElementById('dashShortcutCustomFe');
      const scPr = document.getElementById('dashShortcutPractice');
      const scFc = document.getElementById('dashShortcutFlashcards');
      const scMis = document.getElementById('dashShortcutMistakes');

      if (scFe) scFe.onclick = () => this.app.switchMode('fetest');
      if (scPr) {
        scPr.onclick = () => {
          this.app.studyController.selfTestMode = true;
          const toggleInter = document.getElementById('toggleInteractiveBtn');
          if (toggleInter) {
            toggleInter.classList.add('active');
            toggleInter.innerText = 'Chế độ: Tự kiểm tra';
          }
          this.app.switchMode('study');
        };
      }
      if (scFc) scFc.onclick = () => this.app.switchMode('flashcards');
      if (scMis) scMis.onclick = () => this.app.switchMode('mistakes');
    }

    render() {
      const setTxt = (id, v) => {
        const el = document.getElementById(id);
        if (el) el.innerText = v;
      };

      const totalQ = this.dataStore.questions.length || 1594;
      const practiced = this.dataStore.attemptedIds.size;
      const passTarget = Math.ceil(totalQ * 0.75);
      const compPct = totalQ > 0 ? Math.round((practiced / totalQ) * 100) : 0;

      setTxt('dashOverallPctText', `${compPct}% (${practiced} / ${totalQ.toLocaleString('vi-VN')} câu)`);
      const overallBar = document.getElementById('dashOverallBar');
      if (overallBar) overallBar.style.width = `${compPct}%`;

      setTxt('dashKpiPracticed', practiced);
      setTxt('dashKpiTotal', `/ ${totalQ.toLocaleString('vi-VN')} câu`);
      const pctBadge = document.getElementById('dashKpiPctBadge');
      if (pctBadge) {
        const ok = practiced >= passTarget;
        pctBadge.className = `dash-kpi-badge ${ok ? 'good' : 'neutral'}`;
        pctBadge.innerText = ok ? `${compPct}% (Đạt Pass ≥ 75%)` : `${compPct}% (Mốc Pass: ${passTarget} câu)`;
      }
      setTxt('dashKpiUnanswered', `Còn ${Math.max(0, totalQ - practiced)} câu chưa làm`);

      // Collect recent attempts
      const attempts = [];
      this.dataStore.feTests.forEach((t) => {
        if (Array.isArray(t.history) && t.history.length > 0) {
          t.history.forEach((h) => {
            attempts.push({
              title: t.title || t.id,
              date: h.date || t.lastDate || t.createdAt || '',
              pct: typeof h.scorePct === 'number' ? h.scorePct : 0,
              correct: h.correctCount || 0,
              total: h.totalCount || t.questionIds?.length || 50,
              testId: t.id,
              turn: h.turn || 1
            });
          });
        } else if (t.completed) {
          attempts.push({
            title: t.title || t.id,
            date: t.lastDate || t.createdAt || '',
            pct: t.scorePct || 0,
            correct: t.correctCount || 0,
            total: t.questionIds?.length || 50,
            testId: t.id,
            turn: 1
          });
        }
      });

      SUBJECT_KEYS.forEach((k) => {
        const st = this.dataStore.moduleStats[k];
        if (st && Array.isArray(st.history)) {
          st.history.forEach((h) => {
            attempts.push({
              title: `${k} (${h.total}Q)`,
              date: h.date || '',
              pct: typeof h.pct === 'number' ? h.pct : 0,
              correct: h.correct || 0,
              total: h.total || 0,
              subjectKey: k
            });
          });
        }
      });

      const avgPct = attempts.length > 0
        ? Math.round(attempts.reduce((s, a) => s + a.pct, 0) / attempts.length)
        : null;
      const avgPts = avgPct !== null ? avgPct * 10 : null;

      setTxt('dashKpiAvgPts', avgPts !== null ? avgPts : '--');
      setTxt('dashKpiTotalTests', `${attempts.length} lượt thi`);
      const passBadge = document.getElementById('dashKpiPassStatus');
      if (passBadge) {
        if (avgPts === null) {
          passBadge.className = 'dash-kpi-badge neutral';
          passBadge.innerText = 'Chuẩn Pass ≥ 750 (75%)';
        } else if (avgPts >= 750) {
          passBadge.className = 'dash-kpi-badge good';
          passBadge.innerText = 'Đạt chuẩn Pass (≥750)';
        } else {
          passBadge.className = 'dash-kpi-badge weak';
          passBadge.innerText = 'Dưới chuẩn (<750)';
        }
      }

      // Streak KPI
      const streak = this.dataStore.getStreakInfo();
      setTxt('dashKpiStreak', String(streak.current).padStart(2, '0'));
      setTxt('dashKpiStreakRecord', `Hôm nay: ${streak.todayCount} câu • Kỷ lục: ${streak.best} ngày`);
      const dotsEl = document.getElementById('dashStreakDots');
      if (dotsEl) {
        dotsEl.innerHTML = streak.last7
          .map((d) => `<span class="streak-dot ${d.active ? 'active' : ''}" title="${d.label}: ${d.count} câu"></span>`)
          .join('');
      }

      // Mistakes KPI
      const mCount = this.dataStore.mistakesIds.size;
      setTxt('dashKpiMistakes', mCount);
      const mBySub = {};
      this.dataStore.mistakesIds.forEach((id) => {
        const q = this.dataStore.getQuestion(id);
        if (q) mBySub[q.subject] = (mBySub[q.subject] || 0) + 1;
      });
      const topWeak = Object.entries(mBySub).sort((a, b) => b[1] - a[1])[0];
      setTxt('dashKpiWeakMod', topWeak ? `Tập trung: ${topWeak[0]} (${topWeak[1]} câu)` : 'Chưa có câu sai');

      // 5 Subject Mastery Rows
      const grid = document.getElementById('moduleStatsGrid');
      if (grid) {
        grid.innerHTML = '';
        SUBJECT_KEYS.forEach((k) => {
          const info = SUBJECT_INFO[k];
          const subQs = this.dataStore.getQuestionsBySubject(k);
          const done = subQs.reduce((acc, q) => acc + (this.dataStore.attemptedIds.has(q.id) ? 1 : 0), 0);
          const stat = this.dataStore.moduleStats[k] || { latest: null };
          const hasTest = stat.latest && stat.latest.total > 0;
          const pct = hasTest
            ? stat.latest.percentage
            : (subQs.length > 0 ? Math.round((done / subQs.length) * 100) : 0);

          const statusCls = !hasTest && done === 0 ? 'neutral' : pct >= 75 ? 'good' : pct >= 60 ? 'medium' : 'weak';
          const statusLabel = !hasTest && done === 0 ? 'Chưa học' : pct >= 75 ? 'Đạt chuẩn' : pct >= 60 ? 'Khá tốt' : 'Cần ôn lại';

          const row = document.createElement('div');
          row.className = 'dash-mod-row';
          row.innerHTML = `
            <div class="dash-mod-code ${statusCls}">${Utils.escapeHtml(k)}</div>
            <div class="dash-mod-body">
              <div class="dash-mod-title">${Utils.escapeHtml(info.name)}</div>
              <div class="dash-mod-meta">
                <span>Đã làm: <strong>${done}/${subQs.length}</strong> câu</span>
                ${hasTest ? `<span>• Thi gần nhất: <strong>${stat.latest.correct}/${stat.latest.total}</strong> (${stat.latest.percentage}%)</span>` : ''}
              </div>
              <div class="dash-mod-bar"><div class="dash-mod-bar-fill ${statusCls}" style="width: ${pct}%;"></div></div>
            </div>
            <div class="dash-mod-right">
              <div class="dash-mod-pct ${statusCls}"><strong>${pct}%</strong><span>${statusLabel}</span></div>
              <button type="button" class="btn btn-outline btn-xs dash-mod-action">Ôn ngay</button>
            </div>
          `;
          const actBtn = row.querySelector('.dash-mod-action');
          if (actBtn) {
            actBtn.onclick = () => {
              this.app.selectSubject(k, true);
            };
          }
          grid.appendChild(row);
        });
      }

      // Daily Activity History
      const dailyBody = document.getElementById('dashDailyHistoryBody');
      const dayKeys = Object.keys(this.dataStore.dailyHistory)
        .filter((k) => (this.dataStore.dailyHistory[k]?.qIds?.length || 0) > 0 || (this.dataStore.dailyHistory[k]?.tests || 0) > 0)
        .sort((a, b) => b.localeCompare(a));
      setTxt('dashActiveDaysCount', `${dayKeys.length} ngày hoạt động`);

      if (dailyBody) {
        if (dayKeys.length === 0) {
          dailyBody.innerHTML = '<tr><td colspan="5" class="dash-empty-cell">Chưa có lịch sử hoạt động theo ngày. Hãy luyện tập hoặc thi thử để cập nhật.</td></tr>';
        } else {
          const todayStr = StorageService.todayKey();
          dailyBody.innerHTML = dayKeys.slice(0, 14).map((k) => {
            const d = this.dataStore.dailyHistory[k];
            const qCnt = Array.isArray(d.qIds) ? d.qIds.length : 0;
            const tCnt = d.tests || 0;
            const bPts = d.bestPct ? `${d.bestPct * 10} / 1000` : '--';
            const isToday = k === todayStr;
            return `
              <tr>
                <td><strong>${Utils.escapeHtml(k)}</strong> ${isToday ? '<span class="dash-pill-sm good">Hôm nay</span>' : ''}</td>
                <td><strong>${qCnt}</strong> câu</td>
                <td>${tCnt} đề</td>
                <td>${bPts}</td>
                <td><span class="dash-pill-sm ${qCnt >= 20 || tCnt > 0 ? 'good' : 'neutral'}">${qCnt >= 20 || tCnt > 0 ? 'Tích cực' : 'Đã học'}</span></td>
              </tr>
            `;
          }).join('');
        }
      }

      // Recent Attempts Table
      const recentBody = document.getElementById('dashRecentAttemptsBody');
      if (recentBody) {
        if (attempts.length === 0) {
          recentBody.innerHTML = '<tr><td colspan="5" class="dash-empty-cell">Chưa có lượt thi nào được ghi nhận.</td></tr>';
        } else {
          recentBody.innerHTML = attempts.slice(0, 8).map((a, idx) => {
            const pts = a.pct * 10;
            const passed = pts >= 750;
            return `
              <tr>
                <td><strong>${Utils.escapeHtml(a.title)}</strong></td>
                <td class="text-muted">${Utils.escapeHtml(a.date || '--')}</td>
                <td><strong>${pts}</strong> <small>/ 1000 (${a.pct}%)</small></td>
                <td><span class="dash-pill-sm ${passed ? 'good' : 'weak'}">${passed ? 'PASSED' : 'CẦN ÔN'}</span></td>
                <td><button type="button" class="btn-link-action btn-dash-review" data-idx="${idx}">Xem lại</button></td>
              </tr>
            `;
          }).join('');

          recentBody.querySelectorAll('.btn-dash-review').forEach((btn) => {
            btn.onclick = () => {
              const a = attempts[Number(btn.dataset.idx)];
              if (!a) return;
              if (a.testId) {
                this.app.feTestController.openMistakesModal(a.testId, a.turn);
              } else if (a.subjectKey) {
                this.app.selectSubject(a.subjectKey, true);
              }
            };
          });
        }
      }

      this.renderScoreTrend(attempts.slice(0, 7).reverse());
    }

    renderScoreTrend(points) {
      const box = document.getElementById('dashScoreTrendBox');
      const deltaEl = document.getElementById('dashTrendDelta');
      if (!box) return;

      if (!points || points.length === 0) {
        if (deltaEl) deltaEl.innerText = '--';
        box.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.85rem;">Hoàn thành ít nhất 1 bài thi để hiển thị biểu đồ xu hướng điểm.</div>';
        return;
      }

      if (deltaEl) {
        const last = points[points.length - 1].pct * 10;
        if (points.length >= 2) {
          const diff = last - (points[points.length - 2].pct * 10);
          deltaEl.innerText = `${diff >= 0 ? '+' : ''}${diff} pts`;
          deltaEl.style.color = diff >= 0 ? 'var(--exp-green)' : 'var(--correct-red)';
        } else {
          deltaEl.innerText = `${last} pts`;
        }
      }

      const W = 380;
      const H = 175;
      const padX = 28;
      const padTop = 18;
      const padBot = 28;
      const plotW = W - padX * 2;
      const plotH = H - padTop - padBot;

      const coords = points.map((p, i) => {
        const pt = p.pct * 10;
        const x = points.length === 1 ? W / 2 : padX + (i / (points.length - 1)) * plotW;
        const y = padTop + plotH - (pt / 1000) * plotH;
        return { x: Math.round(x), y: Math.round(y), pt, idx: i + 1 };
      });

      const passY = Math.round(padTop + plotH - 0.75 * plotH);
      const polyPoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
      const areaPoints = `${coords[0].x},${padTop + plotH} ${polyPoints} ${coords[coords.length - 1].x},${padTop + plotH}`;

      box.innerHTML = `
        <svg viewBox="0 0 ${W} ${H}" class="dash-trend-svg">
          <line x1="${padX}" y1="${passY}" x2="${W - padX}" y2="${passY}" stroke="#10b981" stroke-dasharray="4 4" stroke-width="1"/>
          <text x="${W - padX}" y="${passY - 4}" text-anchor="end" fill="#10b981" font-size="9.5" font-weight="600">PASS (750)</text>
          ${coords.length > 1 ? `<polygon points="${areaPoints}" fill="rgba(29, 114, 184, 0.12)"/>` : ''}
          ${coords.length > 1 ? `<polyline points="${polyPoints}" fill="none" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
          ${coords.map((c) => `
            <circle cx="${c.x}" cy="${c.y}" r="4" fill="${c.pt >= 750 ? '#10b981' : '#ef4444'}" stroke="var(--bg-card)" stroke-width="1.5"/>
            <text x="${c.x}" y="${H - 8}" text-anchor="middle" fill="var(--text-muted)" font-size="9.5">L${c.idx} (${c.pt})</text>
          `).join('')}
        </svg>
      `;
    }

    resetAll() {
      if (!confirm('Bạn có chắc chắn muốn đặt lại toàn bộ thống kê tiến độ, lịch sử ngày và câu sai?')) return;
      this.dataStore.moduleStats = {};
      this.dataStore.dailyHistory = {};
      this.dataStore.attemptedIds.clear();
      this.dataStore.mistakesIds.clear();
      StorageService.saveModuleStats({});
      StorageService.saveDailyHistory({});
      StorageService.saveAttempted(this.dataStore.attemptedIds);
      StorageService.saveMistakes(this.dataStore.mistakesIds);
      this.app.updateBadges();
      this.render();
    }
  }

  // =========================================================================
  // 11. THEME MANAGER & MAIN APP ORCHESTRATOR
  // =========================================================================

  class ThemeManager {
    static init() {
      const saved = StorageService.getTheme();
      document.documentElement.setAttribute('data-theme', saved);
      ThemeManager.syncButtonLabel(saved);
    }

    static toggle() {
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      StorageService.setTheme(next);
      ThemeManager.syncButtonLabel(next);
    }

    static syncButtonLabel(theme) {
      const btn = document.getElementById('themeToggleBtn');
      if (btn) btn.innerText = theme === 'dark' ? 'Sáng' : 'Tối';
    }
  }

  class App {
    constructor() {
      this.dataStore = new ExamDataStore();
      this.activeMode = 'stats';
      this.activeSubject = 'all';

      this.studyController = new StudyController(this.dataStore, this);
      this.examController = new ExamController(this.dataStore, this);
      this.feTestController = new FeTestController(this.dataStore, this);
      this.flashcardsController = new FlashcardsController(this.dataStore, this);
      this.mistakesController = new MistakesController(this.dataStore, this);
      this.statsController = new StatsController(this.dataStore, this);
    }

    async boot() {
      ThemeManager.init();
      const collapsed = StorageService.getJson(STORAGE_KEYS.SIDEBAR_COLLAPSED, false);
      if (collapsed && window.innerWidth > 860) {
        document.body.classList.add('sidebar-collapsed');
      }

      try {
        await this.dataStore.loadQuestions();
      } catch (err) {
        const statsView = document.getElementById('statsView');
        if (statsView) {
          statsView.innerHTML = `<div class="study-card"><h3>Không thể tải ngân hàng câu hỏi</h3><p style="color: var(--correct-red);">${Utils.escapeHtml(err.message)}</p></div>`;
        }
        return;
      }

      this.updateSubjectCounts();
      this.studyController.init();
      this.examController.init();
      this.feTestController.init();
      this.flashcardsController.init();
      this.mistakesController.init();
      this.statsController.init();

      this.bindGlobalEvents();
      this.updateBadges();
      this.syncFromUrl(false);
    }

    updateSubjectCounts() {
      const allCnt = document.getElementById('count-all');
      if (allCnt) allCnt.innerText = this.dataStore.questions.length;
      SUBJECT_KEYS.forEach((k) => {
        const el = document.getElementById(`count-${k}`);
        if (el) el.innerText = this.dataStore.getQuestionsBySubject(k).length;
      });
    }

    updateBadges() {
      const sEl = document.getElementById('starredCount');
      const mEl = document.getElementById('mistakesTabCount');
      if (sEl) sEl.innerText = this.dataStore.starredIds.size;
      if (mEl) mEl.innerText = this.dataStore.mistakesIds.size;

      const total = this.dataStore.questions.length || 1;
      const pct = Math.min(100, Math.round((this.dataStore.attemptedIds.size / total) * 100));
      const bar = document.getElementById('globalProgressBar');
      if (bar && this.activeMode !== 'exam') bar.style.width = `${pct}%`;
    }

    selectSubject(subKey, switchToStudyIfDashboard = false) {
      this.activeSubject = subKey || 'all';
      document.querySelectorAll('#modulesBar .sidebar-mod-item').forEach((b) => {
        b.classList.toggle('active', b.dataset.mod === this.activeSubject);
      });

      this.studyController.setSubject(this.activeSubject);
      this.flashcardsController.setSubject(this.activeSubject);
      this.feTestController.setSubject(this.activeSubject);

      if (switchToStudyIfDashboard || this.activeMode === 'stats' || this.activeMode === 'exam' || this.activeMode === 'results') {
        this.switchMode('study');
      }
      this.closeMobileSidebar();
    }

    startQuickSubjectExam(subKey) {
      this.examController.startDefaultSubjectExam(subKey || this.activeSubject);
    }

    switchMode(mode, pushUrl = true) {
      this.activeMode = mode;

      // View panels visibility
      const map = {
        stats: 'statsView',
        study: 'studyView',
        exam: 'examView',
        results: 'resultsView',
        fetest: 'fetestView',
        flashcards: 'flashcardsView',
        mistakes: 'mistakesView'
      };
      Object.values(map).forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      const activePanel = document.getElementById(map[mode] || 'statsView');
      if (activePanel) activePanel.style.display = 'block';

      // Topbar active tab pill
      document.querySelectorAll('.topbar-tab-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.mode === mode || (mode === 'results' && btn.dataset.mode === 'exam'));
      });

      // SEB Sticky Bar visibility
      const sebBar = document.getElementById('sebStickyBar');
      if (sebBar) {
        sebBar.style.display = (mode === 'exam' && this.examController.activeExam && !this.examController.activeExam.submitted) ? 'block' : 'none';
      }

      // Render target view
      if (mode === 'stats') {
        this.statsController.render();
      } else if (mode === 'study') {
        this.studyController.render();
      } else if (mode === 'fetest') {
        this.feTestController.render();
      } else if (mode === 'flashcards') {
        this.flashcardsController.render();
      } else if (mode === 'mistakes') {
        this.mistakesController.render();
      } else if (mode === 'exam') {
        if (!this.examController.activeExam || this.examController.activeExam.submitted) {
          this.examController.startDefaultSubjectExam(this.activeSubject);
          return;
        }
      }

      if (mode !== 'exam') this.updateBadges();

      if (pushUrl && window.history && window.history.pushState) {
        const routeMap = {
          stats: '/',
          study: '/study',
          exam: '/exam',
          fetest: '/fetest',
          flashcards: '/flashcards',
          mistakes: '/mistakes'
        };
        const targetPath = routeMap[mode];
        if (targetPath && window.location.pathname !== targetPath) {
          try {
            window.history.pushState({ mode }, '', targetPath);
          } catch (e) {}
        }
      }

      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    syncFromUrl(pushUrl = false) {
      const path = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const subParam = params.get('subject');
      if (subParam && SUBJECT_KEYS.includes(subParam.toUpperCase())) {
        this.activeSubject = subParam.toUpperCase();
        document.querySelectorAll('#modulesBar .sidebar-mod-item').forEach((b) => {
          b.classList.toggle('active', b.dataset.mod === this.activeSubject);
        });
        this.studyController.setSubject(this.activeSubject);
        this.flashcardsController.setSubject(this.activeSubject);
        this.feTestController.setSubject(this.activeSubject);
      }

      if (path === '/study' || path === '/questions') {
        this.switchMode('study', pushUrl);
      } else if (path === '/exam') {
        this.switchMode('exam', pushUrl);
      } else if (path === '/fetest') {
        this.switchMode('fetest', pushUrl);
      } else if (path === '/flashcards') {
        this.switchMode('flashcards', pushUrl);
      } else if (path === '/mistakes') {
        this.switchMode('mistakes', pushUrl);
      } else {
        this.switchMode('stats', pushUrl);
      }
    }

    closeMobileSidebar() {
      const sidebar = document.getElementById('appSidebar');
      const backdrop = document.getElementById('sidebarBackdrop');
      if (sidebar) sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');
    }

    bindGlobalEvents() {
      // Topbar tabs
      document.querySelectorAll('.topbar-tab-btn').forEach((btn) => {
        btn.onclick = () => this.switchMode(btn.dataset.mode);
      });

      const logoBtn = document.getElementById('logoBtn');
      if (logoBtn) logoBtn.onclick = () => this.switchMode('stats');

      const themeBtn = document.getElementById('themeToggleBtn');
      if (themeBtn) themeBtn.onclick = () => ThemeManager.toggle();

      // Starred button in topbar -> jump to Study with Starred filter
      const starredTopBtn = document.getElementById('starredBtn');
      if (starredTopBtn) {
        starredTopBtn.onclick = () => {
          this.switchMode('study');
          this.studyController.toggleStarredOnly(true);
        };
      }

      // Sidebar module pills
      document.querySelectorAll('#modulesBar .sidebar-mod-item').forEach((btn) => {
        btn.onclick = () => this.selectSubject(btn.dataset.mod, this.activeMode === 'stats');
      });

      // Sidebar collapse/expand & mobile drawer
      const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
      const mobileToggle = document.getElementById('mobileSidebarToggle');
      const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
      const sidebar = document.getElementById('appSidebar');
      const backdrop = document.getElementById('sidebarBackdrop');

      const toggleSidebar = () => {
        if (!sidebar) return;
        if (window.innerWidth <= 860) {
          sidebar.classList.toggle('open');
          if (backdrop) backdrop.classList.toggle('active', sidebar.classList.contains('open'));
        } else {
          const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
          StorageService.setJson(STORAGE_KEYS.SIDEBAR_COLLAPSED, isCollapsed);
        }
      };

      if (sidebarToggleBtn) sidebarToggleBtn.onclick = toggleSidebar;
      if (mobileToggle) mobileToggle.onclick = toggleSidebar;
      if (sidebarCloseBtn) sidebarCloseBtn.onclick = () => this.closeMobileSidebar();
      if (backdrop) backdrop.onclick = () => this.closeMobileSidebar();

      // Search input
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        let debounceTimer = null;
        searchInput.oninput = () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            this.studyController.setSearch(searchInput.value);
          }, 180);
        };
        searchInput.onkeydown = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.studyController.setSearch(searchInput.value);
            if (this.activeMode !== 'study') this.switchMode('study');
          }
        };
      }

      // Global delegated handlers for Copy CLI & Toggle Slide Image
      document.addEventListener('click', (e) => {
        const cliBtn = e.target.closest('.btn-copy-cli');
        if (cliBtn) {
          e.stopPropagation();
          Utils.copyCli(cliBtn, cliBtn.getAttribute('data-cli') || '');
          return;
        }
        const slideBtn = e.target.closest('.btn-toggle-slide');
        if (slideBtn) {
          e.stopPropagation();
          const targetId = slideBtn.getAttribute('data-target');
          const panel = targetId ? document.getElementById(targetId) : null;
          if (panel) {
            const isHidden = panel.style.display === 'none';
            panel.style.display = isHidden ? 'block' : 'none';
            slideBtn.innerText = isHidden ? 'Ẩn Slide' : 'Xem Slide gốc';
          }
          return;
        }
        const fixBtn = e.target.closest('.fix-source-pill');
        if (fixBtn) {
          e.stopPropagation();
          const note = fixBtn.getAttribute('data-fixnote') || '';
          Utils.showToast(note);
          const card = fixBtn.closest('.study-card, .fc-card');
          const expBox = card ? card.querySelector('.explanation-box') : null;
          if (expBox) {
            expBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            expBox.classList.remove('fix-source-pulse');
            void expBox.offsetWidth;
            expBox.classList.add('fix-source-pulse');
          }
        }
      });

      // Keyboard shortcuts: Ctrl+B (Sidebar), Ctrl+K (Search), Ctrl+Enter (Submit Exam)
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
          e.preventDefault();
          toggleSidebar();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          if (searchInput) searchInput.focus();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          if (this.activeMode === 'exam' && this.examController.activeExam && !this.examController.activeExam.submitted) {
            e.preventDefault();
            this.examController.openSubmitModal();
          }
        }
      });

      window.addEventListener('popstate', () => {
        this.syncFromUrl(false);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    window.__fuEosApp = app;
    app.boot();
  });
})();
