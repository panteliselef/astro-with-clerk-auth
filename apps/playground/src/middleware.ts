import { clerkMiddleware, createRouteMatcher } from "astro-clerk-auth/server";

const isProtectedPage = createRouteMatcher(["/guestbook"]);

export const onRequest = clerkMiddleware((auth, context, next) => {
  const requestURL = new URL(context.request.url);
  if (["/sign-in", "/", "/sign-up"].includes(requestURL.pathname)) {
    return next();
  }

  if (isProtectedPage(context.request) && !auth().userId) {
    return auth().redirectToSignIn();
  }

  if (
    !auth().orgId &&
    requestURL.pathname !== "/discover" &&
    requestURL.pathname === "/organization"
  ) {
    const searchParams = new URLSearchParams({
      redirectUrl: requestURL.href,
    });

    const orgSelection = new URL(
      `/discover?${searchParams.toString()}`,
      context.request.url,
    );

    return context.redirect(orgSelection.href);
  }

  return next();
});
