import { m } from '@/paraglide/messages'
import { Button, Heading, Section, Text } from '@react-email/components'
import EmailLayout from './email-layout'

export default function MagicLinkEmail({
  magic_link_url,
}: {
  magic_link_url: string
}) {
  const features = [
    m.arable_major_seahorse_seek(),
    m.dry_soft_chipmunk_buy(),
    m.raw_same_cod_absorb(),
    m.still_inclusive_jellyfish_prosper(),
  ]
  return (
    <EmailLayout preview={m.helpful_tangy_impala_jest()}>
      <Heading className="mb-[16px] text-center text-[24px] font-bold text-green-800">
        {m.tasty_happy_midge_laugh()}
      </Heading>

      <Text className="mb-[24px] text-[16px] text-stone-700">
        {m.sea_giant_ray_race()}
      </Text>

      <Section className="relative mb-[32px] text-center">
        <Section className="rounded-[16px] border-[1px] border-green-200 bg-green-50 px-[16px] py-[32px]">
          <Button
            className="box-border rounded-[24px] border-[2px] border-green-600 bg-green-700 px-[32px] py-[14px] text-center font-bold text-white no-underline shadow-md"
            href={magic_link_url}
          >
            {m.great_tangy_bullock_love()}
          </Button>
        </Section>
      </Section>

      <Heading className="mb-[16px] text-[18px] font-bold text-green-700">
        {m.awful_aqua_tern_flip()}
      </Heading>

      <Section className="mb-[24px]">
        {/* Simple feature list without backgrounds */}
        {features.map((feature) => (
          <Text key={feature} className="mb-[16px] text-[16px] text-stone-700">
            {feature}
          </Text>
        ))}
      </Section>
    </EmailLayout>
  )
}
