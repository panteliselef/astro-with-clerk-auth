/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly PUBLIC_ASTRO_APP_CLERK_FRONTEND_API?: string;
    readonly PUBLIC_ASTRO_APP_CLERK_PUBLISHABLE_KEY?: string;
    readonly CLERK_API_KEY?: string;
    readonly CLERK_API_URL?: string;
    readonly CLERK_API_VERSION?: string;
    readonly CLERK_JWT_KEY?: string;
    readonly CLERK_SECRET_KEY?: string;
    readonly DATABASE_URL?:string;
    readonly FLAG_GUESTBOOK?:string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}