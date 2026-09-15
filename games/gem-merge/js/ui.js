import { GEMS, COMBO_TIER_CAP, hexStr } from './config.js';
import { S, addGemCount } from './state.js';
import { app, isMobile } from './renderer.js';
import { makeBallSprite } from './gems.js';
import { replayAnim } from './celebration.js';
import { t, lang, setLang, LANGS, applyLang } from './i18n.js';
import { ACH, isUnlocked, unlockedCount } from './achievements.js';

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// The in-game sprite rasterized once per level (glow off) — same art everywhere in the DOM
const gemSrc = [];
function gemImg(level) {
  if (!gemSrc[level]) {
    const sprite = makeBallSprite(level);
    sprite.glowRef.visible = false;
    gemSrc[level] = app.renderer.extract.canvas(sprite).toDataURL();
    sprite.destroy({ children: true });
  }
  return `<img class="gem-img" src="${gemSrc[level]}" style="filter:drop-shadow(0 0 4px ${hexStr(GEMS[level - 1].color)}99)" alt="">`;
}

const gemEntry = lv => `
    <div class="gem-entry">${gemImg(lv)}<div class="gem-info">
      <div class="gem-lv">Lv.${lv}</div><div class="gem-pts">+${GEMS[lv - 1].score}pt</div>
    </div></div>`;

// Touch screens get drag/release wording instead of mouse/click
const touch = matchMedia('(hover: none)').matches;
const howRows = () => `
    <div class="panel-title">${t('howto')}</div>
    <div class="how-row"><span class="how-icon">${touch ? '👆' : '🖱'}</span><span>${t(touch ? 'how1t' : 'how1')}</span></div>
    <div class="how-row"><span class="how-icon">${touch ? '👆' : '🖱'}</span><span>${t(touch ? 'how2t' : 'how2')}</span></div>
    <div class="how-row"><span class="how-icon">💎</span><span>${t('how3')}</span></div>`;
const X_STYLE = 'font-size:11px;font-weight:bold;min-width:28px;text-align:center;';
const comboRows = () => `
    <div class="panel-title">${t('combo')}</div>
    <div class="how-row"><span class="how-icon">⚡</span><span>${t('combo1')}</span></div>
    ${[['2', '#ffd93d', 'COMBO! → Lv.2'], ['3', '#ff6b6b', t('combo3')], ['4', '#ffa502', 'COMBO ×4!! → Lv.4 🔥'], ['5', '#fd79a8', 'COMBO ×5!!! ⚡']]
      .map(([n, c, s]) => `<div class="how-row"><span style="${X_STYLE}color:${c};">×${n}</span><span>${s}</span></div>`).join('')}`;

// Everything with text: static [data-i18n] plus the JS-built panels. Re-run on language change.
export function renderText() {
  applyLang();
  document.getElementById('panel-left').innerHTML = `
    <div class="panel-gem-deco" style="background:${hexStr(GEMS[2].color)}"></div>
    <div class="panel-title">${t('gems')}</div>
    ${range(1, 6).map(gemEntry).join('')}
    <div class="how-to">${comboRows()}</div>`;
  document.getElementById('panel-right').innerHTML = `
    <div class="panel-gem-deco" style="background:${hexStr(GEMS[9].color)}"></div>
    <div class="panel-title">${t('gems')}</div>
    ${range(7, 11).map(gemEntry).join('')}
    <div class="how-to">${howRows()}</div>`;
  document.getElementById('help-gems').innerHTML  = range(1, 11).map(gemEntry).join('');
  document.getElementById('help-how').innerHTML   = howRows().replaceAll('<br>', ' ');
  document.getElementById('help-combo').innerHTML = comboRows().replaceAll('<br>', ' ');
  document.getElementById('ach-btn').textContent = `🏆${unlockedCount()}`;
  buildInventory();
}

