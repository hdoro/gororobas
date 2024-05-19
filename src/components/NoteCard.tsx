'use client'

import type { NoteCardData } from '@/queries'
import { cn } from '@/utils/cn'
import type { ElementTransform } from '@/utils/css'
import { NOTE_TYPE_TO_LABEL } from '@/utils/labels'
import { paths } from '@/utils/urls'
import { Share2Icon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import DefaultTipTapRenderer from './tiptap/DefaultTipTapRenderer'
import { Badge } from './ui/badge'

// @TODO: make button a checkbox so I can style on/off without JS
export default function NoteCard({
	note,
	transform,
	variant = 'grid',
}: {
	note: NoteCardData
	transform: ElementTransform
	variant?: 'grid' | 'page'
}) {
	const [flipped, setFlipped] = useState(false)
	const { title } = note

	const RootElement = note.body ? 'button' : 'div'
	return (
		<RootElement
			id={`nota-${note.handle}`}
			className={cn(
				'text-left note-card--root relative aspect-[1.35] h-auto',
				variant === 'page'
					? 'flex-[0_0_var(--card-width)] w-[var(--card-width)]'
					: 'flex-1 min-w-[calc(var(--card-width)_*_0.75)] max-w-[var(--card-width)]',
			)}
			type={note.body ? 'button' : undefined}
			onClick={note.body ? () => setFlipped(!flipped) : undefined}
			style={{
				perspective: '600px',
				transform: `rotate(${transform.rotate}deg) translate(${transform.x}px, ${transform.y}px)`,
				'--card-width':
					variant === 'page'
						? // Double the size in dedicated pages, but don't let overflow beyond the viewport (min)
							'min(100%, calc(var(--note-card-width) * 1.5))'
						: 'var(--note-card-width)',
			}}
		>
			<div className="note-card" data-flipped={flipped}>
				<div className="note-card--front flex flex-col relative rounded-md bg-yellow-100 border-2 border-yellow-200 shadow-sm py-2 px-3">
					<div className="note-card--content text-xl leading-relaxed order-1 flex-1 text-yellow-950 opacity-90">
						<DefaultTipTapRenderer content={title as any} />
					</div>

					<div className="mb-3 flex items-center justify-between">
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
						<div>
							{note.types.map((type) => (
								<Badge key={type} variant="note">
									{NOTE_TYPE_TO_LABEL[type]}
								</Badge>
							))}
						</div>
					</div>

					{variant === 'grid' && note.handle && (
						<Link
							href={paths.note(note.handle)}
							className="absolute left-0 bottom-0 text-yellow-600 z-50 p-2 bg-yellow-100 rounded-full"
							onClick={(e) => {
								// Prevent the card from flipping
								e.stopPropagation()
							}}
						>
							<Share2Icon className="stroke-current" />
						</Link>
					)}
				</div>
				{note.body ? (
					<div className="note-card--back rounded-md bg-amber-100 border-2 border-amber-200 shadow-sm pb-2 flex flex-col">
						<pre
							aria-hidden
							className="w-full overflow-x-hidden px-3 py-2 whitespace-nowrap flex-1 text-amber-800 text-ellipsis bg-amber-300 bg-opacity-50 rounded-t-md"
						>
							<DefaultTipTapRenderer content={title as any} />
						</pre>
						<div className="note-card--content py-3 px-4 text-amber-950 opacity-90">
							<DefaultTipTapRenderer content={note.body as any} />
						</div>
					</div>
				) : null}
			</div>
		</RootElement>
	)
}
