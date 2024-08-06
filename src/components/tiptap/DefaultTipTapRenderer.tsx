import type { RichText } from '@/schemas'
import type { TiptapNode } from '@/types'
import { TipTapRender } from './TipTapRender'
import { tiptapNodeHandlers } from './tiptapNodeHandlers'

export default function DefaultTipTapRenderer({
  content,
}: {
  content: typeof RichText.Type | unknown
}) {
  return (
    <TipTapRender handlers={tiptapNodeHandlers} node={content as TiptapNode} />
  )
}
