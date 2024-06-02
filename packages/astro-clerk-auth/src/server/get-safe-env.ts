import type { APIContext } from 'astro';

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
  readonly PUBLIC_ASTRO_APP_CLERK_DOMAIN?: string;
  readonly PUBLIC_ASTRO_APP_CLERK_IS_SATELLITE?: string;
  readonly PUBLIC_ASTRO_APP_CLERK_PROXY_URL?: string;
  readonly PUBLIC_ASTRO_APP_CLERK_SIGN_IN_URL?: string;
}

type ContextOrLocals = APIContext | APIContext['locals'];

export function getContextEnvVar(
  envVarName: keyof ImportMetaEnv,
  contextOrLocals: ContextOrLocals,
): string | undefined {
  const locals = 'locals' in contextOrLocals ? contextOrLocals.locals : contextOrLocals;

  if (locals?.runtime?.env) {
    return locals.runtime.env[envVarName];
  }

  return import.meta.env[envVarName];
}

export function getSafeEnv(context: ContextOrLocals) {
  const envVars = {
    domain: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_DOMAIN', context),
    isSatellite: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_IS_SATELLITE', context) === 'true',
    proxyUrl: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_PROXY_URL', context),
    pk: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_PUBLISHABLE_KEY', context),
    sk: getContextEnvVar('CLERK_SECRET_KEY', context),
    signInUrl: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_SIGN_IN_URL', context),
    clerkJsUrl: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_JS_URL', context),
    clerkJsVariant: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_JS_VARIANT', context),
    clerkJsVersion: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_JS_VERSION', context),
    apiVersion: getContextEnvVar('CLERK_API_VERSION', context),
    apiUrl: getContextEnvVar('CLERK_API_URL', context),
  };
  return envVars;
}

export function getClientSafeEnv(context: ContextOrLocals) {
  const envVars = {
    domain: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_DOMAIN', context),
    isSatellite: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_IS_SATELLITE', context) === 'true',
    proxyUrl: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_PROXY_URL', context),
    publishableKey: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_PUBLISHABLE_KEY', context),
    signInUrl: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_SIGN_IN_URL', context),
  };
  return envVars;
}
