import * as sfx from './audio.js';
import { TRACKS, MODS, DEFAULT_MODS, fitMods, fits, ratioSplit, billSplit, teamSplit, makeTrack, splitsOf } from './track.js';

const COLORS = ['#ff5d8f', '#4fd8ff', '#ffb547', '#b98bff', '#5dffb0', '#ff7a5c', '#7c9cff', '#ffe45e', '#ff9de6', '#9dff5d',
  '#2ee6d6', '#ff4766', '#d6c8ff', '#d89a6a', '#8f6bff', '#e45cff', '#e8eef8', '#ffc0a0', '#5db8ff', '#ff9a3d'];
const MAX = 20; // players; one marble per animal, so all 20 can race
// players are always animals: animal k = SVG symbol #a{k} in index.html, wears COLORS[k]
const animal = names => n => names[n - 1];

const I18N = {
  en: {
    title: 'Marble Racing',
    players: 'Players', results: 'Results by place', presets: 'Quick fill',
    pWin: 'Winner', pRank: 'Rank', pRatio: 'Ratio', pTeam: 'Teams', pPen: 'Penalty', pBill: 'Bill', winners: 'Winners', teams: 'Teams', pens: 'Penalties', total: 'Total', frees: 'Pays 0', minPay: 'Min. {n} each', zeros: '0% slots', any: 'Random', pClear: 'Clear', start: 'Start',
    player: animal(['Rabbit', 'Penguin', 'Tiger', 'Cat', 'Panda', 'Fox', 'Dog', 'Lion', 'Bear', 'Frog', 'Koala', 'Pig', 'Mouse', 'Monkey', 'Owl', 'Chick', 'Cow', 'Sheep', 'Raccoon', 'Hamster']), win: 'WIN!', lose: 'Pass', pen: 'Penalty', safe: 'Safe', team: 'Team {n}', rank: n => n + (['st', 'nd', 'rd'][n - 1] || 'th'), // places 1-20 only
    peek: 'New course!', ready: 'GET READY!', building: 'Building the course', race: 'Race!', go: 'GO!', ff: 'Fast forward', follow: 'Follow {n}',
    again: 'New', reset: 'Reset', summary: 'Results', close: 'Close', replay: 'Replay', install: 'Install app',
    music: 'Music', bgm: 'BGM', fx: 'EFFECT', sfx: 'Sound effects', volume: 'Volume', lang: 'Language', more: 'Add player', less: 'Remove player',
    track: 'Track', hShort: 'Short', hMedium: 'Medium', hLong: 'Long',
    // tooltip markup: [m:..] race length, [s:..] pegs, [d:..] ramps, [w:..] wormhole, [c:..] carousel, [f:..] mist tube, [a:..] bowl, [j:..] joker, [o:..] odds row (coloured in CSS)
    tipShort: 'Short: quick race [m:~25s]\nup to 3 mods + [a:Bowl] + [j:Joker]', tipMedium: 'Medium: standard race [m:~30s]\nup to 5 mods + [a:Bowl] + [j:Joker]',
    tipLong: 'Long: epic race [m:~50s]\nup to 7 mods + [a:Bowl] + [j:Joker]',
    tipHelp: 'How do mods work?', tipFeat: 'Pick a length, then tap the mods under it [o:S 3 · M 5 · L 7 slots]\nTap one again for another, up to its max; one more tap clears it\nMore than the course has room for? It grows by a lap\n[d:Random]: a fresh set every race, as many as fit\n[s:Pegs] come on every course: 2-4 boards on the free sides\n[a:Bowl] comes on every course: one free, no slot; tap it for another (Medium, Long)\n[j:Joker] At the end, its player trades results with another (or rolls their own and stays) [o:60% · 5+ players: 2 jokers 10%]',
    mods: 'Mods', modRand: 'Random mods every race', modMax: 'up to {n} · tap again to add', slotsLeft: '{n} slots left', modNames: {
      carousel: ['Carousel', 'Ride the spinning ring, roll out the far side'], wormhole: ['Wormhole', 'Drop into the small hole, pop out of its twin further down. Easy to miss'],
      trap: ['Trap Route', 'Roll over the orange pad before a turn and get flicked onto a lane that goes the long way round'], mist: ['Mist Tube', 'Frosted glass hides who is ahead, and inside every marble meets its own gust: a tailwind pushes it on, a headwind holds it back. The order can change before they come out'],
      boomerang: ['Boomerang', 'A boost pad, a steep drop and a giant half-pipe: marbles swing up and down its walls, once or many times, then roll out past a few pegs'],
      basin: ['Bowl', 'Every course has one free; this adds another. A booster flings marbles into a waterslide bowl: they swirl round under its curled rim and drop down the drain in the middle'],
      whirlpool: ['Whirlpool', 'A giant bowl: the current spins every marble round the wall'], roulette: ['Wormhole Roulette', 'A funnel nobody can miss. The spinning wheel picks the exit'],
      fork: ['Fork Switch', 'A signal before a turn flips between Express, Main and Long'],
      ramp: ['Ramp', 'A steep drop on a straight: marbles pick up speed'],
      jump: ['Jump', 'A kicker throws marbles over a gap onto a wide landing. Fly through the glowing hoop for a boost'], boost: ['Boost', 'Arrow pads fling marbles forward'],
      narrow: ['Narrow Helix', 'Three glass tubes: the middle one runs straight, the two side ones coil round it the long way'], trapdoor: ['Trapdoor', 'Trap lids open, falls to side track'],
      mud: ['Mud', 'A brown patch on a straight slows any marble that rolls through. Some slip past'] },
    joker: 'Joker swap!', stay: 'STAYING!', lucky: 'LUCKY SWAP!', unlucky: 'UNLUCKY SWAP!', wormhole: 'Wormhole!', trap: 'TRAP!', carousel: 'Carousel!', boomerang: 'BOOMERANG!', bowl: 'BOWL!', out: 'OUT!', ouch: 'OUCH!', attack: 'ATTACK!',
    boost: 'BOOST!', mud: 'MUD!', jump: 'JUMP!', hoop: 'HOOP!', hidden: 'HIDDEN!', tailwind: 'TAILWIND!', headwind: 'HEADWIND!', nudge: 'NUDGE!', photo: 'PHOTO FINISH!',
    whirl: 'WHIRLPOOL!', letgo: 'LET GO!', jackpot: 'JACKPOT!', next: 'NEXT!', lost: 'LOST!', express: 'EXPRESS!', main: 'MAIN!', longway: 'LONG WAY!', gulp: 'GULP!', back: 'BACK!', shortcut: 'SHORTCUT!', spiral: 'SPIRAL!', roulette: 'ROULETTE',
    finished: '{a} finished {p} — {r}', time: '{n}s', seed: 'Track #{n}',
    splits: 'Splits', vsLast: '▲▼ vs last race', goal: 'Finish', runs: 'Race record', noRuns: 'No races yet', nP: '{n} players',
    link: 'Phone link', watching: 'Watching',
    ios1: 'Tap Share (in Safari on iOS 26 it sits under ⋯)', ios2: 'Choose "Add to Home Screen"', ios3: 'Open Marbles from your home screen: full screen, and it plays offline',
  },
  ko: {
    title: '구슬 레이스',
    players: '참가자', results: '순위별 결과', presets: '빠른 입력',
    pWin: '당첨', pRank: '순위', pRatio: '비율', pTeam: '팀', pPen: '벌칙', pBill: '정산', winners: '당첨 수', teams: '팀 수', pens: '벌칙 수', total: '총액', frees: '면제 수', minPay: '1인 최소 {n}', zeros: '0% 수', any: '랜덤', pClear: '비우기', start: '시작',
    player: animal(['토끼', '펭귄', '호랑이', '고양이', '판다', '여우', '강아지', '사자', '곰', '개구리', '코알라', '돼지', '생쥐', '원숭이', '부엉이', '병아리', '젖소', '양', '라쿤', '햄스터']), win: '당첨!', lose: '꽝', pen: '벌칙', safe: '통과', team: '{n}팀', rank: '{n}등',
    peek: '새 코스!', ready: '준비!', building: '코스 만드는 중', race: '출발!', go: 'GO!', ff: '빨리 감기', follow: '{n} 따라가기',
    again: '새 판', reset: '리셋', summary: '결과', close: '닫기', replay: '다시', install: '앱 설치',
    music: '음악', bgm: '배경음', fx: '효과음', sfx: '효과음', volume: '볼륨', lang: '언어', more: '참가자 추가', less: '참가자 삭제',
    track: '코스', hShort: '짧게', hMedium: '보통', hLong: '길게',
    tipShort: '짧게: 빠른 레이스 [m:~25초]\n장치 최대 3개 + [a:보울] + [j:조커]', tipMedium: '보통: 기본 레이스 [m:~30초]\n장치 최대 5개 + [a:보울] + [j:조커]',
    tipLong: '길게: 대장정 [m:~50초]\n장치 최대 7개 + [a:보울] + [j:조커]',
    tipHelp: '장치는 어떻게 고르나요?', tipFeat: '길이를 고른 뒤 아래 장치를 눌러 추가 [o:S 3 · M 5 · L 7칸]\n다시 누르면 하나 더, 최대에서 한 번 더 누르면 해제\n코스에 자리가 모자라면 한 바퀴 늘어남\n[d:랜덤]: 매 판 새로 뽑음, 들어가는 만큼\n[s:핀] 보드는 모든 코스에 기본 2~4개\n[a:보울]은 모든 코스에 기본 1개 (칸 차지 안 함), 눌러서 하나 더 (보통, 길게)\n[j:조커] 마지막에 조커 자리 주인이 다른 사람과 결과를 바꿈 (자기 자리가 나오면 그대로) [o:60% · 5명 이상: 조커 2장 10%]',
    mods: '장치', modRand: '매 판 랜덤 장치', modMax: '최대 {n}개 · 다시 누르면 추가', slotsLeft: '{n}칸 남음', modNames: {
      carousel: ['회전목마', '도는 고리를 타고 반대편으로 굴러 나감'], wormhole: ['웜홀', '작은 구멍에 빠지면 더 아래 짝 구멍에서 튀어나옴. 놓치기 쉬움'],
      trap: ['함정 길', '커브 앞 주황 발판을 밟으면 바깥 레인으로 튕겨 나가 먼 길을 돌아감'], mist: ['안개 터널', '젖빛 유리 속에서는 누가 앞서는지 안 보임. 안에서는 구슬마다 다른 바람을 만남: 순풍은 밀어 주고 역풍은 붙잡음. 나올 때 순위가 바뀔 수도'],
      boomerang: ['부메랑', '부스트 발판과 가파른 낙하 끝 거대한 하프파이프: 구슬이 양쪽 벽을 한 번 또는 여러 번 오르내린 뒤 핀 사이로 빠져나감'],
      basin: ['보울', '모든 코스에 기본 1개, 누르면 하나 더. 부스터가 워터슬라이드 보울로 구슬을 날려 보냄: 말려 들어간 가장자리 아래를 빙글빙글 돌다가 가운데 배수구로 쏙'],
      whirlpool: ['소용돌이', '거대한 보울: 물살이 모든 구슬을 벽을 따라 빙글빙글 돌림'], roulette: ['웜홀 룰렛', '아무도 피할 수 없는 깔때기. 도는 룰렛이 출구를 정함'],
      fork: ['갈림길 신호', '커브 앞 신호가 급행·본선·우회를 번갈아 켬'],
      ramp: ['경사로', '직선 구간의 가파른 내리막: 구슬이 빨라짐'],
      jump: ['점프', '발판이 구슬을 틈 너머 넓은 착지대로 날려 보냄. 빛나는 링을 통과하면 부스트'], boost: ['부스트', '화살표 발판이 구슬을 앞으로 밀어 줌'],
      narrow: ['좁은 나선', '유리관 세 개: 가운데 관은 곧게, 양옆 두 관은 가운데를 휘감아 먼 길로'], trapdoor: ['함정문', '함정 뚜껑이 열리면 옆길로 떨어짐'],
      mud: ['진흙', '직선 구간의 갈색 진흙: 지나가는 구슬이 느려짐. 비켜 가기도 함'] },
    joker: '조커 교환!', stay: '그대로!', lucky: 'Lucky!', unlucky: 'Unlucky!', wormhole: '웜홀!', trap: '함정!', carousel: '회전목마!', boomerang: '부메랑!', bowl: '보울!', out: '탈출!', ouch: '아야!', attack: '공격!',
    boost: '부스트!', mud: '진흙!', jump: '점프!', hoop: '링 통과!', hidden: '숨었다!', tailwind: '순풍!', headwind: '역풍!', nudge: '영차!', photo: '사진 판정!',
    whirl: '소용돌이!', letgo: '풀려났다!', jackpot: '잭팟!', next: '넥스트!', lost: '로스트!', express: '급행!', main: '본선!', longway: '우회!', gulp: '꿀꺽!', back: '복귀!', shortcut: '지름길!', spiral: '빙글빙글!', roulette: '룰렛',
    finished: '{a} {p} 골인 — {r}', time: '{n}초', seed: '코스 #{n}',
    splits: '구간 순위', vsLast: '▲▼ 지난 판 대비', goal: '골', runs: '경주 기록', noRuns: '아직 기록이 없어요', nP: '{n}명',
    link: '폰 연결', watching: '관전 중',
    ios1: '공유 버튼 누르기 (iOS 26 Safari는 ⋯ 안에 있어요)', ios2: '"홈 화면에 추가" 고르기', ios3: '홈 화면의 Marbles 실행: 전체 화면에 오프라인에서도 돼요',
  },
  ja: {
    title: 'ビー玉レース',
    players: 'プレイヤー', results: '順位別の結果', presets: 'クイック入力',
    pWin: '当たり', pRank: '順位', pRatio: '割合', pTeam: 'チーム', pPen: '罰ゲーム', pBill: '割り勘', winners: '当たり数', teams: 'チーム数', pens: '罰ゲーム数', total: '合計', frees: '免除数', minPay: '1人最低{n}', zeros: '0%数', any: 'ランダム', pClear: 'クリア', start: 'スタート',
    player: animal(['ウサギ', 'ペンギン', 'トラ', 'ネコ', 'パンダ', 'キツネ', 'イヌ', 'ライオン', 'クマ', 'カエル', 'コアラ', 'ブタ', 'ネズミ', 'サル', 'フクロウ', 'ヒヨコ', 'ウシ', 'ヒツジ', 'アライグマ', 'ハムスター']), win: '当たり！', lose: 'はずれ', pen: '罰ゲーム', safe: 'セーフ', team: 'チーム{n}', rank: '{n}位',
    peek: '新しいコース！', ready: 'よーい！', building: 'コースを作成中', race: 'スタート！', go: 'GO!', ff: '早送り', follow: '{n}を追う',
    again: '新規', reset: 'リセット', summary: '結果', close: '閉じる', replay: 'もう一度', install: 'アプリをインストール',
    music: '音楽', bgm: 'BGM', fx: '効果音', sfx: '効果音', volume: '音量', lang: '言語', more: 'プレイヤーを追加', less: 'プレイヤーを削除',
    track: 'コース', hShort: '短い', hMedium: '普通', hLong: '長い',
    tipShort: '短い: すぐ終わる [m:約25秒]\nギミック最大3つ＋[a:ボウル]＋[j:ジョーカー]', tipMedium: '普通: 標準レース [m:約30秒]\nギミック最大5つ＋[a:ボウル]＋[j:ジョーカー]',
    tipLong: '長い: 大レース [m:約50秒]\nギミック最大7つ＋[a:ボウル]＋[j:ジョーカー]',
    tipHelp: 'ギミックの選び方', tipFeat: '長さを選び、下のギミックを押して追加 [o:S 3 · M 5 · L 7枠]\nもう一度押すともう1つ、最大でもう一度押すと解除\nコースに入りきらないと1周のびる\n[d:ランダム]：毎レース新しく抽選、入るだけ\n[s:ピン]ボードは全コースに標準で2〜4つ\n[a:ボウル]は全コースに標準で1つ（枠なし）、押すともう1つ（普通・長い）\n[j:ジョーカー] 最後にジョーカー枠の人が他の人と結果を交換（自分の枠が出たらそのまま）[o:60% · 5人以上: ジョーカー2枚 10%]',
    mods: 'ギミック', modRand: '毎レースランダムなギミック', modMax: '最大{n}つ · もう一度押すと追加', slotsLeft: '残り{n}枠', modNames: {
      carousel: ['回転木馬', '回る輪に乗って反対側へ転がり出る'], wormhole: ['ワームホール', '小さな穴に落ちると、下の対の穴から飛び出す。外しやすい'],
      trap: ['トラップルート', 'カーブ手前のオレンジの床を踏むと外側のレーンへ弾かれ、遠回りする'], mist: ['霧のトンネル', 'すりガラスの中は順位が見えない。中ではビー玉ごとに違う風が吹く：追い風は押し、向かい風は引き止める。出てくるときには順位が変わっているかも'],
      boomerang: ['ブーメラン', 'ブースト床と急な坂の先に巨大なハーフパイプ：ビー玉が両側の壁を一度か何度も往復し、ピンの間を抜けていく'],
      basin: ['ボウル', '全コースに標準で1つ、押すともう1つ。ブースターでウォータースライダーのボウルへ：内側に巻いたふちの下をぐるぐる回り、真ん中の排水口へストン'],
      whirlpool: ['うず潮', '巨大なボウル：水流がビー玉を壁沿いにぐるぐる回す'], roulette: ['ワームホール・ルーレット', '誰も避けられない漏斗。回るルーレットが出口を決める'],
      fork: ['分岐シグナル', 'カーブ手前の信号が急行・本線・遠回りを切り替える'],
      ramp: ['坂', '直線の急な下り坂：ビー玉が加速する'],
      jump: ['ジャンプ', 'ジャンプ台が隙間の向こうの広い着地台へ飛ばす。光るリングをくぐるとブースト'], boost: ['ブースト', '矢印の床がビー玉を前へ押し出す'],
      narrow: ['細いらせん', 'ガラス管が3本：真ん中はまっすぐ、両側の2本は真ん中に巻きついて遠回り'], trapdoor: ['落とし戸', 'ふたが開くと脇道へ落ちる'],
      mud: ['泥', '直線の茶色い泥：通るビー玉が遅くなる。よけることも'] },
    joker: 'ジョーカー交換！', stay: 'そのまま！', lucky: 'Lucky!', unlucky: 'Unlucky!', wormhole: 'ワームホール！', trap: 'トラップ！', carousel: '回転木馬！', boomerang: 'ブーメラン！', bowl: 'ボウル！', out: 'アウト！', ouch: 'いてっ！', attack: 'アタック！',
    boost: 'ブースト！', mud: 'どろんこ！', jump: 'ジャンプ！', hoop: 'リング！', hidden: 'かくれた！', tailwind: '追い風！', headwind: '向かい風！', nudge: 'えいっ！', photo: '写真判定！',
    whirl: 'うず潮！', letgo: 'はなれた！', jackpot: 'ジャックポット！', next: 'ネクスト！', lost: 'ロスト！', express: '急行！', main: '本線！', longway: '遠回り！', gulp: 'パクッ！', back: '復帰！', shortcut: '近道！', spiral: 'ぐるぐる！', roulette: 'ルーレット',
    finished: '{a}が{p}でゴール — {r}', time: '{n}秒', seed: 'コース #{n}',
    splits: '区間順位', vsLast: '▲▼ 前回比', goal: 'ゴール', runs: 'レース記録', noRuns: 'まだ記録がありません', nP: '{n}人',
    link: 'スマホ接続', watching: '観戦中',
    ios1: '共有ボタンをタップ（iOS 26のSafariは⋯の中）', ios2: '「ホーム画面に追加」を選ぶ', ios3: 'ホーム画面のMarblesを開く：全画面で、オフラインでも遊べます',
  },
};

