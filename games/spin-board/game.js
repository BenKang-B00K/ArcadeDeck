import { layout, pegs, roll, matchRoll, innerAt, knock, liveOf, flapper, flapRun, spinner, advance,
  TAU, PEG_R, PEG_CAP, PIVOT, FLAP_L, FLAP_W0, FLAP_W1, FLICK_MIN, BUTTON, STEP, CRACK } from './wheel.js';
import * as sfx from './audio.js';

// animal k = SVG symbol #a{k} in index.html, wears COLORS[k] (same table as Ladder)
const COLORS = ['#ff5d8f', '#4fd8ff', '#ffb547', '#b98bff', '#5dffb0', '#ff7a5c', '#7c9cff', '#ffe45e', '#ff9de6', '#9dff5d',
  '#2ee6d6', '#ff4766', '#d6c8ff', '#d89a6a', '#8f6bff', '#e45cff', '#e8eef8', '#ffc0a0', '#5db8ff', '#ff9a3d'];
// Numbers / Custom segments cycle the brightest candy tones
const CANDY = ['#ff5d8f', '#4fd8ff', '#ffb547', '#b98bff', '#5dffb0', '#ff7a5c', '#7c9cff', '#ffe45e', '#e45cff', '#2ee6d6', '#ff9a3d', '#9dff5d'];
const MAX = 10, MAX_NUM = 36, MAX_ENTRIES = 24, TXT = 12; // players; values on a Numbers board; Custom entries; chars per entry
const animal = names => n => names[n - 1];

const I18N = {
  en: {
    title: 'Spin Board', bPlayers: 'Players', bNumbers: 'Numbers', bCustom: 'Custom', bQuick: 'Quick sets',
    qyesno: 'Yes / No', qcoin: 'Coin', qdice: 'Dice', qfood: 'Food', yes: 'Yes', no: 'No', heads: 'Heads', tails: 'Tails',
    players: 'Players', reshuffle: 'Shuffle animals', more: 'Add player', less: 'Remove player',
    from: 'From', to: 'To', count: '{n} numbers', rangeBad: 'Pick 2 to {n} numbers',
    entryN: 'Entry {n}', add: 'Add entry', delN: 'Remove entry {n}', sizeN: 'Entry {n}, size ×{name}', gotRes: '{name}: {n}',
    food: ['Pizza', 'Burger', 'Sushi', 'Tacos', 'Noodles', 'Salad'],
    mode: 'Mode', mpick: 'Pick', mknock: 'Knockout', mmatch: 'Match',
    npick: 'The pointer picks one. Spin as often as you like.', nknock: 'Each spin knocks one off the wheel until one is left.',
    nmatch: 'Two rings: every animal gets a result. Pick seats, then spin.',
    lastWins: 'Last one wins', lastLoses: 'Last one loses', comeback: 'Comeback',
    spice: 'Spice', sMild: 'Mild', sSpicy: 'Spicy', sWild: 'Wild',
    nmild: 'No specials: the wheel just spins.', nspicy: 'Teeter 30% · Kickback 20% · Gust 20%',
    nwild: 'Teeter 40% · Kickback 30% · Gust 30% · Joker 40% (Match)', fair: 'Every spin is fair: the result is rolled before the wheel moves.',
    start: 'Start', spin: 'SPIN', edit: 'Edit', again: 'New', auto: 'Auto', ff: 'Fast forward', summary: 'Results', close: 'Close', replay: 'Replay',
    hint: 'Flick the wheel or tap SPIN', picked: '{n}!', tally: '×{n}', rand: 'Random', pick: 'Pick your seat',
    out: 'OUT!', back: 'BACK!', outName: '{name} is out!', backName: '{name} is back!', comebackPct: 'Comeback {n}',
    round: 'Round {n}', roundBack: 'Round {n} · back in round {name}', pair: '{name} · {n}', champ: '{name} wins!', doomed: '{name} loses!',
    snap: 'SNAP!', pegBroke: 'Broken peg: {name} {n}', pegFixed: 'FIXED!',
    soClose: 'SO CLOSE!', bounce: 'BOUNCE!', whoosh: 'WHOOSH!', joker: 'Joker swap!', stay: 'STAYING!', lucky: 'LUCKY SWAP!', unlucky: 'UNLUCKY SWAP!',
    link: 'Phone link', watching: 'Watching',
    results: 'Results', pWin: 'Winner', pRank: 'Rank', pRatio: 'Ratio', pTeam: 'Teams', pPen: 'Penalty', pBill: 'Bill',
    winners: 'Winners', teams: 'Teams', pens: 'Penalties', total: 'Total', frees: 'Pays 0', minPay: 'Min. {n} each', firsts: '1st places', zeros: '0% slots', any: 'Random',
    win: 'WIN!', lose: 'Pass', pen: 'Penalty', safe: 'Safe', team: 'Team {n}', rank: n => n + (['st', 'nd', 'rd'][n - 1] || 'th'),
    player: animal(['Rabbit', 'Penguin', 'Tiger', 'Cat', 'Panda', 'Fox', 'Dog', 'Lion', 'Bear', 'Frog', 'Koala', 'Pig', 'Mouse', 'Monkey', 'Owl', 'Chick', 'Cow', 'Sheep', 'Raccoon', 'Hamster']),
    music: 'Music', bgm: 'BGM', fx: 'EFFECT', sfx: 'Sound effects', volume: 'Volume', lang: 'Language',
  },
  ko: {
    title: '돌림판', bPlayers: '참가자', bNumbers: '숫자', bCustom: '직접 입력', bQuick: '빠른 세트',
    qyesno: '예 / 아니오', qcoin: '동전', qdice: '주사위', qfood: '음식', yes: '예', no: '아니오', heads: '앞면', tails: '뒷면',
    players: '참가자', reshuffle: '동물 바꾸기', more: '참가자 추가', less: '참가자 삭제',
    from: '시작', to: '끝', count: '숫자 {n}개', rangeBad: '숫자는 2~{n}개까지',
    entryN: '항목 {n}', add: '항목 추가', delN: '항목 {n} 삭제', sizeN: '항목 {n}, 크기 ×{name}', gotRes: '{name}: {n}',
    food: ['치킨', '피자', '짜장면', '떡볶이', '김밥', '삼겹살'],
    mode: '모드', mpick: '뽑기', mknock: '탈락전', mmatch: '짝 맞추기',
    npick: '바늘이 하나를 뽑아요. 몇 번이든 돌리세요.', nknock: '돌릴 때마다 하나씩 탈락, 마지막 하나가 남을 때까지.',
    nmatch: '두 겹 원판: 모두가 결과를 받아요. 자리를 고르고 돌리세요.',
    lastWins: '마지막 생존자 승리', lastLoses: '마지막 생존자 벌칙', comeback: '부활 칸',
    spice: '양념', sMild: '순한맛', sSpicy: '매운맛', sWild: '불맛',
    nmild: '특수 효과 없음: 그냥 돌아가요.', nspicy: '아슬아슬 30% · 튕김 20% · 돌풍 20%',
    nwild: '아슬아슬 40% · 튕김 30% · 돌풍 30% · 조커 40% (짝 맞추기)', fair: '모든 회전은 공정해요: 결과는 돌림판이 돌기 전에 정해져요.',
    start: '시작', spin: '돌려!', edit: '편집', again: '새 판', auto: '자동', ff: '빨리 감기', summary: '결과', close: '닫기', replay: '다시',
    hint: '돌림판을 튕기거나 돌려!를 누르세요', picked: '{n}!', tally: '×{n}', rand: '랜덤', pick: '자리를 고르세요',
    out: '탈락!', back: '부활!', outName: '{name} 탈락!', backName: '{name} 부활!', comebackPct: '부활 {n}',
    round: '{n}라운드', roundBack: '{n}라운드 · {name}라운드 부활', pair: '{name} · {n}', champ: '{name} 우승!', doomed: '{name} 벌칙!',
    snap: '뚝!', pegBroke: '부러진 핀: {name} {n}', pegFixed: '수리 완료!',
    soClose: '아슬아슬!', bounce: '튕김!', whoosh: '휘잉!', joker: '조커 교환!', stay: '그대로!', lucky: 'Lucky!', unlucky: 'Unlucky!',
    link: '폰 연결', watching: '관전 중',
    results: '결과', pWin: '당첨', pRank: '순위', pRatio: '비율', pTeam: '팀', pPen: '벌칙', pBill: '정산',
    winners: '당첨 수', teams: '팀 수', pens: '벌칙 수', total: '총액', frees: '면제 수', minPay: '1인 최소 {n}', firsts: '1등 수', zeros: '0% 수', any: '랜덤',
    win: '당첨!', lose: '꽝', pen: '벌칙', safe: '통과', team: '{n}팀', rank: '{n}등',
    player: animal(['토끼', '펭귄', '호랑이', '고양이', '판다', '여우', '강아지', '사자', '곰', '개구리', '코알라', '돼지', '생쥐', '원숭이', '부엉이', '병아리', '젖소', '양', '라쿤', '햄스터']),
    music: '음악', bgm: '배경음', fx: '효과음', sfx: '효과음', volume: '볼륨', lang: '언어',
  },
  ja: {
    title: 'ルーレット', bPlayers: 'プレイヤー', bNumbers: '数字', bCustom: 'カスタム', bQuick: 'クイックセット',
    qyesno: 'はい / いいえ', qcoin: 'コイン', qdice: 'サイコロ', qfood: '食べ物', yes: 'はい', no: 'いいえ', heads: '表', tails: '裏',
    players: 'プレイヤー', reshuffle: '動物を入れ替え', more: 'プレイヤーを追加', less: 'プレイヤーを削除',
    from: 'から', to: 'まで', count: '数字{n}個', rangeBad: '数字は2〜{n}個まで',
    entryN: '項目{n}', add: '項目を追加', delN: '項目{n}を削除', sizeN: '項目{n}、サイズ ×{name}', gotRes: '{name}：{n}',
    food: ['ラーメン', '寿司', 'カレー', '焼肉', 'うどん', 'お好み焼き'],
    mode: 'モード', mpick: '抽選', mknock: '勝ち抜き', mmatch: '組み合わせ',
    npick: '針がひとつ選びます。何度でも回せます。', nknock: '回すたびにひとつ脱落。最後のひとつになるまで。',
    nmatch: '二重の輪：全員に結果が届きます。席を選んで回そう。',
    lastWins: '最後の1人が勝ち', lastLoses: '最後の1人が負け', comeback: '復活マス',
    spice: 'スパイス', sMild: 'マイルド', sSpicy: 'ピリ辛', sWild: '激辛',
    nmild: '特殊演出なし：ただ回るだけ。', nspicy: 'ギリギリ 30% · はね返り 20% · 突風 20%',
    nwild: 'ギリギリ 40% · はね返り 30% · 突風 30% · ジョーカー 40%（組み合わせ）', fair: 'どの回転も公平：結果は回る前に決まっています。',
    start: 'スタート', spin: 'まわせ！', edit: '編集', again: '新規', auto: 'オート', ff: '早送り', summary: '結果', close: '閉じる', replay: 'もう一度',
    hint: 'ルーレットをはじくか、まわせ！をタップ', picked: '{n}！', tally: '×{n}', rand: 'ランダム', pick: '席を選んでね',
    out: 'アウト！', back: '復活！', outName: '{name} アウト！', backName: '{name} 復活！', comebackPct: '復活 {n}',
    round: '{n}ラウンド', roundBack: '{n}ラウンド・{name}ラウンドで復活', pair: '{name}・{n}', champ: '{name}の勝ち！', doomed: '{name}の負け！',
    snap: 'ポキッ！', pegBroke: '折れたピン：{name} {n}', pegFixed: 'なおった！',
    soClose: 'おしい！', bounce: 'はね返り！', whoosh: 'ビューン！', joker: 'ジョーカー交換！', stay: 'そのまま！', lucky: 'Lucky!', unlucky: 'Unlucky!',
    link: 'スマホ接続', watching: '観戦中',
    results: '結果', pWin: '当たり', pRank: '順位', pRatio: '割合', pTeam: 'チーム', pPen: '罰ゲーム', pBill: '割り勘',
    winners: '当たり数', teams: 'チーム数', pens: '罰ゲーム数', total: '合計', frees: '免除数', minPay: '1人最低{n}', firsts: '1位数', zeros: '0%数', any: 'ランダム',
    win: '当たり！', lose: 'はずれ', pen: '罰ゲーム', safe: 'セーフ', team: 'チーム{n}', rank: '{n}位',
    player: animal(['ウサギ', 'ペンギン', 'トラ', 'ネコ', 'パンダ', 'キツネ', 'イヌ', 'ライオン', 'クマ', 'カエル', 'コアラ', 'ブタ', 'ネズミ', 'サル', 'フクロウ', 'ヒヨコ', 'ウシ', 'ヒツジ', 'アライグマ', 'ハムスター']),
    music: '音楽', bgm: 'BGM', fx: '効果音', sfx: '効果音', volume: '音量', lang: '言語',
  },
};

// ---------- state ----------
const KEY = 'spin-board.v1'; // ArcadeDeck games share one origin: slug-prefixed
const saved = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mod = (x, m = TAU) => ((x % m) + m) % m;
const BOARDS = ['players', 'numbers', 'custom', 'quick'], QUICK = ['yesno', 'coin', 'dice', 'food'], MODES = ['pick', 'knock', 'match'];
const SPICES = ['mild', 'spicy', 'wild'], PRESETS = ['win', 'pen', 'rank', 'team', 'ratio', 'bill'];
const navLang = (navigator.language || 'en').slice(0, 2), qLang = new URLSearchParams(location.search).get('lang'); // ArcadeDeck passes its page language
const okRange = (a, b) => Number.isInteger(a) && Number.isInteger(b) && b - a + 1 >= 2 && b - a + 1 <= MAX_NUM;
const S = {
  lang: I18N[saved.lang] ? saved.lang : I18N[qLang] ? qLang : I18N[navLang] ? navLang : 'en', // a saved choice wins
  board: BOARDS.includes(saved.board) ? saved.board : 'players',
  quick: QUICK.includes(saved.quick) ? saved.quick : 'yesno',
  mode: MODES.includes(saved.mode) ? saved.mode : 'pick',
  spice: SPICES.includes(saved.spice) ? saved.spice : 'spicy',
  lastLoses: !!saved.lastLoses,
  comeback: saved.comeback ?? true,
  n: clamp(+saved.n || 4, 2, MAX),
  from: okRange(saved.from, saved.to) ? saved.from : 1,
  to: okRange(saved.from, saved.to) ? saved.to : 10,
  // custom entries [{ t: text, w: size 1..3 }]; null until first edited, so the starter list follows the language
  custom: Array.isArray(saved.custom) && saved.custom.length >= 2
    ? saved.custom.slice(0, MAX_ENTRIES).map(e => ({ t: String(e?.t ?? '').slice(0, TXT), w: clamp(Math.round(+e?.w) || 1, 1, 3) })) : null,
  // Match results: Ladder's Quick fill, same rules and saved shape
  preset: PRESETS.includes(saved.preset) ? saved.preset : 'win',
  ratio: Array.isArray(saved.ratio) ? saved.ratio : [],
  winners: Number.isInteger(saved.winners) ? saved.winners : 1, // win/pen: how many WIN / penalty slots
  winSlots: Array.isArray(saved.winSlots) ? saved.winSlots : [],
  firsts: Number.isInteger(saved.firsts) ? saved.firsts : 1, // rank: how many tied 1st places
  zeros: Number.isInteger(saved.zeros) ? saved.zeros : null, // ratio/bill: fixed number of 0% / pays-0 slots, null = random
  cur: saved.cur,
  total: Number.isInteger(saved.total) ? saved.total : 0,
  bill: Array.isArray(saved.bill) ? saved.bill : [],
  teams: Number.isInteger(saved.teams) ? saved.teams : 2,
  teamOf: Array.isArray(saved.teamOf) ? saved.teamOf : [],
  music: saved.music ?? 50,
  sfx: saved.sfx ?? 80,
};
// phone link (bottom of file). mine: this phone's own setup, parked while it watches another phone's game
const NET = { mine: null };
const save = () => {
  // watching: S holds the host's setup, so disk keeps this phone's own (language and volume stay its own)
  try { localStorage.setItem(KEY, JSON.stringify(NET.mine ? { ...NET.mine, lang: S.lang, music: S.music, sfx: S.sfx } : S)); } catch { /* sandboxed iframe */ }
  NET.sync?.();
};

