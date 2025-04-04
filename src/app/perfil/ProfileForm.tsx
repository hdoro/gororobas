'use client'

import { updateProfileAction } from '@/actions/updateProfile'
import ProfileCard from '@/components/ProfileCard'
import Field from '@/components/forms/Field'
import HandleInput from '@/components/forms/HandleInput'
import ImageInput from '@/components/forms/ImageInput'
import RichTextInput from '@/components/forms/RichTextInput'
import TwoColumnFields from '@/components/forms/TwoColumnFields'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { useToast } from '@/components/ui/use-toast'
import type { EditProfilePageData } from '@/queries'
import {
  ImageInForm,
  ProfileData,
  type ProfileDataInForm,
  ProfileDataWithImage,
  RichText,
} from '@/schemas'
import { UnkownActionError } from '@/types/errors'
import { getChangedObjectSubset } from '@/utils/diffs'
import { generateId } from '@/utils/ids'
import { paths } from '@/utils/urls'
import { useFormWithSchema } from '@/utils/useFormWithSchema'
import { Effect, Either, Schema, pipe } from 'effect'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  FormProvider,
  type SubmitHandler,
  useFormContext,
} from 'react-hook-form'

export default function ProfileForm({
  profile: profileInDb,
}: {
  profile: EditProfilePageData
}) {
  const router = useRouter()
  const toast = useToast()
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle')

  const initialValue = useMemo(() => {
    const bioInDB = Schema.encodeUnknownEither(RichText)(profileInDb.bio)

    return {
      id: profileInDb.id,
      name: profileInDb.name,
      handle: profileInDb.handle,
      location: profileInDb.location || undefined,
      photo: profileInDb.photo || { id: generateId() },
      bio: Either.isRight(bioInDB) ? bioInDB.right : undefined,
    } as ProfileDataInForm
  }, [profileInDb])

  const form = useFormWithSchema({
    schema: Schema.encodedBoundSchema(ProfileData),
    defaultValues: initialValue,
    disabled: status === 'submitting',
  })

  const onSubmit: SubmitHandler<ProfileDataInForm> = async (data, event) => {
    const dataThatChanged = getChangedObjectSubset({
      prev: initialValue,
      next: data,
    })
    if (Object.keys(dataThatChanged).length === 0) {
      toast.toast({
        variant: 'default',
        title: 'Tudo certo, nada foi alterado',
      })
    }

    setStatus('submitting')
    const program = pipe(
      Schema.decode(ProfileDataWithImage)({
        ...dataThatChanged,
        photo: Schema.is(ImageInForm)(dataThatChanged.photo)
          ? dataThatChanged.photo
          : undefined,
        id: initialValue.id,
      }),
      Effect.tap((decoded) => {
        if (decoded.photo) {
          // Before proceeding with the profile update, save the uploaded photo to the form in case we need to re-send it on errors
          form.setValue('photo', decoded.photo)
        }
      }),
      Effect.flatMap((dataToUpdate) =>
        Effect.tryPromise({
          try: () => updateProfileAction(dataToUpdate),
          catch: (error) => new UnkownActionError(error),
        }),
      ),
      Effect.catchTags({
        ParseError: () =>
          Effect.succeed({ error: 'failed-uploading-images' } as const),
        UnkownAction: () => Effect.succeed({ error: 'unknown-error' } as const),
      }),
    )
    const result = await Effect.runPromise(program)
    if (result === true) {
      toast.toast({
        variant: 'default',
        title: 'Perfil editado com sucesso ✨',
        description: 'Te enviando pra sua página...',
      })
      router.push(`${paths.userProfile(data.handle)}?atualizado`)
    } else {
      toast.toast({
        variant: 'destructive',
        title: 'Erro ao editar',
        description: 'Por favor, tente novamente.',
      })
      setStatus('idle')
    }
  }

  return (
    <main className="px-pageX py-pageY flex flex-col gap-8 md:flex-row">
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-4xl flex-1 space-y-4"
          aria-disabled={form.formState.disabled}
        >
          <Card>
            <CardHeader className="flex flex-row! flex-wrap items-center justify-between">
              <CardTitle>Modifique seu perfil</CardTitle>
              <Button type="submit" disabled={form.formState.disabled}>
                Salvar alterações
              </Button>
            </CardHeader>
            <CardContent className="@container space-y-6">
              <TwoColumnFields>
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
                  render={({ field }) => (
                    <Input {...field} value={field.value || ''} type="text" />
                  )}
                />
              </TwoColumnFields>
              <TwoColumnFields>
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
                  name="bio"
                  label="Curiosidades sobre você"
                  render={({ field }) => (
                    <RichTextInput
                      field={field}
                      placeholder="O que quiser falar! Por exemplo: o que te encanta na cozinha? O que te levou à agroecologia?"
                    />
                  )}
                />
              </TwoColumnFields>
              <Field
                form={form}
                name="photo"
                label="Fotinha!"
                description="Caso queira, claro. Pode ser de vegetais que cê gosta, inclusive ✨"
                render={({ field }) => (
                  <ImageInput field={field} includeMetadata={false} />
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
  const photo = form.watch('photo')

  return (
    <div className="sticky top-0 space-y-2 pt-6">
      {name && (
        <div>
          <Text level="h2" as="h2" className="text-lg font-bold">
            Como vai aparecer no site:
          </Text>
        </div>
      )}
      <ProfileCard
        profile={{
          name,
          location,
          photo,
        }}
        fallbackTone={fallbackTone}
        size="md"
      />
    </div>
  )
}
