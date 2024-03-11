import { defineConfig } from "astro/config";

// https://astro.build/config
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";
import tailwind from "@astrojs/tailwind";
import clerk from "astro-clerk-auth";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind(),
    clerk({
      signInUrl: "/sign-in",
      signUpUrl: "/sign-up",
    }),
  ],
  output: "server",
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    speedInsights: {
      enabled: true,
    },
  }),
});
