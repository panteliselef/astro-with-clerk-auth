import type { Clerk } from '@clerk/clerk-js';
import type { CreateClerkInstanceInternalFn } from './types';
import { mountAllClerkAstroJSComponents } from './mount-clerk-astro-js-components';

/**
 * Prevents mounting components multiple times when the `createClerkInstanceInternal` was been called twice without await first
 * This is useful as the "integration" may call the function twice at the same time.
 */
const runOnce = (onFirst: CreateClerkInstanceInternalFn) => {
  let hasRun = false;
  return (params: Parameters<CreateClerkInstanceInternalFn>[0]) => {
    if (hasRun) {
      let clerkJSInstance = window.Clerk as Clerk;
      return new Promise((res) => {
        if (!clerkJSInstance) {
          return res(false);
        }

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

export { runOnce };
