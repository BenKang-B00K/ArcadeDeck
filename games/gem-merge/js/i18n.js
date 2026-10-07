import { load, save } from './state.js';

// UI strings. Static markup uses data-i18n="key"; JS-built markup calls t(key, ...args) — {0}, {1} placeholders.
const DICT = {
  en: {
    score: 'Score', best: 'Best', gems: 'GEMS', howto: 'HOW TO', combo: 'COMBO',
    how1: 'Aim with<br>the mouse', how2: 'Click to<br>drop a gem', how1t: 'Drag to<br>aim', how2t: 'Release to<br>drop a gem', how3: 'Same level<br>collide → merge',
    combo1: 'Merge within 1.3s<br>→ bigger next gem', comboShake: '+ screen shake', base: 'default',
    comboHit: 'COMBO!', comboX: 'COMBO ×{0}', legendMax: 'LEGENDARY MAX!', gameOver: 'GAME OVER', danger: '▲ DANGER',
    tiers: [null, 'NICE!', 'HOT STREAK!', 'ON FIRE!', 'BLAZING!', 'LEGENDARY!'],
    lv: 'Lv.{0}', pts: '+{0}pt', unknown: '???', vaultGem: '{0} #{1}',
    restart: 'RESTART ↺', vault: 'VAULT', vaultEmpty: '— none yet —',
    catalog: 'GEM CATALOG', spawn: 'SPAWN', owned: 'OWNED',
    lcText: 'LEGENDARY GEM', lcSub: 'ADDED TO VAULT',
    muteTitle: 'Toggle sound', catalogTitle: 'Gem catalog', langTitle: 'Language',
    achievements: 'ACHIEVEMENTS', achToast: 'ACHIEVEMENT UNLOCKED',
    ach: {
      firstMerge: ['First Merge', 'Merge two gems'], combo3: ['Combo ×3', 'Chain 3 merges'], combo5: ['Combo ×5', 'Chain 5 merges'],
      lv5: ['Hexagon', 'Create a Lv.5 gem'], lv7: ['6-Point Star', 'Create a Lv.7 gem'], lv9: ['8-Point Star', 'Create a Lv.9 gem'], lv10: ['Cushion Cut', 'Create a Lv.10 gem'],
      legendary: ['Legendary', 'Create a Legendary gem'], legendary3: ['Collector', '3 Legendary gems in the vault'], legendary10: ['Gem Lord', '10 Legendary gems in the vault'],
      score500: ['Bronze', 'Score 500 in one game'], score1000: ['Silver', 'Score 1,000 in one game'], score2000: ['Gold', 'Score 2,000 in one game'],
      gems1000: ['Gem Factory', 'Create 1,000 gems in total'],
    },
    names: ['Trilliant', 'Rhombus', 'Pentagon', '4-Point Star', 'Hexagon', 'Marquise', '6-Point Star', 'Octagon', '8-Point Star', 'Cushion Cut', 'Legendary'],
  },
  ko: {
    score: '점수', best: '최고', gems: '보석', howto: '조작법', combo: '콤보',
    how1: '마우스로<br>위치 조준', how2: '클릭으로<br>보석 투하', how1t: '드래그로<br>위치 조준', how2t: '손을 떼면<br>보석 투하', how3: '같은 레벨<br>충돌 시 합성',
    combo1: '1.3초 내 합성<br>→ 다음 보석 강화', comboShake: '+ 화면 진동', base: '기본',
    comboHit: '콤보!', comboX: '{0}콤보', legendMax: '전설 MAX!', gameOver: '게임 오버', danger: '▲ 위험',
    tiers: [null, '나이스!', '상승세!', '불타오른다!', '작열!', '전설!'],
    lv: 'Lv.{0}', pts: '+{0}점', unknown: '???', vaultGem: '{0} #{1}',
    restart: '다시 시작 ↺', vault: '보관함', vaultEmpty: '— 아직 없음 —',
    catalog: '보석 도감', spawn: '출현', owned: '획득',
    lcText: '전설의 보석', lcSub: '보관함에 추가됨',
    muteTitle: '음소거 토글', catalogTitle: '보석 도감', langTitle: '언어',
    achievements: '업적', achToast: '업적 달성',
    ach: {
      firstMerge: ['첫 합성', '보석 두 개 합성'], combo3: ['콤보 ×3', '3연속 합성'], combo5: ['콤보 ×5', '5연속 합성'],
      lv5: ['육각형', 'Lv.5 보석 생성'], lv7: ['6각 별', 'Lv.7 보석 생성'], lv9: ['8각 별', 'Lv.9 보석 생성'], lv10: ['쿠션 컷', 'Lv.10 보석 생성'],
      legendary: ['전설', '전설의 보석 생성'], legendary3: ['수집가', '보관함에 전설의 보석 3개'], legendary10: ['보석 군주', '보관함에 전설의 보석 10개'],
      score500: ['브론즈', '한 게임에 500점'], score1000: ['실버', '한 게임에 1,000점'], score2000: ['골드', '한 게임에 2,000점'],
      gems1000: ['보석 공장', '누적 보석 1,000개 생성'],
    },
    names: ['트릴리언트', '마름모', '오각형', '4각 별', '육각형', '마르퀴즈', '6각 별', '팔각형', '8각 별', '쿠션 컷', '레전더리'],
  },
  ja: {
    score: 'スコア', best: 'ベスト', gems: 'ジェム', howto: '遊び方', combo: 'コンボ',
    how1: 'マウスで<br>位置を狙う', how2: 'クリックで<br>ジェム投下', how1t: 'ドラッグで<br>位置を狙う', how2t: '指を離すと<br>ジェム投下', how3: '同レベルが<br>衝突で合成',
    combo1: '1.3秒内に合成<br>→ 次のジェム強化', comboShake: '+ 画面振動', base: '基本',
    comboHit: 'コンボ!', comboX: '{0}コンボ', legendMax: '伝説MAX!', gameOver: 'ゲームオーバー', danger: '▲ 危険',
    tiers: [null, 'ナイス!', '絶好調!', '燃えてきた!', '灼熱!', '伝説!'],
    lv: 'Lv.{0}', pts: '+{0}pt', unknown: '???', vaultGem: '{0} #{1}',
    restart: 'リスタート ↺', vault: '保管庫', vaultEmpty: '— まだなし —',
    catalog: 'ジェム図鑑', spawn: '出現', owned: '獲得',
    lcText: '伝説のジェム', lcSub: '保管庫に追加',
    muteTitle: 'サウンド切替', catalogTitle: 'ジェム図鑑', langTitle: '言語',
    achievements: '実績', achToast: '実績解除',
    ach: {
      firstMerge: ['初合成', 'ジェムを2つ合成'], combo3: ['コンボ ×3', '3連続合成'], combo5: ['コンボ ×5', '5連続合成'],
      lv5: ['六角形', 'Lv.5ジェムを作る'], lv7: ['六芒星', 'Lv.7ジェムを作る'], lv9: ['八芒星', 'Lv.9ジェムを作る'], lv10: ['クッションカット', 'Lv.10ジェムを作る'],
      legendary: ['伝説', '伝説のジェムを作る'], legendary3: ['コレクター', '保管庫に伝説のジェム3個'], legendary10: ['ジェムロード', '保管庫に伝説のジェム10個'],
      score500: ['ブロンズ', '1ゲームで500点'], score1000: ['シルバー', '1ゲームで1,000点'], score2000: ['ゴールド', '1ゲームで2,000点'],
      gems1000: ['ジェム工場', '累計1,000個のジェムを作る'],
    },
    names: ['トリリアント', 'ひし形', '五角形', '四芒星', '六角形', 'マーキス', '六芒星', '八角形', '八芒星', 'クッションカット', 'レジェンダリー'],
  },
};
export const LANGS = Object.keys(DICT);

