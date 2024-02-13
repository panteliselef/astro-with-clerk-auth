---
"astro-clerk-auth": patch
---

Introduce the usage of AsyncLocalStorage to pass authObject as initial value for useAuth.
- Changed `compilerOptions.target` from `ES2020` to `ES2022`.
- Renamed `$ssrState` store to `$initialState`.
