'use client'

import { addToWishlist } from '@/actions/addToWishlist'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import type { VegetableWishlistStatus } from '@/edgedb.interfaces'
import { WISHLIST_STATUS_TO_LABEL } from '@/utils/labels'
import { ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'

export default function WishlistButton(props: {
	vegetable_id: string
	status: VegetableWishlistStatus | null
}) {
	const { toast } = useToast()
	const [optimisticStatus, setOptimisticStatus] =
		useState<VegetableWishlistStatus>(props.status || 'QUERO_CULTIVAR')
	console.log({ optimisticStatus, props })

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
		}
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
					<ChevronDownIcon className="mr-2 w-[1.25em] h-auto" />
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
