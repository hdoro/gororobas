import { type NextMiddleware, NextResponse } from 'next/server'
import { getBrowserPreferredLocale, getCurrentLocaleCookie } from './utils/i18n'

export const middleware: NextMiddleware = (request) => {
  // If a valid locale already in cookie, proceed with the request
  if (getCurrentLocaleCookie(request.cookies)) {
    return NextResponse.next()
  }

  // Else parse the preferred language and store it in cookie
  const browserPreferredLocale = getBrowserPreferredLocale(request)
  const response = NextResponse.next()
  response.cookies.set('gororobas--locale', browserPreferredLocale)

  return response
}

export const config = {
  matcher: [
    // only run on root (/) URL
    '/',
  ],
}
