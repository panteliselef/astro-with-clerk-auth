import { AstroGlobal } from 'astro';

import { $ssrState } from '../stores/internal';

export const clerkSSR = (astro: AstroGlobal) => {
  $ssrState.set(astro.locals.auth());
};
