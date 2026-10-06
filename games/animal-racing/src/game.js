// Animal Racing: I18N, persisted settings, screen flow, menus, lobby, results and the main loop.
import * as sfx from './audio.js';
import * as world from './world.js';
import * as input from './input.js';
import { buildTrack, newRace, newKart, advance, tooSoon, cpu, GP_ORDER, gpPoints, reverseGrid, billSplit, teamSplit, teamScores } from './sim.js';
import { TRACKS as TRACK_DEFS } from './tracks.js';

const DEBUG = new URLSearchParams(location.search).has('debug');

// animal k = SVG symbol #a{k} in index.html, accent COLORS[k] (kart paint, trail, UI tab, minimap dot, P-tag)
export const COLORS = ['#ff5d8f', '#4fd8ff', '#ffb547', '#b98bff', '#5dffb0', '#ff7a5c', '#7c9cff', '#ffe45e', '#ff9de6', '#9dff5d',
  '#2ee6d6', '#ff4766', '#d6c8ff', '#d89a6a', '#8f6bff', '#e45cff', '#e8eef8', '#ffc0a0', '#5db8ff', '#ff9a3d'];
const MEDAL = ['#ffd54a', '#dfe3f5', '#e8955a']; // 1st-3rd, then violet
const animal = names => n => names[n - 1];

const I18N = {
  en: {
    title: 'Animal Racing', tagline: 'Let the race decide.', start: 'Start', settings: 'Settings', back: 'Back', next: 'Next', done: 'Done',
    chooseMode: 'Choose a mode', quick: 'Quick Race', quickSub: 'One track, one race', gp: 'Grand Prix', gpSub: 'All 4 tracks, most points wins',
    speed: 'Speed class', chill: 'Chill', normal: 'Normal', turbo: 'Turbo', tipHelp: 'What do the speed classes mean?',
    tipSpeed: '[s:Chill] Relaxed karts, CPUs go easy\n[c:Normal] The classic race\n[j:Turbo] Fast karts, sharp CPUs',
    tipChill: 'Chill: relaxed karts, CPUs go easy', tipNormal: 'Normal: the classic race', tipTurbo: 'Turbo: fast karts, sharp CPUs',
    stakes: 'Party Stakes', stakesSub: 'Let the finishing order settle a prize, a penalty or the bill',
    pickRacer: 'Pick your racer', join: 'Press A / Enter / Tap to join', random: 'Random',
    pickTrack: 'Pick a track', race: 'Race!', results: 'Results', rematch: 'Rematch', change: 'Change racers', toTitle: 'Title',
    paused: 'Paused', pausedBy: '{n} paused the race', resume: 'Resume', restart: 'Restart', quit: 'Quit',
    laps: 'Laps', racers: 'Racers', rotate: 'Turn your device sideways to race', soon: 'This track is still being built!',
    lap: 'Lap', finalLap: 'FINAL LAP!', go: 'GO!', wrongWay: 'WRONG WAY', finish: 'FINISH!',
    bomb: 'Bomb', bubble: 'Bubble', dash: 'Lucky Dash', joker: 'Joker', lucky: 'LUCKY SWAP!', unlucky: 'UNLUCKY SWAP!',
    ready: 'Ready!', reconnect: "Reconnect {n}'s controller", layout: 'Split screen', lAuto: 'Auto', lTb: 'Top / bottom', lSbs: 'Side by side', tilt: 'Tilt steering', saver: 'Battery saver', standings: 'Standings',
    pWin: 'Winner', pPen: 'Penalty', pRank: 'Rank', pTeam: 'Teams', pBill: 'Bill', winners: 'Winners', pens: 'Penalties', firsts: '1st places', total: 'Total', teams2: 'Two teams, everyone racing counts', billNote: 'Only players pay; last place pays the most',
    win: 'WIN!', lose: 'Pass', pen: 'Penalty', safe: 'Safe', team: 'Team {n}', summary: 'Results', close: 'Close', nextTrack: 'Next track', standings: 'Standings', champion: 'Grand Prix Champion!', pts: '{n} pts', raceOf: 'Race {n} of 4', newGp: 'New Grand Prix', less: 'Fewer', more: 'More',
    install: 'Install app', iosInstall: 'Install: tap Share, then Add to Home Screen',
    quality: 'Quality', qAuto: 'Auto', qHigh: 'High', qMed: 'Medium', qLow: 'Low',
    splash: 'SPLASH!', aBrake: 'Brake', aItem: 'Use item', aDrift: 'Drift',
    jokerGo: 'JOKER!', dashGo: 'LUCKY DASH!',
    miniTurbo: 'MINI-TURBO!', startBoost: 'ROCKET START!', trick: 'TRICK!', dnf: 'Still racing',
    stun: 'STUN!', wormhole: 'Wormhole!', carousel: 'Carousel!',
    tToy: 'Toy Diorama Speedway', tStory: 'Storybook Meadow', tNeon: 'Neon Arcade Circuit', tFest: 'Festival Night',
    sToy: 'Easy · a toy track at night', sStory: 'Technical · a sunny meadow', sNeon: 'Fastest · floating in space', sFest: 'Finale · lotus lantern festival',
    player: animal(['Rabbit', 'Penguin', 'Tiger', 'Cat', 'Panda', 'Fox', 'Dog', 'Lion', 'Bear', 'Frog', 'Koala', 'Pig', 'Mouse', 'Monkey', 'Owl', 'Chick', 'Cow', 'Sheep', 'Raccoon', 'Hamster']),
    kart: animal(['Carrot Rocket', 'Ice Sled', 'Stripe Striker', 'Cat Cruiser', 'Bamboo Buggy', 'Blaze Tail', 'Doghouse Wagon', 'Royal Chariot', 'Honey Pot', 'Lily Pad', 'Gum Log', 'Piggy Bank', 'Cheese Wedge', 'Banana Boat', 'Night Owl', 'Egg Cracker', 'Moo Truck', 'Cloud Puff', 'Trash Bandit', 'Wheel Runner']),
    rank: n => n + (['st', 'nd', 'rd'][n - 1] || 'th'),
    music: 'Music', bgm: 'BGM', fx: 'EFFECT', sfx: 'Sound effects', volume: 'Volume', lang: 'Language',
    link: 'Phone link', waitHost: 'Waiting for the host…', you: 'You',
  },
  ko: {
    title: '동물 레이싱', tagline: '레이스로 정하자!', start: '시작', settings: '설정', back: '뒤로', next: '다음', done: '완료',
    chooseMode: '모드 선택', quick: '빠른 레이스', quickSub: '트랙 하나로 한 판 승부', gp: '그랑프리', gpSub: '4개 트랙 합산 점수로 우승',
    speed: '속도 클래스', chill: '느긋', normal: '보통', turbo: '터보', tipHelp: '속도 클래스 설명',
    tipSpeed: '[s:느긋] 여유로운 속도, CPU도 살살\n[c:보통] 기본 레이스\n[j:터보] 빠른 카트, 강한 CPU',
    tipChill: '느긋: 여유로운 속도, CPU도 살살', tipNormal: '보통: 기본 레이스', tipTurbo: '터보: 빠른 카트, 강한 CPU',
    stakes: '내기 모드', stakesSub: '골인 순서로 상품, 벌칙, 정산을 정해요',
    pickRacer: '레이서 선택', join: 'A / Enter / 탭으로 참가', random: '랜덤',
    pickTrack: '트랙 선택', race: '레이스!', results: '결과', rematch: '다시 하기', change: '레이서 변경', toTitle: '타이틀',
    paused: '일시정지', pausedBy: '{n}가 레이스를 멈췄어요', resume: '계속하기', restart: '처음부터', quit: '그만하기',
    laps: '랩 수', racers: '레이서 수', rotate: '기기를 가로로 돌려 주세요', soon: '아직 공사 중인 트랙이에요!',
    lap: '랩', finalLap: '마지막 랩!', go: '출발!', wrongWay: '역주행', finish: '골인!',
    bomb: '폭탄', bubble: '버블', dash: '행운 대시', joker: '조커', lucky: 'Lucky!', unlucky: 'Unlucky!',
    ready: '준비 완료!', reconnect: '{n} 컨트롤러를 다시 연결해 주세요', layout: '화면 분할', lAuto: '자동', lTb: '위 / 아래', lSbs: '왼쪽 / 오른쪽', tilt: '기울여서 조종', saver: '배터리 절약', standings: '순위',
    pWin: '당첨', pPen: '벌칙', pRank: '순위', pTeam: '팀', pBill: '정산', winners: '당첨 수', pens: '벌칙 수', firsts: '1등 수', total: '총액', teams2: '두 팀으로 나눠 모든 레이서 점수 합산', billNote: '플레이어만 내요. 꼴찌가 가장 많이 내요',
    win: '당첨!', lose: '꽝', pen: '벌칙', safe: '통과', team: '{n}팀', summary: '결과', close: '닫기', nextTrack: '다음 트랙', standings: '종합 순위', champion: '그랑프리 우승!', pts: '{n}점', raceOf: '{n} / 4 레이스', newGp: '새 그랑프리', less: '줄이기', more: '늘리기',
    install: '앱 설치', iosInstall: '설치: 공유 버튼 → 홈 화면에 추가',
    quality: '그래픽 품질', qAuto: '자동', qHigh: '높음', qMed: '보통', qLow: '낮음',
    splash: '풍덩!', aBrake: '브레이크', aItem: '아이템 사용', aDrift: '드리프트',
    jokerGo: '조커!', dashGo: '행운 대시!',
    miniTurbo: '미니 터보!', startBoost: '로켓 스타트!', trick: '트릭!', dnf: '주행 중',
    stun: '기절!', wormhole: '웜홀!', carousel: '회전목마!',
    tToy: '장난감 디오라마 스피드웨이', tStory: '동화책 들판', tNeon: '네온 아케이드 서킷', tFest: '축제의 밤',
    sToy: '쉬움 · 밤의 장난감 트랙', sStory: '테크니컬 · 햇살 가득한 들판', sNeon: '최고 속도 · 우주에 뜬 트랙', sFest: '피날레 · 연등 축제',
    player: animal(['토끼', '펭귄', '호랑이', '고양이', '판다', '여우', '강아지', '사자', '곰', '개구리', '코알라', '돼지', '생쥐', '원숭이', '부엉이', '병아리', '젖소', '양', '라쿤', '햄스터']),
    kart: animal(['당근 로켓', '얼음 썰매', '줄무늬 스트라이커', '냥냥 크루저', '대나무 버기', '불꽃 꼬리', '개집 왜건', '왕의 전차', '꿀단지', '연잎 카트', '유칼립투스 통나무', '돼지 저금통', '치즈 조각', '바나나 보트', '한밤 부엉이', '깨진 달걀', '음매 트럭', '구름 뭉치', '쓰레기통 도둑', '쳇바퀴 러너']),
    rank: '{n}등',
    music: '음악', bgm: '배경음', fx: '효과음', sfx: '효과음', volume: '볼륨', lang: '언어',
    link: '폰 연결', waitHost: '호스트를 기다리는 중…', you: '나',
  },
  ja: {
    title: 'どうぶつレーシング', tagline: 'レースで決めよう！', start: 'スタート', settings: '設定', back: '戻る', next: '次へ', done: '完了',
    chooseMode: 'モードを選ぶ', quick: 'クイックレース', quickSub: '1コースで一発勝負', gp: 'グランプリ', gpSub: '全4コースの合計ポイントで勝負',
    speed: 'スピードクラス', chill: 'のんびり', normal: 'ふつう', turbo: 'ターボ', tipHelp: 'スピードクラスの説明',
    tipSpeed: '[s:のんびり] ゆったり走行、CPUもやさしい\n[c:ふつう] 定番のレース\n[j:ターボ] 速いカート、手ごわいCPU',
    tipChill: 'のんびり: ゆったり走行、CPUもやさしい', tipNormal: 'ふつう: 定番のレース', tipTurbo: 'ターボ: 速いカート、手ごわいCPU',
    stakes: 'パーティー賭け', stakesSub: 'ゴール順で賞品・罰ゲーム・割り勘を決めよう',
    pickRacer: 'レーサーを選ぶ', join: 'A／Enter／タップで参加', random: 'ランダム',
    pickTrack: 'コースを選ぶ', race: 'レース！', results: '結果', rematch: 'もう一度', change: 'レーサー変更', toTitle: 'タイトル',
    paused: '一時停止', pausedBy: '{n}が一時停止しました', resume: '再開', restart: 'やり直す', quit: 'やめる',
    laps: '周回数', racers: 'レーサー数', rotate: '端末を横向きにしてね', soon: 'このコースはまだ工事中！',
    lap: 'ラップ', finalLap: 'ファイナルラップ！', go: 'GO！', wrongWay: '逆走中', finish: 'ゴール！',
    bomb: 'ボム', bubble: 'バブル', dash: 'ラッキーダッシュ', joker: 'ジョーカー', lucky: 'Lucky!', unlucky: 'Unlucky!',
    ready: '準備OK！', reconnect: '{n}のコントローラーをつなぎ直してね', layout: '画面分割', lAuto: '自動', lTb: '上 / 下', lSbs: '左 / 右', tilt: '傾けて操作', saver: 'バッテリー節約', standings: '順位',
    pWin: '当たり', pPen: '罰ゲーム', pRank: '順位', pTeam: 'チーム', pBill: '割り勘', winners: '当たり数', pens: '罰ゲーム数', firsts: '1位数', total: '合計', teams2: '2チームに分かれて全員のポイントを合計', billNote: 'プレイヤーだけが払う。最下位がいちばん多く払う',
    win: '当たり！', lose: 'はずれ', pen: '罰ゲーム', safe: 'セーフ', team: 'チーム{n}', summary: '結果', close: '閉じる', nextTrack: '次のコース', standings: '総合順位', champion: 'グランプリ優勝！', pts: '{n}点', raceOf: '第{n}レース / 4', newGp: '新しいグランプリ', less: '減らす', more: '増やす',
    install: 'アプリをインストール', iosInstall: 'インストール: 共有 → ホーム画面に追加',
    quality: '画質', qAuto: '自動', qHigh: '高', qMed: '中', qLow: '低',
    splash: 'ドボン！', aBrake: 'ブレーキ', aItem: 'アイテムを使う', aDrift: 'ドリフト',
    jokerGo: 'ジョーカー！', dashGo: 'ラッキーダッシュ！',
    miniTurbo: 'ミニターボ！', startBoost: 'ロケットスタート！', trick: 'トリック！', dnf: '走行中',
    stun: 'ピヨピヨ！', wormhole: 'ワームホール！', carousel: '回転木馬！',
    tToy: 'おもちゃジオラマ・スピードウェイ', tStory: '絵本の草原', tNeon: 'ネオンアーケード・サーキット', tFest: '祭りの夜',
    sToy: 'かんたん · 夜のおもちゃコース', sStory: 'テクニカル · 晴れの草原', sNeon: '最速 · 宇宙に浮かぶコース', sFest: 'フィナーレ · 蓮灯籠まつり',
    player: animal(['ウサギ', 'ペンギン', 'トラ', 'ネコ', 'パンダ', 'キツネ', 'イヌ', 'ライオン', 'クマ', 'カエル', 'コアラ', 'ブタ', 'ネズミ', 'サル', 'フクロウ', 'ヒヨコ', 'ウシ', 'ヒツジ', 'アライグマ', 'ハムスター']),
    kart: animal(['キャロットロケット', 'アイスそり', 'しましまストライカー', 'ネコクルーザー', 'バンブーバギー', 'ブレイズテイル', '犬小屋ワゴン', 'ロイヤルチャリオット', 'ハニーポット', 'ハスの葉カート', 'ユーカリ丸太', 'ブタの貯金箱', 'チーズウェッジ', 'バナナボート', 'ナイトオウル', 'われたタマゴ', 'モーモートラック', 'もこもこクラウド', 'ゴミ箱どろぼう', '回し車ランナー']),
    rank: '{n}位',
    music: '音楽', bgm: 'BGM', fx: '効果音', sfx: '効果音', volume: '音量', lang: '言語',
    link: 'スマホ接続', waitHost: 'ホストを待っています…', you: 'あなた',
  },
};

