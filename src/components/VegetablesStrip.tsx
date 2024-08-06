import type { VegetableCardData } from '@/queries'
import type { PropsWithChildren } from 'react'
import VegetableCard from './VegetableCard'

export default function VegetablesStrip(
  props: PropsWithChildren<{
    vegetables: VegetableCardData[]
    offset?: boolean
  }>,
) {
  return (
    <div className="vegetables-strip--wrapper flex justify-center">
      <div className="hide-scrollbar vegetables-strip flex w-auto justify-center gap-9 overflow-visible">
        {props.vegetables.map((vegetable) => (
          <VegetableCard
            key={vegetable.handle}
            vegetable={vegetable}
            fixedWidth
          />
        ))}
      </div>
    </div>
  )
}
