import {
  type MiddlewareConfig,
  type NextMiddleware,
  NextResponse,
} from 'next/server'
import { paraglideMiddleware } from './paraglide/server'

export const middleware: NextMiddleware = (request) => {
  return paraglideMiddleware(request, ({ request: modified, locale }) => {
    modified.headers.set('x-gororobas-locale', locale)
    return NextResponse.rewrite(modified.url, modified)
  })
}

export const config: MiddlewareConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg, sitemap.xml, robots.txt, opensearch.xml (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|icon.svg|opensearch.xml|robots.txt).*)',
  ],
}
