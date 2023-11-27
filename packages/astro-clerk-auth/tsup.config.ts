import { defineConfig } from 'tsup';

export default defineConfig((options) => {
  return {
    clean: true,
    // entry: ["","./src/*.{ts,tsx}"],
    entry: ['./src/index.ts', './src/client/react/index.ts', './src/stores/index.ts', './src/server/index.ts'],
    dts: true,
    onSuccess: 'tsc --emitDeclarationOnly --declaration',
    minify: false,
    bundle: true,
    sourcemap: true,
    format: ['esm'],
    external: ['astro', 'react', 'react-dom', '@clerk/backend', '@clerk/clerk-js', '@clerk/shared', '@clerk/types'],
  };
});
