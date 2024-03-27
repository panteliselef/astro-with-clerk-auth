---
"astro-clerk-auth": minor
---

Support for hotloading `clerk-js`. Hotloading ensures that your application always run the latest and most stable version of Clerk.

To enabled it, update the import path for the `clerk` integration to look like this
```js
import clerk from "astro-clerk-auth/hotload";

export default defineConfig({
  integrations: [
      ...
    clerk({
      afterSignInUrl: "/",
      afterSignUpUrl: "/",
    }),
  ],
});
```

If in your app you are using `updateClerkOptions` from `astro-clerk-auth/client` you can update that import path to `astro-clerk-auth/client/hotload`

