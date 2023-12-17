import { AstroIntegration } from 'astro';

export default (): AstroIntegration => ({
  name: '@astro-clerk-auth/integration',
  hooks: {
    'astro:config:setup': ({ injectScript }) => {
      injectScript(
        'before-hydration',
        `
      import { $ssrState } from "astro-clerk-auth/stores";
      import { createClerkInstance } from "astro-clerk-auth/client/react";
    
      createClerkInstance();
    
      const ssrDataContainer = document.getElementById("__CLERK_ASTRO_DATA__")
      if(ssrDataContainer) {
        $ssrState.set(
          JSON.parse(ssrDataContainer.textContent || "{}"),
        );
      };`,
      );
    },
  },
});
