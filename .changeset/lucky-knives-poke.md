---
"astro-clerk-auth": patch
---

Use vite's virtual modules in order to avoid leaking node:async_hooks into a browser module.
Fixes a known issue:
  ```shell
  [plugin:vite:resolve] Module "async_hooks" has been externalized for browser compatibility, imported by "...".
  ```
