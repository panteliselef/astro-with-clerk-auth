import type { PropsWithChildren } from "react";
import { useStore } from "@nanostores/react";
import { $derivedState } from "../../stores";

export function SignedOut(props: PropsWithChildren) {
  const { userId } = useStore($derivedState);

  if (userId) {
    return null;
  }
  return props.children;
}

export function SignedIn(props: PropsWithChildren) {
  const { userId } = useStore($derivedState);
  if (!userId) {
    return null;
  }
  return props.children;
}
