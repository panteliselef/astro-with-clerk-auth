/// <reference types="astro/client" />
/// <reference types="astro-clerk-auth/client" />

declare namespace App {
  interface Locals {
    authStatus: string;
    authMessage: string | null;
    authReason: string | null;
  }
}