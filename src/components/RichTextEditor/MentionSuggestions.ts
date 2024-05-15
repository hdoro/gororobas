'use client'

import { findUsersToMention } from '@/actions/findUsersToMention'
import type { UsersToMentionData } from '@/queries'
import { ReactRenderer } from '@tiptap/react'
import type { SuggestionOptions } from '@tiptap/suggestion'
import type { ComponentProps } from 'react'
import tippy, { type Instance as TippyInstance } from 'tippy.js'
import MentionList from './MentionList'

const MentionSuggestions: Omit<
	SuggestionOptions<UsersToMentionData[number]>,
	'editor'
> = {
	items: async ({ query }) => {
		const result = await findUsersToMention(query)

		// @TODO: how to do error handling?
		if ('error' in result) return []

		return result
	},

	render: () => {
		let component: ReactRenderer<unknown, ComponentProps<typeof MentionList>>
		let popup: TippyInstance[]

		return {
			onStart: (props) => {
				component = new ReactRenderer(MentionList, {
					props,
					editor: props.editor,
				})

				if (!props.clientRect) {
					return
				}

				// @ts-expect-error
				popup = tippy('body', {
					getReferenceClientRect: props.clientRect,
					appendTo: () => document.body,
					content: component.element,
					showOnCreate: true,
					interactive: true,
					trigger: 'manual',
					placement: 'bottom-start',
				})
			},

			onUpdate(props) {
				component.updateProps(props)

				if (!props.clientRect) {
					return
				}

				popup?.[0]?.setProps({
					// @ts-expect-error
					getReferenceClientRect: props.clientRect,
				})
			},

			onKeyDown(props) {
				if (props.event.key === 'Escape') {
					popup?.[0]?.hide()

					return true
				}

				// @ts-expect-error
				return component?.ref?.onKeyDown(props)
			},

			onExit() {
				popup?.[0]?.destroy()
				component.destroy()
			},
		}
	},
}

export default MentionSuggestions