// ---------- state ----------
const KEY = 'animal-racing.v1';
const saved = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (v, ok, def) => ok.includes(v) ? v : def;
const navLang = (navigator.language || 'en').slice(0, 2);
const qLang = new URLSearchParams(location.search).get('lang'); // ArcadeDeck passes its page language; a saved choice wins
const S = {
  lang: I18N[saved.lang] ? saved.lang : I18N[qLang] ? qLang : I18N[navLang] ? navLang : 'en',
  music: saved.music ?? 50,
  sfx: saved.sfx ?? 80,
  mode: pick(saved.mode, ['quick', 'gp'], 'quick'),
  speed: pick(saved.speed, ['chill', 'normal', 'turbo'], 'normal'),
  stakes: !!saved.stakes,
  laps: pick(saved.laps, [2, 3, 5], 3),
  racers: pick(saved.racers, [4, 6, 8], 6),
  track: pick(saved.track, ['toy', 'story', 'neon', 'fest'], 'toy'),
  lobby: Array.isArray(saved.lobby) ? saved.lobby.filter(k => k >= 0 && k < COLORS.length).slice(0, 4) : [], // animal per joined slot, rematch = one press
  layout: pick(saved.layout, ['auto', 'tb', 'sbs'], 'auto'),
  tier: pick(saved.tier, ['auto', 'high', 'medium', 'low'], 'auto'), // pinned quality tier, or auto (adaptive)
  stake: pick(saved.stake, ['win', 'pen', 'rank', 'team', 'bill'], 'win'), // Party Stakes preset
  winners: pick(saved.winners, [1, 2, 3], 1), // Winner / Penalty: how many
  firsts: pick(saved.firsts, [1, 2, 3], 1), // Rank: how many share 1st
  cur: saved.cur, total: Number.isFinite(saved.total) && saved.total > 0 ? saved.total : 0, // Bill
  tilt: !!saved.tilt,
  saver: !!saved.saver, // Battery saver: every loop capped at 30 fps
  wins: Number.isInteger(saved.wins) && saved.wins > 0 ? saved.wins : 0, // races won against CPUs, offline (ArcadeDeck score)
};
if (!S.lobby.length) S.lobby = [0];
// bill currencies (Ladder CUR): symbol, step (every amount is a multiple of it), default total
const CUR = { USD: ['$', 5, 100], KRW: ['₩', 1000, 50000], JPY: ['¥', 100, 5000] };
if (!CUR[S.cur]) S.cur = { ko: 'KRW', ja: 'JPY' }[S.lang] || 'USD';
if (!S.total) S.total = CUR[S.cur][2];
const money = v => CUR[S.cur][0] + v.toLocaleString(S.lang); // ponytail: whole amounts only, no cents
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* sandboxed iframe */ } };

const t = (k, n) => {
  const v = I18N[S.lang][k] ?? I18N.en[k];
  return typeof v === 'function' ? v(n) : String(v).replace('{n}', n);
};
const range = n => Array.from({ length: n }, (_, i) => i);
const $ = s => document.querySelector(s);
// the open dialog, if any: a live list of the few <dialog>s, as the frame loops ask every frame (a 'dialog[open]'
// selector scanned the whole page, every SVG symbol included, each time)
const DLGS = document.getElementsByTagName('dialog');
const openDlg = () => { for (const d of DLGS) if (d.open) return d; return null; };
const el = (tag, cls, html) => Object.assign(document.createElement(tag), { className: cls || '', innerHTML: html || '' });
const face = (k, i = 0) => `<svg class="ani" style="--i:${i}" aria-hidden="true"><use href="#a${k}"/></svg>`;
// menu faces blink from one timer, three at a time (1 in 3 a double blink, like Ladder): each visible face blinks every
// few seconds, and the page only re-lays out while a blink actually runs (style.css .blink)
const noMotion = matchMedia('(prefers-reduced-motion: reduce)');
setInterval(() => {
  if (document.hidden || noMotion.matches) return;
  const faces = [...document.querySelectorAll('.zoo .ani, .parade .ani, .slot .ani')].filter(f => f.checkVisibility?.() ?? true);
  for (let n = 0; n < 3 && faces.length; n++) {
    const f = faces[Math.random() * faces.length | 0], c = Math.random() < 0.33 ? 'blink2' : 'blink';
    if (f.classList.contains('blink') || f.classList.contains('blink2')) continue;
    f.classList.add(c);
    setTimeout(() => f.classList.remove(c), 500);
  }
}, 1000);

const BANNERS = document.documentElement.dataset.banners.split(" "); // banner art that exists (index.html)
// the four tracks in Grand Prix order; banner art may be missing, the card then shows its gradient
const TRACKS = [
  { id: 'toy', name: 'tToy', sub: 'sToy', banner: 'toy-diorama', c: '#ffb547', bg: 'radial-gradient(60% 50% at 70% 30%, #ffd27a55, transparent), linear-gradient(160deg, #3a1a6e, #2a1a5e 55%, #120a2a)' },
  { id: 'story', name: 'tStory', sub: 'sStory', banner: 'storybook', c: '#ff8a5c', bg: 'radial-gradient(50% 40% at 30% 30%, #ffffffaa, transparent), linear-gradient(170deg, #fbf3e2, #f5c8d8 55%, #b9a6e0)' },
  { id: 'neon', name: 'tNeon', sub: 'sNeon', banner: 'neon-arcade', c: '#ff5d8f', bg: 'radial-gradient(40% 40% at 70% 40%, #4fd8ff55, transparent), linear-gradient(160deg, #080720, #171046 55%, #ff5d8f66)' },
  { id: 'fest', name: 'tFest', sub: 'sFest', banner: 'festival', c: '#ff6b5c', bg: 'radial-gradient(18% 25% at 78% 26%, #fff3c4, #ffd27a55 60%, transparent), linear-gradient(170deg, #1d2f5a, #12204a 60%, #c8321e88)' },
];

// phone link state (coop.js; the glue is in the "phone link" section below). role: null | 'host' | 'guest'
const NET = { role: null, me: 0, n: 0, rid: 0, race: null, mine: null, kart: -1, buf: [], pt: 0, ev: [], sent: 0, t0: 0, wait: null, waitUntil: 0, in: [], quiet: false,
  itemN: 0, inSeq: 0, inKey: '', inDisc: '', inAt: 0, bombs: [] };
const hosting = () => NET.role === 'host' && window.Coop?.live;

// ---------- screens ----------
const SCREENS = ['title', 'mode', 'lobby', 'track', 'race', 'results'];
const BACK = { mode: 'title', lobby: 'mode', track: 'lobby' };
let screen = 'title';
function show(id) {
  screen = id;
  if (id !== 'title') guard(); else if (history.state?.guard) history.back();
  SCREENS.forEach(s => { $('#' + s).hidden = s !== id; });
  document.body.dataset.screen = id;
  togglePop(false);
  ({ lobby: renderLobby, track: renderTracks, mode: renderMode })[id]?.();
  if (id === 'race') startRace();
  titleStage(id === 'title');
  if (nav.on) focusFirst();
  if (hosting()) Coop.send({ t: 'scr', s: id }); // linked phones follow to their lobby (races and results come with their data)
}
function back() {
  if (!volPop.hidden) return togglePop(false);
  const dlg = openDlg();
  if (dlg) return dlg.id === 'pauseDlg' ? resume() : dlg.close();
  if (screen === 'race') return pause('P1');
  if (NET.role === 'guest') return Coop.open(linkOpts); // lobby / results: the link dialog has Leave
  if (screen === 'results') return $('#toTitle').click(); // unload the race, like the Title button
  if (BACK[screen]) { sfx.ui(); show(BACK[screen]); }
}
$('#backBtn').onclick = back;
// Android back / iOS edge swipe: past the title one guard entry sits in the page history, so the system Back runs the
// in-app Back (a race pauses) instead of leaving the game. A steering thumb near the left edge sets it off easily
function guard() { if (!history.state?.guard) history.pushState({ guard: 1 }, ''); }
if (history.state?.guard) history.back(); // reloaded on a guarded entry
addEventListener('popstate', () => { if (screen === 'title') return; back(); if (screen !== 'title') guard(); });

// ---------- frame caps (sim.js tooSoon): races 60 on touch, uncapped on computers; the 3D behind menus 30 on touch,
// 60 on computers; Battery saver 30 everywhere ----------
const raceFps = () => S.saver ? 30 : world.touch ? 60 : 0; // 0: uncapped
const menuFps = () => S.saver || world.touch ? 30 : 60;

// ---------- title: the live diorama behind the menu (a few CPU karts racing the Toy track, reduced resolution) ----------
let demo = null, demoRaf = 0, demoLast = 0;
const demoClk = { t: 0 };
const ZOO = new URLSearchParams(location.search).has('zoo');
function titleStage(on) {
  if (!on || ZOO || SHOT) { if (demoRaf) { cancelAnimationFrame(demoRaf); demoRaf = 0; world.setDprScale(1); } document.body.classList.remove('staged'); return; }
  ensureWorld();
  if (!demo || R) { // (a race replaced the scene since)
    const T = built.toy ||= buildTrack(TRACK_DEFS.toy);
    const animals = shuffled(range(COLORS.length)).slice(0, 5);
    demo = newRace(T, { grid: false, laps: 999, seed: 5, karts: animals.map((k, i) => { const x = newKart(i, k, -1); x.color = COLORS[k]; return x; }) });
    demo.karts.forEach((k, i) => { k.s = 40 + i * 9; k.d = (i % 3 - 1) * 3; k.lap = 0; k.half = false; });
    world.loadTrack(T, demo.karts);
    world.setCinematic();
    R = null;
  }
  world.mount($('#stage'));
  world.setDprScale(0.75);
  document.body.classList.add('staged');
  if (!demoRaf) { demoLast = performance.now(); demoRaf = requestAnimationFrame(demoLoop); }
}
function demoLoop(now) {
  if (screen !== 'title') { demoRaf = 0; world.setDprScale(1); return; }
  demoRaf = requestAnimationFrame(demoLoop);
  if (tooSoon(demoClk, now, menuFps())) return;
  const raw = (now - demoLast) / 1000, dt = Math.min(0.1, raw);
  demoLast = now;
  if (openDlg() && !world.stale) return; // Settings open: hold the frame (its blurred backdrop stays still too)
  advance(demo, dt, []);
  demo.ev.length = 0;
  world.sync(demo, dt);
  world.render();
  adapt(raw, menuFps()); // the tier settles here, so the first race already loads the right props and materials
}

// ---------- install ----------
let installEvt = null;
const standalone = () => matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; $('#installBtn').hidden = false; });
addEventListener('appinstalled', () => { installEvt = null; $('#installBtn').hidden = true; });
$('#installBtn').onclick = async () => { if (!installEvt) return; installEvt.prompt(); try { await installEvt.userChoice; } catch { /* dismissed */ } installEvt = null; $('#installBtn').hidden = true; };
// iPhone / iPad Safari can't prompt: show how (Share > Add to Home Screen) until the app runs installed
if (/iP(hone|ad|od)/.test(navigator.userAgent) && !standalone()) $('#iosHint').hidden = false;

// ---------- title ----------
$('#parade').innerHTML = range(COLORS.length).map(k => face(k, k)).join('');
$('#startBtn').onclick = () => { sfx.go(0, 0); show('mode'); };
$('#setBtn').onclick = () => { renderSettings(); $('#setDlg').showModal(); };

