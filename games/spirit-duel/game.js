// ==================== 사운드 엔진 (Web Audio API) ====================
const SFX = (() => {
  let ctx = null;
  let masterGain = null;
  let vol = 1;         // 0 = mute, 0.5 = half, 1 = full
  let noiseBuf = null; // 1s white noise, generated once — any slice is valid noise
  const MASTER = 0.35;

  // D Dorian (D E F G A B C). N(deg): 0 = D4 293.66Hz, ±7 = octave. 모든 SFX 음정은 이 스케일에서만 고름 → 소리끼리 화음 충돌 없음
  const DORIAN = [0, 2, 3, 5, 7, 9, 10];
  const N = deg => 293.66 * 2 ** ((DORIAN[((deg % 7) + 7) % 7] + 12 * Math.floor(deg / 7)) / 12);

  function getCtx() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = ctx.createGain();
        masterGain.gain.value = MASTER * vol;
        // 리미터: 단일 SFX 피크(≤ -13dBFS)는 안 건드리고, 블록+카운터+히트 겹칠 때만 눌러줌
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -12; comp.knee.value = 6; comp.ratio.value = 8;
        comp.attack.value = 0.002; comp.release.value = 0.12;
        masterGain.connect(comp);
        comp.connect(ctx.destination);
      } catch(e) {
        console.warn('Web Audio 미지원');
        return null;
      }
    }
    if (ctx.state !== 'running') ctx.resume(); // iOS: 통화/백그라운드 후 'interrupted' 상태도 복구
    return ctx;
  }

  // ADSR 지점을 시간순으로 고정: attack+decay 가 dur-release 를 넘으면 decay 를 잘라냄.
  // 안 그러면 fade-out 뒤에 게인이 다시 튀어올라 osc.stop 에서 딱 소리(클릭) 남.
  function envelope(g, now, dur, vol, attack, decay, sustain, release) {
    const end = now + dur;
    const peakAt = now + attack;
    const relAt = Math.max(peakAt, end - release);
    const decAt = Math.min(peakAt + decay, relAt);
    const sus = decAt > peakAt ? vol * sustain : vol;
    g.setValueAtTime(0, now);
    g.linearRampToValueAtTime(vol, peakAt);
    g.linearRampToValueAtTime(sus, decAt);
    g.setValueAtTime(sus, relAt);
    g.linearRampToValueAtTime(0, end);
  }

  function tone(opts) {
    if (!vol) return;
    const c = getCtx();
    if (!c) return;
    const {
      freq = 440, type = 'sine', dur = 0.2, vol: v = 0.3,
      attack = 0.005, decay = 0.05, sustain = 0.7, release = 0.1,
      freqEnd = null, detune = 0, filter = null, delay = 0
    } = opts;

    const now = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), now + dur);
    }
    osc.detune.value = detune;
    envelope(gain.gain, now, dur, v, attack, decay, sustain, release);

    let dest = gain;
    if (filter) {
      const f = c.createBiquadFilter();
      f.type = filter.type || 'lowpass';
      f.frequency.value = filter.freq || 1000;
      f.Q.value = filter.q || 1;
      gain.connect(f);
      dest = f;
    }

    osc.connect(gain);
    dest.connect(masterGain);
    osc.start(now);
    osc.stop(now + dur + 0.05);
  }

  function noise(opts) {
    if (!vol) return;
    const c = getCtx();
    if (!c) return;
    const {
      dur = 0.2, vol: v = 0.2,
      filterFreq = 800, filterFreqEnd = null, filterType = 'bandpass', filterQ = 1,
      attack = 0.005, release = 0.1, delay = 0
    } = opts;

    const now = c.currentTime + delay;
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }

    const src = c.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true; // dur 은 항상 1s 미만이지만 안전망

    const filt = c.createBiquadFilter();
    filt.type = filterType;
    filt.frequency.setValueAtTime(filterFreq, now);
    if (filterFreqEnd !== null) {
      filt.frequency.exponentialRampToValueAtTime(Math.max(30, filterFreqEnd), now + dur);
    }
    filt.Q.value = filterQ;

    const gain = c.createGain();
    envelope(gain.gain, now, dur, v, attack, 0, 1, release);

    src.connect(filt);
    filt.connect(gain);
    gain.connect(masterGain);
    src.start(now);
    src.stop(now + dur + 0.05);
  }

  // 톱니파는 고역이 거칠어서 lowpass 로 다듬음
  const SAW_LP = { type: 'lowpass', freq: 1800, q: 0.7 };

  return {
    setVolume(v) { vol = v; if (masterGain) masterGain.gain.value = MASTER * v; },
    init() { getCtx(); },

    // ── UI ──
    uiClick() { tone({ freq: N(11), type: 'triangle', dur: 0.05, vol: 0.15, attack: 0.001, release: 0.03 }); },            // A5
    uiSlot() {
      tone({ freq: N(8), type: 'sine', dur: 0.08, vol: 0.2, attack: 0.002, release: 0.05 });                               // E5
      tone({ freq: N(12), type: 'sine', dur: 0.1, vol: 0.1, attack: 0.002, release: 0.06, delay: 0.02 });                  // B5
    },
    uiUndo() { tone({ freq: N(4), freqEnd: N(0), type: 'triangle', dur: 0.12, vol: 0.15, release: 0.08 }); },             // A4 → D4
    uiConfirm() {
      tone({ freq: N(11), type: 'sine', dur: 0.1, vol: 0.18 });                                                            // A5
      tone({ freq: N(14), type: 'sine', dur: 0.14, vol: 0.18, delay: 0.06 });                                              // D6
    },
    // ── 전투 ──
    sfxMove() { noise({ dur: 0.2, vol: 0.22, filterType: 'bandpass', filterFreq: 400, filterFreqEnd: 1200, filterQ: 2, release: 0.1 }); },
    sfxAttack() {
      noise({ dur: 0.18, vol: 0.22, filterType: 'bandpass', filterFreq: 2000, filterFreqEnd: 4000, filterQ: 2, release: 0.08 });
      tone({ freq: N(14), freqEnd: N(3), type: 'sawtooth', dur: 0.12, vol: 0.08, release: 0.08, delay: 0.02, filter: SAW_LP }); // D6 → G4
    },
    sfxBlock() {
      tone({ freq: N(15), type: 'sine', dur: 0.3, vol: 0.16, attack: 0.001, release: 0.2 });                               // E6
      tone({ freq: N(18), type: 'sine', dur: 0.25, vol: 0.1, attack: 0.001, release: 0.2, delay: 0.01 });                  // A6
      noise({ dur: 0.05, vol: 0.15, filterType: 'highpass', filterFreq: 3000, filterQ: 1, release: 0.03 });
    },
    sfxCounter() {
      tone({ freq: N(-4), freqEnd: N(-14), type: 'sawtooth', dur: 0.2, vol: 0.25, release: 0.12, filter: SAW_LP });       // G3 → D2
      tone({ freq: N(17), freqEnd: N(7), type: 'triangle', dur: 0.18, vol: 0.18, release: 0.1, delay: 0.02 });             // G6 → D5
      noise({ dur: 0.1, vol: 0.2, filterType: 'bandpass', filterFreq: 1500, filterQ: 2, delay: 0.02 });
    },
    sfxHit() {
      tone({ freq: N(-7), freqEnd: N(-14), type: 'sawtooth', dur: 0.18, vol: 0.28, attack: 0.001, release: 0.12, filter: SAW_LP }); // D3 → D2
      noise({ dur: 0.12, vol: 0.2, filterType: 'lowpass', filterFreq: 600, filterQ: 1, release: 0.08 });
    },
    sfxMiss() { noise({ dur: 0.22, vol: 0.1, filterType: 'highpass', filterFreq: 1500, filterQ: 1, release: 0.12 }); },
    sfxCornerDmg() {
      // 저음은 triangle: 80Hz sine 은 폰 스피커에서 안 들림, 배음 있어야 존재감 생김
      tone({ freq: N(-7), freqEnd: N(-14), type: 'triangle', dur: 0.4, vol: 0.22, attack: 0.05, release: 0.25 });         // D3 → D2
      tone({ freq: N(18), type: 'sine', dur: 0.35, vol: 0.1, release: 0.25, delay: 0.05 });                                // A6
      tone({ freq: N(21), type: 'sine', dur: 0.3, vol: 0.07, release: 0.22, delay: 0.1 });                                 // D7
    },
    // ── 흐름 ──
    sfxTurnStart() {
      tone({ freq: N(7), type: 'sine', dur: 0.12, vol: 0.18 });                                                            // D5
      tone({ freq: N(11), type: 'sine', dur: 0.18, vol: 0.14, delay: 0.05 });                                              // A5
    },
    sfxDrawTick(isP1) { tone({ freq: isP1 ? N(15) : N(13), type: 'triangle', dur: 0.04, vol: 0.12, attack: 0.001, release: 0.02 }); }, // E6 / C6 — 깜빡이는 쪽 음
    sfxDrawComplete(isP1) {
      const d = isP1 ? 8 : 6;                                                                                              // E5 / C5 + 5도 + 옥타브
      tone({ freq: N(d), type: 'sine', dur: 0.8, vol: 0.3, attack: 0.005, release: 0.5 });
      tone({ freq: N(d + 4), type: 'sine', dur: 0.8, vol: 0.2, release: 0.5, delay: 0.05 });
      tone({ freq: N(d + 7), type: 'sine', dur: 0.7, vol: 0.12, release: 0.5, delay: 0.1 });
    },
    sfxRoundWin() {
      [7, 9, 11].forEach((deg, i) => {                                                                                     // D5 F5 A5 (i 화음)
        tone({ freq: N(deg), type: 'sine', dur: 0.5 + i * 0.03, vol: 0.2, release: 0.3, delay: i * 0.08 });
      });
    },
    sfxRoundDraw() {
      tone({ freq: N(1), type: 'sine', dur: 0.8, vol: 0.2, release: 0.5 });                                                // E4
      tone({ freq: N(-2), type: 'sine', dur: 0.8, vol: 0.15, release: 0.5, delay: 0.05 });                                 // B3 — 미해결 4도
    },
    sfxPipWin() {
      tone({ freq: N(18), type: 'sine', dur: 0.2, vol: 0.14, attack: 0.001, release: 0.15 });                              // A6
      tone({ freq: N(22), type: 'sine', dur: 0.15, vol: 0.07, release: 0.1, delay: 0.04 });                                // E7
    },
    sfxMatchWin() {
      [7, 9, 11, 12, 14].forEach((deg, i) => {                                                                             // D5 F5 A5 B5 D6 — 도리안 6도 포함
        tone({ freq: N(deg), type: 'sine', dur: 1.6, vol: 0.16, attack: 0.01, release: 1.2, delay: i * 0.08 });
      });
      tone({ freq: N(0), type: 'triangle', dur: 1.8, vol: 0.14, release: 1.4, delay: 0.02 });                              // D4 베이스
    }
  };
})();

// 볼륨: 슬라이더(레벨) + 버튼(음소거). 둘 다 localStorage 에 기억
const soundToggle = document.getElementById('soundToggle');
const volSlider = document.getElementById('volSlider');
let volLevel = 1, volMuted = false;
try {
  const v = parseFloat(localStorage.getItem('sd_vol'));
  if (v >= 0 && v <= 1) volLevel = v;
  volMuted = localStorage.getItem('sd_mute') === '1';
} catch (e) {}
function applyVolume() {
  const eff = volMuted ? 0 : volLevel;
  SFX.setVolume(eff);
  volSlider.value = Math.round(volLevel * 100);
  soundToggle.classList.toggle('half', eff > 0 && eff < 0.5);
  soundToggle.classList.toggle('muted', eff === 0);
  try {
    localStorage.setItem('sd_vol', String(volLevel));
    localStorage.setItem('sd_mute', volMuted ? '1' : '0');
  } catch (e) {}
}
applyVolume();
soundToggle.addEventListener('click', () => {
  const silent = volMuted || volLevel === 0;
  volMuted = !silent;
  if (silent && volLevel === 0) volLevel = 1; // 슬라이더 0 상태에서 켜면 최대로
  applyVolume();
  if (!volMuted) {
    SFX.init();
    SFX.uiClick();
  }
});
volSlider.addEventListener('input', () => {
  volLevel = volSlider.value / 100;
  volMuted = false;
  applyVolume();
});
volSlider.addEventListener('change', () => { SFX.init(); SFX.uiClick(); }); // 놓을 때 레벨 미리듣기

