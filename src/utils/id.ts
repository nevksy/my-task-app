/**
 * Generates a stable unique id. Prefers the platform UUID when available
 * (all modern browsers in a secure context); falls back to a timestamp +
 * random-suffix scheme for older or non-secure contexts where
 * `crypto.randomUUID` doesn't exist.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
