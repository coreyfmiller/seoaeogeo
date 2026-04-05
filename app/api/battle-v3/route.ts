import { NextResponse } from 'next/server'
import { performScan } from '@/lib/crawler'
import { analyzeCompetitive } from '@/lib/gemini-competitive'
import { analyzeWithGeminiSingle } from '@/lib/gemini'
import { calculateScoresFromScanResult } from '@/lib/grader-v2'
import { detectSiteType } from '@/lib/site-type-detector'
import { getAuthUser, useCredits, refundCredits, incrementScanCount } from '@/lib/supabase/auth-helpers'
import { isMozConfigured, type MozBacklinkData } from '@/lib/moz'
import { fetchBacklinksWithCache } from '@/lib/backlink-fetcher'
import { saveScanToDb } from '@/lib/scan-history-db'
import { generateAIExpertAnalysis } from '@/lib/gemini-expert-analysis'

export const maxDuration = 300

/**
 * Battle Mode V3 API
 * Same competitive analysis as V1 + Moz backlink data.
 * Backlinks are optional — if Moz isn't configured, battle works without them.
 * Credit cost: 20 (same as V1).
 */
export async function POST(req: Request) {
  let user: Awaited<ReturnType<typeof getAuthUser>> = null
  try {
    user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { allowed } = await useCredits(user.id, 10)
    if (!allowed) {
      return NextResponse.json({ error: 'Insufficient credits. Competitor Duel costs 10 credits.' }, { status: 402 })
    }

    const { siteAUrl, siteBUrl } = await req.json()
    if (!siteAUrl || !siteBUrl) {
      return NextResponse.json({ error: 'Two URLs are required for comparison' }, { status: 400 })
    }

    console.log(`[Battle V3] Starting: ${siteAUrl} VS ${siteBUrl}`)

    // Run everything in parallel: crawl both sites + fetch backlinks for both
    const mozEnabled = isMozConfigured()
    const [scanA, scanB, backlinksA, backlinksB] = await Promise.all([
      performScan(siteAUrl, { lightweight: true }),
      performScan(siteBUrl, { lightweight: true }),
      mozEnabled ? fetchBacklinksWithCache(siteAUrl, true) : Promise.resolve(null),
      mozEnabled ? fetchBacklinksWithCache(siteBUrl, false) : Promise.resolve(null),
    ])

    // Grade both sites with the same AI + grader pipeline as Pro Audit
    // Run AI analysis on both sites in parallel (same as Pro Audit V3 / Keyword Arena V3)
    const [aiA, aiB] = await Promise.all([
      analyzeWithGeminiSingle({
        title: scanA.title, description: scanA.description,
        thinnedText: scanA.thinnedText, schemas: scanA.schemas,
        structuralData: scanA.structuralData,
      }).catch(() => null),
      analyzeWithGeminiSingle({
        title: scanB.title, description: scanB.description,
        thinnedText: scanB.thinnedText, schemas: scanB.schemas,
        structuralData: scanB.structuralData,
      }).catch(() => null),
    ])

    // Feed AI-produced flags into scans (same as Pro Audit / Arena)
    const siteTypeA = detectSiteType(scanA, [])
    scanA.siteType = siteTypeA.primaryType
    if (aiA) {
      scanA.semanticFlags = aiA.semanticFlags; scanA.schemaQuality = aiA.schemaQuality
      if (aiA.detectedSiteType && aiA.detectedSiteType !== 'general') {
        siteTypeA.primaryType = aiA.detectedSiteType; scanA.siteType = aiA.detectedSiteType
      }
    }

    const siteTypeB = detectSiteType(scanB, [])
    scanB.siteType = siteTypeB.primaryType
    if (aiB) {
      scanB.semanticFlags = aiB.semanticFlags; scanB.schemaQuality = aiB.schemaQuality
      if (aiB.detectedSiteType && aiB.detectedSiteType !== 'general') {
        siteTypeB.primaryType = aiB.detectedSiteType; scanB.siteType = aiB.detectedSiteType
      }
    }

    const graderA = calculateScoresFromScanResult(scanA)
    const graderB = calculateScoresFromScanResult(scanB)

    // Build backlink context for Gemini prompt
    const backlinkContext = buildBacklinkContext(backlinksA, backlinksB, siteAUrl, siteBUrl)

    // Competitive Gemini analysis (with backlink context injected)
    console.log(`[Battle V3] Starting Gemini analysis...`)
    const compareResult = await analyzeCompetitive(
      {
        url: siteAUrl,
        title: scanA.title,
        description: scanA.description,
        thinnedText: scanA.thinnedText,
        schemas: scanA.schemas,
      },
      {
        url: siteBUrl,
        title: scanB.title,
        description: scanB.description,
        thinnedText: scanB.thinnedText,
        schemas: scanB.schemas,
      },
      { platform: scanA.platformDetection?.label, backlinkContext }
    )

    await incrementScanCount(user.id, 'competitive')
    console.log(`[Battle V3] Done.`)

    // Override AI-generated scores with deterministic grader scores (same as Pro Audit)
    if (compareResult.comparison) {
      compareResult.comparison.seo = { ...compareResult.comparison.seo, siteA: graderA.seoScore, siteB: graderB.seoScore }
      compareResult.comparison.aeo = { ...compareResult.comparison.aeo, siteA: graderA.aeoScore, siteB: graderB.aeoScore }
      compareResult.comparison.geo = { ...compareResult.comparison.geo, siteA: graderA.geoScore, siteB: graderB.geoScore }
    }
    // Also override top-level if Gemini returned flat structure
    if (compareResult.seo) {
      compareResult.seo = { ...compareResult.seo, siteA: graderA.seoScore, siteB: graderB.seoScore }
      compareResult.aeo = { ...compareResult.aeo, siteA: graderA.aeoScore, siteB: graderB.aeoScore }
      compareResult.geo = { ...compareResult.geo, siteA: graderA.geoScore, siteB: graderB.geoScore }
    }

    // Generate AI expert analysis
    const expertAnalysis = await generateAIExpertAnalysis({
      context: 'competitor-duel', siteAUrl, siteBUrl,
      scoresA: { seo: graderA.seoScore, aeo: graderA.aeoScore, geo: graderA.geoScore },
      scoresB: { seo: graderB.seoScore, aeo: graderB.aeoScore, geo: graderB.geoScore },
      siteTypeA: siteTypeA.primaryType, siteTypeB: siteTypeB.primaryType,
      platformA: scanA.platformDetection?.label, platformB: scanB.platformDetection?.label,
      daA: backlinksA?.metrics?.domainAuthority, daB: backlinksB?.metrics?.domainAuthority,
      backlinksA: backlinksA?.metrics?.totalBacklinks, backlinksB: backlinksB?.metrics?.totalBacklinks,
      wordCountA: scanA.structuralData?.wordCount, wordCountB: scanB.structuralData?.wordCount,
      schemaCountA: (scanA.schemas || []).length, schemaCountB: (scanB.schemas || []).length,
    }).catch(() => null)

    const resultData = {
      siteA: scanA,
      siteB: scanB,
      comparison: compareResult,
      expertAnalysis,
      platformDetection: scanA.platformDetection,
      backlinks: {
        siteA: backlinksA,
        siteB: backlinksB,
        linkGap: computeLinkGap(backlinksA, backlinksB),
        mozEnabled,
      },
    }

    // Save to persistent scan history
    const c = compareResult || {} as any
    saveScanToDb(user.id, 'competitive', `${siteAUrl} vs ${siteBUrl}`, {
      seo: c.seo?.siteA || 0, aeo: c.aeo?.siteA || 0, geo: c.geo?.siteA || 0,
    }, resultData).catch(() => {})

    return NextResponse.json({ success: true, data: resultData })
  } catch (error: any) {
    console.error('[Battle V3] Error:', error)
    if (user) {
      try { await refundCredits(user.id, 10) } catch (e) { console.error('[Battle V3] Refund failed:', e) }
    }
    return NextResponse.json({
      success: false,
      error: error.message || 'Battle analysis failed',
      creditsRefunded: user ? 20 : 0,
    }, { status: 500 })
  }
}