const UNLOCK_EVENTS = ['click', 'keydown', 'touchstart'];
const unlockAudio = () => {
  SFX.init();
  UNLOCK_EVENTS.forEach(ev => document.removeEventListener(ev, unlockAudio));
};
UNLOCK_EVENTS.forEach(ev => document.addEventListener(ev, unlockAudio));

// ==================== 규칙 모달 ====================
const helpToggle = document.getElementById('helpToggle');
const helpModal = document.getElementById('helpModal');
const helpClose = document.getElementById('helpClose');

helpToggle.addEventListener('click', () => {
  SFX.uiClick();
  helpModal.classList.add('show');
});
helpClose.addEventListener('click', () => {
  SFX.uiClick();
  helpModal.classList.remove('show');
});
helpModal.addEventListener('click', (e) => {
  if (e.target === helpModal) {
    SFX.uiClick();
    helpModal.classList.remove('show');
  }
});

// ==================== 언어 토글 ====================
const langToggle = document.getElementById('langToggle');
langToggle.addEventListener('click', () => {
  SFX.uiClick();
  const locales = Object.keys(I18N);
  const next = locales[(locales.indexOf(getLocale()) + 1) % locales.length];
  setLocale(next);
  try { localStorage.setItem('sd_locale', next); } catch (e) {}
});

// 로케일이 바뀔 때 동적 뷰 재렌더 (i18n.js가 호출)
function onLocaleChanged() {
  // 슬롯/턴 라벨/구석 상태/커튼/페널티 등을 다시 그림
  if (typeof renderAll === 'function') renderAll();
}

// ==================== 게임 상태 ====================
const BOARD_SIZE = 9;
const MAX_HP = 4;
const MATCH_WIN = 2;
const MAX_ROUNDS = 5;
const DECISIVE_ROUND = 3;
const START_POS_P1 = 2; // 셀 3 (0-indexed)
const START_POS_P2 = 6; // 셀 7 (0-indexed)

const SAFE_CELLS = [3, 4, 5]; // 셀 4·5·6 — 영구 안전
const STARDUST_EXPANSION = [
  { turn: 4, cells: [1, 7] },
  { turn: 7, cells: [2, 6] }
];

const state = {
  round: 1,
  matchScore: { 1: 0, 2: 0 },
  firstPlayer: 1,
  turn: 1,
  phase: 'first_input',
  players: {
    1: { hp: MAX_HP, pos: START_POS_P1, actions: [], penalty: 0, cornerTurns: 0, stars: 0 },
    2: { hp: MAX_HP, pos: START_POS_P2, actions: [], penalty: 0, cornerTurns: 0, stars: 0 }
  },
  currentPlayer: 1,
  inputLocked: false,
  vsAI: false,
  humanPid: 1,
  aiDifficulty: 'normal'
};

// ==================== DOM 초기화 ====================
const board = document.getElementById('board');
const turnCounter = document.getElementById('turnCounter');
const turnLabel = document.getElementById('turnLabel');
const inputPanel = document.getElementById('inputPanel');
const slot1El = document.getElementById('slot1');
const slot2El = document.getElementById('slot2');
const slot3El = document.getElementById('slot3');
const slot3Wrap = document.getElementById('slot3Wrap');
const undoBtn = document.getElementById('undoBtn');
const confirmBtn = document.getElementById('confirmBtn');
const curtain = document.getElementById('curtain');
const curtainTitle = document.getElementById('curtainTitle');
const curtainBtn = document.getElementById('curtainBtn');
const curtainDefault = document.getElementById('curtainDefault');
const curtainDraw = document.getElementById('curtainDraw');
const curtainRound = document.getElementById('curtainRound');
const curtainSetup = document.getElementById('curtainSetup');
const setupP1 = document.getElementById('setupP1');
const setupP2 = document.getElementById('setupP2');
const setupResult = document.getElementById('setupResult');
const drawP1 = document.getElementById('drawP1');
const drawP2 = document.getElementById('drawP2');
const drawResult = document.getElementById('drawResult');
const drawTitle = document.getElementById('drawTitle');
const roundBadge = document.getElementById('roundBadge');
const roundWinnerTitle = document.getElementById('roundWinnerTitle');
const roundScoreP1 = document.getElementById('roundScoreP1');
const roundScoreP2 = document.getElementById('roundScoreP2');
const roundNextInfo = document.getElementById('roundNextInfo');
const fxLayer = document.getElementById('fxLayer');
const endmodal = document.getElementById('endmodal');
const winnerText = document.getElementById('winnerText');
const winnerName = document.getElementById('winnerName');
const finalScoreP1 = document.getElementById('finalScoreP1');
const finalScoreP2 = document.getElementById('finalScoreP2');
const restartBtn = document.getElementById('restartBtn');
const p1Card = document.getElementById('p1Card');
const p2Card = document.getElementById('p2Card');
const p1Pen = document.getElementById('p1Pen');
const p2Pen = document.getElementById('p2Pen');
const p1Pips = document.getElementById('p1Pips');
const p2Pips = document.getElementById('p2Pips');
const p1StarsEl = document.getElementById('p1Stars');
const p2StarsEl = document.getElementById('p2Stars');
const roundLabelEl = document.getElementById('roundLabel');
const actionBtns = Array.from(document.querySelectorAll('.action-btn'));

// 보드 셀 생성
for (let i = 0; i < BOARD_SIZE; i++) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.dataset.idx = i;
  const num = document.createElement('span');
  num.className = 'cell-num';
  num.textContent = String(i+1).padStart(2,'0');
  cell.appendChild(num);
  board.appendChild(cell);
}
const cells = Array.from(board.children).filter(el => el.classList.contains('cell'));

// 정령 토큰 (룬 심볼)
const RUNE_P1 = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#1a1525" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="42" stroke-opacity="0.35"/>
    <circle cx="50" cy="50" r="30" stroke-opacity="0.5"/>
    <path d="M50 28 L66 56 L34 56 Z"/>
    <path d="M36 46 Q42 41, 50 46 T64 46" stroke-width="2.5"/>
    <path d="M38 52 Q44 47, 50 52 T62 52" stroke-width="2" stroke-opacity="0.7"/>
    <circle cx="50" cy="12" r="2" fill="#1a1525"/>
    <circle cx="50" cy="88" r="2" fill="#1a1525"/>
    <circle cx="12" cy="50" r="2" fill="#1a1525"/>
    <circle cx="88" cy="50" r="2" fill="#1a1525"/>
  </g>
</svg>`;

const RUNE_P2 = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#1a1525" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="50" cy="50" r="42" stroke-opacity="0.35"/>
    <path d="M50 22 L72 50 L50 78 L28 50 Z"/>
    <path d="M50 38 L60 50 L50 62 L40 50 Z" stroke-width="2.5"/>
    <circle cx="50" cy="50" r="3" fill="#1a1525"/>
    <line x1="50" y1="8" x2="50" y2="18" stroke-width="2.5"/>
    <line x1="50" y1="82" x2="50" y2="92" stroke-width="2.5"/>
    <line x1="8" y1="50" x2="18" y2="50" stroke-width="2.5"/>
    <line x1="82" y1="50" x2="92" y2="50" stroke-width="2.5"/>
    <line x1="22" y1="22" x2="28" y2="28" stroke-width="1.5" stroke-opacity="0.6"/>
    <line x1="78" y1="22" x2="72" y2="28" stroke-width="1.5" stroke-opacity="0.6"/>
    <line x1="22" y1="78" x2="28" y2="72" stroke-width="1.5" stroke-opacity="0.6"/>
    <line x1="78" y1="78" x2="72" y2="72" stroke-width="1.5" stroke-opacity="0.6"/>
  </g>
</svg>`;

const spirit1 = document.createElement('div');
spirit1.className = 'spirit spirit-1';
spirit1.innerHTML = RUNE_P1;
const spirit2 = document.createElement('div');
spirit2.className = 'spirit spirit-2';
spirit2.innerHTML = RUNE_P2;

drawP1.innerHTML = RUNE_P1;
drawP2.innerHTML = RUNE_P2;
setupP1.innerHTML = RUNE_P1;
setupP2.innerHTML = RUNE_P2;

// ==================== 액션 정의 ====================
const ACTIONS = {
  moveL:     { nameKey: 'action.advance',   icon: '◀' },
  moveR:     { nameKey: 'action.retreat',   icon: '▶' },
  attack:    { nameKey: 'action.attack',    icon: '✦' },
  block:     { nameKey: 'action.block',     icon: '◈' },
  counter:   { nameKey: 'action.counter',   icon: '⟁' },
  pierce:    { nameKey: 'action.pierce',    icon: '✹' },
  ranged:    { nameKey: 'action.ranged',    icon: '≋' },
  leap:      { nameKey: 'action.leap',      icon: '↷' },
  leap_hold: { nameKey: 'action.leap_hold', icon: '╌' }
};

function actionName(a) { return t(ACTIONS[a].nameKey); }

const STAR_CAP = 2;
const PIERCE_COST = 2;

function getMaxActions(round) { return round === DECISIVE_ROUND ? 3 : 2; }

// ==================== 렌더링 ====================
function renderBoard() {
  cells[state.players[1].pos].appendChild(spirit1);
  cells[state.players[2].pos].appendChild(spirit2);
}

function renderHP() {
  for (const pid of [1,2]) {
    const container = document.getElementById(`p${pid}Hp`);
    container.innerHTML = '';
    for (let i = 0; i < MAX_HP; i++) {
      const h = document.createElement('span');
      h.className = 'heart' + (i < state.players[pid].hp ? '' : ' lost');
      container.appendChild(h);
    }
  }
}

function renderStars(justGainedPid) {
  let activePid = null;
  if (state.vsAI) {
    activePid = state.humanPid;
  } else if (state.phase === 'first_input') {
    activePid = state.firstPlayer;
  } else if (state.phase === 'second_input') {
    activePid = state.firstPlayer === 1 ? 2 : 1;
  }

  for (const pid of [1,2]) {
    const container = pid === 1 ? p1StarsEl : p2StarsEl;
    const prevCount = container.querySelectorAll('.star.filled').length;
    container.innerHTML = '';

    const hidden = pid !== activePid;
    const count = state.players[pid].stars;

    for (let i = 0; i < STAR_CAP; i++) {
      const s = document.createElement('span');
      if (hidden) {
        s.className = 'star hidden';
        container.appendChild(s);
        continue;
      }
      s.className = 'star';
      if (i < count) {
        s.classList.add('filled');
        if (count >= STAR_CAP) s.classList.add('full');
        // 최근 획득 별만 팝 애니메이션
        if (!(justGainedPid === pid && i >= prevCount)) s.style.animation = 'none';
      }
      container.appendChild(s);
    }
  }
}

