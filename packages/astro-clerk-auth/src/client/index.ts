import { Clerk } from '@clerk/clerk-js';
import type { AstroClerkIntegrationParams } from '../types';
import { $clerk, $csrState } from '../stores/internal';
import type { CreateClerkInstanceInternalFn } from './types';
import { runOnce } from './run-once';
import { mountAllClerkAstroJSComponents } from './mount-clerk-astro-js-components';

let initOptions: AstroClerkIntegrationParams | undefined;

/**
 * Prevents firing clerk.load multiple times
 */
export const createClerkInstance: CreateClerkInstanceInternalFn = runOnce(createClerkInstanceInternal);

export function createClerkInstanceInternal(options?: AstroClerkIntegrationParams) {
  let clerkJSInstance = window.Clerk as Clerk;
  if (!clerkJSInstance) {
    clerkJSInstance = new Clerk(options?.publishableKey!);
    $clerk.set(clerkJSInstance);
    window.Clerk = clerkJSInstance;
  }

  initOptions = options;
  return clerkJSInstance
    .load(options)
    .then(() => {
      $csrState.setKey('isLoaded', true);

      mountAllClerkAstroJSComponents();

      clerkJSInstance.addListener((payload) => {
        $csrState.setKey('client', payload.client);
        $csrState.setKey('user', payload.user);
        $csrState.setKey('session', payload.session);
        $csrState.setKey('organization', payload.organization);
      });
    })
    .catch(() => {});
}

export function updateClerkOptions(options: AstroClerkIntegrationParams) {
  const clerk = $clerk.get();
  if (!clerk) {
    throw new Error('Missing clerk instance');
  }
  clerk.__unstable__updateProps({
    options: { ...initOptions, ...options },
    appearance: { ...initOptions?.appearance, ...options.appearance },
  });
}
