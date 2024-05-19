import type { NoteCardData } from '@/queries'
import { getRandomTransform } from '@/utils/css'
import NoteCard from './NoteCard'

export default function NotesGrid(props: { notes: NoteCardData[] }) {
	if (!props.notes || props.notes.length === 0) return null

	return (
		<div
			className="px-pageX py-10 grid gap-12"
			style={{
				gridTemplateColumns:
					'repeat(auto-fit, minmax(calc(var(--note-card-width) * 0.75), 1fr))',
			}}
		>
			{props.notes.map((note) => (
				<NoteCard
					key={note.handle}
					note={note}
					transform={getRandomTransform([-3, 3], [-7.5, 7.5], [-7.5, 7.5])}
				/>
			))}
		</div>
	)
}
