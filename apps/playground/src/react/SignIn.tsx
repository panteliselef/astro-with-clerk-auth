import { publishableKey } from "../clerk";
import { SignIn as ClerkSignIn, ClerkProvider } from "@clerk/clerk-react";

const SignIn = () => {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkSignIn path="/sign-in" routing="path" redirectUrl="/" />
    </ClerkProvider>
  );
};

export default SignIn;
