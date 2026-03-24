/**
 * Gemini Model Resolver
 * Auto-discovers the best available flash-tier model from Google's API.
 * Sends an email notification via Resend when the active model changes.
 * Caches the result for 6 hours to avoid excessive API calls.
 */

const PREFERRED_MODEL = 'gemini-2.5-flash'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

// In-memory cache
let cachedModel: string | null = null
let cacheExpiry = 0
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

// Track the last known model so we can detect changes
let lastKnownModel: string | null = null

/**
 * Get the best available Gemini flash model.
 * Tries the preferred model first, falls back to auto-discovery.
 */
export async function getGeminiModel(): Promise<string> {
  // Return cached if still valid
  if (cachedModel && Date.now() < cacheExpiry) {
    return cachedModel
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    console.warn('[Model Resolver] No API key, using default:', PREFERRED_MODEL)
    return PREFERRED_MODEL
  }

  try {
    // First, try the preferred model directly (fast path)
    const testRes = await fetch(
      `${API_BASE}/models/${PREFERRED_MODEL}?key=${apiKey}`,
      { method: 'GET', signal: AbortSignal.timeout(5000) }
    )

    if (testRes.ok) {
      setCachedModel(PREFERRED_MODEL)
      return PREFERRED_MODEL
    }

    // Preferred model unavailable — discover alternatives
    console.warn(`[Model Resolver] ${PREFERRED_MODEL} unavailable (${testRes.status}), discovering alternatives...`)
    const resolved = await discoverFlashModel(apiKey)
    setCachedModel(resolved)
    return resolved
  } catch (err) {
    console.error('[Model Resolver] Discovery failed, using default:', err)
    // On network error, use preferred and hope for the best
    return cachedModel || PREFERRED_MODEL
  }
}

/**
 * Discover the best flash-tier model from the models.list API
 */
async function discoverFlashModel(apiKey: string): Promise<string> {
  const res = await fetch(
    `${API_BASE}/models?key=${apiKey}`,
    { method: 'GET', signal: AbortSignal.timeout(10000) }
  )

  if (!res.ok) {
    throw new Error(`models.list failed: ${res.status}`)
  }

  const data = await res.json()
  const models: Array<{ name: string; displayName: string; supportedGenerationMethods?: string[] }> = data.models || []

  // Filter for flash models that support generateContent
  const flashModels = models
    .filter(m => {
      const name = m.name.replace('models/', '')
      const isFlash = name.includes('flash') && !name.includes('lite')
      const supportsGenerate = m.supportedGenerationMethods?.includes('generateContent')
      // Exclude preview/experimental unless no stable options
      return isFlash && supportsGenerate
    })
    .map(m => m.name.replace('models/', ''))

  if (flashModels.length === 0) {
    throw new Error('No flash models available')
  }

  // Prefer stable over preview, then sort by version descending
  const stable = flashModels.filter(m => !m.includes('preview') && !m.includes('exp'))
  const candidates = stable.length > 0 ? stable : flashModels

  // Sort descending — higher version numbers first
  candidates.sort((a, b) => b.localeCompare(a))

  const chosen = candidates[0]
  console.log(`[Model Resolver] Discovered flash models: [${flashModels.join(', ')}] → chose: ${chosen}`)
  return chosen
}

/**
 * Cache the model and notify if it changed
 */
function setCachedModel(model: string) {
  cachedModel = model
  cacheExpiry = Date.now() + CACHE_TTL_MS

  // Detect model change and notify
  if (lastKnownModel && lastKnownModel !== model) {
    console.error(`[Model Resolver] ⚠️ MODEL CHANGED: ${lastKnownModel} → ${model}`)
    notifyModelChange(lastKnownModel, model).catch(err =>
      console.error('[Model Resolver] Failed to send notification:', err)
    )
  }
  lastKnownModel = model
}

/**
 * Send email notification when the active model changes
 */
async function notifyModelChange(oldModel: string, newModel: string) {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.warn('[Model Resolver] No RESEND_API_KEY — cannot send model change notification')
    return
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Duelly System <onboarding@resend.dev>',
        to: 'support@duelly.ai',
        subject: `⚠️ Duelly: Gemini model changed from ${oldModel} to ${newModel}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
            <h2 style="color: #00e5ff;">🔄 Gemini Model Change Detected</h2>
            <p>The Duelly platform has automatically switched Gemini models:</p>
            <table style="border-collapse: collapse; margin: 16px 0;">
              <tr>
                <td style="padding: 8px 16px; background: #fee2e2; border-radius: 4px;">
                  <strong>Previous:</strong> <code>${oldModel}</code>
                </td>
              </tr>
              <tr><td style="padding: 4px;"></td></tr>
              <tr>
                <td style="padding: 8px 16px; background: #d1fae5; border-radius: 4px;">
                  <strong>Current:</strong> <code>${newModel}</code>
                </td>
              </tr>
            </table>
            <p style="color: #666;">This usually means the previous model was deprecated by Google. 
            The system auto-discovered the best available flash-tier replacement.</p>
            <p style="color: #666;"><strong>Action needed:</strong> Check that the new model produces 
            acceptable results. If costs have changed, review Google's pricing page.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999;">Sent automatically by Duelly's model resolver at ${new Date().toISOString()}</p>
          </div>
        `,
      }),
    })

    if (res.ok) {
      console.log(`[Model Resolver] ✅ Model change notification sent: ${oldModel} → ${newModel}`)
    } else {
      console.error(`[Model Resolver] Email send failed: ${res.status}`, await res.text())
    }
  } catch (err) {
    console.error('[Model Resolver] Email send error:', err)
  }
}