// ---------- state ----------
const KEY = 'marble-racing.v1';
const saved = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const navLang = (navigator.language || 'en').slice(0, 2);
const S = {
  lang: I18N[saved.lang] ? saved.lang : I18N[navLang] ? navLang : 'en',
  n: clamp(+saved.n || 4, 2, MAX),
  track: saved.track in TRACKS ? saved.track : 'medium',
  mods: Object.fromEntries(Object.keys(TRACKS).map(k => [k, saved.mods?.[k] ? fitMods(k, saved.mods[k]) : { ...DEFAULT_MODS[k] }])), // picks per length
  modRand: !!saved.modRand, // random mods every race instead of the picks
  results: Array.isArray(saved.results) ? saved.results : [],
  preset: 'preset' in saved ? saved.preset : 'win', // 'win' | 'pen' | 'rank' | 'ratio' | 'bill' | 'team' | null (custom results)
  ratio: Array.isArray(saved.ratio) ? saved.ratio : [],
  // ponytail: Penalty shares the Winner count, only one preset is live at a time
  winners: Number.isInteger(saved.winners) ? saved.winners : 1, // win: first W places win; pen: last W places get the penalty
  zeros: Number.isInteger(saved.zeros) ? saved.zeros : null, // ratio/bill: fixed number of 0% / pays-0 places, null = random
  cur: saved.cur, // bill: currency, picked below once the language is known
  total: Number.isInteger(saved.total) ? saved.total : 0, // bill: amount to split
  bill: Array.isArray(saved.bill) ? saved.bill : [], // bill: amount per place
  teams: Number.isInteger(saved.teams) ? saved.teams : 2, // team: how many teams
  teamOf: Array.isArray(saved.teamOf) ? saved.teamOf : [], // team: team index per place
  music: saved.musicV2 ? saved.music ?? 50 : 50, // music output got quieter per step (LADDER v1.123): older saved levels reset once
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
// race record: every finished race, newest first, kept apart from the settings. { no, d: date ms, tr: length, n,
// w: winning time | null, p: { [animal]: [place at split 1, 2, 3, at the finish] } }, places from 0, -1 = never got there
const RKEY = 'marble-racing.runs', RUNS = 30;
const runs = (() => { try { const r = JSON.parse(localStorage.getItem(RKEY)); return Array.isArray(r) ? r.filter(x => x?.p && x.tr in TRACKS) : []; } catch { return []; } })();

// t('rank', 3), t('time', '24.31'), t('finished', { a, p, r }): {x} placeholders take n, or n[x] when n is an object
const t = (k, n) => {
  const v = I18N[S.lang][k] ?? I18N.en[k];
  return typeof v === 'function' ? v(n) : v.replace(/\{(\w)\}/g, (_, x) => typeof n === 'object' ? n[x] : n);
};
const range = n => Array.from({ length: n }, (_, i) => i);
const shuffle = a => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
// splits come from track.js (pure, so test.mjs can check them): ratio in 5% steps, none over 50%; bill in whole
// currency steps ($5 / ₩1,000 / ¥100) adding up to the total exactly
const rollRatio = () => {
  if (S.zeros != null) S.zeros = clamp(S.zeros, 0, S.n - 2); // at least 2 non-zero places to stay <= 50%
  S.ratio = ratioSplit(S.n, S.zeros, Math.random);
};
const rollBill = () => {
  if (S.zeros != null) S.zeros = clamp(S.zeros, 0, S.n - 1);
  S.bill = billSplit(S.total, CUR[S.cur][1], S.n, S.zeros, Math.random);
};
// results map to finishing place: result k goes to whoever finishes k-th (k = 0 is 1st)
const marks = () => S.preset === 'win' || S.preset === 'pen'; // a few marked places, the rest plain
// re-roll splits saved by older versions or not matching the chosen 0% count
if (S.preset === 'ratio' && (S.ratio.length !== S.n || S.ratio.some(v => v % 5 || v > 50) ||
  (S.zeros != null && S.ratio.filter(v => !v).length !== S.zeros))) rollRatio();
if (S.preset === 'bill' && (S.bill.length !== S.n || S.bill.reduce((a, b) => a + b, 0) !== S.total)) rollBill();
// team: sizes differ by at most one, members scattered over the places
const maxTeams = () => Math.max(2, S.n >> 1);
const rollTeams = () => { S.teams = clamp(S.teams, 2, maxTeams()); S.teamOf = teamSplit(S.n, S.teams, Math.random); };
const reroll = () => ({ ratio: rollRatio, bill: rollBill, team: rollTeams }[S.preset] || (() => {}))();
// ponytail: whole amounts only, no cents
const money = v => CUR[S.cur][0] + v.toLocaleString(S.lang);
// Winner: the first W places win. Penalty: the last W places get it (a race's losers are its tail)
const isMarked = k => S.preset === 'win' ? k < S.winners : k >= S.n - S.winners;
const presetVals = () => range(S.n).map(k => S.preset === 'win' ? t(isMarked(k) ? 'win' : 'lose')
  : S.preset === 'pen' ? t(isMarked(k) ? 'pen' : 'safe')
  : S.preset === 'rank' ? t('rank', k + 1)
  : S.preset === 'team' ? t('team', String.fromCharCode(65 + S.teamOf[k]))
  : S.preset === 'bill' ? money(S.bill[k]) : S.preset === 'ratio' ? S.ratio[k] + '%' : '');
// players get the first n of all animals: reshuffled on every page load, never saved
const ZOO = shuffle(range(COLORS.length));
const pc = i => COLORS[ZOO[i]]; // player colour = their animal's colour
const animalName = i => t('player', ZOO[i] + 1);
// blinking: each animal gets its own blink period / offset, and 1 in 3 blinks twice; read by .e in style.css
const blinkVars = () => `--bt:${(3 + Math.random() * 4).toFixed(2)}s;--bd:${(-Math.random() * 7).toFixed(2)}s${Math.random() < 0.33 ? ';--bk:blink2' : ''}`;
// animal z (not player i): the race and the summary work with animals directly
const faceZ = z => `<svg class="ani" style="${blinkVars()}" aria-hidden="true"><use href="#a${z}"/></svg>`;
const nameZ = z => `${faceZ(z)} ${t('player', z + 1)}`; // HTML
const face = i => faceZ(ZOO[i]);
const resultOf = k => (S.preset ? presetVals()[k] : S.results[k]?.trim()) || '—';
// quick fill results show as toy-like 3D glyphs (#g-* in index.html), the text kept for screen readers;
// rank / team carry their number or letter on the glyph, ratio / bill keep the value as a caption
const gly = (id, tint) => `<svg aria-hidden="true"${tint ? ` style="color:${tint}"` : ''}><use href="#g-${id}"/></svg>`;
const MEDAL = ['#ffd54a', '#dfe3f5', '#e8955a']; // 1st-3rd, then plain purple
const glyph = k => {
  const v = resultOf(k), p = S.preset, sr = `<span class="sr">${v}</span>`;
  if (marks()) return gly(isBig(k) ? p : p === 'win' ? 'pass' : 'safe') + sr;
  if (p === 'rank') return gly('rank', MEDAL[k] || '#b98bff') + `<em style="top:62%">${k + 1}</em>` + sr;
  if (p === 'team') return gly('team', COLORS[S.teamOf[k]]) + `<em style="top:50%">${String.fromCharCode(65 + S.teamOf[k])}</em>` + sr;
  if (p === 'bill') return gly('bill') + `<i>${v}</i>`;
  // ratio: a pie disc filled to the share
  return `<svg aria-hidden="true" viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="#5a4a96" stroke="#e6dcff" stroke-opacity=".5"/><circle cx="16" cy="16" r="5.5" fill="none" stroke="${isBig(k) ? '#ffd54a' : '#5dffb0'}" stroke-width="11" stroke-dasharray="${S.ratio[k] * .3456} 99" transform="rotate(-90 16 16)"/><circle cx="16" cy="16" r="11" fill="url(#gb)"/></svg><i>${v}</i>`;
};
S.winners = clamp(S.winners, 1, S.n - 1);
if (S.preset === 'team' && (S.teamOf.length !== S.n || Math.max(...S.teamOf) + 1 !== S.teams)) rollTeams();
// spotlight: winners, 1st place, biggest share; penalties and the biggest payer get it too, in the "bad" style
const share = k => S.preset === 'bill' ? S.bill[k] : S.ratio[k]; // ratio / bill only
const isBig = k => marks() ? isMarked(k) : S.preset === 'rank' ? k === 0
  : (S.preset === 'ratio' || S.preset === 'bill') && share(k) === Math.max(...range(S.n).map(share)); // ties all count
const isBad = () => S.preset === 'pen' || S.preset === 'bill';
// best-first sort key for the summary (teams: grouped A, B, C...; penalties: the spotlight group first);
// custom results keep the place order
const slotRank = k => S.preset === 'ratio' || S.preset === 'bill' ? -share(k) + k * 1e-3 : marks() ? (isBig(k) ? k - MAX : k)
  : S.preset === 'team' ? S.teamOf[k] * MAX + k : k;
// jokers: on every length 60% of races have one, on a random place; with 5+ players 10% of races (out of that 60%)
// have two, on different places. None when every result reads the same (a swap would change nothing). Not on the
// sim path, so Math.random is fine here
const JOKER2 = 0.1;
const jokerPlaces = () => {
  const r = Math.random(), k = S.n >= 5 && r < JOKER2 ? 2 : r < TRACKS[S.track].joker ? 1 : 0;
  return new Set(range(S.n).map(resultOf)).size > 1 ? shuffle(range(S.n)).slice(0, k) : [];
};

const $ = s => document.querySelector(s);
const el = (tag, cls) => Object.assign(document.createElement(tag), { className: cls || '' });
const [setup, race, entries, chips, cards, summary] = ['#setup', '#race', '#entries', '#chips', '#cards', '#summary'].map($);

// ---------- setup screen ----------
function renderEntries() {
  const vals = S.preset ? presetVals() : S.results;
  // players: tiny animal cards in their colour; results: their own card grid, one per finishing place
  $('#zoo').replaceChildren(...range(S.n).map(i => {
    const li = el('li');
    li.style.setProperty('--c', pc(i));
    li.style.setProperty('--i', i); // idle hop stagger
    li.innerHTML = `${face(i)}<span>${animalName(i)}</span>`;
    return li;
  }));
  entries.replaceChildren(...range(S.n).map(i => {
    const li = el('li');
    li.innerHTML = `<span class="no">${t('rank', i + 1)}</span><input data-k="results" data-i="${i}" maxlength="12" autocomplete="off" spellcheck="false" enterkeyhint="next">`;
    const b = li.querySelector('input');
    b.value = vals[i] ?? ''; b.placeholder = '—'; b.setAttribute('aria-label', `${t('results')} ${t('rank', i + 1)}`);
    // quick fill tint on the whole card: team colour, gold spotlight, red for penalty / biggest payer
    const tone = !S.preset ? '' : S.preset === 'team' ? COLORS[S.teamOf[i]] : isBig(i) ? isBad() ? '#ff4d5e' : '#ffd54a' : '';
    if (tone) { li.classList.add('hi'); li.style.setProperty('--c', tone); }
    // quick fill shows the result glyph over the field; focusing it brings the text back for editing
    if (S.preset) li.insertAdjacentHTML('beforeend', `<span class="gl" aria-hidden="true">${glyph(i)}</span>`);
    return li;
  }));
  $('#count').value = S.n;
  $('#minus').disabled = S.n <= 2;
  $('#plus').disabled = S.n >= MAX;
  markPresets();
  document.querySelectorAll('[data-track]').forEach(b => b.setAttribute('aria-pressed', b.dataset.track === S.track));
  renderMods();
  // touch screens can't hover: spell out the chosen track under the row (buttons already announce it)
  $('#trackTip').innerHTML = $(`[data-track="${S.track}"] .tip`).innerHTML.replace('\n', ' · ');
  // preset sub-row: how many winners / penalties / 0% places / teams (2 players leaves no real choice), plus the bill total
  const counts = range(S.n - 1).map(i => i + 1);
  const [key, opts, label = key] = { win: ['winners', counts], pen: ['winners', counts, 'pens'],
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
  if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229) return; // Enter that commits a Korean / Japanese IME word
  e.preventDefault();
  const { k, i } = e.target.dataset;
  const next = entries.querySelector(`[data-k="${k}"][data-i="${+i + 1}"]`);
  next ? next.focus() : e.target.blur();
});

