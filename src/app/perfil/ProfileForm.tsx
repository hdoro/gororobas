'use client'

import UserAvatar from '@/components/UserAvatar'
import Field from '@/components/forms/Field'
import HandleInput from '@/components/forms/HandleInput'
import ImageInput from '@/components/forms/ImageInput'
import RichTextInput from '@/components/forms/RichTextInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { useToast } from '@/components/ui/use-toast'
import type { ProfilePageData } from '@/queries'
import {
	ImageDBToFormTransformer,
	ImageData,
	ProfileData,
	RichText,
	type ProfileDataInForm,
} from '@/schemas'
import { effectSchemaResolverResolver } from '@/utils/effectSchemaResolver'
import { generateId } from '@/utils/ids'
import { Schema } from '@effect/schema'
import { Either } from 'effect'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
	FormProvider,
	useForm,
	useFormContext,
	type SubmitHandler,
} from 'react-hook-form'

export default function ProfileForm({
	profile: profileInDb,
}: { profile: ProfilePageData }) {
	const photoForForm = Schema.decodeUnknownEither(ImageDBToFormTransformer)(
		profileInDb.photo,
	)
	const bioInDB = Schema.encodeUnknownEither(RichText)(profileInDb.bio)

	const form = useForm<ProfileDataInForm>({
		resolver: effectSchemaResolverResolver(ProfileData),
		criteriaMode: 'all',
		defaultValues: {
			id: profileInDb.id,
			name: profileInDb.name,
			handle: profileInDb.handle,
			location: profileInDb.location || undefined,
			photo: Either.isRight(photoForForm)
				? (photoForForm.right as any)
				: undefined,
			bio: Either.isRight(bioInDB) ? bioInDB.right : undefined,
		},
		mode: 'onBlur',
	})
	const router = useRouter()
	const toast = useToast()
	console.log({ photoForForm, inDb: profileInDb.photo })

	const onSubmit: SubmitHandler<ProfileDataInForm> = async (data, event) => {
		console.log({ data })
	}

	return (
		<main className="flex flex-wrap gap-8 px-page py-20">
			<FormProvider {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4 max-w-4xl flex-1"
				>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Modifique seu perfil</CardTitle>
							<Button type="submit">Salvar alterações</Button>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid gap-4 grid-cols-2">
								<Field
									form={form}
									name="name"
									label="Nome"
									description="O nome que você preferir que te chamem, sem formalidades"
									render={({ field }) => (
										<Input {...field} value={field.value || ''} type="text" />
									)}
								/>
								<Field
									form={form}
									name="location"
									label="Território ou localidade"
									description={'"Nômade", "Ciganx", "Terra" são válidos também'}
									render={({ field }) => (
										<Input {...field} value={field.value || ''} type="text" />
									)}
								/>
							</div>
							<div className="grid gap-4 grid-cols-2">
								<Field
									form={form}
									name="handle"
									label="Endereço do seu perfil no site"
									render={({ field }) => (
										<HandleInput field={field} path="pessoas" />
									)}
								/>
								<Field
									form={form}
									name="photo"
									label="Fotinha!"
									description="Caso queira, claro. Pode ser de vegetais que cê gosta, inclusive ✨"
									render={({ field }) => (
										<ImageInput field={field} includeMetadata={false} />
									)}
								/>
							</div>
							<Field
								form={form}
								name="bio"
								label="Curiosidades sobre você"
								render={({ field }) => (
									<RichTextInput
										field={field}
										placeholder="O que te encanta na cozinha? O que te levou à agroecologia?"
									/>
								)}
							/>
						</CardContent>
					</Card>
				</form>
				<ProfilePreview />
			</FormProvider>
		</main>
	)
}

function ProfilePreview() {
	const form = useFormContext<ProfileDataInForm>()
	const name = form.watch('name') || 'SEM NOME'
	const [fallbackTone] = useState(() =>
		name.length % 2 === 0 ? ('primary' as const) : ('secondary' as const),
	)
	const location = form.watch('location')
	const photo = form.watch('photo.data')

	return (
		<div className="sticky top-0 space-y-2 pt-6">
			{name && (
				<div>
					<Text level="h2" as="h2" className="text-lg font-bold">
						Como você vai aparecer no site:
					</Text>
				</div>
			)}
			<UserAvatar
				user={{
					name,
					location,
					photo,
				}}
				fallbackTone={fallbackTone}
				size="lg"
			/>
		</div>
	)
}
