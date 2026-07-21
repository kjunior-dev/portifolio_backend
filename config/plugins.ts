import type { Core } from '@strapi/strapi';

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedExecutableTypes = [
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
      },
    },
  },
  upload: {
    config: {
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes: deniedExecutableTypes,
      },
    },
  },
  email: {
    config: {
      provider: 'sendgrid',
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: env('SENDGRID_DEFAULT_FROM', 'webdevcv.cv@gmail.com'),
        defaultReplyTo: env('SENDGRID_DEFAULT_REPLY_TO', 'webdevcv.cv@gmail.com'),
        testAddress: env('SENDGRID_TEST_ADDRESS', 'webdevcv.cv@gmail.com'),
      },
    },
  },

  // SMTP/Gmail fallback. Keep this block commented for Railway because SMTP
  // connections can timeout there depending on the plan/network policy.
  // email: {
  //   config: {
  //     provider: 'nodemailer',
  //     providerOptions: {
  //       host: env('SMTP_HOST', 'smtp.gmail.com'),
  //       port: env.int('SMTP_PORT', 587),
  //       secure: env.bool('SMTP_SECURE', false),
  //       connectionTimeout: env.int('SMTP_CONNECTION_TIMEOUT_MS', 10000),
  //       greetingTimeout: env.int('SMTP_GREETING_TIMEOUT_MS', 10000),
  //       socketTimeout: env.int('SMTP_SOCKET_TIMEOUT_MS', 15000),
  //       auth: {
  //         user: env('SMTP_USERNAME', 'webdevcv.cv@gmail.com'),
  //         pass: env('SMTP_PASSWORD'),
  //       },
  //     },
  //     settings: {
  //       defaultFrom: env('SMTP_DEFAULT_FROM', 'webdevcv.cv@gmail.com'),
  //       defaultReplyTo: env('SMTP_DEFAULT_REPLY_TO', 'webdevcv.cv@gmail.com'),
  //       testAddress: env('SMTP_TEST_ADDRESS', 'webdevcv.cv@gmail.com'),
  //     },
  //   },
  // },
});

export default config;
