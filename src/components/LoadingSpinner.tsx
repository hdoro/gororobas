import type { DetailedHTMLProps, HTMLAttributes } from 'react'
import { m } from '@/paraglide/messages'
import { cn } from '@/utils/cn'
import Carrot from './icons/Carrot'

export default function LoadingSpinner({
  showLabel = true,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  showLabel?: boolean
}) {
  return (
    <div
      {...props}
      className={cn(
        'flex items-center justify-center gap-3 py-10',
        props.className,
      )}
    >
      <Carrot className="size-[1.5em] flex-[0_0_1.5em] animate-spin" />
      <span className={!showLabel ? 'sr-only' : ''}>
        {m.real_ago_yak_adore()}...
      </span>
    </div>
  )
}
