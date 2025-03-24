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
  /** Email sending */
  SMTP: {
    sender: 'ola@gororobas.com',
    username: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    security: process.env.SMTP_SECURITY,
    validate_certs: Boolean(process.env.SMTP_VALIDATE_CERTS),
  },
} as const

let query = `
CONFIGURE CURRENT BRANCH
RESET ext::auth::AuthConfig;

CONFIGURE CURRENT BRANCH
RESET ext::auth::UIConfig;

CONFIGURE CURRENT BRANCH
RESET ext::auth::MagicLinkProviderConfig;

CONFIGURE CURRENT BRANCH
RESET ext::auth::ProviderConfig;

CONFIGURE CURRENT BRANCH
RESET cfg::SMTPProviderConfig;

CONFIGURE CURRENT BRANCH SET
ext::auth::AuthConfig::auth_signing_key := '${CONFIG.signingKey}';

CONFIGURE CURRENT BRANCH SET
ext::auth::AuthConfig::token_time_to_live := <duration>'${CONFIG.tokenTTL}';

CONFIGURE CURRENT BRANCH
INSERT ext::auth::MagicLinkProviderConfig {
  token_time_to_live := <duration>'${CONFIG.magicLinkTokenTTL}',
};

CONFIGURE CURRENT BRANCH SET
cfg::SMTPProviderConfig::sender := '${CONFIG.SMTP.sender}';

CONFIGURE CURRENT BRANCH SET
cfg::SMTPProviderConfig::host := '${CONFIG.SMTP.host}';

CONFIGURE CURRENT BRANCH SET
cfg::SMTPProviderConfig::port := <int32>${CONFIG.SMTP.port};

CONFIGURE CURRENT BRANCH SET
cfg::SMTPProviderConfig::security := '${CONFIG.SMTP.security}';

CONFIGURE CURRENT BRANCH SET
cfg::SMTPProviderConfig::validate_certs := ${CONFIG.SMTP.validate_certs};
`

if (CONFIG.SMTP.username && CONFIG.SMTP.password) {
  query += `

CONFIGURE CURRENT BRANCH SET
cfg::SMTPProviderConfig::username := '${CONFIG.SMTP.username}';

CONFIGURE CURRENT BRANCH SET
cfg::SMTPProviderConfig::password := '${CONFIG.SMTP.password}';
`
} else {
  query += `
CONFIGURE CURRENT BRANCH SET
cfg::SMTPProviderConfig::username := '';

CONFIGURE CURRENT BRANCH SET
cfg::SMTPProviderConfig::password := '';
  `
}

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