// ---------- mode ----------
function renderMode() {
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === S.mode));
  document.querySelectorAll('[data-speed]').forEach(b => b.setAttribute('aria-pressed', b.dataset.speed === S.speed));
  $('#stakesBtn').setAttribute('aria-pressed', S.stakes);
  $('#speedTip').textContent = t({ chill: 'tipChill', normal: 'tipNormal', turbo: 'tipTurbo' }[S.speed]);
  $('#stakePanel').hidden = !S.stakes;
  document.querySelectorAll('[data-stake]').forEach(b => b.setAttribute('aria-pressed', b.dataset.stake === S.stake));
  const stepper = (key, label) => `<span class="label">${t(label)}</span><span class="stepper"><button class="icon-btn sm" type="button" data-step="${key}" data-d="-1" aria-label="${t('less')}"><svg class="ic"><use href="#i-minus"/></svg></button><output>${S[key]}</output><button class="icon-btn sm" type="button" data-step="${key}" data-d="1" aria-label="${t('more')}"><svg class="ic"><use href="#i-plus"/></svg></button></span>`;
  $('#stakeSub').innerHTML = S.stake === 'win' ? stepper('winners', 'winners') : S.stake === 'pen' ? stepper('winners', 'pens') : S.stake === 'rank' ? stepper('firsts', 'firsts')
    : S.stake === 'team' ? `<small class="note">${t('teams2')}</small>`
    : `<span class="total-row"><label class="total"><span class="label">${t('total')}</span><input id="billTotal" type="number" inputmode="numeric" min="0" step="${CUR[S.cur][1]}" value="${S.total}"></label>${Object.keys(CUR).map(c => `<button class="pill cur" type="button" data-cur="${c}" aria-pressed="${c === S.cur}">${CUR[c][0]}</button>`).join('')}</span><small class="note">${t('billNote')}</small>`;
  $('#stakePanel').dataset.stake = S.stake;
}
document.querySelectorAll('[data-stake]').forEach(b => b.onclick = () => { S.stake = b.dataset.stake; save(); renderMode(); });
$('#stakeSub').onclick = e => {
  const st = e.target.closest('[data-step]'), cu = e.target.closest('[data-cur]');
  if (st) { const k = st.dataset.step; S[k] = clamp(S[k] + +st.dataset.d, 1, 3); }
  if (cu) { S.cur = cu.dataset.cur; S.total = CUR[S.cur][2]; }
  if (st || cu) { save(); renderMode(); }
};
$('#stakeSub').oninput = e => { if (e.target.id === 'billTotal') { S.total = Math.max(0, Math.round(+e.target.value || 0)); save(); } };
document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { S.mode = b.dataset.mode; save(); renderMode(); });
document.querySelectorAll('[data-speed]').forEach(b => b.onclick = () => { S.speed = b.dataset.speed; save(); renderMode(); });
$('#stakesBtn').onclick = () => { S.stakes = !S.stakes; save(); renderMode(); };
$('#modeNext').onclick = () => show('lobby');
// keep a tooltip on screen: centred under its group, shifted by however far it would poke past an edge (8px margin)
const fitTip = e => {
  const seg = e.currentTarget, tip = e.target.closest?.('.pill')?.querySelector('.tip');
  if (!tip) return;
  const r = seg.getBoundingClientRect(), cx = r.left + r.width / 2, half = tip.offsetWidth / 2;
  seg.style.setProperty('--dx', Math.max(8 + half - cx, Math.min(0, innerWidth - 8 - half - cx)) + 'px');
};
document.querySelectorAll('.seg').forEach(s => { s.addEventListener('pointerover', fitTip); s.addEventListener('focusin', fitTip); });

// ---------- lobby: up to 4 players join with any device, each moves a cursor over the animals and locks one in ----------
// slots[p] = { dev, k (cursor animal), locked } | null. Devices: kb0 / kb1 / pad0-3 / touch0-1 / bot (?bots)
const PCOL = ['#ff5d8f', '#4fd8ff', '#ffb547', '#5dffb0']; // P1..P4 cursor colours
const DEV_ICON = { kb: 'i-keyboard', pad: 'i-gamepad', tou: 'i-touch', bot: 'i-kart', net: 'i-link' };
const slots = [null, null, null, null];
let lastMover = 0; // whose cursor the 3D preview follows
const isTouchDev = d => d?.startsWith('touch');
const isNet = s => !!s?.dev.startsWith('net'); // a seat played on a linked phone ('net1'..'net3' = guest slot)
const mySeat = () => slots.findIndex(s => s?.dev === 'net' + NET.me); // a guest's own seat
const tablet = () => matchMedia('(pointer: coarse)').matches && Math.max(innerWidth, innerHeight) >= 900;
const taken = (k, p) => slots.some((s, q) => s && q !== p && s.locked && s.k === k);
function freeAnimal(from, p, not = []) { for (let j = 0; j < COLORS.length; j++) { const k = (from + j) % COLORS.length; if (!taken(k, p) && !not.includes(k)) return k; } return from; }
function join(dev) {
  const p = slots.indexOf(null);
  if (p < 0 || slots.some(s => s?.dev === dev)) return;
  const k = freeAnimal(S.lobby[p] ?? p * 5, p);
  slots[p] = { dev, k, locked: !p && S.lobby[0] === k };
  lastMover = p;
  sfx.go(p * 2, 0);
  renderLobby();
}
function leave(p) {
  if (!slots[p]) return;
  if (p === 0 && (NET.role === 'host' || !slots.slice(1).some(Boolean))) { back(); return; } // P1 alone (or a link's host) backs out to the mode screen
  slots[p] = null;
  // close the gap so P1..Pn stay contiguous
  for (let q = p; q < 3; q++) slots[q] = slots[q + 1];
  slots[3] = null;
  sfx.ui();
  renderLobby();
}
const allReady = () => slots.some(Boolean) && slots.every(s => !s || s.locked);
function lock(p) {
  const s = slots[p];
  if (s.locked) { if (allReady()) lobbyGo(); return; }
  if (taken(s.k, p)) { sfx.bump(0); return; }
  s.locked = true;
  S.lobby[p] = s.k; save();
  sfx.ui(); world.previewSquash?.();
  renderLobby();
}
function moveCursor(p, dx, dy) {
  const s = slots[p], c = 5, n = COLORS.length;
  let x = s.k % c, y = (s.k / c) | 0;
  x = (x + dx + c) % c; y = (y + dy + n / c) % (n / c);
  s.k = y * c + x; s.locked = false; lastMover = p;
  sfx.spot(x + y);
  renderLobby();
}
// seats (host / offline), then the screen, then the linked phones' copy. Off the lobby screen it only seats and sends
function renderLobby() {
  if (NET.role !== 'guest') {
    if (!slots[0]) join(input.lastDevice.startsWith('pad') || input.lastDevice.startsWith('touch') ? input.lastDevice : 'kb0');
    if (!slots[0]) return;
    if (NET.role === 'host') for (let i = 1; i <= NET.n; i++) if (!slots.some(s => s?.dev === 'net' + i)) {
      if (!slots.includes(null)) slots[3] = null; // a linked phone's seat beats a 4th player on this screen
      join('net' + i);
    }
  }
  if (screen === 'lobby') drawLobby();
  if (hosting()) Coop.send({ t: 'lobby', slots: slots.map(s => s && [s.dev, s.k, +s.locked]) });
}
function drawLobby() {
  const guest = NET.role === 'guest';
  $('#slots').innerHTML = slots.map((s, p) => {
    if (!s) return guest ? `<div class="slot" style="--c:${PCOL[p]}"><span class="tag">P${p + 1}</span></div>`
      : `<button class="slot" type="button" data-join="${p}" style="--c:${PCOL[p]}"><span class="tag">P${p + 1}</span><span>${t('join')}</span></button>`;
    const icon = DEV_ICON[s.dev.slice(0, 3)] || 'i-keyboard', you = guest && p === mySeat();
    return `<div class="slot on${s.locked ? ' ready' : ''}${you ? ' you' : ''}" style="--c:${PCOL[p]}"><div class="srow"><span class="tag">P${p + 1}</span>
      <svg class="ic dev" aria-hidden="true"><use href="#${icon}"/></svg>${face(s.k)}<span class="nm">${t('player', s.k + 1)}</span>${you ? `<b class="you">${t('you')}</b>` : ''}
      ${s.locked ? `<svg class="ic ok" role="img" aria-label="${t('ready')}"><use href="#i-check"/></svg>` : ''}</div></div>`;
  }).join('');
  $('#zoo').innerHTML = range(COLORS.length).map(k => {
    const own = slots.map((s, p) => s && s.k === k ? p : -1).filter(p => p >= 0);
    const lockedBy = own.find(p => slots[p].locked);
    const tags = own.map(p => `<b class="ptag${slots[p].locked ? ' on' : ''}" style="--pc:${PCOL[p]}">P${p + 1}</b>`).join('');
    const ring = own.length ? `--ring:${PCOL[own[0]]}` : '';
    return `<li><button type="button" style="--c:${COLORS[k]};${ring}" data-k="${k}" aria-pressed="${lockedBy != null}" class="${own.length ? 'cur' : ''}">${face(k, k)}<span>${t('player', k + 1)}</span><span class="tags">${tags}</span></button></li>`;
  }).join('');
  $('#lobbyNext').disabled = !allReady();
  showPreview();
}
let lobbyRaf = 0, lobbyLast = 0;
const lobbyClk = { t: 0 };
function lobbyLoop(now) {
  if (screen !== 'lobby') { lobbyRaf = 0; return; }
  lobbyRaf = requestAnimationFrame(lobbyLoop);
  if (tooSoon(lobbyClk, now, menuFps()) || (openDlg() && !world.stale)) return; // under a dialog: hold (its blurred backdrop re-blurs every frame the 3D moves)
  world.renderPreview(Math.min(0.1, (now - lobbyLast) / 1000));
  lobbyLast = now;
}
function showPreview() {
  const k = slots[lastMover]?.k ?? slots[0]?.k;
  if (k == null) return; // a guest before the host's lobby arrives
  ensureWorld();
  world.mount($('#preview'));
  world.preview(k, COLORS[k]);
  $('#pvName').innerHTML = `${t('player', k + 1)}<small>${t('kart', k + 1)}</small>`; // our own strings
  $('#pvName').style.color = COLORS[k];
  if (!lobbyRaf) { lobbyLast = performance.now(); lobbyRaf = requestAnimationFrame(lobbyLoop); }
}
// per-device lobby input, every frame (called from the shared input loop)
function lobbyInput() {
  for (const dev of ['kb0', 'kb1', 'pad0', 'pad1', 'pad2', 'pad3']) {
    const e = input.edgesOf(dev), p = slots.findIndex(s => s?.dev === dev);
    if (p < 0) { if (e.confirm || e.start) join(dev); continue; }
    if (e.left) moveCursor(p, -1, 0); if (e.right) moveCursor(p, 1, 0);
    if (e.up) moveCursor(p, 0, -1); if (e.down) moveCursor(p, 0, 1);
    if (e.confirm) lock(p);
    if (e.start && allReady()) lobbyGo();
    if (e.cancel) slots[p].locked ? (slots[p].locked = false, sfx.ui(), renderLobby()) : leave(p);
  }
}
// pointer: a tap on a card is a pick, locked straight away
// a guest's pick: shown here at once, sent to the host (its lobby copy comes back with the seat locked)
function guestPick(k) {
  const p = mySeat();
  if (p < 0 || taken(k, p)) { sfx.bump(0); return; }
  Object.assign(slots[p], { k, locked: true }); lastMover = p;
  S.lobby[0] = k; save();
  Coop.send({ t: 'pick', k });
  sfx.ui(); world.previewSquash?.();
  drawLobby();
}
$('#zoo').onclick = e => {
  const b = e.target.closest('[data-k]');
  if (!b) return;
  if (NET.role === 'guest') return guestPick(+b.dataset.k);
  // a tap picks for the first player still choosing (touch players first), else re-picks for whoever moved last;
  // linked phones pick on their own screens
  const choosing = slots.findIndex(s => s && !s.locked && isTouchDev(s.dev)), open = slots.findIndex(s => s && !s.locked && !isNet(s));
  const p = choosing >= 0 ? choosing : open >= 0 ? open : isNet(slots[lastMover]) ? 0 : lastMover, s = slots[p], k = +b.dataset.k;
  if (taken(k, p)) { sfx.bump(0); return; }
  s.k = k; s.locked = false; lastMover = p;
  lock(p);
};
$('#slots').onclick = e => {
  if (e.target.closest('[data-join]')) { // tap to join: a second touch player on a tablet, else a free keyboard cluster
    const free = ['touch0', 'touch1'].find(d => !slots.some(s => s?.dev === d));
    join(tablet() && free ? free : ['kb1', 'kb0'].find(d => !slots.some(s => s?.dev === d)) || 'bot');
  }
};
$('#randBtn').onclick = () => {
  const p = NET.role === 'guest' ? mySeat() : isNet(slots[lastMover]) ? 0 : lastMover, s = slots[p];
  if (!s) return;
  const free = range(COLORS.length).filter(k => !taken(k, p));
  sfx.shuffle();
  if (NET.role === 'guest') return guestPick(free[Math.random() * free.length | 0]);
  s.k = free[Math.random() * free.length | 0]; s.locked = false;
  lock(p);
};
let GP = null; // { idx, pts: { animal: points }, cpus, team }
function lobbyGo() {
  if (!allReady()) return;
  S.lobby = slots.filter(Boolean).map(s => s.k); save();
  if (S.mode === 'gp') { GP = { idx: 0, pts: {}, cpus: null, team: null }; racePrep(); show('race'); } else { GP = null; show('track'); }
}
$('#lobbyNext').onclick = lobbyGo;

