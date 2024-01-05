import { Clerk } from '@clerk/clerk-js';
import { publishableKey } from '../../v0/constants';
import { $clerk, $csrState } from '../../stores/internal';
import { AstroClerkIntegrationParams } from '../../types';

export * from './uiComponents';
export * from './controlComponents';

let initOptions: AstroClerkIntegrationParams | undefined;

export const mountAllClerkAstroJSComponents = () => {
  const mountFns = {
    'organization-list': 'mountOrganizationList',
    'organization-profile': 'mountOrganizationProfile',
    'organization-switcher': 'mountOrganizationSwitcher',
    'user-button': 'mountUserButton',
    'user-profile': 'mountUserProfile',
    'sign-in': 'mountSignIn',
    'sign-up': 'mountSignUp',
  } as const;

  Object.entries(mountFns).forEach(([category, mountFn]) => {
    const elementsOfCategory = document.querySelectorAll(`[id^="clerk-${category}"]`);
    elementsOfCategory.forEach((el) => {
      const props = window.componentPropsMap?.get(category)?.get(el.id);
      if (el) $clerk.get()?.[mountFn](el as HTMLDivElement, props);
    });
  });
};

/**
 * Prevents firing clerk.load multiple times
 */
let createHasBeenCalled = false;

export function createClerkInstance(options?: AstroClerkIntegrationParams) {
  let clerkJSInstance = window.Clerk as Clerk;
  if (!clerkJSInstance) {
    clerkJSInstance = new Clerk(publishableKey);
    $clerk.set(clerkJSInstance);
    window.Clerk = clerkJSInstance;
  }

  if (createHasBeenCalled) return new Promise((res) => res(clerkJSInstance.loaded));
  createHasBeenCalled = true;

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
