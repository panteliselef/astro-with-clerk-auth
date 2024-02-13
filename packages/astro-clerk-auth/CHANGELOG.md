# astro-clerk-auth

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
