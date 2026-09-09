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
    'player.1.short': 'Azure',
    'player.2.short': 'Amber',

    // Actions
    'action.advance': 'Advance',
    'action.retreat': 'Retreat',
    'action.attack': 'Attack',
    'action.block': 'Block',
    'action.counter': 'Counter',
    'action.pierce': 'Pierce',
    'action.ranged': 'Ranged',
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
    'action.wait': 'wait',

    // Buttons
    'btn.undo': 'Undo',
    'btn.confirm': 'Confirm',
    'btn.ready': 'Ready',
    'btn.beginDuel': 'Begin Duel',
    'btn.nextRound': 'Next Round',
    'btn.newMatch': 'New Match',
    'btn.continue': 'Continue',
    'btn.viewResult': 'View Result',

    // Setup (spirit pick)
    'setup.label': 'S P I R I T   S E L E C T',
    'setup.title': 'Pick who plays Azure Spirit',
    'setup.sub': 'Tap the spirit you will play — the other side is your opponent',
    'setup.sub.cpu': 'Pick your spirit — the CPU will be your opponent',
    'setup.chosen': 'You are {mine} · Opponent is {other}',
    'setup.chosen.cpu': 'You are {mine} · CPU is {other}',
    'setup.mode.pvp': 'Two Players',
    'setup.mode.cpu': 'vs CPU',
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
    'ui.expansion.initial': 'Next stardust in 3 turns',

    // Curtain
    'curtain.handoff.title': 'Pass the Screen',
    'curtain.handoff.sub': 'Hand the device to your opponent',
    'curtain.handoff.sub.nextTurn': 'Begin the next turn',
    'curtain.result.title': 'Both Spirits Ready',
    'curtain.result.sub': 'Tap to reveal what unfolds',
    'curtain.reveal.label': 'SIMULTANEOUS INTENT',
    'curtain.reveal.title': 'The Spirits Have Chosen',
    'curtain.turnName': "{name}'s Turn",
    'curtain.draw.label': 'F I R S T   P L A Y E R   D R A W',
    'curtain.draw.title.initial': 'Which rune will light up first?',
    'curtain.draw.title.rolling': 'Which rune will light up first…',
    'curtain.draw.title.done': 'The rune has shone',
    'curtain.draw.result': '{name} goes first',
    'curtain.draw.handoffSub': 'Round 1 · First',
    'curtain.round.badge': 'ROUND {n} END',
    'curtain.round.winner': '{name} Wins',
    'curtain.round.draw': 'D R A W',
    'curtain.round.nextFirst': 'Next round first: {name}',
    'curtain.round.nextFirstEmpty': 'Next round first: ―',
    'curtain.round.sub.decisive': 'Decisive Round · 3 Actions · First',
    'curtain.round.sub.normal': 'Round {n} · First',

    // End modal
    'end.matchOver': '―   M A T C H   O V E R   ―',
    'end.winner': 'Winner',
    'end.draw': 'D R A W',
    'end.drawSub': "The spirits' powers met in balance",
    'end.winnerSub': 'Match Victor',

    // Log
    'log.opening': 'The spirits stand face to face. The duel begins.',
    'log.newMatch': 'A new match begins.',
    'log.roundBegin': '━ ROUND {n} BEGINS ━',
    'log.decisiveNote': '<span class="gold-c">★ DECISIVE ROUND ★</span> — up to <strong>3 actions</strong> per turn',
    'log.turnResolve': '━ TURN {n} RESOLUTION ━',
    'log.phase': '<em>Phase {n}:</em> {a1name} {a1action} · {a2name} {a2action}',
    'log.damage': '{name} takes {n} damage!',
    'log.expansion': '━ Stardust seeps into cells {cells} ━',
    'log.stardustConsumed': '{name} <span class="gold-c">is consumed by stardust</span> — HP -1',
    'log.stardustThickening': '<em>Stardust thickens around {name}… <span class="gold-c">consumption begins next turn</span></em>',
    'log.stardustLingers': "<em>A stardust aura lingers at {name}'s feet…</em>",
    'log.roundEnd': '— Round {n} ended: {narrative} —',
    'log.narrative.mutual': 'Mutual destruction — draw',
    'log.narrative.p1Win': 'Azure Spirit takes the round',
    'log.narrative.p2Win': 'Amber Spirit takes the round',
    'log.matchDraw': '━━ Match draw ({s1}:{s2}) ━━',
    'log.matchWin': '━━ {name} wins the match ━━',

    // Battle narratives
    'battle.bothPierceHit': 'Pierce attacks collided in stardust — both land',
    'battle.bothRangedHit': 'Two waves crossed in the air — both land',
    'battle.bothHit': 'Two techniques crossed — both land',
    'battle.onlyOneHit': 'Only {atk1} {verb1}. {atk2} missed',
    'battle.bothMiss': 'Both techniques cut only air',
    'battle.outOfReach': "{atk} didn't reach",
    'battle.piercedBlock': '{atk} <span class="gold-c">pierced the block</span>',
    'battle.blocked.wave': '{defender} caught the wave',
    'battle.blocked.attack': '{defender} caught the attack',
    'battle.countered.pierce': '{defender} countered the pierce!',
    'battle.countered.ranged': '{defender} countered the wave!',
    'battle.countered.attack': '{defender} counterstruck!',
    'battle.counterWasted': "{atk} didn't reach — counter went wide too",
    'battle.counterPenalty': 'Counter struck empty air. {name}: -1 action next turn',
    'battle.pierceHit': '{attacker}\'s <span class="gold-c">pierce</span> tore through {defender}',
    'battle.rangedHit': "{attacker}'s wave struck {defender}",
    'battle.closedInHit': "As {defender} closed in, {attacker}'s strike landed",
    'battle.chargedInHit': '{attacker} charged in and landed a strike',
    'battle.strikeHit': "{attacker}'s strike hit",
    'battle.evadedWave': '{defender} widened the gap and slipped the wave',
    'battle.evadedAttack': '{defender} stepped back and let the attack pass',
    'battle.counterEmpty': "{attacker}'s counter cut empty air",
    'battle.defensive': '{name} took a defensive stance',
    'battle.leaped': '{leaper} leaped over {over}',

    // Attack names & verbs
    'atk.name.pierce': "{name}'s pierce attack",
    'atk.name.ranged': "{name}'s wave",
    'atk.name.attack': "{name}'s attack",
    'atk.verb.pierce': 'tore through',
    'atk.verb.ranged': 'struck like lightning',
    'atk.verb.attack': 'landed',

    // FX / cells
    'cell.stardust': 'STARDUST',
    'cell.warn1': '⚠ Stardust 1',
    'cell.warn2': '⚠ Stardust 2',
    'cell.danger': '☠ -1/turn',
    'fx.stardustDmg': 'Stardust -1',
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

    // Language toggle (shows the OTHER language as a hint)
    'lang.toggle': '한',
    'lang.toggle.title': 'Switch to Korean',

    // Tooltips
    'tip.sound': 'Sound toggle (M)',
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
    'player.1.short': '푸른',
    'player.2.short': '호박',

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
    'action.wait': '대기',

    // Buttons
    'btn.undo': '되돌리기',
    'btn.confirm': '입력 완료',
    'btn.ready': '준비 완료',
    'btn.beginDuel': '결투 시작',
    'btn.nextRound': '다음 라운드',
    'btn.newMatch': '새 매치',
    'btn.continue': '계속',
    'btn.viewResult': '결과 보기',

    // Setup (spirit pick)
    'setup.label': '정 령 선 택',
    'setup.title': '누가 푸른 정령을 맡을까',
    'setup.sub': '당신이 조종할 정령을 선택하세요 — 반대편은 상대 플레이어',
    'setup.sub.cpu': '정령을 선택하세요 — CPU가 상대가 됩니다',
    'setup.chosen': '당신은 {mine} · 상대는 {other}',
    'setup.chosen.cpu': '당신은 {mine} · CPU는 {other}',
    'setup.mode.pvp': '두 플레이어',
    'setup.mode.cpu': 'CPU 대전',
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
    'ui.expansion.initial': '다음 별빛 확장: 3턴 후',

    // Curtain
    'curtain.handoff.title': '차례 전환',
    'curtain.handoff.sub': '상대 플레이어에게 화면을 넘기세요',
    'curtain.handoff.sub.nextTurn': '다음 턴을 시작하세요',
    'curtain.result.title': '두 정령의 의지가 모였다',
    'curtain.result.sub': '탭하여 결과를 확인하세요',
    'curtain.reveal.label': '동 시 발 동',
    'curtain.reveal.title': '두 정령의 선택',
    'curtain.turnName': '{name}의 차례',
    'curtain.draw.label': '선 공 추 첨',
    'curtain.draw.title.initial': '어느 룬이 먼저 빛날까',
    'curtain.draw.title.rolling': '어느 룬이 먼저 빛날까…',
    'curtain.draw.title.done': '룬이 빛을 발했다',
    'curtain.draw.result': '{name}이 선공',
    'curtain.draw.handoffSub': '라운드 1 · 선공',
    'curtain.round.badge': 'ROUND {n} 종료',
    'curtain.round.winner': '{name} 승리',
    'curtain.round.draw': '무 승 부',
    'curtain.round.nextFirst': '다음 라운드 선공: {name}',
    'curtain.round.nextFirstEmpty': '다음 라운드 선공: ―',
    'curtain.round.sub.decisive': '결정 라운드 · 액션 3개 · 선공',
    'curtain.round.sub.normal': '라운드 {n} · 선공',

    // End modal
    'end.matchOver': '― 매 치 종 료 ―',
    'end.winner': '승자',
    'end.draw': '무 승 부',
    'end.drawSub': '두 정령의 힘이 맞닿았다',
    'end.winnerSub': '매치의 승자',

    // Log
    'log.opening': '정령들이 마주섰다. 결투의 막이 오른다.',
    'log.newMatch': '새 매치가 시작된다.',
    'log.roundBegin': '━ ROUND {n} 개시 ━',
    'log.decisiveNote': '<span class="gold-c">★ 결정 라운드 ★</span> — 한 턴에 액션 <strong>3개</strong> 사용 가능',
    'log.turnResolve': '━ {n}턴 결의 ━',
    'log.phase': '<em>페이즈 {n}:</em> {a1name} {a1action} · {a2name} {a2action}',
    'log.damage': '{name}이(가) {n} 데미지!',
    'log.expansion': '━ 별빛이 {cells} 칸으로 스며든다 ━',
    'log.stardustConsumed': '{name}이(가) <span class="gold-c">별빛에 잠식되었다</span> — HP -1',
    'log.stardustThickening': '<em>{name}의 주위로 별빛이 짙어진다… <span class="gold-c">다음 턴에 잠식 시작</span></em>',
    'log.stardustLingers': '<em>{name}의 발치에 별빛 기운이 감돈다…</em>',
    'log.roundEnd': '— 라운드 {n} 종료: {narrative} —',
    'log.narrative.mutual': '동시 산화 — 무승부',
    'log.narrative.p1Win': '푸른 정령이 라운드를 가져갔다',
    'log.narrative.p2Win': '호박 정령이 라운드를 가져갔다',
    'log.matchDraw': '━━ 매치 무승부 ({s1}:{s2}) ━━',
    'log.matchWin': '━━ {name}, 매치 승리 ━━',

    // Battle narratives
    'battle.bothPierceHit': '관통 공격이 맞부딪혀 별빛을 일으켰다 — 양쪽 모두 적중',
    'battle.bothRangedHit': '두 줄기 영파가 허공에서 교차했다 — 양쪽 모두 적중',
    'battle.bothHit': '두 기술이 교차했다 — 양쪽 모두 적중',
    'battle.onlyOneHit': '{atk1}만 {verb1}. {atk2}은 빗나갔다',
    'battle.bothMiss': '두 기술이 모두 허공을 갈랐다',
    'battle.outOfReach': '{atk}이 닿지 않았다',
    'battle.piercedBlock': '{atk}이 <span class="gold-c">막기를 뚫었다</span>',
    'battle.blocked.wave': '{defender}이(가) 영파를 받아냈다',
    'battle.blocked.attack': '{defender}이(가) 공격을 받아냈다',
    'battle.countered.pierce': '{defender}이(가) 관통 공격을 받아쳤다!',
    'battle.countered.ranged': '{defender}이(가) 영파를 받아쳤다!',
    'battle.countered.attack': '{defender}이(가) 받아쳤다!',
    'battle.counterWasted': '{atk}이 닿지 않아 카운터도 헛돌았다',
    'battle.counterPenalty': '카운터가 빈손을 쳤다. {name} 다음 턴 액션 -1',
    'battle.pierceHit': '{attacker}의 <span class="gold-c">관통 공격</span>이 {defender}을(를) 꿰뚫었다',
    'battle.rangedHit': '{attacker}의 영파가 {defender}에게 꽂혔다',
    'battle.closedInHit': '{defender}이(가) 다가선 순간, {attacker}의 일격이 꽂혔다',
    'battle.chargedInHit': '{attacker}이(가) 파고들어 일격을 적중시켰다',
    'battle.strikeHit': '{attacker}의 일격이 적중했다',
    'battle.evadedWave': '{defender}이(가) 거리를 벌려 영파를 피했다',
    'battle.evadedAttack': '{defender}이(가) 물러서며 공격을 흘려보냈다',
    'battle.counterEmpty': '{attacker}의 카운터는 허공을 노렸다',
    'battle.defensive': '{name}은(는) 방어 자세를 취했다',
    'battle.leaped': '{leaper}이(가) {over}을(를) 뛰어넘었다',

    // Attack names & verbs
    'atk.name.pierce': '{name}의 관통 공격',
    'atk.name.ranged': '{name}의 영파',
    'atk.name.attack': '{name}의 공격',
    'atk.verb.pierce': '꿰뚫었다',
    'atk.verb.ranged': '번개처럼 적중했다',
    'atk.verb.attack': '적중했다',

    // FX / cells
    'cell.stardust': '별빛',
    'cell.warn1': '⚠ 별빛 1',
    'cell.warn2': '⚠ 별빛 2',
    'cell.danger': '☠ -1/턴',
    'fx.stardustDmg': '별빛 잠식 -1',
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

    // Language toggle
    'lang.toggle': 'EN',
    'lang.toggle.title': '영어로 전환',

    // Tooltips
    'tip.sound': '사운드 토글 (M)',
    'tip.help': '규칙 보기',

    // 회전 안내 (모바일 세로)
    'rotate.title': '기기를 가로로 돌려주세요',
    'rotate.sub': '정령 결투는 가로 모드에서 진행됩니다',
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
