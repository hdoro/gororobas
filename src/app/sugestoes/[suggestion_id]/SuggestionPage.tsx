import type { EditSuggestionData } from '@/actions/getEditSuggestionData'
import {
  VegetablePageHero,
  type VegetablePageHeroData,
} from '@/app/vegetais/[handle]/VegetablePageHero'
import ChangeIndicator from '@/components/ChangeIndicator'
import ProfileCard from '@/components/ProfileCard'
import SectionTitle from '@/components/SectionTitle'
import VegetableVarietyCard from '@/components/VegetableVarietyCard'
import VegetablesGrid from '@/components/VegetablesGrid'
import BulbIcon from '@/components/icons/BulbIcon'
import RainbowIcon from '@/components/icons/RainbowIcon'
import VegetableFriendsIcon from '@/components/icons/VegetableFriendsIcon'
import DefaultTipTapRenderer from '@/components/tiptap/DefaultTipTapRenderer'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { auth } from '@/gel'
import type { EditSuggestionStatus } from '@/gel.interfaces'
import { m } from '@/paraglide/messages'
import { type VegetableCardData, vegetableCardsByIdQuery } from '@/queries'
import {
  EDIT_SUGGESTION_STATUS_TO_LABEL,
  VEGETABLE_FIELD_LABELS_MAP,
} from '@/utils/labels'
import { gender } from '@/utils/strings'
import { paths } from '@/utils/urls'
import JudgeSuggestion from './JudgeSuggestion'

const STATUS_BADGE_MAP: Record<
  EditSuggestionStatus,
  Exclude<BadgeProps['variant'], undefined>
> = {
  PENDING_REVIEW: 'outline',
  MERGED: 'default',
  REJECTED: 'note',
}

export default async function SuggestionPage({
  data,
}: {
  data: EditSuggestionData
}) {
  const { dataThatChanged, toRender, diff } = data
  const friends = dataThatChanged.friends
    ? await vegetableCardsByIdQuery.run((await auth.getSession()).client, {
        vegetable_ids: dataThatChanged.friends,
      })
    : ([] as VegetableCardData[])

  return (
    <div className="px-pageX py-pageY flex flex-col items-start gap-6 lg:flex-row">
      <div className="top-2 flex-1 lg:sticky">
        <VegetablePageHero
          // @ts-expect-error data is not perfectly the same, but it renders™
          vegetable={{ ...data.target_object, ...toRender }}
          diffKeys={
            diff.flatMap((d) => d.key) as (keyof VegetablePageHeroData)[]
          }
        />
        {dataThatChanged.content && (
          <section className="my-36" id="curiosidades">
            <SectionTitle Icon={BulbIcon} includePadding={false}>
              Sobre {gender.article(toRender.gender || 'NEUTRO', 'both')}
              {toRender.names[0]}
            </SectionTitle>
            <div className="relative mt-5 box-content space-y-3 pl-[2.625rem] text-base">
              <ChangeIndicator />
              <DefaultTipTapRenderer content={toRender.content} />
            </div>
          </section>
        )}
        {dataThatChanged.varieties && (
          <section className="my-36" id="variedades">
            <SectionTitle Icon={RainbowIcon} includePadding={false}>
              {m.large_neat_octopus_aim()}
            </SectionTitle>

            <div className="relative mt-3 flex flex-wrap gap-20 pl-[2.625rem]">
              <ChangeIndicator />
              {(toRender.varieties || []).map((variety) => (
                // @ts-expect-error data is not perfectly the same, but it renders™
                <VegetableVarietyCard key={variety.handle} variety={variety} />
              ))}
            </div>
          </section>
        )}
        {friends.length > 0 && (
          <section className="my-36" id="amizades">
            <SectionTitle Icon={VegetableFriendsIcon} includePadding={false}>
              Amigues d{gender.suffix(toRender.gender || 'NEUTRO')}{' '}
              {toRender.names[0]}
            </SectionTitle>
            <Text level="h3" className="pl-[2.625rem] font-normal">
              Plantas que gostam de serem plantadas e estarem próximas a
              {gender.suffix(toRender.gender || 'NEUTRO')} {toRender.names[0]}
            </Text>
            <div className="relative pl-[2.625rem]">
              <ChangeIndicator />
              <VegetablesGrid vegetables={friends} className="mt-6" />
            </div>
          </section>
        )}
      </div>
      <Card className="top-2 max-w-md flex-1 lg:sticky">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant={STATUS_BADGE_MAP[data.status]}>
              Status:{' '}
              {EDIT_SUGGESTION_STATUS_TO_LABEL[data.status].toLowerCase()}
            </Badge>
            {data.created_at && (
              <Text level="sm" className="text-muted-foreground">
                {data.created_at.toLocaleDateString('pt-BR', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric',
                })}
              </Text>
            )}
          </div>
          <CardTitle>
            Sugestões para{' '}
            {gender.article(data.target_object.gender || 'NEUTRO')}{' '}
            <a
              href={paths.vegetable(data.target_object.handle)}
              className="link"
              // biome-ignore lint: same-site link
              target="_blank"
            >
              {data.target_object.names[0] || 'vegetal'}
            </a>
          </CardTitle>
          <div className="flex items-center gap-3">
            {data.created_by?.name && (
              <>
                <Text level="sm">Enviadas por:</Text>
                <ProfileCard profile={data.created_by} size="sm" />
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="border-t pt-4 md:pt-6">
          <ul className="space-y-3">
            {diff.map((change, i) => {
              // Only render the last change for each key
              if (diff.slice(i + 1).some((c) => c.key === change.key)) {
                return null
              }

              return (
                <li key={change.key}>
                  <span className="font-medium">
                    {VEGETABLE_FIELD_LABELS_MAP[
                      change.key as keyof typeof VEGETABLE_FIELD_LABELS_MAP
                    ] || change.key}
                    :{' '}
                  </span>
                  <span className="text-muted-foreground">
                    {change.changes
                      ? `${change.changes.length} ${
                          change.changes.length > 1 ? 'alterações' : 'alteração'
                        }`
                      : 'alterado'}
                  </span>
                </li>
              )
            })}
          </ul>
        </CardContent>
        {data.can_approve && data.status === 'PENDING_REVIEW' && (
          <CardFooter className="mt-2 grid grid-cols-2 gap-3 border-t">
            <JudgeSuggestion suggestion_id={data.id} />
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
