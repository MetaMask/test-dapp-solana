import react from '@vitejs/plugin-react-swc';
import { type UserConfig, defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
// biome-ignore lint/style/noDefaultExport: <explanation>
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
  },
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer'],
      globals: {
        Buffer: true,
      },
    }),
  ],
  optimizeDeps: {
    include: ['bowser'],
    esbuildOptions: {
      // Force bowser to use the CommonJS entry point which has proper exports
      mainFields: ['main', 'module'],
    },
  },
  resolve: {
    alias: {
      // Force all bowser imports to use the root-level bowser package (v2.13.1)
      bowser: 'bowser/es5.js',
    },
  },
  test: {
    // 👋 add the line below to add jsdom to vite
    environment: 'jsdom',
  },
} as UserConfig);
