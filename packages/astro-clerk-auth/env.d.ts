declare namespace App {
  interface Locals {
    authStatus: string;
    authMessage: string | null;
    authReason: string | null;
    auth: () => import('astro-clerk-auth/server').GetAuthReturn;
    currentUser: () => Promise<import('@clerk/backend').User | null>;
  }
}
