import { next } from "@vercel/edge";

// import { withClerkMiddleware } from "astro-clerk-auth";
// Stop Middleware running on static files and public folder
// export const config = { matcher: "/" };

export const config = {
  matcher: ["/((?!api|_next/static|favicon.ico).*)", "/", "/guestbook"],
};

export default function middleware(request: Request) {
  console.log("wow");
  const url = new URL(request.url);
  // You can retrieve IP location or cookies here.
  if (url.pathname === "/guestbook") {
    return Response.redirect("https://google.com");
  }
  return next(request);
}

// export default function middleware(request: ) {
//   const url = new URL(request.url);
//   // You can retrieve IP location or cookies here.
//   if (url.pathname === "/admin") {
//     url.pathname = "/";
//   }
//   return Response.redirect(url.toString());
// }

// export default withClerkMiddleware((request: Request) => {
//   console.log("middleware")
//   // if (isPublic(request.nextUrl.pathname)) {
//   //   return NextResponse.next();
//   // }
//   // // if the user is not signed in redirect them to the sign in page.
//   // const { userId } = getAuth(request);
//   // if (!userId) {
//   //   // redirect the users to /pages/sign-in/[[...index]].ts
//   //   const signInUrl = new URL("/sign-in", request.url);
//   //   signInUrl.searchParams.set("redirect_url", request.url);
//   //   return NextResponse.redirect(signInUrl);
//   // }
//   // return NextResponse.next();

//   return new Response();
// });

// export default function middleware(request: Request) {
//   console.log("middeware");
//   // const url = new URL(request.url);
//   // // You can retrieve IP location or cookies here.
//   // if (url.pathname === "/admin") {
//   //   url.pathname = "/"
//   // }
//   return Response.redirect("/wowo");
// }
