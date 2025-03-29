import fetchResourcesIndex from '../fetchResourcesIndex'

export const GET = async (request: Request) => {
  const result = await fetchResourcesIndex(new URL(request.url).searchParams)

  return Response.json(result)
}
