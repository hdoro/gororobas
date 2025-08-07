import { NextResponse } from 'next/server'
import { cookieName, isLocale, localizeHref } from '@/paraglide/runtime'
import { LOCALE_HEADER_KEY } from '@/utils/i18n'
import { configureRequestLocale } from '@/utils/i18n.server'

export async function GET(request: Request): Promise<Response> {
  const currentLocale = await configureRequestLocale(request)
  const newLocale = new URL(request.url).searchParams.get('locale')
  const targetLocale = isLocale(newLocale) ? newLocale : currentLocale

  const origin = request.headers.get('origin') || request.headers.get('referer')
  const targetUrl = localizeHref(origin || '/', { locale: targetLocale })

  const response = NextResponse.redirect(targetUrl, 307)
  response.headers.set(LOCALE_HEADER_KEY, targetLocale)
  response.cookies.set(cookieName, targetLocale)
  console.log(
    `[select-locale] from ${currentLocale} to ${newLocale}, redirecting from ${origin} to ${targetUrl}`,
  )

  return response
}
