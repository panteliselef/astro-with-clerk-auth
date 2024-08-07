import type { AstroClerkIntegrationParams } from '../types';
import type { AstroIntegration } from 'astro';
import { name as packageName, version as packageVersion } from '../../package.json';

const buildEnvVarFromOption = (valueToBeStored: unknown, envName: string) => {
  return valueToBeStored ? { [`import.meta.env.${envName}`]: JSON.stringify(valueToBeStored) } : {};
};

type HotloadAstroClerkIntegrationParams = AstroClerkIntegrationParams & {
  clerkJSUrl?: string;
  clerkJSVariant?: 'headless' | '';
  clerkJSVersion?: string;
};

function createIntegration<P extends { mode: 'hotload' | 'bundled' }>({ mode }: P) {
  return (
    params?: P['mode'] extends 'hotload' ? HotloadAstroClerkIntegrationParams : AstroClerkIntegrationParams,
  ): AstroIntegration => {
    const { proxyUrl, isSatellite, domain, afterSignInUrl, afterSignUpUrl, signInUrl, signUpUrl } = params || {};

    // This are not provided when the "bundled" integration is used
    const clerkJSUrl = (params as any)?.clerkJSUrl as string | undefined;
    const clerkJSVariant = (params as any)?.clerkJSVariant as string | undefined;
    const clerkJSVersion = (params as any)?.clerkJSVersion as string | undefined;

    return {
      name: '@astro-clerk-auth/integration',
      hooks: {
        'astro:config:setup': ({ config, injectScript, updateConfig, logger, command }) => {
          logger.warn('This project has graduated to an official SDK. Please proceed to https://clerk.com/docs/references/astro/migrating-from-astro-community-sdk for migration instructions.');

          if (config.output === 'static')
            logger.error(`${packageName} requires SSR to be turned on. Please update output to "server"`);

          if (!config.adapter) {
            logger.error('Missing adapter, please update your Astro config to use one.');
          }

          if (typeof clerkJSVariant !== 'undefined' && clerkJSVariant !== 'headless' && clerkJSVariant !== '') {
            logger.error('Invalid value for clerkJSVariant. Acceptable values are `"headless"`, `""`, and `undefined`');
          }

          const defaultHotLoadImportPath = 'astro-clerk-auth/internal/hotload';

          const buildImportPath =
            mode === 'hotload' ? defaultHotLoadImportPath : defaultHotLoadImportPath.replace('/hotload', '');

          // Set params as envs do backend code has access to them
          updateConfig({
            vite: {
              define: {
                ...buildEnvVarFromOption(signInUrl, 'PUBLIC_ASTRO_APP_CLERK_SIGN_IN_URL'),
                ...buildEnvVarFromOption(signUpUrl, 'PUBLIC_ASTRO_APP_CLERK_SIGN_UP_URL'),
                ...buildEnvVarFromOption(isSatellite, 'PUBLIC_ASTRO_APP_CLERK_IS_SATELLITE'),
                ...buildEnvVarFromOption(proxyUrl, 'PUBLIC_ASTRO_APP_CLERK_PROXY_URL'),
                ...buildEnvVarFromOption(domain, 'PUBLIC_ASTRO_APP_CLERK_DOMAIN'),
                ...buildEnvVarFromOption(domain, 'PUBLIC_ASTRO_APP_CLERK_DOMAIN'),
                ...buildEnvVarFromOption(domain, 'PUBLIC_ASTRO_APP_CLERK_DOMAIN'),
                ...buildEnvVarFromOption(clerkJSUrl, 'PUBLIC_ASTRO_APP_CLERK_JS_URL'),
                ...buildEnvVarFromOption(clerkJSVariant, 'PUBLIC_ASTRO_APP_CLERK_JS_VARIANT'),
                ...buildEnvVarFromOption(clerkJSVersion, 'PUBLIC_ASTRO_APP_CLERK_JS_VERSION'),
                __HOTLOAD__: mode === 'hotload',
              },

              ssr: {
                external: ['node:async_hooks'],
              },

              // We need this for top-level await
              optimizeDeps: {
                esbuildOptions: {
                  target: 'es2022',
                },
              },
              build: {
                target: 'es2022',
              },
            },
          });

          /**
           * The above script will run before client frameworks like React hydrate.
           * This makes sure that we have initialized a Clerk instance and populated stores in order to avoid hydration issues
           */
          injectScript(
            'before-hydration',
            `
            ${command === 'dev' ? 'console.log("astro-clerk-auth","Initialize Clerk: before-hydration")' : ''}
            import { runInjectionScript } from "${buildImportPath}";
            await runInjectionScript(${JSON.stringify(params)});`,
          );

          /**
           * The above script only executes if a client framework like React needs to hydrate.
           * We need to run the same script again for each page in order to initialize Clerk even if no UI framework is used in the client
           * If no UI framework is used in the client, the above script with `before-hydration` will never run
           */

          injectScript(
            'page',
            `
            ${command === 'dev' ? 'console.log("astro-clerk-auth","Initialize Clerk: page")' : ''}
            import { runInjectionScript } from "${buildImportPath}";
            await runInjectionScript(${JSON.stringify(params)});`,
          );
        },
      },
    };
  };
}

export { createIntegration };
