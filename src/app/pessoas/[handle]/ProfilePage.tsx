import NotesGrid from '@/components/NotesGrid'
import SectionTitle from '@/components/SectionTitle'
import SuggestionsGrid from '@/components/SuggestionsGrid'
import VegetablesGrid from '@/components/VegetablesGrid'
import HistoryIcon from '@/components/icons/HistoryIcon'
import NoteIcon from '@/components/icons/NoteIcon'
import RainbowIcon from '@/components/icons/RainbowIcon'
import SeedlingIcon from '@/components/icons/SeedlingIcon'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import type { ProfilePageData } from '@/queries'
import { truncate } from '@/utils/strings'
import { paths } from '@/utils/urls'
import Link from 'next/link'
import ProfilePageHeader from './ProfilePageHeader'

export default function ProfilePage({ profile }: { profile: ProfilePageData }) {
  const desiredVegetables = profile.wishlist.flatMap((userWishlist) =>
    userWishlist.status === 'QUERO_CULTIVAR' ? userWishlist.vegetable : [],
  )
  const plantedVegetables = profile.wishlist.flatMap((userWishlist) =>
    userWishlist.status === 'ESTOU_CULTIVANDO' ||
    userWishlist.status === 'JA_CULTIVEI'
      ? userWishlist.vegetable
      : [],
  )

  return (
    <main className="py-10">
      <ProfilePageHeader profile={profile} />

      {desiredVegetables.length > 0 && (
        <section className="mt-24" id="amizades">
          <SectionTitle Icon={RainbowIcon}>
            {profile.is_owner ? 'Sua listinha de desejos' : 'Quer plantar'}
          </SectionTitle>
          <VegetablesGrid
            vegetables={desiredVegetables}
            className="mt-3 px-pageX"
          />
        </section>
      )}

      {plantedVegetables.length > 0 && (
        <section className="mt-24" id="amizades">
          <SectionTitle Icon={SeedlingIcon}>
            {profile.is_owner ? 'Você planta' : `${profile.name} planta`}
          </SectionTitle>
          <VegetablesGrid
            vegetables={plantedVegetables}
            className="mt-3 px-pageX"
          />
        </section>
      )}

      {/* Only show contributions if they have any. Always show to owners. */}
      {((profile.recent_contributions &&
        profile.recent_contributions.length > 0) ||
        profile.is_owner) && (
        <section className="mt-16">
          <SectionTitle Icon={HistoryIcon}>Contribuições recentes</SectionTitle>
          {profile.recent_contributions &&
          profile.recent_contributions.length > 0 ? (
            <SuggestionsGrid
              suggestions={profile.recent_contributions}
              className="mt-6 px-pageX"
            />
          ) : (
            <Text
              level="h3"
              as="p"
              className="mt-3 px-pageX text-muted-foreground"
            >
              {profile.is_owner
                ? 'Você ainda não fez nenhuma contribuição'
                : `${profile.name} ainda não fez nenhuma contribuição`}
            </Text>
          )}
        </section>
      )}

      <section className="mt-16">
        <SectionTitle
          Icon={NoteIcon}
          CTA={
            profile.is_owner ? (
              <Button asChild>
                <Link href={paths.newNote()}>Enviar mais uma nota</Link>
              </Button>
            ) : null
          }
        >
          Notinhas que {profile.is_owner ? 'você' : truncate(profile.name, 20)}{' '}
          compartilhou
        </SectionTitle>

        {profile.note_count > profile.notes.length && (
          <Text level="h3" className="px-pageX font-normal">
            Mostrando apenas as últimas {profile.notes.length} publicadas
          </Text>
        )}
        {/* @TODO: infinite scrolling for profile's notes */}
        {profile.notes && profile.notes.length > 0 ? (
          <NotesGrid notes={profile.notes} />
        ) : (
          <Text
            level="h3"
            as="p"
            className="mt-3 px-pageX text-muted-foreground"
          >
            {profile.is_owner
              ? 'Compartilhe suas experiências e aprendizados com a comunidade'
              : `${profile.name} ainda não compartilhou nenhuma notinha`}
          </Text>
        )}
      </section>
    </main>
  )
}
