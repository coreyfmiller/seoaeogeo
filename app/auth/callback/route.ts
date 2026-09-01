import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/ai-test'

  // Google (or Supabase) can return an OAuth error directly in the query string
  // (e.g. redirect_uri_mismatch, access_denied, provider not enabled).
  const oauthError = searchParams.get('error_description') || searchParams.get('error')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    // Surface the real reason instead of a generic 'auth' flag.
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    )
  }

  // No code came back — pass through the provider's error so it's debuggable.
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(oauthError || 'No authorization code returned. Check that the Google provider is enabled in Supabase and the redirect URI is registered in Google Cloud Console.')}`
  )
}
