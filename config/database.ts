import type { Core } from '@strapi/strapi';

const config = ({
                  env,
                }: Core.Config.Shared.ConfigParams): Core.Config.Database => {
  const databaseUrl = env('DATABASE_PUBLIC_URL') || env('DATABASE_URL');

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_PUBLIC_URL or DATABASE_URL is not set. Please set it to your Railway public Postgres connection string.'
    );
  }

  return {
    connection: {
      client: 'postgres',

      connection: {
        connectionString: databaseUrl,
        ssl: env.bool('DATABASE_SSL', true)
          ? {
              rejectUnauthorized: env.bool(
                'DATABASE_SSL_REJECT_UNAUTHORIZED',
                false
              ),
            }
          : false,
      },

      pool: {
        min: 0,
        max: env.int('DATABASE_POOL_MAX', 10),
      },

      acquireConnectionTimeout: env.int(
          'DATABASE_CONNECTION_TIMEOUT',
          60000
      ),
    },
  } as Core.Config.Database;
};

export default config;
