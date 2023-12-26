import { Clerk } from '@clerk/clerk-js';
import { publishableKey } from '../../v0/constants';
import { $clerk, $csrState } from '../../stores/internal';
import { AstroClerkIntegrationParams } from '../../types';

export * from './uiComponents';
export * from './controlComponents';

let initOptions: AstroClerkIntegrationParams | undefined;

export function createClerkInstance(options?: AstroClerkIntegrationParams) {
  let clerkJSInstance = window.Clerk as Clerk;
  if (!clerkJSInstance) {
    clerkJSInstance = new Clerk(publishableKey);
    $clerk.set(clerkJSInstance);
    window.Clerk = clerkJSInstance;
  }
  // window.$derivedState = $derivedState;

  initOptions = options;
  return clerkJSInstance
    .load(options)
    .then(() => {
      $csrState.setKey('isLoaded', true);

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
    options: {...initOptions, ...options},
    appearance: { ...initOptions?.appearance, ...options.appearance },
  });
}
