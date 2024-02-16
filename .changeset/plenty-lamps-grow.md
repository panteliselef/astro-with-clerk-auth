---
"astro-clerk-auth": patch
---

Recreate types from astro in order to avoid issues with exported types in Astro 3 and 4 where used directly.
Astro 3 exported the types as generics whereas in Astro 4 those were regular types, this was causing the end type consumed in the package to be `any`. 