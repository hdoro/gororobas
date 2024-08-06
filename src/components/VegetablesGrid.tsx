import type { VegetableCardData } from '@/queries'
import { cn } from '@/utils/cn'
import type {
  DetailedHTMLProps,
  HTMLAttributes,
  PropsWithChildren,
} from 'react'
import VegetableCard from './VegetableCard'

export function VegetablesGridWrapper(
  props: PropsWithChildren<
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
  >,
) {
  return (
    <div
      {...props}
      className={cn('grid gap-9', props.className)}
      style={{
        ...(props.style || {}),
        gridTemplateColumns:
          'repeat(auto-fit, minmax(calc(var(--vegetable-card-width) * 0.75), var(--vegetable-card-width)))',
      }}
    >
      {props.children}
    </div>
  )
}

export default function VegetablesGrid({
  vegetables,
  ...props
}: { vegetables: VegetableCardData[] } & DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>) {
  if (!vegetables || vegetables.length === 0) return null

  return (
    <VegetablesGridWrapper {...props}>
      {vegetables.map((vegetable) => (
        <VegetableCard key={vegetable.handle} vegetable={vegetable} />
      ))}
    </VegetablesGridWrapper>
  )
}
