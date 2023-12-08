import { Clerk } from '@clerk/backend';
import { apiUrl, apiVersion, secretKey } from '../constants';


const clerkClient = Clerk({
  secretKey,
  apiUrl,
  apiVersion,
});

const createClerkClient = Clerk;

export { clerkClient, createClerkClient, Clerk };

export * from '@clerk/backend';
