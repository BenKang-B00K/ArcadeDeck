// Cloudflare Pages Function on the games project (deployed by `npm run deploy:games`, which picks up ./functions):
// POST games.arcadedeck.net/turn → short-lived Cloudflare Realtime TURN credentials as an RTCIceServer[].
// The phone links (coop.js, Sprint Clash net.js, Tank Battle) fetch it before opening a peer connection so a pair
// with no direct path (cellular CGNAT, client-isolated Wi-Fi, routers without hairpin NAT) relays instead of failing.
// Secrets on the Pages project: TURN_KEY_ID, TURN_KEY_TOKEN (dashboard → Realtime → TURN Server → Create).
// Without them it answers 503 and the games fall back to STUN only.
// ponytail: same-origin check only stops other websites; a script can still mint credentials. They expire after
// a day and the free tier is 1 TB/month — add Turnstile or a rate limit if usage ever shows abuse.
// POST so the games' service workers (which cache GETs) never replay expired credentials.
export async function onRequestPost({ request, env }) {
  const site = request.headers.get('Sec-Fetch-Site');
  if (site && site !== 'same-origin') return new Response('forbidden', { status: 403 });
  if (!env.TURN_KEY_ID || !env.TURN_KEY_TOKEN) return new Response('[]', { status: 503 });
  const r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.TURN_KEY_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ttl: 86400 }),
  });
  if (!r.ok) return new Response('[]', { status: 502 });
  const { iceServers } = await r.json();
  // browsers refuse port 53, so those urls only add failed attempts
  const servers = [].concat(iceServers).map(s => ({ ...s, urls: [].concat(s.urls).filter(u => !/:53(\?|$)/.test(u)) }));
  return Response.json(servers, { headers: { 'Cache-Control': 'no-store' } });
}
