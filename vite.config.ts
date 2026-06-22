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
    // The MetaMask Connect SDK lazy-loads these CJS deps via dynamic import()
    // from inside the already-bundled @metamask/connect-multichain. Vite's
    // scanner doesn't follow dynamic imports nested in prebundled deps, so they
    // must be pre-optimized explicitly — otherwise their named exports resolve
    // to `undefined` in the browser (e.g. `SessionStore.create` throws).
    // Note: @metamask/multichain-ui/loader is intentionally NOT listed — it's a
    // Stencil lazy loader that breaks when prebundled.
    include: [
      'bowser',
      '@metamask/mobile-wallet-protocol-core',
      '@metamask/mobile-wallet-protocol-dapp-client',
      'eciesjs',
    ],
    esbuildOptions: {
      // Force bowser to use the CommonJS entry point which has proper exports
      mainFields: ['main', 'module'],
    },
  },
  resolve: {
    alias: {
      // Force all bowser imports to resolve to a single root-level copy whose
      // es5 build has working named exports (the package's ESM entry doesn't).
      bowser: 'bowser/es5.js',
    },
  },
  test: {
    // 👋 add the line below to add jsdom to vite
    environment: 'jsdom',
  },
} as UserConfig);
