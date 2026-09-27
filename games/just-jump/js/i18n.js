// Localization — EN / KO / JA. Keys are the English strings themselves;
// missing key falls back to English. `{0}`, `{1}` = positional args.
// Stage + skin names are proper nouns and stay English.
(() => {
  const NS = window.OneJump = window.OneJump || {};
  const LANGS = ['en', 'ko', 'ja'];
  const NAMES = { en: 'EN', ko: '한국어', ja: '日本語' };
  const KEY = 'jj_lang';

  const DICT = {
    ko: {
      'SCORE': '점수', 'TIER': '등급', 'NEW TIER': '새 등급', 'COINS': '코인', 'SPEED': '속도',
      'NEXT STAGE UNLOCK': '다음 스테이지 해금', 'NEXT STAGE UNLOCKED': '다음 스테이지 해금 완료',
      'SKIN {0}/{1}': '스킨 {0}/{1}', 'SKINS': '스킨', 'OWNED {0}/{1}': '보유 {0}/{1}', 'STAGE {0}/{1}': '스테이지 {0}/{1}',
      '— MYTHICAL CHARACTERS —': '— 신화 캐릭터 —',
      'BEST': '최고', 'TOTAL': '누적', 'BOOST': '부스트', 'PREVIOUS ME': '이전의 나',
      // moon-me cheers
      'GO GO GO!': '가자 가자!', 'YOU GOT THIS!': '할 수 있어!', 'NICE JUMP!': '멋진 점프!',
      'KEEP GOING!': '계속 가!', 'SO FAST!': '엄청 빨라!', "DON'T STOP!": '멈추지 마!', 'FIGHTING!': '파이팅!',
      'SPACE': '스페이스', 'TAP': '탭', 'JUMP': '점프',
      'AGAIN MID-AIR': '공중에서 한 번 더', 'DOUBLE': '2단 점프',
      'BUY  {0}': '구매  {0}', 'NEED  {0}': '필요  {0}',
      '▶ TAP TO START': '▶ 탭하여 시작', '▶ ONE MORE RUN': '▶ 한 판 더',
      'SO CLOSE!': '아깝다!', 'NEXT ▸ {0}': '다음 ▸ {0}', 'MAX TIER REACHED': '최고 등급 달성', '{0} TO GO': '{0} 남음', 'ONLY {0} TO GO!': '겨우 {0} 남았어!',
      '✦ NEW RECORD ✦': '✦ 신기록 ✦', 'GAME OVER': '게임 오버',
      '★ NEW BEST  +{0} ★': '★ 최고 기록  +{0} ★', 'BEST {0}': '최고 {0}',
      'TIME': '시간', 'JUMPS': '점프', 'DOUBLES': '2단 점프', 'DODGED': '회피',
      'MAX SPD': '최고 속도', 'STAGE': '스테이지', 'NEXT BOOST': '다음 부스트',
      'STAGE CLEARED!': '스테이지 클리어!', 'UNLOCKED  ▶  {0}': '해금  ▶  {0}',
      'STAGE MASTERED!': '스테이지 정복!', 'FINAL STAGE COMPLETE': '최종 스테이지 완료',
      'TAP / SPACE to JUMP': '탭 / 스페이스로 점프',
      'PAUSED': '일시정지', 'DODGE!': '회피!', 'TAP TO RESUME': '탭하여 계속',
      'NEW ADDITION': '새로운 추가',
      // obstacle names (tooltip)
      'Spike': '가시', 'Double Spike': '이중 가시', 'Bat': '박쥐', 'Saw': '톱날',
      'Hover': '부유체', 'Rocket': '로켓', 'Faller': '낙하물', 'Wall': '벽',
      'Tower': '탑', 'Ice Shard': '얼음 조각', 'Glacier': '빙하', 'Laser Gate': '레이저 게이트',
      'Drone': '드론', 'Meteor': '운석', 'Singularity': '특이점', 'Bubble': '거품',
      'Tentacle': '촉수', 'Jellyfish': '해파리', 'Cactus': '선인장', 'Sand Twister': '모래 회오리',
      'Scorpion': '전갈', 'Gear': '톱니바퀴', 'Hourglass': '모래시계', 'Pendulum': '진자',
      'Thorn Vine': '가시 덩굴', 'Acorn Drop': '도토리 낙하', 'Bramble Patch': '가시덤불', 'Stalactite': '종유석',
      'Prism Shard': '프리즘 조각', 'Crystal Cluster': '수정 군집', 'Gargoyle': '가고일', 'Candelabra': '촛대',
      'Organ Pipe': '오르간 파이프',
      'Failed to load game data. Run via local HTTP server (e.g. python -m http.server).':
        '게임 데이터를 불러오지 못했습니다. 로컬 HTTP 서버로 실행하세요 (예: python -m http.server).',
      ROOKIE: '루키', IRON: '아이언', BRONZE: '브론즈', SILVER: '실버', GOLD: '골드',
      PLATINUM: '플래티넘', SAPPHIRE: '사파이어', EMERALD: '에메랄드', RUBY: '루비', DIAMOND: '다이아몬드',
    },
    ja: {
      'SCORE': 'スコア', 'TIER': 'ランク', 'NEW TIER': '新ランク', 'COINS': 'コイン', 'SPEED': 'スピード',
      'NEXT STAGE UNLOCK': '次のステージ解放', 'NEXT STAGE UNLOCKED': '次のステージ解放済み',
      'SKIN {0}/{1}': 'スキン {0}/{1}', 'SKINS': 'スキン', 'OWNED {0}/{1}': '所持 {0}/{1}', 'STAGE {0}/{1}': 'ステージ {0}/{1}',
      '— MYTHICAL CHARACTERS —': '— 神話キャラクター —',
      'BEST': 'ベスト', 'TOTAL': '累計', 'BOOST': 'ブースト', 'PREVIOUS ME': '前回の自分',
      // moon-me cheers
      'GO GO GO!': 'いけいけ！', 'YOU GOT THIS!': 'きみならできる！', 'NICE JUMP!': 'ナイスジャンプ！',
      'KEEP GOING!': 'その調子！', 'SO FAST!': 'はやい！', "DON'T STOP!": '止まるな！', 'FIGHTING!': 'ファイト！',
      'SPACE': 'スペース', 'TAP': 'タップ', 'JUMP': 'ジャンプ',
      'AGAIN MID-AIR': '空中でもう一度', 'DOUBLE': '二段ジャンプ',
      'BUY  {0}': '購入  {0}', 'NEED  {0}': '必要  {0}',
      '▶ TAP TO START': '▶ タップでスタート', '▶ ONE MORE RUN': '▶ もう一回',
      'SO CLOSE!': '惜しい！', 'NEXT ▸ {0}': '次 ▸ {0}', 'MAX TIER REACHED': '最高ランク到達', '{0} TO GO': 'あと {0}', 'ONLY {0} TO GO!': 'あと {0} だけ！',
      '✦ NEW RECORD ✦': '✦ 新記録 ✦', 'GAME OVER': 'ゲームオーバー',
      '★ NEW BEST  +{0} ★': '★ ベスト更新  +{0} ★', 'BEST {0}': 'ベスト {0}',
      'TIME': 'タイム', 'JUMPS': 'ジャンプ', 'DOUBLES': '二段', 'DODGED': '回避',
      'MAX SPD': '最高速度', 'STAGE': 'ステージ', 'NEXT BOOST': '次のブースト',
      'STAGE CLEARED!': 'ステージクリア！', 'UNLOCKED  ▶  {0}': '解放  ▶  {0}',
      'STAGE MASTERED!': 'ステージ制覇！', 'FINAL STAGE COMPLETE': '最終ステージ完了',
      'TAP / SPACE to JUMP': 'タップ / スペースでジャンプ',
      'PAUSED': '一時停止', 'DODGE!': '回避!', 'TAP TO RESUME': 'タップで再開',
      'NEW ADDITION': '新しい追加',
      // obstacle names (tooltip)
      'Spike': 'トゲ', 'Double Spike': 'ダブルトゲ', 'Bat': 'コウモリ', 'Saw': 'ノコギリ',
      'Hover': '浮遊体', 'Rocket': 'ロケット', 'Faller': '落下物', 'Wall': '壁',
      'Tower': '塔', 'Ice Shard': '氷のかけら', 'Glacier': '氷河', 'Laser Gate': 'レーザーゲート',
      'Drone': 'ドローン', 'Meteor': '隕石', 'Singularity': '特異点', 'Bubble': '泡',
      'Tentacle': '触手', 'Jellyfish': 'クラゲ', 'Cactus': 'サボテン', 'Sand Twister': '砂嵐',
      'Scorpion': 'サソリ', 'Gear': '歯車', 'Hourglass': '砂時計', 'Pendulum': '振り子',
      'Thorn Vine': 'イバラのつる', 'Acorn Drop': 'どんぐり落下', 'Bramble Patch': 'イバラの茂み', 'Stalactite': 'つらら石',
      'Prism Shard': 'プリズムのかけら', 'Crystal Cluster': '水晶群', 'Gargoyle': 'ガーゴイル', 'Candelabra': '燭台',
      'Organ Pipe': 'パイプオルガン',
      'Failed to load game data. Run via local HTTP server (e.g. python -m http.server).':
        'ゲームデータを読み込めませんでした。ローカルHTTPサーバーで実行してください (例: python -m http.server)。',
      ROOKIE: 'ルーキー', IRON: 'アイアン', BRONZE: 'ブロンズ', SILVER: 'シルバー', GOLD: 'ゴールド',
      PLATINUM: 'プラチナ', SAPPHIRE: 'サファイア', EMERALD: 'エメラルド', RUBY: 'ルビー', DIAMOND: 'ダイヤモンド',
    },
  };

  function detect() {
    try {
      const saved = localStorage.getItem(KEY);
      if (LANGS.includes(saved)) return saved;
    } catch (_) {}
    const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return LANGS.includes(nav) ? nav : 'en';
  }

  let lang = detect();
  document.documentElement.lang = lang;

  // Pixel font per language, placed before `monospace` in every canvas font string.
  // Fonts are CJK-only subsets, so Latin/digits still render in monospace.
  // ponytail: one setter hook instead of editing ~80 ctx.font strings; per-set regex is negligible.
  const FAMILY = { ko: '"Galmuri11", monospace', ja: '"DotGothic16", monospace' };
  const fontDesc = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'font');
  Object.defineProperty(CanvasRenderingContext2D.prototype, 'font', {
    get() { return fontDesc.get.call(this); },
    set(v) { fontDesc.set.call(this, FAMILY[lang] ? v.replace(/\bmonospace\b/, FAMILY[lang]) : v); },
    configurable: true,
  });
  // canvas text alone may not trigger webfont load — request it up front
  const loadFont = () => {
    if (!FAMILY[lang] || !document.fonts) return;
    document.fonts.load('12px ' + FAMILY[lang]).catch(() => {});
    document.fonts.load('bold 12px ' + FAMILY[lang]).catch(() => {});
  };
  loadFont();

  const I18N = NS.I18N = {
    get lang() { return lang; },
    get name() { return NAMES[lang]; },
    t(key, ...args) {
      const s = (DICT[lang] && DICT[lang][key]) || key;
      return args.length ? s.replace(/\{(\d+)\}/g, (_, i) => args[i]) : s;
    },
    cycle() {
      lang = LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length];
      document.documentElement.lang = lang;
      try { localStorage.setItem(KEY, lang); } catch (_) {}
      loadFont();
      if (I18N.onChange) I18N.onChange(lang);
    },
    onChange: null,
  };
})();
