import { GEMS } from './config.js';
import { S, addGemCount } from './state.js';

const nextCvs = document.getElementById('next-canvas');
const nextCtx = nextCvs.getContext('2d');
const NW = nextCvs.width, NH = nextCvs.height;

export function drawNextUI() {
  nextCtx.clearRect(0, 0, NW, NH);
  const gem = GEMS[S.nextLevel - 1];
  const maxR = GEMS[GEMS.length - 1].r;
  const dr  = Math.min(NW * 0.42, (gem.r / maxR) * NW * 0.38 + 10);
  const cx = NW / 2, cy = NH / 2;
  const col = gem.color;
  const [R, G, B] = [(col>>16)&0xff, (col>>8)&0xff, col&0xff];

  function scaleC(hex, f) {
    return `rgb(${Math.min(255,((hex>>16)&0xff)*f|0)},${Math.min(255,((hex>>8)&0xff)*f|0)},${Math.min(255,(hex&0xff)*f|0)})`;
  }
  function nGon2D(n, r2, a0) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = a0 + Math.PI * 2 * i / n;
      pts.push([cx + Math.cos(a)*r2, cy + Math.sin(a)*r2]);
    }
    return pts;
  }
  function star2D(n, R2, r2, a0) {
    const pts = [];
    for (let i = 0; i < n*2; i++) {
      const a = a0 + Math.PI * i / n;
      const rad = i%2===0 ? R2 : r2;
      pts.push([cx + Math.cos(a)*rad, cy + Math.sin(a)*rad]);
    }
    return pts;
  }
  function fillPoly2D(pts, style) {
    nextCtx.beginPath(); nextCtx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) nextCtx.lineTo(pts[i][0], pts[i][1]);
    nextCtx.closePath(); nextCtx.fillStyle = style; nextCtx.fill();
  }
  function strokePoly2D(pts, style, lw) {
    nextCtx.beginPath(); nextCtx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) nextCtx.lineTo(pts[i][0], pts[i][1]);
    nextCtx.closePath(); nextCtx.strokeStyle = style; nextCtx.lineWidth = lw || 1.2; nextCtx.stroke();
  }
  function fanFill2D(pts, cL, cD) {
    for (let i = 0; i < pts.length; i++) {
      nextCtx.beginPath(); nextCtx.moveTo(cx, cy);
      nextCtx.lineTo(pts[i][0], pts[i][1]);
      nextCtx.lineTo(pts[(i+1)%pts.length][0], pts[(i+1)%pts.length][1]);
      nextCtx.closePath();
      nextCtx.fillStyle = i%2===0 ? cL : cD; nextCtx.fill();
    }
  }

  // Glow
  const grd = nextCtx.createRadialGradient(cx, cy, dr*0.3, cx, cy, dr+8);
  grd.addColorStop(0, `rgba(${R},${G},${B},0.30)`); grd.addColorStop(1, `rgba(${R},${G},${B},0)`);
  nextCtx.beginPath(); nextCtx.arc(cx, cy, dr+8, 0, Math.PI*2);
  nextCtx.fillStyle = grd; nextCtx.fill();

  const cLt = scaleC(col, 1.42), cDk = scaleC(col, 0.40), cBt = scaleC(col, 1.82);

  const lv = S.nextLevel;
  if (lv === 1) { const p = nGon2D(3,dr,-Math.PI/2); fanFill2D(p, cLt, cDk); strokePoly2D(p, cLt); fillPoly2D(nGon2D(3,dr*0.44,-Math.PI/2), cBt); }
  else if (lv===2) { const p=[[cx,cy-dr],[cx+dr*0.58,cy],[cx,cy+dr],[cx-dr*0.58,cy]]; fanFill2D(p,cLt,cDk); strokePoly2D(p,cLt); fillPoly2D([[cx,cy-dr*0.42],[cx+dr*0.26,cy],[cx,cy+dr*0.42],[cx-dr*0.26,cy]],cBt); }
  else if (lv===3) { const p=nGon2D(5,dr,-Math.PI/2); fanFill2D(p,cLt,cDk); strokePoly2D(p,cLt); fillPoly2D(nGon2D(5,dr*0.44,-Math.PI/2),cBt); }
  else if (lv===4) { const p=star2D(4,dr,dr*0.34,-Math.PI/4); fanFill2D(p,cLt,cDk); strokePoly2D(p,cLt); fillPoly2D(star2D(4,dr*0.38,dr*0.13,-Math.PI/4),cBt); }
  else if (lv===5) { const p=nGon2D(6,dr,-Math.PI/6); fanFill2D(p,cLt,cDk); strokePoly2D(p,cLt); fillPoly2D(nGon2D(6,dr*0.46,-Math.PI/6),cBt); }
  else if (lv===6) {
    const N=24; nextCtx.beginPath();
    for (let i=0;i<N;i++){const t=Math.PI*2*i/N; nextCtx[i?'lineTo':'moveTo'](cx+Math.sin(t)*dr*0.60, cy+Math.cos(t)*dr);}
    nextCtx.closePath(); nextCtx.fillStyle=scaleC(col,0.92); nextCtx.fill();
    strokePoly2D(nGon2D(1,0,0).concat([[cx+0,cy-dr]]),cLt);
    const N2=24; nextCtx.beginPath();
    for(let i=0;i<N2;i++){const t=Math.PI*2*i/N2; nextCtx[i?'lineTo':'moveTo'](cx+Math.sin(t)*dr*0.26, cy+Math.cos(t)*dr*0.48);}
    nextCtx.closePath(); nextCtx.fillStyle=cBt; nextCtx.fill();
  }
  else if (lv===7) { const p=star2D(6,dr,dr*0.42,-Math.PI/2); fanFill2D(p,cLt,cDk); strokePoly2D(p,cLt); fillPoly2D(nGon2D(6,dr*0.38,-Math.PI/6),cBt); }
  else if (lv===8) { const p=nGon2D(8,dr,-Math.PI/8); fanFill2D(p,cLt,cDk); strokePoly2D(p,cLt); fillPoly2D(nGon2D(8,dr*0.52,-Math.PI/8),cBt); fillPoly2D(nGon2D(8,dr*0.28,-Math.PI/8),cBt); }
  else if (lv===9) { const p=star2D(8,dr,dr*0.44,-Math.PI/8); fanFill2D(p,cLt,cDk); strokePoly2D(p,cLt); fillPoly2D(nGon2D(8,dr*0.36,-Math.PI/8),cBt); }
  else if (lv===10||lv===11) {
    const p=star2D(lv===11?12:8,dr,dr*(lv===11?0.54:0.44),-Math.PI/(lv===11?12:8));
    fanFill2D(p,cLt,cDk); strokePoly2D(p,scaleC(gem.hi,1.2));
    nextCtx.beginPath(); nextCtx.arc(cx,cy,dr*0.42,0,Math.PI*2);
    nextCtx.fillStyle=cBt; nextCtx.fill();
  }

  // Shine
  nextCtx.save(); nextCtx.beginPath();
  nextCtx.ellipse(cx-dr*0.20, cy-dr*0.26, dr*0.28, dr*0.16, 0, 0, Math.PI*2);
  nextCtx.fillStyle='rgba(255,255,255,0.42)'; nextCtx.fill(); nextCtx.restore();

  // Label
  nextCtx.font = `bold ${Math.max(10, dr*0.60)}px Arial Black, Arial`;
  nextCtx.fillStyle = '#fff'; nextCtx.textAlign = 'center'; nextCtx.textBaseline = 'middle';
  nextCtx.shadowColor = `rgba(${R},${G},${B},0.75)`; nextCtx.shadowBlur = 5;
  nextCtx.fillText(S.nextLevel < 11 ? String(S.nextLevel) : '★', cx, cy);
  nextCtx.shadowBlur = 0;
}

