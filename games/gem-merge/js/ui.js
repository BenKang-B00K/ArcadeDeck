import { GEMS, COMBO_TIER_CAP, hexStr } from './config.js';
import { S, addGemCount } from './state.js';
import { app, isMobile, dangerTxt } from './renderer.js';
import { makeBallSprite } from './gems.js';
import { replayAnim } from './celebration.js';
import { t, comboLabel, fmtNum, withCJK, lang, setLang, LANGS, applyLang } from './i18n.js';
import { ACHIEVEMENTS, achIcon, isUnlocked, unlockedCount } from './achievements.js';
import { icon } from './icons.js';

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
      <div class="gem-lv">${t('lv', lv)}</div><div class="gem-pts">${t('pts', GEMS[lv - 1].score)}</div>
    </div></div>`;

// Touch screens get drag/release wording instead of mouse/click
const touch = matchMedia('(hover: none)').matches;
const aimIcon = icon(touch ? 'touch' : 'mouse', '#a29bfe', 'how-icon');
const howRows = () => `
    <div class="panel-title">${t('howto')}</div>
    <div class="how-row">${aimIcon}<span>${t(touch ? 'how1t' : 'how1')}</span></div>
    <div class="how-row">${aimIcon}<span>${t(touch ? 'how2t' : 'how2')}</span></div>
    <div class="how-row">${icon('gem', '#f9ca24', 'how-icon')}<span>${t('how3')}</span></div>`;
const X_STYLE = 'font-size:11px;font-weight:bold;min-width:28px;text-align:center;';
const comboRows = () => `
    <div class="panel-title">${t('combo')}</div>
    <div class="how-row">${icon('bolt', '#ffd93d', 'how-icon')}<span>${t('combo1')}</span></div>
    ${[[2, '#ffd93d'], [3, '#ff6b6b'], [4, '#ffa502'], [5, '#fd79a8']]
      .map(([n, c]) => `<div class="how-row"><span style="${X_STYLE}color:${c};">×${n}</span><span>${comboLabel(n)}${
        n <= COMBO_TIER_CAP ? ` → ${t('lv', n)}` : ''}${n === 3 ? `<br>${t('comboShake')}` : ''}</span></div>`).join('')}`;

// Everything with text: static [data-i18n] plus the JS-built panels. Re-run on language change.
export function renderText() {
  applyLang();
  dangerTxt.text = t('danger'); dangerTxt.style.fontFamily = withCJK('Arial');
  document.getElementById('score').textContent = fmtNum(S.score);
  document.getElementById('best').textContent  = fmtNum(S.best);
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
  buildInventory();
}

export function initUI() {
  const helpModal = document.getElementById('help-modal');
  document.getElementById('help-btn').addEventListener('click', () => helpModal.classList.add('open'));
  document.getElementById('help-close').addEventListener('click', () => helpModal.classList.remove('open'));
  document.getElementById('help-modal-backdrop').addEventListener('click', () => helpModal.classList.remove('open'));
  document.getElementById('catalog-btn').addEventListener('click', openCatalog);
  // Any click inside the catalog closes it (user requested "어디를 클릭해도 꺼짐")
  document.getElementById('catalog-modal').addEventListener('click', e => e.currentTarget.classList.add('hidden'));
  document.getElementById('lang-btn').addEventListener('click', () => {
    setLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]);
    renderText();
  });
  document.getElementById('mute-btn').innerHTML    = icon('speaker');
  document.getElementById('catalog-btn').innerHTML = icon('book');
  document.querySelectorAll('.gem-icon').forEach(el => { el.innerHTML = icon('gem'); });
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
  gem.title = t('vaultGem', t('names')[10], index + 1);
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

// ── Catalog (도감): rebuilt from S.gemCounts on every open; never-owned gems show as silhouettes
function openCatalog() {
  const names = t('names');
  document.getElementById('catalog-list').innerHTML = GEMS.map((g, i) => {
    const n = S.gemCounts[i];
    return `
    <div class="catalog-entry${n ? '' : ' locked'}">
      ${gemImg(i + 1)}
      <div class="catalog-info">
        <div class="catalog-name">${n ? names[i] : t('unknown')}</div>
        <div class="catalog-sub">${t('lv', i + 1)} · ${t('pts', g.score)}</div>
      </div>
      <div class="catalog-stats">
        <div><span class="catalog-k">${t('spawn')}</span><span class="catalog-v">${i === 0 ? t('base') : i < COMBO_TIER_CAP ? t('comboX', i + 1) : '—'}</span></div>
        <div><span class="catalog-k">${t('owned')}</span><span class="catalog-v">${fmtNum(n)}</span></div>
      </div>
    </div>`;
  }).join('');
  const ach = t('ach');
  document.getElementById('ach-title').textContent = `${t('achievements')} ${unlockedCount()}/${ACHIEVEMENTS.length}`;
  document.getElementById('ach-list').innerHTML = ACHIEVEMENTS.map(a => `
    <div class="catalog-entry${isUnlocked(a[0]) ? '' : ' locked'}">
      ${achIcon(a)}
      <div class="catalog-info"><div class="catalog-name">${ach[a[0]][0]}</div><div class="catalog-sub">${ach[a[0]][1]}</div></div>
    </div>`).join('');
  document.getElementById('catalog-modal').classList.remove('hidden');
}
