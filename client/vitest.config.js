import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    // Dates render in the machine's zone, so without pinning one the same
    // test passes in Johannesburg and fails on a CI box running UTC.
    env: { TZ: 'Africa/Johannesburg' },
    // Playwright specs live under tests/e2e and are run by Playwright, not here
    exclude: ['node_modules/**', 'dist/**', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/**/*.test.{js,jsx}'],
      thresholds: {
        // A floor set just under today's figures, so a regression fails the
        // build. Overall coverage is modest by design: logic-bearing modules
        // are unit tested hard, while presentational pages are covered by the
        // Playwright journeys instead of by shallow render assertions.
        statements: 17,
        branches: 16,
        functions: 15,
        lines: 17,

        // The modules that carry the rules are held to a much higher bar
        'src/utils/payment.js': { statements: 95, branches: 90, functions: 90, lines: 95 },
        'src/utils/format.js': { statements: 90, branches: 85, functions: 85, lines: 90 },
        'src/api/client.js': { statements: 85, branches: 75, functions: 85, lines: 85 },
        'src/components/ProductCard.jsx': { statements: 95, branches: 85, functions: 95, lines: 95 },
        'src/components/ProductImage.jsx': { statements: 95, branches: 85, functions: 95, lines: 95 },
      },
    },
  },
});
