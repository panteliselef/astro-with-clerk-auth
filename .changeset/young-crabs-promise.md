---
"astro-clerk-auth": patch
---

Revert: Use vite's virtual modules in order to avoid leaking node:async_hooks into a browser module.
