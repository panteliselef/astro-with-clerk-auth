import { User } from '@clerk/backend';
import { APIContext } from 'astro';
import { getAuth } from './get-auth';
import { clerkClient } from './clerk-client';

export const createCurrentUser = (req: Request, context: APIContext) => {
  return async (): Promise<User | null> => {
    const { userId } = getAuth(req, context.locals);
    if (!userId) return null;

    return clerkClient(context).users.getUser(userId);
  };
};
