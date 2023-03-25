import { Clerk } from "@clerk/backend";
import { apiKey, apiUrl, apiVersion, secretKey } from "./constants";

const clerkClient = Clerk({ apiKey, secretKey, apiVersion, apiUrl })

export { clerkClient }