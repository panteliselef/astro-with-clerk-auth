import { AstroClerkIntegrationParams } from '../types';
import { AstroIntegration } from 'astro';
import { name as packageName } from '../../package.json';

export default (params?: AstroClerkIntegrationParams): AstroIntegration => {
  const { proxyUrl, isSatellite, domain, afterSignInUrl, afterSignUpUrl, signInUrl, signUpUrl } = params || {};

  return {
    name: '@astro-clerk-auth/integration',
    hooks: {
      'astro:config:setup': ({ config, injectScript, updateConfig, logger }) => {
        if (config.output === 'static')
          logger.error(`${packageName} requires SSR to be turned on. Please update output to "server"`);

        if (!config.adapter) {
          logger.error('Missing adapter, please update your Astro config to use one.');
        }

        updateConfig({
          vite: {
            define: {
              'import.meta.env.PUBLIC_ASTRO_APP_CLERK_SIGN_IN_URL': JSON.stringify(signInUrl),
              'import.meta.env.PUBLIC_ASTRO_APP_CLERK_SIGN_UP_URL': JSON.stringify(signUpUrl),
              'import.meta.env.PUBLIC_ASTRO_APP_CLERK_IS_SATELLITE': JSON.stringify(isSatellite),
              'import.meta.env.PUBLIC_ASTRO_APP_CLERK_PROXY_URL': JSON.stringify(proxyUrl),
              'import.meta.env.PUBLIC_ASTRO_APP_CLERK_DOMAIN': JSON.stringify(domain),
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
          console.log("before-hydration")
      import { $ssrState } from "astro-clerk-auth/stores";
      import { createClerkInstance } from "astro-clerk-auth/client/react";

      const ssrDataContainer = document.getElementById("__CLERK_ASTRO_DATA__")
      if(ssrDataContainer) {
        $ssrState.set(
          JSON.parse(ssrDataContainer.textContent || "{}"),
        );
      };
    
      await createClerkInstance(${JSON.stringify(params)});
      `,
        );


        /**
         * The above script only executes if a client framework like React needs to hydrate.
         * We need to run the same script again for each page in order to initialize Clerk even if no UI framework is used in the client
         * If no UI framework is used in the client, the above script with `before-hydration` will never run
         */
        injectScript(
          'page',
          `
          console.log("page")
          import { $ssrState } from "astro-clerk-auth/stores";
          import { createClerkInstance } from "astro-clerk-auth/client/react";
        
          const ssrDataContainer = document.getElementById("__CLERK_ASTRO_DATA__")
          if(ssrDataContainer) {
            $ssrState.set(
              JSON.parse(ssrDataContainer.textContent || "{}"),
            );
          };
        
          await createClerkInstance(${JSON.stringify(params)});`,
        );
      },
    },
  };
};
