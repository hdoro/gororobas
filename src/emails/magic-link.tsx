import type { Locale } from '@/utils/i18n'
import { Button, Heading, Section, Text } from '@react-email/components'
import EmailLayout from './email-layout'

const CONTENT_BY_LOCALE = {
  pt: {
    preview: 'Entrar no Gororobas',
    heading: 'Boas vindas ao Gororobas!',
    preface:
      'O Gororobas sonha ser um território digital de encontro entre arquipélagos dos seres em transição agroecológica, compartilhando conhecimento territorializado sobre plantar, cozinhar e compartilhar o alimento, o cuidado, a luta, e a terra. Um espaço para encantar e esperançar como um verbo, mobilizando a ação.',
    confirm: '🥕 Entrar na sua conta',
    featuresTitle: 'O que você pode fazer no Gororobas:',
    features: [
      '🌱 Salvar vegetais que quer plantar, já plantou ou está cultivando',
      '📝 Escrever e compartilhar notinhas sobre seus aprendizados na cozinha e na terra',
      '💬 Contribuir com melhores informações sobre vegetais e envie suas dicas e recomendações',
      '📚 Contribuir para a biblioteca de recursos sobre agroecologia e agrofloresta, salvando suas reflexões sobre cada conteúdo',
    ],
  },
  es: {
    preview: 'Iniciar sesión en Gororobas',
    heading: 'Bienvenido a Gororobas!',
    preface:
      'Gororobas es un territorio digital de encuentro entre arquipélagos de seres en transición agroecológica, compartiendo conocimiento territorializado sobre plantar, cocinar y compartir el alimento, el cuidado, la lucha, y la tierra. Un espacio para encantar y esperar como un verbo, mobilizando la acción.',
    confirm: '🥕 Entrar en tu cuenta',
    featuresTitle: 'Qué puedes hacer en Gororobas:',
    features: [
      '🌱 Guardar vegetales que quieras plantar, ya plantados o cultivando',
      '📝 Escribir y compartir notas sobre tus aprendizajes en la cocina y la tierra',
      '💬 Contribuir con mejores información sobre vegetales y envíe sus consejos y recomendaciones',
      '📚 Contribuir para la biblioteca de recursos sobre agroecología y agrofloresta, guardando sus reflexiones sobre cada contenido',
    ],
  },
} as const satisfies Record<Locale, unknown>

export default function MagicLinkEmail({
  magic_link_url,
}: {
  magic_link_url: string
}) {
  const locale = 'pt'
  const content = CONTENT_BY_LOCALE[locale]
  return (
    <EmailLayout preview="Entrar no Gororobas">
      <Heading className="mb-[16px] text-center text-[24px] font-bold text-green-800">
        {content.heading}
      </Heading>

      <Text className="mb-[24px] text-[16px] text-stone-700">
        {content.preface}
      </Text>

      <Section className="relative mb-[32px] text-center">
        <Section className="rounded-[16px] border-[1px] border-green-200 bg-green-50 px-[16px] py-[32px]">
          <Button
            className="box-border rounded-[24px] border-[2px] border-green-600 bg-green-700 px-[32px] py-[14px] text-center font-bold text-white no-underline shadow-md"
            href={magic_link_url}
          >
            {content.confirm}
          </Button>
        </Section>
      </Section>

      <Heading className="mb-[16px] text-[18px] font-bold text-green-700">
        {content.featuresTitle}
      </Heading>

      <Section className="mb-[24px]">
        {/* Simple feature list without backgrounds */}
        {content.features.map((feature) => (
          <Text key={feature} className="mb-[16px] text-[16px] text-stone-700">
            {feature}
          </Text>
        ))}
      </Section>
    </EmailLayout>
  )
}
