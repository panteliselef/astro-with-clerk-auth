import { defineConfig } from 'tsup';
import { name, version } from './package.json';

export default defineConfig(() => {
  return {
    clean: true,
    entry: [
      './src/index.ts',
      './src/hotload.ts',
      './src/client/react/index.ts',
      './src/client/stores/index.ts',
      './src/client/index.ts',
      './src/client/hotload.ts',
      './src/stores/index.ts',
      './src/server/index.ts',
      './src/internal/index.ts',
      './src/internal/hotload.ts',
      './src/v0/index.ts',
      './src/integration/index.ts',
      './src/integration/hotload.ts',
      './src/async-local-storage.client.ts',
      './src/async-local-storage.server.ts',
    ],
    dts: true,
    minify: false,
    define: {
      PACKAGE_NAME: `"${name}"`,
      PACKAGE_VERSION: `"${version}"`,
    },
    bundle: true,
    sourcemap: true,
    format: ['esm'],
    external: ['astro', 'react', 'react-dom', 'node:async_hooks','#async-local-storage'],
  };
});
