let ctx = null;
export let muted = false;

export function toggleMute() {
  muted = !muted;
  const btn = document.getElementById('mute-btn');
  if (btn) {
    btn.textContent = muted ? '🔇' : '🔊';
    btn.classList.toggle('muted', muted);
  }
}

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// 젬 투하 시 가벼운 '슈슉' 공기 가르는 소리
export function playDrop(level) {
  try {
    if (muted) return;
    const ac = getCtx();
    const now = ac.currentTime;

    // 레벨에 따라 약간의 피치 차이를 줌
    const baseFreq = 800 + (level * 50);
    const dur = 0.18;

    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.connect(gain);
    gain.connect(ac.destination);

    // 높은 주파수에서 아래로 훑어 내리는 슬라이드 (슈슉 느낌)
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + dur);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02); // 아주 작고 은은하게
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.start(now);
    osc.stop(now + dur);
  } catch (_) {}
}

// 보석 레벨에 따라 다른 피치의 머지음
export function playMerge(level) {
  try {
    if (muted) return;
    const ac = getCtx();
    const now = ac.currentTime;

    // 레벨이 높을수록 고음 + 풍성한 음색
    const freq = 320 + level * 75;
    const dur  = 0.28 + level * 0.012;

    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = level >= 8 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.6, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + dur);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.start(now);
    osc.stop(now + dur);
  } catch (_) {}
}

// Lv11 전설 폭발음: 웅장한 하모닉 코드
export function playLegendary() {
  try {
    if (muted) return;
    const ac = getCtx();
    const now = ac.currentTime;
    [220, 330, 440, 660].forEach((f, i) => {
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.3);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.02 + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc.start(now + i * 0.04);
      osc.stop(now + 1.0);
    });
  } catch (_) {}
}

// 콤보 수에 따라 음이 올라가는 상승 멜로디
export function playCombo(count) {
  try {
    if (muted) return;
    const ac   = getCtx();
    const now  = ac.currentTime;
    const scale = [523, 659, 784, 1047, 1319]; // C5 E5 G5 C6 E6
    const n    = Math.min(count, scale.length);

    for (let i = 0; i < n; i++) {
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(scale[i], now + i * 0.1);
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.22, now + i * 0.1 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.22);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.25);
    }
  } catch (_) {}
}