/**
 * Compute link gap: domains linking to site B but not site A.
 */
function computeLinkGap(
  dataA: MozBacklinkData | null,
  dataB: MozBacklinkData | null
): { domain: string; da: number; url: string }[] {
  if (!dataA || !dataB) return []

  const domainsA = new Set(dataA.backlinks.map(b => b.sourceDomain.toLowerCase()))
  return dataB.backlinks
    .filter(b => !domainsA.has(b.sourceDomain.toLowerCase()))
    .map(b => ({ domain: b.sourceDomain, da: b.domainAuthority, url: b.sourceUrl }))
    .sort((a, b) => b.da - a.da)
}

/**
 * Build backlink context string for Gemini prompt injection.
 */
function buildBacklinkContext(
  dataA: MozBacklinkData | null,
  dataB: MozBacklinkData | null,
  urlA: string,
  urlB: string
): string {
  if (!dataA && !dataB) return ''

  let ctx = '\n\nBACKLINK INTELLIGENCE (from Moz):\n'

  if (dataA) {
    ctx += `\nSITE A (${urlA}) Backlink Profile:\n`
    ctx += `  Domain Authority: ${dataA.metrics.domainAuthority}\n`
    ctx += `  Total Backlinks: ${dataA.metrics.totalBacklinks}\n`
    ctx += `  Linking Domains: ${dataA.metrics.linkingDomains}\n`
    ctx += `  Spam Score: ${dataA.metrics.spamScore}%\n`
    if (dataA.backlinks.length > 0) {
      ctx += `  Top ${dataA.backlinks.length} backlinks by DA:\n`
      dataA.backlinks.slice(0, 5).forEach(b => {
        ctx += `    - ${b.sourceDomain} (DA: ${b.domainAuthority}) → anchor: "${b.anchorText}" ${b.isDofollow ? 'dofollow' : 'nofollow'}\n`
      })
    }
  }

  if (dataB) {
    ctx += `\nSITE B (${urlB}) Backlink Profile:\n`
    ctx += `  Domain Authority: ${dataB.metrics.domainAuthority}\n`
    ctx += `  Total Backlinks: ${dataB.metrics.totalBacklinks}\n`
    ctx += `  Linking Domains: ${dataB.metrics.linkingDomains}\n`
    ctx += `  Spam Score: ${dataB.metrics.spamScore}%\n`
    if (dataB.backlinks.length > 0) {
      ctx += `  Top ${dataB.backlinks.length} backlinks by DA:\n`
      dataB.backlinks.slice(0, 5).forEach(b => {
        ctx += `    - ${b.sourceDomain} (DA: ${b.domainAuthority}) → anchor: "${b.anchorText}" ${b.isDofollow ? 'dofollow' : 'nofollow'}\n`
      })
    }
  }

  const gap = computeLinkGap(dataA, dataB)
  if (gap.length > 0) {
    ctx += `\nLINK GAP (sites linking to B but not A):\n`
    gap.slice(0, 5).forEach(g => {
      ctx += `  - ${g.domain} (DA: ${g.da})\n`
    })
  }

  ctx += '\nUse this backlink data to inform your recommendations. Suggest specific link-building strategies based on the gap analysis.\n'
  return ctx
}
