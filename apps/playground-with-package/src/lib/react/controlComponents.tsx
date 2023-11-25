import type { PropsWithChildren } from "react";
import { useStore } from "@nanostores/react";
import { $derivedState } from "../clerkJSInstance";
import React from "react";

export function SignedOut(props: PropsWithChildren) {
  const { userId } = useStore($derivedState);

  if (userId) {
    return null;
  }
  return props.children;
}

export function SignedIn(props: PropsWithChildren) {
  const { userId } = useStore($derivedState);
  return (
    <>
      <p>{userId}</p>
      {userId ? props.children : null}
    </>
  );
}
