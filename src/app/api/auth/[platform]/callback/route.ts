import { NextResponse } from 'next/server'
import { handleAccountOAuthCallback, isPlatformId } from '@/server/accounts/accounts.service'

export async function GET(request: Request, context: RouteContext<'/api/auth/[platform]/callback'>) {
  const { platform } = await context.params
  const callbackUrl = new URL(request.url)

  try {
    if (!isPlatformId(platform)) {
      return NextResponse.redirect(new URL('/accounts?error=unknown_platform', request.url))
    }

    const code = callbackUrl.searchParams.get('code')
    const state = callbackUrl.searchParams.get('state')

    if (!code) {
      return NextResponse.redirect(new URL('/accounts?error=missing_code', request.url))
    }

    await handleAccountOAuthCallback({
      platformId: platform,
      code,
      state,
      requestUrl: request.url,
    })

    return NextResponse.redirect(new URL(`/accounts?success=${platform}`, request.url))
  } catch {
    return NextResponse.redirect(new URL(`/accounts?error=auth_failed&platform=${platform}`, request.url))
  }
}
