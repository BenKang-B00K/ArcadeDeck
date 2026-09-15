(() => {
  // --- Audio Engine (Procedural SFX) ---
  const audio = (() => {
    let ctx = null;
    const init = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); };

    const playTone = (freq, type, duration, volume, slide = 0) => {
      init();
      if (ctx.state !== 'running') ctx.resume(); // 'suspended' or Safari's 'interrupted'
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
      guideTitle: '게임 방법',
      guide1: 'PEG 두 개를 차례로 탭하면 선이 그어집니다.',
      guide2: '선은 이미 있는 선과 교차할 수 없습니다.',
      guide3: '삼각형을 완성하면 +1점, 한 번 더! 세 변이 모두 내 색이면 +2점. (안에 PEG가 있으면 무효)',
      guide4: '더 이상 그을 선이 없으면 종료. 삼각형이 가장 많은 사람이 승리!',
      guideTip: '보드는 드래그해서 움직일 수 있어요. 턴 시간이 끝나면 상대가 무작위 선 하나를 얻습니다.',
      guideOk: '알겠어요!',
      playerCount: '플레이어 수',
      players2: '2명', players3: '3명', players4: '4명', players5: '5명', players6: '6명',
      pegCount: 'PEG 수',
      pegs10: '10개', pegs15: '15개', pegs20: '20개', pegs25: '25개',
      turnTime: '턴 시간',
      sec10: '10초', sec20: '20초',
      startGame: '게임 시작',
      gameOver: '게임 종료!',
      playAgain: '다시 하기',
      turnOf: (name) => `${name}의 차례`,
      gameEnded: '게임 종료',
      alreadyConnected: '이미 연결된 선입니다!',
      crossesLine: '다른 선과 교차합니다!',
      passesPeg: '다른 PEG 위를 지나갑니다!',
      timeUp: '시간 초과! 상대에게 선 하나',
      nameDuplicate: '중복된 이름이 있습니다.',
      tie: '무승부!',
      win: '승리!',
      statLines: (e, t) => `총 <strong>${e}</strong>개의 선 · <strong>${t}</strong>개의 삼각형`,
      rotateLandscape: '화면을 가로로 돌려주세요',
    },
    en: {
      title: 'Triangle Battle!',
      guideTitle: 'How to Play',
      guide1: 'Tap two pegs one after another to draw a line.',
      guide2: 'A line cannot cross any existing line.',
      guide3: 'Close a triangle: +1 point and an extra turn. All 3 sides your color: +2. (No peg inside!)',
      guide4: 'Game ends when no more lines fit. Most triangles wins!',
      guideTip: 'Drag to pan the board. When the timer runs out, your opponent gets a free random line.',
      guideOk: 'Got it!',
      playerCount: 'Players',
      players2: '2P', players3: '3P', players4: '4P', players5: '5P', players6: '6P',
      pegCount: 'Pegs',
      pegs10: '10', pegs15: '15', pegs20: '20', pegs25: '25',
      turnTime: 'Turn Time',
      sec10: '10s', sec20: '20s',
      startGame: 'Start Game',
      gameOver: 'Game Over!',
      playAgain: 'Play Again',
      turnOf: (name) => `${name}'s turn`,
      gameEnded: 'Game Over',
      alreadyConnected: 'Already connected!',
      crossesLine: 'Lines would cross!',
      passesPeg: 'Line passes over a peg!',
      timeUp: 'Time\'s up! Opponent gets a line',
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
  const PLAYER_RGB = ['233,69,96', '0,210,255', '80,250,123', '241,250,140', '189,147,249', '255,150,50'];
  const PLAYER_COLORS = PLAYER_RGB.map(c => `rgb(${c})`);
  const DEFAULT_NAMES = ['A', 'B', 'C', 'D', 'E', 'F'];
  let PLAYER_NAMES = [...DEFAULT_NAMES];

  // --- Scaling ---
  const BOARD_MARGIN = 0.15;
  const MIN_PEG_DIST_RATIO = 0.085;
  const EDGE_WIDTH_RATIO = 0.004;

  let boardSize;
  let PEG_RADIUS, PEG_HIT_RADIUS, EDGE_WIDTH;

  function updateScale() {
    PEG_RADIUS = Math.max(5, boardSize * 0.012);
    PEG_HIT_RADIUS = Math.max(22, boardSize * 0.04); // >=44px touch target; peg spacing is 0.085*B so no overlap
    EDGE_WIDTH = Math.max(1.5, boardSize * EDGE_WIDTH_RATIO);
  }

  // --- State ---
  let pegs = [], edges = [], triangles = [];
  let playerCount = 2, pegCount = 15, currentPlayer = 0;
  let scores = [];
  let selectedPeg = null, hoveredPeg = null;
  let gameOver = false;

  // Animation
  let animFrame = null;
  let xMark = null;

  // Particle effects
  let particles = [];       // triangle creation sparks
  let screenFlash = 0;      // flash alpha (decays)
  let screenFlashColor = '255,255,255';
  let gameEndAnim = null;   // {birth, player} for final shockwave

  // Pan
  let panX = 0, panY = 0;
  let viewW = 0, viewH = 0, viewLeft = 0, viewTop = 0; // container size/offset, cached — no layout reads in the frame loop
  let dragging = false;
  let dragPointerId = null; // ponytail: first finger wins, extra touches ignored
  let dragStartX, dragStartY, panStartX, panStartY;
  let dragMoved = false;
  const DRAG_THRESHOLD = 8;

  // Timer
  let timeLimit = 20; // Default 20
  let turnStartTime = 0;
  let timerInterval = null;
  let lastTick = 0;

  // --- DOM ---
  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');
  const container = document.getElementById('board-container');
  const portraitQuery = matchMedia('(pointer: coarse) and (orientation: portrait) and (max-width: 768px)'); // same query that shows #rotate-notice
  const minimap = document.getElementById('minimap');
  const minimapCtx = minimap.getContext('2d');
  const minimapMirror = document.getElementById('minimap-mirror');
  const minimapMirrorCtx = minimapMirror.getContext('2d');
  const triLayer = document.createElement('canvas'); // settled triangles, see drawTriangles
  const triCtx = triLayer.getContext('2d');
  let triLayerCount = -1; // triangles.length the layer holds; -1 = blank
  const setupScreen = document.getElementById('setup-screen');
  const gameScreen = document.getElementById('game-screen');
  const playerCountSel = document.getElementById('player-count');
  const pegCountSel = document.getElementById('peg-count');
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

  // --- Guide (how to play) ---
  const guideOverlay = document.getElementById('guide-overlay');
  const openGuide = () => guideOverlay.classList.remove('hidden');
  const closeGuide = () => {
    guideOverlay.classList.add('hidden');
    try { localStorage.setItem('tb_guide_seen', '1'); } catch {}
  };
  document.getElementById('guide-btn').addEventListener('click', openGuide);
  document.getElementById('guide-close').addEventListener('click', closeGuide);
  guideOverlay.addEventListener('click', e => { if (e.target === guideOverlay) closeGuide(); });
  try { if (!localStorage.getItem('tb_guide_seen')) openGuide(); } catch {}

  // --- Name inputs ---
  function buildNameInputs() {
    const count = parseInt(playerCountSel.value);
    nameInputsDiv.innerHTML = '';
    nameErrorDiv.classList.add('hidden');
    nameInputsDiv.classList.toggle('two-col', count > 4); // 5-6 players: two columns so the card fits on phones
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
      PLAYER_NAMES.push(document.getElementById(`name-input-${i}`).value.trim() || DEFAULT_NAMES[i]);
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
    stopAnimLoop();
    clearInterval(timerInterval);
  });
  window.addEventListener('resize', () => {
    if (!gameScreen.classList.contains('hidden')) setupBoard();
  });
  // Mobile: edge-swipe "back" during a pan must not leave the game — re-push while playing
  window.addEventListener('popstate', () => {
    if (!gameScreen.classList.contains('hidden')) history.pushState('game', '');
  });
  // Wake lock is released when the page is hidden; re-request on return
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !gameScreen.classList.contains('hidden')) navigator.wakeLock?.request('screen').catch(() => {});
  });

  function startGame() {
    if (!validateAndSetNames()) return;
    audio.playStart();
    // Mobile hardening (all no-ops where unsupported): keep screen on, trap back gesture,
    // fullscreen + landscape lock (Android; iPhone has no element fullscreen)
    navigator.wakeLock?.request('screen').catch(() => {});
    if (history.state !== 'game') history.pushState('game', '');
    document.documentElement.requestFullscreen?.({ navigationUI: 'hide' })
      .then(() => screen.orientation.lock('landscape')).catch(() => {});
    playerCount = parseInt(playerCountSel.value);
    pegCount = parseInt(pegCountSel.value);
    timeLimit = parseInt(timeLimitSel.value);
    currentPlayer = 0;
    scores = Array(playerCount).fill(0);
    edges = []; triangles = [];
    selectedPeg = null; hoveredPeg = null;
    gameOver = false; xMark = null;
    particles = []; screenFlash = 0; gameEndAnim = null;

    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    buildHUD(); // before setupBoard: HUD height decides the container size we measure
    setupBoard();
    generatePegs();
    initBgEffects();
    startTimer();
    startAnimLoop();
  }

  const MINIMAP_SIZE_RATIO = 0.15;
  let minimapSize = 0;

  function setupBoard() {
    const rect = container.getBoundingClientRect();
    viewW = rect.width; viewH = rect.height; viewLeft = rect.left; viewTop = rect.top;
    boardSize = Math.max(viewW, viewH) * 0.7;
    // ponytail: DPR capped at 2 and backing store at ~2048px — shadowBlur cost scales with pixel count
    const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.max(1, 2048 / boardSize));
    canvas.width = canvas.height = triLayer.width = triLayer.height = boardSize * dpr;
    canvas.style.width = canvas.style.height = boardSize + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    triCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    triLayerCount = -1; minimapKey = ''; // resized canvases are blank — force redraw
    canvas.style.setProperty('--grid', (boardSize * 0.06) + 'px'); // CSS triangular grid spacing
    updateScale();
    for (const p of pegs) { p.x = p.nx * boardSize; p.y = p.ny * boardSize; }
    panX = (viewW - boardSize) / 2;
    panY = (viewH - boardSize) / 2;
    clampPan();
    applyPan();
    minimapSize = Math.round(Math.min(viewW, viewH) * MINIMAP_SIZE_RATIO);
    for (const m of [minimap, minimapMirror]) {
      m.width = m.height = minimapSize * dpr;
      m.style.width = m.style.height = minimapSize + 'px';
    }
    minimapCtx.setTransform(dpr, 0, 0, dpr, 0, 0); // mirror ctx stays identity: drawImage copies device px 1:1
  }

  function applyPan() {
    // transform, not left/top: moves the composited layer without re-layout or repainting the CSS box-shadows
    canvas.style.transform = `translate3d(${panX}px,${panY}px,0)`;
  }

  function clampPan() {
    const cw = viewW, ch = viewH;
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
    turnStartTime = lastTick = Date.now();
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

  function timerTick() {
    if (gameOver) { clearInterval(timerInterval); return; }
    const now = Date.now();
    // Pause while hidden/rotated; a gap > 500ms means the tab was throttled or JS suspended (iOS)
    if (document.hidden || portraitQuery.matches || now - lastTick > 500) turnStartTime += now - lastTick;
    lastTick = now;
    const elapsed = (now - turnStartTime) / 1000;
    updateTimerBar();

    // Tick-tock when < 4s remaining
    if (timeLimit > 0 && timeLimit - elapsed <= 4 && timeLimit - elapsed > 0) {
      if (Math.floor(elapsed * 10) % 10 === 0) { // Approx once per second
        audio.playTick();
      }
    }

    if (elapsed >= timeLimit) {
      // Time's up — opponent (next player) gets a random line, then it's their turn
      selectedPeg = null;
      showMessage(t('timeUp'));
      const opp = (currentPlayer + 1) % playerCount;
      const moves = validMoves();
      if (moves.length) placeEdge(...moves[Math.floor(Math.random() * moves.length)], opp);
      currentPlayer = opp;
      audio.playTurn();
      turnStartTime = Date.now();
      updateHUD();
      wakeAnimLoop();
      if (!validMoves().length) endGame();
    }
  }

  function endGame() {
    gameOver = true;
    clearInterval(timerInterval);
    updateHUD();
    screenFlash = 0.6;
    screenFlashColor = '255,255,255';
    gameEndAnim = { birth: performance.now(), player: currentPlayer };
    setTimeout(showResults, 1200);
  }

  function updateTimerBar() {
    if (timeLimit <= 0) return;
    const elapsed = (Date.now() - turnStartTime) / 1000;
    const ratio = Math.max(0, 1 - elapsed / timeLimit);
    const scaleStr = `scaleX(${ratio})`; // transform, not width: compositor-only, no layout per tick
    const colorStr = ratio > 0.3
      ? `rgba(${PLAYER_RGB[currentPlayer]},0.8)`
      : `rgba(255,${Math.round(ratio / 0.3 * 160)},60,0.9)`;
    timerBar.style.transform = scaleStr;
    timerBar.style.background = colorStr;
    timerBarMirror.style.transform = scaleStr;
    timerBarMirror.style.background = colorStr;
  }

  // --- Input ---
  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointercancel', onPointerUp);
  container.addEventListener('contextmenu', e => e.preventDefault());

  function getCanvasCoords(clientX, clientY) {
    return { x: clientX - viewLeft - panX, y: clientY - viewTop - panY }; // CSS px on the board; ctx is DPR-scaled
  }

  function onPointerDown(e) {
    if (e.button && e.button !== 0) return;
    if (dragging) return;
    const rect = container.getBoundingClientRect(); // one layout read per gesture, before any pan write
    viewLeft = rect.left; viewTop = rect.top;
    wakeAnimLoop();
    dragPointerId = e.pointerId;
    dragging = true; dragMoved = false;
    dragStartX = e.clientX; dragStartY = e.clientY;
    panStartX = panX; panStartY = panY;
    container.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (dragging && e.pointerId !== dragPointerId) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const idx = getPegAt(coords.x, coords.y);
    if (idx !== hoveredPeg) { hoveredPeg = idx; wakeAnimLoop(); }
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
    if (!dragging || e.pointerId !== dragPointerId) return;
    dragging = false;
    wakeAnimLoop();
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
  // Each layout seeds a shape; the rest is filled by random scatter.
  // Coordinates are 0..1 board-normalized. add() enforces min distance and pegCount cap.
  const LAYOUTS = {
    scatter: () => {},
    circle: (add, ring) => { ring(0.5, 0.5, 0.315, Math.min(pegCount, 12)); add(0.5, 0.5); },
    rings: (add, ring) => { ring(0.5, 0.5, 0.33, 10); ring(0.5, 0.5, 0.16, 5, Math.PI / 5); add(0.5, 0.5); },
    hexagon: (add, ring) => { ring(0.5, 0.5, 0.33, 6, -Math.PI / 2); ring(0.5, 0.5, 0.17, 6, -Math.PI / 2 + Math.PI / 6); add(0.5, 0.5); },
    star: (add, ring) => { ring(0.5, 0.5, 0.34, 5, -Math.PI / 2); ring(0.5, 0.5, 0.15, 5, -Math.PI / 2 + Math.PI / 5); },
    triangle: (add, ring, poly) => poly([[0.5, 0.15], [0.15, 0.85], [0.85, 0.85]], 3),
    diamond: (add, ring, poly) => poly([[0.5, 0.15], [0.85, 0.5], [0.5, 0.85], [0.15, 0.5]], 2),
    square: (add, ring, poly) => poly([[0.15, 0.15], [0.85, 0.15], [0.85, 0.85], [0.15, 0.85]], 2),
    grid: (add) => { for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) add(0.15 + c * 0.35, 0.15 + r * 0.35); },
    cross: (add) => { for (let k = 0; k < 5; k++) { add(0.5, 0.15 + k * 0.175); add(0.15 + k * 0.175, 0.5); } },
    xshape: (add) => { for (let k = 0; k < 5; k++) { const t = 0.15 + k * 0.175; add(t, t); add(t, 1 - t); } },
    spiral: (add) => { for (let i = 0; i < 14; i++) { const t = i / 13, a = t * Math.PI * 4, r = 0.04 + t * 0.31; add(0.5 + Math.cos(a) * r, 0.5 + Math.sin(a) * r); } },
  };

  function generatePegs() {
    pegs = [];
    const pad = BOARD_MARGIN;
    const area = (1 - pad * 2);

    const add = (nx, ny) => {
      if (pegs.length >= pegCount) return false;
      for (const p of pegs) {
        if (Math.hypot(p.nx - nx, p.ny - ny) < MIN_PEG_DIST_RATIO) return false;
      }
      pegs.push({ nx, ny, x: nx * boardSize, y: ny * boardSize, id: pegs.length }); // x,y: board CSS px, refreshed in setupBoard
      return true;
    };
    // n points evenly on a circle
    const ring = (cx, cy, r, n, rot = 0) => {
      for (let i = 0; i < n; i++) {
        const a = rot + (i / n) * Math.PI * 2;
        add(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
    };
    // polygon corners plus `div` points spread along each side
    const poly = (pts, div) => {
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        for (let k = 0; k < div; k++) add(ax + (bx - ax) * k / div, ay + (by - ay) * k / div);
      }
    };

    const names = Object.keys(LAYOUTS);
    LAYOUTS[names[Math.floor(Math.random() * names.length)]](add, ring, poly);

    // Fill remaining by dart throwing — add() enforces minDist
    // ponytail: rejection sampling; ~29% packing at 25 pegs, add Poisson-disc if pegCount grows
    let attempts = 0;
    while (pegs.length < pegCount && attempts < 2000) {
      add(pad + Math.random() * area, pad + Math.random() * area);
      attempts++;
    }
  }

  // --- HUD (top + bottom mirror) ---
  function buildHUD() {
    for (const pos of ['top', 'bottom']) {
      const infoDiv = hudEls[pos].info;
      infoDiv.innerHTML = '';
      for (let i = 0; i < playerCount; i++) {
        const badge = document.createElement('div');
        badge.className = 'player-badge' + (i === currentPlayer ? ' active' : '');
        badge.dataset.player = i;
        badge.style.setProperty('--player-glow', `rgba(${PLAYER_RGB[i]},0.5)`);
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
  function findEdge(a, b) {
    return edges.find(e => (e.a === a && e.b === b) || (e.a === b && e.b === a));
  }
  function edgeExists(a, b) { return !!findEdge(a, b); }
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
  const PEG_CLEARANCE = 0.03; // normalized; peg body is ~0.02, so a line must clear it with margin
  function segPointDist(a, b, p) {
    const dx = b.nx - a.nx, dy = b.ny - a.ny;
    const t = Math.max(0, Math.min(1, ((p.nx - a.nx) * dx + (p.ny - a.ny) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(p.nx - (a.nx + t * dx), p.ny - (a.ny + t * dy));
  }
  function passesOverPeg(a, b) {
    for (let i = 0; i < pegs.length; i++)
      if (i !== a && i !== b && segPointDist(pegs[a], pegs[b], pegs[i]) < PEG_CLEARANCE) return true;
    return false;
  }
  // The one place edge rules live. Returns an i18n key naming the violation, or null if legal.
  function invalidReason(a, b) {
    if (edgeExists(a, b)) return 'alreadyConnected';
    if (wouldCrossExistingEdge(a, b)) return 'crossesLine';
    if (passesOverPeg(a, b)) return 'passesPeg';
    return null;
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
  function findNewTriangles(a, b, player) {
    const found = [];
    for (let c = 0; c < pegs.length; c++) {
      if (c === a || c === b) continue;
      if (edgeExists(a, c) && edgeExists(b, c))
        if (!triangleExists(a, b, c) && !triangleContainsPeg(a, b, c))
          found.push({ a, b, c, player });
    }
    return found;
  }
  function validMoves() {
    const moves = [];
    for (let i = 0; i < pegs.length; i++)
      for (let j = i + 1; j < pegs.length; j++)
        if (!invalidReason(i, j)) moves.push([i, j]);
    return moves;
  }

  // --- Game actions ---
  function getPegAt(cx, cy) {
    for (let i = 0; i < pegs.length; i++) {
      const p = pegs[i];
      if (Math.hypot(p.x - cx, p.y - cy) < PEG_HIT_RADIUS) return i;
    }
    return null;
  }

  function tryConnect(a, b) {
    const why = invalidReason(a, b);
    if (why) { showInvalidX(a, b); showMessage(t(why)); return; }

    if (placeEdge(a, b, currentPlayer) === 0) { // no triangle → turn passes
      currentPlayer = (currentPlayer + 1) % playerCount;
      audio.playTurn();
    }
    turnStartTime = Date.now();
    updateHUD();
    if (!validMoves().length) endGame();
  }

  // Commit edge a-b for `player` and score any triangles it closes. Returns the triangle count.
  function placeEdge(a, b, player) {
    if (invalidReason(a, b)) return 0; // never commit an illegal edge, whoever asks
    edges.push({ a, b, player, birth: performance.now() });
    const newTris = findNewTriangles(a, b, player);
    const now = performance.now();
    for (const tri of newTris) {
      // All 3 sides this player's color → 2 points (the a-b side is theirs by construction)
      tri.points = findEdge(tri.a, tri.c).player === player && findEdge(tri.b, tri.c).player === player ? 2 : 1;
      tri.number = triangles.filter(t => t.player === player).length + 1; // this player's Nth triangle
      tri.birth = now;
      triangles.push(tri);
      scores[player] += tri.points;
      spawnTriangleParticles(tri, player);
    }
    if (newTris.length > 0) {
      audio.playTriangle();
      screenFlash = 0.35;
      screenFlashColor = PLAYER_RGB[player];
    } else {
      audio.playConnect();
    }
    return newTris.length;
  }

  // --- Triangle creation particles ---
  function spawnTriangleParticles(tri, player) {
    const pa = pegs[tri.a], pb = pegs[tri.b], pc = pegs[tri.c];
    const cx = (pa.x + pb.x + pc.x) / 3;
    const cy = (pa.y + pb.y + pc.y) / 3;
    const color = PLAYER_RGB[player];
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
        color,
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
          color,
          alpha: 0.8,
          birth: now,
          life: 400 + Math.random() * 300
        });
      }
    }
  }

  function showInvalidX(a, b) {
    const pa = pegs[a], pb = pegs[b];
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
    const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}', '4th', '5th', '6th']; // max 6 players
    const totalTri = triangles.length;
    const totalEdges = edges.length;
    const winner = ranked[0];
    const isTie = ranked[0].score === ranked[1].score;

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
        <span class="medal">${medals[i]}</span>
        <span style="color:${PLAYER_COLORS[r.player]};font-weight:600">${PLAYER_NAMES[r.player]}</span>
        <span>\u25B2 ${r.score}</span>
      </div>`).join('');
    resultList.innerHTML = html;
    resultOverlay.classList.remove('hidden');
    stopAnimLoop(); // overlay covers the board; keep the GPU off the backdrop blur
  }

  // --- Animation Loop ---
  // ponytail: turn-based game — between moves only star twinkle runs, so idle frames drop to IDLE_FPS
  const IDLE_FPS = 20;
  let idleTimer = null;
  function isAnimating(time) {
    return dragging || particles.length > 0 || xMark !== null || screenFlash > 0.005 || gameEndAnim !== null ||
      messageText !== '' || selectedPeg !== null || hoveredPeg !== null ||
      (edges.length > 0 && time - edges[edges.length - 1].birth < EDGE_ANIM_DURATION) ||
      (triangles.length > 0 && time - triangles[triangles.length - 1].birth < TRI_POP_MS);
  }
  function loop(time) {
    idleTimer = null;
    draw(time);
    if (isAnimating(time)) animFrame = requestAnimationFrame(loop);
    else idleTimer = setTimeout(() => { animFrame = requestAnimationFrame(loop); }, 1000 / IDLE_FPS);
  }
  function startAnimLoop() { stopAnimLoop(); animFrame = requestAnimationFrame(loop); }
  function stopAnimLoop() { cancelAnimationFrame(animFrame); clearTimeout(idleTimer); idleTimer = null; }
  // Input while idle: draw now instead of waiting out the idle delay
  function wakeAnimLoop() {
    if (idleTimer === null) return;
    clearTimeout(idleTimer); idleTimer = null;
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
    const B = boardSize;
    ctx.clearRect(0, 0, B, B);
    drawStars(time);
    drawTriangles(time);
    drawEdges();
    drawPreviewLine(time);
    drawPegs(time);
    drawXMark(time);
    drawParticles(time);
    drawScreenFlash();
    drawGameEndAnim(time);
    drawMessage();
    drawMinimap();
  }

  // Base fill, glow, grid and edge vignette live in CSS on canvas#board
  // ponytail: twinkle alpha quantized to 8 buckets, one path+fill per bucket instead of 80 fillStyle strings a frame
  const STAR_FILLS = Array.from({ length: 8 }, (_, b) => `rgba(180,200,255,${(0.08 + (b + 0.5) / 8 * 0.12).toFixed(3)})`);
  function drawStars(time) {
    const B = boardSize;
    for (const s of bgStars) s.bucket = Math.min(7, ((Math.sin(time * 0.001 * s.speed + s.phase) * 0.5 + 0.5) * 8) | 0);
    for (let b = 0; b < 8; b++) {
      ctx.beginPath();
      for (const s of bgStars) {
        if (s.bucket !== b) continue;
        ctx.moveTo(s.x * B + s.r, s.y * B);
        ctx.arc(s.x * B, s.y * B, s.r, 0, Math.PI * 2);
      }
      ctx.fillStyle = STAR_FILLS[b];
      ctx.fill();
    }
  }

  // Settled triangles are static: rendered once into triLayer, redrawn only when the settled set changes.
  // Triangles are pushed in birth order, so the settled ones are always a prefix of the array.
  // ponytail: dropped the 6% glow pulse — it cost two shadowBlur passes per triangle per frame
  const TRI_POP_MS = 350;
  function drawTriangles(time) {
    const B = boardSize;
    let settled = 0;
    while (settled < triangles.length && time - triangles[settled].birth >= TRI_POP_MS) settled++;
    if (settled !== triLayerCount) {
      triCtx.clearRect(0, 0, B, B);
      for (let i = 0; i < settled; i++) drawTriangle(triCtx, triangles[i], 1);
      triLayerCount = settled;
    }
    if (triLayerCount > 0) ctx.drawImage(triLayer, 0, 0, B, B);
    for (let i = settled; i < triangles.length; i++)
      drawTriangle(ctx, triangles[i], easeOutBack(Math.max(0, time - triangles[i].birth) / TRI_POP_MS));
  }

  function drawTriangle(c, t, popScale) {
    const B = boardSize;
    const pa = pegs[t.a], pb = pegs[t.b], pc = pegs[t.c];
    const rgb = PLAYER_RGB[t.player];
    const cx = (pa.x + pb.x + pc.x) / 3, cy = (pa.y + pb.y + pc.y) / 3;
    c.save();
    if (popScale !== 1) { c.translate(cx, cy); c.scale(popScale, popScale); c.translate(-cx, -cy); }
    const glowSize = B * 0.03;
    c.shadowColor = `rgba(${rgb},0.6)`; c.shadowBlur = glowSize;
    c.beginPath(); c.moveTo(pa.x, pa.y); c.lineTo(pb.x, pb.y); c.lineTo(pc.x, pc.y); c.closePath();
    c.fillStyle = `rgba(${rgb},0.45)`; c.fill();
    c.shadowBlur = 0;
    const grad = c.createRadialGradient(cx, cy, 0, cx, cy, B * 0.12);
    grad.addColorStop(0, `rgba(${rgb},0.3)`); grad.addColorStop(1, `rgba(${rgb},0.05)`);
    c.fillStyle = grad; c.fill();
    c.strokeStyle = `rgba(${rgb},0.9)`;
    c.lineWidth = Math.max(2, EDGE_WIDTH * 0.8);
    c.shadowColor = `rgba(${rgb},0.5)`; c.shadowBlur = glowSize * 0.7; c.stroke();
    c.shadowBlur = 0;
    c.font = `bold ${Math.max(10, B * 0.016)}px Segoe UI, sans-serif`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = `rgba(${rgb},0.85)`;
    c.fillText(`${PLAYER_NAMES[t.player]}#${t.number}` + (t.points === 2 ? ' +2' : ''), cx, cy);
    c.restore();
  }

  const EDGE_ANIM_DURATION = 200; // ms for laser draw-in

  function drawEdges() {
    const now = performance.now();
    ctx.lineCap = 'round';
    for (const e of edges) {
      const pa = pegs[e.a], pb = pegs[e.b];
      const c = PLAYER_RGB[e.player];

      // Laser draw-in progress (0→1)
      const age = e.birth ? now - e.birth : 9999;
      const progress = Math.min(1, age / EDGE_ANIM_DURATION);
      const eased = progress < 1 ? 1 - (1 - progress) * (1 - progress) : 1; // easeOutQuad

      const ex = pa.x + (pb.x - pa.x) * eased;
      const ey = pa.y + (pb.y - pa.y) * eased;

      // Glow behind
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(ex, ey);
      ctx.strokeStyle = `rgba(${c},0.3)`;
      ctx.lineWidth = EDGE_WIDTH * 2.5; ctx.stroke();

      // Main edge
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(ex, ey);
      ctx.strokeStyle = PLAYER_COLORS[e.player];
      ctx.lineWidth = EDGE_WIDTH; ctx.stroke();

      // Laser tip glow (while animating)
      if (progress < 1) {
        ctx.beginPath();
        ctx.arc(ex, ey, EDGE_WIDTH * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c},${0.5 * (1 - progress)})`;
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
    const valid = !invalidReason(selectedPeg, hoveredPeg);
    const pa = pegs[selectedPeg], pb = pegs[hoveredPeg];
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

      // Outer hexagon warning shape
      polyPath(0, 0, signR * 1.4, 0, 6);
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
    polyPath(0, 0, signR * 1.5, 0, 6);
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

  // Draw a regular n-gon path centered at (x,y) with radius r, rotated by angle
  function polyPath(x, y, r, angle, n = 3) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = angle + (Math.PI * 2 / n) * i - Math.PI / 2;
      const tx = x + Math.cos(a) * r;
      const ty = y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);
    }
    ctx.closePath();
  }

  function drawPegs(time) {
    for (let i = 0; i < pegs.length; i++) {
      const p = pegs[i];
      const isSelected = selectedPeg === i, isHovered = hoveredPeg === i;
      const baseR = PEG_RADIUS;
      const r = isSelected ? baseR * 2.4 : (isHovered ? baseR * 2 : baseR * 1.6);
      const spin = time * 0.001 + i * 0.7; // slow individual rotation
      const rot = isSelected ? spin : (isHovered ? spin * 0.5 : 0);

      ctx.save();

      // Outer glow ring (selected/hovered)
      if (isSelected || isHovered) {
        const c = PLAYER_RGB[currentPlayer]; // hover + selection both in the mover's color
        const pulse = Math.sin(time * 0.006 + i) * 0.3 + 0.7;

        // Pulsing outer triangle (wireframe)
        polyPath(p.x, p.y, r * 2 * pulse, -rot * 0.5);
        ctx.strokeStyle = `rgba(${c},${0.3 * pulse})`;
        ctx.lineWidth = Math.max(1.5, boardSize * 0.002);
        ctx.stroke();

        // Glow halo
        ctx.shadowColor = `rgba(${c},0.8)`;
        ctx.shadowBlur = boardSize * 0.025;
      }

      // Main triangle body
      polyPath(p.x, p.y, r, rot);
      if (isSelected) {
        // Neon fill
        ctx.fillStyle = PLAYER_COLORS[currentPlayer];
        ctx.shadowColor = PLAYER_COLORS[currentPlayer];
        ctx.shadowBlur = boardSize * 0.02;
        ctx.fill();
        ctx.shadowBlur = 0;
        // Edge glow stroke
        ctx.strokeStyle = PLAYER_COLORS[currentPlayer];
        ctx.lineWidth = Math.max(2, boardSize * 0.004);
        ctx.stroke();
      } else if (isHovered) {
        ctx.fillStyle = '#e6ecfa';
        ctx.shadowColor = `rgba(${PLAYER_RGB[currentPlayer]},0.7)`;
        ctx.shadowBlur = boardSize * 0.018;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(${PLAYER_RGB[currentPlayer]},0.8)`;
        ctx.lineWidth = Math.max(1.5, boardSize * 0.003);
        ctx.stroke();
      } else {
        // Default: cyberpunk style — brighter for visibility
        ctx.fillStyle = '#3a4a6a';
        ctx.fill();
        // ponytail: glow is one wide faint stroke — shadowBlur here was a blur pass per peg per frame
        ctx.strokeStyle = 'rgba(80,130,220,0.12)';
        ctx.lineWidth = Math.max(4, boardSize * 0.007);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(120,170,255,0.55)';
        ctx.lineWidth = Math.max(1.5, boardSize * 0.0025);
        ctx.stroke();
      }

      // Inner detail: smaller inverted triangle (cyber circuit feel)
      const innerR = r * 0.4;
      polyPath(p.x, p.y, innerR, rot + Math.PI);
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
    const cw = viewW, ch = viewH;
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
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, radius);
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
      // Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * scale * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${alpha * 0.15})`;
      ctx.fill();
      // Core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${alpha})`;
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
    ctx.save();
    ctx.globalAlpha = screenFlash;
    ctx.fillStyle = `rgb(${screenFlashColor})`;
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
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${PLAYER_RGB[gameEndAnim.player]},${a2})`;
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
      const c = PLAYER_RGB[gameEndAnim.player];
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = boardSize * (0.002 + Math.random() * 0.005);
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 2 + Math.random() * 3,
          color: i % 3 === 0 ? '255,255,255' : c,
          alpha: 1,
          birth: time,
          life: 800 + Math.random() * 700
        });
      }
    }
  }

  // --- Minimap ---
  let minimapKey = ''; // state the minimap was last drawn for; only a move or a pan changes it
  function drawMinimap() {
    const key = `${edges.length},${triangles.length},${panX},${panY}`;
    if (key === minimapKey) return;
    minimapKey = key;
    const mW = minimapSize, mH = minimapSize;
    const scale = mW / boardSize;
    const mc = minimapCtx;

    mc.clearRect(0, 0, mW, mH);
    mc.fillStyle = 'rgba(22,33,62,0.9)';
    mc.fillRect(0, 0, mW, mH);

    // Triangles (simplified)
    for (const t of triangles) {
      const pa = pegs[t.a], pb = pegs[t.b], pc = pegs[t.c];
      mc.beginPath();
      mc.moveTo(pa.nx * mW, pa.ny * mH);
      mc.lineTo(pb.nx * mW, pb.ny * mH);
      mc.lineTo(pc.nx * mW, pc.ny * mH);
      mc.closePath();
      mc.fillStyle = `rgba(${PLAYER_RGB[t.player]},0.4)`;
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
    const cw = viewW, ch = viewH;
    const vx = -panX * scale;
    const vy = -panY * scale;
    const vw = cw * scale;
    const vh = ch * scale;
    mc.strokeStyle = 'rgba(255,255,255,0.6)';
    mc.lineWidth = 1.5;
    mc.strokeRect(vx, vy, vw, vh);

    // Copy to mirror minimap (CSS handles the 180deg rotation)
    minimapMirrorCtx.clearRect(0, 0, minimapMirror.width, minimapMirror.height);
    minimapMirrorCtx.drawImage(minimap, 0, 0);
  }

  // --- Utility ---
  function easeOutBack(t) {
    const c = 1.7;
    return 1 + (t - 1) * (t - 1) * ((c + 1) * (t - 1) + c);
  }
})();