const t = (k, n, name) => {
  const v = I18N[S.lang][k] ?? I18N.en[k];
  return typeof v === 'function' ? v(n) : typeof v === 'string' ? v.replace('{n}', n).replace('{name}', name) : v;
};
const range = n => Array.from({ length: n }, (_, i) => i);
const shuffle = a => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const num = v => new Intl.NumberFormat(S.lang).format(v);
const pct = f => new Intl.NumberFormat(S.lang, { style: 'percent', maximumFractionDigits: 1 }).format(f);

// ---------- Match results: Ladder's Quick fill (slot i of S.n) ----------
// bill currencies: symbol, step (smallest non-zero payment; every amount is a multiple of it), default total
const CUR = { USD: ['$', 5, 100], KRW: ['₩', 1000, 50000], JPY: ['¥', 100, 5000] };
if (!CUR[S.cur]) S.cur = { ko: 'KRW', ja: 'JPY' }[S.lang] || 'USD';
if (S.total <= 0) S.total = CUR[S.cur][2];
// `units` split into n random parts: stars and bars, so every split is equally likely (Ladder)
const stars = (units, zeros) => {
  const k = Math.max(1, Math.min(S.n - (zeros ?? 0), zeros == null ? S.n : units)), min = zeros == null ? 0 : 1;
  const slots = units - k * min + k - 1, bars = new Set();
  while (bars.size < k - 1) bars.add(Math.floor(Math.random() * slots));
  const pts = [-1, ...[...bars].sort((a, b) => a - b), slots];
  return shuffle([...range(k).map(i => pts[i + 1] - pts[i] - 1 + min), ...Array(S.n - k).fill(0)]);
};
// ponytail: rejection loop, worst case 2 non-zero slots (~19-21 tries); fine at this size
const rollRatio = () => {
  if (S.zeros != null) S.zeros = clamp(S.zeros, 0, S.n - 2);
  do S.ratio = stars(20, S.zeros).map(u => u * 5); while (Math.max(...S.ratio) > 50);
};
const rollBill = () => {
  const step = CUR[S.cur][1];
  if (S.zeros != null) S.zeros = clamp(S.zeros, 0, S.n - 1);
  S.bill = stars(Math.floor(S.total / step), S.zeros).map(u => u * step);
  const payers = range(S.n).filter(i => S.bill[i]);
  S.bill[payers.length ? payers[Math.floor(Math.random() * payers.length)] : Math.floor(Math.random() * S.n)] += S.total % step;
};
const marks = () => S.preset === 'win' || S.preset === 'pen';
const mid = () => (S.n - 1) >> 1;
const rankOf = slot => { const d = slot - mid(); return d > 0 ? 2 * d : 1 - 2 * d; };
const place = slot => Math.max(1, rankOf(slot) - S.firsts + 1);
const rollWinners = () => { S.winSlots = S.winners > 1 ? shuffle(range(S.n)).slice(0, S.winners) : [mid()]; };
const maxTeams = () => Math.max(2, S.n >> 1);
const rollTeams = () => { S.teams = clamp(S.teams, 2, maxTeams()); S.teamOf = shuffle(range(S.n).map(i => i % S.teams)); };
const reroll = () => ({ ratio: rollRatio, bill: rollBill, team: rollTeams }[S.preset] || (marks() ? rollWinners : () => {}))();
const fixPresets = () => { // re-roll splits saved by older runs or not matching the player count
  S.winners = clamp(S.winners, 1, S.n - 1); S.firsts = clamp(S.firsts, 1, S.n - 1); S.teams = clamp(S.teams, 2, maxTeams());
  if (S.preset === 'ratio' && (S.ratio.length !== S.n || S.ratio.some(v => v % 5 || v > 50) || (S.zeros != null && S.ratio.filter(v => !v).length !== S.zeros))) rollRatio();
  if (S.preset === 'bill' && (S.bill.length !== S.n || S.bill.reduce((a, b) => a + b, 0) !== S.total)) rollBill();
  if (marks() && (S.winSlots.length !== S.winners || S.winSlots.some(v => v >= S.n))) rollWinners();
  if (S.preset === 'team' && (S.teamOf.length !== S.n || Math.max(...S.teamOf) + 1 !== S.teams)) rollTeams();
};
fixPresets();
const money = v => CUR[S.cur][0] + v.toLocaleString(S.lang);
const presetVal = i => S.preset === 'win' ? t(S.winSlots.includes(i) ? 'win' : 'lose')
  : S.preset === 'pen' ? t(S.winSlots.includes(i) ? 'pen' : 'safe')
  : S.preset === 'rank' ? t('rank', place(i))
  : S.preset === 'team' ? t('team', String.fromCharCode(65 + S.teamOf[i]))
  : S.preset === 'bill' ? money(S.bill[i]) : S.ratio[i] + '%';
const MEDAL = ['#ffd54a', '#dfe3f5', '#e8955a']; // 1st-3rd, then plain purple
const share = e => S.preset === 'bill' ? S.bill[e] : S.ratio[e];
const isBig = e => marks() ? S.winSlots.includes(e) : S.preset === 'rank' ? rankOf(e) <= S.firsts
  : share(e) === Math.max(...range(S.n).map(share)); // ratio / bill: ties all count
const isBad = () => S.preset === 'pen' || S.preset === 'bill';
const slotRank = e => S.preset === 'ratio' || S.preset === 'bill' ? -share(e) : marks() ? (isBig(e) ? -1 : e)
  : S.preset === 'team' ? S.teamOf[e] * MAX + e : rankOf(e);
// result glyph (#g-* in index.html) and its tint; ratio draws its own pie
const glyphOf = e => marks() ? [isBig(e) ? S.preset : S.preset === 'win' ? 'pass' : 'safe']
  : S.preset === 'rank' ? ['rank', MEDAL[place(e) - 1] || '#b98bff'] : S.preset === 'team' ? ['team', COLORS[S.teamOf[e]]]
  : S.preset === 'bill' ? ['bill'] : ['ratio'];
const glyphHTML = e => {
  const [id, tint] = glyphOf(e);
  if (id === 'ratio') return `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="#5a4a96" stroke="#e6dcff" stroke-opacity=".5"/><circle cx="16" cy="16" r="5.5" fill="none" stroke="${isBig(e) ? '#ffd54a' : '#5dffb0'}" stroke-width="11" stroke-dasharray="${S.ratio[e] * .3456} 99" transform="rotate(-90 16 16)"/><circle cx="16" cy="16" r="11" fill="url(#gb)"/></svg>`;
  return `<svg${tint ? ` style="color:${tint}"` : ''}><use href="#g-${id}"/></svg>`;
};
// the section tone on the ring: team colour, gold spotlight, red for penalty / biggest payer
const toneOf = e => S.preset === 'team' ? COLORS[S.teamOf[e]] : isBig(e) ? isBad() ? '#ff4d5e' : '#ffd54a' : '';
// a landed animal dressed for its result (#x-* in index.html); the penalty keeps the soot. Static, for the canvas sprite
const ol = (id, tint) => `<use href="#x-${id}" filter="url(#ol)"${tint ? ` style="color:${tint}"` : ''}/>`;
const dress = e => {
  const p = S.preset, big = isBig(e);
  if (p === 'win') return big ? ol('crown') : '';
  if (p === 'pen') return big ? '<use href="#x-soot"/>' : '';
  if (p === 'rank') return place(e) <= 3 ? ol('cup', MEDAL[place(e) - 1]) : '';
  if (p === 'team') return ol('hat', COLORS[S.teamOf[e]]);
  return p === 'bill' && big ? ol('cash') : '';
};
// mood: the trophy, 1st place and the smallest bill cheer; the penalty cries
const moodOf = e => {
  const p = S.preset;
  if (p === 'win' || p === 'rank') return (p === 'win' ? isBig(e) : place(e) === 1) ? 'win' : '';
  if (p === 'pen') return isBig(e) ? 'cry' : '';
  return p === 'bill' && share(e) === Math.min(...range(S.n).map(share)) ? 'win' : '';
};

// ---------- what's on the wheel ----------
const ZOO = shuffle(range(COLORS.length)); // players get the first n animals: reshuffled on load and Shuffle, never saved
const animalName = i => t('player', ZOO[i] + 1);
const blinkVars = () => `--bt:${(3 + Math.random() * 4).toFixed(2)}s;--bd:${(-Math.random() * 7).toFixed(2)}s${Math.random() < 0.33 ? ';--bk:blink2' : ''}`;
const faceZ = z => `<svg class="ani" style="${blinkVars()}" aria-hidden="true"><use href="#a${z}"/></svg>`;
// the last candy never matches the first, its neighbour round the circle
const candy = (i, n) => CANDY[(i + (n % CANDY.length === 1 && i === n - 1 ? 5 : 0)) % CANDY.length];
const playerItem = p => ({ label: animalName(p), w: 1, color: COLORS[ZOO[p]], z: ZOO[p] });
// a Players board seat: its player, or an empty numbered seat while they're still being picked
const seatItem = (p, i) => p >= 0 ? playerItem(p) : { label: String(i + 1), w: 1, color: i % 2 ? '#3a2f7a' : '#2f2668', z: -1 };
function quickItems() {
  const two = pairs => pairs.map(([k, color, gl]) => ({ label: t(k), w: 1, color, z: -1, gl }));
  if (S.quick === 'yesno') return two([['yes', '#5dffb0', 'yes'], ['no', '#ff5d8f', 'no']]);
  if (S.quick === 'coin') return two([['heads', '#ffd54a', 'heads'], ['tails', '#b8b0de', 'tails']]);
  if (S.quick === 'dice') return range(6).map(i => ({ label: num(i + 1), w: 1, color: candy(i, 6), z: -1, gl: 'd' + (i + 1) }));
  return t('food').map((x, i, a) => ({ label: x, w: 1, color: candy(i, a.length), z: -1 }));
}
// what goes on the wheel: [{ label, w (weight), color, z (animal symbol, -1 = text), gl (quick set glyph) }]
function board() {
  if (S.board === 'players') return range(S.n).map(playerItem);
  if (S.board === 'quick') return quickItems();
  const n = S.to - S.from + 1;
  if (S.board === 'numbers') return range(n).map(i => ({ label: num(S.from + i), w: 1, color: candy(i, n), z: -1 }));
  const list = entries();
  return list.map((e, i) => ({ label: e.t.trim() || '—', w: e.w, color: candy(i, list.length), z: -1 }));
}
const entries = () => S.board === 'quick' ? quickItems().map(it => ({ t: it.label, w: 1 })) : S.custom ?? t('food').map(x => ({ t: x, w: 1 }));
// first edit keeps the list it was shown; editing a quick set turns it into a custom board
function own() {
  if (S.board === 'quick') { S.custom = entries(); S.board = 'custom'; markBoard(); }
  return S.custom ??= entries().map(e => ({ ...e }));
}
const modeOf = () => S.mode === 'match' && S.board !== 'players' ? 'pick' : S.mode; // Match is Players only

const $ = s => document.querySelector(s);
const el = (tag, cls) => Object.assign(document.createElement(tag), { className: cls || '' });
const [setup, play, wrap, hub, status, strip, summary] = ['#setup', '#play', '#wrap', '#hub', '#status', '#strip', '#summary'].map($);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const FONT = '"Pretendard", system-ui, -apple-system, "Segoe UI", "Apple SD Gothic Neo", "Malgun Gothic", "Hiragino Sans", "Yu Gothic UI", "Noto Sans KR", "Noto Sans JP", sans-serif';
const vibrate = p => { try { navigator.vibrate?.(p); } catch { /* not allowed in iframe */ } };

// ---------- setup screen ----------
function markBoard() {
  document.querySelectorAll('[data-board]').forEach(b => b.setAttribute('aria-pressed', b.dataset.board === S.board));
  document.querySelectorAll('[data-quick]').forEach(b => b.setAttribute('aria-pressed', b.dataset.quick === S.quick));
  $('#quickRow').hidden = S.board !== 'quick';
}
function renderSetup() {
  markBoard();
  const b = S.board, mode = modeOf();
  $('#edPlayers').hidden = b !== 'players';
  $('#edNumbers').hidden = b !== 'numbers';
  $('#edCustom').hidden = b !== 'custom' && b !== 'quick';
  if (b === 'players') {
    $('#zoo').replaceChildren(...range(S.n).map(i => {
      const li = el('li');
      li.style.setProperty('--c', COLORS[ZOO[i]]);
      li.style.setProperty('--i', i); // idle hop stagger
      li.innerHTML = `${faceZ(ZOO[i])}<span>${animalName(i)}</span>`;
      return li;
    }));
    $('#count').value = S.n;
    $('#minus').disabled = S.n <= 2;
    $('#plus').disabled = S.n >= MAX;
  }
  if (b === 'numbers') { fromIn.value = S.from; toIn.value = S.to; rangeNote(true); }
  if (b === 'custom' || b === 'quick') renderCustom();
  $('[data-mode="match"]').hidden = b !== 'players';
  document.querySelectorAll('[data-mode]').forEach(x => x.setAttribute('aria-pressed', x.dataset.mode === mode));
  $('#modeNote').textContent = t('n' + mode);
  $('#opKnock').hidden = mode !== 'knock';
  $('#opMatch').hidden = mode !== 'match';
  document.querySelectorAll('[data-last]').forEach(x => x.setAttribute('aria-pressed', (x.dataset.last === 'lose') === S.lastLoses));
  $('#cbBtn').setAttribute('aria-pressed', S.comeback);
  document.querySelectorAll('[data-spice]').forEach(x => x.setAttribute('aria-pressed', x.dataset.spice === S.spice));
  $('#spiceNote').textContent = t('n' + S.spice);
  if (mode === 'match') renderPresets();
  sfx.setMusic(mode === 'match' ? S.preset : mode === 'knock' ? 'knock' : 'spin'); // each has its own loop
  drawPreview();
}

document.querySelectorAll('[data-board]').forEach(b => b.onclick = () => { S.board = b.dataset.board; sfx.ui(); save(); renderSetup(); });
document.querySelectorAll('[data-quick]').forEach(b => b.onclick = () => { S.quick = b.dataset.quick; sfx.ui(); save(); renderSetup(); });
document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { S.mode = b.dataset.mode; sfx.ui(); save(); renderSetup(); });
document.querySelectorAll('[data-spice]').forEach(b => b.onclick = () => { S.spice = b.dataset.spice; sfx.ui(); save(); renderSetup(); });
document.querySelectorAll('[data-last]').forEach(b => b.onclick = () => { S.lastLoses = b.dataset.last === 'lose'; sfx.ui(); save(); renderSetup(); });
$('#cbBtn').onclick = () => { S.comeback = !S.comeback; sfx.ui(); save(); renderSetup(); };
const setCount = d => { S.n = clamp(S.n + d, 2, MAX); fixPresets(); reroll(); sfx.ui(); save(); renderSetup(); };
$('#minus').onclick = () => setCount(-1);
$('#plus').onclick = () => setCount(1);
$('#orderBtn').onclick = () => { shuffle(ZOO); sfx.shuffle(); renderSetup(); NET.sync?.(); };

// numbers: a range is taken as soon as it is valid; leaving a field with a bad one puts the last good range back
const fromIn = $('#from'), toIn = $('#to');
function rangeNote(ok) {
  for (const i of [fromIn, toIn]) i.setAttribute('aria-invalid', !ok);
  $('#numNote').textContent = ok ? t('count', S.to - S.from + 1) : t('rangeBad', MAX_NUM);
  $('#numNote').classList.toggle('bad', !ok);
}
fromIn.oninput = toIn.oninput = () => {
  const a = +fromIn.value, b = +toIn.value, ok = fromIn.value !== '' && toIn.value !== '' && Math.abs(a) < 1e6 && Math.abs(b) < 1e6 && okRange(a, b);
  if (ok) { S.from = a; S.to = b; save(); drawPreview(); }
  rangeNote(ok);
};
fromIn.onchange = toIn.onchange = () => { if (fromIn.getAttribute('aria-invalid') === 'true') renderSetup(); };

