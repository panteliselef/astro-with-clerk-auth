import type { APIContext } from 'astro';

type ContextOrLocals = APIContext | APIContext['locals'];

function getContextEnvVar(envVarName: keyof InternalEnv, contextOrLocals: ContextOrLocals): string | undefined {
  const locals = 'locals' in contextOrLocals ? contextOrLocals.locals : contextOrLocals;

  if (locals?.runtime?.env) {
    return locals.runtime.env[envVarName];
  }

  return import.meta.env[envVarName];
}

function getSafeEnv(context: ContextOrLocals) {
  const envVars = {
    domain: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_DOMAIN', context),
    isSatellite: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_IS_SATELLITE', context) === 'true',
    proxyUrl: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_PROXY_URL', context),
    pk: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_PUBLISHABLE_KEY', context),
    sk: getContextEnvVar('CLERK_SECRET_KEY', context),
    signInUrl: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_SIGN_IN_URL', context),
    clerkJsUrl: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_JS_URL', context),
    clerkJsVariant: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_JS_VARIANT', context) as 'headless' | '' | undefined,
    clerkJsVersion: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_JS_VERSION', context),
    apiVersion: getContextEnvVar('CLERK_API_VERSION', context),
    apiUrl: getContextEnvVar('CLERK_API_URL', context),
  };
  return envVars;
}

function getClientSafeEnv(context: ContextOrLocals) {
  const envVars = {
    domain: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_DOMAIN', context),
    isSatellite: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_IS_SATELLITE', context) === 'true',
    proxyUrl: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_PROXY_URL', context),
    publishableKey: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_PUBLISHABLE_KEY', context),
    signInUrl: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_SIGN_IN_URL', context),
  };
  return envVars;
}

export { getSafeEnv, getClientSafeEnv };
