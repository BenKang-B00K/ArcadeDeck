import { makeLadder, trace, wave, ringBox, seat, TILT_CHANCE, RING_RY } from './ladder.js';
import * as sfx from './audio.js';

const COLORS = ['#ff5d8f', '#4fd8ff', '#ffb547', '#b98bff', '#5dffb0', '#ff7a5c', '#7c9cff', '#ffe45e', '#ff9de6', '#9dff5d',
  '#2ee6d6', '#ff4766', '#d6c8ff', '#d89a6a', '#8f6bff', '#e45cff', '#e8eef8', '#ffc0a0', '#5db8ff', '#ff9a3d'];
const MAX = 10; // players; animals = COLORS.length
// players are always animals: animal k = SVG symbol #a{k} in index.html, wears COLORS[k] (the face alone fits the 10 narrow lanes)
const animal = names => n => names[n - 1];

const I18N = {
  en: {
    title: 'Ladder Game',
    players: 'Players', results: 'Results', presets: 'Quick fill', order: 'Pick Order ->', reshuffle: 'Shuffle animals',
    pWin: 'Winner', pRank: 'Rank', pRatio: 'Ratio', pTeam: 'Teams', pPen: 'Penalty', pBill: 'Bill', winners: 'Winners', teams: 'Teams', pens: 'Penalties', total: 'Total', frees: 'Pays 0', minPay: 'Min. {n} each', firsts: '1st places', zeros: '0% slots', any: 'Random', pClear: 'Clear', start: 'Start',
    player: animal(['Rabbit', 'Penguin', 'Tiger', 'Cat', 'Panda', 'Fox', 'Dog', 'Lion', 'Bear', 'Frog', 'Koala', 'Pig', 'Mouse', 'Monkey', 'Owl', 'Chick', 'Cow', 'Sheep', 'Raccoon', 'Hamster']), win: 'WIN!', lose: 'Pass', pen: 'Penalty', safe: 'Safe', team: 'Team {n}', rank: n => n + (['st', 'nd', 'rd'][n - 1] || 'th'),
    rand: 'Random', peek: 'Find the best spot!', pick: 'Pick your spot',
    all: 'Result', again: 'New', reset: 'Reset', summary: 'Results', close: 'Close', replay: 'Replay', ff: 'Fast forward',
    music: 'Music', bgm: 'BGM', fx: 'EFFECT', sfx: 'Sound effects', volume: 'Volume', lang: 'Language', more: 'Add player', less: 'Remove player',
    height: 'Height', hShort: 'Short', hMedium: 'Medium', hLong: 'Long',
    // tooltip markup: [m:..] rung multiplier, [s:..] straight, [d:..] diagonal, [w:..] wormhole, [c:..] carousel, [j:..] joker, [o:..] odds row (coloured in CSS)
    tipShort: 'Short: fewest rungs [m:0.8×]\n[s:Straight] + [j:Joker]', tipMedium: 'Medium: standard rungs [m:1.2×]\n[s:Straight] + [d:Diagonal] + [w:Wormhole] / [c:Carousel]',
    tipHelp: 'What do the specials do?', tipFeat: '[w:Wormhole] Falls in one mouth, comes out the other [o:M 50% · L 100%]\n[c:Carousel] Rides one seat round the ring, then goes on down [o:M 50% · L 50%]\n[j:Joker] At the end, its player trades results with another [o:S 40% · L 40%]',
    tipLong: 'Long: most rungs [m:1.5×]\n[d:Diagonal] + [w:Wormhole] + [c:Carousel] + [j:Joker]', joker: 'Joker swap!', stay: 'STAYING!', lucky: 'LUCKY SWAP!', unlucky: 'UNLUCKY SWAP!', wormhole: 'Wormhole!', carousel: 'Carousel!', out: 'OUT!', stun: 'STUN!', climb: 'CLIMB!', slide: 'SLIDE!',
    link: 'Phone link', watching: 'Watching',
  },
  ko: {
    title: '사다리 타기',
    players: '참가자', results: '결과', presets: '빠른 입력', order: '선택 순서 ->', reshuffle: '동물 바꾸기',
    pWin: '당첨', pRank: '순위', pRatio: '비율', pTeam: '팀', pPen: '벌칙', pBill: '정산', winners: '당첨 수', teams: '팀 수', pens: '벌칙 수', total: '총액', frees: '면제 수', minPay: '1인 최소 {n}', firsts: '1등 수', zeros: '0% 수', any: '랜덤', pClear: '비우기', start: '시작',
    player: animal(['토끼', '펭귄', '호랑이', '고양이', '판다', '여우', '강아지', '사자', '곰', '개구리', '코알라', '돼지', '생쥐', '원숭이', '부엉이', '병아리', '젖소', '양', '라쿤', '햄스터']), win: '당첨!', lose: '꽝', pen: '벌칙', safe: '통과', team: '{n}팀', rank: '{n}등',
    rand: '랜덤', peek: '최고의 자리를 찾으세요!', pick: '자리를 고르세요',
    all: '결과', again: '새 판', reset: '리셋', summary: '결과', close: '닫기', replay: '다시', ff: '빨리 감기',
    music: '음악', bgm: '배경음', fx: '효과음', sfx: '효과음', volume: '볼륨', lang: '언어', more: '참가자 추가', less: '참가자 삭제',
    height: '길이', hShort: '짧게', hMedium: '보통', hLong: '길게',
    tipShort: '짧게: 가로줄 적음 [m:0.8×]\n[s:직선] + [j:조커]', tipMedium: '보통: 가로줄 보통 [m:1.2×]\n[s:직선] + [d:대각선] + [w:웜홀] / [c:회전목마]',
    tipHelp: '특수 장치 설명', tipFeat: '[w:웜홀] 한쪽 입구로 들어가 다른 입구로 나옴 [o:M 50% · L 100%]\n[c:회전목마] 고리를 따라 한 칸 옆으로 옮겨 내려감 [o:M 50% · L 50%]\n[j:조커] 마지막에 조커 카드 주인이 다른 사람과 결과를 바꿈 [o:S 40% · L 40%]',
    tipLong: '길게: 가로줄 많음 [m:1.5×]\n[d:대각선] + [w:웜홀] + [c:회전목마] + [j:조커]', joker: '조커 교환!', stay: '그대로!', lucky: 'Lucky!', unlucky: 'Unlucky!', wormhole: '웜홀!', carousel: '회전목마!', out: '탈출!', stun: '기절!', climb: '영차!', slide: '미끄럼!',
    link: '폰 연결', watching: '관전 중',
  },
  ja: {
    title: 'あみだくじ',
    players: 'プレイヤー', results: '結果', presets: 'クイック入力', order: '選ぶ順番 ->', reshuffle: '動物を入れ替え',
    pWin: '当たり', pRank: '順位', pRatio: '割合', pTeam: 'チーム', pPen: '罰ゲーム', pBill: '割り勘', winners: '当たり数', teams: 'チーム数', pens: '罰ゲーム数', total: '合計', frees: '免除数', minPay: '1人最低{n}', firsts: '1位数', zeros: '0%数', any: 'ランダム', pClear: 'クリア', start: 'スタート',
    player: animal(['ウサギ', 'ペンギン', 'トラ', 'ネコ', 'パンダ', 'キツネ', 'イヌ', 'ライオン', 'クマ', 'カエル', 'コアラ', 'ブタ', 'ネズミ', 'サル', 'フクロウ', 'ヒヨコ', 'ウシ', 'ヒツジ', 'アライグマ', 'ハムスター']), win: '当たり！', lose: 'はずれ', pen: '罰ゲーム', safe: 'セーフ', team: 'チーム{n}', rank: '{n}位',
    rand: 'ランダム', peek: 'ベストな場所を探そう！', pick: '場所を選んでね',
    all: '結果', again: '新規', reset: 'リセット', summary: '結果', close: '閉じる', replay: 'もう一度', ff: '早送り',
    music: '音楽', bgm: 'BGM', fx: '効果音', sfx: '効果音', volume: '音量', lang: '言語', more: 'プレイヤーを追加', less: 'プレイヤーを削除',
    height: '長さ', hShort: '短い', hMedium: '普通', hLong: '長い',
    tipShort: '短い: 横線少なめ [m:0.8×]\n[s:直線]＋[j:ジョーカー]', tipMedium: '普通: 横線ふつう [m:1.2×]\n[s:直線]＋[d:斜め]＋[w:ワームホール]／[c:回転木馬]',
    tipHelp: '特殊ギミックの説明', tipFeat: '[w:ワームホール] 片方の口に入り、もう片方から出る [o:M 50% · L 100%]\n[c:回転木馬] 輪に乗って一つ隣へ移り、下へ進む [o:M 50% · L 50%]\n[j:ジョーカー] 最後にジョーカー札の人が他の人と結果を交換 [o:S 40% · L 40%]',
    tipLong: '長い: 横線多め [m:1.5×]\n[d:斜め]＋[w:ワームホール]＋[c:回転木馬]＋[j:ジョーカー]', joker: 'ジョーカー交換！', stay: 'そのまま！', lucky: 'Lucky!', unlucky: 'Unlucky!', wormhole: 'ワームホール！', carousel: '回転木馬！', out: 'アウト！', stun: 'ピヨピヨ！', climb: 'よいしょ！', slide: 'すべり！',
    link: 'スマホ接続', watching: '観戦中',
  },
};

// ---------- state ----------
const KEY = 'ladder-game.v1';
const saved = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// ladder height -> [rung-row multiplier, diagonal-rung chance, wormhole chance, carousel chance, joker chance, carousel XOR wormholes]
// medium: carousel on half, wormholes on the rest (and whenever the carousel finds no spot, e.g. 2 players)
// ponytail: tipFeat spells these odds out by hand; change both together
const HEIGHTS = { short: [0.8, 0, 0, 0, 0.4], medium: [1.2, TILT_CHANCE, 1, 0.5, 0, true], long: [1.5, 1, 1, 0.5, 0.4] };
const navLang = (navigator.language || 'en').slice(0, 2);
const S = {
  lang: I18N[saved.lang] ? saved.lang : I18N[navLang] ? navLang : 'en',
  n: clamp(+saved.n || 4, 2, MAX),
  height: saved.height in HEIGHTS ? saved.height : 'medium',
  results: Array.isArray(saved.results) ? saved.results : [],
  preset: 'preset' in saved ? saved.preset : 'win', // 'win' | 'pen' | 'rank' | 'ratio' | 'bill' | 'team' | null (custom results)
  ratio: Array.isArray(saved.ratio) ? saved.ratio : [],
  // ponytail: Penalty shares the Winner count/slots, only one preset is live at a time
  winners: Number.isInteger(saved.winners) ? saved.winners : 1, // win/pen: how many WIN / penalty slots
  winSlots: Array.isArray(saved.winSlots) ? saved.winSlots : [], // win/pen: which slots are WIN / penalty
  firsts: Number.isInteger(saved.firsts) ? saved.firsts : 1, // rank: how many tied 1st places
  zeros: Number.isInteger(saved.zeros) ? saved.zeros : null, // ratio/bill: fixed number of 0% / pays-0 slots, null = random
  cur: saved.cur, // bill: currency, picked below once the language is known
  total: Number.isInteger(saved.total) ? saved.total : 0, // bill: amount to split
  bill: Array.isArray(saved.bill) ? saved.bill : [], // bill: amount per slot
  teams: Number.isInteger(saved.teams) ? saved.teams : 2, // team: how many teams
  teamOf: Array.isArray(saved.teamOf) ? saved.teamOf : [], // team: team index per slot
  music: saved.musicV2 ? saved.music ?? 50 : 50, // music output got quieter per step (v1.123): older saved levels reset once
  musicV2: 1,
  sfx: saved.sfx ?? 80,
};
// bill currencies: symbol, step (smallest non-zero payment; every amount is a multiple of it), default total
const CUR = { USD: ['$', 5, 100], KRW: ['₩', 1000, 50000], JPY: ['¥', 100, 5000] };
if (!CUR[S.cur]) S.cur = { ko: 'KRW', ja: 'JPY' }[S.lang] || 'USD';
if (S.total <= 0) S.total = CUR[S.cur][2];
// phone link (bottom of file). mine: this phone's own setup, parked while it watches another phone's game
const NET = { mine: null };
const save = () => {
  // watching: S holds the host's setup, so disk keeps this phone's own (language and volume stay its own)
  try { localStorage.setItem(KEY, JSON.stringify(NET.mine ? { ...NET.mine, lang: S.lang, music: S.music, sfx: S.sfx } : S)); } catch { /* sandboxed iframe */ }
  NET.sync?.();
};

const t = (k, n) => {
  const v = I18N[S.lang][k] ?? I18N.en[k];
  return typeof v === 'function' ? v(n) : v.replace('{n}', n);
};
const range = n => Array.from({ length: n }, (_, i) => i);
const shuffle = a => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
// `units` split into n random parts: stars and bars, so every split is equally likely.
// zeros = null: any part may be 0. zeros = z: exactly z parts are 0, the others get at least 1 unit each
// (fewer payers if there aren't enough units to go round).
const stars = (units, zeros) => {
  const k = Math.max(1, Math.min(S.n - (zeros ?? 0), zeros == null ? S.n : units)), min = zeros == null ? 0 : 1;
  const slots = units - k * min + k - 1, bars = new Set();
  while (bars.size < k - 1) bars.add(Math.floor(Math.random() * slots));
  const pts = [-1, ...[...bars].sort((a, b) => a - b), slots];
  return shuffle([...range(k).map(i => pts[i + 1] - pts[i] - 1 + min), ...Array(S.n - k).fill(0)]); // scatter the zeros
};
// ratio: 20 five-percent units, re-rolled until no share tops 50%
// ponytail: rejection loop, worst case 2 non-zero slots (~19-21 tries, always 50/50); fine at this size
const rollRatio = () => {
  if (S.zeros != null) S.zeros = clamp(S.zeros, 0, S.n - 2); // at least 2 non-zero slots to stay <= 50%
  do S.ratio = stars(20, S.zeros).map(u => u * 5); while (Math.max(...S.ratio) > 50);
};
// bill: whole currency steps ($5 / ₩1,000 / ¥100), no cap, so one payer may take it all.
// The leftover below one step goes to a random payer so the amounts add up to the total exactly.
const rollBill = () => {
  const step = CUR[S.cur][1];
  if (S.zeros != null) S.zeros = clamp(S.zeros, 0, S.n - 1);
  S.bill = stars(Math.floor(S.total / step), S.zeros).map(u => u * step);
  const payers = range(S.n).filter(i => S.bill[i]);
  S.bill[payers.length ? payers[Math.floor(Math.random() * payers.length)] : Math.floor(Math.random() * S.n)] += S.total % step;
};
const marks = () => S.preset === 'win' || S.preset === 'pen'; // a few marked slots, the rest plain
// re-roll splits saved by older versions or not matching the chosen 0% count
if (S.preset === 'ratio' && (S.ratio.length !== S.n || S.ratio.some(v => v % 5 || v > 50) ||
  (S.zeros != null && S.ratio.filter(v => !v).length !== S.zeros))) rollRatio();
