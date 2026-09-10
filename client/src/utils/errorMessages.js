// Fallback copy: only used when the server sent no message of its own
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