const setCount = d => {
  S.n = clamp(S.n + d, 2, MAX);
  S.winners = clamp(S.winners, 1, S.n - 1); S.teams = clamp(S.teams, 2, maxTeams());
  reroll();
  sfx.ui(); save(); renderEntries();
};
$('#minus').onclick = () => setCount(-1);
$('#plus').onclick = () => setCount(1);
document.querySelectorAll('[data-track]').forEach(b => b.onclick = () => { S.track = b.dataset.track; $('#modTip').textContent = ''; sfx.ui(); save(); renderEntries(); });
// ---------- track modifications: tiny icon toggles under the length ----------
// a tap adds one more of that kind (each takes a slot) up to its max on this length; one more tap, or a tap with every
// slot taken, clears it. Touch screens can't hover: the last pick's tooltip shows under the row instead
const KCLS = { carousel: 'c', wormhole: 'w', trap: 't', mist: 'f', boomerang: 'b', basin: 'a', whirlpool: 'a', roulette: 'w', fork: 't', ramp: 'd', jump: 'd', boost: 'd', narrow: 'd', trapdoor: 't', mud: 'u' }; // tooltip colours
const markup = raw => raw.replace(/\[(\w):([^\]]*)\]/g, '<b class="k-$1">$2</b>'); // our own strings, so the swap is safe
const modMax = k => MODS[k][Object.keys(TRACKS).indexOf(S.track)];
const modName = k => (I18N[S.lang].modNames ?? I18N.en.modNames)[k];
const modTip = k => { const [name, desc] = modName(k); return `[${KCLS[k]}:${name}] ${desc}\n[o:${t('modMax', modMax(k))}]`; };
const picked = () => Object.values(S.mods[S.track]).reduce((a, v) => a + v, 0);
const modBtns = Object.keys(MODS).map(k => {
  const b = Object.assign(el('button', 'pill mod'), { type: 'button' });
  b.dataset.mod = k;
  b.innerHTML = `<svg class="mi" aria-hidden="true"><use href="#m-${k}"/></svg><b class="n" aria-hidden="true"></b><span class="tip" aria-hidden="true"></span>`;
  b.onclick = () => {
    const p = S.mods[S.track], n = p[k] || 0;
    if (n < modMax(k) && picked() < TRACKS[S.track].slots) p[k] = n + 1; else delete p[k];
    $('#modTip').innerHTML = p[k] ? markup(modTip(k)).replace('\n', ' · ') : '';
    sfx.ui(); save(); renderMods();
  };
  $('#mods').append(b);
  return b;
});
// Random: every race rolls its own mods (randomTrack), so the picks sit greyed out and every slot shows taken
$('#modRand').onclick = () => {
  S.modRand = !S.modRand;
  $('#modTip').textContent = S.modRand ? t('modRand') : '';
  sfx.ui(); save(); renderMods();
};
function renderMods() {
  const rand = S.modRand, p = rand ? {} : S.mods[S.track], slots = TRACKS[S.track].slots, used = rand ? slots : picked();
  $('#modRand').setAttribute('aria-pressed', rand);
  $('#mods').inert = rand;
  for (const b of modBtns) {
    const k = b.dataset.mod, n = p[k] || 0, [name] = modName(k);
    b.hidden = !modMax(k); // nothing to add on this length (Short's bowl: only the free one)
    b.setAttribute('aria-pressed', n > 0);
    b.classList.toggle('full', used >= slots);
    b.querySelector('.n').textContent = n && modMax(k) > 1 ? n : '';
    b.setAttribute('aria-label', n ? `${name} ×${n}` : name);
    b.querySelector('.tip').innerHTML = markup(modTip(k));
  }
  $('#slots').innerHTML = Array.from({ length: slots }, (_, i) => `<i class="${i < used ? 'on' : ''}"></i>`).join('');
  $('#slots').setAttribute('aria-label', t('slotsLeft', slots - used));
}
// keep the track tooltip on screen: centred under the group, shifted by however far it would poke past an edge (8px margin)
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

