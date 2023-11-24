import { Clerk } from "@clerk/clerk-js";
import type {
  ActiveSessionResource,
  ClerkOptions,
  ClientResource,
  InitialState,
  OrganizationResource,
  UserResource,
} from "@clerk/types";
import { publishableKey } from "astro-clerk-auth";
import { atom, map, computed } from "nanostores";
import { deriveState } from "./utils";

export const $state = map<{
  isLoaded: boolean;
  client: ClientResource | undefined | null;
  user: UserResource | undefined | null;
  session: ActiveSessionResource | undefined | null;
  organization: OrganizationResource | undefined | null;
}>({
  isLoaded: false,
  client: null,
  user: null,
  session: null,
  organization: null,
});

export const $ssrState = map<InitialState>();

export const $clerk = atom<Clerk | null>(null);

export const $derivedState = computed(
  [$state, $ssrState],
  (state, ssrState) => {
    console.log("computed", state, ssrState);
    return deriveState(
      state.isLoaded,
      {
        session: state.session,
        user: state.user,
        organization: state.organization,
        client: state.client!,
      },
      ssrState,
    );
  },
);

export function createClerkInstance(options?: ClerkOptions) {
  const clerkJSInstance = new Clerk(publishableKey);
  $clerk.set(clerkJSInstance);
  window.Clerk = clerkJSInstance;
  window.$derivedState = $derivedState;

  const i = clerkJSInstance
    .load(options)
    .then(() => {
      $state.setKey("isLoaded", true);

      clerkJSInstance.addListener((payload) => {
        $state.setKey("client", payload.client);
        $state.setKey("user", payload.user);
        $state.setKey("session", payload.session);
        $state.setKey("organization", payload.organization);
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
