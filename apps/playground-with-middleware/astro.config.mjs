import { defineConfig } from "astro/config";

// https://astro.build/config
import react from "@astrojs/react";
import vercel from '@astrojs/vercel';
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'server',
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    speedInsights: {
      enabled: true,
    },
    edgeMiddleware: true,
  }),
});
