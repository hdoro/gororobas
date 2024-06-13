'use client'

import { createVegetableTipAction } from '@/actions/createVegetableTip'
import type { VegetablePageData } from '@/queries'
import { generateId } from '@/utils/ids'
import { gender } from '@/utils/strings'
import { paths } from '@/utils/urls'
import { MessageSquarePlus } from 'lucide-react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import Carrot from './icons/Carrot'
import SparklesIcon from './icons/SparklesIcon'
import { Button } from './ui/button'
import {
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog'
import { Text } from './ui/text'

const VegetableTipForm = dynamic(() => import('./VegetableTipForm'), {
	loading: () => (
		<div className="p-3 flex items-center justify-center gap-3">
			<Carrot className="animate-spin h-6 w-6" />
			Carregando...
		</div>
	),
})

export function SendTipDialog({ vegetable }: { vegetable: VegetablePageData }) {
	const router = useRouter()
	const pathname = usePathname()
	const [rerenderFormKey, setRerenderFormKey] = useState<null | string>(null)
	const { current_user_id } = vegetable

	// By using a key, we force the form to re-mount when the key changes
	function resetForm() {
		setRerenderFormKey(generateId())
	}

	if (!current_user_id) {
		return (
			<Dialog>
				<DialogTrigger asChild>
					<Button mode="outline">
						<MessageSquarePlus className="w-[1.25em]" /> Envie uma dica
					</Button>
				</DialogTrigger>
				<DialogContent className="max-w-lg">
					<DialogBody className="space-y-2 pt-10">
						<Text level="h2">Crie uma conta no Gororobas</Text>
						<Text level="p">
							Para enviar uma sugestão, você precisa ter uma conta. Só assim
							podemos lembrar suas escolhas sem embolar quem escolheu o quê 🤗
						</Text>
						<div className="flex items-center gap-2 pt-2">
							<Button asChild>
								<a href={paths.signup(pathname)}>Criar conta</a>
							</Button>
							<Button asChild mode="outline">
								<a href={paths.signin(pathname)}>Entrar</a>
							</Button>
						</div>
					</DialogBody>
				</DialogContent>
			</Dialog>
		)
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
					initialValue={{
						sources: [
							{
								id: generateId(),
								type: 'GOROROBAS',
								userIds: [current_user_id],
							},
						],
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
