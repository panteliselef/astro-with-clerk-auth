import type { PropsWithChildren } from "react";
import { useStore } from "@nanostores/react";
import { $derivedState } from "../clerkJSInstance";
import React from "react";

export default function SignedIn(props: PropsWithChildren) {
  const { userId } = useStore($derivedState);
  return (
    <>
      <p>{userId}</p>
      {userId ? props.children : null}
    </>
  );
}
