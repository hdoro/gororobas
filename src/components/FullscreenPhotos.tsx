'use client'

import PhotoLabelAndSources from '@/components/PhotoLabelAndSources'
import { SanityImage } from '@/components/SanityImage'
import { Dialog, DialogBody, DialogContent } from '@/components/ui/dialog'
import type { ImageForRenderingData } from '@/queries'
import { cn } from '@/utils/cn'
import {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

type Context = {
  currentIndex: number
  setCurrentIndex: Dispatch<SetStateAction<number>>
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  openAtIndex: (index: number) => void
}

const FullscreenPhotosContext = createContext<Context>({
  currentIndex: 0,
  setCurrentIndex: () => {},
  isOpen: false,
  setIsOpen: () => {},
  openAtIndex: () => {},
})

export const useFullscreenPhotos = () => useContext(FullscreenPhotosContext)

function FullscreenPhotosInner({
  photos,
}: {
  photos: ImageForRenderingData[]
}) {
  const { currentIndex, isOpen, setCurrentIndex, setIsOpen } = useContext(
    FullscreenPhotosContext,
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      if (event.key === 'ArrowRight') {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length)
      } else if (event.key === 'ArrowLeft') {
        setCurrentIndex(
          (prevIndex) => (prevIndex - 1 + photos.length) % photos.length,
        )
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    } else {
      window.removeEventListener('keydown', handleKeyDown)
    }

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, photos.length, setCurrentIndex])

  if (!photos.length) return null

  const activePhoto = photos[currentIndex]
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="block! h-screen max-h-[95dvh] w-screen max-w-[95dvw] py-2">
        <DialogBody className="grid h-full grid-rows-[1fr_max-content] gap-2 overflow-hidden px-0 pb-0">
          {activePhoto && (
            <>
              <SanityImage
                image={activePhoto}
                maxWidth="100vw"
                className={'size-full object-contain object-center'}
              />
              <PhotoLabelAndSources
                photo={activePhoto}
                className="bottom-auto top-4"
              />
            </>
          )}

          {photos.length > 1 && (
            <div className="space-x-1 overflow-x-auto overflow-y-visible text-center">
              {photos.map((photo, idx) => {
                const isActive = idx === currentIndex
                return (
                  <button
                    key={photo.id}
                    className={cn(
                      'inline-block size-[3.125rem] overflow-hidden rounded-sm transition-all duration-200 hover:scale-[102%]',
                      !isActive && 'grayscale-[80%]',
                    )}
                    onClick={() => setCurrentIndex(idx)}
                    type="button"
                  >
                    <SanityImage
                      image={photo}
                      maxWidth={50}
                      className="size-full object-cover"
                    />
                  </button>
                )
              })}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

export default function FullscreenPhotos(
  props: PropsWithChildren<{
    photos: ImageForRenderingData[]
  }>,
) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const openAtIndex = useCallback((index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }, [])

  return (
    <FullscreenPhotosContext.Provider
      value={{
        currentIndex,
        setCurrentIndex,
        isOpen,
        setIsOpen,
        openAtIndex,
      }}
    >
      {props.children}
      <FullscreenPhotosInner photos={props.photos} />
    </FullscreenPhotosContext.Provider>
  )
}
