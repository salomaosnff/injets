import { defineConfig } from 'tsup';

export default defineConfig([
  // Node Build (CJS & ESM)
  {
    entry: {
      index: 'src/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    target: 'node16',
    platform: 'node',
    outDir: 'dist',
    minify: true,
    sourcemap: true,
    define: {
      'import.meta.NODE': 'true',
    },
    outExtension({ format }) {
      return {
        js: format === 'cjs' ? '.cjs' : '.mjs',
      };
    },
    esbuildOptions(options) {
      options.minifySyntax = true;
    },
  },
  // Browser Build (CJS & ESM)
  {
    entry: {
      'index.browser': 'src/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    clean: false, // Don't clean, otherwise it will delete the node build
    target: 'es2024',
    platform: 'browser',
    outDir: 'dist',
    minify: true,
    sourcemap: true,
    define: {
      'import.meta.NODE': 'false',
    },
    outExtension({ format }) {
      return {
        js: format === 'cjs' ? '.cjs' : '.mjs',
      };
    },
    esbuildOptions(options) {
      options.minifySyntax = true;
    },
  },
]);
