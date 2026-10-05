// coop.js — phone link (Host / Join) for ArcadeDeck local co-op games.
// The same file ships in Ladder Game, Marble Racing, Tandem, Spirit Duel, Triangle Battle and Omok: change every copy together.
// Plain script, exposes window.Coop (works from classic scripts and ES modules alike).
//
// Star topology over WebRTC via PeerJS (same approach as Sprint Clash): the host holds one
// DataConnection per guest; guests talk only to the host. The public PeerJS broker is used for
// the handshake only, then traffic is phone-to-phone. PeerJS is loaded lazily, so solo / same-device
// play never touches the network.
//   reliable channel (send / sendTo): events, moves, full snapshots
//   unreliable channel (fast): { ordered: false, maxRetransmits: 0 } for high-rate state; drops when backed up
// ICE: STUN plus Cloudflare TURN credentials from the games site's /turn Pages Function (functions/turn.js in the
// ArcadeDeck repo), so phones with no direct path (cellular, client-isolated Wi-Fi) relay instead of failing.
// PeerJS's own default TURN (*.turn.peerjs.com) no longer resolves. No /turn (local dev) → STUN only.
//
// Coop.open({
//   game: 'omok',               // peer-id namespace; bump ('omok2') when the wire protocol changes
//   lang: () => 'en',           // 'en' | 'ko' | 'ja'
//   max: 1, min: 1,             // guests (not counting the host) allowed / needed to start
//   watch: false,               // true = guests only watch: no lock, late joiners welcome, live chip on screen
//   name: i => 'P' + (i + 1),   // label for player i (0 = host) in "X disconnected"
//   onStart(n, me) {},          // match starts: n guests, me = my slot (0 host, 1..n guests)
//   onMsg(m, from) {},          // game message; from = sender slot (host sees 1..n, guests see 0)
//   onJoin(i) {},               // host: guest i connected (watch mode: send it the current state)
//   onLeave(i) {},              // link lost after start: i = slot that left (guests always see 0)
//   onMenu() {},                // player pressed "Back to menu" / "Leave" — return the game to its menu
// })
// Coop.send(m) host → every guest, guest → host · Coop.sendTo(i, m) · Coop.fast(m) · Coop.close()
// Coop.role → null | 'host' | 'guest' · Coop.live → linked and started · Coop.me → my slot
// Message objects must not use the `$` key (reserved for the link itself).
(() => {
  const SRC = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';
  const ABC = 'ACDEFHJKMNPRTWXY'; // letters only, no look-alikes (O/0, I/L/1, B/8, S/5, Z/2, G/6, Q, U/V)
  const HB = 2000, HB_DEAD = 12000;     // heartbeat: a phone that sleeps or walks out of Wi-Fi is dropped, never a frozen screen

  const T = {
    en: {
      title: 'Play on separate phones', intro: 'One phone hosts and shows a code, the others join with it. Same Wi-Fi or one phone’s hotspot works best.',
      introWatch: 'Host the game and others can follow it live on their own phones with the code.',
      host: 'Host', join: 'Join', close: 'Close', cancel: 'Cancel', start: 'Start', cont: 'Continue', leave: 'Leave', menu: 'Back to menu', back: 'Back',
      opening: 'Opening a room…', code: 'Room code', waiting: 'Players {n}/{max}', watching: '{n} watching',
      codeHint: 'Code on the host’s screen', codeShort: 'CODE', connecting: 'Connecting…',
      connected: 'Connected! Waiting for the host to start…', connectedWatch: 'Connected! The host’s game shows up here.', live: 'Live',
      errServer: 'Can’t reach the room server. Check your internet connection and try again.',
      errCode: 'No room with that code. Check the code on the host’s screen.',
      errFull: 'That room is full or the game has already started.',
      errLink: 'The phones couldn’t connect directly. Join the same Wi-Fi, or turn on one phone’s hotspot and connect the other to it.',
      left: '{name} disconnected.', hostLeft: 'The host disconnected.',
    },
    ko: {
      title: '각자 휴대폰으로 플레이', intro: '한 휴대폰이 호스트가 되어 코드를 보여 주고, 다른 휴대폰은 그 코드로 참가합니다. 같은 Wi-Fi나 한 휴대폰의 핫스팟을 쓰면 가장 잘 연결됩니다.',
      introWatch: '호스트가 게임을 열면 다른 사람들은 코드로 들어와 각자 휴대폰에서 실시간으로 지켜볼 수 있습니다.',
      host: '방 만들기', join: '참가', close: '닫기', cancel: '취소', start: '시작', cont: '계속', leave: '나가기', menu: '메뉴로', back: '뒤로',
      opening: '방을 여는 중…', code: '방 코드', waiting: '플레이어 {n}/{max}', watching: '{n}명 관전 중',
      codeHint: '호스트 화면의 코드', codeShort: '코드', connecting: '연결 중…',
      connected: '연결됨! 호스트가 시작하기를 기다리는 중…', connectedWatch: '연결됨! 호스트의 게임이 여기에 표시됩니다.', live: '관전 중',
      errServer: '방 서버에 연결할 수 없습니다. 인터넷 연결을 확인하고 다시 시도하세요.',
      errCode: '그 코드의 방이 없습니다. 호스트 화면의 코드를 확인하세요.',
      errFull: '방이 가득 찼거나 이미 게임이 시작되었습니다.',
      errLink: '휴대폰끼리 직접 연결하지 못했습니다. 같은 Wi-Fi에 접속하거나, 한 휴대폰의 핫스팟을 켜고 다른 휴대폰을 연결하세요.',
      left: '{name} 연결이 끊겼습니다.', hostLeft: '호스트와 연결이 끊겼습니다.',
    },
    ja: {
      title: 'それぞれのスマホでプレイ', intro: '1台がホストになってコードを表示し、ほかのスマホはそのコードで参加します。同じWi-Fiか、1台のテザリングを使うとつながりやすくなります。',
      introWatch: 'ホストがゲームを開くと、ほかの人はコードで入って自分のスマホでライブ観戦できます。',
      host: 'ルーム作成', join: '参加', close: '閉じる', cancel: 'キャンセル', start: 'スタート', cont: '続ける', leave: '退出', menu: 'メニューへ', back: '戻る',
      opening: 'ルームを作成中…', code: 'ルームコード', waiting: 'プレイヤー {n}/{max}', watching: '{n}人が観戦中',
      codeHint: 'ホスト画面のコード', codeShort: 'コード', connecting: '接続中…',
      connected: '接続しました！ホストの開始を待っています…', connectedWatch: '接続しました！ホストのゲームがここに映ります。', live: '観戦中',
      errServer: 'ルームサーバーにつながりません。インターネット接続を確認して、もう一度お試しください。',
      errCode: 'そのコードのルームはありません。ホストの画面のコードを確かめてください。',
      errFull: 'ルームが満員か、すでにゲームが始まっています。',
      errLink: 'スマホ同士を直接つなげませんでした。同じWi-Fiにつなぐか、1台のテザリングをオンにしてもう1台をつないでください。',
      left: '{name}の接続が切れました。', hostLeft: 'ホストとの接続が切れました。',
    },
  };

  let o = {}, peer = null, conn = null, guests = [], started = false, me = 0, code = '', loading = null, hbTimer = 0, joinTimer = 0;
  let view = 'menu', msg = '', box = null, chip = null;

  const tr = (k, a = {}) => (T[o.lang?.()] || T.en)[k].replace(/\{(\w+)\}/g, (_, x) => a[x]);
  const nameOf = i => (o.name ? o.name(i) : 'P' + (i + 1));
  const load = () => loading ??= new Promise((res, rej) => {
    if (window.Peer) return res();
    const s = document.createElement('script');
    s.src = SRC; s.onload = res;
    s.onerror = () => { loading = null; s.remove(); rej(); };
    document.head.appendChild(s);
  });
  const STUN = [{ urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.l.google.com:19302'] }];
  // POST, not GET: the games' service workers cache GETs and would replay expired credentials
  const ice = () => fetch('/turn', { method: 'POST', signal: AbortSignal.timeout?.(4000) }).then(r => (r.ok ? r.json() : [])).catch(() => [])
    .then(t => ({ config: { iceServers: STUN.concat(Array.isArray(t) ? t : []) } }));

  // ---------- connections ----------
  function wire(c) {
    c.seen = Date.now();
    c.on('data', m => { if (m && typeof m === 'object') recv(c, m); }); // bound before open so no early message is missed
    c.on('close', () => lost(c));
    c.on('error', () => lost(c));
    c.on('open', () => {
      // negotiated on both ends with the same id: no extra signaling round
      const f = c.fastCh = c.peerConnection.createDataChannel('fast', { negotiated: true, id: 77, ordered: false, maxRetransmits: 0 });
      f.onmessage = e => { try { recv(c, JSON.parse(e.data)); } catch { /* torn packet */ } };
    });
  }
  function recv(c, m) {
    c.seen = Date.now();
    if (m.$ === 'hb') return;
    if (m.$ === 'full') return fail('errFull');
    if (m.$ === 'start') {
      started = true; me = m.me;
      if (o.watch) { view = 'joined'; showChip(); hide(); } else hide();
      return o.onStart?.(m.n, m.me);
    }
    if (m.$) return;
    if (c === conn) o.onMsg?.(m, 0);
    else { const i = guests.indexOf(c); if (i >= 0) o.onMsg?.(m, i + 1); }
  }
  function lost(c) {
    if (c === conn) {
      conn = null;
      const was = started;
      close();
      if (was) { o.onLeave?.(0); notice(tr('hostLeft')); } else if (view === 'joined') fail('hostLeft');
      return;
    }
    const i = guests.indexOf(c);
    if (i < 0) return;
    if (!started) { guests.splice(i, 1); return render(); }
    guests[i] = null;
    if (o.watch) return showChip();
    o.onLeave?.(i + 1);
    notice(tr('left', { name: nameOf(i + 1) }));
  }
  function beat() {
    clearInterval(hbTimer);
    hbTimer = setInterval(() => {
      const now = Date.now();
      for (const c of conn ? [conn] : guests) {
        if (!c?.open) continue;
        if (now - c.seen > HB_DEAD) { c.close(); lost(c); } else c.send({ $: 'hb' });
      }
    }, HB);
  }
  const count = () => guests.filter(Boolean).length;

  function host() {
    view = 'opening'; render();
    Promise.all([load(), ice()]).then(([, cfg]) => {
      if (view !== 'opening') return; // cancelled while fetching
      close();
      view = 'opening';
      code = Array.from({ length: 4 }, () => ABC[Math.random() * ABC.length | 0]).join('');
      const p = peer = new window.Peer(`arcadedeck-${o.game}-${code}`, cfg);
      p.on('open', () => { if (peer === p && view === 'opening') { view = 'hosting'; render(); beat(); } }); // a reconnect opens again: no dialog mid-game
      // room server dropped (Wi-Fi blip, phone woke from sleep): re-register the same code so late joiners still find the room.
      // Not after a locked start (start() disconnects on purpose); while offline it retries every 2 s
      p.on('disconnected', () => setTimeout(() => {
        if (peer === p && p.disconnected && !p.destroyed && (o.watch || !started)) p.reconnect();
      }, 2000));
      p.on('connection', c => {
        wire(c);
        c.on('open', () => {
          if (peer !== p) return c.close();
          if ((started && !o.watch) || count() >= o.max) { c.send({ $: 'full' }); setTimeout(() => c.close(), 500); return; }
          guests.push(c);
          if (started) { c.send({ $: 'start', me: guests.length, n: count() }); showChip(); } else render();
          o.onJoin?.(guests.length); // after start, so a late watcher gets the state once it is listening
        });
      });
      p.on('error', e => {
        if (peer !== p) return;
        if (e.type === 'unavailable-id') host();          // code taken: roll another
        else if (!started && view === 'opening') fail('errServer');
      });
    }, () => fail('errServer'));
  }

  function join(c) {
    c = c.trim().toUpperCase();
    if (c.length !== 4 || view !== 'menu') return; // the input fires on the 4th char, Enter may follow
    view = 'connecting'; render();
    Promise.all([load(), ice()]).then(([, cfg]) => {
      if (view !== 'connecting') return; // cancelled while fetching
      close();
      view = 'connecting';
      const p = peer = new window.Peer(cfg);
      const bail = k => { if (peer === p && !conn?.open) fail(k); };
      p.on('open', () => {
        const cn = p.connect(`arcadedeck-${o.game}-${c}`, { reliable: true });
        wire(cn);
        cn.on('open', () => {
          if (peer !== p) return;
          clearTimeout(joinTimer);
          conn = cn; view = 'joined'; render(); beat();
          p.disconnect(); // broker no longer needed; the P2P link stays up
        });
      });
      p.on('error', e => bail(e.type === 'peer-unavailable' ? 'errCode' : e.type === 'webrtc' ? 'errLink' : 'errServer'));
      joinTimer = setTimeout(() => bail('errLink'), 15000);
    }, () => fail('errServer'));
  }

  function start() {
    started = true; me = 0;
    const n = count();
    guests.forEach((g, i) => g.send({ $: 'start', me: i + 1, n }));
    if (o.watch) showChip(); else peer?.disconnect(); // room locked: stop taking handshakes
    hide();
    o.onStart?.(n, 0);
  }

  function close() {
    const c = conn, gs = guests, p = peer;
    conn = peer = null; guests = []; started = false; me = 0; code = ''; // cleared first so close handlers stay silent
    clearInterval(hbTimer); clearTimeout(joinTimer);
    c?.close();
    gs.forEach(g => g?.close());
    p?.destroy();
    chip?.remove(); chip = null;
  }

  // ---------- UI ----------
  const CSS = `
.coop{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));background:rgba(4,7,18,.74);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);color:#f3f5ff;font-family:inherit;touch-action:manipulation;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;overscroll-behavior:contain}
.coop[hidden]{display:none}
.coop-box{box-sizing:border-box;width:min(360px,100%);max-height:100%;overflow:auto;display:grid;grid-template-columns:minmax(0,1fr);gap:14px;padding:22px 20px;border-radius:18px;background:var(--coop-bg,#151a31);border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 64px rgba(0,0,0,.55);text-align:center}
.coop h2{margin:0;font-size:1.2rem;line-height:1.3}
.coop p{margin:0;font-size:.92rem;line-height:1.5;opacity:.85}
.coop .coop-err{color:#ffb3b3;opacity:1}
.coop button{min-height:48px;padding:0 16px;border:0;border-radius:12px;background:rgba(255,255,255,.1);color:inherit;font:inherit;font-size:1rem;font-weight:700;cursor:pointer;touch-action:manipulation}
.coop button.pri{background:var(--coop-accent,#5b8cff);color:#fff}
.coop button:disabled{opacity:.4;cursor:default}
.coop button:focus-visible,.coop input:focus-visible{outline:3px solid var(--coop-accent,#5b8cff);outline-offset:2px}
.coop-row{display:flex;gap:10px}.coop-row>*{flex:1 1 0;min-width:0}
.coop input{box-sizing:border-box;min-height:48px;padding:0 8px;border:2px solid rgba(255,255,255,.2);border-radius:12px;background:rgba(0,0,0,.3);color:inherit;font:inherit;font-size:1.4rem;font-weight:800;letter-spacing:.3em;text-align:center;text-transform:uppercase;-webkit-user-select:text;user-select:text}
.coop input::placeholder{font-size:.8rem;font-weight:600;letter-spacing:0;text-transform:none;opacity:.6}
.coop hr{width:100%;margin:2px 0;border:0;border-top:1px solid rgba(255,255,255,.12)}
.coop-code{font:900 3rem/1.1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.18em;-webkit-user-select:text;user-select:text}
.coop-spin{width:30px;height:30px;margin:4px auto;border:3px solid rgba(255,255,255,.2);border-top-color:var(--coop-accent,#5b8cff);border-radius:50%;animation:coop-spin .8s linear infinite}
@keyframes coop-spin{to{transform:rotate(1turn)}}
.coop-chip{position:fixed;z-index:2147482999;left:max(10px,env(safe-area-inset-left));bottom:max(10px,env(safe-area-inset-bottom));display:flex;align-items:center;gap:6px;min-height:44px;padding:0 14px;border:1px solid rgba(255,255,255,.18);border-radius:22px;background:rgba(10,14,30,.82);color:#fff;font:700 .9rem/1 system-ui,sans-serif;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.coop-chip i{width:8px;height:8px;border-radius:50%;background:#ff4d5e;box-shadow:0 0 8px #ff4d5e}
.coop-chip svg{width:18px;height:18px}
@media (max-height:420px){.coop-box{gap:8px;padding:14px 16px}.coop h2{font-size:1.05rem}.coop p{font-size:.85rem;line-height:1.4}.coop button,.coop input{min-height:44px}.coop-code{font-size:2.2rem}}
@media (prefers-reduced-motion:reduce){.coop-spin{animation-duration:2.4s}}`;
  const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';

  function mount() {
    if (box) return;
    const st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
    box = document.createElement('div');
    box.className = 'coop';
    box.hidden = true;
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    // typing the code must not drive the game underneath
    for (const t of ['keydown', 'keyup', 'keypress']) box.addEventListener(t, e => e.stopPropagation());
    box.addEventListener('click', e => {
      const a = e.target.closest('button')?.dataset.a;
      if (a === 'host') host();
      else if (a === 'join') join(box.querySelector('input').value);
      else if (a === 'start') start();
      else if (a === 'back') { view = 'menu'; render(); }
      else if (a === 'close') hide();
      else if (a === 'cancel' || a === 'leave' || a === 'menu') { close(); view = 'menu'; hide(); if (a !== 'cancel') o.onMenu?.(); }
    });
    box.addEventListener('input', e => {
      const el = e.target;
      el.value = el.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
      if (el.value.length === 4) join(el.value); // submit on the last character
    });
    box.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') join(e.target.value); });
    document.body.appendChild(box);
    addEventListener('pagehide', close);
  }

  function render() {
    if (!box) return;
    const b = (a, k, cls = '', dis = false) => `<button type="button" data-a="${a}" class="${cls}"${dis ? ' disabled' : ''}>${tr(k)}</button>`;
    const n = count();
    let h;
    if (view === 'menu') h = `<h2>${tr('title')}</h2><p>${tr(o.watch ? 'introWatch' : 'intro')}</p>${b('host', 'host', 'pri')}<hr>
      <div class="coop-row"><input type="text" inputmode="email" autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false" maxlength="4" enterkeyhint="go" placeholder="${tr('codeShort')}" aria-label="${tr('codeHint')}">${b('join', 'join')}</div>${b('close', 'close')}`;
    else if (view === 'opening' || view === 'connecting') h = `<div class="coop-spin"></div><p>${tr(view === 'opening' ? 'opening' : 'connecting')}</p>${b('cancel', 'cancel')}`;
    else if (view === 'hosting') h = `<p>${tr('code')}</p><div class="coop-code">${code}</div><p aria-live="polite">${o.watch ? tr('watching', { n }) : tr('waiting', { n: n + 1, max: o.max + 1 })}</p>
      <div class="coop-row">${started ? b('leave', 'leave') + b('close', 'close', 'pri') : b('cancel', 'cancel') + b('start', o.watch ? 'cont' : 'start', 'pri', !o.watch && n < (o.min ?? 1))}</div>`;
    else if (view === 'joined') h = `<p aria-live="polite">${tr(o.watch ? 'connectedWatch' : 'connected')}</p>${started ? `<div class="coop-row">${b('leave', 'leave') + b('close', 'close', 'pri')}</div>` : b('cancel', 'cancel')}`;
    else if (view === 'error') h = `<p class="coop-err" role="alert">${msg}</p>${b('back', 'back', 'pri')}`;
    else h = `<p role="alert">${msg}</p>${b('menu', 'menu', 'pri')}`; // notice: the link ended mid-game
    box.innerHTML = `<div class="coop-box">${h}</div>`;
    box.hidden = false;
    // phones: focusing the code box would pop the keyboard over the Host button
    (!matchMedia('(pointer: coarse)').matches && box.querySelector('input') || box.querySelector('button.pri:not(:disabled)') || box.querySelector('button'))?.focus({ preventScroll: true });
  }
  function hide() { if (box) box.hidden = true; }
  function fail(k) { close(); view = 'error'; msg = tr(k); render(); }
  function notice(text) { close(); view = 'notice'; msg = text; render(); }

  // watch mode: small live chip; host sees the code + audience, guests tap it to leave
  function showChip() {
    if (!o.watch || !(peer || conn)) return;
    if (!chip) {
      chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'coop-chip';
      chip.onclick = () => { view = conn ? 'joined' : 'hosting'; render(); };
      document.body.appendChild(chip);
    }
    chip.innerHTML = `<i></i>${conn ? tr('live') : `${code} ${EYE} ${count()}`}`;
    if (view === 'hosting' && !box.hidden) render();
  }

  window.Coop = {
    open(opts) {
      o = { max: 1, min: 1, ...opts };
      mount();
      if (!peer && !conn) view = 'menu';
      else if (view !== 'hosting' && view !== 'joined') view = conn ? 'joined' : 'hosting';
      render();
    },
    send(m) {
      if (conn?.open) conn.send(m);
      else guests.forEach(g => { if (g?.open) g.send(m); });
    },
    sendTo(i, m) { const g = guests[i - 1]; if (g?.open) g.send(m); },
    // unreliable: a slow link drops frames instead of queueing them
    fast(m) {
      const s = JSON.stringify(m);
      for (const c of conn ? [conn] : guests) {
        const f = c?.fastCh;
        if (f?.readyState === 'open' && f.bufferedAmount < 16384) f.send(s);
      }
    },
    close() { close(); view = 'menu'; hide(); },
    get role() { return conn ? 'guest' : peer && code ? 'host' : null; },
    get live() { return started && !!(conn || peer); },
    get me() { return me; },
    get count() { return count(); },
  };
})();
