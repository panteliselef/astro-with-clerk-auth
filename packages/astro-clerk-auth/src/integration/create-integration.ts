import type { AstroClerkIntegrationParams } from '../types';
import type { AstroIntegration } from 'astro';
import { name as packageName, version as packageVersion } from '../../package.json';
import type { Plugin } from 'vite';

const VI_INTERNAL_ALS_ID = 'virtual:astro-clerk/internal/als';
const VI_ID = 'clerk:astro';

export default function virtualImport({
  nameCount,
  id: virtualModuleId,
  content,
  context,
}: {
  nameCount: number;
  id: string;
  content: string;
  context: string;
}): Plugin {
  const resolvedVirtualModuleId = '\0' + virtualModuleId;
  const name = `astro-clerk-${nameCount}`

  return {
    name, // required, will show up in warnings and errors
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id, options) {
      if (id === resolvedVirtualModuleId) {
        const _context = options?.ssr ? 'server' : 'client';

        if (context === _context) {
          return content;
        }
      }
      return;
    },
  };
}

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
              plugins: [
                virtualImport({
                  nameCount: 1,
                  id: VI_INTERNAL_ALS_ID,
                  content: `import { AsyncLocalStorage } from "node:async_hooks"; export const authAls = new AsyncLocalStorage();`,
                  context: 'server',
                }),
                virtualImport({
                  nameCount: 2,
                  id: VI_ID,
                  content: `import { authAls } from ${JSON.stringify(VI_INTERNAL_ALS_ID)};
  export const getClerkAuthInitState = () => authAls.getStore();`,
                  context: 'server',
                }),
                virtualImport({
                  nameCount: 3,
                  id: VI_ID,
                  content: `
                  const auth = JSON.parse(document.getElementById('__CLERK_ASTRO_DATA__')?.textContent || '{}');
  export const getClerkAuthInitState = () => auth`,
                  context: 'client',
                }),
              ],

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