// ---------- HUD lanes and result strip (DOM only; the race fills them) ----------
// one cell per marble, at most 10 to a row; 11-20 marbles wrap to two rows with compact cards (style.css #race.rows2)
const setLanes = n => {
  race.style.setProperty('--n', n);
  race.style.setProperty('--cols', Math.min(n, 10));
  race.classList.toggle('rows2', n > 10);
};
// result strip: one card per place, glyph first, the dressed animal once filled; jokers = places carrying a joker
function renderCards(jokers) {
  cards.replaceChildren(...range(S.n).map(k => {
    const d = el('button', 'res'), b = el('b'), s = el('small');
    d.type = 'button';
    d.disabled = true;
    d.style.setProperty('--i', k); // idle hop stagger
    if (S.preset) { b.className = 'gl'; b.innerHTML = glyph(k); } else b.textContent = resultOf(k);
    // ratio: the card itself is the gauge, filled from the bottom to the share
    if (S.preset === 'ratio') { d.classList.add('gauge'); d.style.setProperty('--r', S.ratio[k]); }
    d.append(b, s);
    if (jokers.includes(k)) { d.classList.add('joker'); d.insertAdjacentHTML('beforeend', '<svg class="ic jk" aria-hidden="true"><use href="#i-joker"/></svg>'); }
    return d;
  }));
}
// quick fill: the landed animal shows bigger and dressed for its result (#x-* in index.html, drawn in the animal's
// 32x32 space; the wider viewBox leaves room for hats and props). Penalty plays a bomb that blows up and leaves soot.
const ol = (id, tint) => `<use href="#x-${id}" filter="url(#ol)"${tint ? ` style="color:${tint}"` : ''}/>`;
const dress = k => {
  const p = S.preset, big = isBig(k);
  if (p === 'win') return big ? ol('crown') : '';
  if (p === 'pen') return big ? '<g class="bomb"><use href="#g-pen" x="6" y="-14" width="20" height="20"/></g><g class="blast"><use href="#x-blast"/></g><g class="soot"><use href="#x-soot"/></g>' : '';
  if (p === 'rank') return k < 3 ? ol('cup', MEDAL[k]) : '';
  if (p === 'team') return ol('hat', COLORS[S.teamOf[k]]);
  return p === 'bill' && big ? ol('cash') : '';
};
// mood on a landed quick fill card: the trophy, 1st place and the smallest bill cheer; the bomb cries
const moodOf = k => {
  const p = S.preset;
  if (p === 'win') return isBig(k) ? ' win' : '';
  if (p === 'rank') return k === 0 ? ' win' : '';
  if (p === 'pen') return isBig(k) ? ' cry' : '';
  return p === 'bill' && share(k) === Math.min(...range(S.n).map(share)) ? ' win' : ''; // ties all cheer
};
// pupil centres [left, right] of animal z, read from its symbol
const eyes = z => [...$('#a' + z).querySelectorAll('.e [fill="#2b2140"] circle')].map(c => [+c.getAttribute('cx'), +c.getAttribute('cy')]).sort((p, q) => p[0] - q[0]);
// two drops per eye, taking turns (style.css .tear)
const tears = z => eyes(z).map(([x, y]) => [0, 0.6].map(d => `<path class="tear" style="animation-delay:${1.3 + d + (x > 16) * 0.3}s" d="M${x} ${y + 1.4}q-1.3 1.9 0 2.8q1.3-.9 0-2.8z" fill="#8fd8ff" stroke="#2b6a9a" stroke-width=".4"/>`).join('')).join('');
// animal z dressed for result k
const pet = (z, k) => {
  const mood = moodOf(k);
  return `<svg class="pet${S.preset === 'pen' && isBig(k) ? ' boom' : ''}${mood}" style="${blinkVars()}" viewBox="-6 -10 44 44" aria-hidden="true"><use href="#a${z}" width="32" height="32"/>${dress(k)}${mood === ' cry' ? tears(z) : ''}</svg>`;
};
// result card k takes animal z: its colour, and the dressed pet (quick fill) or the plain face (custom results)
function markCard(k, z) {
  const card = cards.children[k];
  card.style.setProperty('--c', COLORS[z]);
  card.querySelector('small').innerHTML = S.preset ? pet(z, k) : faceZ(z);
  card.classList.remove('run');
  card.classList.add('on');
  card.classList.toggle('big', isBig(k));
}

// ---------- summary ----------
// rows: one per player, { z: animal, k: result index they end with (after a joker trade), place: finishing place
// (0 = 1st), time: finish seconds or null (ranked by progress at the time cap), joker: took part in the trade }.
// seed: the track code, shown as "Track #K3F9Q" under the list.
let lastSum = null; // re-rendered on a language switch
const jk = r => r.joker ? '<svg class="ic jk"><use href="#i-joker"/></svg>' : '';
function openSummary(rows, seed) {
  lastSum = [rows, seed];
  const order = [...rows].sort((a, b) => slotRank(a.k) - slotRank(b.k) || a.place - b.place);
  const tm = r => `<small class="tm">${t('rank', r.place + 1)}${r.time != null ? ' · ' + t('time', r.time.toFixed(2)) : ''}</small>`;
  $('#seedNote').textContent = seed ? t('seed', seed) : '';
  renderSplits(rows);
  // teams: one card per team, its name on top and the members as chips underneath
  if (S.preset === 'team') return showSummary(range(S.teams).map(tm0 => {
    const members = order.filter(r => S.teamOf[r.k] === tm0), li = el('li', 'team');
    li.style.setProperty('--c', COLORS[tm0]);
    li.style.setProperty('--i', tm0);
    li.innerHTML = `<span class="tn"><i class="gl" aria-hidden="true">${members.length ? glyph(members[0].k) : ''}</i>${t('team', String.fromCharCode(65 + tm0))}</span>`
      + `<div class="mem">${members.map(r => `<b style="--c:${COLORS[r.z]}">${nameZ(r.z)}${jk(r)}${tm(r)}</b>`).join('')}</div>`;
    return li;
  }));
  showSummary(order.map((r, i) => {
    const big = isBig(r.k), li = el('li', big ? isBad() ? 'big bad' : 'big' : '');
    li.style.setProperty('--c', COLORS[r.z]);
    li.style.setProperty('--i', i);
    li.innerHTML = `<span>${big ? `<svg class="ic crown"><use href="#i-${isBad() ? 'skull' : 'crown'}"/></svg>` : ''}<b></b></span><svg class="ic"><use href="#i-arrow"/></svg><span></span>`;
    li.querySelector('b').innerHTML = nameZ(r.z) + jk(r) + tm(r);
    li.lastChild.textContent = resultOf(r.k);
    return li;
  }));
}
// split table: every animal in final order, its place at each checkpoint and the place it ends on (after a joker
// trade, marked), each against the animal's last race (▲ = higher up than last time, = the same)
function renderSplits(rows) {
  const cell = (p, was) => {
    const d = was - p, cmp = p < 0 || !(was >= 0) ? '' : `<em class="${d > 0 ? 'up' : d < 0 ? 'dn' : 'eq'}">${d ? (d > 0 ? '▲' : '▼') + Math.abs(d) : '='}</em>`;
    return `<td>${p >= 0 ? p + 1 : '–'}${cmp}</td>`;
  };
  $('#spTable').innerHTML = `<tr><th></th>${rows[0].cp.map((_, k) => `<th scope="col">${k + 1}</th>`).join('')}<th scope="col">${t('goal')}</th></tr>`
    + [...rows].sort((a, b) => a.k - b.k).map(r => `<tr style="--c:${COLORS[r.z]}"><th scope="row">${nameZ(r.z)}${jk(r)}</th>${[...r.cp, r.k].map((p, k) => cell(p, r.was?.[k])).join('')}</tr>`).join('');
}
function showSummary(rows) {
  $('#sumList').replaceChildren(...rows);
  rc?.pause(true); // the course holds still under the summary: its blurred backdrop re-blurred a live canvas every frame
  if (!summary.open) summary.showModal();
  summary.scrollTop = 0; // the dialog focuses its bottom button on open; the winner sits at the top
}
$('#closeBtn').onclick = () => { sfx.ui(); summary.close(); };
summary.addEventListener('close', () => rc?.pause(false));
summary.addEventListener('click', e => {
  const r = summary.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) summary.close();
});

