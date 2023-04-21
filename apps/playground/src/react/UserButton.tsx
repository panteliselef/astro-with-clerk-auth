import { publishableKey } from 'astro-clerk-auth';
import { clerkJSInstance } from '../clerk/js/clerkJSInstance';
import { UserButton as ClerkUserButton, ClerkProvider } from '@clerk/clerk-react';
import { clerkAppearance } from '../utils';

const UserButton = () => {
  clerkJSInstance.load();
  return (
    <ClerkProvider publishableKey={publishableKey} Clerk={clerkJSInstance} appearance={clerkAppearance}>
      <ClerkUserButton afterSignOutUrl="/" />
    </ClerkProvider>
  );
};

export default UserButton;
