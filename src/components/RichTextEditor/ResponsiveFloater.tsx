'use client'

import { useFixedBottomPosition } from '@/hooks/useFixedBottomPosition'
import useViewport from '@/hooks/useViewport'
import { cn } from '@/utils/cn'
import { autoPlacement, offset, useFloating } from '@floating-ui/react'
import { type PropsWithChildren, useEffect, useRef } from 'react'
import type { EditorUIProps } from './tiptapStateMachine'
import { getEditorDomRect } from './tiptapUtils'

type Props = PropsWithChildren<
  Omit<EditorUIProps, 'send'> & {
    className?: string
  }
>

function MobileFloater(props: Props) {
  const position = useFixedBottomPosition(props.bottomOffset)

  return (
    <div
      className={cn(
        position.className,
        'rounded-t-md border-t bg-white p-3',
        props.className,
      )}
      style={position.styles}
      data-rich-editor-id={props.editorId}
    >
      {props.children}
    </div>
  )
}

function DesktopFloater(props: Props) {
  const arrowRef = useRef<HTMLDivElement>(null)

  const { refs, floatingStyles } = useFloating({
    middleware: [
      offset(16),
      autoPlacement({
        allowedPlacements: [
          'bottom',
          'bottom-end',
          'bottom-start',
          'top',
          'top-end',
          'top-start',
        ],
        padding: 16,
      }),
    ],
  })

  const { editor } = props
  useEffect(() => {
    if (!editor) return

    const reference = {
      getBoundingClientRect() {
        return getEditorDomRect(editor)
      },
    }
    refs.setPositionReference(reference)

    // Force update on selection changes
    const updateOnSelectionChange = () => {
      refs.setPositionReference({ ...reference })
    }
    editor.on('selectionUpdate', updateOnSelectionChange)

    return () => {
      editor.off('selectionUpdate', updateOnSelectionChange)
    }
  }, [editor, refs.setPositionReference])

  return (
    <div
      ref={refs.setFloating}
      className={cn(
        'z-10 rounded-md border bg-white p-3 shadow-sm',
        props.className,
      )}
      style={floatingStyles}
      data-rich-editor-id={props.editorId}
    >
      {props.children}
    </div>
  )
}

const ResponsiveFloater = (props: Props) => {
  const viewport = useViewport()

  if (viewport.viewport.width >= 768) {
    return <DesktopFloater {...props} />
  }

  return <MobileFloater {...props} />
}

export default ResponsiveFloater