// ---------- track select ----------
function renderTracks() {
  $('#tracks').innerHTML = TRACKS.map(tr => `<button class="tcard" type="button" data-track="${tr.id}" style="--c:${tr.c};--fallback:${tr.bg}" aria-pressed="${tr.id === S.track}"${TRACK_DEFS[tr.id] ? '' : ' disabled'}>
    <span class="art">${BANNERS.includes(tr.banner) ? `<img alt="" src="banners/${tr.banner}.webp">` : ''}</span><span><b>${t(tr.name)}</b><small>${t(tr.sub)}</small></span></button>`).join('');
}
$('#tracks').onclick = e => {
  const b = e.target.closest('[data-track]');
  if (!b) return;
  S.track = b.dataset.track; save(); renderTracks();
  $(`[data-track="${S.track}"]`)?.focus();
};
$('#trackGo').onclick = () => { racePrep(); show('race'); };

// ---------- race ----------
const built = {}; // track tables, built once per session
let worldReady = false;
function ensureWorld() { if (!worldReady) { world.init($('#view3d')); world.setLayoutPref(S.layout); world.setTier(S.tier !== 'auto' ? S.tier : world.tier); worldReady = true; } }
const intents = [input.newIntent(), input.newIntent(), input.newIntent(), input.newIntent()];
let R = null, raf = 0, last = 0, paused = false, endTimer = 0, players = []; // players[p] = { dev, k }; kart index = p
const shuffled = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const MINI = ['#4fd8ff', '#ffb547', '#ff5d8f']; // drift tiers: cyan, amber, pink
const ITEM_ORDER = ['bomb', 'bubble', 'dash', 'joker'], ITEM_GLYPH = { bomb: 'g-pen', bubble: 'g-pass', dash: 'g-safe', joker: 'i-joker' };
const BOTS = +new URLSearchParams(location.search).get('bots') || 0; // ?bots=N: N extra "players" driven by the CPU, for testing split screen alone
let pans = [0, 0, 0, 0];

