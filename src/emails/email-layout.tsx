import { pathToAbsUrl } from '@/utils/urls'
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
} from '@react-email/components'
import type { PropsWithChildren } from 'react'

export default function EmailLayout(
  props: PropsWithChildren<{ preview: string }>,
) {
  return (
    <Html>
      <Head />
      <Preview>{props.preview}</Preview>
      <Tailwind>
        <Body className="bg-[rgb(254,_249,_246)] font-sans">
          <Container className="mx-auto px-[12px] py-[20px]">
            <Section>
              <Img
                src={pathToAbsUrl('/email-header.png', true)}
                alt="Gororobas Header"
                width="100%"
                height="auto"
                className="h-auto w-full rounded-t-[8px] object-cover"
              />
            </Section>

            <Section className="rounded-b-[8px] bg-white px-[24px] pt-[12px] pb-[24px] shadow-sm">
              {props.children}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
