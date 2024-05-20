import NoteCard from '@/components/NoteCard'
import UserAvatar from '@/components/UserAvatar'
import TipTapRenderer from '@/components/tiptap/DefaultTipTapRenderer'
import { Text } from '@/components/ui/text'
import type { NotePageData } from '@/queries'
import { getRandomTransform } from '@/utils/css'

export default function NotePage({ note }: { note: NotePageData }) {
	return (
		<main className="px-pageX py-10 h-full flex flex-wrap justify-center items-start gap-20">
			<NoteCard
				note={note}
				transform={getRandomTransform([-3, 3], [0, 0], [0, 0])}
				variant="page"
			/>
			{note.created_by && (
				<div className="mt-10">
					<Text level="h2" as="h2" className="mb-2">
						Enviada por:
					</Text>
					<UserAvatar size="md" user={note.created_by} />
					{note.created_by.bio ? (
						<div className="mt-8">
							<Text level="h3" as="h3">
								Sobre {note.created_by.name}
							</Text>
							<TipTapRenderer content={note.created_by.bio} />
						</div>
					) : null}
				</div>
			)}
		</main>
	)
}
