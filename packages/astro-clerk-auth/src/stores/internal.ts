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

export const $csrState = map<{
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

export const $initialState = map<InitialState>();

export const $clerk = atom<Clerk | null>(null);

export const $authStore = computed([$csrState, $initialState], (state, initialState) => {
  return deriveState(
    state.isLoaded,
    {
      session: state.session,
      user: state.user,
      organization: state.organization,
      client: state.client!,
    },
    initialState,
  );
});
