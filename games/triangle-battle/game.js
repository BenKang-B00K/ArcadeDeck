(() => {
  // --- Audio Engine (Procedural SFX) ---
  const audio = (() => {
    let ctx = null;
    const init = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); };

    const playTone = (freq, type, duration, volume, slide = 0) => {
      init();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slide !== 0) osc.frequency.exponentialRampToValueAtTime(slide, ctx.currentTime + duration);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    };

    return {
      playConnect: () => playTone(800, 'sine', 0.1, 0.2, 1200), // Ching
      playTriangle: () => { // Pop/Explosion
        playTone(150, 'triangle', 0.3, 0.4, 40);
        playTone(400, 'square', 0.1, 0.1);
      },
      playTurn: () => playTone(300, 'sine', 0.1, 0.15, 450), // Turn change
      playTick: () => playTone(1200, 'sine', 0.02, 0.05, 800), // Clock tick
      playStart: () => { // Game Start fanfare
        playTone(440, 'sine', 0.1, 0.2, 880);
        setTimeout(() => playTone(660, 'sine', 0.3, 0.2, 1320), 100);
      }
    };
  })();

  // --- i18n ---
  const STRINGS = {
    ko: {
      title: '트라이앵글 배틀!',
      subtitle: '삼각형 땅따먹기',
      playerCount: '플레이어 수',
      players2: '2명', players3: '3명', players4: '4명',
      pegCount: 'PEG 수',
      pegs10: '10개', pegs15: '15개', pegs20: '20개', pegs25: '25개',
      boardLayout: '보드 레이아웃',
      layoutRandom: '랜덤', layoutCircle: '원형', layoutTriangle: '삼각형', layoutSquare: '사각형',
      turnTime: '턴 시간',
      unlimited: '무제한', sec10: '10초', sec20: '20초',
      startGame: '게임 시작',
      footerHint: 'PEG를 선택하고 이어서 삼각형을 만드세요!',
      gameOver: '게임 종료!',
      playAgain: '다시 하기',
      turnOf: (name) => `${name}의 차례`,
      gameEnded: '게임 종료',
      alreadyConnected: '이미 연결된 선입니다!',
      crossesLine: '다른 선과 교차합니다!',
      timeUp: '시간 초과!',
      nameBanned: (name) => `"${name}" — 사용할 수 없는 이름입니다.`,
      nameTooLong: '이름은 15자 이하로 입력해주세요.',
      nameDuplicate: '중복된 이름이 있습니다.',
      tie: '무승부!',
      win: '승리!',
      statLines: (e, t) => `총 <strong>${e}</strong>개의 선 · <strong>${t}</strong>개의 삼각형`,
      rotateLandscape: '화면을 가로로 돌려주세요',
    },
    en: {
      title: 'Triangle Battle!',
      subtitle: 'Claim your territory!',
      playerCount: 'Players',
      players2: '2P', players3: '3P', players4: '4P',
      pegCount: 'Pegs',
      pegs10: '10', pegs15: '15', pegs20: '20', pegs25: '25',
      boardLayout: 'Board Layout',
      layoutRandom: 'Random', layoutCircle: 'Circle', layoutTriangle: 'Triangle', layoutSquare: 'Square',
      turnTime: 'Turn Time',
      unlimited: 'None', sec10: '10s', sec20: '20s',
      startGame: 'Start Game',
      footerHint: 'Select PEGs and connect them to form triangles!',
      gameOver: 'Game Over!',
      playAgain: 'Play Again',
      turnOf: (name) => `${name}'s turn`,
      gameEnded: 'Game Over',
      alreadyConnected: 'Already connected!',
      crossesLine: 'Lines would cross!',
      timeUp: 'Time\'s up!',
      nameBanned: (name) => `"${name}" — This name is not allowed.`,
      nameTooLong: 'Name must be 15 characters or less.',
      nameDuplicate: 'Duplicate names found.',
      tie: 'Tie!',
      win: 'Wins!',
      statLines: (e, t) => `<strong>${e}</strong> lines · <strong>${t}</strong> triangles`,
      rotateLandscape: 'Please rotate to landscape mode',
    }
  };

  let currentLang = 'ko';
  function t(key, ...args) {
    const val = STRINGS[currentLang][key];
    return typeof val === 'function' ? val(...args) : val;
  }

  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (STRINGS[currentLang][key] !== undefined) {
        const val = STRINGS[currentLang][key];
        el.textContent = typeof val === 'function' ? '' : val;
      }
    });
  }

  // --- Constants ---
  const PLAYER_COLORS = ['#e94560', '#00d2ff', '#50fa7b', '#f1fa8c'];
  const PLAYER_COLORS_RGB = [[233,69,96],[0,210,255],[80,250,123],[241,250,140]];
  const DEFAULT_NAMES = ['A', 'B', 'C', 'D'];
  let PLAYER_NAMES = [...DEFAULT_NAMES];

  // --- Profanity filter ---
  const BANNED_WORDS = [
    '시발','씨발','시바','씨바','ㅅㅂ','ㅆㅂ','시팔','씨팔',
    '개새끼','새끼','ㅅㄲ','개새','썅','쌍','병신','ㅂㅅ','빙신','벼신',
    '지랄','ㅈㄹ','좆','ㅈㅇ','자지','보지','ㅂㅈ','ㅈㅈ',
    '미친','ㅁㅊ','미챤','미쳤','미틴',
    '꺼져','닥쳐','닥치','뒤져','뒈져','디져','디져라','뒤져라',
    '죽어','죽여','찢어','년','놈','넘','놈아','년아',
    '호구','또라이','돌아이','또라','등신','멍청','바보','얼간이',
    '쓰레기','쓰래기','인간쓰레기','폐급',
    '느금마','느금','니미','니엄','엄창','에미','애미','애비','에비',
    '한남','한녀','맘충','김치녀','된장녀','틀딱','장애','장애인',
    'tlqkf','Tlqkf','ㅗ','凸',
    'fuck','fuk','fck','f u c k','fucker','fucking','fk','fking',
    'shit','sh1t','sht','bullshit','bitch','b1tch','btch',
    'ass','asshole','a$$','arsehole','damn','dammit','damm',
    'dick','d1ck','dck','cock','c0ck','pussy','puss','pu$$y',
    'whore','wh0re','slut','sl ut','bastard','b@stard',
    'cunt','c*nt','cnt','nigger','n1gger','nigga','n1gga','negro',
    'retard','retarded','r3tard','fag','faggot','f@g','f@ggot',
    'stfu','gtfo','wtf','lmfao','crap','piss',
    'kill','die','murder','suicide','rape','molest',
    'nazi','hitler','holocaust','terrorist','bomb','shoot',
    'くそ','クソ','ばか','バカ','しね','死ね','きもい','キモい',
    'アホ','うざい','ウザい','ちんこ','まんこ',
    '他妈','妈的','操','草泥马','傻逼','滚','狗','婊',
    '@ss','b!tch','sh!t','d!ck','f*ck','a**','p*ssy',
    '엿먹','씹','좃','잡것','잡놈','잡년','상놈',
    '찐따','찐다','쪼다','쪼다리','구더기',
    '걸레','화냥','화냥년','창녀','창남',
    '변태','성추행','성폭행','꼴값','꼴통','개돼지','돼지',
    '문디','꼬붕','앰창','좆밥','씹창',
  ];
  function containsBannedWord(name) {
    const lower = name.toLowerCase().replace(/\s+/g, '');
    for (const word of BANNED_WORDS) {
      if (lower.includes(word.toLowerCase())) return word;
    }
    return null;
  }

  function isMobile() {
    return window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768;
  }

  // --- Scaling ---
  const BOARD_MARGIN = 0.15;
  const MIN_PEG_DIST_RATIO = 0.085;
  const EDGE_WIDTH_RATIO = 0.004;

  let boardSize;
  let PEG_RADIUS, PEG_HIT_RADIUS, EDGE_WIDTH;

  function updateScale() {
    PEG_RADIUS = Math.max(5, boardSize * 0.012);
    PEG_HIT_RADIUS = Math.max(14, boardSize * 0.028);
    EDGE_WIDTH = Math.max(1.5, boardSize * EDGE_WIDTH_RATIO);
  }

  // --- State ---
  let canvas, ctx, container;
  let pegs = [], edges = [], triangles = [];
  let playerCount = 2, pegCount = 15, currentPlayer = 0;
  let scores = [];
  let consecutiveTimeouts = 0; // If all players skip consecutively, end game
  let selectedPeg = null, hoveredPeg = null;
  let gameOver = false;

  // Animation
  let animTriangles = [];
  let animFrame = null;
  let xMark = null;

  // Particle effects
  let particles = [];       // triangle creation sparks
  let screenFlash = 0;      // flash alpha (decays)
  let screenFlashColor = [255,255,255];
  let gameEndAnim = null;   // {birth, player} for final shockwave

  // Pan
  let panX = 0, panY = 0;
  let dragging = false;
  let dragStartX, dragStartY, panStartX, panStartY;
  let dragMoved = false;
  const DRAG_THRESHOLD = 8;

  // Timer
  let timeLimit = 20; // Default 20
  let turnStartTime = 0;
  let timerInterval = null;

  // --- DOM ---
  const setupScreen = document.getElementById('setup-screen');
  const gameScreen = document.getElementById('game-screen');
  const playerCountSel = document.getElementById('player-count');
  const pegCountSel = document.getElementById('peg-count');
  const boardLayoutSel = document.getElementById('board-layout');
  const timeLimitSel = document.getElementById('time-limit');  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const resultOverlay = document.getElementById('result-overlay');
  const resultList = document.getElementById('result-list');
  const nameInputsDiv = document.getElementById('name-inputs');
  const nameErrorDiv = document.getElementById('name-error');
  const timerBarWrap = document.getElementById('timer-bar-wrap');
  const timerBar = document.getElementById('timer-bar');
  const timerBarWrapMirror = document.getElementById('timer-bar-wrap-mirror');
  const timerBarMirror = document.getElementById('timer-bar-mirror');

  // HUD elements (top + bottom)
  const hudEls = {
    top: {
      info: document.getElementById('player-info-top'),
      turn: document.getElementById('turn-info-top'),
    },
    bottom: {
      info: document.getElementById('player-info-bottom'),
      turn: document.getElementById('turn-info-bottom'),
    }
  };

  // --- Language toggle ---
  const langBtn = document.getElementById('lang-btn');
  langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'ko' ? 'en' : 'ko';
    applyI18n();
    buildNameInputs();
  });
  applyI18n(); // initial

  // --- Name inputs ---
  function buildNameInputs() {
    const count = parseInt(playerCountSel.value);
    nameInputsDiv.innerHTML = '';
    nameErrorDiv.classList.add('hidden');
    for (let i = 0; i < count; i++) {
      const row = document.createElement('div');
      row.className = 'name-input-row';
      row.innerHTML = `
        <span class="name-dot" style="background:${PLAYER_COLORS[i]}"></span>
        <input type="text" maxlength="15" placeholder="${DEFAULT_NAMES[i]}" id="name-input-${i}" autocomplete="off">
      `;
      nameInputsDiv.appendChild(row);
    }
  }
  playerCountSel.addEventListener('change', buildNameInputs);
  buildNameInputs();

  function validateAndSetNames() {
    const count = parseInt(playerCountSel.value);
    PLAYER_NAMES = [];
    nameErrorDiv.classList.add('hidden');
    for (let i = 0; i < count; i++)
      document.getElementById(`name-input-${i}`).classList.remove('invalid');
    for (let i = 0; i < count; i++) {
      const input = document.getElementById(`name-input-${i}`);
      let name = input.value.trim() || DEFAULT_NAMES[i];
      if (containsBannedWord(name)) {
        input.classList.add('invalid');
        nameErrorDiv.textContent = t('nameBanned', name);
        nameErrorDiv.classList.remove('hidden');
        return false;
      }
      const maxLen = 15;
      if (name.length > maxLen) {
        input.classList.add('invalid');
        nameErrorDiv.textContent = t('nameTooLong');
        nameErrorDiv.classList.remove('hidden');
        return false;
      }
      PLAYER_NAMES.push(name);
    }
    if (new Set(PLAYER_NAMES.map(n => n.toLowerCase())).size < PLAYER_NAMES.length) {
      nameErrorDiv.textContent = t('nameDuplicate');
      nameErrorDiv.classList.remove('hidden');
      return false;
    }
    return true;
  }

  // --- Init ---
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', () => {
    resultOverlay.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    cancelAnimationFrame(animFrame);
    clearInterval(timerInterval);
  });
  window.addEventListener('resize', () => {
    if (!gameScreen.classList.contains('hidden')) setupBoard();
  });

  function startGame() {
    if (!validateAndSetNames()) return;
    audio.playStart();
    playerCount = parseInt(playerCountSel.value);
    pegCount = parseInt(pegCountSel.value);
    timeLimit = parseInt(timeLimitSel.value);
    currentPlayer = 0;
    consecutiveTimeouts = 0;
    scores = Array(playerCount).fill(0);
    edges = []; triangles = []; animTriangles = [];
    selectedPeg = null; hoveredPeg = null;
    gameOver = false; xMark = null;
    particles = []; screenFlash = 0; gameEndAnim = null;

    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    initCanvas();
    generatePegs();
    initBgEffects();
    buildHUD();
    startTimer();
    startAnimLoop();
  }

  function initCanvas() {
    canvas = document.getElementById('board');
    container = document.getElementById('board-container');
    ctx = canvas.getContext('2d');
    setupBoard();
    bindInputs();
  }

  // Minimap
  let minimap, minimapCtx;
  let minimapMirror, minimapMirrorCtx;
  const MINIMAP_SIZE_RATIO = 0.15;

  function setupBoard() {
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    boardSize = Math.max(cw, ch) * 0.7;
    canvas.width = boardSize;
    canvas.height = boardSize;
    updateScale();
    panX = (cw - boardSize) / 2;
    panY = (ch - boardSize) / 2;
    clampPan();
    applyPan();
    setupMinimap();
  }

  function setupMinimap() {
    minimap = document.getElementById('minimap');
    minimapMirror = document.getElementById('minimap-mirror');
    const mSize = Math.round(Math.min(container.clientWidth, container.clientHeight) * MINIMAP_SIZE_RATIO);
    for (const m of [minimap, minimapMirror]) {
      m.width = mSize;
      m.height = mSize;
      m.style.width = mSize + 'px';
      m.style.height = mSize + 'px';
    }
    minimapCtx = minimap.getContext('2d');
    minimapMirrorCtx = minimapMirror.getContext('2d');
  }

  function applyPan() {
    canvas.style.left = panX + 'px';
    canvas.style.top = panY + 'px';
  }

  function clampPan() {
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    // If board is smaller than container in a dimension, center it
    if (boardSize <= cw) {
      panX = (cw - boardSize) / 2;
    } else {
      panX = Math.max(cw - boardSize, Math.min(0, panX));
    }
    if (boardSize <= ch) {
      panY = (ch - boardSize) / 2;
    } else {
      panY = Math.max(ch - boardSize, Math.min(0, panY));
    }
  }

  // --- Timer ---
  function startTimer() {
    clearInterval(timerInterval);
    turnStartTime = Date.now();
    if (timeLimit > 0) {
      timerBarWrap.classList.remove('hidden');
      timerBarWrapMirror.classList.remove('hidden');
      updateTimerBar();
      timerInterval = setInterval(timerTick, 100);
    } else {
      timerBarWrap.classList.add('hidden');
      timerBarWrapMirror.classList.add('hidden');
    }
  }

  function resetTurnTimer() {
    turnStartTime = Date.now();
  }

  function timerTick() {
    if (gameOver) { clearInterval(timerInterval); return; }
    const elapsed = (Date.now() - turnStartTime) / 1000;
    updateTimerBar();

    // Tick-tock when < 4s remaining
    if (timeLimit > 0 && timeLimit - elapsed <= 4 && timeLimit - elapsed > 0) {
      if (Math.floor(elapsed * 10) % 10 === 0) { // Approx once per second
        audio.playTick();
      }
    }

    if (elapsed >= timeLimit) {
      // Time's up — skip turn
      selectedPeg = null;
      showMessage(t('timeUp'));
      consecutiveTimeouts++;

      if (consecutiveTimeouts >= playerCount) {
        // All players timed out consecutively — end game
        gameOver = true;
        updateHUD();
        clearInterval(timerInterval);
        screenFlash = 0.6;
        screenFlashColor = [255, 255, 255];
        gameEndAnim = { birth: performance.now(), player: currentPlayer };
        setTimeout(showResults, 1200);
        return;
      }

      currentPlayer = (currentPlayer + 1) % playerCount;
      audio.playTurn();
      updateHUD();
      resetTurnTimer();
    }
  }

  function updateTimerBar() {
    if (timeLimit <= 0) return;
    const elapsed = (Date.now() - turnStartTime) / 1000;
    const ratio = Math.max(0, 1 - elapsed / timeLimit);
    const widthStr = (ratio * 100) + '%';
    const [r, g, b] = PLAYER_COLORS_RGB[currentPlayer];
    const colorStr = ratio > 0.3
      ? `rgba(${r},${g},${b},0.8)`
      : `rgba(255,${Math.round(ratio / 0.3 * 160)},60,0.9)`;
    timerBar.style.width = widthStr;
    timerBar.style.background = colorStr;
    timerBarMirror.style.width = widthStr;
    timerBarMirror.style.background = colorStr;
  }

  // --- Input ---
  function bindInputs() {
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    container.addEventListener('contextmenu', e => e.preventDefault());
  }

  function getCanvasCoords(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function onPointerDown(e) {
    if (e.button && e.button !== 0) return;
    dragging = true; dragMoved = false;
    dragStartX = e.clientX; dragStartY = e.clientY;
    panStartX = panX; panStartY = panY;
    container.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const idx = getPegAt(coords.x, coords.y);
    if (hoveredPeg !== idx) hoveredPeg = idx;
    if (!dragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (!dragMoved && Math.hypot(dx, dy) > DRAG_THRESHOLD) dragMoved = true;
    if (dragMoved) {
      panX = panStartX + dx;
      panY = panStartY + dy;
      clampPan();
      applyPan();
    }
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    if (!dragMoved) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      handleTap(coords.x, coords.y);
    }
    // Touch devices: clear hover after lifting finger (no persistent hover)
    if (e.pointerType === 'touch') {
      hoveredPeg = null;
    }
  }

  function handleTap(cx, cy) {
    if (gameOver) return;
    const idx = getPegAt(cx, cy);
    if (idx === null) { selectedPeg = null; return; }
    if (selectedPeg === null) { selectedPeg = idx; }
    else if (selectedPeg === idx) { selectedPeg = null; }
    else { tryConnect(selectedPeg, idx); selectedPeg = null; }
  }

  // --- PEG Generation ---
  function generatePegs() {
    pegs = [];
    const pad = BOARD_MARGIN;
    const area = (1 - pad * 2);
    const minDist = MIN_PEG_DIST_RATIO;
    const layout = boardLayoutSel ? boardLayoutSel.value : 'random';

    const addPegIfOk = (nx, ny) => {
      for (const p of pegs) {
        if (Math.hypot(p.nx - nx, p.ny - ny) < minDist) return false;
      }
      pegs.push({ nx, ny, id: pegs.length });
      return true;
    };

    if (layout === 'circle') {
      const centerX = 0.5, centerY = 0.5;
      const radius = area * 0.45;
      const count = Math.min(pegCount, 12);
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2;
        addPegIfOk(centerX + Math.cos(ang) * radius, centerY + Math.sin(ang) * radius);
      }
      if (pegCount > 12) addPegIfOk(centerX, centerY);
    } else if (layout === 'triangle') {
      const topX = 0.5, topY = pad;
      const leftX = pad, leftY = 1 - pad;
      const rightX = 1 - pad, rightY = 1 - pad;
      addPegIfOk(topX, topY);
      addPegIfOk(leftX, leftY);
      addPegIfOk(rightX, rightY);
      // Midpoints
      addPegIfOk((topX + leftX) / 2, (topY + leftY) / 2);
      addPegIfOk((topX + rightX) / 2, (topY + rightY) / 2);
      addPegIfOk((leftX + rightX) / 2, (leftY + rightY) / 2);
    } else if (layout === 'square') {
      addPegIfOk(pad, pad);
      addPegIfOk(1 - pad, pad);
      addPegIfOk(pad, 1 - pad);
      addPegIfOk(1 - pad, 1 - pad);
      addPegIfOk(0.5, pad);
      addPegIfOk(0.5, 1 - pad);
      addPegIfOk(pad, 0.5);
      addPegIfOk(1 - pad, 0.5);
    }

    // Fill remaining with random candidates
    const cols = Math.ceil(Math.sqrt(pegCount * 1.5));
    const rows = cols;
    const cellW = area / cols;
    const cellH = area / rows;
    const candidates = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = pad + (c + 0.2 + Math.random() * 0.6) * cellW;
        const ny = pad + (r + 0.2 + Math.random() * 0.6) * cellH;
        candidates.push({ nx, ny });
      }
    }
    // Shuffle and pick
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    for (const c of candidates) {
      if (pegs.length >= pegCount) break;
      addPegIfOk(c.nx, c.ny);
    }

    // Fallback fill
    let attempts = 0;
    while (pegs.length < pegCount && attempts < 2000) {
      addPegIfOk(pad + Math.random() * area, pad + Math.random() * area);
      attempts++;
    }

    // Lloyd relaxation (1 pass for non-random to keep shape but fix overlaps)
    const iters = (layout === 'random') ? 2 : 1;
    for (let iter = 0; iter < iters; iter++) {
      for (let i = 0; i < pegs.length; i++) {
        let sx = 0, sy = 0, count = 0;
        for (let j = 0; j < pegs.length; j++) {
          if (i === j) continue;
          const d = Math.hypot(pegs[i].nx - pegs[j].nx, pegs[i].ny - pegs[j].ny);
          if (d < minDist * 2.5) {
            const dx = pegs[i].nx - pegs[j].nx;
            const dy = pegs[i].ny - pegs[j].ny;
            const force = 1 / (d + 0.001);
            sx += dx * force;
            sy += dy * force;
            count++;
          }
        }
        if (count > 0) {
          const strength = 0.015;
          pegs[i].nx = Math.max(pad, Math.min(1 - pad, pegs[i].nx + sx * strength));
          pegs[i].ny = Math.max(pad, Math.min(1 - pad, pegs[i].ny + sy * strength));
        }
      }
    }
  }

  function px(p) { return { x: p.nx * boardSize, y: p.ny * boardSize }; }

  // --- HUD (top + bottom mirror) ---
  function buildHUD() {
    for (const pos of ['top', 'bottom']) {
      const infoDiv = hudEls[pos].info;
      infoDiv.innerHTML = '';
      for (let i = 0; i < playerCount; i++) {
        const badge = document.createElement('div');
        badge.className = 'player-badge' + (i === currentPlayer ? ' active' : '');
        badge.dataset.player = i;
        badge.dataset.pos = pos;
        const [r,g,b] = PLAYER_COLORS_RGB[i];
        badge.style.setProperty('--player-glow', `rgba(${r},${g},${b},0.5)`);
        badge.innerHTML = `<span class="dot" style="background:${PLAYER_COLORS[i]}"></span>${PLAYER_NAMES[i]}<span class="score">0</span>`;
        infoDiv.appendChild(badge);
      }
    }
    updateTurnInfo();
  }

  function updateHUD() {
    for (const pos of ['top', 'bottom']) {
      const badges = hudEls[pos].info.querySelectorAll('.player-badge');
      badges.forEach(badge => {
        const i = parseInt(badge.dataset.player);
        badge.classList.toggle('active', i === currentPlayer);
        badge.querySelector('.score').textContent = scores[i];
      });
    }
    updateTurnInfo();
  }

  function updateTurnInfo() {
    const text = gameOver ? t('gameEnded') : t('turnOf', PLAYER_NAMES[currentPlayer]);
    const color = PLAYER_COLORS[currentPlayer];
    for (const pos of ['top', 'bottom']) {
      hudEls[pos].turn.textContent = text;
      hudEls[pos].turn.style.color = color;
    }
  }

  // --- Edge / Triangle Logic ---
  function edgeExists(a, b) {
    return edges.some(e => (e.a === a && e.b === b) || (e.a === b && e.b === a));
  }
  function cross2(a, b, c) {
    return (b.nx - a.nx) * (c.ny - a.ny) - (b.ny - a.ny) * (c.nx - a.nx);
  }
  function onSeg(p, q, r) {
    return r.nx <= Math.max(p.nx, q.nx) && r.nx >= Math.min(p.nx, q.nx) &&
           r.ny <= Math.max(p.ny, q.ny) && r.ny >= Math.min(p.ny, q.ny);
  }
  function segmentsIntersect(p1, p2, p3, p4) {
    const d1 = cross2(p3, p4, p1), d2 = cross2(p3, p4, p2);
    const d3 = cross2(p1, p2, p3), d4 = cross2(p1, p2, p4);
    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
        ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
    if (d1 === 0 && onSeg(p3, p4, p1)) return true;
    if (d2 === 0 && onSeg(p3, p4, p2)) return true;
    if (d3 === 0 && onSeg(p1, p2, p3)) return true;
    if (d4 === 0 && onSeg(p1, p2, p4)) return true;
    return false;
  }
  function wouldCrossExistingEdge(a, b) {
    for (const e of edges) {
      if (e.a === a || e.b === a || e.a === b || e.b === b) continue;
      if (segmentsIntersect(pegs[a], pegs[b], pegs[e.a], pegs[e.b])) return true;
    }
    return false;
  }
  function triangleExists(a, b, c) {
    const s = [a, b, c].sort((x, y) => x - y);
    return triangles.some(t => {
      const ts = [t.a, t.b, t.c].sort((x, y) => x - y);
      return ts[0] === s[0] && ts[1] === s[1] && ts[2] === s[2];
    });
  }
  function pointInTriangle(ppx, ppy, ax, ay, bx, by, cx, cy) {
    const d1 = (ppx - bx) * (ay - by) - (ax - bx) * (ppy - by);
    const d2 = (ppx - cx) * (by - cy) - (bx - cx) * (ppy - cy);
    const d3 = (ppx - ax) * (cy - ay) - (cx - ax) * (ppy - ay);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  }
  function triangleContainsPeg(a, b, c) {
    const pa = pegs[a], pb = pegs[b], pc = pegs[c];
    for (let i = 0; i < pegs.length; i++) {
      if (i === a || i === b || i === c) continue;
      if (pointInTriangle(pegs[i].nx, pegs[i].ny, pa.nx, pa.ny, pb.nx, pb.ny, pc.nx, pc.ny))
        return true;
    }
    return false;
  }
  function findNewTriangles(a, b) {
    const found = [];
    for (let c = 0; c < pegs.length; c++) {
      if (c === a || c === b) continue;
      if (edgeExists(a, c) && edgeExists(b, c))
        if (!triangleExists(a, b, c) && !triangleContainsPeg(a, b, c))
          found.push({ a, b, c, player: currentPlayer });
    }
    return found;
  }
  function hasValidMoves() {
    for (let i = 0; i < pegs.length; i++)
      for (let j = i + 1; j < pegs.length; j++)
        if (!edgeExists(i, j) && !wouldCrossExistingEdge(i, j)) return true;
    return false;
  }

  // --- Game actions ---
  function getPegAt(cx, cy) {
    for (let i = 0; i < pegs.length; i++) {
      const p = px(pegs[i]);
      if (Math.hypot(p.x - cx, p.y - cy) < PEG_HIT_RADIUS) return i;
    }
    return null;
  }

  function tryConnect(a, b) {
    if (edgeExists(a, b)) { showInvalidX(a, b); showMessage(t('alreadyConnected')); return; }
    if (wouldCrossExistingEdge(a, b)) { showInvalidX(a, b); showMessage(t('crossesLine')); return; }

    consecutiveTimeouts = 0; // Reset counter on valid move
    edges.push({ a, b, player: currentPlayer, birth: performance.now() });
    const newTris = findNewTriangles(a, b);
    const now = performance.now();
    if (newTris.length > 0) {
      audio.playTriangle();
      for (const tri of newTris) {
        tri.number = scores[currentPlayer] + 1; // this player's Nth triangle
        triangles.push(tri);
        animTriangles.push({ ...tri, birth: now });
        scores[currentPlayer]++;
        spawnTriangleParticles(tri, currentPlayer);
      }
    } else {
      audio.playConnect();
    }

    if (newTris.length > 0) {
      const [r, g, b] = PLAYER_COLORS_RGB[currentPlayer];
      screenFlash = 0.35;
      screenFlashColor = [r, g, b];
    } else {
      currentPlayer = (currentPlayer + 1) % playerCount;
      audio.playTurn();
    }
    resetTurnTimer();
    updateHUD();
  }

  // --- Triangle creation particles ---
  function spawnTriangleParticles(tri, player) {
    const pa = px(pegs[tri.a]), pb = px(pegs[tri.b]), pc = px(pegs[tri.c]);
    const cx = (pa.x + pb.x + pc.x) / 3;
    const cy = (pa.y + pb.y + pc.y) / 3;
    const [r, g, b] = PLAYER_COLORS_RGB[player];
    const now = performance.now();
    // Burst of sparks from triangle center
    for (let i = 0; i < 18; i++) {
      const angle = (Math.PI * 2 / 18) * i + Math.random() * 0.3;
      const speed = boardSize * (0.001 + Math.random() * 0.003);
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1.5 + Math.random() * 2.5,
        color: [r, g, b],
        alpha: 1,
        birth: now,
        life: 600 + Math.random() * 400
      });
    }
    // Edge sparkle — particles along each edge
    const edgePts = [[pa, pb], [pb, pc], [pc, pa]];
    for (const [p1, p2] of edgePts) {
      for (let j = 0; j < 4; j++) {
        const t = Math.random();
        const ex = p1.x + (p2.x - p1.x) * t;
        const ey = p1.y + (p2.y - p1.y) * t;
        const angle = Math.random() * Math.PI * 2;
        const speed = boardSize * 0.0005 + Math.random() * boardSize * 0.001;
        particles.push({
          x: ex, y: ey,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 1 + Math.random() * 1.5,
          color: [r, g, b],
          alpha: 0.8,
          birth: now,
          life: 400 + Math.random() * 300
        });
      }
    }
  }

  function showInvalidX(a, b) {
    const pa = px(pegs[a]), pb = px(pegs[b]);
    xMark = { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2, birth: performance.now() };
  }

  // --- Message Toast ---
  let messageTimer = null, messageText = '';
  function showMessage(text) {
    messageText = text;
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => { messageText = ''; }, 1200);
  }

  // --- Results ---
  function showResults() {
    const ranked = scores.map((s, i) => ({ player: i, score: s }))
      .sort((a, b) => b.score - a.score);
    const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}', '4th'];
    const totalTri = triangles.length;
    const totalEdges = edges.length;
    const winner = ranked[0];
    const isTie = ranked.length > 1 && ranked[0].score === ranked[1].score;

    let html = '<div class="result-summary">';
    if (isTie) {
      const names = ranked.filter(r => r.score === winner.score)
        .map(r => `<span style="color:${PLAYER_COLORS[r.player]}">${PLAYER_NAMES[r.player]}</span>`).join(', ');
      html += `<div class="summary-winner">${t('tie')} ${names}</div>`;
    } else {
      html += `<div class="summary-winner"><span style="color:${PLAYER_COLORS[winner.player]};font-size:1.3em;font-weight:bold">${PLAYER_NAMES[winner.player]}</span> ${t('win')}</div>`;
    }
    html += `<div class="summary-stats">${t('statLines', totalEdges, totalTri)}</div></div>`;
    html += ranked.map((r, i) => `
      <div class="rank-entry">
        <span class="medal">${medals[i] || (i+1)+'th'}</span>
        <span style="color:${PLAYER_COLORS[r.player]};font-weight:600">${PLAYER_NAMES[r.player]}</span>
        <span>\u25B2 ${r.score}</span>
      </div>`).join('');
    resultList.innerHTML = html;
    applyI18n();
    resultOverlay.classList.remove('hidden');
  }

  // --- Animation Loop ---
  function startAnimLoop() {
    function loop(time) { draw(time); animFrame = requestAnimationFrame(loop); }
    animFrame = requestAnimationFrame(loop);
  }

  // --- Background particles (generated once) ---
  let bgStars = [];

  function initBgEffects() {
    bgStars = [];
    for (let i = 0; i < 80; i++) {
      bgStars.push({
        x: Math.random(), y: Math.random(),
        r: Math.random() * 1.2 + 0.3,
        speed: Math.random() * 0.3 + 0.1,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  // --- Drawing ---
  function draw(time) {
    if (!time) time = performance.now();
    const B = boardSize;
    ctx.clearRect(0, 0, B, B);
    drawBoardBackground(time);
    drawTriangles(time);
    drawEdges();
    drawPreviewLine(time);
    drawPegs(time);
    drawXMark(time);
    drawParticles(time);
    drawScreenFlash();
    drawGameEndAnim(time);
    drawVignette();
    drawMessage();
    drawMinimap();
  }

  function drawBoardBackground(time) {
    const B = boardSize;

    // Base fill — dark blue
    ctx.fillStyle = '#111a30';
    ctx.fillRect(0, 0, B, B);

    // Subtle radial gradient center glow
    const cg = ctx.createRadialGradient(B * 0.5, B * 0.5, 0, B * 0.5, B * 0.5, B * 0.55);
    cg.addColorStop(0, 'rgba(22,33,70,0.6)');
    cg.addColorStop(1, 'rgba(12,16,38,0)');
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, B, B);

    // Grid lines — very subtle
    ctx.save();
    const gridStep = B * 0.06;
    ctx.strokeStyle = 'rgba(80,100,160,0.06)';
    ctx.lineWidth = 1;
    for (let x = gridStep; x < B; x += gridStep) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, B); ctx.stroke();
    }
    for (let y = gridStep; y < B; y += gridStep) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(B, y); ctx.stroke();
    }
    ctx.restore();

    // Stars — twinkling
    for (const s of bgStars) {
      const twinkle = Math.sin(time * 0.001 * s.speed + s.phase) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(s.x * B, s.y * B, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,200,255,${0.08 + twinkle * 0.12})`;
      ctx.fill();
    }

    // Corner decorations — subtle triangle outlines
    const cornerSize = B * 0.06;
    const cornerPad = B * 0.025;
    ctx.save();
    ctx.strokeStyle = 'rgba(100,120,180,0.1)';
    ctx.lineWidth = 1.5;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(cornerPad, cornerPad);
    ctx.lineTo(cornerPad + cornerSize, cornerPad);
    ctx.lineTo(cornerPad, cornerPad + cornerSize);
    ctx.closePath(); ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(B - cornerPad, cornerPad);
    ctx.lineTo(B - cornerPad - cornerSize, cornerPad);
    ctx.lineTo(B - cornerPad, cornerPad + cornerSize);
    ctx.closePath(); ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(cornerPad, B - cornerPad);
    ctx.lineTo(cornerPad + cornerSize, B - cornerPad);
    ctx.lineTo(cornerPad, B - cornerPad - cornerSize);
    ctx.closePath(); ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(B - cornerPad, B - cornerPad);
    ctx.lineTo(B - cornerPad - cornerSize, B - cornerPad);
    ctx.lineTo(B - cornerPad, B - cornerPad - cornerSize);
    ctx.closePath(); ctx.stroke();
    ctx.restore();

  }

  function drawTriangles(time) {
    const B = boardSize;
    for (const t of triangles) {
      const pa = px(pegs[t.a]), pb = px(pegs[t.b]), pc = px(pegs[t.c]);
      const [r, g, b] = PLAYER_COLORS_RGB[t.player];
      const cx = (pa.x + pb.x + pc.x) / 3, cy = (pa.y + pb.y + pc.y) / 3;
      const anim = animTriangles.find(a => a.a === t.a && a.b === t.b && a.c === t.c && a.player === t.player);
      const age = anim ? (time - anim.birth) / 1000 : 999;
      const popScale = age < 0.35 ? easeOutBack(Math.min(age / 0.35, 1)) : 1;
      const pulse = Math.sin(time * 0.002 + t.a + t.b) * 0.06 + 1;

      ctx.save();
      ctx.translate(cx, cy); ctx.scale(popScale, popScale); ctx.translate(-cx, -cy);
      const glowSize = B * 0.03 * pulse;
      ctx.shadowColor = `rgba(${r},${g},${b},0.6)`; ctx.shadowBlur = glowSize;
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.lineTo(pc.x, pc.y); ctx.closePath();
      ctx.fillStyle = `rgba(${r},${g},${b},0.45)`; ctx.fill();
      ctx.shadowBlur = 0;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, B * 0.12);
      grad.addColorStop(0, `rgba(${r},${g},${b},0.3)`); grad.addColorStop(1, `rgba(${r},${g},${b},0.05)`);
      ctx.fillStyle = grad; ctx.fill();
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.7 + 0.2 * pulse})`;
      ctx.lineWidth = Math.max(2, EDGE_WIDTH * 0.8);
      ctx.shadowColor = `rgba(${r},${g},${b},0.5)`; ctx.shadowBlur = glowSize * 0.7; ctx.stroke();
      ctx.shadowBlur = 0;
      const fontSize = Math.max(10, B * 0.016);
      ctx.font = `bold ${fontSize}px Segoe UI, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(${r},${g},${b},${0.7 + 0.15 * pulse})`;
      const label = t.number ? `${PLAYER_NAMES[t.player]}#${t.number}` : PLAYER_NAMES[t.player];
      ctx.fillText(label, cx, cy);
      ctx.restore();
    }
  }

  const EDGE_ANIM_DURATION = 200; // ms for laser draw-in

  function drawEdges() {
    const now = performance.now();
    ctx.lineCap = 'round';
    for (const e of edges) {
      const pa = px(pegs[e.a]), pb = px(pegs[e.b]);
      const [r, g, b] = PLAYER_COLORS_RGB[e.player];

      // Laser draw-in progress (0→1)
      const age = e.birth ? now - e.birth : 9999;
      const progress = Math.min(1, age / EDGE_ANIM_DURATION);
      const eased = progress < 1 ? 1 - (1 - progress) * (1 - progress) : 1; // easeOutQuad

      const ex = pa.x + (pb.x - pa.x) * eased;
      const ey = pa.y + (pb.y - pa.y) * eased;

      // Glow behind
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(ex, ey);
      ctx.strokeStyle = `rgba(${r},${g},${b},0.3)`;
      ctx.lineWidth = EDGE_WIDTH * 2.5; ctx.stroke();

      // Main edge
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(ex, ey);
      ctx.strokeStyle = PLAYER_COLORS[e.player];
      ctx.lineWidth = EDGE_WIDTH; ctx.stroke();

      // Laser tip glow (while animating)
      if (progress < 1) {
        ctx.beginPath();
        ctx.arc(ex, ey, EDGE_WIDTH * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${0.5 * (1 - progress)})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex, ey, EDGE_WIDTH * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.7 * (1 - progress)})`;
        ctx.fill();
      }
    }
  }

  function drawPreviewLine(time) {
    if (selectedPeg === null || hoveredPeg === null || selectedPeg === hoveredPeg) return;
    const valid = !edgeExists(selectedPeg, hoveredPeg) && !wouldCrossExistingEdge(selectedPeg, hoveredPeg);
    const pa = px(pegs[selectedPeg]), pb = px(pegs[hoveredPeg]);
    const B = boardSize;

    if (valid) {
      // Valid preview — player-colored dashed line
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
      ctx.strokeStyle = PLAYER_COLORS[currentPlayer];
      ctx.lineWidth = EDGE_WIDTH * 0.8;
      ctx.setLineDash([B * 0.008, B * 0.005]); ctx.stroke(); ctx.setLineDash([]);
    } else {
      // Invalid preview — glitchy scanline effect
      const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2;
      const pulse = Math.sin(time * 0.008) * 0.15 + 0.85;
      const glitchOff = Math.sin(time * 0.03) * B * 0.003;

      ctx.save();
      // Distorted dashed line
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y + glitchOff); ctx.lineTo(pb.x, pb.y - glitchOff);
      ctx.strokeStyle = `rgba(255,60,80,${0.3 * pulse})`;
      ctx.lineWidth = EDGE_WIDTH * 0.4;
      ctx.setLineDash([B * 0.004, B * 0.008]); ctx.stroke(); ctx.setLineDash([]);

      // Prohibited sign — triangle with slash
      const signR = B * 0.022;
      ctx.translate(mx, my);

      // Outer hexagon-ish warning shape
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI * 2 / 6) * i - Math.PI / 2;
        const hx = Math.cos(a) * signR * 1.4;
        const hy = Math.sin(a) * signR * 1.4;
        if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(180,30,50,${0.15 * pulse})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255,70,90,${0.4 * pulse})`;
      ctx.lineWidth = Math.max(1, B * 0.002);
      ctx.stroke();

      // Inner X — clean thin lines
      ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(255,100,110,${0.7 * pulse})`;
      ctx.lineWidth = Math.max(1.5, B * 0.003);
      ctx.shadowColor = 'rgba(255,50,60,0.4)';
      ctx.shadowBlur = B * 0.006;
      const xs = signR * 0.6;
      ctx.beginPath();
      ctx.moveTo(-xs, -xs); ctx.lineTo(xs, xs);
      ctx.moveTo(xs, -xs); ctx.lineTo(-xs, xs);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.restore();
    }
  }

  function drawXMark(time) {
    if (!xMark) return;
    const age = (time - xMark.birth) / 1000;
    if (age > 1.0) { xMark = null; return; }
    const B = boardSize;

    // Phase 1: pop-in (0-0.15s), Phase 2: hold (0.15-0.5s), Phase 3: glitch-out (0.5-1.0s)
    let alpha, scale;
    if (age < 0.12) {
      alpha = age / 0.12;
      scale = easeOutBack(age / 0.12);
    } else if (age < 0.5) {
      alpha = 1;
      scale = 1;
    } else {
      alpha = 1 - (age - 0.5) / 0.5;
      scale = 1;
    }
    const signR = B * 0.035 * scale;
    const glitch = age > 0.5 ? Math.sin(time * 0.05) * B * 0.005 * (1 - alpha) : 0;

    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.translate(xMark.x + glitch, xMark.y);

    // Background — dark hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 / 6) * i - Math.PI / 2;
      const hx = Math.cos(a) * signR * 1.5;
      const hy = Math.sin(a) * signR * 1.5;
      if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(120,20,30,0.3)`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255,70,80,0.5)`;
    ctx.lineWidth = Math.max(1.5, B * 0.002);
    ctx.stroke();

    // X lines
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(255,40,50,0.7)';
    ctx.shadowBlur = B * 0.012;
    ctx.strokeStyle = '#ff5566';
    ctx.lineWidth = Math.max(2.5, B * 0.005);
    const xs = signR * 0.65;
    ctx.beginPath();
    ctx.moveTo(-xs, -xs); ctx.lineTo(xs, xs);
    ctx.moveTo(xs, -xs); ctx.lineTo(-xs, xs);
    ctx.stroke();

    // Scanline flash (brief)
    if (age < 0.3) {
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(255,200,200,${0.4 * (1 - age / 0.3)})`;
      ctx.lineWidth = Math.max(1, B * 0.001);
      for (let ly = -signR; ly < signR; ly += B * 0.006) {
        ctx.beginPath();
        ctx.moveTo(-signR * 1.3, ly);
        ctx.lineTo(signR * 1.3, ly);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // Draw a triangle path centered at (x,y) with radius r, rotated by angle
  function triPath(x, y, r, angle) {
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const a = angle + (Math.PI * 2 / 3) * i - Math.PI / 2;
      const tx = x + Math.cos(a) * r;
      const ty = y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);
    }
    ctx.closePath();
  }

  function drawPegs(time) {
    for (let i = 0; i < pegs.length; i++) {
      const p = px(pegs[i]);
      const isSelected = selectedPeg === i, isHovered = hoveredPeg === i;
      const baseR = PEG_RADIUS;
      const r = isSelected ? baseR * 2.4 : (isHovered ? baseR * 2 : baseR * 1.6);
      const spin = time * 0.001 + i * 0.7; // slow individual rotation
      const rot = isSelected ? spin : (isHovered ? spin * 0.5 : 0);

      ctx.save();

      // Outer glow ring (selected/hovered)
      if (isSelected || isHovered) {
        const [cr, cg, cb] = isSelected ? PLAYER_COLORS_RGB[currentPlayer] : [0, 210, 255];
        const pulse = Math.sin(time * 0.006 + i) * 0.3 + 0.7;

        // Pulsing outer triangle (wireframe)
        triPath(p.x, p.y, r * 2 * pulse, -rot * 0.5);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.3 * pulse})`;
        ctx.lineWidth = Math.max(1.5, boardSize * 0.002);
        ctx.stroke();

        // Glow halo
        ctx.shadowColor = `rgba(${cr},${cg},${cb},0.8)`;
        ctx.shadowBlur = boardSize * 0.025;
      }

      // Main triangle body
      triPath(p.x, p.y, r, rot);
      if (isSelected) {
        const [cr, cg, cb] = PLAYER_COLORS_RGB[currentPlayer];
        // Neon fill
        ctx.fillStyle = PLAYER_COLORS[currentPlayer];
        ctx.shadowColor = PLAYER_COLORS[currentPlayer];
        ctx.shadowBlur = boardSize * 0.02;
        ctx.fill();
        ctx.shadowBlur = 0;
        // Edge glow stroke
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},1)`;
        ctx.lineWidth = Math.max(2, boardSize * 0.004);
        ctx.stroke();
      } else if (isHovered) {
        ctx.fillStyle = '#d8efff';
        ctx.shadowColor = 'rgba(0,210,255,0.7)';
        ctx.shadowBlur = boardSize * 0.018;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(0,210,255,0.8)';
        ctx.lineWidth = Math.max(1.5, boardSize * 0.003);
        ctx.stroke();
      } else {
        // Default: cyberpunk style — brighter for visibility
        ctx.fillStyle = '#3a4a6a';
        ctx.fill();
        ctx.strokeStyle = 'rgba(120,170,255,0.55)';
        ctx.lineWidth = Math.max(1.5, boardSize * 0.0025);
        ctx.shadowColor = 'rgba(80,130,220,0.25)';
        ctx.shadowBlur = boardSize * 0.006;
        ctx.stroke();
      }

      // Inner detail: smaller inverted triangle (cyber circuit feel)
      const innerR = r * 0.4;
      triPath(p.x, p.y, innerR, rot + Math.PI);
      if (isSelected) {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
      } else if (isHovered) {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
      } else {
        ctx.fillStyle = 'rgba(100,160,255,0.2)';
      }
      ctx.fill();

      // Center dot — hot pixel
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, r * 0.15), 0, Math.PI * 2);
      if (isSelected) {
        ctx.fillStyle = '#fff';
      } else if (isHovered) {
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
      } else {
        ctx.fillStyle = 'rgba(140,180,255,0.6)';
      }
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  function drawMessage() {
    if (!messageText) return;
    const B = boardSize;
    const cw = container.clientWidth, ch = container.clientHeight;
    const viewCenterX = -panX + cw / 2, viewCenterY = -panY + ch * 0.85;
    ctx.save();
    const fontSize = Math.max(12, B * 0.02);
    ctx.font = `600 ${fontSize}px Segoe UI, sans-serif`;
    ctx.textAlign = 'center';
    const tw = ctx.measureText(messageText).width;
    const pad = B * 0.018;
    const bx = viewCenterX - tw / 2 - pad;
    const by = viewCenterY - fontSize * 0.6 - pad * 0.5;
    const bw = tw + pad * 2;
    const bh = fontSize * 1.4 + pad;
    const radius = B * 0.008;

    // Glass background with border
    roundRect(ctx, bx, by, bw, bh, radius);
    ctx.fillStyle = 'rgba(15,10,25,0.8)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,80,100,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Left accent bar
    ctx.fillStyle = '#ff5566';
    ctx.fillRect(bx, by + bh * 0.2, B * 0.003, bh * 0.6);

    // Text with subtle shadow
    ctx.shadowColor = 'rgba(255,60,80,0.4)';
    ctx.shadowBlur = B * 0.005;
    ctx.fillStyle = '#ff8899';
    ctx.fillText(messageText, viewCenterX, viewCenterY);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // --- Vignette (edge fade for seamless blend with background) ---
  function drawParticles(time) {
    particles = particles.filter(p => {
      const age = time - p.birth;
      if (age > p.life) return false;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += boardSize * 0.000005; // slight gravity
      p.vx *= 0.985;
      p.vy *= 0.985;
      const progress = age / p.life;
      const alpha = p.alpha * (1 - progress);
      const scale = 1 + progress * 0.5;
      const [r, g, b] = p.color;
      // Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * scale * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.15})`;
      ctx.fill();
      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
      // White hot center
      if (progress < 0.3) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * scale * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.6})`;
        ctx.fill();
      }
      return true;
    });
  }

  function drawScreenFlash() {
    if (screenFlash <= 0.005) return;
    const [r, g, b] = screenFlashColor;
    ctx.save();
    ctx.globalAlpha = screenFlash;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, boardSize, boardSize);
    ctx.restore();
    screenFlash *= 0.88; // rapid decay
  }

  function drawGameEndAnim(time) {
    if (!gameEndAnim) return;
    const age = (time - gameEndAnim.birth) / 1000;
    if (age > 2.5) { gameEndAnim = null; return; }
    const B = boardSize;
    const cx = B * 0.5, cy = B * 0.5;

    // Shockwave ring expanding from center
    const waveRadius = age * B * 0.5;
    const waveAlpha = Math.max(0, 0.6 - age * 0.3);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${waveAlpha})`;
    ctx.lineWidth = Math.max(2, B * 0.008 * (1 - age * 0.3));
    ctx.shadowColor = 'rgba(255,255,255,0.5)';
    ctx.shadowBlur = B * 0.02;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Second wave (delayed)
    if (age > 0.15) {
      const age2 = age - 0.15;
      const r2 = age2 * B * 0.4;
      const a2 = Math.max(0, 0.4 - age2 * 0.25);
      const [r, g, b] = PLAYER_COLORS_RGB[gameEndAnim.player];
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${a2})`;
      ctx.lineWidth = Math.max(1.5, B * 0.005);
      ctx.stroke();
      ctx.restore();
    }

    // Radial light burst lines
    if (age < 1.0) {
      const lineAlpha = Math.max(0, 0.3 - age * 0.3);
      ctx.save();
      ctx.strokeStyle = `rgba(255,255,255,${lineAlpha})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * 2 / 16) * i;
        const innerR = B * 0.03 + age * B * 0.15;
        const outerR = age * B * 0.55;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
        ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Spawn ending particles (once, at the start)
    if (age < 0.05 && particles.length < 60) {
      const [r, g, b] = PLAYER_COLORS_RGB[gameEndAnim.player];
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = boardSize * (0.002 + Math.random() * 0.005);
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 2 + Math.random() * 3,
          color: i % 3 === 0 ? [255, 255, 255] : [r, g, b],
          alpha: 1,
          birth: time,
          life: 800 + Math.random() * 700
        });
      }
    }
  }

  function drawVignette() {
    const B = boardSize;
    const fade = B * 0.12; // fade width

    // Top
    let g = ctx.createLinearGradient(0, 0, 0, fade);
    g.addColorStop(0, 'rgba(10,10,26,0.8)');
    g.addColorStop(1, 'rgba(10,10,26,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, B, fade);

    // Bottom
    g = ctx.createLinearGradient(0, B, 0, B - fade);
    g.addColorStop(0, 'rgba(10,10,26,0.8)');
    g.addColorStop(1, 'rgba(10,10,26,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, B - fade, B, fade);

    // Left
    g = ctx.createLinearGradient(0, 0, fade, 0);
    g.addColorStop(0, 'rgba(10,10,26,0.8)');
    g.addColorStop(1, 'rgba(10,10,26,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, fade, B);

    // Right
    g = ctx.createLinearGradient(B, 0, B - fade, 0);
    g.addColorStop(0, 'rgba(10,10,26,0.8)');
    g.addColorStop(1, 'rgba(10,10,26,0)');
    ctx.fillStyle = g;
    ctx.fillRect(B - fade, 0, fade, B);
  }

  // --- Minimap ---
  function drawMinimap() {
    if (!minimapCtx) return;
    const mW = minimap.width, mH = minimap.height;
    const scale = mW / boardSize;
    const mc = minimapCtx;

    mc.clearRect(0, 0, mW, mH);
    mc.fillStyle = 'rgba(22,33,62,0.9)';
    mc.fillRect(0, 0, mW, mH);

    // Triangles (simplified)
    for (const t of triangles) {
      const pa = pegs[t.a], pb = pegs[t.b], pc = pegs[t.c];
      const [r, g, b] = PLAYER_COLORS_RGB[t.player];
      mc.beginPath();
      mc.moveTo(pa.nx * mW, pa.ny * mH);
      mc.lineTo(pb.nx * mW, pb.ny * mH);
      mc.lineTo(pc.nx * mW, pc.ny * mH);
      mc.closePath();
      mc.fillStyle = `rgba(${r},${g},${b},0.4)`;
      mc.fill();
    }

    // Edges
    mc.lineCap = 'round';
    for (const e of edges) {
      const pa = pegs[e.a], pb = pegs[e.b];
      mc.beginPath();
      mc.moveTo(pa.nx * mW, pa.ny * mH);
      mc.lineTo(pb.nx * mW, pb.ny * mH);
      mc.strokeStyle = PLAYER_COLORS[e.player];
      mc.lineWidth = Math.max(1, scale * EDGE_WIDTH);
      mc.stroke();
    }

    // Pegs
    const pr = Math.max(1.5, scale * PEG_RADIUS);
    for (const p of pegs) {
      mc.beginPath();
      mc.arc(p.nx * mW, p.ny * mH, pr, 0, Math.PI * 2);
      mc.fillStyle = '#aab';
      mc.fill();
    }

    // Viewport rectangle
    const cw = container.clientWidth, ch = container.clientHeight;
    const vx = -panX * scale;
    const vy = -panY * scale;
    const vw = cw * scale;
    const vh = ch * scale;
    mc.strokeStyle = 'rgba(255,255,255,0.6)';
    mc.lineWidth = 1.5;
    mc.strokeRect(vx, vy, vw, vh);

    // Copy to mirror minimap (CSS handles the 180deg rotation)
    if (minimapMirrorCtx) {
      minimapMirrorCtx.clearRect(0, 0, mW, mH);
      minimapMirrorCtx.drawImage(minimap, 0, 0);
    }
  }

  // --- Utility ---
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  function easeOutBack(t) {
    const c = 1.7;
    return 1 + (t - 1) * (t - 1) * ((c + 1) * (t - 1) + c);
  }
})();
