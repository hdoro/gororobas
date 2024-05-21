import fetchVegetablesIndex from '../fetchVegetablesIndex'

export const GET = async (request: Request) => {
	const result = await fetchVegetablesIndex(new URL(request.url).searchParams)

	return Response.json(result)
}
