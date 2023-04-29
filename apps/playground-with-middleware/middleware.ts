import { next } from '@vercel/edge';

import { withClerkMiddleware, getAuth, redirect } from 'astro-clerk-auth/dist/middleware';

export const config = {
  matcher: ['/', '/guestbook', '/sign-in', '/api/guestbook'],
};

// Set the paths that don't require the user to be signed in
const publicPaths = ['/', '/sign-in*'];

const isPublic = (path: string) => {
  return publicPaths.find((x) => path.match(new RegExp(`^${x}$`.replace('*$', '($|/)'))));
};

export default withClerkMiddleware((request: Request) => {
  const url = new URL(request.url);

  if (isPublic(url.pathname)) {
    return next();
  }

  const { userId } = getAuth(request);

  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return redirect(signInUrl);
  }

  return next();
});
