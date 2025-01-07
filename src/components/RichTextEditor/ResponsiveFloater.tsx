'use client'

import { useFixedBottomPosition } from '@/hooks/useFixedBottomPosition'
import useViewport from '@/hooks/useViewport'
import { cn } from '@/utils/cn'
import { arrow, autoPlacement, offset, useFloating } from '@floating-ui/react'
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

  const { refs, floatingStyles, middlewareData } = useFloating({
    middleware: [
      offset(16),
      autoPlacement({
        allowedPlacements: ['bottom', 'bottom-end', 'bottom-start'],
        padding: 16,
      }),
      arrow({ element: arrowRef }),
    ],
  })

  const { editor } = props
  useEffect(() => {
    if (editor) {
      refs.setPositionReference({
        getBoundingClientRect() {
          return getEditorDomRect(editor)
        },
      })
    }
  }, [editor, refs.setPositionReference])

  return (
    <div
      ref={refs.setFloating}
      className={cn(
        'z-10 rounded-md border bg-white p-3', // cosmetic
        props.className,
      )}
      style={floatingStyles}
      data-rich-editor-id={props.editorId}
    >
      <div
        ref={arrowRef}
        className="absolute top-0 z-10 mx-3 h-4 w-4 rounded-sm border-l bg-white"
        style={{
          left: middlewareData.arrow?.x,
          transform: 'translate(-50%, -40%) rotate(45deg)',
        }}
      />
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
