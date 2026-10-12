/**
 * Sanitize user input against XSS injections.
 * NFR: Security requirement - Never use dangerouslySetInnerHTML.
 */
export function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validates message content to ensure non-empty and non-whitespace.
 */
export function isValidMessage(text) {
  return typeof text === 'string' && text.trim().length > 0;
}
