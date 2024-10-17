'use client'

import { addToWishlist } from '@/actions/addToWishlist'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
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
import type { VegetableWishlistStatus } from '@/edgedb.interfaces'
import { WISHLIST_STATUS_TO_LABEL } from '@/utils/labels'
import { paths } from '@/utils/urls'
import { ChevronDownIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

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
        title: 'Erro ao atualizar seu interesse',
      })
    } else {
      toast({
        title: 'Interesse atualizado!',
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
            <Text level="h2">Crie uma conta no Gororobas</Text>
            <Text level="p">
              Para salvar sua listinha de plantas você precisa ter uma conta. Só
              assim podemos lembrar suas escolhas sem embolar quem escolheu o
              quê 🤗
            </Text>
            <div className="flex items-center gap-2 pt-2">
              <Button asChild>
                <a href={paths.signInOrSignUp(pathname)}>
                  Entrar ou criar conta
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
        <DropdownMenuLabel>Qual seu interesse nesta planta?</DropdownMenuLabel>
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
