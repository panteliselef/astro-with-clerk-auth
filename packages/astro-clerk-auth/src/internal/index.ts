import type { AstroClerkIntegrationParams } from '../types';

export const mergeEnvVarsWithParams = (params?: AstroClerkIntegrationParams) => {
  const {
    signInUrl: paramSignIn,
    signUpUrl: paramSignUp,
    isSatellite: paramSatellite,
    proxyUrl: paramProxy,
    domain: paramDomain,
    ...rest
  } = params || {};
  return {
    signInUrl: paramSignIn || import.meta.env.PUBLIC_ASTRO_APP_CLERK_SIGN_IN_URL,
    signUpUrl: paramSignUp || import.meta.env.PUBLIC_ASTRO_APP_CLERK_SIGN_UP_URL,
    isSatellite: paramSatellite || import.meta.env.PUBLIC_ASTRO_APP_CLERK_IS_SATELLITE,
    proxyUrl: paramProxy || import.meta.env.PUBLIC_ASTRO_APP_CLERK_PROXY_URL,
    domain: paramDomain || import.meta.env.PUBLIC_ASTRO_APP_CLERK_DOMAIN,
    ...rest,
  };
};
