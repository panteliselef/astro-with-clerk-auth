/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_ASTRO_APP_CLERK_FRONTEND_API?: string;
  readonly PUBLIC_ASTRO_APP_CLERK_PUBLISHABLE_KEY?: string;
  readonly PUBLIC_ASTRO_APP_CLERK_JS_URL?: string;
  readonly PUBLIC_ASTRO_APP_CLERK_JS_VARIANT?: 'headless' | '';
  readonly PUBLIC_ASTRO_APP_CLERK_JS_VERSION?: string;
  readonly CLERK_API_KEY?: string;
  readonly CLERK_API_URL?: string;
  readonly CLERK_API_VERSION?: string;
  readonly CLERK_JWT_KEY?: string;
  readonly CLERK_SECRET_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'virtual:astro-clerk/internal/als' {
  export const authAls: import('node:async_hooks').AsyncLocalStorage<import('astro-clerk-auth/server').GetAuthReturn>;
}

declare module 'clerk:astro' {
  export const getClerkAuthInitState: () => import('astro-clerk-auth/server').GetAuthReturn;
}
