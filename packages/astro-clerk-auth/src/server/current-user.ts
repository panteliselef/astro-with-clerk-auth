import { User } from '@clerk/backend';
import { APIContext } from 'astro';
import { getAuth } from './get-auth';
import { clerkClient } from '../v0/clerkClient';

export const createCurrentUser = (req: Request, locals: APIContext['locals']) => {
  return async (): Promise<User | null> => {
    const { userId } = getAuth(req, locals);
    if (!userId) return null;

    return clerkClient.users.getUser(userId);
  };
};
