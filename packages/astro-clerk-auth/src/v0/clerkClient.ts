import { createClerkClient } from "@clerk/backend";
import { apiUrl, apiVersion, secretKey } from "./constants";

const clerkClient = createClerkClient({ secretKey, apiVersion, apiUrl });

export { clerkClient };
