import type {
  DetailedHTMLProps,
  HTMLAttributes,
  PropsWithChildren,
} from 'react'
import type { VegetableCardData } from '@/queries'
import { cn } from '@/utils/cn'
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
          'repeat(auto-fill, minmax(calc(var(--vegetable-card-width) * 0.75), 1fr))',
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
