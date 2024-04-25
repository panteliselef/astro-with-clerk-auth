---
"astro-clerk-auth": minor
---

Introduce fixes that would allow the package to be used from an astro application deployed in Cloudflare Pages.
- Mark 'node:async_hooks' as external
- When enqueueing in a readable stream, always encode text to Uint8 array
