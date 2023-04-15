import Clerk from "@clerk/clerk-js";
import { frontendApi, publishableKey } from "astro-clerk-auth";

export const clerkJSInstance = new Clerk(publishableKey || frontendApi);