if (S.preset === 'bill' && (S.bill.length !== S.n || S.bill.reduce((a, b) => a + b, 0) !== S.total)) rollBill();
// win: one winner sits mid-row, several are scattered randomly. rank: the `firsts` most central slots tie
// for 1st, the rest continue densely (1st, 1st, 2nd, 3rd...)
const rollWinners = () => { S.winSlots = S.winners > 1 ? shuffle(range(S.n)).slice(0, S.winners) : [mid()]; };
// team: sizes differ by at most one, members scattered
const maxTeams = () => Math.max(2, S.n >> 1);
const rollTeams = () => { S.teams = clamp(S.teams, 2, maxTeams()); S.teamOf = shuffle(range(S.n).map(i => i % S.teams)); };
const reroll = () => ({ ratio: rollRatio, bill: rollBill, team: rollTeams }[S.preset] || (marks() ? rollWinners : () => {}))();
// ponytail: whole amounts only, no cents
const money = v => CUR[S.cur][0] + v.toLocaleString(S.lang);
const presetVals = () => range(S.n).map(i => S.preset === 'win' ? t(S.winSlots.includes(i) ? 'win' : 'lose')
  : S.preset === 'pen' ? t(S.winSlots.includes(i) ? 'pen' : 'safe')
  : S.preset === 'rank' ? t('rank', place(i))
  : S.preset === 'team' ? t('team', String.fromCharCode(65 + S.teamOf[i]))
  : S.preset === 'bill' ? money(S.bill[i]) : S.preset === 'ratio' ? S.ratio[i] + '%' : '');
// players get the first n of all animals: reshuffled on every page load and Pick Order tap, never saved
const ZOO = shuffle(range(COLORS.length));
const pc = i => COLORS[ZOO[i]]; // player colour = their animal's colour
const animalName = i => t('player', ZOO[i] + 1);
// blinking: each animal gets its own blink period / offset, and 1 in 3 blinks twice; read by .e in style.css
const blinkVars = () => `--bt:${(3 + Math.random() * 4).toFixed(2)}s;--bd:${(-Math.random() * 7).toFixed(2)}s${Math.random() < 0.33 ? ';--bk:blink2' : ''}`;
const face = i => `<svg class="ani" style="${blinkVars()}" aria-hidden="true"><use href="#a${ZOO[i]}"/></svg>`;
const nameOf = (i, short) => short ? face(i) : `${face(i)} ${animalName(i)}`; // HTML; short: fits 10 narrow lanes
const resultOf = i => (S.preset ? presetVals()[i] : S.results[i]?.trim()) || '—';
// quick fill results show on the board as toy-like 3D glyphs (#g-* in index.html), the text kept for screen readers;
// rank / team carry their number or letter on the glyph, ratio / bill keep the value as a caption
const gly = (id, tint) => `<svg aria-hidden="true"${tint ? ` style="color:${tint}"` : ''}><use href="#g-${id}"/></svg>`;
const MEDAL = ['#ffd54a', '#dfe3f5', '#e8955a']; // 1st-3rd, then plain purple
const glyph = e => {
  const v = resultOf(e), p = S.preset, sr = `<span class="sr">${v}</span>`;
  if (marks()) return gly(isBig(e) ? p : p === 'win' ? 'pass' : 'safe') + sr;
  if (p === 'rank') return gly('rank', MEDAL[place(e) - 1] || '#b98bff') + `<em style="top:62%">${place(e)}</em>` + sr;
  if (p === 'team') return gly('team', COLORS[S.teamOf[e]]) + `<em style="top:50%">${String.fromCharCode(65 + S.teamOf[e])}</em>` + sr;
  if (p === 'bill') return gly('bill') + `<i>${v}</i>`;
  // ratio: a pie disc filled to the share
  return `<svg aria-hidden="true" viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="#5a4a96" stroke="#e6dcff" stroke-opacity=".5"/><circle cx="16" cy="16" r="5.5" fill="none" stroke="${isBig(e) ? '#ffd54a' : '#5dffb0'}" stroke-width="11" stroke-dasharray="${S.ratio[e] * .3456} 99" transform="rotate(-90 16 16)"/><circle cx="16" cy="16" r="11" fill="url(#gb)"/></svg><i>${v}</i>`;
};
// centre-out slot order: mid-row first (10 -> 5th slot, 7 -> 4th), then right, left, right...
const mid = () => (S.n - 1) >> 1;
const rankOf = slot => { const d = slot - mid(); return d > 0 ? 2 * d : 1 - 2 * d; };
const place = slot => Math.max(1, rankOf(slot) - S.firsts + 1); // rank preset: 1st, 1st, 2nd...
if (marks() && (S.winSlots.length !== S.winners || S.winSlots.some(v => v >= S.n))) rollWinners();
if (S.preset === 'team' && (S.teamOf.length !== S.n || Math.max(...S.teamOf) + 1 !== S.teams)) rollTeams();
// spotlight: winners, 1st places, biggest share; penalties and the biggest payer get it too, in the "bad" style
const share = end => S.preset === 'bill' ? S.bill[end] : S.ratio[end]; // ratio / bill only
const isBig = end => marks() ? S.winSlots.includes(end) : S.preset === 'rank' ? rankOf(end) <= S.firsts
  : (S.preset === 'ratio' || S.preset === 'bill') && share(end) === Math.max(...range(S.n).map(share)); // ties all count
const isBad = () => S.preset === 'pen' || S.preset === 'bill';
// best-first sort key for the summary (teams: grouped A, B, C...); custom results keep the entered order
const slotRank = end => S.preset === 'ratio' || S.preset === 'bill' ? -share(end) : marks() ? (isBig(end) ? -1 : end)
  : S.preset === 'team' ? S.teamOf[end] * MAX + end : S.preset ? rankOf(end) : end;

const $ = s => document.querySelector(s);
const el = (tag, cls) => Object.assign(document.createElement(tag), { className: cls || '' });
const [setup, play, entries, chips, cards, wrap, summary] =
  ['#setup', '#play', '#entries', '#chips', '#cards', '#wrap', '#summary'].map($);

// ---------- setup screen ----------
function renderEntries() {
  const vals = S.preset ? presetVals() : S.results;
  // players: tiny animal cards in their colour; results: their own card grid, not tied to a player
  $('#zoo').replaceChildren(...range(S.n).map(i => {
    const li = el('li');
    li.style.setProperty('--c', pc(i));
    li.style.setProperty('--i', i); // idle hop stagger
    li.innerHTML = `${face(i)}<span>${animalName(i)}</span>`;
    return li;
  }));
  entries.replaceChildren(...range(S.n).map(i => {
    const li = el('li');
    li.innerHTML = `<span class="no">${i + 1}</span><input data-k="results" data-i="${i}" maxlength="12" autocomplete="off" enterkeyhint="next">`;
    const b = li.querySelector('input');
    b.value = vals[i] ?? ''; b.placeholder = '—'; b.setAttribute('aria-label', `${t('results')} ${i + 1}`);
    // quick fill tint on the whole card: team colour, gold spotlight, red for penalty / biggest payer
    const tone = !S.preset ? '' : S.preset === 'team' ? COLORS[S.teamOf[i]] : isBig(i) ? isBad() ? '#ff4d5e' : '#ffd54a' : '';
    if (tone) { li.classList.add('hi'); li.style.setProperty('--c', tone); }
    // quick fill shows the board glyph over the field; focusing it brings the text back for editing
    if (S.preset) li.insertAdjacentHTML('beforeend', `<span class="gl" aria-hidden="true">${glyph(i)}</span>`);
    return li;
  }));
  $('#count').value = S.n;
  $('#minus').disabled = S.n <= 2;
  $('#plus').disabled = S.n >= MAX;
  markPresets();
  document.querySelectorAll('[data-height]').forEach(b => b.setAttribute('aria-pressed', b.dataset.height === S.height));
  // touch screens can't hover: spell out the chosen height under the row (buttons already announce it)
  $('#heightTip').innerHTML = $(`[data-height="${S.height}"] .tip`).innerHTML.replace('\n', ' · ');
  // preset sub-row: how many winners / penalties / 1st places / 0% slots / teams (2 players leaves no real choice),
  // plus the bill total
  const counts = range(S.n - 1).map(i => i + 1);
  const [key, opts, label = key] = { win: ['winners', counts], pen: ['winners', counts, 'pens'], rank: ['firsts', counts],
    ratio: ['zeros', [null, ...range(S.n - 1)]], bill: ['zeros', [null, ...range(S.n)], 'frees'], team: ['teams', range(maxTeams() - 1).map(i => i + 2)] }[S.preset] || [];
  const kids = !key || (S.preset === 'ratio' && S.n < 3) || opts.length < 2 ? [] : [Object.assign(el('span', 'label'), { textContent: t(label) }), ...opts.map(v => {
    const b = Object.assign(el('button', 'pill'), { type: 'button', textContent: v ?? t('any') });
    b.setAttribute('aria-pressed', S[key] === v);
    b.onclick = () => { S[key] = v; reroll(); sfx.ui(); save(); renderEntries(); };
    return b;
  })];
  if (S.preset === 'bill') {
    const [sym, step, def] = CUR[S.cur];
    const lab = el('label', 'total'), inp = Object.assign(el('input'), { type: 'number', min: step, step, inputMode: 'numeric',
      value: S.total, placeholder: def, autocomplete: 'off' });
    inp.setAttribute('aria-label', `${t('total')} (${sym})`);
    lab.append(Object.assign(el('span', 'label'), { textContent: t('total') }), inp);
    // typing re-splits and updates the result column in place so the field keeps focus
    inp.oninput = () => {
      S.total = clamp(Math.floor(+inp.value) || 0, 0, 1e12);
      rollBill();
      const vals = presetVals();
      entries.querySelectorAll('[data-k="results"]').forEach((b, i) => b.value = vals[i]);
      entries.querySelectorAll('.gl').forEach((g, i) => g.innerHTML = glyph(i));
      save();
    };
    const curs = Object.entries(CUR).map(([c, [s]]) => {
      const b = Object.assign(el('button', 'pill cur'), { type: 'button', textContent: s });
      b.dataset.tip = t('minPay', s + CUR[c][1].toLocaleString(S.lang)); // CSS tooltip on hover / keyboard focus
      b.setAttribute('aria-label', `${c}, ${b.dataset.tip}`);
      b.setAttribute('aria-pressed', S.cur === c);
      b.onclick = () => { S.cur = c; S.total = CUR[c][2]; rollBill(); sfx.ui(); save(); renderEntries(); };
      return b;
    });
    const row = el('div', 'total-row');
    // touch screens can't hover: spell out the current currency's rule under the row instead
    const note = Object.assign(el('small', 'tip-line'), { textContent: curs.find(x => x.getAttribute('aria-pressed') === 'true').dataset.tip });
    note.setAttribute('aria-hidden', 'true'); // the buttons already announce it
    row.append(lab, ...curs, note);
    kids.unshift(row);
  }
  $('#subRow').hidden = !kids.length;
  $('#subRow').replaceChildren(...kids);
}
const markPresets = () => {
  document.querySelectorAll('[data-preset]').forEach(b => b.setAttribute('aria-pressed', !!S.preset && b.dataset.preset === S.preset));
  sfx.setMusic(S.preset); // each quick fill type has its own loop
};

entries.addEventListener('input', e => {
  const { k, i } = e.target.dataset;
  // editing a preset result turns the preset into plain custom text
  if (k === 'results' && S.preset) {
    S.results = presetVals(); S.preset = null; markPresets();
    entries.querySelectorAll('.hi').forEach(x => { x.classList.remove('hi'); x.style.removeProperty('--c'); });
    entries.querySelectorAll('.gl').forEach(x => x.remove());
  }
  S[k][i] = e.target.value;
  save();
});
// Enter walks down the results column
entries.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const { k, i } = e.target.dataset;
  const next = entries.querySelector(`[data-k="${k}"][data-i="${+i + 1}"]`);
  next ? next.focus() : e.target.blur();
});

const setCount = d => {
  S.n = clamp(S.n + d, 2, MAX);
  S.winners = clamp(S.winners, 1, S.n - 1); S.firsts = clamp(S.firsts, 1, S.n - 1); S.teams = clamp(S.teams, 2, maxTeams());
  reroll();
  sfx.ui(); save(); renderEntries();
};
$('#orderBtn').onclick = () => { shuffle(ZOO); sfx.ui(); renderEntries(); NET.sync?.(); };
$('#minus').onclick = () => setCount(-1);
$('#plus').onclick = () => setCount(1);
document.querySelectorAll('[data-height]').forEach(b => b.onclick = () => { S.height = b.dataset.height; sfx.ui(); save(); renderEntries(); });
// keep the height tooltip on screen: centred under the group, shifted by however far it would poke past an edge (8px margin)
const fitTip = e => {
  const seg = e.currentTarget, tip = e.target.closest?.('.pill')?.querySelector('.tip');
  if (!tip) return;
  const box = $('#setup'), x0 = box.getBoundingClientRect().left, x1 = x0 + box.clientWidth; // the scroller, minus its scrollbar
  const r = seg.getBoundingClientRect(), cx = r.left + r.width / 2, half = tip.offsetWidth / 2;
  seg.style.setProperty('--dx', Math.max(x0 + 8 + half - cx, Math.min(0, x1 - 8 - half - cx)) + 'px');
};
document.querySelectorAll('.seg').forEach(s => { s.addEventListener('pointerover', fitTip); s.addEventListener('focusin', fitTip); });
document.querySelectorAll('[data-preset]').forEach(b => b.onclick = () => {
  S.preset = b.dataset.preset || null;
  if (!S.preset) S.results = [];
  reroll(); // tapping again re-rolls
  sfx.ui(); save(); renderEntries();
});

$('#startBtn').onclick = () => act({ t: 'start' });
$('#editBtn').onclick = () => act({ t: 'edit' });

