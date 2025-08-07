'use client'

import FullscreenPhotos, {
  useFullscreenPhotos,
} from '@/components/FullscreenPhotos'
import CameraIcon from '@/components/icons/CameraIcon'
import PhotoLabelAndSources from '@/components/PhotoLabelAndSources'
import { SanityImage } from '@/components/SanityImage'
import SectionTitle from '@/components/SectionTitle'
import { Text } from '@/components/ui/text'
import { m } from '@/paraglide/messages'
import type { ProfileGalleryData } from '@/queries'
import { truncate } from '@/utils/strings'

function ImageInGallery({
  image,
  index,
}: {
  image: ProfileGalleryData['images'][number]
  index: number
}) {
  const fullscreen = useFullscreenPhotos()

  return (
    <div className={'relative'}>
      <button
        type="button"
        onClickCapture={() => fullscreen.openAtIndex(index)}
        className="block aspect-square h-auto w-full rounded-lg"
      >
        <SanityImage
          image={image}
          maxWidth={400}
          className={
            'aspect-square h-auto w-full rounded-lg object-cover object-center lg:max-h-[var(--max-height)]'
          }
        />
      </button>
      <PhotoLabelAndSources photo={image} className="text-xs md:text-base" />
    </div>
  )
}

export default function ProfileGallery({
  images,
  is_owner,
  name,
}: ProfileGalleryData) {
  return (
    <FullscreenPhotos photos={images}>
      <section className="mt-16">
        <SectionTitle Icon={CameraIcon}>
          {m.simple_smart_cougar_lend({
            is_owner: is_owner.toString(),
            name: truncate(name, 25),
          })}
        </SectionTitle>

        {images && images.length > 0 ? (
          <div className="px-pageX mt-6 grid grid-cols-2 gap-x-2 gap-y-2 lg:grid-cols-3">
            {/* @TODO: infinite scrolling ao invés de puxar tudo */}
            {images.map((image, index) => (
              <ImageInGallery key={image.id} image={image} index={index} />
            ))}
          </div>
        ) : (
          <Text
            level="h3"
            as="p"
            className="px-pageX text-muted-foreground mt-3"
          >
            {m.inner_sad_sloth_pout({
              is_owner: is_owner.toString(),
              name: truncate(name, 25),
            })}
          </Text>
        )}
      </section>
    </FullscreenPhotos>
  )
}
