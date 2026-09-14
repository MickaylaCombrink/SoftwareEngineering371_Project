import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Unmount between tests so one test's DOM never leaks into the next
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

// jsdom does not implement these; several Bootstrap-driven components call them
window.scrollTo = vi.fn();
window.HTMLElement.prototype.scrollIntoView = vi.fn();
