import { APP_NAME, BRAND_COLOR } from '@/utils/config'
import { pathToAbsUrl, paths } from '@/utils/urls'
import { createClient } from 'edgedb'
import crypto from 'node:crypto'
import process from 'node:process'

const client = createClient()

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
    }
  ],
  appName: APP_NAME,
  edgedbUi: {
    redirectTo: pathToAbsUrl(paths.authCallback()),
    redirectToOnSignup: pathToAbsUrl(paths.authCallback(true)),
    brandColor: BRAND_COLOR,
    logoUrl: pathToAbsUrl('/logo-full.svg'),
  },
  /** Email sending */
  SMTP: {
    sender: "ola@gororobas.com",
    username: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    security: process.env.SMTP_SECURITY,
    validate_certs: Boolean(process.env.SMTP_VALIDATE_CERTS),
  }
} as const


let query = `
CONFIGURE CURRENT BRANCH
RESET ext::auth::ProviderConfig;

CONFIGURE CURRENT BRANCH
RESET ext::auth::AuthConfig;

CONFIGURE CURRENT BRANCH
RESET ext::auth::UIConfig;

CONFIGURE CURRENT BRANCH
RESET ext::auth::SMTPConfig;

CONFIGURE CURRENT BRANCH SET
ext::auth::AuthConfig::auth_signing_key := '${CONFIG.signingKey}';

CONFIGURE CURRENT BRANCH SET
ext::auth::AuthConfig::token_time_to_live := <duration>'${CONFIG.tokenTTL}';

CONFIGURE CURRENT BRANCH
INSERT ext::auth::MagicLinkProviderConfig {
  token_time_to_live := <duration>'${CONFIG.magicLinkTokenTTL}',
};

CONFIGURE CURRENT BRANCH
INSERT ext::auth::UIConfig {
  redirect_to := '${CONFIG.edgedbUi.redirectTo}',
  redirect_to_on_signup := '${CONFIG.edgedbUi.redirectToOnSignup}',
  app_name := '${CONFIG.appName}',
  brand_color := '${CONFIG.edgedbUi.brandColor}',
  logo_url := '${CONFIG.edgedbUi.logoUrl}',
};

CONFIGURE CURRENT BRANCH SET
ext::auth::SMTPConfig::sender := '${CONFIG.SMTP.sender}';

CONFIGURE CURRENT BRANCH SET
ext::auth::SMTPConfig::host := '${CONFIG.SMTP.host}';

CONFIGURE CURRENT BRANCH SET
ext::auth::SMTPConfig::port := <int32>${CONFIG.SMTP.port};

CONFIGURE CURRENT BRANCH SET
ext::auth::SMTPConfig::security := '${CONFIG.SMTP.security}';

CONFIGURE CURRENT BRANCH SET
ext::auth::SMTPConfig::validate_certs := ${CONFIG.SMTP.validate_certs};
`

if (CONFIG.SMTP.username && CONFIG.SMTP.password) {
  query += `

CONFIGURE CURRENT BRANCH SET
ext::auth::SMTPConfig::username := '${CONFIG.SMTP.username}';

CONFIGURE CURRENT BRANCH SET
ext::auth::SMTPConfig::password := '${CONFIG.SMTP.password}';
`
}


for (const { providerType, clientId, secret} of CONFIG.providers) {
  query += `

    CONFIGURE CURRENT BRANCH
    INSERT ext::auth::${providerType} {
      secret := '${secret}',
      client_id := '${clientId}'
    };
  `
}

await client.execute(query).catch(console.error).then(() => console.log('Auth setup complete'))