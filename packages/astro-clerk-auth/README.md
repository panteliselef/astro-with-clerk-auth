# astro-clerk-auth
Community package that integrates [Clerk](https://clerk.com/) with [Astro](https://astro.build/)

## Live Demo
[Online Demo](https://astro-clerk.elef.codes/)

## Report Issues
If you are experiencing issues please submit them via the [Issues page in GH](https://github.com/panteliselef/astro-with-clerk-auth/issues). As this SDK is not officially suppported by Clerk or Astro, contacting them directly for issues regarding this package might cause your requests to be unanswered.

## Install package
Add `astro-clerk-auth` as a dependency

**With npm**
```sh
npm install astro-clerk-auth
```

**With yarn**
```sh
yarn add astro-clerk-auth
```

**With pnpm**
```sh
pnpm add astro-clerk-auth
```

## Set environment variables
```sh
PUBLIC_ASTRO_APP_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxx

PUBLIC_ASTRO_APP_CLERK_SIGN_IN_URL=/sign-in # update this if sign in page exists on another path
PUBLIC_ASTRO_APP_CLERK_SIGN_UP_URL=/sign-up # update this if sign up page exists on another path
```

## Update `env.d.ts`
```ts
/// <reference types="astro/client" />
/// <reference types="astro-clerk-auth/env" />
```

## Add integrations
- Add the `clerk` integration in your `astro.config.mjs` file.
- (Optional) Install the `@astrojs/react` and add the `react` in your `astro.config.mjs` file. You only need to perform this action if you are planing to use react with your project or the React features that provided by `astro-clerk-auth`. [Instructions](https://docs.astro.build/en/guides/integrations-guide/react/)
- Install the `@astrojs/node` package and the `node` adapter in your `astro.config.mjs` file. [Instructions](https://docs.astro.build/en/guides/server-side-rendering/)
- Set `output` to `server`.

Example configuration file

```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import clerk from "astro-clerk-auth";

export default defineConfig({
  integrations: [
    react(),
    clerk({
      afterSignInUrl: "/",
      afterSignUpUrl: "/",
    }),
  ],
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
});
```


## Add a middleware file
This step is required in order to use SSR or any control component. Create a `middleware.ts` file inside the `src/` directory.

**Simple use**
```ts
import { clerkMiddleware } from "astro-clerk-auth/server";

export const onRequest = clerkMiddleware();
```

**Supports chaining with `sequence`**
```ts
const greeting = defineMiddleware(async (context, next) => {
  console.log("greeting request");
  console.log(context.locals.auth());
  const response = await next();
  console.log("greeting response");
  return response;
});

export const onRequest = sequence(
  clerkMiddleware(),
  greeting,
);
```

**Advanced use with handler**
```ts
const isProtectedPage = createRouteMatcher(['/user(.*)', '/discover(.*)', /^\/organization/])

export const onRequest = clerkMiddleware((auth, context, next) => {
  const requestURL = new URL(context.request.url);
  if (["/sign-in", "/", "/sign-up"].includes(requestURL.pathname)) {
    return next();
  }

  if (isProtectedPage(context.request) && !auth().userId) {
    return auth().redirectToSignIn();
  }

  if (
    !auth().orgId &&
    requestURL.pathname !== "/discover" &&
    requestURL.pathname === "/organization"
  ) {
    const searchParams = new URLSearchParams({
      redirectUrl: requestURL.href,
    });

    const orgSelection = new URL(
      `/discover?${searchParams.toString()}`,
      context.request.url,
    );

    return context.redirect(orgSelection.href);
  }

  return next();
});
```

## Wrap each page with `ClerkLayout` (Only required for SSR with React)
In order to properly support SSR, you need to wrap each page in your app with the `ClerkLayout` Astro component.

Example Page  `my-page.astro`
```astro
---
import Layout from "../layouts/Layout.astro";
import { OrganizationList } from "astro-clerk-auth/components/interactive";
import { ClerkLayout } from "astro-clerk-auth/components/control";
---

<ClerkLayout>
  <Layout title="Welcome to Astro.">
    ...
  </Layout>
</ClerkLayout>

```

## Use Clerk UI Components
Supported components
- [SignIn](https://clerk.com/docs/components/authentication/sign-in)
- [SignUp](https://clerk.com/docs/components/authentication/sign-up)
- [UseProfile](https://clerk.com/docs/components/user/user-profile)
- [UserButton](https://clerk.com/docs/components/user/user-button)
- [CreateOrganization](https://clerk.com/docs/components/organization/create-organization)
- [OrganizationSwitcher](https://clerk.com/docs/components/organization/organization-switcher)
- [OrganizationList](https://clerk.com/docs/components/organization/organization-list)
- [OrganizationProfile](https://clerk.com/docs/components/organization/organization-profile)

All of the above can be used with React or Vanilla JS. The only difference is the import path.

```ts
// Import UserProfile build with React (requires `@astro/react`)
import { UserProfile } from 'astro-clerk-auth/components/react'

// Import UserButton build with vanilla JS
import { UserProfile } from 'astro-clerk-auth/components/interactive'
```

Pages that include a Clerk UI component need to be wrapped with `ClerkLayout`, as shown above.

### Use Clerk Control Components
Supported components
- [SignedIn](https://clerk.com/docs/components/control/signed-in)
- [SignedOut](https://clerk.com/docs/components/control/signed-out)
- [Protect](https://clerk.com/docs/components/protect)

All of the above can be used with React or only on server. The only difference is the import path.

```ts
// Import Protect build with React (requires `@astro/react`)
import { Protect } from 'astro-clerk-auth/components/react'

// Import SignedIn build server side code
import { SignedIn } from 'astro-clerk-auth/components/control'
```

### Protect your API Routes
In this example we are fetching the logged in user.
```ts
import type { APIRoute } from "astro";

const unautorized = () =>
  new Response(JSON.stringify({ error: "unathorized access" }), {
    status: 401,
  });

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.auth().userId) {
    return unautorized();
  }

  return new Response(JSON.stringify(await locals.currentUser()), {
    status: 200,
  });
};
```

## Use Astro.locals
- Use `Astro.locals.auth()` to retrieve the [Authentication Object](https://clerk.com/docs/references/nextjs/authentication-object#authentication-object)
- Use `await Astro.locals.currentUser()` to retrieve the backend User object


## Deep dive

### Use Clerk react hooks
Example SignedIn React component that supports SSR
```tsx
import type { PropsWithChildren } from 'react';
import { useAuth } from 'astro-clerk-auth/client/react';

export function SignedIn(props: PropsWithChildren) {
  const { userId } = useAuth()

  if (!userId) {
    return null;
  }
  return props.children;
}
```

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

### Use Clerk react components inside your components
Example Header react component that uses Clerk components
```tsx
import { SignedIn, SignedOut, UserButton } from 'astro-clerk-auth/client/react';

export function Header() {
  return (
    <header>
      <h1>My App</h1>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <a href='/sign-in'>Go to Sign in</a>
      </SignedOut>
    </header>
  );
}
```

### Known issues
- When building an Astro app you may see the following message in your terminal. This will not cause any performance issues and can be safely ignored.
  ```sh
  [plugin:vite:resolve] Module "async_hooks" has been externalized for browser compatibility, imported by "/Users/panteliselef/elef/astro-with-clerk-auth/apps/playground-with-package/node_modules/astro-clerk-auth/dist/chunk-RZAK3LLS.js".
  ```
