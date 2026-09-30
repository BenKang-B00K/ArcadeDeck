// React 19 hoists <meta>/<link> rendered by pages into <head> but never
// dedupes them against the tags already in the prerendered shell, so a
// hydrated page ends up with two canonicals, two descriptions, two OG sets —
// and after client-side navigation the shell's (e.g. Home's) set comes first.
// Snapshot the shell's tags before React mounts; whenever React inserts a tag
// with the same key, pull the shell twin out, and put it back once React's
// copy is gone again (SPA navigation back to a page that renders no head tags).
// ponytail: only keyed tags (canonical, meta name/property). hreflang and
// JSON-LD stay shell-owned — crawlers load each URL fresh, so they're correct.

const keyOf = (el: Element): string | null => {
  if (el.tagName === 'LINK') return el.getAttribute('rel') === 'canonical' ? 'canonical' : null;
  if (el.tagName !== 'META') return null;
  // index.html writes twitter:* as property=, React pages as name= — same key.
  const k = el.getAttribute('property') ?? el.getAttribute('name');
  return k && k !== 'viewport' && k !== 'theme-color' ? k : null;
};

export function installHeadDedupe(): void {
  const head = document.head;
  const shell = new Map<string, Element[]>();
  for (const el of Array.from(head.children)) {
    const k = keyOf(el);
    if (k) shell.set(k, [...(shell.get(k) ?? []), el]);
  }
  const isShell = (el: Element) => {
    const k = keyOf(el);
    return !!k && !!shell.get(k)?.includes(el);
  };
  const present = (k: string) =>
    Array.from(head.children).some(el => keyOf(el) === k && !isShell(el));

  new MutationObserver(records => {
    const touched = new Set<string>();
    for (const r of records) {
      for (const n of [...Array.from(r.addedNodes), ...Array.from(r.removedNodes)]) {
        if (n instanceof Element && !isShell(n)) {
          const k = keyOf(n);
          if (k && shell.has(k)) touched.add(k);
        }
      }
    }
    for (const k of touched) {
      const twins = shell.get(k)!;
      if (present(k)) twins.forEach(el => el.remove());
      else twins.forEach(el => { if (!el.isConnected) head.appendChild(el); });
    }
  }).observe(head, { childList: true });
}
