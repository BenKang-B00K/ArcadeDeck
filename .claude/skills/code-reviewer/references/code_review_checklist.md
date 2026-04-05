# Code Review Checklist

## 1. Correctness
- [ ] Logic is correct and handles edge cases
- [ ] Null/undefined values are handled (optional chaining, fallbacks)
- [ ] Async operations have proper error handling (try-catch)
- [ ] Race conditions are prevented (concurrent requests, stale closures)
- [ ] State updates don't depend on stale values (use functional updates)

## 2. Security
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] No `eval()`, `Function()`, or `innerHTML` assignments
- [ ] User input is validated/sanitized before storage (Firestore, localStorage)
- [ ] PostMessage origin is validated (`!allowedOrigin || event.origin !== allowedOrigin`)
- [ ] No secrets, API keys, or credentials in client code
- [ ] Firestore security rules enforce per-user access
- [ ] Score/input bounds are validated (min, max, isFinite, isNaN)

## 3. Performance
- [ ] Components use `React.memo()` where props are stable
- [ ] Expensive computations use `useMemo`
- [ ] Callbacks passed as props use `useCallback`
- [ ] Event handlers are debounced where appropriate (resize, scroll, input)
- [ ] No N+1 query patterns (batch Firestore reads)
- [ ] Images use `loading="lazy"` and `decoding="async"`
- [ ] Large lists use virtualization or pagination

## 4. Type Safety (TypeScript)
- [ ] No `any` types — use proper interfaces
- [ ] No `as any` casts — use type guards or explicit types
- [ ] Function parameters and return types are annotated
- [ ] External data (Firestore, localStorage, PostMessage) is validated before use

## 5. Accessibility
- [ ] Images have descriptive `alt` text
- [ ] Interactive elements have `aria-label` when text isn't visible
- [ ] Clickable non-button elements have `role="button"`, `tabIndex={0}`, `onKeyDown`
- [ ] Modals trap focus and close on Escape
- [ ] Color is not the only means of conveying information

## 6. Code Quality
- [ ] No magic numbers — use named constants
- [ ] No duplicate logic — extract to utility functions
- [ ] No dead code or commented-out code
- [ ] No `console.log` left in production code
- [ ] Functions are under 80 lines; files under 400 lines
- [ ] Naming is clear and consistent (camelCase for JS, kebab-case for CSS)

## 7. CSS / Responsive
- [ ] No `100vh` without `100dvh` fallback (iOS Safari)
- [ ] Safe area insets applied for notch/home indicator
- [ ] Touch targets are at least 44x44px
- [ ] `touch-action: manipulation` on interactive elements
- [ ] Landscape media query exists (`@media (orientation: landscape) and (max-height: 600px)`)
- [ ] No horizontal overflow on mobile

## 8. Testing
- [ ] New logic has corresponding tests
- [ ] Edge cases are covered (empty arrays, null, boundaries)
- [ ] Async tests handle loading/error states

## 9. Git / PR
- [ ] PR is focused on one concern (don't mix features with refactors)
- [ ] Commit messages describe why, not what
- [ ] No sensitive files committed (.env, credentials)
- [ ] Large changes are split into smaller PRs when possible
