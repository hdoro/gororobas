import SectionTitle from '@/components/SectionTitle'
import SuggestionsGrid from '@/components/SuggestionsGrid'
import HistoryIcon from '@/components/icons/HistoryIcon'
import { Text } from '@/components/ui/text'
import type { ProfileContributionsData } from '@/queries'

export default function ProfileContributions({
  contributions,
  is_owner,
  name,
}: ProfileContributionsData) {
  return (
    <section className="mt-16">
      <SectionTitle Icon={HistoryIcon}>
        {is_owner ? 'Suas contribuições' : `Contribuições de ${name}`}
      </SectionTitle>
      {is_owner && contributions.length > 0 && (
        <Text level="h3" className="px-pageX font-normal">
          Muuuuuito obrigado pela força - viva a agroecologia!
        </Text>
      )}
      {contributions && contributions.length > 0 ? (
        <SuggestionsGrid
          suggestions={contributions}
          className="mt-6 px-pageX"
        />
      ) : (
        <Text level="h3" as="p" className="mt-3 px-pageX text-muted-foreground">
          {is_owner
            ? 'Você ainda não fez nenhuma contribuição'
            : `${name} ainda não fez nenhuma contribuição`}
        </Text>
      )}
    </section>
  )
}
