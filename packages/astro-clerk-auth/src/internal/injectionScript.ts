/**
 * The following code will be used in order to be injected as script via the astro integration.
 * F.e.
 *
 * injectScript('before-hydration', `...`)
 */

import { createClerkInstance } from '../client';
import { $initialState } from '../stores/internal';
import { AstroClerkIntegrationParams } from '../types';

export async function runInjectionScript(astroClerkOptions?: AstroClerkIntegrationParams) {
  const ssrDataContainer = document.getElementById('__CLERK_ASTRO_DATA__');
  if (ssrDataContainer) {
    $initialState.set(JSON.parse(ssrDataContainer.textContent || '{}'));
  }

  await createClerkInstance(mergeEnvVarsWithParams(astroClerkOptions));
}

const mergeEnvVarsWithParams = (params?: AstroClerkIntegrationParams) => {
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
