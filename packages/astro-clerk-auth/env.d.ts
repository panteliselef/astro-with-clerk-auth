declare namespace App {
  interface Locals {
    authStatus: string;
    authMessage: string | null;
    authReason: string | null;
    auth: () => ReturnType<typeof import('astro-clerk-auth/server').getAuth>
  }
}
