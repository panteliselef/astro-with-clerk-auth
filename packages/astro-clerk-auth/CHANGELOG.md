# astro-clerk-auth

## 0.6.1

### Patch Changes

- 7604ec4: Add `signOut` and `getToken` to useAuth

## 0.6.0

### Minor Changes

- de9c9ce: Use vite's virtual modules in order to avoid leaking node:async_hooks into a browser module.
  Fixes a known issue:
  ```shell
  [plugin:vite:resolve] Module "async_hooks" has been externalized for browser compatibility, imported by "...".
  ```

## 0.5.0

### Minor Changes

- 4494f79: Update to use Clerk Core 2 stable packages

## 0.4.0

### Minor Changes

- 0995ae4: Introduce fixes that would allow the package to be used from an astro application deployed in Cloudflare Pages.
  - Mark 'node:async_hooks' as external
  - When enqueueing in a readable stream, always encode text to Uint8 array

## 0.3.2

### Patch Changes

- 7b3cc4f: Bug fix: Hide error about invalid clerkJSVariant when it is correct.

## 0.3.1

### Patch Changes

- ba2d35b: Bug fix: build fails when the integration was called with no arguments.

## 0.3.0

### Minor Changes

- 6054242: Support for hotloading `clerk-js`. Hotloading ensures that your application always run the latest and most stable version of Clerk.

  To enabled it, update the import path for the `clerk` integration to look like this

  ```js
  import clerk from "astro-clerk-auth/hotload";

  export default defineConfig({
    integrations: [
      ...clerk({
        afterSignInUrl: "/",
        afterSignUpUrl: "/",
      }),
    ],
  });
  ```

  If in your app you are using `updateClerkOptions` from `astro-clerk-auth/client` you can update that import path to `astro-clerk-auth/client/hotload`

## 0.2.0

### Minor Changes

- 03d94be: Replace `.enterWith()` with `.run()` when using async local storage.
  - After this change, usage of `ClerkLayout` will not be necessary for React SSR work properly.

### Patch Changes

- 952ea60: Bump clerk versions
  - @clerk/backend@1.0.0-beta.30 -> @clerk/backend@1.0.0-beta.31
  - @clerk/clerk-js@5.0.0-beta.37 -> @clerk/clerk-js@5.0.0-beta.38

## 0.1.2

### Patch Changes

- d2242d9: Bump clerk versions
  - @clerk/backend@1.0.0-beta.29 -> @clerk/backend@1.0.0-beta.30
  - @clerk/clerk-js@5.0.0-beta.35 -> @clerk/clerk-js@5.0.0-beta.37
  - @clerk/shared@5.0.0-beta.19 -> @clerk/shared@5.0.0-beta.20
  - @clerk/types@4.0.0-beta.21 -> @clerk/types@4.0.0-beta.22

## 0.1.1

### Patch Changes

- dff41fd: Bump clerk versions
  - @clerk/backend@1.0.0-beta.28 -> @clerk/backend@1.0.0-beta.29
  - @clerk/clerk-js@5.0.0-beta.34 -> @clerk/clerk-js@5.0.0-beta.35
  - @clerk/types@4.0.0-beta.20 -> @clerk/types@4.0.0-beta.21

## 0.1.0

### Minor Changes

- 3b3c26f: Enable installation with `astro add` command.

## 0.0.11

### Patch Changes

- 258d4d6: Bump clerk versions
  - @clerk/backend@1.0.0-beta.27 -> @clerk/backend@1.0.0-beta.28
  - @clerk/clerk-js@5.0.0-beta.33 -> @clerk/clerk-js@5.0.0-beta.34

## 0.0.10

### Patch Changes

- 112b4b6: Bump clerk beta versions

## 0.0.9

### Patch Changes

- 4b57912: Update documentation for protecting api routes.
- f723cb6: Bump clerk packages.

## 0.0.8

### Patch Changes

- abadd2f: Re-export @clerk/backend from '/server'
- 5b70352: Bump clerk beta versions.

## 0.0.7

### Patch Changes

- 86ed346: Bump clerk beta

## 0.0.6

### Patch Changes

- 20e9708: Improve html semantics by positioning `__CLERK_ASTRO_DATA__` inside the `<head>` tag.
- 6a1d3dc: Bump clerk beta versions.
- 81a70ce: Remove `redirect` as AuthReason.

## 0.0.5

### Patch Changes

- 9e05766: Set `vite` configuration to target `es2022`.
- 7d8a6dc: Recreate types from astro in order to avoid issues with exported types in Astro 3 and 4 where used directly.
  Astro 3 exported the types as generics whereas in Astro 4 those were regular types, this was causing the end type consumed in the package to be `any`.

## 0.0.4

### Patch Changes

- b72d6d1: Bump @clerk packages:
  - `@clerk/backend` to `1.0.0-beta-v5.19`
  - `@clerk/clerk-js` to `5.0.0-beta-v5.21`
  - `@clerk/shared` to `2.0.0-beta-v5.12`
  - `@clerk/types` to `4.0.0-beta-v5.14`
- 5de3bec: Introduce the usage of AsyncLocalStorage to pass authObject as initial value for useAuth.
  - Changed `compilerOptions.target` from `ES2020` to `ES2022`.
  - Renamed `$ssrState` store to `$initialState`.

## 0.0.3

### Patch Changes

- b20a1f8: Improve package.json of astro-clerk-auth
  Remove @clerk/\* packages from `external` in tsup config

## 0.0.2

### Patch Changes

- cd923d8: Remove carret from dependecies and remove unecessary module and type definitions in package.json.
- 2f191a5: Update description of package.json.
- 0837c36: Rename `componentPropsMap` to `__astro_clerk_component_props`.
- 39fbfae: Remove duplication when injecting scripts in the integration.
- 159af70: Update clerk-js to 5.0.0-beta-v5.20. Add clerk as dependencies instead of peer dependencies.

## 0.0.1

### Patch Changes

- 3915562: Initial release of the package.