// custom (and quick sets, which turn custom on the first edit): colour swatch, text, size chip (×1 → ×2 → ×3), share, remove
function renderCustom() {
  const list = entries(), items = board(), total = list.reduce((a, e) => a + e.w, 0);
  $('#custom').replaceChildren(...list.map((e, i) => {
    const li = el('li');
    li.style.setProperty('--c', items[i].color);
    li.innerHTML = `<span class="sw"></span><input maxlength="${TXT}" autocomplete="off" enterkeyhint="next" data-i="${i}"><button class="pill wt" type="button" data-i="${i}" data-w="${e.w}">×${e.w}</button><span class="pct">${pct(e.w / total)}</span><button class="icon-btn sm del" type="button" data-i="${i}"><svg class="ic"><use href="#i-close"/></svg></button>`;
    const inp = li.querySelector('input');
    inp.value = e.t; inp.placeholder = '—'; inp.setAttribute('aria-label', t('entryN', i + 1));
    li.querySelector('.wt').setAttribute('aria-label', t('sizeN', i + 1, e.w));
    const del = li.querySelector('.del');
    del.setAttribute('aria-label', t('delN', i + 1));
    del.disabled = list.length <= 2;
    return li;
  }));
  $('#addBtn').disabled = list.length >= MAX_ENTRIES;
}
const custom = $('#custom');
custom.addEventListener('input', e => { own()[e.target.dataset.i].t = e.target.value; save(); drawPreview(); });
custom.addEventListener('keydown', e => { // Enter walks down the list
  if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
  e.preventDefault();
  const next = custom.querySelector(`input[data-i="${+e.target.dataset.i + 1}"]`);
  next ? next.focus() : e.target.blur();
});
custom.addEventListener('click', e => {
  const b = e.target.closest('button'), i = +b?.dataset.i;
  if (!b) return;
  if (b.classList.contains('wt')) own()[i].w = own()[i].w % 3 + 1;
  else own().splice(i, 1);
  sfx.ui(); save(); renderCustom(); drawPreview();
  custom.querySelector(b.classList.contains('wt') ? `.wt[data-i="${i}"]` : `input[data-i="${Math.min(i, own().length - 1)}"]`)?.focus();
});
$('#addBtn').onclick = () => {
  own().push({ t: '', w: 1 });
  sfx.ui(); save(); renderCustom(); drawPreview();
  custom.querySelector('li:last-child input').focus();
};

// Match results: Ladder's Quick fill tabs, the options row under them and the results as chips
function renderPresets() {
  document.querySelectorAll('[data-preset]').forEach(b => b.setAttribute('aria-pressed', b.dataset.preset === S.preset));
  $('#results').replaceChildren(...range(S.n).map(i => {
    const li = el('li'), tone = toneOf(i);
    if (tone) li.style.setProperty('--c', tone);
    li.innerHTML = `<i class="gl" aria-hidden="true">${glyphHTML(i)}</i><span></span>`;
    li.lastChild.textContent = presetVal(i);
    return li;
  }));
  const counts = range(S.n - 1).map(i => i + 1);
  const [key, opts, label = key] = { win: ['winners', counts], pen: ['winners', counts, 'pens'], rank: ['firsts', counts],
    ratio: ['zeros', [null, ...range(S.n - 1)]], bill: ['zeros', [null, ...range(S.n)], 'frees'], team: ['teams', range(maxTeams() - 1).map(i => i + 2)] }[S.preset];
  const kids = (S.preset === 'ratio' && S.n < 3) || opts.length < 2 ? [] : [Object.assign(el('span', 'label'), { textContent: t(label) }), ...opts.map(v => {
    const b = Object.assign(el('button', 'pill'), { type: 'button', textContent: v ?? t('any') });
    b.setAttribute('aria-pressed', S[key] === v);
    b.onclick = () => { S[key] = v; reroll(); sfx.ui(); save(); renderSetup(); };
    return b;
  })];
  if (S.preset === 'bill') {
    const [sym, step, def] = CUR[S.cur];
    const lab = el('label', 'total'), inp = Object.assign(el('input'), { type: 'number', min: step, step, inputMode: 'numeric', value: S.total, placeholder: def, autocomplete: 'off' });
    inp.setAttribute('aria-label', `${t('total')} (${sym})`);
    lab.append(Object.assign(el('span', 'label'), { textContent: t('total') }), inp);
    inp.oninput = () => { // re-split in place so the field keeps focus
      S.total = clamp(Math.floor(+inp.value) || 0, 0, 1e12);
      rollBill();
      [...$('#results').children].forEach((li, i) => { li.querySelector('.gl').innerHTML = glyphHTML(i); li.lastChild.textContent = presetVal(i); });
      save(); drawPreview();
    };
    const curs = Object.entries(CUR).map(([c, [s]]) => {
      const b = Object.assign(el('button', 'pill cur'), { type: 'button', textContent: s });
      b.setAttribute('aria-label', `${c}, ${t('minPay', s + CUR[c][1].toLocaleString(S.lang))}`);
      b.setAttribute('aria-pressed', S.cur === c);
      b.onclick = () => { S.cur = c; S.total = CUR[c][2]; rollBill(); sfx.ui(); save(); renderSetup(); };
      return b;
    });
    const row = el('div', 'total-row'), note = Object.assign(el('small', 'note'), { textContent: t('minPay', sym + step.toLocaleString(S.lang)) });
    row.append(lab, ...curs, note);
    kids.unshift(row);
  }
  $('#subRow').hidden = !kids.length;
  $('#subRow').replaceChildren(...kids);
}
document.querySelectorAll('[data-preset]').forEach(b => b.onclick = () => { S.preset = b.dataset.preset; reroll(); sfx.ui(); save(); renderSetup(); });

// live preview: drawn once per change; its slow drift is a CSS spin of the canvas (style.css), no frame loop
const pv = $('#pv');
function drawPreview() {
  const s = pv.clientWidth;
  if (!s) return;
  const d = Math.min(2, window.devicePixelRatio || 1), g = pv.getContext('2d'), items = board(), r = s / 2 * 0.9;
  pv.width = pv.height = Math.round(s * d);
  g.setTransform(d, 0, 0, d, 0, 0);
  const segs = layout(items.map(x => x.w));
  if (modeOf() === 'match') { drawRing(g, s / 2, s / 2, r, range(S.n), -1); drawSeats(g, s / 2, s / 2, r * RI, range(S.n), true); }
  else drawDisc(g, s / 2, s / 2, r, items, segs, true);
  g.lineWidth = s * 0.05; g.strokeStyle = gold(g, s / 2, s / 2, s / 2);
  g.beginPath(); g.arc(s / 2, s / 2, s / 2 * 0.925, 0, TAU); g.stroke();
}

$('#startBtn').onclick = () => act({ t: 'start' });
$('#editBtn').onclick = () => act({ t: 'edit' });
$('#newBtn').onclick = () => act({ t: 'new' });

// ---------- art: SVG symbols as bitmaps ----------
// each piece of art becomes an <img> once, then a canvas: drawing the SVG itself re-runs its outline filter on every
// draw. Not ready yet -> null, and whatever needs it redraws when it lands
const ART_PX = 128, arts = {};
const defsOf = ids => ids.map(id => $('#' + id).outerHTML).join('');
function art(key, body, box = '0 0 32 32') {
  if (!arts[key]) {
    const img = arts[key] = new Image();
    img.onload = () => {
      const c = el('canvas');
      c.width = c.height = ART_PX;
      c.getContext('2d').drawImage(img, 0, 0, ART_PX, ART_PX);
      arts[key] = c;
      artReady();
    };
    img.src = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" width="${ART_PX}" height="${ART_PX}">${body}</svg>`);
  }
  return arts[key] instanceof HTMLCanvasElement ? arts[key] : null;
}
const sprite = z => art('a' + z, defsOf(['ol']) + $('#a' + z).innerHTML);
// the animal in tears: going back on the wheel when the last one loses
const eyes = z => [...$('#a' + z).querySelectorAll('.e [fill="#2b2140"] circle')].map(c => [+c.getAttribute('cx'), +c.getAttribute('cy')]).sort((p, q) => p[0] - q[0]);
const tearPaths = (z, cls = '') => eyes(z).map(([x, y]) => [0, 0.6].map(d => `<path${cls ? ` class="${cls}" style="animation-delay:${1.3 + d + (x > 16) * 0.3}s"` : ''} d="M${x} ${y + 1.4 + d * 2}q-1.3 1.9 0 2.8q1.3-.9 0-2.8z" fill="#8fd8ff" stroke="#2b6a9a" stroke-width=".4"/>`).join('')).join('');
const crying = z => art('c' + z, defsOf(['ol']) + $('#a' + z).innerHTML + tearPaths(z));
const glyphArt = (id, tint) => art(`g${id}${tint}`, `<defs>${defsOf(['gb', 'gg', 'gl'])}</defs><g style="color:${tint || '#b98bff'}">${$('#g-' + id).innerHTML}</g>`);
const jokerArt = () => art('joker', `<g fill="#ffcf6b" stroke="#7a3a0c" stroke-width="1.2" stroke-linejoin="round">${$('#i-joker').innerHTML}</g>`, '0 0 24 24');
// a landed Match animal in its result's accessory; drawn 44/32 the size of a plain face
const DRESS_BOX = '-6 -10 44 44';
const dressed = (z, e) => { const d = dress(e); return d ? art(`p${z}|${d}`, `<defs>${defsOf(['gb', 'gg', 'ol', 'x-crown', 'x-hat', 'x-cup', 'x-cash', 'x-soot', 'a' + z])}</defs><use href="#a${z}" width="32" height="32"/>${d}`, DRESS_BOX) : null; };
let artQ = 0;
const artReady = () => artQ ||= requestAnimationFrame(() => {
  artQ = 0;
  if (!setup.hidden) drawPreview();
  else { drawFace(); if (!G.raf) paint(); }
});

// ---------- drawing ----------
const RIDE = 0.64, RI = 0.56; // riders sit at this radius; Match: the inner ring's radius
function gold(g, x, y, r) { // rim gold, light from the top-left
  const gr = g.createLinearGradient(x - r, y - r, x + r, y + r);
  gr.addColorStop(0, '#fff6c4'); gr.addColorStop(0.35, '#ffd54a'); gr.addColorStop(0.75, '#e09a12'); gr.addColorStop(1, '#a8650a');
  return gr;
}
// hex colour pulled toward another by f
const mix = (a, b, f) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - f) + parseInt(b.slice(i, i + 2), 16) * f).toString(16).padStart(2, '0')).join('');
const wedge = (g, r0, r1, a0, a1) => { g.beginPath(); g.arc(0, 0, r1, a0 - Math.PI / 2, a1 - Math.PI / 2); g.arc(0, 0, r0, a1 - Math.PI / 2, a0 - Math.PI / 2, true); g.closePath(); };
// candy shading, the same all round so it can turn with the board: light round the hub, a lit band inside the edge
function shade(g, r) {
  const sh = g.createRadialGradient(0, 0, 0, 0, 0, r);
  sh.addColorStop(0, 'rgba(255,255,255,.4)'); sh.addColorStop(0.28, 'rgba(255,255,255,.08)'); sh.addColorStop(0.7, 'rgba(255,255,255,0)');
  sh.addColorStop(0.84, 'rgba(255,255,255,.18)'); sh.addColorStop(0.92, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(20,8,50,.5)');
  g.fillStyle = sh; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
}
// dividers: a dark groove with a lit edge
function dividers(g, segs, r0, r) {
  g.lineCap = 'round';
  for (const [style, w, o] of [['rgba(30,14,70,.5)', Math.max(2, r * 0.018), 1], ['rgba(255,255,255,.85)', Math.max(1, r * 0.008), 0]]) {
    g.strokeStyle = style; g.lineWidth = w;
    g.beginPath();
    for (const { a0, a1 } of segs) if (a1 - a0 > 1e-9) { const s = Math.sin(a0), c = -Math.cos(a0); g.moveTo(s * r0 + o, c * r0 + o); g.lineTo(s * r + o, c * r + o); }
    g.stroke();
  }
}
// a broken peg's crack in the board round its stub
function crackDecal(g, φ, r) {
  const x = Math.sin(φ) * PEG_R * r, y = -Math.cos(φ) * PEG_R * r, s = r * 0.07;
  g.save(); g.translate(x, y); g.rotate(φ);
  g.strokeStyle = 'rgba(25,10,50,.75)'; g.lineWidth = Math.max(1, r * 0.008); g.lineJoin = 'round';
  g.beginPath();
  for (const [dx, dy] of [[-1, 0.4], [0.9, 0.6], [0.2, 1.2], [-0.5, -0.9], [0.7, -0.8]]) { g.moveTo(0, 0); g.lineTo(dx * s * 0.5, dy * s * 0.4); g.lineTo(dx * s, dy * s); }
  g.stroke();
  g.restore();
}

// the board's face: segments, candy shading, dividers, labels / quick set glyphs. baked (preview): animal faces and pegs
// drawn in, turning with it; the play board draws those upright every frame. slot: comeback slivers, dark and unlabelled
function drawDisc(g, x, y, r, items, segs, baked, { slot = [], crack = null } = {}) {
  g.save();
  g.translate(x, y);
  segs.forEach(({ a0, a1 }, i) => {
    if (a1 - a0 < 1e-9) return;
    g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, a0 - Math.PI / 2, a1 - Math.PI / 2); g.closePath();
    g.fillStyle = slot[i] ? mix(items[i].color, '#140a30', 0.55) : items[i].color; g.fill();
  });
  shade(g, r);
  dividers(g, segs, r * 0.17, r);
  if (crack != null) crackDecal(g, crack, r);
  segs.forEach(({ a0, a1 }, i) => {
    const it = items[i];
    if (slot[i] || a1 - a0 < 1e-9) return;
    if (it.z < 0) {
      if (it.gl) quickGlyph(g, it.gl, (a0 + a1) / 2, r * 0.7, clamp(r * (a1 - a0) * 0.42, r * 0.12, r * 0.24));
      return label(g, it.label, a0, a1, r, it.gl ? 0.56 : PEG_R - PEG_CAP - 0.05);
    }
    const img = baked && sprite(it.z), m = (a0 + a1) / 2, s = clamp(RIDE * r * (a1 - a0) * 0.62, r * 0.14, r * 0.3);
    if (img) g.drawImage(img, Math.sin(m) * RIDE * r - s / 2, -Math.cos(m) * RIDE * r - s / 2, s, s);
  });
  if (baked) bakedPegs(g, segs, slot, r);
  g.restore();
}
function bakedPegs(g, segs, slot, r) {
  g.fillStyle = '#fff';
  g.beginPath();
  for (const p of pegs(segs, slot)) { const px = Math.sin(p) * PEG_R * r, py = -Math.cos(p) * PEG_R * r; g.moveTo(px + r * 0.035, py); g.arc(px, py, r * 0.035, 0, TAU); }
  g.fill();
}

// radial label, reading outward and ending at radius r1 (wheel radii). Shrinks to fit; below 60% size it stops shrinking
// and gets an ellipsis instead (the full text shows in the hub, the status line and the results)
function label(g, text, a0, a1, r, end = PEG_R - PEG_CAP - 0.05) {
  const r1 = r * end, r0 = r * 0.24, maxW = r1 - r0;
  const h = (r0 + r1) * Math.sin(Math.min(a1 - a0, Math.PI) / 2) * 0.62; // segment height at mid-length
  let fs = Math.min(r * 0.16, h), s = text;
  g.font = `900 ${fs}px ${FONT}`;
  const w = g.measureText(s).width;
  if (w > maxW) {
    if (maxW / w >= 0.6) fs *= maxW / w;
    else {
      fs *= 0.6;
      g.font = `900 ${fs}px ${FONT}`;
      const ch = Array.from(s); // whole characters, not UTF-16 halves
      while (ch.length > 1 && g.measureText(ch.join('') + '…').width > maxW) ch.pop();
      s = ch.join('') + '…';
    }
  }
  if (fs < 5) return;
  g.save();
  g.rotate((a0 + a1) / 2 - Math.PI / 2);
  g.font = `900 ${fs}px ${FONT}`;
  g.textAlign = 'right'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.lineWidth = Math.max(2, fs * 0.24); g.strokeStyle = 'rgba(30,12,60,.8)';
  g.strokeText(s, r1, 0);
  g.fillStyle = '#fff';
  g.fillText(s, r1, 0);
  g.restore();
}
// quick set glyphs, drawn as toys facing out from the hub: a check / cross badge, a coin, a die face
function quickGlyph(g, kind, φ, rr, s) {
  g.save();
  g.translate(Math.sin(φ) * rr, -Math.cos(φ) * rr); g.rotate(φ);
  drawGlyph(g, kind, s);
  g.restore();
}
function drawGlyph(g, kind, s) {
  const ball = (fill, rim) => {
    const gr = g.createRadialGradient(-s * 0.15, -s * 0.18, s * 0.05, 0, 0, s * 0.5);
    gr.addColorStop(0, '#fff'); gr.addColorStop(0.35, fill); gr.addColorStop(1, rim);
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, s * 0.5, 0, TAU); g.fill();
    g.lineWidth = Math.max(1, s * 0.05); g.strokeStyle = 'rgba(30,12,60,.7)'; g.stroke();
  };
  g.lineCap = g.lineJoin = 'round';
  if (kind === 'yes' || kind === 'no') {
    ball(kind === 'yes' ? '#3ccf5a' : '#ff4d5e', kind === 'yes' ? '#1e8a3a' : '#a01030');
    g.strokeStyle = '#fff'; g.lineWidth = s * 0.12; g.beginPath();
    if (kind === 'yes') { g.moveTo(-s * 0.22, 0); g.lineTo(-s * 0.05, s * 0.17); g.lineTo(s * 0.24, -s * 0.16); }
    else { g.moveTo(-s * 0.18, -s * 0.18); g.lineTo(s * 0.18, s * 0.18); g.moveTo(s * 0.18, -s * 0.18); g.lineTo(-s * 0.18, s * 0.18); }
    g.stroke();
  } else if (kind === 'heads' || kind === 'tails') {
    ball(kind === 'heads' ? '#ffd54a' : '#d8d2f0', kind === 'heads' ? '#a8650a' : '#6b6488');
    g.strokeStyle = 'rgba(60,30,0,.45)'; g.lineWidth = s * 0.05;
    g.beginPath(); g.arc(0, 0, s * 0.36, 0, TAU); g.stroke();
    g.fillStyle = kind === 'heads' ? '#fff8d8' : '#fff';
    g.beginPath();
    if (kind === 'heads') for (let p = 0; p < 10; p++) { const a = -Math.PI / 2 + p * Math.PI / 5, q = p % 2 ? s * 0.11 : s * 0.25; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); }
    else { g.arc(0, 0, s * 0.2, 0.6, TAU - 0.6); g.arc(s * 0.1, 0, s * 0.15, TAU - 0.9, 0.9, true); }
    g.closePath(); g.fill();
  } else {
    const n = +kind.slice(1), h = s * 0.46;
    g.fillStyle = '#fbf8ff'; g.strokeStyle = 'rgba(30,12,60,.75)'; g.lineWidth = Math.max(1, s * 0.05);
    g.beginPath(); g.roundRect ? g.roundRect(-h, -h, 2 * h, 2 * h, s * 0.16) : g.rect(-h, -h, 2 * h, 2 * h); g.fill(); g.stroke();
    const P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
      5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] }[n];
    g.fillStyle = n === 1 ? '#ff4d5e' : '#2b2140';
    for (const [px, py] of P) { g.beginPath(); g.arc(px * h * 0.52, py * h * 0.52, s * (n === 1 ? 0.12 : 0.085), 0, TAU); g.fill(); }
  }
}

