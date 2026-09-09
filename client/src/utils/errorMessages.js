// Fallback copy for each status code your team agreed to handle.
// The server's own message always wins when present (see client.js) —
// this only fires when the server didn't send one, or the body failed to parse.
// In practice this rarely fires: every error path in the backend (AppError,
// the global handler, and both rate limiters) already sends a real message.
export const STATUS_MESSAGES = {
  400: 'That request was malformed.',
  401: 'Your session has expired. Please log in again.',
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: 'That conflicts with existing data.',
  422: 'Some fields need fixing.',
  429: 'Too many requests — please slow down and try again shortly.',
};

export function messageForStatus(status, fallback) {
  return fallback || STATUS_MESSAGES[status] || 'Something went wrong.';
}