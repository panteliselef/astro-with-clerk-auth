import { Clerk } from '@clerk/clerk-js';
import type {
  ActiveSessionResource,
  ClientResource,
  InitialState,
  OrganizationResource,
  UserResource,
} from '@clerk/types';
import { atom, map, computed } from 'nanostores';
import { deriveState } from './utils';

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

export const $derivedState = computed([$state, $ssrState], (state, ssrState) => {
  console.log('computed', state, ssrState);
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
});
