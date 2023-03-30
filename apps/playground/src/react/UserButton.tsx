import { publishableKey } from "../clerk";
import { clerkJSInstance } from "../clerk/js/clerkJSInstance";
import {
  UserButton as ClerkUserButton,
  ClerkProvider,
} from "@clerk/clerk-react";

const UserButton = () => {
  return (
    <ClerkProvider publishableKey={publishableKey} Clerk={clerkJSInstance}>
      <ClerkUserButton afterSignOutUrl="/" />
    </ClerkProvider>
  );
};

export default UserButton;
