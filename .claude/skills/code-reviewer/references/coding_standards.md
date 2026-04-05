# Coding Standards

## TypeScript / React

### Naming
- **Components:** PascalCase (`GameCard`, `LeaderboardEntry`)
- **Functions/variables:** camelCase (`fetchLeaderboard`, `isLoading`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_SCORE`, `CACHE_TTL_MS`)
- **Interfaces/Types:** PascalCase with descriptive names (`LeaderboardConfig`, `GameWithRank`)
- **CSS classes:** kebab-case (`game-card`, `sticky-controls-bar`)
- **Files:** PascalCase for components (`GameCard.tsx`), camelCase for utilities (`leaderboardUtils.ts`)

### Component Patterns
```typescript
// Prefer function components with explicit React.FC type
const GameCard: React.FC<GameCardProps> = ({ game, onGenreClick }) => {
  // ...
};

// Export with memo for presentational components
export default React.memo(GameCard);
```

### State Management
```typescript
// Use functional updates when new state depends on previous
setCount(prev => prev + 1);

// Use useMemo for expensive derived values
const allGenres = useMemo(() => ['All', ...new Set(games.flatMap(g => g.genres))], []);

// Use useCallback for stable function references passed as props
const handleClose = useCallback(() => setIsOpen(false), []);
```

### Async Patterns
```typescript
// Always wrap async operations in try-catch
const fetchData = async () => {
  try {
    const snapshot = await getDocs(q);
    setData(snapshot.docs.map(doc => doc.data()));
  } catch (error) {
    console.error("Fetch error:", error);
    showNotification("Failed to load data.", "error");
  }
};

// Prevent concurrent requests with ref
const isFetchingRef = useRef(false);
const fetchData = async () => {
  if (isFetchingRef.current) return;
  isFetchingRef.current = true;
  try { /* ... */ }
  finally { isFetchingRef.current = false; }
};
```

### Event Handlers
```typescript
// Debounce resize/scroll handlers
useEffect(() => {
  let timeoutId: ReturnType<typeof setTimeout>;
  const handleResize = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => setState(s => s + 1), 150);
  };
  window.addEventListener('resize', handleResize);
  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener('resize', handleResize);
  };
}, []);

// Always clean up listeners and timers
useEffect(() => {
  const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, [onClose]);
```

### Security
```typescript
// Validate PostMessage origin strictly
const handleMessage = (event: MessageEvent) => {
  if (!allowedOrigin || event.origin !== allowedOrigin) return;
  // ... process message
};

// Validate numeric input bounds
if (isNaN(score) || !isFinite(score) || score < 0 || score > MAX_SCORE) return;

// Strip HTML from user input before storage
const sanitized = userInput.trim().replace(/<[^>]*>/g, '');
```

## CSS

### Mobile-First
```css
/* Base styles for mobile */
.hero { padding: 30px 0; }

/* Tablet */
@media (min-width: 768px) {
  .hero { padding: 80px 0; }
}

/* Desktop */
@media (min-width: 1024px) {
  .hero { padding: 150px 0; }
}
```

### iOS Safe Areas
```css
/* Always include safe area insets for fixed elements */
.navbar {
  height: calc(60px + env(safe-area-inset-top));
  padding-top: env(safe-area-inset-top);
}

.sticky-bar {
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
}

/* Use dvh for viewport height */
.fullscreen {
  height: 100vh;
  height: 100dvh;
}
```

### Responsive Breakpoints
```css
/* Portrait phones */
@media (max-width: 768px) { }

/* Landscape phones */
@media (orientation: landscape) and (max-height: 600px) { }

/* Tablets */
@media (max-width: 1024px) { }
```

## Firebase / Firestore

### Query Patterns
```typescript
// Use LEADERBOARD_FETCH_LIMIT constant, not magic numbers
import { LEADERBOARD_FETCH_LIMIT } from '../constants/gameConstants';

const q = query(
  collection(db, "leaderboards"),
  where("gameId", "==", gameId),
  orderBy("score", "desc"),
  limit(LEADERBOARD_FETCH_LIMIT)
);

// Batch queries when possible — avoid N+1
const allUserScores = await getDocs(
  query(collection(db, "leaderboards"), where("name", "==", nickname))
);
```

## File Organization
```
src/
  components/     # Reusable UI components (GameCard, Navbar, etc.)
  pages/          # Route-level page components (Home, GamePlayer, etc.)
  data/           # Static data (games.json, games.ts)
  constants/      # Shared constants (gameConstants.ts)
  utils/          # Utility functions (leaderboardUtils.ts)
  firebase.ts     # Firebase config
  index.css       # Global styles
  main.tsx        # App entry point
```