// ---------- race: the flow ----------
// PEEK (flyover) -> READY (everyone seated at a random gate) -> COUNTDOWN (the start wheel spins) -> RACE -> (JOKER) -> SUMMARY.
// race.js draws and runs the race; this owns the HUD, the sounds, the results and the joker.
let raceMod = null, rc = null; // rc: the 3D race (race.js); `race` is the #race section
const loadRace = () => raceMod ??= import('./race.js'); // three + Rapier + the sim (~6 MB): idle-loaded after boot
const G = { phase: 'idle', round: 0, timers: [], gateOf: [], seed: 0, def: null, jokers: [], jkE: [], host: null, at: [], landed: 0, follow: -1, photo: false, pegN: [], pegT: [], ribbonAt: 0, rank: [] };
// round timers hold still while the app is hidden (a call, an app switch), like the race itself (race.js stops on
// hidden): the countdown, the joker and the summary carry on where they were instead of playing out unseen.
// Timers set while hidden count from the moment it hid
let hiddenAt = 0;
const later = (ms, f) => {
  const t = { f, due: (document.hidden ? hiddenAt : performance.now()) + ms };
  if (!document.hidden) t.id = setTimeout(f, ms);
  G.timers.push(t);
};
const stopTimers = () => { G.timers.forEach(t => clearTimeout(t.id)); G.timers = []; };
document.addEventListener('visibilitychange', () => {
  const now = performance.now();
  if (document.hidden) { hiddenAt = now; G.timers = G.timers.filter(t => t.due > now); G.timers.forEach(t => clearTimeout(t.id)); } // due ones still fire
  else G.timers.forEach(t => { t.due += now - hiddenAt; t.id = setTimeout(t.f, t.due - now); });
  wake();
});
// phones dim after ~30 s untouched; a round (build, flyover, countdown, race, joker) runs longer. The lock drops by
// itself while the app is hidden, so it is taken again on return. wl = {} marks a request in flight
let wl = null;
const awake = () => G.phase !== 'idle' && G.phase !== 'done';
function wake() {
  if (awake() && !document.hidden && (!wl || wl.released)) {
    wl = {};
    navigator.wakeLock?.request('screen').then(l => { wl = l; if (!awake()) l.release(); }, () => { wl = null; });
  } else if (!awake() && wl?.release) { wl.release().catch(() => {}); wl = null; }
}
const raceBtn = $('#raceBtn'), ffBtn = $('#ffBtn'), sumBtn = $('#sumBtn'), stamp = $('#stamp');
const seedCode = s => s.toString(36).toUpperCase().padStart(5, '0').slice(-5);
const announce = msg => { $('#live').textContent = msg; };
const buzz = p => { if (S.sfx) try { navigator.vibrate?.(p); } catch { /* not allowed in an iframe */ } }; // EFFECT at 0 = quiet: no buzz either
const players = () => range(S.n).map(i => ({ z: ZOO[i], color: pc(i) }));
const panOf = pos => rc?.pan(pos) ?? 0;
const phase = p => { G.phase = p; document.body.classList.toggle('busy', p === 'race' || p === 'countdown'); updateHud(); wake(); };

async function ensureRace() {
  if (rc) return rc;
  const m = await loadRace();
  rc = await m.createRace($('#cv3d'), {
    mini: $('#mini'),
    label: k => t(k),
    modName: k => modName(k)[0], // a mod sign's word
    isBig: k => isBig(k),
    onEvent,
    onTick: ribbon,
    onRing: (x, y) => { // NDC -> % of the HUD; written only while the camera is still settling
      const l = `${((x + 1) * 50).toFixed(1)}%`, tp = `${((1 - y) * 50).toFixed(1)}%`;
      if (raceBtn.style.left !== l || raceBtn.style.top !== tp) Object.assign(raceBtn.style, { left: l, top: tp });
    },
    onLand: land,
    onDone: () => settle(() => later(900, G.jokers.length ? joker : finish)),
  });
  return rc;
}

// random mods: a shuffled pool (each kind as often as its max on this length) taken in order until the slots are full,
// skipping any pick the course can't hold without another lap (so Short stays short)
function randomPicks(seed) {
  const p = {};
  let left = TRACKS[S.track].slots;
  for (const k of shuffle(Object.keys(MODS).flatMap(k => Array(modMax(k)).fill(k)))) {
    if (!left) break;
    p[k] = (p[k] || 0) + 1;
    if (fits(seed, S.n, S.track, p)) left--; else if (!--p[k]) delete p[k];
  }
  return p;
}
// everything random about a round, rolled once: on the host when phones are linked, so watching phones build the same
// course, seat the same gates and play the same joker trades. Not on the sim path, so Math.random is fine here
function roll() {
  const seed = Math.floor(Math.random() * 2 ** 31), jokers = jokerPlaces();
  return { seed, picks: S.modRand ? randomPicks(seed) : S.mods[S.track], jokers,
    jkE: jokers.map(() => Math.floor(Math.random() * S.n)), gateOf: shuffle(range(S.n)) };
}

// HYPE: a get-ready card over the build (race.js the first time, the track, the first frame's shader compile), up at
// least HYPE ms (one turn of its stopwatch hand) so the wait reads as a beat. Its animations are transform/opacity
// only, so they keep running on the compositor while the build blocks the main thread
const HYPE = 1200, frame = () => new Promise(r => requestAnimationFrame(r));
function hype(on) {
  const h = $('#hype');
  if (!on) { h.classList.add('out'); later(350, () => { h.hidden = true; }); return; }
  $('#hypeGo').dataset.t = t('ready');
  $('#hypeInfo').textContent = `${t('h' + S.track[0].toUpperCase() + S.track.slice(1))} · ${t('nP', S.n)}`;
  $('#hypeLine').innerHTML = range(S.n).map(i => `<i style="--c:${pc(i)};--i:${i}">${face(i)}</i>`).join('');
  h.classList.remove('out'); h.hidden = false;
  announce(t('ready'));
}

// a new track for the same setup: build it under the HYPE card, fly over it (PEEK), then seat everyone.
// r: the round's dice (roll()), handed over by the host when this phone watches; rolled here otherwise
async function newRound(r) {
  const my = ++G.round; // a newer round (or Reset) during an await below drops this one
  stopTimers();
  if (summary.open) summary.close();
  Object.assign(NET, { go: false, res: null, then: null });
  sfx.duck(false); sfx.roll(false); sfx.setMusic(S.preset);
  phase('hype'); hype(true);
  const t0 = performance.now();
  await frame(); await frame(); // the card is on screen before the build blocks the main thread
  await ensureRace();
  if (my !== G.round) return;
  if (!r) { r = roll(); if (hosting()) Coop.send({ t: 'round', ...r, ...shared() }); }
  G.seed = r.seed;
  G.def = makeTrack(G.seed, S.n, S.track, r.picks);
  G.cps = splitsOf(G.def); G.cp = G.cps.map(() => Array(S.n).fill(-1)); G.cpN = G.cps.map(() => 0); G.prev = runs[0];
  G.jokers = [...r.jokers]; G.jkE = [...r.jkE];
  Object.assign(G, { gateOf: r.gateOf, host: null, at: [], landed: 0, follow: -1, photo: false, swapped: null, pegN: Array(S.n).fill(0), pegT: [], rank: range(S.n), letN: 0 });
  setLanes(S.n);
  renderCards(G.jokers);
  const warm = rc.load(G.def, players()); // its shaders compile in the background
  rc.setJoker(G.jokers);
  range(S.n).forEach(k => glyphCanvas(k).then(c => rc.setGlyph(k, c)));
  ffBtn.setAttribute('aria-pressed', false); rc.setFF(false);
  await warm; await frame(); // the shader compile and the first render of the new course happen under the card too
  if (my !== G.round) return;
  later(Math.max(0, HYPE - (performance.now() - t0)), () => { hype(false); peek(); });
}

// PEEK: flyover from the start ring to the rack, slowing over each showcase mod and holding on each mod's neon sign
// (3-14 s, the same on every phone: it comes from the course), with the countdown card
function peek() {
  phase('peek');
  const dur = rc.peek(), card = $('#peek'), bar = card.querySelector('i');
  card.style.setProperty('--t', dur + 's');
  card.classList.remove('run'); void bar.offsetWidth; card.classList.add('run');
  for (let k = 0; k <= dur; k++) later(k * 1000, () => { $('#peekN').textContent = dur - k; });
  later(dur * 1000, seat);
}

// READY: no choosing gates (the start wheel spins to a random angle anyway, so no gate is better): everyone is seated
// at a random one, their stalls pop, and Race! starts the countdown
function seat() {
  G.gateOf.forEach((g, i) => rc.claim(i, g)); // rolled with the round (roll())
  rc.ready();
  sfx.go(0, 0);
  phase('ready');
  if (NET.go) countdown(); // watching: the host pressed Race! while this phone was still flying over
}
// taps on the 3D view: while racing, empty space goes back to the auto camera
{
  let down = null;
  const cv = $('#cv3d');
  cv.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  cv.addEventListener('pointercancel', () => { down = null; }); // a scroll or system gesture took the touch
  cv.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 8) return;
    if (G.phase === 'race' && G.follow >= 0) follow(-1);
  });
}