function renderTurnInfo() {
  const newTurnText = t('ui.turn', { n: state.turn });
  if (turnCounter.textContent !== newTurnText) {
    turnCounter.textContent = newTurnText;
    turnCounter.classList.remove('tick');
    void turnCounter.offsetWidth;
    turnCounter.classList.add('tick');
  }
  roundLabelEl.textContent = state.round === DECISIVE_ROUND ? t('ui.roundDecisive') : t('ui.round', { n: state.round });
  roundLabelEl.classList.toggle('decisive', state.round === DECISIVE_ROUND);

  const expInfo = document.getElementById('expansionInfo');
  if (expInfo) {
    const next = getNextExpansionInfo(state.turn);
    if (next) {
      const cellNums = next.cells.map(c => c + 1).join('·');
      expInfo.textContent = next.turnsLeft === 1
        ? t('ui.expansion.imminent', { cells: cellNums })
        : t('ui.expansion.far', { n: next.turnsLeft, cells: cellNums });
      expInfo.classList.toggle('imminent', next.turnsLeft <= 1);
    } else {
      expInfo.textContent = t('ui.expansion.full');
      expInfo.classList.remove('imminent');
    }
  }

  let activePid = null;
  if (state.phase === 'first_input') activePid = state.firstPlayer;
  else if (state.phase === 'second_input') activePid = state.firstPlayer === 1 ? 2 : 1;

  p1Card.classList.toggle('active', activePid === 1);
  p2Card.classList.toggle('active', activePid === 2);

  p1Pen.textContent = state.players[1].penalty > 0 ? t('ui.penalty', { n: state.players[1].penalty }) : '';
  p2Pen.textContent = state.players[2].penalty > 0 ? t('ui.penalty', { n: state.players[2].penalty }) : '';

  const setTurnLabel = (text) => {
    if (turnLabel.textContent !== text) {
      turnLabel.textContent = text;
      turnLabel.classList.remove('flash');
      void turnLabel.offsetWidth;
      turnLabel.classList.add('flash');
    }
  };

  if (state.phase === 'first_input') {
    inputPanel.style.visibility = '';
    state.currentPlayer = state.firstPlayer;
    const pid = state.currentPlayer;
    inputPanel.className = 'input-panel ' + (pid === 1 ? 'p1-turn' : 'p2-turn');
    setTurnLabel(t('ui.turnLabel.first', { name: t(`player.${pid}`) }));
  } else if (state.phase === 'second_input') {
    inputPanel.style.visibility = '';
    state.currentPlayer = state.firstPlayer === 1 ? 2 : 1;
    const pid = state.currentPlayer;
    inputPanel.className = 'input-panel ' + (pid === 1 ? 'p1-turn' : 'p2-turn');
    setTurnLabel(t('ui.turnLabel.second', { name: t(`player.${pid}`) }));
  } else {
    inputPanel.style.visibility = 'hidden'; // 레이아웃 유지 — display:none 이면 보드가 점프
  }

  // 화살표 방향 - 상대 위치 기준 동적 결정
  const iconAdvance = document.getElementById('iconAdvance');
  const iconRetreat = document.getElementById('iconRetreat');
  {
    const cp = state.players[state.currentPlayer];
    const op = state.players[state.currentPlayer === 1 ? 2 : 1];
    const oppIsRight = op.pos > cp.pos;
    iconAdvance.textContent = oppIsRight ? '▶' : '◀';
    iconRetreat.textContent = oppIsRight ? '◀' : '▶';
  }

  renderSlots();
  renderStars(null);
}

function renderSlots() {
  const p = state.players[state.currentPlayer];
  const baseMax = getMaxActions(state.round);
  const maxActions = baseMax - p.penalty;

  if (baseMax >= 3) {
    slot3Wrap.style.display = '';
  } else {
    slot3Wrap.style.display = 'none';
  }

  const dist = Math.abs(state.players[1].pos - state.players[2].pos);
  // leap: 인접 + 슬롯 2 + 상대 뒤에 최소 1칸 자리. 별빛 영역도 허용.
  const cp = p; const op = state.players[state.currentPlayer === 1 ? 2 : 1];
  const leapDir = op.pos > cp.pos ? 1 : -1;
  const leapLand2 = cp.pos + leapDir * 3;
  const leapLand1 = cp.pos + leapDir * 2;
  const leapHasLanding =
    (leapLand2 >= 0 && leapLand2 < BOARD_SIZE) ||
    (leapLand1 >= 0 && leapLand1 < BOARD_SIZE);
  const canLeap = p.actions.length === 0 && maxActions >= 2 && dist === 1 && leapHasLanding;

  const slots = [slot1El, slot2El, slot3El];
  slots.forEach((el, idx) => {
    if (!el) return;
    if (idx >= baseMax) return;
    // data-action → CSS 가 액션 컬러(--ac) 적용
    const a = p.actions[idx] === 'leap_hold' ? 'leap' : p.actions[idx];
    if (a) el.dataset.action = a; else delete el.dataset.action;
    if (idx >= maxActions) {
      el.textContent = '✕';
      el.className = 'slot';
      el.style.opacity = '0.4';
    } else if (p.actions[idx] === 'leap_hold') {
      el.textContent = actionName('leap');
      el.className = 'slot filled leap-hold-slot';
      el.style.opacity = '0.4';
    } else if (p.actions[idx]) {
      el.textContent = actionName(p.actions[idx]);
      el.className = 'slot filled';
      el.style.opacity = '1';
    } else {
      el.textContent = '―';
      el.className = 'slot';
      el.style.opacity = '1';
    }
  });
  confirmBtn.disabled = p.actions.length < maxActions;

  const pierceAlreadyPicked = p.actions.includes('pierce');
  const starsAvailable = p.stars - (pierceAlreadyPicked ? PIERCE_COST : 0);
  const canUsePierce = starsAvailable >= PIERCE_COST;

  actionBtns.forEach(btn => {
    const action = btn.dataset.action;
    const slotFull = p.actions.length >= maxActions;
    if (action === 'pierce') {
      btn.disabled = slotFull || !canUsePierce;
      btn.classList.toggle('pierce-ready', canUsePierce && !slotFull);
    } else if (action === 'leap') {
      btn.disabled = !canLeap;
      btn.classList.toggle('leap-ready', canLeap);
    } else {
      btn.disabled = slotFull;
    }
  });
}

function pname(pid) {
  const name = t(`player.${pid}`);
  const cls = pid === 1 ? 'p1c' : 'p2c';
  return `<span class="${cls}">${name}</span>`;
}