function hexStr(n) { return '#' + n.toString(16).padStart(6, '0'); }

function gemEntry(level) {
  const col = hexStr(GEMS[level - 1].color);
  const pts = GEMS[level - 1].score;
  const div = document.createElement('div');
  div.className = 'gem-entry';
  div.innerHTML = `
    <div class="gem-dot" style="background:${col};box-shadow:0 0 7px ${col}99;"></div>
    <div class="gem-info">
      <div class="gem-lv">Lv.${level}</div>
      <div class="gem-pts">+${pts}pt</div>
    </div>`;
  return div;
}

export function buildPanels() {
  const panelL = document.getElementById('panel-left');
  const panelR = document.getElementById('panel-right');
  for (let i = 1; i <= 6;  i++) panelL.appendChild(gemEntry(i));
  for (let i = 7; i <= 11; i++) panelR.appendChild(gemEntry(i));

  const howTo = document.createElement('div');
  howTo.className = 'how-to';
  howTo.innerHTML = `
    <div class="panel-title">HOW TO</div>
    <div class="how-row"><span class="how-icon">🖱</span><span>마우스로<br>위치 조준</span></div>
    <div class="how-row"><span class="how-icon">🖱</span><span>클릭으로<br>보석 투하</span></div>
    <div class="how-row"><span class="how-icon">💎</span><span>같은 레벨<br>충돌 시 합성</span></div>`;
  panelR.appendChild(howTo);

  const comboGuide = document.createElement('div');
  comboGuide.className = 'how-to';
  comboGuide.innerHTML = `
    <div class="panel-title">COMBO</div>
    <div class="how-row"><span class="how-icon">⚡</span><span>1.3초 내<br>연속 합성!</span></div>
    <div class="how-row"><span style="font-size:11px;color:#ffd93d;font-weight:bold;min-width:28px;text-align:center;">×2</span><span>COMBO!</span></div>
    <div class="how-row"><span style="font-size:11px;color:#ff6b6b;font-weight:bold;min-width:28px;text-align:center;">×3</span><span>COMBO ×3!<br>+ 화면 진동</span></div>
    <div class="how-row"><span style="font-size:11px;color:#ffa502;font-weight:bold;min-width:28px;text-align:center;">×4</span><span>COMBO ×4!! 🔥</span></div>
    <div class="how-row"><span style="font-size:11px;color:#fd79a8;font-weight:bold;min-width:28px;text-align:center;">×5</span><span>COMBO ×5!!! ⚡</span></div>`;
  panelL.appendChild(comboGuide);

  document.getElementById('deco-left').style.background  = hexStr(GEMS[2].color);
  document.getElementById('deco-right').style.background = hexStr(GEMS[9].color);
}

