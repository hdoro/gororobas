'use client'

import type { UsersToMentionData } from '@/queries'
import { forwardRef, useImperativeHandle, useState } from 'react'
import { Button } from '../ui/button'

export default forwardRef<
	unknown,
	{
		items: UsersToMentionData
		command: (p: UsersToMentionData[number] & { label: string }) => void
	}
>((props, ref) => {
	const [selectedIndex, setSelectedIndex] = useState(0)

	const selectItem = (index: number) => {
		const item = props.items[index]

		if (item) {
			props.command({ ...item, label: item.name })
		}
	}

	const upHandler = () => {
		setSelectedIndex(
			(selectedIndex + props.items.length - 1) % props.items.length,
		)
	}

	const downHandler = () => {
		setSelectedIndex((selectedIndex + 1) % props.items.length)
	}

	const enterHandler = () => {
		selectItem(selectedIndex)
	}

	useImperativeHandle(ref, () => ({
		onKeyDown: ({ event }: { event: KeyboardEvent }) => {
			if (event.key === 'ArrowUp') {
				upHandler()
				return true
			}

			if (event.key === 'ArrowDown') {
				downHandler()
				return true
			}

			if (event.key === 'Enter') {
				enterHandler()
				return true
			}

			return false
		},
	}))

	return (
		<div className="p-2 shadow-md rounded-md bg-white border flex flex-col">
			{props.items.length ? (
				props.items.map((item, index) => (
					<Button
						key={item.id}
						variant={index === selectedIndex ? 'outline' : 'ghost'}
						onClick={() => selectItem(index)}
						type="button"
						size="sm"
						className="!justify-start"
					>
						{item.name}
					</Button>
				))
			) : (
				<div className="text-sm text-muted-foreground">
					Nenhuma pessoa encontrada
				</div>
			)}
		</div>
	)
})
