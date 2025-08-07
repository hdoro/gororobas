import type { ResolvedConnectConfig } from 'gel/dist/conUtils'
import { redirect } from 'next/navigation'
import { client } from '@/gel'

/** Adapted from: https://github.com/geldata/gel-js/blob/f02ffa38933191e95f207ec7852a0e4e5f7bbaf1/packages/auth-core/src/core.ts#L34-L41 */
async function getGelAuthServerUrl() {
  const connectConfig: ResolvedConnectConfig = (
    await (client as any).pool._getNormalizedConnectConfig()
  ).connectionParams

  const [host, port] = connectConfig.address
  const baseUrl = `${
    connectConfig.tlsSecurity === 'insecure' ? 'http' : 'https'
  }://${host}:${port}/db/${connectConfig.database}/ext/auth/`

  return baseUrl
}

/**
 * Temporary solution while @gel/auth-core is taking oAuth requests to inexistent /authorize route
 * @TODO remove once @gel/auth-core is back to working properly
 */
export const GET = async (request: Request) => {
  const requestURL = new URL(request.url)
  const dbServerURL = new URL(
    `${await getGelAuthServerUrl()}/${requestURL.pathname}?${requestURL.searchParams.toString()}`.replace(
      /\/{2,}/g,
      '/',
    ),
  )

  return redirect(dbServerURL.toString())
}