// ---------- ladder board ----------
const cv = $('#cv'), cx = cv.getContext('2d');
const stat = el('canvas'), sx = stat.getContext('2d'); // rails + mist, redrawn on resize only
const trail = el('canvas'), tx = trail.getContext('2d'); // finished paths, drawn once each
const cvTop = $('#cvTop'), ctop = cvTop.getContext('2d'); // over the SVG: animals riding the carousel's front half
const holeSvg = $('#hole'), holeBack = $('#holeBack'); // wormholes: SVG so their flow runs on CSS/SMIL, not the canvas loop; lines sit behind the ladder canvas, mouths in front
const G = { n: 0, ladder: null, traces: [], done: new Set(), at: {}, active: [], touch: new Set(), parts: [], fx: [], timers: [], raf: 0, last: 0, ext: 0, grow: 0 };
const PAD = 6, PEEK = 3; // PEEK: seconds to study the middle band before players pick their spots
// board code is lane-indexed; G.order maps lane -> player (-1 = not picked yet)
const NEUTRAL = '#c8c0ff'; // unpicked spots, and orbs climbing up from a result
const col = c => G.order[c] >= 0 ? pc(G.order[c]) : NEUTRAL;
const who = (c, short) => G.order[c] >= 0 ? nameOf(G.order[c], short) : '?'; // HTML
const whoText = c => G.order[c] >= 0 ? animalName(G.order[c]) : '?';
let W = 0, H = 0, DPR = 1;
// canvas resolution cap: 2x (3x phones gain nothing visible); frame() lowers it for the session on a phone that
// can't keep up. ponytail: one-way, never climbs back; add a recovery step if a device ever gets stuck low wrongly
let dprCap = 2;
// camera: screen = board * (zx, zy) + (x, y). A solo run zooms in (more down the rails than across) and follows
// its runner; eases back out when it lands. Folded into px, not a canvas scale, so animals and mouths stay round
const cam = { zx: 1, zy: 1, x: 0, y: 0 };

const px = ([c, v]) => [(c + 0.5) * W / G.n * cam.zx + cam.x, (PAD + v * (H - 2 * PAD)) * cam.zy + cam.y];
const pan = x => (x / W) * 1.6 - 0.8;
const rgba = (h, a) => `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},${a})`;

function resize() {
  const r = wrap.getBoundingClientRect();
  if (!r.width || !r.height || !G.n) return;
  W = r.width; H = r.height;
  const dpr = DPR = Math.min(dprCap, window.devicePixelRatio || 1);
  for (const c of [cv, stat, trail, cvTop]) {
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); // also clears
    c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  drawStatic();
  drawTrail();
  if (!G.raf) paint();
  fit(chips); // label font follows the viewport width
}
new ResizeObserver(resize).observe(wrap);
document.fonts?.addEventListener('loadingdone', () => G.n && fit(chips)); // web font lands wider than the fallback

// finished paths; redrawn on resize and while the camera moves
function drawTrail() {
  tx.clearRect(0, 0, W, H);
  for (const i of G.done) glow(tx, G.traces[i].points.map(px), Infinity, col(i));
}

function paint() {
  cx.clearRect(0, 0, W, H);
  ctop.clearRect(0, 0, W, H);
  cx.drawImage(stat, 0, 0, W, H);
  cx.drawImage(trail, 0, 0, W, H);
}

const SEEN = [0.3, 0.7]; // rungs in this band show during the peek; the rest stay under mist
const EXT = 0.15; // the peek countdown widens the band by up to this much on each side (0.3-0.7 -> 0.15-0.85)
const LOW = 0.7; // once everyone has picked, the whole top shows; below this only rungs a path crossed show until Result is pressed
const band = () => G.pick < G.n ? [SEEN[0] - G.ext, SEEN[1] + G.ext] : [-1, LOW];
const hideAll = () => !G.shown && !G.left && G.pick < G.n; // while players pick spots the whole ladder is under mist
const seen = v => G.shown || (!hideAll() && v > band()[0] && v < band()[1]);
// eased widening: 7.5% after 1 s, 12.5% after 2 s, 15% after 3 s (p = elapsed / PEEK)
const extAt = p => EXT * p * (1.75 - 0.75 * p);
function grow(t0) {
  if (!G.left) return;
  const now = performance.now(), ext = extAt(Math.min(1, (now - t0) / (PEEK * 1000)));
  // the mist edge creeps ~30px/s: redrawing it (the costly part) ~15 times a second looks the same as every frame
  // and leaves slow phones most of each frame for everything else
  if (!(now - G.grewAt < 66)) {
    G.grewAt = now;
    G.ext = ext;
    drawStatic();
    if (!G.raf) paint();
  }
  G.grow = requestAnimationFrame(() => grow(t0));
}

