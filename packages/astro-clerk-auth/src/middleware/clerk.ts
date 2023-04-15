import { Clerk } from '@clerk/backend';
import { apiKey, apiUrl, apiVersion, secretKey } from '../constants';


const clerkClient = Clerk({
  apiKey,
  secretKey,
  apiUrl,
  apiVersion,
});

const createClerkClient = Clerk;

export { clerkClient, createClerkClient, Clerk };

export * from '@clerk/backend';
