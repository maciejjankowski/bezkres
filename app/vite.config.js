import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8080,
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['@tensorflow/tfjs', '@tensorflow-models/pose-detection'],
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer',
    },
  },
});