export function buildHelpModal() {
  const helpGems = document.getElementById('help-gems');
  for (let i = 1; i <= 11; i++) helpGems.appendChild(gemEntry(i));

  document.getElementById('help-how').innerHTML = `
    <div class="panel-title">HOW TO</div>
    <div class="how-row"><span class="how-icon">🖱</span><span>마우스로 위치 조준</span></div>
    <div class="how-row"><span class="how-icon">🖱</span><span>클릭으로 보석 투하</span></div>
    <div class="how-row"><span class="how-icon">💎</span><span>같은 레벨 충돌 시 합성</span></div>`;

  document.getElementById('help-combo').innerHTML = `
    <div class="panel-title">COMBO</div>
    <div class="how-row"><span class="how-icon">⚡</span><span>1.3초 내 연속 합성!</span></div>
    <div class="how-row"><span style="font-size:11px;color:#ffd93d;font-weight:bold;min-width:28px;text-align:center;">×2</span><span>COMBO!</span></div>
    <div class="how-row"><span style="font-size:11px;color:#ff6b6b;font-weight:bold;min-width:28px;text-align:center;">×3</span><span>COMBO ×3! + 화면 진동</span></div>
    <div class="how-row"><span style="font-size:11px;color:#ffa502;font-weight:bold;min-width:28px;text-align:center;">×4</span><span>COMBO ×4!! 🔥</span></div>
    <div class="how-row"><span style="font-size:11px;color:#fd79a8;font-weight:bold;min-width:28px;text-align:center;">×5</span><span>COMBO ×5!!! ⚡</span></div>`;

  const helpModal    = document.getElementById('help-modal');
  const helpBackdrop = document.getElementById('help-modal-backdrop');
  document.getElementById('help-btn').addEventListener('click', () => helpModal.classList.add('open'));
  document.getElementById('help-close').addEventListener('click', () => helpModal.classList.remove('open'));
  helpBackdrop.addEventListener('click', () => helpModal.classList.remove('open'));
}

export function buildFloatingGems() {
  // Floating gems are decorative — skip on mobile to reduce compositing layers
  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) return;
  [
    { x:  5, delay:  0, dur: 15, sz: 10, c: '#6c5ce7' },
    { x: 13, delay:  4, dur: 19, sz:  7, c: '#fd79a8' },
    { x: 22, delay:  8, dur: 13, sz: 12, c: '#ffa502' },
    { x: 32, delay:  1, dur: 17, sz:  8, c: '#00cec9' },
    { x: 45, delay: 11, dur: 22, sz:  6, c: '#a29bfe' },
    { x: 58, delay:  5, dur: 16, sz:  9, c: '#ff4757' },
    { x: 68, delay:  9, dur: 20, sz: 11, c: '#2ed573' },
    { x: 77, delay:  2, dur: 14, sz:  7, c: '#ffd93d' },
    { x: 85, delay:  6, dur: 18, sz: 10, c: '#1e90ff' },
    { x: 93, delay: 12, dur: 12, sz: 13, c: '#fdcb6e' },
    { x: 50, delay:  3, dur: 25, sz:  6, c: '#81ecec' },
    { x: 38, delay:  7, dur: 11, sz:  9, c: '#e17055' },
  ].forEach(({ x, delay, dur, sz, c }) => {
    const el = document.createElement('div');
    el.className = 'fgem';
    el.style.cssText = `left:${x}vw;width:${sz}px;height:${sz}px;background:${c};animation-duration:${dur}s;animation-delay:-${delay}s;`;
    document.body.appendChild(el);
  });
}