// wormholes (two-way): a dim flowing line between the bottom mouth (vortex) and the top mouth (rays), arrows running both ways
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const RAYS = range(8).map(k => {
  const c = Math.cos(k * Math.PI / 4), s = Math.sin(k * Math.PI / 4);
  return `M${(c * 7).toFixed(1)} ${(s * 7).toFixed(1)}L${(c * 12).toFixed(1)} ${(s * 12).toFixed(1)}`;
}).join('');
// one colour per wormhole, shared by both its mouths, so connected mouths match and up to MAX_HOLES never look alike;
// [bottom, top] stays a pair so the mouth / streak code reads either end
const HOLE_COLORS = ['#c86bff', '#2fe3a0', '#ff5c93'];
const holeColors = k => { const c = HOLE_COLORS[k % HOLE_COLORS.length]; return [c, c]; };
const holeVars = k => `style="--hi:${holeColors(k)[0]};--ho:${holeColors(k)[1]}"`;
const mixWhite = h => '#' + [1, 3, 5].map(i => Math.round((parseInt(h.slice(i, i + 2), 16) + 255) / 2).toString(16).padStart(2, '0')).join(''); // halfway to white, for labels
// wormhole arrows: one leaves each mouth, they cross mid-line, bounce off the far mouth and come back.
// rotate="auto" follows the path's own direction (In -> Out), so the arrow is mirrored on the legs that run Out -> In
const BOUNCE = [['0;1;0', '1 1;-1 1'], ['1;0;1', '-1 1;1 1']];
let holesFor = null; // ladder whose wormholes / carousel are in the SVG; built once per ladder so the CSS animations keep running
const CHEV = '<path class="chev" d="M-3-3.6 1.8 0-3 3.6">';
function drawHole() {
  const hs = G.ladder.holes, rs = G.ladder.rings;
  for (const s of [holeSvg, holeBack]) s.toggleAttribute('hidden', !hs.length && !rs.length); // SVG has no .hidden property
  if (!hs.length && !rs.length) return;
  if (holesFor !== G.ladder) {
    holesFor = G.ladder;
    // carousel: back half of the ring behind the ladder, front half + seats + chevrons riding round in front
    // wormhole line drawn as a glass tube: wide translucent body, dark core, the flow, a thin highlight
    $('#holeLines').innerHTML = hs.map((_, k) => `<g class="wh" ${holeVars(k)}>
      <linearGradient id="hg${k}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${holeColors(k)[0]}"/><stop offset="1" stop-color="${holeColors(k)[1]}"/></linearGradient>
      <path class="tube" stroke="url(#hg${k})"/><path class="tube-in"/>
      <path id="hl${k}" class="line" stroke="url(#hg${k})"/><path class="tube-hi"/>
      ${BOUNCE.map(([pts, flip]) => `<g><animateMotion dur="4.5s" repeatCount="indefinite" rotate="auto" keyPoints="${pts}" keyTimes="0;.5;1" calcMode="spline" keySplines=".3 0 .7 1;.3 0 .7 1"><mpath href="#hl${k}"/></animateMotion>
        <path class="arrow" d="M-2.8-3 1.4 0-2.8 3"><animateTransform attributeName="transform" type="scale" values="${flip}" keyTimes="0;.5" calcMode="discrete" dur="4.5s" repeatCount="indefinite"/></path></g>`).join('')}
    </g>`).join('') + rs.map(() => '<g class="cr"><ellipse class="cr-shadow"/><path class="cr-back"/><path class="cr-inner"/></g>').join('');
    // mouths as tunnels: a throat shading dark toward a vanishing point (below for the bottom mouth, light pouring
    // up out of the top one), a bevelled rim lit from above, rings sinking in / bursting out along the tunnel axis
    $('#holes').innerHTML = hs.map((_, k) => `<g class="wh" ${holeVars(k)}>
      <radialGradient id="ht${k}" cx=".5" cy=".62" r=".6"><stop offset=".15" stop-color="#05020f"/><stop offset=".6" style="stop-color:color-mix(in srgb,var(--hi) 30%,#05020f)"/><stop offset="1" style="stop-color:color-mix(in srgb,var(--hi) 70%,#fff)"/></radialGradient>
      <radialGradient id="hs${k}" cx=".5" cy=".38" r=".6"><stop offset=".1" stop-color="#fff"/><stop offset=".55" style="stop-color:color-mix(in srgb,var(--ho) 55%,#fff)"/><stop offset="1" style="stop-color:var(--ho)" stop-opacity=".25"/></radialGradient>
      <linearGradient id="hb${k}" x2="0" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb,var(--hi) 30%,#fff)"/><stop offset=".5" style="stop-color:var(--hi)"/><stop offset="1" style="stop-color:color-mix(in srgb,var(--hi) 45%,#000)"/></linearGradient>
      <g class="mouth in"><circle class="halo" r="14"/><circle class="throat" r="11" fill="url(#ht${k})"/><circle class="ring" r="12"/><circle class="ring" r="12" style="animation-delay:-.6s"/><circle class="ring" r="12" style="animation-delay:-1.2s"/><circle class="swirl" r="7" cy="1.2"/><circle class="core" r="3.6" cy="2.6"/><circle class="rim" r="11" stroke="url(#hb${k})"/></g>
      <g class="mouth out"><circle class="halo" r="14"/><circle class="throat" r="9" fill="url(#hs${k})"/><circle class="ring" r="5"/><circle class="ring" r="5" style="animation-delay:-.7s"/><path class="rays" d="${RAYS}"/><circle class="rim" r="9" stroke="url(#hb${k})"/><circle class="core" r="3.4" cy="-1.6"/></g>
    </g>`).join('') + rs.map((r, g) => `<g class="cr"><path id="cp${g}" class="cr-track"/><path class="cr-face"/><path class="cr-front"/><path class="cr-hi"/>
      ${range(4).map(k => `${CHEV}<animateMotion dur="5.6s" begin="${-k * 1.4}s" repeatCount="indefinite" rotate="auto"><mpath href="#cp${g}"/></animateMotion><animate attributeName="opacity" values="1;1;.3;.3;1" keyTimes="0;.44;.56;.94;1" dur="5.6s" begin="${-k * 1.4}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="scale" values="1;1;.55;.55;1" keyTimes="0;.44;.56;.94;1" dur="5.6s" begin="${-k * 1.4}s" repeatCount="indefinite"/></path>`).join('')}
      ${range(r.k).map(() => '<circle class="seat" r="3.6"/>').join('')}</g>`).join('');
  }
  const xy = p => px(p).map(v => v.toFixed(1)).join(',');
  // only the part inside the visible band shows, same mist rule as the rungs
  const [y0, y1] = G.shown ? [-99, H + 99] : hideAll() ? [0, 0] : band().map(v => px([0, v])[1]);
  $('#holeBand').setAttribute('y', y0);
  $('#holeBand').setAttribute('height', Math.max(0, y1 - y0)); // board not measured yet (H < 2 PAD) flips the band
  const back = $('#holeLines').children, front = $('#holes').children;
  hs.forEach(({ a, b }, k) => {
    const [ax, ay] = px(a), [bx, by] = px(b), gr = back[k].querySelector('linearGradient');
    const d = 'M' + wave(a, b).map(xy).join('L');
    back[k].querySelectorAll('.line, [class^=tube]').forEach(p => p.setAttribute('d', d));
    Object.entries({ x1: ax, y1: ay, x2: bx, y2: by }).forEach(([n, v]) => gr.setAttribute(n, v.toFixed(1)));
    front[k].querySelector('.in').setAttribute('transform', `translate(${xy(a)})`);
    front[k].querySelector('.out').setAttribute('transform', `translate(${xy(b)})`);
    // a wormhole a path dove into is unveiled whole; the rest stay clipped to the band
    for (const g of [back[k], front[k]]) G.holeLit.has(k) ? g.removeAttribute('clip-path') : g.setAttribute('clip-path', 'url(#holeClip)');
  });
  rs.forEach((r, g) => {
    const { cx: c, rx } = ringBox(r), [mx, my] = px([c, r.y]), ax = rx * W / G.n * cam.zx, ay = RING_RY * (H - 2 * PAD) * cam.zy;
    const L = (mx - ax).toFixed(1), R = (mx + ax).toFixed(1), y = my.toFixed(1), arc = (sw, x) => `A${ax.toFixed(1)} ${ay.toFixed(1)} 0 0 ${sw} ${x} ${y}`;
    const b = back[hs.length + g], f = front[hs.length + g];
    // the ring is a band T deep: outer face on the front half, inner face showing on the back half, a soft shadow below
    const T = ay * 0.4, yT = (my + T).toFixed(1), arcT = (sw, x) => `A${ax.toFixed(1)} ${ay.toFixed(1)} 0 0 ${sw} ${x} ${yT}`;
    b.querySelector('.cr-back').setAttribute('d', `M${L} ${y}${arc(1, R)}`); // over the top
    b.querySelector('.cr-inner').setAttribute('d', `M${L} ${y}${arc(1, R)}L${R} ${yT}${arcT(0, L)}Z`);
    Object.entries({ cx: mx, cy: my + T + ay * 0.9, rx: ax * 0.92, ry: ay * 0.7 }).forEach(([n, v]) => b.querySelector('.cr-shadow').setAttribute(n, v.toFixed(1)));
    f.querySelector('.cr-face').setAttribute('d', `M${L} ${y}${arc(0, R)}L${R} ${yT}${arcT(1, L)}Z`);
    f.querySelector('.cr-front').setAttribute('d', `M${L} ${y}${arc(0, R)}`); // under the bottom
    f.querySelector('.cr-hi').setAttribute('d', `M${L} ${y}${arc(0, R)}`);
    // chevrons run the riding direction: rightward along the front, back round the top
    f.querySelector('.cr-track').setAttribute('d', r.dir > 0 ? `M${L} ${y}${arc(0, R)}${arc(0, L)}` : `M${R} ${y}${arc(1, L)}${arc(1, R)}`);
    f.querySelectorAll('.seat').forEach((s, k) => s.setAttribute('transform', `translate(${xy(seat(r, r.c0 + k))})`));
    for (const e of [b, f]) G.ringLit.has(g) ? e.removeAttribute('clip-path') : e.setAttribute('clip-path', 'url(#holeClip)');
  });
  if (reduceMotion.matches) for (const s of [holeSvg, holeBack]) { s.setCurrentTime(1.2); s.pauseAnimations(); } // arrows parked mid-line
}

// ribbed frosted-glass texture for the mist, built once (drawStatic runs every frame while the camera moves)
const FROST = (() => {
  const c = document.createElement('canvas'), g = c.getContext('2d');
  c.width = c.height = 16;
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 3;
  for (const o of [-16, 0, 16]) { g.beginPath(); g.moveTo(o, 16); g.lineTo(o + 16, 0); g.stroke(); }
  return c;
})();
// one hidden band between two rails: frosted glass with a bevelled rim, a sheen from the top-left and embossed "?"s.
// fade = 0 thickens the fog downward (bottom band), 1 upward (top band / whole ladder)
function mist(g, x0, y0, x1, y1, fade) {
  const w = x1 - x0, h = y1 - y0, r = Math.min(10, w / 2, h / 2);
  const box = new Path2D();
  box.roundRect ? box.roundRect(x0, y0, w, h, r) : box.rect(x0, y0, w, h);
  // slab depth, light from the top-left like the rails: cast shadow + a thick edge peeking out bottom / right.
  // clipped to outside the face, or they'd darken the see-through glass
  const d = clamp(w * 0.05, 2, 3.5), out = new Path2D();
  out.rect(x0 - 9, y0 - 9, w + 18, h + 18); out.addPath(box);
  g.save();
  g.clip(out, 'evenodd');
  g.translate(d * 0.9, d * 1.8); g.fillStyle = 'rgba(4,2,20,.32)'; g.fill(box);
  g.translate(-d * 0.4, -d * 0.8);
  const side = g.createLinearGradient(0, y0, 0, y1);
  side.addColorStop(0, 'rgba(120,100,220,.45)'); side.addColorStop(1, 'rgba(60,40,150,.6)');
  g.fillStyle = side; g.fill(box);
  g.restore();
  g.save();
  const gr = g.createLinearGradient(0, y0, 0, y1);
  gr.addColorStop(fade, 'rgba(150,130,255,.12)');
  gr.addColorStop(1 - fade, 'rgba(110,190,255,.28)');
  g.fillStyle = gr; g.fill(box);
  g.clip(box);
  const pat = g.createPattern(FROST, 'repeat');
  pat.setTransform?.(new DOMMatrix([1, 0, 0, 1, x0, y0])); // ribs ride with the box when the camera pans
  g.globalAlpha = 0.07; g.fillStyle = pat; g.fill(box);
  g.globalAlpha = 1;
  const sh = g.createLinearGradient(x0, y0, x0 + w * 0.8, y0 + w * 0.8); // glass sheen off the top-left corner
  sh.addColorStop(0, 'rgba(255,255,255,.16)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = sh; g.fill(box);
  g.restore();
  // rim: lit along the top, shaded along the bottom
  const rim = g.createLinearGradient(0, y0, 0, y1);
  rim.addColorStop(0, 'rgba(225,215,255,.42)'); rim.addColorStop(0.5, 'rgba(180,165,255,.14)'); rim.addColorStop(1, 'rgba(20,10,60,.4)');
  g.strokeStyle = rim; g.lineWidth = 1.2; g.stroke(box);
  // "?" every ~1.8 widths down a tall box, so some stay clear of the turn toast in the middle
  const s = Math.min(30, w * 0.5, h * 0.5);
  if (s < 8) return;
  const k = Math.max(1, Math.floor(h / (w * 1.8))), cx0 = x0 + w / 2;
  g.font = `900 ${s}px system-ui, sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  for (let j = 0; j < k; j++) {
    const y = y0 + h * (j + 0.5) / k, a = k > 1 && j % 2 ? 0.6 : 1; // alternate glyphs dimmer: reads as a pattern, not a column
    g.save(); g.translate(cx0, y);
    const q = g.createLinearGradient(0, -s / 2, 0, s / 2);
    q.addColorStop(0, `rgba(255,255,255,${0.62 * a})`); q.addColorStop(1, `rgba(190,175,255,${0.3 * a})`);
    g.lineWidth = s * 0.2; g.strokeStyle = `rgba(170,150,255,${0.1 * a})`; g.strokeText('?', 0, 0); // soft glow
    g.fillStyle = `rgba(10,4,40,${0.45 * a})`; g.fillText('?', 1, 1.6); // engraved shadow
    g.fillStyle = q; g.fillText('?', 0, 0);
    g.restore();
  }
}

// gap c's mist lifts once every secret under it (rungs, wormholes, carousel) has been walked.
// a gap that never hid anything keeps its mist: lifting it would give away that it's empty
function cleared(c) {
  const hid = (y0, y1) => !(seen(y0) && seen(y1));
  let found = 0;
  for (const row of G.ladder.grid) {
    const v = row[c];
    if (v && hid(v[0], v[1])) { if (!G.lit.has(c + ':' + v[0])) return false; found++; }
  }
  for (const [k, { a, b }] of G.ladder.holes.entries())
    if (c >= Math.min(a[0], b[0]) && c < Math.max(a[0], b[0]) && hid(b[1], a[1])) { if (!G.holeLit.has(k)) return false; found++; }
  for (const [k, r] of G.ladder.rings.entries()) // ring overhangs its outer rails: one gap of slack each side
    if (c >= r.c0 - 1 && c < r.c0 + r.k && hid(r.y - RING_RY, r.y + RING_RY)) { if (!G.ringLit.has(k)) return false; found++; }
  return found > 0;
}

function drawStatic() {
  drawHole();
  const g = sx, top = px([0, 0])[1], bot = px([0, 1])[1];
  g.clearRect(0, 0, W, H);
  // mist over the hidden top / bottom bands keeps those rungs secret
  if (!G.shown) for (let c = 0; c < G.n - 1; c++) {
    const x0 = px([c, 0])[0] + 6, x1 = px([c + 1, 0])[0] - 6;
    if (x1 < -10 || x0 > W + 10 || cleared(c)) continue; // zoomed camera: most gaps are off screen
    // the top band is empty after picking; a band panned off screen is skipped
    const bands = (hideAll() ? [[top + 4, bot - 4, 1]] : [[top + 4, px([0, band()[0]])[1] - 4, 1], [px([0, band()[1]])[1] + 4, bot - 4, 0]]).filter(([y0, y1]) => y1 > y0 && y1 > -10 && y0 < H + 10);
    for (const [y0, y1, fade] of bands) mist(g, x0, y0, x1, y1, fade);
  }
  // visible rung pieces [x0, y0, x1, y1] (diagonal rungs have y0 != y1) and the rail joints [x, y] they bolt into
  const segs = [], bolts = [];
  G.ladder.grid.forEach(row => row.forEach((v, c) => {
    if (!v) return;
    const [x0, y0] = px([c, v[0]]), [x1, y1] = px([c + 1, v[1]]), k = c + ':' + v[0];
    if ((seen(v[0]) && seen(v[1])) || G.lit.has(k)) { segs.push([x0, y0, x1, y1]); bolts.push([x0, y0], [x1, y1]); }
  }));
  // 3D look, light from the top-left: each bar = cast shadow + body + highlight + shaded underside.
  // Rungs go first so their ends tuck under the rails. Batched per layer: one stroke each, cheap per frame.
  const strokes = (list, path, style, width) => {
    g.strokeStyle = style; g.lineWidth = width;
    g.beginPath(); list.forEach(path); g.stroke();
  };
  g.lineCap = 'round';
  const rung = (dx, dy) => ([x0, y0, x1, y1]) => { g.moveTo(x0 + dx, y0 + dy); g.lineTo(x1 + dx, y1 + dy); };
  const xs = range(G.n).map(c => px([c, 0])[0]);
  const rail = dx => x => { g.moveTo(x + dx, top); g.lineTo(x + dx, bot); };
  // soft halo round every bar so untouched ones read on the dark board; a walked bar's neon trail covers it.
  // wide faint strokes, not shadowBlur: drawStatic runs every frame while the camera moves
  for (const [w, a] of [[16, 0.05], [10, 0.08]]) {
    strokes(segs, rung(0, 0), `rgba(170,150,255,${a})`, w);
    strokes(xs, rail(0), `rgba(170,150,255,${a})`, w + 1);
  }
  strokes(segs, rung(2, 3.5), 'rgba(4,2,20,.45)', 4.5);
  strokes(segs, rung(0, 0), 'rgba(176,164,240,.62)', 4.5);
  strokes(segs, rung(0, -1.2), 'rgba(255,255,255,.75)', 1.4);
  strokes(segs, rung(0, 1.6), 'rgba(40,24,96,.55)', 1.2);
  strokes(xs, rail(2.5), 'rgba(4,2,20,.4)', 5.5);
  xs.forEach((x, c) => { // body keeps the player's colour fading down the rail
    const gr = g.createLinearGradient(0, top, 0, bot);
    gr.addColorStop(0, rgba(col(c), 0.95));
    gr.addColorStop(0.14, 'rgba(200,190,255,.45)');
    gr.addColorStop(0.86, 'rgba(200,190,255,.45)');
    gr.addColorStop(1, 'rgba(255,255,255,.65)');
    strokes([x], rail(0), gr, 5.5);
  });
  strokes(xs, rail(-1.4), 'rgba(255,255,255,.6)', 1.4);
  strokes(xs, rail(1.8), 'rgba(30,16,80,.55)', 1.2);
  // bolts: a dark rim with a lit dome
  g.fillStyle = 'rgba(30,16,80,.8)';
  g.beginPath(); bolts.forEach(([x, y]) => { g.moveTo(x + 3.4, y); g.arc(x, y, 3.4, 0, 7); }); g.fill();
  g.fillStyle = 'rgba(235,230,255,.95)';
  g.beginPath(); bolts.forEach(([x, y]) => { g.moveTo(x + 1.5, y - 0.6); g.arc(x - 0.6, y - 0.6, 2.1, 0, 7); }); g.fill();
}

// neon stroke along the first `len` px of a polyline; returns the head position
function glow(g, P, len, color) {
  const p = new Path2D();
  let [hx, hy] = P[0], left = len;
  p.moveTo(hx, hy);
  for (let k = 1; k < P.length && left > 0; k++) {
    const [x, y] = P[k], d = Math.hypot(x - hx, y - hy);
    const f = d <= left ? 1 : left / d;
    hx += (x - hx) * f; hy += (y - hy) * f; left -= d;
    p.lineTo(hx, hy);
  }
  const w = clamp(W / G.n * 0.055, 2.5, 4.2);
  g.save();
  g.lineCap = g.lineJoin = 'round';
  g.strokeStyle = color;
  for (const [lw, a] of [[w * 4.2, 0.13], [w * 2.3, 0.32], [w, 1]]) { g.globalAlpha = a; g.lineWidth = lw; g.stroke(p); }
  g.globalAlpha = 0.85; g.strokeStyle = '#fff'; g.lineWidth = w * 0.35; g.stroke(p);
  g.restore();
  return [hx, hy];
}

function orb(x, y, color) {
  const r = 16, g = cx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, '#fff'); g.addColorStop(0.3, color); g.addColorStop(1, rgba(color, 0));
  cx.save();
  cx.globalCompositeOperation = 'lighter';
  cx.fillStyle = g;
  cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.fill();
  cx.restore();
}

// a player walking down rides their animal face instead of an orb. The <symbol>s are self-contained (no ids, no
// currentColor), so each becomes an <img> once, then a bitmap: drawing the SVG itself re-runs its outline filter on
// every draw (the top cost of a run on phones, worst on Safari). Not ready yet -> caller falls back to the orb.
const SPRITE_PX = 128; // largest rider (36px x 1.5 zoom x 1.16 carousel front) at 2x DPR
const sprites = {};
// hurt: the stunned face. Eyes squeezed shut (> <), a sticking plaster above one eye and a sweat drop by the other
// pupil centres [left, right] of animal z, read from its symbol
const eyes = z => [...$('#a' + z).querySelectorAll('.e [fill="#2b2140"] circle')].map(c => [+c.getAttribute('cx'), +c.getAttribute('cy')]).sort((p, q) => p[0] - q[0]);
function hurtFace(z) {
  const s = $('#a' + z).cloneNode(true), e = s.querySelector('.e'), [l, r] = eyes(z);
  e.insertAdjacentHTML('afterend', `<path d="M${l[0] - 1.6} ${l[1] - 1.4}L${l[0] + 1.2} ${l[1]}L${l[0] - 1.6} ${l[1] + 1.4}M${r[0] + 1.6} ${r[1] - 1.4}L${r[0] - 1.2} ${r[1]}L${r[0] + 1.6} ${r[1] + 1.4}" fill="none" stroke="#2b2140" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(${r[0] + 2.2} ${r[1] - 5}) rotate(-35)"><rect x="-3.6" y="-1.3" width="7.2" height="2.6" rx="1.3" fill="#ffdcae" stroke="#c98a5a" stroke-width=".5"/><rect x="-1.1" y="-1.3" width="2.2" height="2.6" fill="#f0b07c"/></g>
    <path d="M${l[0] - 3.4} ${l[1] - 5.2}q-1.5 2.1 0 3q1.5-.9 0-3z" fill="#8fd8ff" stroke="#2b6a9a" stroke-width=".45"/>`);
  e.remove();
  return s.innerHTML;
}
function sprite(z, hurt) {
  const key = hurt ? z + 'h' : z;
  if (!sprites[key]) {
    const img = sprites[key] = new Image();
    img.onload = () => {
      const c = el('canvas');
      c.width = c.height = SPRITE_PX;
      c.getContext('2d').drawImage(img, 0, 0, SPRITE_PX, SPRITE_PX);
      sprites[key] = c;
    };
    img.src = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${SPRITE_PX}" height="${SPRITE_PX}">${$('#ol').outerHTML}${hurt ? hurtFace(z) : $('#a' + z).innerHTML}</svg>`);
  }
  return sprites[key] instanceof HTMLCanvasElement ? sprites[key] : null;
}
range(COLORS.length).forEach(z => { sprite(z); sprite(z, true); }); // decode up front so the first run already shows faces
const riderSize = () => clamp(W / G.n * 0.34, 24, 36) * Math.min(1.5, 1 + (cam.zx - 1) / 3); // grows a little with the camera zoom
// sc / al: size and opacity (shrunk + see-through inside a wormhole, by depth on the carousel);
// behind: slipped under everything already on the canvas (rails, trails), riding the carousel's back half;
// lift 0..1: raised toward the viewer on the carousel's front half, a drop shadow under it
function rider(x, y, color, img, now, jolt = 0, squash = 0, { sc = 1, al = 1, behind = false, lift = 0 } = {}) {
  const s = riderSize() * sc, c = lift ? ctop : cx; // front half of the carousel: over its front band
  c.save();
  c.globalAlpha = al;
  // soft glow in the player's colour so the face reads on the dark board; behind, it goes under the face instead of adding over it
  const halo = () => {
    const g = c.createRadialGradient(x, y, 0, x, y, s * 0.6);
    g.addColorStop(0, rgba(color, 0.55)); g.addColorStop(1, rgba(color, 0));
    c.fillStyle = g;
    c.beginPath(); c.arc(x, y, s * 0.6, 0, 7); c.fill();
  };
  c.globalCompositeOperation = behind ? 'destination-over' : 'lighter';
  if (!behind) halo();
  if (!behind) c.globalCompositeOperation = 'source-over';
  if (lift) { c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 7 * lift; c.shadowOffsetY = 5 * lift; }
  c.translate(x, y); c.rotate(Math.sin(now / 130) * 0.14 + jolt); // little waddle, plus a wobble when bumped
  c.scale(1 + squash, 1 - squash); // squashed flat by a bump
  c.drawImage(img, -s / 2, -s / 2, s, s);
  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (behind) halo();
  c.restore();
}

// a few faint streaks flowing off the animal's back, opposite its heading; al fades them with speed
// t: the animal's own wind clock, ticking with its speed, so the streaks flow faster when it does
function wind(x, y, ang, al, t) {
  const s = riderSize();
  cx.save();
  cx.globalCompositeOperation = 'lighter';
  cx.translate(x, y); cx.rotate(ang);
  cx.strokeStyle = '#fff'; cx.lineWidth = 1.2; cx.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    const ph = (t + k * 0.37) % 1, from = s * (0.45 + ph * 0.5), off = (k - 1) * s * 0.22;
    cx.globalAlpha = al * 0.4 * (1 - ph);
    cx.beginPath(); cx.moveTo(-from, off); cx.lineTo(-from - s * 0.35 * (1 - ph * 0.5), off); cx.stroke();
  }
  cx.restore();
}

