import {
  SignIn,
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
} from "@clerk/clerk-react";
import type { FC } from "react";
import { publishableKey } from "../clerk/constants";
import { ClerkProvider } from "../clerk/js/AstroClerkProvider";
// import { clerkJSInstance } from "../clerk/js/clerkJSInstance";

const Home: FC<{ clerkState: any }> = ({ clerkState }) => {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      // Clerk={clerkJSInstance}
      clerkState={clerkState}
    >
      <SignedIn>
        <SignOutButton signOutCallback={() => window.location.reload()} />
      </SignedIn>

      <SignedOut>
        <h2>Hi, there!</h2>
        <p>
          Hit that <strong>Sign In</strong> button on the top right corner.
        </p>
        <SignInButton />
        <SignIn />
      </SignedOut>
    </ClerkProvider>
  );
};

export default Home;
