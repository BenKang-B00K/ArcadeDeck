// ==================== I18N ====================
// 전역 번역 시스템. game.js보다 먼저 로드됨.

const I18N = {
  en: {
    // Meta
    'app.subtitle': 'SPIRIT DUEL · BEST OF 2',

    // Player names
    'player.1': 'Azure Spirit',
    'player.2': 'Amber Spirit',
    'player.1.formal': 'A Z U R E   S P I R I T',
    'player.2.formal': 'A M B E R   S P I R I T',

    // Actions
    'action.advance': 'Advance',
    'action.retreat': 'Retreat',
    'action.attack': 'Attack',
    'action.block': 'Block',
    'action.counter': 'Counter',
    'action.pierce': 'Pierce',
    'action.ranged': 'Wave',
    'action.leap': 'Leap',
    'action.leap_hold': 'Leap↓',
    'action.hint.advance': '<span class="kw">1</span> toward opp.',
    'action.hint.retreat': '<span class="kw">1</span> toward self',
    'action.hint.attack': '<span class="kw">Adjacent</span> · <span class="kw">1 dmg</span>',
    'action.hint.block': '<span class="kw">Nullify</span> attack',
    'action.hint.counter': '<span class="kw">Counter</span> · <span class="kw">1 dmg</span>',
    'action.hint.pierce': '<span class="kw star">★★</span> Unblockable',
    'action.hint.ranged': '<span class="kw">2-cell</span> range',
    'action.hint.leap': 'Adjacent · <span class="kw">2 slots</span>',

    // Buttons
    'btn.undo': 'Undo',
    'btn.confirm': 'Confirm',
    'btn.ready': 'Ready',
    'btn.beginDuel': 'Begin Duel',
    'btn.nextRound': 'Next Round',
    'btn.newMatch': 'New Match',
    'btn.continue': 'Continue',

    // Setup (spirit pick)
    'setup.label': 'S P I R I T   S E L E C T',
    'setup.chosen': 'You are {mine} · Opponent is {other}',
    'setup.chosen.cpu': 'You are {mine} · CPU is {other}',
    'setup.mode.pvp': 'Two Players',
    'setup.mode.cpu': 'vs CPU',
    'setup.mode.link': 'Phone Link',
    'net.deciding': '{name} is deciding their move…',
    'net.you': 'YOU',
    'net.waitHost': 'Waiting for the host…',
    'tip.link': 'Phone link',
    'setup.diff.normal': 'Normal',
    'setup.diff.advanced': 'Advanced',
    'setup.diff.master': 'Master',

    // UI labels
    'ui.round': 'ROUND {n}',
    'ui.roundDecisive': 'ROUND 3 · DECISIVE',
    'ui.turn': 'TURN {n}',
    'ui.turnLabel.first': "{name}'s Turn (First)",
    'ui.turnLabel.second': "{name}'s Turn (Second)",
    'ui.penalty': 'Next turn: -{n} actions',
    'ui.expansion.far': 'Stardust in {n} turns: cells {cells}',
    'ui.expansion.imminent': 'Next turn stardust: cell {cells}',
    'ui.expansion.full': 'Stardust fully expanded',

    // Curtain
    'curtain.handoff.title': 'Pass the Screen',
    'curtain.handoff.sub': 'Hand the device to your opponent',
    'curtain.handoff.sub.nextTurn': 'Begin the next turn',
    'curtain.turnName': "{name}'s Turn",
    'curtain.draw.label': 'F I R S T   P L A Y E R   D R A W',
    'curtain.draw.title.rolling': 'Which rune will light up first…',
    'curtain.draw.result': '{name} goes first',
    'curtain.draw.handoffSub': 'Round 1 · First',
    'curtain.round.badge': 'ROUND {n} END',
    'curtain.round.winner': '{name} Wins',
    'curtain.round.draw': 'D R A W',
    'curtain.round.nextFirst': 'Next round first: {name}',
    'curtain.round.sub.decisive': 'Decisive Round · 3 Actions · First',
    'curtain.round.sub.normal': 'Round {n} · First',

    // End modal
    'end.matchOver': '―   M A T C H   O V E R   ―',
    'end.winner': 'Winner',
    'end.draw': 'D R A W',
    'end.drawSub': "The spirits' powers met in balance",
    'end.winnerSub': 'Match Victor',

    // FX / cells
    'cell.stardust': 'STARDUST',
    'cell.safe': 'SAFE',
    'cell.warn1': '⚠ Stardust 1',
    'cell.warn2': '⚠ Stardust 2',
    'cell.danger': '☠ -1/turn',
    'fx.collision': '⟷ COLLISION',

    // 보드 플로팅 텍스트 (로그 대체) — 짧고 굵게
    'float.miss':         'Missed',
    'float.blocked':      'Blocked!',
    'float.counter':      'Counter!',
    'float.whiff':        'Whiffed',
    'float.pierce':       'Pierce!',
    'float.pierced':      'Pierced!',
    'float.evade':        'Evaded',
    'float.leap':         'Leapt!',
    'float.stardust':     'Stardust drains!',
    'float.stardustWarn': 'Stardust closes in',

    // Language toggle (shows the NEXT language as a hint)
    'lang.toggle': '한',
    'lang.toggle.title': 'Switch to Korean',

    // Tooltips
    'tip.sound': 'Mute (M)',
    'tip.volume': 'Volume',
    'tip.help': 'Rules',

    // Rotate overlay (mobile portrait)
    'rotate.title': 'Rotate Your Device',
    'rotate.sub': 'Spirit Duel plays in landscape',
  },

  ko: {
    // Meta
    'app.subtitle': '정 령 결 투 · 2선승',

    // Player names
    'player.1': '푸른 정령',
    'player.2': '호박 정령',
    'player.1.formal': '푸 른 정 령',
    'player.2.formal': '호 박 정 령',

    // Actions
    'action.advance': '전진',
    'action.retreat': '후퇴',
    'action.attack': '공격',
    'action.block': '막기',
    'action.counter': '카운터',
    'action.pierce': '관통',
    'action.ranged': '영파',
    'action.leap': '뛰어넘기',
    'action.leap_hold': '뛰기↓',
    'action.hint.advance': '상대 쪽 <span class="kw">1칸</span>',
    'action.hint.retreat': '내 쪽 <span class="kw">1칸</span>',
    'action.hint.attack': '<span class="kw">인접</span> <span class="kw">1피해</span>',
    'action.hint.block': '공격 <span class="kw">무효화</span>',
    'action.hint.counter': '<span class="kw">반격</span> <span class="kw">1피해</span>',
    'action.hint.pierce': '<span class="kw star">★★</span> 막기 불가',
    'action.hint.ranged': '<span class="kw">2칸</span> 거리 공격',
    'action.hint.leap': '인접 · <span class="kw">슬롯 2</span>',

    // Buttons
    'btn.undo': '되돌리기',
    'btn.confirm': '입력 완료',
    'btn.ready': '준비 완료',
    'btn.beginDuel': '결투 시작',
    'btn.nextRound': '다음 라운드',
    'btn.newMatch': '새 매치',
    'btn.continue': '계속',

    // Setup (spirit pick)
    'setup.label': '정 령 선 택',
    'setup.chosen': '당신은 {mine} · 상대는 {other}',
    'setup.chosen.cpu': '당신은 {mine} · CPU는 {other}',
    'setup.mode.pvp': '두 플레이어',
    'setup.mode.cpu': 'CPU 대전',
    'setup.mode.link': '폰 연결',
    'net.deciding': '{name}이 행동을 고르는 중…',
    'net.you': '나',
    'net.waitHost': '호스트를 기다리는 중…',
    'tip.link': '폰 연결',
    'setup.diff.normal': '보통',
    'setup.diff.advanced': '강함',
    'setup.diff.master': '달인',

    // UI labels
    'ui.round': 'ROUND {n}',
    'ui.roundDecisive': 'ROUND 3 · 결정전',
    'ui.turn': 'TURN {n}',
    'ui.turnLabel.first': '{name}의 차례 (선공)',
    'ui.turnLabel.second': '{name}의 차례 (후공)',
    'ui.penalty': '다음 턴 액션 -{n}',
    'ui.expansion.far': '{n}턴 후 확장: {cells}번',
    'ui.expansion.imminent': '다음 턴 별빛 확장: {cells}번 칸',
    'ui.expansion.full': '별빛 완전 확장',

    // Curtain
    'curtain.handoff.title': '차례 전환',
    'curtain.handoff.sub': '상대 플레이어에게 화면을 넘기세요',
    'curtain.handoff.sub.nextTurn': '다음 턴을 시작하세요',
    'curtain.turnName': '{name}의 차례',
    'curtain.draw.label': '선 공 추 첨',
    'curtain.draw.title.rolling': '어느 룬이 먼저 빛날까…',
    'curtain.draw.result': '{name}이 선공',
    'curtain.draw.handoffSub': '라운드 1 · 선공',
    'curtain.round.badge': 'ROUND {n} 종료',
    'curtain.round.winner': '{name} 승리',
    'curtain.round.draw': '무 승 부',
    'curtain.round.nextFirst': '다음 라운드 선공: {name}',
    'curtain.round.sub.decisive': '결정 라운드 · 액션 3개 · 선공',
    'curtain.round.sub.normal': '라운드 {n} · 선공',

    // End modal
    'end.matchOver': '― 매 치 종 료 ―',
    'end.winner': '승자',
    'end.draw': '무 승 부',
    'end.drawSub': '두 정령의 힘이 맞닿았다',
    'end.winnerSub': '매치의 승자',

    // FX / cells
    'cell.stardust': '별빛',
    'cell.safe': '안전',
    'cell.warn1': '⚠ 별빛 1',
    'cell.warn2': '⚠ 별빛 2',
    'cell.danger': '☠ -1/턴',
    'fx.collision': '⟷ 충 돌',

    // 보드 플로팅 텍스트 (로그 대체)
    'float.miss':         '빗나감',
    'float.blocked':      '막아냈다!',
    'float.counter':      '반격!',
    'float.whiff':        '카운터 헛침',
    'float.pierce':       '관통!',
    'float.pierced':      '막기 관통!',
    'float.evade':        '회피!',
    'float.leap':         '뛰어넘기!',
    'float.stardust':     '별빛 잠식!',
    'float.stardustWarn': '별빛이 다가온다',

    // Language toggle (shows the NEXT language as a hint)
    'lang.toggle': '日',
    'lang.toggle.title': '일본어로 전환',

    // Tooltips
    'tip.sound': '음소거 (M)',
    'tip.volume': '볼륨',
    'tip.help': '규칙 보기',

    // 회전 안내 (모바일 세로)
    'rotate.title': '기기를 가로로 돌려주세요',
    'rotate.sub': '정령 결투는 가로 모드에서 진행됩니다',
  },

  ja: {
    // Meta
    'app.subtitle': '精 霊 決 闘 · 2本先取',

    // Player names
    'player.1': '蒼の精霊',
    'player.2': '琥珀の精霊',
    'player.1.formal': '蒼 の 精 霊',
    'player.2.formal': '琥 珀 の 精 霊',

    // Actions
    'action.advance': '前進',
    'action.retreat': '後退',
    'action.attack': '攻撃',
    'action.block': '防御',
    'action.counter': 'カウンター',
    'action.pierce': '貫通',
    'action.ranged': '霊波',
    'action.leap': '跳躍',
    'action.leap_hold': '跳躍↓',
    'action.hint.advance': '相手側へ<span class="kw">1マス</span>',
    'action.hint.retreat': '自分側へ<span class="kw">1マス</span>',
    'action.hint.attack': '<span class="kw">隣接</span> <span class="kw">1ダメージ</span>',
    'action.hint.block': '攻撃を<span class="kw">無効化</span>',
    'action.hint.counter': '<span class="kw">反撃</span> <span class="kw">1ダメージ</span>',
    'action.hint.pierce': '<span class="kw star">★★</span> 防御不可',
    'action.hint.ranged': '<span class="kw">2マス</span>先を攻撃',
    'action.hint.leap': '隣接 · <span class="kw">スロット2</span>',

    // Buttons
    'btn.undo': '戻す',
    'btn.confirm': '決定',
    'btn.ready': '準備完了',
    'btn.beginDuel': '決闘開始',
    'btn.nextRound': '次のラウンド',
    'btn.newMatch': '新しい試合',
    'btn.continue': '続ける',

    // Setup (spirit pick)
    'setup.label': '精 霊 選 択',
    'setup.chosen': 'あなたは{mine} · 相手は{other}',
    'setup.chosen.cpu': 'あなたは{mine} · CPUは{other}',
    'setup.mode.pvp': '2人対戦',
    'setup.mode.cpu': 'CPU対戦',
    'setup.mode.link': 'スマホ接続',
    'net.deciding': '{name}が行動を考え中…',
    'net.you': 'あなた',
    'net.waitHost': 'ホストを待っています…',
    'tip.link': 'スマホ接続',
    'setup.diff.normal': '普通',
    'setup.diff.advanced': '上級',
    'setup.diff.master': '達人',

    // UI labels
    'ui.round': 'ROUND {n}',
    'ui.roundDecisive': 'ROUND 3 · 決戦',
    'ui.turn': 'TURN {n}',
    'ui.turnLabel.first': '{name}の番（先攻）',
    'ui.turnLabel.second': '{name}の番（後攻）',
    'ui.penalty': '次のターン: 行動 -{n}',
    'ui.expansion.far': '{n}ターン後に星屑拡大: {cells}番',
    'ui.expansion.imminent': '次のターン星屑拡大: {cells}番',
    'ui.expansion.full': '星屑が完全に広がった',

    // Curtain
    'curtain.handoff.title': '画面を渡す',
    'curtain.handoff.sub': '相手に端末を渡してください',
    'curtain.handoff.sub.nextTurn': '次のターンを始めてください',
    'curtain.turnName': '{name}の番',
    'curtain.draw.label': '先 攻 抽 選',
    'curtain.draw.title.rolling': 'どのルーンが先に光るか…',
    'curtain.draw.result': '{name}が先攻',
    'curtain.draw.handoffSub': 'ラウンド1 · 先攻',
    'curtain.round.badge': 'ROUND {n} 終了',
    'curtain.round.winner': '{name}の勝利',
    'curtain.round.draw': '引 き 分 け',
    'curtain.round.nextFirst': '次のラウンドの先攻: {name}',
    'curtain.round.sub.decisive': '決戦ラウンド · 行動3回 · 先攻',
    'curtain.round.sub.normal': 'ラウンド{n} · 先攻',

    // End modal
    'end.matchOver': '― 試 合 終 了 ―',
    'end.winner': '勝者',
    'end.draw': '引 き 分 け',
    'end.drawSub': '二つの精霊の力が拮抗した',
    'end.winnerSub': '試合の勝者',

    // FX / cells
    'cell.stardust': '星屑',
    'cell.safe': '安全',
    'cell.warn1': '⚠ 星屑 1',
    'cell.warn2': '⚠ 星屑 2',
    'cell.danger': '☠ -1/ターン',
    'fx.collision': '⟷ 衝 突',

    // ボード上のフロートテキスト
    'float.miss':         '外れ',
    'float.blocked':      '防いだ!',
    'float.counter':      '反撃!',
    'float.whiff':        'カウンター空振り',
    'float.pierce':       '貫通!',
    'float.pierced':      '防御貫通!',
    'float.evade':        '回避!',
    'float.leap':         '跳躍!',
    'float.stardust':     '星屑の侵食!',
    'float.stardustWarn': '星屑が迫る',

    // Language toggle (shows the NEXT language as a hint)
    'lang.toggle': 'EN',
    'lang.toggle.title': '英語に切り替え',

    // Tooltips
    'tip.sound': 'ミュート (M)',
    'tip.volume': '音量',
    'tip.help': 'ルール',

    // 回転案内（モバイル縦向き）
    'rotate.title': '端末を横向きにしてください',
    'rotate.sub': 'Spirit Duel は横画面でプレイします',
  }
};

// 현재 로케일 — 기본값 영어
let currentLocale = 'en';

// 간단한 템플릿 치환: {key}를 params[key]로 대체
function t(key, params) {
  const dict = I18N[currentLocale] || I18N.en;
  const str = dict[key] ?? I18N.en[key] ?? key;
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined && params[k] !== null ? params[k] : ''));
}

function getLocale() {
  return currentLocale;
}

function setLocale(loc) {
  if (!I18N[loc]) return;
  currentLocale = loc;
  document.documentElement.setAttribute('lang', loc);
  applyStaticTranslations();
  // 동적 렌더링은 game.js 쪽에서 relocalize 호출
  if (typeof onLocaleChanged === 'function') onLocaleChanged();
}

// data-i18n / data-i18n-html / data-i18n-attr-{attrName} 속성을 가진 요소들을 갱신
function applyStaticTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    el.innerHTML = t(key);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.setAttribute('title', t(key));
  });
  // 도움말 모달: 현재 로케일 섹션만 .active 부여
  document.querySelectorAll('.help-locale').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-locale') === currentLocale);
  });
}
