// Patch global fetch to prefix backend base for relative API calls
// Only affects requests starting with '/api/' to keep external URLs untouched.
(function patchFetchBase() {
  try {
    const API_BASE = (typeof import !== 'undefined' && import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || '';
    if (!API_BASE || typeof window === 'undefined' || !window.fetch) return;

    const base = String(API_BASE).replace(/\/$/, '');
    const origFetch = window.fetch.bind(window);

    window.fetch = (input, init) => {
      try {
        const url = typeof input === 'string' ? input : (input && input.url) || '';
        if (typeof url === 'string' && url.startsWith('/api/')) {
          const full = base + url;
          return origFetch(full, init);
        }
      } catch (_) {
        // fall through to original fetch
      }
      return origFetch(input, init);
    };
  } catch (_) {
    // ignore patch errors; continue with default fetch
  }
})();
