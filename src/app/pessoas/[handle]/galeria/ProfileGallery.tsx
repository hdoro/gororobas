'use client'

import FullscreenPhotos, {
  useFullscreenPhotos,
} from '@/components/FullscreenPhotos'
import PhotoLabelAndSources from '@/components/PhotoLabelAndSources'
import { SanityImage } from '@/components/SanityImage'
import SectionTitle from '@/components/SectionTitle'
import CameraIcon from '@/components/icons/CameraIcon'
import { Text } from '@/components/ui/text'
import type { ProfileGalleryData } from '@/queries'

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
          Fotos {is_owner ? 'que você enviou' : `de ${name}`}
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
            {is_owner
              ? 'Você ainda não fez nenhuma contribuição'
              : `${name} ainda não fez nenhuma contribuição`}
          </Text>
        )}
      </section>
    </FullscreenPhotos>
  )
}