// 보드 위 정령 머리 위에 짧은 효과 문구 (피해 / 막기 / 카운터 / 빗나감 등)
function floatText(pid, text, type = 'info') {
  const cell = cells[state.players[pid].pos];
  if (!cell) return;
  const el = document.createElement('div');
  el.className = `float-text float-${type}`;
  el.textContent = text;
  cell.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

// 결과 공개 — 보드 위 정령 머리 위에 액션 칩 등장 (보드 애니메이션 도중 노출)
function clearActionChips() {
  document.querySelectorAll('.action-chip-fx').forEach(el => el.remove());
}

function showActionChip(pid, action) {
  if (!action) return;
  const cell = cells[state.players[pid].pos];
  if (!cell) return;
  const cp = state.players[pid];
  const op = state.players[pid === 1 ? 2 : 1];
  const oppIsRight = op.pos > cp.pos;
  const dist = Math.abs(op.pos - cp.pos);

  let icon = ACTIONS[action] ? ACTIONS[action].icon : '·';
  if (action === 'moveL') icon = oppIsRight ? '▶' : '◀';
  if (action === 'moveR') icon = oppIsRight ? '◀' : '▶';

  const chip = document.createElement('div');
  chip.className = `action-chip-fx action-chip-fx-p${pid} action-chip-fx-${action}`;
  // 인접 (거리 1) 일 때 두 칩이 cell 경계 침범하며 겹침 → 상대 반대쪽으로 시프트
  if (dist === 1) {
    chip.style.setProperty('--shift-x', oppIsRight ? '-32px' : '32px');
  }
  chip.innerHTML = `
    <span class="acf-icon">${icon}</span>
    <span class="acf-name">${actionName(action)}</span>
  `;
  cell.appendChild(chip);
  setTimeout(() => chip.remove(), 1400);
}

function flashSpirit(pid) {
  const sp = pid === 1 ? spirit1 : spirit2;
  sp.classList.add('hit');
  setTimeout(() => sp.classList.remove('hit'), 400);
}

// ==================== 전투 시각 효과 ====================
function getCellRect(idx) {
  const cell = cells[idx];
  const boardRect = board.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();
  // .wrap 에 transform: scale 적용된 상태 — getBoundingClientRect 는 시각 좌표 반환.
  // 보드 내부의 absolute 자식은 layout(언스케일) 좌표 기준이므로 1/scale 로 환산.
  // fit() 이 inline style 로 세팅하므로 getComputedStyle(→ 강제 style recalc) 대신 inline 값을 읽음
  const scale = parseFloat(document.documentElement.style.getPropertyValue('--app-scale')) || 1;
  const inv = scale ? 1 / scale : 1;
  const left = (cellRect.left - boardRect.left) * inv;
  const top = (cellRect.top - boardRect.top) * inv;
  const width = cellRect.width * inv;
  const height = cellRect.height * inv;
  return {
    left, top, width, height,
    centerX: left + width / 2,
    centerY: top + height / 2
  };
}

function showSlashEffect(attackerPid, isPierce = false) {
  const attackerPos = state.players[attackerPid].pos;
  const targetPid = attackerPid === 1 ? 2 : 1;
  const targetPos = state.players[targetPid].pos;
  const direction = targetPos === attackerPos ? 1 : (targetPos > attackerPos ? 1 : -1);

  const aRect = getCellRect(attackerPos);
  const tRect = getCellRect(targetPos);

  const baseColor = isPierce ? '#e8c87a' : (attackerPid === 1 ? '#b5d4ee' : '#f0bb95');
  const baseRgba  = isPierce ? 'rgba(232,200,122,0.9)' : (attackerPid === 1 ? 'rgba(141,183,217,0.95)' : 'rgba(217,152,118,0.95)');

  // 1) 모션 트레일 — 3겹 슬래시 호 (지연 등장)
  for (let i = 0; i < 3; i++) {
    const slash = document.createElement('div');
    slash.className = 'fx-slash fx-slash-trail';
    const sizeMul = (isPierce ? 1.05 : 0.95) + i * 0.06;
    const size = aRect.width * sizeMul;
    const offsetX = aRect.width * 0.4 * direction;
    slash.style.left = (aRect.centerX - size / 2 + offsetX) + 'px';
    slash.style.top  = (aRect.centerY - size / 2) + 'px';
    slash.style.width  = size + 'px';
    slash.style.height = size + 'px';
    slash.style.animationDelay = `${i * 35}ms`;
    slash.style.opacity = String(1 - i * 0.22);

    const arcPath = direction > 0 ? `M 14 16 Q 92 50 14 84` : `M 86 16 Q 8 50 86 84`;
    const sw = isPierce ? 6 : 5 - i;
    const innerSw = Math.max(1, sw / 2.5);
    slash.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d="${arcPath}" stroke="${baseColor}" stroke-width="${sw + 9}" fill="none" stroke-linecap="round" opacity="0.12"/>
      <path d="${arcPath}" stroke="${baseColor}" stroke-width="${sw + 4}" fill="none" stroke-linecap="round" opacity="0.25"/>
      <path class="slash-line" d="${arcPath}" stroke="${baseColor}" stroke-width="${sw}" fill="none" stroke-linecap="round" opacity="0.95"/>
      <path class="slash-line" d="${arcPath}" stroke="#ffffff" stroke-width="${innerSw}" fill="none" stroke-linecap="round" opacity="0.95"/>
    </svg>`;
    fxLayer.appendChild(slash);
    setTimeout(() => slash.remove(), 600 + i * 35);
  }

  // 2) 충격 streak — attacker → target 빠른 흰빛 라인
  const dx = tRect.centerX - aRect.centerX;
  const dy = tRect.centerY - aRect.centerY;
  const lineLen = Math.hypot(dx, dy);
  if (lineLen > 4) {
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const streak = document.createElement('div');
    streak.className = 'fx-attack-streak' + (isPierce ? ' fx-attack-streak-pierce' : '');
    streak.style.left = aRect.centerX + 'px';
    streak.style.top  = aRect.centerY + 'px';
    streak.style.width = lineLen + 'px';
    streak.style.transform = `translate(0, -50%) rotate(${angle}deg)`;
    streak.style.background = `linear-gradient(90deg, transparent 0%, ${baseRgba} 30%, #ffffff 70%, transparent 100%)`;
    fxLayer.appendChild(streak);
    setTimeout(() => streak.remove(), 420);
  }

  // 3) 관통 시 — 골드 스파크 폭발 (attacker 손끝)
  if (isPierce) {
    spawnSparks(aRect.centerX + aRect.width * 0.35 * direction, aRect.centerY, '#e8c87a', 10, 36);
  }
}

// 방사형 스파크 파편
function spawnSparks(cx, cy, color, count = 8, dist = 28) {
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'fx-spark';
    const ang = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const r = dist * (0.6 + Math.random() * 0.7);
    s.style.left = cx + 'px';
    s.style.top  = cy + 'px';
    s.style.background = color;
    s.style.boxShadow = `0 0 8px ${color}, 0 0 14px ${color}`;
    s.style.setProperty('--spark-x', `${(Math.cos(ang) * r).toFixed(1)}px`);
    s.style.setProperty('--spark-y', `${(Math.sin(ang) * r).toFixed(1)}px`);
    s.style.animationDelay = `${i * 14}ms`;
    fxLayer.appendChild(s);
    setTimeout(() => s.remove(), 700);
  }
}

function showLightningArc(attackerPid) {
  const attackerPos = state.players[attackerPid].pos;
  // 상대 위치 기준 방향 — leap 후 자리 바뀌어도 정확히 상대 쪽으로 발사
  const targetPid = attackerPid === 1 ? 2 : 1;
  const targetPos = state.players[targetPid].pos;
  const direction = targetPos === attackerPos ? 1 : (targetPos > attackerPos ? 1 : -1);
  const targetCellIdx = attackerPos + direction * 2;

  const srcRect = getCellRect(attackerPos);

  const x1 = srcRect.centerX;
  const y1 = srcRect.centerY;

  let x2, y2;
  if (targetCellIdx >= 0 && targetCellIdx < BOARD_SIZE) {
    const dstRect = getCellRect(targetCellIdx);
    x2 = dstRect.centerX;
    y2 = dstRect.centerY;
  } else {
    x2 = x1 + direction * srcRect.width * 2;
    y2 = y1;
  }

  const minX = Math.min(x1, x2) - 40;
  const minY = Math.min(y1, y2) - 80;
  const maxX = Math.max(x1, x2) + 40;
  const maxY = Math.max(y1, y2) + 40;
  const width = maxX - minX;
  const height = maxY - minY;

  const container = document.createElement('div');
  container.className = 'fx-lightning';
  container.style.left = minX + 'px';
  container.style.top = minY + 'px';
  container.style.width = width + 'px';
  container.style.height = height + 'px';

  const lx1 = x1 - minX;
  const ly1 = y1 - minY;
  const lx2 = x2 - minX;
  const ly2 = y2 - minY;

  const midX = (lx1 + lx2) / 2;
  const archHeight = Math.abs(x2 - x1) * 0.35;
  const midY = Math.min(ly1, ly2) - archHeight;

  const segments = 7;
  function bezierPoint(tp) {
    const mt = 1 - tp;
    const px = mt * mt * lx1 + 2 * mt * tp * midX + tp * tp * lx2;
    const py = mt * mt * ly1 + 2 * mt * tp * midY + tp * tp * ly2;
    return { x: px, y: py };
  }

  function generatePath(jitter) {
    let d = `M ${lx1} ${ly1}`;
    for (let i = 1; i <= segments; i++) {
      const tp = i / segments;
      const pt = bezierPoint(tp);
      const offX = (Math.random() - 0.5) * jitter;
      const offY = (Math.random() - 0.5) * jitter;
      const finalX = i === segments ? lx2 : pt.x + offX;
      const finalY = i === segments ? ly2 : pt.y + offY;
      d += ` L ${finalX.toFixed(1)} ${finalY.toFixed(1)}`;
    }
    return d;
  }

  const color = attackerPid === 1 ? '#b5d4ee' : '#f0bb95';
  const glowColor = attackerPid === 1 ? 'rgba(141,183,217,0.9)' : 'rgba(217,152,118,0.9)';

  const path1 = generatePath(10);
  const path2 = generatePath(15);

  container.innerHTML = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="lightningGlow${attackerPid}" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path d="${path1}" stroke="${glowColor}" stroke-width="6" fill="none"
      stroke-linecap="round" stroke-linejoin="round" opacity="0.45"
      filter="url(#lightningGlow${attackerPid})"/>
    <path d="${path1}" stroke="${color}" stroke-width="2.5" fill="none"
      stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>
    <path d="${path2}" stroke="#ffffff" stroke-width="1.2" fill="none"
      stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
  </svg>`;

  fxLayer.appendChild(container);
  setTimeout(() => container.remove(), 500);
}

function showShieldEffect(pid) {
  const pos = state.players[pid].pos;
  const rect = getCellRect(pos);

  const size = rect.width * 0.85;
  const shield = document.createElement('div');
  shield.className = 'fx-shield';
  shield.style.left = (rect.centerX - size / 2) + 'px';
  shield.style.top = (rect.centerY - size / 2) + 'px';
  shield.style.width = size + 'px';
  shield.style.height = size + 'px';

  const color = pid === 1 ? '#b5d4ee' : '#f0bb95';
  shield.innerHTML = `<svg viewBox="0 0 100 100">
    <defs>
      <radialGradient id="shieldG${pid}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.1"/>
        <stop offset="70%" stop-color="${color}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0.6"/>
      </radialGradient>
    </defs>
    <polygon points="50,8 85,28 85,72 50,92 15,72 15,28"
      fill="url(#shieldG${pid})" stroke="${color}" stroke-width="2.5" opacity="0.85"/>
    <polygon points="50,20 75,34 75,66 50,80 25,66 25,34"
      fill="none" stroke="${color}" stroke-width="1" opacity="0.5"/>
    <circle cx="50" cy="50" r="8" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.7"/>
    <line x1="50" y1="38" x2="50" y2="62" stroke="${color}" stroke-width="1.5" opacity="0.7"/>
    <line x1="38" y1="50" x2="62" y2="50" stroke="${color}" stroke-width="1.5" opacity="0.7"/>
  </svg>`;

  fxLayer.appendChild(shield);
  setTimeout(() => shield.remove(), 700);
}

function showCounterEffect(pid) {
  const pos = state.players[pid].pos;
  const rect = getCellRect(pos);

  const baseColor = pid === 1 ? '#b5d4ee' : '#f0bb95';
  const goldColor = '#e8c87a';

  // 1) 중앙 골드 플래시 — 폭발하는 빛
  const flashSize = rect.width * 1.3;
  const flash = document.createElement('div');
  flash.className = 'fx-counter-flash';
  flash.style.left = (rect.centerX - flashSize / 2) + 'px';
  flash.style.top  = (rect.centerY - flashSize / 2) + 'px';
  flash.style.width  = flashSize + 'px';
  flash.style.height = flashSize + 'px';
  fxLayer.appendChild(flash);
  setTimeout(() => flash.remove(), 600);

  // 2) 동심원 링 3개 — 시간차 확산
  for (let i = 0; i < 3; i++) {
    const ring = document.createElement('div');
    ring.className = 'fx-counter-ring';
    const rs = rect.width * 0.55;
    ring.style.left = (rect.centerX - rs / 2) + 'px';
    ring.style.top  = (rect.centerY - rs / 2) + 'px';
    ring.style.width  = rs + 'px';
    ring.style.height = rs + 'px';
    ring.style.borderColor = i === 1 ? goldColor : baseColor;
    ring.style.animationDelay = `${i * 110}ms`;
    fxLayer.appendChild(ring);
    setTimeout(() => ring.remove(), 850 + i * 110);
  }

  // 3) 반사 호 — counter 사용자 위치에서 attacker 쪽으로 휘어 되돌아감
  const targetPid = pid === 1 ? 2 : 1;
  const targetPos = state.players[targetPid].pos;
  const direction = targetPos === pos ? 1 : (targetPos > pos ? 1 : -1);
  const arcSize = rect.width * 1.05;
  const offX = rect.width * 0.42 * direction;
  const reflectArc = document.createElement('div');
  reflectArc.className = 'fx-counter-reflect';
  reflectArc.style.left = (rect.centerX - arcSize / 2 + offX) + 'px';
  reflectArc.style.top  = (rect.centerY - arcSize / 2) + 'px';
  reflectArc.style.width  = arcSize + 'px';
  reflectArc.style.height = arcSize + 'px';
  // 반사 호 방향: counter 사용자→상대 방향으로 호가 휘어짐
  const arcPath = direction > 0 ? `M 14 16 Q 92 50 14 84` : `M 86 16 Q 8 50 86 84`;
  reflectArc.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none">
    <path d="${arcPath}" stroke="${goldColor}" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.14"/>
    <path d="${arcPath}" stroke="${goldColor}" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.3"/>
    <path class="slash-line" d="${arcPath}" stroke="${goldColor}" stroke-width="5" fill="none" stroke-linecap="round" opacity="1"/>
    <path class="slash-line" d="${arcPath}" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.95"/>
  </svg>`;
  fxLayer.appendChild(reflectArc);
  setTimeout(() => reflectArc.remove(), 720);

  // 4) 골드 스파크 방사 (10개)
  spawnSparks(rect.centerX, rect.centerY, goldColor, 10, 32);
}

function showImpactEffect(pid) {
  const pos = state.players[pid].pos;
  const rect = getCellRect(pos);

  for (let i = 0; i < 2; i++) {
    const size = rect.width * 0.9;
    const impact = document.createElement('div');
    impact.className = 'fx-impact' + (i === 1 ? ' inner' : '');
    impact.style.left = (rect.centerX - size / 2) + 'px';
    impact.style.top = (rect.centerY - size / 2) + 'px';
    impact.style.width = size + 'px';
    impact.style.height = size + 'px';
    fxLayer.appendChild(impact);
    setTimeout(() => impact.remove(), 700);
  }
}

function showStardustEffect(pid) {
  const pos = state.players[pid].pos;
  const rect = getCellRect(pos);

  const container = document.createElement('div');
  container.className = 'fx-stardust';
  container.style.left = rect.left + 'px';
  container.style.top = rect.top + 'px';
  container.style.width = rect.width + 'px';
  container.style.height = rect.height + 'px';
  fxLayer.appendChild(container);

  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const x = 15 + Math.random() * 70;
    const y = 60 + Math.random() * 30;
    p.style.left = x + '%';
    p.style.top = y + '%';
    p.style.animationDelay = (i * 0.05) + 's';
    container.appendChild(p);
  }
  setTimeout(() => container.remove(), 1400);
}

function showExpansionEffect(cellIdx) {
  const rect = getCellRect(cellIdx);

  const ring = document.createElement('div');
  ring.className = 'fx-expansion-ring';
  ring.style.left = rect.left + 'px';
  ring.style.top = rect.top + 'px';
  ring.style.width = rect.width + 'px';
  ring.style.height = rect.height + 'px';
  fxLayer.appendChild(ring);

  const container = document.createElement('div');
  container.className = 'fx-stardust fx-expansion-particles';
  container.style.left = rect.left + 'px';
  container.style.top = rect.top + 'px';
  container.style.width = rect.width + 'px';
  container.style.height = rect.height + 'px';
  fxLayer.appendChild(container);

  for (let i = 0; i < 6; i++) {
    const p = document.createElement('div');
    p.className = 'particle expansion';
    const x = 20 + Math.random() * 60;
    p.style.left = x + '%';
    p.style.top = '10%';
    p.style.animationDelay = (i * 0.08) + 's';
    container.appendChild(p);
  }

  setTimeout(() => {
    ring.remove();
    container.remove();
  }, 1400);
}

