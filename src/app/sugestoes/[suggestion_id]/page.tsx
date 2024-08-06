import { getEditSuggestionData } from '@/actions/getEditSuggestionData'
import { runServerEffect } from '@/services/runtime'
import { gender } from '@/utils/strings'
import { Effect } from 'effect'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SuggestionPage from './SuggestionPage'

type RouteParams = {
  suggestion_id: string
}

async function getRouteData(params: RouteParams) {
  return runServerEffect(
    getEditSuggestionData(params.suggestion_id).pipe(
      Effect.catchAll(() => Effect.succeed(null)),
    ),
  )
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams
}): Promise<Metadata> {
  const data = await getRouteData(params)
  if (!data?.target_object?.names) return {}

  return {
    title: `Sugestão de edição d${gender.suffix(data.toRender.gender || 'NEUTRO')} ${data.toRender.names[0]} | Gororobas`,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function EditSuggestionRoute({
  params,
}: {
  params: RouteParams
}) {
  const data = await getRouteData(params)

  if (!data || !data.target_object) return notFound()

  return <SuggestionPage data={data} />
}
