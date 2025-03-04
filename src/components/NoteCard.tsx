import type { NoteCardData } from '@/queries'
import { cn } from '@/utils/cn'
import type { ElementTransform } from '@/utils/css'
import { NOTE_TYPE_TO_LABEL } from '@/utils/labels'
import { truncate } from '@/utils/strings'
import { tiptapJSONtoPlainText } from '@/utils/tiptap'
import { paths } from '@/utils/urls'
import { Share2Icon } from 'lucide-react'
import Link from 'next/link'
import NoteCardFlipper from './NoteCardFlipper'
import ProfileCard from './ProfileCard'
import DefaultTipTapRenderer from './tiptap/DefaultTipTapRenderer'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

export default function NoteCard({
  note,
  transform,
  variant = 'grid',
}: {
  note: NoteCardData
  transform: ElementTransform
  variant?: 'grid' | 'page'
}) {
  const { title } = note

  const published_at = note.published_at
    ? new Date(note.published_at)
    : undefined
  return (
    <NoteCardFlipper
      handle={note.handle}
      hasBody={!!note.body}
      variant={variant}
      transform={transform}
    >
      <div className="note-card">
        <div className="note-card--front relative flex flex-col rounded-md border-2 border-yellow-200 bg-yellow-100 px-3 py-2 shadow-xs">
          <div className="note-card--content order-1 flex-1 leading-relaxed text-yellow-950 opacity-90 @xs:text-xl">
            <DefaultTipTapRenderer content={title as any} />
          </div>

          <div className="mb-3 flex items-center justify-between">
            {published_at && (
              <time
                dateTime={published_at.toISOString()}
                className="text-yellow-800"
              >
                {published_at.toLocaleDateString('pt-BR', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric',
                })}
              </time>
            )}
            <div className="space-x-1">
              {note.types.slice(0, 2).map((type) => (
                <Badge key={type} variant="note">
                  {NOTE_TYPE_TO_LABEL[type]}
                </Badge>
              ))}
            </div>
          </div>

          {variant === 'grid' && note.handle && (
            <div
              className={cn(
                'order-2 flex items-center',
                note.created_by?.name ? 'justify-between' : 'justify-end',
              )}
            >
              {note.created_by?.name && (
                <ProfileCard profile={note.created_by} />
              )}
              <Button
                size="sm"
                asChild
                tone="secondary"
                mode="bleed"
                className="cursor-pointer"
              >
                <Link href={paths.note(note.handle)}>
                  <span className="opacity-0 transition-opacity select-none group-hover:opacity-100">
                    Compartilhar
                  </span>
                  <Share2Icon className="stroke-current" />
                </Link>
              </Button>
            </div>
          )}
        </div>
        {note.body ? (
          <div className="note-card--back flex flex-col rounded-md border-2 border-amber-200 bg-amber-100 pb-2 shadow-xs">
            <pre
              aria-hidden
              className="bg-opacity-50 w-full flex-1 overflow-x-hidden rounded-t-md bg-amber-300 px-3 py-2 text-ellipsis whitespace-nowrap text-amber-800"
            >
              {truncate(tiptapJSONtoPlainText(note.title as any) || '', 60)}
            </pre>
            <div className="note-card--content px-4 py-3 text-amber-950 opacity-90">
              <DefaultTipTapRenderer content={note.body as any} />
            </div>
          </div>
        ) : null}
      </div>
    </NoteCardFlipper>
  )
}