function showCollisionEffect(pos1, pos2) {
  const r1 = getCellRect(pos1);
  const r2 = getCellRect(pos2);
  const centerX = (r1.centerX + r2.centerX) / 2;
  const centerY = (r1.centerY + r2.centerY) / 2;

  const fx = document.createElement('div');
  fx.className = 'fx-collision';
  fx.style.left = centerX + 'px';
  fx.style.top = (centerY - 40) + 'px';
  fx.textContent = t('fx.collision');
  fxLayer.appendChild(fx);
  setTimeout(() => fx.remove(), 800);
}

// ==================== 액션 미리보기 (hover / long-press) ====================
// 빈 슬롯에 액션 이름 고스트 + 보드에 대상 칸 하이라이트. 이미 예약된 내 이동은 반영, 상대 이동은 무시.
const LONG_PRESS_MS = 350;
let previewTimer = null;
let previewActive = false;
let previewConsumedClick = false;

function previewTargets(pid, action) {
  const p = state.players[pid];
  let pos = p.pos;
  for (const a of p.actions) pos = computeMove(pid, pos, a);
  const dir = state.players[pid === 1 ? 2 : 1].pos > pos ? 1 : -1;
  const target = action === 'attack' || action === 'pierce' ? pos + dir
               : action === 'ranged' ? pos + dir * 2
               : action === 'block' || action === 'counter' ? pos
               : computeMove(pid, pos, action);
  return target >= 0 && target < BOARD_SIZE ? [target] : [];
}

function clearPreview() {
  clearTimeout(previewTimer);
  previewTimer = null;
  if (!previewActive) return;
  previewActive = false;
  document.querySelectorAll('.cell.preview').forEach(el => {
    el.classList.remove('preview');
    delete el.dataset.action;
  });
  renderSlots(); // 슬롯 고스트 원복
}

function showPreview(action) {
  clearPreview();
  previewActive = true;
  const pid = state.currentPlayer;
  const p = state.players[pid];
  const slots = [slot1El, slot2El, slot3El];
  const n = action === 'leap' ? 2 : 1;
  for (let i = 0; i < n; i++) {
    const el = slots[p.actions.length + i];
    if (!el) break;
    el.textContent = actionName(action);
    el.dataset.action = action;
    el.className = 'slot preview';
  }
  previewTargets(pid, action).forEach(idx => {
    cells[idx].dataset.action = action;
    cells[idx].classList.add('preview');
  });
}

actionBtns.forEach(btn => {
  const canPreview = () => !btn.disabled && !state.inputLocked;
  // 마우스: hover 즉시
  btn.addEventListener('pointerenter', e => {
    if (e.pointerType === 'mouse' && canPreview()) showPreview(btn.dataset.action);
  });
  // 터치/펜: long-press 후 미리보기, 손 떼면 클릭 무시
  btn.addEventListener('pointerdown', e => {
    previewConsumedClick = false;
    if (e.pointerType === 'mouse' || !canPreview()) return;
    previewTimer = setTimeout(() => {
      previewTimer = null;
      previewConsumedClick = true;
      showPreview(btn.dataset.action);
    }, LONG_PRESS_MS);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => btn.addEventListener(ev, clearPreview));
});

// ==================== 입력 처리 ====================
actionBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (previewConsumedClick) { previewConsumedClick = false; return; }
    if (state.inputLocked) return;
    const action = btn.dataset.action;
    const p = state.players[state.currentPlayer];
    const maxActions = getMaxActions(state.round) - p.penalty;
    if (p.actions.length >= maxActions) return;
    if (action === 'leap') {
      if (p.actions.length + 2 > maxActions) return;
      p.actions.push('leap');
      p.actions.push('leap_hold');
    } else {
      p.actions.push(action);
    }
    SFX.uiSlot();
    renderSlots();
    // 마우스가 아직 올라가 있으면 다음 슬롯 미리보기 갱신
    if (matchMedia('(hover: hover)').matches && btn.matches(':hover') && !btn.disabled) showPreview(action);
    else clearPreview();
  });
});

undoBtn.addEventListener('click', () => {
  if (state.inputLocked) return;
  const p = state.players[state.currentPlayer];
  if (p.actions.length > 0) {
    if (p.actions[p.actions.length - 1] === 'leap_hold') {
      p.actions.pop();
      p.actions.pop();
    } else {
      p.actions.pop();
    }
    SFX.uiUndo();
    renderSlots();
  }
});

// ==================== 키보드 단축키 ====================
const KEY_ACTION_MAP = {
  '1': 'moveL', '2': 'moveR', '3': 'attack', '4': 'block', '5': 'counter', '6': 'pierce', '7': 'ranged', '8': 'leap'
};

document.addEventListener('keydown', (e) => {
  if (helpModal.classList.contains('show')) {
    if (e.key === 'Escape') {
      e.preventDefault();
      helpClose.click();
    }
    return;
  }

  if (e.key === '?' || (e.shiftKey && e.key === '/')) {
    e.preventDefault();
    helpToggle.click();
    return;
  }

  if (e.key === 'm' || e.key === 'M') { // 볼륨은 어느 화면에서든
    e.preventDefault();
    soundToggle.click();
    return;
  }

  if (endmodal.classList.contains('show')) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      restartBtn.click();
    }
    return;
  }

  if (curtain.classList.contains('show')) {
    if ((e.key === 'Enter' || e.key === ' ') && curtainBtn.style.display !== 'none') {
      e.preventDefault();
      curtainBtn.click();
    }
    return;
  }

  if (state.phase !== 'first_input' && state.phase !== 'second_input') return;
  if (state.inputLocked) return;

  if (e.key in KEY_ACTION_MAP) {
    e.preventDefault();
    const action = KEY_ACTION_MAP[e.key];
    const btn = document.querySelector(`.action-btn[data-action="${action}"]`);
    if (btn && !btn.disabled) btn.click();
  } else if (e.key === 'Backspace' || e.key === 'Escape') {
    e.preventDefault();
    if (!undoBtn.disabled) undoBtn.click();
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (!confirmBtn.disabled) confirmBtn.click();
  }
});

confirmBtn.addEventListener('click', () => {
  if (state.inputLocked) return;
  clearPreview();
  if (state.phase === 'first_input') {
    SFX.uiConfirm();
    if (state.vsAI && state.firstPlayer === state.humanPid) {
      const aiPid = state.humanPid === 1 ? 2 : 1;
      state.players[aiPid].actions = generateAIActions(aiPid);
      state.phase = 'resolve';
      renderTurnInfo();
      resolveActions();
    } else {
      const nextPid = state.firstPlayer === 1 ? 2 : 1;
      const nextName = t('curtain.turnName', { name: t(`player.${nextPid}`) });
      showCurtain({ title: nextName, sub: t('curtain.handoff.sub'), themePid: nextPid }, () => {
        state.phase = 'second_input';
        renderTurnInfo();
        SFX.sfxTurnStart();
        triggerAIIfNeeded();
      });
    }
  } else if (state.phase === 'second_input') {
    SFX.uiConfirm();
    state.phase = 'resolve';
    renderTurnInfo();
    resolveActions();
  }
});

function showCurtain(opts, onContinue) {
  curtainDefault.style.display = 'block';
  curtainDraw.style.display = 'none';
  curtainRound.style.display = 'none';
  curtainSetup.style.display = 'none';
  curtainBtn.style.display = 'inline-block';

  const mode = opts.mode || 'handoff';

  // theme: player-colored handoff overhaul
  curtain.removeAttribute('data-theme');
  if (opts.themePid) curtain.setAttribute('data-theme', `p${opts.themePid}`);

  if (mode === 'handoff') {
    curtainDefault.style.display = 'block';
    curtainTitle.textContent = opts.title || t('curtain.handoff.title');
    const subEl = document.getElementById('curtainSub');
    if (subEl) subEl.textContent = opts.sub || t('curtain.handoff.sub');
    curtainBtn.textContent = opts.btnText || t('btn.ready');
    // retrigger entry anims
    curtainDefault.classList.remove('anim-in');
    void curtainDefault.offsetWidth;
    curtainDefault.classList.add('anim-in');
  } else if (mode === 'draw') {
    curtainDefault.style.display = 'none';
    curtainDraw.style.display = 'block';
    curtainBtn.style.display = 'none';
  } else if (mode === 'round') {
    curtainDefault.style.display = 'none';
    curtainRound.style.display = 'block';
    curtainBtn.textContent = t('btn.nextRound');
  } else if (mode === 'setup') {
    curtainDefault.style.display = 'none';
    curtainSetup.style.display = 'block';
    curtainBtn.textContent = t('btn.continue');
    curtainBtn.style.display = 'none'; // 정령 선택 전엔 버튼 숨김
  }

  curtain.classList.add('show');
  curtainBtn.onclick = () => {
    SFX.uiClick();
    curtain.classList.remove('show');
    state.inputLocked = true;
    updateInputLock();
    setTimeout(() => {
      state.inputLocked = false;
      updateInputLock();
    }, 300);
    if (onContinue) onContinue();
  };
}

function updateInputLock() {
  inputPanel.querySelectorAll('button').forEach(btn => btn.classList.toggle('locked', state.inputLocked));
}

function hideCurtain() {
  curtain.classList.remove('show');
}

function triggerAIIfNeeded() {
  if (!state.vsAI) return;
  const aiPid = state.humanPid === 1 ? 2 : 1;
  if (state.phase === 'first_input' && state.firstPlayer === aiPid) {
    state.players[aiPid].actions = generateAIActions(aiPid);
    state.phase = 'second_input';
    // 호출자가 renderTurnInfo()를 이어서 호출함
  }
}

// ==================== 동시 처리 로직 ====================
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function gainStar(pid) {
  const p = state.players[pid];
  if (p.stars >= STAR_CAP) return false;
  p.stars += 1;
  return true;
}

function playBattleSfx(a1, a2, result) {
  const isAtk = a => a === 'attack' || a === 'pierce' || a === 'ranged';
  const isCtr = a => a === 'counter';
  const anyHit = result.dmg1 > 0 || result.dmg2 > 0;

  const attacked = isAtk(a1) || isAtk(a2);
  if (attacked) SFX.sfxAttack();

  if (result.blockSuccess1 || result.blockSuccess2) {
    setTimeout(() => SFX.sfxBlock(), 80);
  }

  const counterSuccess = (isCtr(a1) && isAtk(a2) && result.dmg2 > 0)
                       || (isCtr(a2) && isAtk(a1) && result.dmg1 > 0);
  if (counterSuccess) setTimeout(() => SFX.sfxCounter(), 80);

  if (anyHit) setTimeout(() => SFX.sfxHit(), 120);

  if (attacked && !anyHit && !result.blockSuccess1 && !result.blockSuccess2 && !counterSuccess) {
    setTimeout(() => SFX.sfxMiss(), 100);
  }
}

function playBattleFx(a1, a2, result) {
  const isAtk = a => a === 'attack' || a === 'pierce' || a === 'ranged';
  const isCtr = a => a === 'counter';

  if (isAtk(a1)) {
    if (a1 === 'ranged') showLightningArc(1);
    else showSlashEffect(1, a1 === 'pierce');
  }
  if (isAtk(a2)) {
    if (a2 === 'ranged') showLightningArc(2);
    else showSlashEffect(2, a2 === 'pierce');
  }

  if (result.blockSuccess1) setTimeout(() => showShieldEffect(1), 200);
  if (result.blockSuccess2) setTimeout(() => showShieldEffect(2), 200);

  if (isCtr(a1) && isAtk(a2) && result.dmg2 > 0) setTimeout(() => showCounterEffect(1), 200);
  if (isCtr(a2) && isAtk(a1) && result.dmg1 > 0) setTimeout(() => showCounterEffect(2), 200);

  if (result.dmg1 > 0) setTimeout(() => showImpactEffect(1), 300);
  if (result.dmg2 > 0) setTimeout(() => showImpactEffect(2), 300);
}

