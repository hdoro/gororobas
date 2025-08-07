'use client'

import { ChevronDownIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { addToWishlist } from '@/actions/addToWishlist'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Text } from '@/components/ui/text'
import { useToast } from '@/components/ui/use-toast'
import type { VegetableWishlistStatus } from '@/gel.interfaces'
import { m } from '@/paraglide/messages'
import { WISHLIST_STATUS_TO_LABEL } from '@/utils/labels'
import { paths } from '@/utils/urls'

export type WishlistInfo =
  | { isSignedIn: false }
  | { isSignedIn: true; status: VegetableWishlistStatus | null }

export default function WishlistButton(
  props: {
    vegetable_id: string
  } & WishlistInfo,
) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [optimisticStatus, setOptimisticStatus] =
    useState<VegetableWishlistStatus>(
      ('status' in props && props.status) || 'QUERO_CULTIVAR',
    )

  async function updateStatus(status: VegetableWishlistStatus) {
    const prevStatus = optimisticStatus
    setOptimisticStatus(status)
    const worked = await addToWishlist(props.vegetable_id, status)
    if (!worked) {
      setOptimisticStatus(prevStatus)
      toast({
        variant: 'destructive',
        title: m.flat_key_warthog_bless(),
      })
    } else {
      toast({
        title: m.giant_witty_hyena_jump(),
      })
      router.refresh()
    }
  }

  if (props.isSignedIn === false) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <ChevronDownIcon className="mr-2 h-auto w-[1.25em]" />
            {WISHLIST_STATUS_TO_LABEL[optimisticStatus] ||
              WISHLIST_STATUS_TO_LABEL.QUERO_CULTIVAR}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogBody className="space-y-2 pt-10">
            <DialogTitle asChild>
              <Text level="h2">{m.seemly_crazy_beetle_kiss()}</Text>
            </DialogTitle>
            <Text level="p">{m.dirty_giant_cougar_ask()}</Text>
            <div className="flex items-center gap-2 pt-2">
              <Button asChild>
                <a href={paths.signInOrSignUp(pathname)}>
                  {m.equal_north_mammoth_jest()}
                </a>
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          updateStatus(optimisticStatus)
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button>
          <ChevronDownIcon className="mr-2 h-auto w-[1.25em]" />
          {WISHLIST_STATUS_TO_LABEL[optimisticStatus] ||
            WISHLIST_STATUS_TO_LABEL.QUERO_CULTIVAR}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{m.tangy_slimy_shrimp_offer()}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup
          value={optimisticStatus}
          onValueChange={(newStatus) =>
            updateStatus(newStatus as VegetableWishlistStatus)
          }
        >
          {Object.entries(WISHLIST_STATUS_TO_LABEL).map(([status, label]) => (
            <DropdownMenuRadioItem key={status} value={status}>
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