// Race!: 3-2-1-GO
raceBtn.onclick = () => { if (G.phase === 'ready') act({ t: 'race' }); };
function countdown() {
  NET.go = false;
  phase('countdown');
  rc.countdown();
  const show = (txt, go) => { stamp.hidden = false; stamp.dataset.t = txt; stamp.classList.toggle('go', go); stamp.classList.remove('bang'); void stamp.offsetWidth; stamp.classList.add('bang'); };
  [3, 2, 1].forEach((k, j) => later(j * 1000, () => { show(String(k), false); sfx.countdown(k); }));
  later(3000, () => {
    show(t('go'), true); sfx.countdown(0);
    rc.go(G.gateOf);
    sfx.setMusic('race'); // the driving race loop, ducked under the race sounds
    sfx.duck(true);
    sfx.roll(true);
    phase('race');
    buildRibbon();
  });
  later(3800, () => { stamp.hidden = true; });
}

// ---------- RACE: standings ribbon, events, landings ----------
// ribbon: one chip per marble, ordered by progress (finished ones by place), at most 4 reorders a second with a
// transform-only FLIP. Marbles in the mist tube show a frosted "?" and hold their spot
function buildRibbon() {
  G.slots = null; G.rank = range(S.n); // chips start in player order
  chips.replaceChildren(...range(S.n).map(i => {
    const b = el('button', 'chip');
    b.type = 'button'; b.dataset.i = i;
    b.style.setProperty('--c', pc(i)); b.style.setProperty('--i', i);
    b.innerHTML = `${face(i)}<span class="pl"></span><svg class="ic crown" aria-hidden="true"><use href="#i-crown"/></svg><i class="cp" aria-hidden="true"></i>`;
    b.setAttribute('aria-label', t('follow', animalName(i)));
    b.onclick = () => follow(G.follow === i ? -1 : i);
    return b;
  }));
  // edge badges: a face per marble, pinned to the screen edge while it is off screen (tap = follow it)
  G.edge = range(S.n).map(i => {
    const b = el('i');
    b.style.setProperty('--c', pc(i)); b.innerHTML = face(i); b.hidden = true; b.tf = '';
    b.onclick = () => follow(i);
    return b;
  });
  G.box = null;
  $('#edge').replaceChildren(...G.edge);
}
// place the edge badges: marbles off screen, unfinished and not in the mist (that would give away who is ahead) get a
// badge on the ray from the middle, kept inside the open band between the standings and the result strip
function edges(sim) {
  if (!G.box) { // measured once per race and after a resize, before any DOM write this frame
    const m = $('.mid').getBoundingClientRect(), hs = getComputedStyle($('.hud')), w = race.clientWidth, h = race.clientHeight, e = 26;
    G.box = { w, h, l: parseFloat(hs.paddingLeft) + e, r: w - parseFloat(hs.paddingRight) - e, t: m.top + e, b: m.bottom - e };
  }
  const { w, h, l, r, t: top, b: bot } = G.box, cx = (l + r) / 2, cy = (top + bot) / 2;
  G.edge.forEach((d, i) => {
    let off = sim.place[i] < 0 && !sim.inMist[i], tf = '';
    if (off) {
      let [x, y, back] = rc.ndc(i);
      if (back) { x *= -99; y = (-y || -1) * 99; } // behind the camera: mirrored, pushed off screen
      const px = (x + 1) / 2 * w, py = (1 - y) / 2 * h;
      off = back || Math.abs(x) > 1 || Math.abs(y) > 1;
      if (off) {
        const dx = px - cx, dy = py - cy, k = Math.min(1, (r - l) / 2 / Math.abs(dx), (bot - top) / 2 / Math.abs(dy));
        tf = `translate(${Math.round(cx + dx * k)}px,${Math.round(cy + dy * k)}px)|${Math.round(Math.atan2(dy, dx) * 180 / Math.PI)}deg`;
      }
    }
    if (d.hidden === off) d.hidden = !off;
    if (off && d.tf !== tf) { d.tf = tf; const [p, a] = tf.split('|'); d.style.transform = p; d.style.setProperty('--a', a); }
  });
}
function follow(i) {
  G.follow = i;
  rc.setFollow(i);
  sfx.ui();
  [...chips.children].forEach(c => c.classList.toggle('run', +c.dataset.i === i));
}
// split checkpoints: the order marbles pass each one. Progress is read once a frame, so marbles crossing in the same
// frame rank by how far on they are. The chip flashes its change on the animal's last race there (▲ = higher up)
function splits(sim) {
  G.cps.forEach((s, k) => {
    const row = G.cp[k];
    range(S.n).filter(i => row[i] < 0 && sim.prog[i] >= s).sort((a, b) => sim.prog[b] - sim.prog[a]).forEach(i => {
      row[i] = G.cpN[k]++;
      const was = G.prev?.p[ZOO[i]]?.[k], b = chips.querySelector(`[data-i="${i}"] .cp`);
      if (!(was >= 0) || !b) return;
      const d = was - row[i];
      b.textContent = d ? (d > 0 ? '▲' : '▼') + Math.abs(d) : '=';
      b.className = 'cp' + (d > 0 ? ' up' : d < 0 ? ' dn' : '');
      b.animate([{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)', offset: 0.12 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 1800, easing: 'ease-out' });
    });
  });
}
function ribbon(order, sim) {
  if (G.phase !== 'race') return;
  // the rolling bed follows everyone's speed every frame; muffled while the marble in view is in the mist
  let sum = 0, live = 0;
  for (let i = 0; i < S.n; i++) if (sim.place[i] < 0) { sum += sim.speed[i]; live++; }
  const eye = G.follow >= 0 ? G.follow : order[0];
  sfx.rollLevel(live ? Math.min(1, sum / 40 + 0.15) : 0, live ? sum / live / 14 : 0, !!sim.inMist[eye]);
  let held = 0; // marbles a whirlpool's current holds: its water swells with them
  for (let i = 0; i < S.n; i++) if (sim.hold[i]) held++;
  sfx.water(held ? Math.min(1, 0.35 + held / 8) : 0);
  edges(sim);
  splits(sim);
  const now = performance.now();
  if (now - G.ribbonAt < 250) return;
  G.ribbonAt = now;
  // marbles in the mist keep the rank they went in with
  const rank = [...order];
  for (const i of range(S.n)) if (sim.inMist[i]) { rank.splice(rank.indexOf(i), 1); rank.splice(Math.min(rank.length, G.rank.indexOf(i)), 0, i); }
  // DOM writes only for what changed: re-appending and measuring 20 chips 4 times a second forced a layout each time
  const moved = rank.some((i, k) => i !== G.rank[k]);
  // slot positions are measured once per race (and after a resize), never mid-race: a layout read after the DOM
  // writes above cost a whole-page layout, ~9 ms on a desktop and ~55 ms on a 6x-throttled phone
  if (moved && !G.slots) G.slots = [...chips.children].map(c => [c.offsetLeft, c.offsetTop]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); // in reading order
  const was = new Map(G.rank.map((i, k) => [i, k]));
  const lead = rank.find(i => sim.place[i] < 0);
  rank.forEach((i, k) => {
    // the chips stay in player order in the DOM and CSS order places them: moving a chip in the DOM tore down and
    // rebuilt its SVG face, 40-80 ms of style a reorder at 4x CPU (4 a second)
    const c = chips.children[i];
    if (moved) c.style.order = k;
    const fin = sim.place[i] >= 0, mist = !!sim.inMist[i], pl = c.querySelector('.pl'), txt = mist && !fin ? '' : String(k + 1);
    c.classList.toggle('fin', fin); c.classList.toggle('done', fin); c.classList.toggle('mist', mist && !fin);
    c.classList.toggle('lead', i === lead && !mist);
    if (pl.textContent !== txt) pl.textContent = txt;
  });
  // FLIP: each chip slides from where it was
  if (moved) rank.forEach((i, k) => {
    const a = G.slots[was.get(i) ?? k], b = G.slots[k], c = chips.children[i], dx = a[0] - b[0], dy = a[1] - b[1];
    if (!dx && !dy) return;
    c.style.transition = 'none'; c.style.transform = `translate(${dx}px, ${dy}px)`;
    requestAnimationFrame(() => { c.style.transition = 'transform .3s cubic-bezier(.2,.8,.2,1)'; c.style.transform = ''; });
  });
  G.rank = rank;
  // photo finish: the two front-runners about to cross within 0.12 s of each other, on an outcome boundary
  if (!G.photo && sim.finished < S.n - 1) {
    const live = order.filter(i => sim.place[i] < 0), [a, b] = live, f = G.def.finish.s, k = sim.finished;
    if (b != null && f - sim.prog[a] < 2.5 && Math.abs(sim.prog[a] - sim.prog[b]) < 0.12 * Math.max(4, sim.speed[a]) && boundary(k)) {
      G.photo = true; rc.photo(); sfx.photo(); announce(t('photo'));
    }
  }
}
// places k and k+1 decide different things (Winner / Penalty edge, 1st vs 2nd, the biggest share)
const boundary = k => S.preset === 'rank' ? k === 0 : S.preset ? isBig(k) !== isBig(k + 1) : k === 0;

// sim events -> sounds (the visuals and the camera are race.js's own). Peg notes: at most 10 a second, each
// marble climbing its own Dorian ladder; the followed or leading marble always gets through
function onEvent(e) {
  const pan = panOf(e.pos);
  switch (e.type) {
    case 'peg': {
      const now = performance.now(), keep = e.i === G.follow || e.i === G.rank[0];
      G.pegT = G.pegT.filter(x => now - x < 1000);
      if (G.pegT.length >= 10 && !keep) return;
      G.pegT.push(now);
      sfx.step(++G.pegN[e.i], pan);
      break;
    }
    case 'bump': sfx.clack(pan, e.data.v); break;
    case 'stun': sfx.bump(pan); break;
    case 'boost': if (e.data?.lid) sfx.lid(pan); sfx.boost(pan); break; // a lifting trapdoor lid pushed it on, or a pad
    case 'mudIn': sfx.mud(pan); break;
    case 'jump': sfx.jump(pan); break;
    case 'hoop': sfx.boost(pan); break; // through a jump's hoop
    case 'boomUp': sfx.boomerang(pan, e.data.n); break; // up one of a boomerang's walls (n: which swing)
    case 'warpIn': // falling away into hole A; into a roulette everyone does: the buzz only for the leader's or the followed
      sfx.warp(false, pan);
      if (!e.data.exit || e.i === G.follow || e.i === G.rank[0]) buzz(14);
      break;
    case 'warpOut': e.data.exit === 'jackpot' ? sfx.jackpot(pan) : e.data.exit === 'lost' ? sfx.lost(pan) : sfx.jump(pan); break; // popping out of hole B (a roulette's exit)
    case 'trapIn': // flicked onto the trap lane, the long way round; down a trapdoor
      e.data.door ? sfx.gulp(pan) : sfx.trap(pan);
      buzz(20);
      break;
    case 'trapOut': sfx.jump(pan); break; // flicked back onto the course
    case 'fork': if (e.data.way === 2) { sfx.trap(pan); buzz(20); } else if (!e.data.way) sfx.express(pan); break; // LONG / EXPRESS (MAIN: no sound)
    case 'signal': sfx.signal(e.data.way, pan); break; // a fork's signal changing (race.js, near the action)
    case 'wheel': sfx.wheel(pan); break; // a roulette sector passing its pointer
    case 'sign': sfx.sign(e.data.k, pan); break; // the flyover stopping on a mod's neon sign
    case 'lid': sfx.lid(pan); break; // a trapdoor lid lifting near the camera
    case 'letGo': sfx.letGo(G.letN++, pan); break; // a whirlpool lets one go: each a Dorian step higher
    case 'rideIn': sfx.spin(e.i, pan); break;
    case 'basinIn': if (!e.data.again) sfx.spin(e.i, pan); break; // dropping into a bowl (not back down off a bounce)
    case 'basinOut': if (e.data.drain) sfx.warp(false, pan); break; // down its drain
    case 'coilIn': sfx.spiral(pan, e.i === G.follow || e.i === G.rank[0]); break; // the air takes it the long way round
    case 'tubeIn': if (e.i === G.follow || e.i === G.rank[0]) sfx.shortcut(pan); break; // down a narrow helix's middle tube
    case 'mistIn': case 'mistOut': if (e.i === G.follow || e.i === G.rank[0]) sfx.mist(e.type === 'mistIn', pan); break;
  }
}
// a marble lands in rack cup k: its result card fills, the landing sound and buzz, the screen reader hears it
function land(i, k) {
  G.at[k] = i; G.landed++;
  markCard(k, ZOO[i]);
  const card = cards.children[k];
  card.classList.remove('hit'); void card.offsetWidth; card.classList.add('hit');
  later(650, () => card.classList.remove('hit'));
  const big = isBig(k);
  sfx.land(big, panOf(rc.cupPos(k)), big && isBad());
  buzz(big ? [30, 50, 80] : 18);
  announce(t('finished', { a: animalName(i), p: t('rank', k + 1), r: resultOf(k) }));
  if (G.landed === S.n) { sfx.roll(false); sfx.duck(false); sfx.setMusic(S.preset); } // music swells back, the setup's own loop
  updateHud();
}

// ---------- JOKER (LADDER joker(), ported) ----------
// Whoever finished on the joker place trades results with one other player. A spotlight runs round every rack cup and
// result card, slowing down, and stops on the one picked. The pick is uniform over every place, the joker's own
// included (lands there = STAYING!, no trade), same result or not, so the joker stays fair: the holder ends on any
// place 1/n, everyone else is picked 1/n (LADDER v1.114.1: drawing only different results rigged it).
// Two jokers: one trade, then the other
function joker() {
  phase('joker');
  const j = G.jokers.shift(), e = G.jkE.shift(), ring = range(S.n), stay = e === j; // e: rolled with the round
  const steps = Math.ceil(16 / ring.length) * ring.length + ring.indexOf(e) + 1;
  cards.children[j].classList.add('armed');
  const toast = $('#jkToast'), pair = (l, r) => $('#jkPair').innerHTML = `${l}<span class="sw">⇄</span>${r}`;
  const pop = () => { toast.classList.remove('pop'); void toast.offsetWidth; toast.classList.add('pop'); };
  const who = i => nameZ(ZOO[i]);
  let prev = '?';
  const roll = (name, ms, last) => {
    const s = $('#jkPair .jk-reel > span');
    s.innerHTML = `<i>${name}</i><i>${prev}</i>`; prev = name;
    s.style.animationDuration = `${ms}ms`;
    s.classList.toggle('fast', ms < 160); s.classList.toggle('last', last);
    s.classList.remove('roll'); void s.offsetWidth; s.classList.add('roll');
  };
  const title = key => { const n = toast.querySelector('b span'); n.dataset.i18n = key; n.textContent = t(key); };
  title('joker');
  toast.style.setProperty('--c', '#ffb547');
  pair(who(G.at[j]), '<span class="jk-reel"><span><i>?</i></span></span>');
  toast.classList.remove('lock', 'stamp'); toast.classList.add('spin');
  toast.hidden = false;
  pop();
  const gap = k => 70 + 520 * (k / steps) ** 2.6; // the last few steps crawl so the pick lands with weight
  let at = 0;
  for (let k = 0; k < steps; k++) {
    at += gap(k);
    later(at, () => {
      const x = ring[k % ring.length], last = k === steps - 1;
      [...cards.children].forEach((c, i) => c.classList.toggle('spot', i === x));
      range(S.n).forEach(c => rc.spot(c, c === x));
      roll(who(G.at[x]), last ? 520 : Math.min(gap(k + 1) * 0.9, 420), last);
      sfx.spot(k);
    });
  }
  // lock on, both cards lift and hold while the snare roll builds (HOLD), the two animals fly across (FLY), the cards flash
  // landing on the joker's own place: one card lifts, nothing flies
  const HOLD = 0.9, FLY = stay ? 0 : 1.3, FLASH = 1100, pick = stay ? [j] : [j, e];
  later(at + 350, () => {
    const a = G.at[j], b = G.at[e];
    toast.classList.replace('spin', 'lock');
    for (const x of pick) { cards.children[x].classList.remove('spot', 'armed'); cards.children[x].classList.add('lift'); }
    range(S.n).forEach(c => rc.spot(c, c === j || c === e));
    $('#race').classList.add('dim');
    sfx.swap(HOLD + FLY);
    if (!stay) later(HOLD * 1000, () => rc.swap(j, e, FLY));
    later((HOLD + FLY) * 1000, () => {
      G.at[j] = b; G.at[e] = a; G.swapped = [...G.swapped || [], ...new Set([a, b])];
      for (const x of pick) { const c = chips.children[G.at[x]]; c.style.order = x; c.querySelector('.pl').textContent = x + 1; } // the standings follow the trade
      $('#race').classList.remove('dim');
      range(S.n).forEach(c => rc.spot(c, false));
      for (const x of pick) {
        const c = cards.children[x];
        c.classList.remove('lift', 'swap'); void c.offsetWidth; c.classList.add('swap');
        later(FLASH * 0.4, () => markCard(x, ZOO[G.at[x]]));
        rc.cupFlash(x, pc(G.at[x]));
      }
      if (!stay) {
        cards.children[e].classList.add('joker');
        cards.children[e].insertAdjacentHTML('beforeend', '<svg class="ic jk" aria-hidden="true"><use href="#i-joker"/></svg>');
      }
      if (stay) $('#jkPair').innerHTML = who(a); else pair(who(b), who(a));
      // verdict for the joker holder, now on e: same result = STAYING!, gaining the big place (or dodging it when it's
      // bad) = LUCKY SWAP!, the reverse UNLUCKY SWAP!; anything else keeps "Joker swap!"
      const v = resultOf(j) === resultOf(e) ? 'stay' : isBig(e) === isBig(j) ? '' : isBig(e) !== isBad() ? 'lucky' : 'unlucky';
      if (v) { title(v); toast.style.setProperty('--c', { stay: '#ffd27a', lucky: '#ffd54a', unlucky: '#ff4d5e' }[v]); toast.classList.add('stamp'); }
      pop();
      announce(`${t('joker')} ${animalName(a)}${stay ? '' : ' ⇄ ' + animalName(b)}${v ? ' — ' + t(v) : ''}`);
      buzz([20, 40, 60]);
      later(2200, G.jokers.length ? joker : finish);
    });
  });
}

// ---------- SUMMARY ----------
function finish() {
  $('#jkToast').hidden = true;
  phase('done');
  sfx.fanfare();
  logRun();
  showResults();
}
function showResults() {
  const sim = G.host || rc.sim, placeOf = range(S.n).map(i => G.at.indexOf(i));
  openSummary(range(S.n).map(i => ({ z: ZOO[i], k: placeOf[i], place: sim?.place[i] ?? placeOf[i], time: sim && sim.time[i] < sim.cap ? sim.time[i] : null, joker: !!G.swapped?.includes(i),
    cp: G.cp.map(r => r[i]), was: G.prev?.p[ZOO[i]] })), seedCode(G.seed));
}
function logRun() {
  const sim = G.host || rc.sim, w = sim.place.indexOf(0);
  runs.unshift({ no: (runs[0]?.no || 0) + 1, d: Date.now(), tr: S.track, n: S.n, w: sim.time[w] < sim.cap ? +sim.time[w].toFixed(2) : null,
    p: Object.fromEntries(range(S.n).map(i => [ZOO[i], [...G.cp.map(r => r[i]), G.at.indexOf(i)]])) }); // the place it ends on, after any joker trade
  runs.length = Math.min(runs.length, RUNS);
  try { localStorage.setItem(RKEY, JSON.stringify(runs)); } catch { /* private mode */ }
}

// ---------- HUD: what shows when ----------
function updateHud() {
  const p = G.phase;
  $('#peek').hidden = p !== 'peek';
  raceBtn.hidden = p !== 'ready';
  raceBtn.classList.toggle('glow', p === 'ready');
  ffBtn.hidden = p !== 'race';
  sumBtn.hidden = !(p === 'done');
  if (p !== 'countdown' && p !== 'race') stamp.hidden = true;
}
ffBtn.onclick = () => act({ t: 'ff', on: ffBtn.getAttribute('aria-pressed') !== 'true' });
sumBtn.onclick = () => { sfx.ui(); showResults(); };
const again = () => { sfx.shuffle(); race.classList.remove('shake'); void race.offsetWidth; race.classList.add('shake'); };
$('#newBtn').onclick = () => { again(); newRound(); };
$('#replayBtn').onclick = () => { summary.close(); sfx.shuffle(); newRound(); };
function enter() {
  sfx.go(0, 0);
  if (!history.state?.race) history.pushState({ race: 1 }, ''); // the phone's Back comes back to setup, not out of the app
  setup.hidden = true;
  race.hidden = false;
}
$('#startBtn').onclick = () => { enter(); newRound(); };
// Reset and the phone's Back (Android button or gesture, iOS swipe) both land on setup
function toSetup() {
  if (hosting()) Coop.send({ t: 'edit' });
  G.round++; stopTimers();
  rc?.stop();
  for (const d of [summary, runsDlg]) if (d.open) d.close();
  sfx.duck(false); sfx.roll(false); sfx.setMusic(S.preset);
  phase('idle');
  race.hidden = true;
  setup.hidden = false;
}
$('#editBtn').onclick = () => { sfx.ui(); history.state?.race ? history.back() : toSetup(); };
addEventListener('popstate', () => { if (!race.hidden) toSetup(); });
// rack cup glyph for place k: the result's toy glyph (or its text for custom results), drawn once to a canvas
function glyphCanvas(k) {
  const c = Object.assign(document.createElement('canvas'), { width: 128, height: 128 }), g = c.getContext('2d'), p = S.preset;
  const text = (s, y, size) => { g.font = `900 ${size}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = size / 5; g.strokeStyle = '#140d33'; g.strokeText(s, 64, y); g.fillStyle = '#fff'; g.fillText(s, 64, y); };
  let id = null, tint = '', label = null, cap = null;
  if (!p) { text(String(resultOf(k)).slice(0, 8), 64, 30); return Promise.resolve(c); }
  if (marks()) id = isBig(k) ? p : p === 'win' ? 'pass' : 'safe';
  else if (p === 'rank') { id = 'rank'; tint = MEDAL[k] || '#b98bff'; label = k + 1; }
  else if (p === 'team') { id = 'team'; tint = COLORS[S.teamOf[k]]; label = String.fromCharCode(65 + S.teamOf[k]); }
  else if (p === 'bill') { id = 'bill'; cap = money(S.bill[k]); }
  else cap = S.ratio[k] + '%';
  const defs = ['#gb', '#gg', '#gl'].map(s => $(s).outerHTML).join('');
  const body = id ? `<g style="color:${tint}">${$('#g-' + id).innerHTML}</g>`
    : `<circle cx="16" cy="16" r="11" fill="#5a4a96" stroke="#e6dcff" stroke-opacity=".5"/><circle cx="16" cy="16" r="5.5" fill="none" stroke="${isBig(k) ? '#ffd54a' : '#5dffb0'}" stroke-width="11" stroke-dasharray="${S.ratio[k] * .3456} 99" transform="rotate(-90 16 16)"/>`;
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const size = cap ? 92 : 120;
      g.drawImage(img, (128 - size) / 2, cap ? 0 : 4, size, size);
      if (label != null) text(String(label), p === 'rank' ? 80 : 64, 40);
      if (cap) text(cap, 108, 28);
      res(c);
    };
    img.onerror = () => res(c);
    img.src = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="128" height="128"><defs>${defs}</defs>${body}</svg>`);
  });
}

