import { CreateClerkInstanceInternalFn } from '../client/types';
import { $initialState } from '../stores/internal';
import { AstroClerkIntegrationParams } from '../types';
import { mergeEnvVarsWithParams } from './merge-env-vars-with-params';

function createInjectionScriptRunner(creator: CreateClerkInstanceInternalFn) {
  async function runner(astroClerkOptions?: AstroClerkIntegrationParams) {
    const ssrDataContainer = document.getElementById('__CLERK_ASTRO_DATA__');
    if (ssrDataContainer) {
      $initialState.set(JSON.parse(ssrDataContainer.textContent || '{}'));
    }

    const clientSafeVarsContainer = document.getElementById('__CLERK_ASTRO_SAFE_VARS__');
    let clientSafeVars = {};
    if (clientSafeVarsContainer) {
      clientSafeVars = JSON.parse(clientSafeVarsContainer.textContent || '{}');
    }

    await creator(mergeEnvVarsWithParams({ ...astroClerkOptions, ...clientSafeVars }));
  }

  return runner;
}

export { createInjectionScriptRunner };
