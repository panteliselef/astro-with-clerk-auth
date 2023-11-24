import type { Clerk } from '@clerk/clerk-js';
import { $state, $clerk } from './clerkJSInstance';

export const mountClerkComponent = ({
  el,
  mountFn,
  //   unmountFn,
  props,
}: {
  el: HTMLDivElement;
  mountFn: keyof Pick<Clerk, 'mountSignIn' | 'mountUserButton'>;
  //   unmountFn: (...args: any) => void;
  props?: Record<string, any>;
}) => {
  $state.subscribe(({ isLoaded }) => {
    if (!isLoaded) {
      return;
    }

    if (el) $clerk.get()?.[mountFn]?.(el, props);
  });
};