// dazed after a bump: little gold stars circling over the head on a tilted ring, the far ones smaller and dimmer
const DIZZY_FADE = 0.3; // stars linger this long after the stun ends
function dizzy(x, y, alpha, now) {
  const s = riderSize(), cy = y - s * 0.7, rx = s * 0.6, ry = s * 0.2, spin = now / 1000 * 7;
  cx.save();
  cx.globalCompositeOperation = 'lighter';
  cx.globalAlpha = alpha * 0.5;
  cx.strokeStyle = '#fff3c4'; cx.lineWidth = 1.4;
  cx.beginPath(); cx.ellipse(x, cy, rx, ry, 0, 0, 7); cx.stroke(); // faint swirl ring
  for (let k = 0; k < 3; k++) {
    const a = spin + k * 2.094, depth = (Math.sin(a) + 1) / 2, sx = x + Math.cos(a) * rx, sy = cy + Math.sin(a) * ry, r = s * (0.14 + 0.1 * depth);
    cx.globalAlpha = alpha * (0.45 + 0.55 * depth);
    cx.fillStyle = '#ffd27a';
    cx.beginPath();
    for (let p = 0; p < 10; p++) { const t = a * 2 + p * Math.PI / 5, rr = p % 2 ? r * 0.45 : r; cx.lineTo(sx + Math.cos(t) * rr, sy + Math.sin(t) * rr); }
    cx.closePath(); cx.fill();
    cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(sx, sy, r * 0.28, 0, 7); cx.fill();
  }
  cx.restore();
}

// orb inside a wormhole: a violet->cyan warp streak stretched along its heading, shedding sparks
function warpOrb(x, y, ang, color, now, [hi, ho]) {
  const pulse = 1 + 0.25 * Math.sin(now / 45);
  cx.save();
  cx.globalCompositeOperation = 'lighter';
  const h = cx.createRadialGradient(x, y, 0, x, y, 26 * pulse);
  h.addColorStop(0, rgba(ho, 0.55)); h.addColorStop(0.5, rgba(hi, 0.22)); h.addColorStop(1, rgba(hi, 0));
  cx.fillStyle = h;
  cx.beginPath(); cx.arc(x, y, 26 * pulse, 0, 7); cx.fill();
  cx.translate(x, y); cx.rotate(ang);
  const s = cx.createLinearGradient(-30, 0, 6, 0);
  s.addColorStop(0, rgba(hi, 0)); s.addColorStop(0.6, rgba(ho, 0.8)); s.addColorStop(1, '#fff');
  cx.fillStyle = s;
  cx.beginPath(); cx.ellipse(-12, 0, 18, 4.5, 0, 0, 7); cx.fill();
  cx.restore();
  for (let k = 0; k < 2; k++) {
    const a = ang + Math.PI + (Math.random() - 0.5) * 1.2, v = 40 + Math.random() * 60;
    G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0, life: 0, max: 0.35, color: k ? ho : Math.random() < 0.5 ? hi : color, r: 0.8 + Math.random() * 1.6 });
  }
}

// orb riding the carousel: gold sparks orbiting it the way the ring turns, a faint halo ring, a gold trail
function rideOrb(x, y, dir, now) {
  const spin = now / 1000 * 9 * dir;
  cx.save();
  cx.globalCompositeOperation = 'lighter';
  cx.strokeStyle = 'rgba(255,210,122,.45)'; cx.lineWidth = 1.2;
  cx.beginPath(); cx.ellipse(x, y, 18, 18 * 0.6, 0, 0, 7); cx.stroke();
  cx.fillStyle = '#ffd27a';
  cx.beginPath();
  for (let k = 0; k < 3; k++) { const a = spin + k * 2.094, sx = x + Math.cos(a) * 18, sy = y + Math.sin(a) * 18 * 0.6; cx.moveTo(sx + 2.2, sy); cx.arc(sx, sy, 2.2, 0, 7); }
  cx.fill();
  cx.restore();
  if (Math.random() < 0.6) G.parts.push({ x: x + (Math.random() - 0.5) * 6, y: y + (Math.random() - 0.5) * 6, vx: (Math.random() - 0.5) * 30, vy: -10 - Math.random() * 20, g: 0, life: 0, max: 0.45, color: Math.random() < 0.5 ? '#ffb547' : '#fff3c4', r: 0.8 + Math.random() * 1.4 });
}

const TWIST_SLOW = 0.4; // orb speed inside a wormhole / carousel, share of normal
const SLOPE_UP = 0.7, SLOPE_DOWN = 1.25; // speed on a diagonal rung climbing / dropping, share of normal
const UP_FAST = 2.5; // climbing up from a result slot: this much quicker than walking down from a player
const BACK_FAST = 0.6; // carousel back half: up to this much quicker at the very back, so the hidden stretch passes sooner

// one-shot canvas effects (twist entries, joker swap); each draws itself at progress f = 0..1
// tiny label drifting up off the spot and fading, e.g. "Wormhole!" as an orb dives in.
// Rendered once on a detached canvas: setting `font` on the on-screen canvas forces a full style recalc whenever the
// DOM is dirty (every camera frame), which cost more than the rest of the frame on phones
const LABEL_FONT = '800 11px Pretendard, system-ui, sans-serif';
const floatText = (x, y, text, color) => {
  const lab = el('canvas'), g = lab.getContext('2d');
  g.font = LABEL_FONT;
  const w = Math.ceil(g.measureText(text).width) + 8, h = 18;
  lab.width = w * DPR; lab.height = h * DPR;
  g.scale(DPR, DPR);
  g.font = LABEL_FONT; g.textAlign = 'center'; g.textBaseline = 'bottom';
  g.lineWidth = 3; g.strokeStyle = 'rgba(10,6,30,.85)'; g.lineJoin = 'round';
  g.strokeText(text, w / 2, h - 3);
  g.fillStyle = color; g.fillText(text, w / 2, h - 3);
  G.fx.push({ x, y, t: 0, dur: 1.1, draw(f) {
    const ty = this.y - 14 - 26 * (1 - (1 - f) ** 2);
    const x = clamp(this.x, 34, W - 34); // edge rails: keep the label on the board
    cx.save();
    cx.globalAlpha = f < 0.15 ? f / 0.15 : 1 - ((f - 0.15) / 0.85) ** 2;
    cx.drawImage(lab, x - w / 2, ty - h + 3, w, h);
    cx.restore();
  } });
};
const shock = (x, y, color, max, dur = 0.6) => G.fx.push({ x, y, t: 0, dur, draw(f) {
  const { x, y } = this;
  cx.save();
  cx.globalCompositeOperation = 'lighter';
  cx.globalAlpha = 1 - f;
  cx.strokeStyle = color; cx.lineWidth = 1 + 7 * (1 - f);
  cx.beginPath(); cx.arc(x, y, max * (1 - (1 - f) ** 3), 0, 7); cx.stroke();
  cx.restore();
} });
const flash = (x, y, color) => G.fx.push({ t: 0, dur: 0.4, draw(f) {
  const g = cx.createRadialGradient(x, y, 0, x, y, Math.max(W, H));
  g.addColorStop(0, rgba(color, 0.35 * (1 - f))); g.addColorStop(1, rgba(color, 0));
  cx.save(); cx.globalCompositeOperation = 'lighter'; cx.fillStyle = g; cx.fillRect(0, 0, W, H); cx.restore();
} });
// board darkens for a cinematic beat (fade in .3s, hold, fade out the last .5s); the DOM cards below stay bright
const dim = dur => G.fx.push({ t: 0, dur, draw(f) {
  const s = f * dur, a = 0.5 * Math.min(1, s / 0.3, (dur - s) / 0.5);
  cx.save(); cx.fillStyle = `rgba(6,3,20,${a})`; cx.fillRect(0, 0, W, H); cx.restore();
} });
// light pillar shooting off a slot along its rail as an animal lands (dir 1: up the board, -1: down), fading as it thins
const pillar = (x, y, color, dir, len) => G.fx.push({ x, y, t: 0, dur: 0.6, draw(f) {
  const { x, y } = this, h = len * (1 - (1 - f) ** 3), w = 4 + 16 * (1 - f), g = cx.createLinearGradient(0, y, 0, y - dir * h);
  g.addColorStop(0, rgba(color, 0.7 * (1 - f))); g.addColorStop(0.35, `rgba(255,255,255,${0.35 * (1 - f)})`); g.addColorStop(1, rgba(color, 0));
  cx.save(); cx.globalCompositeOperation = 'lighter'; cx.fillStyle = g;
  cx.beginPath(); cx.ellipse(x, y - dir * h / 2, w / 2, h / 2, 0, 0, 7); cx.fill();
  cx.restore();
} });
// sparks sprayed in a cone along dir (radians), no gravity: an animal kicking off its start slot
function spray(x, y, dir, color, count, speed) {
  for (let k = 0; k < count; k++) {
    const a = dir + (Math.random() - 0.5) * 1.4, s = speed * (0.4 + Math.random() * 0.6);
    G.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0, life: 0, max: 0.3 + Math.random() * 0.3, color: k % 3 ? color : '#fff', r: 1 + Math.random() * 1.8 });
  }
}
// restarts a one-shot CSS animation class on a slot
const retrigger = (e, cls, ms) => { e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls); G.timers.push(setTimeout(() => e.classList.remove(cls), ms)); };

// two orbs trade places along arcs above the result row: one high, one low so they never collide
function swapArcs(j, e, ca, cb, dur) {
  const [ax] = px([j, 1]), [bx] = px([e, 1]), y = H - 2, h = Math.min(H * 0.45, Math.abs(bx - ax) * 0.55 + 50);
  const q = (p0, c, p1, t) => [0, 1].map(i => (1 - t) ** 2 * p0[i] + 2 * (1 - t) * t * c[i] + t * t * p1[i]);
  const arcs = [[[ax, y], [(ax + bx) / 2, y - h * 2], [bx, y], ca], [[bx, y], [(ax + bx) / 2, y - h * 1.1], [ax, y], cb]];
  G.fx.push({ t: 0, dur, draw(f) {
    const u = f < 0.5 ? 2 * f * f : 1 - (2 - 2 * f) ** 2 / 2, s = Math.max(0, u - 0.28); // ease in-out, tail 28% of the arc
    cx.save();
    cx.setLineDash([3, 7]); cx.strokeStyle = `rgba(255,181,71,${0.5 * (1 - f * f)})`; cx.lineWidth = 1.6;
    for (const [p0, c, p1] of arcs) { cx.beginPath(); cx.moveTo(...p0); cx.quadraticCurveTo(...c, ...p1); cx.stroke(); }
    cx.restore();
    for (const [p0, c, p1, color] of arcs) {
      const head = glow(cx, range(13).map(k => q(p0, c, p1, s + (u - s) * k / 12)), Infinity, color);
      orb(...head, color);
      G.parts.push({ x: head[0], y: head[1], vx: (Math.random() - 0.5) * 50, vy: (Math.random() - 0.5) * 50, g: 0, life: 0, max: 0.4, color: Math.random() < 0.5 ? '#ffb547' : color, r: 1 + Math.random() * 1.6 });
    }
  } });
}

// particles start on a ring and rush into (x, y), no gravity
function implode(x, y, color, rim) {
  for (let k = 0; k < 30; k++) {
    const a = Math.random() * Math.PI * 2, r = 22 + Math.random() * 14, c = k % 3 ? color : rim;
    G.parts.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, vx: -Math.cos(a) * r * 5, vy: -Math.sin(a) * r * 5, g: 0, life: 0, max: 0.28, color: c, r: 1.2 + Math.random() * 1.8 });
  }
}

function burst(x, y, color, count, speed) {
  for (let k = 0; k < count; k++) {
    const a = Math.random() * Math.PI * 2, s = speed * (0.3 + Math.random() * 0.7);
    G.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - speed * 0.3, life: 0, max: 0.5 + Math.random() * 0.6, color, r: 1.2 + Math.random() * 2.2 });
  }
}

