import type { JSX, PropsWithChildren, SVGProps } from 'react'
import { Text } from '@/components/ui/text'
import { cn } from '@/utils/cn'

export default function SectionTitle({
  children,
  Icon,
  CTA,
  Subtitle,
  includePadding = true,
  className,
}: PropsWithChildren<{
  Icon?: (
    props: SVGProps<SVGSVGElement> & {
      variant: 'color' | 'monochrome'
    },
  ) => JSX.Element
  CTA?: JSX.Element | null
  Subtitle?: JSX.Element | null
  includePadding?: boolean
  className?: string
}>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 xl:flex-row xl:items-center xl:gap-2.5',
        // This complicated `pl` is to align the text with the page padding, leaving the icon to the left of it
        includePadding &&
          'pl-pageX pr-pageX xl:pl-[calc(var(--page-padding-x)_-_2.625rem)]',
        className,
      )}
    >
      {Icon && <Icon variant="color" className="w-8 self-start xl:mt-1" />}
      <div>
        <Text level="h2" as="h2">
          {children}
        </Text>
        {Subtitle || null}
      </div>
      {CTA && <div className="flex-1 xl:text-right">{CTA}</div>}
    </div>
  )
}
