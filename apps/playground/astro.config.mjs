import { defineConfig } from "astro/config";

// https://astro.build/config
import react from "@astrojs/react";
import node from "@astrojs/node";
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
});