// ---------- race record ----------
// one row per finished race, newest first: number, length, players, when, winning time, then the animals in final order
// (after any joker trade)
const runsDlg = $('#runs');
function renderRuns() {
  const when = d => new Date(d).toLocaleString(S.lang, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  $('#runList').innerHTML = runs.length ? runs.map(r => {
    const order = Object.keys(r.p).map(Number).sort((a, b) => r.p[a][3] - r.p[b][3]);
    return `<li><p><b>#${+r.no}</b> ${t('h' + r.tr[0].toUpperCase() + r.tr.slice(1))} · ${t('nP', +r.n)} · ${when(r.d)}${r.w != null ? ' · ' + t('time', (+r.w).toFixed(2)) : ''}</p>`
      + `<div>${order.map((z, k) => `<span style="--c:${COLORS[z]}" role="img" aria-label="${t('rank', k + 1)} ${t('player', z + 1)}" title="${t('player', z + 1)}">${faceZ(z)}<i>${k + 1}</i></span>`).join('')}</div></li>`;
  }).join('') : `<li class="none">${t('noRuns')}</li>`;
}
document.querySelectorAll('[data-runs]').forEach(b => b.onclick = () => { sfx.ui(); renderRuns(); runsDlg.showModal(); });
$('#runsClose').onclick = () => { sfx.ui(); runsDlg.close(); };
for (const d of [runsDlg, $('#iosInstall')]) d.addEventListener('click', e => { // a tap on the backdrop closes it
  const r = d.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
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
  document.querySelectorAll('[data-i18n-title]').forEach(n => { n.title = t(n.dataset.i18nTitle); });
  document.querySelectorAll('[data-i18n-tip]').forEach(n => {
    const raw = t(n.dataset.i18nTip); // our own strings, so the markup -> HTML swap is safe
    n.setAttribute('aria-description', raw.replace(/\[\w:([^\]]*)\]/g, '$1'));
    n.querySelector('.tip').innerHTML = raw.replace(/\[(\w):([^\]]*)\]/g, '<b class="k-$1">$2</b>');
  });
  $('#startBtn').dataset.watch = t('watching');
  renderEntries();
  if (summary.open && lastSum) openSummary(...lastSum);
  if (runsDlg.open) renderRuns();
}
// tap cycles EN → 한국어 → 日本語 → EN
$('#lang').onclick = () => {
  const L = Object.keys(LANG_NAME);
  S.lang = L[(L.indexOf(S.lang) + 1) % L.length];
  save(); applyI18n();
};

