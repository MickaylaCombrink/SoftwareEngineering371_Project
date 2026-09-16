import { describe, test, expect } from 'vitest';
import { assetUrl } from './assetUrl';

// BASE_URL is '/' under the test runner, so these assert the shape of the
// rewrite. The sub-path case is covered by the build itself: vite.config.js
// sets base, and the E2E journeys run against the built bundle.

describe('assetUrl', () => {
  test('leaves a site-absolute path resolvable from the base', () => {
    expect(assetUrl('/images/oud.webp')).toBe('/images/oud.webp');
  });

  test('accepts a path without a leading slash', () => {
    expect(assetUrl('images/oud.webp')).toBe('/images/oud.webp');
  });

  test('a stray double slash is treated as a path, not as a host', () => {
    // "//images/oud.webp" is a typo in the data. Read as protocol-relative it
    // would request the host "images" and fail silently.
    expect(assetUrl('//images/oud.webp')).toBe('/images/oud.webp');
  });

  test('leaves a full URL alone', () => {
    // A product image hosted elsewhere must not be rewritten
    const remote = 'https://cdn.example.com/oud.webp';
    expect(assetUrl(remote)).toBe(remote);
    expect(assetUrl('http://cdn.example.com/oud.webp')).toBe('http://cdn.example.com/oud.webp');
  });

  test('leaves inline and object data alone', () => {
    expect(assetUrl('data:image/png;base64,AAA')).toBe('data:image/png;base64,AAA');
    expect(assetUrl('blob:http://localhost/abc')).toBe('blob:http://localhost/abc');
  });

  test('an absent path is empty, not "undefined"', () => {
    expect(assetUrl(undefined)).toBe('');
    expect(assetUrl(null)).toBe('');
    expect(assetUrl('')).toBe('');
  });
});
