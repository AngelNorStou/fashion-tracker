/**
 * Some browser contexts (Edge's built-in PDF viewer opening an external
 * link, certain strict privacy modes) deny access to localStorage
 * entirely, throwing a SecurityError on read/write. These helpers make
 * every localStorage touch point fail gracefully instead of crashing.
 */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently no-op -- nothing meaningful to do if storage is blocked.
  }
}

export function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Same as above.
  }
}