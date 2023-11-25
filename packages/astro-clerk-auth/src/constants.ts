const apiKey = import.meta.env.CLERK_API_KEY || '';

const secretKey = import.meta.env.CLERK_SECRET_KEY || '';

const apiVersion = import.meta.env.CLERK_API_VERSION || 'v1';

const apiUrl = import.meta.env.CLERK_API_URL || 'https://api.clerk.dev';

const frontendApi = import.meta.env.PUBLIC_ASTRO_APP_CLERK_FRONTEND_API || '';

const publishableKey = import.meta.env.PUBLIC_ASTRO_APP_CLERK_PUBLISHABLE_KEY || '';

const signInUrl = import.meta.env.PUBLIC_ASTRO_APP_CLERK_SIGN_IN_URL || ('' as string);

const signUpUrl = import.meta.env.PUBLIC_ASTRO_APP_CLERK_SIGN_UP_URL || ('' as string);

const jwtKey = import.meta.env.CLERK_JWT_KEY || '';

const jsVersion = import.meta.env.CLERK_JS_VERSION || '';

export { secretKey, apiKey, apiUrl, apiVersion, frontendApi, publishableKey, jwtKey, jsVersion, signInUrl, signUpUrl };