// Match outer ring: n result sections in ring order (order[m] = result slot), each a glyph and its caption facing out
function drawRing(g, x, y, r, order, crack) {
  const n = order.length, segs = layout(Array(n).fill(1));
  g.save(); g.translate(x, y);
  segs.forEach(({ a0, a1 }, m) => {
    const tone = toneOf(order[m]);
    g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, a0 - Math.PI / 2, a1 - Math.PI / 2); g.closePath();
    g.fillStyle = tone ? mix(tone, '#1a1040', 0.5) : m % 2 ? '#4a3a8f' : '#3a2d78'; g.fill();
  });
  shade(g, r);
  dividers(g, segs, r * RI, r);
  if (crack != null && crack >= 0) crackDecal(g, crack, r);
  const s = clamp(r * TAU / n * 0.36, r * 0.12, r * 0.2);
  segs.forEach(({ a0, a1 }, m) => {
    const e = order[m], φ = (a0 + a1) / 2;
    g.save(); g.rotate(φ); g.translate(0, -r * 0.75);
    const [id, tint] = glyphOf(e);
    if (id === 'ratio') { // a pie disc filled to the share
      g.fillStyle = '#5a4a96'; g.beginPath(); g.arc(0, 0, s * 0.42, 0, TAU); g.fill();
      g.fillStyle = isBig(e) ? '#ffd54a' : '#5dffb0';
      g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, s * 0.42, -Math.PI / 2, -Math.PI / 2 + TAU * S.ratio[e] / 100); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(230,220,255,.6)'; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, s * 0.42, 0, TAU); g.stroke();
    } else { const img = glyphArt(id, tint); if (img) g.drawImage(img, -s / 2, -s / 2, s, s); }
    const fs = Math.min(r * 0.075, r * TAU / n * 0.16), cap = presetVal(e);
    g.font = `900 ${fs}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    const w = g.measureText(cap).width, k = Math.min(1, r * TAU / n * 0.5 / Math.max(1, w));
    g.scale(k, 1);
    g.lineWidth = Math.max(2, fs * 0.26); g.strokeStyle = 'rgba(20,8,50,.85)'; g.strokeText(cap, 0, s * 0.62 + fs * 0.45);
    g.fillStyle = '#fff'; g.fillText(cap, 0, s * 0.62 + fs * 0.45);
    g.restore();
  });
  g.restore();
}
// Match inner ring: seat i in its player's colour (seat[i] = player, -1 = free, shown by its number); baked: faces drawn in
function drawSeats(g, x, y, r, seat, baked) {
  const n = seat.length, segs = layout(Array(n).fill(1));
  g.save(); g.translate(x, y);
  segs.forEach(({ a0, a1 }, i) => {
    g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, a0 - Math.PI / 2, a1 - Math.PI / 2); g.closePath();
    g.fillStyle = seat[i] >= 0 ? COLORS[ZOO[seat[i]]] : i % 2 ? '#2d2466' : '#251d58'; g.fill();
  });
  shade(g, r);
  dividers(g, segs, r * 0.3, r);
  g.lineWidth = Math.max(2, r * 0.03); g.strokeStyle = gold(g, 0, 0, r); // gold band between the rings
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
  segs.forEach(({ a0, a1 }, i) => {
    const m = (a0 + a1) / 2, px = Math.sin(m) * r * 0.66, py = -Math.cos(m) * r * 0.66;
    if (seat[i] < 0) {
      g.font = `900 ${r * 0.14}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(200,190,255,.55)';
      g.fillText(i + 1, px, py);
    } else if (baked) {
      const img = sprite(ZOO[seat[i]]), s = clamp(r * 0.66 * TAU / n * 0.62, r * 0.18, r * 0.4);
      if (img) g.drawImage(img, px - s / 2, py - s / 2, s, s);
    }
  });
  g.restore();
}

// ---------- the board ----------
const cv = $('#cv'), cx = cv.getContext('2d');
// turning faces (main / Match inner ring / Match mist); shadow under them; gloss + rim over them
const disc = el('canvas'), discI = el('canvas'), mistCv = el('canvas'), back = el('canvas'), front = el('canvas');
const G = {
  mode: 'pick', items: [], n: 0, wt: [], slot: [], segs: [], pins: [], θ: 0, φ: 0, ω: 0, move: 'idle', F: flapper(), acc: 0,
  win: -1, hop: -1, stub: -1, crack: -1, hist: [], C: null, K: null, ko: null, M: null, ff: false, auto: false, over: false,
  shake: 0, mist: 0, pop: null, spot: -1, jk: -1, cheer: 0, clock: 0, sched: [], parts: [], fx: [], raf: 0, last: 0,
};
let W = 0, H = 0, DPR = 1, R = 0, ox = 0, oy = 0, pegImg = null, stubImg = null;
// canvas resolution cap: frame() lowers it for the session on a phone that can't keep up (2 -> 1.5 -> 1)
let dprCap = 2;
// frame cap on phones: a 120Hz screen draws every other vsync (60fps). ponytail: a skip threshold, not a pacer.
// Debug (Delta Time checks): ?fps=30 caps the frame rate, ?jitter drops random frames so dt jumps
const DBG = new URLSearchParams(location.search), JITTER = DBG.has('jitter');
const MIN_FT = DBG.has('fps') ? 1000 / clamp(+DBG.get('fps') || 60, 5, 240) : matchMedia('(pointer: coarse)').matches ? 10 : 0;
const RGB = {};
const rgba = (h, a) => `rgba(${RGB[h] ??= [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join()},${a})`;
const sized = (c, r) => { c.width = c.height = Math.ceil(2 * r * DPR); const g = c.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0); return g; };

function resize() {
  const r = wrap.getBoundingClientRect();
  if (!r.width || !r.height || !G.items.length) return;
  W = r.width; H = r.height;
  DPR = Math.min(dprCap, window.devicePixelRatio || 1);
  // the wheel's box: pointer housing on top (1.33 R), rim and shadow below (1.13 R), rim at the sides (1.12 R)
  const pad = 6;
  R = Math.max(30, Math.min((W - 2 * pad) / 2.24, (H - 2 * pad) / 2.46));
  ox = W / 2; oy = pad + 1.33 * R + (H - 2 * pad - 2.46 * R) / 2;
  for (const [k, v] of [['--R', R], ['--cx', ox], ['--cy', oy]]) wrap.style.setProperty(k, v + 'px');
  for (const c of [cv, back, front]) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); c.getContext('2d').setTransform(DPR, 0, 0, DPR, 0, 0); }
  drawFace();
  drawFixed();
  pegImg = makePeg(); stubImg = makePeg(true);
  if (!G.raf) paint();
}
new ResizeObserver(resize).observe(wrap);

