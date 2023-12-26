import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";
import astroClerk from "astro-clerk-auth/integration";
// import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    react(),
    astroClerk({
      signInUrl: "/sign-in",
      signUpUrl: "/sign-up",
      afterSignInUrl: "/",
      afterSignUpUrl: "/",
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
