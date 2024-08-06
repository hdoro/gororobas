import fetchNotesIndex from '../fetchNotesIndex'

export const GET = async (request: Request) => {
  const result = await fetchNotesIndex(new URL(request.url).searchParams)

  return Response.json(result)
}