function drawFace() {
  if (!R) return;
  const crack = G.stub >= 0 ? G.pins[G.stub] : null;
  if (G.mode !== 'match') return drawDisc(sized(disc, R), R, R, R, G.items, G.segs, false, { slot: G.slot, crack });
  drawRing(sized(disc, R), R, R, R, G.M.res, crack);
  drawSeats(sized(discI, R * RI), R * RI, R * RI, R * RI, G.C.seat, false);
  // the mist over the outer ring while seats are picked: frosted glass with a "?" per section, burnt off by the spin
  const g = sized(mistCv, R), n = G.n;
  g.translate(R, R);
  const fr = g.createRadialGradient(0, 0, R * RI, 0, 0, R * 0.9);
  fr.addColorStop(0, '#7864e6'); fr.addColorStop(1, '#5a8cf0'); // opaque: a tinted result showing through would give it away
  g.fillStyle = fr; wedge(g, R * RI, R * 0.885, 0, TAU); g.fill();
  g.font = `900 ${R * 0.12}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let m = 0; m < n; m++) {
    g.save(); g.rotate((m + 0.5) * TAU / n);
    g.fillStyle = 'rgba(10,4,40,.35)'; g.fillText('?', 1, -R * 0.72 + 2);
    g.fillStyle = 'rgba(255,255,255,.7)'; g.fillText('?', 0, -R * 0.72);
    g.restore();
  }
}

// the parts that don't turn, drawn once per size: the shadow under the wheel, the gloss over it and the gold rim
function drawFixed() {
  let g = back.getContext('2d');
  g.clearRect(0, 0, W, H);
  const sh = g.createRadialGradient(ox, oy + R * 0.1, R * 0.8, ox, oy + R * 0.1, R * 1.22);
  sh.addColorStop(0, 'rgba(0,0,0,.55)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sh; g.fillRect(0, 0, W, H);
  g = front.getContext('2d');
  g.clearRect(0, 0, W, H);
  g.save();
  g.beginPath(); g.arc(ox, oy, R, 0, TAU); g.clip();
  const gl = g.createRadialGradient(ox - R * 0.35, oy - R * 0.45, 0, ox - R * 0.35, oy - R * 0.45, R * 1.25);
  gl.addColorStop(0, 'rgba(255,255,255,.28)'); gl.addColorStop(0.45, 'rgba(255,255,255,.06)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gl; g.fillRect(ox - R, oy - R, 2 * R, 2 * R);
  const lip = g.createRadialGradient(ox, oy, R * 0.93, ox, oy, R); // the rim's shadow on the board
  lip.addColorStop(0, 'rgba(10,4,30,0)'); lip.addColorStop(1, 'rgba(10,4,30,.45)');
  g.fillStyle = lip; g.fillRect(ox - R, oy - R, 2 * R, 2 * R);
  g.restore();
  g.lineWidth = R * 0.1; g.strokeStyle = gold(g, ox, oy, R * 1.1);
  g.beginPath(); g.arc(ox, oy, R * 1.05, 0, TAU); g.stroke();
  g.lineWidth = 1.5; g.strokeStyle = 'rgba(42,11,94,.85)';
  for (const r of [R, R * 1.1]) { g.beginPath(); g.arc(ox, oy, r, 0, TAU); g.stroke(); }
}

// 3D pin: glossy white cap with a specular dot, a short stem below it and a soft contact shadow, lit from the top-left.
// Drawn upright at each peg every frame, never baked into the turning face (the light would turn with it).
// stub: what's left of a snapped one, a jagged stem with no cap
function makePeg(stub) {
  const r = PEG_CAP * R, s = Math.ceil(r * 4), m = s / 2, c = el('canvas'), g = c.getContext('2d');
  c.width = c.height = Math.ceil(s * DPR);
  g.scale(DPR, DPR);
  g.fillStyle = 'rgba(10,4,30,.45)';
  g.beginPath(); g.ellipse(m + r * 0.5, m + r * 1, r * (stub ? 0.6 : 1.05), r * 0.65, 0, 0, TAU); g.fill();
  g.fillStyle = '#7d73a3';
  if (stub) {
    g.beginPath(); g.moveTo(m - r * 0.4, m + r * 0.85); g.lineTo(m - r * 0.4, m); g.lineTo(m - r * 0.15, m + r * 0.2); g.lineTo(m + r * 0.05, m - r * 0.15);
    g.lineTo(m + r * 0.22, m + r * 0.15); g.lineTo(m + r * 0.4, m - r * 0.05); g.lineTo(m + r * 0.4, m + r * 0.85); g.closePath(); g.fill();
    g.fillStyle = '#d8d0f0'; g.fillRect(m - r * 0.4, m + r * 0.05, r * 0.25, r * 0.6);
    return c;
  }
  g.fillRect(m - r * 0.36, m, r * 0.72, r * 0.85);
  const cap = g.createRadialGradient(m - r * 0.35, m - r * 0.4, r * 0.1, m, m, r);
  cap.addColorStop(0, '#fff'); cap.addColorStop(0.55, '#ece8fa'); cap.addColorStop(1, '#a79cc8');
  g.fillStyle = cap;
  g.beginPath(); g.arc(m, m, r, 0, TAU); g.fill();
  g.lineWidth = Math.max(0.8, r * 0.14); g.strokeStyle = 'rgba(40,24,90,.6)'; g.stroke();
  g.fillStyle = '#fff';
  g.beginPath(); g.arc(m - r * 0.35, m - r * 0.42, r * 0.26, 0, TAU); g.fill();
  return c;
}

const at = (φ, r, θ = G.θ) => [ox + Math.sin(φ + θ) * r * R, oy - Math.cos(φ + θ) * r * R]; // wheel-local angle -> screen
const midOf = k => (G.segs[k].a0 + G.segs[k].a1) / 2;
const riderSize = k => clamp(RIDE * R * (G.segs[k].a1 - G.segs[k].a0) * 0.62, R * 0.14, R * 0.25);
const seatAt = i => at((i + 0.5) * TAU / G.n, RI * 0.62, G.φ); // Match: where seat i's rider sits
const seatSize = () => clamp(R * RI * 0.62 * TAU / G.n * 0.6, R * 0.1, R * 0.2);
const blit = (c, ang, r) => { cx.save(); cx.translate(ox, oy); cx.rotate(ang); cx.drawImage(c, -r, -r, 2 * r, 2 * r); cx.restore(); };

function paint() {
  const now = G.clock * 1000; // ms of game time: the board's own animations run ×3 with fast forward
  cx.clearRect(0, 0, W, H);
  if (!R) return;
  cx.save();
  if (G.shake > 0) { const a = 4 * G.shake / 0.3; cx.translate((Math.random() - 0.5) * a, (Math.random() - 0.5) * a); } // render-only: θ untouched
  cx.drawImage(back, 0, 0, W, H);
  blit(disc, G.θ, R);
  if (G.mode === 'match') {
    if (G.M.done) drawPairs();
    if (G.mist > 0) { cx.globalAlpha = G.mist; blit(mistCv, G.θ, R); cx.globalAlpha = 1; }
    blit(discI, G.φ, R * RI);
    if (G.spot >= 0) spotSeat(G.spot);
  } else if (G.win >= 0) drawWin(now);
  cx.drawImage(front, 0, 0, W, H);
  drawPegs();
  G.mode === 'match' ? drawSeated(now) : drawRiders(now);
  drawPointer(G.move === 'spin' && Math.abs(G.ω) < 2.5);
  cx.restore();
  for (const f of G.fx) f.draw(f.t / f.dur);
  drawParts();
}

function drawPegs() {
  if (!pegImg) return;
  const s = pegImg.width / DPR;
  G.pins.forEach((p, j) => {
    const [x, y] = at(p, PEG_R);
    if (j === G.stub) return cx.drawImage(stubImg, x - s / 2, y - s / 2, s, s);
    const k = G.pop && Math.abs(p - G.pop.φ) < 1e-6 ? G.pop.k : 1; // a new peg popping onto its stub: 0 -> 1.2 -> 1
    cx.drawImage(pegImg, x - s * k / 2, y - s * k / 2, s * k, s * k);
  });
}

// the pick: its segment slams outward and bounces back, flashes, then keeps a glowing edge until the next spin
function drawWin(now) {
  const { a0, a1 } = G.segs[G.win], f = (now - G.won) / 1000, m = (a0 + a1) / 2 + G.θ;
  const off = R * 0.07 * Math.exp(-6 * f) * Math.cos(14 * f), p = new Path2D();
  p.moveTo(0, 0); p.arc(0, 0, R, a0 - Math.PI / 2, a1 - Math.PI / 2); p.closePath();
  cx.save();
  cx.translate(ox + Math.sin(m) * off, oy - Math.cos(m) * off); cx.rotate(G.θ);
  cx.save(); cx.clip(p); cx.drawImage(disc, -R, -R, 2 * R, 2 * R);
  cx.fillStyle = `rgba(255,255,255,${0.55 * Math.exp(-4 * f)})`; cx.fill(p);
  cx.restore();
  cx.lineJoin = 'round';
  cx.strokeStyle = rgba(G.items[G.win].color, 0.5); cx.lineWidth = 7; cx.stroke(p);
  cx.strokeStyle = '#fff'; cx.lineWidth = 2; cx.stroke(p);
  cx.restore();
}
// Match, landed: the big results' sections glow
function drawPairs() {
  const n = G.n;
  cx.save(); cx.translate(ox, oy); cx.rotate(G.θ);
  for (let m = 0; m < n; m++) {
    if (!isBig(G.M.res[m])) continue;
    wedge(cx, R * RI, R * 0.98, m * TAU / n, (m + 1) * TAU / n);
    cx.strokeStyle = isBad() ? 'rgba(255,77,94,.85)' : 'rgba(255,213,74,.9)'; cx.lineWidth = 3; cx.stroke();
  }
  cx.restore();
}
// Joker roulette: the spotlight on a seat of the inner ring
function spotSeat(i) {
  cx.save(); cx.translate(ox, oy); cx.rotate(G.φ);
  wedge(cx, R * 0.18, R * RI, i * TAU / G.n, (i + 1) * TAU / G.n);
  cx.fillStyle = 'rgba(255,181,71,.28)'; cx.fill();
  cx.strokeStyle = '#ffb547'; cx.lineWidth = 3; cx.stroke();
  cx.restore();
}

// animals ride their segments upright: lean against the spin, dizzy after a turn and a half; comeback slots carry a
// small faded face near the rim. Survivors hop for joy while G.cheer runs (a last-one-loses comeback)
function drawRiders(now) {
  const lean = clamp(-G.ω * 0.012, -0.3, 0.3), dz = G.move === 'spin' && G.turns > 1.5 ? clamp((Math.abs(G.ω) - 1.5) / 4, 0, 1) : 0;
  const joy = G.clock < G.cheer;
  G.segs.forEach(({ a0, a1 }, i) => {
    const it = G.items[i], img = it.z >= 0 && i !== G.hop && a1 - a0 > 1e-6 && sprite(it.z);
    if (!img) return;
    if (G.slot[i]) {
      const [x, y] = at((a0 + a1) / 2, 0.82), s = R * 0.09;
      cx.globalAlpha = 0.5; cx.drawImage(img, x - s / 2, y - s / 2, s, s); cx.globalAlpha = 1;
      return;
    }
    let [x, y] = at((a0 + a1) / 2, RIDE);
    const s = riderSize(i);
    if (joy) y -= Math.abs(Math.sin(now / 120 + i)) * s * 0.22;
    rider(img, x, y, s, it.color, lean + Math.sin(now / 160 + i) * 0.06 * (G.move === 'spin'));
    if (dz) dizzy(x, y - s * 0.62, s, dz, now);
  });
}
// Match: the players in their seats on the inner ring; landed, dressed for their results, cheering or sobbing
function drawSeated(now) {
  const M = G.M, lean = clamp(-G.ω * 0.012, -0.3, 0.3), s = seatSize();
  G.C.seat.forEach((p, i) => {
    if (p < 0) return;
    const z = ZOO[p], e = M.done ? M.got[p] : -1, fancy = e >= 0 && dressed(z, e), img = fancy || sprite(z);
    if (!img) return;
    let [x, y] = seatAt(i), rot = lean;
    const mood = e >= 0 ? moodOf(e) : '';
    if (mood === 'win') y -= Math.abs(Math.sin(now / 160 + i)) * s * 0.18;
    if (mood === 'cry') rot += Math.sin(now / 70) * 0.06;
    rider(img, x, y, fancy ? s * 44 / 32 : s, COLORS[z], rot);
    const jk = jokerArt();
    if (i === G.jk && jk) cx.drawImage(jk, x + s * 0.2, y - s * 0.95, s * 0.6, s * 0.6); // the joker's card
  });
}
function rider(img, x, y, s, color, rot) {
  const h = cx.createRadialGradient(x, y, 0, x, y, s * 0.62); // soft glow in its colour so the face reads on any segment
  h.addColorStop(0, rgba(color, 0.5)); h.addColorStop(1, rgba(color, 0));
  cx.fillStyle = h;
  cx.beginPath(); cx.arc(x, y, s * 0.62, 0, TAU); cx.fill();
  cx.save(); cx.translate(x, y); cx.rotate(rot);
  cx.drawImage(img, -s / 2, -s / 2, s, s);
  cx.restore();
}
// dazed: little gold stars circling over the head on a tilted ring, the far ones smaller and dimmer
function dizzy(x, cy, s, alpha, now) {
  const rx = s * 0.55, ry = s * 0.18, spin = now / 1000 * 7;
  cx.save();
  cx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 3; k++) {
    const a = spin + k * 2.094, depth = (Math.sin(a) + 1) / 2, sx = x + Math.cos(a) * rx, sy = cy + Math.sin(a) * ry, r = s * (0.1 + 0.07 * depth);
    cx.globalAlpha = alpha * (0.45 + 0.55 * depth);
    cx.fillStyle = '#ffd27a';
    cx.beginPath();
    for (let p = 0; p < 10; p++) { const q = a * 2 + p * Math.PI / 5, rr = p % 2 ? r * 0.45 : r; cx.lineTo(sx + Math.cos(q) * rr, sy + Math.sin(q) * rr); }
    cx.closePath(); cx.fill();
  }
  cx.restore();
}

// the flapper at 12 o'clock: tapered pink -> violet blade hanging from a gold cap, swung by the physics in wheel.js
function drawPointer(glow) {
  const L = FLAP_L * R, w0 = FLAP_W0 * R, w1 = FLAP_W1 * R, py = oy - PIVOT * R, p = new Path2D();
  p.moveTo(-w0, 0); p.lineTo(-w1, L); p.arc(0, L, w1, Math.PI, 0, true); p.lineTo(w0, 0); p.arc(0, 0, w0, 0, Math.PI, true); p.closePath();
  cx.save();
  cx.translate(ox, py);
  cx.save(); cx.translate(R * 0.012, R * 0.02); cx.rotate(-G.F.a); cx.fillStyle = 'rgba(6,2,20,.4)'; cx.fill(p); cx.restore(); // shadow
  cx.rotate(-G.F.a);
  const gr = cx.createLinearGradient(0, -w0, 0, L);
  gr.addColorStop(0, '#ffa0c4'); gr.addColorStop(0.45, '#ff5d8f'); gr.addColorStop(1, '#9b6bff');
  if (glow) { cx.shadowColor = '#ff5dc8'; cx.shadowBlur = 14; }
  cx.fillStyle = gr; cx.fill(p);
  cx.shadowBlur = 0;
  cx.lineWidth = 1.5; cx.strokeStyle = '#2a0b5e'; cx.stroke(p);
  cx.strokeStyle = 'rgba(255,255,255,.6)'; cx.lineWidth = Math.max(1, w1 * 0.8); cx.lineCap = 'round';
  cx.beginPath(); cx.moveTo(-w0 * 0.45, w0 * 0.4); cx.lineTo(-w1 * 0.3, L * 0.82); cx.stroke();
  cx.restore();
  const hr = R * 0.085; // housing cap on the pivot: gold, a violet gem in it
  cx.fillStyle = gold(cx, ox, py, hr);
  cx.beginPath(); cx.arc(ox, py, hr, 0, TAU); cx.fill();
  cx.lineWidth = 1.5; cx.strokeStyle = '#6b3a0c'; cx.stroke();
  const gem = cx.createRadialGradient(ox - hr * 0.15, py - hr * 0.2, 0, ox, py, hr * 0.45);
  gem.addColorStop(0, '#e6d8ff'); gem.addColorStop(0.5, '#9b6bff'); gem.addColorStop(1, '#4a2490');
  cx.fillStyle = gem;
  cx.beginPath(); cx.arc(ox, py, hr * 0.45, 0, TAU); cx.fill();
}

// ---------- fx (Ladder's kit) ----------
const LABEL_FONT = '800 13px ' + FONT;
// a label drifting up off a spot and fading, e.g. OUT!; rendered once on its own canvas
function floatText(x, y, text, color) {
  const lab = el('canvas'), g = lab.getContext('2d');
  g.font = LABEL_FONT;
  const w = Math.ceil(g.measureText(text).width) + 8, h = 20;
  lab.width = w * DPR; lab.height = h * DPR;
  g.scale(DPR, DPR);
  g.font = LABEL_FONT; g.textAlign = 'center'; g.textBaseline = 'bottom';
  g.lineWidth = 3; g.strokeStyle = 'rgba(10,6,30,.85)'; g.lineJoin = 'round';
  g.strokeText(text, w / 2, h - 3);
  g.fillStyle = color; g.fillText(text, w / 2, h - 3);
  G.fx.push({ t: 0, dur: 1.2, draw(f) {
    const ty = y - 14 - 30 * (1 - (1 - f) ** 2), tx = clamp(x, w / 2 + 4, W - w / 2 - 4);
    cx.save();
    cx.globalAlpha = f < 0.15 ? f / 0.15 : 1 - ((f - 0.15) / 0.85) ** 2;
    cx.drawImage(lab, tx - w / 2, ty - h + 3, w, h);
    cx.restore();
  } });
}
const shock = (x, y, color, max, dur = 0.6) => G.fx.push({ t: 0, dur, draw(f) {
  cx.save();
  cx.globalCompositeOperation = 'lighter';
  cx.globalAlpha = 1 - f;
  cx.strokeStyle = color; cx.lineWidth = 1 + 7 * (1 - f);
  cx.beginPath(); cx.arc(x, y, max * (1 - (1 - f) ** 3), 0, TAU); cx.stroke();
  cx.restore();
} });
const flash = color => G.fx.push({ t: 0, dur: 0.4, draw(f) {
  const g = cx.createRadialGradient(ox, oy, 0, ox, oy, Math.max(W, H));
  g.addColorStop(0, rgba(color, 0.35 * (1 - f))); g.addColorStop(1, rgba(color, 0));
  cx.save(); cx.globalCompositeOperation = 'lighter'; cx.fillStyle = g; cx.fillRect(0, 0, W, H); cx.restore();
} });
// the board darkens for a cinematic beat (fade in .3s, hold, fade out the last .5s)
const dim = dur => G.fx.push({ t: 0, dur, draw(f) {
  const s = f * dur, a = 0.45 * Math.min(1, s / 0.3, (dur - s) / 0.5);
  cx.save(); cx.fillStyle = `rgba(6,3,20,${a})`; cx.fillRect(0, 0, W, H); cx.restore();
} });
// light pillar shooting up off a spot, fading as it thins
const pillar = (x, y, color, len) => G.fx.push({ t: 0, dur: 0.6, draw(f) {
  const h = len * (1 - (1 - f) ** 3), w = 4 + 16 * (1 - f), g = cx.createLinearGradient(0, y, 0, y - h);
  g.addColorStop(0, rgba(color, 0.7 * (1 - f))); g.addColorStop(0.35, `rgba(255,255,255,${0.35 * (1 - f)})`); g.addColorStop(1, rgba(color, 0));
  cx.save(); cx.globalCompositeOperation = 'lighter'; cx.fillStyle = g;
  cx.beginPath(); cx.ellipse(x, y - h / 2, w / 2, h / 2, 0, 0, TAU); cx.fill();
  cx.restore();
} });
function spray(x, y, dir, color, count, speed) { // sparks in a cone along dir (radians), no gravity
  for (let k = 0; k < count; k++) {
    const a = dir + (Math.random() - 0.5) * 1.4, s = speed * (0.4 + Math.random() * 0.6);
    G.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0, life: 0, max: 0.3 + Math.random() * 0.3, color: k % 3 ? color : '#fff', r: 1 + Math.random() * 1.8 });
  }
}
function burst(x, y, color, count, speed) {
  for (let k = 0; k < count; k++) {
    const a = Math.random() * TAU, s = speed * (0.3 + Math.random() * 0.7);
    G.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - speed * 0.3, life: 0, max: 0.5 + Math.random() * 0.6, color, r: 1.2 + Math.random() * 2.2 });
  }
}
function confetti() {
  for (let k = 0; k < (reduceMotion.matches ? 30 : 90); k++) {
    G.parts.push({ x: Math.random() * W, y: -10 - Math.random() * 40, vx: (Math.random() - 0.5) * 80, vy: 60 + Math.random() * 160, life: 0, max: 1.8 + Math.random(), color: COLORS[k % COLORS.length], r: 3 + Math.random() * 3, spin: Math.random() * 10, flake: true });
  }
}
function stepParts(dt) {
  if (G.parts.length > 500) G.parts.splice(0, G.parts.length - 500);
  const dragF = 0.99 ** (dt * 60), dragS = 0.96 ** (dt * 60); // per-frame drag scaled by dt: same spread at any frame rate
  let n = 0;
  for (const p of G.parts) {
    if ((p.life += dt) >= p.max) continue;
    p.vy += (p.flake ? 60 : p.g ?? 380) * dt;
    p.vx *= p.flake ? dragF : dragS;
    p.x += p.vx * dt; p.y += p.vy * dt;
    G.parts[n++] = p;
  }
  G.parts.length = n;
}
function drawParts() {
  let flake = null;
  cx.save();
  for (const p of G.parts) {
    cx.globalAlpha = 1 - p.life / p.max;
    cx.fillStyle = p.color;
    if (!!p.flake !== flake) { flake = !!p.flake; cx.globalCompositeOperation = flake ? 'source-over' : 'lighter'; }
    if (flake) cx.fillRect(p.x - p.r, p.y - p.r / 2, p.r * 2 * Math.cos(p.life * p.spin), p.r);
    else { cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, TAU); cx.fill(); }
  }
  cx.restore();
}
// a thrown thing on a gravity arc: an animal face (crying ones on the way back when the last one loses), or a text
// segment's colour chip with its label
function thrown(k, sad) {
  const it = G.items[k];
  if (it.z >= 0) return (sad && crying(it.z)) || sprite(it.z);
  const c = el('canvas'), g = c.getContext('2d'), s = 64;
  c.width = c.height = s * 2;
  g.scale(2, 2);
  g.fillStyle = it.color; g.strokeStyle = 'rgba(30,12,60,.8)'; g.lineWidth = 3;
  g.beginPath(); g.arc(s / 2, s / 2, s / 2 - 3, 0, TAU); g.fill(); g.stroke();
  g.font = `900 ${s * 0.3}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.strokeStyle = 'rgba(30,12,60,.8)';
  const txt = Array.from(it.label).slice(0, 4).join('');
  g.strokeText(txt, s / 2, s / 2); g.fillText(txt, s / 2, s / 2);
  return c;
}

