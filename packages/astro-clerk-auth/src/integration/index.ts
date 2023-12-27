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

        injectScript(
          'before-hydration',
          `
      import { $ssrState } from "astro-clerk-auth/stores";
      import { createClerkInstance } from "astro-clerk-auth/client/react";
    
      createClerkInstance(${JSON.stringify(params)});
    
      const ssrDataContainer = document.getElementById("__CLERK_ASTRO_DATA__")
      if(ssrDataContainer) {
        $ssrState.set(
          JSON.parse(ssrDataContainer.textContent || "{}"),
        );
      };`,
        );
      },
    },
  };
};
