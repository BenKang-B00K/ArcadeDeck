// UI strings. Static markup uses data-i18n="key"; JS-built markup calls t(key).
const DICT = {
  en: {
    score: 'Score', best: 'Best', gems: 'GEMS', howto: 'HOW TO', combo: 'COMBO',
    how1: 'Aim with<br>the mouse', how2: 'Click to<br>drop a gem', how1t: 'Drag to<br>aim', how2t: 'Release to<br>drop a gem', how3: 'Same level<br>collide → merge',
    combo1: 'Merge within 1.3s<br>→ bigger next gem', combo3: 'COMBO ×3! → Lv.3<br>+ screen shake', base: 'default',
    restart: 'RESTART ↺', vault: 'VAULT', vaultEmpty: '— none yet —',
    catalog: 'GEM CATALOG', spawn: 'SPAWN', owned: 'OWNED',
    lcText: 'LEGENDARY GEM', lcSub: 'ADDED TO VAULT',
    muteTitle: 'Toggle sound', catalogTitle: 'Gem catalog', langTitle: 'Language', achTitle: 'Achievements',
    achievements: 'ACHIEVEMENTS', achUnlocked: 'ACHIEVEMENT UNLOCKED',
    ach: {
      merge1:    ['First Merge',    'Merge two gems'],
      lv5:       ['Hexagon',        'Create a Lv.5 gem'],
      lv8:       ['Octagon',        'Create a Lv.8 gem'],
      lv10:      ['Cushion Cut',    'Create a Lv.10 gem'],
      legend:    ['Legendary',      'Forge your first Legendary gem'],
      legend5:   ['Vault Keeper',   'Hold 5 Legendary gems in the vault'],
      combo3:    ['Triple Combo',   'Chain a ×3 combo'],
      combo5:    ['Combo Master',   'Chain a ×5 combo'],
      score500:  ['On Fire',        'Score 500 in one run'],
      score1200: ['Legendary Tier', 'Score 1,200 in one run'],
      score3000: ['Gem Tycoon',     'Score 3,000 in one run'],
      drops1k:   ['Dedicated',      'Drop 1,000 gems in total'],
    },
    names: ['Trilliant', 'Rhombus', 'Pentagon', '4-Point Star', 'Hexagon', 'Marquise', '6-Point Star', 'Octagon', '8-Point Star', 'Cushion Cut', 'Legendary'],
  },
  ko: {
    score: '점수', best: '최고', gems: '보석', howto: '조작법', combo: '콤보',
    how1: '마우스로<br>위치 조준', how2: '클릭으로<br>보석 투하', how1t: '드래그로<br>위치 조준', how2t: '손을 떼면<br>보석 투하', how3: '같은 레벨<br>충돌 시 합성',
    combo1: '1.3초 내 합성<br>→ 다음 보석 강화', combo3: 'COMBO ×3! → Lv.3<br>+ 화면 진동', base: '기본',
    restart: '다시 시작 ↺', vault: '보관함', vaultEmpty: '— 아직 없음 —',
    catalog: '보석 도감', spawn: '출현', owned: '획득',
    lcText: '전설의 보석', lcSub: '보관함에 추가됨',
    muteTitle: '음소거 토글', catalogTitle: '보석 도감', langTitle: '언어', achTitle: '업적',
    achievements: '업적', achUnlocked: '업적 달성',
    ach: {
      merge1:    ['첫 합성',       '보석 두 개를 합성'],
      lv5:       ['육각형',        'Lv.5 보석 생성'],
      lv8:       ['팔각형',        'Lv.8 보석 생성'],
      lv10:      ['쿠션 컷',       'Lv.10 보석 생성'],
      legend:    ['레전더리',      '첫 전설의 보석 제작'],
      legend5:   ['보관함 지기',   '보관함에 전설의 보석 5개 보유'],
      combo3:    ['트리플 콤보',   '×3 콤보 달성'],
      combo5:    ['콤보 마스터',   '×5 콤보 달성'],
      score500:  ['불타오르네',    '한 판에 500점'],
      score1200: ['레전더리 등급', '한 판에 1,200점'],
      score3000: ['보석 재벌',     '한 판에 3,000점'],
      drops1k:   ['꾸준함',        '누적 1,000개 보석 투하'],
    },
    names: ['트릴리언트', '마름모', '오각형', '4각 별', '육각형', '마르퀴즈', '6각 별', '팔각형', '8각 별', '쿠션 컷', '레전더리'],
  },
  ja: {
    score: 'スコア', best: 'ベスト', gems: 'ジェム', howto: '遊び方', combo: 'コンボ',
    how1: 'マウスで<br>位置を狙う', how2: 'クリックで<br>ジェム投下', how1t: 'ドラッグで<br>位置を狙う', how2t: '指を離すと<br>ジェム投下', how3: '同レベルが<br>衝突で合成',
    combo1: '1.3秒内に合成<br>→ 次のジェム強化', combo3: 'COMBO ×3! → Lv.3<br>+ 画面振動', base: '基本',
    restart: 'リスタート ↺', vault: '保管庫', vaultEmpty: '— まだなし —',
    catalog: 'ジェム図鑑', spawn: '出現', owned: '獲得',
    lcText: '伝説のジェム', lcSub: '保管庫に追加',
    muteTitle: 'サウンド切替', catalogTitle: 'ジェム図鑑', langTitle: '言語', achTitle: '実績',
    achievements: '実績', achUnlocked: '実績解除',
    ach: {
      merge1:    ['はじめての合成',   'ジェムを2つ合成'],
      lv5:       ['六角形',           'Lv.5ジェムを作る'],
      lv8:       ['八角形',           'Lv.8ジェムを作る'],
      lv10:      ['クッションカット', 'Lv.10ジェムを作る'],
      legend:    ['レジェンダリー',   '初の伝説のジェムを作る'],
      legend5:   ['保管庫の番人',     '保管庫に伝説のジェム5個'],
      combo3:    ['トリプルコンボ',   '×3コンボ達成'],
      combo5:    ['コンボマスター',   '×5コンボ達成'],
      score500:  ['絶好調',           '1プレイで500点'],
      score1200: ['伝説ランク',       '1プレイで1,200点'],
      score3000: ['ジェム長者',       '1プレイで3,000点'],
      drops1k:   ['継続は力',         '累計1,000個投下'],
    },
    names: ['トリリアント', 'ひし形', '五角形', '四芒星', '六角形', 'マーキス', '六芒星', '八角形', '八芒星', 'クッションカット', 'レジェンダリー'],
  },
};
export const LANGS = Object.keys(DICT);

// ?lang=ko from the embedding host wins over the saved/browser locale
const q = new URLSearchParams(location.search).get('lang');
const nav = (navigator.language || 'en').slice(0, 2);
export let lang = DICT[q] ? q : (localStorage.getItem('gmLang') || (DICT[nav] ? nav : 'en'));

export const t = key => DICT[lang][key] ?? DICT.en[key];

export function setLang(l) {
  lang = l;
  localStorage.setItem('gmLang', l);
  applyLang();
}

// Fill every [data-i18n] / [data-i18n-title] element from the dictionary
export function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  document.getElementById('lang-btn').textContent = lang.toUpperCase();
}