// ---------- loop ----------
// runs only while something moves or a beat is due; a still board costs zero frames
function frame(now) {
  if (now - G.drawn < MIN_FT || (JITTER && Math.random() < 0.25)) { G.raf = requestAnimationFrame(frame); return; } // frame cap; dt spans the skipped vsyncs
  G.drawn = now;
  const dt = clamp((now - G.last) / 1000, 0, 0.05), gdt = dt * (G.ff ? 3 : 1); // game time: ×3 fast forward
  G.last = now;
  // smoothed frame time; held under ~26fps (iOS Low Power Mode locks to 30) -> fewer canvas pixels, 2x -> 1.5x -> 1x
  G.ft = (G.ft ?? 1 / 60) + (dt - (G.ft ?? 1 / 60)) * 0.05;
  if (G.ft > 1 / 26 && dprCap > 1 && DPR > 1 && !DBG.has('fps')) { dprCap = Math.max(1, DPR - 0.5); G.ft = 1 / 60; resize(); }
  const θ0 = G.θ;
  if (G.move === 'spin') {
    G.θ = advance(G.sp, G.F, G.pins, gdt, peg, G.stub, G.ff ? 150 : 50);
    G.turns = Math.abs(G.θ - G.sp.r.θ0) / TAU;
    if (G.mode === 'match') { G.φ = innerAt(G.sp.r, G.sp.τ); G.mist = Math.max(0, 1 - G.sp.τ / 0.7); } // mist burns off as it speeds up
    if (!G.sp.legs && G.sp.τ >= G.sp.r.T && G.sp.r.sp) { G.sp.legs = true; if (G.sp.r.sp === 'teeter') sfx.teeter(0); } // the special begins
    if (G.sp.done) land();
  } else if (G.move === 'reform') reformStep(gdt);
  else {
    // the flapper follows the board in fixed steps whatever moves it: a finger, the spring back, or nothing
    let to = G.θ;
    if (G.move === 'drag') to = G.drag.θ;
    if (G.move === 'spring') { // back to where the grab started, with a little wobble
      G.sv += (-170 * (G.θ - G.home) - 14 * G.sv) * dt;
      to = G.θ + G.sv * dt;
      if (Math.abs(to - G.home) < 1e-3 && Math.abs(G.sv) < 0.05) { to = G.home; G.move = 'idle'; }
    }
    flapTo(to, dt);
  }
  G.ω = dt ? (G.θ - θ0) / dt : 0;
  const sp = Math.abs(G.ω);
  sfx.whirr(G.move === 'idle' || G.move === 'reform' ? 0 : sp);
  const lights = sp > 10 ? 'fast' : sp > 2 ? 'mid' : '';
  if (bulbs.className.baseVal !== lights) bulbs.setAttribute('class', lights); // the rim chases with the board
  G.shake = Math.max(0, G.shake - gdt);
  if (G.pop) { G.pop.t += gdt; const f = G.pop.t / 0.35; G.pop.k = f < 0.6 ? 1.2 * f / 0.6 : 1.2 - 0.2 * (f - 0.6) / 0.4; if (f >= 1) G.pop = null; }
  for (const f of G.fx) if ((f.t = Math.min(f.dur, f.t + gdt)) >= f.dur) f.end?.();
  G.fx = G.fx.filter(f => f.t < f.dur);
  stepParts(gdt);
  // beats on the game clock (pauses with the tab, runs ×3 with fast forward); a beat may schedule more
  G.clock += gdt;
  const due = G.sched.filter(e => e.at <= G.clock).sort((a, b) => a.at - b.at);
  if (due.length) { G.sched = G.sched.filter(e => e.at > G.clock); due.forEach(e => e.f()); }
  paint();
  const F = G.F, still = G.move === 'idle' && Math.abs(F.v) < 0.05 && (F.touch.size || Math.abs(F.a) < 2e-3);
  G.raf = still && !G.parts.length && !G.fx.length && !G.shake && !G.pop && !G.sched.length && G.clock >= G.cheer ? 0 : requestAnimationFrame(frame);
  if (!G.raf) { document.body.classList.remove('busy'); wake(); }
}
// the flapper catches up with the board turned to θ1, in fixed steps (pins1: the pegs moved too)
function flapTo(θ1, dt, pins1 = G.pins) {
  G.acc += dt;
  const n = Math.min(50, Math.floor(G.acc / STEP));
  G.acc = Math.min(G.acc - n * STEP, STEP);
  if (n) flapRun(G.F, G.pins, G.θ, θ1, n, peg, G.stub, pins1);
  G.θ = θ1; G.pins = pins1;
}
// a beat `sec` of game time from now (between-step delays: never setTimeout, so ×3, pause and watching phones agree)
const after = (sec, f) => { G.sched.push({ at: G.clock + sec, f }); kick(); };

function kick() {
  if (G.raf) return;
  G.last = performance.now();
  G.drawn = 0;
  G.raf = requestAnimationFrame(frame);
  document.body.classList.add('busy');
  wake();
}

// peg ticks: a knock per flapper hit, a boing when it springs free in the crawl; at most one every 30 ms, so a fast
// spin's ticks run together under the whirr. Haptic taps on the hard ticks near the end.
// 'break': a peg snaps; 'cue': a special's decisive moment
let lastTick = 0;
function peg(type, size) {
  if (type === 'break') return snapPeg(size);
  if (type === 'cue') return special(size);
  const now = performance.now(), sp = Math.abs(G.ω);
  if (now - lastTick < 30) return;
  if (type === 'hit') {
    lastTick = now;
    sfx.pegTick(sp, clamp(size / 12, 0, 1), 0);
    if (G.move === 'spin' && sp < 3 && size > 1.5) vibrate(10);
  } else if (sp < 6) { lastTick = now; sfx.slip(0); }
}
// Teeter tips (SO CLOSE!), Kickback rocks back (BOUNCE!), the Gust blows (WHOOSH!)
function special(kind) {
  const tip = [ox, oy - (PIVOT - FLAP_L) * R], s = Math.sign(G.sp.r.D);
  if (kind === 'teeter') { floatText(tip[0], tip[1] - 30, t('soClose'), '#ffd27a'); burst(...tip, '#ffd27a', 14, 160); vibrate([15, 30, 15]); }
  if (kind === 'kick') { floatText(tip[0], tip[1] - 30, t('bounce'), '#9dffb0'); shock(...tip, '#9dffb0', R * 0.25, 0.4); sfx.kickback(0); vibrate(25); }
  if (kind === 'gust') {
    floatText(tip[0], tip[1] - 30, t('whoosh'), '#bfeaff');
    sfx.gust(0);
    for (let k = 0; k < 28; k++) { // a breath of air sweeping across the wheel the way it turns
      const y = oy - R + Math.random() * 2 * R;
      G.parts.push({ x: ox - s * R * (1.1 + Math.random() * 0.4), y, vx: s * R * (2.2 + Math.random()), vy: (Math.random() - 0.5) * 30, g: 0, life: 0, max: 0.6 + Math.random() * 0.4, color: k % 2 ? '#bfeaff' : '#fff', r: 1 + Math.random() * 1.5 });
    }
  }
}

// ---------- peg breaks ----------
// the section the crack is in, its new odds for the status line
function crackText() {
  const j = G.crack, w = G.mode === 'match' ? Array(G.n).fill(1) : G.wt, all = w.reduce((a, b) => a + b, 0);
  const name = G.mode === 'match' ? presetVal(G.M.res[j]) : G.items[j].label;
  return t('pegBroke', pct(w[j] * CRACK / (all - w[j] * (1 - CRACK))), name);
}
// the cap shears off and flies along the spin, white chips, the wheel shudders, SNAP!; the crack is baked into the face
function snapPeg(pb) {
  G.stub = pb; G.crack = G.sp.r.brk;
  const φ = G.pins[pb], [x, y] = at(φ, PEG_R), s = Math.sign(G.sp.r.D), ψ = φ + G.θ, cap = pegImg;
  const vx = Math.cos(ψ) * s * R * 3, vy = Math.sin(ψ) * s * R * 3 - R * 1.2;
  G.fx.push({ t: 0, dur: 0.9, draw(f) {
    const tt = f * 0.9, cs = cap.width / DPR;
    cx.save(); cx.globalAlpha = 1 - f * f;
    cx.translate(x + vx * tt, y + vy * tt + R * 3 * tt * tt); cx.rotate(tt * 14 * s);
    cx.drawImage(cap, -cs / 2, -cs / 2, cs, cs);
    cx.restore();
  } });
  burst(x, y, '#fff', 14, 220);
  G.shake = 0.3;
  floatText(x, y - 10, t('snap'), '#fff3c4');
  sfx.snap(0);
  vibrate([20, 40, 20]);
  drawFace();
  setStatus(crackText());
}
// a new peg pops onto the stub (0 -> 1.2 -> 1), the crack fades, FIXED!
function repair(quiet) {
  if (G.stub < 0) return;
  const φ = G.pins[G.stub], [x, y] = at(φ, PEG_R);
  G.stub = G.crack = -1;
  drawFace();
  if (quiet) return;
  G.pop = { φ, t: 0, k: 0 };
  floatText(x, y - 10, t('pegFixed'), '#9dffb0');
  burst(x, y, '#fff', 8, 120);
  sfx.fix(0);
  kick();
}

// ---------- spin ----------
function spin(m) {
  if (G.mode === 'match' && G.M.done) resetMatch(); // spin again: the mist comes back, same seats
  G.move = 'spin';
  G.θ = m.θ0;
  G.sp = spinner(m);
  G.turns = 0;
  G.win = G.hop = G.spot = G.jk = -1;
  G.fx = G.fx.filter(f => !f.end); // a hop still flying from the last pick
  G.sched = [];
  $('#jkToast').hidden = true;
  hubIdle();
  hub.disabled = true;
  hub.classList.add('spinning');
  setStatus(G.mode === 'pick' && G.crack >= 0 ? crackText() : ''); // Pick's lasting crack shows before every spin
  sfx.whoosh();
  sfx.duck(true);
  // a ring off the hub, sparks thrown off the rim the way it turns
  shock(ox, oy, '#fff3c4', R * 0.6, 0.45);
  spray(ox, oy - R, m.D > 0 ? 0 : Math.PI, '#fff3c4', 18, 260);
  kick();
}

function land() {
  G.move = 'idle';
  sfx.whirr(0);
  const r = G.sp.r;
  if (G.mode === 'match') return matchLand(r);
  if (G.mode === 'knock') return knockLand(r.k, Math.sign(r.D));
  // Pick: the segment slams, a pillar, a burst, confetti, fanfare; the pick goes on the history strip
  const k = r.k, it = G.items[k];
  G.win = k; G.won = G.clock * 1000;
  G.fx.push({ t: 0, dur: 1.2, draw() {} }); // keeps frames coming while the segment bounces
  cheer(it.color, false);
  setStatus(t('picked', it.label), it.color);
  G.hist.push(k);
  renderStrip();
  updateActions();
  if (it.z >= 0) hop(k);
  else showPick(it);
}
// the landing beat shared by every mode
function cheer(color, bad) {
  sfx.land(true, 0, bad);
  after(0.45, () => { sfx.fanfare(); sfx.duck(false); });
  vibrate([30, 50, 80]);
  burst(ox, oy - R * 0.9, color, 60, 300);
  shock(ox, oy, color, R * 1.15, 0.7);
  pillar(ox, oy - R, color, R * 0.8);
  confetti();
}

// a picked animal pops off its seat, hops to the hub and takes the crown
function hop(k) {
  const [sx, sy] = at(midOf(k), RIDE), s0 = riderSize(k), img = sprite(G.items[k].z);
  G.hop = k;
  G.fx.push({ t: 0, dur: 0.55, draw(f) {
    if (!img) return;
    const e = 1 - (1 - f) ** 2, x = sx + (ox - sx) * e, y = sy + (oy - sy) * e - Math.sin(Math.PI * f) * R * 0.35;
    rider(img, x, y, s0 * (1 + 0.5 * f), G.items[k].color, Math.sin(f * Math.PI * 2) * 0.3);
  }, end() { showPick(G.items[k]); burst(ox, oy, '#ffd54a', 26, 220); } });
}

// ---------- knockout ----------
// a round: the pick goes OUT (flung off the rim to the bench; its segment shrinks to a comeback slot or away) or a slot
// comes BACK (the animal flies home, the slot widens). The wheel re-forms over 0.5 s, then the next round or the end.
// The music adds a layer each round
function knockLand(k, s) {
  const ko = G.ko, it = G.items[k], res = knock(G.K, k, S.comeback), [x, y] = at(midOf(k), RIDE);
  ko.round++;
  ko.log.push({ i: k, round: ko.round, res });
  sfx.setLevel(Math.min(4, ko.round));
  const sad = S.lastLoses ? res === 'back' : res === 'out'; // last one loses: the bench is the safe place
  floatText(x, y - 20, t(res), sad ? '#ff8fa0' : '#ffd27a');
  if (res === 'out') { fling(k, s); sfx.eject(0); setStatus(t('outName', 0, it.label), it.color); }
  else {
    flyHome(k, S.lastLoses); sfx.comeback(0);
    if (S.lastLoses) G.cheer = G.clock + 1.6; // back on the wheel is bad news: it sobs, the others cheer
    ko.bench = ko.bench.filter(i => i !== k); renderStrip(); setStatus(t('backName', 0, it.label), it.color);
  }
  vibrate(res === 'out' ? [20, 30, 20] : [10, 20, 40]);
  // a live segment shrinks with its far edge held still, a slot grows from its near one: every peg then moves the way
  // the wheel was turning, so the flapper meets them just as in a spin
  reform(k, (res === 'out') === (s > 0) ? 'a1' : 'a0', afterRound);
}
function reform(k, edge, done) {
  repair(); // Knockout: a broken peg is fixed while the wheel re-forms
  G.slot = [...G.K.slot];
  G.tw = { from: [...G.wt], to: [...G.K.wt], k, edge, A: G.θ + edgeOf(G.segs, k, edge), t: 0, dur: 0.5, done };
  G.move = 'reform';
  kick();
}
const edgeOf = (segs, k, edge) => edge === 'mid' ? (segs[k].a0 + segs[k].a1) / 2 : segs[k][edge];
function reformStep(gdt) {
  const T = G.tw;
  T.t = Math.min(T.dur, T.t + gdt);
  const f = T.t / T.dur, e = f * f * (3 - 2 * f);
  G.wt = T.from.map((a, i) => a + (T.to[i] - a) * e);
  const segs = layout(G.wt);
  G.segs = segs;
  flapTo(T.A - edgeOf(segs, T.k, T.edge), gdt, pegs(segs, G.slot));
  drawFace();
  if (T.t < T.dur) return;
  G.wt = [...T.to];
  G.move = 'idle';
  G.tw = null;
  T.done();
}
function afterRound() {
  const live = liveOf(G.K);
  if (live.length === 1) return endRun(live[0]);
  hub.disabled = !!NET.mine;
  hub.classList.remove('spinning');
  if (G.K.slot.some(Boolean)) status.textContent = status.title = t('pair', knockHint(), status.textContent); // OUT / BACK stays, the comeback odds join it
  updateActions();
  if (G.auto) after(1.2, () => act({ t: 'spin', w: BUTTON }));
}
// one left: the leftover slots fade out, then the survivor takes the crown (or the bomb)
function endRun(k) {
  G.over = true;
  G.K.wt = G.K.wt.map((w, i) => i === k ? w : 0);
  reform(k, 'mid', () => {
    G.K.slot = G.K.slot.map(() => false);
    renderStrip();
    const it = G.items[k];
    G.win = k; G.won = G.clock * 1000;
    G.fx.push({ t: 0, dur: 1.2, draw() {} });
    cheer(S.lastLoses ? '#ff4d5e' : it.color, S.lastLoses);
    setStatus(t(S.lastLoses ? 'doomed' : 'champ', 0, it.label), it.color);
    showPick(it, S.lastLoses ? 'bomb' : 'crown');
    updateActions();
    after(1.6, openSummary);
  });
}
const knockHint = () => {
  const slots = G.K.wt.reduce((a, w, i) => a + (G.K.slot[i] ? w : 0), 0), all = G.K.wt.reduce((a, b) => a + b, 0);
  return slots ? t('comebackPct', pct(slots / all)) : t('hint');
};
// OUT: thrown off the rim along the spin, up and away on a gravity arc, landing on the bench
function fling(k, s) {
  const [x, y] = at(midOf(k), RIDE), ψ = midOf(k) + G.θ, img = thrown(k), sz = riderSize(k);
  const vx = Math.cos(ψ) * s * R * 2.2, vy = Math.sin(ψ) * s * R * 2.2 - R * 1.8;
  G.hop = k;
  G.fx.push({ t: 0, dur: 0.85, draw(f) {
    const tt = f * 0.85;
    cx.save(); cx.globalAlpha = 1 - f ** 3;
    cx.translate(x + vx * tt, y + vy * tt + R * 2.6 * tt * tt); cx.rotate(tt * 9 * s);
    if (img) cx.drawImage(img, -sz / 2, -sz / 2, sz, sz);
    cx.restore();
  }, end() { G.hop = -1; G.ko.bench.push(k); renderStrip(); sfx.thud(); } });
}
// BACK: up from the bench below the wheel onto its slot (in tears when the last one loses)
function flyHome(k, sad) {
  const img = thrown(k, sad), sz = riderSize(k), sx = ox, sy = H + sz;
  G.hop = k;
  G.fx.push({ t: 0, dur: 0.6, draw(f) {
    const [tx, ty] = at(midOf(k), RIDE), e = 1 - (1 - f) ** 2;
    const x = sx + (tx - sx) * e, y = sy + (ty - sy) * e - Math.sin(Math.PI * f) * R * 0.5;
    cx.save(); cx.translate(x, y); cx.rotate((1 - f) * 6); if (img) cx.drawImage(img, -sz / 2, -sz / 2, sz, sz); cx.restore();
  }, end() { G.hop = -1; const [tx, ty] = at(midOf(k), RIDE); pillar(tx, ty, G.items[k].color, R * 0.5); burst(tx, ty, G.items[k].color, 24, 200); } });
}

