# astro-clerk-auth

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