function confetti() {
  for (let k = 0; k < 90; k++) {
    G.parts.push({ x: Math.random() * W, y: -10 - Math.random() * 40, vx: (Math.random() - 0.5) * 80, vy: 60 + Math.random() * 160, life: 0, max: 1.8 + Math.random(), color: COLORS[k % COLORS.length], r: 3 + Math.random() * 3, spin: Math.random() * 10, flake: true });
  }
}

function drawParts(dt) {
  if (G.parts.length > 500) G.parts.splice(0, G.parts.length - 500);
  cx.save();
  for (const p of G.parts) {
    p.life += dt;
    p.vy += (p.flake ? 60 : p.g ?? 380) * dt;
    p.vx *= p.flake ? 0.99 : 0.96;
    p.x += p.vx * dt; p.y += p.vy * dt;
    cx.globalAlpha = Math.max(0, 1 - p.life / p.max);
    cx.fillStyle = p.color;
    if (p.flake) {
      cx.globalCompositeOperation = 'source-over';
      cx.fillRect(p.x - p.r, p.y - p.r / 2, p.r * 2 * Math.cos(p.life * p.spin), p.r);
    } else {
      cx.globalCompositeOperation = 'lighter';
      cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 7); cx.fill();
    }
  }
  cx.restore();
  G.parts = G.parts.filter(p => p.life < p.max);
}

// eases the camera toward the followed runner (or back to the whole board); true while still moving
function camStep(dt) {
  const f = G.follow?.p < 1 && G.follow, zx = f ? Math.max(1, G.n / 3) : 1, zy = f ? 2 : 1; // about three rails across
  const o = { ...cam }, bx = f ? (f.at[0] - cam.x) / cam.zx : 0, by = f ? (f.at[1] - cam.y) / cam.zy : 0; // runner, unzoomed
  const x = f ? clamp(W / 2 - zx * bx, W - zx * W, 0) : 0, y = f ? clamp(H / 2 - zy * by, H - zy * H, 0) : 0;
  const k = 1 - Math.exp(-dt * 5);
  cam.zx += (zx - cam.zx) * k; cam.zy += (zy - cam.zy) * k; cam.x += (x - cam.x) * k; cam.y += (y - cam.y) * k;
  const busy = !!f || Math.abs(cam.zy - zy) > 0.002 || Math.abs(cam.x - x) + Math.abs(cam.y - y) > 0.5;
  if (!busy) Object.assign(cam, { zx, zy, x, y });
  if (o.zx === cam.zx && o.zy === cam.zy && o.x === cam.x && o.y === cam.y) return busy;
  // sparks and labels already on screen ride along with the board
  const mx = v => (v - o.x) / o.zx * cam.zx + cam.x, my = v => (v - o.y) / o.zy * cam.zy + cam.y;
  for (const p of G.parts) { p.x = mx(p.x); p.y = my(p.y); }
  for (const e of G.fx) if ('x' in e) { e.x = mx(e.x); e.y = my(e.y); }
  drawStatic();
  drawTrail();
  // player / result rows pan with the rails they sit on: columns spread the full zoom, but the slots themselves
  // grow only a third of it, at most 1.2x (lane widened by zx / zl, then scaled by zl) so they don't swamp the ladder or the buttons
  const on = cam.zx !== 1, zl = Math.min(1.2, 1 + (cam.zx - 1) / 3);
  for (const l of [chips, cards]) {
    l.style.transform = on ? `translateX(${cam.x}px) scale(${zl})` : '';
    l.style.width = on ? `${100 * cam.zx / zl}%` : '';
  }
  wrap.parentElement.classList.toggle('cam', on || cam.zy !== 1);
  return busy;
}

// loop runs only while something moves; idle board costs zero frames
function frame(now) {
  const real = clamp((now - G.last) / 1000, 0, 0.05); // first frame after kick(): rAF's timestamp can predate G.last
  G.last = now;
  // smoothed frame time; held under ~26fps (not 30: iOS Low Power Mode locks to 30) -> fewer canvas pixels, 2x -> 1.5x -> 1x
  G.ft = (G.ft ?? 1 / 60) + (real - (G.ft ?? 1 / 60)) * 0.05;
  if (G.ft > 1 / 26 && dprCap > 1 && DPR > 1) { dprCap = Math.max(1, DPR - 0.5); G.ft = 1 / 60; resize(); }
  const dt = real * (G.ff ? 3 : 1); // x3 fast forward: runs, bumps, sparks and camera all on game time
  const camBusy = camStep(dt);
  paint();
  // zoomed (solo follow): same on-screen speed as unzoomed, so the trip lasts longer. Raise toward cam.zy to speed it back up
  const speed = (W + H) * 0.2;
  let lit = false; // a crossed rung or the wormhole got unveiled this frame
  const riders = []; // drawn after every path glow, so no animal sits under another's trail
  for (const a of G.active) {
    const P = a.tr.points.map(px), cum = [0];
    for (let k = 1; k < P.length; k++) cum.push(cum[k - 1] + Math.hypot(P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1]));
    // slow-mo inside a wormhole / carousel: brakes hard on the way in, eases back to full speed after
    // bumped: stands still, dazed, for the first BUMP_STUN of the bump, then eases back up to speed
    const s0 = a.tr.points[a.k], s1 = a.tr.points[a.k + 1], dy = s1 && Number.isInteger(s0[0]) && Math.abs(s1[0] - s0[0]) === 1 ? s1[1] - s0[1] : 0; // on a diagonal rung: up < 0 < down
    a.sp += ((a.bump?.t < BUMP_STUN ? 0 : a.tw ? TWIST_SLOW * (1 + BACK_FAST * Math.max(0, -(a.depth || 0))) : dy < 0 ? SLOPE_UP : dy > 0 ? SLOPE_DOWN : 1) - a.sp) * Math.min(1, dt * (a.tw || a.bump ? 8 : 3));
    a.p = Math.min(1, a.p + speed * a.sp * (a.up ? UP_FAST : 1) * dt / cum.at(-1));
    const d = a.p * cum.at(-1), q = a.tr.points;
    while (a.k < P.length - 1 && cum[a.k + 1] <= d) {
      a.k++;
      const p0 = q[a.k], p1 = q[a.k + 1];
      if (p1 && Number.isInteger(p0[0]) && Math.abs(p1[0] - p0[0]) === 1) { // entering a rung (rail to next rail; wormhole waves never step a whole rail)
        a.turn++;
        const left = p0[0] < p1[0] ? p0 : p1;
        G.lit.add(left[0] + ':' + left[1]); // lift the mist off it as the orb crosses
        lit = true;
        sfx.step(a.n + a.turn, pan(P[a.k][0]));
        burst(P[a.k][0], P[a.k][1], a.color, 8, 90);
        if (p1[1] !== p0[1]) floatText(P[a.k][0], P[a.k][1], t(p1[1] < p0[1] ? 'climb' : 'slide'), mixWhite(a.color));
      }
      for (const w of a.tr.warps) {
        if (a.k === w.at) { // diving in: particles get sucked into the vortex
          G.holeLit.add(w.hole);
          lit = true;
          liveFx(w.hole, true);
          shock(P[a.k][0], P[a.k][1], holeColors(w.hole)[0], 34, 0.5);
          floatText(P[a.k][0], P[a.k][1], t('wormhole'), mixWhite(holeColors(w.hole)[0]));
          sfx.warp(q[a.k + 1][1] < q[a.k][1], pan(P[a.k][0]));
          implode(P[a.k][0], P[a.k][1], a.color, holeColors(w.hole)[0]);
          try { navigator.vibrate?.(14); } catch { /* not allowed in iframe */ }
        }
        if (a.k === w.out) { burst(P[a.k][0], P[a.k][1], holeColors(w.hole)[1], 22, 210); burst(P[a.k][0], P[a.k][1], a.color, 14, 150); liveFx(w.hole, false); floatText(P[a.k][0], P[a.k][1], t('out'), mixWhite(holeColors(w.hole)[1])); } // popping out
      }
      for (const w of a.tr.rides) {
        if (a.k === w.at) { // boarding the carousel: it clicks round one notch
          G.ringLit.add(w.ring);
          lit = true;
          sfx.spin(a.n, pan(P[a.k][0]));
          burst(P[a.k][0], P[a.k][1], '#ffb547', 10, 120);
          const g = $('#holes').children[G.ladder.holes.length + w.ring];
          g.classList.remove('kick'); void g.getBoundingClientRect(); g.classList.add('kick');
          liveFx(G.ladder.holes.length + w.ring, true);
          shock(P[a.k][0], P[a.k][1], '#ffb547', 34, 0.5);
          floatText(P[a.k][0], P[a.k][1], t('carousel'), '#ffd27a');
        }
        if (a.k === w.out) { burst(P[a.k][0], P[a.k][1], '#ffd27a', 16, 170); liveFx(G.ladder.holes.length + w.ring, false); floatText(P[a.k][0], P[a.k][1], t('out'), '#fff3c4'); }
      }
    }
    const head = glow(cx, P, d, a.color), inside = w => a.k >= w.at && a.k < w.out, warp = a.tr.warps.find(inside), ride = a.tr.rides.find(inside);
    a.tw = !!(warp || ride);
    if (warp) riders.push(() => warpOrb(...head, Math.atan2(P[a.k + 1][1] - P[a.k][1], P[a.k + 1][0] - P[a.k][0]), a.color, now, holeColors(warp.hole)));
    // walking down: the player's animal; climbing up stays an anonymous orb (the player is still a secret),
    // and so does a slot nobody picked before "Result" (no animal yet; order -1)
    const img = !a.up && G.order[a.i] >= 0 && sprite(ZOO[G.order[a.i]]);
    a.head = img && head; // only animals bump; anonymous up-orbs pass through
    a.at = head; // camera target
    // carousel depth: -1 at the back of the ring, 1 at the front (the ring runs y +- RING_RY round its centre line)
    const rr = ride && G.ladder.rings[ride.ring], depth = rr ? clamp((head[1] - px([0, rr.y])[1]) / (RING_RY * (H - 2 * PAD) * cam.zy), -1, 1) : 0, behind = depth < 0;
    a.depth = depth; // next frame's speed
    // inside a wormhole: a bit smaller and see-through; on the carousel: bigger in front, smaller and dimmer at the back
    const ease = Math.min(1, dt * 10);
    a.sc = (a.sc ?? 1) + ((warp ? 0.7 : 1 + 0.16 * depth) - (a.sc ?? 1)) * ease;
    a.al = (a.al ?? 1) + ((warp ? 0.6 : 1 + 0.3 * Math.min(0, depth)) - (a.al ?? 1)) * ease;
    riders.push(() => {
      if (img) {
        let [bx, by] = head, jolt = 0, squash = 0;
        if (a.bump) { // knocked back off the path, then springs home with a wobble; the path itself never changes
          const b = a.bump, f = (b.t += dt) / BUMP_DUR, k = Math.exp(-4 * f) * Math.sin(Math.PI * 3 * f); // damped spring
          if (f >= 1) a.bump = null;
          else {
            bx += b.dx * k * riderSize() * 0.9; by += b.dy * k * riderSize() * 0.9;
            jolt = Math.sign(b.dx || 1) * k * 0.8;
            squash = 0.35 * Math.exp(-7 * f) * Math.cos(Math.PI * 4 * f); // flattened on impact, jiggles back
          }
        }
        const dazed = a.bump && a.bump.t < BUMP_STUN + DIZZY_FADE, j = Math.min(a.k, P.length - 2);
        if (!warp && !behind) wind(bx, by, Math.atan2(P[j + 1][1] - P[j][1], P[j + 1][0] - P[j][0]), a.sp * a.al, a.wind = (a.wind || 0) + dt * a.sp / 0.26);
        rider(bx, by, a.color, dazed && sprite(ZOO[G.order[a.i]], true) || img, now, jolt, squash, { sc: a.sc, al: a.al, behind, lift: Math.max(0, depth) });
        if (dazed) dizzy(bx, by, Math.min(1, a.bump.t / 0.08, (BUMP_STUN + DIZZY_FADE - a.bump.t) / DIZZY_FADE), now);
      } else orb(...head, a.color);
      if (ride && !(img && behind)) rideOrb(...head, G.ladder.rings[ride.ring].dir * (a.up ? -1 : 1), now);
    });
    if (a.p >= 1) land(a);
  }
  riders.forEach(f => f());
  if (lit) drawStatic();
  bumps();
  G.active = G.active.filter(a => a.p < 1);
  if (!G.active.length) sfx.duck(false);
  for (const f of G.fx) { f.t = Math.min(f.dur, f.t + dt); f.draw(f.t / f.dur); }
  G.fx = G.fx.filter(f => f.t < f.dur);
  drawParts(dt);
  G.raf = G.active.length || G.parts.length || G.fx.length || camBusy ? requestAnimationFrame(frame) : 0;
  if (!G.raf) document.body.classList.remove('busy');
}

// two animals meeting on the ladder bump each other: both recoil apart and wobble, then carry on along their own paths.
// a pair re-arms only after they separate, so passing through each other bumps once, not every frame
const BUMP_DUR = 1.1, BUMP_STUN = 0.4; // seconds: whole bump, standing-still part
function bumps() {
  const s = riderSize(), R = G.active.filter(a => a.head && a.p < 1);
  for (const a of R) for (const b of R) {
    if (a.i >= b.i) continue;
    const dx = a.head[0] - b.head[0], dy = a.head[1] - b.head[1], d = Math.hypot(dx, dy), key = a.i + ':' + b.i;
    if (d > s * 1.1) { G.touch.delete(key); continue; }
    if (d > s * 0.75 || G.touch.has(key)) continue;
    G.touch.add(key);
    const ux = d > 0.5 ? dx / d : 1, uy = d > 0.5 ? dy / d : 0; // dead-on overlap: push sideways
    a.bump = { dx: ux, dy: uy, t: 0 }; a.sp = 0;
    b.bump = { dx: -ux, dy: -uy, t: 0 }; b.sp = 0;
    const mx = (a.head[0] + b.head[0]) / 2, my = (a.head[1] + b.head[1]) / 2;
    burst(mx, my, '#fff3c4', 10, 140);
    shock(mx, my, '#fff3c4', s * 0.8, 0.3);
    floatText(mx, my - s * 0.55, t('stun'), '#ffd27a'); // one label for the pair, above the dizzy stars
    sfx.bump(pan(mx));
    try { navigator.vibrate?.(10); } catch { /* not allowed in iframe */ }
  }
}