// ---------- seats (Players boards, every mode) ----------
// players take seats one by one, in setup order, like Ladder's pick phase: tap a free seat, or Random for everyone.
// Pick / Knockout: seats are the wheel's segments. Match: seats on the inner ring
function claim(i) {
  const C = G.C;
  if (!C || C.ready || C.seat[i] >= 0) return;
  const p = C.seat[i] = C.next++;
  sfx.go(p, 0);
  if (G.mode !== 'match') G.items[i] = playerItem(p);
  drawFace();
  const [x, y] = G.mode === 'match' ? seatAt(i) : at(midOf(i), RIDE);
  burst(x, y, COLORS[ZOO[p]], 16, 160);
  C.ready = C.next === G.n;
  renderTurn();
  kick();
}
// whose turn it is to pick a seat, with Random before the first pick
function renderTurn() {
  const C = G.C, on = !!C && !C.ready;
  $('#turn').hidden = !on;
  status.hidden = on;
  hub.disabled = on || !!NET.mine;
  if (!on) { if (C && !G.M?.done) setStatus(); return; }
  $('#turnName').innerHTML = `${faceZ(ZOO[C.next])} ${animalName(C.next)}`;
  $('#turn').style.setProperty('--c', COLORS[ZOO[C.next]]);
  $('#randBtn').hidden = C.next > 0;
}
// each tick seats the next player on a random free seat -> a uniformly random seating
$('#randBtn').onclick = () => {
  for (let k = 0; k < G.n; k++) after(k * 0.16, () => {
    const open = range(G.n).filter(i => G.C.seat[i] < 0);
    if (open.length && !G.C.ready) act({ t: 'seat', i: open[Math.floor(Math.random() * open.length)] });
  });
};

// ---------- match ----------
// every seat gets the result of the outer section it stopped under; on Wild the Joker may trade two of them after
function matchLand(r) {
  const M = G.M, n = G.n;
  M.done = true;
  M.got = Array(n);
  G.C.seat.forEach((p, i) => M.got[p] = M.res[(i + r.off) % n]);
  G.mist = 0;
  const best = range(n).find(p => isBig(M.got[p]));
  cheer(best >= 0 ? COLORS[ZOO[best]] : '#ffd54a', isBad());
  G.C.seat.forEach((p, i) => {
    if (!isBig(M.got[p])) return;
    const [x, y] = at((i + 0.5) * TAU / n, 0.8);
    pillar(x, y, isBad() ? '#ff4d5e' : '#ffd54a', R * 0.6);
  });
  hub.disabled = true;
  hub.classList.remove('spinning');
  setStatus(best >= 0 ? t('gotRes', presetVal(M.got[best]), animalName(best)) : t('hint'), best >= 0 ? COLORS[ZOO[best]] : '');
  if (r.jk >= 0) after(1, () => joker(r.jk, r.jkP));
  else finishMatch(1.3);
}
function finishMatch(wait) {
  hub.disabled = !!NET.mine;
  updateActions();
  after(wait, openSummary);
}
// Joker (Ladder's beat, on the game clock): the joker seat's card shows, a spotlight laps the other seats, slowing, and
// locks on the partner (rolled with the spin); the two results trade over a pair of arcs. LUCKY / UNLUCKY / STAYING
function joker(j, e) {
  const M = G.M, ring = range(G.n).filter(x => x !== j), steps = Math.ceil(16 / ring.length) * ring.length + ring.indexOf(e) + 1;
  const toast = $('#jkToast'), name = i => `${faceZ(ZOO[G.C.seat[i]])}${animalName(G.C.seat[i])}`;
  const title = key => { const s = toast.querySelector('b span'); s.dataset.i18n = key; s.textContent = t(key); };
  const pop = () => toast.animate({ transform: ['scale(1.12)', 'none'] }, { duration: 260, easing: 'cubic-bezier(.3,1.6,.5,1)' });
  G.jk = j;
  title('joker');
  toast.style.setProperty('--c', '#ffb547');
  $('#jkPair').innerHTML = `${name(j)}<span class="sw">⇄</span><span class="jk-reel"><span><i>?</i></span></span>`;
  toast.classList.remove('lock', 'stamp');
  toast.classList.add('spin');
  toast.hidden = false;
  status.hidden = true;
  pop();
  let prev = '?';
  const reel = (txt, ms, last) => { // each step the next name rolls into the window, blurred while fast, overshooting last
    const s = $('#jkPair .jk-reel > span');
    s.innerHTML = `<i>${txt}</i><i>${prev}</i>`; prev = txt;
    s.style.animationDuration = `${ms}ms`;
    s.classList.toggle('fast', ms < 160);
    s.classList.toggle('last', last);
    s.classList.remove('roll'); void s.offsetWidth; s.classList.add('roll');
  };
  const gap = k => 0.07 + 0.52 * (k / steps) ** 2.6; // the last steps crawl so the pick lands with weight
  let at0 = 0;
  for (let k = 0; k < steps; k++) {
    at0 += gap(k);
    after(at0, () => { G.spot = ring[k % ring.length]; reel(name(G.spot), k === steps - 1 ? 520 : Math.min(gap(k + 1) * 900, 420), k === steps - 1); sfx.spot(k); });
  }
  const HOLD = 0.9, FLY = 1.3;
  after(at0 + 0.35, () => {
    toast.classList.replace('spin', 'lock');
    dim(HOLD + FLY + 0.6);
    sfx.swap(HOLD + FLY);
    after(HOLD, () => swapArcs(j, e, FLY));
    after(HOLD + FLY, () => {
      const pj = G.C.seat[j], pe = G.C.seat[e], rj = M.got[pj], re = M.got[pe];
      [M.got[pj], M.got[pe]] = [re, rj];
      M.swapped = [pj, pe];
      G.spot = -1;
      flash('#ffb547');
      for (const i of [j, e]) { const [x, y] = seatAt(i); shock(x, y, '#ffb547', R * 0.3); burst(x, y, '#ffd27a', 30, 240); }
      $('#jkPair').innerHTML = `${name(e)}<span class="sw">⇄</span>${name(j)}`;
      // the verdict for the joker's holder: the same result = it stayed; winning (or dodging) the big one = lucky
      const v = presetVal(rj) === presetVal(re) ? 'stay' : isBig(re) === isBig(rj) ? '' : isBig(re) !== isBad() ? 'lucky' : 'unlucky';
      if (v) {
        const TONE = { stay: '#ffd27a', lucky: '#ffd54a', unlucky: '#ff4d5e' }, other = { stay: 'stay', lucky: 'unlucky', unlucky: 'lucky' }[v];
        title(v);
        toast.style.setProperty('--c', TONE[v]);
        toast.classList.add('stamp');
        for (const [i, k] of [[j, v], [e, other]]) { const [x, y] = seatAt(i); floatText(x, y - 20, t(k), TONE[k]); }
      }
      pop();
      vibrate([20, 40, 60]);
      finishMatch(2.2);
    });
  });
}
// two glowing orbs trade seats along arcs over the hub, one high, one low, shedding gold sparks
function swapArcs(j, e, dur) {
  const a = seatAt(j), b = seatAt(e), c1 = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - R * 0.7], c2 = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + R * 0.3];
  const q = (p0, c, p1, f) => [0, 1].map(i => (1 - f) ** 2 * p0[i] + 2 * (1 - f) * f * c[i] + f * f * p1[i]);
  const ca = COLORS[ZOO[G.C.seat[j]]], cb = COLORS[ZOO[G.C.seat[e]]];
  G.fx.push({ t: 0, dur, draw(f) {
    const u = f < 0.5 ? 2 * f * f : 1 - (2 - 2 * f) ** 2 / 2;
    for (const [p0, c, p1, col] of [[a, c1, b, ca], [b, c2, a, cb]]) {
      const [x, y] = q(p0, c, p1, u), g = cx.createRadialGradient(x, y, 0, x, y, 16);
      g.addColorStop(0, '#fff'); g.addColorStop(0.3, col); g.addColorStop(1, rgba(col, 0));
      cx.save(); cx.globalCompositeOperation = 'lighter'; cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, 16, 0, TAU); cx.fill(); cx.restore();
      if (Math.random() < 0.7) G.parts.push({ x, y, vx: (Math.random() - 0.5) * 50, vy: (Math.random() - 0.5) * 50, g: 0, life: 0, max: 0.4, color: Math.random() < 0.5 ? '#ffb547' : col, r: 1 + Math.random() * 1.6 });
    }
  } });
}
// Replay: same board, same seats; the mist covers the ring again and any broken peg is fixed
function resetMatch() {
  G.M.done = false;
  G.M.got = null;
  G.M.swapped = null;
  G.mist = 1;
  repair();
}

// ---------- board lifecycle ----------
function newBoard(m) {
  stop();
  G.mode = modeOf();
  G.n = board().length;
  // Players boards seat everyone first; the other boards are on the wheel already
  G.C = S.board === 'players' ? { seat: Array(G.n).fill(-1), next: 0, ready: false } : null;
  G.items = G.C ? G.C.seat.map(seatItem) : board();
  G.wt = G.items.map(x => x.w);
  G.slot = Array(G.n).fill(false);
  G.segs = layout(G.wt);
  G.pins = pegs(G.segs, G.slot);
  G.θ = -(G.segs[0].a0 * 0.75 + G.segs[0].a1 * 0.25); // pointer over the first segment, clear of its pegs
  G.φ = 0;
  G.F = flapper();
  G.win = G.hop = G.stub = G.crack = G.spot = G.jk = -1;
  G.hist = [];
  G.over = false;
  G.K = G.mode === 'knock' ? { base: [...G.wt], wt: [...G.wt], slot: [...G.slot], used: Array(G.n).fill(false), outs: Array(G.n).fill(0) } : null;
  G.ko = G.mode === 'knock' ? { round: 0, log: [], bench: [] } : null;
  G.M = G.mode === 'match' ? { res: m.res, done: false, got: null, swapped: null } : null;
  G.mist = G.mode === 'match' ? 1 : 0;
  sfx.setLevel(0);
  setAuto(false); setFF(false);
  $('#jkToast').hidden = true;
  hubIdle();
  hub.disabled = !!NET.mine;
  hub.classList.remove('spinning');
  setStatus();
  renderStrip();
  renderTurn();
  updateActions();
  resize();
}
function stop() {
  cancelAnimationFrame(G.raf);
  G.raf = 0;
  G.move = 'idle';
  G.tw = null;
  G.sched = [];
  G.parts = []; G.fx = []; G.pop = null; G.shake = 0; G.cheer = 0;
  document.body.classList.remove('busy');
  sfx.whirr(0);
  sfx.duck(false);
  if (summary.open) summary.close();
}

// ---------- hub, status, strip, buttons ----------
const hubGo = hub.innerHTML;
function hubIdle() { hub.innerHTML = hubGo; hub.querySelector('b').textContent = t('spin'); }
// the pick on the hub: an animal (crowned, or with the bomb), a quick set glyph, or the label
function showPick(it, wear = 'crown') {
  hub.disabled = (G.over && G.mode === 'knock') || !!NET.mine;
  hub.classList.remove('spinning');
  const box = el('span', 'pick'), size = Math.max(56, R * 0.36);
  if (it.z >= 0) box.innerHTML = `<svg viewBox="${DRESS_BOX}" aria-hidden="true"><use href="#a${it.z}" width="32" height="32"/>${wear === 'bomb' ? '<use href="#x-soot"/><use href="#x-blast" opacity=".8"/>' : '<use href="#x-crown" filter="url(#ol)"/>'}</svg>`;
  else if (it.gl) {
    const c = box.appendChild(el('canvas')), d = Math.min(2, window.devicePixelRatio || 1), s = size * 0.62;
    c.width = c.height = Math.round(s * d); c.style.width = c.style.height = s + 'px';
    const g = c.getContext('2d'); g.setTransform(d, 0, 0, d, s * d / 2, s * d / 2);
    drawGlyph(g, it.gl, s * 0.9);
  } else {
    const s = box.appendChild(el('span'));
    s.textContent = it.label;
    s.style.fontSize = clamp(size * 0.9 / (Array.from(it.label).length * 0.62), 10, size * 0.34) + 'px';
  }
  hub.replaceChildren(box);
}
// no text: the mode's hint; '': blank while the wheel turns
function setStatus(text, color) {
  const auto = text === undefined;
  if (auto) text = G.mode === 'knock' && G.K ? knockHint() : G.crack >= 0 ? crackText() : null;
  status.hidden = false;
  status.textContent = status.title = text ?? t('hint'); // cut with an ellipsis on narrow screens: the full text on hover
  status.className = auto || text == null ? 'hint' : text ? 'won' : '';
  if (color) status.style.setProperty('--c', color);
}
// Pick: the last 8 picks, newest first. Knockout: the bench, in the order they went out; ↺ = still has a comeback slot
function renderStrip() {
  const list = G.mode === 'pick' ? G.hist.slice(-8).reverse() : G.mode === 'knock' ? G.ko.bench : [];
  strip.replaceChildren(...list.map((i, k) => {
    const it = G.items[i], li = el('li');
    li.style.setProperty('--c', it.color);
    if (k === (G.mode === 'pick' ? 0 : list.length - 1)) li.className = 'new';
    if (it.z >= 0) li.innerHTML = faceZ(it.z);
    li.append(Object.assign(el('span'), { textContent: it.label }));
    li.title = it.label; // chips cut long labels with an ellipsis
    if (G.mode === 'knock' && G.K.slot[i]) li.insertAdjacentHTML('beforeend', '<i class="cb" aria-hidden="true">↺</i>');
    return li;
  }));
  strip.hidden = !list.length;
}
function updateActions() {
  $('#autoBtn').hidden = $('#ffBtn').hidden = G.mode !== 'knock' || G.over;
  $('#sumBtn').hidden = !(G.mode === 'pick' ? G.hist.length : G.mode === 'knock' ? G.over : G.M?.done);
}
function setAuto(on) { G.auto = on; $('#autoBtn').setAttribute('aria-pressed', on); }
function setFF(on) { G.ff = on; $('#ffBtn').setAttribute('aria-pressed', on); }
$('#autoBtn').onclick = () => act({ t: 'auto', on: !G.auto });
$('#ffBtn').onclick = () => act({ t: 'ff', on: !G.ff });
$('#sumBtn').onclick = () => { sfx.ui(); openSummary(); };

