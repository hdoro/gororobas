import Footer from '@/components/Footer'
import HeaderNav from '@/components/HeaderNav'
import { RouteTransitionProvider } from '@/components/LinkWithTransition'
import MobileBottomBar from '@/components/MobileBottomBar'
import TanstackQueryProvider from '@/components/TanstackQueryProvider'
import { Toaster } from '@/components/ui/toaster'
import { auth } from '@/gel'
import { getLocale } from '@/paraglide/runtime'
import { cn } from '@/utils/cn'
import { configureServerLocale } from '@/utils/i18n.server'
import { pathToAbsUrl } from '@/utils/urls'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { LocaleInjection } from './LocaleInjection'

const fontFamily = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'auto',
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Open Sans',
    'Helvetica Neue',
    'sans-serif',
  ],
})

export const metadata: Metadata = {
  title: 'Gororobas',
  description:
    'Aprendendo juntes a fazer agroecologia - Por terra, território, e gororobas!',
  applicationName: 'Gororobas Agroecologia',
  openGraph: {
    images: [
      {
        url: pathToAbsUrl('/default-og.png'),
        width: 1200,
        height: 630,
        alt: 'Fotos de vegetais com o título: Por terra, território, e gororobas',
      },
      {
        url: pathToAbsUrl('/default-og-whatsapp.png'),
        width: 600,
        height: 600,
        alt: 'Fotos de vegetais com o título: Por terra, território, e gororobas',
      },
    ],
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await configureServerLocale()
  const session = await auth.getSession()
  const signedIn = await session.isSignedIn()

  return (
    <html lang={getLocale()}>
      <head>
        <link
          rel="search"
          type="application/opensearchdescription+xml"
          title="Gororobas"
          href="/opensearch.xml"
        />
      </head>
      <body className={cn(fontFamily.className, 'flex min-h-dvh flex-col')}>
        <LocaleInjection locale={locale} />
        <TanstackQueryProvider>
          <RouteTransitionProvider>
            <HeaderNav signedIn={signedIn} />
            <MobileBottomBar signedIn={signedIn} />
            <div className="flex-1">{children}</div>
            <Footer />
            <Toaster />
          </RouteTransitionProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  )
}
