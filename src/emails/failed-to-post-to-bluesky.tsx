import { Button, Heading, Section, Text } from '@react-email/components'
import EmailLayout from './email-layout'

export default function FailedToPostToBlueskyEmail(props: {
  errorDetails: string
}) {
  return (
    <EmailLayout preview="O bot do Gororobas não conseguiu postar ao Bluesky">
      <Heading className="mb-[16px] text-[24px] font-bold text-red-800">
        Falha na tarefa automatizada
      </Heading>

      <Text className="mb-[24px] text-[16px] text-gray-700">
        A tarefa diária automatizada de postagem no Bluesky falhou em sua
        execução <strong>hoje, 04/04/2025</strong>.
      </Text>

      <Section className="my-[24px] border-l-[4px] border-red-600 bg-red-50 p-[16px]">
        <Text className="m-0 text-[16px] text-gray-800">
          <strong>Detalhes do erro:</strong>
        </Text>
        <Text className="m-0 font-mono text-[14px] text-gray-700">
          {props.errorDetails}
        </Text>
      </Section>

      <Button
        className="box-border rounded-[4px] bg-blue-600 px-[20px] py-[12px] text-center font-medium text-white no-underline"
        href={`${process.env.VERCEL_DASHBOARD_URL}/logs`}
      >
        Verificar logs na Vercel
      </Button>
    </EmailLayout>
  )
}
