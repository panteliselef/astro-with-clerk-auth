import {
  clerkMiddleware,
  // createRouteMatcher
} from "astro-clerk-auth/server";

// const isProtectedPage = createRouteMatcher(['/guestbook(.*)'])

export const onRequest = clerkMiddleware((auth, context, next) => {
  console.log("auth", auth());
  console.log("context", context);
  // if (isProtectedPage(context.request) && !auth().userId) {
  //   return auth().redirectToSignIn();
  // }
  return next();
});
