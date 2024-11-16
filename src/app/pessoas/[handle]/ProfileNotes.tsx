import NotesGrid from '@/components/NotesGrid'
import SectionTitle from '@/components/SectionTitle'
import NoteIcon from '@/components/icons/NoteIcon'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import type { ProfileNotesData } from '@/queries'
import { truncate } from '@/utils/strings'
import { paths } from '@/utils/urls'
import Link from 'next/link'

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
              <Link href={paths.newNote()}>Enviar mais uma nota</Link>
            </Button>
          ) : null
        }
      >
        Notinhas que {is_owner ? 'você' : truncate(name, 20)} compartilhou
      </SectionTitle>

      {note_count > notes.length && (
        <Text level="h3" className="px-pageX font-normal">
          Mostrando apenas {notes.length} notas aleatórias
        </Text>
      )}
      {/* @TODO: infinite scrolling for profile's notes */}
      {notes && notes.length > 0 ? (
        <NotesGrid notes={notes} />
      ) : (
        <Text level="h3" as="p" className="mt-3 px-pageX text-muted-foreground">
          {is_owner
            ? 'Compartilhe suas experiências e aprendizados com a comunidade'
            : `${name} ainda não compartilhou nenhuma notinha`}
        </Text>
      )}
    </section>
  )
}