// an orb inside wormhole / carousel k (index into the SVG groups): it flares while ridden
const liveFx = (k, on) => [$('#holeLines'), $('#holes')].forEach(s => s.children[k]?.classList.toggle('live', on));

function kick() {
  if (G.raf) return;
  G.last = performance.now();
  G.raf = requestAnimationFrame(frame);
  document.body.classList.add('busy'); // idle hops / blinks hold still while the board animates (style.css)
}

function stop() {
  G.timers.forEach(clearTimeout);
  G.timers = [];
  cancelAnimationFrame(G.raf);
  cancelAnimationFrame(G.grow);
  G.raf = 0;
  document.body.classList.remove('busy');
  G.active = [];
  sfx.duck(false);
  G.touch.clear();
  G.parts = [];
  G.fx = [];
  G.follow = null;
  Object.assign(cam, { zx: 1, zy: 1, x: 0, y: 0 });
  for (const l of [chips, cards]) l.style.transform = l.style.width = '';
  wrap.parentElement.classList.remove('cam');
  $('#jkToast').hidden = true;
  document.querySelectorAll('.hole .live').forEach(g => g.classList.remove('live'));
}

// up: climb from the result back to the player, the same path walked backwards
// solo: started on its own (chip / result card tap), so the camera zooms in and follows it
function go(i, up, solo, quiet) {
  if (G.done.has(i) || G.active.some(a => a.i === i)) return;
  const t0 = G.traces[i], last = t0.points.length - 1;
  const flip = ws => ws.map(w => ({ ...w, at: last - w.out, out: last - w.at }));
  const tr = up ? { ...t0, points: [...t0.points].reverse(), warps: flip(t0.warps), rides: flip(t0.rides) } : t0;
  // climbing up keeps the player secret until the orb arrives: neutral colour, only the result lit,
  // and notes keyed to the result lane instead of the player's
  const n = up ? t0.end : i;
  const a = { i, tr, up, n, color: up ? NEUTRAL : col(i), p: 0, k: 0, turn: 0, sp: 1, tw: false, at: px(tr.points[0]) };
  G.active.push(a);
  sfx.duck(true); // BGM dips while animals run
  if (solo && !reduceMotion.matches) G.follow = a;
  (up ? cards.children[t0.end] : chips.children[i]).classList.add('run'); // .run plays the slot's crouch-and-spring
  // launch: a ring off the slot and sparks kicked out the way the animal heads
  const [sx, sy] = px(tr.points[0]);
  shock(sx, sy, a.color, 30, 0.45);
  spray(sx, sy, up ? -Math.PI / 2 : Math.PI / 2, a.color, 18, 260);
  if (!quiet) sfx.go(n, pan(sx));
  update();
  kick();
}

function land(a) {
  const e = a.tr.end, big = isBig(e), [x, y] = px(a.tr.points.at(-1));
  G.done.add(a.i);
  G.at[e] = a.i;
  a.color = col(a.i); // an up-climb shows its true colour only on arrival
  glow(tx, a.tr.points.map(px), Infinity, a.color);
  markChip(a.i);
  markCard(e);
  burst(x, y + (a.up ? 4 : -4), a.color, big ? 70 : 34, big ? 320 : 200);
  // impact: ring off the slot, a light pillar back up the rail, the slot slammed down and bouncing back
  shock(x, y, a.color, big ? 64 : 40, 0.6);
  pillar(x, y, a.color, a.up ? -1 : 1, H * (big ? 0.45 : 0.28));
  retrigger(a.up ? chips.children[a.i] : cards.children[e], 'hit', 650);
  if (big) confetti();
  sfx.land(big, pan(x), big && isBad());
  try { navigator.vibrate?.(big ? [30, 50, 80] : 18); } catch { /* not allowed in iframe */ }
  update();
  if (G.done.size === G.n && !G.shown) reveal(); // every path known: nothing left to hide
  if (G.done.size === G.n) G.timers.push(setTimeout(G.joker >= 0 ? joker : finish, 1000));
}
const finish = () => { $('#jkToast').hidden = true; sfx.fanfare(); openSummary(); };

// Joker: whoever landed on the joker card trades results with one other player. A spotlight runs round the
// other cards, slowing down, and stops on the one picked. The drawn paths stay; only the results change hands.
// The pick (G.jkE) is rolled with the board, see roll().
function joker() {
  const j = G.joker, ring = range(G.n).filter(x => x !== j), e = G.jkE;
  // the spotlight laps every other card, at least ~16 steps, then on to the pick
  const steps = Math.ceil(16 / ring.length) * ring.length + ring.indexOf(e) + 1;
  cards.children[j].classList.add('armed');
  // toast mid-board: joker holder on the left, whoever the spotlight is on at the right, locking on the pick
  const toast = $('#jkToast'), pair = (l, r) => $('#jkPair').innerHTML = `${l}<span class="sw">⇄</span>${r}`;
  const pop = () => { toast.classList.remove('pop'); void toast.offsetWidth; toast.classList.add('pop'); };
  // slot-machine reel on the right: each step the next name rolls down into the window, blurred while it spins fast,
  // overshooting into place on the last one
  let prev = '?';
  const roll = (name, ms, last) => {
    const s = $('#jkPair .jk-reel > span');
    s.innerHTML = `<i>${name}</i><i>${prev}</i>`; prev = name;
    s.style.animationDuration = `${ms}ms`;
    s.classList.toggle('fast', ms < 160);
    s.classList.toggle('last', last);
    s.classList.remove('roll'); void s.offsetWidth; s.classList.add('roll');
  };
  // title: "Joker swap!", turning to STAYING! / LUCKY SWAP! / UNLUCKY SWAP! on landing (data-i18n keeps it on language switch)
  const title = key => { const n = toast.querySelector('b span'); n.dataset.i18n = key; n.textContent = t(key); };
  title('joker');
  toast.style.setProperty('--c', '#ffb547');
  pair(who(G.at[j]), '<span class="jk-reel"><span><i>?</i></span></span>');
  toast.classList.remove('lock', 'stamp');
  toast.classList.add('spin');
  toast.hidden = false;
  pop();
  const gap = k => 70 + 520 * (k / steps) ** 2.6; // last few steps crawl (~0.6s each) so the pick lands with weight
  let at = 0;
  for (let k = 0; k < steps; k++) {
    at += gap(k);
    G.timers.push(setTimeout(() => {
      const x = ring[k % ring.length], last = k === steps - 1;
      [...cards.children].forEach((c, i) => c.classList.toggle('spot', i === x));
      roll(who(G.at[x]), last ? 520 : Math.min(gap(k + 1) * 0.9, 420), last);
      sfx.spot(k);
    }, at));
  }
  // cinematic beat: lock on, board dims, both cards lift and hold while the snare roll builds (HOLD);
  // then the two players fly across on slow arcs (FLY), land as the IV chord hits, cards flash
  const HOLD = 0.9, FLY = 1.3, FLASH = 1100; // FLASH = .res.swap animation length (ms)
  G.timers.push(setTimeout(() => {
    const a = G.at[j], b = G.at[e];
    toast.classList.replace('spin', 'lock');
    for (const x of [j, e]) { cards.children[x].classList.remove('spot', 'armed'); cards.children[x].classList.add('lift'); }
    dim(HOLD + FLY + 0.6);
    kick();
    sfx.swap(HOLD + FLY);
    G.timers.push(setTimeout(() => {
      swapArcs(j, e, col(a), col(b), FLY);
      kick();
    }, HOLD * 1000));
    G.timers.push(setTimeout(() => {
      G.traces[a].end = e; G.traces[b].end = j; // the summary reads results from here
      G.at[j] = b; G.at[e] = a;
      G.swapped = [a, b];
      update();
      for (const x of [j, e]) {
        const c = cards.children[x], [bx, by] = px([x, 1]), cc = col(G.at[x]);
        c.classList.remove('lift', 'swap'); void c.offsetWidth; c.classList.add('swap');
        G.timers.push(setTimeout(() => markCard(x), FLASH * 0.4)); // new owner shows at the flash's peak
        shock(bx, by - 2, '#ffb547', 70); shock(bx, by - 2, cc, 44, 0.45);
        burst(bx, by - 4, cc, 36, 280); burst(bx, by - 4, '#ffd27a', 24, 220);
      }
      // the picked card wears the joker badge too, so both ends of the trade stay marked
      cards.children[e].classList.add('joker');
      cards.children[e].insertAdjacentHTML('beforeend', '<svg class="ic jk" aria-hidden="true"><use href="#i-joker"/></svg>');
      flash(...px([(j + e) / 2, 1]), '#ffb547');
      pair(who(b), who(a)); // traded places
      // verdict for the joker holder, now on e: same result both ends = the outcome didn't move; gaining the big slot
      // (or dodging it when big is bad: penalty / biggest bill) = lucky; the reverse = unlucky; anything else stays "Joker swap!"
      const v = resultOf(j) === resultOf(e) ? 'stay' : isBig(e) === isBig(j) ? '' : isBig(e) !== isBad() ? 'lucky' : 'unlucky';
      if (v) {
        const TONE = { stay: '#ffd27a', lucky: '#ffd54a', unlucky: '#ff4d5e' }, other = { stay: 'stay', lucky: 'unlucky', unlucky: 'lucky' }[v];
        title(v);
        toast.style.setProperty('--c', TONE[v]);
        toast.classList.add('stamp');
        // each card floats its new owner's side of the trade
        for (const [x, k] of [[e, v], [j, other]]) { const [bx, by] = px([x, 1]); floatText(bx, by - 20, t(k), TONE[k]); }
      }
      pop();
      kick();
      try { navigator.vibrate?.([20, 40, 60]); } catch { /* not allowed in iframe */ }
      G.timers.push(setTimeout(finish, 2200)); // let the new owners sink in before the summary
    }, (HOLD + FLY) * 1000));
  }, at + 350));
}

function markChip(i) {
  const b = chips.children[i];
  b.classList.remove('run');
  b.classList.add('done');
  b.disabled = true;
}

// quick fill: the landed animal shows bigger and dressed for its result (#x-* in index.html, drawn in the animal's
// 32x32 space; the wider viewBox leaves room for hats and props). Penalty plays a bomb that blows up and leaves soot.
const ol = (id, tint) => `<use href="#x-${id}" filter="url(#ol)"${tint ? ` style="color:${tint}"` : ''}/>`;
const dress = e => {
  const p = S.preset, big = isBig(e);
  if (p === 'win') return big ? ol('crown') : '';
  if (p === 'pen') return big ? '<g class="bomb"><use href="#g-pen" x="6" y="-14" width="20" height="20"/></g><g class="blast"><use href="#x-blast"/></g><g class="soot"><use href="#x-soot"/></g>' : '';
  if (p === 'rank') return place(e) <= 3 ? ol('cup', MEDAL[place(e) - 1]) : '';
  if (p === 'team') return ol('hat', COLORS[S.teamOf[e]]);
  return p === 'bill' && big ? ol('cash') : '';
};
// mood on a landed quick fill card: the trophy, 1st place and the smallest bill cheer; the bomb cries
const moodOf = e => {
  const p = S.preset;
  if (p === 'win') return isBig(e) ? ' win' : '';
  if (p === 'rank') return place(e) === 1 ? ' win' : '';
  if (p === 'pen') return isBig(e) ? ' cry' : '';
  return p === 'bill' && share(e) === Math.min(...range(S.n).map(share)) ? ' win' : ''; // ties all cheer
};
// two drops per eye, taking turns (style.css .tear)
const tears = z => eyes(z).map(([x, y]) => [0, 0.6].map(d => `<path class="tear" style="animation-delay:${1.3 + d + (x > 16) * 0.3}s" d="M${x} ${y + 1.4}q-1.3 1.9 0 2.8q1.3-.9 0-2.8z" fill="#8fd8ff" stroke="#2b6a9a" stroke-width=".4"/>`).join('')).join('');
const pet = (c, e) => {
  const z = ZOO[G.order[c]], mood = moodOf(e);
  return `<svg class="pet${S.preset === 'pen' && isBig(e) ? ' boom' : ''}${mood}" style="${blinkVars()}" viewBox="-6 -10 44 44" aria-hidden="true"><use href="#a${z}" width="32" height="32"/>${dress(e)}${mood === ' cry' ? tears(z) : ''}</svg>`;
};

function markCard(e) {
  const card = cards.children[e], i = G.at[e];
  card.style.setProperty('--c', col(i));
  card.querySelector('small').innerHTML = S.preset && G.order[i] >= 0 ? pet(i, e) : who(i, true);
  card.classList.remove('run');
  card.classList.add('on');
  card.classList.toggle('big', isBig(e));
}

function renderLanes() {
  play.style.setProperty('--n', G.n);
  chips.replaceChildren(...range(G.n).map(i => {
    const b = el('button', 'chip');
    b.type = 'button';
    b.style.setProperty('--i', i);
    b.onclick = () => act({ t: 'chip', i });
    return b;
  }));
  paintChips();
  cards.replaceChildren(...range(G.n).map(e => {
    const d = el('button', 'res'), b = el('b'), s = el('small');
    d.type = 'button';
    d.style.setProperty('--i', e); // idle hop stagger
    d.onclick = () => act({ t: 'card', e });
    if (S.preset) { b.className = 'gl'; b.innerHTML = glyph(e); } else b.textContent = resultOf(e);
    // ratio: the card itself is the gauge, filled from the bottom to the share
    if (S.preset === 'ratio') { d.classList.add('gauge'); d.style.setProperty('--r', S.ratio[e]); }
    d.append(b, s);
    if (e === G.joker) { d.classList.add('joker'); d.insertAdjacentHTML('beforeend', '<svg class="ic jk" aria-hidden="true"><use href="#i-joker"/></svg>'); }
    return d;
  }));
  G.done.forEach(markChip);
  Object.keys(G.at).forEach(e => markCard(+e));
  G.active.forEach(a => (a.up ? cards.children[a.tr.end] : chips.children[a.i]).classList.add('run'));
  fit(chips);
}
// chip state (colour, face, enabled) on the existing buttons: a pick touches these, not a rebuild of both rows
function paintChips() {
  const picking = G.pick < G.n;
  [...chips.children].forEach((b, i) => {
    const open = G.order[i] < 0, name = whoText(i);
    // empty spots wear the colour of the player whose turn it is
    b.style.setProperty('--c', open && picking && !G.left ? pc(G.pick) : col(i));
    b.classList.toggle('slot', open);
    if (b.title !== name) { b.innerHTML = who(i, true); b.title = name; b.setAttribute('aria-label', name); }
    b.disabled = G.left > 0 || (picking && !open);
  });
}
// player chips: one width per row, the widest label's (emoji chips stay small), centred on the rail
const fit = lane => {
  lane.style.setProperty('--w', 'max-content');
  const w = Math.max(...[...lane.children].map(c => c.offsetWidth)); // transforms (land/bob) don't count
  lane.style.setProperty('--w', w ? w + 1 + 'px' : ''); // +1: offsetWidth rounds 69.2 down and clips. 0 = board hidden, renderLanes runs again on Start
};

