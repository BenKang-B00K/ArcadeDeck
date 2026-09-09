let translations = {};

// Full fallback resources (50 achievements included)
const fallbackResources = {
  ko: {
    "title": "FRUIT FRENZY",
    "score": "SCORE", "best": "BEST", "combo": "COMBO", "level": "LEVEL", "level_up": "레벨 업!",
    "start_msg": "바구니로 과일을 받아요!<br>폭탄 💣은 절대 피하세요!",
    "start_btn": "시작하기", "restart_btn": "다시 하기", "menu_btn": "메인으로",
    "game_over": "게임 오버!", "pts": "점", "new_best": "🎉 신기록 달성!", "best_record": "최고 기록",
    "stat_fruits": "과일 수집", "stat_bombs": "폭탄 회피", "stat_combo": "최고 콤보", "stat_level": "도달 레벨",
    "summary_star": "희귀 별", "summary_fruit": "과일", "summary_bomb": "폭탄 수집", "summary_miss": "과일 놓침",
    "val_star": "3점", "val_fruit": "1점 (콤보시 2점)", "val_bomb": "목숨 -1", "val_miss": "목숨 -1",
    "hint": "🖱️ 마우스 또는 터치로 이동", "sound_title": "사운드 켜기/끄기",
    "levels": ["초보자", "견습생", "아마추어", "고수", "달인", "전설", "신화"],
    "ac_unlocked": "업적 달성!", "ac_menu_title": "업적 도감", "back_btn": "뒤로 가기",
    // 50 Achievements (KR)
    "ac_first_catch_title": "상큼한 출발", "ac_first_catch_desc": "첫 번째 과일을 수집했습니다!",
    "ac_fruits_10_title": "과일 바구니", "ac_fruits_10_desc": "과일 10개를 모았습니다.",
    "ac_fruits_50_title": "과일 애호가", "ac_fruits_50_desc": "과일 50개를 수집했습니다.",
    "ac_fruits_100_title": "과일 수집가", "ac_fruits_100_desc": "과일 100개를 수집했습니다.",
    "ac_fruits_200_title": "과일 전문가", "ac_fruits_200_desc": "과일 200개를 수집했습니다.",
    "ac_fruit_collector_title": "과일 대수확", "ac_fruit_collector_desc": "총 300개의 과일을 담았습니다!",
    "ac_fruits_500_title": "과일 마스터", "ac_fruits_500_desc": "과일 500개를 수집했습니다.",
    "ac_fruits_1000_title": "과일의 달인", "ac_fruits_1000_desc": "과일 1000개를 수집했습니다.",
    "ac_combo_5_title": "리듬을 타요", "ac_combo_5_desc": "5 콤보 달성!",
    "ac_combo_10_title": "더블 리듬", "ac_combo_10_desc": "10 콤보 달성!",
    "ac_combo_20_title": "과일 광풍", "ac_combo_20_desc": "20 콤보 달성!",
    "ac_combo_30_title": "트리플 리듬", "ac_combo_30_desc": "30 콤보 달성!",
    "ac_combo_40_title": "멈추지 않는 손", "ac_combo_40_desc": "40 콤보 달성!",
    "ac_combo_50_title": "콤보의 달인", "ac_combo_50_desc": "50 콤보 달성!",
    "ac_combo_60_title": "집중력 폭발", "ac_combo_60_desc": "60 콤보 달성!",
    "ac_combo_70_title": "무아지경", "ac_combo_70_desc": "70 콤보 달성!",
    "ac_combo_80_title": "화려한 손놀림", "ac_combo_80_desc": "80 콤보 달성!",
    "ac_combo_90_title": "극한의 경지", "ac_combo_90_desc": "90 콤보 달성!",
    "ac_combo_100_title": "신의 경지", "ac_combo_100_desc": "100 콤보 달성!",
    "ac_combo_120_title": "불가능은 없다", "ac_combo_120_desc": "120 콤보 달성!",
    "ac_frenzy_king_title": "프렌지 킹", "ac_frenzy_king_desc": "150 콤보 달성!",
    "ac_combo_200_title": "프렌지 엠페러", "ac_combo_200_desc": "200 콤보 달성!",
    "ac_bombs_5_title": "위험 감지", "ac_bombs_5_desc": "폭탄 5개를 피했습니다.",
    "ac_bombs_10_title": "안전 제일", "ac_bombs_10_desc": "폭탄 10개를 피했습니다.",
    "ac_bombs_20_title": "폭탄 탐지기", "ac_bombs_20_desc": "폭탄 20개를 피했습니다.",
    "ac_bombs_30_title": "안전 운전", "ac_bombs_30_desc": "폭탄 30개를 피했습니다.",
    "ac_bombs_40_title": "회피 전문가", "ac_bombs_40_desc": "폭탄 40개를 피했습니다.",
    "ac_bombs_50_title": "폭탄 전문가", "ac_bombs_50_desc": "폭탄 50개를 피했습니다.",
    "ac_bombs_75_title": "폭탄 마스터", "ac_bombs_75_desc": "폭탄 75개를 피했습니다.",
    "ac_bombs_100_title": "언터처블", "ac_bombs_100_desc": "폭탄 100개를 피했습니다.",
    "ac_score_50_title": "작은 성취", "ac_score_50_desc": "50점 돌파!",
    "ac_score_100_title": "과일 부자", "ac_score_100_desc": "100점 돌파!",
    "ac_score_200_title": "중급 수집가", "ac_score_200_desc": "200점 돌파!",
    "ac_score_300_title": "베테랑", "ac_score_300_desc": "300점 돌파!",
    "ac_score_400_title": "고득점자", "ac_score_400_desc": "400점 돌파!",
    "ac_score_500_title": "과일 마스터", "ac_score_500_desc": "500점 돌파!",
    "ac_score_750_title": "거물 수집가", "ac_score_750_desc": "750점 돌파!",
    "ac_score_1000_title": "천 점의 영광", "ac_score_1000_desc": "1000점 돌파!",
    "ac_score_1500_title": "전설의 시작", "ac_score_1500_desc": "1500점 돌파!",
    "ac_score_2000_title": "과일의 신", "ac_score_2000_desc": "2000점 돌파!",
    "ac_score_5000_title": "무한의 영광", "ac_score_5000_desc": "5000점 돌파!",
    "ac_level_2_title": "입문자", "ac_level_2_desc": "레벨 2 도달!",
    "ac_level_3_title": "숙련된 농부", "ac_level_3_desc": "레벨 3 도달!",
    "ac_level_4_title": "전문가", "ac_level_4_desc": "레벨 4 도달!",
    "ac_level_5_title": "베테랑 수집가", "ac_level_5_desc": "레벨 5 도달!",
    "ac_level_6_title": "정점에 선 자", "ac_level_6_desc": "레벨 6 도달!",
    "ac_level_max_title": "전설의 귀환", "ac_level_max_desc": "모든 난이도 정복!",
    "ac_survivor_title": "완벽한 생존자", "ac_survivor_desc": "하트 3개로 레벨 4 도달!",
    "ac_unscathed_title": "무결점 플레이", "ac_unscathed_desc": "하트 3개로 300점 달성!",
    "ac_frenzy_god_title": "프렌지 갓", "ac_frenzy_god_desc": "250 콤보라는 신화적 기록!"
  },
  en: {
    "title": "FRUIT FRENZY",
    "score": "SCORE", "best": "BEST", "combo": "COMBO", "level": "LEVEL", "level_up": "LEVEL UP!",
    "start_msg": "Catch fruits with the basket!<br>Avoid the bombs 💣 at all costs!",
    "start_btn": "START", "restart_btn": "REPLAY", "menu_btn": "MENU",
    "game_over": "GAME OVER!", "pts": "pts", "new_best": "🎉 NEW BEST!", "best_record": "Best Score",
    "stat_fruits": "Fruits Caught", "stat_bombs": "Bombs Avoided", "stat_combo": "Best Combo", "stat_level": "Reached Level",
    "summary_star": "Rare Star", "summary_fruit": "Fruit", "summary_bomb": "Bomb Catch", "summary_miss": "Missed Fruit",
    "val_star": "3 pts", "val_fruit": "1 pt (2 for combo)", "val_bomb": "Life -1", "val_miss": "Life -1",
    "hint": "🖱️ Move with mouse or touch", "sound_title": "Sound On/Off",
    "levels": ["Novice", "Apprentice", "Amateur", "Expert", "Master", "Legend", "Myth"],
    "ac_unlocked": "ACHIEVEMENT UNLOCKED!", "ac_menu_title": "ACHIEVEMENTS", "back_btn": "BACK",
    // 50 Achievements (EN)
    "ac_first_catch_title": "Fresh Start", "ac_first_catch_desc": "Caught your first fruit!",
    "ac_fruits_10_title": "Fruit Basket", "ac_fruits_10_desc": "Collected 10 fruits.",
    "ac_fruits_50_title": "Fruit Lover", "ac_fruits_50_desc": "Collected 50 fruits.",
    "ac_fruits_100_title": "Fruit Collector", "ac_fruits_100_desc": "Collected 100 fruits.",
    "ac_fruits_200_title": "Fruit Expert", "ac_fruits_200_desc": "Collected 200 fruits.",
    "ac_fruit_collector_title": "Bumper Harvest", "ac_fruit_collector_desc": "Collected 300 fruits!",
    "ac_fruits_500_title": "Fruit Master", "ac_fruits_500_desc": "Collected 500 fruits.",
    "ac_fruits_1000_title": "Fruit Deity", "ac_fruits_1000_desc": "Collected 1000 fruits.",
    "ac_combo_5_title": "In the Groove", "ac_combo_5_desc": "5x Combo!",
    "ac_combo_10_title": "Double Rhythm", "ac_combo_10_desc": "10x Combo!",
    "ac_combo_20_title": "Fruit Frenzy!", "ac_combo_20_desc": "20x Combo!",
    "ac_combo_30_title": "Triple Rhythm", "ac_combo_30_desc": "30x Combo!",
    "ac_combo_40_title": "Steady Hands", "ac_combo_40_desc": "40x Combo!",
    "ac_combo_50_title": "Combo Master", "ac_combo_50_desc": "50x Combo!",
    "ac_combo_60_title": "Pure Focus", "ac_combo_60_desc": "60x Combo!",
    "ac_combo_70_title": "In the Zone", "ac_combo_70_desc": "70x Combo!",
    "ac_combo_80_title": "Great Flow", "ac_combo_80_desc": "80x Combo!",
    "ac_combo_90_title": "Near Perfection", "ac_combo_90_desc": "90x Combo!",
    "ac_combo_100_title": "Godlike Rhythm", "ac_combo_100_desc": "100x Combo!",
    "ac_combo_120_title": "Beyond Limits", "ac_combo_120_desc": "120x Combo!",
    "ac_frenzy_king_title": "Frenzy King", "ac_frenzy_king_desc": "150x Combo!",
    "ac_combo_200_title": "Frenzy Emperor", "ac_combo_200_desc": "200x Combo!",
    "ac_bombs_5_title": "Danger Sense", "ac_bombs_5_desc": "Avoided 5 bombs.",
    "ac_bombs_10_title": "Safety First", "ac_bombs_10_desc": "Avoided 10 bombs.",
    "ac_bombs_20_title": "Bomb Detector", "ac_bombs_20_desc": "Avoided 20 bombs.",
    "ac_bombs_30_title": "Safe Driving", "ac_bombs_30_desc": "Avoided 30 bombs.",
    "ac_bombs_40_title": "Evasion Expert", "ac_bombs_40_desc": "Avoided 40 bombs.",
    "ac_bombs_50_title": "Bomb Specialist", "ac_bombs_50_desc": "Avoided 50 bombs.",
    "ac_bombs_75_title": "Bomb Master", "ac_bombs_75_desc": "Avoided 75 bombs.",
    "ac_bombs_100_title": "Untouchable", "ac_bombs_100_desc": "Avoided 100 bombs.",
    "ac_score_50_title": "Small Steps", "ac_score_50_desc": "Reached 50 pts.",
    "ac_score_100_title": "Fruit Tycoon", "ac_score_100_desc": "Reached 100 pts.",
    "ac_score_200_title": "Intermediate", "ac_score_200_desc": "Reached 200 pts.",
    "ac_score_300_title": "Veteran", "ac_score_300_desc": "Reached 300 pts.",
    "ac_score_400_title": "High Scorer", "ac_score_400_desc": "Reached 400 pts.",
    "ac_score_500_title": "Fruit Master", "ac_score_500_desc": "Reached 500 pts.",
    "ac_score_750_title": "Big Collector", "ac_score_750_desc": "Reached 750 pts.",
    "ac_score_1000_title": "Grand Millennial", "ac_score_1000_desc": "Reached 1000 pts.",
    "ac_score_1500_title": "Legendary Start", "ac_score_1500_desc": "Reached 1500 pts.",
    "ac_score_2000_title": "Fruit Deity", "ac_score_2000_desc": "Reached 2000 pts!",
    "ac_score_5000_title": "Infinite Glory", "ac_score_5000_desc": "Reached 5000 pts!",
    "ac_level_2_title": "Newcomer", "ac_level_2_desc": "Reached Level 2!",
    "ac_level_3_title": "Seasoned Pro", "ac_level_3_desc": "Reached Level 3!",
    "ac_level_4_title": "Expert", "ac_level_4_desc": "Reached Level 4!",
    "ac_level_5_title": "Veteran Collector", "ac_level_5_desc": "Reached Level 5!",
    "ac_level_6_title": "Elite Gatherer", "ac_level_6_desc": "Reached Level 6!",
    "ac_level_max_title": "The Living Legend", "ac_level_max_desc": "Conquered all levels!",
    "ac_survivor_title": "Perfect Survivor", "ac_survivor_desc": "Reach Level 4 with full health!",
    "ac_unscathed_title": "Flawless Player", "ac_unscathed_desc": "Reach 300 pts with 3 lives!",
    "ac_frenzy_god_title": "Frenzy God", "ac_frenzy_god_desc": "Legendary 250x Combo!"
  }
};