// phones: fullscreen + landscape lock on Android, a wake lock so the screen stays on mid-race. All best effort:
// iPhone has no fullscreen API (the installed app is fullscreen already), desktop browsers just say no. Embedded in a
// page (ArcadeDeck) the page owns fullscreen: a nested request from the frame never settles in Chrome
let wake = null;
async function racePrep() {
  if (touchDevice && window.self === window.top && !document.fullscreenElement && document.documentElement.requestFullscreen && !matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches) {
    try { await document.documentElement.requestFullscreen({ navigationUI: 'hide' }); } catch { /* not allowed here */ }
  }
  try { await window.screen.orientation?.lock?.('landscape'); } catch { /* desktop / iOS: unsupported */ } // window.screen: `screen` here is the current menu screen
  keepAwake();
}
async function keepAwake() { try { if (!wake && navigator.wakeLock && screen === 'race') { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch { wake = null; } }
const touchDevice = matchMedia('(pointer: coarse)').matches;
let views = []; // player (= kart) indexes drawn on this device: a linked host leaves the phones out, a guest draws only its own
function startRace() {
  const g = NET.role === 'guest' && NET.race; // a guest builds the host's race from its message
  if (g) Object.assign(S, g.cfg); // the host's track, class, laps and stakes (put back when the link ends)
  else if (GP) S.track = GP_ORDER[GP.idx];
  const def = TRACK_DEFS[S.track];
  stopLoop();
  if (!def) { // ponytail: unbuilt tracks show a placeholder until their phase lands
    $('#hud').innerHTML = `<div class="soon"><b>${t(TRACKS.find(x => x.id === S.track).name)}</b><span>${t('soon')}</span></div>`;
    return;
  }
  ensureWorld();
  world.mount($('#race'));
  const T = built[S.track] ||= buildTrack(def);
  if (g) { // same karts, grid order and teams as the host; the host's snapshots move them (netApply)
    const mine = g.devs.indexOf('net' + NET.me);
    const dev = touchDevice ? 'touch0' : input.lastDevice.startsWith('pad') ? input.lastDevice : 'kb0';
    players = g.devs.map((d, p) => ({ dev: p === mine ? dev : 'remote', k: g.karts[p][0] }));
    const karts = g.karts.map(([a, h], i) => Object.assign(newKart(i, a, h), { color: COLORS[a] }));
    R = newRace(T, { cls: S.speed, laps: S.laps, karts, order: g.order });
    R.team = g.team;
    NET.kart = mine; NET.buf.length = 0; NET.pt = 0;
  } else {
    players = slots.filter(Boolean).map(s => ({ ...s }));
    players.forEach((pl, p) => { if (players.some((q, j) => j < p && q.k === pl.k)) pl.k = freeAnimal(pl.k, -1, players.map(q => q.k)); }); // never two of the same animal
    if (!players.length) players = [{ dev: input.lastDevice, k: S.lobby[0] ?? 0 }];
    for (let i = 0; i < BOTS && players.length < 4; i++) players.push({ dev: 'bot', k: freeAnimal(players.length * 5 + 2, -1, players.map(p => p.k)) });
    const picks = players.map(p => p.k);
    // a Grand Prix keeps the same CPU field for all four races
    const cpus = GP?.cpus || shuffled(range(COLORS.length).filter(k => !picks.includes(k))).slice(0, Math.max(0, S.racers - picks.length));
    if (GP) GP.cpus = cpus;
    const karts = [...picks.map((k, p) => newKart(p, k, p)), ...cpus.map((k, j) => newKart(picks.length + j, k, -1))];
    karts.forEach(k => { k.color = COLORS[k.animal]; });
    // Grand Prix races after the first start in reverse standings; Teams stakes split the field in two
    R = newRace(T, { cls: S.speed, laps: S.laps, seed: Date.now() & 0xffffff, karts, order: GP?.idx ? reverseGrid(karts, GP.pts) : null });
    R.team = S.stakes && S.stake === 'team' ? (GP?.team ? karts.map(k => GP.team[k.animal]) : teamSplit(karts)) : null;
    if (R.team && GP && !GP.team) { GP.team = {}; karts.forEach(k => { GP.team[k.animal] = R.team[k.i]; }); }
  }
  world.loadTrack(T, R.karts);
  demo = null;
  views = players.map((_, p) => p).filter(p => !/^(net|remote)/.test(players[p].dev));
  if (!views.length) views = [0]; // a guest without a seat (lobby was full) watches P1
  world.setViews(views);
  buildHud();
  input.setRacing(true);
  document.activeElement?.blur();
  sfx.setMusic(def.song);
  sfx.duck(true);
  sfx.enginesStop();
  const trim = 10 ** (-3 * Math.max(0, views.length - 2) / 20); // -3 dB per player beyond two
  views.forEach((p, j) => { if (/^(touch|kb|pad)/.test(players[p].dev)) sfx.engine(j, pans[j], trim); });
  paused = false; last = performance.now();
  raf = requestAnimationFrame(frame);
  if (hosting()) netRace();
  if (g) { Coop.send({ t: 'ready', rid: g.rid }); keepAwake(); }
}
function stopLoop() {
  cancelAnimationFrame(raf); raf = 0;
  clearTimeout(endTimer);
  input.setRacing(false);
  sfx.enginesStop();
}
// the other keyboard cluster has no player: let this one use both (1P can drive with WASD or the arrows)
const kbShare = dev => (dev === 'kb0' || dev === 'kb1') && !players.some(p => p.dev === (dev === 'kb0' ? 'kb1' : 'kb0'));
const autoIn = { steer: 0, throttle: 0, brake: 0, drift: false };
const raceClk = { t: 0 };
function frame(now) {
  raf = requestAnimationFrame(frame);
  if (tooSoon(raceClk, now, raceFps())) return;
  const raw = (now - last) / 1000, dt = Math.min(0.1, raw);
  last = now;
  if (paused && !world.stale) return; // the last frame, HUD and minimap stay on screen: nothing to move, sync or redraw
  if (!paused) {
    for (let p = 0; p < players.length; p++) {
      const pl = players[p], o = intents[p], k = R.karts[p];
      if (pl.dev === 'remote') continue;
      if (pl.dev === 'bot' || (AUTO && p === 0)) { if (R.phase === 'racing') { cpu(R, k, autoIn); Object.assign(o, autoIn); } }
      else if (pl.dev.startsWith('net')) netRead(+pl.dev[3], o);
      else input.read(pl.dev, o, dt, kbShare(pl.dev));
      // touch drives with auto-gas, which the countdown would read as throttle held from "3" (a spin-out every start):
      // on the grid a touch kart revs only while Drift is held, so Drift just before GO is its rocket start
      if (R.phase === 'countdown' && pl.dev.startsWith('touch')) o.throttle = o.drift ? 1 : 0;
      k.lookBack = o.back;
    }
    if (NET.role === 'guest') { netSendIn(now); netApply(dt); }
    else if (!(R.phase === 'grid' && NET.wait?.size && now < NET.waitUntil)) advance(R, dt, intents); // a linked race waits on the grid for slow phones to load
    raceEvents();
    if (hosting()) netSnap(now);
    for (let j = 0; j < views.length; j++) { const p = views[j], k = R.karts[p]; sfx.engineSet(j, k.v / R.top, k.finished ? 0.5 : intents[p].throttle, k.boost > 0, !!k.drift); }
  }
  world.sync(R, paused ? 0 : dt);
  // fireworks on the music's phrase ends (silent music: one every ~7 s instead)
  if (!paused) {
    const pe = sfx.phraseEnds;
    while (pe.length && pe[0] <= sfx.now()) { pe.shift(); world.firework(); }
    if (S.music === 0 && Math.random() < dt / 7) world.firework();
  }
  world.render(); // paused: returned above unless a resize cleared the canvas
  updateHud(now);
  if (!paused) adapt(raw, raceFps());
  if (DEBUG) debugOverlay(now, dt);
}
// Auto quality: below ~40 fps for 2 s steps down one tier for the session (race and title backdrop). Phones that held
// 30 fps never crossed the old ~26 fps line; a 30 fps-capped phone (OS battery saver) settles on Low, which saves power.
// A loop capped at 30 (touch menus, Battery saver) only counts as slow below ~24 fps, its cap's frames plus a margin
let frameT = 1 / 60, slowT = 0;
function adapt(dt, fps) { // dt: the real time between drawn frames, before the loops cap it; fps: the loop's cap (0: none)
  if (S.tier !== 'auto' || dt <= 0 || dt > 0.25 || document.hidden) return; // a hitch, or a hidden / covered window's throttled frames: says nothing about the device
  frameT += (dt - frameT) * 0.1;
  slowT = frameT > Math.max(0.025, fps ? 1.25 / fps : 0) ? slowT + dt : 0;
  if (slowT > 2 && world.tier !== 'low') {
    world.setTier(world.tier === 'high' ? 'medium' : 'low');
    slowT = 0; frameT = 1 / 60;
    if (DEBUG) console.log('quality ->', world.tier);
  }
}
// ?auto: P1 drives itself with the CPU driver, for checking tracks hands-free
const AUTO = new URLSearchParams(location.search).has('auto');
if (DEBUG) { window.__race = () => R; window.__fw = () => world.firework(); }
const pan = k => pans[views.indexOf(k.human)] || 0;
const devOf = k => players[k.human]?.dev;

const nearHuman = (s, m = 60) => views.some(p => players[p].dev !== 'bot' && Math.abs(((R.karts[p].s - s) % R.T.L + R.T.L * 1.5) % R.T.L - R.T.L / 2) < m);
const label = (i, text, col) => { const k = R.karts[i]; if (k.human >= 0 || nearHuman(k.s, 45)) world.label(i, text, col); };
function raceEvents() {
  if (hosting() && R.ev.length) NET.ev.push(...R.ev); // to the linked phones with the next snapshot
  for (const e of R.ev) {
    const k = R.karts[e.k], me = views.includes(k.human) && !k.finished && devOf(k) !== 'bot'; // sounds and rumble for this device's players only
    world.onEvent(e, R);
    switch (e.type) {
      case 'box': if (me) sfx.shuffle(); break;
      case 'itemReady': if (me) sfx.ui(); break;
      case 'coin': if (me) sfx.coin(e.x, pan(k)); break;
      case 'throw': if (me) sfx.toss(pan(k)); break;
      case 'blast': if (nearHuman(e.s)) sfx.boom(me ? pan(k) : 0, me ? 1 : 0.6); break;
      case 'dash': label(e.k, t('dashGo'), '#5dffb0'); if (me) sfx.whoosh(3, pan(k)); break;
      case 'bubble': if (me) sfx.bubble(pan(k)); break;
      case 'pop': if (me || nearHuman(k.s)) sfx.pop(pan(k)); break;
      case 'jokerSpot': {
        label(e.k, t('jokerGo'), '#ffb547');
        if (me || R.karts[e.x].human >= 0) for (let i = 0; i < 6; i++) setTimeout(() => sfx.spot(i), i * 130); // spotlight ticks
        break;
      }
      case 'jokerSwap': {
        const v = R.karts[e.x];
        if (me || v.human >= 0) sfx.swap(0.5);
        if (k.human >= 0) toast(k.human, t('lucky'), 'lucky');
        if (v.human >= 0) toast(v.human, t('unlucky'), 'unlucky');
        break;
      }
      case 'jokerBlock': label(e.x, t('bubble') + '!', '#e6dcff'); break;
      case 'warpIn': label(e.k, t('wormhole'), e.x % 2 ? '#4fd8ff' : '#d36bff'); if (me) sfx.warp(true, pan(k)); break;
      case 'warpOut': if (me) { sfx.warp(false, pan(k)); flash(k.human); } break;
      case 'carousel': label(e.k, t('carousel'), '#ffd27a'); if (me) sfx.spin(k.lap + 1, pan(k)); break;
      case 'prop': if (me) { sfx.bump(pan(k)); input.rumble(devOf(k), 0.4, 100); } break;
      case 'count': sfx.count(e.x); countdown(String(e.x)); if (e.x === 3) gridChips(false); break;
      case 'go': sfx.count(0); sfx.duck(false); countdown(t('go')); break;
      case 'startBoost': if (me) { sfx.whoosh(2, pan(k)); label(e.k, t('startBoost'), '#ffd54a'); } break;
      case 'spinOut': case 'stun':
        label(e.k, t('stun'), '#ff7a86');
        if (me) { sfx.stun(pan(k)); input.rumble(devOf(k), 0.8, 260); }
        break;
      case 'miniTurbo': label(e.k, t('miniTurbo'), MINI[e.x - 1]); if (me) { sfx.whoosh(e.x, pan(k)); input.rumble(devOf(k), 0.25, 90); } break;
      case 'tier': if (me && e.x) sfx.spot(e.x * 2 + 1); break;
      case 'rung': if (me) sfx.step(e.x, pan(k)); break;
      case 'trick': label(e.k, t('trick'), '#5dffb0'); if (me) sfx.land(false, pan(k)); break;
      case 'wall': if (me) { sfx.wall(Math.abs(e.x), pan(k)); input.rumble(devOf(k), 0.3 * Math.abs(e.x), 80); } break;
      case 'bump': {
        world.squash(e.k, 0.18); world.squash(e.x, 0.18);
        const o = R.karts[e.x];
        if (me || o.human >= 0) sfx.bump(pan(me ? k : o));
        for (const x of [k, o]) if (x.human >= 0) input.rumble(devOf(x), 0.5, 120);
        break;
      }
      case 'respawn': if (me) sfx.warp(false, pan(k)); break;
      case 'splash': label(e.k, t('splash'), '#8fd8ff'); if (me) { sfx.warp(false, pan(k)); input.rumble(devOf(k), 0.5, 160); } break;
      case 'lap':
        if (!me) break;
        if (e.x === R.laps - 1 && R.laps > 1) { toast(k.human, t('finalLap'), 'final'); sfx.land(true, pan(k)); sfx.setTempo(1.06); }
        else if (e.x > 0) sfx.land(false, pan(k));
        break;
      case 'finish':
        if (k.human < 0) break;
        toast(k.human, t('finish'), 'final');
        if (devOf(k) === 'bot' || !views.includes(k.human)) break;
        if (k.place === 1) { sfx.land(true, pan(k)); sfx.fanfare(); } else sfx.land(false, pan(k));
        break;
      case 'end': if (NET.role !== 'guest') endTimer = setTimeout(showResults, 2600); break; // a guest waits for the host's results
    }
  }
  R.ev.length = 0;
}

// ---------- HUD (DOM, one box per view, written only when a value changes) ----------
const hud = [];
let chipsEl = null, mapCanvas = null, standEl = null, standV = '';
const faceCanvases = {};
// animal faces as small canvases (Ladder sprite(): the symbol + #ol outline), for the minimap dots
function faceCanvas(k) {
  if (faceCanvases[k]) return faceCanvases[k];
  const c = faceCanvases[k] = document.createElement('canvas'), img = new Image();
  c.width = c.height = 64;
  img.onload = () => c.getContext('2d').drawImage(img, 0, 0, 64, 64);
  img.src = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64">${$('#ol').outerHTML}${$('#a' + k).innerHTML}</svg>`);
  return c;
}
const touchUi = () => `<div class="touchpad"><div class="tz-steer" aria-hidden="true"><i class="tz-stick"><i class="tz-knob"></i></i></div>
  <button class="tz-brake" type="button" aria-label="${t('aBrake')}"><svg class="ic"><use href="#i-brake"/></svg></button>
  <button class="tz-item" type="button" aria-label="${t('aItem')}"><i class="orb"></i><svg class="iglyph" aria-hidden="true" hidden><use href=""/></svg></button>
  <button class="tz-drift" type="button" aria-label="${t('aDrift')}"><svg class="ic"><use href="#i-drift"/></svg></button></div>`;
function buildHud() {
  const n = views.length;
  const boxes = views.map((p, j) => { const pl = players[p]; return `<div class="view p${j + 1}${pl.dev.startsWith('touch') ? ' touch' : ''}${n > 1 ? ' split' : ''}" style="--pc:${PCOL[p]}">
    ${n > 1 ? `<span class="ptag-hud">P${p + 1}</span>` : ''}
    <div class="itembox"><i class="orb"></i><svg class="iglyph" aria-hidden="true" hidden><use href=""/></svg></div><i class="flash"></i>
    <div class="lapbox"><small>${t('lap')}</small><b></b><span class="coins"><svg aria-hidden="true"><use href="#g-bill"/></svg><b>0</b></span></div>
    <div class="place"><b></b></div>
    <div class="wrong" hidden>${t('wrongWay')}</div>
    <div class="toast"></div><div class="count"></div>
    ${pl.dev.startsWith('touch') ? touchUi() : ''}
  </div>`; }).join('');
  // one minimap: 1P bottom-left of the view, 2P / 4P centred where the views meet, 3P big in the free quadrant
  const mapCls = n === 1 ? (players[views[0]].dev.startsWith('touch') ? 'solo touch' : 'solo') : n === 3 ? 'quad' : 'shared'; // a touch player's stick owns bottom-left
  $('#hud').innerHTML = boxes + `<i class="divider h"></i><i class="divider v"></i>
    ${n === 3 ? `<div class="quad4"><ol class="standings"></ol></div>` : ''}
    <canvas class="minimap ${mapCls}"></canvas><div class="gridchips"></div>`;
  hud.length = 0;
  document.querySelectorAll('#hud .view').forEach(v => hud.push({
    box: v, lap: v.querySelector('.lapbox > b'), coins: v.querySelector('.coins b'), place: v.querySelector('.place'), placeB: v.querySelector('.place b'),
    wrong: v.querySelector('.wrong'), toast: v.querySelector('.toast'), count: v.querySelector('.count'), flash: v.querySelector('.flash'),
    glyphs: [...v.querySelectorAll('.iglyph')], glyphV: '',
    lapV: '', coinV: -1, placeV: 0, wrongV: null,
  }));
  views.forEach((p, j) => { const d = players[p].dev; if (d.startsWith('touch')) input.touch[+d[5]].mount(hud[j].box.querySelector('.touchpad')); });
  mapCanvas = $('#hud .minimap'); standEl = $('#hud .standings'); standV = '';
  chipsEl = $('#hud .gridchips');
  layoutHud();
  gridChips(true);
}
// place the view boxes, dividers and minimap over the GL views (on build and on every resize / layout change)
function layoutHud() {
  if (!hud.length || !R) return;
  const rs = world.rects(views.length), [W, H] = world.size(), split = world.splitOf(views.length);
  // in the 2x2 grid each view keeps the corner that touches the centre free (the shared minimap / pause sit there)
  const inner = ['in-br', 'in-bl', 'in-tr', 'in-tl'];
  hud.forEach((h, p) => {
    Object.assign(h.box.style, { left: rs[p].x + 'px', top: rs[p].y + 'px', width: rs[p].w + 'px', height: rs[p].h + 'px' });
    h.box.classList.remove(...inner);
    if (split === 'grid') h.box.classList.add(inner[p]);
  });
  $('#race').dataset.n = views.length;
  pans = rs.map(r => (r.x + r.w / 2) / W * 1.6 - 0.8);
  const dh = $('#hud .divider.h'), dv = $('#hud .divider.v');
  dh.hidden = !(split === 'tb' || split === 'grid'); dv.hidden = !(split === 'sbs' || split === 'grid');
  const q = $('#hud .quad4');
  if (q) Object.assign(q.style, { left: W / 2 + 'px', top: H / 2 + 'px', width: W / 2 + 'px', height: H / 2 + 'px' });
  buildMinimap();
}
world.setOnLayout(() => layoutHud());
// dice roll: the grid order flips in chip by chip, shuffle sound under it
function gridChips(on) {
  if (!on) { chipsEl.classList.add('out'); return; }
  sfx.shuffle();
  chipsEl.innerHTML = R.order.map((ki, j) => {
    const k = R.karts[ki];
    return `<span class="chip${k.human >= 0 ? ' me' : ''}" style="--c:${COLORS[k.animal]};--i:${j}">${face(k.animal, j)}${k.human >= 0 ? `<b>P${k.human + 1}</b>` : ''}${R.team ? `<i class="tm t${R.team[ki]}">${'AB'[R.team[ki]]}</i>` : ''}</span>`;
  }).join('');
}
function countdown(text) {
  for (const h of hud) { h.count.textContent = text; h.count.classList.remove('on'); void h.count.offsetWidth; h.count.classList.add('on'); }
}
// p: the player; drawn only when that player has a view on this device
function flash(p) { const f = hud[views.indexOf(p)]?.flash; if (f) { f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); } }
function toast(p, text, cls) {
  const h = hud[views.indexOf(p)];
  if (!h) return;
  h.toast.textContent = text; h.toast.className = 'toast ' + cls; void h.toast.offsetWidth; h.toast.classList.add('on');
}
// minimap: the track drawn once to an offscreen canvas, face dots on top each frame
let mapBase = null, mapXf = null, mapT = 0; // mapT: last dot redraw, 0 = on the next frame (buildMinimap cleared it)
function buildMinimap() {
  const c = mapCanvas, r = c.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
  c.width = Math.max(1, r.width * dpr | 0); c.height = Math.max(1, r.height * dpr | 0);
  const T = R.T, P = T.pos;
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (let i = 0; i < T.n; i++) { x0 = Math.min(x0, P[i * 3]); x1 = Math.max(x1, P[i * 3]); z0 = Math.min(z0, P[i * 3 + 2]); z1 = Math.max(z1, P[i * 3 + 2]); }
  const pad = 14 * dpr, sc = Math.min((c.width - 2 * pad) / (x1 - x0), (c.height - 2 * pad) / (z1 - z0));
  const ox = (c.width - (x1 - x0) * sc) / 2 - x0 * sc, oz = (c.height - (z1 - z0) * sc) / 2 - z0 * sc;
  mapXf = { sc, ox, oz, dpr, dot: Math.max(13, Math.min(c.width, c.height) / 9) };
  mapT = 0;
  mapBase = document.createElement('canvas'); mapBase.width = c.width; mapBase.height = c.height;
  const g = mapBase.getContext('2d');
  g.lineJoin = g.lineCap = 'round';
  const path = () => { g.beginPath(); for (let i = 0; i <= T.n; i += 2) { const j = i % T.n; g.lineTo(P[j * 3] * sc + ox, P[j * 3 + 2] * sc + oz); } };
  path(); g.strokeStyle = 'rgba(10,6,30,.85)'; g.lineWidth = 9 * dpr; g.stroke();
  path(); g.strokeStyle = 'rgba(155,107,255,.9)'; g.lineWidth = 5 * dpr; g.stroke();
  path(); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.5 * dpr; g.stroke();
  const fx = P[0] * sc + ox, fz = P[2] * sc + oz, rx = T.right[0], rz = T.right[2];
  g.strokeStyle = '#fff'; g.lineWidth = 2.5 * dpr; g.beginPath(); g.moveTo(fx - rx * 7 * dpr, fz - rz * 7 * dpr); g.lineTo(fx + rx * 7 * dpr, fz + rz * 7 * dpr); g.stroke();
  // wormhole pairs: a dashed arc from mouth A to mouth B, bowed towards the map centre, in the track's swirl colours
  const hc = T.def.theme.holes || ['#d36bff', '#4fd8ff'], M = T.mouths;
  const mxy = m => { const i = Math.round(m.s / T.ds) % T.n; return [P[i * 3] * sc + ox + T.right[i * 3] * m.d * sc, P[i * 3 + 2] * sc + oz + T.right[i * 3 + 2] * m.d * sc]; };
  for (let i = 0; i < M.length; i += 2) {
    const [ax, ay] = mxy(M[i]), [bx, by] = mxy(M[i + 1]), mx = (ax + bx) / 2, my = (ay + by) / 2;
    let px = ay - by, py = bx - ax; // perpendicular, |p| = |AB|
    if (px * (c.width / 2 - mx) + py * (c.height / 2 - my) < 0) { px = -px; py = -py; }
    const cx = mx + px * 0.25, cy = my + py * 0.25, arc = () => { g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(cx, cy, bx, by); };
    const grad = g.createLinearGradient(ax, ay, bx, by); grad.addColorStop(0, hc[0]); grad.addColorStop(1, hc[1]);
    g.setLineDash([]); arc(); g.strokeStyle = 'rgba(10,6,30,.7)'; g.lineWidth = 4.5 * dpr; g.stroke();
    g.setLineDash([4 * dpr, 3.5 * dpr]); arc(); g.strokeStyle = grad; g.lineWidth = 2.2 * dpr; g.stroke();
    g.setLineDash([]);
    [[ax, ay, hc[0], hc[1]], [bx, by, hc[1], hc[0]]].forEach(([x, y, inner, outer]) => { // mouth: inner swirl colour ringed by the outer, like the 3D portal
      g.beginPath(); g.arc(x, y, 5.6 * dpr, 0, 7); g.fillStyle = 'rgba(10,6,30,.85)'; g.fill();
      g.beginPath(); g.arc(x, y, 4 * dpr, 0, 7); g.fillStyle = inner; g.fill(); g.strokeStyle = outer; g.lineWidth = 2 * dpr; g.stroke();
    });
  }
  R.karts.forEach(k => faceCanvas(k.animal));
}
const byPlaceArr = [];
function drawMinimap() {
  for (const k of R.karts) byPlaceArr[k.place - 1] = k;
  const c = mapCanvas, g = c.getContext('2d'), { sc, ox, oz, dot } = mapXf, T = R.T;
  g.clearRect(0, 0, c.width, c.height);
  g.drawImage(mapBase, 0, 0);
  for (let j = R.karts.length - 1; j >= 0; j--) { // back to front so the leaders draw on top
    const k = byPlaceArr[j], i = Math.round(k.s / T.ds) % T.n;
    const x = T.pos[i * 3] * sc + ox + T.right[i * 3] * k.d * sc, y = T.pos[i * 3 + 2] * sc + oz + T.right[i * 3 + 2] * k.d * sc;
    const s = dot * (k.human >= 0 ? 1.35 : 1);
    g.fillStyle = k.human >= 0 && players.length > 1 ? PCOL[k.human] : COLORS[k.animal];
    g.beginPath(); g.arc(x, y, s * 0.62, 0, 7); g.fill();
    g.drawImage(faceCanvases[k.animal], x - s / 2, y - s / 2, s, s);
  }
}
function updateHud(now) {
  for (let j = 0; j < hud.length; j++) {
    const h = hud[j], p = views[j], k = R.karts[p];
    const lap = `${Math.min(R.laps, Math.max(1, k.lap + 1))}/${R.laps}`;
    if (lap !== h.lapV) h.lap.textContent = h.lapV = lap;
    if (k.coins !== h.coinV) h.coins.textContent = h.coinV = k.coins;
    if (k.place !== h.placeV && R.phase !== 'grid') {
      h.placeV = k.place;
      h.placeB.textContent = t('rank', k.place);
      h.place.style.setProperty('--c', MEDAL[k.place - 1] || '#b98bff');
      h.place.classList.remove('pulse'); void h.place.offsetWidth; h.place.classList.add('pulse');
    }
    const wrong = k.wrong && !k.finished;
    if (wrong !== h.wrongV) h.wrong.hidden = !(h.wrongV = wrong);
    // item slot: the reel flicks through the four glyphs (a tick each step) until the roulette settles
    const gl = k.roll > 0 ? ITEM_ORDER[Math.floor(k.roll * 10) % 4] : k.item || '';
    if (gl !== h.glyphV) {
      if (k.roll > 0 && players[p].dev !== 'bot') sfx.spot(ITEM_ORDER.indexOf(gl) + 2);
      h.glyphV = gl;
      for (const s of h.glyphs) {
        s.toggleAttribute('hidden', !gl); // SVG elements have no .hidden property
        if (gl) { s.firstChild.setAttribute('href', '#' + ITEM_GLYPH[gl]); s.classList.toggle('stroke', gl === 'joker'); s.classList.toggle('settle', !(k.roll > 0)); }
      }
    }
  }
  // ~15 redraws a second: a dot crosses at most ~8 px a second on a phone's map (half a pixel per redraw), so 60 redraws
  // (each one a fresh canvas for the compositor) looked the same
  if (mapXf && now - mapT > 64) { mapT = now; drawMinimap(); }
  if (standEl) { // 3P: live standings in the free quadrant, rewritten only when the order changes
    let key = '';
    for (const k of byPlaceArr) key += k.i + ',';
    if (key !== standV) {
      standV = key;
      standEl.innerHTML = byPlaceArr.map((k, j) => `<li style="--c:${MEDAL[j] || '#b98bff'}"><b>${t('rank', j + 1)}</b>${face(k.animal)}<span>${t('player', k.animal + 1)}</span>${k.human >= 0 ? `<i style="--pc:${PCOL[k.human]}">P${k.human + 1}</i>` : ''}</li>`).join('');
    }
  }
}
let dbgEl = null, dbgT = 0, fps = 60;
function debugOverlay(now, dt) {
  fps += (1 / Math.max(dt, 1e-3) - fps) * 0.05;
  if (now - dbgT < 250) return;
  dbgT = now;
  dbgEl ||= document.body.appendChild(el('pre', 'dbg'));
  const i = world.info(), k = R.karts[0];
  dbgEl.textContent = `${fps.toFixed(0)} fps  ${i.render.calls} calls  ${(i.render.triangles / 1000).toFixed(0)}k tris  ${world.tier}  ${players.length}P  ${R.phase}\ns ${k.s.toFixed(1)}  d ${k.d.toFixed(2)}  v ${k.v.toFixed(1)}  lap ${k.lap}  h ${k.h.toFixed(2)}  drift ${k.drift}/${k.tier}  boost ${k.boost.toFixed(2)}  place ${k.place}`;
}

let waitPad = -1; // a pad that dropped out mid-race: the pause dialog asks for it back
// linked: the host's pause stops every phone; a guest's asks the host, which passes it on (remote: came over the link)
function pause(who, msg, remote) {
  const dlg = $('#pauseDlg');
  if (screen !== 'race') return;
  if (NET.role === 'guest' && !remote) who = 'P' + (NET.kart + 1);
  $('#pausedBy').textContent = msg || t('pausedBy', who);
  if (NET.role && !remote) Coop.send({ t: 'pause', who });
  if (dlg.open) return;
  paused = true;
  input.setRacing(false); // drops held touches (the modal swallows their lift) and frees Enter / Space for the dialog
  sfx.enginesQuiet(true);
  $('#pauseVol').append($('#vol')); // the one volume widget, shown inline while paused
  dlg.showModal();
}
function resume() { $('#pauseDlg').close(); }
$('#pauseDlg').addEventListener('close', () => {
  $('#bar .tools').append($('#vol')); input.setRacing(screen === 'race'); paused = false; waitPad = -1; sfx.enginesQuiet(false); last = performance.now();
  if (NET.role && !NET.quiet) Coop.send({ t: 'resume' }); // closed here: the other phones resume too
  NET.quiet = false;
});
$('#pauseBtn').onclick = () => pause('P1');
$('#resumeBtn').onclick = resume;
$('#restartBtn').onclick = () => { resume(); startRace(); };
$('#quitBtn').onclick = () => {
  if (NET.role === 'guest') { NET.quiet = true; resume(); Coop.close(); netEnd(); return; } // a guest quitting leaves the link
  resume(); leaveRace(); show('title');
};
function leaveRace() { stopLoop(); world.unload(); R = null; sfx.setMusic('custom'); wake?.release().catch(() => {}); wake = null; }
input.onPad.disconnect = i => {
  const p = players.findIndex(pl => pl.dev === 'pad' + i);
  if (screen === 'race' && R && p >= 0) { waitPad = i; pause(`P${p + 1}`, t('reconnect', `P${p + 1}`)); }
};
input.onPad.connect = i => { if (i === waitPad && $('#pauseDlg').open) $('#pausedBy').textContent = t('pausedBy', `P${players.findIndex(pl => pl.dev === 'pad' + i) + 1}`); };

// ---------- results: podium, Ladder-style cards, Grand Prix standings, Party Stakes ----------
// stake outcome for each player, best first (quick race: this race; Grand Prix: the final standings)
const gly = (id, tint) => `<svg class="gly" aria-hidden="true"${tint ? ` style="color:${tint}"` : ''}><use href="#${id.startsWith('i-') ? id : 'g-' + id}"/></svg>`;
function stakeOutcome(ranked) { // ranked: human karts, best first
  const n = ranked.length, out = new Map();
  if (S.stake === 'win' || S.stake === 'pen') {
    const m = Math.min(S.winners, Math.max(1, n - 1));
    ranked.forEach((k, i) => {
      const hit = S.stake === 'win' ? i < m : i >= n - m;
      out.set(k, S.stake === 'win' ? { glyph: hit ? 'win' : 'pass', text: t(hit ? 'win' : 'lose'), big: hit, mood: hit ? 'win' : '' }
        : { glyph: hit ? 'pen' : 'safe', text: t(hit ? 'pen' : 'safe'), big: hit, bad: hit, mood: hit ? 'cry soot' : '' });
    });
  } else if (S.stake === 'rank') {
    ranked.forEach((k, i) => { const p = Math.max(1, i + 1 - S.firsts + 1); out.set(k, { glyph: 'rank', tint: MEDAL[p - 1] || '#b98bff', num: p, text: t('rank', p), big: p === 1, mood: p === 1 ? 'win' : '' }); });
  } else if (S.stake === 'bill') {
    const amt = billSplit(S.total, CUR[S.cur][1], n), top = Math.max(...amt), low = Math.min(...amt);
    ranked.forEach((k, i) => out.set(k, { glyph: 'bill', text: money(amt[i]), big: n > 1 && amt[i] === top, bad: n > 1 && amt[i] === top, mood: n > 1 && amt[i] === top ? 'cry' : amt[i] === low ? 'win' : '' }));
  }
  return out;
}
const fmtTime = s => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, '0')}`;
const eyesOf = k => [...$('#a' + k).querySelectorAll('.e [fill="#2b2140"] circle')].map(c => [+c.getAttribute('cx'), +c.getAttribute('cy')]);
const tears = k => eyesOf(k).map(([x, y]) => [0, 0.6].map(d => `<path class="tear" style="animation-delay:${0.3 + d + (x > 16) * 0.3}s" d="M${x} ${y + 1.4}q-1.3 1.9 0 2.8q1.3-.9 0-2.8z" fill="#8fd8ff" stroke="#2b6a9a" stroke-width=".4"/>`).join('')).join('');
const pet = (animal, mood, i) => `<svg class="pet${mood.includes('win') ? ' win' : ''}${mood.includes('cry') ? ' cry' : ''}" style="--i:${i}" viewBox="-2 -9 36 43" aria-hidden="true"><use href="#a${animal}" width="32" height="32"/>${mood.includes('crown') ? '<use href="#x-crown"/>' : ''}${mood.includes('soot') ? '<use href="#x-soot"/>' : ''}${mood.includes('cry') ? tears(animal) : ''}</svg>`;
let podRaf = 0, podLast = 0, countT = 0;
const podClk = { t: 0 };
function podLoop(now) {
  if (screen !== 'results') { podRaf = 0; return; }
  podRaf = requestAnimationFrame(podLoop);
  if (tooSoon(podClk, now, menuFps()) || (openDlg() && !world.stale)) return; // Party Stakes summary open: hold, as in the lobby
  world.renderPodium(Math.min(0.1, (now - podLast) / 1000));
  podLast = now;
}
function showResults() {
  stopLoop();
  // linked phones get the final places and the Grand Prix table as it was before this race; they run this same code
  if (hosting()) Coop.send({ t: 'res', rid: NET.rid, gp: GP && structuredClone(GP), k: R.karts.map(k => [k.place, +k.finished, k.finishT, +k.dnf]) });
  const raceOrder = [...R.karts].sort((a, b) => a.place - b.place), n = raceOrder.length, final = !GP || GP.idx === GP_ORDER.length - 1;
  // ArcadeDeck score: races won against CPUs on this device (not over the link, not by a ?bots / ?auto stand-in)
  if (!NET.role && raceOrder.some(k => k.human < 0)) {
    const w = raceOrder[0];
    if (w.human >= 0 && players[w.human].dev !== 'bot' && !(AUTO && w.human === 0)) { S.wins++; save(); }
    if (S.wins && window.parent !== window) window.parent.postMessage({ type: 'GAME_OVER', score: S.wins }, '*');
  }
  const trackName = t(TRACKS.find(x => x.id === S.track).name);
  let rows = raceOrder, gains = null;
  if (GP) { // points for this race, then the standings by total (ties: this race's order)
    gains = new Map(raceOrder.map(k => [k, gpPoints(k.place, n)]));
    for (const k of raceOrder) GP.pts[k.animal] = (GP.pts[k.animal] || 0) + gains.get(k);
    rows = [...raceOrder].sort((a, b) => GP.pts[b.animal] - GP.pts[a.animal] || a.place - b.place);
  }
  const humans = rows.filter(k => k.human >= 0), stakes = S.stakes && final && S.stake !== 'team' ? stakeOutcome(humans) : null;
  const teams = S.stakes && final && S.stake === 'team' && R.team;
  $('#results .head').textContent = GP ? (final ? t('champion') : t('standings')) : t('results');
  $('#resTrack').textContent = GP ? `${t('raceOf', GP.idx + 1)} · ${trackName}` : trackName;
  $('#resList').innerHTML = rows.map((k, i) => {
    const st = stakes?.get(k), champ = GP && final && i === 0;
    const mood = (st ? st.mood : i < 3 ? 'win' : i === n - 1 ? 'cry' : '') + (champ ? ' crown' : '');
    const right = GP ? `<span class="gpts"><i class="gain">+${gains.get(k)}</i><b class="tot" data-to="${GP.pts[k.animal]}" data-from="${GP.pts[k.animal] - gains.get(k)}">${GP.pts[k.animal] - gains.get(k)}</b></span>`
      : `<small class="rtime">${k.finished ? fmtTime(k.finishT) : t('dnf')}</small>`;
    const badge = st ? `<span class="gl">${gly(st.glyph, st.tint)}${st.num ? `<em>${st.num}</em>` : ''}</span>` : teams ? `<i class="tm t${R.team[k.i]}">${'AB'[R.team[k.i]]}</i>` : '';
    return `<li class="rcard${k.human >= 0 ? ' me' : ''}${st?.big ? (st.bad ? ' bad' : ' big') : ''}" style="--c:${MEDAL[i] || '#b98bff'};--a:${COLORS[k.animal]};--i:${i}">
      <b class="rplace">${t('rank', i + 1)}</b>${pet(k.animal, mood, i)}
      <span class="rname">${t('player', k.animal + 1)}${k.human >= 0 ? `<i class="ptag" style="background:${PCOL[k.human]}">P${k.human + 1}</i>` : ''}${badge}</span>${right}</li>`;
  }).join('');
  // buttons: Grand Prix goes on to the next track until the last one
  $('#nextBtn').hidden = !GP || final;
  $('#rematchBtn').hidden = !!GP && !final;
  $('#rematchBtn').querySelector('span').textContent = t(GP ? 'newGp' : 'rematch');
  $('#sumBtn').hidden = !(stakes || teams);
  show('results');
  world.mount($('#podium'));
  world.podium((GP && final ? rows : raceOrder).slice(0, 3), COLORS);
  sfx.setMusic('bill');
  if ((GP && final ? rows : raceOrder)[0].human >= 0) sfx.fanfare();
  podLast = performance.now();
  if (!podRaf) podRaf = requestAnimationFrame(podLoop);
  // points count up with a tick each step
  clearInterval(countT);
  if (GP) {
    let step = 0;
    countT = setInterval(() => {
      step++;
      let moving = false;
      document.querySelectorAll('#resList .tot').forEach(e => { const to = +e.dataset.to, from = +e.dataset.from, v = Math.min(to, from + step); if (+e.textContent !== v) { e.textContent = v; moving = true; } });
      if (moving) { if (step % 2) sfx.spot(step % 7); } else clearInterval(countT);
    }, 70);
  }
  if (stakes || teams) { fillSummary(humans, stakes, teams ? rows : null); setTimeout(() => { if (screen === 'results' && !openDlg()) $('#summary').showModal(); }, 2400); }
}
// the Party Stakes summary: Ladder's result list (spotlight rows for winners, red for the penalty / biggest bill),
// or one card per team with its score and member chips
function fillSummary(humans, stakes, all) {
  const chip = k => `<b>${face(k.animal)}${t('player', k.animal + 1)}${k.human >= 0 ? ` <i class="ptag" style="background:${PCOL[k.human]}">P${k.human + 1}</i>` : ''}</b>`;
  if (all) {
    const sc = teamScores(R.karts, R.team), best = Math.max(...sc);
    $('#sumList').innerHTML = [0, 1].map(tm => `<li class="team${sc[tm] === best ? ' big' : ''}" style="--c:${['#4fd8ff', '#ff5d8f'][tm]};--i:${tm}">
      <span class="tn"><span class="gl">${gly('team', ['#4fd8ff', '#ff5d8f'][tm])}<em>${'AB'[tm]}</em></span>${t('team', 'AB'[tm])} · ${t('pts', sc[tm])}${sc[tm] === best ? ` <svg class="ic crown"><use href="#i-crown"/></svg>` : ''}</span>
      <span class="mem">${all.filter(k => R.team[k.i] === tm).map(chip).join('')}</span></li>`).join('');
    return;
  }
  const big = humans.filter(k => stakes.get(k).big), rest = humans.filter(k => !stakes.get(k).big);
  $('#sumList').innerHTML = [...big, ...rest].map((k, i) => {
    const st = stakes.get(k);
    return `<li class="${st.big ? 'big' : ''}${st.bad ? ' bad' : ''}" style="--c:${COLORS[k.animal]};--i:${i}">
      <span>${st.big ? `<svg class="ic crown"><use href="#${st.bad ? 'i-skull' : 'i-crown'}"/></svg>` : ''}${face(k.animal)} ${t('player', k.animal + 1)}</span><svg class="ic"><use href="#i-arrow"/></svg><span>${st.text}</span></li>`;
  }).join('');
}
$('#rematchBtn').onclick = () => { if (GP) GP = { idx: 0, pts: {}, cpus: null, team: null }; racePrep(); show('race'); }; // after a Grand Prix: a new one
$('#nextBtn').onclick = () => { GP.idx++; racePrep(); show('race'); };
$('#sumBtn').onclick = () => $('#summary').showModal();
$('#sumClose').onclick = () => $('#summary').close();
$('#changeBtn').onclick = () => { leaveRace(); show('lobby'); };
$('#toTitle').onclick = () => { if (NET.role === 'guest') return Coop.open(linkOpts); leaveRace(); GP = null; show('title'); }; // a guest: the link dialog (Leave / Close)
const portrait = matchMedia('(orientation: portrait) and (pointer: coarse) and (max-width: 600px)'); // = the rotate card
portrait.addEventListener('change', () => { if (portrait.matches && R) pause('P1'); }); // iPhone can't lock landscape
document.addEventListener('visibilitychange', () => { if (document.hidden && screen === 'race' && R) pause('P1'); else if (!document.hidden && screen === 'race') keepAwake(); });

// ---------- settings ----------
function renderSettings() {
  document.querySelectorAll('[data-set]').forEach(g => g.querySelectorAll('[data-v]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v) === String(S[g.dataset.set]))));
  $('#tiltBtn').setAttribute('aria-pressed', S.tilt);
  $('#saverBtn').setAttribute('aria-pressed', S.saver);
}
$('#saverBtn').onclick = () => { S.saver = !S.saver; save(); renderSettings(); };
$('#tiltBtn').onclick = async () => { S.tilt = await input.enableTilt(!S.tilt); save(); renderSettings(); };
// iOS only answers the motion permission inside a tap: retry on the first one (the tilt toggle itself handles its own)
if (S.tilt) input.enableTilt(true).then(on => on || addEventListener('click', e => e.target.closest('#tiltBtn') || input.enableTilt(true), { once: true, capture: true }));
document.querySelectorAll('[data-set]').forEach(g => g.onclick = e => {
  const b = e.target.closest('[data-v]');
  if (!b) return;
  const v = b.dataset.v;
  S[g.dataset.set] = isNaN(v) ? v : +v; save(); renderSettings();
  if (g.dataset.set === 'layout' && worldReady) world.setLayoutPref(S.layout);
  if (g.dataset.set === 'tier' && worldReady) world.setTier(S.tier === 'auto' ? (world.touch ? 'medium' : 'high') : S.tier);
});
$('#setClose').onclick = () => $('#setDlg').close();

// ---------- volume (Ladder's popup) ----------
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
});
function togglePop(open) {
  volPop.hidden = !open;
  volBtn.setAttribute('aria-expanded', open);
  if (open && nav.on) volPop.querySelector('input').focus();
}
volBtn.onclick = () => togglePop(volPop.hidden);
document.addEventListener('pointerdown', e => { if (!volPop.hidden && !e.target.closest('.vol')) togglePop(false); });

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
  ({ lobby: renderLobby, track: renderTracks, mode: renderMode })[screen]?.();
}
// tap cycles EN → 한국어 → 日本語 → EN
$('#lang').onclick = () => {
  const L = Object.keys(LANG_NAME);
  S.lang = L[(L.indexOf(S.lang) + 1) % L.length];
  save(); applyI18n();
};
if (DEBUG) for (const L of ['ko', 'ja']) for (const k in I18N.en) if (!(k in I18N[L])) console.warn(`i18n: "${k}" missing in ${L}`);

// every menu button clicks; Start and the race buttons add their own sound on top
document.addEventListener('click', e => { if (e.target.closest('button') && screen !== 'race') sfx.ui(); });

// ---------- menu navigation without a mouse ----------
// arrows / D-pad / left stick move focus to the nearest control in that direction (rect centres), Enter / A presses,
// Esc / Backspace / B goes back. ponytail: brute force over the visible controls, a few dozen at most
const nav = { on: false };
const scope = () => openDlg() || (!volPop.hidden ? $('#vol') : null);
function focusables() {
  const roots = scope() ? [scope()] : [$('#' + screen), $('#bar')];
  return roots.flatMap(r => [...r.querySelectorAll('button:not(:disabled), input')])
    .filter(b => b.offsetParent && getComputedStyle(b).visibility !== 'hidden');
}
function focusFirst() {
  const f = focusables(), pref = f.find(b => b.matches('[aria-pressed="true"], .btn.primary')) || f[0];
  pref?.focus();
}
function move(dx, dy) {
  nav.on = true; document.body.classList.add('nav');
  const list = focusables(), cur = document.activeElement;
  if (!list.includes(cur)) return focusFirst();
  const a = cur.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
  let best = null, bestD = Infinity;
  for (const b of list) {
    if (b === cur) continue;
    const r = b.getBoundingClientRect(), vx = r.left + r.width / 2 - ax, vy = r.top + r.height / 2 - ay;
    const along = vx * dx + vy * dy, across = Math.abs(vx * dy - vy * dx);
    if (along <= 1) continue;
    const d = along + across * 2.5; // prefer straight lines over diagonals
    if (d < bestD) { bestD = d; best = b; }
  }
  if (best) { best.focus(); best.scrollIntoView({ block: 'nearest' }); sfx.spot(Math.random() * 7 | 0); }
}
const DIRS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
addEventListener('keydown', e => {
  if (screen === 'lobby' && NET.role !== 'guest' && !openDlg() && volPop.hidden) return; // lobbyInput() handles every key here (a guest's lobby is a plain menu)
  if (screen === 'race' && !openDlg()) { if (e.key === 'Escape') { e.preventDefault(); pause('P1'); } return; } // preventDefault: the same Esc would cancel the fresh modal
  const d = DIRS[e.key];
  if (d) {
    if (document.activeElement?.type === 'range' && d[0]) { nav.on = true; return; } // sliders keep left/right
    e.preventDefault(); move(...d);
  } else if (e.key === 'Escape' || e.key === 'Backspace') { e.preventDefault(); back(); }
});
addEventListener('pointerdown', () => { nav.on = false; document.body.classList.remove('nav'); }, true);

// shared input loop: pads polled once a frame; the lobby reads per-device edges for its cursors, races read Start for
// pause, every other screen gets spatial navigation from the pads. Any pad button also unlocks audio (pads fire no gesture)
function padMenu() {
  for (let i = 0; i < 4; i++) {
    const e = input.edgesOf('pad' + i), dx = e.left ? -1 : e.right ? 1 : 0, dy = e.up ? -1 : e.down ? 1 : 0;
    if (dx || dy) {
      const r = document.activeElement;
      if (r?.type === 'range' && dx && !dy) { setVol(r.id === 'musicVol' ? 'music' : 'sfx', clamp(+r.value + dx * 5, 0, 100)); save(); }
      else move(dx, dy);
    }
    if (e.confirm) { nav.on = true; document.body.classList.add('nav'); const f = document.activeElement; f?.matches('button') ? f.click() : focusFirst(); }
    if (e.cancel) back();
    if (e.start && screen === 'title') $('#startBtn').click();
  }
}
function tick(now) {
  requestAnimationFrame(tick);
  input.poll(now);
  if (input.anyPadButton()) unlock();
  const modal = openDlg() || !volPop.hidden;
  if (screen === 'race' && !modal) { for (let p = 0; p < players.length; p++) if (players[p].dev.startsWith('pad') && input.edgesOf(players[p].dev).start) pause('P' + (p + 1)); }
  else if (screen === 'lobby' && !modal && NET.role !== 'guest') lobbyInput();
  else padMenu();
  input.clearEdges();
}
requestAnimationFrame(tick);

// ---------- phone link (coop.js): each phone races its own kart on its own full screen ----------
// The host runs the race as usual, each linked phone's player one more racer. Guests send their controls (on change,
// plus a keepalive); the host streams the race state ~30 times a second on the unreliable channel and the race events
// (sounds, labels, countdown) on the reliable one, and every phone draws its own chase camera from that. Lobby picks,
// pauses and results are small reliable messages; only the host changes settings or moves on.
// ponytail: a guest draws the race DELAY ms behind the host's newest state, so its own kart answers a round trip plus
// that late. Client-side prediction of the own kart (stepKart here, reconcile on each snapshot) if it ever feels floaty
const PH = ['grid', 'countdown', 'racing', 'done'], CFG = ['mode', 'speed', 'laps', 'track', 'stakes', 'stake', 'winners', 'firsts', 'cur', 'total'];
const KF = 24, DELAY = 60; // numbers per kart in a snapshot; guest playback delay in ms (~2 snapshots, so one lost packet never stalls)
const r2 = v => Math.round(v * 100) / 100;
const cfg = () => Object.fromEntries(CFG.map(k => [k, S[k]]));
const closeDlgs = () => document.querySelectorAll('dialog[open]').forEach(d => { if (d.id === 'pauseDlg') NET.quiet = true; d.close(); });

// host: a race starts. The phones build the same karts and grid; the race waits on the grid until they say ready (5 s max)
function netRace() {
  NET.rid++; NET.t0 = performance.now(); NET.sent = 0; NET.ev.length = 0;
  NET.wait = new Set(players.filter(isNet).map(p => +p.dev[3]));
  NET.waitUntil = NET.t0 + 5000;
  Coop.send({ t: 'race', rid: NET.rid, cfg: cfg(), devs: players.map(p => p.dev), karts: R.karts.map(k => [k.animal, k.human]), order: R.order, team: R.team });
}
// host: ~30 snapshots a second, one flat array of rounded numbers ([rid, ms, t, clock, phase, count], KF per kart,
// box and coin timers, 4 per bomb), plus the events since the last one
function netSnap(now) {
  if (now - NET.sent < 33) return;
  NET.sent = now;
  if (NET.ev.length) { Coop.send({ t: 'ev', rid: NET.rid, e: NET.ev }); NET.ev = []; }
  const a = [NET.rid, Math.round(now - NET.t0), r2(R.t), r2(R.clock), PH.indexOf(R.phase), R.count];
  for (const k of R.karts) a.push(r2(k.s), r2(k.d), r2(k.h), Math.round(k.yaw * 1000) / 1000, Math.round(k.v * 10) / 10, k.lap, k.place, k.coins,
    r2(k.boost), k.drift, k.tier, r2(k.fly), r2(k.warp), r2(k.resp), r2(k.bubble), r2(k.joker), k.jokerOn, r2(k.soot), r2(k.steer), r2(k.stun),
    ITEM_ORDER.indexOf(k.item), r2(k.roll), k.finished | k.wrong << 1 | k.dnf << 2 | k.half << 3, Math.round(k.finishT * 1000) / 1000);
  for (const v of R.boxT) a.push(r2(v));
  for (const v of R.coinT) a.push(r2(v));
  for (const b of R.bombs) a.push(r2(b.s), r2(b.d), r2(b.h), r2(b.t));
  Coop.fast({ t: 's', a });
}
// host: a guest's controls [steer, throttle, brake, drift, back, item presses, seq]
function netIn(i, a) {
  if (!Array.isArray(a)) return;
  const m = NET.in[i] ||= { seq: -1, used: a[5], a };
  if (!(a[6] > m.seq)) return; // late or repeated packet on the unordered channel
  m.seq = a[6]; m.a = a;
}
function netRead(i, o) {
  const m = NET.in[i], a = m?.a || [];
  o.steer = clamp(+a[0] || 0, -1, 1); o.throttle = clamp(+a[1] || 0, 0, 1); o.brake = clamp(+a[2] || 0, 0, 1); o.drift = !!a[3]; o.back = !!a[4];
  o.item = !!m && a[5] !== m.used; // presses are counted on the phone, so a lost packet never loses one
  if (m) m.used = a[5];
}
function netPick(i, k) {
  const p = slots.findIndex(s => s?.dev === 'net' + i);
  if (p < 0 || !Number.isInteger(k) || k < 0 || k >= COLORS.length) return;
  if (!taken(k, p)) { Object.assign(slots[p], { k, locked: true }); lastMover = p; }
  renderLobby(); // the phone gets the true state back either way
}

// guest: controls out on change (steering at most ~30 a second) and every 250 ms
function netSendIn(now) {
  const o = intents[NET.kart];
  if (!o) return;
  if (o.item) NET.itemN++;
  const st = Math.round(o.steer * 20) / 20, disc = `${r2(o.throttle)},${r2(o.brake)},${+o.drift},${+o.back},${NET.itemN}`, key = st + ',' + disc;
  if (key === NET.inKey ? now - NET.inAt < 250 : disc === NET.inDisc && now - NET.inAt < 33) return;
  NET.inKey = key; NET.inDisc = disc; NET.inAt = now;
  Coop.fast({ t: 'in', a: [st, r2(o.throttle), r2(o.brake), +o.drift, +o.back, NET.itemN, ++NET.inSeq] });
}
// guest: play the snapshots back DELAY ms behind the newest, blending the two either side of the playback clock
function netApply(dt) {
  const B = NET.buf;
  if (!B.length) return;
  const want = B[B.length - 1][1] - DELAY;
  NET.pt += dt * 1000;
  NET.pt = Math.abs(want - NET.pt) > 250 ? want : NET.pt + (want - NET.pt) * 0.05; // follow the host's clock (a pause or a stall snaps)
  let i = 0;
  while (i < B.length - 1 && B[i + 1][1] <= NET.pt) i++;
  const a = B[i], b = B[Math.min(i + 1, B.length - 1)], f = a === b ? 0 : clamp((NET.pt - a[1]) / (b[1] - a[1]), 0, 1);
  const L = R.T.L, lerp = (x, y) => x + (y - x) * f, mix = (n, timer) => timer && b[n] > a[n] ? b[n] : lerp(a[n], b[n]); // timers count down: a rise is a restart
  R.t = lerp(a[2], b[2]); R.clock = b[3] < a[3] ? b[3] : lerp(a[3], b[3]); R.phase = PH[b[4]]; R.count = b[5];
  for (let j = 0; j < R.karts.length; j++) {
    const k = R.karts[j], o = 6 + j * KF;
    let ds = b[o] - a[o], dy = b[o + 3] - a[o + 3];
    ds -= L * Math.round(ds / L); dy -= 2 * Math.PI * Math.round(dy / (2 * Math.PI));
    const jump = Math.abs(ds) > 15 || Math.abs(b[o + 1] - a[o + 1]) > 4; // Joker swap, wormhole, respawn: never slide across the map
    k.s = jump ? b[o] : (a[o] + ds * f + L) % L; k.d = jump ? b[o + 1] : lerp(a[o + 1], b[o + 1]); k.h = mix(o + 2); k.yaw = a[o + 3] + dy * f;
    k.v = mix(o + 4); k.lap = b[o + 5]; k.place = b[o + 6]; k.coins = b[o + 7]; k.boost = mix(o + 8, 1); k.drift = b[o + 9]; k.tier = b[o + 10];
    k.fly = mix(o + 11, 1); k.warp = mix(o + 12, 1); k.resp = mix(o + 13, 1); k.bubble = mix(o + 14, 1); k.joker = mix(o + 15, 1); k.jokerOn = b[o + 16];
    k.soot = mix(o + 17, 1); k.steer = mix(o + 18); k.stun = mix(o + 19, 1); k.item = ITEM_ORDER[b[o + 20]] || null; k.roll = mix(o + 21, 1);
    const fl = b[o + 22]; k.finished = !!(fl & 1); k.wrong = !!(fl & 2); k.dnf = !!(fl & 4); k.half = !!(fl & 8); k.finishT = b[o + 23];
  }
  let o = 6 + R.karts.length * KF;
  for (let j = 0; j < R.boxT.length; j++) R.boxT[j] = b[o++];
  for (let j = 0; j < R.coinT.length; j++) R.coinT[j] = b[o++];
  R.bombs.length = 0;
  for (let n = 0; o + 3 < b.length; o += 4, n++) { const x = NET.bombs[n] ||= {}; x.s = b[o]; x.d = b[o + 1]; x.h = b[o + 2]; x.t = b[o + 3]; R.bombs.push(x); }
}

function onMsg(m, from) {
  if (NET.role === 'host') {
    if (m.t === 'in') netIn(from, m.a);
    else if (m.t === 'pick') netPick(from, m.k);
    else if (m.t === 'ready') { if (m.rid === NET.rid) NET.wait?.delete(from); }
    else if (m.t === 'pause') pause(typeof m.who === 'string' ? m.who.slice(0, 3) : 'P1');
    else if (m.t === 'resume') resume();
    return;
  }
  const mine = R && m.rid === NET.race?.rid; // this race's message (a late one from the last race is dropped)
  switch (m.t) {
    case 's': {
      const B = NET.buf;
      if (!R || m.a[0] !== NET.race?.rid || (B.length && m.a[1] <= B[B.length - 1][1])) return;
      B.push(m.a);
      if (B.length > 8) B.shift();
      return;
    }
    case 'ev': if (mine) R.ev.push(...m.e); return;
    case 'lobby':
      slots.splice(0, 4, ...m.slots.map(s => s && { dev: s[0], k: s[1], locked: !!s[2] }));
      if (mySeat() >= 0) lastMover = mySeat();
      if (screen === 'lobby') drawLobby();
      return;
    case 'scr': // the host went back to its menus: wait in the lobby
      if (m.s !== 'race' && m.s !== 'results' && screen !== 'lobby') { closeDlgs(); if (R) leaveRace(); GP = null; show('lobby'); }
      return;
    case 'race': closeDlgs(); NET.race = m; show('race'); return;
    case 'res':
      if (!mine) return;
      m.k.forEach(([place, fin, ft, dnf], i) => Object.assign(R.karts[i], { place, finished: !!fin, finishT: ft, dnf: !!dnf }));
      GP = m.gp;
      showResults();
      return;
    case 'pause': pause(m.who, null, true); return;
    case 'resume': if ($('#pauseDlg').open) { NET.quiet = true; resume(); } return;
  }
}
// the link ended (Leave, Back to menu, a guest's Quit): seats on other phones go, a guest gets its own settings back
function netEnd() {
  if (NET.role === 'guest') { Object.assign(S, NET.mine); slots.fill(null); }
  else { const keep = slots.filter(s => s && !isNet(s)); slots.fill(null); keep.forEach((s, p) => { slots[p] = s; }); }
  Object.assign(NET, { role: null, me: 0, n: 0, race: null, mine: null, kart: -1, wait: null });
  NET.buf.length = 0; NET.ev.length = 0;
  document.body.classList.remove('linked', 'guest');
  closeDlgs();
  if (R) leaveRace();
  GP = null;
  show('title');
}
const linkOpts = {
  game: 'anirace', max: 3, min: 1, lang: () => S.lang,
  name: i => `P${slots.findIndex(s => s?.dev === 'net' + i) + 1 || i + 1}`,
  onStart(n, me) {
    Object.assign(NET, { role: me ? 'guest' : 'host', me, n, race: null, in: [], itemN: 0, inSeq: 0, inKey: '', wait: null });
    NET.buf.length = 0; NET.ev.length = 0;
    document.body.classList.add('linked');
    if (me) { // guest: the host's lobby, then its races
      NET.mine = cfg();
      document.body.classList.add('guest');
      slots.fill(null);
      closeDlgs(); if (R) leaveRace(); GP = null;
      show('lobby');
    } else if (screen === 'title') show('mode');
    else renderLobby(); // seats the phones and sends them the lobby, wherever the host is
  },
  onMsg,
  onLeave() { closeDlgs(); stopLoop(); }, // the "disconnected" notice must not sit under a modal dialog; its Back to menu runs onMenu
  onMenu: netEnd,
};
document.querySelectorAll('.link-btn').forEach(b => b.onclick = () => Coop.open(linkOpts)); // (menu buttons click on their own)

// ---------- boot ----------
// audio may only start from a user gesture (autoplay policy); init() is idempotent and resumes iOS-interrupted contexts
function unlock() { sfx.init(); sfx.startMusic(); }
addEventListener('pointerdown', unlock, true);
addEventListener('touchend', unlock, true); // iOS unlocks audio on touchend, not touchstart
addEventListener('contextmenu', e => { if (!e.target.closest('input')) e.preventDefault(); }); // long-press menus (Android)
addEventListener('gesturestart', e => e.preventDefault()); // iOS Safari pinch-zooms despite user-scalable=no
addEventListener('keydown', unlock, true);
document.addEventListener('visibilitychange', () => sfx.pause(document.hidden));
sfx.setMusic('custom');
setVol('music', S.music);
setVol('sfx', S.sfx);
applyI18n();

// boot splash: up 1.4s at least so the banner registers, lifted once it has loaded (3s at most); a tap skips it
const splash = $('#splash');
if (splash) {
  const art = splash.querySelector('.art');
  const lift = () => { splash.classList.add('out'); setTimeout(() => splash.remove(), 450); };
  const loaded = !art || art.complete ? Promise.resolve() : new Promise(r => { art.addEventListener('load', r); art.addEventListener('error', r); });
  Promise.race([loaded, new Promise(r => setTimeout(r, 3000 - performance.now()))])
    .then(() => setTimeout(lift, 1400 - performance.now()));
  splash.addEventListener('click', lift);
}

if (DEBUG) import('three').then(T => console.log('three r' + T.REVISION));

// ?zoo: all 20 racers lined up next to their SVG faces, for checking the 3D builds against the icons
if (new URLSearchParams(location.search).has('zoo')) {
  splash?.remove();
  const ov = document.body.appendChild(el('div', 'zoo-dbg'));
  ensureWorld();
  world.mount(ov);
  world.zoo(COLORS);
  const labels = COLORS.map((c, k) => ov.appendChild(el('div', 'zl', face(k) + `<b style="color:${c}">${t('player', k + 1)}</b>`)));
  let last = performance.now(), t0 = last;
  const loop = now => {
    requestAnimationFrame(loop);
    world.renderZoo(Math.min(0.1, (now - last) / 1000), (now - t0) / 1000, new URLSearchParams(location.search).get('zoo') === 'front').forEach(([x, y], k) => { labels[k].style.translate = `${x}px ${y}px`; });
    last = now;
  };
  requestAnimationFrame(loop);
}

// ?shot=<track>: a beauty shot of the track for its banner art (track cards, splash), no UI. Debug only
const SHOT = new URLSearchParams(location.search).get('shot');
const SHOTS = { // where the camera sits (lap fraction), how far ahead of the pack, to the side, how high, field of view
  toy: { f: 0.3, ahead: 8, side: -3, h: 2.6, look: 14, lookH: 2.4, fov: 48 },
  neon: { f: 0.11, ahead: 8, side: 2.5, h: 2.2, look: 16, lookH: 2.8, fov: 50 },
  story: { f: 0.62, ahead: 8, side: -2.5, h: 4.2, look: 12, lookH: 1.6, fov: 48 },
  fest: { f: 0.47, ahead: 8, side: 2.5, h: 2.2, look: 16, lookH: 3, fov: 50 },
};
if (SHOT && TRACK_DEFS[SHOT]) {
  splash?.remove();
  document.body.classList.add('shooting');
  ensureWorld();
  if (!new URLSearchParams(location.search).has('tier')) world.setTier('high');
  const host = document.body.appendChild(el('div', 'shot-host'));
  world.mount(host);
  const def = TRACK_DEFS[SHOT], T = buildTrack(def), o = SHOTS[SHOT], s0 = o.f * T.L;
  const animals = [0, 5, 4, 3, 1, 15, 7], karts = animals.map((a, i) => Object.assign(newKart(i, a, -1), { color: COLORS[a] }));
  const Rs = newRace(T, { grid: false, laps: 99, seed: 3, karts });
  // they start ~14 m back: 40 frames at speed bring them into frame with their trails stretched out
  karts.forEach((k, j) => { k.s = s0 - 14.5 - j * 2.8 - (j % 2) * 1.2; k.d = ((j % 3) - 1) * 2.8 + (j % 2 ? 0.7 : -0.5); k.lap = 0; k.half = false; k.v = Rs.top * 0.95; k.yaw = 0; k.item = null; });
  karts[1].boost = 1.5; karts[3].drift = -1; karts[3].tier = 3;
  world.loadTrack(T, karts);
  world.setShot({ ...o, s: s0 });
  let n = 0;
  const loop = () => { // let them drive into frame so the trails stretch out, then hold still
    if (n++ < 40) { advance(Rs, 1 / 60, []); Rs.ev.length = 0; world.sync(Rs, 1 / 60); }
    world.render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

titleStage(true);

if ('serviceWorker' in navigator && window.isSecureContext) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
