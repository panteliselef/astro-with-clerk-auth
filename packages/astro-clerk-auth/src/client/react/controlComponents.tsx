import type { PropsWithChildren } from 'react';
import { useStore } from '@nanostores/react';
import { $authStore } from '../../stores';

export function SignedOut(props: PropsWithChildren) {
  const { userId } = useStore($authStore);

  if (userId) {
    return null;
  }
  return props.children;
}

export function SignedIn(props: PropsWithChildren) {
  const { userId } = useStore($authStore);
  if (!userId) {
    return null;
  }
  return props.children;
}