/* ═══════════════════════════════════════
   I18NEXT INITIALIZATION
═══════════════════════════════════════ */
async function initI18n() {
  i18next.init({
    lng: 'ko',
    fallbackLng: 'en',
    resources: {
      ko: { translation: fallbackResources.ko },
      en: { translation: fallbackResources.en }
    }
  }, (err, t) => {
    translations = i18next.getResourceBundle(i18next.language, 'translation');
    document.body.className = `lang-${i18next.language}`;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`lang-${i18next.language}`);
    if (activeBtn) activeBtn.classList.add('active');
    updateStaticTexts();
    if (typeof updateHUD === 'function' && typeof G !== 'undefined' && G) updateHUD();
  });

  try {
    const [koRes, enRes] = await Promise.all([
      fetch('locales/ko.json').then(r => r.ok ? r.json() : null),
      fetch('locales/en.json').then(r => r.ok ? r.json() : null)
    ]);
    if (koRes) i18next.addResourceBundle('ko', 'translation', koRes, true, true);
    if (enRes) i18next.addResourceBundle('en', 'translation', enRes, true, true);
    translations = i18next.getResourceBundle(i18next.language, 'translation');
    updateStaticTexts();
    if (typeof updateHUD === 'function' && typeof G !== 'undefined' && G) updateHUD();
  } catch (err) {
    console.warn('I18n: External fetch failed.');
  }
}

function updateStaticTexts() {
  document.querySelectorAll('[data-t]').forEach(el => {
    const key = el.getAttribute('data-t');
    const translated = i18next.t(key);
    if (translated && translated !== key) el.innerHTML = translated;
  });
}

function switchLang(lng) {
  i18next.changeLanguage(lng, (err, t) => {
    translations = i18next.getResourceBundle(lng, 'translation');
    document.body.className = `lang-${lng}`;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`lang-${lng}`);
    if (activeBtn) activeBtn.classList.add('active');
    updateStaticTexts();
    if (typeof updateHUD === 'function' && typeof G !== 'undefined' && G) updateHUD();
    const overlay = document.getElementById('overlay');
    if (overlay && overlay.style.display !== 'none') {
      if (typeof G !== 'undefined' && G && G.over) {
        if (typeof gameOver === 'function') gameOver();
      } else {
        if (typeof showMenu === 'function') showMenu();
      }
    }
  });
}
initI18n();
