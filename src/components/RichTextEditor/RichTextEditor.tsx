'use client'

import { CharacterCount } from '@tiptap/extensions'
import { EditorContent, type JSONContent, useEditor } from '@tiptap/react'
import { useMachine } from '@xstate/react'
import { useEffect, useId, useMemo, useRef } from 'react'
import BlocksToolbar from './BlocksToolbar'
import FormatToolbar from './FormatToolbar'
import ImageEditor from './ImageEditor'
import LinkEditor from './LinkEditor'
import MentionList from './MentionList'
import {
  type RichTextEditorThemeProps,
  richTextEditorTheme,
} from './RichTextEditor.theme'
import VideoEditor from './VideoEditor'
import { getTiptapExtensions } from './getTiptapExtensions'
import { type EditorUIProps, tiptapStateMachine } from './tiptapStateMachine'

export default function RichTextEditor(
  props: {
    placeholder: string
    maxLength?: number
    onChange: (editorState: JSONContent) => void
    editorState: JSONContent
    disabled?: boolean
    characterLimit?: number | undefined
  } & RichTextEditorThemeProps,
) {
  const classes = richTextEditorTheme(props)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const editorId = useId()

  const { placeholder, characterLimit } = props
  const extensions = useMemo(() => {
    const coreExtensions = getTiptapExtensions({
      classes,
      placeholder,
    })

    if (characterLimit) {
      coreExtensions.push(
        CharacterCount.configure({
          limit: characterLimit,
        }),
      )
    }

    return coreExtensions
  }, [placeholder, classes, characterLimit])

  const [state, send] = useMachine(tiptapStateMachine)
  const editor = useEditor({
    extensions,
    content: props.editorState,
    onUpdate: (data) => {
      props.onChange(
        Object.assign({ version: 1 }, data.editor.getJSON()) as JSONContent,
      )
      send({ type: 'UPDATE', data })
    },
    onSelectionUpdate: (data) => {
      send({ type: 'SELECTION_UPDATE', data })
    },
    onFocus: () => {
      send({ type: 'FOCUS' })
    },
    editable: props.disabled !== true,
    immediatelyRender: false,
  })

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      // Check if click target or any of its parents have our data attribute with matching ID
      const isEditorClick = target.closest(
        `[data-rich-editor-id="${editorId}"]`,
      )

      if (!isEditorClick) {
        send({ type: 'BLUR' })
      }
    }

    window.addEventListener('click', handleGlobalClick)
    return () => window.removeEventListener('click', handleGlobalClick)
  }, [editorId, send])

  // @TODO - currently accounting only for NoteForm
  const bottomOffset = 72

  const uiProps: EditorUIProps | null = editor
    ? {
        editor,
        editorId,
        send,
        bottomOffset,
      }
    : null
  return (
    <div
      ref={wrapperRef}
      data-rich-editor-id={editorId}
      tabIndex={-1}
      className={classes.root({ className: 'relative' })}
    >
      <EditorContent
        editor={editor}
        className={classes.contentEditable({ className: 'tiptap-wrapper' })}
        data-placeholder={props.placeholder}
      />
      {uiProps && state.matches('format') && <FormatToolbar {...uiProps} />}
      {uiProps && state.matches('focused') && <BlocksToolbar {...uiProps} />}
      {uiProps && state.matches('link') && <LinkEditor {...uiProps} />}
      {uiProps && state.matches('mention') && <MentionList {...uiProps} />}
      {uiProps && state.matches('video') && <VideoEditor {...uiProps} />}
      {uiProps && state.matches('image') && <ImageEditor {...uiProps} />}
    </div>
  )
}
