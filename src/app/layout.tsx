import { Toaster } from '@/components/ui/toaster'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: '[EdgeDB Hackathon] Gororobas',
	description: 'Generated with the EdgeDB + EdgeDB Auth + Next.js Template',
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="pt-BR">
			<body className={inter.className}>
				{children}
				<Toaster />
			</body>
		</html>
	)
}
