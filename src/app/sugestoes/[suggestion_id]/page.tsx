import { getEditSuggestionData } from '@/actions/getEditSuggestionData'
import { m } from '@/paraglide/messages'
import { runServerEffect } from '@/services/runtime'
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

export async function generateMetadata(props: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const params = await props.params
  const data = await getRouteData(params)
  if (!data?.target_object?.names) return {}

  return {
    title: m.warm_bold_cat_slide({ name: data.toRender.names[0] }),
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function EditSuggestionRoute(props: {
  params: Promise<RouteParams>
}) {
  const params = await props.params
  const data = await getRouteData(params)

  if (!data || !data.target_object) return notFound()

  return <SuggestionPage data={data} />
}