// ?lang=ko from the embedding host wins over the saved/browser locale
const q = new URLSearchParams(location.search).get('lang');
const nav = (navigator.language || 'en').slice(0, 2);
const saved = load('lang');
export let lang = DICT[q] ? q : DICT[saved] ? saved : DICT[nav] ? nav : 'en';

export const t = (key, ...args) => {
  const s = DICT[lang][key] ?? DICT.en[key];
  return args.length ? s.replace(/\{(\d+)\}/g, (_, i) => args[i]) : s;
};

// Numbers in the game's language, not the browser's
export const fmtNum = n => n.toLocaleString(lang);

// Canvas text gets the same lang-aware CJK stack as the DOM (--cjk in style.css). Empty var (stale/missing CSS)
// is dropped — an empty family name would make the canvas reject the whole font string.
export const withCJK = base =>
  [base, getComputedStyle(document.documentElement).getPropertyValue('--cjk').trim(), 'sans-serif'].filter(Boolean).join(', ');

// On-screen combo callout: 2 → 'COMBO!', 3 → 'COMBO ×3!', 4 → '…!!', 5+ → '…!!!'
export const comboLabel = n => n < 3 ? t('comboHit') : t('comboX', n) + '!'.repeat(Math.min(n - 2, 3));

export function setLang(l) {
  lang = l;
  save('lang', l);
  applyLang();
}

// Fill every [data-i18n] / [data-i18n-title] element from the dictionary
export function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  document.getElementById('lang-btn').textContent = lang.toUpperCase();
}
