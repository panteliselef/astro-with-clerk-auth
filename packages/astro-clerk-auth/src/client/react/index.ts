import { Clerk } from '@clerk/clerk-js';
import { ClerkOptions } from '@clerk/types';
import { publishableKey } from '../../constants';
import { $clerk, $state } from '../../stores';

export * from './uiComponents';
export * from './controlComponents';

export function createClerkInstance(options?: ClerkOptions) {
  const clerkJSInstance = new Clerk(publishableKey);
  $clerk.set(clerkJSInstance);
  window.Clerk = clerkJSInstance;
  // window.$derivedState = $derivedState;

  const i = clerkJSInstance
    .load(options)
    .then(() => {
      $state.setKey('isLoaded', true);

      clerkJSInstance.addListener((payload) => {
        $state.setKey('client', payload.client);
        $state.setKey('user', payload.user);
        $state.setKey('session', payload.session);
        $state.setKey('organization', payload.organization);
      });
    })
    .catch(() => {});

  // TODO: Handle deriveState

  //   const derivedState = computed(() => deriveState(isClerkLoaded.value, state as Resources, undefined));

  //   app.config.globalProperties.$clerk = clerk;

  //   app.provide<VueClerkInjectionKey>('VUE_CLERK', {
  //     clerk,
  //     state,
  //     isClerkLoaded,
  //     derivedState,
  //   });

  return i;
}
