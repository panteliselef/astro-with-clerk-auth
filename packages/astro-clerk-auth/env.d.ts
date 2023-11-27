/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    authStatus: string;
    authMessage: string | null;
    authReason: string | null;
  }
}
