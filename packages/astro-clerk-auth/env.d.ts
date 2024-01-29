declare namespace App {
  interface Locals {
    authToken: string;
    authStatus: string;
    authMessage: string | null;
    authReason: string | null;
    auth: () => import('astro-clerk-auth/server').GetAuthReturn;
    currentUser: () => Promise<import('@clerk/backend').User | null>;
  }
}
