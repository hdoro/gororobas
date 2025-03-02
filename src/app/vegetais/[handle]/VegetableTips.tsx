import VegetableTipCard from '@/components/VegetableTipCard'
import { Text } from '@/components/ui/text'
import type { TipSubject } from '@/edgedb.interfaces'
import type { VegetablePageData, VegetableTipCardData } from '@/queries'
import { cn } from '@/utils/cn'
import { TIP_SUBJECT_TO_LABEL } from '@/utils/labels'

export default function VegetableTips({
  tips = [],
  vegetable,
}: {
  tips?: VegetableTipCardData[]
  vegetable: VegetablePageData
}) {
  if (!Array.isArray(tips) || tips.length === 0) return null

  return (
    <div className="px-pageX box-content">
      {Object.entries(TIP_SUBJECT_TO_LABEL).map(
        ([subject, label], idx, arr) => {
          const subjectTips = tips.filter((tip) =>
            tip.subjects.includes(subject as TipSubject),
          )

          if (subjectTips.length === 0) return null

          return (
            <div
              key={subject}
              className={cn(
                'mt-10 flex flex-wrap gap-10 pb-10',
                idx + 1 < arr.length && 'border-b-secondary-50 border-b-2',
              )}
            >
              <Text
                weight="semibold"
                level="h3"
                className="w-[12.5rem] shrink-0"
              >
                {label}
              </Text>
              <div className="flex-1 space-y-4">
                {subjectTips.map((tip) => (
                  <VegetableTipCard
                    key={tip.handle}
                    tip={tip}
                    vegetable={vegetable}
                  />
                ))}
              </div>
            </div>
          )
        },
      )}
    </div>
  )
}
