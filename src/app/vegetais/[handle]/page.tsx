import { auth } from '@/edgedb'
import { vegetablePageQuery } from '@/queries'
import { notFound } from 'next/navigation'
import VegetablePage from './VegetablePage'

export default async function VegetableRoute({
	params: { handle },
}: {
	params: { handle: string }
}) {
	const session = auth.getSession()

	// console.time('vegetablePageQuery')
	const vegetable = await vegetablePageQuery.run(session.client, { handle })
	// console.timeEnd('vegetablePageQuery')

	if (!vegetable) return notFound()

	return <VegetablePage vegetable={vegetable} />
}