async function resolveActions() {
  const newPenalty = { 1: 0, 2: 0 };

  const p1 = state.players[1];
  const p2 = state.players[2];

  const numPhases = getMaxActions(state.round);
  const normalizeAction = a => (a === 'leap_hold' ? null : a);

  for (let phase = 0; phase < numPhases; phase++) {
    const a1 = normalizeAction(p1.actions[phase]) || null;
    const a2 = normalizeAction(p2.actions[phase]) || null;

    if (!a1 && !a2) continue;

    clearActionChips(); // 직전 페이즈 잔존 칩 제거 (결정 라운드 등 빠른 연속 페이즈 보호)
    if (a1) showActionChip(1, a1);
    if (a2) showActionChip(2, a2);

    if (a1 === 'pierce') p1.stars = Math.max(0, p1.stars - PIERCE_COST);
    if (a2 === 'pierce') p2.stars = Math.max(0, p2.stars - PIERCE_COST);

    await sleep(750);   // 행동 라벨 읽는 시간

    const prevPos1 = p1.pos;
    const prevPos2 = p2.pos;

    const isMoveAction = a => a === 'moveL' || a === 'moveR' || a === 'leap';
    if (isMoveAction(a1) || isMoveAction(a2)) SFX.sfxMove();
    handleMovement(a1, a2);
    if (a1 === 'leap') floatText(1, t('float.leap'), 'leap');
    if (a2 === 'leap') floatText(2, t('float.leap'), 'leap');
    renderBoard();
    await sleep(850);   // 이동 후 위치 확인 시간

    const result = resolvePhase(a1, a2, newPenalty, prevPos1, prevPos2);

    playBattleSfx(a1, a2, result);
    playBattleFx(a1, a2, result);

    // 결과 플로트 (피해 외 이벤트) — 약간 지연으로 fx 와 겹치게
    if (result.floats && result.floats.length) {
      result.floats.forEach((f, i) => {
        setTimeout(() => floatText(f.pid, t(`float.${f.key}`), f.key), 180 + i * 90);
      });
    }

    if (result.dmg1 > 0) {
      p1.hp -= result.dmg1;
      flashSpirit(1);
      setTimeout(() => floatText(1, `−${result.dmg1}`, 'damage'), 320);
    }
    if (result.dmg2 > 0) {
      p2.hp -= result.dmg2;
      flashSpirit(2);
      setTimeout(() => floatText(2, `−${result.dmg2}`, 'damage'), 320);
    }
    renderHP();

    let starChanges = [];
    if (a1 === 'block') {
      if (result.blockSuccess1) {
        if (gainStar(1)) starChanges.push({ pid: 1 });
      } else if (a2 !== 'counter' && !result.piercedBlock1) {
        if (gainStar(2)) starChanges.push({ pid: 2 });
      }
    }
    if (a2 === 'block') {
      if (result.blockSuccess2) {
        if (gainStar(2)) starChanges.push({ pid: 2 });
      } else if (a1 !== 'counter' && !result.piercedBlock2) {
        if (gainStar(1)) starChanges.push({ pid: 1 });
      }
    }
    if (starChanges.length > 0) {
      const lastGainer = starChanges[starChanges.length - 1].pid;
      renderStars(lastGainer);
      starChanges.forEach((sc, i) => {
        setTimeout(() => floatText(sc.pid, '★ +1', 'star'), 480 + i * 100);
      });
    }

    await sleep(550);   // 결과(데미지·별·로그) 읽는 시간

    if (p1.hp <= 0 || p2.hp <= 0) {
      await sleep(900);
      endRound();
      return;
    }

    await sleep(500);
  }

  p1.penalty = newPenalty[1];
  p2.penalty = newPenalty[2];

  await handleCornerPenalty();

  if (p1.hp <= 0 || p2.hp <= 0) {
    await sleep(600);
    endRound();
    return;
  }

  await sleep(400);
  state.turn++;
  p1.actions = [];
  p2.actions = [];
  state.phase = 'first_input';

  const newExpansion = STARDUST_EXPANSION.find(p => p.turn === state.turn);
  if (newExpansion) {
    SFX.sfxCornerDmg();
    for (const cellIdx of newExpansion.cells) {
      showExpansionEffect(cellIdx);
    }
    renderCornerStates();
    await sleep(1200);
  }

  const firstName = t('curtain.turnName', { name: t(`player.${state.firstPlayer}`) });
  showCurtain({ mode: 'handoff', title: firstName, sub: t('curtain.handoff.sub.nextTurn'), themePid: state.firstPlayer }, () => {
    triggerAIIfNeeded();
    renderTurnInfo();
    SFX.sfxTurnStart();
  });
}

function isStardust(pos, turn) {
  if (pos === 0 || pos === BOARD_SIZE - 1) return true;
  for (const phase of STARDUST_EXPANSION) {
    if (turn >= phase.turn && phase.cells.includes(pos)) return true;
  }
  return false;
}

function getStardustCells(turn) {
  const cells = new Set([0, BOARD_SIZE - 1]);
  for (const phase of STARDUST_EXPANSION) {
    if (turn >= phase.turn) {
      for (const c of phase.cells) cells.add(c);
    }
  }
  return cells;
}

function getNextExpansionInfo(turn) {
  for (const phase of STARDUST_EXPANSION) {
    if (turn < phase.turn) {
      return { turnsLeft: phase.turn - turn, cells: phase.cells };
    }
  }
  return null;
}

async function handleCornerPenalty() {
  for (const pid of [1, 2]) {
    const p = state.players[pid];
    if (!isStardust(p.pos, state.turn)) { p.cornerTurns = 0; continue; }
    p.cornerTurns += 1;
    if (p.cornerTurns >= 3) {
      SFX.sfxCornerDmg();
      p.hp -= 1;
      flashSpirit(pid);
      floatText(pid, t('float.stardust'), 'stardust');
      setTimeout(() => floatText(pid, '−1', 'damage'), 240);
      showStardustEffect(pid);
      renderHP();
      await sleep(700);
    } else if (p.cornerTurns === 2) {
      floatText(pid, t('float.stardustWarn'), 'whiff');
    }
  }
  renderCornerStates();
}

function renderCornerStates() {
  cells.forEach(c => {
    c.classList.remove('corner-warning', 'corner-danger', 'corner-base', 'stardust-outer', 'stardust-mid');
    const mark = c.querySelector('.corner-mark');
    if (mark) mark.remove();
    const baseMark = c.querySelector('.corner-base-mark, .safe-mark');
    if (baseMark) baseMark.remove();
  });

  // 영구 안전 칸 (4·5·6) — 별빛 확장 대상이 아님
  for (const pos of SAFE_CELLS) {
    const m = document.createElement('span');
    m.className = 'corner-base-mark safe-mark';
    m.textContent = t('cell.safe');
    cells[pos].appendChild(m);
  }

  const stardustCells = getStardustCells(state.turn);
  for (const pos of stardustCells) {
    const cell = cells[pos];
    cell.classList.add('corner-base');
    if (pos === 0 || pos === BOARD_SIZE - 1) {
      // 영구 구석 — 기본
    } else if (pos === 1 || pos === BOARD_SIZE - 2) {
      cell.classList.add('stardust-mid');
    } else {
      cell.classList.add('stardust-outer');
    }
    const baseMark = document.createElement('span');
    baseMark.className = 'corner-base-mark';
    baseMark.textContent = t('cell.stardust');
    cell.appendChild(baseMark);
  }

  for (const pid of [1, 2]) {
    const p = state.players[pid];
    if (isStardust(p.pos, state.turn) && p.cornerTurns > 0) {
      const cell = cells[p.pos];
      if (p.cornerTurns === 1) {
        cell.classList.add('corner-warning');
        addCornerMark(cell, t('cell.warn1'));
      } else if (p.cornerTurns === 2) {
        cell.classList.add('corner-warning');
        addCornerMark(cell, t('cell.warn2'));
      } else {
        cell.classList.add('corner-danger');
        addCornerMark(cell, t('cell.danger'));
      }
    }
  }
}

function addCornerMark(cell, text) {
  const m = document.createElement('div');
  m.className = 'corner-mark';
  m.textContent = text;
  cell.appendChild(m);
}

function resolvePhase(a1, a2, newPenalty, prevPos1, prevPos2) {
  const result = {
    dmg1: 0, dmg2: 0,
    blockSuccess1: false, blockSuccess2: false,
    piercedBlock1: false, piercedBlock2: false,
    floats: []
  };
  const flt = (pid, key) => result.floats.push({ pid, key });
  const dist = Math.abs(state.players[1].pos - state.players[2].pos);
  const prevDist = Math.abs(prevPos1 - prevPos2);

  const isAggressive = a => a === 'attack' || a === 'pierce' || a === 'ranged';
  const isMove = a => a === 'moveL' || a === 'moveR' || a === 'leap';
  const inRange = (a, d) => (a === 'ranged' ? d === 2 : d === 1);

  // 한쪽(me) 시점의 판정 — 양쪽에 대해 한 번씩 호출하면 전체 매트릭스가 됨
  const side = (me, opp, a, b) => {
    if (!isAggressive(a)) {
      // 막기 vs 카운터: 카운터 헛손질 → 다음 턴 액션 -1
      if (a === 'block' && b === 'counter') { newPenalty[opp] += 1; flt(opp, 'whiff'); }
      return;
    }
    const hits = inRange(a, dist);
    if (isAggressive(b)) {
      if (hits) result[`dmg${opp}`] = 1; else flt(me, 'miss');
    } else if (b === 'block') {
      if (!hits) flt(me, 'miss');
      else if (a === 'pierce') {
        result[`dmg${opp}`] = 1; result[`piercedBlock${opp}`] = true;
        flt(me, 'pierce'); flt(opp, 'pierced');
      } else {
        result[`blockSuccess${opp}`] = true; flt(opp, 'blocked');
      }
    } else if (b === 'counter') {
      if (hits) { result[`dmg${me}`] = 1; flt(opp, 'counter'); }
      else { flt(me, 'miss'); flt(opp, 'whiff'); }
    } else if (hits) {
      // 상대는 이동/대기
      result[`dmg${opp}`] = 1;
      if (a === 'pierce') flt(me, 'pierce');
    } else if (b) {
      if (isMove(b) && inRange(a, prevDist)) flt(opp, 'evade');
      flt(me, 'miss');
    }
  };
  side(1, 2, a1, a2);
  side(2, 1, a2, a1);
  return result;
}

function handleMovement(a1, a2) {
  const p1 = state.players[1];
  const p2 = state.players[2];

  const newP1 = computeMove(1, p1.pos, a1);
  const newP2 = computeMove(2, p2.pos, a2);

  const collision = (newP1 === newP2) ||
                    (newP1 === p2.pos && newP2 === p1.pos);

  if (collision) {
    showCollisionEffect(p1.pos, p2.pos);
    return;
  }

  p1.pos = newP1;
  p2.pos = newP2;
}

function computeMove(pid, pos, action) {
  const oppPos = state.players[pid === 1 ? 2 : 1].pos;
  const dir = oppPos > pos ? 1 : -1; // 상대 방향 (위치 기준 동적 결정)
  const inBoard = i => i >= 0 && i < BOARD_SIZE;
  if (action === 'moveL' || action === 'moveR') {
    // 전진: 상대 쪽 1칸 / 후퇴: 반대 1칸. 벽이면 제자리.
    const next = pos + (action === 'moveL' ? dir : -dir);
    return inBoard(next) ? next : pos;
  }
  if (action === 'leap') {
    // 인접한 상대 너머로 도약 — 우선 상대 + 2칸 (사이 1칸 공백).
    // 보드 밖이면 폴백: 상대 + 1칸 (바로 뒤). 이마저 보드 밖이면 leap 무효.
    if (inBoard(pos + dir * 3)) return pos + dir * 3;
    if (inBoard(pos + dir * 2)) return pos + dir * 2;
  }
  return pos;
}

