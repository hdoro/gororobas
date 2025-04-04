import { APP_NAME } from '@/utils/config'
import { createClient } from 'gel'
import crypto from 'node:crypto'
import process from 'node:process'

const client = createClient()

if (!!process.env.EDGEDB_INSTANCE || !!process.env.EDGEDB_SECRET_KEY) {
  throw new Error(
    'EDGEDB_INSTANCE environment variable is set, which could mean connecting to a remote database - run this script *only* in the local database',
  )
}

const CONFIG = {
  tokenTTL: '336 hours',
  magicLinkTokenTTL: 'PT10M',
  signingKey: crypto.randomBytes(32).toString('hex'),
  emailVerification: false,
  providers: [
    {
      providerType: 'GoogleOAuthProvider',
      clientId: process.env.GOOGLE_CLIENT_ID,
      secret: process.env.GOOGLE_SECRET,
    },
  ],
  appName: APP_NAME,
  webhooks: {
    url: 'http://localhost:3000/auth/webhook',
    events: ['MagicLinkRequested'],
    signing_key: process.env.AUTH_WEBHOOK_SECRET,
  },
  redirect_urls: [
    'https://www.gororobas.com',
    'https://gororobas.com',
    'https://gororobas.com/auth/',
    'http://localhost:3000',
  ],
} as const

let query = `
CONFIGURE CURRENT BRANCH RESET
ext::auth::AuthConfig;

CONFIGURE CURRENT BRANCH RESET
ext::auth::UIConfig;

CONFIGURE CURRENT BRANCH RESET
ext::auth::MagicLinkProviderConfig;

CONFIGURE CURRENT BRANCH RESET
ext::auth::ProviderConfig;

CONFIGURE CURRENT BRANCH RESET
cfg::SMTPProviderConfig;

CONFIGURE CURRENT BRANCH RESET
ext::auth::WebhookConfig;

CONFIGURE CURRENT BRANCH SET
ext::auth::AuthConfig::auth_signing_key := '${CONFIG.signingKey}';

CONFIGURE CURRENT BRANCH SET
ext::auth::AuthConfig::token_time_to_live := <duration>'${CONFIG.tokenTTL}';

CONFIGURE CURRENT BRANCH INSERT
ext::auth::MagicLinkProviderConfig {
  token_time_to_live := <duration>'${CONFIG.magicLinkTokenTTL}',
};

CONFIGURE CURRENT BRANCH SET
ext::auth::AuthConfig::allowed_redirect_urls := {${CONFIG.redirect_urls.map((url) => `"${url}"`).join(',')}};

CONFIGURE CURRENT BRANCH INSERT
ext::auth::WebhookConfig {
  url := '${CONFIG.webhooks.url}',
  signing_secret_key := "${CONFIG.webhooks.signing_key}", 
  events := {
    ${CONFIG.webhooks.events.map((event) => `ext::auth::WebhookEvent.${event}`).join(',')}
  },
};
`

for (const { providerType, clientId, secret } of CONFIG.providers) {
  query += `

    CONFIGURE CURRENT BRANCH
    INSERT ext::auth::${providerType} {
      secret := '${secret}',
      client_id := '${clientId}'
    };
  `
}

await client
  .execute(query)
  .catch(console.error)
  .then(() => console.log('Auth setup complete'))
