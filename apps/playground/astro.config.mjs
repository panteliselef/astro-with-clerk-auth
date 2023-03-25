import { defineConfig } from "astro/config";

// https://astro.build/config
import react from "@astrojs/react";
import vercel from '@astrojs/vercel/serverless';
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'server',
  adapter: vercel(),
});
