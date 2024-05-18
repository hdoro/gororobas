import Footer from '@/components/Footer'
import { Toaster } from '@/components/ui/toaster'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import HeaderNav from '@/components/HeaderNav'
import { cn } from '@/utils/cn'

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
	title: '[EdgeDB Hackathon] Gororobas',
	description: 'Generated with the EdgeDB + EdgeDB Auth + Next.js Template',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="pt-BR">
			<body className={cn(fontFamily.className, 'flex flex-col min-h-dvh')}>
				<HeaderNav />
				<div className="flex-1">{children}</div>
				<Footer />
				<Toaster />
			</body>
		</html>
	)
}