// ---------- install (PWA) ----------
// Chrome / Edge / Android offer an install prompt; we hold it for the icon button. iOS has no such event: there the
// button opens the Share → Add to Home Screen steps. navigator.standalone is false in an iOS / iPadOS browser tab,
// true once opened from the home screen, and missing everywhere else. Embedded in another site's page (an iframe) the
// steps would add that page, not the game, so the button stays hidden there (browsers never offer the prompt in one)
let installEvt = null;
const installBtn = $('#installBtn'), ios = navigator.standalone === false && window.self === window.top, iosDlg = $('#iosInstall');
installBtn.hidden = !ios;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; installBtn.hidden = false; });
$('#iosClose').onclick = () => { sfx.ui(); iosDlg.close(); };
installBtn.onclick = async () => {
  sfx.ui();
  if (!installEvt) { if (ios) iosDlg.showModal(); return; }
  installEvt.prompt();
  await installEvt.userChoice.catch(() => {});
  installEvt = null; installBtn.hidden = true; // a prompt can be used once; the browser offers a fresh one later
};
addEventListener('appinstalled', () => { installEvt = null; installBtn.hidden = true; });

// ---------- phone link ----------
// Host + watchers (coop.js): the host plays as usual; other phones join to watch its races live and can't change
// anything. The host rolls each round's dice (roll(): seed, mods, gates, jokers and their trades) and sends them;
// every phone builds the same course and runs the same seeded race on its own, so only a few small messages travel.
// Setup edits stream as the shared part of S. A phone that joins mid-round waits on the setup for the next one.
// ponytail: a slower phone runs a few seconds behind the host (its own build and flyover); add a start time in the
// round message if they must cross the line together
const hosting = () => window.Coop?.role === 'host' && Coop.live;
// replayed on watching phones as the host's messages come in; race and ff also run through act() on the host
const ACT = {
  round: m => { if (race.hidden) enter(); else again(); newRound(m); },
  race: () => { if (G.phase === 'ready') countdown(); else NET.go = true; }, // still flying over: seat() starts it
  ff: ({ on }) => { ffBtn.setAttribute('aria-pressed', on); rc?.setFF(on); sfx.ui(); },
  edit: () => { history.state?.race ? history.back() : toSetup(); },
  res: m => { NET.res = m; adopt(); },
  sync: () => { if (!race.hidden) ACT.edit(); },
};
function act(m) {
  if (NET.mine) return; // watching: only the host drives (its controls are inert here as well)
  ACT[m.t](m);
  if (hosting()) Coop.send(m);
}
// results: the host's finish order is the word. Watching phones run the same seeded race on the deterministic physics
// build, which finishes in the same order on every device; should one still differ (a browser rounding its maths a
// hair differently), the host's order, places and times replace its own before the joker and the summary.
// ponytail: the 3D rack then keeps this phone's own landing; the cards, the joker and the summary follow the host
function settle(f) {
  if (NET.mine) { NET.then = f; return adopt(); }
  const sim = rc.sim;
  if (hosting()) Coop.send({ t: 'res', at: G.at, place: [...sim.place], time: [...sim.time], cap: sim.cap });
  f();
}
function adopt() {
  const r = NET.res, f = NET.then;
  if (!r || !f) return; // waiting for the other half: this phone's own finish, or the host's
  NET.then = null;
  G.host = r;
  if (r.at.some((i, k) => i !== G.at[k])) { G.at = [...r.at]; G.at.forEach((i, k) => markCard(k, ZOO[i])); }
  f();
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
const snapshot = () => ({ t: 'sync', ...shared() });
// watching: this phone's own setup parked, the host's controls inert, Reset / New / Race! / ×3 / Replay gone
function watch(on) {
  if (!!NET.mine === on) return;
  if (on) NET.mine = JSON.parse(JSON.stringify(S));
  else {
    Object.assign(S, NET.mine, { lang: S.lang, music: S.music, sfx: S.sfx });
    NET.mine = null;
    if (!race.hidden) ACT.edit();
    renderEntries();
  }
  document.body.classList.toggle('watching', on);
  document.querySelectorAll('#setup .panel, #startBtn, #editBtn, #newBtn, #raceBtn, #ffBtn, #replayBtn').forEach(e => e.inert = on);
}
const linkOpts = {
  game: 'marble', watch: true, max: 15, lang: () => S.lang,
  onStart(n, me) {
    document.body.classList.add('linked');
    if (me) watch(true);
    else Coop.send(snapshot()); // phones that joined before Continue
  },
  onJoin(i) { if (Coop.live) Coop.sendTo(i, snapshot()); }, // joined mid-game
  onMsg(m) {
    if (!NET.mine) return; // not started yet: the host sends a snapshot on Continue
    if (m.s) { Object.assign(S, m.s); ZOO.splice(0, ZOO.length, ...m.zoo); renderEntries(); }
    ACT[m.t]?.(m);
  },
  onLeave() { for (const d of [summary, runsDlg]) if (d.open) d.close(); }, // the "host left" notice must not sit under a modal dialog
  onMenu() { document.body.classList.remove('linked'); watch(false); },
};
document.querySelectorAll('.link-btn').forEach(b => b.onclick = () => { sfx.ui(); Coop.open(linkOpts); });

// ---------- boot ----------
// audio may only start from a user gesture (autoplay policy); init() is idempotent and resumes iOS-interrupted contexts
const unlock = () => { sfx.init(); sfx.startMusic(); };
// a touch's pointerdown is not a user gesture to iOS or Chrome (the spec counts touchend), so a first tap on empty
// space left the music suspended until a button was hit
for (const ev of ['pointerdown', 'touchend', 'keydown']) addEventListener(ev, unlock, { capture: true, passive: true });
// long-press / right-click menu: off everywhere but the text fields (their copy / paste menu)
addEventListener('contextmenu', e => { if (!e.target.closest?.('input, textarea')) e.preventDefault(); });
document.addEventListener('visibilitychange', () => sfx.pause(document.hidden));
addEventListener('resize', () => { G.slots = G.box = null; }); // the standings and edge badges re-measure on the next tick

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
// race code (three + Rapier + the sim, ~6 MB) loads in the background once the setup has painted
(window.requestIdleCallback || (f => setTimeout(f, 1500)))(() => loadRace().catch(() => { raceMod = null; }), { timeout: 2500 });

if ('serviceWorker' in navigator && window.isSecureContext) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
