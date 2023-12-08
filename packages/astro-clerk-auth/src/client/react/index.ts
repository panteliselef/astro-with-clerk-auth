import { Clerk } from '@clerk/clerk-js';
import { ClerkOptions } from '@clerk/types';
import { publishableKey } from '../../v0/constants';
import { $clerk, $csrState } from '../../stores/internal';

export * from './uiComponents';
export * from './controlComponents';

export function createClerkInstance(options?: ClerkOptions) {
  const clerkJSInstance = new Clerk(publishableKey);
  $clerk.set(clerkJSInstance);
  window.Clerk = clerkJSInstance;
  // window.$derivedState = $derivedState;

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
