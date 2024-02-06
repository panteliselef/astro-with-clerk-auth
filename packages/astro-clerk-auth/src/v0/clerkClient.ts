import { createClerkClient } from '@clerk/backend';
import { API_URL, API_VERSION, SECRET_KEY } from './constants';

const clerkClient = createClerkClient({ secretKey: SECRET_KEY, apiVersion: API_VERSION, apiUrl: API_URL });

export { clerkClient };
