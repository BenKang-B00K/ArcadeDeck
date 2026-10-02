// WebRTC data channels via PeerJS, star topology: the host holds one channel per guest (max 3)
// and relays game messages between guests. The public PeerJS broker is only used for the handshake.
// Loaded lazily so local play never touches the network.
const SRC = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';
const PREFIX = 'sprintclash-v5-'; // bump when the wire protocol changes so old clients can't join
const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const MAX_GUESTS = 3;

let peer = null, conn = null, guests = [], locked = false, loading = null;
const h = { msg() {}, close() {}, drop() {} };
export const on = (ev, fn) => { h[ev] = fn; };

const load = () => loading ??= new Promise((res, rej) => {
  if (window.Peer) return res();
  const s = document.createElement('script');
  s.src = SRC; s.onload = res;
  s.onerror = () => { loading = null; s.remove(); rej(); };
  document.head.appendChild(s);
});

const valid = m => m && typeof m === 'object';

export async function host(onCode, onPeers, onErr, cap = MAX_GUESTS) { // cap: room size minus the host
  try { await load(); } catch { return onErr('load'); }
  close();
  const code = Array.from({ length: 4 }, () => ABC[Math.random() * ABC.length | 0]).join('');
  const p = peer = new window.Peer(PREFIX + code);
  p.on('open', () => onCode(code));
  p.on('connection', c => {
    if (locked || guests.length >= cap) { c.on('open', () => c.close()); return; }
    c.on('open', () => { if (peer !== p) return c.close(); guests.push(c); onPeers(guests.length); });
    c.on('data', m => {
      const i = guests.indexOf(c);
      if (i < 0 || !valid(m)) return;
      m.from = i + 1; // host stamps the sender; guests can't spoof each other
      h.msg(m);
      if (m.t !== 'rematch') guests.forEach((g, j) => { if (j !== i && g?.open) g.send(m); });
    });
    const drop = () => {
      const i = guests.indexOf(c);
      if (i < 0) return;
      if (locked) { guests[i] = null; h.drop(i + 1); } // keep the slot: player indices must stay stable
      else { guests.splice(i, 1); onPeers(guests.length); }
    };
    c.on('close', drop);
    c.on('error', drop);
  });
  p.on('error', e => {
    if (peer !== p) return;
    if (e.type === 'unavailable-id') host(onCode, onPeers, onErr, cap);
    else if (!guestCount()) onErr(e.type);
  });
}

export async function join(code, onOpen, onErr) {
  try { await load(); } catch { return onErr('load'); }
  close();
  const p = peer = new window.Peer();
  const fail = type => { if (peer === p && !conn?.open) onErr(type); };
  p.on('open', () => {
    const c = conn = p.connect(PREFIX + code, { reliable: true });
    c.on('data', m => { if (conn === c && valid(m)) h.msg(m); }); // bound before open so no early message is missed
    const drop = () => { if (conn === c) { conn = null; h.close(); } };
    c.on('close', drop);
    c.on('error', drop);
    c.on('open', onOpen);
  });
  p.on('error', e => fail(e.type));
  setTimeout(() => fail('timeout'), 15000);
}

export const guestCount = () => guests.filter(Boolean).length;
export const lock = () => { locked = true; };

// host: broadcast to every guest; guest: send to host (who relays)
export function send(m) {
  if (conn?.open) conn.send(m);
  guests.forEach(g => { if (g?.open) g.send(m); });
}
export const sendTo = (i, m) => { if (guests[i]?.open) guests[i].send(m); };

export function close() {
  const c = conn, gs = guests, p = peer;
  conn = peer = null; guests = []; locked = false; // cleared first so close handlers stay silent
  c?.close();
  gs.forEach(g => g?.close());
  p?.destroy();
}
