import { CreateClerkInstanceInternalFn } from '../client/types';
import { $initialState } from '../stores/internal';
import { AstroClerkIntegrationParams } from '../types';
import { mergeEnvVarsWithParams } from './merge-env-vars-with-params';

function createInjectionScriptRunner(creator: CreateClerkInstanceInternalFn) {
  async function runner(astroClerkOptions?: AstroClerkIntegrationParams) {
    // Sync SSR initState to the store
    const ssrDataContainer = document.getElementById('__CLERK_ASTRO_DATA__');
    if (ssrDataContainer) {
      $initialState.set(JSON.parse(ssrDataContainer.textContent || '{}'));
    }

    await creator(mergeEnvVarsWithParams(astroClerkOptions));
  }

  return runner;
}

export { createInjectionScriptRunner };
