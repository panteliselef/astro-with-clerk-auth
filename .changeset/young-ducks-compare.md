---
"astro-clerk-auth": minor
---

Replace `.enterWith()` with `.run()` when using async local storage.
- After this change, usage of `ClerkLayout` will not be necessary for React SSR work properly. 
