import { CreateClerkInstanceInternalFn } from '../client/types';
import { $initialState } from '../stores/internal';
import { AstroClerkIntegrationParams } from '../types';
import { mergeEnvVarsWithParams } from './merge-env-vars-with-params';
import { getClerkAuthInitState } from 'clerk:astro';

function createInjectionScriptRunner(creator: CreateClerkInstanceInternalFn) {
  async function runner(astroClerkOptions?: AstroClerkIntegrationParams) {
    // Sync SSR initState to the store
    // @ts-ignore missing user, organization, session objects but this is expected
    $initialState.set(getClerkAuthInitState());

    await creator(mergeEnvVarsWithParams(astroClerkOptions));
  }

  return runner;
}

export { createInjectionScriptRunner };
