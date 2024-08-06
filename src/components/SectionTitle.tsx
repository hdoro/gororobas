import { Text } from '@/components/ui/text'
import { cn } from '@/utils/cn'
import type { PropsWithChildren, SVGProps } from 'react'

export default function SectionTitle({
  children,
  Icon,
  CTA,
  includePadding = true,
  className,
}: PropsWithChildren<{
  Icon?: (
    props: SVGProps<SVGSVGElement> & {
      variant: 'color' | 'monochrome'
    },
  ) => JSX.Element
  CTA?: JSX.Element | null
  includePadding?: boolean
  className?: string
}>) {
  return (
    <Text
      level="h2"
      as="h2"
      className={cn(
        'flex flex-col gap-1 xl:flex-row xl:items-center xl:gap-2.5',
        // This complicated `pl` is to align the text with the page padding, leaving the icon to the left of it
        includePadding &&
          'pl-pageX pr-pageX xl:pl-[calc(var(--page-padding-x)_-_2.625rem)]',
        className,
      )}
    >
      {Icon && <Icon variant="color" className="w-8" />}
      {children}
      {CTA && <div className="flex-1 xl:text-right">{CTA}</div>}
    </Text>
  )
}