// ---------- summary ----------
const JK_ICON = '<svg class="ic jk" aria-hidden="true"><use href="#i-joker"/></svg>';
const who = it => `${it.z >= 0 ? faceZ(it.z) + ' ' : ''}<b></b>`;
function row(it, right, cls = '', icon = '') {
  const li = el('li', cls);
  li.style.setProperty('--c', it.color);
  li.innerHTML = `<span>${icon ? `<svg class="ic crown"><use href="#i-${icon}"/></svg>` : ''}${who(it)}</span><svg class="ic"><use href="#i-arrow"/></svg><span></span>`;
  li.querySelector('b').textContent = it.label;
  li.lastChild.textContent = right;
  return li;
}
function openSummary() {
  let rows;
  if (G.mode === 'pick') { // tallies, most picked first, ties by the latest pick
    const n = new Map();
    G.hist.forEach((k, j) => n.set(k, [(n.get(k)?.[0] ?? 0) + 1, j]));
    rows = [...n].sort((a, b) => b[1][0] - a[1][0] || b[1][1] - a[1][1]).map(([k, [c]], j) => row(G.items[k], t('tally', c), j ? '' : 'big', j ? '' : 'crown'));
  } else if (G.mode === 'knock') { // the survivor, then the rest from the last out to the first; comebacks marked
    const last = G.items.map((_, i) => i).filter(i => G.K.wt[i] > 0);
    const outs = [...G.ko.log].reverse().filter(e => e.res === 'out').map(e => e.i).filter((i, j, a) => a.indexOf(i) === j);
    rows = [...last, ...outs].map((i, j) => {
      const back = G.ko.log.find(e => e.i === i && e.res === 'back'), out = G.ko.log.findLast(e => e.i === i && e.res === 'out');
      const right = j ? back ? t('roundBack', out.round, back.round) : t('round', out.round) : t(S.lastLoses ? 'pen' : 'win');
      return row(G.items[i], right, j ? '' : S.lastLoses ? 'big bad' : 'big', j ? '' : S.lastLoses ? 'skull' : 'crown');
    });
  } else rows = matchRows();
  rows.forEach((li, k) => li.style.setProperty('--i', k));
  $('#sumList').replaceChildren(...rows);
  $('#replayBtn').hidden = G.mode !== 'match';
  if (!summary.open) summary.showModal();
}
// Match: Ladder's list, best result first; teams as one card each; the joker's pair marked
function matchRows() {
  const M = G.M, order = range(G.n).sort((a, b) => slotRank(M.got[a]) - slotRank(M.got[b])), pl = p => ({ label: animalName(p), z: ZOO[p], color: COLORS[ZOO[p]] });
  const jk = p => M.swapped?.includes(p) ? JK_ICON : '';
  if (S.preset === 'team') return range(S.teams).map(tm => {
    const li = el('li', 'team'), members = order.filter(p => S.teamOf[M.got[p]] === tm);
    li.style.setProperty('--c', COLORS[tm]);
    li.innerHTML = `<span class="tn"><i class="gl" aria-hidden="true">${glyphHTML(M.got[members[0]])}</i>${t('team', String.fromCharCode(65 + tm))}</span><div class="mem"></div>`;
    li.querySelector('.mem').append(...members.map(p => { const b = el('b'); b.style.setProperty('--c', COLORS[ZOO[p]]); b.innerHTML = faceZ(ZOO[p]); b.append(animalName(p)); b.insertAdjacentHTML('beforeend', jk(p)); return b; }));
    return li;
  });
  return order.map(p => {
    const e = M.got[p], big = isBig(e), li = row(pl(p), presetVal(e), big ? isBad() ? 'big bad' : 'big' : '', big ? isBad() ? 'skull' : 'crown' : '');
    li.querySelector('.ani').outerHTML = petHTML(ZOO[p], e);
    li.querySelector('b').insertAdjacentHTML('afterend', jk(p));
    return li;
  });
}
// the dressed animal in the results list, with Ladder's moods: bomb drop, hop for joy, sob with tears
const petHTML = (z, e) => {
  const mood = moodOf(e), boom = S.preset === 'pen' && isBig(e);
  const wear = boom ? '<g class="bomb"><use href="#g-pen" x="6" y="-14" width="20" height="20"/></g><g class="blast"><use href="#x-blast"/></g><g class="soot"><use href="#x-soot"/></g>' : dress(e);
  return `<svg class="pet${boom ? ' boom' : ''} ${mood}" style="${blinkVars()}" viewBox="${DRESS_BOX}" aria-hidden="true"><use href="#a${z}" width="32" height="32"/>${wear}${mood === 'cry' ? tearPaths(z, 'tear') : ''}</svg>`;
};
$('#closeBtn').onclick = () => { sfx.ui(); summary.close(); };
$('#replayBtn').onclick = () => { summary.close(); act({ t: 'spin', w: BUTTON }); };
summary.addEventListener('click', e => {
  const r = summary.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) summary.close();
});

// rim bulbs: one every 15°, none behind the pointer
const bulbs = $('#bulbs');
bulbs.innerHTML = range(24).slice(1, -1).map(k => { const a = (k + 0.5) * TAU / 24; return `<circle r=".028" cx="${(Math.sin(a) * 1.05).toFixed(3)}" cy="${(-Math.cos(a) * 1.05).toFixed(3)}" style="--i:${k}"/>`; }).join('');

// ---------- input ----------
// grab the board and it follows the finger; let go fast enough and it spins at that speed, too slow and it springs back.
// Players boards, before the first spin: tap a free seat to take it
const local = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
cv.addEventListener('pointerdown', e => {
  if (G.move === 'spin' || G.move === 'reform' || !e.isPrimary || !R || NET.mine) return;
  const [x, y] = local(e), d = Math.hypot(x - ox, y - oy), ψ = Math.atan2(x - ox, oy - y);
  if (d > R * 1.12 || d < R * 0.12) return;
  if (G.C && !G.C.ready) {
    if (G.mode !== 'match') act({ t: 'seat', i: layout(G.wt).findIndex(sg => mod(ψ - G.θ) >= sg.a0 && mod(ψ - G.θ) < sg.a1) });
    else if (d < R * RI) act({ t: 'seat', i: Math.floor(mod(ψ - G.φ) / (TAU / G.n)) % G.n });
    return;
  }
  cv.setPointerCapture(e.pointerId);
  const a = Math.atan2(y - oy, x - ox);
  G.drag = { base: G.θ, θ: G.θ, last: a, u: 0, s: [[e.timeStamp, 0]] };
  if (G.move !== 'spring') G.home = G.θ; // re-grabbed while springing back: still home to the first grab
  G.move = 'drag';
  kick();
});
cv.addEventListener('pointermove', e => {
  if (G.move !== 'drag' || !e.isPrimary) return;
  const [x, y] = local(e), a = Math.atan2(y - oy, x - ox), D = G.drag;
  D.u += mod(a - D.last + Math.PI) - Math.PI; // unwrapped: whole turns add up
  D.last = a;
  D.θ = D.base + D.u;
  D.s.push([e.timeStamp, D.u]);
  while (D.s.length > 2 && e.timeStamp - D.s[0][0] > 120) D.s.shift();
});
const release = e => {
  if (G.move !== 'drag' || !e.isPrimary) return;
  // release speed from the last ~80 ms of samples; a finger held still before letting go gives 0
  const D = G.drag, s = D.s.find(([ts]) => e.timeStamp - ts <= 80) ?? D.s.at(-1), dt = (e.timeStamp - s[0]) / 1000;
  const w = dt > 0.008 ? (D.u - s[1]) / dt : 0;
  G.move = 'spring'; G.sv = 0;
  if (e.type === 'pointerup' && Math.abs(w) >= FLICK_MIN) act({ t: 'spin', w, θ0: D.θ });
  if (G.move === 'spring') kick();
};
cv.addEventListener('pointerup', release);
cv.addEventListener('pointercancel', release);
cv.addEventListener('lostpointercapture', release); // capture stolen (system gesture): never leave the wheel stuck to a finger
hub.onclick = () => act({ t: 'spin', w: BUTTON });
addEventListener('keydown', e => {
  if (play.hidden || summary.open || e.repeat || (e.key !== ' ' && e.key !== 'Enter') || e.target.closest?.('button, input')) return;
  e.preventDefault();
  act({ t: 'spin', w: BUTTON });
});

// ---------- actions ----------
// every action goes through here; everything random is rolled here, before anything moves, and travels in the message,
// so watching phones (phone link) replay the very same spin through the same ACT
const ACT = {
  start: m => { sfx.go(0, 0); setup.hidden = true; play.hidden = false; newBoard(m); },
  edit: () => { sfx.ui(); stop(); repair(true); play.hidden = true; setup.hidden = false; renderSetup(); },
  new: m => {
    const stub = G.mode === 'pick' ? G.stub : -1; // Pick's lasting broken peg gets fixed on New, in view
    sfx.shuffle(); wrap.classList.remove('shake'); void wrap.offsetWidth; wrap.classList.add('shake');
    newBoard(m);
    if (stub >= 0 && stub < G.pins.length) { G.stub = stub; repair(); }
  },
  spin,
  seat: ({ i }) => claim(i),
  auto: ({ on }) => { setAuto(on); sfx.ui(); if (on && G.move === 'idle' && !G.over && !NET.mine) act({ t: 'spin', w: BUTTON }); },
  ff: ({ on }) => { setFF(on); sfx.ui(); },
};
const hosting = () => window.Coop?.role === 'host' && Coop.live;
function act(m) {
  if (NET.mine) return; // watching: only the host drives (the controls are inert as well)
  wake();
  if (m.t === 'spin') {
    if (play.hidden || G.move === 'spin' || G.move === 'reform' || G.over || (G.C && !G.C.ready)) return;
    const θ0 = m.θ0 ?? G.θ, opt = { reduced: reduceMotion.matches, spice: S.spice };
    Object.assign(m, G.mode === 'match' ? matchRoll(G.n, θ0, G.φ, m.w, opt)
      : roll(G.K ? G.K.wt : G.wt, θ0, m.w, { ...opt, slot: G.slot, crack: G.crack, stub: G.stub }));
  }
  if (m.t === 'seat' && (!G.C || G.C.ready || !(m.i >= 0))) return;
  if (m.t === 'start' || m.t === 'new') Object.assign(m, { res: shuffle(range(S.n)) }, shared()); // Match: the hidden ring order
  ACT[m.t](m);
  if (hosting()) Coop.send(m);
}

// a screen left alone: 30 s after the last touch or spin the looping decorations (background drift, bulbs, preview drift,
// hops, blinks) pause (.idle in style.css); any touch wakes them
const IDLE = 30000;
let idleT = 0;
function wake() {
  clearTimeout(idleT);
  idleT = setTimeout(() => G.raf ? wake() : document.body.classList.add('idle'), IDLE);
  document.body.classList.remove('idle');
}
for (const e of ['pointerdown', 'keydown', 'wheel']) addEventListener(e, wake, { capture: true, passive: true });

// ---------- volume ----------
const volBtn = $('#volBtn'), volPop = $('#volPop');
const lastOn = { music: 50, sfx: 80 };
function setVol(k, v) {
  S[k] = v;
  if (v) lastOn[k] = v;
  sfx.setVolume(k, v / 100);
  const input = $(k === 'music' ? '#musicVol' : '#sfxVol');
  input.value = v;
  input.style.setProperty('--p', v + '%');
  input.parentElement.style.setProperty('--f', v / 100);
  input.nextElementSibling.textContent = v + '%';
  $(`[data-mute="${k}"]`).classList.toggle('off', !v);
  const top = Math.max(S.music, S.sfx);
  $('#volIcon').setAttribute('href', top ? top < 45 ? '#i-vol-low' : '#i-vol-high' : '#i-vol-mute');
}
$('#musicVol').oninput = e => setVol('music', +e.target.value);
$('#sfxVol').oninput = e => setVol('sfx', +e.target.value);
$('#musicVol').onchange = $('#sfxVol').onchange = save;
document.querySelectorAll('[data-mute]').forEach(b => b.onclick = () => {
  const k = b.dataset.mute;
  setVol(k, S[k] ? 0 : lastOn[k]);
  save();
  sfx.ui();
});
const togglePop = open => { volPop.hidden = !open; volBtn.setAttribute('aria-expanded', open); };
volBtn.onclick = () => togglePop(volPop.hidden);
document.addEventListener('pointerdown', e => { if (!volPop.hidden && !e.target.closest('.vol')) togglePop(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') togglePop(false); });

// ---------- language ----------
const LANG_NAME = { en: 'EN', ko: '한국어', ja: '日本語' };
function applyI18n() {
  document.documentElement.lang = S.lang;
  document.title = t('title');
  $('#lang span').textContent = LANG_NAME[S.lang];
  $('#lang').setAttribute('aria-label', `${t('lang')}: ${LANG_NAME[S.lang]}`);
  document.querySelectorAll('[data-i18n]').forEach(n => n.textContent = t(n.dataset.i18n));
  document.querySelectorAll('[data-i18n-aria]').forEach(n => n.setAttribute('aria-label', t(n.dataset.i18nAria)));
  hub.setAttribute('aria-label', t('spin'));
  $('#startBtn').dataset.watch = t('watching');
  renderSetup();
}
// tap cycles EN → 한국어 → 日本語 → EN
$('#lang').onclick = () => {
  const L = Object.keys(LANG_NAME);
  S.lang = L[(L.indexOf(S.lang) + 1) % L.length];
  save(); applyI18n();
};

// ---------- phone link ----------
// Host + watchers (coop.js, shared with Ladder and the other ArcadeDeck games): the host plays as usual; other phones join
// to watch its game live. Every host action is a small message replayed through the same ACT, rolls included; setup
// edits stream as the shared part of S. A phone joining mid-game gets a snapshot.
// ponytail: a late joiner sees the board as it is (a spin already running is not replayed); everything that decides a
// result is exact
const shared = () => {
  const { lang, music, sfx: fx, ...s } = S;
  return { s, zoo: [...ZOO] };
};
// several saves in one tick go out as one message
NET.sync = () => {
  if (!hosting() || NET.queued) return;
  NET.queued = true;
  queueMicrotask(() => { NET.queued = false; Coop.send({ t: 'S', ...shared() }); });
};
const snapshot = () => ({ t: 'sync', ...shared(), on: !play.hidden, g: play.hidden || !G.items.length ? null : {
  res: G.M?.res ?? null, C: G.C, K: G.K, ko: G.ko, M: G.M, θ: G.θ, φ: G.φ, wt: G.wt, slot: G.slot, hist: G.hist,
  stub: G.stub, crack: G.crack, over: G.over, mist: G.mist, ff: G.ff, auto: G.auto,
} });
function syncTo({ on, g }) {
  stop();
  setup.hidden = on; play.hidden = !on;
  if (!g) return renderSetup();
  newBoard(g);
  Object.assign(G, { C: g.C, K: g.K, ko: g.ko, M: g.M, θ: g.θ, φ: g.φ, wt: g.wt, slot: g.slot, hist: g.hist, stub: g.stub, crack: g.crack, over: g.over, mist: g.mist });
  if (G.C && G.mode !== 'match') G.items = G.C.seat.map(seatItem);
  G.segs = layout(G.wt);
  G.pins = pegs(G.segs, G.slot);
  setFF(g.ff); setAuto(g.auto);
  renderStrip(); renderTurn(); updateActions();
  resize();
}
// watching: this phone's own setup parked, the host's controls inert
function watch(on) {
  if (!!NET.mine === on) return;
  if (on) NET.mine = JSON.parse(JSON.stringify(S));
  else {
    Object.assign(S, NET.mine, { lang: S.lang, music: S.music, sfx: S.sfx });
    NET.mine = null;
    stop();
    play.hidden = true; setup.hidden = false;
    renderSetup();
  }
  document.body.classList.toggle('watching', on);
  document.querySelectorAll('#setup .panel, #startBtn, #hub, #editBtn, #newBtn, #autoBtn, #ffBtn, #randBtn, #replayBtn').forEach(e => e.inert = on);
}
const linkOpts = {
  game: 'spin-board', watch: true, max: 15, lang: () => S.lang,
  onStart(n, me) {
    document.body.classList.add('linked');
    if (me) watch(true);
    else Coop.send(snapshot()); // phones that joined before Continue
  },
  onJoin(i) { if (Coop.live) Coop.sendTo(i, snapshot()); }, // joined mid-game
  onMsg(m) {
    if (!NET.mine) return; // not started yet: the host sends a snapshot on Continue
    wake(); // watching phones get no touches: the host's moves keep them awake
    if (m.s) { Object.assign(S, m.s); ZOO.splice(0, ZOO.length, ...m.zoo); fixPresets(); renderSetup(); }
    if (m.t === 'sync') syncTo(m);
    else ACT[m.t]?.(m);
  },
  onLeave() { if (summary.open) summary.close(); }, // the "host left" notice must not sit under the modal dialog
  onMenu() { document.body.classList.remove('linked'); watch(false); },
};
document.querySelectorAll('.link-btn').forEach(b => b.onclick = () => { sfx.ui(); window.Coop?.open(linkOpts); });

// ---------- boot ----------
// audio may only start from a user gesture (autoplay policy); init() is idempotent and resumes iOS-interrupted contexts
const unlock = () => { sfx.init(); sfx.startMusic(); };
addEventListener('pointerdown', unlock, true);
addEventListener('keydown', unlock, true);
addEventListener('touchend', unlock, true); // a touch's pointerdown isn't a user activation yet; its touchend is (iOS / Android)
addEventListener('contextmenu', e => { if (!e.target.closest?.('input')) e.preventDefault(); }); // long-press menus
document.addEventListener('visibilitychange', () => {
  sfx.pause(document.hidden);
  if (!document.hidden) { G.last = performance.now(); wake(); } // no jump on resume
});
new ResizeObserver(() => { if (!setup.hidden) drawPreview(); }).observe(pv);

setVol('music', S.music);
setVol('sfx', S.sfx);
applyI18n();
wake();

// boot splash (index.html): up 1.4 s at least so the banner registers, lifted once it has loaded (3 s at most, from page
// start); a tap skips it. A click, not pointerdown, so the tap can't fall through onto the Start button underneath
const splash = $('#splash');
if (splash) {
  const art = splash.querySelector('.art');
  const lift = () => { splash.classList.add('out'); setTimeout(() => splash.remove(), 450); };
  const loaded = art.complete ? Promise.resolve() : new Promise(r => { art.addEventListener('load', r); art.addEventListener('error', r); });
  Promise.race([loaded, new Promise(r => setTimeout(r, 3000 - performance.now()))])
    .then(() => setTimeout(lift, 1400 - performance.now()));
  splash.addEventListener('click', lift);
}

if ('serviceWorker' in navigator && window.isSecureContext) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
