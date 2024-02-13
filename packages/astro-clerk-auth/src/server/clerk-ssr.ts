import { AstroGlobal } from 'astro';

// Do not use
export const clerkSSR = (astro: AstroGlobal) => {
  // @ts-ignore TODO: fix this
  // $ssrState.set(astro.locals.auth());
};
