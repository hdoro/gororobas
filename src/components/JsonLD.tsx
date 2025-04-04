export default function JsonLD(props: {
  data: {
    '@context': 'https://schema.org'
    '@type': string
    [key: string]: unknown
  }
}) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint: there's no other way to work with JSON-LD in Next
      dangerouslySetInnerHTML={{ __html: JSON.stringify(props.data) }}
    />
  )
}
