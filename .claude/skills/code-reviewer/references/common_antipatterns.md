# Common Antipatterns

## React

### 1. Stale Closure in useEffect
```typescript
// BAD — count is captured at creation time, never updates
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);
  return () => clearInterval(id);
}, []); // count is stale!

// GOOD — functional update uses latest value
useEffect(() => {
  const id = setInterval(() => setCount(c => c + 1), 1000);
  return () => clearInterval(id);
}, []);
```

### 2. Index as Key in Dynamic Lists
```typescript
// BAD — causes reconciliation bugs when list order changes
{items.map((item, idx) => <Item key={idx} data={item} />)}

// GOOD — use stable unique identifier
{items.map(item => <Item key={item.id} data={item} />)}
```

### 3. Inline Functions Causing Re-renders
```typescript
// BAD — new function every render, breaks memo
<Child onClick={() => doSomething(id)} />

// GOOD — stable reference
const handleClick = useCallback(() => doSomething(id), [id]);
<Child onClick={handleClick} />
```

### 4. Missing Cleanup in useEffect
```typescript
// BAD — timer fires after unmount, causes state update on unmounted component
useEffect(() => {
  setTimeout(() => setData(newData), 3000);
}, []);

// GOOD — cleanup prevents stale updates
useEffect(() => {
  const timer = setTimeout(() => setData(newData), 3000);
  return () => clearTimeout(timer);
}, []);
```

### 5. Conditional Hook Calls
```typescript
// BAD — hooks must be called in same order every render
if (isLoggedIn) {
  useEffect(() => { fetchProfile(); }, []);
}

// GOOD — condition inside the hook
useEffect(() => {
  if (isLoggedIn) fetchProfile();
}, [isLoggedIn]);
```

## TypeScript

### 6. `as any` to Silence Errors
```typescript
// BAD — hides real type errors
const el = ref.current as any;
el.webkitRequestFullscreen();

// GOOD — declare vendor-specific types explicitly
const el = ref.current as HTMLElement & {
  webkitRequestFullscreen?: () => void;
};
if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
```

### 7. Untyped External Data
```typescript
// BAD — trusting Firestore data shape
const data = doc.data();
setScore(data.score); // could be undefined

// GOOD — validate and type
interface LeaderboardEntry { score: number; name: string; }
const data = doc.data() as Partial<LeaderboardEntry>;
const score = Number(data.score) || 0;
```

## Security

### 8. Trusting PostMessage Origin
```typescript
// BAD — processes messages from any origin when allowedOrigin is null
if (allowedOrigin && event.origin !== allowedOrigin) return;
// When allowedOrigin is null, ALL messages pass through!

// GOOD — reject when origin can't be verified
if (!allowedOrigin || event.origin !== allowedOrigin) return;
```

### 9. Unvalidated Score Input
```typescript
// BAD — negative or infinite scores accepted
handleScore(event.data.score);

// GOOD — full bounds checking
const score = Number(rawScore);
if (isNaN(score) || !isFinite(score) || score < 0 || score > MAX_SCORE) return;
```

### 10. Storing Unsanitized User Input
```typescript
// BAD — HTML tags stored in database
await addDoc(collection(db, "comments"), { text: userInput });

// GOOD — strip tags as defense-in-depth
const sanitized = userInput.trim().replace(/<[^>]*>/g, '');
await addDoc(collection(db, "comments"), { text: sanitized });
```

## Performance

### 11. N+1 Query Pattern
```typescript
// BAD — one query per game (14 games = 14 queries)
const promises = games.map(game =>
  getDocs(query(collection(db, "lb"), where("gameId", "==", game.id)))
);

// GOOD — batch fetch when possible
const allScores = await getDocs(
  query(collection(db, "lb"), where("name", "==", nickname))
);
const byGame = new Map();
allScores.docs.forEach(d => byGame.set(d.data().gameId, d.data()));
```

### 12. Module-Level Mutable State
```typescript
// BAD — survives component lifecycle, causes stale data across navigations
let cache: Data | null = null;

// GOOD — use sessionStorage or React state/context
const getCached = () => {
  const raw = sessionStorage.getItem('cache_key');
  if (raw) { /* validate freshness */ }
  return null;
};
```

### 13. Recomputing Static Data Every Render
```typescript
// BAD — new array every render
const genres = ['All', ...new Set(games.flatMap(g => g.genres))];

// GOOD — memoize (games is static)
const genres = useMemo(() => ['All', ...new Set(games.flatMap(g => g.genres))], []);
```

## CSS

### 14. 100vh on iOS Safari
```css
/* BAD — address bar causes overflow on iOS */
.fullscreen { height: 100vh; }

/* GOOD — dvh accounts for dynamic viewport */
.fullscreen {
  height: 100vh;    /* fallback */
  height: 100dvh;   /* modern browsers */
}
```

### 15. Missing Safe Area Insets
```css
/* BAD — content hidden behind notch/home indicator */
.navbar { height: 60px; position: fixed; top: 0; }

/* GOOD — extend behind status bar */
.navbar {
  height: calc(60px + env(safe-area-inset-top));
  padding-top: env(safe-area-inset-top);
}
```

### 16. Hardcoded Game ID Logic
```typescript
// BAD — breaks when games are added/removed
if (game.id === '5') {
  docs.sort((a, b) => (a.subScore || 0) - (b.subScore || 0));
}

// GOOD — use game config
const subSortAsc = game.leaderboard?.subSortAsc ?? false;
docs.sort((a, b) => compareLeaderboardEntries(a, b, subSortAsc));
```

## Firebase

### 17. Missing Error Handling on Firestore Reads
```typescript
// BAD — getDocs failure crashes the app
const snapshot = await getDocs(q);

// GOOD — graceful degradation
try {
  const snapshot = await getDocs(q);
  // process data
} catch (error) {
  console.error("Firestore error:", error);
  showNotification("Failed to load data.", "error");
}
```

### 18. Unbounded Queries
```typescript
// BAD — fetches entire collection
const all = await getDocs(collection(db, "leaderboards"));

// GOOD — always limit
const top100 = await getDocs(
  query(collection(db, "leaderboards"), orderBy("score", "desc"), limit(100))
);
```
