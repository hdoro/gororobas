'use client'

import { useDeviceType } from '@/hooks/useDeviceType'
import useViewport from '@/hooks/useViewport'
import { cn } from '@/utils/cn'
import { arrow, autoPlacement, offset, useFloating } from '@floating-ui/react'
import type { Editor } from '@tiptap/react'
import { type PropsWithChildren, useEffect, useRef } from 'react'
import { getEditorDomRect } from './tiptapUtils'

type Props = PropsWithChildren<{
  className?: string
  editor: Editor
  editorId: string
}>

function MobileFloater(props: Props) {
  const viewport = useViewport()

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 w-full origin-bottom-left', // position
        'rounded-t-md border-t bg-white p-3', // cosmetic
        props.className,
      )}
      style={{
        transform: `translateY(-${Math.round(
          viewport.window.height -
            (viewport.visualViewport?.height || 0) -
            viewport.visualViewport.offsetTop,
        )}px)`,
      }}
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
  const device = useDeviceType()

  if (device === 'desktop') {
    return <DesktopFloater {...props} />
  }

  return <MobileFloater {...props} />
}

export default ResponsiveFloater
