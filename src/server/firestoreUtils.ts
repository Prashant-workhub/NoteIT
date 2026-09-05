/**
 * Firestore utility functions with timeout handling.
 * Prevents Firestore calls from hanging indefinitely when credentials are unavailable.
 */

/**
 * Wrap a promise with a timeout.
 * Rejects if the promise doesn't resolve within the specified time.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 5000,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ]);
}

/**
 * Type guard to check if an error is a timeout error.
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('timed out') || error.message.includes('timeout');
  }
  return false;
}