export function initUI() {
  const helpModal = document.getElementById('help-modal');
  document.getElementById('help-btn').addEventListener('click', () => helpModal.classList.add('open'));
  document.getElementById('help-close').addEventListener('click', () => helpModal.classList.remove('open'));
  document.getElementById('help-modal-backdrop').addEventListener('click', () => helpModal.classList.remove('open'));
  document.getElementById('catalog-btn').addEventListener('click', openCatalog);
  document.getElementById('ach-btn').addEventListener('click', openAchievements);
  // Any click inside the catalog closes it (user requested "어디를 클릭해도 꺼짐")
  document.getElementById('catalog-modal').addEventListener('click', e => e.currentTarget.classList.add('hidden'));
  document.getElementById('lang-btn').addEventListener('click', () => {
    setLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]);
    renderText();
  });
  renderText();
  buildFloatingGems();
  applyScale();
  window.addEventListener('resize', applyScale);
}

function buildFloatingGems() {
  // Floating gems are decorative — skip on mobile to reduce compositing layers
  if (isMobile) return;
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

function applyScale() {
  const col       = document.getElementById('center-col');
  const panelVis  = window.innerWidth >= 700;
  const neededW   = panelVis ? 672 : 456; // phone: canvas 404 + 44px button rail + 8px breathing room
  const neededH   = 780; // includes vault
  const s = Math.min(1, window.innerWidth / neededW, window.innerHeight / neededH);
  col.style.transform = `translate(-50%, -50%) scale(${s.toFixed(4)})`;
}

function makeVaultGem(index) {
  const gem = document.createElement('div');
  gem.className = 'vault-gem';
  gem.title = `${t('names')[10]} #${index + 1}`;
  return gem;
}

function buildInventory() {
  const wrap = document.getElementById('vault-gems');
  const n = S.gemCounts[10];
  wrap.innerHTML = n ? '' : `<span class="vault-empty">${t('vaultEmpty')}</span>`;
  for (let i = 0; i < n; i++) wrap.appendChild(makeVaultGem(i));
}

export function collectLegendaryGem() {
  addGemCount(11);
  const wrap = document.getElementById('vault-gems');
  wrap.querySelector('.vault-empty')?.remove();
  const gem = makeVaultGem(S.gemCounts[10] - 1);
  gem.classList.add('vault-gem-new');
  wrap.appendChild(gem);
  gem.addEventListener('animationend', () => gem.classList.remove('vault-gem-new'), { once: true });
  replayAnim(document.getElementById('legendary-vault'), 'vault-flash');
}

// Catalog and achievements share one modal box; content is rebuilt on every open
function openModal(title, html) {
  document.getElementById('catalog-title').textContent = title;
  document.getElementById('catalog-list').innerHTML = html;
  document.getElementById('catalog-modal').classList.remove('hidden');
}

// ── Catalog (도감): rebuilt from S.gemCounts on every open; never-owned gems show as silhouettes
function openCatalog() {
  const names = t('names');
  openModal(t('catalog'), GEMS.map((g, i) => {
    const n = S.gemCounts[i];
    return `
    <div class="catalog-entry${n ? '' : ' locked'}">
      ${gemImg(i + 1)}
      <div class="catalog-info">
        <div class="catalog-name">${n ? names[i] : '???'}</div>
        <div class="catalog-sub">Lv.${i + 1} · +${g.score}pt</div>
      </div>
      <div class="catalog-stats">
        <div><span class="catalog-k">${t('spawn')}</span><span class="catalog-v">${i === 0 ? t('base') : i < COMBO_TIER_CAP ? `COMBO ×${i + 1}` : '—'}</span></div>
        <div><span class="catalog-k">${t('owned')}</span><span class="catalog-v">${n}</span></div>
      </div>
    </div>`;
  }).join(''));
}

// ── Achievements: locked entries keep their title but grey out the icon
function openAchievements() {
  const text = t('ach');
  openModal(`${t('achievements')} · ${unlockedCount()} / ${ACH.length}`, ACH.map(([id, icon]) => {
    const [title, desc] = text[id];
    return `
    <div class="catalog-entry${isUnlocked(id) ? '' : ' locked'}">
      <span class="ach-icon">${icon}</span>
      <div class="catalog-info"><div class="catalog-name">${title}</div><div class="catalog-sub">${desc}</div></div>
    </div>`;
  }).join(''));
}
