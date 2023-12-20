import { AstroGlobal } from 'astro';

import { $ssrState } from '../stores/internal';

export const clerkSSR = (astro: AstroGlobal) => {
  // @ts-ignore TODO: fix this
  $ssrState.set(astro.locals.auth());
};
