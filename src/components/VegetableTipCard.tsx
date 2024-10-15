import type { VegetablePageData, VegetableTipCardData } from '@/queries'
import { isRenderableRichText } from '@/utils/tiptap'
import React from 'react'
import { EditTipDialog } from './EditTipDialog'
import ProfileCard from './ProfileCard'
import DefaultTipTapRenderer from './tiptap/DefaultTipTapRenderer'
import { Text } from './ui/text'

export default function VegetableTipCard({
  tip,
  vegetable,
}: {
  tip: VegetableTipCardData
  vegetable: VegetablePageData
}) {
  if (!isRenderableRichText(tip.content)) return null

  // Put user profiles last for visual balance
  const orderedSources = (tip.sources || []).sort((a, b) => {
    if (a.type === 'GOROROBAS' && b.type !== 'GOROROBAS') return 1
    if (a.type !== 'GOROROBAS' && b.type === 'GOROROBAS') return -1
    return 0
  })

  const { current_user_id, current_user_role } = vegetable
  const isByCurrentUser =
    !!current_user_id &&
    orderedSources.some(
      (source) =>
        source.type === 'GOROROBAS' &&
        source.users.some((user) => user.id === current_user_id),
    )
  const canEdit =
    isByCurrentUser ||
    current_user_role === 'ADMIN' ||
    current_user_role === 'MODERATOR'

  return (
    <div
      key={tip.handle}
      className="relative rounded-lg border-2 bg-background-card px-4 py-3 text-xl"
    >
      <DefaultTipTapRenderer content={tip.content} />
      {orderedSources.length > 0 && (
        <div className="mt-2 flex items-start gap-2">
          <Text className="pt-0.5 text-muted-foreground" level="sm">
            Fonte{orderedSources.length > 1 ? 's' : ''}{' '}
          </Text>
          <div className="space-y-3 text-base">
            {orderedSources.map((source) => {
              if (source.type === 'GOROROBAS') {
                return (
                  <React.Fragment key={source.id}>
                    {source.users.map((u) => (
                      <ProfileCard
                        profile={{ ...u, location: undefined }}
                        key={u.id}
                      />
                    ))}
                  </React.Fragment>
                )
              }
              if (source.origin && URL.canParse(source.origin)) {
                return (
                  <a
                    key={source.id}
                    href={source.origin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    {source.credits}
                  </a>
                )
              }
              return (
                <React.Fragment key={source.id}>
                  {source.credits}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      )}
      {canEdit && <EditTipDialog vegetable={vegetable} tip={tip} />}
    </div>
  )
}
