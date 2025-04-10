import { ContributionCTA } from '@/components/ContributionCTA'
import ResourceCard, { FullResourceDisplay } from '@/components/ResourceCard'
import SectionTitle from '@/components/SectionTitle'
import BulbIcon from '@/components/icons/BulbIcon'
import { Button } from '@/components/ui/button'
import { m } from '@/paraglide/messages'
import type { ResourceCardData, ResourcePageData } from '@/queries'
import { paths } from '@/utils/urls'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'

export default function ResourcePage({
  resource,
}: {
  resource: ResourcePageData
}) {
  return (
    <main className="px-page-x py-12">
      <FullResourceDisplay resource={resource} placement="standalone" />
      {resource.related_resources.length > 0 && (
        <section className="my-36" id="relacionados">
          <SectionTitle Icon={BulbIcon} includePadding={false}>
            {m.royal_least_dog_pop()}
          </SectionTitle>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {resource.related_resources.map((related_resource) => (
              <ResourceCard
                key={related_resource.id}
                resource={related_resource as ResourceCardData}
              />
            ))}
          </div>
        </section>
      )}
      <ContributionCTA
        customCTA={
          <Button asChild>
            <Link href={paths.newResource()}>
              <PlusCircleIcon className="w-[1.25em]" />
              {m.east_spry_mare_race()}
            </Link>
          </Button>
        }
      />
    </main>
  )
}
