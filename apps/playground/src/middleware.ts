import {
  clerkMiddleware,
  // createRouteMatcher
} from "astro-clerk-auth/server";

// const isProtectedPage = createRouteMatcher(["/guestbook"]);

export const onRequest = clerkMiddleware();
