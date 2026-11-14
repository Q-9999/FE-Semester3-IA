(() => {
  'use strict';

  const PROGRESS_KEY = 'fu_eos_progress_v1';
  const EXAMS_KEY = 'fu_eos_exams_v1';
  const SNOW_KEY = 'fu_eos_snow_enabled';

  const SUBJECT_META = {
    CSD203: {
      name: 'Data Structures and Algorithms (Python)',
      short: 'Cấu trúc dữ liệu & Giải thuật',
      color: 'from-indigo-500 to-cyan-500',
      badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    },
    DBI202: {
      name: 'Introduction to Databases (SQL)',
      short: 'Cơ sở dữ liệu SQL Server',
      color: 'from-emerald-500 to-teal-500',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
    JPD113: {
      name: 'Elementary Japanese 3',
      short: 'Tiếng Nhật cơ sở 3',
      color: 'from-rose-500 to-pink-500',
      badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    },
    NWC303: {
      name: 'Computer Networking',
      short: 'Mạng máy tính',
      color: 'from-sky-500 to-blue-600',
      badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    },
    IAO202: {
      name: 'Information Assurance Operations',
      short: 'Vận hành An toàn thông tin',
      color: 'from-amber-500 to-orange-500',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
  };

  const state = {
    questions: [],
    progress: {},
    exams: [],
    selectedSubject: 'CSD203',
    study: {
      subject: 'CSD203',
      topic: 'ALL',
      difficulty: 'ALL',
      onlyBookmarked: false,
      index: 0,
      selectedOption: null,
      showExplanation: false,
      showSlidePanel: false,
    },
    flashcards: {
      subject: 'CSD203',
      topic: 'ALL',
      index: 0,
      flipped: false,
      shuffledOrder: null,
    },
    bank: {
      query: '',
      subject: 'ALL',
      topic: 'ALL',
      difficulty: 'ALL',
      filterStatus: 'ALL',
      page: 1,
      pageSize: 20,
      expandedIds: new Set(),
    },
    exam: {
      mode: 'setup',
      subject: 'CSD203',
      count: 25,
      minutes: 30,
      items: [],
      answers: {},
      flagged: new Set(),
      currentIndex: 0,
      secondsLeft: 0,
      timerId: null,
      lastResult: null,
    },
    snowEnabled: true,
  };

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function loadLocalState() {
    try {
      const p = localStorage.getItem(PROGRESS_KEY);
      if (p) state.progress = JSON.parse(p);
    } catch {}
    try {
      const e = localStorage.getItem(EXAMS_KEY);
      if (e) state.exams = JSON.parse(e);
    } catch {}
    try {
      const s = localStorage.getItem(SNOW_KEY);
      if (s !== null) state.snowEnabled = s === 'true';
    } catch {}
  }

  function saveProgress() {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(state.progress));
    } catch {}
  }

  function saveExams() {
    try {
      localStorage.setItem(EXAMS_KEY, JSON.stringify(state.exams));
    } catch {}
  }

  function getProgress(id) {
    return state.progress[id] || {};
  }

  function toggleBookmark(id) {
    const cur = state.progress[id] || {};
    state.progress[id] = { ...cur, bookmarked: !cur.bookmarked };
    saveProgress();
    render();
  }

  function setMastery(id, status, isCorrect) {
    const cur = state.progress[id] || {};
    state.progress[id] = {
      ...cur,
      masteryStatus: status,
      timesAnswered: (cur.timesAnswered || 0) + 1,
      timesCorrect: (cur.timesCorrect || 0) + (isCorrect ? 1 : 0),
    };
    saveProgress();
  }

  function getSlidePath(q) {
    if (!q) return '';
    if (q.imagePath && !q.imagePath.startsWith('/api/slides/')) return q.imagePath;
    if (q.imageFileName) {
      const sub = (q.subject || 'CSD203').toUpperCase();
      return `/SEMESTER_3_${sub}/${q.imageFileName}`;
    }
    return '';
  }

  function getDifficultyBadge(diff) {
    if (diff === 'Easy') return '<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Easy</span>';
    if (diff === 'Hard') return '<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">Hard</span>';
    return '<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">Medium</span>';
  }

  function getTopicsForSubject(subject) {
    const map = new Map();
    for (const q of state.questions) {
      if (subject !== 'ALL' && q.subject !== subject) continue;
      map.set(q.topic, (map.get(q.topic) || 0) + 1);
    }
    return [...map.entries()].map(([topic, count]) => ({ topic, count }));
  }

  function getGlobalStats() {
    let mastered = 0;
    let reviewNeeded = 0;
    let bookmarked = 0;
    for (const q of state.questions) {
      const p = getProgress(q.id);
      if (p.masteryStatus === 'mastered') mastered++;
      if (p.masteryStatus === 'review_needed') reviewNeeded++;
      if (p.bookmarked) bookmarked++;
    }
    const examCount = state.exams.length;
    const avgScore = examCount
      ? Math.round(state.exams.reduce((acc, x) => acc + x.scorePercentage, 0) / examCount)
      : 0;
    return { total: state.questions.length, mastered, reviewNeeded, bookmarked, examCount, avgScore };
  }

  function renderSnow() {
    const layer = document.getElementById('snow-layer');
    if (!layer) return;
    if (!state.snowEnabled) {
      layer.innerHTML = '';
      return;
    }
    const flakes = [];
    for (let i = 0; i < 24; i++) {
      const left = ((i * 37) % 100).toFixed(1);
      const duration = (8 + (i % 7) * 2).toFixed(1);
      const delay = ((i % 9) * 0.9).toFixed(1);
      const size = 10 + (i % 4) * 3;
      flakes.push(
        `<div class="snowflake" style="left:${left}%;font-size:${size}px;animation-duration:${duration}s;animation-delay:${delay}s;">❄</div>`
      );
    }
    layer.innerHTML = flakes.join('');
  }

  function getCurrentRoute() {
    const path = window.location.pathname || '/';
    if (path.startsWith('/study')) return '/study';
    if (path.startsWith('/flashcards')) return '/flashcards';
    if (path.startsWith('/questions')) return '/questions';
    if (path.startsWith('/exam')) return '/exam';
    return '/';
  }

  function navigate(url) {
    const parsed = new URL(url, window.location.origin);
    window.history.pushState({}, '', parsed.pathname + parsed.search);
    syncFromQuery();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function syncFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const sub = params.get('subject');
    const topic = params.get('topic');
    const qid = params.get('id');
    const route = getCurrentRoute();

    if (route === '/study') {
      if (sub && SUBJECT_META[sub]) state.study.subject = sub;
      if (topic) state.study.topic = topic;
      if (qid) {
        const foundQ = state.questions.find(q => q.id === qid);
        if (foundQ) {
          state.study.subject = foundQ.subject;
          state.study.topic = 'ALL';
          state.study.difficulty = 'ALL';
          state.study.onlyBookmarked = false;
          const list = getStudyQuestions();
          const idx = list.findIndex(q => q.id === qid);
          if (idx >= 0) state.study.index = idx;
        }
      }
      state.study.selectedOption = null;
      state.study.showExplanation = false;
    } else if (route === '/flashcards') {
      if (sub && SUBJECT_META[sub]) state.flashcards.subject = sub;
      if (topic) state.flashcards.topic = topic;
      state.flashcards.flipped = false;
    } else if (route === '/exam') {
      if (sub && SUBJECT_META[sub]) state.exam.subject = sub;
    }
  }

  function updateNavbar() {
    const route = getCurrentRoute();
    document.querySelectorAll('.nav-btn').forEach(btn => {
      const target = btn.getAttribute('data-route');
      if (target === route) {
        btn.className = 'nav-btn px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition bg-indigo-600 text-white shadow-md shadow-indigo-600/25';
      } else {
        btn.className = 'nav-btn px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition text-slate-400 hover:text-white hover:bg-slate-800/80';
      }
    });
  }

  function renderDashboard() {
    const stats = getGlobalStats();
    const subjects = Object.keys(SUBJECT_META);
    const activeSub = state.selectedSubject;
    const topics = getTopicsForSubject(activeSub);

    const subjectCardsHtml = subjects.map(code => {
      const meta = SUBJECT_META[code];
      const subQuestions = state.questions.filter(q => q.subject === code);
      const subMastered = subQuestions.filter(q => getProgress(q.id).masteryStatus === 'mastered').length;
      const pct = subQuestions.length ? Math.round((subMastered / subQuestions.length) * 100) : 0;
      const isSelected = activeSub === code;

      return `
        <div class="bg-slate-900/85 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
          isSelected ? 'border-indigo-500 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10' : 'border-slate-800 hover:border-slate-700'
        }">
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-2">
              <span class="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${meta.badge}">${code}</span>
              <span class="text-xs text-slate-400 font-medium">${subQuestions.length} câu</span>
            </div>
            <div>
              <h3 class="font-bold text-white text-sm leading-snug">${escapeHtml(meta.name)}</h3>
              <p class="text-xs text-slate-400 mt-0.5">${escapeHtml(meta.short)}</p>
            </div>
            <div class="space-y-1.5 pt-1">
              <div class="flex justify-between text-[11px] text-slate-400">
                <span>Đã thuộc</span>
                <span class="text-slate-200 font-semibold">${subMastered}/${subQuestions.length} (${pct}%)</span>
              </div>
              <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r ${meta.color} transition-all" style="width:${pct}%"></div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-1.5 pt-4 mt-4 border-t border-slate-800/80">
            <button data-action="select-subject" data-subject="${code}" class="px-2 py-1.5 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition">
              Chủ đề
            </button>
            <a href="/study?subject=${code}" data-route="/study?subject=${code}" class="px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-indigo-600/90 hover:bg-indigo-500 text-white text-center transition">
              Học ngay
            </a>
            <a href="/exam?subject=${code}" data-route="/exam?subject=${code}" class="px-2 py-1.5 rounded-lg text-[11px] font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-center transition">
              Thi thử
            </a>
          </div>
        </div>
      `;
    }).join('');

    const topicsHtml = topics.map(t => {
      const encodedTopic = encodeURIComponent(t.topic);
      return `
        <a href="/study?subject=${activeSub}&topic=${encodedTopic}" data-route="/study?subject=${activeSub}&topic=${encodedTopic}"
          class="group bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-4 flex items-center justify-between gap-3 transition">
          <div class="min-w-0">
            <div class="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 truncate transition">${escapeHtml(t.topic)}</div>
            <div class="text-xs text-slate-400 mt-0.5">${t.count} câu hỏi có đáp án &amp; giải thích</div>
          </div>
          <div class="shrink-0 w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-indigo-600 flex items-center justify-center text-slate-400 group-hover:text-white transition">
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </div>
        </a>
      `;
    }).join('');

    return `
      <div class="space-y-8">
        <section class="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div class="space-y-3 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <i data-lucide="award" class="w-3.5 h-3.5"></i>
              <span>Bộ đề ôn thi 5 môn kỳ 3 FPT • Đầy đủ 1,594 câu hỏi</span>
            </div>
            <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Hệ Thống Ôn Thi <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-400">FU-EOS Kỳ 3</span>
            </h1>
            <p class="text-sm text-slate-300 leading-relaxed">
              Ôn tập toàn diện CSD203, DBI202, JPD113, NWC303 và IAO202 theo từng chuyên đề, thẻ ghi nhớ Flashcards, tra cứu ngân hàng câu hỏi và thi thử bấm giờ.
            </p>
            <div class="flex flex-wrap gap-2.5 pt-2">
              <a href="/study?subject=${activeSub}" data-route="/study?subject=${activeSub}" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition">
                <i data-lucide="play" class="w-3.5 h-3.5"></i>
                <span>Bắt đầu học ${activeSub}</span>
              </a>
              <a href="/questions" data-route="/questions" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition">
                <i data-lucide="search" class="w-3.5 h-3.5"></i>
                <span>Tra cứu 1,594 câu hỏi</span>
              </a>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
            <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 min-w-[130px]">
              <div class="text-xs text-slate-400">Tổng câu hỏi</div>
              <div class="text-2xl font-extrabold text-white mt-1">${stats.total.toLocaleString()}</div>
            </div>
            <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 min-w-[130px]">
              <div class="text-xs text-slate-400">Đã thuộc</div>
              <div class="text-2xl font-extrabold text-emerald-400 mt-1">${stats.mastered}</div>
            </div>
            <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 min-w-[130px]">
              <div class="text-xs text-slate-400">Đánh dấu</div>
              <div class="text-2xl font-extrabold text-amber-400 mt-1">${stats.bookmarked}</div>
            </div>
            <div class="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 min-w-[130px]">
              <div class="text-xs text-slate-400">Điểm thi TB</div>
              <div class="text-2xl font-extrabold text-indigo-400 mt-1">${stats.avgScore}%</div>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <i data-lucide="graduation-cap" class="w-5 h-5 text-indigo-400"></i>
              <span>Danh sách 5 Môn Kỳ 3</span>
            </h2>
            <span class="text-xs text-slate-400">Chọn môn để xem danh sách chuyên đề bên dưới</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            ${subjectCardsHtml}
          </div>
        </section>

        <section class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <i data-lucide="folder-open" class="w-5 h-5 text-amber-400"></i>
              <span>Chuyên đề môn ${activeSub}</span>
              <span class="text-xs font-normal text-slate-400">(${topics.length} chủ đề)</span>
            </h2>
            <a href="/flashcards?subject=${activeSub}" data-route="/flashcards?subject=${activeSub}" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <span>Ôn tập Flashcards môn ${activeSub}</span>
              <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
            </a>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            ${topicsHtml}
          </div>
        </section>
      </div>
    `;
  }

  function getStudyQuestions() {
    return state.questions.filter(q => {
      if (state.study.subject !== 'ALL' && q.subject !== state.study.subject) return false;
      if (state.study.topic !== 'ALL' && q.topic !== state.study.topic) return false;
      if (state.study.difficulty !== 'ALL' && q.difficulty !== state.study.difficulty) return false;
      if (state.study.onlyBookmarked && !getProgress(q.id).bookmarked) return false;
      return true;
    });
  }

  function renderStudy() {
    const list = getStudyQuestions();
    if (state.study.index >= list.length) state.study.index = Math.max(0, list.length - 1);
    const q = list[state.study.index];
    const topics = getTopicsForSubject(state.study.subject);
    const meta = SUBJECT_META[state.study.subject] || SUBJECT_META.CSD203;

    const filterBar = `
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <select id="study-subject" class="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
          ${Object.keys(SUBJECT_META).map(c => `<option value="${c}" ${state.study.subject === c ? 'selected' : ''}>${c} - ${escapeHtml(SUBJECT_META[c].short)}</option>`).join('')}
        </select>
        <select id="study-topic" class="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white max-w-xs focus:outline-none focus:border-indigo-500">
          <option value="ALL" ${state.study.topic === 'ALL' ? 'selected' : ''}>Tất cả chủ đề (${state.questions.filter(x => x.subject === state.study.subject).length})</option>
          ${topics.map(t => `<option value="${escapeHtml(t.topic)}" ${state.study.topic === t.topic ? 'selected' : ''}>${escapeHtml(t.topic)} (${t.count})</option>`).join('')}
        </select>
        <select id="study-difficulty" class="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
          <option value="ALL" ${state.study.difficulty === 'ALL' ? 'selected' : ''}>Mọi độ khó</option>
          <option value="Easy" ${state.study.difficulty === 'Easy' ? 'selected' : ''}>Easy</option>
          <option value="Medium" ${state.study.difficulty === 'Medium' ? 'selected' : ''}>Medium</option>
          <option value="Hard" ${state.study.difficulty === 'Hard' ? 'selected' : ''}>Hard</option>
        </select>
        <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer px-2">
          <input id="study-bookmarked" type="checkbox" ${state.study.onlyBookmarked ? 'checked' : ''} class="rounded border-slate-700 bg-slate-950 text-indigo-500" />
          <span>Chỉ câu đánh dấu</span>
        </label>
        <div class="ml-auto text-xs text-slate-400 font-mono">
          ${list.length > 0 ? `Câu ${state.study.index + 1} / ${list.length}` : '0 câu hỏi'}
        </div>
      </div>
    `;

    if (!q) {
      return `
        <div class="space-y-6">
          ${filterBar}
          <div class="bg-slate-900/70 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <i data-lucide="inbox" class="w-10 h-10 text-slate-500 mx-auto"></i>
            <p class="text-sm text-slate-300 font-semibold">Không tìm thấy câu hỏi nào khớp bộ lọc</p>
            <button data-action="study-reset-filters" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white">Đặt lại bộ lọc</button>
          </div>
        </div>
      `;
    }

    const prog = getProgress(q.id);
    const slidePath = getSlidePath(q);
    const answered = state.study.selectedOption !== null;
    const isCorrect = answered && state.study.selectedOption === q.correctAnswer;

    const optionsHtml = q.options.map(opt => {
      let cls = 'border-slate-800 bg-slate-950/60 hover:border-indigo-500/50 hover:bg-slate-900 text-slate-200';
      let badgeCls = 'bg-slate-800 text-slate-300 border-slate-700';

      if (answered || state.study.showExplanation) {
        if (opt.key === q.correctAnswer) {
          cls = 'border-emerald-500 bg-emerald-500/15 text-emerald-100';
          badgeCls = 'bg-emerald-500 text-white border-emerald-400';
        } else if (opt.key === state.study.selectedOption) {
          cls = 'border-rose-500 bg-rose-500/15 text-rose-100';
          badgeCls = 'bg-rose-500 text-white border-rose-400';
        } else {
          cls = 'border-slate-800/60 bg-slate-950/30 text-slate-500';
        }
      }

      return `
        <button data-action="study-pick" data-key="${escapeHtml(opt.key)}" class="w-full text-left p-4 rounded-xl border transition flex items-start gap-3.5 ${cls}">
          <span class="w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 ${badgeCls}">${escapeHtml(opt.key)}</span>
          <span class="text-sm leading-relaxed whitespace-pre-wrap pt-0.5">${escapeHtml(opt.text)}</span>
        </button>
      `;
    }).join('');

    return `
      <div class="space-y-5 max-w-4xl mx-auto">
        ${filterBar}

        <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-mono text-xs font-bold px-2.5 py-1 rounded-lg border ${meta.badge}">${escapeHtml(q.id)}</span>
              ${getDifficultyBadge(q.difficulty)}
              <span class="text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">${escapeHtml(q.topic)}</span>
              ${prog.masteryStatus === 'mastered' ? '<span class="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg">✓ Đã thuộc</span>' : ''}
              ${prog.masteryStatus === 'review_needed' ? '<span class="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">↻ Cần ôn lại</span>' : ''}
            </div>

            <div class="flex items-center gap-2">
              ${slidePath ? `
                <button data-action="toggle-slide-panel" class="px-2.5 py-1.5 rounded-lg text-xs border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition" title="Thông tin slide gốc">
                  <i data-lucide="image" class="w-3.5 h-3.5"></i>
                  <span>Slide ${escapeHtml(q.imageFileName || '')}</span>
                </button>
              ` : ''}
              <button data-action="bookmark" data-id="${escapeHtml(q.id)}" class="p-2 rounded-lg border transition ${
                prog.bookmarked ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-amber-300'
              }" title="Đánh dấu câu hỏi">
                <i data-lucide="bookmark" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          ${state.study.showSlidePanel && slidePath ? `
            <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div class="flex items-center justify-between text-xs text-slate-400">
                <span>Đường dẫn Slide gốc: <code class="text-indigo-300 font-mono">${escapeHtml(slidePath)}</code></span>
              </div>
              <img src="${escapeHtml(slidePath)}" alt="Slide ${escapeHtml(q.id)}" class="max-h-96 rounded-xl mx-auto border border-slate-800"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
              <div style="display:none" class="text-xs text-slate-400 py-3 text-center bg-slate-900/60 rounded-xl border border-dashed border-slate-700">
                Chưa có tệp ảnh cục bộ tại <code class="text-amber-300">${escapeHtml(slidePath)}</code>. Nội dung văn bản, code và đáp án đầy đủ đã được hiển thị bên dưới.
              </div>
            </div>
          ` : ''}

          <div class="space-y-4">
            <h2 class="text-base sm:text-lg font-semibold text-white leading-relaxed whitespace-pre-wrap">${escapeHtml(q.questionText)}</h2>
            ${q.codeSnippet && q.codeSnippet.trim() ? `
              <pre class="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-x-auto text-xs sm:text-sm font-mono text-indigo-200 leading-relaxed"><code>${escapeHtml(q.codeSnippet)}</code></pre>
            ` : ''}
          </div>

          <div class="space-y-2.5">
            ${optionsHtml}
          </div>

          ${(answered || state.study.showExplanation) ? `
            <div class="rounded-2xl p-5 border space-y-2.5 ${
              answered
                ? (isCorrect ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-rose-950/30 border-rose-500/40')
                : 'bg-indigo-950/30 border-indigo-500/40'
            }">
              <div class="flex items-center justify-between">
                <div class="text-sm font-bold flex items-center gap-2 ${
                  answered ? (isCorrect ? 'text-emerald-300' : 'text-rose-300') : 'text-indigo-300'
                }">
                  <i data-lucide="${answered ? (isCorrect ? 'check-circle-2' : 'x-circle') : 'lightbulb'}" class="w-4 h-4"></i>
                  <span>${answered ? (isCorrect ? 'Chính xác!' : `Chưa đúng — Đáp án đúng là ${escapeHtml(q.correctAnswer)}`) : `Đáp án đúng: ${escapeHtml(q.correctAnswer)}`}</span>
                </div>
              </div>
              <p class="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">${escapeHtml(q.explanation || 'Không có giải thích bổ sung.')}</p>
              ${q.speakerNote && q.speakerNote.trim() && q.speakerNote.trim() !== (q.explanation || '').trim() ? `
                <div class="pt-2 border-t border-slate-800/70 text-xs text-slate-400">
                  <strong class="text-slate-300">Ghi chú thêm:</strong> ${escapeHtml(q.speakerNote)}
                </div>
              ` : ''}
            </div>
          ` : ''}

          <div class="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <button data-action="study-prev" ${state.study.index === 0 ? 'disabled' : ''} class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white flex items-center gap-1.5 transition">
                <i data-lucide="chevron-left" class="w-4 h-4"></i>
                <span>Câu trước</span>
              </button>
              <button data-action="study-next" ${state.study.index >= list.length - 1 ? 'disabled' : ''} class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center gap-1.5 transition">
                <span>Câu tiếp</span>
                <i data-lucide="chevron-right" class="w-4 h-4"></i>
              </button>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button data-action="study-toggle-exp" class="px-3 py-2 rounded-xl text-xs font-medium bg-slate-950 border border-slate-700 hover:border-indigo-500 text-slate-300 transition">
                ${state.study.showExplanation ? 'Ẩn đáp án' : 'Xem đáp án'}
              </button>
              <button data-action="study-mark" data-status="review_needed" data-id="${escapeHtml(q.id)}" class="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 transition">
                Cần ôn lại
              </button>
              <button data-action="study-mark" data-status="mastered" data-id="${escapeHtml(q.id)}" class="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 transition">
                Đã thuộc
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function getFlashcardList() {
    const base = state.questions.filter(q => {
      if (state.flashcards.subject !== 'ALL' && q.subject !== state.flashcards.subject) return false;
      if (state.flashcards.topic !== 'ALL' && q.topic !== state.flashcards.topic) return false;
      return true;
    });
    if (state.flashcards.shuffledOrder && state.flashcards.shuffledOrder.length === base.length) {
      return state.flashcards.shuffledOrder.map(i => base[i]);
    }
    return base;
  }

  function renderFlashcards() {
    const list = getFlashcardList();
    if (state.flashcards.index >= list.length) state.flashcards.index = Math.max(0, list.length - 1);
    const q = list[state.flashcards.index];
    const topics = getTopicsForSubject(state.flashcards.subject);

    const toolbar = `
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <select id="fc-subject" class="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
          ${Object.keys(SUBJECT_META).map(c => `<option value="${c}" ${state.flashcards.subject === c ? 'selected' : ''}>${c} - ${escapeHtml(SUBJECT_META[c].short)}</option>`).join('')}
        </select>
        <select id="fc-topic" class="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white max-w-xs">
          <option value="ALL" ${state.flashcards.topic === 'ALL' ? 'selected' : ''}>Tất cả chủ đề</option>
          ${topics.map(t => `<option value="${escapeHtml(t.topic)}" ${state.flashcards.topic === t.topic ? 'selected' : ''}>${escapeHtml(t.topic)} (${t.count})</option>`).join('')}
        </select>
        <button data-action="fc-shuffle" class="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition">
          <i data-lucide="shuffle" class="w-3.5 h-3.5"></i>
          <span>Trộn thẻ</span>
        </button>
        <div class="ml-auto text-xs text-slate-400 font-mono">Thẻ ${list.length ? state.flashcards.index + 1 : 0} / ${list.length}</div>
      </div>
    `;

    if (!q) return toolbar;
    const correctOpt = q.options.find(o => o.key === q.correctAnswer);

    return `
      <div class="space-y-6 max-w-3xl mx-auto">
        ${toolbar}

        <div data-action="fc-flip" class="cursor-pointer perspective-1000 select-none">
          <div class="bg-slate-900/95 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 sm:p-10 min-h-[380px] flex flex-col justify-between shadow-2xl transition-all">
            ${!state.flashcards.flipped ? `
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="font-mono text-xs font-bold text-indigo-400">${escapeHtml(q.id)} • ${escapeHtml(q.topic)}</span>
                  <span class="text-[11px] text-slate-500">Nhấn vào thẻ hoặc Space để lật</span>
                </div>
                <h2 class="text-lg sm:text-xl font-bold text-white leading-relaxed whitespace-pre-wrap pt-2">${escapeHtml(q.questionText)}</h2>
                ${q.codeSnippet && q.codeSnippet.trim() ? `
                  <pre class="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-indigo-200 overflow-x-auto"><code>${escapeHtml(q.codeSnippet)}</code></pre>
                ` : ''}
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  ${q.options.map(o => `
                    <div class="bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-300">
                      <strong class="text-indigo-400 mr-1">${escapeHtml(o.key)}.</strong>${escapeHtml(o.text)}
                    </div>
                  `).join('')}
                </div>
              </div>
              <div class="text-center text-xs text-slate-500 pt-4">Mặt trước — Câu hỏi</div>
            ` : `
              <div class="space-y-5">
                <div class="flex items-center justify-between">
                  <span class="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    Đáp án đúng: ${escapeHtml(q.correctAnswer)}
                  </span>
                  <span class="text-[11px] text-slate-500">Nhấn Space để lật lại</span>
                </div>
                ${correctOpt ? `
                  <div class="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-base font-semibold text-emerald-100">
                    ${escapeHtml(correctOpt.key)}. ${escapeHtml(correctOpt.text)}
                  </div>
                ` : ''}
                <div class="space-y-2">
                  <div class="text-xs font-bold uppercase tracking-wider text-slate-400">Giải thích chi tiết</div>
                  <p class="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">${escapeHtml(q.explanation || 'Không có giải thích.')}</p>
                </div>
              </div>
              <div class="text-center text-xs text-slate-500 pt-4">Mặt sau — Đáp án &amp; Giải thích</div>
            `}
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button data-action="fc-prev" ${state.flashcards.index === 0 ? 'disabled' : ''} class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-white flex items-center gap-1.5">
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              <span>Trước</span>
            </button>
            <button data-action="fc-next" ${state.flashcards.index >= list.length - 1 ? 'disabled' : ''} class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-white flex items-center gap-1.5">
              <span>Tiếp</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <button data-action="fc-rate" data-status="review_needed" data-id="${escapeHtml(q.id)}" class="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              Cần ôn lại
            </button>
            <button data-action="fc-rate" data-status="mastered" data-id="${escapeHtml(q.id)}" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold">
              Đã nhớ &amp; Tiếp tục
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function getBankFiltered() {
    const query = state.bank.query.trim().toLowerCase();
    return state.questions.filter(q => {
      if (state.bank.subject !== 'ALL' && q.subject !== state.bank.subject) return false;
      if (state.bank.topic !== 'ALL' && q.topic !== state.bank.topic) return false;
      if (state.bank.difficulty !== 'ALL' && q.difficulty !== state.bank.difficulty) return false;
      const p = getProgress(q.id);
      if (state.bank.filterStatus === 'bookmarked' && !p.bookmarked) return false;
      if (state.bank.filterStatus === 'mastered' && p.masteryStatus !== 'mastered') return false;
      if (state.bank.filterStatus === 'review_needed' && p.masteryStatus !== 'review_needed') return false;
      if (query) {
        const hay = `${q.id} ${q.topic} ${q.questionText} ${q.codeSnippet || ''} ${q.explanation || ''} ${q.options.map(o => o.text).join(' ')}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }

  function renderQuestionBank() {
    const filtered = getBankFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / state.bank.pageSize));
    if (state.bank.page > totalPages) state.bank.page = totalPages;
    const start = (state.bank.page - 1) * state.bank.pageSize;
    const slice = filtered.slice(start, start + state.bank.pageSize);
    const topics = getTopicsForSubject(state.bank.subject);

    const rowsHtml = slice.map(q => {
      const expanded = state.bank.expandedIds.has(q.id);
      const prog = getProgress(q.id);
      const meta = SUBJECT_META[q.subject] || SUBJECT_META.CSD203;
      return `
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-mono text-xs font-bold px-2 py-0.5 rounded border ${meta.badge}">${escapeHtml(q.id)}</span>
              ${getDifficultyBadge(q.difficulty)}
              <span class="text-xs text-slate-400">${escapeHtml(q.topic)}</span>
            </div>
            <div class="flex items-center gap-2">
              <button data-action="bookmark" data-id="${escapeHtml(q.id)}" class="p-1.5 rounded-lg border text-xs ${prog.bookmarked ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-amber-300'}">
                <i data-lucide="bookmark" class="w-3.5 h-3.5"></i>
              </button>
              <a href="/study?id=${escapeHtml(q.id)}" data-route="/study?id=${escapeHtml(q.id)}" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition">
                Luyện câu này
              </a>
              <button data-action="bank-toggle" data-id="${escapeHtml(q.id)}" class="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition">
                ${expanded ? 'Thu gọn' : 'Xem đáp án'}
              </button>
            </div>
          </div>

          <p class="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap">${escapeHtml(q.questionText)}</p>
          ${q.codeSnippet && q.codeSnippet.trim() ? `
            <pre class="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-indigo-200 overflow-x-auto"><code>${escapeHtml(q.codeSnippet)}</code></pre>
          ` : ''}

          ${expanded ? `
            <div class="pt-3 border-t border-slate-800/80 space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${q.options.map(o => `
                  <div class="p-2.5 rounded-xl border text-xs ${
                    o.key === q.correctAnswer
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }">
                    <strong class="mr-1">${escapeHtml(o.key)}.</strong> ${escapeHtml(o.text)}
                  </div>
                `).join('')}
              </div>
              <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                <strong class="text-emerald-400">Giải thích:</strong> ${escapeHtml(q.explanation || 'Không có')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="space-y-5">
        <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div class="lg:col-span-2 relative">
              <i data-lucide="search" class="w-4 h-4 text-slate-500 absolute left-3 top-2.5"></i>
              <input id="bank-search" type="text" value="${escapeHtml(state.bank.query)}" placeholder="Tìm theo từ khóa, mã câu hỏi (vd: CSD203-Q001, SQL, AVL...)"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
            </div>
            <select id="bank-subject" class="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
              <option value="ALL" ${state.bank.subject === 'ALL' ? 'selected' : ''}>Tất cả môn (${state.questions.length})</option>
              ${Object.keys(SUBJECT_META).map(c => `<option value="${c}" ${state.bank.subject === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
            <select id="bank-difficulty" class="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
              <option value="ALL" ${state.bank.difficulty === 'ALL' ? 'selected' : ''}>Mọi độ khó</option>
              <option value="Easy" ${state.bank.difficulty === 'Easy' ? 'selected' : ''}>Easy</option>
              <option value="Medium" ${state.bank.difficulty === 'Medium' ? 'selected' : ''}>Medium</option>
              <option value="Hard" ${state.bank.difficulty === 'Hard' ? 'selected' : ''}>Hard</option>
            </select>
            <select id="bank-status" class="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
              <option value="ALL" ${state.bank.filterStatus === 'ALL' ? 'selected' : ''}>Tất cả trạng thái</option>
              <option value="bookmarked" ${state.bank.filterStatus === 'bookmarked' ? 'selected' : ''}>Đã đánh dấu</option>
              <option value="mastered" ${state.bank.filterStatus === 'mastered' ? 'selected' : ''}>Đã thuộc</option>
              <option value="review_needed" ${state.bank.filterStatus === 'review_needed' ? 'selected' : ''}>Cần ôn lại</option>
            </select>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <select id="bank-topic" class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 max-w-md">
              <option value="ALL" ${state.bank.topic === 'ALL' ? 'selected' : ''}>Tất cả chủ đề</option>
              ${topics.map(t => `<option value="${escapeHtml(t.topic)}" ${state.bank.topic === t.topic ? 'selected' : ''}>${escapeHtml(t.topic)} (${t.count})</option>`).join('')}
            </select>
            <span>Tìm thấy <strong class="text-white">${filtered.length}</strong> câu hỏi • Trang ${state.bank.page}/${totalPages}</span>
          </div>
        </div>

        <div class="space-y-3">
          ${rowsHtml || '<div class="text-center py-12 text-sm text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">Không có kết quả nào phù hợp.</div>'}
        </div>

        ${totalPages > 1 ? `
          <div class="flex items-center justify-center gap-2 pt-2">
            <button data-action="bank-page" data-page="${state.bank.page - 1}" ${state.bank.page <= 1 ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-white">Trang trước</button>
            <span class="text-xs text-slate-400 px-2">Trang ${state.bank.page} / ${totalPages}</span>
            <button data-action="bank-page" data-page="${state.bank.page + 1}" ${state.bank.page >= totalPages ? 'disabled' : ''} class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-white">Trang sau</button>
          </div>
        ` : ''}
      </div>
    `;
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function startExam() {
    const pool = state.questions.filter(q => state.exam.subject === 'ALL' || q.subject === state.exam.subject);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const items = shuffled.slice(0, Math.min(state.exam.count, shuffled.length));

    if (state.exam.timerId) clearInterval(state.exam.timerId);
    state.exam.items = items;
    state.exam.answers = {};
    state.exam.flagged = new Set();
    state.exam.currentIndex = 0;
    state.exam.secondsLeft = state.exam.minutes * 60;
    state.exam.mode = 'active';
    state.exam.timerId = setInterval(() => {
      state.exam.secondsLeft--;
      const timerEl = document.getElementById('exam-timer');
      if (timerEl) timerEl.textContent = formatTime(Math.max(0, state.exam.secondsLeft));
      if (state.exam.secondsLeft <= 0) {
        submitExam();
      }
    }, 1000);
    render();
  }

  function submitExam() {
    if (state.exam.timerId) {
      clearInterval(state.exam.timerId);
      state.exam.timerId = null;
    }
    let correct = 0;
    state.exam.items.forEach((q, idx) => {
      const picked = state.exam.answers[idx];
      const ok = picked === q.correctAnswer;
      if (ok) correct++;
      if (picked) {
        setMastery(q.id, ok ? 'mastered' : 'review_needed', ok);
      }
    });
    const total = state.exam.items.length || 1;
    const scorePercentage = Math.round((correct / total) * 100);
    const result = {
      id: 'EX-' + Date.now(),
      subject: state.exam.subject,
      totalQuestions: total,
      correctCount: correct,
      scorePercentage,
      createdAt: new Date().toISOString(),
    };
    state.exams.unshift(result);
    if (state.exams.length > 30) state.exams.length = 30;
    saveExams();
    state.exam.lastResult = result;
    state.exam.mode = 'review';
    render();
  }

  function renderExam() {
    if (state.exam.mode === 'setup') {
      return `
        <div class="max-w-3xl mx-auto space-y-6">
          <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div class="space-y-1">
              <h2 class="text-xl font-bold text-white flex items-center gap-2">
                <i data-lucide="timer" class="w-5 h-5 text-amber-400"></i>
                <span>Thiết lập bài thi thử EOS</span>
              </h2>
              <p class="text-xs text-slate-400">Câu hỏi được chọn ngẫu nhiên từ ngân hàng đề của môn học và tính giờ giống phòng thi thực tế.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-300">Môn thi</label>
                <select id="exam-subject" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white">
                  ${Object.keys(SUBJECT_META).map(c => `<option value="${c}" ${state.exam.subject === c ? 'selected' : ''}>${c}</option>`).join('')}
                  <option value="ALL" ${state.exam.subject === 'ALL' ? 'selected' : ''}>Tổng hợp tất cả môn</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-300">Số câu hỏi</label>
                <select id="exam-count" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white">
                  ${[10, 25, 40, 50, 60].map(n => `<option value="${n}" ${state.exam.count === n ? 'selected' : ''}>${n} câu</option>`).join('')}
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-300">Thời gian làm bài</label>
                <select id="exam-minutes" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white">
                  ${[15, 30, 45, 60].map(m => `<option value="${m}" ${state.exam.minutes === m ? 'selected' : ''}>${m} phút</option>`).join('')}
                </select>
              </div>
            </div>

            <button data-action="exam-start" class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2">
              <i data-lucide="play-circle" class="w-4 h-4"></i>
              <span>Bắt đầu làm bài ngay</span>
            </button>
          </div>

          ${state.exams.length > 0 ? `
            <div class="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 space-y-3">
              <h3 class="text-sm font-bold text-white">Lịch sử thi thử gần đây</h3>
              <div class="space-y-2">
                ${state.exams.slice(0, 8).map(ex => `
                  <div class="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-xs">
                    <div class="flex items-center gap-3">
                      <span class="font-mono font-bold text-indigo-400">${escapeHtml(ex.subject)}</span>
                      <span class="text-slate-400">${ex.correctCount}/${ex.totalQuestions} câu đúng</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="font-bold ${ex.scorePercentage >= 60 ? 'text-emerald-400' : 'text-rose-400'}">${ex.scorePercentage}%</span>
                      <span class="text-slate-500 text-[11px]">${new Date(ex.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    if (state.exam.mode === 'active') {
      const idx = state.exam.currentIndex;
      const q = state.exam.items[idx];
      const picked = state.exam.answers[idx];
      const answeredCount = Object.keys(state.exam.answers).length;

      return `
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div class="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div class="flex items-center justify-between border-b border-slate-800 pb-4">
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-bold text-indigo-400">Câu ${idx + 1} / ${state.exam.items.length}</span>
                <span class="text-xs text-slate-400">(${escapeHtml(q.id)})</span>
              </div>
              <button data-action="exam-flag" data-idx="${idx}" class="px-2.5 py-1 rounded-lg text-xs border ${state.exam.flagged.has(idx) ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400'}">
                ⚑ Đánh dấu xem lại
              </button>
            </div>

            <div class="space-y-4">
              <p class="text-base font-semibold text-white leading-relaxed whitespace-pre-wrap">${escapeHtml(q.questionText)}</p>
              ${q.codeSnippet && q.codeSnippet.trim() ? `<pre class="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-indigo-200 overflow-x-auto"><code>${escapeHtml(q.codeSnippet)}</code></pre>` : ''}
            </div>

            <div class="space-y-2.5">
              ${q.options.map(o => `
                <button data-action="exam-pick" data-idx="${idx}" data-key="${escapeHtml(o.key)}" class="w-full text-left p-4 rounded-xl border transition flex items-start gap-3 ${
                  picked === o.key
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }">
                  <span class="w-6 h-6 rounded-md border flex items-center justify-center text-xs font-bold shrink-0 ${
                    picked === o.key ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }">${escapeHtml(o.key)}</span>
                  <span class="text-sm whitespace-pre-wrap">${escapeHtml(o.text)}</span>
                </button>
              `).join('')}
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-slate-800">
              <button data-action="exam-goto" data-idx="${idx - 1}" ${idx === 0 ? 'disabled' : ''} class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-white">Câu trước</button>
              <button data-action="exam-goto" data-idx="${idx + 1}" ${idx >= state.exam.items.length - 1 ? 'disabled' : ''} class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-semibold text-white">Câu tiếp</button>
            </div>
          </div>

          <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-5 h-fit">
            <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
              <div class="text-xs text-slate-400">Thời gian còn lại</div>
              <div id="exam-timer" class="text-2xl font-mono font-extrabold text-amber-400 mt-1">${formatTime(state.exam.secondsLeft)}</div>
              <div class="text-[11px] text-slate-500 mt-1">Đã trả lời: ${answeredCount}/${state.exam.items.length}</div>
            </div>

            <div class="grid grid-cols-5 gap-1.5">
              ${state.exam.items.map((_, i) => {
                const isCur = i === idx;
                const isDone = Boolean(state.exam.answers[i]);
                const isFlag = state.exam.flagged.has(i);
                let cls = 'bg-slate-950 border-slate-800 text-slate-400';
                if (isDone) cls = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
                if (isFlag) cls = 'bg-amber-500/20 border-amber-500/40 text-amber-300';
                if (isCur) cls += ' ring-2 ring-indigo-500';
                return `<button data-action="exam-goto" data-idx="${i}" class="h-8 rounded-lg border text-xs font-mono font-semibold ${cls}">${i + 1}</button>`;
              }).join('')}
            </div>

            <button data-action="exam-submit" class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition">
              Nộp bài &amp; Chấm điểm
            </button>
          </div>
        </div>
      `;
    }

    const res = state.exam.lastResult;
    const passed = res.scorePercentage >= 60;
    return `
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-1">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">
              ${passed ? 'ĐẠT YÊU CẦU (PASS)' : 'CHƯA ĐẠT — CẦN ÔN THÊM'}
            </span>
            <h2 class="text-2xl font-extrabold text-white pt-1">Kết quả: ${res.correctCount}/${res.totalQuestions} câu đúng (${res.scorePercentage}%)</h2>
          </div>
          <button data-action="exam-reset" class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">Làm bài thi mới</button>
        </div>

        <div class="space-y-3">
          ${state.exam.items.map((q, i) => {
            const picked = state.exam.answers[i];
            const ok = picked === q.correctAnswer;
            return `
              <div class="bg-slate-900/80 border rounded-2xl p-5 space-y-3 ${ok ? 'border-emerald-500/30' : 'border-rose-500/30'}">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-mono font-bold text-slate-300">Câu ${i + 1} (${escapeHtml(q.id)})</span>
                  <span class="font-bold ${ok ? 'text-emerald-400' : 'text-rose-400'}">
                    ${ok ? '✓ Đúng' : `✗ Sai (Bạn chọn: ${picked || 'Bỏ trống'} | Đáp án: ${escapeHtml(q.correctAnswer)})`}
                  </span>
                </div>
                <p class="text-sm text-white whitespace-pre-wrap">${escapeHtml(q.questionText)}</p>
                <div class="text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-xl p-3 whitespace-pre-wrap">
                  <strong class="text-emerald-400">Giải thích:</strong> ${escapeHtml(q.explanation || 'Không có')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function render() {
    updateNavbar();
    const root = document.getElementById('app-root');
    const route = getCurrentRoute();
    if (route === '/study') root.innerHTML = renderStudy();
    else if (route === '/flashcards') root.innerHTML = renderFlashcards();
    else if (route === '/questions') root.innerHTML = renderQuestionBank();
    else if (route === '/exam') root.innerHTML = renderExam();
    else root.innerHTML = renderDashboard();

    if (window.lucide) window.lucide.createIcons();
    attachDynamicEvents();
  }

  function attachDynamicEvents() {
    const studySub = document.getElementById('study-subject');
    if (studySub) studySub.onchange = e => { state.study.subject = e.target.value; state.study.topic = 'ALL'; state.study.index = 0; state.study.selectedOption = null; state.study.showExplanation = false; render(); };
    const studyTopic = document.getElementById('study-topic');
    if (studyTopic) studyTopic.onchange = e => { state.study.topic = e.target.value; state.study.index = 0; state.study.selectedOption = null; state.study.showExplanation = false; render(); };
    const studyDiff = document.getElementById('study-difficulty');
    if (studyDiff) studyDiff.onchange = e => { state.study.difficulty = e.target.value; state.study.index = 0; state.study.selectedOption = null; render(); };
    const studyBm = document.getElementById('study-bookmarked');
    if (studyBm) studyBm.onchange = e => { state.study.onlyBookmarked = e.target.checked; state.study.index = 0; state.study.selectedOption = null; render(); };

    const fcSub = document.getElementById('fc-subject');
    if (fcSub) fcSub.onchange = e => { state.flashcards.subject = e.target.value; state.flashcards.topic = 'ALL'; state.flashcards.index = 0; state.flashcards.flipped = false; state.flashcards.shuffledOrder = null; render(); };
    const fcTopic = document.getElementById('fc-topic');
    if (fcTopic) fcTopic.onchange = e => { state.flashcards.topic = e.target.value; state.flashcards.index = 0; state.flashcards.flipped = false; state.flashcards.shuffledOrder = null; render(); };

    const bankSearch = document.getElementById('bank-search');
    if (bankSearch) {
      bankSearch.oninput = e => {
        state.bank.query = e.target.value;
        state.bank.page = 1;
        render();
        const el = document.getElementById('bank-search');
        if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
      };
    }
    const bankSub = document.getElementById('bank-subject');
    if (bankSub) bankSub.onchange = e => { state.bank.subject = e.target.value; state.bank.topic = 'ALL'; state.bank.page = 1; render(); };
    const bankTopic = document.getElementById('bank-topic');
    if (bankTopic) bankTopic.onchange = e => { state.bank.topic = e.target.value; state.bank.page = 1; render(); };
    const bankDiff = document.getElementById('bank-difficulty');
    if (bankDiff) bankDiff.onchange = e => { state.bank.difficulty = e.target.value; state.bank.page = 1; render(); };
    const bankStatus = document.getElementById('bank-status');
    if (bankStatus) bankStatus.onchange = e => { state.bank.filterStatus = e.target.value; state.bank.page = 1; render(); };

    const exSub = document.getElementById('exam-subject');
    if (exSub) exSub.onchange = e => { state.exam.subject = e.target.value; };
    const exCount = document.getElementById('exam-count');
    if (exCount) exCount.onchange = e => { state.exam.count = Number(e.target.value); };
    const exMin = document.getElementById('exam-minutes');
    if (exMin) exMin.onchange = e => { state.exam.minutes = Number(e.target.value); };
  }

  document.addEventListener('click', e => {
    const routeEl = e.target.closest('[data-route]');
    if (routeEl) {
      e.preventDefault();
      navigate(routeEl.getAttribute('data-route'));
      return;
    }

    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.getAttribute('data-action');

    if (action === 'select-subject') {
      state.selectedSubject = actionEl.getAttribute('data-subject');
      render();
    } else if (action === 'bookmark') {
      toggleBookmark(actionEl.getAttribute('data-id'));
    } else if (action === 'study-pick') {
      const list = getStudyQuestions();
      const q = list[state.study.index];
      const key = actionEl.getAttribute('data-key');
      state.study.selectedOption = key;
      state.study.showExplanation = true;
      if (q) setMastery(q.id, key === q.correctAnswer ? 'mastered' : 'review_needed', key === q.correctAnswer);
      render();
    } else if (action === 'study-prev') {
      if (state.study.index > 0) {
        state.study.index--;
        state.study.selectedOption = null;
        state.study.showExplanation = false;
        render();
      }
    } else if (action === 'study-next') {
      const list = getStudyQuestions();
      if (state.study.index < list.length - 1) {
        state.study.index++;
        state.study.selectedOption = null;
        state.study.showExplanation = false;
        render();
      }
    } else if (action === 'study-toggle-exp') {
      state.study.showExplanation = !state.study.showExplanation;
      render();
    } else if (action === 'toggle-slide-panel') {
      state.study.showSlidePanel = !state.study.showSlidePanel;
      render();
    } else if (action === 'study-mark') {
      const id = actionEl.getAttribute('data-id');
      const status = actionEl.getAttribute('data-status');
      setMastery(id, status, status === 'mastered');
      render();
    } else if (action === 'study-reset-filters') {
      state.study.topic = 'ALL';
      state.study.difficulty = 'ALL';
      state.study.onlyBookmarked = false;
      state.study.index = 0;
      render();
    } else if (action === 'fc-flip') {
      state.flashcards.flipped = !state.flashcards.flipped;
      render();
    } else if (action === 'fc-prev') {
      if (state.flashcards.index > 0) {
        state.flashcards.index--;
        state.flashcards.flipped = false;
        render();
      }
    } else if (action === 'fc-next') {
      const list = getFlashcardList();
      if (state.flashcards.index < list.length - 1) {
        state.flashcards.index++;
        state.flashcards.flipped = false;
        render();
      }
    } else if (action === 'fc-shuffle') {
      const baseCount = state.questions.filter(q =>
        (state.flashcards.subject === 'ALL' || q.subject === state.flashcards.subject) &&
        (state.flashcards.topic === 'ALL' || q.topic === state.flashcards.topic)
      ).length;
      const order = Array.from({ length: baseCount }, (_, i) => i).sort(() => Math.random() - 0.5);
      state.flashcards.shuffledOrder = order;
      state.flashcards.index = 0;
      state.flashcards.flipped = false;
      render();
    } else if (action === 'fc-rate') {
      const id = actionEl.getAttribute('data-id');
      const status = actionEl.getAttribute('data-status');
      setMastery(id, status, status === 'mastered');
      const list = getFlashcardList();
      if (state.flashcards.index < list.length - 1) state.flashcards.index++;
      state.flashcards.flipped = false;
      render();
    } else if (action === 'bank-toggle') {
      const id = actionEl.getAttribute('data-id');
      if (state.bank.expandedIds.has(id)) state.bank.expandedIds.delete(id);
      else state.bank.expandedIds.add(id);
      render();
    } else if (action === 'bank-page') {
      state.bank.page = Number(actionEl.getAttribute('data-page'));
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'exam-start') {
      startExam();
    } else if (action === 'exam-pick') {
      const idx = Number(actionEl.getAttribute('data-idx'));
      state.exam.answers[idx] = actionEl.getAttribute('data-key');
      render();
    } else if (action === 'exam-flag') {
      const idx = Number(actionEl.getAttribute('data-idx'));
      if (state.exam.flagged.has(idx)) state.exam.flagged.delete(idx);
      else state.exam.flagged.add(idx);
      render();
    } else if (action === 'exam-goto') {
      const idx = Number(actionEl.getAttribute('data-idx'));
      if (idx >= 0 && idx < state.exam.items.length) {
        state.exam.currentIndex = idx;
        render();
      }
    } else if (action === 'exam-submit') {
      submitExam();
    } else if (action === 'exam-reset') {
      state.exam.mode = 'setup';
      render();
    }
  });

  document.addEventListener('keydown', e => {
    if (getCurrentRoute() !== '/flashcards') return;
    if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.code === 'Space') {
      e.preventDefault();
      state.flashcards.flipped = !state.flashcards.flipped;
      render();
    } else if (e.code === 'ArrowRight') {
      const list = getFlashcardList();
      if (state.flashcards.index < list.length - 1) {
        state.flashcards.index++;
        state.flashcards.flipped = false;
        render();
      }
    } else if (e.code === 'ArrowLeft') {
      if (state.flashcards.index > 0) {
        state.flashcards.index--;
        state.flashcards.flipped = false;
        render();
      }
    }
  });

  window.addEventListener('popstate', () => {
    syncFromQuery();
    render();
  });

  async function init() {
    loadLocalState();
    renderSnow();

    const snowBtn = document.getElementById('btn-toggle-snow');
    if (snowBtn) {
      snowBtn.onclick = () => {
        state.snowEnabled = !state.snowEnabled;
        localStorage.setItem(SNOW_KEY, String(state.snowEnabled));
        renderSnow();
      };
    }

    const resetBtn = document.getElementById('btn-reset-progress');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (!confirm('Xóa toàn bộ tiến độ đánh dấu, câu đã thuộc và lịch sử thi?')) return;
        state.progress = {};
        state.exams = [];
        saveProgress();
        saveExams();
        render();
      };
    }

    try {
      const res = await fetch('/data/questions.json');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      state.questions = await res.json();
      const bannerEl = document.getElementById('banner-count');
      if (bannerEl) bannerEl.textContent = state.questions.length.toLocaleString();
      syncFromQuery();
      render();
    } catch (err) {
      document.getElementById('app-root').innerHTML = `
        <div class="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-8 text-center space-y-2 max-w-lg mx-auto mt-10">
          <h2 class="text-base font-bold text-rose-300">Không thể nạp dữ liệu câu hỏi</h2>
          <p class="text-xs text-slate-300">Lỗi: ${escapeHtml(err.message)}. Hãy đảm bảo bạn đang chạy qua HTTP server (Localhost hoặc Vercel).</p>
        </div>
      `;
    }
  }

  init();
})();
