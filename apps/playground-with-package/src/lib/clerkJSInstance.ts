import { Clerk } from '@clerk/clerk-js';
import { publishableKey } from 'astro-clerk-auth';

export const clerkJSInstance = new Clerk(publishableKey);
