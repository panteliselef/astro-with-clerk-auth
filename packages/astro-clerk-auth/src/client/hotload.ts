import type { Clerk } from '@clerk/clerk-js';
import { AstroClerkIntegrationParams } from '../types';
import { $clerk, $csrState } from '../stores/internal';
import { PUBLISHABLE_KEY } from '../v0/constants';
import { waitForClerkScript } from '../internal/utils/loadClerkJSScript';
import { BrowserClerk, HeadlessBrowserClerk } from '../internal/types';

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
 * Prevents mounting components multiple times when the `createClerkInstanceInternal` was been called twice without await first
 * This is useful as the "integration" may call the function twice at the same time.
 */
const runOnce = (onFirst: typeof createClerkInstanceInternal) => {
  let hasRun = false;
  return (params: Parameters<typeof createClerkInstanceInternal>[0]) => {
    if (hasRun) {
      let clerkJSInstance = window.Clerk as Clerk;
      return new Promise((res) => {
        if (clerkJSInstance.loaded) mountAllClerkAstroJSComponents();
        return res(clerkJSInstance.loaded);
      });
    }
    /**
     * Probably html streaming has delayed the component from mounting immediately
     */
    hasRun = true;
    return onFirst(params);
  };
};

declare const global: Global;
export interface Global {
  Clerk?: HeadlessBrowserClerk | BrowserClerk;
}

/**
 * Vite does not define `global` by default
 * One workaround is to use the `define` config prop
 * https://vitejs.dev/config/#define
 * We are solving this in the SDK level to reduce setup steps.
 */
if (typeof window !== 'undefined' && !window.global) {
  //@ts-ignore
  window.global = typeof global === 'undefined' ? window : global;
}

/**
 * Prevents firing clerk.load multiple times
 */
export const createClerkInstance = runOnce(createClerkInstanceInternal);

const loadScriptConfig = {
  clerkJSUrl: undefined,
  clerkJSVariant: undefined,
  clerkJSVersion: undefined,
  sdkMetadata: undefined,
  publishableKey: PUBLISHABLE_KEY,
};

export async function createClerkInstanceInternal(options?: AstroClerkIntegrationParams) {
  let clerkJSInstance = window.Clerk as Clerk;
  if (!clerkJSInstance) {
    await waitForClerkScript();

    if (!global.Clerk) {
      throw new Error('Failed to download latest ClerkJS. Contact support@clerk.com.');
    }
    // @ts-ignore
    clerkJSInstance = global.Clerk;

    // await global.Clerk.load(options);

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
