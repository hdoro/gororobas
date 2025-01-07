'use client'

import CharacterCount from '@tiptap/extension-character-count'
import { EditorContent, type JSONContent, useEditor } from '@tiptap/react'
import { useMachine } from '@xstate/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import BlocksToolbar from './BlocksToolbar'
import FormatToolbar from './FormatToolbar'
import LinkEditor from './LinkEditor'
import MentionList from './MentionList'
import {
  type RichTextEditorThemeProps,
  richTextEditorTheme,
} from './RichTextEditor.theme'
import VideoEditor from './VideoEditor'
import { getTiptapExtensions } from './getTiptapExtensions'
import { tiptapStateMachine } from './tiptapStateMachine'

const TIME_TO_BLUR = 600 // in ms

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

  const [declareBlurredAt, setDeclareBlurredAt] = useState<number | null>(null)
  const [state, send] = useMachine(tiptapStateMachine)
  const editor = useEditor({
    extensions,
    content: props.editorState,
    onUpdate: (data) => {
      props.onChange(Object.assign({}, data.editor.getJSON(), { version: 1 }))
      send({ type: 'UPDATE', data })
    },
    onSelectionUpdate: (data) => {
      send({ type: 'SELECTION_UPDATE', data })
      setDeclareBlurredAt(null)
    },
    onFocus: () => {
      send({ type: 'FOCUS' })
      setDeclareBlurredAt(null)
    },
    editable: props.disabled !== true,
    immediatelyRender: false,
  })

  // biome-ignore lint: we don't want to re-run the effect on state.value
  useEffect(() => {
    if (!declareBlurredAt) return

    const timeout = setTimeout(() => {
      if (state.value === 'link' || state.value === 'video') {
        setDeclareBlurredAt(null)
        return
      }
      send({ type: 'BLUR' })
    }, TIME_TO_BLUR)

    return () => clearTimeout(timeout)
  }, [declareBlurredAt])

  useEffect(() => {
    if (!wrapperRef.current) return

    const wrapper = wrapperRef.current

    const handleWrapperBlur = (_event: FocusEvent) => {
      if (
        !document.activeElement ||
        !wrapper.contains(document.activeElement)
      ) {
        setDeclareBlurredAt(Date.now() + TIME_TO_BLUR)
      }
    }

    wrapper.addEventListener('focusout', handleWrapperBlur)
    return () => wrapper.removeEventListener('focusout', handleWrapperBlur)
  }, [])

  return (
    <div
      ref={wrapperRef}
      tabIndex={-1}
      className={classes.root({ className: 'relative' })}
    >
      <EditorContent
        editor={editor}
        className={classes.contentEditable({ className: 'tiptap-wrapper' })}
        data-placeholder={props.placeholder}
      />
      {editor && state.matches('format') && (
        <FormatToolbar editor={editor} send={send} />
      )}
      {editor && state.matches('focused') && (
        <BlocksToolbar editor={editor} send={send} />
      )}
      {editor && state.matches('link') && (
        <LinkEditor editor={editor} send={send} />
      )}
      {editor && state.matches('mention') && (
        <MentionList editor={editor} send={send} />
      )}
      {editor && state.matches('video') && (
        <VideoEditor editor={editor} send={send} />
      )}
    </div>
  )
}
