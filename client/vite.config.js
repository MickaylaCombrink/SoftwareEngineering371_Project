import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves a project site from /<repo>/, so the built asset URLs
// have to carry that prefix. The dev server stays at / — overridable with
// VITE_BASE when the repository is renamed or the site moves to a domain.
const REPO_BASE = process.env.VITE_BASE || '/SoftwareEngineering371_Project/';

// Port 5173 matches the backend's default CLIENT_ORIGIN, so CORS works with
// no extra configuration in development
export default defineConfig(({ command }) => ({
  base: command === 'build' ? REPO_BASE : '/',
  plugins: [react()],
  server: { port: 5173 },
}));