// ==================== 라운드/매치 종료 ====================
async function endRound() {
  state.phase = 'end';
  const p1Dead = state.players[1].hp <= 0;
  const p2Dead = state.players[2].hp <= 0;
  // 동시 산화 = 무승부(null)
  const roundWinner = p1Dead && p2Dead ? null : p1Dead ? 2 : 1;

  if (roundWinner) SFX.sfxRoundWin(roundWinner);
  else SFX.sfxRoundDraw();

  if (roundWinner) state.matchScore[roundWinner] += 1;
  setTimeout(() => {
    renderMatchScore(roundWinner);
    if (roundWinner) SFX.sfxPipWin();
  }, 400);

  await sleep(1400);

  const reachedWin = state.matchScore[1] >= MATCH_WIN || state.matchScore[2] >= MATCH_WIN;
  const reachedMaxRounds = state.round >= MAX_ROUNDS;
  if (reachedWin || reachedMaxRounds) {
    endMatch();
    return;
  }

  state.firstPlayer = state.firstPlayer === 1 ? 2 : 1;

  roundBadge.textContent = t('curtain.round.badge', { n: state.round });
  roundWinnerTitle.textContent = roundWinner === 1
    ? t('curtain.round.winner', { name: t('player.1') })
    : roundWinner === 2
    ? t('curtain.round.winner', { name: t('player.2') })
    : t('curtain.round.draw');
  roundScoreP1.textContent = state.matchScore[1];
  roundScoreP2.textContent = state.matchScore[2];
  roundNextInfo.textContent = t('curtain.round.nextFirst', { name: t(`player.${state.firstPlayer}`) });

  showCurtain({ mode: 'round', themePid: roundWinner }, () => {
    startNextRound();
  });
}

function startNextRound() {
  state.round += 1;
  state.turn = 1;
  state.phase = 'first_input';
  state.players[1] = { hp: MAX_HP, pos: START_POS_P1, actions: [], penalty: 0, cornerTurns: 0, stars: 0 };
  state.players[2] = { hp: MAX_HP, pos: START_POS_P2, actions: [], penalty: 0, cornerTurns: 0, stars: 0 };

  renderAll();

  const firstName = t('curtain.turnName', { name: t(`player.${state.firstPlayer}`) });
  const subText = state.round === DECISIVE_ROUND
    ? t('curtain.round.sub.decisive')
    : t('curtain.round.sub.normal', { n: state.round });
  showCurtain({ mode: 'handoff', title: firstName, sub: subText, themePid: state.firstPlayer }, () => {
    triggerAIIfNeeded();
    renderTurnInfo();
  });
}

function endMatch() {
  state.phase = 'end';
  const s1 = state.matchScore[1];
  const s2 = state.matchScore[2];
  endmodal.removeAttribute('data-theme');
  winnerText.style.color = '';
  if (s1 === s2) {
    winnerText.textContent = t('end.draw');
    winnerName.textContent = t('end.drawSub');
    SFX.sfxRoundDraw();
  } else {
    const matchWinner = s1 > s2 ? 1 : 2;
    winnerText.textContent = t(`player.${matchWinner}.formal`);
    winnerText.style.color = matchWinner === 1 ? 'var(--p1-glow)' : 'var(--p2-glow)';
    endmodal.setAttribute('data-theme', `p${matchWinner}`);
    winnerName.textContent = t('end.winnerSub');
    SFX.sfxMatchWin();
  }
  finalScoreP1.textContent = s1;
  finalScoreP2.textContent = s2;
  // ArcadeDeck 통합 전송 규격 — vs AI only: cumulative AI match wins (hot-seat has no single-player score)
  if (state.vsAI) {
    const human = state.humanPid, ai = human === 1 ? 2 : 1;
    let aiWins = 0;
    try { aiWins = Number(localStorage.getItem('sd_aiWins')) || 0; } catch (e) {}
    if (state.matchScore[human] > state.matchScore[ai]) {
      aiWins++;
      try { localStorage.setItem('sd_aiWins', String(aiWins)); } catch (e) {}
    }
    try { window.parent.postMessage({ type: 'GAME_OVER', score: aiWins, subScore: state.matchScore[human] }, '*'); } catch (e) {}
  }
  setTimeout(() => {
    hideCurtain();
    endmodal.classList.add('show');
  }, 800);
}

// ==================== 매치 스코어 렌더링 ====================
function renderMatchScore(justWonPid) {
  for (const pid of [1, 2]) {
    const container = pid === 1 ? p1Pips : p2Pips;
    container.innerHTML = '';
    for (let i = 0; i < MATCH_WIN; i++) {
      const pip = document.createElement('span');
      pip.className = 'mpip';
      if (i < state.matchScore[pid]) {
        pip.classList.add('won');
        if (justWonPid === pid && i === state.matchScore[pid] - 1) {
          pip.classList.add('just-won');
        }
      }
      container.appendChild(pip);
    }
  }
}

