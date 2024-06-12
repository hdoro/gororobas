'use client'

import { createVegetableTipAction } from '@/actions/createVegetableTip'
import type { VegetablePageData } from '@/queries'
import { generateId } from '@/utils/ids'
import { gender } from '@/utils/strings'
import { MessageSquarePlus } from 'lucide-react'
import { useState } from 'react'
import { VegetableTipForm } from './VegetableTipForm'
import SparklesIcon from './icons/SparklesIcon'
import { Button } from './ui/button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog'
import { Text } from './ui/text'

export function SendTipDialog({ vegetable }: { vegetable: VegetablePageData }) {
	const [rerenderFormKey, setRerenderFormKey] = useState<null | string>(null)

	// By using a key, we force the form to re-mount when the key changes
	function resetForm() {
		setRerenderFormKey(generateId())
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button mode="outline">
					<MessageSquarePlus className="w-[1.25em]" /> Envie uma dica
				</Button>
			</DialogTrigger>
			<DialogContent hasClose={false}>
				<DialogHeader>
					<DialogTitle>
						Enviar uma dica sobre{' '}
						{gender.preposition(vegetable.gender || 'NEUTRO')}{' '}
						{vegetable.names[0]}
					</DialogTitle>
				</DialogHeader>
				<VegetableTipForm
					key={rerenderFormKey}
					onSubmit={async (data) => {
						return await createVegetableTipAction({
							tip: data,
							vegetable_id: vegetable.id,
						})
					}}
					succesState={
						<div>
							<section className="py-pageY px-pageX text-center md:max-w-lg mx-auto box-content">
								<SparklesIcon
									variant="color"
									className="w-12 inline-block mb-3"
								/>
								<Text level="h2" as="h2">
									Recebemos sua dica!
								</Text>
								<Text>
									Você pode enviar quantas quiser e contribuir/aprender com a
									página de outros vegetais também, fica a vontade {':)'}
								</Text>
								<div className="flex justify-center wrap gap-2 mt-4">
									<DialogClose asChild>
										<Button mode="outline" tone="neutral">
											Continuar navegando
										</Button>
									</DialogClose>
									<Button mode="outline" tone="primary" onClick={resetForm}>
										Enviar outra dica
									</Button>
								</div>
							</section>
						</div>
					}
				/>
			</DialogContent>
		</Dialog>
	)
}
