import Clerk from "@clerk/clerk-js";
import { frontendApi, publishableKey } from "../constants";

export const clerkJSInstance = new Clerk(publishableKey || frontendApi);