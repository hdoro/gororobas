import Link from '@/components/LinkWithTransition'
import NotesGrid from '@/components/NotesGrid'
import ProfileCard from '@/components/ProfileCard'
import SectionTitle from '@/components/SectionTitle'
import VegetablesGrid from '@/components/VegetablesGrid'
import NoteIcon from '@/components/icons/NoteIcon'
import SeedlingIcon from '@/components/icons/SeedlingIcon'
import TipTapRenderer from '@/components/tiptap/DefaultTipTapRenderer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Text, textVariants } from '@/components/ui/text'
import { m } from '@/paraglide/messages'
import type { NotePageData } from '@/queries'
import type { TiptapNode } from '@/types'
import { NOTE_TYPE_TO_LABEL } from '@/utils/labels'
import { paths } from '@/utils/urls'
import { EditIcon } from 'lucide-react'
import { Fragment } from 'react'
import DeleteNoteButton from './DeleteNoteButton'

export default async function NotePage({ note }: { note: NotePageData }) {
  const title = note.title as TiptapNode
  if (!title) return

  const titleAsHeading =
    title.content && title.content.length > 0
      ? {
          ...title,
          content: title.content.map((node) => ({
            ...node,
            type: 'heading',
            attrs: {
              ...(node.attrs || {}),
              level: 1,
            },
          })),
        }
      : title

  return (
    <main className="py-10">
      <div className="px-pageX flex flex-col items-start gap-10 lg:flex-row lg:justify-center xl:gap-20">
        <Card className="max-w-full space-y-3 lg:max-w-2xl lg:flex-5">
          <CardHeader className={'flex flex-col-reverse gap-2'}>
            <div className={textVariants({ level: 'h1' })}>
              <TipTapRenderer content={titleAsHeading} />
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="space-x-1">
                {note.types.map((type) => (
                  <Badge key={type} variant="note">
                    {NOTE_TYPE_TO_LABEL[type]}
                  </Badge>
                ))}
              </div>
              <time
                dateTime={note.published_at.toISOString()}
                className="text-yellow-800"
              >
                {note.published_at.toLocaleDateString('pt-BR', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric',
                })}
              </time>
              {note.is_owner && (
                <div className="flex flex-1 items-center justify-end gap-3">
                  <DeleteNoteButton noteId={note.id} />
                  <Button mode="outline" tone="neutral" size="xs" asChild>
                    <Link href={paths.editNote(note.handle)}>
                      <EditIcon className="w-[1.25em]" />
                      {m.edit()}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          {note.body ? (
            <CardContent
              className={textVariants({
                level: 'h3',
                className: 'space-y-[0.5em] overflow-x-hidden font-normal',
              })}
            >
              <TipTapRenderer content={note.body as TiptapNode} />
            </CardContent>
          ) : null}
        </Card>

        {note.created_by?.name && (
          <div className="lg:flex-1">
            <Text level="h2" as="h2" className="mb-2">
              {m.best_quaint_seal_edit()}
            </Text>
            <ProfileCard size="md" profile={note.created_by} />
            {note.created_by.bio ? (
              <div className="mt-8">
                <Text level="h3" as="h3">
                  {m.game_wacky_warthog_pet({ name: note.created_by.name })}
                </Text>
                <TipTapRenderer content={note.created_by.bio} />
              </div>
            ) : null}
          </div>
        )}
      </div>
      {note.related_to_vegetables.length > 0 && (
        <section className="my-36" id="vegetais">
          <SectionTitle Icon={SeedlingIcon}>
            {m.zany_zany_moose_grow()}
          </SectionTitle>
          <VegetablesGrid
            vegetables={note.related_to_vegetables}
            className="px-pageX mt-4"
          />
        </section>
      )}
      {note.related_notes.length > 0 && (
        <section className="my-36" id="notas">
          <SectionTitle
            Icon={NoteIcon}
            CTA={
              note.related_notes.length > 0 ? (
                <Button asChild>
                  <Link href={paths.newNote()}>{m.send_note_cta()}</Link>
                </Button>
              ) : null
            }
          >
            {m.related_notes()}
          </SectionTitle>
          {note.related_notes.length > 0 ? (
            <NotesGrid notes={note.related_notes} />
          ) : (
            <Text level="p" className="px-pageX">
              {(() => {
                const parts = m.proof_that_cockroach_link().split(/(%LINK%)/g)
                return (
                  <>
                    {parts.map((part, index) => {
                      if (part === '%LINK%') {
                        // Skip the %LINK% markers themselves
                        return null
                      }

                      // Determine if the part should be wrapped in a Link
                      const isLink = index > 0 && parts[index - 1] === '%LINK%'
                      if (isLink) {
                        return (
                          <Link
                            key={part}
                            href={paths.newNote()}
                            className="link"
                          >
                            {part}
                          </Link>
                        )
                      }

                      return <Fragment key={part}>{part}</Fragment>
                    })}
                  </>
                )
              })()}
            </Text>
          )}
        </section>
      )}
    </main>
  )
}
