import { Clerk } from "@clerk/backend";
import { apiUrl, apiVersion, secretKey } from "./constants";

const clerkClient = Clerk({ secretKey, apiVersion, apiUrl });

export { clerkClient };