export function applyScale() {
  const col       = document.getElementById('center-col');
  const panelVis  = window.innerWidth >= 700;
  const neededW   = panelVis ? 672 : 418;
  const neededH   = 780; // increased to account for vault
  const s = Math.min(1, window.innerWidth / neededW, window.innerHeight / neededH);
  col.style.transform = `translate(-50%, -50%) scale(${s.toFixed(4)})`;
}

function makeVaultGem(index) {
  const gem = document.createElement('div');
  gem.className = 'vault-gem';
  gem.title = `Legendary Gem #${index + 1}`;
  return gem;
}

export function buildInventory() {
  const wrap = document.getElementById('vault-gems');
  wrap.innerHTML = '';
  if (S.legendaryCount === 0) {
    wrap.innerHTML = '<span class="vault-empty">— none yet —</span>';
    return;
  }
  for (let i = 0; i < S.legendaryCount; i++) {
    wrap.appendChild(makeVaultGem(i));
  }
}

export function collectLegendaryGem() {
  // Persist via state helper which also dispatches update event
  addGemCount(11);

  // Ensure legendaryCount is in sync with gemCounts
  S.legendaryCount = S.gemCounts[10] || 0;

  const wrap = document.getElementById('vault-gems');
  const empty = wrap.querySelector('.vault-empty');
  if (empty) empty.remove();

  const gem = makeVaultGem(S.legendaryCount - 1);
  gem.classList.add('vault-gem-new');
  wrap.appendChild(gem);
  gem.addEventListener('animationend', () => gem.classList.remove('vault-gem-new'), { once: true });

  // Pulse the vault border
  const vault = document.getElementById('legendary-vault');
  vault.classList.remove('vault-flash');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    vault.classList.add('vault-flash');
    vault.addEventListener('animationend', () => vault.classList.remove('vault-flash'), { once: true });
  }));
}

// ── Catalog (도감)
export function buildCatalog() {
  const modal = document.getElementById('catalog-modal');
  const list = document.getElementById('catalog-list');
  if (!list || !modal) return;
  list.innerHTML = '';
  for (let i = 0; i < GEMS.length; i++) {
    const lv = i + 1;
    const row = document.createElement('div'); row.className = 'catalog-entry';
    const dot = document.createElement('div'); dot.className = 'catalog-dot'; dot.style.background = '#' + GEMS[i].color.toString(16).padStart(6,'0');
    const lbl = document.createElement('div'); lbl.className = 'catalog-label'; lbl.textContent = lv < 11 ? `Lv.${lv}` : 'Lv.11';
    const cnt = document.createElement('div'); cnt.className = 'catalog-count'; cnt.textContent = (S.gemCounts && S.gemCounts[i]) || 0;
    row.appendChild(dot); row.appendChild(lbl); row.appendChild(cnt); list.appendChild(row);
  }

  const closeBtn = document.getElementById('catalog-close');
  const backdrop = document.getElementById('catalog-modal-backdrop');
  // Add listeners once to avoid duplicates
  if (!modal._catalogListenersAdded) {
    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeCatalog(); });
    if (backdrop) backdrop.addEventListener('click', closeCatalog);
    // Close on any click inside the modal (user requested "어디를 클릭해도 꺼짐")
    modal.addEventListener('click', closeCatalog);
    modal._catalogListenersAdded = true;
  }
}

export function updateCatalogCounts() {
  const list = document.getElementById('catalog-list');
  if (!list) return;
  const rows = list.querySelectorAll('.catalog-entry');
  rows.forEach((r, idx) => {
    const c = r.querySelector('.catalog-count');
    if (c) c.textContent = (S.gemCounts && S.gemCounts[idx]) || 0;
  });
}

export function openCatalog() {
  const modal = document.getElementById('catalog-modal');
  if (!modal) return;
  // Ensure hidden state is cleared and show modal
  modal.classList.remove('hidden');
  modal.classList.add('open');
}

export function closeCatalog() {
  const modal = document.getElementById('catalog-modal');
  if (!modal) return;
  // Hide modal by removing open and adding hidden
  modal.classList.remove('open');
  modal.classList.add('hidden');
}

// Listen for changes
document.addEventListener('gemCountsChanged', () => updateCatalogCounts());

