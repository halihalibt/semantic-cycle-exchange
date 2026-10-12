import { defineConfig } from 'vitest/config';
export default defineConfig({ base: '/semantic-cycle-exchange/', worker: { format: 'es' }, test: { environment: 'jsdom', setupFiles: ['./tests/deny-network.mjs', './tests/setup.ts'], clearMocks: true } });
