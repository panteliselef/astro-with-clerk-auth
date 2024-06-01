---
"astro-clerk-auth": minor
---

Use conditional imports in order to avoid leaking `node:async_hooks` into the client bundle.
