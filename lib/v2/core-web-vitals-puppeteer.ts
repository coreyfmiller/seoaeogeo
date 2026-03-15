/**
 * Core Web Vitals Integration - Puppeteer Version
 * Measures performance metrics using Puppeteer (serverless-compatible)
 */

import playwright from 'playwright-core'
import chromium from '@sparticuz/chromium'

export interface CoreWebVitalsData {
  // Core Web Vitals metrics
  lcp: {
    value: number
    category: 'FAST' | 'AVERAGE' | 'SLOW'
    score: number
    displayValue: string
  } | null
  
  inp: {
    value: number
    category: 'FAST' | 'AVERAGE' | 'SLOW'
    score: number
    displayValue: string
  } | null
  
  cls: {
    value: number
    category: 'FAST' | 'AVERAGE' | 'SLOW'
    score: number
    displayValue: string
  } | null
  
  // Overall assessment
  overallCategory: 'FAST' | 'AVERAGE' | 'SLOW'
  performanceScore: number
  
  // Metadata
  fetchedAt: string
  strategy: 'mobile' | 'desktop'
  hasRealUserData: boolean
}

/**
 * Fetch Core Web Vitals using Puppeteer
 */
export async function getCoreWebVitals(
  url: string,
  strategy: 'mobile' | 'desktop' = 'mobile'
): Promise<CoreWebVitalsData> {
  let browser
  
  try {
    console.log(`[CWV] Measuring Core Web Vitals for ${url} (${strategy})...`)
    
    // Launch browser
    browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })
    
    const context = await browser.newContext({
      viewport: strategy === 'mobile' 
        ? { width: 375, height: 667 }
        : { width: 1920, height: 1080 },
      userAgent: strategy === 'mobile'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    })
    
    const page = await context.newPage()
    
    // Inject Web Vitals measurement script
    await page.addInitScript(() => {
      (window as any).__webVitals = {
        lcp: null,
        fid: null,
        cls: null,
      }
      
      // Measure LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        ;(window as any).__webVitals.lcp = lastEntry.renderTime || lastEntry.loadTime
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
      
      // Measure CLS
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        ;(window as any).__webVitals.cls = clsValue
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })
      
      // Measure FID (First Input Delay) as proxy for INP
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[]
        ;(window as any).__webVitals.fid = entries[0].processingStart - entries[0].startTime
      })
      fidObserver.observe({ type: 'first-input', buffered: true })
    })
    
    // Navigate and wait for load
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    
    // Wait a bit for metrics to settle
    await page.waitForTimeout(2000)
    
    // Get the metrics
    const metrics = await page.evaluate(() => (window as any).__webVitals)
    
    await browser.close()
    
    // Parse metrics
    const lcp = parseLCP(metrics.lcp)
    const inp = parseINP(metrics.fid)
    const cls = parseCLS(metrics.cls)
    
    // Calculate overall category
    const categories = [lcp?.category, inp?.category, cls?.category].filter(Boolean)
    const overallCategory = determineOverallCategory(categories as Array<'FAST' | 'AVERAGE' | 'SLOW'>)
    
    // Calculate performance score (weighted average)
    const scores = [lcp?.score, inp?.score, cls?.score].filter((s): s is number => s !== undefined)
    const performanceScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0
    
    console.log(`[CWV] Success: LCP=${lcp?.displayValue}, INP=${inp?.displayValue}, CLS=${cls?.displayValue}`)
    
    return {
      lcp,
      inp,
      cls,
      overallCategory,
      performanceScore,
      fetchedAt: new Date().toISOString(),
      strategy,
      hasRealUserData: false,
    }
    
  } catch (error: any) {
    if (browser) await browser.close()
    console.error('[CWV] Error measuring Core Web Vitals:', error.message)
    throw new Error(`Failed to measure Core Web Vitals: ${error.message}`)
  }
}

/**
 * Parse LCP data
 */
function parseLCP(value: number | null) {
  if (!value) return null
  
  const category = getCategoryFromValue(value, 2500, 4000)
  const score = valueToScore(value, 2500, 4000)
  
  return {
    value,
    category,
    score,
    displayValue: `${(value / 1000).toFixed(1)} s`,
  }
}

/**
 * Parse INP data (using FID as proxy)
 */
function parseINP(value: number | null) {
  if (!value) return null
  
  // FID thresholds are similar to INP
  const category = getCategoryFromValue(value, 100, 300)
  const score = valueToScore(value, 100, 300)
  
  return {
    value,
    category,
    score,
    displayValue: `${Math.round(value)} ms`,
  }
}

/**
 * Parse CLS data
 */
function parseCLS(value: number | null) {
  if (value === null) return null
  
  const category = getCategoryFromValue(value, 0.1, 0.25)
  const score = valueToScore(value, 0.1, 0.25)
  
  return {
    value,
    category,
    score,
    displayValue: value.toFixed(3),
  }
}

/**
 * Get category from numeric value
 */
function getCategoryFromValue(
  value: number,
  goodThreshold: number,
  poorThreshold: number
): 'FAST' | 'AVERAGE' | 'SLOW' {
  if (value <= goodThreshold) return 'FAST'
  if (value > poorThreshold) return 'SLOW'
  return 'AVERAGE'
}

/**
 * Convert value to score (0-100)
 */
function valueToScore(
  value: number,
  goodThreshold: number,
  poorThreshold: number
): number {
  if (value <= goodThreshold) return 100
  if (value > poorThreshold) return 0
  
  // Interpolate between thresholds
  const range = poorThreshold - goodThreshold
  const position = value - goodThreshold
  const percentage = 1 - (position / range)
  return Math.round(Math.max(0, Math.min(100, percentage * 100)))
}

/**
 * Determine overall category from individual metrics
 */
function determineOverallCategory(
  categories: Array<'FAST' | 'AVERAGE' | 'SLOW'>
): 'FAST' | 'AVERAGE' | 'SLOW' {
  if (categories.length === 0) return 'AVERAGE'
  
  if (categories.includes('SLOW')) return 'SLOW'
  if (categories.every(c => c === 'FAST')) return 'FAST'
  
  return 'AVERAGE'
}

/**
 * Get Google's official thresholds for a metric
 */
export function getMetricThresholds(metric: 'lcp' | 'inp' | 'cls') {
  const thresholds = {
    lcp: {
      good: 2500,
      poor: 4000,
      unit: 'ms',
      name: 'Largest Contentful Paint',
      description: 'Measures loading performance. Good LCP is 2.5s or less.',
    },
    inp: {
      good: 200,
      poor: 500,
      unit: 'ms',
      name: 'Interaction to Next Paint',
      description: 'Measures interactivity. Good INP is 200ms or less.',
    },
    cls: {
      good: 0.1,
      poor: 0.25,
      unit: '',
      name: 'Cumulative Layout Shift',
      description: 'Measures visual stability. Good CLS is 0.1 or less.',
    },
  }
  
  return thresholds[metric]
}
