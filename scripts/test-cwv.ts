/**
 * Test script for Core Web Vitals integration
 * Run with: npx tsx scripts/test-cwv.ts
 */

import { getCoreWebVitals, getMetricThresholds } from '../lib/v2/core-web-vitals'

const testUrls = [
  'https://fundylogic.com',
  'https://pizzatwice.com',
  'https://google.com',
  'https://example.com',
]

async function testCoreWebVitals() {
  console.log('🚀 Testing Core Web Vitals Integration\n')
  console.log('=' .repeat(80))
  
  for (const url of testUrls) {
    console.log(`\n📊 Testing: ${url}`)
    console.log('-'.repeat(80))
    
    try {
      const cwv = await getCoreWebVitals(url, 'mobile')
      
      console.log('\n✅ SUCCESS\n')
      
      // Overall
      console.log(`Overall Category: ${cwv.overallCategory}`)
      console.log(`Performance Score: ${cwv.performanceScore}/100`)
      console.log(`Has Real User Data: ${cwv.hasRealUserData ? 'Yes (CrUX)' : 'No (Lab only)'}`)
      console.log(`Strategy: ${cwv.strategy}`)
      
      // LCP
      if (cwv.lcp) {
        console.log(`\n📈 LCP (Largest Contentful Paint):`)
        console.log(`   Value: ${cwv.lcp.displayValue}`)
        console.log(`   Category: ${cwv.lcp.category}`)
        console.log(`   Score: ${cwv.lcp.score}/100`)
        console.log(`   Threshold: ≤2.5s (good), >4.0s (poor)`)
      } else {
        console.log(`\n⚠️  LCP: Not available`)
      }
      
      // INP
      if (cwv.inp) {
        console.log(`\n⚡ INP (Interaction to Next Paint):`)
        console.log(`   Value: ${cwv.inp.displayValue}`)
        console.log(`   Category: ${cwv.inp.category}`)
        console.log(`   Score: ${cwv.inp.score}/100`)
        console.log(`   Threshold: ≤200ms (good), >500ms (poor)`)
      } else {
        console.log(`\n⚠️  INP: Not available`)
      }
      
      // CLS
      if (cwv.cls) {
        console.log(`\n🎯 CLS (Cumulative Layout Shift):`)
        console.log(`   Value: ${cwv.cls.displayValue}`)
        console.log(`   Category: ${cwv.cls.category}`)
        console.log(`   Score: ${cwv.cls.score}/100`)
        console.log(`   Threshold: ≤0.1 (good), >0.25 (poor)`)
      } else {
        console.log(`\n⚠️  CLS: Not available`)
      }
      
      console.log(`\n⏰ Fetched at: ${new Date(cwv.fetchedAt).toLocaleString()}`)
      
    } catch (error: any) {
      console.log(`\n❌ ERROR: ${error.message}`)
    }
    
    console.log('\n' + '='.repeat(80))
  }
  
  console.log('\n\n📚 Metric Thresholds Reference:\n')
  console.log('LCP:', getMetricThresholds('lcp'))
  console.log('INP:', getMetricThresholds('inp'))
  console.log('CLS:', getMetricThresholds('cls'))
  
  console.log('\n✨ Test complete!\n')
}

// Run tests
testCoreWebVitals().catch(console.error)
