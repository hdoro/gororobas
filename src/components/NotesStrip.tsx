import type { NoteCardData } from '@/queries'
import { cn } from '@/utils/cn'
import type { PropsWithChildren } from 'react'
import NoteCard from './NoteCard'

export default function NotesStrip(
  props: PropsWithChildren<{
    notes: NoteCardData[]
    className?: string
  }>,
) {
  return (
    <div className={cn('flex w-auto justify-start gap-9', props.className)}>
      {props.notes.map((note) => (
        <NoteCard key={note.handle} note={note} />
      ))}
    </div>
  )
}
