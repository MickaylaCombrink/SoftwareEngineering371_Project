import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Port 5173 matches the backend's default CLIENT_ORIGIN, so CORS works with
// no extra configuration in development
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
