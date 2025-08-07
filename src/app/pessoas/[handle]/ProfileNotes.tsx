import NoteIcon from '@/components/icons/NoteIcon'
import Link from '@/components/LinkWithTransition'
import NotesGrid from '@/components/NotesGrid'
import SectionTitle from '@/components/SectionTitle'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { m } from '@/paraglide/messages'
import type { ProfileNotesData } from '@/queries'
import { truncate } from '@/utils/strings'
import { paths } from '@/utils/urls'

export default function ProfileNotes({
  notes,
  is_owner,
  note_count,
  name,
}: ProfileNotesData) {
  return (
    <section className="mt-16">
      <SectionTitle
        Icon={NoteIcon}
        CTA={
          is_owner ? (
            <Button asChild>
              <Link href={paths.newNote()}>
                {m.great_heroic_butterfly_buy()}
              </Link>
            </Button>
          ) : null
        }
      >
        {m.tasty_vivid_jan_bless({
          is_owner: is_owner.toString(),
          name: truncate(name, 25),
        })}
      </SectionTitle>

      {note_count > notes.length && (
        <Text level="h3" className="px-pageX font-normal">
          {m.maroon_spry_wombat_flop({ note_count: notes.length })}
        </Text>
      )}
      {/* @TODO: infinite scrolling for profile's notes */}
      {notes && notes.length > 0 ? (
        <NotesGrid notes={notes} />
      ) : (
        <Text level="h3" as="p" className="px-pageX text-muted-foreground mt-3">
          {m.bright_agent_finch_thrive({
            is_owner: is_owner.toString(),
            name: truncate(name, 25),
          })}
        </Text>
      )}
    </section>
  )
}
