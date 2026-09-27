// UI strings: en / ko / ja. Lang = saved pick → browser language → en.
const KEY = 'build-site-clicker-lang';
export const LANGS = ['en', 'ko', 'ja'];
const S = {
  en: {
    title: 'Build Site Clicker',
    zoom: 'Zoom to building', zoomSub: 'tap again to go back',
    vol: 'Volume', volSub: 'tap to open · slide to set',
    keys: 'Camera keys', keysQE: 'rotate', keysAD: 'pan left / right', keysWS: 'zoom in / out',
    lang: 'Language', langSub: 'English → 한국어 → 日本語',
    install: 'Install app', installSub: 'play full-screen, offline',
    iosInstall: 'Share ⎋ → Add to Home Screen',
    power: 'Build power', powerDesc: '+1 build point per hammer hit, +8 % compounding',
    crew: 'Crew', crewDesc: '+1 crew per click · one worker per tier carries the whole crew',
    speed: 'Walk speed', speedDesc: '+15 % walk speed per level',
    pay: 'Payroll', payDesc: 'hammer hits pay +1 % of their build points as clicks',
    luck: 'Lucky swing', luckDesc: '+2 % chance a hit counts ×5',
    bulk: 'Buy max', bulkSub: 'on: buy every level you can afford',
    loading: 'Loading…', tap: 'Tap to build',
    hired: 'HIRED', bot: 'Auto-clicker detected: those taps don’t count',
  },
  ko: {
    title: '건설 현장 클리커',
    zoom: '건물 확대', zoomSub: '다시 탭하면 돌아가기',
    vol: '음량', volSub: '탭하여 열기 · 밀어서 조절',
    keys: '카메라 키', keysQE: '회전', keysAD: '좌우 이동', keysWS: '확대 / 축소',
    lang: '언어', langSub: 'English → 한국어 → 日本語',
    install: '앱 설치', installSub: '전체 화면 · 오프라인 플레이',
    iosInstall: '공유 ⎋ → 홈 화면에 추가',
    power: '건설력', powerDesc: '망치질마다 건설 포인트 +1, 복리 +8 %',
    crew: '작업반', crewDesc: '클릭당 작업반 +1 · 등급마다 작업자 1명이 전체 몫을 수행',
    speed: '이동 속도', speedDesc: '레벨당 이동 속도 +15 %',
    pay: '급여', payDesc: '망치질 건설 포인트의 1 %를 클릭으로 지급',
    luck: '행운의 한 방', luckDesc: '망치질이 ×5가 될 확률 +2 %',
    bulk: '최대 구매', bulkSub: '켜면 살 수 있는 만큼 모두 구매',
    loading: '불러오는 중…', tap: '탭해서 건설',
    hired: '고용!', bot: '오토 클리커 감지: 해당 탭은 인정되지 않아요',
  },
  ja: {
    title: 'ビルドサイト・クリッカー',
    zoom: '建物にズーム', zoomSub: 'もう一度タップで戻る',
    vol: '音量', volSub: 'タップで開く · スライドで調整',
    keys: 'カメラ操作', keysQE: '回転', keysAD: '左右に移動', keysWS: 'ズームイン / アウト',
    lang: '言語', langSub: 'English → 한국어 → 日本語',
    install: 'アプリをインストール', installSub: '全画面・オフラインで遊べる',
    iosInstall: '共有 ⎋ → ホーム画面に追加',
    power: '建設力', powerDesc: 'ハンマー1回ごとに建設ポイント +1、複利 +8 %',
    crew: '作業員', crewDesc: 'クリックごとに作業員 +1 · ランクごとに1人がまとめて作業',
    speed: '移動速度', speedDesc: 'レベルごとに移動速度 +15 %',
    pay: '給料', payDesc: 'ハンマーの建設ポイントの1 %をクリックとして獲得',
    luck: 'ラッキースイング', luckDesc: 'ハンマーが×5になる確率 +2 %',
    bulk: 'まとめ買い', bulkSub: 'オンで買えるだけ購入',
    loading: '読み込み中…', tap: 'タップして建設',
    hired: '採用!', bot: 'オートクリッカーを検出：そのタップは無効です',
  },
};

const pick = () => { try { const s = localStorage.getItem(KEY); if (LANGS.includes(s)) return s; } catch {}
  return LANGS.find(l => (navigator.language || 'en').toLowerCase().startsWith(l)) ?? 'en'; };
export let lang = pick();
export const t = k => S[lang][k] ?? S.en[k] ?? k;
let nf;
// compact numbers in the player's language: 12.3K / 1.2만 / 1.2万
export const num = n => n < 10000 ? String(n) : (nf ??= new Intl.NumberFormat(lang, { notation: 'compact', maximumFractionDigits: 1 })).format(n);
export function setLang(l) {
  lang = l; nf = null; try { localStorage.setItem(KEY, l); } catch {}
  document.documentElement.lang = l; document.title = t('title');
  for (const el of document.querySelectorAll('[data-t]')) el.textContent = t(el.dataset.t);
}
export const nextLang = () => setLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]);