// ==================== AI (PVE) ====================
function weightedRandom(weights) {
  const entries = Object.entries(weights).filter(([, v]) => v > 0);
  if (!entries.length) return 'moveL';
  const total = entries.reduce((s, [, v]) => s + v, 0);
  let r = Math.random() * total;
  for (const [key, val] of entries) {
    r -= val;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

function pickAIAction(aiPos, oppPos, stars, aiHp, oppHp, cornerTurns, turn, round, difficulty, canLeap) {
  const dist = Math.abs(aiPos - oppPos);
  const inStardust = isStardust(aiPos, turn);
  const hpDiff = aiHp - oppHp;
  const canPierce = stars >= PIERCE_COST;
  // 뛰어넘기 착지: 상대 + 2칸 우선, 보드 밖이면 상대 + 1칸 폴백. 별빛 영역도 허용.
  const leapLanding = canLeap ? (() => {
    const dir = oppPos > aiPos ? 1 : -1;
    const land2 = aiPos + dir * 3;
    const land1 = aiPos + dir * 2;
    if (land2 >= 0 && land2 < BOARD_SIZE) return land2;
    if (land1 >= 0 && land1 < BOARD_SIZE) return land1;
    return null;
  })() : null;
  const leapSafe = canLeap && leapLanding !== null;

  const w = { moveL: 10, moveR: 10, attack: 10, block: 10, counter: 10, pierce: 0, ranged: 10, leap: 0 };

  if (difficulty === 'master') {
    // ── MASTER: 예측 기반, 낮은 무작위성 ──
    if (dist === 1) {
      w.counter = 45; w.attack = 28; w.block = 12;
      w.pierce = canPierce ? 55 : 0;
      w.moveL = 0; w.moveR = 8; w.ranged = 0;
      w.leap = leapSafe ? 10 : 0;
    } else if (dist === 2) {
      w.ranged = 42; w.moveL = 30; w.block = 22; w.counter = 16;
      w.attack = 0; w.pierce = 0; w.moveR = 5;
    } else if (dist === 3) {
      w.moveL = 62; w.block = 5; w.counter = 5; w.moveR = 0;
      w.attack = 0; w.pierce = 0; w.ranged = 0;
    } else {
      w.moveL = 72; w.block = 2; w.counter = 2; w.moveR = 0;
      w.attack = 0; w.pierce = 0; w.ranged = 0;
    }
    if (inStardust) {
      w.moveL += 100;
      w.leap = leapSafe ? w.leap + 45 : 0; // 별빛 탈출 수단으로 적극 활용
      w.attack = 0; w.counter = Math.max(0, w.counter - 15);
    }
    if (aiHp <= 2 && dist === 1) {
      w.pierce = canPierce ? w.pierce + 30 : 0;
      w.attack += 18; w.counter += 12;
    }
    if (hpDiff >= 2 && dist === 1) { w.attack += 18; w.pierce = canPierce ? w.pierce + 20 : 0; }
    if (hpDiff <= -2) { w.counter += 18; w.block += 12; }
    if (round >= 4 && dist === 1) w.attack += 8;

  } else if (difficulty === 'advanced') {
    // ── ADVANCED: 균형잡힌 가중치 ──
    if (dist === 1) {
      w.attack = 35; w.block = 20; w.counter = 20;
      w.pierce = canPierce ? 25 : 0;
      w.moveL = 5; w.moveR = 15; w.ranged = 0;
      w.leap = leapSafe ? 5 : 0;
    } else if (dist === 2) {
      w.ranged = 35; w.moveL = 30; w.block = 15; w.counter = 15; w.moveR = 10;
      w.attack = 0; w.pierce = 0;
    } else if (dist === 3) {
      w.moveL = 45; w.block = 10; w.counter = 10; w.moveR = 5;
      w.attack = 0; w.pierce = 0; w.ranged = 0;
    } else {
      w.moveL = 55; w.block = 5; w.counter = 5; w.moveR = 0;
      w.attack = 0; w.pierce = 0; w.ranged = 0;
    }
    if (inStardust) {
      w.moveL += (cornerTurns >= 2 ? 50 : 30);
      w.leap = leapSafe ? w.leap + (cornerTurns >= 2 ? 30 : 15) : 0;
      w.attack = Math.max(0, w.attack - 10);
    }
    if (aiHp <= 2) { w.block += 15; w.counter += 10; w.moveR += 10; if (dist === 1) { w.attack += 10; } }
    if (hpDiff >= 2 && dist === 1) { w.attack += 15; if (canPierce) w.pierce += 15; }
    if (hpDiff <= -2) { w.counter += 10; w.block += 10; }
    if (round >= 4 && dist === 1) w.attack += 5;

  } else {
    // ── NORMAL: 적당한 무작위성, 가끔 실수 ──
    if (dist === 1) {
      w.attack = 28; w.block = 16; w.counter = 14;
      w.pierce = canPierce ? 14 : 0;
      w.moveL = 8; w.moveR = 12; w.ranged = 5;
      w.leap = leapSafe ? 3 : 0;
    } else if (dist === 2) {
      w.ranged = 25; w.moveL = 26; w.moveR = 12; w.block = 12; w.counter = 9;
      w.attack = 4; w.pierce = 0;
    } else if (dist === 3) {
      w.moveL = 38; w.block = 11; w.counter = 9; w.moveR = 8;
      w.attack = 3; w.ranged = 4; w.pierce = 0;
    } else {
      w.moveL = 44; w.moveR = 6; w.block = 7; w.counter = 7; w.attack = 3;
      w.ranged = 0; w.pierce = 0;
    }
    if (inStardust) {
      w.moveL += (cornerTurns >= 2 ? 35 : 15);
      w.leap = leapSafe ? w.leap + (cornerTurns >= 2 ? 18 : 8) : 0;
      w.attack = Math.max(0, w.attack - 5);
    }
    if (aiHp <= 2) { w.block += 14; w.counter += 10; w.moveR += 10; if (dist === 1) w.attack += 5; }
    if (hpDiff >= 2 && dist === 1) { w.attack += 10; if (canPierce) w.pierce += 8; }
    if (hpDiff <= -2) { w.counter += 10; w.block += 9; }
    if (round >= 4 && dist === 1) w.attack += 4;
    // 노이즈 적용: 각 가중치를 65%~155% 범위로 흔들기
    Object.keys(w).forEach(k => { if (w[k] > 0) w[k] = Math.max(1, w[k] * (0.65 + Math.random() * 0.9)); });
  }

  return weightedRandom(w);
}

function generateAIActions(aiPid) {
  const ai = state.players[aiPid];
  const oppPid = aiPid === 1 ? 2 : 1;
  const opp = state.players[oppPid];
  const maxActions = getMaxActions(state.round) - ai.penalty;
  const actions = [];
  let simPos = ai.pos;
  let simStars = ai.stars;

  for (let i = 0; i < maxActions; i++) {
    const dist = Math.abs(simPos - opp.pos);
    const canLeap = i === 0 && maxActions >= 2 && dist === 1;
    const a = pickAIAction(simPos, opp.pos, simStars, ai.hp, opp.hp, ai.cornerTurns, state.turn, state.round, state.aiDifficulty, canLeap);
    if (a === 'leap') {
      actions.push('leap');
      actions.push('leap_hold');
      break;
    }
    actions.push(a);
    if (a === 'moveL' || a === 'moveR') simPos = computeMove(aiPid, simPos, a);
    if (a === 'pierce') simStars = Math.max(0, simStars - PIERCE_COST);
  }
  return actions;
}

// ==================== 정령 선택 화면 ====================
function runSetupScreen() {
  state.vsAI = false;
  state.humanPid = 1;
  state.aiDifficulty = 'normal';

  const modePVP = document.getElementById('setupModePVP');
  const modeCPU = document.getElementById('setupModeCPU');
  const diffSelect = document.getElementById('setupDiffSelect');
  const diffBtns = { normal: document.getElementById('setupDiffNormal'), advanced: document.getElementById('setupDiffAdvanced'), master: document.getElementById('setupDiffMaster') };
  let pendingCPU = false;
  let picked = false;
  let pendingAdvance = null;

  modePVP.classList.add('active');
  modeCPU.classList.remove('active');
  if (diffSelect) diffSelect.style.display = 'none';
  Object.values(diffBtns).forEach(b => b && b.classList.remove('active'));
  if (diffBtns.normal) diffBtns.normal.classList.add('active');

  const resetPick = () => {
    if (pendingAdvance) { clearTimeout(pendingAdvance); pendingAdvance = null; }
    picked = false;
    setupP1.classList.remove('picked', 'dim');
    setupP2.classList.remove('picked', 'dim');
    setupResult.innerHTML = '';
    curtainBtn.style.display = 'none';
  };

  modePVP.onclick = () => {
    SFX.uiClick();
    pendingCPU = false;
    modePVP.classList.add('active');
    modeCPU.classList.remove('active');
    if (diffSelect) diffSelect.style.display = 'none';
    resetPick();
  };

  modeCPU.onclick = () => {
    SFX.uiClick();
    pendingCPU = true;
    modeCPU.classList.add('active');
    modePVP.classList.remove('active');
    if (diffSelect) diffSelect.style.display = 'flex';
    resetPick();
  };

  Object.entries(diffBtns).forEach(([diff, btn]) => {
    if (!btn) return;
    btn.onclick = () => {
      SFX.uiClick();
      state.aiDifficulty = diff;
      Object.values(diffBtns).forEach(b => b && b.classList.remove('active'));
      btn.classList.add('active');
      resetPick();
    };
  });

  resetPick();

  showCurtain({ mode: 'setup' }, () => {
    state.vsAI = pendingCPU;
    runFirstPlayerDraw();
  });

  const handlePick = (pid) => {
    if (picked) return;
    picked = true;
    SFX.uiClick();
    const otherPid = pid === 1 ? 2 : 1;
    setupP1.classList.toggle('picked', pid === 1);
    setupP2.classList.toggle('picked', pid === 2);
    setupP1.classList.toggle('dim', pid === 2);
    setupP2.classList.toggle('dim', pid === 1);
    if (pendingCPU) {
      state.humanPid = pid;
      const diffLabel = t(`setup.diff.${state.aiDifficulty}`);
      setupResult.innerHTML = t('setup.chosen.cpu', { mine: pname(pid), other: pname(otherPid) }) + `<br><span style="font-size:13px;opacity:0.7">${diffLabel}</span>`;
    } else {
      setupResult.innerHTML = t('setup.chosen', { mine: pname(pid), other: pname(otherPid) });
    }
    // Continue 버튼 숨김 — 픽 즉시 자동 진행 (등장 효과 본 후 다음 단계)
    curtainBtn.style.display = 'none';
    pendingAdvance = setTimeout(() => { pendingAdvance = null; curtainBtn.click(); }, 700);
  };

  setupP1.onclick = () => handlePick(1);
  setupP2.onclick = () => handlePick(2);
}

// ==================== 선공 추첨 연출 ====================
async function runFirstPlayerDraw() {
  drawResult.textContent = '';
  drawP1.classList.remove('chosen', 'blinking');
  drawP2.classList.remove('chosen', 'blinking');
  showCurtain({ mode: 'draw' }, null);
  SFX.init();

  await sleep(400);

  drawTitle.textContent = t('curtain.draw.title.rolling');
  const totalSteps = 12;
  let step = 0;
  while (step < totalSteps) {
    if (step % 2 === 0) {
      drawP1.classList.add('blinking');
      drawP2.classList.remove('blinking');
    } else {
      drawP2.classList.add('blinking');
      drawP1.classList.remove('blinking');
    }
    SFX.sfxDrawTick(step % 2 === 0);
    const delay = 80 + step * 20;
    await sleep(delay);
    step++;
  }
  drawP1.classList.remove('blinking');
  drawP2.classList.remove('blinking');

  const chosen = Math.random() < 0.5 ? 1 : 2;
  state.firstPlayer = chosen;

  const chosenName = t(`player.${chosen}`);
  if (chosen === 1) drawP1.classList.add('chosen');
  else drawP2.classList.add('chosen');
  curtain.setAttribute('data-theme', `p${chosen}`);
  drawResult.textContent = '';
  drawTitle.textContent = t('curtain.draw.result', { name: chosenName });
  SFX.sfxDrawComplete(chosen === 1);

  await sleep(1500);

  curtainBtn.style.display = 'inline-block';
  curtainBtn.textContent = t('btn.beginDuel');
  curtainBtn.onclick = () => {
    hideCurtain();
    const firstName = t('curtain.turnName', { name: t(`player.${state.firstPlayer}`) });
    showCurtain({ mode: 'handoff', title: firstName, sub: t('curtain.draw.handoffSub'), themePid: state.firstPlayer }, () => {
      triggerAIIfNeeded();
      renderTurnInfo();
    });
  };
}

// ==================== 재시작 ====================
restartBtn.addEventListener('click', () => {
  state.round = 1;
  state.matchScore = { 1: 0, 2: 0 };
  state.turn = 1;
  state.phase = 'first_input';
  state.firstPlayer = 1;
  state.players[1] = { hp: MAX_HP, pos: START_POS_P1, actions: [], penalty: 0, cornerTurns: 0, stars: 0 };
  state.players[2] = { hp: MAX_HP, pos: START_POS_P2, actions: [], penalty: 0, cornerTurns: 0, stars: 0 };
  endmodal.classList.remove('show');
  renderAll();
  runSetupScreen();
});

// ==================== 초기화 ====================
function renderAll() {
  renderBoard();
  renderHP();
  renderStars(null);
  renderTurnInfo();
  renderCornerStates();
  renderMatchScore(null);
}

// 로케일 적용 후 초기 렌더 — 저장값 > 브라우저 언어 > en
(function initLocale() {
  let loc = null;
  try { loc = localStorage.getItem('sd_locale'); } catch (e) {}
  if (!loc) loc = (navigator.language || 'en').slice(0, 2);
  setLocale(I18N[loc] ? loc : 'en');
})();
renderAll();
runSetupScreen();

// ==================== 입력 가드 (드래그·우클릭·모바일 제스처 차단) ====================
(function setupInputGuards() {
  // 우클릭 컨텍스트 메뉴 차단 (데스크톱·안드로이드 롱프레스 일부)
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // 드래그 차단 (이미지/토큰/SVG 드래그 방지)
  document.addEventListener('dragstart', (e) => e.preventDefault());

  // iOS Safari: 두 손가락 핀치 줌 차단 (gesture* 이벤트)
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(ev => {
    document.addEventListener(ev, (e) => e.preventDefault());
  });

  // 안드로이드: pull-to-refresh 보강 (overscroll-behavior CSS 가 주, 폴백)
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) e.preventDefault(); // 멀티터치 줌 차단
  }, { passive: false });
})();

// ==================== 뷰포트 자동 조절 ====================
// 화면비에 따라 --app-scale 산출. transform: scale + origin center 로 시각만 축소.
// .wrap 은 --app-scale, .curtain-inner/.endmodal-inner 는 --overlay-scale (별도 산출).
// 모바일 세로(coarse + portrait)면 CSS 회전 안내가 뜸 → 스케일 1 유지.
(function setupViewportFit() {
  const root = document.documentElement;
  const wrap = document.querySelector('.wrap');
  if (!wrap) return;

  const MARGIN_X = 12;
  const MARGIN_Y = 8;
  const FALLBACK_W = 980;
  const FALLBACK_H = 720;

  let pending = false;
  function fit() {
    pending = false;

    const isPortraitTouch =
      window.matchMedia('(orientation: portrait) and (pointer: coarse)').matches;
    if (isPortraitTouch) {
      root.style.setProperty('--app-scale', '1');
      return;
    }

    // 자연 크기 측정용으로 일단 스케일 1 적용
    root.style.setProperty('--app-scale', '1');
    root.style.setProperty('--overlay-scale', '1');

    // 강제 layout flush
    void wrap.offsetHeight;

    const naturalW = Math.max(wrap.offsetWidth, FALLBACK_W * 0.5);
    const naturalH = Math.max(wrap.offsetHeight, FALLBACK_H * 0.5);

    // 커튼이 떠 있을 땐 그 자연 높이도 고려
    const curtainInner = document.querySelector('.curtain-inner');
    let cH = 0, cW = 0;
    if (curtainInner) {
      cH = curtainInner.offsetHeight;
      cW = curtainInner.offsetWidth;
    }

    // 노치/펀치홀 (viewport-fit=cover) — CSS env() 를 커스텀 프로퍼티로 읽음
    const cs = getComputedStyle(root);
    const safe = (n) => parseFloat(cs.getPropertyValue(n)) || 0;
    const vw = window.innerWidth - safe('--safe-l') - safe('--safe-r');
    const vh = window.innerHeight - safe('--safe-t') - safe('--safe-b');
    // 큰 화면에서도 콘텐츠가 viewport 채우도록 업스케일 허용 (캡 1.7)
    const MAX_SCALE = 1.7;
    const scaleFor = (w, h) => Math.min(MAX_SCALE, (vw - MARGIN_X) / w, (vh - MARGIN_Y) / h);
    root.style.setProperty('--app-scale', scaleFor(naturalW, naturalH).toFixed(4));
    // 커튼/종료 모달은 보드보다 훨씬 작아 별도 스케일 — 폰 가로에서 Ready 버튼이 보드 축소율에 끌려가지 않음
    const endInner = document.querySelector('.endmodal-inner');
    const oW = Math.max(cW, endInner ? endInner.offsetWidth : 0, 1);
    const oH = Math.max(cH, endInner ? endInner.offsetHeight : 0, 1);
    root.style.setProperty('--overlay-scale', scaleFor(oW, oH).toFixed(4));
  }

  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(fit);
  }

  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', () => setTimeout(fit, 150));
  // 커튼/모달 토글 직후도 재계산 필요 — class 변경 감지.
  // subtree: 커튼 내부 섹션(셋업 난이도 행 등) display 토글로 자연 크기가 바뀌어도 --overlay-scale 재산출
  const observerTargets = ['curtain', 'endmodal'].map(id => document.getElementById(id)).filter(Boolean);
  if (observerTargets.length && 'MutationObserver' in window) {
    const mo = new MutationObserver(schedule);
    observerTargets.forEach(el => mo.observe(el, { attributes: true, attributeFilter: ['class', 'style'], subtree: true }));
  }

  // 초기 계산 — 폰트 로드 후 다시 한번
  fit();
  window.addEventListener('load', () => setTimeout(fit, 50));
  if (document.fonts?.ready) document.fonts.ready.then(fit);
})();
