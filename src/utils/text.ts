/** Trims surrounding whitespace from user input before it is stored. */
export function sanitizeText(input: string): string {
  return input.trim();
}

/** True for an empty string or one that is only whitespace. */
export function isBlank(input: string): boolean {
  return input.trim().length === 0;
}
