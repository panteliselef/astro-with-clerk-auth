import type { AstroClerkIntegrationParams } from '../types';
import type { AstroIntegration } from 'astro';
import { name as packageName, version as packageVersion } from '../../package.json';
import { ClerkOptions } from '@clerk/types';

const buildEnvVarFromOption = (valueToBeStored: unknown, envName: string) => {
  return valueToBeStored ? { [`import.meta.env.${envName}`]: JSON.stringify(valueToBeStored) } : {};
};

export default (params?: AstroClerkIntegrationParams): AstroIntegration => {
  const { proxyUrl, isSatellite, domain, signInUrl, signUpUrl } = params || {};

  return {
    name: '@astro-clerk-auth/integration',
    hooks: {
      'astro:config:setup': ({ config, injectScript, updateConfig, logger, command }) => {
        if (config.output === 'static')
          logger.error(`${packageName} requires SSR to be turned on. Please update output to "server"`);

        if (!config.adapter) {
          logger.error('Missing adapter, please update your Astro config to use one.');
        }

        if (params?.telemetry !== false) {
          logger.warn('==========================');
          logger.warn('Clerk Telemetry is enabled');
          logger.warn('==========================');
        }

        const internalParams: ClerkOptions = {
          ...params,
          sdkMetadata: {
            version: packageVersion,
            name: packageName,
            environment: command === 'dev' ? 'development' : 'production',
          },
          telemetry: {
            ...params?.telemetry,
            //@ts-ignore
            maxBufferSize: 1,
          },
        };

        // Set params as envs do backend code has access to them
        updateConfig({
          vite: {
            define: {
              ...buildEnvVarFromOption(signInUrl, 'PUBLIC_ASTRO_APP_CLERK_SIGN_IN_URL'),
              ...buildEnvVarFromOption(signUpUrl, 'PUBLIC_ASTRO_APP_CLERK_SIGN_UP_URL'),
              ...buildEnvVarFromOption(isSatellite, 'PUBLIC_ASTRO_APP_CLERK_IS_SATELLITE'),
              ...buildEnvVarFromOption(proxyUrl, 'PUBLIC_ASTRO_APP_CLERK_PROXY_URL'),
              ...buildEnvVarFromOption(domain, 'PUBLIC_ASTRO_APP_CLERK_DOMAIN'),
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
          import { runInjectionScript } from "astro-clerk-auth/internal";
          await runInjectionScript(${JSON.stringify(internalParams)});`,
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
          import { runInjectionScript } from "astro-clerk-auth/internal";
          await runInjectionScript(${JSON.stringify(internalParams)});`,
        );
      },
    },
  };
};
