# astro-clerk-auth
[Online Demo](https://astro-clerk.elef.codes/)
This is a private package which provides unofficial integration with [Astro](https://astro.build/) and [Clerk](https://clerk.com/)

## Astro app with middleware (Option 1, recommended)

### Install package
Add `astro-clerk-auth` as a dependency inside your `package.json`
```json
"dependencies": {
    "astro-clerk-auth": "*",
},
```

### Add integrations
- Add the `react` and `astroClerk` integrations in your `astro.config.mjs` file
- Set `output` to `server`.

Example configuration file

```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import astroClerk from "astro-clerk-auth/integration";

export default defineConfig({
  integrations: [
    react(),
    astroClerk(),
  ],
  output: "server",
});
```


### Add a middleware file
Create a `middleware.ts` file inside the `src/` directory
```js
import { clerkMiddleware } from "astro-clerk-auth/server";

export const onRequest = clerkMiddleware();
```

### Wrap each page with `ClerkLayout`
In order to properly support SSR you would need to wrap each page in your app with the `ClerkLayout` Astro component.

Example Page  `my-page.astro`
```astro
---
import Layout from "../layouts/Layout.astro";
import {
  ClerkLayout,
  OrganizationList,
} from "astro-clerk-auth/astro-components";
---

<Layout title="Welcome to Astro.">
  <ClerkLayout>
    ...
  </ClerkLayout>
</Layout>

```

### Use Clerk UI Components
Components supported
- [SignIn](https://clerk.com/docs/components/authentication/sign-in)
- [SignUp](https://clerk.com/docs/components/authentication/sign-up)
- [UseProfile](https://clerk.com/docs/components/user/user-profile)
- [UserButton](https://clerk.com/docs/components/user/user-button)
- [CreateOrganization](https://clerk.com/docs/components/organization/create-organization)
- [OrganizationSwitcher](https://clerk.com/docs/components/organization/organization-switcher)
- [OrganizationList](https://clerk.com/docs/components/organization/organization-list)
- [OrganizationProfile](https://clerk.com/docs/components/organization/organization-profile)

Pages that include a Clerk UI component need to be wrapped with `ClerkLayout` as shown above.

### Use Astro.locals
- Use `Astro.locals.auth()` to retrieve the [Authentication Object](https://clerk.com/docs/references/nextjs/authentication-object#authentication-object)
- Use `await Astro.locals.currentUser()` to retrieve the backend User object

### Use the isomorphic authStore to build your custom logic
Example SignedOut React component that supports SSR
```tsx
import type { PropsWithChildren } from 'react';
import { useStore } from '@nanostores/react';
import { $authStore } from 'astro-clerk-auth/stores';

export function SignedOut(props: PropsWithChildren) {
  const { userId } = useStore($authStore);

  if (userId) {
    return null;
  }
  return props.children;
}
```