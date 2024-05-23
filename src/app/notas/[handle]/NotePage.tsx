import ProfileCard from '@/components/ProfileCard'
import TipTapRenderer from '@/components/tiptap/DefaultTipTapRenderer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Text, textVariants } from '@/components/ui/text'
import type { NotePageData } from '@/queries'
import type { TiptapNode } from '@/types'
import { NOTE_TYPE_TO_LABEL } from '@/utils/labels'
import { paths } from '@/utils/urls'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import DeleteNoteButton from './DeleteNoteButton'

export default function NotePage({ note }: { note: NotePageData }) {
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
		<main className="px-pageX py-10 h-full flex flex-col items-start gap-10 md:flex-row md:justify-center lg:gap-20">
			<Card className="space-y-3 max-w-full md:flex-[5] md:max-w-2xl">
				<CardHeader className={'flex flex-col-reverse gap-2'}>
					<div className={textVariants({ level: 'h1' })}>
						<TipTapRenderer content={titleAsHeading} />
					</div>
					<div className="mb-3 flex flex-wrap items-center gap-3">
						<div>
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
							<div className="flex-1 flex items-center justify-end gap-3">
								<DeleteNoteButton noteId={note.id} />
								<Button mode="outline" tone="primary" size="xs" asChild>
									<Link href={paths.newNote()}>
										<PlusIcon className="w-[1.25em]" />
										Nova nota
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
							className: 'font-normal overflow-x-hidden',
						})}
					>
						<TipTapRenderer content={note.body as TiptapNode} />
					</CardContent>
				) : null}
			</Card>

			{note.created_by && (
				<div>
					<Text level="h2" as="h2" className="mb-2">
						Enviada por:
					</Text>
					<ProfileCard size="md" profile={note.created_by} />
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
