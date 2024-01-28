import { defineConfig } from "astro/config";

// https://astro.build/config
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";
import tailwind from "@astrojs/tailwind";
import astroClerk from "astro-clerk-auth";
// import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind(),
    astroClerk({
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
  // adapter: node({
  //   mode: "standalone",
  // }),
});
