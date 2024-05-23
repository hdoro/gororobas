import type { NoteCardData } from '@/queries'
import { cn } from '@/utils/cn'
import { getNoteCardTransform } from '@/utils/css'
import type {
	DetailedHTMLProps,
	HTMLAttributes,
	PropsWithChildren,
} from 'react'
import NoteCard from './NoteCard'

export function NotesGridWrapper(
	props: PropsWithChildren<
		DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
	>,
) {
	return (
		<div
			{...props}
			className={cn('py-10 grid gap-12 overflow-x-hidden', props.className)}
			style={{
				...(props.style || {}),
				gridTemplateColumns:
					'repeat(auto-fit, minmax(calc(var(--note-card-width) * 0.75), 1fr))',
			}}
		>
			{props.children}
		</div>
	)
}

export default function NotesGrid(props: { notes: NoteCardData[] }) {
	if (!props.notes || props.notes.length === 0) return null

	return (
		<NotesGridWrapper className="px-pageX">
			{props.notes.map((note) => (
				<NoteCard
					key={note.handle}
					note={note}
					transform={getNoteCardTransform()}
				/>
			))}
		</NotesGridWrapper>
	)
}
