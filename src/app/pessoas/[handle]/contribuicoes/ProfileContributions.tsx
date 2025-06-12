import SectionTitle from '@/components/SectionTitle'
import SuggestionsGrid from '@/components/SuggestionsGrid'
import HistoryIcon from '@/components/icons/HistoryIcon'
import { Text } from '@/components/ui/text'
import { m } from '@/paraglide/messages'
import type { ProfileContributionsData } from '@/queries'
import { truncate } from '@/utils/strings'

export default function ProfileContributions({
  contributions,
  is_owner,
  name,
}: ProfileContributionsData) {
  return (
    <section className="mt-16">
      <SectionTitle Icon={HistoryIcon}>
        {m.busy_red_weasel_pause({
          is_owner: is_owner.toString(),
          name: truncate(name, 25),
        })}
      </SectionTitle>
      {is_owner && contributions.length > 0 && (
        <Text level="h3" className="px-pageX font-normal">
          {m.flat_same_sloth_succeed()}
        </Text>
      )}
      {contributions && contributions.length > 0 ? (
        <SuggestionsGrid
          suggestions={contributions}
          className="px-pageX mt-6"
        />
      ) : (
        <Text level="h3" as="p" className="px-pageX text-muted-foreground mt-3">
          {m.inner_sad_sloth_pout({
            is_owner: is_owner.toString(),
            name: truncate(name, 25),
          })}
        </Text>
      )}
    </section>
  )
}
