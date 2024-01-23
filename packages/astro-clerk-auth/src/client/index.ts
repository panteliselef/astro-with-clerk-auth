import { Clerk } from '@clerk/clerk-js';
import { AstroClerkIntegrationParams } from '../types';
import { $clerk, $csrState } from '../stores/internal';
import { publishableKey } from '../v0/constants';

let initOptions: AstroClerkIntegrationParams | undefined;

const mountAllClerkAstroJSComponents = () => {
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
      const props = window.__astro_clerk_component_props?.get(category)?.get(el.id);
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

  /**
   * Probably html streaming has delayed the component from mounting immediately
   */
  if (createHasBeenCalled)
    return new Promise((res) => {
      if (clerkJSInstance.loaded) mountAllClerkAstroJSComponents();
      return res(clerkJSInstance.loaded);
    });
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
