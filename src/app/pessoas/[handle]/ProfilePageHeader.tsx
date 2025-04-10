'use client'

import Link from '@/components/LinkWithTransition'
import { ProfilePhoto } from '@/components/ProfileCard'
import RainbowIcon from '@/components/icons/RainbowIcon'
import SeedlingIcon from '@/components/icons/SeedlingIcon'
import TipTapRenderer from '@/components/tiptap/DefaultTipTapRenderer'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import type { ProfileLayoutData } from '@/queries'
import { paths } from '@/utils/urls'
import { Edit2Icon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { VegetablesInWishlist } from './VegetablesInWishlist'

export default function ProfilePageHeader({
  profile,
}: {
  profile: ProfileLayoutData
}) {
  const [headerVisible, setHeaderVisible] = useState(true)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const headerEl = headerRef.current
    if (!headerEl) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeaderVisible(entry.isIntersecting)
      },
      {
        threshold: [0, 1],
        rootMargin: '-1px 0px 0px 0px',
      },
    )

    observer.observe(headerEl)

    return () => {
      observer.unobserve(headerEl)
    }
  }, [])

  return (
    <>
      <div ref={headerRef}>
        <div className="px-pageX flex flex-wrap items-start gap-6">
          <ProfilePhoto profile={profile} size="lg" />

          <div className="self-center">
            <div className="flex flex-wrap items-center gap-5">
              <Text level="h1" as="h1">
                {profile.name}
              </Text>
              {profile.is_owner && (
                <div className="flex items-center gap-3">
                  <Button size="sm" asChild>
                    <Link href={paths.editProfile()}>
                      <Edit2Icon className="w-[1.25em]" />
                      Editar perfil
                    </Link>
                  </Button>
                  <Button size="sm" asChild tone="secondary" mode="outline">
                    <Link href={paths.signout()} prefetch={false}>
                      Sair ou trocar conta
                    </Link>
                  </Button>
                </div>
              )}
            </div>
            <Text level="h3" as="p" className="mt-1">
              {profile.location}
            </Text>

            {profile.bio ? (
              <Text className="mt-2 box-content max-w-md" as="div">
                <h2 className="sr-only">Sobre {profile.name}</h2>
                <TipTapRenderer content={profile.bio} />
              </Text>
            ) : null}

            {(profile.planted.length > 0 || profile.desired.length > 0) && (
              <div className="mt-6 flex flex-wrap items-start gap-8">
                {profile.planted.length > 0 && (
                  <VegetablesInWishlist
                    list={profile.planted}
                    title="Planta (ou já plantou):"
                    Icon={RainbowIcon}
                    count={profile.planted_count}
                  />
                )}
                {profile.desired.length > 0 && (
                  <VegetablesInWishlist
                    list={profile.desired}
                    title="Quer plantar:"
                    Icon={SeedlingIcon}
                    count={profile.desired_count}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {!headerVisible && (
        <div
          aria-hidden
          className="animate-in fixed inset-x-0 top-0 z-50 border-b bg-white py-1"
        >
          <div className="px-pageX flex items-center gap-4">
            <ProfilePhoto profile={profile} size="sm" />
            <div className="-space-y-1">
              <Text level="h3" as="p">
                {profile.name}
              </Text>
              <Text level="p" as="p">
                {profile.location}
              </Text>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
