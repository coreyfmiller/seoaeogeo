/**
 * Retry utility with exponential backoff for API calls
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: number[]; // HTTP status codes to retry
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableErrors: [429, 500, 502, 503, 504] // Rate limit and server errors
};

/**
 * Executes a function with exponential backoff retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if error is retryable
      const isRetryable = 
        error.status && opts.retryableErrors.includes(error.status) ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNRESET' ||
        error.message?.includes('rate limit') ||
        error.message?.includes('timeout');
      
      // Don't retry if not retryable or out of retries
      if (!isRetryable || attempt === opts.maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelay
      );
      
      // Add jitter (±25%) to prevent thundering herd
      const jitter = delay * (0.75 + Math.random() * 0.5);
      
      console.warn(
        `[Retry] Attempt ${attempt + 1}/${opts.maxRetries} failed. ` +
        `Retrying in ${Math.round(jitter)}ms... Error: ${error.message}`
      );
      
      await sleep(jitter);
    }
  }
  
  throw lastError || new Error('Retry failed with unknown error');
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Batch retry - executes multiple functions with retry logic
 */
export async function batchWithRetry<T>(
  fns: Array<() => Promise<T>>,
  options: RetryOptions & { concurrency?: number } = {}
): Promise<T[]> {
  const concurrency = options.concurrency || 3;
  const results: T[] = [];
  
  for (let i = 0; i < fns.length; i += concurrency) {
    const batch = fns.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(fn => withRetry(fn, options))
    );
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Rate limiter - ensures minimum delay between calls
 */
export class RateLimiter {
  private lastCallTime = 0;
  private minDelay: number;
  
  constructor(callsPerSecond: number) {
    this.minDelay = 1000 / callsPerSecond;
  }
  
  async throttle(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < this.minDelay) {
      await sleep(this.minDelay - timeSinceLastCall);
    }
    
    this.lastCallTime = Date.now();
  }
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.throttle();
    return fn();
  }
}