function update() {
  const all = G.done.size === G.n;
  const picking = !G.left && G.pick < G.n;
  $('#allBtn').hidden = G.shown || G.pick < G.n;
  $('#ffBtn').hidden = G.pick < G.n || all;
  $('#randBtn').hidden = !picking || G.pick > 0; // only before P1 picks
  // a result can be climbed once spots are set and someone still unplayed lands there
  [...cards.children].forEach((c, e) => c.disabled = G.pick < G.n ||
    !G.traces.some((tr, i) => tr.end === e && !G.done.has(i) && !G.active.some(a => a.i === i)));
  $('#sumBtn').hidden = !all;
  $('#peek').hidden = !G.left;
  $('#peekN').textContent = G.left;
  // whose turn it is sits mid-board (the ladder is all mist while picking); pops on each new player
  const turn = $('#turn');
  turn.hidden = !picking;
  if (picking && turn.dataset.p !== String(G.pick)) {
    turn.dataset.p = G.pick;
    turn.style.setProperty('--c', pc(G.pick));
    $('#turnName').innerHTML = nameOf(G.pick);
    // pop in again: a script animation needs no forced layout / style flush to restart, unlike re-adding a CSS class
    turn.animate({ opacity: [0, 1] }, { duration: 250, easing: 'ease-out' });
  }
  if (!picking) delete turn.dataset.p;
}

// everything random about a new board, rolled once on the host so watching phones replay the same one
function roll() {
  const [scale, tilt, holes, ring, jokerChance, either] = HEIGHTS[S.height];
  // result card that swaps its player at the end; none when every result reads the same (the swap would change nothing)
  const joker = Math.random() < jokerChance && new Set(range(S.n).map(resultOf)).size > 1 ? Math.floor(Math.random() * S.n) : -1;
  // the card it trades with: uniform over every other card, same result or not, so the joker stays fair (each player keeps 1/n).
  // ponytail: picking only cards with a different result made the holder of a "Pass" joker always take the lone "WIN!"
  const others = range(S.n).filter(x => x !== joker);
  return { ladder: makeLadder(S.n, Math.random, holes, scale, tilt, ring, either), joker, jkE: others[Math.floor(Math.random() * others.length)] };
}

function newGame({ ladder, joker, jkE }) {
  stop();
  G.n = S.n;
  G.ladder = ladder;
  G.joker = joker;
  G.jkE = jkE;
  G.swapped = null;
  G.traces = range(G.n).map(i => trace(G.ladder, i));
  G.done = new Set();
  G.at = {};
  G.shown = false;
  G.lit = new Set(); // hidden rungs a played path crossed, as 'col:y' (y on the left rail)
  G.holeLit = new Set(); // wormholes unveiled by a path diving in, by index
  G.ringLit = new Set(); // same for the carousel
  G.order = Array(G.n).fill(-1);
  G.pick = 0;
  G.left = PEEK;
  G.ext = 0;
  setFF(false);
  const bar = $('#peek');
  bar.style.setProperty('--t', PEEK + 's');
  bar.classList.remove('run');
  void bar.offsetWidth; // restart the countdown bar
  bar.classList.add('run');
  for (let s = 1; s <= PEEK; s++) G.timers.push(setTimeout(() => { G.left = PEEK - s; if (!G.left) { G.ext = EXT; renderLanes(); drawStatic(); if (!G.raf) paint(); } update(); }, s * 1000));
  renderLanes();
  resize();
  update();
  grow(performance.now());
}

// players claim top spots one by one, in setup order
function pick(i) {
  G.order[i] = G.pick++;
  sfx.go(G.order[i], pan(px([i, 0])[0]));
  paintChips(); // no fit(): a face and a "?" both sit on the chip's 52px floor, so the row width can't change
  drawStatic(); // rail tops take the player's colour
  if (!G.raf) paint();
  update();
}

function newLadder(m) {
  if (summary.open) summary.close();
  sfx.shuffle();
  wrap.classList.remove('shake');
  void wrap.offsetWidth; // restart the CSS animation
  wrap.classList.add('shake');
  newGame(m);
}

$('#newBtn').onclick = () => act({ t: 'new' });
// each tick seats the next player on a random free spot -> a uniformly random placement
$('#randBtn').onclick = () => {
  for (let k = 0; k < G.n; k++) G.timers.push(setTimeout(() => {
    const open = range(G.n).filter(c => G.order[c] < 0);
    if (open.length) act({ t: 'chip', i: open[Math.floor(Math.random() * open.length)] });
  }, k * 160));
};
function reveal() {
  G.shown = true;
  drawStatic();
  if (!G.raf) paint();
  update();
}
$('#allBtn').onclick = () => act({ t: 'all' });
// x3 fast forward (frame() scales its game time); off again on every new board
function setFF(on) { G.ff = on; $('#ffBtn').setAttribute('aria-pressed', on); }
$('#ffBtn').onclick = () => act({ t: 'ff', on: !G.ff });

// ---------- summary ----------
function openSummary() {
  // best result first (ratio: biggest share), custom results keep the entered order
  const order = range(G.n).sort((a, b) => slotRank(G.traces[a].end) - slotRank(G.traces[b].end));
  const jk = i => G.swapped?.includes(i) ? '<svg class="ic jk"><use href="#i-joker"/></svg>' : '';
  // teams: one card per team, its name on top and the members as chips underneath
  if (S.preset === 'team') return showSummary(range(S.teams).map(tm => {
    const members = order.filter(i => S.teamOf[G.traces[i].end] === tm), li = el('li', 'team');
    li.style.setProperty('--c', COLORS[tm]);
    li.style.setProperty('--i', tm);
    li.innerHTML = `<span class="tn"><i class="gl" aria-hidden="true">${glyph(G.traces[members[0]].end)}</i>${t('team', String.fromCharCode(65 + tm))}</span>`
      + `<div class="mem">${members.map(i => `<b style="--c:${col(i)}">${who(i)}${jk(i)}</b>`).join('')}</div>`;
    return li;
  }));
  showSummary(order.map((i, k) => {
    const e = G.traces[i].end, big = isBig(e), li = el('li', big ? isBad() ? 'big bad' : 'big' : '');
    li.style.setProperty('--c', col(i));
    li.style.setProperty('--i', k);
    li.innerHTML = `<span>${big ? `<svg class="ic crown"><use href="#i-${isBad() ? 'skull' : 'crown'}"/></svg>` : ''}<b></b></span><svg class="ic"><use href="#i-arrow"/></svg><span></span>`;
    li.querySelector('b').innerHTML = who(i) + jk(i);
    li.lastChild.textContent = resultOf(e);
    return li;
  }));
}
function showSummary(rows) {
  $('#sumList').replaceChildren(...rows);
  if (!summary.open) summary.showModal();
}
$('#sumBtn').onclick = () => { sfx.ui(); openSummary(); };
$('#closeBtn').onclick = () => { sfx.ui(); summary.close(); };
$('#replayBtn').onclick = () => act({ t: 'new' });
summary.addEventListener('click', e => {
  const r = summary.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) summary.close();
});

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
  input.parentElement.style.setProperty('--f', v / 100); // % tip rides the thumb
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
  document.querySelectorAll('[data-i18n-tip]').forEach(n => {
    const raw = t(n.dataset.i18nTip); // our own strings, so the markup -> HTML swap is safe
    n.setAttribute('aria-description', raw.replace(/\[\w:([^\]]*)\]/g, '$1'));
    n.querySelector('.tip').innerHTML = raw.replace(/\[(\w):([^\]]*)\]/g, '<b class="k-$1">$2</b>');
  });
  $('#startBtn').dataset.watch = t('watching');
  renderEntries();
  if (G.n) { renderLanes(); update(); }
  if (summary.open) openSummary();
}
// tap cycles EN → 한국어 → 日本語 → EN
$('#lang').onclick = () => {
  const L = Object.keys(LANG_NAME);
  S.lang = L[(L.indexOf(S.lang) + 1) % L.length];
  save(); applyI18n();
};

// ---------- phone link ----------
// Host + watchers: the host plays as usual; other phones join to watch its game live and can't change anything.
// Every host action is a small message that watching phones replay through the same code (ACT): the randomness
// (board, joker trade, random picks) is rolled on the host and travels in the message; the animation runs locally.
// Setup edits stream as the shared part of S. A phone joining mid-game gets a snapshot.
// ponytail: a late joiner restarts paths still running on the host from their start, and misses the joker badge on
// the card that was already traded; everything that decides a result is exact
const ACT = {
  start: m => { sfx.go(0, 0); setup.hidden = true; play.hidden = false; newGame(m); },
  edit: () => { sfx.ui(); stop(); play.hidden = true; setup.hidden = false; },
  new: newLadder,
  chip: ({ i }) => G.pick < G.n ? pick(i) : go(i, false, true),
  card: ({ e }) => G.traces.forEach((tr, i) => tr.end === e && go(i, true, true)),
  all: () => {
    G.follow = null; // everyone runs: back to the whole board
    reveal();
    // everyone leaves at once; one launch chord, not n arpeggios piled into a cluster
    let first = true;
    for (let i = 0; i < G.n; i++) if (!G.done.has(i) && !G.active.some(a => a.i === i)) { go(i, false, false, !first); first = false; }
  },
  ff: ({ on }) => { setFF(on); sfx.ui(); },
};
const hosting = () => Coop.role === 'host' && Coop.live;
function act(m) {
  if (NET.mine) return; // watching: only the host drives (the controls are inert as well)
  if (m.t === 'start' || m.t === 'new') Object.assign(m, roll(), shared());
  ACT[m.t](m);
  if (hosting()) Coop.send(m);
}
// setup that travels: everything in S but this phone's own language and volume
const shared = () => {
  const { lang, music, musicV2, sfx: fx, ...s } = S;
  return { s, zoo: [...ZOO] };
};
// several saves in one tick (a preset tap re-rolls and saves) go out as one message
NET.sync = () => {
  if (!hosting() || NET.queued) return;
  NET.queued = true;
  queueMicrotask(() => { NET.queued = false; Coop.send({ t: 'S', ...shared() }); });
};
const snapshot = () => ({ t: 'sync', ...shared(), on: !play.hidden, g: play.hidden || !G.ladder ? null : {
  ladder: G.ladder, joker: G.joker, jkE: G.jkE, order: G.order, pick: G.pick, left: G.left, at: G.at, shown: G.shown, ff: G.ff,
  swapped: G.swapped, done: [...G.done], lit: [...G.lit], holeLit: [...G.holeLit], ringLit: [...G.ringLit],
  ends: G.traces.map(tr => tr.end), active: G.active.map(a => [a.i, a.up]),
} });
function syncTo({ on, g }) {
  stop();
  if (summary.open) summary.close();
  setup.hidden = on; play.hidden = !on;
  if (!g) return;
  newGame(g);
  if (!g.left) { // peek already over on the host
    G.timers.forEach(clearTimeout); G.timers = [];
    cancelAnimationFrame(G.grow);
    G.left = 0; G.ext = EXT;
  }
  Object.assign(G, { order: g.order, pick: g.pick, at: g.at, shown: g.shown, swapped: g.swapped,
    done: new Set(g.done), lit: new Set(g.lit), holeLit: new Set(g.holeLit), ringLit: new Set(g.ringLit) });
  g.ends.forEach((e, i) => G.traces[i].end = e);
  setFF(g.ff);
  renderLanes(); drawStatic(); drawTrail();
  if (!G.raf) paint();
  update();
  g.active.forEach(([i, up]) => go(i, up, false, true));
  if (G.done.size === G.n && G.joker >= 0 && !G.swapped) joker(); // joker beat still to come
}
// watching: this phone's own setup parked, the host's controls inert, Replay gone
function watch(on) {
  if (!!NET.mine === on) return;
  if (on) NET.mine = JSON.parse(JSON.stringify(S));
  else {
    Object.assign(S, NET.mine, { lang: S.lang, music: S.music, sfx: S.sfx });
    NET.mine = null;
    stop();
    if (summary.open) summary.close();
    play.hidden = true; setup.hidden = false;
    renderEntries();
  }
  document.body.classList.toggle('watching', on);
  document.querySelectorAll('#setup .panel, #startBtn, #chips, #cards, #randBtn, #editBtn, #newBtn, #allBtn, #ffBtn, #replayBtn').forEach(e => e.inert = on);
}
const linkOpts = {
  game: 'ladder', watch: true, max: 15, lang: () => S.lang,
  onStart(n, me) {
    document.body.classList.add('linked');
    if (me) watch(true);
    else Coop.send(snapshot()); // phones that joined before Continue
  },
  onJoin(i) { if (Coop.live) Coop.sendTo(i, snapshot()); }, // joined mid-game
  onMsg(m) {
    if (!NET.mine) return; // not started yet: the host sends a snapshot on Continue
    if (m.s) { Object.assign(S, m.s); ZOO.splice(0, ZOO.length, ...m.zoo); renderEntries(); }
    if (m.t === 'sync') syncTo(m);
    else ACT[m.t]?.(m);
  },
  onLeave() { if (summary.open) summary.close(); }, // the "host left" notice must not sit under the modal dialog
  onMenu() { document.body.classList.remove('linked'); watch(false); },
};
document.querySelectorAll('.link-btn').forEach(b => b.onclick = () => { sfx.ui(); Coop.open(linkOpts); });

// ---------- boot ----------
// audio may only start from a user gesture (autoplay policy); init() is idempotent and resumes iOS-interrupted contexts
const unlock = () => { sfx.init(); sfx.startMusic(); };
addEventListener('pointerdown', unlock, true);
addEventListener('keydown', unlock, true);
document.addEventListener('visibilitychange', () => sfx.pause(document.hidden));

setVol('music', S.music);
setVol('sfx', S.sfx);
applyI18n();

// boot splash (index.html): up 1.4s at least so the banner registers, lifted once it has loaded (3s at most, from page
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
