'use client'

import { OverflowNode } from '@lexical/overflow'
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin'
import {
	type InitialConfigType,
	LexicalComposer,
} from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import type { EditorState } from 'lexical'
import * as React from 'react'
import FloatingToolbarPlugin from './FloatingToolbarPlugin'
import {
	type RichTextEditorThemeVariants,
	richTextEditorTheme,
} from './RichTextEditor.theme'

const editorConfig: InitialConfigType = {
	namespace: 'notas',
	nodes: [],
	// Handling of errors during update
	onError(error: Error) {
		throw error
	},
}

function OnChangePlugin({
	onChange,
}: {
	onChange: (editorState: EditorState) => void
}) {
	const [editor] = useLexicalComposerContext()
	React.useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			onChange(editorState)
		})
	}, [editor, onChange])
	return null
}

export default function RichTextEditor(
	props: {
		placeholder: string
		maxLength?: number
		onChange: (editorState: EditorState) => void
		editorState: EditorState
	} & RichTextEditorThemeVariants,
) {
	const { editorState, onChange } = props
	const classes = richTextEditorTheme(props)
	const [floatingAnchorElem, setFloatingAnchorElem] =
		React.useState<HTMLDivElement | null>(null)
	const [isLinkEditMode, setIsLinkEditMode] = React.useState(false)

	const onRef = (_floatingAnchorElem: HTMLDivElement) => {
		if (_floatingAnchorElem !== null) {
			setFloatingAnchorElem(_floatingAnchorElem)
		}
	}

	console.log({ editorState, json: editorState?.toJSON() })

	return (
		<LexicalComposer
			initialConfig={{
				...editorConfig,
				nodes: typeof props.maxLength === 'number' ? [OverflowNode] : [],
				theme: {
					characterLimit: 'bg-red-200',

					text: {
						bold: classes.lexicalBold(),
						italic: classes.lexicalItalic(),
						strikethrough: classes.lexicalStrikethrough(),
					},
				},
			}}
		>
			<div className="relative">
				{floatingAnchorElem && (
					<FloatingToolbarPlugin
						anchorElem={floatingAnchorElem}
						setIsLinkEditMode={setIsLinkEditMode}
					/>
				)}
				{typeof props.maxLength === 'number' && (
					<CharacterLimitPlugin
						charset={'UTF-16'}
						maxLength={props.maxLength}
						renderer={({ remainingCharacters }) => {
							if (
								remainingCharacters > 0 ||
								typeof props.maxLength !== 'number'
							)
								return <></>

							return (
								<div className="absolute right-0 bottom-0 translate-y-full text-sm">
									<span className="text-red-800 font-medium">
										{props.maxLength - remainingCharacters}
									</span>{' '}
									/ {props.maxLength}
								</div>
							)
						}}
					/>
				)}
				<div className={classes.root()}>
					<RichTextPlugin
						contentEditable={
							<div className={classes.contentEditableRoot()} ref={onRef}>
								<ContentEditable className={classes.contentEditable()} />
							</div>
						}
						placeholder={
							<div className={classes.placeholder()}>{props.placeholder}</div>
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>
				</div>
				<HistoryPlugin />

				<OnChangePlugin onChange={onChange} />
			</div>
		</LexicalComposer>
	)
}
